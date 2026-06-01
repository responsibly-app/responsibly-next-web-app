import {
  Droplets,
  Wind,
  Thermometer,
  MapPin,
  Gauge,
  Sun,
  CloudSun,
  Cloudy,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudRainWind,
  CloudSnow,
  Snowflake,
  CloudLightning,
  CloudHail,
  Cloud,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export type WeatherIconName =
  | "sun"
  | "cloud-sun"
  | "cloudy"
  | "cloud-fog"
  | "cloud-drizzle"
  | "cloud-rain"
  | "cloud-rain-wind"
  | "cloud-snow"
  | "snowflake"
  | "cloud-lightning"
  | "cloud-hail"
  | "cloud";

export type WeatherProps = {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windGust: number;
  conditions: string;
  location: string;
  icon: WeatherIconName;
};

const ICON_MAP: Record<WeatherIconName, LucideIcon> = {
  sun: Sun,
  "cloud-sun": CloudSun,
  cloudy: Cloudy,
  "cloud-fog": CloudFog,
  "cloud-drizzle": CloudDrizzle,
  "cloud-rain": CloudRain,
  "cloud-rain-wind": CloudRainWind,
  "cloud-snow": CloudSnow,
  snowflake: Snowflake,
  "cloud-lightning": CloudLightning,
  "cloud-hail": CloudHail,
  cloud: Cloud,
};

type StatItemProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

function StatItem({ icon: Icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3">
      <Icon className="size-5 shrink-0 text-white/70" />
      <div className="min-w-0">
        <p className="text-xs text-white/60">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

export function Weather({
  temperature,
  feelsLike,
  humidity,
  windSpeed,
  windGust,
  conditions,
  location,
  icon,
}: WeatherProps) {
  const IconComponent = ICON_MAP[icon];

  return (
    <div className="p-px">
      <Card
        className={cn(
          "max-w-md w-full overflow-hidden border-0 ring-0",
          "bg-linear-to-br from-blue-500 to-blue-700 text-white gap-0 py-0",
        )}
      >
        <CardHeader className="px-5 pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/15 p-3">
                <IconComponent className="size-10 text-white" />
              </div>
              <div>
                <p className="text-4xl font-bold tracking-tight">{temperature}°C</p>
                <Badge
                  className="mt-1.5 border-white/30 bg-white/20 text-white hover:bg-white/20"
                  variant="outline"
                >
                  {conditions}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5">
              <MapPin className="size-3.5 text-white/80" />
              <span className="text-sm font-medium">{location}</span>
            </div>
          </div>
        </CardHeader>

        <Separator className="mx-5 w-auto bg-white/20" />

        <CardContent className="px-5 pb-5 pt-4">
          <div className="grid grid-cols-2 gap-2.5">
            <StatItem
              icon={Thermometer}
              label="Feels Like"
              value={`${feelsLike}°C`}
            />
            <StatItem
              icon={Droplets}
              label="Humidity"
              value={`${humidity}%`}
            />
            <StatItem
              icon={Wind}
              label="Wind Speed"
              value={`${windSpeed} km/h`}
            />
            <StatItem
              icon={Gauge}
              label="Wind Gust"
              value={`${windGust} km/h`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
