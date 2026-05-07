import { fetchWeatherWidgetData } from "~/src/components/assistant-ui/tools/weather/weatherAdapter";
import { tool, zodSchema } from "ai";
import { z } from "zod";

const meta = {
  name: "get_weather",
  description: "Get live weather data for a city",
  embeddingDescription:
    "Fetch current weather conditions for a given city, including temperature, humidity, and conditions. Use when the user asks about the weather, temperature, forecast, or climate in a specific location.",
} as const;

export const getWeather = {
  meta,
  tool: tool({
    description: meta.description,
    inputSchema: zodSchema(z.object({ city: z.string() })),
    execute: async ({ city }) => fetchWeatherWidgetData(city),
  }),
};
