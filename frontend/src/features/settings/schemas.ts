import { z } from "zod";

export const RoutingStrategySchema = z.enum(["usage_weighted", "round_robin", "capacity_weighted"]);
export const UpstreamStreamTransportSchema = z.enum(["default", "auto", "http", "websocket"]);
export const WeeklyResetPreferenceSchema = z.enum([
  "disabled",
  "earlier_reset",
  "expiring_quota_priority",
]);

export const DashboardSettingsSchema = z.object({
  stickyThreadsEnabled: z.boolean(),
  upstreamStreamTransport: UpstreamStreamTransportSchema,
  weeklyResetPreference: WeeklyResetPreferenceSchema,
  prioritizeFullWeeklyCapacity: z.boolean().optional(),
  routingStrategy: RoutingStrategySchema,
  openaiCacheAffinityMaxAgeSeconds: z.number().int().positive(),
  spreadNewCodexSessions: z.boolean(),
  spreadNewCodexSessionsWindowSeconds: z.number().int().positive(),
  spreadNewCodexSessionsTopPoolSize: z.number().int().positive(),
  importWithoutOverwrite: z.boolean(),
  totpRequiredOnLogin: z.boolean(),
  totpConfigured: z.boolean(),
  apiKeyAuthEnabled: z.boolean(),
});

export const SettingsUpdateRequestSchema = z.object({
  stickyThreadsEnabled: z.boolean(),
  upstreamStreamTransport: UpstreamStreamTransportSchema.optional(),
  weeklyResetPreference: WeeklyResetPreferenceSchema,
  prioritizeFullWeeklyCapacity: z.boolean().optional(),
  routingStrategy: RoutingStrategySchema.optional(),
  openaiCacheAffinityMaxAgeSeconds: z.number().int().positive().optional(),
  spreadNewCodexSessions: z.boolean().optional(),
  spreadNewCodexSessionsWindowSeconds: z.number().int().positive().optional(),
  spreadNewCodexSessionsTopPoolSize: z.number().int().positive().optional(),
  importWithoutOverwrite: z.boolean().optional(),
  totpRequiredOnLogin: z.boolean().optional(),
  apiKeyAuthEnabled: z.boolean().optional(),
});

export type DashboardSettings = z.infer<typeof DashboardSettingsSchema>;
export type SettingsUpdateRequest = z.infer<typeof SettingsUpdateRequestSchema>;
export type WeeklyResetPreference = z.infer<typeof WeeklyResetPreferenceSchema>;
