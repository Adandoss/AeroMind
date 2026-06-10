import Link from "next/link";

const footerLinks = [
  { href: "#", label: "Privacy Policy" },
  { href: "#", label: "Terms of Service" },
  { href: "#", label: "Accessibility" },
  { href: "#", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col justify-between gap-6 px-6 py-10 sm:flex-row sm:items-end">
        <div>
          <p className="text-lg font-bold tracking-tight">AeroMind</p>
          <p className="mt-1 text-sm text-zinc-600">
            &copy; 2026 AeroMind. Precision in Learning.
          </p>
        </div>
        <nav className="flex flex-wrap gap-6 text-sm text-zinc-600">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="underline underline-offset-4 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
