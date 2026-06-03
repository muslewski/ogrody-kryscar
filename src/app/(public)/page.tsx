// The root homepage now renders example-9 (the chosen design).
// Every /example-N route still works on its own; this just re-exports
// example-9 as the site root while we build it out.
export { default, metadata } from "./example-9/page";
// Daily ISR so the seasonal winter escalation flips without a redeploy.
export const revalidate = 86400;
