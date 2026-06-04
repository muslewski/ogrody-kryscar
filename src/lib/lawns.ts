/**
 * The ONLY ownership boundary for lawns. Because the Better Auth → Payload
 * adapter uses the Local API (which bypasses access control), every function
 * here filters by `owner == userId`. Components/actions consume ONLY these
 * accessors — never the `lawns` collection directly. Returns projected
 * `LawnView` objects, decoupled from the raw Payload row.
 */
import { getPayload } from "payload";
import config from "@payload-config";

import type { RequiredDataFromCollectionSlug } from "payload";

import type { Lawn } from "@/payload-types";
import type { LawnInput, LawnPoint, LawnView } from "./lawn-types";
import { computePolygonArea } from "./geo";

function project(doc: Lawn): LawnView {
  const loc = (doc.location ?? {}) as { lat?: number; lng?: number };
  return {
    id: String(doc.id),
    name: doc.name,
    address: doc.address,
    placeId: doc.placeId ?? null,
    location: { lat: loc.lat ?? 0, lng: loc.lng ?? 0 },
    polygon: (doc.polygon as unknown as LawnPoint[] | null) ?? [],
    areaM2: doc.areaM2,
  };
}

export async function getMyLawns(userId: string): Promise<LawnView[]> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "lawns",
    where: { owner: { equals: userId } },
    sort: "-createdAt",
    depth: 0,
    limit: 100,
  });
  return docs.map(project);
}

export async function getLawn(
  userId: string,
  id: string,
): Promise<LawnView | null> {
  const payload = await getPayload({ config });
  const { docs } = await payload.find({
    collection: "lawns",
    where: { and: [{ id: { equals: id } }, { owner: { equals: userId } }] },
    depth: 0,
    limit: 1,
  });
  return docs[0] ? project(docs[0]) : null;
}

export async function createLawn(
  userId: string,
  input: LawnInput,
): Promise<LawnView> {
  const payload = await getPayload({ config });
  // `tenant` is omitted here on purpose: the collection's assignDefaultTenant
  // beforeChange hook fills it. The generated type still marks it required, and
  // `polygon` is the generic JSON union, so we cast the data shape we control.
  const data = {
    owner: userId,
    name: input.name,
    address: input.address,
    placeId: input.placeId ?? undefined,
    location: input.location,
    polygon: input.polygon,
    areaM2: computePolygonArea(input.polygon),
  } as unknown as RequiredDataFromCollectionSlug<"lawns">;
  const doc = await payload.create({ collection: "lawns", data });
  return project(doc);
}

export async function updateLawn(
  userId: string,
  id: string,
  input: Partial<LawnInput>,
): Promise<LawnView> {
  // Ownership check first — never trust the id alone.
  const existing = await getLawn(userId, id);
  if (!existing) throw new Error("Lawn not found");

  const payload = await getPayload({ config });
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.address !== undefined) data.address = input.address;
  if (input.placeId !== undefined) data.placeId = input.placeId ?? undefined;
  if (input.location !== undefined) data.location = input.location;
  if (input.polygon !== undefined) {
    data.polygon = input.polygon;
    data.areaM2 = computePolygonArea(input.polygon);
  }
  const doc = await payload.update({ collection: "lawns", id, data });
  return project(doc);
}

export async function deleteLawn(userId: string, id: string): Promise<void> {
  const existing = await getLawn(userId, id);
  if (!existing) return; // no-op for non-owners / missing
  const payload = await getPayload({ config });
  await payload.delete({ collection: "lawns", id });
}
