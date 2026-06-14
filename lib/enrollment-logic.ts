export interface SubscriptionInfo {
  status: string;
  currentPeriodEnd: Date;
}

export function canStudentEnroll(options: {
  isAdmin: boolean;
  activeSubscription: SubscriptionInfo | null;
  now?: Date;
}): { allowed: boolean; reason?: string } {
  const { isAdmin, activeSubscription, now = new Date() } = options;

  if (isAdmin) {
    return { allowed: true };
  }

  if (
    activeSubscription &&
    activeSubscription.status === "ACTIVE" &&
    activeSubscription.currentPeriodEnd >= now
  ) {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: "Active subscription required to enroll in this course. Please visit pricing page.",
  };
}
