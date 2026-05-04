import * as React from "react";
import { MessagesSquare, SquarePen } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThreadList } from "@/components/assistant-ui/thread-list";
import ENVConfig from "@/config";
import { ThreadListPrimitive } from "@assistant-ui/react";

export function ThreadListSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="aui-sidebar-header p-0">
        <div className="flex h-15 items-center px-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href={ENVConfig.backend_base_url}>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <MessagesSquare className="size-4" />
                  </div>
                  <span className="font-semibold">{ENVConfig.app_name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarHeader>
      <SidebarContent className="aui-sidebar-content px-2 pt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <ThreadListPrimitive.New asChild>
              <SidebarMenuButton>
                <SquarePen className="size-4" />
                <span>New Chat</span>
              </SidebarMenuButton>
            </ThreadListPrimitive.New>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="group-data-[collapsible=icon]:hidden">
          <p className="px-3 pb-1 pt-4 text-xs font-medium text-muted-foreground">
            Recents
          </p>
          <ThreadList />
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
