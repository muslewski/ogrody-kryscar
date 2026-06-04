import type { CollectionBeforeChangeHook } from "payload";

/**
 * Assign the single Kryscar tenant on create when `tenant` is unset. The
 * structural tenancy seam ([[tenancy-and-roles]]): every domain row carries a
 * tenant from birth. Shared by `users` and `services`.
 */
export const assignDefaultTenant: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  if (operation === "create" && !data.tenant) {
    const res = await req.payload.find({
      collection: "tenants",
      where: { slug: { equals: "kryscar" } },
      limit: 1,
      depth: 0,
    });
    if (res.docs[0]) data.tenant = res.docs[0].id;
  }
  return data;
};
