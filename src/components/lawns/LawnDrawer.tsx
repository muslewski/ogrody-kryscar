"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { loadMapsLibraries, hasMapsKey } from "@/lib/google-maps-loader";
import { LAWN_FILL, LAWN_STROKE, LAWN_MAP_TYPE } from "@/lib/maps";
import type { LawnInput, LawnPoint, LawnView } from "@/lib/lawn-types";
import { playFillPulse } from "./play-fill-pulse";
import { autoFillLawnAction } from "@/app/(app)/panel/ogrody/actions";

type Phase = "search" | "draw" | "ready";

interface Props {
  initial?: LawnView;
  onSave: (input: LawnInput) => Promise<{ ok: false; error: string } | never>;
  submitLabel: string;
}

const pathToPoints = (poly: google.maps.Polygon): LawnPoint[] =>
  poly
    .getPath()
    .getArray()
    .map((ll) => ({ lat: ll.lat(), lng: ll.lng() }));

export function LawnDrawer({ initial, onSave, submitLabel }: Props) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapsLibRef = useRef<google.maps.MapsLibrary | null>(null);
  const managerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const buildingPolysRef = useRef<google.maps.Polygon[]>([]);
  const geometryRef = useRef<google.maps.GeometryLibrary | null>(null);
  const drawingLibRef = useRef<google.maps.DrawingLibrary | null>(null);

  const [phase, setPhase] = useState<Phase>(initial ? "ready" : "search");
  const [area, setArea] = useState<number>(initial?.areaM2 ?? 0);
  const [parcelArea, setParcelArea] = useState<number>(0);
  const [buildingArea, setBuildingArea] = useState<number>(0);
  const [name, setName] = useState<string>(initial?.name ?? "");
  const [address, setAddress] = useState<string>(initial?.address ?? "");
  const [placeId, setPlaceId] = useState<string | null>(initial?.placeId ?? null);
  const [source, setSource] = useState<"manual" | "auto">(initial?.source ?? "manual");
  const [center, setCenter] = useState<LawnPoint>(
    initial?.location ?? { lat: 53.1235, lng: 18.0084 },
  );
  const [mapsError] = useState<string | null>(() =>
    hasMapsKey() ? null : "Mapa jest chwilowo niedostępna — brak konfiguracji.",
  );
  const [hasPolygon, setHasPolygon] = useState<boolean>(
    (initial?.polygon.length ?? 0) >= 3,
  );
  const [saving, setSaving] = useState(false);
  const [autoFilling, setAutoFilling] = useState(false);

  function recomputeArea() {
    const poly = polygonRef.current;
    const geometry = geometryRef.current;
    if (!poly || !geometry) return;
    const ringArea = geometry.spherical.computeArea(poly.getPath());
    let bArea = 0;
    for (const b of buildingPolysRef.current) {
      bArea += geometry.spherical.computeArea(b.getPath());
    }
    setParcelArea(Math.round(ringArea));
    setBuildingArea(Math.round(bArea));
    setArea(Math.max(0, Math.round(ringArea - bArea)));
  }

  function attachPolygon(poly: google.maps.Polygon) {
    polygonRef.current?.setMap(null);
    polygonRef.current = poly;
    setHasPolygon(true);
    poly.setEditable(true);
    poly.setOptions({
      strokeColor: LAWN_STROKE,
      strokeWeight: 3,
      fillColor: LAWN_FILL,
      fillOpacity: 0.3,
    });
    const path = poly.getPath();
    ["set_at", "insert_at", "remove_at"].forEach((ev) =>
      path.addListener(ev, recomputeArea),
    );
    recomputeArea();
  }

  function attachBuildings(rings: LawnPoint[][]) {
    buildingPolysRef.current.forEach((p) => p.setMap(null));
    buildingPolysRef.current = [];
    const maps = mapsLibRef.current;
    const map = mapRef.current;
    if (!maps || !map) return;
    for (const ring of rings) {
      if (ring.length < 3) continue;
      const poly = new maps.Polygon({
        paths: ring,
        strokeColor: "#ef4444",
        strokeWeight: 1.5,
        fillColor: "#ef4444",
        fillOpacity: 0.35,
        clickable: false,
        map,
      });
      buildingPolysRef.current.push(poly);
    }
  }

  function startDrawing() {
    const drawing = drawingLibRef.current;
    if (!drawing) return;
    setPhase("draw");
    managerRef.current?.setDrawingMode(drawing.OverlayType.POLYGON);
  }

  function redraw() {
    polygonRef.current?.setMap(null);
    polygonRef.current = null;
    attachBuildings([]);
    setSource("manual");
    setHasPolygon(false);
    setArea(0);
    setParcelArea(0);
    setBuildingArea(0);
    startDrawing();
  }

  async function handleAutoFill() {
    const map = mapRef.current;
    const maps = mapsLibRef.current;
    if (!map || !maps) return;
    const c = map.getCenter();
    if (!c) return;
    setAutoFilling(true);
    const res = await autoFillLawnAction(c.lat(), c.lng());
    if ("error" in res) {
      toast.error(
        res.error === "no-parcel"
          ? "Nie znaleźliśmy granic działki tutaj — narysuj ręcznie."
          : "Nie udało się pobrać granic. Spróbuj ponownie lub narysuj ręcznie.",
      );
      setAutoFilling(false);
      return;
    }
    managerRef.current?.setDrawingMode(null);
    polygonRef.current?.setMap(null);
    const parcel = new maps.Polygon({ paths: res.parcel });
    parcel.setMap(map);
    attachPolygon(parcel);
    attachBuildings(res.buildings);
    setSource("auto");
    setPhase("ready");
    const lats = res.parcel.map((p) => p.lat);
    const lngs = res.parcel.map((p) => p.lng);
    map.fitBounds({
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    });
    playFillPulse(parcel, maps, map);
    recomputeArea();
    setAutoFilling(false);
    if (!res.buildings.length) {
      toast.message("Nie wykryto budynku — liczymy całą działkę.");
    }
  }

  useEffect(() => {
    let cancelled = false;
    if (!hasMapsKey()) return;
    (async () => {
      try {
        const { maps, drawing, geometry, places } = await loadMapsLibraries();
        if (cancelled || !mapDivRef.current) return;
        geometryRef.current = geometry;
        drawingLibRef.current = drawing;
        mapsLibRef.current = maps;

        const map = new maps.Map(mapDivRef.current, {
          center,
          zoom: initial ? 20 : 17,
          mapTypeId: LAWN_MAP_TYPE,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          tilt: 0,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || undefined,
        });
        mapRef.current = map;

        const manager = new drawing.DrawingManager({
          drawingControl: false,
          polygonOptions: {
            strokeColor: LAWN_STROKE,
            strokeWeight: 3,
            fillColor: LAWN_FILL,
            fillOpacity: 0.3,
            editable: true,
          },
        });
        manager.setMap(map);
        managerRef.current = manager;
        manager.addListener("polygoncomplete", (poly: google.maps.Polygon) => {
          manager.setDrawingMode(null);
          attachBuildings([]);
          attachPolygon(poly);
          setSource("manual");
          setPhase("ready");
          playFillPulse(poly, maps, map);
        });

        if (initial && initial.polygon.length >= 3) {
          const poly = new maps.Polygon({ paths: initial.polygon });
          poly.setMap(map);
          attachPolygon(poly);
          attachBuildings(initial.buildings);
          recomputeArea();
          const lats = initial.polygon.map((p) => p.lat);
          const lngs = initial.polygon.map((p) => p.lng);
          map.fitBounds({
            north: Math.max(...lats),
            south: Math.min(...lats),
            east: Math.max(...lngs),
            west: Math.min(...lngs),
          });
        }

        if (searchInputRef.current) {
          const ac = new places.Autocomplete(searchInputRef.current, {
            fields: ["geometry", "formatted_address", "place_id"],
            componentRestrictions: { country: "pl" },
          });
          ac.addListener("place_changed", () => {
            const place = ac.getPlace();
            const loc = place.geometry?.location;
            if (!loc) return;
            const point = { lat: loc.lat(), lng: loc.lng() };
            setCenter(point);
            setAddress(place.formatted_address ?? "");
            setPlaceId(place.place_id ?? null);
            map.panTo(point);
            map.setZoom(20);
            startDrawing();
          });
        }
      } catch {
        if (!cancelled) toast.error("Nie udało się załadować mapy.");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSave = name.trim().length > 0 && area > 0 && hasPolygon;

  async function handleSave() {
    if (!polygonRef.current) return;
    setSaving(true);
    const input: LawnInput = {
      name: name.trim(),
      address,
      placeId,
      location: center,
      polygon: pathToPoints(polygonRef.current),
      buildings: buildingPolysRef.current.map(pathToPoints),
      source,
    };
    const res = await onSave(input);
    if (res && !res.ok) {
      toast.error(res.error);
      setSaving(false);
    }
  }

  if (mapsError) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 text-center">
        <p className="text-sm text-neutral-600">{mapsError}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-white"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-9rem)] min-h-[480px] overflow-hidden rounded-2xl border border-neutral-200">
      <div ref={mapDivRef} className="absolute inset-0 bg-neutral-100" />

      <div
        className={`absolute left-3 right-3 top-3 z-10 transition ${
          phase === "search" ? "" : "pointer-events-none opacity-0"
        }`}
      >
        <input
          ref={searchInputRef}
          type="text"
          placeholder="🔍  Wpisz adres swojego trawnika…"
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm shadow-lg outline-none focus:border-emerald-500"
        />
      </div>

      {phase === "search" && (
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-black/40">
          <p className="rounded-full bg-black/60 px-4 py-2 text-sm text-white">
            Zacznij od wpisania adresu
          </p>
        </div>
      )}

      {phase === "draw" && (
        <>
          <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs text-white">
            Klikaj rogi trawnika — albo użyj „Auto wypełnij”
          </div>
          <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={autoFilling}
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {autoFilling ? "Szukam działki…" : "✨ Auto wypełnij działkę"}
            </button>
          </div>
        </>
      )}

      {phase === "ready" && (
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl sm:left-auto sm:right-3 sm:w-80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">Powierzchnia</span>
            <span className="text-xl font-bold text-emerald-700">
              ≈ {area.toLocaleString("pl-PL")} m²
            </span>
          </div>
          {buildingArea > 0 && (
            <p className="mt-1 text-[11px] text-neutral-500">
              działka {parcelArea.toLocaleString("pl-PL")} m² − dom{" "}
              {buildingArea.toLocaleString("pl-PL")} m²
            </p>
          )}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nazwa ogrodu, np. „Dom”"
            className="mt-3 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          />
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={redraw}
              className="flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50"
            >
              Rysuj od nowa
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || saving}
              className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "Zapisywanie…" : submitLabel}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
