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

  // ---------- personaje de papel FLUIDO (estilo "J", aprobado 11-nov-2026) ----------
  // Extremidades = cápsulas que se adelgazan; los contornos oscuros van DETRÁS de todos los rellenos,
  // así codos, rodillas, muñecas y hombros se funden sin costuras. Trama de cómic en el lado de sombra.
  const INK = 0x1f1b2e;
  function capsula(L, w1, w2) {                 // de (0,0) hacia abajo hasta (0,-L), ancho w1 arriba y w2 abajo, puntas redondas
    const s = S(), r1 = w1 / 2, r2 = w2 / 2; s.moveTo(-r1, 0); s.absarc(0, 0, r1, Math.PI, 0, true); s.lineTo(r2, -L); s.absarc(0, -L, r2, 0, Math.PI, true); s.lineTo(-r1, 0); return s; }
  function trama(color, paso = 12, r = 3.2) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'); x.fillStyle = '#' + new THREE.Color(color).getHexString(); x.fillRect(0, 0, 256, 256); x.fillStyle = 'rgba(31,27,46,.42)';
    for (let i = 0; i < 256; i += paso) for (let j = 0; j < 256; j += paso) { x.beginPath(); x.arc(i + (j / paso % 2) * paso / 2, j, r, 0, 7); x.fill(); }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.3, 1.3); t.colorSpace = THREE.SRGBColorSpace; return t; }
  const tramas = {};
  // parte del cuerpo: relleno al frente + contorno agrandado muy atrás (detrás de todo el personaje)
  function parte(shape, color, pos, parent, o = {}) {
    const g = group(pos, parent);
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .01, bevelEnabled: false, curveSegments: 12 }), M(color)); m.castShadow = true; m.receiveShadow = true; g.add(m); g.papel = m;
    if (o.borde !== 0) { const bm = new THREE.Mesh(new THREE.ExtrudeGeometry(agrandada(shape, o.borde ?? .03), { depth: .01, bevelEnabled: false }), M(INK)); bm.position.z = -(o.atras ?? .09); bm.castShadow = true; g.add(bm); }
    if (o.trama) { const tm = new THREE.Mesh(new THREE.ExtrudeGeometry(o.trama, { depth: .005, bevelEnabled: false }), new THREE.MeshStandardMaterial({ map: tramas[color] ?? (tramas[color] = trama(color)), roughness: 1 })); tm.position.z = .006; g.add(tm); }
    return g; }
  // o: {piel, ropa, manga ('corta'|'larga'), pantalon, tenis, pelo, colPelo, barba, lentes, aretes, audifonos, estampado, vestido, escala, trama}
  function persona(pos = [0, 0, 0], o = {}, parent) {
    const g = group(pos, parent); g.scale.setScalar(o.escala ?? 1);
    if (typeof o.pelo === 'number') o = { ...o, colPelo: o.colPelo ?? o.pelo, pelo: { chino: 'afro', largo: 'largo', corto: 'copete' }[o.peinado ?? 'corto'] ?? 'copete' };   // compatibilidad con el formato anterior
    const piel = o.piel ?? 0xd99b74, ropa = o.ropa ?? 0x3d6bff, pan = o.pantalon ?? 0x283a8a, ten = o.tenis ?? 0xffc83d, colPelo = o.colPelo ?? o.pelo ?? 0x2a1a12, conTrama = o.trama !== false;
    const Lp = 1.02, cad = Lp + .14;                                     // largo de pierna, altura de cadera
    // piernas (muslo+pantorrilla en una cápsula afilada) + tenis que salen de la pierna
    const pierna = (sx) => { const p = group([sx * .13, cad, .0], g);
      parte(capsula(Lp, .25, .18), pan, [0, 0, 0], p, { trama: sx > 0 && conTrama ? capsula(Lp, .125, .09) : null });
      const t = group([sx * .03, -Lp - .02, .02], p); const z = S(); z.moveTo(-.13, .06); z.quadraticCurveTo(-.15, -.08, -.02, -.08); z.lineTo(.2, -.08); z.quadraticCurveTo(.27, -.07, .25, .0); z.quadraticCurveTo(.18, .07, .05, .1); z.quadraticCurveTo(-.08, .14, -.13, .06);
      parte(z, ten, [0, 0, 0], t); parte(F.rect(.38, .035, .015), 0xffffff, [.055, -.065, .012], t, { borde: 0 }); if (sx < 0) t.scale.x = -1; p.tenis = t; return p; };
    g.legL = pierna(-1); g.legR = pierna(1);
    // torso con hombros redondos y cintura (o vestido)
    const T = .92, tor = S();
    if (o.vestido) { tor.moveTo(-.44, -.28); tor.lineTo(.44, -.28); tor.quadraticCurveTo(.3, .3, .32, T - .14); tor.quadraticCurveTo(.3, T, 0, T + .02); tor.quadraticCurveTo(-.3, T, -.32, T - .14); tor.quadraticCurveTo(-.3, .3, -.44, -.28); }
    else { tor.moveTo(-.27, 0); tor.lineTo(.27, 0); tor.quadraticCurveTo(.31, .45, .34, T - .16); tor.quadraticCurveTo(.33, T, 0, T + .02); tor.quadraticCurveTo(-.33, T, -.34, T - .16); tor.quadraticCurveTo(-.31, .45, -.27, 0); }
    const trT = S(); trT.moveTo(0, o.vestido ? -.28 : 0); trT.lineTo(o.vestido ? .44 : .27, o.vestido ? -.28 : 0); trT.quadraticCurveTo(.31, .45, .34, T - .16); trT.quadraticCurveTo(.33, T, 0, T + .02);
    g.torso = parte(tor, ropa, [0, cad - .06, .03], g, { trama: conTrama ? trT : null });
    if (!o.vestido) parte(F.rect(.56, .1, .05), pan, [0, cad - .02, .025], g, { borde: 0 });   // cintura del pantalón
    if (o.estampado) parte(F.estrella(5, .12, .055), 0xffc83d, [0, cad + .5, .045], g, { borde: .02, atras: .005 });
    // brazos: hombro → codo → mano (cápsulas que se traslapan; los contornos quedan detrás)
    const topY = cad - .06 + T;
    const brazo = (sx) => { const b = group([sx * .3, topY - .1, .05], g);
      const largo = o.manga === 'larga';
      parte(capsula(.46, .17, .14), largo ? ropa : (o.manga === 'corta' ? piel : piel), [0, 0, 0], b);
      if (!largo) parte(capsula(.2, .19, .17), ropa, [0, 0, .004], b, { atras: .095 });            // manga corta
      const a = group([0, -.44, .006], b); b.ante = a;
      parte(capsula(.4, .14, .11), largo ? ropa : piel, [0, 0, 0], a);
      const m = group([0, -.42, .004], a); a.mano = m;                                                  // mano con pulgar
      parte(F.elipse(.075, .088), piel, [0, -.03, 0], m); const pul = parte(F.elipse(.03, .055), piel, [-sx * .065, .0, .002], m); pul.rotation.z = sx * .5;
      return b; };
    g.armL = brazo(-1); g.armR = brazo(1); g.armL.rotation.z = -.12; g.armR.rotation.z = .12;
    // cuello y cabeza (huevo con mandíbula, orejas)
    parte(capsula(.18, .14, .15), piel, [0, topY + .1, .02], g);
    const h = group([0, topY + .36, .08], g); g.head = h;
    if (o.pelo === 'cola' || o.pelo === 'largo') { const c = S(); c.moveTo(.08, .22); c.quadraticCurveTo(.5, .2, .52, -.15); c.quadraticCurveTo(.5, -.45, .36, -.42); c.quadraticCurveTo(.4, -.1, .1, .05); parte(o.pelo === 'largo' ? F.poly([[-.27, .2], [.27, .2], [.31, -.42], [-.31, -.42]]) : c, colPelo, [0, 0, -.01], h); }
    if (o.pelo === 'afro') for (let k = 0; k < 9; k++) { const t = k / 8 * Math.PI; parte(F.circ(.15), colPelo, [Math.cos(t) * .27, .1 + Math.sin(t) * .2, -.01], h); }
    for (const sx of [-1, 1]) parte(F.elipse(.05, .07), piel, [sx * .245, -.01, -.004], h);          // orejas
    const cab = S(); cab.moveTo(0, .32); cab.bezierCurveTo(.3, .32, .29, .02, .25, -.12); cab.quadraticCurveTo(.18, -.3, 0, -.32); cab.quadraticCurveTo(-.18, -.3, -.25, -.12); cab.bezierCurveTo(-.29, .02, -.3, .32, 0, .32);
    parte(cab, piel, [0, 0, 0], h);
    if (o.aretes) for (const sx of [-1, 1]) parte(F.circ(.032), 0xffc83d, [sx * .25, -.1, .006], h, { borde: .015, atras: .003 });
    const z = .012, enc = { atras: .004, borde: .018 };
    if (o.pelo === 'cola' || o.pelo === 'largo') parte(F.poly([[-.27, .04], [-.25, .25], [-.05, .35], [.2, .31], [.28, .1], [.14, .19], [-.12, .21]]), colPelo, [0, 0, z], h, enc);
    if (o.pelo === 'copete' || o.pelo === undefined) parte(F.poly([[-.26, .06], [-.24, .27], [-.05, .41], [.25, .45], [.15, .31], [.27, .16], [.1, .21], [-.12, .19]]), colPelo, [0, 0, z], h, enc);
    if (o.pelo === 'chongo') { parte(F.circ(.13), colPelo, [.05, .37, -.01], h); parte(F.elipse(.28, .14), colPelo, [0, .21, z], h, enc); }
    if (o.pelo === 'corto') parte(F.elipse(.28, .13), colPelo, [0, .23, z], h, enc);
    if (o.barba) parte(F.poly([[-.24, -.03], [-.2, -.2], [-.1, -.3], [0, -.34], [.1, -.3], [.2, -.2], [.24, -.03], [.12, -.12], [-.12, -.12]]), colPelo, [0, 0, z], h, { borde: .015, atras: .004 });
    // cara expresiva
    h.ojos = [-1, 1].map(sx => { const e = group([sx * .095, .03, z + .004], h);
      pieza(F.elipse(.054, .062), 0xffffff, [0, 0, 0], e, { sombra: false, grosor: .004 }); e.pupila = pieza(F.circ(.031), INK, [.012, -.006, .004], e, { sombra: false, grosor: .004 });
      pieza(F.circ(.011), 0xffffff, [.022, .006, .009], e, { sombra: false, grosor: .003 }); return e; });
    const colCeja = (o.colPelo ?? 0) === 0xe8e4dc ? 0x8a8478 : INK;
    h.cejas = [-1, 1].map(sx => pieza(F.rect(.11, .032, .015), colCeja, [sx * .095, .125, z + .01], h, { sombra: false, grosor: .004 }));
    pieza(F.poly([[0, .0], [.035, -.075], [-.02, -.075]]), new THREE.Color(piel).multiplyScalar(.8).getHex(), [0, 0, z + .004], h, { sombra: false, grosor: .004 });
    const B = (shape, y = 0) => pieza(shape, 0x6a1d2a, [0, y, z + .02], h, { sombra: false, grosor: .004 });
    h.bocas = { feliz: B(F.arco(.085, .028, Math.PI * 1.15, Math.PI * 1.85), -.1), abierta: B(F.poly([[-.1, -.12], [.1, -.12], [.07, -.2], [0, -.225], [-.07, -.2]])),
      o: B(F.elipse(.04, .055), -.15), grito: B(F.elipse(.085, .07), -.16), risa: B(F.poly([[-.11, -.09], [.11, -.09], [.07, -.19], [-.07, -.19]])),
      seria: B(F.rect(.1, .022, .01), -.13), ladeada: B(F.arco(.08, .025, Math.PI * 1.35, Math.PI * 1.95), -.1) };
    if (o.lentes) for (const sx of [-1, 1]) pieza(F.arco(.07, .022, 0, Math.PI * 2), o.lentes, [sx * .095, .03, z + .014], h, { sombra: false, grosor: .004 });
    if (o.audifonos) { for (const sx of [-1, 1]) parte(F.elipse(.07, .09), o.audifonos, [sx * .17, topY + .02, .1], g, { borde: .02, atras: .005 }); parte(F.arco(.17, .035, Math.PI * 1.05, Math.PI * 1.95), INK, [0, topY + .02, .095], g, { borde: 0 }); }
    g.cara = (b, cejas = 0) => { for (const k in h.bocas) h.bocas[k].visible = k === b; h.cejas.forEach((c, i) => { c.rotation.z = (i ? -1 : 1) * cejas; c.position.y = .125 + Math.abs(cejas) * .04; }); };
    g.mira = (dx, dy) => h.ojos.forEach(e => e.pupila.position.set(dx * .02, dy * .02 - .006, .004));
    // poses rápidas: 'jarra', 'senala', 'pulgar', 'saluda', 'brazosArriba', 'normal'
    g.pose = (lado, tipo) => { const b = lado === 'R' ? g.armR : g.armL, sx = lado === 'R' ? 1 : -1;
      const P = { normal: [.12, 0], jarra: [.55, -2.0], senala: [2.5, .25], pulgar: [.25, 1.6], saluda: [2.3, .7], brazosArriba: [2.9, .15], cruzado: [.35, 1.9] }[tipo] ?? [.12, 0];
      b.rotation.z = sx * P[0]; b.ante.rotation.z = sx * P[1]; };
    g.cara('feliz'); return g;
  }
  // caminar de papel (a saltitos): piernas y brazos alternan, el cuerpo rebota
  function caminar(p, t, on = 1) { const k = Math.sin(t * 9) * on; p.legL.rotation.z = k * .35; p.legR.rotation.z = -k * .35; p.armL.rotation.z = -k * .4; p.armR.rotation.z = k * .4; p.position.y = Math.abs(Math.sin(t * 9)) * .05 * on; }

  // ---------- estallido de impacto (estrella con capas) ----------
  function bam(pos, parent) { const g = group(pos, parent); pieza(F.estrella(10, .62, .32), 0xe0453a, [0, 0, 0], g, { borde: .03 }); pieza(F.estrella(9, .42, .22), 0xffd640, [0, 0, .03], g); g.rotation.z = .2; return g; }
  // marcas de movimiento (rayitas)
  function rayitas(pos, n = 3, color = 0x2a2a2a, parent) { const g = group(pos, parent); for (let k = 0; k < n; k++) pieza(F.rect(.05, .26, .02), color, [k * .14 - (n - 1) * .07, Math.abs(k - (n - 1) / 2) * -.06, 0], g, { rot: (k - (n - 1) / 2) * .35 }); return g; }

  // ---------- CIERRE OFICIAL: logo 14 "planeta curioso" (aprobado por Iván el 11-nov-2026) ----------
  function cierre() {
    E.escena('cierre', {
      setup() { E.ambiente({ top: 0x2b2350, bottom: 0x2b2350, fog: 0x2b2350, near: 60, far: 120, sunInt: .01, hemiInt: .01 });
        fondo(0x2b2350, -.35); luces({ pos: [-1.5, 2.5, 8], suelo: 0x15102e, hemi: 1.35, sol: 1.8, radio: 3 });
        for (let k = 0; k < 40; k++) pieza(k % 3 ? F.circ(.03 + (k % 4) * .01) : F.estrella(4, .08, .025), k % 4 ? 0x5a4f8a : 0xffc83d, [((k * 71) % 100 / 100 - .5) * 5.2, ((k * 43) % 100 / 100) * 8 - 2.5, -.3], null, { sombra: false });
        const BD = { borde: .045, colorBorde: INK }, L = group([0, 2.1, 0]); this.L = L;
        pieza(F.arco(1.6, .2, Math.PI * .02, Math.PI * .98), 0xffc83d, [0, -.1, -.1], L, BD).scale.y = .34;
        pieza(F.circ(1.1), 0x7b5cff, [0, 0, 0], L, BD); pieza(F.circ(.25), 0x6a4ce0, [.5, -.5, .03], L); pieza(F.circ(.14), 0x6a4ce0, [-.55, -.35, .03], L);
        this.ojo = group([-.05, .18, .05], L); pieza(F.elipse(.42, .36), 0xffffff, [0, 0, 0], this.ojo, { borde: .03, colorBorde: INK });
        this.pupila = group([0, 0, .03], this.ojo); pieza(F.circ(.2), INK, [0, 0, 0], this.pupila, { sombra: false }); pieza(F.circ(.06), 0xffffff, [.06, .08, .02], this.pupila, { sombra: false });
        this.ceja = pieza(F.rect(.6, .1, .05), INK, [-.05, .68, .06], L); this.ceja.rotation.z = .18;
        pieza(F.arco(1.6, .2, Math.PI * 1.02, Math.PI * 1.98), 0xffc83d, [0, -.1, .22], L, BD).scale.y = .34;
        let d = document.getElementById('marcaCierre'); if (!d) { d = document.createElement('div'); d.id = 'marcaCierre'; document.body.appendChild(d); }
        d.style.cssText = 'position:absolute;left:0;right:0;top:975px;text-align:center;font-family:Poppins;font-weight:900;line-height:1;z-index:5;pointer-events:none';
        d.innerHTML = '<div style="display:inline-block;transform:rotate(-4deg)"><div style="font-size:128px;color:#fff;-webkit-text-stroke:12px #1f1b2e;paint-order:stroke;filter:drop-shadow(8px 10px 0 #1f1b2e);letter-spacing:2px">DATO</div><div style="font-size:105px;color:#7b5cff;-webkit-text-stroke:12px #1f1b2e;paint-order:stroke;filter:drop-shadow(8px 10px 0 #1f1b2e);margin-top:-8px">CÓSMICO <span style="color:#ff6b5b">2</span></div></div>';
        this.marca = d; },
      update(lt, c) { const t = tw(lt);
        const k = Math.max(.01, E.spring(lt / .7)) * .78; this.L.scale.setScalar(k); this.L.rotation.z = Math.sin(t * 2) * .05;
        this.pupila.position.set(Math.sin(t * 1.3) * .12, Math.cos(t * .9) * .06, .03);                        // mira de un lado a otro, con curiosidad
        this.ojo.scale.y = (t % 2.4) > 2.25 ? .12 : 1;                                                         // parpadea
        this.ceja.position.y = .68 + (Math.sin(t * 2.2) > .6 ? .08 : 0);                                        // levanta la ceja
        const pm = E.spring(Math.max(0, lt - .25) / .5); this.marca.style.opacity = Math.min(1, lt / .3); this.marca.firstChild.style.transform = `rotate(-4deg) scale(${Math.max(.01, pm).toFixed(3)})`;
        E.cam([0, 1.0, 12.5], [0, 1.0, 0], 30);
        const tc = c.w('comentarios') || 1.5, ts = c.w('síguenos') || 3;
        E.rotulo('¿Qué dato quieres ver?', 'déjalo en los comentarios', lt - tc, 1330); if (lt > tc) c.ev('pop', tc);
        E.rotulo('Síguenos', 'datos curiosos cada día', lt - ts, 1530); if (lt > ts) c.ev('ding', ts, .6); }
    });
  }
  return { F, M, pieza, fondo, luces, tw, persona, caminar, bam, rayitas, cierre, tex };
}
