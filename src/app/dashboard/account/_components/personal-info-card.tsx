"use client";

import { useEffect, useState } from "react";
import { PencilIcon, SaveIcon, UserIcon, XIcon } from "lucide-react";
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

function PersonalInfoCardSkeleton() {
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
        <div className="grid gap-6">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export function PersonalInfoCard() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;

  const [isEditingName, setIsEditingName] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    setFullName(user?.name ?? "");
  }, [user]);

  const updateUser = useUpdateUser();
  const isNameDirty = fullName.trim() !== (user?.name ?? "");

  if (isPending) return <PersonalInfoCardSkeleton />;

  function refetchSession() {
    refetch({ query: { disableCookieCache: true } });
  }

  function handleCancelName() {
    setFullName(user?.name ?? "");
    setIsEditingName(false);
  }

  function handleSaveName() {
    updateUser.mutate(
      { name: fullName.trim() },
      {
        onSuccess: () => {
          refetchSession();
          setIsEditingName(false);
          toast.success("Name updated.");
        },
        onError: (err: { message?: string }) => {
          toast.error(err?.message ?? "Failed to update name.");
        },
      },
    );
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-9 items-center justify-center rounded-xl">
            <UserIcon className="text-primary size-4" />
          </div>
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your display name.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" value={user?.email ?? ""} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <div className="flex gap-2">
              <Input
                id="fullName"
                placeholder="Add your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                readOnly={!isEditingName}
                className={!isEditingName ? "bg-muted/50 cursor-default" : ""}
              />
              {!isEditingName ? (
                <Button variant="outline" size="icon" onClick={() => setIsEditingName(true)} aria-label="Edit name">
                  <PencilIcon className="size-4" />
                </Button>
              ) : (
                <Button variant="outline" size="icon" onClick={handleCancelName} aria-label="Cancel">
                  <XIcon className="size-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      {isEditingName && (
        <div className="flex justify-end border-t px-6 pt-4 pb-6">
          <Button onClick={handleSaveName} disabled={updateUser.isPending || !isNameDirty || !fullName.trim()} size="sm">
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
