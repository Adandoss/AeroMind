"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RegisterSchema, RegisterInput } from "@/lib/schemas/auth";
import { registerAction } from "@/app/actions/auth";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setError(null);
    setLoading(true);

    try {
      const res = await registerAction(data);
      if (res.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(res.error || "Registration failed.");
        setLoading(false);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50">
      <div className="w-full max-w-md space-y-8 rounded-xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-ink">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Or{" "}
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700 border border-red-200" role="alert">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-700"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className={`mt-1 block w-full rounded border bg-white text-zinc-900 px-3 py-2 text-sm outline-none transition-colors focus:border-primary ${
                  errors.name ? "border-red-300 focus:border-red-500" : "border-zinc-300"
                }`}
                placeholder="Ada Admin"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700"
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={`mt-1 block w-full rounded border bg-white text-zinc-900 px-3 py-2 text-sm outline-none transition-colors focus:border-primary ${
                  errors.email ? "border-red-300 focus:border-red-500" : "border-zinc-300"
                }`}
                placeholder="you@example.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className={`mt-1 block w-full rounded border bg-white text-zinc-900 px-3 py-2 text-sm outline-none transition-colors focus:border-primary ${
                  errors.password ? "border-red-300 focus:border-red-500" : "border-zinc-300"
                }`}
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-700"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className={`mt-1 block w-full rounded border bg-white text-zinc-900 px-3 py-2 text-sm outline-none transition-colors focus:border-primary ${
                  errors.confirmPassword
                    ? "border-red-300 focus:border-red-500"
                    : "border-zinc-300"
                }`}
                placeholder="••••••••"
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
