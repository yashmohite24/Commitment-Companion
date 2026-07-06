import {
  corsPreflight,
  createServiceClient,
  errorResponse,
  getUserIdFromRequest,
  jsonResponse,
} from "../_shared/supabase.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return corsPreflight();
  if (req.method !== "POST") return errorResponse("Method not allowed", 405);

  const userId = await getUserIdFromRequest(req);
  if (!userId) return errorResponse("Unauthorized", 401);

  let body: { header?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  const header = String(body.header ?? "").trim();
  const message = String(body.message ?? "").trim();
  if (!header || !message) {
    return errorResponse("header and message are required");
  }
  if (header.length > 200 || message.length > 2000) {
    return errorResponse("header max 200 chars, message max 2000 chars");
  }

  const sheetId = Deno.env.get("GOOGLE_SHEET_ID");
  const serviceAccountJson = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON");
  if (!sheetId || !serviceAccountJson) {
    return errorResponse("Feedback not configured", 503);
  }

  try {
    const sa = JSON.parse(serviceAccountJson);
    const token = await getGoogleAccessToken(sa);
    const range = "Feedback!A:D";
    const values = [[new Date().toISOString(), userId, header, message]];

    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ values }),
      },
    );

    if (!res.ok) {
      console.error(await res.text());
      return errorResponse("Failed to write feedback", 500);
    }

    return jsonResponse({ ok: true });
  } catch (e) {
    console.error(e);
    return errorResponse(e instanceof Error ? e.message : "Internal error", 500);
  }
});

async function getGoogleAccessToken(sa: {
  client_email: string;
  private_key: string;
}): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = btoa(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }));

  const unsigned = `${header}.${claim}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned),
  );
  const jwt = `${unsigned}.${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}
