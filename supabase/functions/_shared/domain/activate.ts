import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { dateRangeInclusive, deadlineInstant, todayInTimezone } from "../time.ts";

/** Activate draft challenge when ≥1 companion accepted and start date reached. */
export async function activateChallengeIfReady(
  supabase: SupabaseClient,
  challengeId: string,
): Promise<boolean> {
  const { data: challenge } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single();
  if (!challenge || challenge.status !== "draft") return false;

  const { count: accepted } = await supabase
    .from("companion_requests")
    .select("id", { count: "exact", head: true })
    .eq("challenge_id", challengeId)
    .eq("status", "accepted");

  if ((accepted ?? 0) < 1) return false;

  const today = todayInTimezone(new Date(), challenge.timezone);
  if (today < challenge.start_date) return false;

  await supabase
    .from("challenges")
    .update({ status: "active", activated_at: new Date().toISOString() })
    .eq("id", challengeId);

  const { data: acceptedRequests } = await supabase
    .from("companion_requests")
    .select("companion_user_id")
    .eq("challenge_id", challengeId)
    .eq("status", "accepted");

  for (const req of acceptedRequests ?? []) {
    await supabase.from("challenge_participations").upsert(
      {
        challenge_id: challengeId,
        companion_user_id: req.companion_user_id,
        status: "active",
      },
      { onConflict: "challenge_id,companion_user_id" },
    );
  }

  const dates = dateRangeInclusive(challenge.start_date, challenge.end_date);
  const rows = dates.map((d) => ({
    challenge_id: challengeId,
    check_in_date: d,
    status: "pending" as const,
    deadline_at: deadlineInstant(
      d,
      challenge.daily_deadline_time,
      challenge.timezone,
    ).toISOString(),
  }));

  if (rows.length > 0) {
    await supabase.from("daily_check_ins").upsert(rows, {
      onConflict: "challenge_id,check_in_date",
      ignoreDuplicates: true,
    });
  }

  await supabase.from("system_messages").insert({
    challenge_id: challengeId,
    message: "Challenge is now active.",
    message_type: "challenge_activated",
  });

  return true;
}
