"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";
import { CameraIcon, SaveIcon, ShieldCheckIcon, ShieldOffIcon } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import { useUpdateUser } from "@/lib/auth/use-auth";
import { proxiedAvatarUrl } from "@/lib/helpers/image";
import { useUploadAvatar } from "@/lib/hooks/use-upload-avatar";
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

export function ProfileHeader() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: session, refetch } = authClient.useSession();
  const user = session?.user;

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const updateUser = useUpdateUser();
  const uploadAvatar = useUploadAvatar();

  const displayAvatar = avatarPreview ?? (user?.image ? proxiedAvatarUrl(user.image) : "");
  const initials = getInitials(user?.name ?? "U");
  const memberSince = user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : null;

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

  async function handleCropConfirm(blob: Blob) {
    const url = await uploadAvatar.upload(blob);
    setAvatarPreview(url);
    setCropSrc(null);
  }

  function handleSaveImage() {
    if (!avatarPreview) return;
    updateUser.mutate(
      { image: avatarPreview },
      {
        onSuccess: () => {
          refetch();
          setAvatarPreview(null);
          toast.success("Profile photo updated.");
        },
        onError: (err: { message?: string }) => {
          toast.error(err?.message ?? "Failed to update photo.");
        },
      },
    );
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

      <Card className="overflow-hidden p-0">
        <div className="from-primary/20 via-primary/10 to-background h-24 bg-linear-to-br" />

        <div className="-mt-12 flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:gap-6">
          <div className="relative w-fit shrink-0">
            <Avatar className="size-20">
              <AvatarImage src={displayAvatar} alt={user?.name} />
              <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-background hover:bg-muted border-border absolute -right-1 -bottom-1 flex size-7 cursor-pointer items-center justify-center rounded-full border transition-colors"
              aria-label="Change avatar"
            >
              <CameraIcon className="size-3" />
            </button>
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

        {avatarPreview && (
          <div className="space-y-3 border-t px-6 pt-3 pb-4">
            <div className="flex items-center gap-3 rounded-xl border border-dashed p-3 text-sm">
              <Avatar className="size-10">
                <AvatarImage src={avatarPreview} alt="New photo preview" />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">New photo ready</p>
                <p className="text-muted-foreground text-xs">Save changes to apply.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => setAvatarPreview(null)}
              >
                Remove
              </Button>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={handleSaveImage} disabled={updateUser.isPending}>
                {updateUser.isPending ? (
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
