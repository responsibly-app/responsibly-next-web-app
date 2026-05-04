import { tool, zodSchema } from "ai";
import { z } from "zod";

const markerIconSchema = z.union([
  z.object({
    type: z.literal("dot"),
    color: z.string().optional(),
    borderColor: z.string().optional(),
    radius: z.number().min(3).max(16).optional(),
  }),
  z.object({
    type: z.literal("emoji"),
    value: z.string().min(1),
    size: z.number().min(16).max(40).optional(),
    bgColor: z.string().optional(),
    borderColor: z.string().optional(),
  }),
  z.object({
    type: z.literal("image"),
    url: z.string().url(),
    width: z.number().min(16).max(64).optional(),
    height: z.number().min(16).max(64).optional(),
    borderRadius: z.number().min(0).max(999).optional(),
    borderColor: z.string().optional(),
  }),
]);

const markerSchema = z.object({
  id: z.string().min(1).optional(),
  lat: z.number().finite().min(-90).max(90),
  lng: z.number().finite().min(-180).max(180),
  label: z.string().optional(),
  description: z.string().optional(),
  tooltip: z.enum(["none", "hover", "always"]).optional(),
  icon: markerIconSchema.optional(),
});

const routeSchema = z.object({
  id: z.string().min(1).optional(),
  points: z
    .array(
      z.object({
        lat: z.number().finite().min(-90).max(90),
        lng: z.number().finite().min(-180).max(180),
      }),
    )
    .min(2),
  label: z.string().optional(),
  color: z.string().optional(),
  weight: z.number().min(1).max(12).optional(),
  opacity: z.number().min(0).max(1).optional(),
  dashArray: z.string().optional(),
  tooltip: z.enum(["none", "hover", "always"]).optional(),
});

export const showGeoMapTool = tool({
  description:
    "Render an interactive geographic map with markers and optional routes. Use when the user asks to visualize locations, places, or paths on a map.",
  inputSchema: zodSchema(
    z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      markers: z.array(markerSchema).min(1),
      routes: z.array(routeSchema).optional(),
      viewport: z
        .union([
          z.object({
            mode: z.literal("fit"),
            padding: z.number().nonnegative().optional(),
            maxZoom: z.number().min(1).max(22).optional(),
            target: z.enum(["markers", "routes", "all"]).optional(),
          }),
          z.object({
            mode: z.literal("center"),
            center: z.object({
              lat: z.number().finite().min(-90).max(90),
              lng: z.number().finite().min(-180).max(180),
            }),
            zoom: z.number().min(1).max(22),
          }),
        ])
        .optional(),
      clustering: z
        .object({
          enabled: z.boolean().optional(),
          radius: z.number().min(20).max(120).optional(),
          maxZoom: z.number().min(1).max(22).optional(),
          minPoints: z.number().min(2).max(20).optional(),
        })
        .optional(),
      showZoomControl: z.boolean().optional(),
      theme: z.enum(["light", "dark"]).optional(),
    }),
  ),
  execute: async (args) => ({ id: `geo-map-${Date.now()}`, ...args }),
});
