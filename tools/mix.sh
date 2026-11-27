#!/bin/sh
# usage: mix.sh <dir with voz.mp3> <audio dir with music.wav stings.wav foley.wav> DUR  -> <audio dir>/mix.wav at -14 LUFS, true peak <= -2.2 dBTP
V=$1/voz.mp3; A=$2; D=$3
ffmpeg -v error -y -i $V -i $A/music.wav -i $A/stings.wav -i $A/foley.wav -filter_complex \
"[0]aresample=48000,highpass=f=80,apad=whole_dur=$D,acompressor=threshold=-18dB:ratio=3:attack=5:release=120,asplit=3[v][sc][sc2];\
[1]volume=0.16[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];\
[2]volume=${SG:-0.13}[st];[3]volume=${FG:-0.55}[f];[f][sc2]sidechaincompress=threshold=0.05:ratio=2.5:attack=10:release=250[fd];\
[v][md][st][fd]amix=inputs=4:normalize=0[o]" -map "[o]" -t $D $A/mix_pre.wav
I=$(ffmpeg -hide_banner -i $A/mix_pre.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
G=$(python3 -c "print(round(-14.0 - ($I) + 0.35, 2))")
ffmpeg -v error -y -i $A/mix_pre.wav -af "volume=${G}dB,alimiter=limit=0.70:level=disabled,aresample=192000,alimiter=limit=0.76:level=disabled,aresample=48000" $A/mix.wav
ffmpeg -hide_banner -i $A/mix.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tail -2
