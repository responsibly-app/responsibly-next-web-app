import { BarChart3, Flame, Shield, Target, Trophy, Zap } from "lucide-react";

const features = [
    {
        icon: Trophy,
        title: "Live Leaderboards",
        description:
            "Real-time agent rankings with weekly resets, milestone celebrations, and team-wide visibility that drive healthy, motivating competition.",
        iconColor: "text-amber-400",
        iconBg: "bg-amber-400/10",
        glow: "group-hover:bg-amber-400/5",
    },
    {
        icon: Zap,
        title: "XP & Points Engine",
        description:
            "Every client call, meeting, and closed deal earns XP. Fully customizable point rules align daily agent activity with your agency's real goals.",
        iconColor: "text-primary",
        iconBg: "bg-primary/10",
        glow: "group-hover:bg-primary/5",
    },
    {
        icon: Flame,
        title: "Consistency Streaks",
        description:
            "Visual streak counters build daily habits that stick. Agents track their momentum and managers instantly spot who's consistent — and who needs support.",
        iconColor: "text-orange-400",
        iconBg: "bg-orange-400/10",
        glow: "group-hover:bg-orange-400/5",
    },
    {
        icon: Target,
        title: "Goal & KPI Tracking",
        description:
            "Set individual and team targets per cycle. Track revenue goals, client touchpoints, and pipeline milestones against actuals in real-time.",
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-400/10",
        glow: "group-hover:bg-emerald-400/5",
    },
    {
        icon: BarChart3,
        title: "Agency Analytics",
        description:
            "Comprehensive dashboards surface performance trends, pipeline health, and underperforming agents so leadership always knows where to act.",
        iconColor: "text-blue-400",
        iconBg: "bg-blue-400/10",
        glow: "group-hover:bg-blue-400/5",
    },
    {
        icon: Shield,
        title: "Accountability Framework",
        description:
            "Structured check-ins, private manager notes, and escalation flows ensure no advisor falls behind and no compliance risk goes unnoticed.",
        iconColor: "text-purple-400",
        iconBg: "bg-purple-400/10",
        glow: "group-hover:bg-purple-400/5",
    },
];

export function LandingFeatures() {
    return (
        <section
            className="relative overflow-hidden border-t border-border/50 bg-background py-24 sm:py-32"
            id="features"
        >
            {/* Background glows */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-primary/8 blur-3xl" />
                <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-amber-500/8 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                {/* Header */}
                <div className="mx-auto max-w-2xl space-y-4 text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        Built for financial agencies
                    </p>
                    <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Everything your agency needs to perform at its peak.
                    </h2>
                    <p className="text-base leading-8 text-muted-foreground sm:text-lg">
                        From gamified motivation to deep compliance-ready analytics — Responsibly gives agency leaders the tools that actually move the needle.
                    </p>
                </div>

                {/* Feature grid */}
                <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/40 p-7 transition duration-300 hover:-translate-y-1 hover:border-border hover:bg-card/70 hover:shadow-xl hover:shadow-slate-950/5"
                        >
                            <div className={`absolute inset-0 ${feature.glow} transition duration-300`} />
                            <div className="relative">
                                <div
                                    className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl ${feature.iconBg} transition duration-300`}
                                >
                                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                                </div>
                                <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
