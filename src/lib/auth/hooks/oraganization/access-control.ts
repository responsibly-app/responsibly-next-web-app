import { authClient } from "../../auth-client";
import type { OrgRole } from "./permissions";
export { canAssignRole, ROLE_LEVELS } from "./permissions";

// -----------------------------------------------
// Component-level access control

const check = (
    role: OrgRole,
    permissions: Record<string, string[]>,
): boolean =>
    authClient.organization.checkRolePermission({ role, permissions });

export function getPermissions(role: OrgRole | undefined) {
    role = role ?? "member";

    const canEditOrg = check(role, { organization: ["update"] });
    const canDeleteOrg = check(role, { organization: ["delete"] });

    const canRemoveMember = check(role, { member: ["delete"] });
    const canUpdateMemberRole = check(role, { member: ["update"] });

    const canCreateInvitation = check(role, { invitation: ["create"] });
    const canCancelInvitation = check(role, { invitation: ["cancel"] });

    return {
        canEditOrg,
        canDeleteOrg,
        canRemoveMember,
        canUpdateMemberRole,
        canCreateInvitation,
        canCancelInvitation,
        canManage: canCreateInvitation || canRemoveMember,
        canLeave: !canDeleteOrg,
    };
}
