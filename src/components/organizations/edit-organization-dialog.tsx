"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateOrganization } from "@/lib/auth/hooks";
import { SlugInput, toSlug } from "./slug-input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organization: { id: string; name: string; slug: string };
};

export function EditOrganizationDialog({ open, onOpenChange, organization }: Props) {
  const updateOrganization = useUpdateOrganization();

  const [name, setName] = useState(organization.name);
  const [slug, setSlug] = useState(organization.slug);
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setName(organization.name);
      setSlug(organization.slug);
      setSlugTouched(false);
    }
  }, [open, organization]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) {
      setSlug(toSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(value);
  }

  function handleClose() {
    onOpenChange(false);
  }

  function handleSubmit() {
    updateOrganization.mutate(
      { organizationId: organization.id, data: { name: name.trim(), slug } },
      {
        onSuccess: () => {
          toast.success(`Organization updated.`);
          handleClose();
        },
        onError: (err: { message?: string }) => {
          toast.error(err?.message ?? "Failed to update organization.");
        },
      },
    );
  }

  const isValid = name.trim() && slug;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>Update your organization&apos;s name and slug.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-org-name">Name</Label>
            <Input
              id="edit-org-name"
              placeholder="My Organization"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <SlugInput id="edit-org-slug" value={slug} onChange={handleSlugChange} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateOrganization.isPending || !isValid}>
            {updateOrganization.isPending && <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
