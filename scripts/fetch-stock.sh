#!/usr/bin/env bash
# One-shot script that fetches a fresh permanent image for each slot used in
# the site, saving them under /public/img/. Run again only if you want to
# reroll a slot — the URL returned by the Pixabay API is signed and expires,
# so we have to download immediately.
#
# Pre-req: PIXABAY_KEY env var (the public key is fine).
#
# Usage:  PIXABAY_KEY=... bash scripts/fetch-stock.sh

set -euo pipefail
: "${PIXABAY_KEY:?set PIXABAY_KEY env var}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_GARDEN="$ROOT/public/img/garden"
OUT_TEAM="$ROOT/public/img/team"
OUT_WINTER="$ROOT/public/img/winter"
mkdir -p "$OUT_GARDEN" "$OUT_TEAM" "$OUT_WINTER"

fetch() {
  local slug="$1"; local query="$2"; local out="$3"; local orientation="${4:-all}"
  local dst="$out/$slug.jpg"
  if [[ -f "$dst" ]]; then
    echo "  skip   $slug (exists)"
    return
  fi
  local api="https://pixabay.com/api/?key=$PIXABAY_KEY&q=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1]))" "$query")&image_type=photo&orientation=$orientation&per_page=3&safesearch=true"
  local url
  url=$(curl -fsS "$api" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['hits'][0]['largeImageURL']) if d['hits'] else sys.exit(1)") || {
    echo "  miss   $slug — no hit for '$query'"
    return 1
  }
  curl -fsS -o "$dst" "$url"
  echo "  ok     $slug  →  $dst"
  sleep 0.3   # be nice to the API
}

echo "Garden imagery:"
fetch parkGarden    "garden park landscape"        "$OUT_GARDEN" horizontal
fetch parkPath      "garden path stones"           "$OUT_GARDEN" horizontal
fetch hedge1        "hedge shrub trimmed"          "$OUT_GARDEN" horizontal
fetch hedgeMaze     "hedge formal garden maze"     "$OUT_GARDEN" horizontal
fetch hedgePark     "formal garden hedges"         "$OUT_GARDEN" vertical
fetch hedgeShears   "hedge shears trimming"        "$OUT_GARDEN" horizontal
fetch daffodils     "daffodils yellow flowers"     "$OUT_GARDEN"
fetch cherry        "cherry blossom tree"          "$OUT_GARDEN"
fetch tulipField    "tulip field flowers"          "$OUT_GARDEN" horizontal
fetch echinacea     "echinacea purple coneflower"  "$OUT_GARDEN"
fetch sprout        "seedling sprout green"        "$OUT_GARDEN"
fetch snowdrop      "snowdrop flowers winter"      "$OUT_GARDEN"
fetch lawnTexture   "green grass lawn texture"     "$OUT_GARDEN" horizontal
fetch lawnSuburb    "suburban garden lawn"         "$OUT_GARDEN" horizontal
fetch lawnMower1    "lawn mower grass"             "$OUT_GARDEN" horizontal
fetch manMowing     "man mowing lawn"              "$OUT_GARDEN" vertical
fetch gardenerYard  "gardener working yard"        "$OUT_GARDEN" vertical
fetch backyard1     "backyard garden home"         "$OUT_GARDEN" horizontal
fetch backyard2     "backyard patio garden"        "$OUT_GARDEN" horizontal
fetch backyard3     "garden flower bed"            "$OUT_GARDEN" horizontal
fetch backyard9     "private garden house lawn"    "$OUT_GARDEN" vertical
fetch autumn1       "autumn leaves garden"         "$OUT_GARDEN"
fetch autumn2       "raking autumn leaves"         "$OUT_GARDEN" horizontal
fetch autumn3       "autumn yard fall colors"      "$OUT_GARDEN"

echo "Team portraits (european):"
fetch krzysztof     "european man beard portrait"  "$OUT_TEAM" vertical
fetch adam          "european man portrait brunette" "$OUT_TEAM" vertical
fetch marta         "european woman portrait blonde" "$OUT_TEAM" vertical
fetch bartek        "european man portrait outdoor" "$OUT_TEAM" vertical

echo "Winter imagery:"
fetch snowDrive     "snow clearing driveway shovel"          "$OUT_WINTER" horizontal
fetch gardenLights  "christmas lights garden outdoor"        "$OUT_WINTER" horizontal
fetch wrappedPlants "plants winter protection fleece burlap" "$OUT_WINTER" horizontal

echo "Done."
