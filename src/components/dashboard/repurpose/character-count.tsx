"use client";

import { useI18n } from "@/contexts/i18n-provider";
import { dashboardBulkEn } from "@/messages/dashboard-bulk.en";
import { dashboardBulkHi } from "@/messages/dashboard-bulk.hi";

export function charDf(
  template: string,
  vars: Record<string, string | number>
): string {
  let s = template;
  for (const [k, v] of Object.entries(vars)) {
    s = s.replaceAll(`{${k}}`, String(v));
  }
  return s;
}

export function CharacterCount({
  content,
  platformId,
  maxLength,
  platformName,
}: {
  content: string;
  platformId: string;
  maxLength: number | null;
  platformName: string;
}) {
  const { locale } = useI18n();
  const d = locale === "hi" ? dashboardBulkHi : dashboardBulkEn;
  const c = d.charCount;
  const len = content.length;
  const isThread = platformId === "twitter_thread";
  const tweetLines = isThread
    ? content.split(/\n/).filter((l) => l.trim().length > 0)
    : [];
  const overLimit =
    maxLength != null &&
    (isThread
      ? tweetLines.some((l) => l.length > maxLength!)
      : len > maxLength);
  const overTweets =
    isThread && tweetLines.some((l) => l.length > 280)
      ? tweetLines.filter((l) => l.length > 280).length
      : 0;

  const isTwitterSingle = platformId === "twitter_single";
  const isInstagram = platformId === "instagram";
  const remaining = maxLength != null && !isThread ? maxLength - len : null;
  const firstLineLen =
    isInstagram || isThread ? (content.split("\n")[0]?.trim().length ?? 0) : 0;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      {isThread ? (
        <>
          <span>{charDf(c.threadTotal, { count: len })}</span>
          <span>·</span>
          <span>{c.threadEach280}</span>
          {tweetLines.length > 0 && (
            <span>
              (
              {tweetLines.map((l) => Math.max(0, 280 - l.length)).join(", ")}{" "}
              {c.threadLeftSuffix})
            </span>
          )}
          {overTweets > 0 && (
            <span className="text-amber-600 dark:text-amber-500 font-medium">
              {overTweets === 1
                ? c.tweetOverLimitOne
                : charDf(c.tweetOverLimitMany, { count: overTweets })}
            </span>
          )}
        </>
      ) : isTwitterSingle && maxLength != null ? (
        <>
          <span
            className={
              overLimit ? "text-amber-600 dark:text-amber-500 font-medium" : ""
            }
          >
            {len} / {maxLength}
          </span>
          <span>
            {charDf(c.leftParen, {
              count: remaining != null && remaining >= 0 ? remaining : 0,
            })}
          </span>
          {overLimit && (
            <span className="text-amber-600 dark:text-amber-500 font-medium">
              {c.overLimit}
            </span>
          )}
        </>
      ) : maxLength != null ? (
        <>
          <span
            className={
              overLimit ? "text-amber-600 dark:text-amber-500 font-medium" : ""
            }
          >
            {charDf(c.slashChars, { current: len, max: maxLength })}
          </span>
          {isInstagram && (
            <span title={c.firstLineTooltip}>
              {charDf(c.firstLineBadge, { current: firstLineLen })}
            </span>
          )}
          {overLimit && (
            <span className="text-amber-600 dark:text-amber-500 font-medium">
              {charDf(c.overLimitTrim, { platform: platformName })}
            </span>
          )}
        </>
      ) : (
        <span>{charDf(c.plainChars, { count: len })}</span>
      )}
    </div>
  );
}
