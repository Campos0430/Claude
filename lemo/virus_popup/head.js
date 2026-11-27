// "Un virus apagó un gen" — Paper Pop-up Book (1080×1920, 30 fps). Picture keyed to the narration (words.json).
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clamp, lerp, seg, ss, eio, eo, ei, back, spring, TAU, mulberry, track } from './lib.js';
import * as A from './art.js';
import * as B from './art2.js';
import * as C from './art3.js';
import { cv, GRAIN, INK } from './paper.js';
import { makeBook, coverCanvases, texOf, BW, BD } from './book.js';
import { cutMesh, thread, blobShadow } from './cutmesh.js';
import { makePost } from './post.js';

const W = 1080, H = 1920, DUR = 55.8;
const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.getElementById('stage').appendChild(renderer.domElement);
const OX = document.getElementById('ov').getContext('2d');
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(34, W / H, .004, 30);
const post = makePost(renderer, scene, cam, W, H);

await Promise.all(['500 40px Fredoka', '600 40px Fredoka', '700 40px Fredoka', '40px "Lilita One"'].map(f => document.fonts.load(f, 'Aaéñ¿')));
const SUBS = await (await fetch('subs.json')).json();
const hdr = await new RGBELoader().loadAsync('assets/lythwood_lounge_2k.hdr'); hdr.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = hdr; scene.background = hdr; scene.backgroundBlurriness = .25;
scene.environmentIntensity = .35; scene.backgroundIntensity = .7; scene.backgroundRotation.set(0, 2.3, 0); scene.environmentRotation.set(0, 2.3, 0);
const tl = new THREE.TextureLoader();
const wt = n => { const t = tl.load(`assets/walnut_${n}.jpg`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.2, 1.4); t.anisotropy = 8; return t; };
const wdiff = wt('diff'); wdiff.colorSpace = THREE.SRGBColorSpace;
const desk = new THREE.Mesh(new THREE.BoxGeometry(2.6, .04, 1.7), new THREE.MeshStandardMaterial({ map: wdiff, normalMap: wt('nor'), roughnessMap: wt('rough'), color: '#c9a88a', envMapIntensity: .8 }));
desk.position.set(0, -.02, .25); desk.receiveShadow = true; scene.add(desk);
const gl = new GLTFLoader();
async function prop(name, x, z, s, ry) { const m = (await gl.loadAsync(`assets/${name}/${name}.gltf`)).scene; m.position.set(x, 0, z); m.scale.setScalar(s); m.rotation.y = ry; m.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); scene.add(m); return m; }
const lamp = await prop('desk_lamp_arm_01', -.62, .62, .55, -.76);
lamp.traverse(o => { if (o.isMesh && o.material.name.includes('light')) { o.material = o.material.clone(); o.material.emissive = new THREE.Color('#ffd9a0'); o.material.emissiveIntensity = 6; } });
const tea = await prop('tea_set_01', 0, 0, 1, 0);
{ const keep = { tea_set_01_teapot_01: [.42, .1, .5], tea_set_01_teapot_01_lid: [.42, .1, .5], tea_set_01_cup_small_01: [.33, .48, 2.2], tea_set_01_saucer_circular_04: [.33, .48, 0] };
  const dead = []; tea.traverse(o => { if (!o.name.startsWith('tea_set_01_')) return; const k = keep[o.name]; if (!k) dead.push(o); else { o.position.x = k[0]; o.position.z = k[1]; o.rotation.y = k[2]; } }); dead.forEach(o => o.parent && o.parent.remove(o)); }

