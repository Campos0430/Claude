import re
d='engine/'
lib='/home/claude/ext/lemo-opuscar/styles/colored-pencil/demo/main.js'
fs=open(d+'fs_part.js').read()
fs=fs.replace("vec4 wp = modelMatrix*vec4(position,1.0);","#ifdef USE_INSTANCING\n  vec4 wp = modelMatrix*instanceMatrix*vec4(position,1.0);\n#else\n  vec4 wp = modelMatrix*vec4(position,1.0);\n#endif")
fs=fs.replace("  return clamp(c, 0.0, 1.0);\n}","""  else if(uKind==7.0){
    vec2 v = vor3(vW*vec3(6.0,6.0,6.0));
    c *= 0.78+0.36*v.y;
    c *= 0.88+0.12*sin(v.x*70.0);
    c *= mix(0.42, 1.0, smoothstep(0.015, 0.075, v.x));
  } else if(uKind==8.0){
    c *= 0.78+0.4*fbm3(vW*vec3(16.0,22.0,16.0));
  }
  return clamp(c, 0.0, 1.0);
}""",1)
sh=open(d+'shaders_part.js').read()
sh=sh.replace("if(id > 10.5 && id < 21.5 && id != 14.0 && id != 16.0 && id != 17.0 && id != 19.0) ev = ev*2.2 + 0.32;","if(id==18.0 || id==21.0 || id==24.0) ev = ev*2.2 + 0.32;")
sh=sh.replace("if(id0 > 5.5 && id0 < 10.5) lg = max(lg, 0.4);","if(id0 > 3.5 && id0 < 6.5) lg = max(lg, 0.4);")
m=open(d+'mat_part.js').read()
scene_src="const scene = new THREE.Scene();\nconst add = (geo, m) => { const o = new THREE.Mesh(geo, m); o.frustumCulled = false; scene.add(o); return o; };\n"
shared="const SHARED = { uPass: { value: 0 }, uTime: { value: 0 }, uWindT: { value: 0 }, uRefVP: { value: new THREE.Matrix4() }, uOut: { value: new THREE.Vector2(W, H) } };\n"
out=open(d+'head_part.js').read()+open(d+'base_part.js').read()+shared+fs+m+scene_src+open(d+'film_part.js').read()+sh+open(d+'tail_part.js').read()
open('main.js','w').write(out)
