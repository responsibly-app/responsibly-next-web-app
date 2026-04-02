import { db } from "@/lib/db";
import { user } from "@/lib/db/schema/better-auth-schema";
import { eq } from "drizzle-orm";

export async function getUserRoleFromDB(userId: string): Promise<string | null> {
  const [result] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return result?.role ?? null;
}
