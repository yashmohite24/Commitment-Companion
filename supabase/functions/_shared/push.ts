import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendExpoPush(messages: PushMessage[]): Promise<void> {
  if (messages.length === 0) return;

  const valid = messages.filter((m) => m.to.startsWith("ExponentPushToken"));
  if (valid.length === 0) return;

  const res = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(valid),
  });

  if (!res.ok) {
    console.error("Expo push failed:", await res.text());
  }
}

export async function pushToUsers(
  supabase: SupabaseClient,
  userIds: string[],
  title: string,
  body: string,
  data?: Record<string, string>,
): Promise<void> {
  if (userIds.length === 0) return;

  const { data: profiles } = await supabase
    .from("profiles")
    .select("expo_push_token")
    .in("id", userIds)
    .not("expo_push_token", "is", null);

  const messages: PushMessage[] = (profiles ?? [])
    .filter((p) => p.expo_push_token)
    .map((p) => ({
      to: p.expo_push_token as string,
      title,
      body,
      data,
    }));

  await sendExpoPush(messages);
}
