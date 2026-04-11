"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { LandingThemeSwitch } from "./landing-theme-toggle";
import { appName, signInRoute, startRoute } from "../config";

const navLinks = [
    { href: "#how-it-works", label: "How it works" },
    { href: "#features", label: "Features" },
    { href: "#pricing", label: "Pricing" },
];

export function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            <div className="px-4 pt-4 transition-all duration-300">
                <div
                    className={`mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 rounded-full border transition-all duration-500 ${scrolled
                            ? "bg-background/85 backdrop-blur-2xl border-border/50 shadow-md"
                            : "bg-background/30 backdrop-blur-xl border-white/10 shadow-sm shadow-slate-900/5"
                        }`}
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/logo.png"
                            alt={appName}
                            width={32}
                            height={32}
                            className="rounded-lg"
                        />
                        <span className="text-base font-bold tracking-tight text-foreground">
                            {appName}
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent"
                            >
                                {link.label}
                            </a>
                        ))}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-2">
                        <LandingThemeSwitch />
                        <Link
                            href={signInRoute}
                            className="hidden sm:inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-accent"
                        >
                            Sign in
                        </Link>
                        <Link
                            href={startRoute}
                            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-110 hover:shadow-primary/30"
                        >
                            Get started
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMobileOpen((v) => !v)}
                            className="md:hidden rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-accent transition"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden mx-4 mt-1 rounded-2xl border border-white/10 bg-card/95 backdrop-blur-xl shadow-xl overflow-hidden">
                    <nav className="flex flex-col p-3 gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition"
                            >
                                {link.label}
                            </a>
                        ))}
                        <div className="mt-2 border-t border-border/50 pt-2">
                            <Link
                                href={signInRoute}
                                className="block rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition"
                                onClick={() => setMobileOpen(false)}
                            >
                                Sign in
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
