import ENVConfig from "@/config";
import { appRouter } from "@/lib/orpc/router";
import { OpenAPIGenerator } from "@orpc/openapi";
import { ZodToJsonSchemaConverter } from "@orpc/zod";

const baseURL = ENVConfig.backend_base_url;

const generator = new OpenAPIGenerator({
  schemaConverters: [new ZodToJsonSchemaConverter()],
});

export async function GET() {
  const spec = await generator.generate(appRouter, {
    info: {
      title: "Dashboard API",
      version: "1.0.0",
      description: "Internal API for the personal dashboard application.",
    },
    servers: [{ url: baseURL + "/api/v1/rest" }],
    security: [{ sessionCookie: [] }],
    components: {
      securitySchemes: {
        sessionCookie: {
          type: "apiKey",
          in: "cookie",
          name: "better-auth.session_token",
          description: "Session cookie set by Better Auth",
        },
      },
    },
    tags: [
      { name: "Session", description: "Zoom account connection and profile" },
      { name: "Storage", description: "Zoom account connection and profile" },
      { name: "Zoom", description: "Zoom account connection and profile" },
    ],
  });

  return Response.json(spec);
}
