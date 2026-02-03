import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges class names and removes duplicates", () => {
    const merged = cn("p-2", "text-sm", ["p-2", { hidden: false }]);
    expect(merged.split(" ").sort()).toEqual(["p-2", "text-sm"].sort());
  });
});
