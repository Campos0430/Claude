#!/bin/bash
cd "$(dirname "$0")"; N=2907; CH=(); s=0; while [ $s -lt $N ]; do n=$((s+300)); [ $n -gt $N ] && n=$N; CH+=("$s $n"); s=$n; done
worker(){ for c in "${CH[@]}"; do set -- $c; f=parts/q_$(printf %05d $1).mp4
  mkdir parts/lock_$1 2>/dev/null || continue; [ -f $f ] && continue
  node render.js full $1 $2 parts/tmp_$1.mp4 > parts/log_$1.txt 2>&1 && grep -q done parts/log_$1.txt && mv parts/tmp_$1.mp4 $f || rmdir parts/lock_$1
done; }
rm -rf parts/lock_* parts/tmp_*; worker & worker & wait; ls parts/q_*.mp4 | wc -l
