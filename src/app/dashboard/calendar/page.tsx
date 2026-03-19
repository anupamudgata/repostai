import { redirect } from "next/navigation";

/** Redirect /dashboard/calendar → /dashboard/scheduled (Calendar page) */
export default function CalendarRedirect() {
  redirect("/dashboard/scheduled");
}
