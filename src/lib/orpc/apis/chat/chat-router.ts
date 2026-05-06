import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { chatMessage, chatThread, chatTokenUsage } from "@/lib/db/schema/chat-schema";
import { ORPCError } from "@orpc/server";
import { authed } from "@/lib/orpc/base";
import { generateText } from "ai";
import { titleGenerationModel } from "@/lib/ai-chat/models";
import { INPUT_TOKEN_QUOTA, OUTPUT_TOKEN_QUOTA } from "@/lib/ai-chat/quota";
import {
  AddMessageInputSchema,
  CreateThreadOutputSchema,
  DeleteThreadInputSchema,
  GenerateTitleInputSchema,
  GenerateTitleOutputSchema,
  GetThreadInputSchema,
  ListMessagesInputSchema,
  ListMessagesOutputSchema,
  ListThreadsInputSchema,
  ListThreadsOutputSchema,
  ThreadSchema,
  TokenUsageOutputSchema,
  UpdateThreadInputSchema,
} from "./chat-schemas";

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const chatRouter = {
  listThreads: authed
    .input(ListThreadsInputSchema)
    .output(ListThreadsOutputSchema)
    .handler(async ({ input, context }) => {
      return db
        .select()
        .from(chatThread)
        .where(eq(chatThread.userId, context.session.user.id))
        .orderBy(desc(chatThread.updatedAt))
        .limit(input.limit);
    }),

  createThread: authed
    .output(CreateThreadOutputSchema)
    .handler(async ({ context }) => {
      const id = crypto.randomUUID();
      await db.insert(chatThread).values({
        id,
        userId: context.session.user.id,
        title: null,
        status: "regular",
      });
      return { id };
    }),

  getThread: authed
    .input(GetThreadInputSchema)
    .output(ThreadSchema)
    .handler(async ({ input, context }) => {
      const [thread] = await db
        .select()
        .from(chatThread)
        .where(and(eq(chatThread.id, input.id), eq(chatThread.userId, context.session.user.id)));
      if (!thread) throw new ORPCError("NOT_FOUND");
      return thread;
    }),

  updateThread: authed
    .input(UpdateThreadInputSchema)
    .handler(async ({ input, context }) => {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.title !== undefined) updates.title = input.title;
      if (input.status !== undefined) updates.status = input.status;
      await db
        .update(chatThread)
        .set(updates)
        .where(and(eq(chatThread.id, input.id), eq(chatThread.userId, context.session.user.id)));
    }),

  deleteThread: authed
    .input(DeleteThreadInputSchema)
    .handler(async ({ input, context }) => {
      await db
        .delete(chatThread)
        .where(and(eq(chatThread.id, input.id), eq(chatThread.userId, context.session.user.id)));
    }),

  listMessages: authed
    .input(ListMessagesInputSchema)
    .output(ListMessagesOutputSchema)
    .handler(async ({ input, context }) => {
      const [thread] = await db
        .select({ id: chatThread.id })
        .from(chatThread)
        .where(and(eq(chatThread.id, input.threadId), eq(chatThread.userId, context.session.user.id)));
      if (!thread) throw new ORPCError("NOT_FOUND");

      const messages = await db
        .select()
        .from(chatMessage)
        .where(eq(chatMessage.threadId, input.threadId))
        .orderBy(asc(chatMessage.createdAt));

      return messages.map((m) => ({
        id: m.id,
        parent_id: m.parentId,
        format: m.format,
        content: m.content,
      }));
    }),

  addMessage: authed
    .input(AddMessageInputSchema)
    .handler(async ({ input, context }) => {
      const [thread] = await db
        .select({ id: chatThread.id })
        .from(chatThread)
        .where(and(eq(chatThread.id, input.threadId), eq(chatThread.userId, context.session.user.id)));
      if (!thread) throw new ORPCError("NOT_FOUND");

      await db.transaction(async (tx) => {
        await tx.insert(chatMessage).values({
          id: input.id,
          threadId: input.threadId,
          parentId: input.parent_id ?? null,
          format: input.format,
          content: input.content,
        });
        await tx
          .update(chatThread)
          .set({ updatedAt: new Date() })
          .where(eq(chatThread.id, input.threadId));
      });
    }),

  generateTitle: authed
    .input(GenerateTitleInputSchema)
    .output(GenerateTitleOutputSchema)
    .handler(async ({ input, context }) => {
      const [thread] = await db
        .select({ id: chatThread.id })
        .from(chatThread)
        .where(and(eq(chatThread.id, input.id), eq(chatThread.userId, context.session.user.id)));
      if (!thread) throw new ORPCError("NOT_FOUND");

      const firstUserText =
        input.messages
          .find((m) => m.role === "user")
          ?.content.filter((p) => p.type === "text")
          .map((p) => p.text ?? "")
          .join(" ") ?? "";

      if (!firstUserText) return { title: "New Chat" };

      const { text: title } = await generateText({
        model: titleGenerationModel,
        prompt: `Generate a short title (max 6 words, no punctuation at end) for a conversation starting with: "${firstUserText.slice(0, 300)}"`,
      });

      const trimmedTitle = title.trim();

      await db
        .update(chatThread)
        .set({ title: trimmedTitle, updatedAt: new Date() })
        .where(eq(chatThread.id, input.id));

      return { title: trimmedTitle };
    }),

  getTokenUsage: authed
    .output(TokenUsageOutputSchema)
    .handler(async ({ context }) => {
      const month = currentMonth();
      const [usage] = await db
        .select()
        .from(chatTokenUsage)
        .where(and(eq(chatTokenUsage.userId, context.session.user.id), eq(chatTokenUsage.month, month)));

      return {
        inputTokens: usage?.inputTokens ?? 0,
        outputTokens: usage?.outputTokens ?? 0,
        inputQuota: INPUT_TOKEN_QUOTA,
        outputQuota: OUTPUT_TOKEN_QUOTA,
        month,
      };
    }),
};
