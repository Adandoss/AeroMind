import Link from "next/link";

const navLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/mentors", label: "Mentors" },
  { href: "/pricing", label: "Pricing" },
];

export function TopBar() {
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
        </nav>

        <Link
          href="/register"
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          Get Started
        </Link>
      </div>
    </header>
  );
}
