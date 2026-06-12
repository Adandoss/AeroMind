"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckoutSchema, CheckoutInput } from "@/lib/schemas/checkout";
import { processCheckout } from "@/lib/api/checkout";
import { useRouter } from "next/navigation";
import { Plan } from "@/lib/types/enums";

export function PricingClient() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [checkoutError, setCheckoutError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckoutInput>({
    resolver: zodResolver(CheckoutSchema),
  });

  const openCheckout = (plan: Plan) => {
    setSelectedPlan(plan);
    setCheckoutError("");
    reset({
      plan,
      cardNumber: "",
      cvc: "",
      expiry: "",
    });
  };

  const closeCheckout = () => {
    setSelectedPlan(null);
  };

  const onSubmit = async (data: CheckoutInput) => {
    setCheckoutError("");
    setIsSubmitting(true);
    try {
      await processCheckout(data);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedPlan(null);
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      if (err.message.includes("401") || err.message.toLowerCase().includes("authentication")) {
        router.push(`/login?callbackUrl=/pricing`);
      } else {
        setCheckoutError(err.message || "Simulated payment failed. Please check card info.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const plans = [
    {
      id: Plan.INDIVIDUAL,
      name: "Individual",
      price: "$19",
      period: "per month",
      description: "Essential skills and structured blueprints for growing professionals.",
      features: [
        "Access to standard courses",
        "Weekly progress tracking",
        "Community forum support",
        "Swiss design system fundamentals",
      ],
      cta: "Start Individual Plan",
      popular: false,
    },
    {
      id: Plan.PROFESSIONAL,
      name: "Professional",
      price: "$49",
      period: "per month",
      description: "Full precision learning with premium content and advanced modules.",
      features: [
        "Access to ALL courses & resources",
        "Prioritized grading and feedback",
        "Interactive SVG charts and dashboard",
        "Exclusive module certificates",
        "1-on-1 monthly check-ins",
      ],
      cta: "Unlock Professional",
      popular: true,
    },
    {
      id: Plan.ENTERPRISE,
      name: "Enterprise",
      price: "Custom",
      period: "for teams",
      description: "Dedicated learning pipelines for design agencies and organizations.",
      features: [
        "Everything in Professional",
        "Unlimited seats for teams",
        "Custom organization learning tracks",
        "API integration & reporting tools",
        "Dedicated customer success manager",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-16 flex-1 flex flex-col justify-center">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
          Membership Architecture
        </h1>
        <p className="mt-4 text-zinc-500 text-sm sm:text-base">
          Invest in precision-engineered curriculum. Cancel or upgrade your tier at any time.
        </p>
      </div>

      {/* Grid of pricing cards */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 items-stretch">
        {plans.map((p) => (
          <div
            key={p.id}
            className={`border flex flex-col p-8 bg-white transition-all hover:shadow-lg relative ${
              p.popular
                ? "border-primary ring-1 ring-primary shadow-sm"
                : "border-zinc-200"
            }`}
          >
            {p.popular && (
              <span className="absolute top-0 right-8 -translate-y-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1">
                Most Popular
              </span>
            )}

            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                {p.name}
              </h2>
              <p className="mt-2 text-zinc-500 text-xs leading-relaxed min-h-[40px]">
                {p.description}
              </p>
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold tracking-tight text-zinc-900">
                  {p.price}
                </span>
                <span className="text-xs text-zinc-400 font-medium">{p.period}</span>
              </div>
            </div>

            {/* List of features */}
            <ul className="flex-1 flex flex-col gap-3.5 mb-8 border-t border-zinc-100 pt-6">
              {p.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-zinc-600">
                  <svg
                    className="h-4 w-4 text-primary shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            {/* Button */}
            {p.id === Plan.ENTERPRISE ? (
              <a
                href="mailto:enterprise@aeromind.io?subject=Enterprise%20Subscription%20Inquiry"
                className="block w-full py-3 border border-zinc-900 text-zinc-900 text-center text-xs font-bold uppercase tracking-wider hover:bg-zinc-50 transition-colors"
              >
                {p.cta}
              </a>
            ) : (
              <button
                onClick={() => openCheckout(p.id)}
                className={`w-full py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors ${
                  p.popular
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : "bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                {p.cta}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Simulated Checkout Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 w-full max-w-md p-8 shadow-xl relative animate-in fade-in duration-200">
            <button
              onClick={closeCheckout}
              className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {showSuccess ? (
              <div className="text-center py-8 flex flex-col items-center justify-center">
                <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4 text-emerald-500">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-zinc-900">Subscription Activated</h3>
                <p className="text-xs text-zinc-500 mt-2">
                  Welcome to AeroMind. Redirecting you to the dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Checkout</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    Simulate subscription payment for the{" "}
                    <span className="font-semibold text-zinc-800 uppercase">
                      {selectedPlan}
                    </span>{" "}
                    tier.
                  </p>
                </div>

                {checkoutError && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-100 p-3">
                    {checkoutError}
                  </div>
                )}

                {/* Card input fields */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                      Card Number
                    </label>
                    <input
                      type="text"
                      placeholder="4000123456789010"
                      maxLength={16}
                      {...register("cardNumber")}
                      className="w-full border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                    />
                    {errors.cardNumber && (
                      <p className="text-xs text-red-500 mt-1">{errors.cardNumber.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        placeholder="12/28"
                        maxLength={5}
                        {...register("expiry")}
                        className="w-full border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                      {errors.expiry && (
                        <p className="text-xs text-red-500 mt-1">{errors.expiry.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">
                        CVC
                      </label>
                      <input
                        type="text"
                        placeholder="123"
                        maxLength={4}
                        {...register("cvc")}
                        className="w-full border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-primary focus:outline-none"
                      />
                      {errors.cvc && (
                        <p className="text-xs text-red-500 mt-1">{errors.cvc.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 border-t border-zinc-100 pt-6">
                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="flex-1 py-3 border border-zinc-200 text-center text-xs font-bold uppercase tracking-wider text-zinc-600 hover:bg-zinc-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-primary text-white text-center text-xs font-bold uppercase tracking-wider hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Processing..." : "Pay & Activate"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
