import { CheckoutInput } from "@/lib/schemas/checkout";

export async function processCheckout(data: CheckoutInput) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const responseData = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(responseData.error || "Simulated payment failed");
  }
  return responseData;
}
