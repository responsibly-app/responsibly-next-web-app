// import { auth } from "@/lib/auth/auth";
// import { db } from "@/lib/db/index";
// import {
//   agent,
//   agentCapabilityGrant,
//   approvalRequest,
// } from "@/lib/db/schema/better-auth-schema";
// import { and, eq } from "drizzle-orm";
// import { NextRequest, NextResponse } from "next/server";

// async function hashToken(token: string): Promise<string> {
//   const digest = await globalThis.crypto.subtle.digest(
//     "SHA-256",
//     new TextEncoder().encode(token),
//   );
//   const bytes = new Uint8Array(digest);
//   const lookup =
//     "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
//   let result = "";
//   const len = bytes.length;
//   for (let i = 0; i < len; i += 3) {
//     const b0 = bytes[i];
//     const b1 = i + 1 < len ? bytes[i + 1] : 0;
//     const b2 = i + 2 < len ? bytes[i + 2] : 0;
//     result += lookup[b0 >> 2];
//     result += lookup[((b0 & 3) << 4) | (b1 >> 4)];
//     if (i + 1 < len) result += lookup[((b1 & 15) << 2) | (b2 >> 6)];
//     if (i + 2 < len) result += lookup[b2 & 63];
//   }
//   return result;
// }

// function normalizeUserCode(code: string): string {
//   const stripped = code.replaceAll(/[^A-Z0-9]/gi, "").toUpperCase();
//   if (stripped.length !== 8) return code.toUpperCase();
//   return `${stripped.slice(0, 4)}-${stripped.slice(4)}`;
// }

// export async function GET(req: NextRequest) {
//   const session = await auth.api.getSession({ headers: req.headers });
//   if (!session) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const { searchParams } = new URL(req.url);
//   const agentId = searchParams.get("agent_id");
//   const userCode = searchParams.get("user_code");

//   if (!agentId) {
//     return NextResponse.json({ error: "agent_id is required" }, { status: 400 });
//   }

//   const pendingRequests = await db
//     .select()
//     .from(approvalRequest)
//     .where(
//       and(
//         eq(approvalRequest.agentId, agentId),
//         eq(approvalRequest.status, "pending"),
//         eq(approvalRequest.method, "device_authorization"),
//       ),
//     );

//   const now = new Date();
//   const active = pendingRequests.filter((r) => new Date(r.expiresAt) > now);

//   if (active.length === 0) {
//     return NextResponse.json({ requests: [] });
//   }

//   // Validate user_code if the record has a hash
//   if (userCode) {
//     const normalized = normalizeUserCode(userCode);
//     const submittedHash = await hashToken(normalized);
//     const matched = active.some((r) => r.userCodeHash === submittedHash);
//     if (!matched) {
//       return NextResponse.json({ requests: [] });
//     }
//   }

//   const agentRecord = await db
//     .select()
//     .from(agent)
//     .where(eq(agent.id, agentId))
//     .then((rows) => rows[0] ?? null);

//   const pendingGrants = await db
//     .select()
//     .from(agentCapabilityGrant)
//     .where(
//       and(
//         eq(agentCapabilityGrant.agentId, agentId),
//         eq(agentCapabilityGrant.status, "pending"),
//       ),
//     );

//   const capReasons: Record<string, string> = {};
//   for (const g of pendingGrants) {
//     if (g.reason) capReasons[g.capability] = g.reason;
//   }

//   const results = active.map((r) => ({
//     approval_id: r.id,
//     agent_id: r.agentId ?? null,
//     agent_name: agentRecord?.name ?? null,
//     binding_message: r.bindingMessage ?? null,
//     capabilities: r.capabilities
//       ? r.capabilities.split(/\s+/).filter(Boolean)
//       : [],
//     capability_reasons: Object.keys(capReasons).length > 0 ? capReasons : null,
//     expires_in: Math.max(
//       0,
//       Math.floor((new Date(r.expiresAt).getTime() - now.getTime()) / 1000),
//     ),
//     created_at: r.createdAt,
//   }));

//   return NextResponse.json({ requests: results });
// }

export async function GET() {}