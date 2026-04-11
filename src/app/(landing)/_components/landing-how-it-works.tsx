import { Settings, TrendingUp, Users } from "lucide-react";

const steps = [
    {
        step: "01",
        icon: Users,
        title: "Onboard your agency",
        description:
            "Invite your advisors, configure KPI templates, and set up your point-scoring rules in minutes. No technical setup required — your team is ready to go same day.",
        highlight: "Same-day setup",
    },
    {
        step: "02",
        icon: Settings,
        title: "Agents earn points daily",
        description:
            "Every completed activity — client calls, meetings, deal closes, check-ins — automatically logs XP. Streaks build, badges unlock, and momentum becomes visible.",
        highlight: "Automated tracking",
    },
    {
        step: "03",
        icon: TrendingUp,
        title: "Track, compete, and improve",
        description:
            "Leaderboards surface your top performers. Analytics flag who needs coaching. Structured check-ins keep everyone accountable — and your pipeline healthy.",
        highlight: "Data-driven growth",
    },
];

export function LandingHowItWorks() {
    return (
        <section
            className="relative overflow-hidden border-t border-border/50 bg-background py-24 sm:py-32"
            id="how-it-works"
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
            <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-150 -translate-x-1/2 rounded-full bg-primary/6 blur-3xl" />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl space-y-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        How it works
                    </p>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        From setup to peak performance in three steps.
                    </h2>
                    <p className="text-base leading-8 text-muted-foreground sm:text-lg">
                        Responsibly is designed to be running from day one — no long onboarding, no complex integrations.
                    </p>
                </div>

                {/* Steps */}
                <div className="mt-16 grid gap-8 md:grid-cols-3">
                    {steps.map((step, i) => (
                        <div key={step.step} className="relative flex flex-col">
                            {/* Connector line */}
                            {i < steps.length - 1 && (
                                <div className="absolute left-[calc(50%+60px)] top-10 hidden h-px w-[calc(100%+2rem)] bg-linear-to-r from-border to-transparent md:block" />
                            )}

                            <div className="relative rounded-2xl border border-border/60 bg-card/40 p-7 transition hover:border-border hover:bg-card/70">
                                {/* Step number */}
                                <div className="mb-5 flex items-center justify-between">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                                        <step.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <span className="text-4xl font-black text-muted/40 tabular-nums select-none">
                                        {step.step}
                                    </span>
                                </div>

                                <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">{step.description}</p>

                                <div className="mt-5 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                    {step.highlight}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
