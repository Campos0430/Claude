#!/bin/sh
# One command: render all frames, mux with the original Short 42 mix, render the cover.
set -e; cd "$(dirname "$0")"
python3 -m http.server 8642 --bind 127.0.0.1 >/dev/null 2>&1 & SRV=$!; trap 'kill $SRV' EXIT; sleep 1
rm -rf parts && mkdir -p parts chk && ./queue.sh
ls parts/q_*.mp4 | sed "s#^#file '$PWD/#;s/\$/'/" > list.txt
ffmpeg -v error -y -f concat -safe 0 -i list.txt -i /home/claude/short42/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 20 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 256k -t 96.9 -movflags +faststart supernovas_holo.mp4
node cover.js
ffmpeg -hide_banner -i supernovas_holo.mp4 -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1
