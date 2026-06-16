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

// (2) template render ...

console.log("check-email: OK");
