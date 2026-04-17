import Link from "next/link";
import BackButton from "../_components/back-button";
import { Logo } from "../_components/logo";
import { appName } from "../config";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border/50 bg-background/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 lg:px-8">
                    <Logo />
                    <BackButton />
                </div>
            </header>

            {children}

            <footer className="border-t border-border/50 bg-background py-8 text-center text-xs text-muted-foreground">
                © {new Date().getFullYear()} {appName} ·{" "}
                <Link href="/terms" className="hover:text-foreground transition">Terms of Service</Link>
                {" "}·{" "}
                <Link href="/privacy" className="hover:text-foreground transition">Privacy Policy</Link>
                {" "}·{" "}
                <BackButton />
            </footer>
        </div>
    );
}
