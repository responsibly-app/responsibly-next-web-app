import Link from "next/link";
import { ArrowRight, Flame, Zap } from "lucide-react";
import { startRoute } from "../config";

const leaderboard = [
    { rank: 1, name: "Sarah Chen", xp: 1240, streak: 14, badge: "🥇", bar: "82%" },
    { rank: 2, name: "Marcus Reid", xp: 1180, streak: 8, badge: "🥈", bar: "75%" },
    { rank: 3, name: "Priya Nair", xp: 1020, streak: 21, badge: "🥉", bar: "65%" },
];

export function LandingHero() {
    return (
        <section className="relative overflow-hidden bg-background pt-32 pb-20 sm:pt-40 sm:pb-28">
            {/* Background */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-x-0 -top-24 h-160 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(96,165,250,0.15),transparent)]" />
                <div className="absolute right-0 top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute left-16 bottom-16 h-56 w-56 rounded-full bg-amber-500/8 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                    {/* Left */}
                    <div className="space-y-8">
                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                            <Zap className="h-3 w-3" />
                            Financial Agency Management
                        </span>

                        <div className="space-y-5">
                            <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-foreground sm:text-6xl leading-[1.08]">
                                Turn accountability into your agency&apos;s biggest{" "}
                                <span className="bg-linear-to-r from-primary via-blue-400 to-primary bg-clip-text text-transparent">
                                    competitive edge.
                                </span>
                            </h1>
                            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
                                Responsibly helps financial agencies drive consistent advisor performance through gamified accountability — so every agent stays motivated, on-track, and closing results.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href={startRoute}
                                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:brightness-110"
                            >
                                Start for free
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <a
                                href="#how-it-works"
                                className="inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-6 py-3 text-sm font-medium text-foreground transition hover:bg-accent"
                            >
                                See how it works
                            </a>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                            {["No credit card required", "Setup in 5 minutes", "Cancel anytime"].map((item) => (
                                <div key={item} className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500 text-[10px] font-bold">
                                        ✓
                                    </span>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Dashboard mock */}
                    <div className="relative">
                        {/* Floating achievement badge */}
                        <div className="absolute -top-5 -right-2 z-10 rounded-2xl border border-white/10 bg-card/95 backdrop-blur-xl px-4 py-3 shadow-xl">
                            <div className="flex items-center gap-2.5">
                                <span className="text-xl">🏆</span>
                                <div>
                                    <p className="text-xs font-semibold text-foreground leading-tight">Achievement Unlocked</p>
                                    <p className="text-[11px] text-muted-foreground">Deal Closer · 10 deals this month</p>
                                </div>
                            </div>
                        </div>

                        {/* Main card */}
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-card/50 p-1 shadow-2xl shadow-primary/10 backdrop-blur-xl">
                            <div className="rounded-xl border border-white/5 bg-background/80 p-5 space-y-4">
                                {/* Header */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Leaderboard</p>
                                        <p className="text-sm font-semibold text-foreground mt-0.5">Top performers · This week</p>
                                    </div>
                                    <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-500">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        Live
                                    </span>
                                </div>

                                {/* Agent rows */}
                                <div className="space-y-2">
                                    {leaderboard.map((agent) => (
                                        <div
                                            key={agent.rank}
                                            className={`flex items-center gap-3 rounded-xl px-3.5 py-3 transition ${
                                                agent.rank === 1
                                                    ? "border border-primary/20 bg-primary/8"
                                                    : "bg-white/5"
                                            }`}
                                        >
                                            <span className="text-lg leading-none">{agent.badge}</span>
                                            <div className="flex-1 min-w-0 space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-foreground truncate">{agent.name}</span>
                                                    <span className="ml-2 shrink-0 text-xs font-bold text-primary">
                                                        {agent.xp.toLocaleString()} XP
                                                    </span>
                                                </div>
                                                <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                                                    <div
                                                        className="h-full rounded-full bg-linear-to-r from-primary to-blue-400"
                                                        style={{ width: agent.bar }}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0 text-orange-400">
                                                <Flame className="h-3.5 w-3.5" />
                                                <span className="text-xs font-semibold">{agent.streak}d</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Stats row */}
                                <div className="grid grid-cols-3 gap-2.5 pt-1">
                                    <div className="rounded-xl border border-white/8 bg-white/5 p-3 text-center">
                                        <p className="text-[10px] text-muted-foreground">Team XP</p>
                                        <p className="mt-1 text-base font-bold text-foreground">4,240</p>
                                    </div>
                                    <div className="rounded-xl border border-white/8 bg-white/5 p-3 text-center">
                                        <p className="text-[10px] text-muted-foreground">Goals Met</p>
                                        <p className="mt-1 text-base font-bold text-emerald-500">94%</p>
                                    </div>
                                    <div className="rounded-xl border border-white/8 bg-white/5 p-3 text-center">
                                        <p className="text-[10px] text-muted-foreground">Badges</p>
                                        <p className="mt-1 text-base font-bold text-amber-400">12 🏅</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating XP card */}
                        <div className="absolute -bottom-5 -left-4 rounded-2xl border border-white/10 bg-card/95 backdrop-blur-xl px-4 py-3 shadow-xl">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-base">⚡</div>
                                <div>
                                    <p className="text-[11px] text-muted-foreground">Marcus just earned</p>
                                    <p className="text-sm font-bold text-foreground">+50 XP · Client meeting</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
