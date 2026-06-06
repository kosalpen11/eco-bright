"use client";

import { Input } from "@/components/ui/input";

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
  return (
    <div className={`space-y-4 rounded-[1.6rem] border border-app-border bg-app-surface-2 p-4 ${className ?? ""}`}>
      <div>
        <label htmlFor="checkout-phone" className="mb-2 block text-sm font-semibold text-app-text">
          Phone
        </label>
        <Input
          id="checkout-phone"
          type="tel"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          placeholder="012 913 xxxx"
          className="bg-app-surface"
        />
        {errors?.phone ? <p className="mt-2 text-xs text-app-danger">{errors.phone}</p> : null}
      </div>

      <div>
        <div className="mb-2 block text-sm font-semibold text-app-text">Fulfillment</div>
        <div className="grid grid-cols-2 gap-3">
          {(["delivery", "pickup"] as const).map((option) => {
            const selected = fulfillmentType === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onFulfillmentTypeChange(option)}
                className={[
                  "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                  selected
                    ? "border-app-primary bg-app-primary-soft text-app-primary"
                    : "border-app-border bg-app-surface text-app-text-muted",
                ].join(" ")}
              >
                {option === "delivery" ? "Delivery" : "Pickup"}
              </button>
            );
          })}
        </div>
        {errors?.fulfillmentType ? (
          <p className="mt-2 text-xs text-app-danger">{errors.fulfillmentType}</p>
        ) : null}
      </div>

      {fulfillmentType === "delivery" ? (
        <div>
          <label htmlFor="checkout-delivery" className="mb-2 block text-sm font-semibold text-app-text">
            Delivery location
          </label>
          <Input
            id="checkout-delivery"
            type="text"
            value={deliveryLocation}
            onChange={(event) => onDeliveryLocationChange(event.target.value)}
            placeholder="Phnom Penh, Toul Kork"
            className="bg-app-surface"
          />
          {errors?.deliveryLocation ? (
            <p className="mt-2 text-xs text-app-danger">{errors.deliveryLocation}</p>
          ) : null}
        </div>
      ) : null}

      {fulfillmentType === "pickup" ? (
        <div>
          <label htmlFor="checkout-pickup" className="mb-2 block text-sm font-semibold text-app-text">
            Pickup note
          </label>
          <Input
            id="checkout-pickup"
            type="text"
            value={pickupNote}
            onChange={(event) => onPickupNoteChange(event.target.value)}
            placeholder="Pickup at shop"
            className="bg-app-surface"
          />
        </div>
      ) : null}
    </div>
  );
}
