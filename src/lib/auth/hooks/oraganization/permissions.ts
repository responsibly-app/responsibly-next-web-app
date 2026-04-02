import { createAccessControl } from "better-auth/plugins/access";

const statement = {
    project: ["create", "share", "update", "delete"],
    organization: ["update"],
} as const;

const ac = createAccessControl(statement);

//  -----------------------------------------------

const member = ac.newRole({
    project: ["create"],
});

const admin = ac.newRole({
    project: ["create", "update"],
});

const owner = ac.newRole({
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