/**
 * Returns the current calendar date (YYYY-MM-DD) in the given IANA timezone.
 * Uses en-CA locale which formats as YYYY-MM-DD natively.
 */
export function localDateStr(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(new Date());
}

/**
 * Returns a date string (YYYY-MM-DD) offset by `offsetDays` from today in the given timezone.
 * Operates on the UTC noon of the local date to avoid DST edge cases.
 */
export function localDateStrOffset(timezone: string, offsetDays: number): string {
  const today = localDateStr(timezone);
  const d = new Date(today + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

/**
 * Returns the auto-detected browser timezone (IANA string, e.g. "America/New_York").
 * Falls back to "UTC" if unavailable.
 */
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  } catch {
    return "UTC";
  }
}

export type TimezoneOption = {
  value: string;
  label: string;
  region: string;
};

/**
 * A curated list of commonly used IANA timezones grouped by region.
 * Displayed as "Region/City (UTC±offset)" in the UI.
 */
export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  // UTC
  { value: "UTC", label: "UTC", region: "UTC" },

  // Americas
  { value: "America/New_York", label: "Eastern Time — New York", region: "Americas" },
  { value: "America/Chicago", label: "Central Time — Chicago", region: "Americas" },
  { value: "America/Denver", label: "Mountain Time — Denver", region: "Americas" },
  { value: "America/Phoenix", label: "Mountain Time (no DST) — Phoenix", region: "Americas" },
  { value: "America/Los_Angeles", label: "Pacific Time — Los Angeles", region: "Americas" },
  { value: "America/Anchorage", label: "Alaska — Anchorage", region: "Americas" },
  { value: "Pacific/Honolulu", label: "Hawaii — Honolulu", region: "Americas" },
  { value: "America/Toronto", label: "Eastern Time — Toronto", region: "Americas" },
  { value: "America/Vancouver", label: "Pacific Time — Vancouver", region: "Americas" },
  { value: "America/Mexico_City", label: "Central Time — Mexico City", region: "Americas" },
  { value: "America/Bogota", label: "Colombia — Bogotá", region: "Americas" },
  { value: "America/Lima", label: "Peru — Lima", region: "Americas" },
  { value: "America/Santiago", label: "Chile — Santiago", region: "Americas" },
  { value: "America/Sao_Paulo", label: "Brazil — São Paulo", region: "Americas" },
  { value: "America/Buenos_Aires", label: "Argentina — Buenos Aires", region: "Americas" },
  { value: "America/Caracas", label: "Venezuela — Caracas", region: "Americas" },

  // Europe
  { value: "Europe/London", label: "UK — London", region: "Europe" },
  { value: "Europe/Dublin", label: "Ireland — Dublin", region: "Europe" },
  { value: "Europe/Lisbon", label: "Portugal — Lisbon", region: "Europe" },
  { value: "Europe/Paris", label: "France — Paris", region: "Europe" },
  { value: "Europe/Madrid", label: "Spain — Madrid", region: "Europe" },
  { value: "Europe/Rome", label: "Italy — Rome", region: "Europe" },
  { value: "Europe/Berlin", label: "Germany — Berlin", region: "Europe" },
  { value: "Europe/Amsterdam", label: "Netherlands — Amsterdam", region: "Europe" },
  { value: "Europe/Brussels", label: "Belgium — Brussels", region: "Europe" },
  { value: "Europe/Zurich", label: "Switzerland — Zürich", region: "Europe" },
  { value: "Europe/Stockholm", label: "Sweden — Stockholm", region: "Europe" },
  { value: "Europe/Oslo", label: "Norway — Oslo", region: "Europe" },
  { value: "Europe/Copenhagen", label: "Denmark — Copenhagen", region: "Europe" },
  { value: "Europe/Helsinki", label: "Finland — Helsinki", region: "Europe" },
  { value: "Europe/Warsaw", label: "Poland — Warsaw", region: "Europe" },
  { value: "Europe/Prague", label: "Czech Republic — Prague", region: "Europe" },
  { value: "Europe/Budapest", label: "Hungary — Budapest", region: "Europe" },
  { value: "Europe/Bucharest", label: "Romania — Bucharest", region: "Europe" },
  { value: "Europe/Athens", label: "Greece — Athens", region: "Europe" },
  { value: "Europe/Kiev", label: "Ukraine — Kyiv", region: "Europe" },
  { value: "Europe/Moscow", label: "Russia — Moscow", region: "Europe" },

  // Africa
  { value: "Africa/Cairo", label: "Egypt — Cairo", region: "Africa" },
  { value: "Africa/Johannesburg", label: "South Africa — Johannesburg", region: "Africa" },
  { value: "Africa/Lagos", label: "Nigeria — Lagos", region: "Africa" },
  { value: "Africa/Nairobi", label: "Kenya — Nairobi", region: "Africa" },
  { value: "Africa/Casablanca", label: "Morocco — Casablanca", region: "Africa" },

  // Middle East
  { value: "Asia/Dubai", label: "UAE — Dubai", region: "Middle East" },
  { value: "Asia/Riyadh", label: "Saudi Arabia — Riyadh", region: "Middle East" },
  { value: "Asia/Kuwait", label: "Kuwait", region: "Middle East" },
  { value: "Asia/Qatar", label: "Qatar — Doha", region: "Middle East" },
  { value: "Asia/Bahrain", label: "Bahrain — Manama", region: "Middle East" },
  { value: "Asia/Tehran", label: "Iran — Tehran", region: "Middle East" },
  { value: "Asia/Jerusalem", label: "Israel — Jerusalem", region: "Middle East" },
  { value: "Asia/Beirut", label: "Lebanon — Beirut", region: "Middle East" },
  { value: "Asia/Istanbul", label: "Turkey — Istanbul", region: "Middle East" },

  // Asia
  { value: "Asia/Karachi", label: "Pakistan — Karachi", region: "Asia" },
  { value: "Asia/Kolkata", label: "India — Mumbai/Delhi", region: "Asia" },
  { value: "Asia/Colombo", label: "Sri Lanka — Colombo", region: "Asia" },
  { value: "Asia/Dhaka", label: "Bangladesh — Dhaka", region: "Asia" },
  { value: "Asia/Kathmandu", label: "Nepal — Kathmandu", region: "Asia" },
  { value: "Asia/Almaty", label: "Kazakhstan — Almaty", region: "Asia" },
  { value: "Asia/Tashkent", label: "Uzbekistan — Tashkent", region: "Asia" },
  { value: "Asia/Yangon", label: "Myanmar — Yangon", region: "Asia" },
  { value: "Asia/Bangkok", label: "Thailand — Bangkok", region: "Asia" },
  { value: "Asia/Ho_Chi_Minh", label: "Vietnam — Ho Chi Minh", region: "Asia" },
  { value: "Asia/Jakarta", label: "Indonesia — Jakarta", region: "Asia" },
  { value: "Asia/Kuala_Lumpur", label: "Malaysia — Kuala Lumpur", region: "Asia" },
  { value: "Asia/Singapore", label: "Singapore", region: "Asia" },
  { value: "Asia/Manila", label: "Philippines — Manila", region: "Asia" },
  { value: "Asia/Shanghai", label: "China — Shanghai/Beijing", region: "Asia" },
  { value: "Asia/Hong_Kong", label: "Hong Kong", region: "Asia" },
  { value: "Asia/Taipei", label: "Taiwan — Taipei", region: "Asia" },
  { value: "Asia/Seoul", label: "South Korea — Seoul", region: "Asia" },
  { value: "Asia/Tokyo", label: "Japan — Tokyo", region: "Asia" },

  // Oceania
  { value: "Australia/Perth", label: "Australia — Perth", region: "Oceania" },
  { value: "Australia/Darwin", label: "Australia — Darwin", region: "Oceania" },
  { value: "Australia/Adelaide", label: "Australia — Adelaide", region: "Oceania" },
  { value: "Australia/Brisbane", label: "Australia — Brisbane", region: "Oceania" },
  { value: "Australia/Sydney", label: "Australia — Sydney", region: "Oceania" },
  { value: "Australia/Melbourne", label: "Australia — Melbourne", region: "Oceania" },
  { value: "Pacific/Auckland", label: "New Zealand — Auckland", region: "Oceania" },
  { value: "Pacific/Fiji", label: "Fiji — Suva", region: "Oceania" },
];

export const TIMEZONE_REGIONS = [...new Set(TIMEZONE_OPTIONS.map((t) => t.region))];

/**
 * Extracts the wall-clock time as "HH:mm" in the given timezone.
 * Used to pre-populate time inputs when editing an event.
 */
export function extractTimeInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

/** "9:00 AM" – time only, in the event's timezone. */
export function formatEventTime(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/** "Monday, April 7, 2024 · 9:00 AM" – full date+time in the event's timezone. */
export function formatEventDateTime(date: Date, timezone: string): string {
  const d = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
  return `${d} · ${formatEventTime(date, timezone)}`;
}

/** "Apr 7, 2024 · 9:00 AM" – short date+time in the event's timezone. */
export function formatEventDateShort(date: Date, timezone: string): string {
  const d = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
  return `${d} · ${formatEventTime(date, timezone)}`;
}

/** Returns YYYY-MM-DD for the given Date in the specified timezone (for day comparisons). */
export function dateInTimezone(date: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: timezone }).format(date);
}

/** Returns the short timezone abbreviation for a given date in the given timezone (e.g., "PDT", "EST", "UTC+5:30"). */
export function tzAbbr(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "short" }).formatToParts(date);
  return parts.find((p) => p.type === "timeZoneName")?.value ?? timezone;
}

/**
 * Converts a wall-clock date + time (HH:mm) in the given IANA timezone to a UTC ISO string.
 *
 * Strategy: treat the chosen date+time as UTC first (neutral starting point), then use
 * Intl.DateTimeFormat to discover what that UTC instant looks like in the target timezone,
 * compute the offset, and adjust. This is browser-timezone-independent.
 */
export function buildDateTimeInTimezone(date: Date, time: string, timezone: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");

  // Parse with Z so it is always UTC — never browser-local time
  const asUTC = new Date(`${year}-${month}-${day}T${hh}:${mm}:00Z`);

  // Find what local date/time asUTC represents in the target timezone
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(asUTC).reduce<Record<string, string>>((acc, p) => {
    if (p.type !== "literal") acc[p.type] = p.value;
    return acc;
  }, {});

  // Reinterpret that local representation as if it were UTC, giving us the offset anchor
  const tzAsUTCMs = Date.UTC(
    parseInt(parts.year),
    parseInt(parts.month) - 1,
    parseInt(parts.day),
    // hour12:false can return "24" for midnight in some environments
    parseInt(parts.hour) % 24,
    parseInt(parts.minute),
    0,
  );

  // offsetMs = asUTC − tzRepresentedAsUTC
  // Adding it converts our neutral UTC guess to the real UTC equivalent
  const offsetMs = asUTC.getTime() - tzAsUTCMs;
  return new Date(asUTC.getTime() + offsetMs).toISOString();
}
