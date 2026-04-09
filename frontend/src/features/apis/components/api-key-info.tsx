import type { ApiKey, LimitType } from "@/features/api-keys/schemas";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
	formatCompactNumber,
	formatCurrency,
	formatTimeLong,
} from "@/utils/formatters";

export type ApiKeyInfoProps = {
	apiKey: ApiKey;
	usageSummary?: ApiKey["usageSummary"] | null;
	usageMessage?: string | null;
	allowUsageSummaryFallback?: boolean;
};

function formatExpiry(value: string | null, t: ReturnType<typeof useT>): string {
	if (!value) return t("commonNever");
	const parsed = formatTimeLong(value);
	return `${parsed.date} ${parsed.time}`;
}

function isExpired(apiKey: ApiKey): boolean {
	if (!apiKey.expiresAt) return false;
	return new Date(apiKey.expiresAt).getTime() < Date.now();
}

export function ApiKeyInfo({
	apiKey,
	usageSummary,
	usageMessage,
	allowUsageSummaryFallback = true,
}: ApiKeyInfoProps) {
	const t = useT();
	const expired = isExpired(apiKey);
	const models = apiKey.allowedModels?.join(", ") || t("commonAllModels");
	const enforcedModel = apiKey.enforcedModel || null;
	const enforcedEffort = apiKey.enforcedReasoningEffort || null;
	const usage = allowUsageSummaryFallback
		? (usageSummary ?? apiKey.usageSummary)
		: (usageSummary ?? null);
	const hasUsage = usage && usage.requestCount > 0;

	return (
		<div className="space-y-4 rounded-lg border bg-muted/30 p-4">
			<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
				{t("commonKeyDetails")}
			</h3>
			<dl className="space-y-2 text-xs">
				<div className="flex items-center justify-between gap-2">
					<dt className="text-muted-foreground">{t("commonPrefix")}</dt>
					<dd className="font-mono font-medium">{apiKey.keyPrefix}</dd>
				</div>
				<div className="flex items-center justify-between gap-2">
					<dt className="text-muted-foreground">{t("apiModels")}</dt>
					<dd className="text-right font-medium">{models}</dd>
				</div>
				{enforcedModel ? (
					<div className="flex items-center justify-between gap-2">
						<dt className="text-muted-foreground">{t("apiEnforcedModel")}</dt>
						<dd className="font-mono font-medium">{enforcedModel}</dd>
					</div>
				) : null}
				{enforcedEffort ? (
					<div className="flex items-center justify-between gap-2">
						<dt className="text-muted-foreground">{t("apiEnforcedEffort")}</dt>
						<dd className="font-medium">{enforcedEffort}</dd>
					</div>
				) : null}
				<div className="flex items-center justify-between gap-2">
					<dt className="text-muted-foreground">{t("commonExpiry")}</dt>
					<dd
						className={cn(
							"font-medium",
							expired ? "text-red-600 dark:text-red-400" : "",
						)}
					>
						{expired ? t("apiStatusExpired") : formatExpiry(apiKey.expiresAt, t)}
					</dd>
				</div>
				<div className="flex items-start justify-between gap-2">
					<dt className="text-muted-foreground">{t("apiUsage")}</dt>
					<dd className="text-right tabular-nums">
						{hasUsage ? (
							<span>
								<span className="font-medium">
									{formatCompactNumber(usage.totalTokens)} {t("commonTokensShort")}
								</span>
								<span className="mx-1 text-muted-foreground/40">|</span>
								<span className="font-medium">
									{formatCompactNumber(usage.cachedInputTokens)} {t("commonCachedShort")}
								</span>
								<span className="mx-1 text-muted-foreground/40">|</span>
								<span className="font-medium">
									{formatCompactNumber(usage.requestCount)} {t("commonRequestsShort")}
								</span>
								<span className="mx-1 text-muted-foreground/40">|</span>
								<span className="font-medium">
									{formatCurrency(usage.totalCostUsd)}
								</span>
							</span>
						) : (
							<span className="text-muted-foreground">
								{usageMessage ?? t("apiNoUsageRecorded")}
							</span>
						)}
					</dd>
				</div>
				<div className="space-y-1.5">
					<div className="flex items-center justify-between gap-2">
						<dt className="text-muted-foreground">{t("commonLimits")}</dt>
						<dd className="text-right tabular-nums">
							{apiKey.limits.length > 0 ? (
								<span className="font-medium">
									{t("apiConfiguredLimits", { count: apiKey.limits.length })}
								</span>
							) : (
								<span className="text-muted-foreground">
									{t("commonNoLimitsConfigured")}
								</span>
							)}
						</dd>
					</div>
					{apiKey.limits.map((limit) => {
						const isCost = limit.limitType === "cost_usd";
						const percent =
							limit.maxValue > 0
								? Math.min(100, (limit.currentValue / limit.maxValue) * 100)
								: 0;
						const current = isCost
							? `$${(limit.currentValue / 1_000_000).toFixed(2)}`
							: formatCompactNumber(limit.currentValue);
						const max = isCost
							? `$${(limit.maxValue / 1_000_000).toFixed(2)}`
							: formatCompactNumber(limit.maxValue);
						const modelFilter = limit.modelFilter || t("commonAll");

						return (
							<div key={limit.id} className="space-y-1 pl-2">
								<div className="flex items-center justify-between gap-2 text-xs tabular-nums">
									<span className="text-muted-foreground">
										{{
											total_tokens: t("apiLimitTypeTotalTokens"),
											input_tokens: t("apiLimitTypeInputTokens"),
											output_tokens: t("apiLimitTypeOutputTokens"),
											cost_usd: t("apiLimitTypeCostUsd"),
										}[limit.limitType as LimitType]} ({limit.limitWindow},{" "}
										{modelFilter})
									</span>
									<span className="font-medium">
										{current} / {max}
									</span>
								</div>
								<div className="h-1.5 w-full rounded-full bg-muted">
									<div
										className={cn(
											"h-full rounded-full transition-all",
											percent >= 90
												? "bg-red-500"
												: percent >= 70
													? "bg-orange-500"
													: "bg-primary",
										)}
										style={{ width: `${percent}%` }}
									/>
								</div>
							</div>
						);
					})}
				</div>
			</dl>
		</div>
	);
}
