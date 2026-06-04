"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { loadMapsLibraries, hasMapsKey } from "@/lib/google-maps-loader";
import { LAWN_FILL, LAWN_STROKE, LAWN_MAP_TYPE } from "@/lib/maps";
import type { LawnInput, LawnPoint, LawnView } from "@/lib/lawn-types";

type Phase = "search" | "draw" | "ready";

interface Props {
  /** Present in edit mode — prefills the map and skips the search phase. */
  initial?: LawnView;
  /** Called with the assembled input. On success it redirects (never resolves
   *  with ok); on failure it returns { ok:false, error }. */
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
  const managerRef = useRef<google.maps.drawing.DrawingManager | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const geometryRef = useRef<google.maps.GeometryLibrary | null>(null);
  const drawingLibRef = useRef<google.maps.DrawingLibrary | null>(null);

  const [phase, setPhase] = useState<Phase>(initial ? "ready" : "search");
  const [area, setArea] = useState<number>(initial?.areaM2 ?? 0);
  const [name, setName] = useState<string>(initial?.name ?? "");
  const [address, setAddress] = useState<string>(initial?.address ?? "");
  const [placeId, setPlaceId] = useState<string | null>(initial?.placeId ?? null);
  const [center, setCenter] = useState<LawnPoint>(
    initial?.location ?? { lat: 53.1235, lng: 18.0084 }, // Bydgoszcz fallback
  );
  const [mapsError, setMapsError] = useState<string | null>(() =>
    hasMapsKey() ? null : "Mapa jest chwilowo niedostępna — brak konfiguracji.",
  );
  // Mirrors polygonRef presence in state so render (canSave) never reads a ref.
  const [hasPolygon, setHasPolygon] = useState<boolean>(
    (initial?.polygon.length ?? 0) >= 3,
  );
  const [saving, setSaving] = useState(false);

  // Recompute area from the live polygon path (drag/edit) via Google geometry.
  function recomputeArea() {
    const poly = polygonRef.current;
    const geometry = geometryRef.current;
    if (!poly || !geometry) return;
    const m2 = geometry.spherical.computeArea(poly.getPath());
    setArea(Math.round(m2));
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

  function startDrawing() {
    const drawing = drawingLibRef.current;
    if (!drawing) return;
    setPhase("draw");
    managerRef.current?.setDrawingMode(drawing.OverlayType.POLYGON);
  }

  function redraw() {
    polygonRef.current?.setMap(null);
    polygonRef.current = null;
    setHasPolygon(false);
    setArea(0);
    startDrawing();
  }

  // One-time map init.
  useEffect(() => {
    let cancelled = false;
    // Missing-key state is set synchronously via the lazy initializer above, so
    // there's nothing to load here.
    if (!hasMapsKey()) return;
    (async () => {
      try {
        const { maps, drawing, geometry, places } = await loadMapsLibraries();
        if (cancelled || !mapDivRef.current) return;
        geometryRef.current = geometry;
        drawingLibRef.current = drawing;

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
          attachPolygon(poly);
          setPhase("ready");
        });

        // Edit mode: draw the existing polygon up front.
        if (initial && initial.polygon.length >= 3) {
          const poly = new maps.Polygon({ paths: initial.polygon });
          poly.setMap(map);
          attachPolygon(poly);
          // LatLngBounds lives in the core library (not the maps library returned
          // by the loader), so fit a plain LatLngBoundsLiteral derived from the
          // polygon vertices instead of constructing a LatLngBounds.
          const lats = initial.polygon.map((p) => p.lat);
          const lngs = initial.polygon.map((p) => p.lng);
          map.fitBounds({
            north: Math.max(...lats),
            south: Math.min(...lats),
            east: Math.max(...lngs),
            west: Math.min(...lngs),
          });
        }

        // Places autocomplete on the search field.
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
        if (!cancelled) setMapsError("Nie udało się załadować mapy.");
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
    };
    const res = await onSave(input);
    // Only reached on failure (success redirects server-side).
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

      {/* Search (always rendered so Autocomplete can bind; hidden once drawing) */}
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

      {/* Dimmer + prompt during search */}
      {phase === "search" && (
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center bg-black/40">
          <p className="rounded-full bg-black/60 px-4 py-2 text-sm text-white">
            Zacznij od wpisania adresu
          </p>
        </div>
      )}

      {/* Hint pill while drawing */}
      {phase === "draw" && (
        <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-xs text-white">
          Klikaj rogi trawnika, aby go obrysować
        </div>
      )}

      {/* Result card */}
      {phase === "ready" && (
        <div className="absolute inset-x-3 bottom-3 z-10 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl sm:left-auto sm:right-3 sm:w-80">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">Powierzchnia</span>
            <span className="text-xl font-bold text-emerald-700">
              ≈ {area.toLocaleString("pl-PL")} m²
            </span>
          </div>
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
