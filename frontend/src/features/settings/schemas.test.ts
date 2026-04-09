import { describe, expect, it } from "vitest";

import {
  DashboardSettingsSchema,
  SettingsUpdateRequestSchema,
} from "@/features/settings/schemas";

describe("DashboardSettingsSchema", () => {
  it("parses settings payload", () => {
    const parsed = DashboardSettingsSchema.parse({
      stickyThreadsEnabled: true,
      upstreamStreamTransport: "default",
      weeklyResetPreference: "disabled",
      prioritizeFullWeeklyCapacity: true,
      routingStrategy: "round_robin",
      openaiCacheAffinityMaxAgeSeconds: 300,
      spreadNewCodexSessions: true,
      spreadNewCodexSessionsWindowSeconds: 90,
      spreadNewCodexSessionsTopPoolSize: 4,
      importWithoutOverwrite: true,
      totpRequiredOnLogin: true,
      totpConfigured: false,
      apiKeyAuthEnabled: true,
    });

    expect(parsed.stickyThreadsEnabled).toBe(true);
    expect(parsed.upstreamStreamTransport).toBe("default");
    expect(parsed.routingStrategy).toBe("round_robin");
    expect(parsed.openaiCacheAffinityMaxAgeSeconds).toBe(300);
    expect(parsed.spreadNewCodexSessionsWindowSeconds).toBe(90);
    expect(parsed.importWithoutOverwrite).toBe(true);
    expect(parsed.apiKeyAuthEnabled).toBe(true);
  });
});

describe("SettingsUpdateRequestSchema", () => {
  it("accepts required fields and optional updates", () => {
    const parsed = SettingsUpdateRequestSchema.parse({
      stickyThreadsEnabled: false,
      upstreamStreamTransport: "websocket",
      weeklyResetPreference: "expiring_quota_priority",
      prioritizeFullWeeklyCapacity: false,
      routingStrategy: "usage_weighted",
      openaiCacheAffinityMaxAgeSeconds: 120,
      spreadNewCodexSessions: true,
      spreadNewCodexSessionsWindowSeconds: 30,
      spreadNewCodexSessionsTopPoolSize: 2,
      importWithoutOverwrite: true,
      totpRequiredOnLogin: true,
      apiKeyAuthEnabled: false,
    });

    expect(parsed.openaiCacheAffinityMaxAgeSeconds).toBe(120);
    expect(parsed.upstreamStreamTransport).toBe("websocket");
    expect(parsed.spreadNewCodexSessionsTopPoolSize).toBe(2);
    expect(parsed.importWithoutOverwrite).toBe(true);
    expect(parsed.routingStrategy).toBe("usage_weighted");
    expect(parsed.totpRequiredOnLogin).toBe(true);
    expect(parsed.apiKeyAuthEnabled).toBe(false);
  });

  it("accepts payload without optional fields", () => {
    const parsed = SettingsUpdateRequestSchema.parse({
      stickyThreadsEnabled: false,
      weeklyResetPreference: "earlier_reset",
      prioritizeFullWeeklyCapacity: true,
    });

    expect(parsed.upstreamStreamTransport).toBeUndefined();
    expect(parsed.importWithoutOverwrite).toBeUndefined();
    expect(parsed.totpRequiredOnLogin).toBeUndefined();
    expect(parsed.apiKeyAuthEnabled).toBeUndefined();
    expect(parsed.openaiCacheAffinityMaxAgeSeconds).toBeUndefined();
    expect(parsed.spreadNewCodexSessionsWindowSeconds).toBeUndefined();
  });

  it("rejects invalid types", () => {
    const result = SettingsUpdateRequestSchema.safeParse({
      stickyThreadsEnabled: "yes",
      weeklyResetPreference: "earlier_reset",
    });

    expect(result.success).toBe(false);
  });
});
