import { TraitResult } from "@/lib/types";

export function selectTopTraits(traits: TraitResult[], count = 5) {
  const available = traits.filter((trait) => trait.outcome !== "Not detected");
  return available.slice(0, count);
}

export function buildShareHeadline(traits: TraitResult[]) {
  const top = selectTopTraits(traits, 1)[0];
  if (!top) return "Trait snapshot";
  return `Top trait: ${top.name}`;
}

export function buildShareNote() {
  return "This summary excludes raw DNA and individual genotypes.";
}
