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
    elipse(rx, ry = rx) { const s = S(); s.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0); return s; },
    circ(r) { return F.elipse(r, r); },
    poly(pts) { const s = S(); pts.forEach(([a, b], i) => i ? s.lineTo(a, b) : s.moveTo(a, b)); s.lineTo(pts[0][0], pts[0][1]); return s; },
    estrella(n = 8, r1 = .5, r2 = .25) { const p = []; for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 + Math.PI / 2, r = i % 2 ? r2 : r1 * (1 + (i % 4 ? .0 : .15)); p.push([Math.cos(a) * r, Math.sin(a) * r]); } return F.poly(p); },
    corazon(s = 1) { const h = S(); h.moveTo(0, -.3 * s); h.bezierCurveTo(-.55 * s, .08 * s, -.28 * s, .5 * s, 0, .22 * s); h.bezierCurveTo(.28 * s, .5 * s, .55 * s, .08 * s, 0, -.3 * s); return h; },
    ola(w, amp, y0, n = 7, fondo = -4) { const s = S(); s.moveTo(-w / 2, fondo); for (let i = 0; i <= 60; i++) { const xx = -w / 2 + i / 60 * w; s.lineTo(xx, y0 + Math.sin(i / 60 * Math.PI * n) * amp); } s.lineTo(w / 2, fondo); return s; },
    rayo(s = 1) { return F.poly([[-.08, .5], [.22, .5], [.04, .1], [.24, .1], [-.18, -.55], [-.02, -.06], [-.22, -.06]].map(([a, b]) => [a * s, b * s])); },
    arco(r, grosor, a0, a1) { const s = S(); s.absarc(0, 0, r + grosor / 2, a0, a1, false); s.absarc(0, 0, r - grosor / 2, a1, a0, true); return s; },
    gota(s = 1) { const h = S(); h.moveTo(0, .5 * s); h.bezierCurveTo(.12 * s, .25 * s, .32 * s, .02 * s, .32 * s, -.16 * s); h.absarc(0, -.16 * s, .32 * s, 0, Math.PI, true); h.bezierCurveTo(-.32 * s, .02 * s, -.12 * s, .25 * s, 0, .5 * s); return h; },
    letraZ(s = 1) { return F.poly([[-.3, .3], [.3, .3], [.3, .18], [-.08, -.18], [.3, -.18], [.3, -.3], [-.3, -.3], [-.3, -.18], [.08, .18], [-.3, .18]].map(([a, b]) => [a * s, b * s])); },
    nube(s = 1) { const h = S(); h.moveTo(-.6 * s, -.15 * s); h.bezierCurveTo(-.75 * s, .2 * s, -.35 * s, .35 * s, -.2 * s, .2 * s); h.bezierCurveTo(-.1 * s, .5 * s, .35 * s, .45 * s, .35 * s, .2 * s); h.bezierCurveTo(.65 * s, .3 * s, .75 * s, -.1 * s, .5 * s, -.15 * s); h.lineTo(-.6 * s, -.15 * s); return h; },
  };
  // borde blanco de recorte: copia agrandada detrás (para formas más o menos convexas)
  function agrandada(shape, d) {
    const pts = shape.getSpacedPoints(220); let cx = 0, cy = 0; pts.forEach(p => { cx += p.x; cy += p.y; }); cx /= pts.length; cy /= pts.length;
    // desplaza cada punto hacia afuera por la normal local (borde del mismo grosor en toda la orilla)
    let area = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; area += p.x * q.y - q.x * p.y; } const sg = area >= 0 ? 1 : -1;
    const out = pts.map((p, i) => { const a = pts[(i - 1 + pts.length) % pts.length], b = pts[(i + 1) % pts.length]; let nx = (b.y - a.y) * sg, ny = -(b.x - a.x) * sg; const L = Math.hypot(nx, ny) || 1; return [p.x + nx / L * d, p.y + ny / L * d]; });
    return F.poly(out);
  }
  // pieza de papel: forma + color en (x, y, z). o: {borde (0 = sin borde), grosor, rot, sombra}
  function pieza(shape, color, pos = [0, 0, 0], parent, o = {}) {
    const g = group(pos, parent); const gr = o.grosor ?? .02;
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: gr, bevelEnabled: false, curveSegments: 36 }), M(color)); m.castShadow = o.sombra !== false; m.receiveShadow = true; g.add(m); g.papel = m;
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
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: .01, bevelEnabled: false, curveSegments: 36 }), M(color)); m.castShadow = true; m.receiveShadow = true; g.add(m); g.papel = m;
    if (o.borde !== 0) { const bm = new THREE.Mesh(new THREE.ExtrudeGeometry(agrandada(shape, o.borde ?? .03), { depth: .01, bevelEnabled: false, curveSegments: 36 }), M(INK)); bm.position.z = -(o.atras ?? .09); bm.castShadow = true; g.add(bm); }
    if (o.trama) { const tm = new THREE.Mesh(new THREE.ExtrudeGeometry(o.trama, { depth: .005, bevelEnabled: false }), new THREE.MeshStandardMaterial({ map: tramas[color] ?? (tramas[color] = trama(color)), roughness: 1 })); tm.position.z = .006; g.add(tm); }
    return g; }
  // logo 14 en chiquito (para playeras, tazas, carteles)
  function logoMini(par) { const BD = { borde: .07, colorBorde: INK };
    pieza(F.arco(1.6, .22, Math.PI * .02, Math.PI * .98), 0xffc83d, [0, -.1, -.02], par, BD).scale.y = .34;
    pieza(F.circ(1.1), 0x7b5cff, [0, 0, 0], par, BD); pieza(F.circ(.25), 0x6a4ce0, [.5, -.5, .01], par, { sombra: false });
    pieza(F.elipse(.42, .36), 0xffffff, [-.05, .18, .015], par, { borde: .05, colorBorde: INK, sombra: false }); pieza(F.circ(.2), INK, [.06, .14, .025], par, { sombra: false }); pieza(F.circ(.06), 0xffffff, [.12, .22, .03], par, { sombra: false });
    pieza(F.rect(.6, .12, .05), INK, [-.05, .68, .02], par, { rot: .18, sombra: false });
    pieza(F.arco(1.6, .22, Math.PI * 1.02, Math.PI * 1.98), 0xffc83d, [0, -.1, .04], par, BD).scale.y = .34; }
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
    else { // hombros caídos y redondos que bajan del cuello: una sola silueta (los brazos salen DEBAJO del torso, no encima)
      tor.moveTo(-.25, 0); tor.lineTo(.25, 0); tor.quadraticCurveTo(.3, .32, .325, .58); tor.quadraticCurveTo(.37, T - .12, .29, T - .03); tor.quadraticCurveTo(.2, T + .03, .09, T + .03);
      tor.lineTo(-.09, T + .03); tor.quadraticCurveTo(-.2, T + .03, -.29, T - .03); tor.quadraticCurveTo(-.37, T - .12, -.325, .58); tor.quadraticCurveTo(-.3, .32, -.25, 0); }
    // trama: media luna suave en el costado de sombra (antes partía el torso a la mitad)
    const trT = S(); if (o.vestido) { trT.moveTo(.14, -.28); trT.lineTo(.44, -.28); trT.quadraticCurveTo(.3, .3, .32, T - .14); trT.quadraticCurveTo(.3, T - .04, .2, T - .02); trT.quadraticCurveTo(.12, .4, .14, -.28); }
    else { trT.moveTo(.13, 0); trT.lineTo(.25, 0); trT.quadraticCurveTo(.3, .32, .325, .58); trT.quadraticCurveTo(.37, T - .12, .29, T - .03); trT.quadraticCurveTo(.2, T + .02, .15, T - .02); trT.quadraticCurveTo(.1, .45, .13, 0); }
    g.torso = parte(tor, ropa, [0, cad - .06, .03], g, { trama: conTrama ? trT : null });
    if (!o.vestido) parte(F.rect(.56, .1, .05), pan, [0, cad - .02, .025], g, { borde: 0 });   // cintura del pantalón
    if (o.estampado) parte(F.estrella(5, .12, .055), 0xffc83d, [0, cad + .5, .045], g, { borde: .02, atras: .005 });
    if (o.logo) { const lg = group([-.13, cad + .62, .046], g); lg.scale.setScalar(.075); logoMini(lg); g.logo = lg; }
    // brazos: hombro → codo → mano (cápsulas que se traslapan; los contornos quedan detrás)
    const topY = cad - .06 + T;
    const brazo = (sx) => { const b = group([sx * .255, topY - .13, .018], g);   // pivote DENTRO del hombro y detrás del torso: el hombro del torso tapa la punta del brazo
      const largo = o.manga === 'larga';
      parte(capsula(.46, .17, .14), largo ? ropa : (o.manga === 'corta' ? piel : piel), [0, 0, 0], b);
      if (!largo) parte(capsula(.3, .2, .18), ropa, [0, 0, .004], b, { atras: .095 });            // manga corta
      const a = group([0, -.44, .006], b); b.ante = a;
      parte(capsula(.4, .14, .11), largo ? ropa : piel, [0, 0, 0], a);
      const m = group([0, -.42, .004], a); a.mano = m;                                                  // mano con pulgar
      parte(F.elipse(.075, .088), piel, [0, -.03, 0], m); const pul = parte(F.elipse(.03, .055), piel, [-sx * .065, .0, .002], m); pul.rotation.z = sx * .5;
      return b; };
    g.armL = brazo(-1); g.armR = brazo(1);
    // postura natural en reposo (contrapposto ligero): nada perfectamente simétrico
    g.armL.rotation.z = -.16; g.armL.ante.rotation.z = -.22; g.armR.rotation.z = .1; g.armR.ante.rotation.z = .3;
    g.legL.rotation.z = -.035; g.legR.rotation.z = .055;
    // cuello y cabeza (huevo con mandíbula, orejas)
    parte(capsula(.18, .14, .15), piel, [0, topY + .1, .02], g);
    const h = group([0, topY + .36, .08], g); g.head = h; h.rotation.z = .05;
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
    if (o.barba) {   // barba que sigue la quijada (misma curva que la cabeza), con hueco para la boca y patillas: se ve como barba, no como un parche
      const bb = S(); bb.moveTo(-.262, .05); bb.lineTo(-.22, .05); bb.quadraticCurveTo(-.2, -.08, -.13, -.1); bb.lineTo(.13, -.1); bb.quadraticCurveTo(.2, -.08, .22, .05); bb.lineTo(.262, .05);
      bb.bezierCurveTo(.29, -.02, .27, -.08, .25, -.12); bb.quadraticCurveTo(.18, -.3, 0, -.33); bb.quadraticCurveTo(-.18, -.3, -.25, -.12); bb.bezierCurveTo(-.27, -.08, -.29, -.02, -.262, .05);
      const hueco = new THREE.Path(); hueco.absellipse(0, -.155, .105, .058, 0, Math.PI * 2, true); bb.holes.push(hueco);
      const col = new THREE.Color(colPelo).lerp(new THREE.Color(piel), .18).getHex();
      const m = new THREE.Mesh(new THREE.ExtrudeGeometry(bb, { depth: .004, bevelEnabled: false, curveSegments: 16 }), M(col)); m.position.z = z + .002; h.add(m);
      const bigote = S(); bigote.moveTo(-.11, -.085); bigote.quadraticCurveTo(0, -.045, .11, -.085); bigote.quadraticCurveTo(.06, -.115, 0, -.1); bigote.quadraticCurveTo(-.06, -.115, -.11, -.085);
      const mb = new THREE.Mesh(new THREE.ExtrudeGeometry(bigote, { depth: .004, bevelEnabled: false }), M(col)); mb.position.z = z + .024; h.add(mb); }
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
    // sueño: k 0 (despierto) → 1 (ojos cerrados); los párpados bajan aplastando los ojos
    g.sentar = (k) => { for (const L of [g.legL, g.legR]) L.scale.y = Math.max(.2, 1 - .62 * k); };   // sentado de frente: piernas cortas (quedan tras el asiento); baja al personaje ~.62 m
    g.sueno = (k) => h.ojos.forEach(e => { e.scale.y = Math.max(.12, 1 - k * .88); e.position.y = .03 - k * .02; });
    // poses rápidas: 'jarra', 'senala', 'pulgar', 'saluda', 'brazosArriba', 'normal'
    g.pose = (lado, tipo) => { const b = lado === 'R' ? g.armR : g.armL, sx = lado === 'R' ? 1 : -1; g['_pose' + lado] = tipo !== 'normal';
      const P = { normal: [.12, 0], jarra: [.55, -2.0], senala: [2.5, .25], pulgar: [.25, 1.6], saluda: [2.3, .7], brazosArriba: [2.9, .15], cruzado: [.35, 1.9] }[tipo] ?? [.12, 0];
      const base = { normal: sx > 0 ? [.1, .3] : [.16, .22] }[tipo];   // reposo con codo un poco doblado
      b.rotation.z = sx * (base ? base[0] : P[0]); b.ante.rotation.z = sx * (base ? base[1] : P[1]); };
    // respiración / balanceo en reposo: llamar cada cuadro con t (segundos). No toca brazos que estén en pose.
    g.respira = (t, k = 1) => { const s = Math.sin(t * 2.2), c = Math.sin(t * 1.1 + .7);
      h.rotation.z = .05 + c * .04 * k; h.position.y = topY + .36 + s * .012 * k; g.rotation.z = c * .012 * k;
      if (!g._poseL) g.armL.rotation.z = -.16 - s * .03 * k; if (!g._poseR) g.armR.rotation.z = .1 + s * .03 * k; };
    g.cara('feliz'); return g;
  }

  // PERRO OFICIAL (aprobado 11-nov-2026, propuesta 1 "más lobo"): gris con patas y pecho blancos, hocico largo, melena, ojos ámbar, collar coral con placa.
  // pose: 'perfil' (de pie, mira a la derecha; voltear con scale.x = -1) | 'frente' (sentado, para acercamientos). Escala 1 ≈ 1.6 de alto.
  function perroLobo(pos = [0, 0, 0], o = {}, parent) {
  const GR = 0x808996, OS = 0x5d6472, CL = 0xc8ced8, BL = 0xf6f1e6, PI = 0xeec9c0;
  const ojoDe = (par, pos, forma, iris, pup, dos) => { const e = group(pos, par); pieza(forma, iris, [0, 0, 0], e, { sombra: false, grosor: .004 }); pieza(F.circ(pup), INK, [.012, -.004, .004], e, { sombra: false, grosor: .004 }); pieza(F.circ(.015), 0xffffff, [.024, .018, .008], e, { sombra: false, grosor: .003 }); if (dos) pieza(F.circ(.008), 0xffffff, [-.004, -.018, .008], e, { sombra: false, grosor: .003 }); return e; };
  // mechones: borde ondulado (para melena, pecho y cola)
  const mechones = (cx, cy, rx, ry, a0, a1, k = 9, amp = .22) => { const pts = []; for (let i = 0; i <= 60; i++) { const a = a0 + (a1 - a0) * i / 60, r = 1 + amp * Math.max(0, Math.sin(i / 60 * Math.PI * k)) ; pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]); } pts.push([cx, cy]); return F.poly(pts); };
  const v = { hocico: 1.2, cab: 1, robusto: false, melena: true, textura: false, husky: false, tierno: false };
  const g = group(pos, parent); g.scale.setScalar(o.escala ?? 1);
  if ((o.pose ?? 'perfil') === 'perfil') {
    const mx = (x) => x > .84 ? .84 + (x - .84) * v.hocico : x;            // alarga o acorta el hocico
    const R = v.robusto;
    // patas lejanas
    parte(blob(R ? [[.28, .66], [.3, .3], [.28, .04], [.4, 0], [.54, .02], [.48, .14], [.49, .4], [.48, .62]] : [[.32, .66], [.36, .3], [.34, .04], [.42, 0], [.52, .02], [.46, .12], [.47, .4], [.46, .62]]), OS, [0, 0, -.04], g);
    parte(blob(R ? [[-.54, .62], [-.44, .4], [-.56, .22], [-.52, .02], [-.4, 0], [-.28, .02], [-.36, .14], [-.32, .3], [-.26, .55]] : [[-.5, .62], [-.42, .4], [-.52, .22], [-.48, .02], [-.4, 0], [-.32, .02], [-.38, .14], [-.34, .3], [-.28, .55]]), OS, [0, 0, -.04], g);
    // cola
    if (v.husky) parte(tubo([[-.6, .98], [-.82, 1.1], [-.78, 1.32], [-.56, 1.36], [-.42, 1.22]], .22, .2), GR, [0, 0, -.02], g);
    else if (v.textura) parte(blob([[-.6, 1.0], [-.75, .98], [-.88, .86], [-.98, .78], [-.92, .7], [-1.0, .6], [-.92, .52], [-.96, .4], [-.88, .34], [-.84, .44], [-.8, .62], [-.68, .84]]), GR, [0, 0, -.02], g);
    else parte(tubo([[-.62, .95], [-.82, .82], [-.9, .58], [-.86, .36]], v.tierno ? .2 : .24, .18), GR, [0, 0, -.02], g);
    if (!v.husky) parte(tubo([[-.88, .48], [-.88, .38]], .17, .12), CL, [0, 0, -.016], g, { borde: 0 });
    // silueta
    const sil = [[-.62, .98], [-.32, 1.04], [.08, 1.05], [.36, 1.12], [.5, 1.32], [.6, 1.5], [.7, 1.56], [.8, 1.54], [.88, 1.48], [1.08, 1.43], [1.18, 1.39], [1.16, 1.32], [.98, 1.28], [.84, 1.24], [.72, 1.12], [.64, .96],
      ...(R ? [[.64, .78], [.66, .5], [.66, .22], [.72, .06], [.72, 0], [.48, 0], [.48, .22], [.46, .52], [.42, .66]] : [[.6, .78], [.6, .52], [.6, .22], [.66, .06], [.66, 0], [.5, 0], [.49, .22], [.48, .52], [.43, .66]]),
      [.18, .66], [-.1, .7], [-.26, .66], ...(R ? [[-.22, .44], [-.28, .24], [-.22, .04], [-.22, 0], [-.46, 0], [-.46, .12], [-.52, .26], [-.64, .5], [-.72, .78]] : [[-.24, .44], [-.32, .24], [-.26, .04], [-.28, 0], [-.44, 0], [-.44, .12], [-.5, .26], [-.62, .5], [-.7, .78]])]
      .map(([x, y]) => [mx(x), y]);
    const silT = v.tierno ? sil.map(([x, y]) => (x > .45 && y > 1.15) ? [.7 + (x - .7) * v.cab, 1.4 + (y - 1.4) * v.cab] : [x, y]) : sil;
    parte(blob(silT), GR, [0, 0, 0], g);
    const H = (x, y) => v.tierno ? [.7 + (mx(x) - .7) * v.cab, 1.4 + (y - 1.4) * v.cab] : [mx(x), y];
    // manchas
    pieza(blob([[-.5, .98], [-.3, 1.025], [.1, 1.035], [.3, 1.08], [.12, 1.0], [-.25, .97]]), 0x737b89, [0, 0, .012], g, { sombra: false, grosor: .003 });
    if (v.husky) { pieza(blob([[.66, 1.42], [.76, 1.5], [.86, 1.46], [1.06, 1.4], [1.16, 1.36], [1.14, 1.31], [.98, 1.27], [.84, 1.22], [.72, 1.12], [.62, 1.0], [.56, 1.1], [.6, 1.3]].map(([x, y]) => H(x, y))), BL, [0, 0, .012], g, { sombra: false, grosor: .003 });
      pieza(blob([[.64, 1.56], [.74, 1.6], [.84, 1.54], [.8, 1.48], [.72, 1.5]].map(([x, y]) => H(x, y))), OS, [0, 0, .013], g, { sombra: false, grosor: .003 }); }
    else pieza(blob([[.74, 1.3], [.98, 1.3], [1.12, 1.36], [1.14, 1.32], [.98, 1.27], [.84, 1.23], [.76, 1.2]].map(([x, y]) => H(x, y))), BL, [0, 0, .012], g, { sombra: false, grosor: .003 });
    pieza(blob([[.66, 1.2], [.72, 1.1], [.64, .94], [.6, .76], [.5, .7], [.48, .9], [.56, 1.08]]), BL, [0, 0, .012], g, { sombra: false, grosor: .003 });
    pieza(blob(R ? [[.48, .18], [.66, .18], [.72, .06], [.72, .01], [.48, .01]] : [[.5, .16], [.6, .16], [.66, .06], [.66, .01], [.5, .01]]), BL, [0, 0, .012], g, { sombra: false, grosor: .003 });
    pieza(blob(R ? [[-.22, .16], [-.22, .03], [-.24, .01], [-.46, .01], [-.46, .14]] : [[-.27, .14], [-.26, .03], [-.28, .01], [-.44, .01], [-.44, .12]]), BL, [0, 0, .012], g, { sombra: false, grosor: .003 });
    // melena con mechones (y mechones de pecho)
    if (v.melena) { pieza(mechones(.62, 1.22, .2, .22, -1.3, 1.6, 7, .18), GR, [0, 0, .014], g, { sombra: false, grosor: .003 }); pieza(mechones(.6, .95, .1, .16, Math.PI * .9, Math.PI * 1.6, 4, .3), BL, [0, 0, .016], g, { sombra: false, grosor: .003 }); }
    if (false) { for (const [x, y, r] of [[-.3, .96, .5], [0, .98, .3], [.25, 1.02, .2], [-.5, .78, 1.7], [.1, .7, 2.6]]) pieza(F.arco(.08, .014, Math.PI * .1, Math.PI * .7), OS, [x, y, .014], g, { rot: r, sombra: false, grosor: .003 }); }
    // nariz, boca, lengua, orejas, ojo
    const [nx, ny] = H(1.16, 1.4); pieza(F.elipse(.055, .04), INK, [nx, ny, .02], g, { sombra: false, grosor: .004 });
    const [bx, by] = H(1.0, 1.33); pieza(F.arco(.07, .015, Math.PI * 1.25, Math.PI * 1.7), INK, [bx, by, .02], g, { sombra: false, grosor: .004 });
    if (v.tierno) { const [lx, ly] = H(.98, 1.25); parte(blob([[-.035, .02], [.035, .02], [.035, -.06], [0, -.085], [-.035, -.06]]), 0xff8a9a, [lx, ly, .018], g, { borde: .012, atras: .004 }); }
    const [hx, hy] = H(.72, 1.48);
    for (const [dx, z] of [[-.06, -.008], [.07, .008]]) { const kk = v.tierno ? 1.05 : 1, tilt = v.tierno ? .25 : 0;
      const e = group([hx + dx, hy, z], g); e.rotation.z = tilt; e.scale.setScalar(kk);
      parte(blob([[-.1, .02], [-.06, .22], [-.01, .36], [.05, .22], [.08, .03]]), z < 0 ? OS : GR, [0, 0, 0], e); if (z > 0) parte(blob([[-.05, .05], [-.03, .2], [0, .27], [.03, .18], [.04, .05]]), PI, [0, 0, .003], e, { borde: 0 }); }
    if (v.tierno) ojoDe(g, [hx + .13, hy - .02, .02], F.elipse(.065, .065), 0x2a2420, .0001, true).children[0].material = M(0x2a2420);
    else ojoDe(g, [hx + .12, hy - .03, .02], blob([[-.065, 0], [-.02, .035], [.05, .03], [.07, -.004], [.02, -.03], [-.04, -.026]]), v.husky ? 0x7cc8f2 : 0xf2b84a, .024);
    pieza(blob([[-.06, .0], [.03, .025], [.1, .005], [.03, .0]]), v.husky ? OS : CL, [hx + .12, hy + .03, .021], g, { sombra: false, grosor: .003 });
    if (v.husky) pieza(blob([[-.04, -.01], [.08, -.06], [.14, -.03], [.06, .0]]), OS, [hx + .12, hy - .04, .019], g, { sombra: false, grosor: .003 });
    parte(tubo([[.52, 1.36], [.66, 1.24], [.78, 1.16]], .07, .07), 0xff6b5b, [0, 0, .016], g, { borde: .018, atras: .005 }); pieza(F.circ(.042), 0xffc83d, [.76, 1.1, .03], g, { borde: .015, colorBorde: INK });
  } else {
    // 6 · sentado de FRENTE (cara expresiva para acercamientos)
    parte(tubo([[.32, .06], [.55, .1], [.66, .24], [.6, .36]], .2, .16), GR, [0, 0, -.02], g);
    parte(blob([[-.34, 0], [-.4, .3], [-.32, .62], [-.16, .86], [0, .92], [.16, .86], [.32, .62], [.4, .3], [.34, 0], [.16, 0], [.12, .2], [-.12, .2], [-.16, 0]]), GR, [0, 0, 0], g);
    pieza(blob([[-.14, .22], [-.18, .5], [-.1, .78], [0, .84], [.1, .78], [.18, .5], [.14, .22]]), BL, [0, 0, .012], g, { sombra: false, grosor: .003 });
    pieza(mechones(0, .82, .2, .14, Math.PI * 1.05, Math.PI * 1.95, 5, .3), BL, [0, 0, .014], g, { sombra: false, grosor: .003 });
    for (const sx of [-1, 1]) { parte(blob([[sx * .03, .02], [sx * .04, .44], [sx * .12, .5], [sx * .18, .42], [sx * .18, .0]]), GR, [0, 0, .008], g, { atras: .02 }); pieza(blob([[sx * .03, .02], [sx * .03, .14], [sx * .18, .14], [sx * .18, .0]]), BL, [0, 0, .02], g, { sombra: false, grosor: .003 }); }
    const h = group([0, 1.12, .03], g);
    for (const sx of [-1, 1]) { const e = group([sx * .2, .2, -.006], h); e.rotation.z = -sx * .2; parte(blob([[-.1, .0], [-.06, .22], [0, .36], [.06, .22], [.1, .0]]), OS, [0, 0, 0], e); parte(blob([[-.05, .03], [-.03, .2], [0, .28], [.03, .2], [.05, .03]]), PI, [0, 0, .003], e, { borde: 0 }); }
    parte(blob([[-.3, .08], [-.24, .26], [0, .3], [.24, .26], [.3, .08], [.26, -.12], [.14, -.24], [0, -.28], [-.14, -.24], [-.26, -.12]]), GR, [0, 0, 0], h);
    pieza(blob([[-.06, .18], [.06, .18], [.12, -.06], [.16, -.2], [0, -.27], [-.16, -.2], [-.12, -.06]]), BL, [0, 0, .012], h, { sombra: false, grosor: .003 });
    for (const sx of [-1, 1]) { ojoDe(h, [sx * .12, .06, .014], blob([[-.06, 0], [-.02, .035], [.05, .028], [.065, -.004], [.02, -.03], [-.04, -.026]].map(([x, y]) => [x * sx, y])), 0xf2b84a, .024); pieza(F.rect(.1, .026, .01), CL, [sx * .12, .13, .015], h, { rot: -sx * .2, sombra: false, grosor: .003 }); }
    pieza(F.elipse(.065, .045), INK, [0, -.12, .016], h, { sombra: false, grosor: .004 });
    for (const sx of [-1, 1]) pieza(F.arco(.045, .014, Math.PI * 1.1, Math.PI * 1.85), INK, [sx * .045, -.19, .016], h, { sombra: false, grosor: .004 });
    parte(tubo([[-.2, .9], [0, .86], [.2, .9]], .065, .065), 0xff6b5b, [0, 0, .016], g, { borde: .018, atras: .005 }); pieza(F.circ(.042), 0xffc83d, [0, .83, .03], g, { borde: .015, colorBorde: INK });
  }
  return g; }
  // PROTAGONISTA del canal (aprobado 11-nov-2026): playera azul eléctrico con el logo del planeta curioso, copete castaño, sin barba ni audífonos, tenis menta.
  function protagonista(pos = [0, 0, 0], o = {}, parent) {
    return persona(pos, { piel: 0xe2ab83, ropa: 0x3d6bff, pantalon: 0x1f1b2e, tenis: 0x2ec4a6, pelo: 'copete', colPelo: 0x3a2416, logo: true, ...o }, parent); }

  // ---------- MASCOTAS (curvas suaves; contorno detrás) ----------
  // tubo suave que sigue una curva (colas, cuellos)
  function tubo(ctrl, w1, w2, puntas = true) { const c = new THREE.CatmullRomCurve3(ctrl.map(([a, b]) => new THREE.Vector3(a, b, 0))); const n = 60, L = [], R = [];
    for (let i = 0; i <= n; i++) { const t = i / n, p = c.getPoint(t), d = c.getTangent(t), w = (w1 + (w2 - w1) * Math.pow(t, 1.3)) / 2; L.push(new THREE.Vector2(p.x - d.y * w, p.y + d.x * w)); R.unshift(new THREE.Vector2(p.x + d.y * w, p.y - d.x * w)); }
    const s = S(); s.moveTo(L[0].x, L[0].y); s.splineThru(L.slice(1)); if (puntas) { const e = c.getPoint(1), r = w2 / 2; s.absarc(e.x, e.y, r, Math.atan2(L[n].y - e.y, L[n].x - e.x), Math.atan2(R[0].y - e.y, R[0].x - e.x), true); } s.splineThru(R); s.lineTo(L[0].x, L[0].y); return s; }
  // forma cerrada suave que pasa por puntos (spline cerrada)
  function blob(pts) { const c = new THREE.CatmullRomCurve3(pts.map(([a, b]) => new THREE.Vector3(a, b, 0)), true, 'centripetal'); const s = S(); const P = c.getPoints(120); s.moveTo(P[0].x, P[0].y); for (let i = 1; i < P.length; i++) s.lineTo(P[i].x, P[i].y); return s; }
  const ojoAnimal = (par, pos, o = {}) => { const e = group(pos, par), sx = o.s ?? 1;
    pieza(o.forma ?? F.elipse(.07 * sx, .06 * sx), o.iris ?? 0xffffff, [0, 0, 0], e, { sombra: false, grosor: .004 });
    e.pupila = pieza(o.rendija ? F.elipse(.018 * sx, .05 * sx) : F.circ((o.pupila ?? .04) * sx), INK, [(o.mira ?? .012) * sx, -.004, .004], e, { sombra: false, grosor: .004 });
    pieza(F.circ(.016 * sx), 0xffffff, [.028 * sx, .022 * sx, .008], e, { sombra: false, grosor: .003 }); if (o.brillo2) pieza(F.circ(.008 * sx), 0xffffff, [-.006 * sx, -.02 * sx, .008], e, { sombra: false, grosor: .003 });
    if (o.delineado) pieza(o.delineado, INK, [0, 0, -.001], e, { sombra: false, grosor: .003 }); return e; };

  // PERRO LOBO gris con pecho y patitas blancas (de perfil, mira a la derecha). Partes animables: .cola .cabeza .patas[4]
  function perro(pos = [0, 0, 0], o = {}, parent) {
    const g = group(pos, parent); g.scale.setScalar(o.escala ?? 1);
    const GR = o.color ?? 0x7f8896, OS = 0x5b6270, CL = 0xc5ccd6, BL = 0xf6f1e6, PI = 0xf0d3c8;
    // cola esponjada que cuelga
    g.cola = group([-.62, .92, -.01], g); parte(tubo([[0, 0], [-.22, -.1], [-.34, -.32], [-.32, -.55]], .26, .2), GR, [0, 0, 0], g.cola);
    parte(tubo([[-.3, -.38], [-.33, -.5], [-.3, -.6]], .16, .1), CL, [0, 0, .004], g.cola, { borde: 0 });
    // patas (traseras con muslo, delanteras rectas), calcetines blancos
    const pata = (x, z, trasera, color) => { const p = group([x, .78, z], g);
      if (trasera) { parte(blob([[-.17, .05], [.1, .1], [.16, -.12], [.06, -.36], [-.12, -.3]]), color, [0, 0, 0], p); parte(tubo([[.0, -.3], [.03, -.55], [.0, -.7]], .13, .11), color, [0, 0, .002], p); }
      else parte(tubo([[0, .02], [.01, -.35], [0, -.7]], .16, .12), color, [0, 0, 0], p);
      parte(tubo([[0, -.56], [.0, -.7]], .125, .12), BL, [0, 0, .004], p, { borde: 0 }); parte(F.elipse(.1, .055), BL, [.04, -.74, .005], p, { atras: .1 }); return p; };
    g.patas = [pata(-.42, -.03, true, OS), pata(.38, -.03, false, OS)];
    // cuerpo: pecho profundo, cintura delgada, lomo recto; "silla" más oscura en el lomo
    parte(blob([[-.66, .92], [-.4, 1.12], [.1, 1.12], [.45, 1.08], [.6, .9], [.52, .62], [.3, .52], [.0, .62], [-.35, .66], [-.62, .7]]), GR, [0, 0, 0], g);
    parte(blob([[-.6, 1.0], [-.35, 1.13], [.1, 1.13], [.38, 1.08], [.1, 1.0], [-.3, .98]]), OS, [0, 0, .003], g, { borde: 0 });
    parte(blob([[.3, .95], [.56, .9], [.58, .68], [.44, .56], [.28, .62], [.24, .8]]), BL, [0, 0, .004], g, { borde: 0 });       // pecho blanco
    g.patas.push(pata(-.3, .03, true, GR), pata(.46, .03, false, GR));
    // melena / cuello con mechones suaves
    parte(blob([[.32, .98], [.42, 1.28], [.62, 1.42], [.78, 1.3], [.74, 1.05], [.62, .86], [.46, .82]]), GR, [0, 0, .006], g, { atras: .1 });
    parte(blob([[.5, .88], [.62, .98], [.72, 1.1], [.7, .9], [.6, .8]]), CL, [0, 0, .008], g, { borde: 0 });
    // cabeza de lobo: cráneo + hocico largo, mejillas claras
    const h = group([.72, 1.42, .02], g); g.cabeza = h;
    parte(blob([[-.22, .02], [-.12, .2], [.08, .22], [.24, .12], [.5, .04], [.58, -.02], [.52, -.1], [.3, -.12], [.1, -.18], [-.12, -.16]]), GR, [0, 0, 0], h);
    parte(blob([[.06, -.06], [.3, -.06], [.52, -.07], [.5, -.11], [.3, -.13], [.1, -.17], [-.04, -.15]]), BL, [0, 0, .003], h, { borde: 0 });   // hocico/mejilla blancos
    parte(blob([[-.18, -.02], [-.05, -.12], [-.15, -.2], [-.24, -.1]]), CL, [0, 0, .003], h, { borde: 0 });
    // orejas grandes y paradas (curvas), interior rosado
    for (const [x, z] of [[-.1, -.006], [.04, .006]]) { parte(blob([[x - .1, .14], [x - .07, .34], [x - .02, .48], [x + .06, .36], [x + .1, .16]]), OS, [0, 0, z], h); parte(blob([[x - .05, .17], [x - .03, .34], [x + .02, .4], [x + .05, .3], [x + .06, .18]]), PI, [0, 0, z + .003], h, { borde: 0 }); }
    pieza(F.elipse(.06, .045), INK, [.56, -.02, .012], h, { sombra: false, grosor: .004 });                                     // nariz
    pieza(F.arco(.08, .016, Math.PI * 1.25, Math.PI * 1.7), INK, [.42, -.06, .012], h, { sombra: false, grosor: .004 });        // boca
    // ojo almendrado ámbar, delineado y ceja clara (mirada de lobo)
    const alm = blob([[-.07, 0], [-.02, .04], [.06, .03], [.08, -.005], [.02, -.035], [-.04, -.03]]);
    h.ojo = ojoAnimal(h, [.12, .06, .012], { forma: alm, iris: 0xf2b84a, pupila: .025, s: 1.15, mira: .01 });
    pieza(blob([[-.06, .055], [.04, .075], [.11, .05], [.03, .05]]), CL, [.11, .08, .013], h, { sombra: false, grosor: .003 });
    if (o.collar !== false) { parte(tubo([[.47, 1.26], [.6, 1.16], [.75, 1.07]], .075, .075), 0xff6b5b, [0, 0, .012], g, { borde: .018, atras: .005 }); pieza(F.circ(.045), 0xffc83d, [.74, 1.0, .03], g, { borde: .015, colorBorde: INK }); }
    return g;
  }
  // GATO TIERNO negro con panza, pecho, hocico y patitas blancos. pose: 'sentado' (de frente) | 'camina' (de perfil)
  function gato(pos = [0, 0, 0], o = {}, parent) {
    const g = group(pos, parent); g.scale.setScalar(o.escala ?? 1);
    const NE = 0x2f2d38, NEc = 0x3d3a48, BL = 0xf6f1e6, PI = 0xf2a7b8, IR = 0xc9e36b;
    const cara = (h, frente) => {
      for (const sx of frente ? [-1, 1] : [1]) {
        const ex = frente ? sx * .12 : .1; h.ojos = h.ojos ?? [];
        h.ojos.push(ojoAnimal(h, [ex, .04, .014], { forma: F.elipse(.085, .09), iris: IR, pupila: .062, s: 1, mira: frente ? 0 : .015, brillo2: true }));
      }
      const nx = frente ? 0 : .26;
      pieza(blob([[-.035, .0], [.035, .0], [0, -.035]]).constructor ? (() => { const n = S(); n.moveTo(-.035, 0); n.quadraticCurveTo(0, .012, .035, 0); n.quadraticCurveTo(.02, -.03, 0, -.038); n.quadraticCurveTo(-.02, -.03, -.035, 0); return n; })() : null, 0xe88aa0, [nx, -.075, .016], h, { sombra: false, grosor: .004 });
      for (const sx of [-1, 1]) pieza(F.arco(.03, .011, Math.PI * 1.1, Math.PI * 1.9), INK, [nx + sx * .03, -.115, .016], h, { sombra: false, grosor: .004 });
      for (const [sx, y, r] of frente ? [[-1, -.08, .12], [-1, -.11, -.05], [1, -.08, -.12], [1, -.11, .05]] : [[1, -.08, .1], [1, -.11, -.05]]) pieza(F.rect(.26, .009, .004), 0xf6f1e6, [nx + sx * .24, y, .017], h, { rot: r, sombra: false, grosor: .003 });
    };
    const oreja = (h, x, rot, z) => { const e = group([x, .2, z], h); e.rotation.z = rot; parte(blob([[-.1, -.02], [-.07, .14], [0, .22], [.06, .14], [.1, -.02]]), NE, [0, 0, 0], e); parte(blob([[-.05, .0], [-.035, .1], [0, .15], [.03, .1], [.05, .0]]), PI, [0, 0, .003], e, { borde: 0 }); return e; };
    if ((o.pose ?? 'sentado') === 'sentado') {
      // cola esponjada que se enrosca al frente
      g.cola = group([0, 0, .02], g); parte(tubo([[.3, .22], [.46, .1], [.38, .0], [.12, .0], [-.04, .06]], .13, .1), NE, [0, 0, 0], g.cola); parte(F.circ(.05), BL, [-.05, .06, .004], g.cola, { borde: 0 });
      // cuerpo de pera
      parte(blob([[-.32, .02], [-.36, .3], [-.26, .58], [0, .7], [.26, .58], [.36, .3], [.32, .02], [0, -.02]]), NE, [0, 0, 0], g);
      parte(blob([[-.15, .05], [-.18, .3], [-.1, .52], [0, .58], [.1, .52], [.18, .3], [.15, .05], [0, .02]]), BL, [0, 0, .004], g, { borde: 0 });   // pecho y panza
      g.manos = [-1, 1].map(sx => { const m = group([sx * .09, .4, .006], g); parte(tubo([[0, 0], [sx * .01, -.2], [0, -.34]], .13, .13), BL, [0, 0, 0], m, { atras: .02 }); parte(F.elipse(.08, .055), BL, [0, -.36, .003], m, { atras: .02 }); return m; });
      // AMASAR ("hacer pancito"): patitas delanteras que suben y bajan alternadas; k 0..1
      g.amasa = (t, k = 1, vel = 7) => g.manos.forEach((m, i) => { const s = Math.max(0, Math.sin(t * vel + i * Math.PI)); m.position.y = .4 + s * .1 * k; m.rotation.z = (i ? -1 : 1) * s * .12 * k; m.scale.y = 1 - s * .12 * k; });
      const h = group([0, .86, .02], g); g.cabeza = h;
      oreja(h, -.17, .32, -.006); oreja(h, .17, -.32, -.006);
      parte(blob([[-.3, .02], [-.26, .2], [0, .27], [.26, .2], [.3, .02], [.22, -.16], [0, -.21], [-.22, -.16]]), NE, [0, 0, 0], h);
      parte(blob([[-.13, -.05], [0, .0], [.13, -.05], [.12, -.15], [0, -.19], [-.12, -.15]]), BL, [0, 0, .004], h, { borde: 0 });               // hocico blanco
      cara(h, true);
      g.feliz = (k) => h.ojos.forEach(e => { e.scale.y = Math.max(.15, 1 - k * .85); });   // ojitos entrecerrados de gusto
      if (o.collar !== false) { parte(blob([[-.2, .66], [0, .62], [.2, .66], [.18, .72], [0, .69], [-.18, .72]]), 0x2ec4a6, [0, 0, .012], g, { borde: .015, atras: .005 }); pieza(F.circ(.035), 0xffc83d, [0, .62, .03], g, { borde: .012, colorBorde: INK }); }
    } else {
      g.cola = group([-.5, .58, -.01], g); parte(tubo([[0, 0], [-.22, .1], [-.3, .38], [-.18, .58], [-.05, .56]], .14, .13), NE, [0, 0, 0], g.cola);
      const pata = (x, z, color) => { const p = group([x, .5, z], g); parte(tubo([[0, 0], [.01, -.24], [0, -.46]], .14, .12), color, [0, 0, 0], p); parte(F.elipse(.08, .05), BL, [.03, -.47, .004], p, { atras: .1 }); return p; };
      g.patas = [pata(-.32, -.03, NEc), pata(.28, -.03, NEc)];
      parte(blob([[-.55, .62], [-.35, .86], [.1, .88], [.42, .78], [.48, .55], [.3, .4], [-.1, .38], [-.45, .42]]), NE, [0, 0, 0], g);
      parte(blob([[-.25, .42], [.1, .4], [.38, .48], [.42, .66], [.3, .6], [0, .5], [-.25, .5]]), BL, [0, 0, .004], g, { borde: 0 });
      g.patas.push(pata(-.22, .03, NE), pata(.36, .03, NE));
      const h = group([.55, .95, .02], g); g.cabeza = h;
      oreja(h, -.1, .15, -.006); oreja(h, .08, -.1, .006);
      parte(blob([[-.24, .0], [-.18, .19], [.04, .25], [.24, .16], [.32, -.02], [.24, -.16], [.04, -.21], [-.18, -.15]]), NE, [0, 0, 0], h);
      parte(blob([[.06, -.04], [.3, -.03], [.28, -.15], [.1, -.19]]), BL, [0, 0, .004], h, { borde: 0 });
      cara(h, false);
      if (o.collar !== false) parte(blob([[.3, .72], [.42, .66], [.52, .86], [.44, .9]]), 0x2ec4a6, [0, 0, .012], g, { borde: .015, atras: .005 });
    }
    return g;
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

  // ---------- COMEDOR MEXICANO, MESA, PLATOS, RELOJ, ZZZ (11-nov-2026, short del mal del puerco) ----------
  // papel picado: tira de banderitas recortadas que se mecen. g.update(t)
  function papelPicado(y = 3.6, o = {}, parent) { const g = group([0, y, o.z ?? -2.0], parent), cols = o.colores ?? [0xff6b5b, 0xffc83d, 0x2ec4a6, 0x7b5cff, 0x3d6bff, 0xff8fc0], n = o.n ?? 7, w = o.w ?? 6;
    pieza(F.rect(w + .4, .025, 0), 0xffffff, [0, 0, 0], g, { sombra: false });
    g.flags = []; for (let i = 0; i < n; i++) { const fl = group([-w / 2 + (i + .5) * w / n, -.02, .02], g); const sh = S(), a = .3, b = .5; sh.moveTo(-a, 0); sh.lineTo(a, 0); sh.lineTo(a, -b); for (let k = 0; k <= 6; k++) sh.lineTo(a - k * a / 3, -b - (k % 2 ? .08 : 0)); sh.lineTo(-a, 0);
      for (const [hx, hy] of [[-.14, -.15], [.14, -.15], [0, -.3], [-.14, -.42], [.14, -.42]]) { const p = new THREE.Path(); p.absarc(hx, hy, .05, 0, Math.PI * 2, true); sh.holes.push(p); }
      const h2 = new THREE.Path(); h2.moveTo(-.04, -.2); h2.lineTo(.04, -.2); h2.lineTo(0, -.26); h2.lineTo(-.04, -.2); sh.holes.push(h2);
      pieza(sh, cols[i % cols.length], [0, 0, 0], fl, { sombra: true }); fl.i = i; g.flags.push(fl); }
    g.update = (t) => g.flags.forEach(fl => { fl.rotation.z = Math.sin(t * 2.4 + fl.i * 1.3) * .06; fl.rotation.x = Math.sin(t * 1.7 + fl.i) * .15; });
    return g; }
  // mesa con mantel (vista casi de frente, cubierta en trapecio). g.top = altura de la cubierta; pon platos en [x, g.top + .02, z]
  function mesa(pos = [0, 0, .4], o = {}, parent) { const g = group(pos, parent), w = o.w ?? 3.4, top = o.top ?? 1.25, man = o.mantel ?? 0xfff4e0, flor = o.flores ?? 0xff6b5b;
    pieza(F.poly([[-w / 2, 0], [w / 2, 0], [w / 2 - .25, .32], [-w / 2 + .25, .32]]), man, [0, top, -.05], g, { borde: .02 });
    pieza(F.rect(w, .55, .04), man, [0, top - .26, 0], g, { borde: .025 });
    for (let k = 0; k < Math.round(w * 2); k++) { const fx = -w / 2 + .25 + k * .5; if (fx > w / 2 - .1) break; pieza(F.estrella(5, .08, .04), k % 2 ? 0x2ec4a6 : flor, [fx, top - .26, .03], g, { sombra: false }); }
    for (const sx of [-1, 1]) pieza(F.rect(.14, top - .5, .03), o.patas ?? 0x8a5a33, [sx * (w / 2 - .3), (top - .5) / 2, -.05], g, { borde: .02 });
    g.top = top; return g; }
  // plato con comida: o.comida = 'tortillas' | 'guisado' | 'pan' | 'vacio'; o.r radio. g.monton(k) sube/baja la pila (0..1)
  function plato(pos, o = {}, parent) { const g = group(pos, parent), r = o.r ?? .42;
    pieza(F.elipse(r, r * .28), 0xffffff, [0, 0, 0], g, { borde: .02, colorBorde: 0xc9c2b4 }); pieza(F.elipse(r * .7, r * .18), 0xf1ece2, [0, .01, .01], g, { sombra: false });
    const pila = group([0, .02, .02], g); g.pila = pila; const c = o.comida ?? 'guisado';
    if (c === 'tortillas') for (let k = 0; k < 6; k++) pieza(F.elipse(r * .62, r * .12), k % 2 ? 0xf3d9a0 : 0xe9c97e, [0, k * .055, .005 * k], pila, { borde: .012, colorBorde: 0xc79a52 });
    if (c === 'guisado') { pieza(F.elipse(r * .62, r * .32), 0xb4472e, [0, .08, .01], pila, { borde: .015 }); pieza(F.elipse(r * .45, r * .22), 0xf3e2b0, [-.12, .14, .02], pila, { borde: .012 }); for (let k = 0; k < 4; k++) pieza(F.circ(.035), 0x3f9e4a, [-.15 + k * .1, .2 + (k % 2) * .04, .03], pila, { sombra: false }); }
    if (c === 'pan') for (let k = 0; k < 3; k++) pieza(F.elipse(.15, .1), 0xd98b3a, [(k - 1) * .2, .1 + (k === 1 ? .1 : 0), .01 + k * .005], pila, { borde: .015, colorBorde: 0xa35d22 });
    g.monton = (k) => { pila.scale.set(1, Math.max(.01, k), 1); pila.visible = k > .02; };
    return g; }
  // reloj de pared de papel. g.hora(h) pone las manecillas (h en horas, p. ej. 15.5 = 3:30)
  function relojPapel(pos, o = {}, parent) { const g = group(pos, parent), r = o.r ?? .9;
    pieza(F.circ(r), o.color ?? 0xff6b5b, [0, 0, 0], g, { borde: .04 }); pieza(F.circ(r * .84), 0xfffaf0, [0, 0, .02], g, { sombra: false });
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; pieza(F.rect(k % 3 ? .04 : .07, k % 3 ? .1 : .16, .01), INK, [Math.sin(a) * r * .7, Math.cos(a) * r * .7, .03], g, { sombra: false, rot: -a }); }
    const mano = (L, w, col) => { const m = group([0, 0, .05], g); pieza(F.rect(w, L, w / 2), col, [0, L / 2 - .05, 0], m, { sombra: true }); return m; };
    g.hor = mano(r * .45, .09, INK); g.min = mano(r * .66, .06, INK); pieza(F.circ(.07), o.color ?? 0xff6b5b, [0, 0, .08], g, { sombra: false });
    g.hora = (h) => { g.hor.rotation.z = -(h % 12) / 12 * Math.PI * 2; g.min.rotation.z = -(h % 1) * Math.PI * 2; }; g.hora(o.h ?? 12); return g; }
  // "Zzz" que flotan y se desvanecen en bucle. g.update(t, on)
  function zzz(pos, o = {}, parent) { const g = group(pos, parent); g.zs = [0, 1, 2].map(i => { const z = group([0, 0, 0], g); pieza(F.letraZ(.32 + i * .1), o.color ?? 0x7b5cff, [0, 0, 0], z, { borde: .025 }); z.i = i; return z; });
    g.update = (t, on = 1) => g.zs.forEach(z => { const u = ((t * .7 + z.i / 3) % 1); z.position.set(u * .55 + Math.sin(u * 6) * .06, u * .9, 0); z.scale.setScalar(Math.max(.01, on * (.5 + u * .7) * (u < .85 ? 1 : (1 - u) / .15))); z.rotation.z = .15 - u * .3; }); return g; }

  // ---------- SALA (12-nov): sillón, cobija, huella de patita ----------
  // sillón de frente: respaldo, cojines y asiento delantero (tapa piernas de quien se sienta con p.sentar(1)); g.asientoY = altura del cojín
  function sillon(pos = [0, 0, 0], o = {}, parent) { const g = group(pos, parent), w = o.w ?? 3.2, c = o.color ?? 0x3d6bff, c2 = new THREE.Color(c).multiplyScalar(.78).getHex();
    pieza(F.rect(w, 1.5, .3), c2, [0, 1.25, -.5], g, { borde: .04, colorBorde: INK });
    for (const sx of [-1, 1]) pieza(F.rect(w / 2 - .25, 1.0, .25), c, [sx * (w / 4 - .02), 1.3, -.4], g, { borde: .03, colorBorde: INK });
    for (const sx of [-1, 1]) pieza(F.rect(.42, 1.4, .2), c2, [sx * (w / 2 - .05), .72, .45], g, { borde: .04, colorBorde: INK });
    pieza(F.rect(w - .3, .75, .12), c, [0, .45, .5], g, { borde: .04, colorBorde: INK });
    for (const sx of [-1, 1]) pieza(F.rect(.14, .2, .03), 0x6b4a2e, [sx * (w / 2 - .25), -.02, .48], g, { borde: .02, colorBorde: INK });
    g.asientoY = .85; return g; }
  // cobija doblada con cuadros (sobre las piernas)
  function cobija(pos = [0, 0, 0], o = {}, parent) { const g = group(pos, parent), w = o.w ?? 1.3, h = o.h ?? .5, c = o.color ?? 0xff6b5b;
    pieza(F.rect(w, h, .12), c, [0, 0, 0], g, { borde: .03, colorBorde: INK });
    for (let k = 1; k < 5; k++) pieza(F.rect(.05, h - .04, 0), 0xffffff, [-w / 2 + k * w / 5, 0, .022], g, { sombra: false, grosor: .004 });
    pieza(F.rect(w - .04, .05, 0), 0xffffff, [0, 0, .024], g, { sombra: false, grosor: .004 }); return g; }
  // huella de patita (cojinete + 4 deditos)
  function huella(pos = [0, 0, 0], s = 1, color = 0xf2a7b8, parent) { const g = group(pos, parent); g.scale.setScalar(s);
    pieza(blob([[-.17, -.08], [-.1, .06], [0, .09], [.1, .06], [.17, -.08], [0, -.15]]), color, [0, -.06, 0], g, { borde: .025, colorBorde: INK });
    for (const [x, y] of [[-.19, .1], [-.07, .19], [.07, .19], [.19, .1]]) pieza(F.elipse(.055, .07), color, [x, y, 0], g, { borde: .02, colorBorde: INK }); return g; }
  return { sillon, cobija, huella, F, M, pieza, parte, capsula, agrandada, INK, tubo, blob, perro, perroLobo, gato, fondo, luces, tw, persona, protagonista, logoMini, caminar, bam, rayitas, cierre, tex, papelPicado, mesa, plato, relojPapel, zzz };
}
