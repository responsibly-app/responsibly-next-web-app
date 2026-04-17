# Zoom Marketplace App Submission — Test Plan
**App:** Responsibly
**Integration type:** OAuth 2.0 (user-level, read-only)
**Scopes requested:** `user:read:user`, `meeting:read:meeting`

---

## Overview

Responsibly is a personal performance dashboard. The Zoom integration allows a user to connect their Zoom account so that upcoming meetings are displayed inside the Responsibly dashboard and contribute to the user's XP score and consistency streak. The integration is strictly read-only — Responsibly never creates, modifies, or deletes any Zoom data.

---

## Test account credentials

> A free, self-service Zoom account is sufficient to test this integration.
> No paid or subscriber-level Zoom account is required.

**Responsibly test account**

| Field    | Value                      |
|----------|----------------------------|
| URL      | https://responsibly.work   |
| Email    | *(provided in the Test account and credentials field of the App Submission form)* |
| Password | *(provided in the Test account and credentials field of the App Submission form)* |

The test account is pre-loaded with an active Responsibly session. You will connect your own Zoom account during the review.

---

## Scope 1 — `user:read:user`

**Purpose:** Fetch the connected user's profile (display name, email, avatar) to show inside the integration panel.

### Steps

1. Go to **https://responsibly.work** and sign in with the test credentials above.
2. In the left sidebar, click **Integrations**.
3. Click the **Zoom** integration card.
4. Click **Connect Zoom**.
   - You will be redirected to `zoom.us/oauth/authorize`.
5. On the Zoom authorization page, sign in with **your own Zoom account** (or any test Zoom account) and click **Allow**.
6. You will be redirected back to `https://responsibly.work/dashboard/integrations/zoom`.

**Expected result:** The integration panel shows the connected user's **full name**, **email address**, and **avatar** pulled from the Zoom profile.

**This verifies `user:read:user`.**

---

## Scope 2 — `meeting:read:meeting`

**Purpose:** Fetch the user's upcoming scheduled Zoom meetings (topic, start time, duration, join URL) to display in the dashboard.

### Pre-condition

Schedule at least one future Zoom meeting on the Zoom account used in Step 5 above, so there is data to verify.

### Steps

*(Continue from Scope 1 — no reconnection needed)*

7. After completing the OAuth flow, scroll down to the **Upcoming meetings** card on the integration page.

**Expected result:** The card lists upcoming Zoom meetings with:
- Meeting **topic**
- **Date** and **time**
- **Duration** (in minutes)
- An **external link icon** that opens the meeting's join URL in a new tab

If no future meetings are scheduled on the test Zoom account, the card shows "No upcoming meetings".

**This verifies `meeting:read:meeting`.**

---

## Disconnect / deauthorization

### Steps

8. Click the **Disconnect** button in the connected account card at the top of the Zoom integration page.

**Expected result:**
- The page returns to the "not connected" state.
- The upcoming meetings card is no longer shown.
- All stored OAuth tokens and cached meeting data are deleted from Responsibly's database immediately.

### Independent revocation (optional)

The user can also revoke access from their Zoom account:

1. Sign in to [marketplace.zoom.us](https://marketplace.zoom.us).
2. Click **Manage** (top right) → **Added Apps**.
3. Find **Responsibly** and click **Remove**.

Responsibly handles Zoom's Deauthorization Event Notification via a registered webhook endpoint and revokes the stored access token upon receipt.

---

## Scope justification summary

| Scope | Used for | API call |
|-------|----------|----------|
| `user:read:user` | Display connected account name, email, and avatar | `GET /v2/users/me` |
| `meeting:read:meeting` | List upcoming meetings in the dashboard | `GET /v2/users/me/meetings?type=upcoming` |

No other scopes are requested. Responsibly does not access recordings, webinars, chat messages, contacts, or any administrative settings.
