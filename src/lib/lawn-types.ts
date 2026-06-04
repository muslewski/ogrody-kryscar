/**
 * Pure, dependency-free types shared by client components, server actions and
 * the data-access layer. NO Payload/server imports here — client components
 * import this file, so it must stay free of server-only code.
 */
export interface LawnPoint {
  lat: number;
  lng: number;
}

/** What the client sends to create/update a lawn (area is computed server-side). */
export interface LawnInput {
  name: string;
  address: string;
  placeId?: string | null;
  location: LawnPoint;
  polygon: LawnPoint[];
  /** Clipped building rings to subtract (auto-fill). Omit/[] for manual lawns. */
  buildings?: LawnPoint[][];
  source?: "manual" | "auto";
}

/** The projected, UI-facing shape of a lawn (decoupled from the Payload row). */
export interface LawnView {
  id: string;
  name: string;
  address: string;
  placeId: string | null;
  location: LawnPoint;
  polygon: LawnPoint[];
  buildings: LawnPoint[][];
  source: "manual" | "auto";
  areaM2: number;
}
