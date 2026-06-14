"use client";

import { clearAuthQueries } from "@/lib/query-client";
import { logoutAction } from "@/app/actions/auth";

type SignOutButtonProps = {
  className?: string;
  children?: React.ReactNode;
};

export function SignOutButton({
  className,
  children = "Sign Out",
}: SignOutButtonProps) {
  return (
    <form
      action={async () => {
        clearAuthQueries();
        await logoutAction();
      }}
    >
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
