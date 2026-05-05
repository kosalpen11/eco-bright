import { useLocale } from "@/components/locale/locale-provider";
import { getUiText } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { MapPin, Package } from "lucide-react";

interface CheckoutFormProps {
  customerName: string;
  customerPhone: string;
  note: string;
  fulfillmentMethod: "pickup" | "delivery" | "";
  onCustomerNameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onFulfillmentMethodChange: (value: "pickup" | "delivery") => void;
  className?: string;
}

export function CheckoutForm({
  customerName,
  customerPhone,
  note,
  fulfillmentMethod,
  onCustomerNameChange,
  onCustomerPhoneChange,
  onNoteChange,
  onFulfillmentMethodChange,
  className,
}: CheckoutFormProps) {
  const { locale } = useLocale();
  const ui = getUiText(locale);

  return (
    <div className={`space-y-6 rounded-[1.75rem] border border-app-border bg-app-surface-2 p-5 ${className ?? ""}`}>
      <div className="space-y-3">
        <label className="text-sm font-semibold text-app-text">
          {locale === "km" ? "ការទទួល ឬការដឹកជញ្ជូន" : "Fulfillment Method"} <span className="text-app-danger">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onFulfillmentMethodChange("pickup")}
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition ${
              fulfillmentMethod === "pickup"
                ? "border-app-primary bg-app-primary-soft text-app-primary"
                : "border-app-border bg-app-surface text-app-text-muted hover:border-app-text-soft"
            }`}
          >
            <Package className="size-5" />
            <span className="text-sm font-medium">{locale === "km" ? "មកយកដោយខ្លួនឯង" : "Pickup"}</span>
          </button>
          <button
            type="button"
            onClick={() => onFulfillmentMethodChange("delivery")}
            className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition ${
              fulfillmentMethod === "delivery"
                ? "border-app-primary bg-app-primary-soft text-app-primary"
                : "border-app-border bg-app-surface text-app-text-muted hover:border-app-text-soft"
            }`}
          >
            <MapPin className="size-5" />
            <span className="text-sm font-medium">{locale === "km" ? "ដឹកជញ្ជូន" : "Delivery"}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="customerPhone" className="text-sm font-semibold text-app-text">
            {locale === "km" ? "លេខទូរស័ព្ទ" : "Phone Number"} <span className="text-app-danger">*</span>
          </label>
          <Input
            id="customerPhone"
            type="tel"
            placeholder={locale === "km" ? "ឧ. 012 345 678" : "e.g. 012 345 678"}
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            className="rounded-xl border-app-border bg-app-surface px-4 py-6"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="customerName" className="text-sm font-semibold text-app-text">
            {locale === "km" ? "ឈ្មោះ (ជាជម្រើស)" : "Name (Optional)"}
          </label>
          <Input
            id="customerName"
            type="text"
            placeholder={locale === "km" ? "បញ្ចូលឈ្មោះរបស់អ្នក" : "Enter your name"}
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            className="rounded-xl border-app-border bg-app-surface px-4 py-6"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="note" className="text-sm font-semibold text-app-text">
            {locale === "km" ? "ចំណាំ (ជាជម្រើស)" : "Note (Optional)"}
          </label>
          <Input
            id="note"
            type="text"
            placeholder={locale === "km" ? "បន្ថែមព័ត៌មានបន្ថែម" : "Add extra details"}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            className="rounded-xl border-app-border bg-app-surface px-4 py-6"
          />
        </div>
      </div>
    </div>
  );
}
