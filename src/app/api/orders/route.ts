import { NextRequest, NextResponse } from "next/server";
import { isOrderingEnabled } from "@/lib/feature-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isUniqueViolation(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  if ("code" in error && error.code === "23505") {
    return true;
  }

  return (
    "cause" in error &&
    !!error.cause &&
    typeof error.cause === "object" &&
    "code" in error.cause &&
    error.cause.code === "23505"
  );
}

export async function POST(request: NextRequest) {
  if (!isOrderingEnabled()) {
    return NextResponse.json(
      { ok: false, message: "Ordering is currently disabled." },
      { status: 404 },
    );
  }

  const { getTelegramAdminRuntimeConfig } = await import(
    "../../../../packages/config/src"
  );
  const { notifyAdminOrderCreated } = await import(
    "../../../../packages/telegram-core/src"
  );
  const {
    createOrderInputSchema,
    createOrderWithItems,
    getOrderByInvoiceId,
  } = await import("@/db/queries/orders");
  const { generateOrderCode } = await import("@/db/generate-order-code");
  const { generateOrderId } = await import("@/db/generate-order-id");
  const { createTelegramOrderPayload } = await import(
    "@/lib/ordering/create-order-payload"
  );
  const { validateOrderProductSnapshot } = await import(
    "@/lib/ordering/validate-order-product-snapshot"
  );
  const {
    buildTelegramOrderHandoff,
    getTelegramBotUsername,
    getTelegramOrderTarget,
    validateTelegramConfig,
  } = await import("@/lib/telegram-order");
  const { buildOrderBotUrlForTarget, buildOrderModificationBotUrl } = await import(
    "@/lib/telegram-order/build-order-deeplink"
  );

  const body = await request.json().catch(() => null);
  const parsed = createOrderInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid order payload",
        issues: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  const existingOrder = await getOrderByInvoiceId(parsed.data.invoice.invoiceId);
  if (existingOrder?.telegramUrl && existingOrder.telegramMessage) {
    const botUsername = getTelegramBotUsername();
    const modificationDeeplink = botUsername && existingOrder.shortOrderId
      ? buildOrderModificationBotUrl(botUsername, existingOrder.shortOrderId)
      : null;
    const salesDeeplink = existingOrder.shortOrderId
      ? buildOrderBotUrlForTarget(getTelegramOrderTarget(existingOrder.telegramUrl), existingOrder.shortOrderId)
      : null;

    return NextResponse.json({
      ok: true,
      orderId: existingOrder.id,
      shortOrderId: existingOrder.shortOrderId,
      orderCode: existingOrder.orderCode,
      invoiceId: existingOrder.invoiceId,
      telegramUrl: existingOrder.telegramUrl,
      telegramMessage: existingOrder.telegramMessage,
      ...(modificationDeeplink ? { modificationDeeplink } : {}),
      ...(salesDeeplink ? { salesDeeplink } : {}),
      status: existingOrder.status,
      source: existingOrder.source,
      alreadyExists: true,
    });
  }

  const productSnapshot = await validateOrderProductSnapshot(parsed.data);
  if (!productSnapshot.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: productSnapshot.message,
        issues: productSnapshot.issues,
      },
      { status: 409 },
    );
  }

  const validatedInput = productSnapshot.input;

  try {
    // Generate order ID early so it can be included in Telegram message
    const shortOrderId = await generateOrderId();
    const orderCode = await generateOrderCode();

    const telegramPayload = createTelegramOrderPayload(validatedInput);
    telegramPayload.shortOrderId = shortOrderId;
    telegramPayload.orderCode = orderCode;

    const telegramConfig = validateTelegramConfig({
      target: getTelegramOrderTarget(validatedInput.invoice.telegramUrl),
      fallbackTarget: validatedInput.invoice.telegramUrl,
      botUsername: getTelegramBotUsername(),
    });
    const telegramResult = buildTelegramOrderHandoff({
      config: telegramConfig,
      order: telegramPayload,
      source: validatedInput.source,
    });

    const order = await createOrderWithItems({
      ...validatedInput,
      shortOrderId,
      orderCode,
      telegramMessage: telegramResult.message,
      telegramUrl: telegramResult.url,
    });

    const botUsername = getTelegramBotUsername();
    const modificationDeeplink = botUsername
      ? buildOrderModificationBotUrl(botUsername, shortOrderId)
      : null;
    const salesDeeplink = buildOrderBotUrlForTarget(telegramConfig.target, shortOrderId);

    const adminConfig = getTelegramAdminRuntimeConfig();
    if (adminConfig.enabled && adminConfig.adminChatId && adminConfig.botToken) {
      void notifyAdminOrderCreated({
        botToken: adminConfig.botToken,
        chatId: adminConfig.adminChatId,
        order: {
          orderId: order.orderId,
          invoiceId: order.invoiceId,
          shop: validatedInput.invoice.shop,
          source: order.source,
          currency: validatedInput.invoice.currency,
          status: order.status,
          createdAt: validatedInput.invoice.createdAtIso,
          customerName: validatedInput.customerName ?? null,
          customerPhone: validatedInput.customerPhone ?? null,
          note: validatedInput.note ?? null,
          items: validatedInput.invoice.items.map((item) => ({
            title: item.title,
            qty: item.qty,
            price: item.price,
            lineTotal: item.lineTotal,
          })),
          subtotal: validatedInput.invoice.subtotal,
          total: validatedInput.invoice.total,
        },
      }).catch((error) => {
        console.error("Failed to notify admin Telegram chat", error);
      });
    }

    return NextResponse.json({
      ok: true,
      orderId: order.orderId,
      shortOrderId: order.shortOrderId,
      orderCode: order.orderCode,
      invoiceId: order.invoiceId,
      telegramUrl: order.telegramUrl,
      telegramMessage: order.telegramMessage,
      ...(modificationDeeplink ? { modificationDeeplink } : {}),
      ...(salesDeeplink ? { salesDeeplink } : {}),
      status: order.status,
      source: order.source,
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      const duplicateOrder = await getOrderByInvoiceId(parsed.data.invoice.invoiceId);

      if (duplicateOrder?.telegramUrl && duplicateOrder.telegramMessage) {
        const botUsername = getTelegramBotUsername();
        const modificationDeeplink = botUsername && duplicateOrder.shortOrderId
          ? buildOrderModificationBotUrl(botUsername, duplicateOrder.shortOrderId)
          : null;
        const salesDeeplink = duplicateOrder.shortOrderId
          ? buildOrderBotUrlForTarget(
              getTelegramOrderTarget(duplicateOrder.telegramUrl),
              duplicateOrder.shortOrderId,
            )
          : null;

        return NextResponse.json({
          ok: true,
          orderId: duplicateOrder.id,
          shortOrderId: duplicateOrder.shortOrderId,
          orderCode: duplicateOrder.orderCode,
          invoiceId: duplicateOrder.invoiceId,
          telegramUrl: duplicateOrder.telegramUrl,
          telegramMessage: duplicateOrder.telegramMessage,
          ...(modificationDeeplink ? { modificationDeeplink } : {}),
          ...(salesDeeplink ? { salesDeeplink } : {}),
          status: duplicateOrder.status,
          source: duplicateOrder.source,
          alreadyExists: true,
        });
      }
    }

    console.error("POST /api/orders failed", error);

    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 },
    );
  }
}
