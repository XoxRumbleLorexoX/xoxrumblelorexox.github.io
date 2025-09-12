#!/usr/bin/env bash
# Convert videos to high‑quality, small MP4/WebM loops suitable for autoplay
# Usage: tools/convert-to-clip.sh img/LatestFlyingCar/*.MOV

set -euo pipefail

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg is required (brew install ffmpeg)" >&2
  exit 1
fi

FPS=${FPS:-18}           # smoother than GIF, still light
WIDTH=${WIDTH:-720}      # scale width, keep aspect

for inpath in "$@"; do
  [ -f "$inpath" ] || continue
  dir=$(dirname "$inpath"); base=$(basename "$inpath"); name=${base%.*}
  outmp4="$dir/${name}.mp4"; outwebm="$dir/${name}.webm"
  echo "-> $inpath => $outmp4, $outwebm (fps=$FPS, w=$WIDTH)"

  # H.264 MP4
  ffmpeg -y -v warning -i "$inpath" \
    -vf "fps=${FPS},scale=${WIDTH}:-2:flags=lanczos" \
    -movflags +faststart -pix_fmt yuv420p -profile:v main -level 3.1 \
    -c:v libx264 -preset veryfast -crf 22 -an "$outmp4"

  # WebM VP9
  ffmpeg -y -v warning -i "$inpath" \
    -vf "fps=${FPS},scale=${WIDTH}:-2:flags=lanczos" \
    -c:v libvpx-vp9 -crf 32 -b:v 0 -an "$outwebm"
done

echo "Done. Update items to use 'base' filenames (no extension)." >&2

