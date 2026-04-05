"use client";

import * as React from "react";
import { Building2, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrgSwitcherDialog } from "@/components/dashboard/org-switcher";
import { useGetMemberRole } from "@/lib/auth/hooks";
import { OrgRole, ROLE_META } from "@/lib/auth/hooks/oraganization/permissions";

interface ActiveOrgHeaderProps {
    org: { id: string; name: string; slug: string; logo?: string | null };
}

export function ActiveOrgHeader({ org }: ActiveOrgHeaderProps) {
    const [switcherOpen, setSwitcherOpen] = React.useState(false);
    const { data: memberRoleData } = useGetMemberRole(org.id);
    const currentRole = memberRoleData?.role as OrgRole | undefined;

    return (
        <div className="flex items-center justify-between gap-4 rounded-xl border bg-muted/40 px-5 py-4">
            <div className="flex items-center gap-4">
                {org.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={org.logo} alt={org.name} className="size-10 rounded-lg object-cover" />
                ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background shadow-sm">
                        <Building2 className="size-5 text-muted-foreground" />
                    </div>
                )}
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold leading-none">{org.name}</span>
                        {currentRole && (
                            <Badge variant="outline" className="text-xs capitalize">
                                {ROLE_META[currentRole]?.label ?? currentRole}
                            </Badge>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground">/{org.slug}</span>
                </div>
            </div>

            <OrgSwitcherDialog open={switcherOpen} onOpenChange={setSwitcherOpen}>
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                    <ChevronsUpDown className="size-3.5" />
                    Switch
                </Button>
            </OrgSwitcherDialog>
        </div>
    );
}
