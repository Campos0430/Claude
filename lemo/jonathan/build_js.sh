#!/bin/sh
# assemble main.js from the engine parts (pencil engine adapted from lemo-opuscar colored-pencil demo, MIT)
cd "$(dirname "$0")" && python3 tools_assemble.py
