/**
 * Better Auth browser client (React). Same-origin — passes NO `baseURL`, so it
 * always calls the current origin's /api/auth/*. Used by the sign-in / sign-up
 * pages and any client component that needs the session.
 */
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
