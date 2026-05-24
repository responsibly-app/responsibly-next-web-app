import { and, desc, eq } from "drizzle-orm";
import { account } from "@/lib/db/schema/better-auth-schema";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/index";
import { symmetricDecrypt, symmetricEncrypt } from "better-auth/crypto";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CalendlyUser {
  uri: string;
  name: string;
  slug: string;
  email: string;
  scheduling_url: string;
  timezone: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  current_organization: string;
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  active: boolean;
  slug: string;
  scheduling_url: string;
  duration: number;
  kind: string;
  pooling_type: string | null;
  type: string;
  color: string;
  created_at: string;
  updated_at: string;
  internal_note: string | null;
  description_plain: string | null;
  description_html: string | null;
  profile: {
    type: string;
    name: string;
    owner: string;
  };
  secret: boolean;
  booking_method: string;
  custom_questions: unknown[];
  deleted_at: string | null;
}

export interface CalendlyScheduledEvent {
  uri: string;
  name: string;
  status: "active" | "canceled";
  start_time: string;
  end_time: string;
  event_type: string;
  location: {
    type?: string;
    location?: string | null;
    join_url?: string | null;
    status?: string | null;
  } | null;
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
  created_at: string;
  updated_at: string;
  event_memberships: Array<{
    user: string;
    user_email: string;
    user_name: string;
  }>;
  calendar_event: {
    kind: string;
    external_id: string;
  } | null;
}

export interface CalendlyPagination {
  count: number;
  next_page: string | null;
  previous_page: string | null;
  next_page_token: string | null;
  previous_page_token: string | null;
}

export interface CalendlyEventTypesResponse {
  collection: CalendlyEventType[];
  pagination: CalendlyPagination;
}

export interface CalendlyScheduledEventsResponse {
  collection: CalendlyScheduledEvent[];
  pagination: CalendlyPagination;
}

export interface CalendlyInvitee {
  uri: string;
  email: string;
  name: string;
  status: "active" | "canceled";
  timezone: string;
  created_at: string;
  updated_at: string;
  event: string;
  cancel_url: string;
  reschedule_url: string;
  rescheduled: boolean;
  old_invitee: string | null;
  new_invitee: string | null;
  text_reminder_number: string | null;
  no_show: { uri: string; created_at: string } | null;
  questions_and_answers: Array<{ question: string; answer: string; position: number }>;
}

export interface CalendlyInviteesResponse {
  collection: CalendlyInvitee[];
  pagination: CalendlyPagination;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

const CALENDLY_API_BASE = "https://api.calendly.com";

export class CalendlyClient {
  constructor(private readonly accessToken: string) { }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${CALENDLY_API_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        (body as { message?: string }).message ?? `Calendly API error ${res.status}`
      );
    }

    return res.json() as Promise<T>;
  }

  /** Get the authenticated Calendly user's profile. */
  async getMe(): Promise<CalendlyUser> {
    const res = await this.request<{ resource: CalendlyUser }>("/users/me");
    return res.resource;
  }

  /**
   * List event types for a user.
   * @param userUri The Calendly user URI (from getMe().uri)
   */
  async listEventTypes(
    userUri: string,
    params: { count?: number; page_token?: string } = {}
  ): Promise<CalendlyEventTypesResponse> {
    const query = new URLSearchParams({ user: userUri });
    if (params.count) query.set("count", String(params.count));
    if (params.page_token) query.set("page_token", params.page_token);
    return this.request<CalendlyEventTypesResponse>(`/event_types?${query}`);
  }

  /**
   * List scheduled events for a user.
   * @param userUri The Calendly user URI (from getMe().uri)
   */
  async listScheduledEvents(
    userUri: string,
    params: {
      count?: number;
      min_start_time?: string;
      max_start_time?: string;
      status?: "active" | "canceled";
      sort?: string;
      page_token?: string;
    } = {}
  ): Promise<CalendlyScheduledEventsResponse> {
    const query = new URLSearchParams({ user: userUri });
    if (params.count) query.set("count", String(params.count));
    if (params.min_start_time) query.set("min_start_time", params.min_start_time);
    if (params.max_start_time) query.set("max_start_time", params.max_start_time);
    if (params.status) query.set("status", params.status);
    if (params.sort) query.set("sort", params.sort);
    if (params.page_token) query.set("page_token", params.page_token);
    return this.request<CalendlyScheduledEventsResponse>(`/scheduled_events?${query}`);
  }

  /** Get a single scheduled event by UUID. */
  async getScheduledEvent(eventUuid: string): Promise<CalendlyScheduledEvent> {
    const res = await this.request<{ resource: CalendlyScheduledEvent }>(`/scheduled_events/${eventUuid}`);
    return res.resource;
  }

  /** List invitees for a scheduled event. */
  async listEventInvitees(
    eventUuid: string,
    params: {
      count?: number;
      status?: "active" | "canceled";
      sort?: string;
      page_token?: string;
    } = {}
  ): Promise<CalendlyInviteesResponse> {
    const query = new URLSearchParams();
    if (params.count) query.set("count", String(params.count));
    if (params.status) query.set("status", params.status);
    if (params.sort) query.set("sort", params.sort);
    if (params.page_token) query.set("page_token", params.page_token);
    const qs = query.toString();
    return this.request<CalendlyInviteesResponse>(
      `/scheduled_events/${eventUuid}/invitees${qs ? `?${qs}` : ""}`
    );
  }
}

// ---------------------------------------------------------------------------
// Token helpers: Better Auth's auth.api.getAccessToken throws on refresh failure
// instead of returning null, causing unhandled 500s. We handle decryption and
// refresh directly so failures return null cleanly.
// ---------------------------------------------------------------------------

function isLikelyEncrypted(token: string): boolean {
  if (token.startsWith("$ba$")) return true;
  return token.length % 2 === 0 && /^[0-9a-f]+$/i.test(token);
}

async function decryptToken(token: string): Promise<string> {
  const key = process.env.BETTER_AUTH_SECRET!;
  if (!isLikelyEncrypted(token)) return token;
  return symmetricDecrypt({ key, data: token });
}

async function encryptToken(token: string): Promise<string> {
  const key = process.env.BETTER_AUTH_SECRET!;
  return symmetricEncrypt({ key, data: token });
}

async function refreshCalendlyToken(
  accountId: string,
  encryptedRefreshToken: string
): Promise<string | null> {
  const refreshToken = await decryptToken(encryptedRefreshToken);

  const res = await fetch("https://auth.calendly.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.CALENDLY_CLIENT_ID!,
      client_secret: process.env.CALENDLY_CLIENT_SECRET!,
    }),
  });

  if (!res.ok) return null;

  const data = await res.json() as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (!data.access_token) return null;

  const newAccessToken = await encryptToken(data.access_token);
  const newRefreshToken = data.refresh_token
    ? await encryptToken(data.refresh_token)
    : encryptedRefreshToken;
  const newExpiresAt = data.expires_in
    ? new Date(Date.now() + data.expires_in * 1000)
    : null;

  await db
    .update(account)
    .set({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      ...(newExpiresAt && { accessTokenExpiresAt: newExpiresAt }),
    })
    .where(eq(account.id, accountId));

  return data.access_token;
}

async function resolveCalendlyToken(userId: string): Promise<string | null> {
  const [calendlyAccount] = await db
    .select()
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "calendly")))
    .orderBy(desc(account.updatedAt))
    .limit(1);

  if (!calendlyAccount?.accessToken) return null;

  const isExpiredOrExpiringSoon =
    calendlyAccount.accessTokenExpiresAt != null &&
    calendlyAccount.accessTokenExpiresAt.getTime() <= Date.now() + 60_000;

  if (isExpiredOrExpiringSoon) {
    if (!calendlyAccount.refreshToken) return null;
    return refreshCalendlyToken(calendlyAccount.id, calendlyAccount.refreshToken);
  }

  return decryptToken(calendlyAccount.accessToken);
}

// ---------------------------------------------------------------------------
// Factory: resolve decrypted access token and return a ready client
// ---------------------------------------------------------------------------

/**
 * Creates a CalendlyClient for the current request.
 * Auto-refreshes when the token is expiring within 60s.
 * Returns null if Calendly is not connected.
 */
export async function getCalendlyClient(
  headers: Headers
): Promise<CalendlyClient | null> {
  const session = await auth.api.getSession({ headers });
  if (!session?.user?.id) return null;

  const accessToken = await resolveCalendlyToken(session.user.id);
  if (!accessToken) return null;

  return new CalendlyClient(accessToken);
}

/**
 * Creates a CalendlyClient for a specific user by userId, without requiring
 * their session headers. Returns null if the user has no Calendly account connected.
 */
export async function getCalendlyClientForUser(
  userId: string
): Promise<CalendlyClient | null> {
  const accessToken = await resolveCalendlyToken(userId);
  if (!accessToken) return null;

  return new CalendlyClient(accessToken);
}

/**
 * Check whether a user has Calendly connected.
 */
export async function isCalendlyConnected(userId: string): Promise<boolean> {
  const [calendlyAccount] = await db
    .select({ id: account.id })
    .from(account)
    .where(and(eq(account.userId, userId), eq(account.providerId, "calendly")))
    .limit(1);

  return !!calendlyAccount;
}
