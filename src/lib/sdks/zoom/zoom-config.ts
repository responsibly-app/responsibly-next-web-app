/** "webhook" | "api" | "both" — controls how attendance is captured */
export const ZOOM_ATTENDANCE_MODE: "webhook" | "api" | "both" = "webhook";

/** Minutes after meeting end before the API sync job runs */
export const ZOOM_API_SYNC_DELAY_MINUTES = 15;

/** Milliseconds equivalent of ZOOM_API_SYNC_DELAY_MINUTES */
export const ZOOM_API_SYNC_DELAY_MS = ZOOM_API_SYNC_DELAY_MINUTES * 60_000;

/**
 * When true, raw per-session participant records are written to zoom_api_participant_record
 * for auditing. Attendance is fully processed either way.
 */
export const ZOOM_KEEP_PARTICIPANT_RECORDS = false;

/** Default settings applied when creating a Zoom meeting for an event */
export const ZOOM_MEETING_SETTINGS = {
  join_before_host: false,
  waiting_room: true,
  /**
 * 0 = auto-approve (registration required, instant approval)
 * 1 = manual approve
 * 2 = no registration required (default)
 */
  approval_type: 0, // without registration user email and registrant id won't be available.
  meeting_authentication: false,
} as const;
