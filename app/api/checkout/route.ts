import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/db";
import { withLogging } from "@/lib/server/request-logger";
import { auth } from "@/lib/server/auth";
import { CheckoutSchema } from "@/lib/schemas/checkout";
import { Plan } from "@/generated/prisma/client";

const PLAN_PRICES_CENTS: Record<Plan, number> = {
  [Plan.INDIVIDUAL]: 2900,
  [Plan.PROFESSIONAL]: 5900,
  [Plan.ENTERPRISE]: 9900,
};

export const POST = withLogging(async (req: NextRequest) => {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return Response.json({ error: "Authentication required" }, { status: 401 });
  }

  // Parse request body
  let body;
  try {
    body = await req.json();
  } catch (err) {
    return Response.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  // Validate fields
  const validationResult = CheckoutSchema.safeParse(body);
  if (!validationResult.success) {
    return Response.json(
      { error: "Validation failed", details: validationResult.error.flatten() },
      { status: 400 }
    );
  }

  const { plan } = validationResult.data;
  const priceCents = PLAN_PRICES_CENTS[plan];

  const in30Days = new Date();
  in30Days.setDate(in30Days.getDate() + 30);

  // Database transaction: Create order and activate subscription
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create order record
    const order = await tx.order.create({
      data: {
        userId,
        plan,
        amountCents: priceCents,
        status: "PAID",
      },
    });

    // 2. Check for existing subscription
    const existingSubscription = await tx.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    let subscription;
    if (existingSubscription) {
      subscription = await tx.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          plan,
          status: "ACTIVE",
          currentPeriodEnd: in30Days,
        },
      });
    } else {
      subscription = await tx.subscription.create({
        data: {
          userId,
          plan,
          status: "ACTIVE",
          currentPeriodEnd: in30Days,
        },
      });
    }

    return { order, subscription };
  });

  return Response.json({
    success: true,
    message: "Payment processed successfully. Subscription active.",
    orderId: result.order.id,
    subscriptionId: result.subscription.id,
    plan: result.subscription.plan,
    currentPeriodEnd: result.subscription.currentPeriodEnd.toISOString(),
  });
});
