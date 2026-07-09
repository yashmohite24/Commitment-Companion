# Auth — Sign Up, Login, OTP

**Routes:** `/signup`, `/login`, `/signup-verify`  
**PRD:** US-10, US-11

## Sign Up

### Fields

| Field | Type | Validation message (warm) |
|-------|------|---------------------------|
| First name | text | Let's use your first name |
| Last name | text | And your last name |
| Country | dropdown | — |
| Phone | phone | We'll send a verification code |
| Email | email | That email doesn't look right |
| Password | password | At least 7 chars, one uppercase |

### Components

- `TextInput` × 6
- `Button` primary "Create account"
- Link to login

### Duplicate user

Snackbar: "Looks like you already have an account — want to log in instead?"

## Login

- Phone + password
- `Button` primary "Welcome back"
- Link to signup

## OTP Verify

- 6-digit input cells
- Resend link (disabled 2 min): "Send another code"
- Mismatch: "That code didn't work — try again or edit your details"

## Visual

- Cream background, white input cards
- Forest primary CTA
- No harsh red errors — coral tint for field errors
