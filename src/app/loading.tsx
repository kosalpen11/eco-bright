import { CatalogSkeleton } from "@/components/common/page-skeletons";

// "/" redirects to the catalog, so show the catalog skeleton.
export default function Loading() {
  return <CatalogSkeleton />;
}
