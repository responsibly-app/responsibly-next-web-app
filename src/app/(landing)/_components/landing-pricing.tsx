import { Check } from "lucide-react";
import { contactEmail, startRoute } from "../config";

const plans = [
    {
        name: "Starter",
        price: "Free",
        period: null,
        description: "For small agencies getting started with gamified accountability.",
        features: [
            "Up to 5 advisors",
            "Core leaderboards & XP",
            "Goal tracking",
            "Weekly performance reports",
            "Email support",
        ],
        cta: "Get started free",
        featured: false,
    },
    {
        name: "Agency",
        price: "$49",
        period: "/month",
        badge: "Most popular",
        description: "For growing agencies serious about advisor performance and retention.",
        features: [
            "Up to 25 advisors",
            "Custom point rules & KPIs",
            "Achievement badges system",
            "Full analytics dashboard",
            "Manager accountability tools",
            "Data export & API access",
            "Priority support",
        ],
        cta: "Start Agency plan",
        featured: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: null,
        description: "For large organizations with compliance, security, and scale requirements.",
        features: [
            "Unlimited advisors",
            "SSO & advanced permissions",
            "Compliance-ready audit logs",
            "Dedicated onboarding",
            "Custom integrations",
            "SLA & dedicated support",
        ],
        cta: "Contact sales",
        featured: false,
    },
];

export function LandingPricing() {
    return (
        <section
            className="relative overflow-hidden border-t border-border/50 bg-background py-24 sm:py-32"
            id="pricing"
        >
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-56 w-125 -translate-x-1/2 rounded-full bg-primary/6 blur-3xl" />
                <div className="absolute right-0 bottom-16 h-56 w-56 rounded-full bg-amber-500/6 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl space-y-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        Pricing
                    </p>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Pricing that scales with your team.
                    </h2>
                    <p className="text-base leading-8 text-muted-foreground sm:text-lg">
                        Start free and grow into enterprise-grade tools when your agency is ready. No hidden fees.
                    </p>
                </div>

                {/* Plans */}
                <div className="mt-14 grid gap-6 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative flex flex-col overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 ${plan.featured
                                    ? "border-primary/40 bg-primary shadow-2xl shadow-primary/20"
                                    : "border-border/60 bg-card/40 hover:border-border hover:shadow-xl hover:shadow-slate-950/5"
                                }`}
                        >
                            <div className="flex flex-col flex-1 p-8">
                                {/* Badge */}
                                {plan.badge && (
                                    <span className="mb-5 inline-flex w-fit rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-white">
                                        {plan.badge}
                                    </span>
                                )}

                                {/* Plan name & price */}
                                <div className="mb-6 space-y-2">
                                    <p className={`text-sm font-semibold tracking-tight ${plan.featured ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                                        {plan.name}
                                    </p>
                                    <div className="flex items-end gap-1">
                                        <span className={`text-4xl font-black tracking-tight ${plan.featured ? "text-primary-foreground" : "text-foreground"}`}>
                                            {plan.price}
                                        </span>
                                        {plan.period && (
                                            <span className={`mb-1 text-sm ${plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                                {plan.period}
                                            </span>
                                        )}
                                    </div>
                                    <p className={`text-sm leading-6 ${plan.featured ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                        {plan.description}
                                    </p>
                                </div>

                                {/* Features */}
                                <ul className="flex-1 space-y-3">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3">
                                            <span
                                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${plan.featured
                                                        ? "bg-white/20 text-white"
                                                        : "bg-primary/15 text-primary"
                                                    }`}
                                            >
                                                <Check className="h-3 w-3" />
                                            </span>
                                            <span className={`text-sm ${plan.featured ? "text-primary-foreground/85" : "text-muted-foreground"}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA */}
                                <a
                                    href={plan.name === "Enterprise" ? `mailto:${contactEmail}` : startRoute}
                                    className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${plan.featured
                                            ? "bg-white text-primary hover:bg-white/90"
                                            : "bg-primary text-primary-foreground hover:brightness-110 shadow-md shadow-primary/20"
                                        }`}
                                >
                                    {plan.cta}
                                </a>
                            </div>
                        </div>
                    ))}
                </div>

                <p className="mt-10 text-center text-sm text-muted-foreground">
                    All plans include a 14-day free trial. No credit card required to start.
                </p>
            </div>
        </section>
    );
}
