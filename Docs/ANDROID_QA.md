# Android emulator QA

Manual testing on Android Studio emulator (Windows).

## One-time setup

1. **Android Studio** → SDK Manager → install **Android SDK Platform** (API 34+) and **Android SDK Platform-Tools**.
2. **Device Manager** → Create Virtual Device (e.g. Pixel 6, API 34) → Finish.
3. Set environment variables (System → Environment Variables):

   | Variable | Example |
   |----------|---------|
   | `ANDROID_HOME` | `C:\Users\<you>\AppData\Local\Android\Sdk` |
   | Path entry | `%ANDROID_HOME%\platform-tools` |

4. **App env:** `cd app` → copy `.env.example` to `.env` and set `EXPO_PUBLIC_SUPABASE_ANON_KEY`.

## Run on emulator

```powershell
# Terminal 1 — start emulator from Android Studio Device Manager (Play button)

# Terminal 2
cd D:\Development\commitment-app\app
npm install
npm run android:emulator
```

`android:emulator` checks `adb devices`, then starts Expo and opens the app on the running emulator via Expo Go.

If LAN fails (common on corporate Wi‑Fi), use tunnel:

```powershell
npx expo start --go --android --tunnel
```

## Dev test accounts

| Role | Email | Password |
|------|-------|----------|
| Challenger | `challenger@test.local` | `password123` |
| Companion | `companion@test.local` | `password123` |

Requires `EXPO_PUBLIC_DEV_SKIP_AUTH=true` in `app/.env`.

## Bug 15 / US 9 — Companion proof verify

1. Sign in as **challenger** → create/active challenge → **Check In** with a photo.
2. Sign out → sign in as **companion** → Companion tab → open challenge.
3. **Expected:** Amber **Verify proof of work** card at top with image preview, Accept/Reject.
4. Tap image → fullscreen → Close → Accept or Reject.
5. If preview fails, tap **Retry** and confirm `challenge-actions` is deployed (`get_proof_download_urls`).

## Deploy backend after proof-media changes

```powershell
cd D:\Development\commitment-app
.\scripts\deploy-backend.ps1
```

Redeploys migrations and `challenge-actions` Edge Function.
