import { OrganizationsList } from "@/components/organizations/organizations-list";
import { OrgMembersSection } from "@/components/organizations/org-members-section";
import { OrgInvitationsSection } from "@/components/organizations/org-invitations-section";

export default function OrganizationsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-2 pt-5">
      <OrganizationsList />
      {/* <OrgMembersSection />
      <OrgInvitationsSection /> */}
    </div>
  );
}
