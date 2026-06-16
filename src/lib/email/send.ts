/**
 * The single send primitive. Renders a React Email element to HTML and sends via
 * Resend. NEVER throws and never rejects — a failed/disabled send is logged and
 * swallowed, so a notification can never roll back a DB write or break a flow.
 */
import { render } from "@react-email/render";
import type { ReactElement } from "react";

import { getResend } from "./client";
import { EMAIL_FROM, EMAIL_REPLY_TO } from "./config";

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  react: ReactElement;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return; // disabled (no key)
  try {
    const html = await render(opts.react);
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: opts.to,
      replyTo: EMAIL_REPLY_TO,
      subject: opts.subject,
      html,
    });
    if (error) console.error("[email] send failed:", error);
  } catch (err) {
    console.error("[email] send threw:", err);
  }
}
