import { fetchWeatherWidgetData } from "~/src/components/assistant-ui/tools/weather/weatherAdapter";
import { tool, zodSchema } from "ai";
import { z } from "zod";

export const getWeatherTool = tool({
  description: "Get live weather data for a city",
  inputSchema: zodSchema(z.object({ city: z.string() })),
  execute: async ({ city }) => fetchWeatherWidgetData(city),
});
