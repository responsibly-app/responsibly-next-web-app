"use client";

import { type Toolkit } from "@assistant-ui/react";
import { z } from "zod";
import { Weather, type WeatherProps } from "./weather";

export const getWeatherTool: Toolkit["get_weather"] = {
  description: "Display current weather for a location",
  parameters: z.looseObject({}),
  render: ({ result }) => {
    if (result == null) return null;
    const data = result as WeatherProps;
    if (!data.location || data.temperature == null) return null;
    return <Weather {...data} />;
  },
};
