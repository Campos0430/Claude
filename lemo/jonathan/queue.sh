#!/bin/sh
# render 2724 frames (90.8 s @ 30 fps) in chunks with 2 workers
cd "$(dirname "$0")"; N=2724; STEP=228
worker(){ s=0; while [ $s -lt $N ]; do e=$((s+STEP)); [ $e -gt $N ] && e=$N; f=parts/q_$(printf %05d $s).mp4
  if mkdir parts/lock_$s 2>/dev/null && [ ! -f $f ]; then node render.mjs video $s $e parts/tmp_$s.mp4 > parts/log_$s.txt 2>&1 && grep -q done parts/log_$s.txt && mv parts/tmp_$s.mp4 $f || rmdir parts/lock_$s; fi
  s=$e; done; }
rm -rf parts/lock_* parts/tmp_*; worker & worker & wait; ls parts/q_*.mp4 | wc -l
