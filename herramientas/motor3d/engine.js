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
  g.legL = box(.22, .9, .24, pants, [-.15, .45, 0], g); g.legR = box(.22, .9, .24, pants, [.15, .45, 0], g);
  box(.26, .12, .34, 0x222222, [-.15, .06, .05], g); box(.26, .12, .34, 0x222222, [.15, .06, .05], g);
  g.torso = box(.6, .75, .32, shirt, [0, 1.28, 0], g);
  g.armL = group([-.4, 1.6, 0], g); box(.18, .7, .2, shirt, [0, -.33, 0], g.armL); box(.14, .14, .14, skin, [0, -.74, 0], g.armL);
  g.armR = group([.4, 1.6, 0], g); box(.18, .7, .2, shirt, [0, -.33, 0], g.armR); box(.14, .14, .14, skin, [0, -.74, 0], g.armR);
  g.head = group([0, 1.92, 0], g); box(.38, .44, .38, skin, [0, 0, 0], g.head); box(.4, .14, .4, o.hair ?? 0x3a2a20, [0, .22, 0], g.head);
  box(.05, .05, .02, 0x111111, [-.09, .03, .2], g.head); box(.05, .05, .02, 0x111111, [.09, .03, .2], g.head);
  return g;
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
export function etiqueta(texto, pos3, p, size = 58, color = '#fff') {
  if (p < 0) return; camera.updateMatrixWorld(); /* matriz al día: si no, usa la cámara del fotograma anterior */ const v = new THREE.Vector3(...pos3).project(camera); const e = el('tag3d');
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
