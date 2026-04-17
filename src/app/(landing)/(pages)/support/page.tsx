import Link from "next/link";
import { contactEmail } from "../../config";

export const metadata = {
    title: "Support — Responsibly",
    description: "Get help with Responsibly. Find answers to common questions or contact our support team.",
};

const faqs = [
    {
        category: "Account",
        items: [
            {
                q: "How do I sign up?",
                a: "Visit the Responsibly homepage and click Get Started. You can sign up with your email address or using Google sign-in.",
            },
            {
                q: "How do I reset my password?",
                a: "On the sign-in page, click Forgot password and enter your email address. You'll receive a reset link within a few minutes.",
            },
            {
                q: "How do I delete my account?",
                a: "Go to Dashboard → Settings → Danger Zone, then click Delete Account. Your data will be permanently removed after a 30-day grace period.",
            },
        ],
    },
    {
        category: "Billing",
        items: [
            {
                q: "What plans does Responsibly offer?",
                a: "Responsibly offers a free Starter plan and paid plans for teams that need advanced analytics, larger seat counts, and priority support. See our Pricing section on the homepage for details.",
            },
            {
                q: "Can I cancel my subscription at any time?",
                a: "Yes. You can cancel from Dashboard → Settings at any time. Your access continues until the end of your current billing period.",
            },
        ],
    },
    {
        category: "Performance & Gamification",
        items: [
            {
                q: "How is XP calculated?",
                a: "XP rules are configured by your agency administrator. Each activity type (client call, meeting, closed deal, check-in, etc.) can be assigned a point value. Contact your administrator if you have questions about the specific rules for your agency.",
            },
            {
                q: "When does the leaderboard reset?",
                a: "Leaderboards reset on a weekly basis by default. Your administrator may configure different reset periods depending on your agency's reporting cycle.",
            },
        ],
    },
];

export default function SupportPage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
            <div className="mb-12 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Help Center</p>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Support</h1>
                <p className="text-sm leading-7 text-muted-foreground">
                    Can&apos;t find what you&apos;re looking for? Email us at{" "}
                    <a
                        href={`mailto:${contactEmail}`}
                        className="text-primary underline underline-offset-2 hover:brightness-110"
                    >
                        {contactEmail}
                    </a>{" "}
                    and we&apos;ll get back to you as soon as possible.
                </p>
            </div>

            <div className="space-y-12">
                {faqs.map((section) => (
                    <section key={section.category} className="space-y-5">
                        <h2 className="text-base font-semibold uppercase tracking-widest text-primary">
                            {section.category}
                        </h2>
                        <div className="space-y-6">
                            {section.items.map((item) => (
                                <div key={item.q} className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-2">
                                    <p className="text-sm font-semibold text-foreground">{item.q}</p>
                                    <p className="text-sm leading-7 text-muted-foreground">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <div className="mt-14 rounded-xl border border-border/60 bg-card/40 p-6 space-y-3">
                <h2 className="text-base font-semibold text-foreground">Still need help?</h2>
                <p className="text-sm leading-7 text-muted-foreground">
                    Our support team is available Monday to Friday. We aim to respond to all enquiries within one business day.
                </p>
                <a
                    href={`mailto:${contactEmail}`}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/20 transition hover:brightness-110"
                >
                    Email support
                </a>
            </div>
        </main>
    );
}
