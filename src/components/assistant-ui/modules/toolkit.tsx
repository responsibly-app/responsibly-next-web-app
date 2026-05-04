"use client";

import { Tools, useAui, type Toolkit } from "@assistant-ui/react";
import { getWeatherTool } from "@/components/assistant-ui/tools/get_weather";
import { previewLinkTool } from "@/components/assistant-ui/tools/preview_link";

export const toolkit: Toolkit = {
  previewLink: previewLinkTool,
  get_weather: getWeatherTool,
};
