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
import { useUpdateUser } from "@/lib/auth/use-auth";

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
      <CardContent className="pt-6">
        <div className="grid gap-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex gap-2">
            <Skeleton className="h-9 flex-1" />
            <Skeleton className="size-9 shrink-0 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PersonalInfoCard() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    setFullName(user?.name ?? "");
  }, [user?.name]);

  const updateUser = useUpdateUser();
  const isDirty = fullName.trim() !== (user?.name ?? "");

  if (isPending) return <PersonalInfoCardSkeleton />;

  function handleCancel() {
    setFullName(user?.name ?? "");
    setIsEditing(false);
  }

  function handleSave() {
    updateUser.mutate(
      { name: fullName.trim() },
      {
        onSuccess: () => {
          refetch();
          setIsEditing(false);
          toast.success("Name updated successfully.");
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
      <CardContent className="pt-6">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Full name</Label>
          <div className="flex gap-2">
            <Input
              id="fullName"
              placeholder="Your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              readOnly={!isEditing}
              className={!isEditing ? "bg-muted/50 cursor-default" : ""}
            />
            {!isEditing ? (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(true)}
                aria-label="Edit name"
              >
                <PencilIcon className="size-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="icon"
                onClick={handleCancel}
                aria-label="Cancel editing"
              >
                <XIcon className="size-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      {isEditing && (
        <div className="flex justify-end border-t px-6 pt-4 pb-6">
          <Button
            onClick={handleSave}
            disabled={updateUser.isPending || !isDirty || !fullName.trim()}
            size="sm"
          >
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
