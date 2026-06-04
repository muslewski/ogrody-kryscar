/**
 * Play the "snap pulse" when a polygon lands: fade the fill in (0 → 0.3 over ~420ms,
 * easeOutCubic) while a one-shot outline overlay pulses brighter/wider then fades out
 * and is removed. Pure requestAnimationFrame; no deps.
 */
export function playFillPulse(
  polygon: google.maps.Polygon,
  maps: google.maps.MapsLibrary,
  map: google.maps.Map,
): void {
  const DURATION = 420;
  const start = performance.now();
  const paths = polygon
    .getPath()
    .getArray()
    .map((ll) => ({ lat: ll.lat(), lng: ll.lng() }));
  const pulse = new maps.Polygon({
    paths,
    strokeColor: "#34d399",
    strokeOpacity: 0.9,
    strokeWeight: 3,
    fillOpacity: 0,
    clickable: false,
    map,
  });
  function frame(now: number) {
    const t = Math.min(1, (now - start) / DURATION);
    const ease = 1 - Math.pow(1 - t, 3);
    polygon.setOptions({ fillOpacity: 0.3 * ease });
    pulse.setOptions({ strokeOpacity: 0.9 * (1 - t), strokeWeight: 3 + 6 * t });
    if (t < 1) requestAnimationFrame(frame);
    else pulse.setMap(null);
  }
  requestAnimationFrame(frame);
}
