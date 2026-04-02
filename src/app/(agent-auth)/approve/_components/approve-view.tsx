"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { routes } from "@/routes";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type PendingApproval = {
  approval_id: string;
  agent_id: string | null;
  agent_name: string | null;
  capabilities: string[];
  capability_reasons: Record<string, string> | null;
  binding_message: string | null;
  expires_in: number;
  created_at: string;
};

export function ApproveView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userCode = searchParams.get("user_code") ?? searchParams.get("code");
  const agentId = searchParams.get("agent_id");

  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionPending, setActionPending] = useState<string | null>(null);
  const [done, setDone] = useState<{
    action: "approved" | "denied";
    agentName: string | null;
  } | null>(null);

  useEffect(() => {
    async function load() {
      const session = await authClient.getSession();
      if (!session.data) {
        const params = new URLSearchParams();
        if (userCode) params.set("user_code", userCode);
        if (agentId) params.set("agent_id", agentId);
        const callbackUrl = `/approve${params.size ? `?${params}` : ""}`;
        router.replace(
          `${routes.auth.signIn()}?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        );
        return;
      }

      // For device_authorization flow the approval record has no userId set,
      // so the built-in ciba/pending endpoint (which filters by userId) returns
      // nothing. Use our custom route when agent_id is present; fall back to
      // ciba/pending for CIBA-only flows.
      const pendingUrl = agentId
        ? new URL("/api/agent/device-pending", window.location.origin)
        : new URL("/api/auth/agent/ciba/pending", window.location.origin);

      if (userCode) pendingUrl.searchParams.set("user_code", userCode);
      if (agentId) pendingUrl.searchParams.set("agent_id", agentId);

      const res = await fetch(pendingUrl.toString(), {
        credentials: "include",
      });

      if (!res.ok) {
        setError("Failed to load pending approvals.");
        setLoading(false);
        return;
      }

      const data: { requests: PendingApproval[] } = await res.json();
      setApprovals(data.requests ?? []);
      setLoading(false);
    }

    load();
  }, [router, userCode, agentId]);

  async function handleAction(
    approval: PendingApproval,
    action: "approve" | "deny",
  ) {
    setActionPending(approval.approval_id);
    setError(null);

    const body: Record<string, unknown> = { action };
    if (approval.agent_id) body.agent_id = approval.agent_id;
    if (userCode) body.user_code = userCode;

    const res = await fetch("/api/auth/agent/approve-capability", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      setError(err?.message ?? "Action failed. Please try again.");
      setActionPending(null);
      return;
    }

    setDone({
      action: action === "approve" ? "approved" : "denied",
      agentName: approval.agent_name,
    });
    setActionPending(null);
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (done) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-lg">
            {done.action === "approved" ? "Access Approved" : "Access Denied"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center text-sm">
          {done.action === "approved"
            ? `You approved access for ${done.agentName ?? "the agent"}. You can close this window.`
            : `You denied access for ${done.agentName ?? "the agent"}. You can close this window.`}
        </CardContent>
      </Card>
    );
  }

  if (approvals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-lg">
            No Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-center text-sm">
          There are no pending agent authorization requests.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {approvals.map((approval) => (
        <Card key={approval.approval_id}>
          <CardHeader>
            <CardTitle className="text-lg">
              {approval.agent_name ?? "Unknown Agent"} is requesting access
            </CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-3">
            {approval.binding_message && (
              <p className="text-muted-foreground text-sm">
                {approval.binding_message}
              </p>
            )}

            {approval.capabilities.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-1 text-sm font-medium">
                  Capabilities requested:
                </p>
                <ul className="list-inside list-disc space-y-0.5">
                  {approval.capabilities.map((cap) => (
                    <li key={cap} className="text-sm">
                      {cap}
                      {approval.capability_reasons?.[cap] && (
                        <span className="text-muted-foreground ml-1 text-xs">
                          — {approval.capability_reasons[cap]}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-muted-foreground text-xs">
              Expires in {Math.floor(approval.expires_in / 60)} min
            </p>

            {error && <p className="text-destructive text-sm">{error}</p>}
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => handleAction(approval, "approve")}
              disabled={!!actionPending}
            >
              {actionPending === approval.approval_id && <Spinner />}
              Approve
            </Button>
            <Button
              className="flex-1"
              variant="outline"
              onClick={() => handleAction(approval, "deny")}
              disabled={!!actionPending}
            >
              Deny
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
