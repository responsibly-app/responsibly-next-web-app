import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { startRoute } from "../config";

export function LandingCta() {
    return (
        <section className="relative overflow-hidden border-t border-border/50 bg-background py-24 sm:py-32">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
                <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute right-16 bottom-0 h-48 w-48 rounded-full bg-amber-400/8 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-4xl px-6 text-center lg:px-8">
                <div className="space-y-8">
                    <div className="space-y-5">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                            Get started today
                        </p>
                        <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            Ready to build a high-performance agency?
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg leading-8 text-muted-foreground">
                            Join 240+ financial agencies using Responsibly to gamify accountability, retain top advisors, and grow revenue — consistently.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                        <Link
                            href={startRoute}
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-xl shadow-primary/25 transition hover:brightness-110"
                        >
                            Start free
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <a
                            href="mailto:hello@responsibly.app"
                            className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-medium text-foreground transition hover:bg-accent"
                        >
                            Talk to sales
                        </a>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        14-day free trial · No setup fees · Cancel anytime
                    </p>
                </div>
            </div>
        </section>
    );
}
