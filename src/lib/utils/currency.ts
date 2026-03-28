import { CURRENCY } from "@/lib/constants";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 2,
});

export function formatCurrency(value: number) {
  return formatter.format(value);
}
