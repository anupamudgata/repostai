// src/lib/analytics/events.ts
export const AnalyticsEvent = {
  PAGE_LANDING_VIEWED:   "page_landing_viewed",
  PAGE_PRICING_VIEWED:   "page_pricing_viewed",
  CTA_CLICKED:           "cta_clicked",
  AUTH_SIGNUP_COMPLETED: "auth_signup_completed",
  AUTH_LOGIN_COMPLETED:  "auth_login_completed",
  REPURPOSE_STARTED:     "repurpose_started",
  REPURPOSE_COMPLETED:   "repurpose_completed",
  REPURPOSE_FAILED:      "repurpose_failed",
  OUTPUT_COPIED:         "output_copied",
  OUTPUT_REGENERATED:    "output_regenerated",
  INPUT_URL_USED:        "input_url_used",
  INPUT_YOUTUBE_USED:    "input_youtube_used",
  INPUT_TEXT_USED:       "input_text_used",
  BRAND_VOICE_CREATED:   "brand_voice_created",
  BRAND_VOICE_APPLIED:   "brand_voice_applied",
  LANGUAGE_CHANGED:      "language_changed",
  FREE_LIMIT_HIT:        "free_limit_hit",
  UPGRADE_CLICKED:       "upgrade_clicked",
  PLAN_UPGRADED:         "plan_upgraded",
  PLAN_CANCELLED:        "plan_cancelled",
  HISTORY_VIEWED:        "history_viewed",
  HISTORY_ITEM_OPENED:   "history_item_opened",
} as const;

export type AnalyticsEventName = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];
