import ENVConfig, { config } from "@/config";
import { agentAuth } from "@better-auth/agent-auth";
import { createFromOpenAPI, createOpenAPIHandler, fromOpenAPI } from "@better-auth/agent-auth/openapi";
import { getAccessToken } from "better-auth/api";

const appName = ENVConfig.app_name;
// const baseURL = ENVConfig.backend_base_url;
const baseURL = "https://responsibly-next-web-app-yh7q.vercel.app";

// const spec = await fetch(`${baseURL}/api/v1/openapi.json`).then((r) =>
//     r.json(),
// );

const spec = await fetch(`${baseURL}/api/v1/openapi.json`).then((r) =>
    r.json(),
);

const capabilities = fromOpenAPI(spec);
const onExecute = createOpenAPIHandler(spec, {
    baseUrl: `${baseURL}/api/v1`,
    async resolveHeaders({ agentSession }) {
        const token = await getAccessToken({
            body: {
                providerId: "",
                userId: agentSession.user.id,
            },
        });
        return { Authorization: `Bearer ${token}` };
    },
});

export const agentAuthPlugin = agentAuth({
    providerName: appName,
    providerDescription: `${appName} project and deployment APIs for AI agents.`,
    modes: ["delegated", "autonomous"],
    allowDynamicHostRegistration: true,
    deviceAuthorizationPage: "/approve",
    rateLimit: {
        "/agent/register": { window: 120, max: 5 },
        "/capability/execute": { window: 60, max: 200 },
    },
    capabilities,
    onExecute,
    // capabilities: [
    //     {
    //         name: "deploy_project",
    //         description: "Deploy a project to production.",
    //         input: {
    //             type: "object",
    //             properties: {
    //                 projectId: { type: "string" },
    //             },
    //             required: ["projectId"],
    //         },
    //     },
    //     {
    //         name: "list_projects",
    //         description: "List projects the current user can access.",
    //     },
    // ],
    // async onExecute({ capability, arguments: args, agentSession }) {
    //     switch (capability) {
    //         case "list_projects":
    //             return [{ id: "proj_123", name: "marketing-site" }];
    //         case "deploy_project":
    //             return {
    //                 ok: true,
    //                 projectId: args?.projectId,
    //                 requestedBy: agentSession.user.id,
    //             };
    //         default:
    //             throw new Error(`Unsupported capability: ${capability}`);
    //     }
    // },
})