function mat({ id, kind = 0, color = [1, 1, 1], dir = 0, angle = 0.8, outline = 1, dens = 1, side = THREE.FrontSide, disc = 0, wind = 0, rev = null, tip = 0 }) {
  return new THREE.ShaderMaterial({
    vertexShader: VS, fragmentShader: FS, side,
    uniforms: {
      uPass: SHARED.uPass, uTime: SHARED.uTime, uWindT: SHARED.uWindT, uRefVP: SHARED.uRefVP, uOut: SHARED.uOut,
      uDisc: { value: disc }, uWind: { value: wind }, uTip: { value: tip },
      uRevMode: { value: rev ? 1 : 0 }, uRevT: { value: rev ? rev[0] : 0 }, uRevD: { value: rev ? rev[1] : 0 },
      uId: { value: id }, uKind: { value: kind }, uDirMode: { value: dir },
      uAngle: { value: angle }, uOutline: { value: outline }, uDens: { value: dens },
      uAspect: { value: W / H }, uColor: { value: new THREE.Color(...color) },
    },
  });
}
