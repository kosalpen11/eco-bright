import type { Metadata } from "next";
import { SearchX } from "lucide-react";

import { StatusPage } from "@/components/common/status-page";
import { getUiText } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/locale-server";

export const metadata: Metadata = {
  title: "រកមិនឃើញទំព័រ",
  robots: { index: false },
};

export default async function NotFound() {
  const locale = await getRequestLocale();
  const copy = getUiText(locale).states;

  return (
    <StatusPage
      icon={SearchX}
      title={copy.notFoundTitle}
      body={copy.notFoundBody}
      backLabel={copy.backToProducts}
    />
  );
}
