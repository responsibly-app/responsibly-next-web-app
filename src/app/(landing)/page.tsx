import { LandingCta } from "./_components/landing-cta";
import { LandingFeatures } from "./_components/landing-features";
import { LandingFooter } from "./_components/landing-footer";
import { LandingHero } from "./_components/landing-hero";
import { LandingHowItWorks } from "./_components/landing-how-it-works";
import { LandingNavbar } from "./_components/landing-navbar";
import { LandingPricing } from "./_components/landing-pricing";
import { LandingStats } from "./_components/landing-stats";
import { ScrollToTop } from "./_components/scroll-to-top";

export default function Page() {
    return (
        <main className="bg-background text-foreground scroll-smooth">
            <LandingNavbar />
            <LandingHero />
            <LandingStats />
            <LandingHowItWorks />
            <LandingFeatures />
            <LandingPricing />
            <LandingCta />
            <LandingFooter />
            <ScrollToTop />
        </main>
    );
}
