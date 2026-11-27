#!/bin/sh
# usage: final.sh <project dir> <mix.wav> DUR out.mp4
P=$1; M=$2; D=$3; O=$4
cd $P && (cd parts && ls q_*.mp4 | sed "s/^/file '/;s/$/'/" > list.txt)
ffmpeg -v error -y -f concat -safe 0 -i parts/list.txt -i $M -map 0:v -map 1:a -c:v libx264 -crf 20 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 256k -t $D -movflags +faststart $O
ffprobe -v error -show_entries format=duration:stream=codec_name,width,height,nb_frames -of compact $O
ffmpeg -hide_banner -i $O -vf blackdetect=d=0.3,freezedetect=d=1.5 -af ebur128=peak=true -f null - 2>&1 | grep -E "black_start|freeze_start|^\s+I:|^\s+Peak:" | tail -6
ffmpeg -v error -y -i $O -vf "fps=16/$D,scale=270:480,tile=8x2" -frames:v 1 ${O%.mp4}_sheet.jpg
ls -la $O
