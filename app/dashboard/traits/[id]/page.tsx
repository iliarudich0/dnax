import { TraitClient } from "./trait-client";
import { traitCatalog } from "@/lib/traits/catalog";

export function generateStaticParams() {
  return traitCatalog.map((trait) => ({ id: trait.id }));
}

export const dynamicParams = false;

export default function TraitDetailPage({ params }: { params: { id: string } }) {
  return <TraitClient traitId={params.id} />;
}
