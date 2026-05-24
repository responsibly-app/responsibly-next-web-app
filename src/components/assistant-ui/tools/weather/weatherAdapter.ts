import type { WeatherIconName, WeatherProps } from "./weather";

const ICON_MAP: Record<number, WeatherIconName> = {
  0: "sun",
  1: "cloud-sun",
  2: "cloud-sun",
  3: "cloudy",
  45: "cloud-fog",
  48: "cloud-fog",
  51: "cloud-drizzle",
  53: "cloud-drizzle",
  55: "cloud-drizzle",
  61: "cloud-rain",
  63: "cloud-rain",
  65: "cloud-rain-wind",
  71: "cloud-snow",
  73: "cloud-snow",
  75: "cloud-snow",
  77: "snowflake",
  80: "cloud-rain",
  81: "cloud-rain",
  82: "cloud-rain-wind",
  85: "cloud-snow",
  86: "cloud-snow",
  95: "cloud-lightning",
  96: "cloud-hail",
  99: "cloud-hail",
};

const CONDITION_MAP: Record<number, string> = {
  0: "Clear Sky",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light Drizzle",
  53: "Drizzle",
  55: "Heavy Drizzle",
  61: "Light Rain",
  63: "Rain",
  65: "Heavy Rain",
  71: "Light Snow",
  73: "Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Rain Showers",
  81: "Rain Showers",
  82: "Heavy Showers",
  85: "Snow Showers",
  86: "Heavy Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm w/ Hail",
  99: "Thunderstorm w/ Hail",
};

export async function fetchWeatherWidgetData(city: string): Promise<WeatherProps> {
  const geoRes = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
  );
  const geoData = await geoRes.json();

  if (!geoData?.results?.length) {
    throw new Error("City not found");
  }

  const { latitude, longitude, name, timezone } = geoData.results[0];

  const weatherRes = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,wind_gusts_10m,weather_code` +
      `&timezone=${timezone}`,
  );
  const weatherData = await weatherRes.json();

  const c = weatherData.current;
  const code: number = c.weather_code ?? 0;

  return {
    temperature: Math.round(c.temperature_2m),
    feelsLike: Math.round(c.apparent_temperature),
    humidity: Math.round(c.relative_humidity_2m),
    windSpeed: Math.round(c.wind_speed_10m),
    windGust: Math.round(c.wind_gusts_10m),
    conditions: CONDITION_MAP[code] ?? "Unknown",
    location: name,
    icon: ICON_MAP[code] ?? "cloud",
  };
}
