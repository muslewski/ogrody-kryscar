/**
 * Logic checks for the email module — pure, no network. Run by `npm run check:logic`.
 * (1) buildTeamRecipients dedupes the ops inbox case-insensitively.
 * (2) every template renders to non-empty HTML containing its key fields.
 */
import assert from "node:assert/strict";
import { render } from "@react-email/render";

import { buildTeamRecipients } from "../src/lib/email/recipients";

// (1) recipient dedupe
{
  const r = buildTeamRecipients(
    ["ogrodnik@kryscar.pl", "OGRODY@kryscar.pl"],
    "ogrody@kryscar.pl",
  );
  assert.deepEqual(r, ["ogrodnik@kryscar.pl", "OGRODY@kryscar.pl"],
    "ops inbox already present as a gardener (case-insensitive) must not duplicate");

  const r2 = buildTeamRecipients(["ogrodnik@kryscar.pl"], "ogrody@kryscar.pl");
  assert.deepEqual(r2, ["ogrodnik@kryscar.pl", "ogrody@kryscar.pl"],
    "distinct gardener + ops inbox both kept, gardeners first");

  const r3 = buildTeamRecipients([], "ogrody@kryscar.pl");
  assert.deepEqual(r3, ["ogrody@kryscar.pl"], "no gardeners → just the ops inbox");
}

// (2) templates render to non-empty HTML containing their key fields
{
  const { VerifyEmail } = await import("../src/lib/email/templates/VerifyEmail");
  const { ResetPassword } = await import("../src/lib/email/templates/ResetPassword");
  const { NewRequestTeam } = await import("../src/lib/email/templates/NewRequestTeam");
  const { RequestDecision } = await import("../src/lib/email/templates/RequestDecision");
  const { VisitScheduled } = await import("../src/lib/email/templates/VisitScheduled");

  const verify = await render(VerifyEmail({ name: "Jan", url: "https://x.test/verify?token=abc" }));
  assert.ok(verify.includes("https://x.test/verify?token=abc"), "verify email carries the url");

  const reset = await render(ResetPassword({ name: "Jan", url: "https://x.test/reset?token=xyz" }));
  assert.ok(reset.includes("https://x.test/reset?token=xyz"), "reset email carries the url");

  const team = await render(NewRequestTeam({
    customerName: "Jan Nowak", lawnName: "Ogród A", address: "ul. Kwiatowa 1",
    serviceTitles: ["Koszenie"], note: "proszę o kontakt", estRange: "200–300 zł",
    url: "https://x.test/zespol/zlecenia",
  }));
  assert.ok(team.includes("Ogród A") && team.includes("Koszenie"), "team email carries lawn + service");

  const declined = await render(RequestDecision({
    customerName: "Jan", lawnName: "Ogród A", decision: "declined",
    reason: "poza obszarem", url: "https://x.test/panel/zamowienia",
  }));
  assert.ok(declined.includes("poza obszarem"), "declined email carries the reason");

  const visit = await render(VisitScheduled({
    customerName: "Jan", lawnName: "Ogród A", scheduledAt: "poniedziałek, 16 czerwca 2026, 09:00",
    url: "https://x.test/panel",
  }));
  assert.ok(visit.includes("16 czerwca 2026"), "visit email carries the date");
}

console.log("check-email: OK");
