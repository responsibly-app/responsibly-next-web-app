"use client";

import { MailIcon, SaveIcon, UserIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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
import { Spinner } from "@/components/ui/spinner";

type PersonalInfoCardProps = {
  firstName: string;
  lastName: string;
  email: string | undefined;
  emailVerified: boolean | undefined;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  isSaving: boolean;
  profileDirty: boolean;
  onSave: () => void;
};

export function PersonalInfoCard({
  firstName,
  lastName,
  email,
  emailVerified,
  onFirstNameChange,
  onLastNameChange,
  isSaving,
  profileDirty,
  onSave,
}: PersonalInfoCardProps) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex size-9 items-center justify-center rounded-xl">
            <UserIcon className="text-primary size-4" />
          </div>
          <div>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your name and profile photo.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                placeholder="First name"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">
              <span className="flex items-center gap-1.5">
                <MailIcon className="size-3.5" />
                Email address
              </span>
            </Label>
            <div className="relative">
              <Input
                id="email"
                type="email"
                value={email ?? ""}
                disabled
                className="pr-24"
              />
              <div className="absolute inset-y-0 right-3 flex items-center">
                {emailVerified ? (
                  <Badge variant="secondary" className="pointer-events-none text-[10px] text-emerald-600 dark:text-emerald-400">
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="pointer-events-none text-[10px] text-amber-600 dark:text-amber-400">
                    Unverified
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              Email cannot be changed after registration.
            </p>
          </div>
        </div>
      </CardContent>
      <div className="flex justify-end border-t px-6 pt-4 pb-6">
        <Button onClick={onSave} disabled={isSaving || !profileDirty} size="sm">
          {isSaving ? (
            <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
          ) : (
            <SaveIcon className="mr-1.5 size-3.5" data-icon="inline-start" />
          )}
          Save changes
        </Button>
      </div>
    </Card>
  );
}
