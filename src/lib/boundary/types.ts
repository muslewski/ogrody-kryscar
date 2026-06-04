import type { LawnPoint } from "../lawn-types";

export type Ring = LawnPoint[];

export interface BBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

export interface ParcelProvider {
  name: string;
  fetchParcel(point: LawnPoint): Promise<Ring | null>;
}

export interface BuildingProvider {
  name: string;
  fetchBuildings(bbox: BBox): Promise<Ring[]>;
}

export interface AutoFillResult {
  parcel: Ring;
  buildings: Ring[]; // clipped to the parcel
  areaM2: number; // net = parcel − buildings
  parcelAreaM2: number;
  buildingAreaM2: number;
  sources: { parcel: string; buildings: string | null };
}

export type AutoFillError = { error: "no-parcel" | "failed" };
