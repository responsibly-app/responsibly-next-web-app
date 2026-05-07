import { tool, zodSchema } from "ai";
import { z } from "zod";
import type { ServerCaller } from "@/lib/orpc/server-caller";

export const getMyProfile = {
  meta: {
    name: "get_my_profile",
    description: "Get the current user's profile information.",
    embeddingDescription:
      "Retrieve the authenticated user's profile including their name, email, image, role, and account details. Use this when the user asks about their account, profile, who they are logged in as, their name, their email, or their account information.",
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: getMyProfile.meta.description,
      inputSchema: zodSchema(z.object({})),
      execute: async () => caller.session.me(),
    });
  },
};

export const listMyOrganizations = {
  meta: {
    name: "list_my_organizations",
    description: "List all organizations the current user belongs to and their role in each.",
    embeddingDescription:
      "Retrieve all organizations, groups, teams, or communities that the authenticated user is a member of, along with their assigned role in each. Use this when the user asks which organizations or groups they belong to, their memberships, their teams, their communities, what they are part of, or what role they hold in an org.",
  } as const,
  create(caller: ServerCaller) {
    return tool({
      description: listMyOrganizations.meta.description,
      inputSchema: zodSchema(z.object({})),
      execute: async () => caller.organization.listMine(),
    });
  },
};
