"use client";

import { Assistant } from "@/components/assistant-ui/modules/assistant";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Home() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") === "thread_not_found") {
      toast.error("Chat not found.");
      window.history.replaceState(null, "", "/chat");
    }
  }, [searchParams]);

  return <Assistant />;
}
