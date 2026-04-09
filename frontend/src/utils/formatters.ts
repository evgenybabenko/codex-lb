import { RESET_ERROR_LABEL } from "@/utils/constants";
import { getCurrentLocale, getIntlLocale, getMessage } from "@/lib/i18n";

function createNumberFormatter() {
  return new Intl.NumberFormat(getIntlLocale());
}

function createCompactFormatter() {
  return new Intl.NumberFormat(getIntlLocale(), {
    notation: "compact",
    maximumFractionDigits: 2,
  });
}

function createMetricFormatter() {
  return new Intl.NumberFormat(getIntlLocale(), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function createCurrencyFormatter() {
  return new Intl.NumberFormat(getIntlLocale(), {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function createTimeFormatter() {
  return new Intl.DateTimeFormat(getIntlLocale(), {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function createDateFormatter() {
  return new Intl.DateTimeFormat(getIntlLocale(), {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function unitLabel(unit: "day" | "hour" | "minute"): string {
  if (getCurrentLocale() === "ru") {
    return { day: "д", hour: "ч", minute: "м" }[unit];
  }
  return { day: "d", hour: "h", minute: "m" }[unit];
}

function relativePrefix(): string {
  return getCurrentLocale() === "ru" ? "через " : "in ";
}

function capitalize(value: string): string {
  return value.length > 0 ? value[0].toUpperCase() + value.slice(1) : value;
}

export type FormattedDateTime = {
  time: string;
  date: string;
};

type TokenState = {
  state?: string | null;
};

type AccessTokenState = {
  expiresAt?: string | null;
};

export type AccountAuthStatus = {
  access?: AccessTokenState | null;
  refresh?: TokenState | null;
  idToken?: TokenState | null;
  subscriptionActiveStart?: string | null;
  subscriptionActiveUntil?: string | null;
  subscriptionLastChecked?: string | null;
};

export function formatSlug(value: string): string {
  if (!value) return "";
  const words = value.split("_");
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ");
}

export function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function parseDate(iso: string | null | undefined): Date | null {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatNumber(value: unknown): string {
  const numeric = toNumber(value);
  return numeric === null ? "--" : createNumberFormatter().format(numeric);
}

export function formatCompactNumber(value: unknown): string {
  const numeric = toNumber(value);
  return numeric === null ? "--" : createCompactFormatter().format(numeric);
}

export function formatCompactMetricNumber(value: unknown): string {
  const numeric = toNumber(value);
  if (numeric === null) {
    return "--";
  }

  const absolute = Math.abs(numeric);
  const sign = numeric < 0 ? "-" : "";
  if (absolute < 1_000) {
    return createMetricFormatter().format(numeric);
  }

  const units = [
    { value: 1_000_000_000_000, suffix: "T" },
    { value: 1_000_000_000, suffix: "B" },
    { value: 1_000_000, suffix: "M" },
    { value: 1_000, suffix: "K" },
  ];

  const unit = units.find((entry) => absolute >= entry.value);
  if (!unit) {
    return createMetricFormatter().format(numeric);
  }

  return `${sign}${createMetricFormatter().format(absolute / unit.value)}${unit.suffix}`;
}

export function formatAbsoluteQuotaPair(remaining: unknown, capacity: unknown): string {
  const remainingValue = Math.max(0, toNumber(remaining) ?? 0);
  const capacityValue = Math.max(0, toNumber(capacity) ?? 0);
  return `${formatNumber(remainingValue)}/${formatNumber(capacityValue)}`;
}

export function formatCurrency(value: unknown): string {
  const numeric = toNumber(value);
  return numeric === null ? "--" : createCurrencyFormatter().format(numeric);
}

export function formatPercent(value: unknown): string {
  const numeric = toNumber(value);
  if (numeric === null) {
    return "0%";
  }
  return `${Math.round(numeric)}%`;
}

export function formatPercentNullable(value: unknown): string {
  const numeric = toNumber(value);
  if (numeric === null) {
    return "--";
  }
  return `${Math.round(numeric)}%`;
}

export function formatPercentValue(value: unknown): number {
  const numeric = toNumber(value);
  return numeric === null ? 0 : Math.round(numeric);
}

export function formatRate(value: unknown): string {
  const numeric = toNumber(value);
  return numeric === null ? "--" : `${(numeric * 100).toFixed(1)}%`;
}

export function formatWindowMinutes(value: unknown): string {
  const minutes = toNumber(value);
  if (minutes === null || minutes <= 0) {
    return "--";
  }
  if (minutes % 1440 === 0) {
    return `${minutes / 1440}${unitLabel("day")}`;
  }
  if (minutes % 60 === 0) {
    return `${minutes / 60}${unitLabel("hour")}`;
  }
  return `${minutes}${unitLabel("minute")}`;
}

export function formatWindowLabel(
  key: "primary" | "secondary" | string,
  minutes: unknown,
): string {
  const formatted = formatWindowMinutes(minutes);
  if (formatted !== "--") {
    return formatted;
  }
  if (key === "secondary") {
    return "7d";
  }
  if (key === "primary") {
    return "5h";
  }
  return "--";
}

export function formatTokensWithCached(totalTokens: unknown, cachedInputTokens: unknown): string {
  const total = toNumber(totalTokens);
  if (total === null) {
    return "--";
  }
  const cached = toNumber(cachedInputTokens);
  if (cached === null || cached <= 0) {
    return formatCompactNumber(total);
  }
  return `${formatCompactNumber(total)} (${formatCompactNumber(cached)} ${capitalize(getMessage("commonCachedShort"))})`;
}

export function formatCachedTokensMeta(totalTokens: unknown, cachedInputTokens: unknown): string {
  const total = toNumber(totalTokens);
  const cached = toNumber(cachedInputTokens);
  if (total === null || total <= 0 || cached === null || cached <= 0) {
    return `${capitalize(getMessage("commonCachedShort"))}: --`;
  }
  const percent = Math.min(100, Math.max(0, (cached / total) * 100));
  return `${capitalize(getMessage("commonCachedShort"))}: ${formatCompactNumber(cached)} (${Math.round(percent)}%)`;
}

export function formatModelLabel(
  model: string | null | undefined,
  reasoningEffort: string | null | undefined,
  serviceTier?: string | null | undefined,
): string {
  const base = (model || "").trim();
  if (!base) {
    return "--";
  }
  const effort = (reasoningEffort || "").trim();
  const tier = (serviceTier || "").trim();
  const suffix = [effort, tier].filter(Boolean).join(", ");
  return suffix ? `${base} (${suffix})` : base;
}

export function formatTimeLong(iso: string | null | undefined): FormattedDateTime {
  const date = parseDate(iso);
  if (!date) {
    return { time: "--", date: "--" };
  }
  return {
    time: createTimeFormatter().format(date),
    date: createDateFormatter().format(date),
  };
}

export function formatDateShort(iso: string | null | undefined): string {
  const date = parseDate(iso);
  if (!date) {
    return "--";
  }
  return new Intl.DateTimeFormat(getIntlLocale(), {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatRelative(ms: number): string {
  const minutes = Math.ceil(ms / 60_000);
  if (minutes < 60) {
    return `${relativePrefix()}${minutes}${unitLabel("minute")}`;
  }
  const hours = Math.ceil(minutes / 60);
  if (hours < 24) {
    return `${relativePrefix()}${hours}${unitLabel("hour")}`;
  }
  const days = Math.ceil(hours / 24);
  return `${relativePrefix()}${days}${unitLabel("day")}`;
}

export function formatResetRelative(ms: number): string {
  if (ms <= 60_000) {
    return `${relativePrefix()}1${unitLabel("minute")}`;
  }

  const totalMinutes = Math.floor(ms / 60_000);
  if (totalMinutes < 60) {
    return `${relativePrefix()}${totalMinutes}${unitLabel("minute")}`;
  }

  if (totalMinutes < 1440) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0
      ? `${relativePrefix()}${hours}${unitLabel("hour")} ${minutes}${unitLabel("minute")}`
      : `${relativePrefix()}${hours}${unitLabel("hour")}`;
  }

  const totalHours = Math.floor(ms / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return hours > 0
    ? `${relativePrefix()}${days}${unitLabel("day")} ${hours}${unitLabel("hour")}`
    : `${relativePrefix()}${days}${unitLabel("day")}`;
}

export function formatCountdown(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds || 0));
  const minutes = Math.floor(clamped / 60);
  const remainder = clamped % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
}

export function formatQuotaResetLabel(resetAt: string | null | undefined): string {
  const date = parseDate(resetAt);
  if (!date || date.getTime() <= 0) {
    return RESET_ERROR_LABEL;
  }
  const diffMs = date.getTime() - Date.now();
  if (diffMs <= 0) {
    return getCurrentLocale() === "ru" ? "сейчас" : "now";
  }
  return formatResetRelative(diffMs);
}

export function formatQuotaResetMeta(
  resetAtSecondary: string | null | undefined,
  windowMinutesSecondary: unknown,
): string {
  const labelSecondary = formatQuotaResetLabel(resetAtSecondary);
  const windowSecondary = formatWindowLabel("secondary", windowMinutesSecondary);
  if (labelSecondary === RESET_ERROR_LABEL) {
    return getMessage("commonQuotaResetUnavailable");
  }
  return `${getMessage("commonTimeframe")} (${windowSecondary}) · ${labelSecondary}`;
}

export function truncateText(value: unknown, maxLen = 80): string {
  if (value === null || value === undefined) {
    return "";
  }
  const text = String(value);
  if (text.length <= maxLen) {
    return text;
  }
  if (maxLen <= 3) {
    return text.slice(0, maxLen);
  }
  return `${text.slice(0, maxLen - 1)}\u2026`;
}

export function formatAccessTokenLabel(auth: AccountAuthStatus | null | undefined): string {
  const expiresAt = auth?.access?.expiresAt;
  if (!expiresAt) {
    return getMessage("commonMissing");
  }
  const expiresDate = parseDate(expiresAt);
  if (!expiresDate) {
    return getMessage("commonUnknown");
  }
  const diffMs = expiresDate.getTime() - Date.now();
  if (diffMs <= 0) {
    return getMessage("commonExpired");
  }
  return `${getMessage("commonValid")} (${formatRelative(diffMs)})`;
}

export function formatRefreshTokenLabel(auth: AccountAuthStatus | null | undefined): string {
  const state = auth?.refresh?.state;
  const labelMap: Record<string, string> = {
    stored: getMessage("commonStored"),
    missing: getMessage("commonMissing"),
    expired: getMessage("commonExpired"),
  };
  return state && labelMap[state] ? labelMap[state] : getMessage("commonUnknown");
}

export function formatIdTokenLabel(auth: AccountAuthStatus | null | undefined): string {
  const state = auth?.idToken?.state;
  const labelMap: Record<string, string> = {
    parsed: getMessage("commonParsed"),
    unknown: getMessage("commonUnknown"),
  };
  return state && labelMap[state] ? labelMap[state] : getMessage("commonUnknown");
}

export function formatDateTimeLabel(value: string | null | undefined): string {
  const { date, time } = formatTimeLong(value);
  if (date === "--" || time === "--") {
    return "--";
  }
  return `${date} ${time}`;
}

export function toModels(value: string): string[] | undefined {
  const values = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return values.length > 0 ? values : undefined;
}

export function toModelsNullable(value: string): string[] | null {
  const values = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return values.length > 0 ? values : null;
}

export function toIsoDateTime(value: string): string | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

export function toIsoDateTimeNullable(value: string): string | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString();
}

export function toLocalDateTime(value: string | null): string {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const offset = date.getTimezoneOffset();
  const adjusted = new Date(date.getTime() - offset * 60_000);
  return adjusted.toISOString().slice(0, 16);
}
