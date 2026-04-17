import Link from "next/link";
import { contactEmail } from "../../../config";

export const metadata = {
    title: "Zoom Integration — Responsibly",
    description: "Learn how to connect your Zoom account to Responsibly to track meeting activity and power your performance dashboard.",
};

export default function ZoomIntegrationDocsPage() {
    return (
        <main className="mx-auto max-w-3xl px-6 py-16 lg:px-8">
            <div className="mb-12 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Integrations</p>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Zoom Integration</h1>
                <p className="text-sm leading-7 text-muted-foreground">
                    Connect your Zoom account to bring meeting activity into your Responsibly performance dashboard — automatically.
                </p>
            </div>

            <div className="space-y-10 text-muted-foreground">

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Overview</h2>
                    <p className="text-sm leading-7">
                        Responsibly integrates with Zoom via OAuth 2.0 to read your scheduled meeting data. Once connected, your upcoming Zoom meetings appear directly in your Responsibly dashboard, and meeting activity contributes to your XP score and consistency streak — keeping your performance picture complete without any manual logging.
                    </p>
                    <p className="text-sm leading-7">
                        The integration is read-only. Responsibly never creates, modifies, or deletes your Zoom meetings, contacts, or recordings.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">What data is accessed</h2>
                    <div className="overflow-hidden rounded-xl border border-border/60">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/60 bg-muted/30">
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-foreground">Data</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-foreground">Purpose</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-foreground">Scope</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                <tr>
                                    <td className="px-4 py-3 font-medium text-foreground">Profile (name, email, avatar)</td>
                                    <td className="px-4 py-3">Display connected account details</td>
                                    <td className="px-4 py-3 font-mono text-xs">user:read:user</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-foreground">Upcoming meetings (topic, time, duration, join URL)</td>
                                    <td className="px-4 py-3">Show meeting schedule and track activity</td>
                                    <td className="px-4 py-3 font-mono text-xs">meeting:read:meeting</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-sm leading-7">
                        Responsibly does <strong className="text-foreground">not</strong> request access to meeting recordings, chat messages, webinars, contacts, or any administrative Zoom account settings.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">How to connect</h2>
                    <ol className="space-y-3 text-sm leading-7">
                        {[
                            "Sign in to your Responsibly account.",
                            "Navigate to Dashboard → Integrations from the sidebar.",
                            "Click on the Zoom integration card.",
                            "Click Connect Zoom. You will be redirected to Zoom's authorization page.",
                            "Review the requested permissions and click Allow.",
                            "You'll be redirected back to Responsibly. Your upcoming meetings will now appear in the Zoom integration panel.",
                        ].map((step, i) => (
                            <li key={i} className="flex gap-3">
                                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                                    {i + 1}
                                </span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">How to disconnect</h2>
                    <p className="text-sm leading-7">
                        You can disconnect your Zoom account at any time from Dashboard → Integrations → Zoom by clicking Disconnect. This immediately revokes Responsibly&apos;s access to your Zoom data and removes all cached meeting information.
                    </p>
                    <p className="text-sm leading-7">
                        You can also revoke access independently from your{" "}
                        <span className="text-foreground font-medium">Zoom Marketplace</span> account under{" "}
                        <span className="text-foreground font-medium">My Apps → Installed Apps</span>.
                    </p>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Data handling & retention</h2>
                    <p className="text-sm leading-7">
                        Meeting data fetched from Zoom is used solely to display your schedule and calculate performance metrics within Responsibly. We do not sell or share your Zoom data with third parties. Access tokens are stored encrypted in our database and are used only to make authorised requests on your behalf.
                    </p>
                    <p className="text-sm leading-7">
                        When you disconnect Zoom, all stored tokens and cached meeting data are deleted immediately. For full details, see our{" "}
                        <Link href="/privacy" className="text-primary underline underline-offset-2 hover:brightness-110">
                            Privacy Policy
                        </Link>.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-lg font-semibold text-foreground">Troubleshooting</h2>
                    <div className="space-y-4">
                        {[
                            {
                                q: "My meetings are not showing up",
                                a: "Ensure your Zoom account is still connected under Dashboard → Integrations. If it shows as connected but no meetings appear, disconnect and reconnect. Also confirm the meetings are Zoom-hosted meetings (not just calendar events) and are scheduled in the future.",
                            },
                            {
                                q: "I see an authorisation error when connecting",
                                a: "Make sure you are signed in to the Zoom account you want to connect before clicking Connect Zoom. If the error persists, try signing out of Zoom in your browser, signing back in, and then reconnecting.",
                            },
                            {
                                q: "The integration says Connected but I cannot see my profile",
                                a: "Your Zoom profile photo may be a private account setting. The name and email should still display. If you see neither, disconnect and reconnect to refresh your profile data.",
                            },
                        ].map((item) => (
                            <div key={item.q} className="rounded-xl border border-border/60 bg-card/40 p-5 space-y-2">
                                <p className="text-sm font-semibold text-foreground">{item.q}</p>
                                <p className="text-sm leading-7">{item.a}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-3">
                    <h2 className="text-lg font-semibold text-foreground">Contact & support</h2>
                    <p className="text-sm leading-7">
                        For questions about the Zoom integration or to report an issue, contact us at{" "}
                        <a href={`mailto:${contactEmail}`} className="text-primary underline underline-offset-2 hover:brightness-110">
                            {contactEmail}
                        </a>{" "}
                        or visit our{" "}
                        <Link href="/support" className="text-primary underline underline-offset-2 hover:brightness-110">
                            Support page
                        </Link>.
                    </p>
                </section>

            </div>
        </main>
    );
}
