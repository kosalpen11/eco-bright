import type { Locale } from "@/lib/locale";
import type {
  Product,
  ProductBadge,
  ProductCategory,
  ProductGroupMode,
  ProductSortMode,
} from "@/types/product";
import { PRODUCT_CATEGORIES } from "@/types/product";
import type { CartItem } from "@/types/cart";
import type { InvoiceItem } from "@/types/invoice";

export function localizeText(
  locale: Locale,
  english: string,
  khmer?: string | null,
) {
  return locale === "km" && khmer?.trim() ? khmer : english;
}

export function getProductTitle(product: Pick<Product, "title" | "titleKm">, locale: Locale) {
  return localizeText(locale, product.title, product.titleKm);
}

export function getProductCategoryLabel(
  product: Pick<Product, "categoryLabel" | "categoryLabelKm">,
  locale: Locale,
) {
  return localizeText(locale, product.categoryLabel, product.categoryLabelKm);
}

export function getProductUseCase(
  product: Pick<Product, "useCase" | "useCaseKm">,
  locale: Locale,
) {
  return localizeText(locale, product.useCase ?? "", product.useCaseKm) || undefined;
}

export function getProductDescription(
  product: Pick<Product, "description" | "descriptionKm">,
  locale: Locale,
) {
  return localizeText(locale, product.description, product.descriptionKm);
}

export function getCartItemTitle(
  item: Pick<CartItem, "title" | "titleKm">,
  locale: Locale,
) {
  return localizeText(locale, item.title, item.titleKm);
}

export function getCartItemCategoryLabel(
  item: Pick<CartItem, "categoryLabel" | "categoryLabelKm">,
  locale: Locale,
) {
  return localizeText(locale, item.categoryLabel, item.categoryLabelKm);
}

export function getInvoiceItemTitle(
  item: Pick<InvoiceItem, "title" | "titleKm">,
  locale: Locale,
) {
  return localizeText(locale, item.title, item.titleKm);
}

const badgeLabels = {
  en: {
    new: "New",
    hot: "Hot",
    sale: "Sale",
  },
  km: {
    new: "ថ្មី",
    hot: "ពេញនិយម",
    sale: "បញ្ចុះតម្លៃ",
  },
} as const;

export function getBadgeLabel(badge: ProductBadge, locale: Locale) {
  return badgeLabels[locale][badge];
}

const categoryLabels = PRODUCT_CATEGORIES.reduce(
  (accumulator, category) => {
    accumulator.en[category.value] = category.label;
    accumulator.km[category.value] = category.labelKm;
    return accumulator;
  },
  {
    en: {} as Record<ProductCategory, string>,
    km: {} as Record<ProductCategory, string>,
  },
);

export function getCategoryLabel(category: ProductCategory, locale: Locale) {
  return categoryLabels[locale][category];
}

const groupModeLabels = {
  en: {
    category: "Category",
    price: "Price Range",
    "use-case": "Use Case",
  },
  km: {
    category: "ប្រភេទ",
    price: "កម្រិតតម្លៃ",
    "use-case": "ការប្រើប្រាស់",
  },
} as const satisfies Record<Locale, Record<ProductGroupMode, string>>;

export function getGroupModeLabel(mode: ProductGroupMode, locale: Locale) {
  return groupModeLabels[locale][mode];
}

const sortModeLabels = {
  en: {
    featured: "Featured",
    newest: "Newest",
    rating: "Top Rated",
    "price-asc": "Price: Low to High",
    "price-desc": "Price: High to Low",
  },
  km: {
    featured: "ណែនាំ",
    newest: "ថ្មីបំផុត",
    rating: "ពេញនិយមខ្ពស់",
    "price-asc": "តម្លៃ: ទាបទៅខ្ពស់",
    "price-desc": "តម្លៃ: ខ្ពស់ទៅទាប",
  },
} as const satisfies Record<Locale, Record<ProductSortMode, string>>;

export function getSortModeLabel(mode: ProductSortMode, locale: Locale) {
  return sortModeLabels[locale][mode];
}

export function formatItemCount(count: number, locale: Locale) {
  if (locale === "km") {
    return `${count} មុខទំនិញ`;
  }

  return `${count} item${count === 1 ? "" : "s"}`;
}

export const uiText = {
  en: {
    shopTagline: "LED & solar that lasts",
    navbar: {
      catalog: "Catalog",
      invoice: "Invoice",
      telegram: "Telegram",
      orderNow: "Order Now",
    },
    hero: {
      badge: "Smart Lighting • Solar Solutions",
      headingPrefix: "Power Your Space With",
      headingAccent: "Smarter",
      headingSuffix: "Light",
      description:
        "Premium LED lighting and solar products for homes, shops, sites, and outdoor installs. Search fast, build a live invoice, then hand off the order through Telegram in seconds.",
      browseProducts: "Browse Products",
      chatTelegram: "Chat on Telegram",
      highlights: [
        { accent: "Smart search", text: "by product, spec, or tag" },
        { accent: "Grouped view", text: "by category, price, or use case" },
        { accent: "Live invoice", text: "with QR, copy, and share" },
      ],
      cards: [
        { title: "LED", text: "Indoor and outdoor lighting", icon: "💡" },
        { title: "SOLAR", text: "Reliable energy solutions", icon: "☀️" },
        { title: "FAST", text: "Quick order via Telegram", icon: "📲" },
      ],
      footnote:
        "Mobile-first catalog with invoice handoff and graceful share fallbacks.",
      marquee: [
        "Quality LED Bulbs",
        "LED Tubes",
        "Solar Flood Lights",
        "Street Lights",
        "Solar Panels",
        "Batteries",
        "Accessories",
      ],
    },
    storefront: {
      eyebrow: "Storefront",
      title: "All",
      accent: "Products",
      description:
        "Browse the live Neon catalog, then add products into a live invoice that can be copied, shared, or handed to Telegram.",
      toolbarTitle: "Browse Controls",
      toolbarDescription:
        "Refine results by category, grouping, and sort order without losing the current search context.",
      catalogSetupRequired: "Catalog setup required",
      catalogSetupBody:
        "Add `DATABASE_URL` in `.env.local`, run `npm run db:push`, then seed the catalog with `npm run seed:products`.",
      catalogFallbackTitle: "Using Fallback Catalog",
      catalogFallbackBody:
        "The storefront is showing the built-in local catalog until Neon is reachable again.",
      searchCatalog: "Search catalog",
      searchPlaceholder: "Search bulb, panel, battery, flood light...",
      pressSlashToFocus: "Press / to focus",
      updating: "Updating",
      foundSuffix: "found",
      groupBy: "Group by",
      sortBy: "Sort by",
      allProducts: "All Products",
      showOptions: "Show options",
      hideOptions: "Hide options",
      clearSearch: "Clear search",
      resetCatalogView: "Reset catalog view",
      noProductsFound: "No products found",
      noProductsDescription:
        "Try another keyword, switch the category filter, or reset the catalog view.",
      stateMetaQuery: (query: string, groupLabel: string) =>
        `Searching "${query}" • grouped by ${groupLabel.toLowerCase()}`,
      stateMetaDefault: (groupLabel: string, sortLabel: string) =>
        `Grouped by ${groupLabel.toLowerCase()} • sorted by ${sortLabel.toLowerCase()}`,
      catalogErrorFallback: "Failed to load products from Neon.",
    },
    product: {
      inStock: "In Stock",
      outOfStock: "Out of Stock",
      readyToQuote: "Ready to quote",
      quickAdd: "Quick add",
      addToCart: "Add to Cart",
      reviewInInvoice: "Review in invoice to place the order",
      stockUnavailable: "Unavailable right now",
      each: "each",
    },
    groups: {
      budgetTitle: "Budget Picks",
      budgetDescription:
        "Fast-moving basics for home, retail shelves, and quick restocks.",
      midRangeTitle: "Mid Range",
      midRangeDescription:
        "Balanced value for outdoor lighting, accessories, and compact systems.",
      projectGradeTitle: "Project Grade",
      projectGradeDescription:
        "High-output hardware for larger installs, backup systems, and power generation.",
      generalUse: "General Use",
      useCaseDescription:
        "Products grouped by real installation context and customer need.",
      categoryDescription:
        "Curated products organized by category for quicker browsing.",
    },
    cart: {
      cart: "Cart",
      itemsInCart: (count: number) => `${count} items in cart`,
      decreaseQuantity: (title: string) => `Decrease quantity for ${title}`,
      increaseQuantity: (title: string) => `Increase quantity for ${title}`,
      removeFromCart: (title: string) => `Remove ${title} from cart`,
      qtyShort: "Qty",
    },
    invoice: {
      invoice: "Invoice",
      checkoutReady: "Checkout",
      checkoutDescription:
        "Adjust items below, then review the invoice before creating the order.",
      confirmCheckout: "Confirm checkout",
      reviewPendingOrder: "Review pending order",
      creatingOrder: "Creating pending order...",
      backToAdjustItems: "Back to adjust items",
      orderSummary: "Order Summary",
      reviewDescription: "Review items, create the order in Neon, and continue to Telegram.",
      items: "Items",
      orderId: "Order ID",
      status: "Status",
      invoiceId: "Invoice ID",
      draft: "Draft",
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      needs_clarification: "Needs clarification",
      processing: "Processing",
      completed: "Completed",
      cancelled: "Cancelled",
      pendingOrderSaved: "Pending order created. Review the invoice, then continue to Telegram checkout.",
      existingPendingOrder:
        "This invoice already exists as a pending order. Review the invoice and continue.",
      orderCreateFailed: "Failed to create pending order. Try again.",
      created: "Created",
      addItemsToGenerate: "Add items to generate",
      emptyTitle: "Your invoice is empty",
      emptyDescription: "Add products to see totals, QR, and share actions.",
      subtotal: "Subtotal",
      total: "Total",
      qrHint: "QR export becomes available once the invoice has at least one item.",
      clearInvoice: "Clear invoice",
      imageInvoice: "Image invoice",
      imageInvoiceDescription: "Clean invoice preview used for PNG export.",
      textInvoice: "Text invoice",
      textInvoiceDescription: "Readable order text for copy, share, or manual sending.",
      adjustItems: "Adjust items",
      adjustItemsDescription: "Update quantities before checkout.",
      removeItem: "Remove",
      unitPrice: "Unit price",
      lineTotal: "Line total",
      checkoutTarget: "Checkout",
      checkoutStep1: "Cart",
      checkoutStep2: "Details",
      checkoutStep3: "Confirm",
      qrInvoice: "QR invoice",
      scanOrShare: "Scan or share order",
      includedInQr: "Included in QR",
      qrDescription:
        "Product ids, titles, prices, quantities, totals, and Telegram checkout link.",
      mobileLoading: "Loading invoice...",
      open: "Open",
      openTelegram: "Open Telegram checkout",
      copy: "Copy",
      share: "Share",
      image: "Image",
      telegram: "Telegram Checkout",
      checkoutHint: (target: string) =>
        `Telegram checkout opens chat with ${target}. Copy sends the order text, while Image exports a separate PNG invoice download.`,
      invoiceCopied: "Invoice copied",
      copyFailed: "Copy failed",
      sharedNotSupported: "Shared not supported, copied instead",
      invoiceShared: "Invoice shared",
      shareFailed: "Share failed",
      invoiceImageTargetMissing: "Invoice image target missing",
      invoiceImageExported: () => "Invoice image exported.",
      imageExportFailed: "Image export failed",
      telegramOpened: (target: string) =>
        `Telegram checkout opened for ${target} and the order text was copied.`,
      telegramOpenedWithoutCopy: (target: string) =>
        `Telegram checkout opened for ${target}. Copy the order text manually if needed.`,
      telegramOpenFailed: "Failed to open Telegram checkout",
    },
    ordering: {
      reviewOrder: "Review order",
      orderNow: "Order",
      creatingOrder: "Creating order...",
      orderReadyTitle: "Order created",
      orderReadyDescription:
        "Your order is saved in Neon. Continue in Telegram from the same order context, or use the short order ID later if you need to recover it.",
      continueInTelegram: "Continue in Telegram",
      copyOrder: "Copy Order",
      orderCopied: "Order copied",
      orderCopyFailed: "Failed to copy order",
      shareInvoice: "Share invoice",
      shareInvoiceSuccess: "Invoice shared",
      shareInvoiceFallback: "Share not supported, invoice copied instead",
      shareInvoiceFailed: "Failed to share invoice",
      orderFailed: "Failed to create order. Try again.",
      handoffHint:
        "Telegram continues from this saved order so the customer can confirm, contact sales, or cancel without restarting checkout. The short order ID is the easiest recovery code to paste back into the bot.",
      pasteLinkTitle: "Order from pasted link",
      pasteLinkDescription:
        "Paste a product link from this storefront to resolve the item and continue ordering.",
      pasteLinkPlaceholder: "Paste product URL",
      resolveLink: "Resolve link",
      resolvingLink: "Resolving link...",
      invalidLink: "Enter a valid product URL.",
      productNotFound: "No matching product was found for that link.",
      addedFromLink: (title: string) => `${title} was added to the cart from the pasted link.`,
      phoneRequired: "Phone number is required",
      phoneInvalid: "Please enter a valid phone number",
      fulfillmentRequired: "Please select pickup or delivery",
      checkoutConfirmTelegram: "Confirm & Open Telegram",
      sendOrderTelegram: "Send Order to Telegram",
      pendingStatusTitle: "Your order is waiting for sales confirmation",
      pendingStatusDescription: "Your order has been saved successfully. Please continue with our sales team to confirm stock, delivery, or pickup details.",
      contactSales: "Contact Sales",
      chatWithSales: "Chat with Sales",
      successStatusTitle: "Order created successfully",
      successStatusDescription: "Your order is saved in our system. Continue in Telegram for confirmation and support.",
      orderSavedTelegramNext: "Order already saved. Telegram is your next step.",
      contactSalesHelpText: "Our sales team can help with stock, delivery, or order edits.",
      copySuccess: "Order text copied",
      copyFailed: "Failed to copy",
      orderId: "Order ID",
    },
    footer: {
      description:
        "Smart lighting. Solar solutions. Local-first invoicing. Telegram-ready ordering.",
      products: "Products",
      invoice: "Invoice",
      telegram: "Telegram",
    },
    theme: {
      dark: "Dark",
      light: "Light",
      switchTo: (mode: "light" | "dark") => `Switch to ${mode} mode`,
    },
  },
  km: {
    shopTagline: "ភ្លើង LED និងសូឡាដែលប្រើបានយូរ",
    navbar: {
      catalog: "ទំនិញ",
      invoice: "វិក្កយបត្រ",
      telegram: "តេលេក្រាម",
      orderNow: "បញ្ជាទិញឥឡូវ",
    },
    hero: {
      badge: "ភ្លើងឆ្លាតវៃ • ដំណោះស្រាយសូឡា",
      headingPrefix: "ផ្តល់ថាមពលឱ្យកន្លែងរបស់អ្នកជាមួយ",
      headingAccent: "ពន្លឺឆ្លាតវៃ",
      headingSuffix: "",
      description:
        "ផលិតផលភ្លើង LED និងសូឡាគុណភាពសម្រាប់ផ្ទះ ហាង ការដ្ឋាន និងការដំឡើងក្រៅអាគារ។ ស្វែងរកបានលឿន បង្កើតវិក្កយបត្រផ្ទាល់ និងផ្ញើការបញ្ជាទិញតាម Telegram ក្នុងរយៈពេលខ្លី។",
      browseProducts: "មើលទំនិញ",
      chatTelegram: "ជជែកតាម Telegram",
      highlights: [
        { accent: "ស្វែងរកឆ្លាតវៃ", text: "តាមឈ្មោះ លក្ខណៈបច្ចេកទេស ឬ tag" },
        { accent: "មើលជាក្រុម", text: "តាមប្រភេទ តម្លៃ ឬការប្រើប្រាស់" },
        { accent: "វិក្កយបត្រផ្ទាល់", text: "មាន QR ការចម្លង និងការចែករំលែក" },
      ],
      cards: [
        { title: "LED", text: "ភ្លើងសម្រាប់ក្នុង និងក្រៅអាគារ", icon: "💡" },
        { title: "សូឡា", text: "ដំណោះស្រាយថាមពលដែលទុកចិត្តបាន", icon: "☀️" },
        { title: "លឿន", text: "បញ្ជាទិញរហ័សតាម Telegram", icon: "📲" },
      ],
      footnote:
        "កាតាឡុក mobile-first ជាមួយការផ្ទេរវិក្កយបត្រ និងជម្រើសចែករំលែកសមរម្យ។",
      marquee: [
        "អំពូល LED គុណភាព",
        "បំពង់ LED",
        "ភ្លើងហ្វ្លដ៍សូឡា",
        "ភ្លើងផ្លូវ",
        "បន្ទះសូឡា",
        "ថ្ម",
        "គ្រឿងបន្លាស់",
      ],
    },
    storefront: {
      eyebrow: "ហាងអនឡាញ",
      title: "ទំនិញ",
      accent: "ទាំងអស់",
      description:
        "មើលកាតាឡុកពី Neon បន្ថែមទំនិញទៅវិក្កយបត្រផ្ទាល់ ហើយចម្លង ចែករំលែក ឬផ្ញើទៅ Telegram បានភ្លាមៗ។",
      toolbarTitle: "ឧបករណ៍សម្រាប់មើលទំនិញ",
      toolbarDescription:
        "កែតម្រូវលទ្ធផលតាមប្រភេទ ការដាក់ជាក្រុម និងការតម្រៀប ដោយមិនបាត់បង់ការស្វែងរកបច្ចុប្បន្ន។",
      catalogSetupRequired: "ត្រូវកំណត់កាតាឡុកជាមុន",
      catalogSetupBody:
        "បន្ថែម `DATABASE_URL` ក្នុង `.env.local` រត់ `npm run db:push` ហើយបន្ទាប់មក `npm run seed:products` ដើម្បីបញ្ចូលទំនិញ។",
      catalogFallbackTitle: "កំពុងប្រើកាតាឡុកបម្រុង",
      catalogFallbackBody:
        "ហាងកំពុងបង្ហាញកាតាឡុកក្នុងម៉ាស៊ីនជំនួសសិន រហូតដល់ Neon អាចភ្ជាប់បានវិញ។",
      searchCatalog: "ស្វែងរកទំនិញ",
      searchPlaceholder: "ស្វែងរកអំពូល បន្ទះសូឡា ថ្ម ឬភ្លើងហ្វ្លដ៍...",
      pressSlashToFocus: "ចុច / ដើម្បីស្វែងរក",
      updating: "កំពុងធ្វើបច្ចុប្បន្នភាព",
      foundSuffix: "រកឃើញ",
      groupBy: "ដាក់ជាក្រុមតាម",
      sortBy: "តម្រៀបតាម",
      allProducts: "ទំនិញទាំងអស់",
      showOptions: "បង្ហាញជម្រើស",
      hideOptions: "លាក់ជម្រើស",
      clearSearch: "សម្អាតការស្វែងរក",
      resetCatalogView: "កំណត់ទិដ្ឋភាពឡើងវិញ",
      noProductsFound: "រកមិនឃើញទំនិញ",
      noProductsDescription:
        "សាកល្បងពាក្យគន្លឹះផ្សេង ប្តូរតម្រងប្រភេទ ឬកំណត់ទិដ្ឋភាពឡើងវិញ។",
      stateMetaQuery: (query: string, groupLabel: string) =>
        `កំពុងស្វែងរក "${query}" • ដាក់ជាក្រុមតាម ${groupLabel.toLowerCase()}`,
      stateMetaDefault: (groupLabel: string, sortLabel: string) =>
        `ដាក់ជាក្រុមតាម ${groupLabel.toLowerCase()} • តម្រៀបតាម ${sortLabel.toLowerCase()}`,
      catalogErrorFallback: "មិនអាចទាញទំនិញពី Neon បានទេ។",
    },
    product: {
      inStock: "មានស្តុក",
      outOfStock: "អស់ស្តុក",
      readyToQuote: "រួចរាល់សម្រាប់សួរតម្លៃ",
      quickAdd: "បន្ថែមរហ័ស",
      addToCart: "ដាក់ទៅកន្ត្រក",
      reviewInInvoice: "ពិនិត្យក្នុងវិក្កយបត្រ មុនពេលបញ្ជាទិញ",
      stockUnavailable: "មិនអាចបញ្ជាទិញបានឥឡូវនេះ",
      each: "ក្នុងមួយ",
    },
    groups: {
      budgetTitle: "តម្លៃសមរម្យ",
      budgetDescription: "ទំនិញលក់ដាច់សម្រាប់ផ្ទះ ហាង និងការបំពេញស្តុករហ័ស។",
      midRangeTitle: "តម្លៃមធ្យម",
      midRangeDescription:
        "ជម្រើសតម្លៃសមរម្យសម្រាប់ភ្លើងក្រៅអាគារ គ្រឿងបន្លាស់ និងប្រព័ន្ធតូចៗ។",
      projectGradeTitle: "កម្រិតគម្រោង",
      projectGradeDescription:
        "ឧបករណ៍ថាមពលខ្ពស់សម្រាប់ការដំឡើងធំ ប្រព័ន្ធបម្រុង និងការផលិតថាមពល។",
      generalUse: "ការប្រើប្រាស់ទូទៅ",
      useCaseDescription:
        "ទំនិញត្រូវបានដាក់ជាក្រុមតាមបរិបទដំឡើងពិតប្រាកដ និងតម្រូវការអតិថិជន។",
      categoryDescription:
        "ទំនិញត្រូវបានរៀបចំតាមប្រភេទ ដើម្បីងាយស្រួលក្នុងការស្វែងរក។",
    },
    cart: {
      cart: "កន្ត្រក",
      itemsInCart: (count: number) => `មាន ${count} មុខទំនិញក្នុងកន្ត្រក`,
      decreaseQuantity: (title: string) => `បន្ថយចំនួនសម្រាប់ ${title}`,
      increaseQuantity: (title: string) => `បន្ថែមចំនួនសម្រាប់ ${title}`,
      removeFromCart: (title: string) => `ដក ${title} ចេញពីកន្ត្រក`,
      qtyShort: "ចំនួន",
    },
    invoice: {
      invoice: "វិក្កយបត្រ",
      checkoutReady: "ត្រៀមបញ្ជាទិញ",
      checkoutDescription:
        "កែទំនិញខាងក្រោមជាមុន រួចពិនិត្យវិក្កយបត្រ មុនពេលបង្កើតការបញ្ជាទិញ។",
      confirmCheckout: "បញ្ជាក់ការបញ្ជាទិញ",
      reviewPendingOrder: "មើលការបញ្ជាទិញដែលកំពុងរង់ចាំ",
      creatingOrder: "កំពុងបង្កើតការបញ្ជាទិញដែលរង់ចាំ...",
      backToAdjustItems: "ត្រឡប់ទៅកែទំនិញ",
      orderSummary: "សង្ខេបការបញ្ជាទិញ",
      reviewDescription: "ពិនិត្យទំនិញ បង្កើតការបញ្ជាទិញក្នុង Neon ហើយបន្តតាម Telegram។",
      items: "មុខទំនិញ",
      orderId: "លេខការបញ្ជាទិញ",
      status: "ស្ថានភាព",
      invoiceId: "លេខវិក្កយបត្រ",
      draft: "ព្រាង",
      pending: "កំពុងរង់ចាំ",
      accepted: "បានទទួល",
      rejected: "បានបដិសេធ",
      needs_clarification: "ត្រូវការបញ្ជាក់បន្ថែម",
      processing: "កំពុងដំណើរការ",
      completed: "បានបញ្ចប់",
      cancelled: "បានបោះបង់",
      pendingOrderSaved:
        "បានបង្កើតការបញ្ជាទិញដែលកំពុងរង់ចាំរួច។ ពិនិត្យវិក្កយបត្រ ហើយបន្តតាម Telegram។",
      existingPendingOrder:
        "វិក្កយបត្រនេះមានការបញ្ជាទិញកំពុងរង់ចាំរួចហើយ។ សូមពិនិត្យវិក្កយបត្រ ហើយបន្ត។",
      orderCreateFailed: "មិនអាចបង្កើតការបញ្ជាទិញកំពុងរង់ចាំបានទេ។ សូមព្យាយាមម្ដងទៀត។",
      created: "បង្កើតនៅ",
      addItemsToGenerate: "បន្ថែមទំនិញដើម្បីបង្កើត",
      emptyTitle: "វិក្កយបត្ររបស់អ្នកនៅទទេ",
      emptyDescription: "បន្ថែមទំនិញដើម្បីមើលតម្លៃសរុប QR និងប៊ូតុងចែករំលែក។",
      subtotal: "សរុបរង",
      total: "សរុបទាំងអស់",
      qrHint: "QR អាចប្រើបាននៅពេលវិក្កយបត្រមានយ៉ាងហោចណាស់មួយមុខទំនិញ។",
      clearInvoice: "សម្អាតវិក្កយបត្រ",
      imageInvoice: "វិក្កយបត្រជារូបភាព",
      imageInvoiceDescription: "គំរូវិក្កយបត្រស្អាតសម្រាប់ទាញយកជា PNG។",
      textInvoice: "វិក្កយបត្រជាអក្សរ",
      textInvoiceDescription: "អត្ថបទការបញ្ជាទិញដែលអាចចម្លង ចែករំលែក ឬផ្ញើដោយដៃ។",
      adjustItems: "កែប្រែមុខទំនិញ",
      adjustItemsDescription: "កែចំនួនមុនពេលបន្តការបញ្ជាទិញ។",
      removeItem: "ដកចេញ",
      unitPrice: "តម្លៃឯកតា",
      lineTotal: "តម្លៃសរុប",
      checkoutTarget: "គោលដៅបញ្ជាទិញ",
      checkoutStep1: "កន្ត្រក",
      checkoutStep2: "ព័ត៌មាន",
      checkoutStep3: "បញ្ជាក់",
      qrInvoice: "QR វិក្កយបត្រ",
      scanOrShare: "ស្កេន ឬចែករំលែកការបញ្ជាទិញ",
      includedInQr: "មានក្នុង QR",
      qrDescription:
        "លេខទំនិញ ឈ្មោះ តម្លៃ បរិមាណ តម្លៃសរុប និងតំណការបញ្ជាទិញតាម Telegram។",
      mobileLoading: "កំពុងផ្ទុកវិក្កយបត្រ...",
      open: "បើក",
      openTelegram: "បើកការបញ្ជាទិញតាម Telegram",
      copy: "ចម្លង",
      share: "ចែករំលែក",
      image: "រូបភាព",
      telegram: "បញ្ជាទិញតាម Telegram",
      checkoutHint: (target: string) =>
        `ការបញ្ជាទិញតាម Telegram នឹងបើកការជជែកជាមួយ ${target}។ ប៊ូតុងចម្លងសម្រាប់អត្ថបទបញ្ជាទិញ ខណៈប៊ូតុងរូបភាពសម្រាប់ទាញយក PNG ដាច់ដោយឡែក។`,
      invoiceCopied: "បានចម្លងវិក្កយបត្រ",
      copyFailed: "ចម្លងមិនបាន",
      sharedNotSupported: "ឧបករណ៍នេះមិនគាំទ្រការចែករំលែក ទើបចម្លងជំនួស",
      invoiceShared: "បានចែករំលែកវិក្កយបត្រ",
      shareFailed: "ចែករំលែកមិនបាន",
      invoiceImageTargetMissing: "រកមិនឃើញតំបន់សម្រាប់បង្កើតរូបភាពវិក្កយបត្រ",
      invoiceImageExported: () => "បានបង្កើតរូបភាពវិក្កយបត្រ។",
      imageExportFailed: "បង្កើតរូបភាពមិនបាន",
      telegramOpened: (target: string) =>
        `បានបើកការបញ្ជាទិញតាម Telegram សម្រាប់ ${target} ហើយចម្លងសារការបញ្ជាទិញរួច។`,
      telegramOpenedWithoutCopy: (target: string) =>
        `បានបើកការបញ្ជាទិញតាម Telegram សម្រាប់ ${target} រួច។ បើចាំបាច់ សូមចម្លងសារដោយដៃ។`,
      telegramOpenFailed: "បើកការបញ្ជាទិញតាម Telegram មិនបាន",
    },
    ordering: {
      reviewOrder: "ពិនិត្យការបញ្ជាទិញ",
      orderNow: "បញ្ជាទិញ",
      creatingOrder: "កំពុងបង្កើតការបញ្ជាទិញ...",
      orderReadyTitle: "បានបង្កើតការបញ្ជាទិញ",
      orderReadyDescription:
        "ការបញ្ជាទិញរបស់អ្នកត្រូវបានរក្សាទុកក្នុង Neon ហើយ។ សូមបន្តតាម Telegram ពីបរិបទការបញ្ជាទិញដដែល ឬប្រើ Short Order ID នៅពេលត្រូវការស្ដារវិញ។",
      continueInTelegram: "បន្តតាម Telegram",
      copyOrder: "ចម្លងការបញ្ជាទិញ",
      orderCopied: "បានចម្លងការបញ្ជាទិញ",
      orderCopyFailed: "មិនអាចចម្លងការបញ្ជាទិញបានទេ",
      shareInvoice: "ចែករំលែកវិក្កយបត្រ",
      shareInvoiceSuccess: "បានចែករំលែកវិក្កយបត្រ",
      shareInvoiceFallback: "ឧបករណ៍នេះមិនគាំទ្រការចែករំលែក ទើបចម្លងវិក្កយបត្រជំនួស",
      shareInvoiceFailed: "មិនអាចចែករំលែកវិក្កយបត្រ បានទេ",
      orderFailed: "មិនអាចបង្កើតការបញ្ជាទិញបានទេ។ សូមព្យាយាមម្ដងទៀត។",
      handoffHint:
        "Telegram នឹងបន្តពីការបញ្ជាទិញដែលបានរក្សាទុកនេះ ដើម្បីឱ្យអតិថិជនអាចបញ្ជាក់ ទាក់ទងផ្នែកលក់ ឬបោះបង់ ដោយមិនចាំបាច់ចាប់ផ្តើមការបញ្ជាទិញឡើងវិញ។ Short Order ID គឺជាកូដងាយស្រួលបំផុតសម្រាប់បិទភ្ជាប់ដើម្បីស្ដារការបញ្ជាទិញវិញ។",
      pasteLinkTitle: "បញ្ជាទិញពីតំណដែលបានបិទភ្ជាប់",
      pasteLinkDescription:
        "បិទភ្ជាប់តំណទំនិញពីហាងនេះ ដើម្បីស្វែងរកទំនិញ ហើយបន្តការបញ្ជាទិញ។",
      pasteLinkPlaceholder: "បិទភ្ជាប់ URL ទំនិញ",
      resolveLink: "ស្វែងរកតំណ",
      resolvingLink: "កំពុងស្វែងរកតំណ...",
      invalidLink: "សូមបញ្ចូល URL ទំនិញដែលត្រឹមត្រូវ។",
      productNotFound: "រកមិនឃើញទំនិញដែលត្រូវនឹងតំណនេះទេ។",
      addedFromLink: (title: string) => `បានបន្ថែម ${title} ចូលកន្ត្រកពីតំណដែលបានបិទភ្ជាប់។`,
      phoneRequired: "លេខទូរស័ព្ទត្រូវបានទាមទារ",
      phoneInvalid: "សូមបញ្ចូលលេខទូរស័ព្ទត្រឹមត្រូវ",
      fulfillmentRequired: "សូមជ្រើសរើសការទទួល ឬការដឹក",
      checkoutConfirmTelegram: "បញ្ជាក់ និងបើក Telegram",
      sendOrderTelegram: "ផ្ញើការបញ្ជាទិញទៅ Telegram",
      pendingStatusTitle: "ការបញ្ជាទិញរបស់អ្នកកំពុងរង់ចាំការបញ្ជាក់ពីផ្នែកលក់",
      pendingStatusDescription: "ការបញ្ជាទិញរបស់អ្នកត្រូវបានរក្សាទុកដោយជោគជ័យ។ សូមបន្តជាមួយក្រុមផ្នែកលក់របស់យើងដើម្បីបញ្ជាក់ពីស្តុក ការដឹកជញ្ជូន ឬការមកយកដោយខ្លួនឯង។",
      contactSales: "ទាក់ទងផ្នែកលក់",
      chatWithSales: "ជជែកជាមួយផ្នែកលក់",
      successStatusTitle: "ការបញ្ជាទិញបានបង្កើតដោយជោគជ័យ",
      successStatusDescription: "ការបញ្ជាទិញរបស់អ្នកត្រូវបានរក្សាទុកក្នុងប្រព័ន្ធរបស់យើង។ សូមបន្តក្នុង Telegram សម្រាប់ការបញ្ជាក់ និងការគាំទ្រ។",
      orderSavedTelegramNext: "ការបញ្ជាទិញត្រូវបានរក្សាទុករួចហើយ។ ជំហានបន្ទាប់គឺ Telegram ។",
      contactSalesHelpText: "ក្រុមផ្នែកលក់របស់យើងអាចជួយទាក់ទងនឹងស្តុក ការដឹកជញ្ជូន ឬការកែប្រែការបញ្ជាទិញ។",
      copySuccess: "បានចម្លងអត្ថបទការបញ្ជាទិញ",
      copyFailed: "ចម្លងមិនបាន",
      orderId: "លេខការបញ្ជាទិញ",
    },
    footer: {
      description:
        "ភ្លើងឆ្លាតវៃ ដំណោះស្រាយសូឡា វិក្កយបត្រក្នុងម៉ាស៊ីន និងការបញ្ជាទិញត្រៀមសម្រាប់ Telegram។",
      products: "ទំនិញ",
      invoice: "វិក្កយបត្រ",
      telegram: "Telegram",
    },
    theme: {
      dark: "ងងឹត",
      light: "ភ្លឺ",
      switchTo: (mode: "light" | "dark") =>
        mode === "dark" ? "ប្ដូរទៅម៉ូដងងឹត" : "ប្ដូរទៅម៉ូដភ្លឺ",
    },
  },
} as const;

export function getUiText(locale: Locale) {
  return uiText[locale];
}
