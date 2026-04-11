const stats = [
    { value: "240+", label: "Agencies onboarded", sub: "across North America & Europe" },
    { value: "18k+", label: "Advisors motivated", sub: "earning XP every day" },
    { value: "94%", label: "Goal consistency rate", sub: "vs. 61% industry average" },
    { value: "3.2×", label: "Performance lift", sub: "average in first 90 days" },
];

export function LandingStats() {
    return (
        <section className="relative border-t border-border/50 bg-background py-16 sm:py-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(96,165,250,0.05),transparent)]" />

            <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="text-center space-y-1.5">
                            <p className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
                                {stat.value}
                            </p>
                            <p className="text-sm font-semibold text-foreground">{stat.label}</p>
                            <p className="text-xs text-muted-foreground">{stat.sub}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
