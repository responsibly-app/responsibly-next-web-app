import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, ownerAc, adminAc, memberAc } from 'better-auth/plugins/organization/access'

const statement = {
    ...defaultStatements,
    project: ["create", "share", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

//  -----------------------------------------------

const owner = ac.newRole({
    ...ownerAc.statements,
    project: ["create", "update", "delete"],
});

const admin = ac.newRole({
    ...adminAc.statements,
    project: ["create", "update"],
});

const member = ac.newRole({
    ...memberAc.statements,
    project: ["create"],
});

const assistant = ac.newRole({
    organization: ["update"],
    member: ["create", "update", "delete"],
    invitation: ["create", "cancel"],
    project: ["create", "update", "delete"],
});

const priviledgedMember = ac.newRole({
    member: ["create", "update", "delete"],
    invitation: ["create", "cancel"],
    project: ["create", "update", "delete"],
});

//  -----------------------------------------------

export const accessControl = {
    ac,
    roles: {
        owner,
        admin,
        member,
        assistant,
        priviledgedMember
    }
}

//  -----------------------------------------------

export type OrgRole = "owner" | "admin" | "member" | "assistant" | "priviledgedMember";

// Lower number = higher privilege (1 is highest). An actor can only assign roles at or below their own level.
export const ROLE_LEVELS: Record<OrgRole, number> = {
    owner: 1,
    admin: 2,
    assistant: 3,
    priviledgedMember: 4,
    member: 5,
};

export function canAssignRole(actorRole: OrgRole, targetRole: OrgRole): boolean {
    const actorLevel = ROLE_LEVELS[actorRole] ?? Infinity;
    const targetLevel = ROLE_LEVELS[targetRole] ?? Infinity;
    return actorLevel <= targetLevel;
}

export const ROLE_META: Record<OrgRole, { label: string; description: string }> = {
    owner: {
        label: "Owner",
        description: "Full control over the organization including billing, settings, and member management.",
    },
    admin: {
        label: "Admin",
        description: "Manages members and organization settings. Cannot delete the organization.",
    },
    assistant: {
        label: "Assistant",
        description: "Can manage members and projects with limited organization settings access.",
    },
    priviledgedMember: {
        label: "Privileged Member",
        description: "Can manage team members and projects, but not organization settings.",
    },
    member: {
        label: "Member",
        description: "Standard access. Can create and collaborate on projects.",
    },
};

// -----------------------------------------------

export const ALL_ASSIGNABLE_ROLES: OrgRole[] = ["admin", "assistant", "priviledgedMember", "member"];
export const INVITABLE_ROLES: OrgRole[] = ["admin", "assistant", "priviledgedMember", "member"];

// -----------------------------------------------

