/**
 * Store contact details shown in the site footer.
 * Fill these in with the real business details. Any field left empty is hidden
 * in the footer, so nothing placeholder-looking reaches customers.
 */
export const STORE_INFO = {
  /** Display format, e.g. "+855 12 345 678". Rendered as a tel: link. */
  phone: "",
  address: { en: "", km: "" },
  deliveryArea: { en: "Delivery anywhere in Cambodia", km: "ដឹកជញ្ជូនទូទាំងប្រទេសកម្ពុជា" },
  /** e.g. { en: "Mon–Sat, 8:00–17:30", km: "ច័ន្ទ–សៅរ៍ ម៉ោង ៨:០០–១៧:៣០" } */
  hours: { en: "", km: "" },
  /** Page or external URL for the return policy, e.g. "/returns". */
  returnPolicyHref: "",
} as const;

export function toTelHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
