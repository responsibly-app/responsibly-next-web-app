import { contactEmail } from "../../config";

export const metadata = {
    title: "Privacy Policy — Responsibly",
    description: "Learn how Responsibly collects, uses, and protects your data.",
};

export default function PrivacyPage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
            <div className="mb-12 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Legal</p>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
                <p className="text-sm text-muted-foreground">Last updated: April 11, 2026</p>
            </div>

            <div className="space-y-10 text-muted-foreground">

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">1. Overview</h2>
                    <p className="text-sm leading-7">
                        Responsibly (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard information when you use our platform — a gamified performance management tool built for financial agencies.
                    </p>
                    <p className="text-sm leading-7">
                        By using Responsibly, you consent to the practices described in this policy. If you do not agree, please discontinue use of the Service.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">2. Information We Collect</h2>
                    <p className="text-sm font-medium text-foreground">Account information</p>
                    <p className="text-sm leading-7">
                        When you register, we collect your name, email address, company name, and role. Agency administrators provide information about their team members when inviting them to the platform.
                    </p>
                    <p className="text-sm font-medium text-foreground">Usage and performance data</p>
                    <p className="text-sm leading-7">
                        We collect data about how you use the Service, including activities logged, XP earned, goals set and completed, check-in responses, and interaction with leaderboards and dashboards. This data is core to the platform&apos;s accountability and analytics features.
                    </p>
                    <p className="text-sm font-medium text-foreground">Technical data</p>
                    <p className="text-sm leading-7">
                        We automatically collect device type, browser, IP address, pages visited, session duration, and error logs to maintain and improve the Service.
                    </p>
                    <p className="text-sm font-medium text-foreground">Communications</p>
                    <p className="text-sm leading-7">
                        If you contact us via email or support, we retain those communications to resolve your inquiry and improve our support.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">3. How We Use Your Information</h2>
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-7">
                        <li>To provide, operate, and maintain the platform and its features</li>
                        <li>To calculate XP, streaks, leaderboard rankings, and generate analytics reports</li>
                        <li>To send transactional emails (account setup, goal reminders, achievement notifications)</li>
                        <li>To process billing and manage your subscription</li>
                        <li>To detect, prevent, and respond to security incidents or fraudulent activity</li>
                        <li>To comply with legal obligations and regulatory requirements</li>
                        <li>To improve the Service through aggregated, anonymized usage analysis</li>
                    </ul>
                    <p className="text-sm leading-7">
                        We do not sell your personal data to third parties.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">4. Data Sharing</h2>
                    <p className="text-sm leading-7">We may share data with:</p>
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-7">
                        <li>
                            <strong className="text-foreground">Service providers:</strong> Trusted vendors who help us operate the platform (hosting, payment processing, email delivery, analytics). These parties are bound by data processing agreements.
                        </li>
                        <li>
                            <strong className="text-foreground">Your agency administrator:</strong> Advisor performance data (XP, streaks, goals) is visible to managers and administrators within your organization.
                        </li>
                        <li>
                            <strong className="text-foreground">Legal authorities:</strong> Where required by law, court order, or to protect our legal rights.
                        </li>
                        <li>
                            <strong className="text-foreground">Business transfers:</strong> In the event of a merger, acquisition, or sale of assets, your data may be transferred as part of that transaction.
                        </li>
                    </ul>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">5. Data Retention</h2>
                    <p className="text-sm leading-7">
                        We retain your data for as long as your account is active or as needed to provide the Service. If you cancel your account, we retain your data for 30 days to allow for re-activation or export, after which it is deleted or anonymized. Certain data may be retained longer where required by law.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">6. Security</h2>
                    <p className="text-sm leading-7">
                        We implement industry-standard security measures including encryption in transit (TLS), encryption at rest, access controls, and regular security audits. However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security and encourage you to use strong, unique passwords.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">7. Your Rights</h2>
                    <p className="text-sm leading-7">Depending on your location, you may have the right to:</p>
                    <ul className="list-disc space-y-2 pl-5 text-sm leading-7">
                        <li>Access a copy of the personal data we hold about you</li>
                        <li>Correct inaccurate or incomplete data</li>
                        <li>Request deletion of your personal data</li>
                        <li>Object to or restrict certain processing of your data</li>
                        <li>Request portability of your data in a structured, machine-readable format</li>
                        <li>Withdraw consent where processing is based on consent</li>
                    </ul>
                    <p className="text-sm leading-7">
                        To exercise any of these rights, contact us at{" "}
                        <a href="mailto:hello@responsibly.app" className="text-primary underline underline-offset-2 hover:brightness-110">
                            hello@responsibly.app
                        </a>. We will respond within 30 days.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">8. Cookies</h2>
                    <p className="text-sm leading-7">
                        We use essential cookies to operate the Service (authentication sessions, preferences). We may use analytics cookies to understand how the platform is used. You can manage cookie preferences through your browser settings; however, disabling essential cookies will affect core functionality.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">9. Children&apos;s Privacy</h2>
                    <p className="text-sm leading-7">
                        The Service is intended for use by businesses and professionals aged 18 and over. We do not knowingly collect personal data from individuals under 18. If you believe a minor has provided us with data, contact us and we will delete it promptly.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">10. International Data Transfers</h2>
                    <p className="text-sm leading-7">
                        If you are located outside the country where our servers are hosted, your data may be transferred internationally. We ensure such transfers are protected by appropriate safeguards such as Standard Contractual Clauses (SCCs) or equivalent mechanisms as required by applicable law.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">11. Changes to This Policy</h2>
                    <p className="text-sm leading-7">
                        We may update this Privacy Policy periodically. We will notify you of material changes via email or in-app notice at least 14 days in advance. The &quot;Last updated&quot; date at the top of this page reflects the most recent revision.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">12. Contact Us</h2>
                    <p className="text-sm leading-7">
                        For privacy-related questions or to exercise your rights, contact our privacy team at{" "}
                        <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-2 hover:brightness-110">
                            {contactEmail}
                        </a>.
                    </p>
                </section>
            </div>
        </main>
    );
}
