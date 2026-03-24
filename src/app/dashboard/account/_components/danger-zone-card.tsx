"use client";

import { AlertTriangleIcon, Trash2Icon } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

type DangerZoneCardProps = {
  deleteConfirmText: string;
  onDeleteConfirmTextChange: (v: string) => void;
  isPending: boolean;
  onDelete: () => void;
};

export function DangerZoneCard({
  deleteConfirmText,
  onDeleteConfirmTextChange,
  isPending,
  onDelete,
}: DangerZoneCardProps) {
  return (
    <Card className="border-destructive/40">
      <CardHeader className="border-b border-destructive/20">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-destructive/10">
            <AlertTriangleIcon className="size-4 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions. Proceed with caution.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-1 rounded-xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-muted-foreground text-sm">
              Permanently delete your account and all associated data. This cannot be undone.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="mt-3 shrink-0 sm:mt-0">
                <Trash2Icon className="mr-1.5 size-3.5" data-icon="inline-start" />
                Delete account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangleIcon className="size-5 text-destructive" />
                  Delete your account?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete your account, all your data, and sign you out
                  immediately. This action <strong>cannot be undone</strong>.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="grid gap-2 py-1">
                <Label htmlFor="deleteConfirm">
                  Type{" "}
                  <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">delete</code>{" "}
                  to confirm
                </Label>
                <Input
                  id="deleteConfirm"
                  placeholder="delete"
                  value={deleteConfirmText}
                  onChange={(e) => onDeleteConfirmTextChange(e.target.value)}
                />
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => onDeleteConfirmTextChange("")}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  disabled={deleteConfirmText !== "delete" || isPending}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/20"
                >
                  {isPending ? (
                    <Spinner className="mr-1.5 size-3.5" data-icon="inline-start" />
                  ) : (
                    <Trash2Icon className="mr-1.5 size-3.5" data-icon="inline-start" />
                  )}
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
