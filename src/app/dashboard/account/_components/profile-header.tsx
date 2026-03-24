"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { CameraIcon, SaveIcon, ShieldCheckIcon, ShieldOffIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { useUpdateUser } from "@/lib/auth/use-auth";
import { proxiedAvatarUrl } from "@/lib/helpers/image";
import { useDeleteAvatar, useUploadAvatar } from "@/lib/hooks/use-upload-avatar";
import { AvatarCropperDialog } from "./avatar-cropper-dialog";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function ProfileHeaderSkeleton() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="from-primary/20 via-primary/10 to-background h-24 bg-linear-to-br" />
      <div className="-mt-12 flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:gap-6">
        <Skeleton className="size-30 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-2 pb-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
    </Card>
  );
}

export function ProfileHeader() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session, isPending, refetch } = authClient.useSession();
  const user = session?.user;

  const [pendingBlob, setPendingBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const updateUser = useUpdateUser();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  const displayAvatar = previewUrl ?? (user?.image ? (user.image) : undefined);
  const initials = getInitials(user?.name ?? "U");
  const memberSince = user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : null;

  const isSaving = uploadAvatar.isPending || updateUser.isPending;
  const isDeleting = deleteAvatar.isPending || updateUser.isPending;

  if (isPending) return <ProfileHeaderSkeleton />;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleCropConfirm(blob: Blob) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingBlob(blob);
    setPreviewUrl(URL.createObjectURL(blob));
    setCropSrc(null);
  }

  function handleDiscardPending() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPendingBlob(null);
    setPreviewUrl(null);
  }

  async function handleSaveImage() {
    if (!pendingBlob) return;
    try {
      const url = await uploadAvatar.upload(pendingBlob);
      updateUser.mutate(
        { image: url },
        {
          onSuccess: () => {
            handleDiscardPending();
            refetch();
            toast.success("Profile photo updated.");
          },
          onError: (err: { message?: string }) => {
            toast.error(err?.message ?? "Failed to update photo.");
          },
        },
      );
    } catch {
      toast.error("Failed to upload photo.");
    }
  }

  async function handleDeleteAvatar() {
    if (!user?.image) return;
    try {
      await deleteAvatar.remove(user.image);
      updateUser.mutate(
        { image: "" },
        {
          onSuccess: () => {
            refetch();
            toast.success("Profile photo removed.");
          },
          onError: (err: { message?: string }) => {
            toast.error(err?.message ?? "Failed to remove photo.");
          },
        },
      );
    } catch {
      toast.error("Failed to delete photo.");
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <AvatarCropperDialog
        src={cropSrc}
        open={!!cropSrc}
        onClose={() => setCropSrc(null)}
        onConfirm={handleCropConfirm}
      />

      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove profile photo?</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile photo will be permanently deleted and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDeleteOpen(false);
                handleDeleteAvatar();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card className="overflow-hidden p-0">
        <div className="from-primary/20 via-primary/10 to-background h-24 bg-linear-to-br" />

        <div className="-mt-12 flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:gap-6">
          <div className="relative w-fit shrink-0">
            <Avatar className="size-30">
              <AvatarImage src={displayAvatar} alt={user?.name} />
              <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSaving || isDeleting}
              className="bg-background hover:bg-muted border-border absolute -right-1 -bottom-1 flex size-7 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-50"
              aria-label="Change avatar"
            >
              <CameraIcon className="size-3" />
            </button>
            {user?.image && !pendingBlob && (
              <button
                type="button"
                onClick={() => setConfirmDeleteOpen(true)}
                disabled={isDeleting || isSaving}
                className="bg-background hover:bg-destructive/10 border-border text-destructive absolute -left-1 -bottom-1 flex size-7 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-50"
                aria-label="Remove avatar"
              >
                {isDeleting ? <Spinner className="size-3" /> : <Trash2Icon className="size-3" />}
              </button>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-1 pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold leading-none">{user?.name || "Your Name"}</h2>
              {user?.emailVerified ? (
                <Badge variant="secondary" className="gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <ShieldCheckIcon className="size-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <ShieldOffIcon className="size-3" />
                  Unverified
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            {memberSince && (
              <p className="text-muted-foreground/70 text-xs">Member since {memberSince}</p>
            )}
          </div>
        </div>

        {pendingBlob && previewUrl && (
          <div className="space-y-3 border-t px-6 pt-3 pb-4">
            <div className="flex items-center gap-3 rounded-xl border border-dashed p-3 text-sm">
              <Avatar className="size-10">
                <AvatarImage src={previewUrl} alt="New photo preview" />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">New photo ready</p>
                <p className="text-muted-foreground text-xs">Save changes to upload and apply.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                disabled={isSaving}
                onClick={handleDiscardPending}
              >
                Discard
              </Button>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSaveImage} disabled={isSaving}>
                {isSaving ? (
                  <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
                ) : (
                  <SaveIcon className="mr-1.5 size-3.5" data-icon="inline-start" />
                )}
                Save changes
              </Button>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
