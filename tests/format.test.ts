import { describe, it, expect } from "vitest";
import { formatPrice, stripModuleNumberPrefix } from "@/lib/format";

describe("formatPrice", () => {
  it("formats cents as USD", () => {
    expect(formatPrice(4999)).toBe("$49.99");
    expect(formatPrice(0)).toBe("$0.00");
  });
});

describe("stripModuleNumberPrefix", () => {
  it("removes a leading Module N: prefix", () => {
    expect(stripModuleNumberPrefix("Module 1: Metrics that Matter")).toBe("Metrics that Matter");
    expect(stripModuleNumberPrefix("module 2: Experimentation")).toBe("Experimentation");
  });

  it("leaves titles without a prefix unchanged", () => {
    expect(stripModuleNumberPrefix("Foundations")).toBe("Foundations");
  });
});
