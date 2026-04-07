"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import { useSignOut } from "@/lib/auth/hooks";
import { proxiedAvatarUrl } from "@/lib/helpers/image";
import { ThemeSwitch } from "@/components/theme-toggle";
import {
  LogOutIcon,
  SettingsIcon,
} from "lucide-react";
import Link from "next/link";
import { getInitials } from "@/lib/helpers/user";
import { routes } from "@/routes";

export interface NavUserType {
  name: string;
  email: string;
  avatar: string;
}

export function HeaderUserDropdown({
  user,
  isPending,
}: {
  user: NavUserType;
  isPending: boolean;
}) {
  const signOut = useSignOut();
  const [open, setOpen] = useState(false);

  const userInitials = getInitials(user?.name ? user?.name : user?.email || "User");


  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        className="cursor-pointer transition-opacity duration-200 hover:opacity-80 data-[state=open]:opacity-80"
      >
        <Avatar className="relative h-8 w-8 rounded-full">
          {isPending || signOut.isPending ? (
            <div className="soft-pulse bg-background absolute inset-0 rounded-full" />
          ) : (
            <>
              <AvatarImage src={proxiedAvatarUrl(user.avatar)} alt={user.name} />
              <AvatarFallback className="rounded-full">
                {userInitials}
              </AvatarFallback>
            </>
          )}
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-70 bg-popover/70 backdrop-blur"
        side="bottom"
        align="end"
        sideOffset={10}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <Link
            href={routes.dashboard.settings()}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-2 py-1.5 text-left text-sm hover:bg-accent rounded-sm transition-colors"
          >
            <Avatar className="relative h-8 w-8 rounded-full">
              {isPending || signOut.isPending ? (
                <div className="soft-pulse bg-background absolute inset-0 rounded-full" />
              ) : (
                <>
                  <AvatarImage src={proxiedAvatarUrl(user.avatar)} alt={user.name} />
                  <AvatarFallback className="rounded-full">
                    {userInitials}
                  </AvatarFallback>
                </>
              )}
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </Link>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={routes.dashboard.settings()}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <ThemeSwitch />

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
        >
          {signOut.isPending && (
            <Spinner className="mr-2 h-4 w-4" data-icon="inline-start" />
          )}
          {!signOut.isPending && <LogOutIcon className="mr-2 h-4 w-4" />}
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
