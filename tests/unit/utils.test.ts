import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn utility", () => {
  it("merges single and multiple class strings", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("handles conditional classes accurately", () => {
    const isTrue = true;
    const isFalse = false;
    expect(cn("base-class", isTrue && "active", isFalse && "hidden")).toBe(
      "base-class active"
    );
  });

  it("filters out falsy, null, and undefined values", () => {
    expect(cn("text-red-500", null, undefined, false, 0 && "extra")).toBe(
      "text-red-500"
    );
  });

  it("correctly resolves conflicting Tailwind CSS classes with tailwind-merge", () => {
    // twMerge should ensure the last conflicting class wins
    expect(cn("p-4", "p-8")).toBe("p-8");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn("bg-white", "bg-transparent", "bg-black")).toBe("bg-black");
  });

  it("handles array inputs and objects", () => {
    expect(cn(["font-bold", "text-sm"], { "opacity-50": true, hidden: false })).toBe(
      "font-bold text-sm opacity-50"
    );
  });
});
