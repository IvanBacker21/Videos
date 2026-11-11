// Kit de PAPEL RECORTADO (aprobado por Iván el 11-nov-2026).
// Todo son piezas planas de papel (formas extruidas muy delgadas) en capas a distintas profundidades,
// con textura de papel, borde blanco tipo recorte y sombras suaves entre capas. El movimiento va "a saltitos" (12 fps, como stop-motion).
// Uso en un short:  import { kitPapel } from '../motor3d/papel.js';  const P = kitPapel(E);
export function kitPapel(E) {
  const { THREE, group } = E;
  // ---------- textura de papel (fibras + grano) compartida ----------
  const cv = document.createElement('canvas'); cv.width = cv.height = 512; const x = cv.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 512, 512);
  const im = x.getImageData(0, 0, 512, 512); for (let i = 0; i < im.data.length; i += 4) { const n = (Math.random() - .5) * 22; im.data[i] += n; im.data[i + 1] += n; im.data[i + 2] += n; } x.putImageData(im, 0, 0);
  for (let k = 0; k < 260; k++) { x.strokeStyle = `rgba(${Math.random() < .5 ? '0,0,0' : '255,255,255'},${.03 + Math.random() * .05})`; x.lineWidth = .6 + Math.random() * 1.2; x.beginPath(); const a = Math.random() * 512, b = Math.random() * 512; x.moveTo(a, b); x.quadraticCurveTo(a + (Math.random() - .5) * 40, b + (Math.random() - .5) * 40, a + (Math.random() - .5) * 60, b + (Math.random() - .5) * 60); x.stroke(); }
  const tex = new THREE.CanvasTexture(cv); tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(1.5, 1.5); tex.colorSpace = THREE.SRGBColorSpace;
  const mats = {};
  const M = (c) => mats[c] ?? (mats[c] = new THREE.MeshStandardMaterial({ color: c, map: tex, roughness: 1, metalness: 0, side: THREE.DoubleSide }));

  // ---------- formas ----------
  const S = () => new THREE.Shape();
  const F = {
    rect(w, h, r = .03) { const s = S(), a = -w / 2, b = -h / 2; r = Math.min(r, w / 2, h / 2); s.moveTo(a + r, b); s.lineTo(-a - r, b); s.quadraticCurveTo(-a, b, -a, b + r); s.lineTo(-a, -b - r); s.quadraticCurveTo(-a, -b, -a - r, -b); s.lineTo(a + r, -b); s.quadraticCurveTo(a, -b, a, -b - r); s.lineTo(a, b + r); s.quadraticCurveTo(a, b, a + r, b); return s; },
    elipse(rx, ry = rx, irr = .015) { const s = S(); for (let i = 0; i <= 56; i++) { const t = i / 56 * Math.PI * 2, k = 1 + Math.sin(t * 5 + rx * 9) * irr; i ? s.lineTo(Math.cos(t) * rx * k, Math.sin(t) * ry * k) : s.moveTo(rx * k, 0); } return s; },
    circ(r) { return F.elipse(r, r); },
    poly(pts) { const s = S(); pts.forEach(([a, b], i) => i ? s.lineTo(a, b) : s.moveTo(a, b)); s.lineTo(pts[0][0], pts[0][1]); return s; },
    estrella(n = 8, r1 = .5, r2 = .25) { const p = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 + Math.PI / 2, r = i % 2 ? r2 : r1 * (1 + (i % 4 ? .0 : .15)); p.push([Math.cos(a) * r, Math.sin(a) * r]); } return F.poly(p); },
    corazon(s = 1) { const h = S(); h.moveTo(0, -.3 * s); h.bezierCurveTo(-.55 * s, .08 * s, -.28 * s, .5 * s, 0, .22 * s); h.bezierCurveTo(.28 * s, .5 * s, .55 * s, .08 * s, 0, -.3 * s); return h; },
    ola(w, amp, y0, n = 7, fondo = -4) { const s = S(); s.moveTo(-w / 2, fondo); for (let i = 0; i <= 60; i++) { const xx = -w / 2 + i / 60 * w; s.lineTo(xx, y0 + Math.sin(i / 60 * Math.PI * n) * amp); } s.lineTo(w / 2, fondo); return s; },
    rayo(s = 1) { return F.poly([[-.08, .5], [.22, .5], [.04, .1], [.24, .1], [-.18, -.55], [-.02, -.06], [-.22, -.06]].map(([a, b]) => [a * s, b * s])); },
    arco(r, grosor, a0, a1) { const s = S(); s.absarc(0, 0, r + grosor / 2, a0, a1, false); s.absarc(0, 0, r - grosor / 2, a1, a0, true); return s; },
    nube(s = 1) { const h = S(); h.moveTo(-.6 * s, -.15 * s); h.bezierCurveTo(-.75 * s, .2 * s, -.35 * s, .35 * s, -.2 * s, .2 * s); h.bezierCurveTo(-.1 * s, .5 * s, .35 * s, .45 * s, .35 * s, .2 * s); h.bezierCurveTo(.65 * s, .3 * s, .75 * s, -.1 * s, .5 * s, -.15 * s); h.lineTo(-.6 * s, -.15 * s); return h; },
  };
  // borde blanco de recorte: copia agrandada detrás (para formas más o menos convexas)
  function agrandada(shape, d) {
    const pts = shape.getPoints(48); let cx = 0, cy = 0; pts.forEach(p => { cx += p.x; cy += p.y; }); cx /= pts.length; cy /= pts.length;
    return F.poly(pts.map(p => { const dx = p.x - cx, dy = p.y - cy, L = Math.hypot(dx, dy) || 1; return [p.x + dx / L * d, p.y + dy / L * d]; }));
  }
  // pieza de papel: forma + color en (x, y, z). o: {borde (0 = sin borde), grosor, rot, sombra}
  function pieza(shape, color, pos = [0, 0, 0], parent, o = {}) {
    const g = group(pos, parent); const gr = o.grosor ?? .02;
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: gr, bevelEnabled: false, curveSegments: 10 }), M(color)); m.castShadow = o.sombra !== false; m.receiveShadow = true; g.add(m); g.papel = m;
    const b = o.borde ?? 0;
    if (b > 0) { const bm = new THREE.Mesh(new THREE.ExtrudeGeometry(agrandada(shape, b), { depth: gr * .9, bevelEnabled: false }), M(o.colorBorde ?? 0xfffaf0)); bm.position.z = -gr * .6; bm.castShadow = o.sombra !== false; bm.receiveShadow = true; g.add(bm); }
    if (o.rot) g.rotation.z = o.rot; return g;
  }
  // fondo grande de papel (pared) y piso de papel
  function fondo(color, z = -3, w = 30, h = 40) { return pieza(F.rect(w, h, 0), color, [0, 0, z], null, { sombra: false }); }
  function luces(o = {}) {
    E.world.add(new THREE.HemisphereLight(0xffffff, o.suelo ?? 0xbfae90, o.hemi ?? 1.5));
    const s = new THREE.DirectionalLight(0xfff4e2, o.sol ?? 1.9); s.position.set(...(o.pos ?? [-2.5, 3.5, 6])); s.castShadow = true;
    s.shadow.mapSize.set(2048, 2048); s.shadow.radius = o.radio ?? 9; s.shadow.bias = -.0004; Object.assign(s.shadow.camera, { left: -7, right: 7, top: 9, bottom: -9, near: .5, far: 30 }); E.world.add(s); return s;
  }
  // tiempo "a saltitos" (12 cuadros por segundo, como stop-motion)
  const tw = (lt, fps = 12) => Math.floor(lt * fps) / fps;

  // ---------- personaje de papel (muñeco recortado, de frente) ----------
  // o: {piel, ropa, pantalon, pelo, peinado: 'corto'|'largo'|'chino', escala}
  function persona(pos = [0, 0, 0], o = {}, parent) {
    const g = group(pos, parent); g.scale.setScalar(o.escala ?? 1);
    const piel = o.piel ?? 0xf0b98e, ropa = o.ropa ?? 0x2f8f83, pan = o.pantalon ?? 0x2f3e66, pelo = o.pelo ?? 0x3a2418, B = { borde: .022 };
    const pierna = (sx) => { const p = group([sx * .13, .95, .0], g); pieza(F.rect(.2, .95, .07), pan, [0, -.47, 0], p, B); pieza(F.elipse(.17, .08), 0x222222, [sx * .05, -.97, .03], p, B); return p; };
    g.legL = pierna(-1); g.legR = pierna(1);
    g.torso = pieza(F.rect(.62, .8, .16), ropa, [0, 1.3, .05], g, B);
    const brazo = (sx) => { const b = group([sx * .33, 1.62, sx > 0 ? .1 : .0], g); pieza(F.rect(.15, .62, .07), ropa, [0, -.28, 0], b, B); b.mano = pieza(F.circ(.09), piel, [0, -.62, .02], b, B); return b; };
    g.armL = brazo(-1); g.armR = brazo(1);
    pieza(F.rect(.13, .12, .03), piel, [0, 1.74, .08], g);                                                // cuello
    const h = group([0, 2.02, .14], g); g.head = h;
    pieza(F.elipse(.29, .32), piel, [0, 0, 0], h, B);
    const peinado = o.peinado ?? 'corto';
    if (peinado === 'largo') { pieza(F.rect(.66, .62, .25), pelo, [0, -.06, -.04], h, B); pieza(F.elipse(.32, .17), pelo, [0, .2, .03], h); }
    else if (peinado === 'chino') { for (let k = 0; k < 7; k++) pieza(F.circ(.12), pelo, [Math.cos(k / 6 * Math.PI) * .26, .18 + Math.sin(k / 6 * Math.PI) * .14, .02], h); }
    else pieza(F.poly([[-.31, .08], [-.28, .3], [-.05, .38], [.22, .34], [.31, .12], [.18, .2], [-.1, .22]]), pelo, [0, 0, .03], h);
    for (const sx of [-1, 1]) pieza(F.circ(.05), 0xff9aa0, [sx * .17, -.1, .02], h, { sombra: false });   // chapitas
    h.ojos = [-1, 1].map(sx => { const e = group([sx * .1, .03, .03], h); pieza(F.elipse(.06, .07), 0xffffff, [0, 0, 0], e); e.pupila = pieza(F.circ(.032), 0x161210, [0, -.005, .015], e); return e; });
    h.cejas = [-1, 1].map(sx => pieza(F.rect(.1, .028, .012), pelo, [sx * .1, .13, .04], h));
    // bocas intercambiables
    h.bocas = {
      feliz: pieza(F.arco(.08, .028, Math.PI * 1.1, Math.PI * 1.9), 0x5a1a1a, [0, -.1, .035], h, { sombra: false }),
      o: pieza(F.elipse(.04, .055), 0x5a1a1a, [0, -.14, .035], h, { sombra: false }),
      grito: pieza(F.elipse(.09, .07), 0x5a1a1a, [0, -.15, .035], h, { sombra: false }),
      risa: pieza(F.poly([[-.1, -.08], [.1, -.08], [.06, -.17], [-.06, -.17]]), 0x5a1a1a, [0, 0, .035], h, { sombra: false }),
      seria: pieza(F.rect(.1, .022, .01), 0x5a1a1a, [0, -.12, .035], h, { sombra: false }),
    };
    g.cara = (b, cejas = 0) => { for (const k in h.bocas) h.bocas[k].visible = k === b; h.cejas.forEach((c, i) => { c.rotation.z = (i ? -1 : 1) * cejas; c.position.y = .13 + Math.abs(cejas) * .05; }); };
    g.mira = (dx, dy) => h.ojos.forEach(e => e.pupila.position.set(dx * .022, dy * .022 - .005, .015));
    g.cara('feliz'); return g;
  }
  // caminar de papel (a saltitos): piernas y brazos alternan, el cuerpo rebota
  function caminar(p, t, on = 1) { const k = Math.sin(t * 9) * on; p.legL.rotation.z = k * .35; p.legR.rotation.z = -k * .35; p.armL.rotation.z = -k * .4; p.armR.rotation.z = k * .4; p.position.y = Math.abs(Math.sin(t * 9)) * .05 * on; }

  // ---------- estallido de impacto (estrella con capas) ----------
  function bam(pos, parent) { const g = group(pos, parent); pieza(F.estrella(10, .62, .32), 0xe0453a, [0, 0, 0], g, { borde: .03 }); pieza(F.estrella(9, .42, .22), 0xffd640, [0, 0, .03], g); g.rotation.z = .2; return g; }
  // marcas de movimiento (rayitas)
  function rayitas(pos, n = 3, color = 0x2a2a2a, parent) { const g = group(pos, parent); for (let k = 0; k < n; k++) pieza(F.rect(.05, .26, .02), color, [k * .14 - (n - 1) * .07, Math.abs(k - (n - 1) / 2) * -.06, 0], g, { rot: (k - (n - 1) / 2) * .35 }); return g; }

  // ---------- cierre de papel (reemplaza al planeta 3D) ----------
  function cierre() {
    E.escena('cierre', {
      setup() { E.ambiente({ top: 0x1f2a5a, bottom: 0x1f2a5a, fog: 0x1f2a5a, near: 60, far: 120, sunInt: .01, hemiInt: .01 });
        fondo(0x22306a, -2.5); luces({ sol: 1.6, hemi: 1.3, suelo: 0x1a2040 });
        for (let k = 0; k < 40; k++) pieza(F.estrella(5, .05 + Math.random() * .05, .025), k % 4 ? 0xfff4d0 : 0xffd640, [(Math.random() - .5) * 6, -3 + Math.random() * 9, -2.3], null, { sombra: false });
        this.g = group([0, 1.4, 0]);
        pieza(F.circ(1.15), 0x7a6cff, [0, 0, 0], this.g, { borde: .04 });
        for (const [a, b, r] of [[-.4, .35, .25], [.35, -.3, .32], [.45, .45, .14]]) pieza(F.circ(r), 0x5f52e0, [a, b, .03], this.g);
        pieza(F.arco(1.55, .16, Math.PI * .05, Math.PI * .95), 0xff6fa8, [0, -.1, .06], this.g, { borde: .02 }).scale.y = .35;
        this.luna = pieza(F.circ(.28), 0xffd640, [1.7, .5, .1], this.g, { borde: .03 });
        for (const sx of [-1, 1]) { pieza(F.elipse(.13, .15), 0xffffff, [sx * .32, .12, .05], this.g); pieza(F.circ(.065), 0x161210, [sx * .32, .1, .07], this.g); }
        pieza(F.arco(.22, .06, Math.PI * 1.15, Math.PI * 1.85), 0x2a1a50, [0, -.08, .06], this.g, { sombra: false }); },
      update(lt, c) { const t = tw(lt); const k = Math.max(.01, E.spring(lt / .7)); this.g.scale.setScalar(k); this.g.rotation.z = Math.sin(t * 2) * .06;
        const a = t * 2; this.luna.position.set(Math.cos(a) * 1.7, Math.sin(a) * .7, .1);
        E.cam([0, .9, 9.5], [0, 1.0, 0], 34);
        const tc = c.w('comentarios') || 1.5, ts = c.w('síguenos') || 3;
        E.rotulo('¿Qué dato quieres ver?', 'déjalo en los comentarios', lt - tc, 1180); if (lt > tc) c.ev('pop', tc);
        E.rotulo('Síguenos', 'Dato Cósmico 2 · datos curiosos cada día', lt - ts, 1380); if (lt > ts) c.ev('ding', ts, .6); }
    });
  }
  return { F, M, pieza, fondo, luces, tw, persona, caminar, bam, rayitas, cierre, tex };
}
