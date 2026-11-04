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
  if (p < 0) return; const v = new THREE.Vector3(...pos3).project(camera); const e = el('tag3d');
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
