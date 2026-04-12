import Link from "next/link";
import { Logo } from "./logo";
import { appName, contactEmail } from "../config";

const footerLinks = [
    {
        heading: "Product",
        links: [
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
            { label: "Pricing", href: "#pricing" },
        ],
    },
    {
        heading: "Company",
        links: [
            { label: "Contact", href: "mailto:hello@responsibly.app" },
        ],
    },
    {
        heading: "Legal",
        links: [
            { label: "Terms of Service", href: "/terms" },
            { label: "Privacy Policy", href: "/privacy" },
        ],
    },
];

export function LandingFooter() {
    return (
        <footer className="border-t border-border/50 bg-background" id="contact">
            <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Logo />
                        <p className="max-w-xs text-sm leading-7 text-muted-foreground">
                            Gamified accountability for financial agencies. Keep every advisor motivated, consistent, and performing at their best.
                        </p>
                        <a
                            href={`mailto:${contactEmail}`}
                            className="text-sm text-muted-foreground transition hover:text-foreground"
                        >
                            {contactEmail}
                        </a>
                    </div>

                    {/* Link columns */}
                    {footerLinks.map((col) => (
                        <div key={col.heading} className="space-y-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-foreground">
                                {col.heading}
                            </p>
                            <ul className="space-y-3">
                                {col.links.map((link) => (
                                    <li key={link.label}>
                                        {link.href.startsWith("/") ? (
                                            <Link
                                                href={link.href}
                                                className="text-sm text-muted-foreground transition hover:text-foreground"
                                            >
                                                {link.label}
                                            </Link>
                                        ) : (
                                            <a
                                                href={link.href}
                                                className="text-sm text-muted-foreground transition hover:text-foreground"
                                            >
                                                {link.label}
                                            </a>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 sm:flex-row">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} {appName}. Built for financial agencies who lead with accountability.
                    </p>
                    <div className="flex items-center gap-5 text-xs text-muted-foreground">
                        <Link href="/terms" className="transition hover:text-foreground">Terms</Link>
                        <Link href="/privacy" className="transition hover:text-foreground">Privacy</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
