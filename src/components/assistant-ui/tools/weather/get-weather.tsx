"use client";

import {
  WeatherWidget,
  type WeatherWidgetProps,
} from "@/components/tool-ui/weather-widget/runtime";
import { type Toolkit } from "@assistant-ui/react";
import { z } from "zod";

const WeatherWidgetPayloadSchema = z.object({}).passthrough();

function safeParseWeatherWidgetPayload(
  input: unknown,
): WeatherWidgetProps | null {
  if (input == null || typeof input !== "object") return null;
  const result = WeatherWidgetPayloadSchema.safeParse(input);
  if (
    !result.success ||
    typeof result.data !== "object" ||
    result.data === null
  ) {
    return null;
  }
  const data = result.data as Record<string, unknown>;
  const current = data.current as { conditionCode?: string } | undefined;
  const forecast = data.forecast as unknown[];
  if (
    !current ||
    typeof current.conditionCode !== "string" ||
    !Array.isArray(forecast) ||
    forecast.length === 0
  ) {
    return null;
  }
  return {
    version: "3.1",
    ...(data as Omit<WeatherWidgetProps, "version">),
  };
}

export const getWeatherTool: Toolkit["get_weather"] = {
  description: "Display current weather and forecast for a location",
  parameters: WeatherWidgetPayloadSchema,
  render: ({ result, toolCallId }) => {
    if (result == null) return null;
    const parsed = safeParseWeatherWidgetPayload({
      version: "3.1",
      ...(result as Record<string, unknown>),
      id: (result as { id?: string })?.id ?? `weather-${toolCallId}`,
    });
    if (!parsed) return null;
    return <WeatherWidget effects={{ reducedMotion: true }} {...parsed} />;
  },
};
