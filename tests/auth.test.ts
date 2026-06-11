import { describe, it, expect } from "vitest";
import { LoginSchema, RegisterSchema } from "@/lib/schemas/auth";

describe("LoginSchema validation", () => {
  it("should validate correct credentials", () => {
    const result = LoginSchema.safeParse({
      email: "test@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should fail on invalid email format", () => {
    const result = LoginSchema.safeParse({
      email: "invalid-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Please enter a valid email address.");
    }
  });

  it("should fail on short password", () => {
    const result = LoginSchema.safeParse({
      email: "test@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Password must be at least 6 characters.");
    }
  });
});

describe("RegisterSchema validation", () => {
  it("should validate correct registration data", () => {
    const result = RegisterSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("should fail on mismatched passwords", () => {
    const result = RegisterSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "differentpassword",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Passwords must match.");
    }
  });

  it("should fail on short name", () => {
    const result = RegisterSchema.safeParse({
      name: "A",
      email: "john@example.com",
      password: "password123",
      confirmPassword: "password123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Name must be at least 2 characters.");
    }
  });
});
