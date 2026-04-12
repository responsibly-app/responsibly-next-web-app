import Link from "next/link";
import { appName } from "../config";

export function Logo() {
    return (
        <Link href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src="/logo.png"
                alt={appName}
                width={32}
                height={32}
                className="rounded-lg"
            />
            <span className="text-base font-bold tracking-tight text-foreground">
                {appName}
            </span>
        </Link>
    );
}
