import { redirect } from "next/navigation";

/**
 * Redirect /dashboard/calendar → /dashboard/scheduled.
 * Calendar tab empty state (no pending posts) is handled in `ContentCalendar`.
 */
export default function CalendarRedirect() {
  redirect("/dashboard/scheduled");
}
