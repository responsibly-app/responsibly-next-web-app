import Link from "next/link";
import { Zap } from "lucide-react";
import BackButton from "../_components/back-button";

export const metadata = {
    title: "Terms of Service — Responsibly",
    description: "Read the Terms of Service for Responsibly, the gamified accountability platform for financial agencies.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Simple header */}
            <header className="border-b border-border/50 bg-background/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 lg:px-8">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-md shadow-primary/30">
                            <Zap className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="text-base font-bold tracking-tight text-foreground">Responsibly</span>
                    </Link>
                    <BackButton />
                </div>
            </header>

            {/* Content */}
            <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
                <div className="mb-12 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">Terms of Service</h1>
                    <p className="text-sm text-muted-foreground">Last updated: April 11, 2026</p>
                </div>

                <div className="prose prose-neutral dark:prose-invert max-w-none space-y-10 text-muted-foreground">

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">1. Acceptance of Terms</h2>
                        <p className="text-sm leading-7">
                            By accessing or using Responsibly (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not use the Service. These Terms apply to all users, including agency administrators, financial advisors, and any other individuals accessing the platform.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">2. Description of Service</h2>
                        <p className="text-sm leading-7">
                            Responsibly is a performance management platform designed for financial agencies. The Service provides tools for gamified accountability, KPI tracking, leaderboards, goal management, and team analytics. Features include but are not limited to XP systems, achievement badges, streak tracking, and advisor performance dashboards.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">3. Account Registration</h2>
                        <p className="text-sm leading-7">
                            To use the Service, you must create an account and provide accurate, complete information. You are responsible for maintaining the security of your account credentials and for all activity that occurs under your account. You must notify us immediately at hello@responsibly.app if you suspect any unauthorized access.
                        </p>
                        <p className="text-sm leading-7">
                            Agency administrators are responsible for managing access permissions for their team members and ensuring that all invited users comply with these Terms.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">4. Acceptable Use</h2>
                        <p className="text-sm leading-7">You agree not to:</p>
                        <ul className="list-disc space-y-2 pl-5 text-sm leading-7">
                            <li>Use the Service for any unlawful purpose or in violation of applicable financial regulations</li>
                            <li>Attempt to gain unauthorized access to any part of the platform or other users' accounts</li>
                            <li>Upload or transmit malicious code, viruses, or any software designed to disrupt the Service</li>
                            <li>Scrape, harvest, or collect data from the platform without written permission</li>
                            <li>Misrepresent your identity or affiliation when using the Service</li>
                            <li>Use the Service to harass, intimidate, or discriminate against employees or advisors</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">5. Subscription and Billing</h2>
                        <p className="text-sm leading-7">
                            Responsibly offers a free Starter plan and paid subscription plans. Paid plans are billed monthly or annually as selected at checkout. All fees are non-refundable except as required by law or expressly stated in our refund policy.
                        </p>
                        <p className="text-sm leading-7">
                            We reserve the right to change pricing with 30 days&apos; written notice to existing subscribers. Continued use after a price change constitutes acceptance of the new pricing.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">6. Data and Privacy</h2>
                        <p className="text-sm leading-7">
                            Your use of the Service is also governed by our <Link href="/privacy" className="text-primary underline underline-offset-2 hover:brightness-110">Privacy Policy</Link>, which is incorporated into these Terms by reference. You are responsible for ensuring that your use of employee and advisor data within Responsibly complies with applicable privacy laws, including GDPR, CCPA, and any relevant financial industry regulations.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">7. Intellectual Property</h2>
                        <p className="text-sm leading-7">
                            The Service and all related content, features, and functionality — including but not limited to the software, UI design, logos, and documentation — are owned by Responsibly and protected by intellectual property laws. You may not copy, modify, distribute, or create derivative works without our prior written consent.
                        </p>
                        <p className="text-sm leading-7">
                            You retain ownership of all data you upload to the platform. By using the Service, you grant Responsibly a limited license to process your data solely to provide and improve the Service.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">8. Termination</h2>
                        <p className="text-sm leading-7">
                            You may cancel your account at any time. We reserve the right to suspend or terminate your access for violation of these Terms, non-payment, or any conduct we determine to be harmful to other users or the platform, with or without prior notice.
                        </p>
                        <p className="text-sm leading-7">
                            Upon termination, your right to access the Service ends immediately. You may request an export of your data within 30 days of cancellation.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">9. Limitation of Liability</h2>
                        <p className="text-sm leading-7">
                            To the maximum extent permitted by law, Responsibly shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including loss of revenue, data, or business opportunities — arising from your use of the Service, even if we have been advised of the possibility of such damages.
                        </p>
                        <p className="text-sm leading-7">
                            Our total liability to you for any claims arising from use of the Service shall not exceed the amount you paid us in the 12 months preceding the claim.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">10. Disclaimer of Warranties</h2>
                        <p className="text-sm leading-7">
                            The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, express or implied. We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components. Financial outcomes are not guaranteed by use of the platform.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">11. Governing Law</h2>
                        <p className="text-sm leading-7">
                            These Terms are governed by the laws of the jurisdiction in which Responsibly is incorporated, without regard to conflict-of-law provisions. Any disputes shall be resolved through binding arbitration, except where prohibited by law.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">12. Changes to These Terms</h2>
                        <p className="text-sm leading-7">
                            We may update these Terms from time to time. We will notify you of material changes via email or an in-app notice at least 14 days before they take effect. Continued use of the Service after that date constitutes acceptance of the updated Terms.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-lg font-semibold text-foreground">13. Contact</h2>
                        <p className="text-sm leading-7">
                            For questions about these Terms, contact us at{" "}
                            <a href="mailto:hello@responsibly.app" className="text-primary underline underline-offset-2 hover:brightness-110">
                                hello@responsibly.app
                            </a>.
                        </p>
                    </section>
                </div>
            </main>

            <footer className="border-t border-border/50 bg-background py-8 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} Responsibly ·{" "}
                <Link href="/privacy" className="hover:text-foreground transition">Privacy Policy</Link>
                {" "}·{" "}
                <BackButton />
            </footer>
        </div>
    );
}
