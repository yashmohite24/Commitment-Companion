import {
  corsPreflight,
  createServiceClient,
  errorResponse,
  jsonResponse,
} from "../_shared/supabase.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsPreflight();
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email)) {
    return errorResponse("Please enter a valid email address.");
  }
  if (email.length > 320) {
    return errorResponse("Email is too long.");
  }

  const supabase = createServiceClient();

  const { data: existing } = await supabase
    .from("waitlist_signups")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    return errorResponse("This email is already on the waitlist.", 409);
  }

  const { error } = await supabase.from("waitlist_signups").insert({ email });

  if (error) {
    if (error.code === "23505") {
      return errorResponse("This email is already on the waitlist.", 409);
    }
    console.error(error);
    return errorResponse("Could not join the waitlist. Please try again.", 500);
  }

  return jsonResponse({ ok: true });
});
