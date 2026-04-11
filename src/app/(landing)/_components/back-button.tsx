"use client";

import { useRouter } from "next/navigation";

export default function BackButton() {
    const router = useRouter();
    return (
        <button
            onClick={() => router.back()}
            className="text-sm text-muted-foreground transition hover:text-foreground"
        >
            ← Back
        </button>
    );
}
