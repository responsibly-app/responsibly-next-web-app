"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth/auth-client";
import {
  useChangePassword,
  useDeleteUser,
  useUpdateUser,
} from "@/lib/auth/use-auth";
import { proxiedAvatarUrl } from "@/lib/helpers/image";
import { useUploadAvatar } from "@/lib/hooks/use-upload-avatar";
import { AvatarCropperDialog } from "./avatar-cropper-dialog";
import { DangerZoneCard } from "./danger-zone-card";
import { PersonalInfoCard } from "./personal-info-card";
import { ProfileHeader } from "./profile-header";
import { SecurityCard } from "./security-card";

// ─── helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return { firstName: parts[0] ?? "", lastName: parts.slice(1).join(" ") };
}

// ─── main component ───────────────────────────────────────────────────────────

export function AccountProfile() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: session,
    isPending: sessionLoading,
    refetch,
  } = authClient.useSession();

  const user = session?.user;

  // profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    const { firstName: f, lastName: l } = splitName(user?.name ?? "");
    setFirstName(f);
    setLastName(l);
  }, [user?.name]);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // crop dialog state
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  // security form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // danger zone state
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // accounts / provider
  const [accounts, setAccounts] = useState<Array<{ providerId: string }>>([]);

  useEffect(() => {
    if (!user?.id) return;
    authClient.listAccounts().then((result) => {
      if (result.data) setAccounts(result.data as Array<{ providerId: string }>);
    });
  }, [user?.id]);

  const isCredentialUser = accounts.some((a) => a.providerId === "credential");
  const socialProviders = accounts
    .filter((a) => a.providerId !== "credential")
    .map((a) => a.providerId.charAt(0).toUpperCase() + a.providerId.slice(1));

  // hooks
  const updateUser = useUpdateUser();
  const changePassword = useChangePassword();
  const deleteUser = useDeleteUser();
  const uploadAvatar = useUploadAvatar();

  // derived
  const displayAvatar = avatarPreview ?? (user?.image ? proxiedAvatarUrl(user.image) : "");
  const initials = getInitials(user?.name ?? "U");
  const memberSince = user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : null;
  const profileDirty =
    [firstName.trim(), lastName.trim()].filter(Boolean).join(" ") !== (user?.name ?? "") ||
    avatarPreview !== null;

  // handlers
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

  function handleSaveProfile() {
    const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
    updateUser.mutate(
      { name, image: avatarPreview ?? user?.image ?? undefined },
      {
        onSuccess: () => {
          refetch();
          setAvatarPreview(null);
          toast.success("Profile updated successfully.");
        },
        onError: (err: { message?: string }) => {
          toast.error(err?.message ?? "Failed to update profile.");
        },
      },
    );
  }

  function handleChangePassword() {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          toast.success("Password changed successfully.");
        },
        onError: (err: { message?: string }) => {
          toast.error(err?.message ?? "Failed to change password.");
        },
      },
    );
  }

  function handleDeleteAccount() {
    deleteUser.mutate(undefined, {
      onError: (err: { message?: string }) => {
        toast.error(err?.message ?? "Failed to delete account.");
      },
    });
  }

  if (sessionLoading) {
    return (
      <div className="flex min-h-50 w-full items-center justify-center">
        <Spinner className="size-6" />
      </div>
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

      <div className="space-y-6">
        <ProfileHeader
          name={user?.name}
          email={user?.email}
          emailVerified={user?.emailVerified}
          displayAvatar={displayAvatar}
          initials={initials}
          memberSince={memberSince}
          avatarPreview={avatarPreview}
          onAvatarClick={() => fileInputRef.current?.click()}
          onRemovePreview={() => setAvatarPreview(null)}
        />

        <PersonalInfoCard
          firstName={firstName}
          lastName={lastName}
          email={user?.email}
          emailVerified={user?.emailVerified}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
          isSaving={updateUser.isPending}
          profileDirty={profileDirty}
          onSave={handleSaveProfile}
        />

        <SecurityCard
          isCredentialUser={isCredentialUser}
          socialProviders={socialProviders}
          currentPassword={currentPassword}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          showCurrentPw={showCurrentPw}
          showNewPw={showNewPw}
          showConfirmPw={showConfirmPw}
          onCurrentPasswordChange={setCurrentPassword}
          onNewPasswordChange={setNewPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onToggleCurrentPw={() => setShowCurrentPw((v) => !v)}
          onToggleNewPw={() => setShowNewPw((v) => !v)}
          onToggleConfirmPw={() => setShowConfirmPw((v) => !v)}
          isPending={changePassword.isPending}
          onChangePassword={handleChangePassword}
        />

        <DangerZoneCard
          deleteConfirmText={deleteConfirmText}
          onDeleteConfirmTextChange={setDeleteConfirmText}
          isPending={deleteUser.isPending}
          onDelete={handleDeleteAccount}
        />
      </div>
    </>
  );
}
