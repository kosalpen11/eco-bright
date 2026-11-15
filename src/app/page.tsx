import { permanentRedirect } from "next/navigation";

// /products is the storefront home (it carries the Organization + WebSite JSON-LD).
export default function HomePage() {
  permanentRedirect("/products");
}
