#!/bin/sh
# One command: render all frames (2 workers), then mux with the original, unchanged audio.
set -e; cd "$(dirname "$0")"
[ -e node_modules ] || ln -s /home/claude/lemo/jonathan/node_modules node_modules   # three r170 + playwright
rm -rf parts; mkdir -p parts; ./queue.sh
(cd parts && ls q_*.mp4 | sed "s/^/file '/;s/$/'/" > list.txt)
ffmpeg -v error -y -f concat -safe 0 -i parts/list.txt -i /home/claude/short41/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 18 -preset medium -pix_fmt yuv420p -c:a aac -b:a 256k -t 90.8 -movflags +faststart jonathan_popup.mp4
ffmpeg -v error -y -i jonathan_popup.mp4 -c:v libx264 -preset medium -b:v 7M -maxrate 9M -bufsize 14M -pix_fmt yuv420p -c:a copy -movflags +faststart jonathan_popup_web.mp4
node render.mjs cover portada.png
