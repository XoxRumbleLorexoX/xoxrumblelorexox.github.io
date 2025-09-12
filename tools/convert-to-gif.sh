#!/usr/bin/env bash
# Convert video files to optimized, rapid-play GIFs with reduced FPS.
# Usage:
#   tools/convert-to-gif.sh img/LatestFlyingCar/*.MOV
#   tools/convert-to-gif.sh path/to/video.mov
#
# Output files are written alongside inputs with .gif extension.

set -euo pipefail

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Error: ffmpeg not found. Please install ffmpeg (brew install ffmpeg, apt, etc.)." >&2
  exit 1
fi

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <video1> [video2 ...]" >&2
  exit 1
fi

# Defaults: tuned for smooth, easy-on-the-eyes playback
FPS=${FPS:-10}            # frames per second (lower = smaller, calmer)
SCALE=${SCALE:-720}       # width in px, keeps aspect ratio
LOOP=${LOOP:-0}           # 0 = loop forever

for inpath in "$@"; do
  [ -f "$inpath" ] || { echo "Skip: $inpath not found" >&2; continue; }
  dir=$(dirname "$inpath")
  base=$(basename "$inpath")
  name="${base%.*}"
  out="$dir/${name}.gif"

  echo "Converting $inpath -> $out (fps=$FPS, scale=$SCALE)" >&2

  # Two‑pass palette for quality + size
  ffmpeg -y -v warning -i "$inpath" \
    -vf "fps=${FPS},scale=${SCALE}:-1:flags=lanczos,palettegen" \
    -t 30 \
    "/tmp/${name}_palette.png"

  ffmpeg -y -v warning -i "$inpath" -i "/tmp/${name}_palette.png" \
    -lavfi "fps=${FPS},scale=${SCALE}:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=5" \
    -loop ${LOOP} \
    "$out"

  rm -f "/tmp/${name}_palette.png"
done

echo "Done. Generated GIFs next to input files." >&2

