"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  ClipboardList,
  Flame,
  LayoutDashboard,
  Plug,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
  Trophy,
  Building2,
  PanelRightOpen,
  PanelLeftClose,
  ChevronsUpDown,
  Menu,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/routes";
import { OrgSwitcherDialog } from "../../org-switcher";
import { useActiveOrganization } from "@/lib/auth/hooks/oraganization";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { appName } from "@/config";

export const SIDEBAR_ICON_W = 54;
export const SIDEBAR_PINNED_W = 240;

const navGroups = [
  {
    items: [{ title: "Dashboard", url: routes.dashboard.root(), icon: LayoutDashboard }],
  },
  {
    label: "Personal",
    items: [
      { title: "Invites", url: routes.dashboard.invites(), icon: Flame },
      { title: "Points", url: routes.dashboard.points(), icon: TrendingUp },
      { title: "AMAs", url: routes.dashboard.amas(), icon: UserPlus },
    ],
  },
  {
    label: "Organization",
    items: [
      { title: "Leaderboard", url: routes.dashboard.leaderboard(), icon: Trophy },
      { title: "Baseshop", url: routes.dashboard.baseshop(), icon: BarChart3 },
      { title: "Members", url: routes.dashboard.members(), icon: Users },
      { title: "Events", url: routes.dashboard.events(), icon: CalendarDays },
      { title: "Attendance", url: routes.dashboard.attendance(), icon: ClipboardList },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Organizations", url: routes.dashboard.organizations(), icon: Building2 },
      { title: "Settings", url: routes.dashboard.settings(), icon: Settings },
      { title: "Integrations", url: routes.dashboard.integrations(), icon: Plug },
    ],
  },
];

// ── Org switcher button ────────────────────────────────────────────────────────

interface OrgSwitcherButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  orgName?: string;
  isExpanded?: boolean;
}

const OrgSwitcherButton = React.forwardRef<HTMLButtonElement, OrgSwitcherButtonProps>(
  ({ orgName, isExpanded, ...props }, ref) => {
    const expanded = isExpanded ?? true;
    return (
      <button
        ref={ref}
        {...props}
        className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-foreground hover:bg-sidebar-primary/10 transition-colors mb-1 border-border border"
      >
        <span className="flex size-5 shrink-0 items-center justify-center">
          <Building2 className="size-4" />
        </span>
        <span
          className={cn(
            "flex-1 min-w-0 truncate whitespace-nowrap text-left text-sm font-medium overflow-hidden transition-[opacity,max-width] duration-200",
            expanded ? "opacity-100" : "opacity-0 max-w-0",
          )}
        >
          {orgName ?? "Select organization"}
        </span>
        <ChevronsUpDown
          className={cn(
            "ml-auto size-4 shrink-0 text-muted-foreground transition-opacity duration-200",
            expanded ? "opacity-100" : "opacity-0",
          )}
        />
      </button>
    );
  },
);
OrgSwitcherButton.displayName = "OrgSwitcherButton";

// ── Shared nav content (used by both desktop sidebar and mobile sheet) ─────────

function NavContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [orgDialogOpen, setOrgDialogOpen] = React.useState(false);
  const { data: activeOrg } = useActiveOrganization();

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Org switcher — pinned */}
      <div className="px-2 py-2 shrink-0 border-b">
        <OrgSwitcherDialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
          <OrgSwitcherButton orgName={activeOrg?.name} />
        </OrgSwitcherDialog>
      </div>

      {/* Nav groups — scrollable */}
      <div className="flex-1 overflow-y-auto py-2">
        {navGroups.map((group, i) => (
          <div key={i} className="px-2 mb-1">
            {group.label && (
              <p className="mb-0.5 px-2 text-xs font-medium text-sidebar-foreground/50">
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-2 py-2 text-sm transition-colors mb-1",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                  )}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    <item.icon className="size-4" />
                  </span>
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Desktop sidebar ────────────────────────────────────────────────────────────

export interface AppSidebarV2Props {
  isPinned: boolean;
  onTogglePin: () => void;
}

export function AppSidebarV2({ isPinned, onTogglePin }: AppSidebarV2Props) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [orgDialogOpen, setOrgDialogOpen] = React.useState(false);
  const isExpanded = isPinned || isHovered;

  // Dialog backdrop swallows mouseleave, so reset hover when dialog closes
  React.useEffect(() => {
    if (!orgDialogOpen) setIsHovered(false);
  }, [orgDialogOpen]);
  const pathname = usePathname();
  const { data: activeOrg } = useActiveOrganization();

  return (
    <aside
      style={{ width: isExpanded ? SIDEBAR_PINNED_W : SIDEBAR_ICON_W }}
      className={cn(
        "absolute inset-y-0 left-0 z-50 flex flex-col",
        "border-r bg-sidebar/70 backdrop-blur-md transition-[width] duration-300 ease-in-out overflow-hidden",
        isHovered && !isPinned && "shadow-xl",
      )}
      onMouseEnter={() => !isPinned && setIsHovered(true)}
      onMouseLeave={() => !isPinned && setIsHovered(false)}
    >
      {/* Header */}
      <div className="flex h-12 shrink-0 items-center px-3 gap-2">
        <Link href="/" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Responsibly"
            width={28}
            height={28}
            className="size-7 rounded-md object-contain"
          />
        </Link>
        <span
          className={cn(
            "flex-1 whitespace-nowrap text-sm font-semibold overflow-hidden transition-[opacity,max-width] duration-200",
            isExpanded ? "opacity-100 max-w-40" : "opacity-0 max-w-0",
          )}
        >
          <Link href="/">
            {appName}
          </Link>
        </span>
        <button
          onClick={onTogglePin}
          className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-md",
            "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-[opacity,colors] duration-200",
            isExpanded ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          title={isPinned ? "Collapse sidebar" : "Pin sidebar"}
        >
          {isPinned ? (
            <PanelLeftClose className="size-4" />
          ) : (
            <PanelRightOpen className="size-4" />
          )}
        </button>
      </div>

      {/* Org switcher — pinned */}
      <div className="px-2 py-2 shrink-0 border-b">
        <OrgSwitcherDialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
          <OrgSwitcherButton orgName={activeOrg?.name} isExpanded={isExpanded} />
        </OrgSwitcherDialog>
      </div>

      {/* Scrollable nav */}
      <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden py-2">
        {/* Nav groups */}
        {navGroups.map((group, i) => (
          <div key={i} className="px-2 mb-1">
            {group.label && (
              <p
                className={cn(
                  "mb-0.5 px-2 text-xs font-medium text-sidebar-foreground/50 whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-200",
                  isExpanded ? "opacity-100 max-w-50" : "opacity-0 max-w-0",
                )}
              >
                {group.label}
              </p>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.title}
                  href={item.url}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-2 py-2 text-sm transition-colors mb-1",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                  )}
                >
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    <item.icon className="size-4" />
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-200",
                      isExpanded ? "opacity-100 max-w-50" : "opacity-0 max-w-0",
                    )}
                  >
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </aside>
  );
}

// ── Mobile nav — bottom sheet with hamburger trigger ───────────────────────────

export function MobileNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <button
          className="flex md:hidden size-8 items-center justify-center rounded-xl hover:bg-accent transition-colors"
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>
      </DrawerTrigger>

      <DrawerContent className="rounded-t-2xl max-h-[82svh] flex flex-col bg-sidebar px-0 pb-safe border-t-0 before:hidden! after:hidden!">
        {/* Drag handle */}
        {/* <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-sidebar-foreground/20" />
        </div> */}

        {/* Header with logo */}
        <div className="flex items-center gap-2.5 px-4 py-2 border-b shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt={appName}
              width={28}
              height={28}
              className="size-7 rounded-md object-contain"
            />
          </Link>
          <DrawerTitle className="text-sm font-semibold">
            <Link href="/">{appName}</Link>
          </DrawerTitle>
        </div>

        {/* Nav content — closes drawer on link click */}
        <NavContent onNavigate={() => setOpen(false)} />
      </DrawerContent>
    </Drawer>
  );
}
