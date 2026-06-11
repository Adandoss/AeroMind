import Link from "next/link";
import { auth } from "@/lib/server/auth";
import { logoutAction } from "@/app/actions/auth";

const navLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/mentors", label: "Mentors" },
  { href: "/pricing", label: "Pricing" },
];

export async function TopBar() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight">
          AeroMind
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-zinc-700 sm:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
          {isLoggedIn && (
            <Link
              href="/dashboard"
              className="transition-colors hover:text-ink font-medium"
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin/courses"
                  className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline"
                >
                  Admin
                </Link>
              )}
              <span className="text-sm text-zinc-600 hidden md:inline">
                {session.user.name}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-50 cursor-pointer"
                >
                  Sign Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-700 hover:text-ink"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

