// Jonathan · Colored-Pencil Science Illustration (lemo-opuscar style; pencil engine adapted from styles/colored-pencil/demo/main.js, MIT)
// A three.js world redrawn every frame as a colored-pencil plate: four G-buffer passes → a pencil post pass → composite with paper overlays.
import * as THREE from 'three';
const QS = new URLSearchParams(location.search);
const W = 1080, H = 1920, SS = +(QS.get('ss') || 1), FPS = 30;
const canvas = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false); renderer.autoClear = false;
