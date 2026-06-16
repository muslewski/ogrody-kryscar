/**
 * Pure team-notification recipient list: every gardener email + the ops inbox,
 * deduped case-insensitively, gardeners first then ops. No Payload/env imports
 * so it stays unit-checkable.
 */
export function buildTeamRecipients(
  gardenerEmails: string[],
  opsInbox: string,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of [...gardenerEmails, opsInbox]) {
    const trimmed = raw.trim();
    const norm = trimmed.toLowerCase();
    if (!norm || seen.has(norm)) continue;
    seen.add(norm);
    out.push(trimmed);
  }
  return out;
}
