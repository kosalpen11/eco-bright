"use client";

import { useLocale } from "@/components/locale/locale-provider";
import { Input } from "@/components/ui/input";
import { getUiText } from "@/lib/i18n";

interface CheckoutFormProps {
  phone: string;
  fulfillmentType: "delivery" | "pickup" | "";
  deliveryLocation: string;
  pickupNote: string;
  onPhoneChange: (value: string) => void;
  onFulfillmentTypeChange: (value: "delivery" | "pickup") => void;
  onDeliveryLocationChange: (value: string) => void;
  onPickupNoteChange: (value: string) => void;
  errors?: {
    phone?: string;
    fulfillmentType?: string;
    deliveryLocation?: string;
  };
  className?: string;
}

export function CheckoutForm({
  phone,
  fulfillmentType,
  deliveryLocation,
  pickupNote,
  onPhoneChange,
  onFulfillmentTypeChange,
  onDeliveryLocationChange,
  onPickupNoteChange,
  errors,
  className,
}: CheckoutFormProps) {
  const { locale } = useLocale();
  const copy = getUiText(locale).checkout;
  // Validation returns English sentences; show the localized message for each failing field.
  const phoneError = errors?.phone ? copy.phoneRequired : null;
  const fulfillmentError = errors?.fulfillmentType ? copy.chooseFulfillment : null;
  const locationError = errors?.deliveryLocation ? copy.locationRequired : null;

  return (
    <div className={`space-y-4 rounded-[1.6rem] border border-app-border bg-app-surface-2 p-4 ${className ?? ""}`}>
      <div>
        <label htmlFor="checkout-phone" className="mb-2 block text-sm font-semibold text-app-text">
          {copy.phone}
        </label>
        <Input
          id="checkout-phone"
          type="tel"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          placeholder={copy.phonePlaceholder}
          className="bg-app-surface"
        />
        {phoneError ? <p role="alert" className="mt-2 text-xs text-app-danger">{phoneError}</p> : null}
      </div>

      <div>
        <div id="checkout-fulfillment" className="mb-2 block text-sm font-semibold text-app-text">{copy.fulfillment}</div>
        <div role="group" aria-labelledby="checkout-fulfillment" className="grid grid-cols-2 gap-3">
          {(["delivery", "pickup"] as const).map((option) => {
            const selected = fulfillmentType === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onFulfillmentTypeChange(option)}
                aria-pressed={selected}
                className={[
                  "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  selected
                    ? "border-app-primary bg-app-primary-soft text-app-primary"
                    : "border-app-border bg-app-surface text-app-text-muted",
                ].join(" ")}
              >
                {option === "delivery" ? copy.delivery : copy.pickup}
              </button>
            );
          })}
        </div>
        {fulfillmentError ? (
          <p role="alert" className="mt-2 text-xs text-app-danger">{fulfillmentError}</p>
        ) : null}
      </div>

      {fulfillmentType === "delivery" ? (
        <div>
          <label htmlFor="checkout-delivery" className="mb-2 block text-sm font-semibold text-app-text">
            {copy.deliveryLocation}
          </label>
          <Input
            id="checkout-delivery"
            type="text"
            value={deliveryLocation}
            onChange={(event) => onDeliveryLocationChange(event.target.value)}
            placeholder={copy.deliveryPlaceholder}
            className="bg-app-surface"
          />
          {locationError ? (
            <p role="alert" className="mt-2 text-xs text-app-danger">{locationError}</p>
          ) : null}
        </div>
      ) : null}

      {fulfillmentType === "pickup" ? (
        <div>
          <label htmlFor="checkout-pickup" className="mb-2 block text-sm font-semibold text-app-text">
            {copy.pickupNote}
          </label>
          <Input
            id="checkout-pickup"
            type="text"
            value={pickupNote}
            onChange={(event) => onPickupNoteChange(event.target.value)}
            placeholder={copy.pickupDefault}
            className="bg-app-surface"
          />
        </div>
      ) : null}
    </div>
  );
}
