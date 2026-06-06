"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, ShoppingCart, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { CartItemRow } from "@/components/cart/cart-item-row";
import { CheckoutActions } from "@/components/cart/checkout-actions";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { CheckoutMessagePreview } from "@/components/cart/checkout-message-preview";
import { Button } from "@/components/ui/button";
import {
  clearCheckoutFormStorage,
  readCheckoutFormStorage,
  writeCheckoutFormStorage,
} from "@/lib/cart-storage";
import {
  buildTelegramProfileUrl,
  copyCheckoutMessage,
  formatCheckoutMessage,
  getCheckoutTotal,
  validateCheckout,
} from "@/lib/checkout";
import { TELEGRAM_CHECKOUT_USERNAME } from "@/lib/constants";
import { formatCurrency } from "@/lib/currency";
import { useCartStore } from "@/store/cart-store";

function CartPanelBody({
  phone,
  fulfillmentType,
  deliveryLocation,
  pickupNote,
  onPhoneChange,
  onFulfillmentTypeChange,
  onDeliveryLocationChange,
  onPickupNoteChange,
  onClose,
}: {
  phone: string;
  fulfillmentType: "delivery" | "pickup" | "";
  deliveryLocation: string;
  pickupNote: string;
  onPhoneChange: (value: string) => void;
  onFulfillmentTypeChange: (value: "delivery" | "pickup") => void;
  onDeliveryLocationChange: (value: string) => void;
  onPickupNoteChange: (value: string) => void;
  onClose?: () => void;
}) {
  const items = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const total = useMemo(() => getCheckoutTotal(items), [items]);
  const message = useMemo(
    () =>
      formatCheckoutMessage(items, {
        phone,
        fulfillmentType,
        deliveryLocation,
        pickupNote,
      }),
    [deliveryLocation, fulfillmentType, items, phone, pickupNote],
  );
  const validation = useMemo(
    () =>
      validateCheckout(items, {
        phone,
        fulfillmentType,
        deliveryLocation,
        pickupNote,
      }),
    [deliveryLocation, fulfillmentType, items, phone, pickupNote],
  );

  async function handleCopyMessage() {
    await copyCheckoutMessage(message);
  }

  async function handleOpenTelegram() {
    window.open(
      buildTelegramProfileUrl(TELEGRAM_CHECKOUT_USERNAME, message),
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.6rem] border border-app-border bg-app-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-app-accent">
              Cart total
            </div>
            <div className="mt-1 text-2xl font-bold text-app-text">{formatCurrency(total)}</div>
          </div>
          <Button type="button" variant="destructive" size="sm" onClick={() => { clearCart(); clearCheckoutFormStorage(); }}>
            <Trash2 className="size-4" />
            Clear
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <CartItemRow
            key={item.lineId}
            item={item}
            onIncrease={() => updateQty(item.lineId, item.qty + 1)}
            onDecrease={() => updateQty(item.lineId, item.qty - 1)}
            onRemove={() => removeItem(item.lineId)}
          />
        ))}
      </div>

      <CheckoutForm
        phone={phone}
        fulfillmentType={fulfillmentType}
        deliveryLocation={deliveryLocation}
        pickupNote={pickupNote}
        onPhoneChange={onPhoneChange}
        onFulfillmentTypeChange={onFulfillmentTypeChange}
        onDeliveryLocationChange={onDeliveryLocationChange}
        onPickupNoteChange={onPickupNoteChange}
        errors={validation.errors}
      />

      <CheckoutMessagePreview message={message} />

      <CheckoutActions
        onCopyMessage={handleCopyMessage}
        onOpenTelegram={handleOpenTelegram}
        disabled={!validation.isValid}
      />

      {!validation.isValid ? (
        <p className="text-xs text-app-text-muted">
          Complete phone and fulfillment info before copying the checkout message.
        </p>
      ) : null}

      {onClose ? (
        <Button type="button" variant="ghost" className="w-full" onClick={onClose}>
          Close
        </Button>
      ) : null}
    </div>
  );
}

export function InvoicePanel() {
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const openCart = useCartStore((state) => state.openCart);
  const closeCart = useCartStore((state) => state.closeCart);
  const [storedForm] = useState(() => readCheckoutFormStorage());
  const [phone, setPhone] = useState(storedForm.phone);
  const [fulfillmentType, setFulfillmentType] = useState<"delivery" | "pickup" | "">(
    storedForm.fulfillmentType,
  );
  const [deliveryLocation, setDeliveryLocation] = useState(storedForm.deliveryLocation);
  const [pickupNote, setPickupNote] = useState(storedForm.pickupNote);

  const count = items.reduce((total, item) => total + item.qty, 0);
  const total = getCheckoutTotal(items);

  function handlePhoneChange(value: string) {
    setPhone(value);
    writeCheckoutFormStorage({
      phone: value,
      fulfillmentType,
      deliveryLocation,
      pickupNote,
    });
  }

  function handleFulfillmentTypeChange(value: "delivery" | "pickup") {
    setFulfillmentType(value);
    const nextPickupNote = value === "pickup" ? pickupNote || "Pickup at shop" : pickupNote;
    const nextDeliveryLocation = value === "delivery" ? deliveryLocation : "";
    setPickupNote(nextPickupNote);
    setDeliveryLocation(nextDeliveryLocation);
    writeCheckoutFormStorage({
      phone,
      fulfillmentType: value,
      deliveryLocation: nextDeliveryLocation,
      pickupNote: nextPickupNote,
    });
  }

  function handleDeliveryLocationChange(value: string) {
    setDeliveryLocation(value);
    writeCheckoutFormStorage({
      phone,
      fulfillmentType,
      deliveryLocation: value,
      pickupNote,
    });
  }

  function handlePickupNoteChange(value: string) {
    setPickupNote(value);
    writeCheckoutFormStorage({
      phone,
      fulfillmentType,
      deliveryLocation,
      pickupNote: value,
    });
  }

  if (!hasHydrated) {
    return null;
  }

  return (
    <>
      <div className="hidden lg:block">
        <div className="rounded-[1.8rem] border border-app-border bg-app-surface p-4 shadow-[var(--app-shadow-panel)]">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-app-primary-soft text-app-primary">
              <ShoppingCart className="size-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-app-text">Checkout</div>
              <div className="text-xs text-app-text-muted">
                {count} items · {formatCurrency(total)}
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="rounded-[1.4rem] border border-dashed border-app-border bg-app-surface-2 p-6 text-sm text-app-text-muted">
              Add products to build a Telegram checkout message.
            </div>
          ) : (
            <CartPanelBody
              phone={phone}
              fulfillmentType={fulfillmentType}
              deliveryLocation={deliveryLocation}
              pickupNote={pickupNote}
              onPhoneChange={handlePhoneChange}
              onFulfillmentTypeChange={handleFulfillmentTypeChange}
              onDeliveryLocationChange={handleDeliveryLocationChange}
              onPickupNoteChange={handlePickupNoteChange}
            />
          )}
        </div>
      </div>

      <div className="lg:hidden">
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-app-border bg-app-bg-soft/96 p-3 backdrop-blur">
          <button
            type="button"
            onClick={openCart}
            className="flex w-full items-center justify-between rounded-[1.4rem] border border-app-border bg-app-surface px-4 py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-app-primary-soft text-app-primary">
                <ShoppingCart className="size-4.5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-app-text">Cart & Checkout</div>
                <div className="text-xs text-app-text-muted">
                  {count} items · {formatCurrency(total)}
                </div>
              </div>
            </div>
            <div className="flex size-10 items-center justify-center rounded-full bg-app-surface-2 text-app-text">
              <MessageCircle className="size-4" />
            </div>
          </button>
        </div>

        <AnimatePresence>
          {isCartOpen ? (
            <>
              <motion.div
                className="fixed inset-0 z-50 bg-app-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeCart}
              />
              <motion.div
                className="fixed inset-x-0 bottom-0 z-[60] max-h-[88vh] overflow-auto rounded-t-[2rem] border-t border-app-border bg-app-surface p-4 pb-8"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 280, damping: 30 }}
              >
                <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-app-surface-3" />
                {items.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-dashed border-app-border bg-app-surface-2 p-6 text-sm text-app-text-muted">
                    Add products to build a Telegram checkout message.
                  </div>
                ) : (
                  <CartPanelBody
                    phone={phone}
                    fulfillmentType={fulfillmentType}
                    deliveryLocation={deliveryLocation}
                    pickupNote={pickupNote}
                    onPhoneChange={handlePhoneChange}
                    onFulfillmentTypeChange={handleFulfillmentTypeChange}
                    onDeliveryLocationChange={handleDeliveryLocationChange}
                    onPickupNoteChange={handlePickupNoteChange}
                    onClose={closeCart}
                  />
                )}
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      </div>
    </>
  );
}
