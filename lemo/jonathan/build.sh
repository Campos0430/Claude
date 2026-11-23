#!/bin/sh
# One command: assemble the page, render all frames (2 workers), mux with the original audio, render the cover.
set -e
cd "$(dirname "$0")"
[ -d node_modules/three ] || npm install three@0.170.0
python3 tools_assemble.py
rm -rf parts && mkdir parts && ./queue.sh
ls parts/q_*.mp4 | sed "s/^/file '/;s/$/'/" > parts/list.txt
ffmpeg -v error -y -f concat -safe 0 -i parts/list.txt -c copy parts/video.mp4
ffmpeg -v error -y -i parts/video.mp4 -i ${AUDIO:-/home/claude/short41/mix.wav} -map 0:v -map 1:a -c:v libx264 -crf 20 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 256k -t 90.8 -movflags +faststart jonathan_lapiz.mp4
node render.mjs cover portada.png
echo built jonathan_lapiz.mp4 portada.png
