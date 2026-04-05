"use client";

import { useState } from "react";
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
import { useCreateOrganization } from "@/lib/auth/hooks";
import { SlugInput, toSlug } from "./slug-input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateOrganizationDialog({ open, onOpenChange }: Props) {
  const createOrganization = useCreateOrganization();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited) {
      setSlug(toSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlug(value);
    setSlugEdited(value !== "");
  }

  function handleClose() {
    onOpenChange(false);
    setName("");
    setSlug("");
    setSlugEdited(false);
  }

  function handleSubmit() {
    createOrganization.mutate(
      { name: name.trim(), slug },
      {
        onSuccess: () => {
          toast.success(`Organization "${name}" created.`);
          handleClose();
        },
        onError: (err: { message?: string }) => {
          toast.error(err?.message ?? "Failed to create organization.");
        },
      },
    );
  }

  const isValid = name.trim() && slug.trim();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Organization</DialogTitle>
          <DialogDescription>Set up a new organization to collaborate with your team.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="org-name">Name</Label>
            <Input
              id="org-name"
              placeholder="My Organization"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>
          <SlugInput id="org-slug" value={slug} onChange={handleSlugChange} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createOrganization.isPending || !isValid}>
            {createOrganization.isPending && <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />}
            Create Organization
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
