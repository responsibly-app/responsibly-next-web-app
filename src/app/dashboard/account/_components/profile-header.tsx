"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { CameraIcon, PencilIcon, RefreshCwIcon, SaveIcon, ShieldCheckIcon, ShieldOffIcon, Trash2Icon } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
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

  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  const displayAvatar = previewUrl ?? (user?.image ? proxiedAvatarUrl(user.image) : undefined);
  const initials = getInitials(user?.name ?? "U");
  const memberSince = user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : null;

  const isSaving = uploadAvatar.isPending;
  const isDeleting = deleteAvatar.isPending;
  const [isSyncing, setIsSyncing] = useState(false);

  async function handleSync() {
    setIsSyncing(true);
    try {
      await refetch({ query: { disableCookieCache: true } });
    } finally {
      setIsSyncing(false);
    }
  }

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
      await uploadAvatar.upload(pendingBlob);
      handleDiscardPending();
      refetch({
        query: {
          disableCookieCache: true
        }
      });
      toast.success("Profile photo updated.");
    } catch {
      toast.error("Failed to update photo.");
    }
  }

  async function handleDeleteAvatar() {
    if (!user?.image) return;
    try {
      await deleteAvatar.remove();
      refetch({
        query: {
          disableCookieCache: true
        }
      });
      toast.success("Profile photo removed.");
    } catch {
      toast.error("Failed to remove photo.");
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={isSaving || isDeleting}
                  className="bg-background hover:bg-muted border-border absolute -right-1 -bottom-1 flex size-7 cursor-pointer items-center justify-center rounded-full border transition-colors disabled:pointer-events-none disabled:opacity-50"
                  aria-label="Edit avatar"
                >
                  {isDeleting ? <Spinner className="size-3" /> : <PencilIcon className="size-3" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                  <CameraIcon className="size-4" />
                  Upload new photo
                </DropdownMenuItem>
                {user?.image && !pendingBlob && (
                  <DropdownMenuItem
                    onClick={() => setConfirmDeleteOpen(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2Icon className="size-4" />
                    Delete photo
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleSync}
                    disabled={isSyncing || isSaving || isDeleting}
                    className="text-muted-foreground hover:text-foreground flex cursor-pointer items-center gap-1 transition-colors disabled:pointer-events-none disabled:opacity-50"
                    aria-label="Sync profile"
                  >
                    <RefreshCwIcon className={`size-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                    {isSyncing && <span className="text-xs">Syncing changes...</span>}
                  </button>
                </TooltipTrigger>
                <TooltipContent>Sync profile</TooltipContent>
              </Tooltip>
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
