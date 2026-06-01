import { and, asc, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { chatMessage, chatThread, chatTokenUsage } from "@/lib/db/schema/chat-schema";
import { ORPCError } from "@orpc/server";
import { authed } from "@/lib/orpc/base";
import { generateText } from "ai";
import { titleGenerationModel } from "@/lib/ai/models";
import { currentDate, currentMonthStart } from "@/lib/ai/quota";
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


export const chatRouter = {
  listThreads: authed
    .route({ method: "GET", path: "/chat/threads", summary: "List chat threads", tags: ["Chat"] })
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
    .route({ method: "POST", path: "/chat/threads", summary: "Create chat thread", tags: ["Chat"] })
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
    .route({ method: "GET", path: "/chat/threads/{id}", summary: "Get chat thread", tags: ["Chat"] })
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
    .route({ method: "PATCH", path: "/chat/threads/{id}", summary: "Update chat thread", tags: ["Chat"] })
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
    .route({ method: "DELETE", path: "/chat/threads/{id}", summary: "Delete chat thread", tags: ["Chat"] })
    .input(DeleteThreadInputSchema)
    .handler(async ({ input, context }) => {
      await db
        .delete(chatThread)
        .where(and(eq(chatThread.id, input.id), eq(chatThread.userId, context.session.user.id)));
    }),

  listMessages: authed
    .route({ method: "GET", path: "/chat/threads/{threadId}/messages", summary: "List thread messages", tags: ["Chat"] })
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
        createdAt: m.createdAt,
      }));
    }),

  addMessage: authed
    .route({ method: "POST", path: "/chat/threads/{threadId}/messages", summary: "Add message to thread", tags: ["Chat"] })
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
    .route({ method: "POST", path: "/chat/threads/{id}/title", summary: "Generate thread title", tags: ["Chat"] })
    .input(GenerateTitleInputSchema)
    .output(GenerateTitleOutputSchema)
    .handler(async ({ input, context }) => {
      const [thread] = await db
        .select({ id: chatThread.id })
        .from(chatThread)
        .where(and(eq(chatThread.id, input.id), eq(chatThread.userId, context.session.user.id)));
      if (!thread) throw new ORPCError("NOT_FOUND");

      const firstUserMessage = input.messages.find((m) => m.role === "user");
      const firstUserText = firstUserMessage?.content
        .filter((p) => p.type === "text")
        .map((p) => p.text ?? "")
        .join(" ") ?? "";
      const firstFilename = firstUserMessage?.content
        .find((p) => p.type !== "text" && p.filename)
        ?.filename;

      if (!firstUserText && !firstFilename) return { title: "New Chat" };

      let title: string;
      if (firstUserText) {
        const { text } = await generateText({
          model: titleGenerationModel,
          prompt: `Generate a short title (max 6 words, no punctuation at end) for a conversation starting with: "${firstUserText.slice(0, 300)}"`,
        });
        title = text.trim();
      } else {
        title = `File: ${firstFilename}`;
      }

      await db
        .update(chatThread)
        .set({ title, updatedAt: new Date() })
        .where(eq(chatThread.id, input.id));

      return { title };
    }),

  getTokenUsage: authed
    .route({ method: "GET", path: "/chat/token-usage", summary: "Get token usage", tags: ["Chat"] })
    .output(TokenUsageOutputSchema)
    .handler(async ({ context }) => {
      const today = currentDate();
      const monthStart = currentMonthStart();
      const userId = context.session.user.id;

      const rows = await db
        .select()
        .from(chatTokenUsage)
        .where(and(eq(chatTokenUsage.userId, userId), gte(chatTokenUsage.date, monthStart)));

      const zero = { inputTokens: 0, outputTokens: 0, totalTokens: 0, reasoningTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, noCacheInputTokens: 0, textOutputTokens: 0 };

      function pickTier(subset: typeof rows) {
        return subset.reduce(
          (acc, r) => ({
            inputTokens: acc.inputTokens + r.inputTokens,
            outputTokens: acc.outputTokens + r.outputTokens,
            totalTokens: acc.totalTokens + r.totalTokens,
            reasoningTokens: acc.reasoningTokens + r.reasoningTokens,
            cacheReadTokens: acc.cacheReadTokens + r.cacheReadTokens,
            cacheWriteTokens: acc.cacheWriteTokens + r.cacheWriteTokens,
            noCacheInputTokens: acc.noCacheInputTokens + r.noCacheInputTokens,
            textOutputTokens: acc.textOutputTokens + r.textOutputTokens,
          }),
          { ...zero },
        );
      }

      const todayRows = rows.filter((r) => r.date === today);
      const monthRows = rows;

      return {
        today: {
          date: today,
          primary: pickTier(todayRows.filter((r) => r.modelTier === "primary")),
          fallback: pickTier(todayRows.filter((r) => r.modelTier === "fallback")),
        },
        month: {
          period: monthStart.slice(0, 7),
          primary: pickTier(monthRows.filter((r) => r.modelTier === "primary")),
          fallback: pickTier(monthRows.filter((r) => r.modelTier === "fallback")),
        },
      };
    }),
};
