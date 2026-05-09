export type ModelTier = "primary" | "fallback";

// Primary model (gpt-5.4-mini) — strict daily quota
export const DAILY_INPUT_QUOTA = 100_000;
export const DAILY_OUTPUT_QUOTA = 50_000;

// Fallback model (gpt-5.4-nano) — more generous daily quota
export const FALLBACK_DAILY_INPUT_QUOTA = 1_000_000;
export const FALLBACK_DAILY_OUTPUT_QUOTA = 50_000;
