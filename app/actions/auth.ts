"use server";

import { prisma } from "@/lib/server/db";
import { RegisterSchema, LoginSchema } from "@/lib/schemas/auth";
import { hash } from "bcryptjs";
import { signIn, signOut } from "@/lib/server/auth";
import { AuthError } from "next-auth";

export async function registerAction(data: unknown) {
  const parsed = RegisterSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid form data." };
  }

  const { name, email, password } = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Email is already registered." };
    }

    const hashedPassword = await hash(password, 10);
    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        role: "STUDENT",
      },
    });

    // Sign the user in immediately after successful registration
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: true };
  } catch (err) {
    console.error("Registration error:", err);
    return { success: false, error: "Something went wrong during registration." };
  }
}

export async function loginAction(data: unknown) {
  const parsed = LoginSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid credentials." };
  }

  const { email, password } = parsed.data;

  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: "Invalid email or password." };
    }

    return { success: true };
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password." };
        default:
          return { success: false, error: "Authentication failed. Please try again." };
      }
    }
    console.error("Login action error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
