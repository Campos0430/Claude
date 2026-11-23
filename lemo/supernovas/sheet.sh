#!/bin/bash
# usage: sheet.sh out.jpg t1 t2 ... (uses chk/s_T.jpg), 4 wide
out=$1; shift; args=(); n=0; for t in "$@"; do args+=(-i chk/s_$t.jpg); n=$((n+1)); done
f=""; for ((i=0;i<n;i++)); do f+="[$i]scale=360:640[v$i];"; done
lay=""; for ((i=0;i<n;i++)); do lay+="$(( (i%4)*360 ))_$(( (i/4)*640 ))|"; done
for ((i=0;i<n;i++)); do f+="[v$i]"; done
ffmpeg -v error -y "${args[@]}" -filter_complex "${f}xstack=inputs=$n:layout=${lay%|}:fill=black" -q:v 3 $out
