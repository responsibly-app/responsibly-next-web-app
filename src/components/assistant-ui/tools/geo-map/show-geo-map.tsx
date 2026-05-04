"use client";

import dynamic from "next/dynamic";
import { type Toolkit } from "@assistant-ui/react";
import { safeParseSerializableGeoMap } from "@/components/tool-ui/geo-map/schema";

const GeoMap = dynamic(
  () => import("@/components/tool-ui/geo-map").then((m) => m.GeoMap),
  { ssr: false },
);

export const showGeoMapTool: Toolkit["show_geo_map"] = {
  type: "backend",
  render: ({ result }) => {
    const parsed = safeParseSerializableGeoMap(result);
    if (!parsed) return null;
    return <GeoMap {...parsed} />;
  },
};
