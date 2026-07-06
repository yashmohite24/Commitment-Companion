# Mobile dev — Expo Go

## Start

```cmd
npm.cmd start
```

Runs **`expo start --go --lan`** — Expo Go on your local network (phone and PC on the **same Wi‑Fi**).

## If QR scan fails

1. **Widen the terminal** so the QR code isn’t clipped.
2. Scan from **Expo Go** (not a generic QR app).
3. **Enter URL manually** — copy the `exp://192.168.x.x:8081` URL from the terminal into Expo Go.
4. **Disable VPN** on PC and phone.
5. Allow **Node.js** through Windows Firewall if prompted.

## Other options

| Command | Use when |
|---------|----------|
| `npm start` | Phone on same Wi‑Fi (default) |
| `npm run start:local` | Same as LAN; explicit local mode |
| `npm run android` | Android emulator (start emulator first) |
| `npm run web` | Browser smoke test (`http://localhost:8081/login`) |

## After changing `.env`

Stop the server (Ctrl+C) and run `npm start` again.
