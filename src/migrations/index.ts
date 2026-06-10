import * as migration_20260610_174309 from './20260610_174309';

// Additive migration for the team-schedule MVP (3b.2): adds the visits table,
// the payload_mcp_api_keys table, service_requests.decline_reason, and the
// accepted/declined/done status enum values — on top of the existing prod schema.
// Prod was created by earlier dev-push (no migration ledger); this delta is what
// `payload migrate` applies. Dev uses schema push, so fresh dev DBs don't need a
// from-scratch baseline. See decision [[prod-migrations]].
export const migrations = [
  { up: migration_20260610_174309.up, down: migration_20260610_174309.down, name: '20260610_174309' },
];
