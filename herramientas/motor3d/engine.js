// Motor 3D low-poly de Dato Cósmico 2 (Three.js). Estilo: escenas 3D sencillas, sombreado plano, luz suave,
// cámara cinematográfica, subtítulos arriba palabra por palabra y rótulos en caja oscura con borde dorado.
import * as THREE from 'three';
export { THREE };

export const W = 1080, H = 1920, FPS = 30;
export let renderer, scene, camera, world, data, offs = [], total = 0;
const scenes = {};               // tipo -> {setup, update}
const evs = new Map();           // "nombre@t" -> {s,t,g}
let curIdx = -1, ovRoot, capEl, barEl, pool = [], used = 0;

// ---------- utilidades de tiempo ----------
export const cl = (x) => Math.max(0, Math.min(1, x));
export const ease = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
export const eout = (x) => { x = cl(x); return 1 - Math.pow(1 - x, 3); };
export const einout = (x) => { x = cl(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const spring = (x, f = 1.6, d = 7) => x <= 0 ? 0 : 1 - Math.exp(-d * x) * Math.cos(2 * Math.PI * f * x);
export const lerp = (a, b, p) => a + (b - a) * p;
export const v3 = (x, y, z) => new THREE.Vector3(x, y, z);
export function lerpV(a, b, p) { return new THREE.Vector3(lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)); }

// ---------- materiales y primitivas low-poly ----------
export function mat(color, o = {}) {
  return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: o.rough ?? 0.85, metalness: o.metal ?? 0.0,
    emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1, transparent: o.opacity != null, opacity: o.opacity ?? 1 });
}
function finish(m, pos, parent) { m.castShadow = true; m.receiveShadow = true; if (pos) m.position.set(...pos); (parent ?? world).add(m); return m; }
export const box = (w, h, d, color, pos, parent, o) => finish(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), color.isMaterial ? color : mat(color, o)), pos, parent);
export const cyl = (rt, rb, h, color, pos, parent, seg = 10, o) => finish(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), color.isMaterial ? color : mat(color, o)), pos, parent);
export const ball = (r, color, pos, parent, detail = 1, o) => finish(new THREE.Mesh(new THREE.IcosahedronGeometry(r, detail), color.isMaterial ? color : mat(color, o)), pos, parent);
export const plane = (w, h, color, pos, parent, o) => { const m = finish(new THREE.Mesh(new THREE.PlaneGeometry(w, h), color.isMaterial ? color : mat(color, o)), pos, parent); m.rotation.x = -Math.PI / 2; m.castShadow = false; return m; };
export const group = (pos, parent) => { const g = new THREE.Group(); if (pos) g.position.set(...pos); (parent ?? world).add(g); return g; };

// Personaje low-poly sencillo (estilo maniquí): cabeza cúbica, torso, brazos y piernas.
export function persona(o = {}, parent) {
  const g = group(o.pos ?? [0, 0, 0], parent);
  const skin = o.skin ?? 0xe0b08c, shirt = o.shirt ?? 0x6f9bd6, pants = o.pants ?? 0x3d4a66;
  // Piernas articuladas (7-nov 18:00): legL/legR giran desde la cadera (rotation.x), kneeL/kneeR doblan la rodilla
  // (rotation.x positivo = pantorrilla hacia atrás) y pieL/pieR giran el tobillo. Ver sentar().
  [['L', -.15], ['R', .15]].forEach(([s, x]) => {
    const hip = group([x, .9, 0], g); box(.22, .46, .24, pants, [0, -.23, 0], hip);
    const knee = group([0, -.45, 0], hip); box(.21, .45, .23, pants, [0, -.225, 0], knee);
    const pie = group([0, -.39, 0], knee); box(.26, .12, .34, o.zapato ?? 0x222222, [0, -.0, .05], pie);
    g['leg' + s] = hip; g['knee' + s] = knee; g['pie' + s] = pie; });
  g.torso = box(.6, .75, .32, shirt, [0, 1.28, 0], g);
  g.armL = group([-.4, 1.6, 0], g); box(.18, .7, .2, shirt, [0, -.33, 0], g.armL); box(.14, .14, .14, skin, [0, -.74, 0], g.armL);
  g.armR = group([.4, 1.6, 0], g); box(.18, .7, .2, shirt, [0, -.33, 0], g.armR); box(.14, .14, .14, skin, [0, -.74, 0], g.armR);
  g.head = group([0, 1.92, 0], g); box(.38, .44, .38, skin, [0, 0, 0], g.head); box(.4, .14, .4, o.hair ?? 0x3a2a20, [0, .22, 0], g.head);
  box(.05, .05, .02, 0x111111, [-.09, .03, .2], g.head); box(.05, .05, .02, 0x111111, [.09, .03, .2], g.head);
  if (o.cara !== false) {   // MEJORAS 0e: cara con cejas y boca para dar emoción (ver gesto(), pose(), hablar())
    g.cejaL = box(.09, .022, .02, o.hair ?? 0x3a2a20, [-.09, .1, .2], g.head); g.cejaR = box(.09, .022, .02, o.hair ?? 0x3a2a20, [.09, .1, .2], g.head);
    g.boca = box(.12, .03, .02, 0x7a2e2e, [0, -.11, .2], g.head);
  }
  if (o.pelo === 'largo') { box(.42, .5, .12, o.hair ?? 0x3a2a20, [0, -.04, -.17], g.head); box(.06, .4, .3, o.hair ?? 0x3a2a20, [-.21, -.02, -.03], g.head); box(.06, .4, .3, o.hair ?? 0x3a2a20, [.21, -.02, -.03], g.head); }
  if (o.bata) { box(.64, .62, .34, 0xf4f4f0, [0, 1.12, 0], g); g.torso.scale.set(1.04, 1, 1.05); g.torso.material = mat(0xf4f4f0); }
  return g;
}
// ---------- MEJORAS 0e: expresiones y poses de persona() ----------
// gesto(p, 'feliz'|'enojada'|'sorpresa'|'triste'|'neutral'): mueve cejas y boca.
export function gesto(p, tipo = 'neutral') {
  if (!p.boca) return; const G = { neutral: [0, 1, 1], feliz: [.0, 1.5, .8], enojada: [.45, 1.1, .8], sorpresa: [-.15, .7, 3.2], triste: [-.35, .9, .8] }[tipo] ?? [0, 1, 1];
  p.cejaL.rotation.z = -G[0]; p.cejaR.rotation.z = G[0]; p.cejaL.position.y = p.cejaR.position.y = tipo === 'sorpresa' ? .13 : .1;
  p.boca.scale.set(G[1], G[2], 1);
}
// hablar(p, lt, k): la boca se abre y cierra (k = intensidad 0..1)
export function hablar(p, lt, k = 1) { if (!p.boca) return; p.boca.scale.y *= 1 + k * 2.2 * Math.abs(Math.sin(lt * 11) * Math.sin(lt * 4.3 + 1)); }
// pose(p, nombre, k=0..1 mezcla, lt para movimientos): 'senalar' (brazo derecho al frente, regañando), 'jarras' (manos en la cintura),
// 'brazosArriba' (festejo), 'encoger' (no sé), 'manosJuntas' (dedos entrelazados al frente), 'neutral'.
export function pose(p, nombre = 'neutral', k = 1, lt = 0) {
  const P = {
    neutral:      { L: [0, 0, 0], R: [0, 0, 0] },
    senalar:      { L: [0, 0, -.1], R: [-1.45 + Math.sin(lt * 9) * .12, 0, -.1] },
    jarras:       { L: [-.15, 0, -.5], R: [-.15, 0, .5] },
    brazosArriba: { L: [0, 0, -2.5 - Math.sin(lt * 8) * .15], R: [0, 0, 2.5 + Math.sin(lt * 8) * .15] },
    encoger:      { L: [-.7, 0, -.5], R: [-.7, 0, .5] },
    manosJuntas:  { L: [-1.1, 0, .5], R: [-1.1, 0, -.5] },
  }[nombre] ?? { L: [0, 0, 0], R: [0, 0, 0] };
  ['L', 'R'].forEach(s => { const a = p['arm' + s]; a.rotation.x = lerp(a.rotation.x, P[s][0], k); a.rotation.y = lerp(a.rotation.y, P[s][1], k); a.rotation.z = lerp(a.rotation.z, P[s][2], k); });
  if (nombre === 'encoger') { p.head.position.y = 1.92 - .06 * k; }
}

// ---------- SETS REUTILIZABLES (MEJORAS 0) ----------
// Cada set arma un lugar completo en low-poly y devuelve sus piezas para animarlas. Llamar en setup() después de ambiente().
// Ambientes sugeridos para cada set (pásalos a ambiente()):
export const AMB = {
  cuartoNoche: { top: 0x10152b, bottom: 0x2d2b52, fog: 0x161a33, near: 5, far: 22, sunColor: 0x9fb4ff, sunInt: 1.5, hemiInt: .75, sunPos: [-5, 9, 6] },
  cuartoDia:   { top: 0x6f8fc2, bottom: 0xf2c58e, fog: 0xc9b39a, near: 7, far: 26, sunColor: 0xffe2b8, sunInt: 2.6, hemiInt: 1.1 },
  calle:       { top: 0x3a4c7a, bottom: 0xf0a868, fog: 0xc98e6a, near: 10, far: 55, sunColor: 0xffd8a8, sunInt: 2.6, hemiInt: 1.0, sunPos: [-8, 10, 6] },
  espacio:     { top: 0x05060f, bottom: 0x1b1440, fog: 0x05060f, near: 30, far: 120, sunColor: 0xfff1dc, sunInt: 2.4, hemiInt: .6 },
  cielo:       { top: 0x2c3d78, bottom: 0xf3a46f, fog: 0xe9a07a, near: 6, far: 40, sunColor: 0xffe0b5, sunInt: 2.4, hemiInt: 1.2 },
};
// Cama low-poly (largo en z). Devuelve el grupo con .colchon, .cobija y .almohada
export function cama(pos = [0, 0, 0], o = {}, parent) {
  const g = group(pos, parent), wood = o.madera ?? 0x7a4e2f;
  box(1.5, .35, 2.2, wood, [0, .18, 0], g); box(1.5, 1.0, .1, wood, [0, .5, -1.1], g);      // base y cabecera
  g.colchon = box(1.4, .22, 2.05, 0xf1ece2, [0, .46, .02], g);
  g.almohada = box(.9, .14, .4, 0xffffff, [0, .64, -.78], g);
  g.cobija = box(1.46, .1, 1.3, o.cobija ?? 0x4f6fb3, [0, .6, .42], g);
  return g;
}
// Persona acostada boca arriba sobre una cama (usa persona() y la gira). y = altura del colchón.
export function acostar(p, [x, y, z]) { p.rotation.set(-Math.PI / 2, 0, 0); p.position.set(x, y, z); p.armL.rotation.z = .15; p.armR.rotation.z = -.15; return p; }
// Recámara: piso de duela, dos paredes, ventana (luna o sol), cama, buró con lámpara y tapete.
export function setCuarto(o = {}) {
  const noche = o.noche ?? true, pared = o.pared ?? (noche ? 0x5a5f86 : 0xe9dcc6);
  for (let k = -6; k < 6; k++) box(.5, .03, 9, k % 2 ? 0x8a6242 : 0x9a7050, [k * .5 + .25, -.015, 0]);
  box(6, 3.2, .15, pared, [0, 1.6, -2.4]); box(.15, 3.2, 6, pared, [-3, 1.6, .5]);
  const win = box(1.3, 1.0, .05, noche ? 0x1d2a5c : 0xbfe3ff, [1.5, 1.9, -2.3], null, { emissive: noche ? 0x22336e : 0xbfe3ff, ei: .5 });
  box(1.4, .07, .1, 0xf2efe8, [1.5, 1.37, -2.28]); box(.06, 1.05, .08, 0xf2efe8, [1.5, 1.9, -2.27]);
  let astro = null; if (noche) { astro = ball(.13, 0xfff3c4, [1.75, 2.15, -2.25], null, 1, { emissive: 0xfff3c4, ei: 1 }); astro.castShadow = false; }
  const c = cama([0, 0, -1.2], o);
  const buro = group([-1.15, 0, -1.9]); box(.55, .55, .45, 0x6b4428, [0, .28, 0], buro);
  cyl(.06, .1, .25, 0xd8c8a8, [0, .68, 0], buro, 8); const pant = cyl(.12, .2, .2, 0xffe0a0, [0, .88, 0], buro, 8, { emissive: 0xffc870, ei: noche ? .9 : .2 });
  const tap = box(1.8, .02, 1.1, o.tapete ?? 0xc0583f, [0, .01, .6]); tap.castShadow = false;
  let luz = null; if (noche && o.lampara !== false) { luz = new THREE.PointLight(0xffc27a, 2.2, 5, 1.6); luz.position.set(-1.15, 1.05, -1.75); world.add(luz); }
  return { cama: c, buro, pantalla: pant, ventana: win, astro, luz };
}
// Calle: banqueta, asfalto con líneas, edificios low-poly a ambos lados y postes. largo = metros hacia -z.
export function setCalle(o = {}) {
  const largo = o.largo ?? 40, cols = o.colores ?? [0xd98f6a, 0xe8c27a, 0x7fa7c9, 0xb58bc0, 0x8fbf8f, 0xe3a0a0];
  box(7, .02, largo, 0x3c3f47, [0, -.01, -largo / 2 + 4]);
  for (let z = 3; z > -largo + 4; z -= 2.2) box(.12, .025, 1, 0xf4e6b0, [0, 0, z]);
  for (const s of [-1, 1]) { box(2.2, .15, largo, 0xb8b1a6, [s * 4.6, .075, -largo / 2 + 4]);
    let z = 3, k = 0; while (z > -largo + 4) { const d = 2.5 + (k % 3) * .6, h = 3 + ((k * 7) % 5) * 1.2;
      box(3, h, d, cols[(k + (s > 0 ? 2 : 0)) % cols.length], [s * 7.2, h / 2, z - d / 2]);
      for (let y = 1.2; y < h - .5; y += 1.1) box(.05, .55, d * .6, 0xffe7b0, [s * 5.68, y, z - d / 2], null, { emissive: 0xffd28a, ei: .25 });
      z -= d + .15; k++; }
    for (let z = 2; z > -largo + 4; z -= 7) { cyl(.05, .06, 3.2, 0x2b2f38, [s * 3.8, 1.6, z]); ball(.16, 0xfff0c0, [s * 3.6, 3.2, z], null, 0, { emissive: 0xffe2a0, ei: .8 }); } }
}
// Espacio: fondo de estrellas y un planeta opcional. Ideal para datos del cosmos.
export function setEspacio(o = {}) {
  for (let k = 0; k < (o.estrellas ?? 140); k++) { const s = ball(.03 + Math.random() * .06, 0xffffff, [(Math.random() - .5) * 60, (Math.random() - .5) * 80, -15 - Math.random() * 30], world, 0, { emissive: 0xffffff, ei: .9 }); s.castShadow = false; }
  return o.planeta ? ball(o.planeta.r ?? 2, o.planeta.color ?? 0x6b5cff, o.planeta.pos ?? [0, 0, -6], null, 1, { rough: .7 }) : null;
}
// Cielo con nubes low-poly (para escenas de "caída", vuelo o sueño). Devuelve las nubes para moverlas.
export function setCielo(o = {}) {
  const nubes = [];
  for (let k = 0; k < (o.n ?? 26); k++) { const g = group([(Math.random() - .5) * 14, (Math.random() - .5) * 30, -2 - Math.random() * 10]);
    const c = o.color ?? 0xfff1e6; for (let j = 0; j < 4; j++) ball(.5 + Math.random() * .5, c, [j * .55 - .8, Math.random() * .25, Math.random() * .3], g, 0, { rough: 1 });
    g.userData.v = .6 + Math.random() * .8; nubes.push(g); }
  return nubes;
}
// Mueve nubes hacia arriba (sensación de caer). vel en m/s; envuelve en un rango vertical.
export function nubesCaida(nubes, lt, vel = 6, y0 = -15, y1 = 15) { nubes.forEach((g, k) => { const span = y1 - y0; g.position.y = y0 + ((k * 3.7 + lt * vel * g.userData.v) % span + span) % span; }); }
// Laboratorio (añadido 2026-11-05, short de la voz): piso claro, pared de azulejo, mesa de trabajo blanca con matraces
// de colores que brillan, repisa con frascos, pizarrón y lámparas colgantes. Devuelve {mesa, frascos, pizarron, topY}.
// La mesa queda centrada en x=0, z=-.6 con la cubierta a topY=.92 (pon ahí tu objeto protagonista).
export function setLaboratorio(o = {}) {
  const acc = o.acento ?? 0x4fd1c5;
  for (let x = -6; x < 6; x++) for (let z = -6; z < 4; z++) box(.6, .02, .6, (x + z) % 2 ? 0xdfe3e6 : 0xc9cfd4, [x * .6 + .3, -.01, z * .6 + .3]);
  for (let y = 0; y < 8; y++) for (let x = -10; x < 10; x++) box(.39, .39, .12, (x + y) % 3 ? 0xeef3f3 : 0xdbe7e8, [x * .4 + .2, y * .4 + .2, -3]);
  const piz = box(2.2, 1.1, .06, 0x24443a, [-1.3, 2.0, -2.9]); box(2.3, .07, .1, 0x8a6242, [-1.3, 1.42, -2.88]);
  box(2.2, .06, .35, 0x9aa7b0, [1.6, 2.0, -2.8]);                                         // repisa
  const frascos = [];
  [[0xff7a59, .9], [acc, 1.25], [0xf3c54d, 1.6], [0xb58bc0, 1.95], [acc, 2.3]].forEach(([c, x]) => {
    cyl(.09, .09, .26, 0xe8f1f2, [x, 2.16, -2.8], null, 10, { transparent: true, opacity: .5 });
    frascos.push(cyl(.075, .075, .15, c, [x, 2.1, -2.8], null, 10, { emissive: c, ei: .5 })); });
  const mesa = group([0, 0, -.6]);
  box(2.6, .08, 1.1, 0xf4f6f6, [0, .88, 0], mesa); box(2.5, .8, 1.0, 0x6d8a9c, [0, .42, 0], mesa);
  [[-1.0, 0xff7a59], [1.05, acc]].forEach(([x, c]) => { cyl(.03, .16, .26, 0xe8f1f2, [x, 1.05, .25], mesa, 10, { transparent: true, opacity: .55 });
    frascos.push(cyl(.02, .12, .12, c, [x, .98, .25], mesa, 10, { emissive: c, ei: .6 })); });
  for (const x of [-1.6, 1.6]) { cyl(.01, .01, 1, 0x333333, [x, 3.3, -.6]); const l = cyl(.08, .28, .2, 0x2f3b45, [x, 2.75, -.6], null, 10);
    ball(.07, 0xfff4d0, [x, 2.64, -.6], null, 0, { emissive: 0xfff0c0, ei: 1 }).castShadow = false; l.castShadow = false; }
  return { mesa, frascos, pizarron: piz, topY: .92 };
}
// Mapa plano low-poly sobre una mesa/piso (estilo documental): mar, "países" como losetas de colores con relieve y
// marcadores. lugares = [{nombre, x, z, color}] → devuelve {mapa, pins:[{grupo,pos3}]}; usa etiqueta(nombre, pin.pos3, t).
export function setMapa(o = {}) {
  const g = group(o.pos ?? [0, 0, 0]), W0 = o.ancho ?? 6, D0 = o.fondo ?? 4;
  box(W0 + .3, .12, D0 + .3, 0x6b4a30, [0, -.06, 0], g);                                  // marco de madera
  box(W0, .02, D0, o.mar ?? 0x3f7fb0, [0, .01, 0], g, { rough: .5 });
  const tierra = o.tierra ?? [0x9cc27a, 0xc9b27a, 0x8fb06a, 0xd4c08e];
  // islas/continentes en celdas con alturas distintas (determinista para que no cambie entre fotogramas)
  for (let i = 0; i < 70; i++) { const a = i * 2.39996, r = Math.sqrt(i / 70) * Math.min(W0, D0) * .42;
    const x = Math.cos(a) * r * (W0 / D0) * .9, z = Math.sin(a) * r, h = .04 + ((i * 37) % 7) * .012;
    if (((i * 53) % 10) < 3) continue; box(.42, h, .42, tierra[i % tierra.length], [x, h / 2 + .02, z], g); }
  const pins = (o.lugares ?? []).map(L => { const p = group([L.x, 0, L.z], g); cyl(.015, .015, .45, 0x333333, [0, .25, 0], p, 6);
    ball(.09, L.color ?? 0xff5c5c, [0, .5, 0], p, 1, { emissive: L.color ?? 0xff5c5c, ei: .3 });
    return { grupo: p, nombre: L.nombre, pos3: [(o.pos?.[0] ?? 0) + L.x, (o.pos?.[1] ?? 0) + .78, (o.pos?.[2] ?? 0) + L.z] }; });
  return { mapa: g, pins };
}
// Perro low-poly (mira hacia +z). o: {pos, s (escala; 1 ≈ perro mediano, .6 cachorro), color, mancha, collar}
// Devuelve el grupo con .head (gira), .jaw (abre la boca con rotation.x>0), .tail, .legs[4], .earL/.earR, .body
// Usa perroAnda(p, lt, vel) para animar patas y cola.
export function perro(o = {}, parent) {
  const g = group(o.pos ?? [0, 0, 0], parent); g.scale.setScalar(o.s ?? 1);
  const c = o.color ?? 0xc9925a, m = o.mancha ?? 0xf2e2c8, osc = o.oscuro ?? 0x5a3a22;
  g.body = box(.42, .36, .8, c, [0, .5, 0], g); box(.3, .1, .6, m, [0, .33, .04], g);           // cuerpo y panza clara
  g.legs = [[-.13, .26], [.13, .26], [-.13, -.28], [.13, -.28]].map(([x, z]) => { const L = group([x, .4, z], g);
    box(.12, .4, .12, c, [0, -.2, 0], L); box(.13, .06, .16, m, [0, -.39, .02], L); return L; });
  g.tail = group([0, .62, -.4], g); box(.07, .07, .34, c, [0, .08, -.15], g.tail); g.tail.rotation.x = -.7;
  g.head = group([0, .78, .42], g);
  box(.36, .32, .34, c, [0, 0, 0], g.head);                                                   // cráneo
  box(.22, .12, .2, m, [0, -.04, .25], g.head);                                               // hocico (arriba)
  ball(.045, 0x1b1410, [0, .03, .36], g.head, 0, { rough: .3 });                              // nariz
  g.jaw = group([0, -.1, .15], g.head); box(.2, .06, .2, m, [0, -.03, .1], g.jaw);            // mandíbula
  g.lengua = box(.1, .02, .1, 0xe86a7a, [0, .01, .13], g.jaw);
  g.ojos = [-.09, .09].map(x => box(.05, .06, .02, 0x111111, [x, .07, .175], g.head));
  g.earL = group([-.17, .14, -.02], g.head); box(.08, .2, .14, osc, [0, -.08, 0], g.earL); g.earL.rotation.z = .5;
  g.earR = group([.17, .14, -.02], g.head); box(.08, .2, .14, osc, [0, -.08, 0], g.earR); g.earR.rotation.z = -.5;
  if (o.collar !== false) cyl(.15, .15, .06, o.collar ?? 0xe0403a, [0, .66, .36], g, 10).rotation.x = Math.PI / 2 - .5;
  return g;
}
export function perroAnda(p, lt, vel = 1, cola = 1) {
  p.legs.forEach((L, k) => { L.rotation.x = Math.sin(lt * 10 * vel + (k === 0 || k === 3 ? 0 : Math.PI)) * .45 * Math.min(vel, 1); });
  p.tail.rotation.y = Math.sin(lt * 14) * .6 * cola; p.body.position.y = .5 + Math.abs(Math.sin(lt * 10 * vel)) * .02 * Math.min(vel, 1);
}

// Gato low-poly (añadido 2026-11-06, short del gato; mira hacia +z). o: {pos, s (1 ≈ gato adulto ~45 cm de alto), color,
// panza, rayas (color o false), ojos (color del iris)}. Devuelve el grupo con .head, .earL/.earR, .pupilas (escala x = dilatar),
// .cola (5 segmentos encadenados), .legs[4] (0=del. izq, 1=del. der), .body, .bigotes.
// Animar con gatoAnda(g, lt, vel, cola), colaGato(g, lt, k, rapidez), patita(g, k, lado) y ojosCazador(g, k).
export function gato(o = {}, parent) {
  const g = group(o.pos ?? [0, 0, 0], parent); g.scale.setScalar(o.s ?? 1);
  const c = o.color ?? 0xe08a3c, pz = o.panza ?? 0xf6e7d2, ray = o.rayas ?? 0xb0602a, iris = o.ojos ?? 0x9fd84a;
  g.body = group([0, .3, 0], g); box(.26, .24, .55, c, [0, 0, 0], g.body); box(.2, .06, .44, pz, [0, -.11, .02], g.body);
  if (ray !== false) for (const z of [-.15, 0, .15]) box(.27, .03, .06, ray, [0, .11, z], g.body);
  box(.24, .26, .2, c, [0, .1, .22], g.body);                                                    // pecho alto (sentado/erguido)
  box(.16, .16, .03, pz, [0, .06, .325], g.body);
  g.legs = [[-.08, .2], [.08, .2], [-.08, -.2], [.08, -.2]].map(([x, z]) => { const L = group([x, .26, z], g);
    box(.075, .26, .075, c, [0, -.13, 0], L); box(.085, .04, .1, pz, [0, -.25, .015], L); return L; });
  g.head = group([0, .52, .32], g);
  box(.26, .22, .22, c, [0, 0, 0], g.head);                                                      // cráneo
  box(.3, .12, .16, c, [0, -.04, .01], g.head);                                                  // mejillas
  box(.13, .07, .07, pz, [0, -.06, .12], g.head);                                                // hocico
  const nar = box(.04, .03, .02, 0xe8788a, [0, -.025, .16], g.head); nar.castShadow = false;
  if (ray !== false) for (const x of [-.05, 0, .05]) box(.025, .07, .02, ray, [x, .08, .11], g.head);
  g.earL = group([-.08, .11, 0], g.head); g.earR = group([.08, .11, 0], g.head);
  [g.earL, g.earR].forEach((e, k) => { const m = new THREE.Mesh(new THREE.ConeGeometry(.065, .13, 4), mat(c)); m.position.y = .06; m.rotation.y = Math.PI / 4; m.castShadow = true; e.add(m);
    const i = new THREE.Mesh(new THREE.ConeGeometry(.035, .08, 4), mat(0xf2a7b0)); i.position.set(0, .05, .025); i.rotation.y = Math.PI / 4; e.add(i); e.rotation.z = k ? -.2 : .2; });
  g.ojos = [-.065, .065].map(x => box(.07, .06, .02, iris, [x, .03, .112], g.head, { emissive: iris, ei: .25 }));
  g.pupilas = [-.065, .065].map(x => box(.018, .055, .01, 0x0d0d0d, [x, .03, .123], g.head));
  g.brillo = [-.065, .065].map(x => { const b = box(.014, .014, .005, 0xffffff, [x + .018, .045, .128], g.head, { emissive: 0xffffff, ei: 1 }); b.castShadow = false; return b; });
  g.bigotes = [];
  for (const s of [-1, 1]) for (const k of [0, 1]) { const b = box(.16, .006, .006, 0xffffff, [s * .14, -.05 - k * .025, .12], g.head); b.rotation.z = s * (k ? -.12 : .1); b.castShadow = false; g.bigotes.push(b); }
  g.cola = []; let par = group([0, .38, -.27], g);
  for (let k = 0; k < 5; k++) { if (k) par = group([0, 0, -.085], par); box(.055 - k * .004, .055 - k * .004, .1, k === 4 && ray !== false ? ray : c, [0, 0, -.045], par); g.cola.push(par); }
  g.cola[0].rotation.x = .7;
  return g;
}
// Cola que se curva y ondula. k = amplitud (0 quieta, 1 normal, 2 "modo cazador"), rapidez en ciclos/s.
export function colaGato(g, lt, k = 1, rapidez = .8) { g.cola.forEach((s, i) => { s.rotation.y = Math.sin(lt * rapidez * 6.28 - i * .7) * .28 * k; if (i) s.rotation.x = .18 + .05 * Math.sin(lt * 2 + i); }); }
export function gatoAnda(g, lt, vel = 1, cola = 1) {
  g.legs.forEach((L, k) => { L.rotation.x = Math.sin(lt * 9 * vel + (k === 0 || k === 3 ? 0 : Math.PI)) * .5 * Math.min(vel, 1); });
  g.body.position.y = .3 + Math.abs(Math.sin(lt * 9 * vel)) * .012 * Math.min(vel, 1); colaGato(g, lt, cola);
}
// Levanta una pata delantera hacia adelante (k 0..1). lado 1 = derecha, 0 = izquierda. Para "toquecitos": k = |sin(lt*f)|.
export function patita(g, k = 1, lado = 1) { const L = g.legs[lado]; L.rotation.x = -1.5 * k; L.position.y = .26 + .06 * k; }
// Pupilas grandes (k=1, cazador) o rendija (k=0).
export function ojosCazador(g, k = 1) { g.pupilas.forEach(p => p.scale.set(1 + 2.4 * k, 1, 1)); }

// Ondas (sonido, wifi, señal): anillos que salen de un punto y se desvanecen. Crear en setup, animar con ondas.update(lt).
// o: {color, n, vel (anillos/s), alcance (m), grosor, dir: rotación [x,y,z] del plano del anillo}
export function ondas(pos, o = {}, parent) {
  const g = group(pos, parent), n = o.n ?? 5, col = o.color ?? 0x7fd6ff, rings = [];
  for (let k = 0; k < n; k++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, o.grosor ?? .035, 6, 40, o.arco ?? Math.PI * 2),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthWrite: false })); g.add(m); rings.push(m); }
  if (o.dir) g.rotation.set(...o.dir);
  g.update = (lt, on = true) => { const vel = o.vel ?? 1.6, alc = o.alcance ?? 1.2;
    rings.forEach((m, k) => { const ph = ((lt * vel + k / n) % 1 + 1) % 1; const s = .05 + ph * alc; m.scale.set(s, s, s);
      m.material.opacity = on ? Math.sin(Math.PI * ph) * (o.opacidad ?? .9) : 0; }); };
  return g;
}

// ---------- escena / luces ----------
export async function init(wrap, d) {
  data = d; renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(W, H); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.outputColorSpace = THREE.SRGBColorSpace;
  wrap.insertBefore(renderer.domElement, wrap.firstChild);
  scene = new THREE.Scene(); world = new THREE.Group(); scene.add(world);
  camera = new THREE.PerspectiveCamera(38, W / H, 0.05, 400);
  ambiente({});
  let acc = 0; offs = d.timings.map(t => { const o = acc; acc += t.dur; return o; }); total = acc;
  ovRoot = document.getElementById('ov'); capEl = document.getElementById('cap'); barEl = document.getElementById('bar');
}
let hemi, sun;
// Ambiente: cielo/fondo degradado, niebla y luces. Llamar desde setup de cada escena para cambiar el "mood".
export function ambiente({ top = 0x2b3550, bottom = 0xc98b5e, fog = 0x2b3550, near = 12, far = 60, sunColor = 0xfff1dc, sunInt = 2.4, sunPos = [6, 12, 8], hemiInt = 1.1 }) {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#' + new THREE.Color(top).getHexString()); gr.addColorStop(1, '#' + new THREE.Color(bottom).getHexString());
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; scene.background = tex;
  scene.fog = new THREE.Fog(fog, near, far);
  if (!hemi) { hemi = new THREE.HemisphereLight(0xdfe8ff, 0x3a3028, hemiInt); scene.add(hemi); }
  if (!sun) { sun = new THREE.DirectionalLight(sunColor, sunInt); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
    Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: .5, far: 60 }); sun.shadow.bias = -0.0005; sun.shadow.radius = 4; scene.add(sun); scene.add(sun.target); }
  hemi.intensity = hemiInt; sun.color.set(sunColor); sun.intensity = sunInt; sun.position.set(...sunPos);
}
export function sunFollow(x, y, z) { sun.target.position.set(x, y, z); sun.position.set(x + 6, y + 12, z + 8); }
export function cam(pos, look, fov) { camera.position.set(...pos); camera.lookAt(...look); if (fov) { camera.fov = fov; camera.updateProjectionMatrix(); } }

// ---------- registro de escenas ----------
// E.escena('tipo', { setup(ctx) {...}, update(lt, ctx) {...} })  — ctx: {dur, w(palabra), f(n), ev(nombre,t,g)}
export function escena(tipo, def) { scenes[tipo] = def; }
function ctxFor(i) {
  const tm = data.timings[i], sc = data.script.escenas[i];
  const words = tm.words;
  return {
    i, tipo: sc.tipo, dur: tm.dur, frases: sc.frases,
    w: (sub, nth = 0) => { const h = words.filter(x => x.w.toLowerCase().includes(sub.toLowerCase())).map(x => x.t); return h.length ? h[Math.min(nth, h.length - 1)] : 0; },
    f: (k) => { const h = words.filter(x => x.frase === k); return h.length ? h[0].t : 0; },
    ev: (s, t, g = 1) => { const T = Math.round((offs[i] + t) * 1000) / 1000; const k = s + '@' + T; if (!evs.has(k)) evs.set(k, { s, t: T, g }); },
  };
}
export const events = () => [...evs.values()].sort((a, b) => a.t - b.t);

// ---------- capa 2D (subtítulos, rótulos, etiquetas) ----------
function el(cls) { if (used < pool.length) { const e = pool[used++]; e.className = cls; e.style.cssText = ''; return e; }
  const e = document.createElement('div'); e.className = cls; ovRoot.appendChild(e); pool.push(e); used++; return e; }
// Rótulo inferior estilo documental (caja oscura, borde dorado). p = tiempo desde que aparece (s).
export function rotulo(texto, sub, p, y = 1330) {
  if (p < 0) return; const e = el('lt'); const s = Math.max(0.01, spring(p / 0.55, 1.4, 8));
  e.innerHTML = `<div class="t">${texto}</div>` + (sub ? `<div class="s">${sub}</div>` : '');
  e.style.top = y + 'px'; e.style.setProperty('--s', s.toFixed(3)); e.style.opacity = cl(p / 0.15);
}
// Etiqueta pegada a un punto 3D (ej. "ISLA ÁNGEL" sobre un mapa)
// fondo=true (MEJORAS 0j): píldora oscura detrás del texto, para fondos claros.
export function etiqueta(texto, pos3, p, size = 58, color = '#fff', fondo = false) {
  if (p < 0) return; camera.updateMatrixWorld(); /* matriz al día: si no, usa la cámara del fotograma anterior */ const v = new THREE.Vector3(...pos3).project(camera); const e = el(fondo ? 'tag3d pill' : 'tag3d');
  e.textContent = texto; e.style.left = ((v.x + 1) / 2 * W) + 'px'; e.style.top = ((1 - v.y) / 2 * H) + 'px';
  e.style.fontSize = size + 'px'; e.style.color = color; e.style.opacity = cl(p / 0.25);
}
function captions(i, lt) {
  const words = data.timings[i].words; if (!words.length) { capEl.innerHTML = ''; return; }
  let cur = 0; words.forEach((x, j) => { if (x.t <= lt) cur = j; });
  const fr = words[cur].frase, same = words.map((x, j) => [x, j]).filter(([x]) => x.frase === fr);
  const pos = same.findIndex(([, j]) => j === cur); const c0 = Math.floor(pos / 6) * 6; const chunk = same.slice(c0, c0 + 6);
  capEl.innerHTML = chunk.map(([x, j]) => `<span class="${j < cur ? 'on' : j === cur ? 'cur' : ''}">${x.w}</span>`).join(' ');
}

// ---------- fotograma ----------
export function frame(gt) {
  let i = 0; for (let k = 0; k < offs.length; k++) if (offs[k] <= gt) i = k;
  const lt = gt - offs[i]; const tipo = data.script.escenas[i].tipo; const def = scenes[tipo] ?? scenes.cierre; const ctx = ctxFor(i);
  if (i !== curIdx) { world.clear(); if (def.setup) def.setup(ctx); curIdx = i; if (i > 0) ctx.ev('whoosh', -0.15, 0.7); }
  used = 0; def.update(lt, ctx);
  for (let k = used; k < pool.length; k++) pool[k].style.display = 'none';
  captions(i, lt); barEl.style.width = (W * gt / total) + 'px';
  renderer.render(scene, camera);
  return true;
}

// ---------- cierre por defecto (planeta low-poly + rótulos) ----------
escena('cierre', {
  setup() {
    ambiente({ top: 0x141a33, bottom: 0x3b2a5c, fog: 0x141a33, near: 20, far: 80, sunColor: 0xffe7c4, sunInt: 2.2, hemiInt: 1.2 });
    const g = group([0, 1.6, 0]); this.g = g;
    this.planet = ball(1.6, 0x6b5cff, [0, 0, 0], g, 1, { rough: .7 });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.5, .09, 6, 48), mat(0xff5c9a)); ring.rotation.x = Math.PI / 2.6; g.add(ring);
    this.moon = ball(.38, 0xffc93c, [2.5, 0, 0], g, 0);
    for (let k = 0; k < 60; k++) { const s = ball(.03 + Math.random() * .04, 0xffffff, [(Math.random() - .5) * 30, (Math.random() - .5) * 40, -10 - Math.random() * 10], world, 0, { emissive: 0xffffff, ei: .8 }); s.castShadow = false; }
  },
  update(lt, c) {
    const k = Math.max(.01, spring(lt / .8)); this.g.scale.setScalar(k); this.g.rotation.y = lt * .5; this.planet.rotation.x = lt * .3;
    const a = lt * 1.6; this.moon.position.set(Math.cos(a) * 2.5, Math.sin(a) * .9, Math.sin(a) * 1.2);
    cam([0, -.6, 15 - lt * .3], [0, .4, 0], 36);
    const tc = c.w('comentarios') || 1.5, ts = c.w('síguenos') || 3;
    rotulo('¿Qué dato quieres ver?', 'déjalo en los comentarios', lt - tc, 1180);
    if (lt > tc) c.ev('pop', tc);
    rotulo('Síguenos', 'Dato Cósmico 2 · un dato curioso cada día', lt - ts, 1380);
    if (lt > ts) c.ev('ding', ts, .6);
  }
});

// ---------- MEJORAS 0k (6-nov 21:30, short de la cebolla): sets de cocina y comedor reutilizables ----------
// Comedor (antes local en el short del gato): duela, pared con lambrín, ventana, cuadro y mesa con cubierta a y=o.top (.8).
export function comedor(o = {}) {
  const TOP = o.top ?? .8;
  for (let k = -8; k < 8; k++) box(.5, .03, 10, k % 2 ? 0x8a6242 : 0x9a7050, [k * .5 + .25, -.015, 0]);
  box(8, 3.4, .15, o.pared ?? 0xe9dcc6, [0, 1.7, -2.2]); box(8, .9, .17, 0x7f9a8a, [0, .45, -2.18]); box(8, .06, .2, 0xf4efe6, [0, .92, -2.16]);
  box(1.3, 1.0, .05, o.vidrio ?? 0xbfe3ff, [1.6, 2.0, -2.1], null, { emissive: o.vidrio ?? 0xbfe3ff, ei: .45 }); box(1.4, .07, .1, 0xf4efe6, [1.6, 1.47, -2.08]);
  box(.8, .6, .04, 0xd9a93a, [-1.5, 2.1, -2.1]); box(.7, .5, .02, 0x3f7fb0, [-1.5, 2.1, -2.08]);
  const mesa = group([0, 0, 0]); box(1.9, .08, 1.0, 0x8a5a36, [0, TOP - .04, 0], mesa);
  for (const x of [-.85, .85]) for (const z of [-.42, .42]) box(.08, TOP - .08, .08, 0x6b4428, [x, (TOP - .08) / 2, z], mesa);
  if (o.mantel !== false) box(.9, .01, .5, o.mantel ?? 0xf3c54d, [-.35, TOP + .005, 0], mesa).castShadow = false;
  mesa.topY = TOP; return mesa;
}
// Vaso de vidrio con agua (origen en la base). .agua para ajustar nivel.
export function vaso(pos, parent, s = 1) {
  const g = group(pos, parent); g.scale.setScalar(s);
  const v = cyl(.075, .06, .22, 0xdff3ff, [0, .11, 0], g, 12, { opacity: .38, rough: .1 }); v.material.depthWrite = false;
  g.agua = cyl(.066, .056, .14, 0x4fb3ff, [0, .075, 0], g, 12, { opacity: .7, emissive: 0x1a7fe0, ei: .25 });
  cyl(.06, .06, .012, 0xdff3ff, [0, .006, 0], g, 12, { opacity: .6 });
  return g;
}
// Pedazos de vajilla rota regados en el piso alrededor de centro=[x,z].
export function pedazos(n, centro, radio, colores = [0xffffff, 0x3f7fb0, 0xf4efe6]) {
  return Array.from({ length: n }, (_, k) => { const a = k * 2.4, r = radio * (.3 + ((k * 37) % 10) / 14);
    const b = box(.06 + (k % 3) * .03, .015, .05 + (k % 2) * .04, colores[k % colores.length], [centro[0] + Math.cos(a) * r, .01, centro[1] + Math.sin(a) * r]);
    b.rotation.y = k; return b; });
}
// Cocina mexicana low-poly: piso de mosaico, pared de azulejo, barra con cubierta (y=.92) a lo largo de x en z=-1.6,
// alacenas arriba, estufa con comal, ventana y refrigerador con puerta que abre (refri.puerta.rotation.y, 0..-1.9).
// Devuelve { barra, topY, refri:{g, puerta, frio}, estufa, ventana }. o.acento = color de alacenas.
export function setCocina(o = {}) {
  const topY = .92, zb = -1.6, ac = o.acento ?? 0x4f8a7a;
  for (let x = -8; x < 8; x++) for (let z = -5; z < 6; z++) box(.5, .02, .5, (x + z) % 2 ? 0xd8cdb8 : 0xb8a58a, [x * .5 + .25, -.01, z * .5 + .25]);
  box(9, 3.4, .15, 0xf1e6d2, [0, 1.7, -2.2]);
  for (let x = -4; x < 4; x += .3) for (let y = 1.0; y < 1.6; y += .3) box(.28, .28, .02, ((x * 10 + y * 10) | 0) % 2 ? 0xf7f4ee : 0x6fa3c9, [x + .15, y + .15, -2.12]);
  const barra = group([0, 0, 0]);
  box(5, .86, .6, ac, [0, .43, zb], barra); box(5.05, .06, .66, 0xe9e2d6, [0, topY - .03, zb], barra);
  for (let x = -2.25; x < 2.4; x += .75) box(.02, .7, .01, 0x2f2a26, [x, .45, zb + .305], barra);
  box(5, .7, .35, ac, [0, 2.45, -1.98]); for (let x = -2.25; x < 2.4; x += .75) box(.1, .03, .02, 0xd9c08a, [x + .3, 2.2, -1.79]);
  const estufa = group([-1.6, 0, zb]); box(.8, .02, .55, 0x2b2b2b, [0, topY + .005, 0], estufa);
  for (const [x, z] of [[-.2, -.12], [.2, -.12], [-.2, .14], [.2, .14]]) cyl(.08, .08, .015, 0x111111, [x, topY + .02, z], estufa, 10);
  cyl(.2, .2, .02, 0x3a3a3a, [.0, topY + .04, 0], estufa, 14);   // comal
  const ventana = box(1.2, .9, .05, o.vidrio ?? 0xbfe3ff, [.6, 1.95, -2.1], null, { emissive: o.vidrio ?? 0xbfe3ff, ei: .4 });
  box(1.3, .07, .1, 0xffffff, [.6, 1.47, -2.06]);
  // refrigerador
  const rg = group([2.95, 0, -1.55]);   // gabinete hueco (se ve el interior al abrir la puerta)
  box(.85, 1.9, .05, 0xe8ecef, [0, .95, -.325], rg, { rough: .35 }); for (const x of [-.4, .4]) box(.05, 1.9, .7, 0xe8ecef, [x, .95, 0], rg, { rough: .35 });
  box(.85, .08, .7, 0xe8ecef, [0, 1.86, 0], rg, { rough: .35 }); box(.85, .12, .7, 0xe8ecef, [0, .06, 0], rg, { rough: .35 });
  const luzR = new THREE.PointLight(0xcfefff, 1.2, 1.6, 1.5); luzR.position.set(0, 1.5, .1); rg.add(luzR);
  const frio = box(.75, 1.72, .02, 0xbfe9ff, [0, .95, -.29], rg, { emissive: 0x9fdcff, ei: .7 }); frio.castShadow = false;
  for (const y of [.45, .85, 1.25]) box(.72, .02, .55, 0xffffff, [0, y, .05], rg, { opacity: .7 });
  const puerta = group([-.425, 0, .36], rg); box(.85, 1.9, .06, 0xf4f6f8, [.425, .95, 0], puerta, { rough: .35 });
  box(.04, .5, .05, 0x9aa3ab, [.78, 1.25, .05], puerta);
  return { barra, topY, refri: { g: rg, puerta, frio }, estufa, ventana };
}

// ---------- MEJORAS 0i (7-nov 13:30, short de los átomos): mano(), reloj() y atomo() reutilizables ----------
// Mano grande low-poly con la palma hacia +z y dedos hacia +y. g.dedos[i] = [f0,f1,f2]; g.flex(k, i) dobla (k 0..1.4);
// o: {skin, manga (color del puño; null = sin puño)}. Para "chocar los cinco", gira y=±PI/2 para que las palmas se miren.
export function mano(pos, s = 1, parent, o = {}) {
  const SK = o.skin ?? 0xe0b08c, SK2 = o.skin2 ?? 0xc99872;
  const g = group(pos, parent); g.scale.setScalar(s);
  box(.95, 1.0, .32, SK, [0, .5, 0], g);
  if (o.manga !== null) box(.85, .45, .34, o.manga ?? 0x6f9bd6, [0, -.22, 0], g);
  g.dedos = [[-.36, .78], [-.12, .95], [.12, .9], [.36, .7]].map(([x, L]) => {
    const segs = []; let par = group([x, 1.0, 0], g);
    ball(.135, SK2, [0, 0, 0], par, 0);
    [L * .42, L * .33, L * .25].forEach((l, k) => { if (k) { par = group([0, segs[k - 1].userData.l, 0], segs[k - 1]); ball(.105, SK, [0, 0, 0], par, 0); }
      box(.2 - k * .02, l, .24 - k * .02, SK, [0, l / 2, 0], par); par.userData.l = l; segs.push(par); });
    box(.12, .06, .04, 0xf4dccb, [0, segs[2].userData.l - .06, .12], segs[2]);
    return segs; });
  const th = group([-.5, .3, .05], g); th.rotation.z = .75; ball(.13, SK2, [0, 0, 0], th, 0); box(.22, .42, .24, SK, [0, .21, 0], th);
  const th2 = group([0, .42, 0], th); box(.2, .3, .22, SK, [0, .15, 0], th2); g.pulgar = [th, th2];
  g.flex = (k, i = -1) => g.dedos.forEach((d, j) => { if (i < 0 || i === j) d.forEach((sg, n) => sg.rotation.x = k * (n ? 1.0 : .7)); });
  return g;
}
// Reloj de pared: g.min y g.hor giran con rotation.z (negativo = sentido horario).
export function reloj(pos, r = .55, parent) {
  const g = group(pos, parent); cyl(r, r, .1, 0xf4efe6, [0, 0, 0], g, 24).rotation.x = Math.PI / 2;
  g.add(new THREE.Mesh(new THREE.TorusGeometry(r, .06, 6, 24), mat(0xd9a93a)));
  for (let k = 0; k < 12; k++) box(.04, .1, .02, 0x333333, [Math.sin(k * Math.PI / 6) * r * .82, Math.cos(k * Math.PI / 6) * r * .82, .06], g).rotation.z = -k * Math.PI / 6;
  g.hor = group([0, 0, .08], g); box(.05, r * .5, .02, 0x222222, [0, r * .25, 0], g.hor);
  g.min = group([0, 0, .09], g); box(.035, r * .78, .02, 0xd94a3a, [0, r * .39, 0], g.min);
  return g;
}
// Átomo low-poly: núcleo de bolitas (protones rojos, neutrones grises), nube de electrones azul brillante
// y órbitas con electrones. o: {r (radio de órbita), nucleones, orbitas, nube:true, colorP, colorN, colorE}.
// Animar con g.update(lt, k) (k = 0..1 visibilidad de nube/órbitas). g.nucleo, g.nube, g.electrones, g.orbitas.
export function atomo(pos, o = {}, parent) {
  const g = group(pos, parent), R = o.r ?? 1.6, cE = o.colorE ?? 0x58c8ff;
  g.nucleo = group([0, 0, 0], g); const n = o.nucleones ?? 14, rn = o.rn ?? .17;
  for (let k = 0; k < n; k++) { const ph = Math.acos(1 - 2 * (k + .5) / n), th = k * 2.399, rr = k ? rn * 1.25 : 0;
    ball(rn, k % 2 ? (o.colorN ?? 0xb9bec6) : (o.colorP ?? 0xe0453a), [rr * Math.sin(ph) * Math.cos(th), rr * Math.cos(ph), rr * Math.sin(ph) * Math.sin(th)], g.nucleo, 1, { rough: .5 }); }
  g.nube = [];
  if (o.nube !== false) for (const [s, op] of [[R * 1.05, .10], [R * .75, .12], [R * .45, .10]]) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 2), new THREE.MeshBasicMaterial({ color: cE, transparent: true, opacity: op, depthWrite: false }));
    m.userData.op = op; g.add(m); g.nube.push(m); }
  g.orbitas = []; g.electrones = [];
  (o.orbitas ?? [[1.2, 0], [1.2, 1.05], [1.2, -1.05]]).forEach(([ix, iy], k) => {
    const og = group([0, 0, 0], g); og.rotation.set(ix, iy, 0);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(R, .015, 4, 64), new THREE.MeshBasicMaterial({ color: cE, transparent: true, opacity: .55, depthWrite: false })); og.add(ring);
    const e = ball(.09, 0xbff0ff, [R, 0, 0], og, 1, { emissive: cE, ei: 1.6 }); e.castShadow = false;
    og.userData.ph = k * 2.1; g.orbitas.push(og); g.electrones.push(e); });
  g.update = (lt, k = 1) => {
    g.nucleo.rotation.y = lt * .6; g.nucleo.position.x = Math.sin(lt * 9) * .01;
    g.orbitas.forEach((og, j) => { const a = lt * (2.2 + j * .35) + og.userData.ph; g.electrones[j].position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
      og.children[0].material.opacity = .55 * k; g.electrones[j].visible = k > .05; });
    g.nube.forEach((m, j) => { m.material.opacity = m.userData.op * k * (1 + .25 * Math.sin(lt * 3 + j)); m.rotation.y = lt * (.3 + j * .1); });
  };
  return g;
}

// ---------- 7-nov 18:00 (short de la pierna dormida): persona sentada, vapores y lágrimas, baño ----------
// sentar(p, k=0..1): dobla cadera y rodillas. Para que los pies toquen el piso, el asiento va a y≈.345 y p.position.y = -.435
// (cadera a .465); la persona queda mirando a +z con los muslos hacia adelante. Con k parcial sirve para pararse/sentarse animado.
export function sentar(p, k = 1) {
  ['L', 'R'].forEach(s => { p['leg' + s].rotation.x = lerp(p['leg' + s].rotation.x, -Math.PI / 2, k); p['knee' + s].rotation.x = lerp(p['knee' + s].rotation.x, Math.PI / 2, k); });
  p.userData.sentado = k;
}
// gas(a, b, n, color): partículas que suben por un camino curvo de a → b (vapor, olor, gas de cebolla, aliento).
// update(lt, on 0..1, vel). (MEJORAS 0m, antes local en el short de la cebolla)
export function gas(a, b, n = 26, color = 0xd9ffb0, parent) {
  const ps = Array.from({ length: n }, (_, k) => { const p = ball(.018 + (k % 3) * .008, color, [0, 0, 0], parent, 0, { emissive: color, ei: .8, opacity: .55 });
    p.material.depthWrite = false; p.castShadow = false; p.visible = false; return p; });
  return { ps, update(lt, on = 1, vel = .35) {
    ps.forEach((p, k) => { const ph = ((lt * vel + k / n) % 1 + 1) % 1; p.visible = on > 0 && ph < on + .02 && lt * vel > k / n * .5;
      const w = Math.sin(ph * 9 + k) * .06 * (1 + ph);
      p.position.set(lerp(a[0], b[0], ph) + w, lerp(a[1], b[1], ease(ph)), lerp(a[2], b[2], ph) + Math.cos(ph * 7 + k) * .05);
      p.scale.setScalar(.6 + ph * 1.4); p.material.opacity = .65 * Math.sin(Math.PI * Math.min(1, ph * 1.1)); }); } };
}
// lagrimas(p, n) + llorar(ls, lt, on): gotas que escurren de los ojos de una persona (MEJORAS 0m)
export function lagrimas(p, n = 3) {
  return Array.from({ length: n * 2 }, (_, k) => { const d = ball(.022, 0x7fd0ff, [0, 0, 0], p.head, 0, { emissive: 0x3aa0ff, ei: .6, opacity: .9 }); d.scale.set(.8, 1.3, .8); d.castShadow = false; d.visible = false; d.k = k; return d; });
}
export function llorar(ls, lt, on = 1) {
  ls.forEach(d => { const lado = d.k % 2 ? 1 : -1, ph = ((lt * .9 + Math.floor(d.k / 2) / 3) % 1);
    d.visible = on > 0; d.position.set(lado * (.1 + ph * .02), .0 - ph * .3, .2 + ph * .01); d.material.opacity = .9 * (1 - ph * .6); });
}
// chispas(n, color): enjambre de chispitas (hormigueo, electricidad, emoción). update(centros[], radio, lt, on 0..1)
export function chispas(n = 40, color = 0xfff27a, parent) {
  const ps = Array.from({ length: n }, (_, k) => { const p = box(.035, .035, .035, color, [0, 0, 0], parent, { emissive: color, ei: 1.4 }); p.castShadow = false; p.visible = false; p.k = k; return p; });
  return { ps, update(centros, r, lt, on = 1) { ps.forEach(p => { const c = centros[p.k % centros.length], ph = (lt * 3.1 + p.k * .37) % 1;
    p.visible = on > 0 && (p.k / n) < on; const a = p.k * 2.399 + lt * 4, b = p.k * 1.3;
    p.position.set(c[0] + Math.cos(a) * r * (.3 + ph), c[1] + Math.sin(b + lt * 5) * r * .8, c[2] + Math.sin(a) * r * (.3 + ph));
    p.rotation.set(lt * 9 + p.k, lt * 7, 0); p.scale.setScalar((1 - ph) * 1.6 + .2); }); } };
}
// setBano({acento}): baño low-poly: piso de mosaico, paredes de azulejo, escusado mirando a +z, lavabo con espejo, puerta
// y rollo de papel. Devuelve {escusado, puerta, asiento, personaY}.
export function setBano(o = {}) {
  const ac = o.acento ?? 0x3f8fa6;
  for (let x = -6; x < 6; x++) for (let z = -3; z < 6; z++) box(.5, .04, .5, (x + z) % 2 ? 0xe9e4da : 0xcfd6d8, [x * .5 + .25, -.02, z * .5 - .5], null);
  const pared = (w, pos, ry) => { const m = box(w, 3, .1, 0xeef1ee, pos); m.rotation.y = ry; return m; };
  pared(6, [0, 1.5, -.75], 0); pared(6, [-2.6, 1.5, 1.6], Math.PI / 2);
  for (let x = -12; x < 12; x++) for (let y = 0; y < 5; y++) box(.24, .24, .02, (x + y) % 3 ? 0xdfe9ec : ac, [x * .25 + .125, .15 + y * .25, -.69], null);   // azulejo hasta media pared
  box(6, .04, .04, ac, [0, 1.38, -.68]);
  const e = group([0, -.12, -.35]);   // asiento a y≈.345: así una persona sentada apoya los pies en el piso
  cyl(.15, .2, .35, 0xffffff, [0, .17, .05], e, 12); const taza = cyl(.24, .17, .12, 0xffffff, [0, .38, .12], e, 14); taza.scale.z = 1.25;
  const asiento = cyl(.25, .25, .03, 0xf4f4f4, [0, .45, .12], e, 14); asiento.scale.z = 1.25;
  box(.5, .42, .2, 0xffffff, [0, .62, -.22], e); box(.54, .05, .24, 0xf4f4f4, [0, .85, -.22], e); box(.08, .03, .03, 0xb9c4c8, [.18, .78, -.1], e, { metal: .6 });
  const rollo = group([.55, .65, -.28]); box(.06, .02, .12, 0xb9c4c8, [0, .07, 0], rollo, { metal: .6 }); const r = cyl(.07, .07, .12, 0xffffff, [0, 0, 0], rollo, 10); r.rotation.x = Math.PI / 2;
  const lav = group([-1.4, 0, -.45]); cyl(.09, .12, .78, 0xffffff, [0, .39, 0], lav, 10); const t = cyl(.3, .22, .16, 0xffffff, [0, .84, .02], lav, 14); t.scale.z = .8;
  box(.7, .9, .04, 0xa9d4e0, [0, 1.75, -.27], lav, { metal: .5, rough: .1 }); box(.78, .98, .03, 0x9a7a55, [0, 1.75, -.29], lav);
  const puerta = group([1.9, 0, -.7]); box(.9, 2.1, .06, 0x9a6a42, [.45, 1.05, 0], puerta); ball(.04, 0xd9c08a, [.8, 1.0, .06], puerta, 0, { metal: .6 });
  box(1.02, .08, .1, 0x7a5232, [2.35, 2.14, -.7]);
  const tapete = box(.8, .02, .55, ac, [0, .01, .55]);
  return { escusado: e, puerta, asiento: [0, .345, -.23], personaY: -.435 };   // persona sentada: pos [0, personaY, -.23] + sentar(p)
}

// ---------- MEJORAS 0p (7-nov 21:30, short de los dedos de pasa): caminar natural reutilizable ----------
// caminar(p, lt, vel=1, o): ciclo de paso con cadera y rodilla desfasadas (la rodilla se dobla al llevar la pierna adelante),
// brazos en contrafase, rebote suave del cuerpo y balanceo de hombros. o: {amp (.45), brazos (1), cojear (0..1: la pierna
// derecha casi no se dobla y el cuerpo se ladea), y0 (altura base; por defecto la que tenía p al primer llamado)}.
// Devuelve la distancia recorrida (m) para avanzar: p.position.z = z0 + caminar(...) (la persona mira a +z).
export function caminar(p, lt, vel = 1, o = {}) {
  const f = lt * vel * 6.4, a = o.amp ?? .45, cj = o.cojear ?? 0, br = o.brazos ?? 1;
  if (p.userData.y0 == null) p.userData.y0 = o.y0 ?? p.position.y;
  [['L', 0], ['R', Math.PI]].forEach(([s, d]) => { const ph = f + d, lim = s === 'R' ? 1 - cj * .7 : 1;
    p['leg' + s].rotation.x = Math.sin(ph) * a * lim;
    p['knee' + s].rotation.x = Math.max(0, -Math.cos(ph)) * a * 1.5 * lim + .05;
    p['pie' + s].rotation.x = -Math.max(0, Math.cos(ph)) * a * .35 * lim;
    const arm = p['arm' + (s === 'L' ? 'R' : 'L')]; if (arm && br) arm.rotation.x = Math.sin(ph) * a * .9 * br; });
  p.position.y = (o.y0 ?? p.userData.y0) + Math.abs(Math.cos(f)) * .035 - (cj ? Math.max(0, Math.sin(f + Math.PI)) * .06 * cj : 0);
  if (p.torso) p.torso.rotation.y = Math.sin(f) * .06;
  p.rotation.z = cj ? Math.sin(f) * .05 * cj : 0;
  return lt * vel * 1.05;
}

// ---------- MEJORAS 0r (8-nov 13:30, short de los moscos): alberca, arrugas y pasa pasan al motor ----------
// setAlberca(): andador de loseta, hueco con azulejo azul, agua translúcida (y=-.12), sombrilla, camastro y palmeras.
// La alberca ocupa x∈[-2,2], z∈[-4,1] (centro [0, -.12, -1.5]). Devuelve {agua, aguaY}.
export function setAlberca() {
  const deck = 0xe9dcc4;
  box(6, .2, 16, deck, [-5, -.1, -2]); box(6, .2, 16, deck, [5, -.1, -2]);
  box(4, .2, 5, deck, [0, -.1, 3.5]); box(4, .2, 6, deck, [0, -.1, -7]);
  for (const x of [-2.1, 2.1]) box(.2, .06, 5.2, 0xffffff, [x, .03, -1.5]);
  for (const z of [1.1, -4.1]) box(4.4, .06, .2, 0xffffff, [0, .03, z]);
  box(4, .1, 5, 0x2f9fd0, [0, -1.45, -1.5]);
  for (const x of [-2, 2]) box(.05, 1.4, 5, 0x5cc0e6, [x, -.75, -1.5]);
  box(4, 1.4, .05, 0x5cc0e6, [0, -.75, -4]);
  for (let k = 0; k < 8; k++) box(.5, .02, .04, 0x2a86b8, [0, -1.39, -3.6 + k * .55]).castShadow = false;
  const agua = box(4, .02, 5, mat(0x3fc4e8, { opacity: .6, rough: .12, emissive: 0x0d6f9a, ei: .35 }), [0, -.12, -1.5]);
  agua.material.depthWrite = false; agua.castShadow = false;
  palmera([-4.5, 0, -6], 3.6); palmera([4.3, 0, -7.5], 4.2); palmera([-6.5, 0, -9], 3.2);
  const somb = group([3.4, 0, -3]); cyl(.03, .03, 2.1, 0xdddddd, [0, 1.05, 0], somb, 6); cyl(.05, 1.1, .4, 0xe85a4f, [0, 2.15, 0], somb, 8);
  box(.7, .25, 1.6, 0xf4efe6, [-.9, .2, .2], somb); box(.7, .5, .1, 0xf4efe6, [-.9, .45, -.6], somb).rotation.x = .5;
  box(14, 1.2, .3, 0xf0e2c8, [0, .6, -10]);
  return { agua, aguaY: -.12 };
}
// palmera(pos, altura): tronco segmentado con 6 hojas. Sirve para playa, alberca, jardín.
export function palmera(pos, h = 3.6, parent) {
  const g = group(pos, parent); for (let k = 0; k < 6; k++) cyl(.11 - k * .01, .13 - k * .01, h / 6, 0x8a6a45, [Math.sin(k * .3) * .15, h / 12 + k * h / 6, 0], g, 6);
  for (let k = 0; k < 6; k++) { const hoja = box(1.4, .04, .32, 0x3f8f4a, [0, 0, 0], group([Math.sin(1.5) * .15, h, 0], g)); hoja.parent.rotation.y = k * 1.05; hoja.position.x = .65; hoja.rotation.z = -.35; }
  return g;
}
// arrugas(m): surcos en las yemas de una mano() (cara de la palma, +z). update(k 0..1) los hace crecer y palidece la piel.
export function arrugas(m) {
  const R = [], S = []; const dark = mat(0xb9805e);
  m.dedos.forEach(segs => segs.forEach((sg, k) => { if (k === 0) return; const l = sg.userData.l, zf = (.24 - k * .02) / 2 + .004;
    const n = k === 2 ? 4 : 3; for (let j = 0; j < n; j++) { const r = box(.17 - k * .02, .016, .016, dark, [0, l * (j + .7) / (n + .4), zf], sg); r.castShadow = false; r.scale.x = .01; R.push(r); }
    sg.children.forEach(c => { if (c.geometry && c.geometry.type === 'BoxGeometry' && c.material.color) S.push([c, c.material.color.clone()]); }); }));
  const palida = new THREE.Color(0xeec9b4);
  return { update(k) { R.forEach((r, i) => { r.scale.x = Math.max(.01, cl(k * 1.3 - (i % 4) * .08)); r.visible = k > .02; });
    S.forEach(([c, c0]) => c.material.color.copy(c0).lerp(palida, .6 * k)); } };
}
// pasa(pos, r): uva pasa arrugada (icosaedro con relieve continuo, sin grietas). Sirve también para "cerebro", "nuez", "piel arrugada".
export function pasa(pos, r = .25, parent, color = 0x5b2748) {
  const geo = new THREE.IcosahedronGeometry(r, 2); const p = geo.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * 40) * Math.sin(v.y * 34) * Math.sin(v.z * 46);
    v.multiplyScalar(1 + .16 * n); v.y *= .85; p.setXYZ(i, v.x, v.y, v.z); }
  geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat(color, { rough: .55 })); m.castShadow = true; m.position.set(...pos); (parent ?? world).add(m); return m;
}

// ---------- 8-nov 13:30: insectos voladores — mosquito() + volar() ----------
// mosquito({pos, s, macho, color}): mosco low-poly mirando a +z (cabeza en +z). Hembra: pico largo (probóscide);
// macho: antenas peludas y sin pico. Abdomen con rayas blancas. m.alas (aletean con m.update(lt)), m.pico, m.patas, m.abdomen.
// Tamaño real ≈ 1 cm: para verlo en un plano usa s=.06–.1 junto a personas, o s=1 para primer plano gigante.
export function mosquito(o = {}, parent) {
  const g = group(o.pos ?? [0, 0, 0], parent); g.scale.setScalar(o.s ?? 1);
  const C = o.color ?? 0x2e2a2a, ray = 0xf2efe6;
  const cuerpo = group([0, 0, 0], g); g.cuerpo = cuerpo;
  ball(.16, C, [0, 0, .05], cuerpo, 1, { rough: .6 }).scale.set(1, .95, 1.15);          // tórax
  const ab = group([0, .02, -.12], cuerpo); ab.rotation.x = -.35; g.abdomen = ab;
  for (let k = 0; k < 6; k++) { const r = .11 - k * .012; cyl(r, r * .9, .1, k % 2 ? ray : C, [0, 0, -k * .1], ab, 8).rotation.x = Math.PI / 2; }
  const cab = group([0, .02, .25], cuerpo); g.cabeza = cab; ball(.09, C, [0, 0, 0], cab, 1);
  for (const sx of [-1, 1]) ball(.055, 0x8a1f24, [sx * .06, .02, .04], cab, 0, { emissive: 0x401010, ei: .5, rough: .3 });
  if (!o.macho) { g.pico = cyl(.012, .006, .42, 0x1d1a1a, [0, -.08, .24], cab, 5); g.pico.rotation.x = Math.PI / 2 + .45; }
  for (const sx of [-1, 1]) { const a = group([sx * .03, .05, .06], cab); a.rotation.set(-.7, 0, sx * .5); cyl(.008, .008, .28, C, [0, .14, 0], a, 4);
    if (o.macho) for (let k = 0; k < 6; k++) { const pl = box(.12, .01, .01, 0x6b625a, [0, .05 + k * .04, 0], a); pl.rotation.y = k; } }
  g.patas = [];
  for (const sx of [-1, 1]) for (let k = 0; k < 3; k++) { const p = group([sx * .1, -.08, .12 - k * .1], cuerpo); p.rotation.set(-.2 + k * .35, 0, sx * -.9);
    const p1 = cyl(.012, .01, .32, C, [0, -.16, 0], p, 4); const p2g = group([0, -.32, 0], p); p2g.rotation.z = sx * 1.4; cyl(.009, .006, .45, C, [0, -.22, 0], p2g, 4); g.patas.push(p); }
  const alaM = new THREE.MeshStandardMaterial({ color: 0xdfe9f2, transparent: true, opacity: .45, roughness: .2, side: THREE.DoubleSide, depthWrite: false, emissive: 0x6f8ca8, emissiveIntensity: .3 });
  g.alas = [-1, 1].map(sx => { const piv = group([sx * .08, .13, .02], cuerpo); const w = new THREE.Mesh(new THREE.PlaneGeometry(.17, .62), alaM);
    w.rotation.x = -Math.PI / 2; w.position.set(sx * .085, 0, -.24); w.castShadow = false; piv.add(w); piv.userData.sx = sx; return piv; });
  g.update = (lt, vuela = 1) => { g.alas.forEach(a => { const f = Math.sin(lt * 70) * .9 * vuela; a.rotation.z = a.userData.sx * (.25 + f); a.rotation.y = a.userData.sx * (vuela ? .1 : .5); }); };
  return g;
}
// volar(m, lt, centro, radio, o): vuelo errático alrededor de un punto (zigzag + cambios de altura) mirando hacia donde va.
// o: {vel (1), fase (0), alto (.4 = oscilación vertical)}. Llama también m.update(lt).
export function volar(m, lt, centro, radio = .6, o = {}) {
  const v = o.vel ?? 1, f = o.fase ?? 0, t = lt * v + f;
  const p = (tt) => [centro[0] + Math.cos(tt * 1.3) * radio + Math.sin(tt * 3.7) * radio * .25,
    centro[1] + Math.sin(tt * 2.1) * (o.alto ?? .4) * radio, centro[2] + Math.sin(tt * 1.3) * radio * .8 + Math.cos(tt * 2.9) * radio * .2];
  const a = p(t), b = p(t + .02); m.position.set(...a); m.lookAt(b[0], b[1], b[2]); m.update(lt); return a;
}
// setPatio({acento}): patio de noche (fiesta, carne asada, posada): pasto, barda de tabique, foquitos de colores colgados en
// curva entre dos postes, macetas y mesa. Usa AMB.patioNoche. Devuelve {focos, mesa, topY}. Área libre: x∈[-2.5,2.5], z∈[-2,3].
AMB.patioNoche = { top: 0x121a3a, bottom: 0x40355e, fog: 0x1c2140, near: 7, far: 26, sunColor: 0xb4c2ff, sunInt: 1.5, hemiInt: .95, sunPos: [-5, 9, 6] };
export function setPatio(o = {}) {
  box(16, .06, 12, 0x3f6b3a, [0, -.03, 0]);
  for (let k = 0; k < 40; k++) { const b = box(.04, .12, .04, 0x4f8a45, [((k * 37) % 120) / 10 - 6, .05, ((k * 53) % 80) / 10 - 3]); b.castShadow = false; }
  for (let y = 0; y < 8; y++) for (let x = -10; x < 10; x++) box(.58, .24, .3, (x + y) % 3 ? 0xa8573a : 0x96492f, [x * .6 + (y % 2) * .3, .13 + y * .26, -3.2]);
  box(12.4, .1, .4, 0x8a8a84, [0, 2.15, -3.2]);
  const focos = []; const cols = [0xff5a5a, 0xffd34a, 0x5ad2ff, 0x7dff8a, 0xff8adf];
  for (const sx of [-1, 1]) cyl(.05, .06, 2.9, 0x5a3e2a, [sx * 3.1, 1.45, -2.4]);
  for (let k = 0; k <= 16; k++) { const u = k / 16, x = -3.1 + u * 6.2, y = 2.85 - Math.sin(u * Math.PI) * .45;
    const f = ball(.07, cols[k % 5], [x, y, -2.4], null, 1, { emissive: cols[k % 5], ei: 1.6 }); f.castShadow = false; focos.push(f); }
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(focos.map(f => f.position.clone().add(new THREE.Vector3(0, .07, 0)))), 40, .01, 4), mat(0x222222)); world.add(cable);
  const luz = new THREE.PointLight(0xffd9a0, 3, 9, 1.4); luz.position.set(0, 2.6, -1.6); world.add(luz);
  for (const [x, z] of [[-2.6, -2.6], [2.7, -2.7], [-3.6, -1.2]]) { cyl(.22, .16, .4, o.acento ?? 0xc0583f, [x, .2, z], null, 8); ball(.35, 0x2f7a3a, [x, .62, z], null, 0); }
  const mesa = group([1.9, 0, -1.6]); box(1.2, .06, .7, 0x8a5a36, [0, .76, 0], mesa); for (const [x, z] of [[-.5, -.28], [.5, -.28], [-.5, .28], [.5, .28]]) box(.06, .74, .06, 0x6b4428, [x, .37, z], mesa);
  vaso([1.65, .79, -1.5], null, .8); vaso([2.1, .79, -1.7], null, .8); cyl(.18, .14, .1, 0xf4efe6, [1.95, .84, -1.45], null, 12);
  return { focos, mesa, topY: .79, luz };
}
// ronchas(p, n): piquetes rojos en brazos y cara de una persona(); update(k 0..1) los hace aparecer en cascada.
export function ronchas(p, n = 10) {
  const sitios = [[p.head, [-.12, -.05, .19]], [p.head, [.14, .08, .19]], [p.head, [.2, -.06, .05]], [p.armL, [-.1, -.3, .05]], [p.armL, [.0, -.5, .11]],
    [p.armR, [.1, -.2, .08]], [p.armR, [.0, -.45, .11]], [p.armL, [-.05, -.62, .1]], [p.armR, [.06, -.65, .1]], [p.head, [-.19, .1, .05]], [p.torso, [.2, .3, .17]], [p.torso, [-.15, .05, .17]]];
  const R = sitios.slice(0, n).map(([par, pos]) => { const b = ball(.035, 0xe0504a, pos, par, 0, { emissive: 0x801818, ei: .4 }); b.scale.set(1, 1, .45); b.castShadow = false; return b; });
  return { R, update(k) { R.forEach((b, i) => { const s = Math.max(.01, spring(k * R.length * .5 - i * .5)); b.scale.set(s, s, .45 * s); b.visible = k > .01; }); } };
}
