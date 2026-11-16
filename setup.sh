#!/bin/bash
# Prepares a fresh cloud workspace to produce "Lo que ignoramos" Shorts. Run once per session.
set -e; K="$(cd "$(dirname "$0")" && pwd)"
mkdir -p /home/claude/whisper_small /home/claude/short/node_modules/@fontsource/montserrat/files /home/claude/short/node_modules/@fontsource/inter/files
cp "$K"/model/*.json /home/claude/whisper_small/; cat "$K"/model/model.bin.part* > /home/claude/whisper_small/model.bin
cp "$K"/fonts/montserrat-* /home/claude/short/node_modules/@fontsource/montserrat/files/; cp "$K"/fonts/inter-* /home/claude/short/node_modules/@fontsource/inter/files/
cp "$K"/tools/transcribe.py "$K"/tools/align.py /home/claude/
python3 -c "import faster_whisper" 2>/dev/null || pip install --break-system-packages -q faster-whisper
python3 -c "import scipy, numpy" 2>/dev/null || pip install --break-system-packages -q scipy numpy
which ffmpeg >/dev/null || (apt-get install -y -q ffmpeg >/dev/null 2>&1 || true)
echo "setup ok"
