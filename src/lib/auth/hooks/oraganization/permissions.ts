import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, ownerAc, adminAc, memberAc } from 'better-auth/plugins/organization/access'

const statement = {
    ...defaultStatements,
    project: ["create", "share", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

//  -----------------------------------------------

const member = ac.newRole({
    ...memberAc.statements,
    project: ["create"],
});

const admin = ac.newRole({
    ...adminAc.statements,
    project: ["create", "update"],
});

const owner = ac.newRole({
    ...ownerAc.statements,
    project: ["create", "update", "delete"],
});

const myCustomRole = ac.newRole({
    project: ["create", "update", "delete"],
    organization: ["update"],
});

//  -----------------------------------------------

export const accessControl = {
    ac,
    roles: {
        owner,
        admin,
        member,
        myCustomRole
    }
}

//  -----------------------------------------------

// /** Example usage */
// const canCreateProject = await authClient.organization.hasPermission({
//   permissions: {
//     project: ["create"],
//   },
// });