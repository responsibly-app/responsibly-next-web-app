"use client";

import { CameraIcon, ShieldCheckIcon, ShieldOffIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ProfileHeaderProps = {
  name: string | undefined;
  email: string | undefined;
  emailVerified: boolean | undefined;
  displayAvatar: string;
  initials: string;
  memberSince: string | null;
  avatarPreview: string | null;
  onAvatarClick: () => void;
  onRemovePreview: () => void;
};

export function ProfileHeader({
  name,
  email,
  emailVerified,
  displayAvatar,
  initials,
  memberSince,
  avatarPreview,
  onAvatarClick,
  onRemovePreview,
}: ProfileHeaderProps) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="from-primary/20 via-primary/10 to-background h-24 bg-linear-to-br" />

      <div className="-mt-12 flex flex-col gap-4 px-6 pb-6 sm:flex-row sm:items-end sm:gap-6">
        <div className="relative shrink-0">
          <Avatar className="size-20">
            <AvatarImage src={displayAvatar} alt={name} />
            <AvatarFallback className="text-lg font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={onAvatarClick}
            className="bg-background hover:bg-muted border-border absolute -right-1 -bottom-1 flex size-7 cursor-pointer items-center justify-center rounded-full border transition-colors"
            aria-label="Change avatar"
          >
            <CameraIcon className="size-3" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1 pb-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold leading-none">{name || "Your Name"}</h2>
            {emailVerified ? (
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
          <p className="text-muted-foreground text-sm">{email}</p>
          {memberSince && (
            <p className="text-muted-foreground/70 text-xs">Member since {memberSince}</p>
          )}
        </div>
      </div>

      {avatarPreview && (
        <div className="border-t px-6 pt-3 pb-4">
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
              onClick={onRemovePreview}
            >
              Remove
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
