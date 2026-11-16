#!/bin/bash
# Usage: ./new_short.sh <dir_name> <duration_seconds>   e.g. ./new_short.sh short36 98.5
set -e; K="$(cd "$(dirname "$0")" && pwd)"; D=/home/claude/$1; DUR=$2
FR=$(python3 -c "print(round($DUR*30))")
mkdir -p $D/web $D/chk $D/parts $D/cover $D/rsfx
cp "$K"/template/web/* $D/web/; cp "$K"/template/render3d.js "$K"/template/sheet.sh "$K"/template/sound.py $D/; cp "$K"/template/cover/* $D/cover/; cp "$K"/rsfx/* $D/rsfx/
sed "s/__FRAMES__/$FR/g" "$K"/template/queue.sh > $D/queue.sh; chmod +x $D/*.sh
sed -i "s/DUR = [0-9.]*/DUR = $DUR/" $D/web/index.html
sed -i "s/[0-9.]* \* FPS/$DUR * FPS/" $D/render3d.js
echo "created $D ($FR frames). Still to edit: web/objects.js, web/scenes.js, overlay.js (HOT words + caption end/logo time), sound.py (DUR, CUTS, SECT, SFX block)."
