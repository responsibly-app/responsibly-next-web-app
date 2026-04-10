"use client";

import { useEffect, useState } from "react";
import { BotIcon, PencilIcon, SaveIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { useUpdateUser } from "@/lib/auth/hooks";

function AgentInfoCardSkeleton() {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <Skeleton className="size-9 rounded-xl" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-52" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-9 w-full" />
      </CardContent>
    </Card>
  );
}

export function AgentInfoCard() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;

  const [isEditing, setIsEditing] = useState(false);
  const [agentCode, setAgentCode] = useState("");

  useEffect(() => {
    setAgentCode((user as { agentCode?: string } | undefined)?.agentCode ?? "");
  }, [user]);

  const updateUser = useUpdateUser();
  const isDirty = agentCode.trim() !== ((user as { agentCode?: string } | undefined)?.agentCode ?? "");

  if (isPending) return <AgentInfoCardSkeleton />;

  function refetchSession() {
    refetch({ query: { disableCookieCache: true } });
  }

  function handleCancel() {
    setAgentCode((user as { agentCode?: string } | undefined)?.agentCode ?? "");
    setIsEditing(false);
  }

  function handleSave() {
    updateUser.mutate(
      { agentCode: agentCode.trim() || undefined },
      {
        onSuccess: () => {
          refetchSession();
          setIsEditing(false);
          toast.success("Agent code updated.");
        },
        onError: (err: { message?: string }) => {
          toast.error(err?.message ?? "Failed to update agent code.");
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-9 items-center justify-center rounded-xl">
            <BotIcon className="text-primary size-4" />
          </div>
          <div>
            <CardTitle>Agent Information</CardTitle>
            <CardDescription>Manage your agent code for integrations.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-2">
          <Label htmlFor="agentCode">Agent code</Label>
          <div className="flex gap-2">
            <Input
              id="agentCode"
              placeholder="Enter your agent code"
              value={agentCode}
              onChange={(e) => setAgentCode(e.target.value)}
              readOnly={!isEditing}
              className={!isEditing ? "bg-muted/50 cursor-default" : ""}
            />
            {!isEditing ? (
              <Button variant="outline" size="icon" onClick={() => setIsEditing(true)} aria-label="Edit agent code">
                <PencilIcon className="size-4" />
              </Button>
            ) : (
              <Button variant="outline" size="icon" onClick={handleCancel} aria-label="Cancel">
                <XIcon className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      {isEditing && (
        <div className="flex justify-end border-t px-6 pt-4 pb-6">
          <Button onClick={handleSave} disabled={updateUser.isPending || !isDirty} size="sm">
            {updateUser.isPending ? (
              <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
            ) : (
              <SaveIcon className="mr-1.5 size-3.5" data-icon="inline-start" />
            )}
            Save changes
          </Button>
        </div>
      )}
    </Card>
  );
}
