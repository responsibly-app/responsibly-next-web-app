import { auth } from "@/lib/auth/auth";

const openAPISchemaURL = "/api/v1/openapi.json";

async function checkAdminAuth(req: Request): Promise<Response | null> {
  const session = await auth.api.getSession({
    headers: req.headers,
    query: { disableCookieCache: true },
  });

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (session.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  return null;
}

export async function GET(req: Request) {
  const authError = await checkAdminAuth(req);
  if (authError) return authError;

  const html = `<!doctype html>
<html>
  <head>
    <title>Dashboard API Docs</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script
      id="api-reference"
      data-url=${openAPISchemaURL}
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
