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

//  -----------------------------------------------

export const accessControl = {
    ac,
    roles: {
        owner,
        admin,
        member,
        assistant
    }
}

//  -----------------------------------------------

export type OrgRole = "owner" | "admin" | "member" | "assistant";

// -----------------------------------------------
