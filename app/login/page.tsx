"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LoginSchema, LoginInput } from "@/lib/schemas/auth";
import { loginAction } from "@/app/actions/auth";
import { clearAuthQueries } from "@/lib/query-client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setLoading(true);

    try {
      const res = await loginAction(data);
      if (res.success) {
        clearAuthQueries();
        const destination =
          callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")
            ? callbackUrl
            : "/dashboard";
        router.push(destination);
        router.refresh();
      } else {
        setError(res.error || "Invalid credentials.");
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
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              create a new account
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
                autoComplete="current-password"
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
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
