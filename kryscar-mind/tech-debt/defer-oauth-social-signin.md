---
type: debt
summary: "Customer auth is email+password only — no OAuth / social sign-in (e.g. Google), deferred from the nav-auth MVP."
tags: [auth]
status: open
created: 2026-06-03
updated: 2026-06-03
related: ["[[customer-auth]]", "[[auth-portal]]"]
sources: []
severity: low
effort: med
---
## Problem
Sign-up / sign-in offer only email + password. Many customers expect a one-tap "Continue with Google". It was left out of the nav-auth MVP to keep scope tight.
## Fix
Add Better Auth `socialProviders` (start with Google), wire the provider credentials, and add the social button(s) to `AuthForm`. Low severity (email+password works), medium effort (provider setup + the BA account-linking story for users who later also use a password).
