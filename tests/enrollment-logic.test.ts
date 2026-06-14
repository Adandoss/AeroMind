import { describe, it, expect } from "vitest";
import { canStudentEnroll } from "@/lib/enrollment-logic";

const activeSubscription = {
  status: "ACTIVE",
  currentPeriodEnd: new Date("2026-12-31T00:00:00.000Z"),
};

describe("canStudentEnroll", () => {
  it("allows admins without a subscription", () => {
    expect(
      canStudentEnroll({
        isAdmin: true,
        activeSubscription: null,
      }),
    ).toEqual({ allowed: true });
  });

  it("allows students with an active subscription", () => {
    expect(
      canStudentEnroll({
        isAdmin: false,
        activeSubscription,
        now: new Date("2026-06-14T00:00:00.000Z"),
      }),
    ).toEqual({ allowed: true });
  });

  it("blocks students without an active subscription", () => {
    const result = canStudentEnroll({
      isAdmin: false,
      activeSubscription: null,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("Active subscription required");
  });

  it("blocks students with an expired subscription", () => {
    const result = canStudentEnroll({
      isAdmin: false,
      activeSubscription: {
        status: "ACTIVE",
        currentPeriodEnd: new Date("2026-01-01T00:00:00.000Z"),
      },
      now: new Date("2026-06-14T00:00:00.000Z"),
    });

    expect(result.allowed).toBe(false);
  });
});
