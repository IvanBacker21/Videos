// PROPUESTA estilo "papel tipo Paper Mario" (11-nov-2026): personajes chibi de cartulina con borde blanco grueso de recorte,
// contorno fino de tinta, ojos ovalados con brillo, chapitas, colores planos con sombra suave y detalles de ropa.
// Solo personajes propios del canal (nada de personajes de Nintendo).
export function kitPM(P, THREE, group) {
  const { F, M, agrandada, blob, tubo, capsula, INK, logoMini } = P;
  const osc = (c, k) => new THREE.Color(c).multiplyScalar(k).getHex();
  const mez = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), k).getHex();
  const PAPEL = 0xfffdf6;
  // geometría limpia: puntos repetidos en las curvas dejan normales NaN, y el bloom del motor las convierte en cuadros negros
  const geo = (s, d) => { const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 40 });
    const P = g.attributes.position.array, N = g.attributes.normal.array;
    for (let i = 0; i < P.length; i++) if (!Number.isFinite(P[i])) P[i] = 0;
    for (let i = 0; i < N.length; i += 3) if (!Number.isFinite(N[i]) || !Number.isFinite(N[i + 1]) || !Number.isFinite(N[i + 2]) || (N[i] === 0 && N[i + 1] === 0 && N[i + 2] === 0)) { N[i] = 0; N[i + 1] = 0; N[i + 2] = 1; }
    if (g.attributes.uv) { const U = g.attributes.uv.array; for (let i = 0; i < U.length; i++) if (!Number.isFinite(U[i])) U[i] = 0; }
    return g; };
  // parte de cartulina: relleno + tinta fina + borde blanco grueso MUY atrás (la unión de todos forma un solo recorte)
  function pz(shape, color, pos, parent, o = {}) {
    const g = group(pos, parent);
    const m = new THREE.Mesh(geo(shape, .012), M(color)); m.castShadow = true; m.receiveShadow = true; g.add(m);
    if (o.tinta !== false) { const t = new THREE.Mesh(geo(agrandada(shape, o.tinta ?? .018), .01), M(INK)); t.position.z = -.11; g.add(t); }
    if (o.papel !== false) { const w = new THREE.Mesh(geo(agrandada(shape, o.papel ?? .075), .05), M(PAPEL)); w.position.z = -.3; w.castShadow = true; w.receiveShadow = true; g.add(w); }
    if (o.rot) g.rotation.z = o.rot; return g; }
  // detalle impreso encima (sin bordes)
  const det = (shape, color, pos, parent, rot) => { const g = group(pos, parent); const m = new THREE.Mesh(geo(shape, .004), M(color)); m.receiveShadow = true; g.add(m); if (rot) g.rotation.z = rot; return g; };
  const linea = (pts, w, color, parent, z = .016) => det(tubo(pts, w, w), color, [0, 0, z], parent);

  // o: {piel, ropa, pantalon, falda, tenis, pelo:'copete'|'cola'|'chongo', colPelo, logo, lentes, aretes, saluda, boca, mira}
  function chibi(pos, o = {}) {
    const g = group(pos); const es = o.escala ?? 1; g.scale.set(es, es, es * .2); g.es = es;   // profundidad aplastada: se ve como UNA cartulina delgada al girar
    const piel = o.piel ?? 0xe8b48c, ropa = o.ropa ?? 0x3d6bff, pan = o.pantalon ?? 0x2b2f4a, ten = o.tenis ?? 0x2ec4a6, cp = o.colPelo ?? 0x3a2416;
    const sPiel = osc(piel, .86), sRopa = osc(ropa, .82), sPan = osc(pan, .78);
    // ---- piernas y tenis ----
    for (const sx of [-1, 1]) {
      const p = group([sx * .14, .56, .0], g); p.rotation.z = p.r0 = sx * .03; (g.piernas ??= []).push(p);
      if (!o.falda) { pz(capsula(.42, .21, .18), pan, [0, 0, 0], p); det(capsula(.36, .07, .06), sPan, [sx * .055, -.03, .014], p);   // sombra lateral
        linea([[-.085, -.36], [.085, -.36]], .016, osc(pan, .65), p); }                                                                      // dobladillo
      else pz(capsula(.42, .13, .12), piel, [0, 0, 0], p);
      const t = group([sx * .04, -.44, .02], p);
      const zap = blob([[-.15, .02], [-.1, .1], [.04, .11], [.16, .05], [.21, -.03], [.16, -.07], [-.12, -.07]]);
      pz(zap, ten, [0, 0, 0], t); det(blob([[-.15, -.03], [.2, -.03], [.18, -.07], [-.12, -.07]]), PAPEL, [0, 0, .014], t);        // suela
      for (const k of [0, 1]) linea([[-.02 + k * .06, .085], [.02 + k * .06, .055]], .014, PAPEL, t);                                   // agujetas
      if (sx < 0) t.scale.x = -1; }
    // ---- torso ----
    const torS = blob([[-.31, .5], [-.34, .78], [-.3, 1.06], [-.12, 1.15], [.12, 1.15], [.3, 1.06], [.34, .78], [.31, .5], [0, .47]]);
    const tor = pz(torS, o.falda ? ropa : ropa, [0, 0, .02], g);
    det(blob([[.14, .52], [.3, .52], [.33, .78], [.29, 1.04], [.18, 1.1], [.22, .8]]), sRopa, [0, 0, .014], tor);                       // sombra suave
    det(blob([[-.12, 1.14], [0, 1.06], [.12, 1.14], [0, 1.1]]), osc(piel, .78), [0, 0, .016], tor);                                     // sombra del cuello
    linea([[-.13, 1.13], [0, 1.05], [.13, 1.13]], .022, osc(ropa, .6), tor, .018);                                                      // cuello de la playera
    linea([[-.2, .72], [-.12, .66]], .012, sRopa, tor); linea([[.1, .9], [.19, .84]], .012, sRopa, tor);                               // arruguitas de tela
    if (o.falda) { pz(blob([[-.42, .3], [-.2, .27], [.2, .27], [.42, .3], [.33, .62], [0, .64], [-.33, .62]]), o.falda, [0, 0, .028], g); for (const x of [-.18, 0, .18]) linea([[x * .8, .58], [x, .32]], .012, osc(o.falda, .78), g, .042); }
    else { const c = det(F.rect(.66, .09, .02), osc(pan, .9), [0, .53, .03], g); det(F.rect(.1, .07, .015), 0xffc83d, [0, .53, .036], g); }   // cinturón y hebilla
    if (o.logo) { const lg = group([-.14, .9, .04], g); lg.scale.setScalar(.06); logoMini(lg); }
    // ---- brazos (detrás del torso; el hombro del torso tapa el arranque) ----
    g.brazos = [-1, 1].map(sx => { const b = group([sx * .25, 1.0, -.012], g); const up = o.saluda && sx > 0;
      b.rotation.z = up ? 2.55 : sx * .22; b.r0 = sx * .22;
      pz(capsula(.48, .17, .14), piel, [0, 0, 0], b); det(capsula(.4, .05, .04), sPiel, [.04, -.04, .014], b);
      pz(capsula(.2, .2, .19), ropa, [0, 0, .024], b); linea([[-.1, -.2], [.1, -.2]], .014, sRopa, b, .042);                            // manga y costura
      const m = group([0, -.5, .05], b); pz(F.elipse(.105, .11), piel, [0, 0, 0], m); pz(F.elipse(.04, .065), piel, [-sx * .085, .03, .004], m, { rot: sx * .5, papel: false });
      linea([[-.03, -.06], [.03, -.06]], .01, sPiel, m, .018); return b; });
    // ---- cabeza grande ----
    const h = group([0, 1.66, .06], g); g.head = h; h.rotation.z = h.r0 = o.inclina ?? .04;
    if (o.pelo === 'cola') pz(blob([[.3, .25], [.62, .2], [.72, -.1], [.62, -.45], [.5, -.3], [.46, -.05], [.34, .05]]), cp, [0, 0, -.02], h);
    if (o.pelo === 'chongo') { pz(F.circ(.2), cp, [0, .56, -.02], h); det(F.arco(.12, .03, .4, 1.6), mez(cp, 0xffffff, .5), [0, .56, -.006], h); }
    for (const sx of [-1, 1]) { pz(F.elipse(.075, .1), piel, [sx * .48, -.03, -.01], h, { papel: .06 }); det(F.elipse(.03, .05), sPiel, [sx * .48, -.03, .004], h); }
    const cab = blob([[-.5, 0], [-.47, .3], [-.3, .45], [0, .48], [.3, .45], [.47, .3], [.5, 0], [.45, -.25], [.28, -.4], [0, -.44], [-.28, -.4], [-.45, -.25]]);
    pz(cab, piel, [0, 0, 0], h);
    det(blob([[.3, -.36], [.45, -.22], [.49, .02], [.46, .22], [.38, .05], [.36, -.18]]), sPiel, [0, 0, .014], h);                  // sombra de la mejilla derecha
    // pelo
    const brillo = mez(cp, 0xffffff, .35);
    if (o.pelo === 'chongo') { pz(blob([[-.5, .08], [-.46, .34], [-.24, .5], [.05, .52], [.3, .46], [.48, .3], [.5, .06], [.36, .22], [.12, .28], [-.14, .26], [-.38, .2]]), cp, [0, 0, .02], h);
      linea([[-.3, .36], [-.1, .44], [.12, .44]], .022, brillo, h, .036); }
    else if (o.pelo === 'cola') { pz(blob([[-.52, -.05], [-.5, .3], [-.3, .5], [.02, .54], [.3, .48], [.5, .3], [.52, .02], [.4, .16], [.2, .2], [.02, .14], [-.12, .24], [-.3, .2], [-.42, .08]]), cp, [0, 0, .02], h);
      linea([[-.32, .38], [-.12, .46], [.1, .46]], .024, brillo, h, .036); pz(F.elipse(.07, .05), 0xff6b9b, [.4, .28, .03], h, { papel: false }); }
    else { if (!o.gorra) { pz(blob([[-.53, .02], [-.5, .32], [-.34, .5], [-.05, .56], [.18, .68], [.44, .74], [.38, .58], [.52, .42], [.53, .1], [.42, .22], [.28, .28], [.08, .25], [-.12, .3], [-.3, .23], [-.45, .1]]), cp, [0, 0, .02], h);
      linea([[-.3, .4], [-.08, .5], [.14, .56]], .026, brillo, h, .036); } for (const sx of [-1, 1]) pz(blob([[-.04, .1], [.04, .1], [.03, -.08], [-.02, -.06]]), cp, [sx * .45, .02, .02], h, { papel: false }); }
    if (o.gorra) { pz(blob([[-.53, .1], [-.5, .36], [-.28, .54], [.04, .58], [.32, .5], [.5, .32], [.53, .1]]), o.gorra, [0, 0, .04], h);
      pz(blob([[.2, .16], [.62, .12], [.66, .06], [.3, .06]]), osc(o.gorra, .82), [0, 0, .046], h, { papel: false }); det(F.circ(.05), PAPEL, [-.04, .54, .06], h);
      linea([[-.3, .44], [-.05, .52]], .02, mez(o.gorra, 0xffffff, .35), h, .062); }
    // ojos ovalados con brillo
    h.ojos = [-1, 1].map(sx => { const e = group([sx * .17 + (o.mira ?? 0) * .02, -.02, .03], h);
      det(F.elipse(.068, .125), INK, [0, 0, 0], e); det(F.elipse(.026, .042), 0xffffff, [.018, .05, .003], e); det(F.circ(.012), 0xffffff, [-.02, -.06, .003], e); return e; });
    h.cejas = [-1, 1].map(sx => { const c = det(F.rect(.12, .032, .016), o.pelo === 'chongo' ? 0x9a948a : osc(cp, .8), [sx * .17, .16, .03], h, -sx * .12); c.sx = sx; return c; });   // cejas (A.preocupa las mueve)
    for (const sx of [-1, 1]) det(F.elipse(.085, .045), mez(piel, 0xff6f86, .45), [sx * .3, -.17, .028], h);                                   // chapitas
    det(F.elipse(.025, .018), osc(piel, .72), [0, -.12, .03], h);                                                                              // nariz
    const bc = group([0, -.25, .03], h);
    // bocas intercambiables (13-nov): g.boca('abierta'|'feliz'|'apretada')
    h.bocas = { abierta: group([0, 0, 0], bc), feliz: group([0, 0, 0], bc), apretada: group([0, 0, 0], bc), lengua: group([0, 0, 0], bc) };
    // 'lengua' (13-nov 18:00): boca abierta con la lengua de fuera hacia un lado (chuparse los labios, antojo, burla)
    det(blob([[-.1, .03], [.1, .03], [.07, -.05], [0, -.07], [-.07, -.05]]), 0x7a1f30, [0, 0, 0], h.bocas.lengua);
    pz(blob([[-.02, -.01], [.09, -.02], [.13, -.08], [.1, -.13], [.04, -.12], [0, -.06]]), 0xff7d93, [0, 0, .006], h.bocas.lengua, { tinta: .008, papel: false });
    det(F.rect(.006, .05, .004), 0xd9506a, [.07, -.07, .014], h.bocas.lengua, .5);
    det(blob([[-.11, .03], [.11, .03], [.08, -.06], [0, -.09], [-.08, -.06]]), 0x7a1f30, [0, 0, 0], h.bocas.abierta); det(F.elipse(.05, .025), 0xff8a9a, [0, -.055, .002], h.bocas.abierta); det(F.rect(.15, .022, .008), 0xffffff, [0, .015, .002], h.bocas.abierta);
    det(F.arco(.08, .024, Math.PI * 1.2, Math.PI * 1.8), 0x7a1f30, [0, .06, 0], h.bocas.feliz);
    det(tubo([[-.09, -.01], [-.045, .02], [0, -.01], [.045, .02], [.09, -.01]], .022, .022), 0x7a1f30, [0, -.01, 0], h.bocas.apretada);   // boca ondulada (aguantando, nervioso)
    g.boca = (e = 'abierta') => { for (const k in h.bocas) h.bocas[k].visible = k === e; };
    g.boca(o.boca ?? 'abierta');
    if (o.lentes) for (const sx of [-1, 1]) det(F.arco(.11, .025, 0, Math.PI * 2), o.lentes, [sx * .17, -.02, .036], h);
    if (o.lentes) linea([[-.07, -.0], [.07, -.0]], .02, o.lentes, h, .036);
    if (o.aretes) for (const sx of [-1, 1]) pz(F.circ(.04), 0xffc83d, [sx * .5, -.14, .01], h, { papel: false });
    // sombra en el piso (mancha suave)
    const sh = new THREE.Mesh(new THREE.CircleGeometry(.48, 40), new THREE.MeshBasicMaterial({ color: 0x3a2a18, transparent: true, opacity: .22 })); sh.rotation.x = -Math.PI / 2; sh.scale.y = .32; sh.position.set(0, .002, .05); g.add(sh);
    return g; }

  // escenario diorama de papel: cielo, nubes, colinas en capas, arbolitos y piso con puntadas
  function diorama() {
    pz(F.rect(30, 30, 0), 0xa9dcf5, [0, 8, -4], null, { tinta: false, papel: false });
    for (const [x, y, s, z] of [[-2.2, 4.4, 1.0, -3.4], [1.9, 5.0, .8, -3.4], [3.6, 3.5, .6, -3.6]]) pz(F.nube(s * 1.6), 0xffffff, [x, y, z], null, { tinta: .02, papel: .1 });
    const colina = (x, y, w, h, c, z) => { pz(blob([[-w, -1], [-w, 0], [-w * .6, h * .8], [0, h], [w * .6, h * .8], [w, 0], [w, -1]]), c, [x, y, z], null, { tinta: .022, papel: .1 });
      det(blob([[w * .1, h * .95], [w * .6, h * .76], [w * .95, .05], [w * .5, .3]]), osc(c, .88), [x, y, z + .014]); };
    colina(-2.6, .4, 2.2, 1.8, 0x7fcf6a, -3.0); colina(2.6, .4, 2.6, 2.3, 0x6ac25d, -3.1); colina(0, .3, 2.0, 1.2, 0x93db7a, -2.6);
    for (const [x, z, s] of [[-3.1, -2.2, 1], [3.0, -2.2, .85]]) { pz(F.rect(.16, .9, .04), 0x9a6a42, [x, .9 * s, z], null, { tinta: .018, papel: .07 });
      const c = pz(F.circ(.55 * s), 0x4fae5a, [x, 1.55 * s, z + .02], null, { tinta: .02, papel: .08 }); det(F.circ(.12), 0x7fd27a, [-.18, .2, .014], c); }
    for (const [x, c] of [[-1.7, 0xff6b9b], [1.5, 0xffc83d], [2.3, 0xff8a5b]]) { linea([[x, .05], [x, .35]], .03, 0x3f9a4a, null, -1.6); pz(F.estrella(5, .1, .055), c, [x, .38, -1.58], null, { tinta: .012, papel: .04 }); }
    pz(F.rect(30, 6, 0), 0xe9c48f, [0, -2.95, -1.7], null, { tinta: false, papel: false });
    const piso = pz(F.rect(30, .06, 0), 0xd4a96e, [0, .03, -1.69], null, { tinta: false, papel: false });
    for (let i = -14; i < 14; i++) { det(F.rect(.18, .03, .01), 0xfff3dc, [i * .4, -.35, -1.68]); det(F.rect(.18, .03, .01), 0xf3dcb4, [i * .4 + .2, -1.3, -1.68]); }                                       // puntadas
  }

  // ================= MASCOTAS en cartulina chibi =================
  // ojo grande de mascota: iris de color, pupila, dos brillos (sx = -1|1 para reflejar el brillo)
  function ojoM(par, pos, rx, ry, iris, pup = .55) { const e = group(pos, par); (par.ojos ??= []).push(e);
    det(F.elipse(rx + .016, ry + .016), INK, [0, 0, 0], e); det(F.elipse(rx, ry), iris, [0, 0, .002], e); det(F.elipse(rx * .62, ry * .62), osc(iris, .7), [0, -ry * .18, .003], e);
    det(F.elipse(rx * pup, ry * pup * 1.05), INK, [0, -ry * .05, .004], e); det(F.elipse(rx * .32, ry * .28), 0xffffff, [rx * .3, ry * .38, .006], e); det(F.circ(rx * .14), 0xffffff, [-rx * .3, -ry * .38, .006], e); return e; }
  const sombraPiso = (g, r = .5) => { const sh = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshBasicMaterial({ color: 0x3a2a18, transparent: true, opacity: .22 })); sh.rotation.x = -Math.PI / 2; sh.scale.y = .32; sh.position.set(0, .002, .05); g.add(sh); };
  const oreja = (par, pos, rot, c, ci, alto = .36) => { const e = group(pos, par); e.rotation.z = rot; e.r0 = rot; (par.orejas ??= []).push(e);
    pz(blob([[-.13, 0], [-.08, alto * .55], [0, alto], [.08, alto * .55], [.13, 0]]), c, [0, 0, 0], e); det(blob([[-.065, .03], [-.04, alto * .5], [0, alto * .8], [.04, alto * .5], [.065, .03]]), ci, [0, 0, .014], e); return e; };
  const pata = (par, pos, L, c, cp, w = .17, sombra) => { const p = group(pos, par); (par.patas ??= []).push(p); pz(capsula(L, w, w * .92), c, [0, 0, 0], p);
    if (sombra) det(capsula(L * .8, w * .3, w * .25), sombra, [w * .22, -.02, .014], p);
    pz(F.elipse(w * .62, w * .42), cp, [.015, -L, .02], p); for (const dx of [-.03, .03]) linea([[dx + .015, -L - .02], [dx + .015, -L - .06]], .01, osc(cp, .75), p, .04); return p; };

  // PERRO LOBO oficial: gris, patas y pecho blancos, ojos ámbar, collar coral con placa. pose 'frente' (sentado) | 'perfil' (de pie, mira a la derecha)
  function perroPM(pos, o = {}) {
    const g = group(pos); const es = o.escala ?? 1; g.scale.set(es, es, es * .2); g.es = es;
    const GR = 0x8a93a3, OS = 0x6a7282, SH = 0x7a8292, BL = 0xfaf6ec, AM = 0xf2b23a, PI = 0xf2b8b8, CL = 0xc9d0dc;
    const collar = (par, pos, w, rot = 0) => { const c = group(pos, par); c.rotation.z = rot; pz(tubo([[-w, .03], [0, -.03], [w, .03]], .085, .085), 0xff6b5b, [0, 0, 0], c, { papel: false });
      for (const x of [-w * .6, 0, w * .6]) det(F.circ(.012), osc(0xff6b5b, .7), [x, x === 0 ? -.03 : 0, .016], c); const pl = pz(F.circ(.065), 0xffc83d, [0, -.1, .02], c, { papel: false }); det(F.estrella(5, .035, .016), osc(0xffc83d, .75), [0, 0, .014], pl); return c; };
    if ((o.pose ?? 'frente') === 'frente') {
      { const c = g.cola = group([.3, .12, 0], g); pz(tubo([[.3, .12], [.58, .2], [.72, .42], [.66, .66], [.56, .74]], .2, .15), GR, [-.3, -.12, -.03], c); det(tubo([[.62, .64], [.56, .74]], .12, .1), BL, [-.3, -.12, -.015], c); }   // cola esponjada
      for (const sx of [-1, 1]) { pz(F.elipse(.2, .17), GR, [sx * .3, .14, -.01], g); pz(F.elipse(.12, .07), BL, [sx * .38, .05, .005], g, { papel: false }); }     // ancas y patitas traseras
      const cu = pz(blob([[-.36, .04], [-.4, .3], [-.3, .6], [0, .7], [.3, .6], [.4, .3], [.36, .04], [0, 0]]), GR, [0, 0, 0], g);
      det(blob([[.18, .08], [.36, .1], [.38, .34], [.28, .58], [.2, .4]]), SH, [0, 0, .014], cu);
      det(blob([[-.17, .14], [-.2, .42], [-.1, .64], [0, .68], [.1, .64], [.2, .42], [.17, .14], [0, .1]]), BL, [0, 0, .016], cu);                                    // pecho blanco
      for (const [x, y] of [[-.08, .5], [.06, .44], [-.04, .32]]) linea([[x - .03, y], [x, y - .04], [x + .03, y]], .01, 0xd9d3c4, cu, .022);                          // pelito del pecho
      for (const sx of [-1, 1]) pata(g, [sx * .13, .48, .03], .42, GR, BL, .16, SH);
      const h = g.head = group([0, 1.05, .06], g); h.rotation.z = h.r0 = o.inclina ?? -.06;
      oreja(h, [-.28, .3, -.02], .28, GR, PI, .4); oreja(h, [.28, .3, -.02], -.28, GR, PI, .4);
      pz(blob([[-.48, .08], [-.44, .3], [-.26, .42], [0, .44], [.26, .42], [.44, .3], [.48, .08], [.58, -.1], [.44, -.12], [.38, -.28], [.2, -.38], [0, -.4], [-.2, -.38], [-.38, -.28], [-.44, -.12], [-.58, -.1]]), GR, [0, 0, 0], h);
      det(blob([[.28, -.3], [.42, -.16], [.5, -.08], [.44, .08], [.36, -.04]]), SH, [0, 0, .014], h);
      det(blob([[-.07, .42], [.07, .42], [.06, .14], [.2, -.04], [.36, -.14], [.3, -.28], [.16, -.37], [0, -.39], [-.16, -.37], [-.3, -.28], [-.36, -.14], [-.2, -.04], [-.06, .14]]), BL, [0, 0, .016], h);   // máscara blanca de lobo
      for (const sx of [-1, 1]) { ojoM(h, [sx * .19, .06, .03], .085, .105, AM, .5); det(F.rect(.11, .03, .015), CL, [sx * .19, .21, .03], h, -sx * .2); det(F.elipse(.07, .04), mez(BL, 0xff6f86, .4), [sx * .3, -.12, .028], h); }
      const hoc = group([0, -.17, .03], h); det(F.elipse(.075, .055), INK, [0, .03, .004], hoc); det(F.elipse(.025, .014), 0x6b6680, [-.02, .05, .008], hoc);
      det(F.arco(.045, .014, Math.PI * 1.1, Math.PI * 1.9), INK, [-.045, -.04, .004], hoc); det(F.arco(.045, .014, Math.PI * 1.1, Math.PI * 1.9), INK, [.045, -.04, .004], hoc);
      det(blob([[-.04, -.06], [.04, -.06], [.04, -.13], [0, -.16], [-.04, -.13]]), 0xff8a9a, [0, 0, .002], hoc); linea([[0, -.07], [0, -.12]], .008, osc(0xff8a9a, .75), hoc, .006);
      collar(g, [0, .7, .07], .25);
    } else {
      { const c = g.cola = group([-.5, .55, 0], g); pz(tubo([[-.5, .55], [-.74, .62], [-.86, .84], [-.8, 1.04]], .22, .16), GR, [.5, -.55, -.03], c); det(tubo([[-.83, .96], [-.8, 1.04]], .14, .12), BL, [.5, -.55, -.015], c); }
      pata(g, [-.34, .42, -.02], .4, OS, mez(BL, OS, .25), .16); pata(g, [.32, .42, -.02], .4, OS, mez(BL, OS, .25), .16);                                          // patas lejanas
      const cu = pz(blob([[-.56, .36], [-.54, .62], [-.25, .72], [.2, .72], [.5, .66], [.58, .44], [.44, .3], [-.42, .3]]), GR, [0, 0, 0], g);
      det(blob([[-.5, .36], [.45, .32], [.52, .44], [-.4, .42]]), SH, [0, 0, .014], cu); det(blob([[.3, .34], [.56, .44], [.5, .64], [.36, .56]]), BL, [0, 0, .016], cu);
      pata(g, [-.24, .42, .03], .42, GR, BL, .17, SH); pata(g, [.42, .42, .03], .42, GR, BL, .17, SH);
      const h = g.head = group([.62, 1.0, .06], g); h.rotation.z = h.r0 = o.inclina ?? .04;
      oreja(h, [-.12, .3, -.02], .35, GR, PI, .38); oreja(h, [.06, .32, -.03], .1, OS, PI, .34);
      pz(blob([[-.38, -.02], [-.34, .26], [-.14, .38], [.1, .36], [.28, .2], [.36, .04], [.6, -.02], [.66, -.12], [.58, -.22], [.3, -.24], [.12, -.34], [-.18, -.34], [-.34, -.22]]), GR, [0, 0, 0], h);
      det(blob([[.06, -.06], [.34, .0], [.6, -.04], [.64, -.12], [.56, -.21], [.3, -.23], [.12, -.33], [-.12, -.32], [-.02, -.18]]), BL, [0, 0, .016], h);
      ojoM(h, [.14, .08, .03], .075, .1, AM, .5); det(F.rect(.11, .03, .015), CL, [.13, .22, .03], h, -.2); det(F.elipse(.07, .04), mez(BL, 0xff6f86, .4), [.08, -.14, .028], h);
      det(F.elipse(.06, .045), INK, [.63, -.06, .03], h); det(F.elipse(.02, .012), 0x6b6680, [.61, -.04, .034], h);
      det(F.arco(.06, .014, Math.PI * 1.15, Math.PI * 1.7), INK, [.5, -.1, .03], h); det(blob([[.42, -.17], [.5, -.17], [.5, -.26], [.46, -.29], [.42, -.26]]), 0xff8a9a, [0, 0, .028], h);
      collar(g, [.4, .735, .075], .17, -.12);
    }
    sombraPiso(g, .62); return g; }

  // GATO TIERNO oficial: negro con patitas, pecho y panza blancos, ojos verde-amarillo. pose 'frente' (sentado) | 'perfil' (caminando, mira a la derecha)
  function gatoPM(pos, o = {}) {
    const g = group(pos); const es = o.escala ?? 1; g.scale.set(es, es, es * .2); g.es = es;
    const NE = 0x2b2833, LU = 0x36323f, BL = 0xfaf6ec, OJ = 0xb9e05a, PI = 0xf4a7b6;
    const bigotes = (par, x, y, sx) => { for (const [dy, a] of [[.02, .12], [-.03, -.04], [-.08, -.2]]) linea([[x, y + dy], [x + sx * .26, y + dy + a * .45]], .009, 0xe9e4da, par, .036); };
    if ((o.pose ?? 'frente') === 'frente') {
      { const c = g.cola = group([.28, .08, 0], g); pz(tubo([[.28, .08], [.5, .1], [.62, .3], [.56, .54], [.46, .6]], .15, .12), NE, [-.28, -.08, -.03], c); det(tubo([[.6, .4], [.56, .54]], .1, .08), LU, [-.28, -.08, -.015], c); }
      for (const sx of [-1, 1]) { pz(F.elipse(.19, .16), NE, [sx * .27, .13, -.01], g); pz(F.elipse(.11, .065), BL, [sx * .35, .05, .005], g, { papel: false }); }
      const cu = pz(blob([[-.32, .04], [-.36, .28], [-.26, .54], [0, .62], [.26, .54], [.36, .28], [.32, .04], [0, 0]]), NE, [0, 0, 0], g);
      det(blob([[-.3, .1], [-.32, .3], [-.24, .5], [-.18, .3]]), LU, [0, 0, .014], cu);
      det(blob([[-.16, .1], [-.18, .36], [-.08, .56], [0, .6], [.08, .56], [.18, .36], [.16, .1], [0, .06]]), BL, [0, 0, .016], cu);
      for (const sx of [-1, 1]) pata(g, [sx * .11, .42, .03], .38, NE, BL, .14);
      const h = g.head = group([0, .94, .06], g); h.rotation.z = h.r0 = o.inclina ?? .08;
      oreja(h, [-.27, .24, -.02], .3, NE, PI, .34); oreja(h, [.27, .24, -.02], -.3, NE, PI, .34);
      pz(blob([[-.46, .02], [-.42, .26], [-.24, .38], [0, .4], [.24, .38], [.42, .26], [.46, .02], [.54, -.12], [.42, -.14], [.32, -.28], [.16, -.34], [0, -.35], [-.16, -.34], [-.32, -.28], [-.42, -.14], [-.54, -.12]]), NE, [0, 0, 0], h);
      det(blob([[-.4, .04], [-.36, .24], [-.2, .34], [-.3, .16]]), LU, [0, 0, .014], h);
      det(blob([[-.2, -.06], [-.06, -.08], [0, -.04], [.06, -.08], [.2, -.06], [.22, -.2], [.12, -.31], [0, -.33], [-.12, -.31], [-.22, -.2]]), BL, [0, 0, .016], h);   // hocico blanco
      for (const sx of [-1, 1]) { ojoM(h, [sx * .19, .08, .03], .1, .12, OJ, .6); det(F.elipse(.07, .04), mez(NE, 0xff6f86, .55), [sx * .32, -.1, .028], h); bigotes(h, sx * .2, -.14, sx); }
      det(blob([[-.04, -.08], [.04, -.08], [0, -.13]]), 0xff8aa0, [0, 0, .03], h);
      det(F.arco(.035, .012, Math.PI * 1.1, Math.PI * 1.9), INK, [-.035, -.16, .03], h); det(F.arco(.035, .012, Math.PI * 1.1, Math.PI * 1.9), INK, [.035, -.16, .03], h);
      if (o.collar !== false) { pz(tubo([[-.2, .62], [0, .58], [.2, .62]], .06, .06), 0x7b5cff, [0, 0, .07], g, { papel: false }); pz(F.circ(.05), 0xffc83d, [0, .52, .09], g, { papel: false }); }
    } else {
      { const c = g.cola = group([-.46, .5, 0], g); pz(tubo([[-.46, .5], [-.62, .7], [-.6, 1.0], [-.48, 1.14], [-.38, 1.1]], .13, .1), NE, [.46, -.5, -.03], c); }                                                     // cola en gancho
      pata(g, [-.3, .38, -.02], .36, 0x23202a, mez(BL, NE, .2), .13); pata(g, [.26, .38, -.02], .36, 0x23202a, mez(BL, NE, .2), .13);
      const cu = pz(blob([[-.5, .34], [-.46, .58], [-.2, .64], [.2, .62], [.44, .56], [.5, .4], [.38, .28], [-.38, .28]]), NE, [0, 0, 0], g);
      det(blob([[-.42, .56], [.0, .62], [.38, .55], [0, .58]]), LU, [0, 0, .014], cu); det(blob([[-.3, .3], [.36, .3], [.48, .42], [.3, .38], [-.2, .36]]), BL, [0, 0, .016], cu);   // panza blanca
      pata(g, [-.2, .38, .03], .38, NE, BL, .14); pata(g, [.36, .38, .03], .38, NE, BL, .14);
      const h = g.head = group([.52, .88, .06], g); h.rotation.z = h.r0 = o.inclina ?? -.05;
      oreja(h, [-.18, .24, -.02], .25, NE, PI, .34); oreja(h, [.12, .26, -.03], -.1, 0x23202a, PI, .3);
      pz(blob([[-.4, .0], [-.36, .24], [-.16, .36], [.12, .36], [.32, .24], [.4, .04], [.44, -.1], [.36, -.2], [.16, -.3], [-.12, -.3], [-.34, -.18]]), NE, [0, 0, 0], h);
      det(blob([[.04, -.08], [.2, -.05], [.4, -.06], [.42, -.12], [.34, -.21], [.16, -.29], [.02, -.24]]), BL, [0, 0, .016], h);
      ojoM(h, [.14, .07, .03], .09, .115, OJ, .6); det(F.elipse(.065, .038), mez(NE, 0xff6f86, .55), [.04, -.12, .028], h);
      det(blob([[.36, -.06], [.43, -.06], [.41, -.11]]), 0xff8aa0, [0, 0, .03], h); det(F.arco(.04, .012, Math.PI * 1.15, Math.PI * 1.8), INK, [.36, -.14, .03], h); bigotes(h, .3, -.12, 1);
    }
    sombraPiso(g, .5); return g; }

  // ================= UTILERÍA (12-nov) =================
  // ondas de sonido que salen de pos hacia dir (1 = derecha, -1 = izquierda): g.update(t, on)
  function ondas(pos, dir = 1, color = 0xffffff, parent = null) { const g = group(pos, parent); g.arcos = [0, 1, 2].map(i => { const a = group([0, 0, .02 * i], g);
      pz(F.arco(.22, .045, -.75, .75), color, [0, 0, 0], a, { tinta: .012, papel: .035 }); a.visible = false; return a; });
    g.scale.x = dir; g.update = (t, on = 1) => g.arcos.forEach((a, i) => { const k = ((t * 1.2 + i / 3) % 1); a.visible = on > 0; a.position.x = k * .7; const s = .5 + k * 1.1; a.scale.set(s, s, 1); }); return g; }
  // pelota de juguete con franja: g.rota(t)
  function pelota(pos, r = .22, color = 0xff6b5b, parent = null) { const g = group(pos, parent); const b = pz(F.circ(r), color, [0, 0, 0], g, { tinta: .014, papel: .05 });
    det(F.rect(r * 2, r * .32, .002), 0xffc83d, [0, 0, .014], b); det(F.elipse(r * .28, r * .2), 0xffffff, [-r * .4, r * .45, .02], b); g.rota = t => b.rotation.z = t * 3; return g; }
  // signo de interrogación de cartulina
  function pregunta(pos, s = 1, color = 0xffc83d, parent = null) { const g = group(pos, parent); g.scale.setScalar(s);
    pz(tubo([[-.12, .2], [-.08, .3], [.04, .33], [.13, .26], [.12, .14], [.02, .07], [0, -.04]], .085, .085), color, [0, 0, 0], g, { tinta: .016, papel: .05 }); pz(F.circ(.055), color, [0, -.15, 0], g, { tinta: .016, papel: .05 }); return g; }

  // ================= ESPACIO DE PAPEL (12-nov 18:00, short de Plutón) =================
  // escenario "maqueta del espacio": fondo azul noche de cartulina, nebulosas, estrellitas que titilan y piso-escenario morado
  // (los personajes se paran en y≈.02 igual que en diorama()). Devuelve { update(t) } para el titileo.
  function espacio(o = {}) {
    const FON = o.fondo ?? 0x232a63;
    pz(F.rect(30, 30, 0), FON, [0, 8, -4], null, { tinta: false, papel: false });
    for (const [x, y, rx, ry, c] of [[-1.6, 3.2, 1.6, .7, 0x3a3f8a], [1.8, 1.6, 1.4, .6, 0x4a3a8a], [0, 4.6, 2.2, .6, 0x2f3a7a]]) det(F.elipse(rx, ry), c, [x, y, -3.95], null, x * .08);
    // planeta lejano con anillo (opcional: o.planeta = [x, y, z]; cuidado con la franja de subtítulos de arriba)
    if (o.planeta) { const s = group(o.planeta); pz(F.circ(.38), 0xff8a5b, [0, 0, 0], s, { tinta: .02, papel: .07 }); det(F.arco(.24, .06, .3, 2.6), osc(0xff8a5b, .85), [.04, -.04, .016], s);
      pz(F.arco(.58, .07, Math.PI * 1.08, Math.PI * 1.92), 0xffc83d, [0, 0, .05], s, { tinta: .014, papel: .04 }); s.rotation.z = .25; }
    let sem = 7; const rnd = () => (sem = (sem * 16807) % 2147483647) / 2147483647;
    const est = []; for (let i = 0; i < 34; i++) { const x = (rnd() - .5) * 7, y = -.2 + rnd() * 5.2; if (y < .35) continue;
      const s = pz(F.estrella(5, .07 + rnd() * .05, .03), rnd() < .3 ? 0xfff2a8 : 0xffffff, [x, y, -3.7], null, { tinta: false, papel: .025 }); s.f = rnd() * 6; s.k = .7 + rnd() * .5; est.push(s); }
    // piso-escenario de la maqueta
    pz(F.rect(30, 6, 0), 0x4a3c86, [0, -2.95, -1.7], null, { tinta: false, papel: false });
    pz(F.rect(30, .08, 0), 0x6a58b8, [0, .0, -1.69], null, { tinta: false, papel: false });
    for (let i = -14; i < 14; i++) { det(F.rect(.18, .03, .01), 0x8a7ad0, [i * .4, -.35, -1.68]); det(F.rect(.18, .03, .01), 0x7a6ac0, [i * .4 + .2, -1.3, -1.68]); }
    return { estrellas: est, update(t) { est.forEach(s => s.scale.setScalar(s.k * (.75 + .25 * Math.sin(t * 3 + s.f)))); } };
  }
  // ASTRO con carita de cartulina (planeta, luna, sol, roca helada). o: {cara:true, corazon (Plutón), crateres, rayos (sol), hilo (cuelga de la maqueta),
  //   irregular (roca), sombra (color)}. g.cara('feliz'|'abierta'|'triste'|'duda'); g.head = carita (sirve con A.parpadea y A.ladea); g.rayos gira.
  function astro(pos, r = .5, color = 0xe6c9a8, o = {}) {
    const g = group(pos); g.es = 1;
    if (o.hilo) linea([[0, r * .9], [0, r + 6]], .014, 0xf3ead8, g, -.2);
    if (o.rayos) { g.rayos = group([0, 0, -.05], g); pz(F.estrella(12, r * 1.42, r * 1.1), 0xffa53d, [0, 0, 0], g.rayos, { tinta: .018, papel: .06 }); }
    let forma = o.forma ?? F.circ(r);   // o.forma: silueta propia (riñón, vejiga, gota…)
    if (o.irregular) { let s2 = (o.semilla ?? 3) * 977 + 1; const rr = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647; const pts = [];
      for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, k = r * (.82 + rr() * .3); pts.push([Math.cos(a) * k * 1.12, Math.sin(a) * k * .92]); } forma = blob(pts); }
    const cu = g.cuerpo = pz(forma, color, [0, 0, 0], g, { tinta: .02, papel: o.papel ?? .07 });
    det(blob([[r * .3, -r * .8], [r * .75, -r * .5], [r * .95, 0], [r * .78, r * .5], [r * .55, r * .2], [r * .45, -r * .35]]), o.sombra ?? osc(color, .86), [0, 0, .014], cu);   // sombra suave
    det(F.elipse(r * .22, r * .12), mez(color, 0xffffff, .55), [-r * .45, r * .55, .016], cu, .5);                                                                             // brillo
    if (o.crateres) for (const [x, y, k] of o.crateres) { det(F.circ(r * k), osc(color, .8), [r * x, r * y, .016], cu); det(F.circ(r * k * .6), osc(color, .9), [r * x - r * k * .15, r * y + r * k * .15, .018], cu); }
    if (o.corazon) det(F.corazon(r * 1.5), 0xfff4e4, [r * .32, -r * .42, .018], cu, -.25);
    // carita
    const h = g.head = group([0, o.corazon ? r * .12 : 0, .03], g); h.r0 = 0; const s = r / .5;
    h.ojos = [-1, 1].map(sx => { const e = group([sx * .16 * s, .04 * s, .01], h); det(F.elipse(.055 * s, .1 * s), INK, [0, 0, 0], e); det(F.elipse(.021 * s, .034 * s), 0xffffff, [.015 * s, .04 * s, .003], e); return e; });
    h.cejas = [-1, 1].map(sx => { const c = group([sx * .16 * s, .2 * s, .012], h); det(F.rect(.1 * s, .028 * s, .012 * s), osc(color, .45), [0, 0, 0], c); c.sx = sx; return c; });
    for (const sx of [-1, 1]) det(F.elipse(.07 * s, .038 * s), mez(color, 0xff6f86, .5), [sx * .29 * s, -.1 * s, .008], h);
    const bocas = {};
    bocas.feliz = det(F.arco(.08 * s, .024 * s, Math.PI * 1.15, Math.PI * 1.85), 0x7a1f30, [0, -.06 * s, .01], h);
    { const b = bocas.abierta = group([0, -.15 * s, .01], h); det(blob([[-.09 * s, .03 * s], [.09 * s, .03 * s], [.065 * s, -.05 * s], [0, -.075 * s], [-.065 * s, -.05 * s]]), 0x7a1f30, [0, 0, 0], b); det(F.elipse(.04 * s, .02 * s), 0xff8a9a, [0, -.045 * s, .002], b); }
    bocas.triste = det(F.arco(.07 * s, .024 * s, Math.PI * .2, Math.PI * .8), 0x7a1f30, [0, -.22 * s, .01], h);
    bocas.duda = det(F.rect(.11 * s, .024 * s, .012 * s), 0x7a1f30, [0, -.15 * s, .01], h, .12);
    const gota = det(F.gota(.16 * s), 0x8fd3ff, [.36 * s, .2 * s, .02], h);
    g.cara = (e = 'feliz') => { for (const k in bocas) bocas[k].visible = k === e; gota.visible = e === 'triste' || e === 'duda';
      const ang = e === 'triste' || e === 'duda' ? .35 : e === 'abierta' ? -.1 : 0; const dy = e === 'abierta' ? .03 * s : 0;
      h.cejas.forEach(c => { c.rotation.z = c.sx * ang; c.position.y = .2 * s + dy; }); };
    g.cara(o.expr ?? 'feliz');
    if (o.cara === false) h.visible = false;
    return g; }
  // marca de cartulina: palomita verde (ok=true) o tache rojo (ok=false)
  function marca(pos, ok = true, s = 1, parent = null) { const g = group(pos, parent); g.scale.setScalar(s);
    pz(F.circ(.24), ok ? 0x2ec4a6 : 0xff5b5b, [0, 0, 0], g, { tinta: .016, papel: .05 });
    if (ok) det(tubo([[-.11, .0], [-.03, -.08], [.12, .1]], .055, .055), 0xffffff, [0, 0, .016], g);
    else { det(tubo([[-.1, -.1], [.1, .1]], .055, .055), 0xffffff, [0, 0, .016], g); det(tubo([[-.1, .1], [.1, -.1]], .055, .055), 0xffffff, [0, 0, .02], g); }
    return g; }
  // letrero de cartulina con texto impreso (canvas), colgado de dos hilos. o: {w, h, color, borde, tinta, hilos}
  function letrero(pos, texto, o = {}, parent = null) {
    const g = group(pos, parent), w = o.w ?? 1.5, hh = o.h ?? .42;
    if (o.hilos !== false) for (const sx of [-1, 1]) linea([[sx * w * .38, hh * .4], [0, hh * .4 + .55]], .014, 0xf3ead8, g, -.2);
    pz(F.rect(w, hh, .06), o.borde ?? 0xff6b5b, [0, 0, 0], g, { tinta: .016, papel: .06 });
    pz(F.rect(w - .09, hh - .09, .04), o.color ?? 0xfff6e0, [0, 0, .016], g, { tinta: false, papel: false });
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = Math.round(1024 * (hh - .09) / (w - .09)); const x = cv.getContext('2d');
    x.fillStyle = '#' + (o.color ?? 0xfff6e0).toString(16).padStart(6, '0'); x.fillRect(0, 0, cv.width, cv.height);
    let fs = cv.height * .62; x.font = `900 ${fs}px Poppins, "Arial Black", sans-serif`; while (x.measureText(texto).width > cv.width * .9 && fs > 10) { fs -= 4; x.font = `900 ${fs}px Poppins, "Arial Black", sans-serif`; }
    x.fillStyle = o.tinta ?? '#1f1b2e'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(texto, cv.width / 2, cv.height * .54);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w - .09, hh - .09), new THREE.MeshStandardMaterial({ map: tx, roughness: 1, metalness: 0 })); m.position.z = .036; m.receiveShadow = true; g.add(m);
    g.columpia = (t, amp = .05) => g.rotation.z = Math.sin(t * 2.6) * amp; return g; }
  // tarjeta de comentario (pregunta de un seguidor): avatar, texto y corazoncito
  function comentario(pos, texto, o = {}) { const g = group(pos), w = o.w ?? 1.9, hh = o.h ?? .56;
    pz(F.rect(w, hh, .12), 0xffffff, [0, 0, 0], g, { tinta: .016, papel: .06 });
    pz(F.circ(.15), 0xffc83d, [-w / 2 + .22, 0, .02], g, { tinta: .012, papel: false }); det(F.circ(.06), 0x7a5a3a, [-w / 2 + .22, .03, .036], g); det(F.elipse(.09, .045), 0x7a5a3a, [-w / 2 + .22, -.08, .036], g);
    pz(F.corazon(.22), 0xff5d8f, [w / 2 - .14, -hh / 2 + .12, .02], g, { tinta: .01, papel: false });
    const cv = document.createElement('canvas'); cv.width = 1024; cv.height = Math.round(1024 * hh / (w - .55)); const x = cv.getContext('2d');
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, cv.width, cv.height); x.fillStyle = '#1f1b2e'; x.textAlign = 'left'; x.textBaseline = 'middle';
    const lineas = texto.split('\n'); let fs = cv.height / (lineas.length + .6); x.font = `800 ${fs}px Poppins, "Arial Black", sans-serif`;
    while (Math.max(...lineas.map(l => x.measureText(l).width)) > cv.width * .96 && fs > 10) { fs -= 3; x.font = `800 ${fs}px Poppins, "Arial Black", sans-serif`; }
    lineas.forEach((l, i) => x.fillText(l, 10, cv.height / 2 + (i - (lineas.length - 1) / 2) * fs * 1.12));
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w - .55, hh), new THREE.MeshStandardMaterial({ map: tx, roughness: 1 })); m.position.set(.07, 0, .025); g.add(m); return g; }

  // ================= ANIMACIÓN (usar con t ya "a saltitos": P.tw(lt)) =================
  // ================= FRÍO Y CUERPO (13-nov, short de la pipí con frío) =================
  // bufanda de cartulina para un chibi (rayitas; la punta cuelga y se mece con b.mece(t))
  function bufanda(p, color = 0xff6b5b, color2 = 0xffffff) { const b = group([0, 1.13, .045], p);
    pz(blob([[-.3, .02], [-.2, .1], [0, .12], [.2, .1], [.3, .02], [.22, -.07], [0, -.08], [-.22, -.07]]), color, [0, 0, 0], b, { tinta: .014, papel: .04 });
    for (const x of [-.16, .0, .16]) det(F.rect(.05, .14, .01), color2, [x, .02, .016], b);
    const pu = group([.15, -.04, .02], b); pz(F.rect(.15, .42, .04), color, [0, -.2, 0], pu, { tinta: .014, papel: .04 });
    for (const y of [-.12, -.26]) det(F.rect(.15, .045, .005), color2, [0, y, .016], pu); for (const x of [-.05, 0, .05]) det(F.rect(.018, .06, .004), color, [x, -.43, -.004], pu);
    b.mece = t => pu.rotation.z = .12 + Math.sin(t * 3) * .1; return b; }
  // copos / aire frío que cae: devuelve { update(t, on) }. o: {n, x0, x1, y0, y1, z}
  function copos(o = {}) { const n = o.n ?? 14, x0 = o.x0 ?? -1.8, x1 = o.x1 ?? 1.8, y0 = o.y0 ?? -.1, y1 = o.y1 ?? 3.0; let sm = 11; const rnd = () => (sm = (sm * 16807) % 2147483647) / 2147483647;
    const cs = []; for (let i = 0; i < n; i++) { const c = pz(F.estrella(6, .07, .035), 0xffffff, [0, 0, o.z ?? .2], null, { tinta: .01, papel: false }); c.f = rnd(); c.x = x0 + rnd() * (x1 - x0); c.v = .25 + rnd() * .2; cs.push(c); }
    return { cs, update(t, on = 1) { cs.forEach(c => { const k = (t * c.v + c.f) % 1; c.visible = on > 0; c.position.x = c.x + Math.sin(t * 1.5 + c.f * 9) * .12; c.position.y = y1 - k * (y1 - y0); c.rotation.z = t + c.f * 6; }); } }; }
  // lupa de cartulina: aro + mango; mete cosas en g.dentro (se recortan visualmente por el fondo del círculo)
  function lupa(pos, r = .8, o = {}) { const g = group(pos);
    const m = group([r * .72, -r * .72, -.02], g); m.rotation.z = Math.PI / 4; pz(F.rect(.16, r * .9, .06), o.mango ?? 0x7b5cff, [0, -r * .45, 0], m, { tinta: .016, papel: .05 });
    pz(F.circ(r), o.fondo ?? 0xf4c4a8, [0, 0, 0], g, { tinta: .02, papel: .07 }); g.dentro = group([0, 0, .03], g);
    pz(F.arco(r, .1, 0, Math.PI * 2), o.aro ?? 0x3d3a5a, [0, 0, .09], g, { tinta: false, papel: false }); det(F.arco(r * .8, .04, 2.0, 2.7), 0xffffff, [0, 0, .1], g); return g; }
  // formas de órganos para PM.astro({forma}): riñón y vejiga
  // ---- tienda / Buen Fin (13-nov-2026) ----
  // textura de texto impreso (canvas) para precios y letreros chicos
  const textoTx = (texto, w, hh, fondo, tinta = '#1f1b2e', peso = 900) => { const cv = document.createElement('canvas'); cv.width = 1024; cv.height = Math.max(64, Math.round(1024 * hh / w)); const x = cv.getContext('2d');
    x.fillStyle = '#' + fondo.toString(16).padStart(6, '0'); x.fillRect(0, 0, cv.width, cv.height);
    let fs = cv.height * .7; const fnt = () => x.font = `${peso} ${fs}px Poppins, "Arial Black", sans-serif`; fnt(); while (x.measureText(texto).width > cv.width * .88 && fs > 10) { fs -= 4; fnt(); }
    x.fillStyle = tinta; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(texto, cv.width / 2, cv.height * .55);
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4; return tx; };
  // etiqueta de precio de cartulina (forma de etiqueta con ojillo e hilo). o: {w, h, color, borde, tinta, hilo, ojillo:'izq'|'arriba'}
  // g.texto(nuevo) cambia el precio impreso (para "voltear" la etiqueta a mitad de A.voltea); g.columpia(t, amp)
  function precio(pos, texto, o = {}, parent = null) {
    const g = group(pos, parent), w = o.w ?? 1.2, hh = o.h ?? .5, c = o.color ?? 0xffe27a, b = o.borde ?? 0xff6b5b;
    const forma = (ww, h2) => F.poly([[-ww / 2 + h2 * .32, h2 / 2], [ww / 2, h2 / 2], [ww / 2, -h2 / 2], [-ww / 2 + h2 * .32, -h2 / 2], [-ww / 2, 0]]);
    pz(forma(w, hh), b, [0, 0, 0], g, { tinta: .016, papel: .06 });
    pz(forma(w - .08, hh - .08), c, [.0, 0, .016], g, { tinta: false, papel: false });
    det(F.circ(.045), 0xfff8ec, [-w / 2 + .11, 0, .03], g); det(F.circ(.025), INK, [-w / 2 + .11, 0, .034], g);
    if (o.hilo !== false) linea([[-w / 2 + .11, 0], [-w / 2 - .12, .22], [-w / 2 - .2, .42]], .014, 0xf3ead8, g, -.05);
    const tw = w - .32, th = hh - .14;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(tw, th), new THREE.MeshStandardMaterial({ map: textoTx(texto, tw, th, c, o.tinta ?? '#1f1b2e'), roughness: 1, metalness: 0 }));
    m.position.set(.1, 0, .036); m.receiveShadow = true; g.add(m);
    g.texto = (tx2) => { m.material.map.dispose(); m.material.map = textoTx(tx2, tw, th, c, o.tinta ?? '#1f1b2e'); m.material.needsUpdate = true; };
    g.columpia = (t, amp = .05) => g.rotation.z = Math.sin(t * 2.6) * amp; return g; }
  // carrito de súper de perfil (asa a la izquierda; para el otro lado g.scale.x = -1). g.carga = grupo para poner cosas encima; g.rueda(t, vel)
  function carrito(pos, o = {}) {
    const g = group(pos), es = o.escala ?? 1; g.scale.set(es, es, es); const met = o.color ?? 0xd8dde6, plas = o.plastico ?? 0xff6b5b;
    pz(F.poly([[-.55, .95], [.6, .95], [.45, .35], [-.42, .35]]), met, [0, 0, 0], g, { tinta: .016, papel: .06 });
    for (let i = 1; i < 6; i++) { const x = -.55 + i * .19; linea([[x, .93], [x - (x + .5) * .1 + .03, .38]], .012, 0x9aa3b2, g, .02); }
    for (const y of [.55, .75]) linea([[-.5 + (.95 - y) * .1, y], [.55 - (.95 - y) * .25, y]], .012, 0x9aa3b2, g, .02);
    pz(F.rect(1.14, .07, .03), plas, [.02, .95, .03], g, { tinta: .012, papel: false });
    linea([[-.5, .95], [-.72, 1.18]], .035, met, g, .0); pz(F.rect(.1, .2, .04), plas, [-.76, 1.22, .02], g, { tinta: .012, papel: false, rot: -.6 });
    linea([[-.38, .35], [-.42, .12], [.42, .12], [.45, .35]], .03, met, g, .0);
    g.ruedas = [-.35, .36].map(x => { const r = group([x, .08, .04], g); pz(F.circ(.08), 0x3a3550, [0, 0, 0], r, { tinta: .01, papel: .03 }); det(F.rect(.1, .025, .01), 0x8a86a0, [0, 0, .014], r); return r; });
    sombraPiso(g, .6); g.carga = group([0, .92, -.04], g);
    g.rueda = (t, vel = 1) => g.ruedas.forEach(r => r.rotation.z = -t * vel * 6); return g; }
  // caja/regalo de cartulina para llenar carritos: o: {moño, color2}
  function caja(pos, w, h, color, parent, o = {}) { const g = pz(F.rect(w, h, .03), color, pos, parent, { tinta: .014, papel: .04 });
    if (o.mono !== false) { det(F.rect(.06, h, .01), o.color2 ?? 0xffffff, [0, 0, .016], g); det(F.rect(w, .06, .01), o.color2 ?? 0xffffff, [0, 0, .017], g); } return g; }
  // vestido de cartulina colgado de un gancho (g.mece(t))
  function vestido(pos, color, parent = null, o = {}) { const g = group(pos, parent);
    linea([[-.24, -.02], [0, .12], [.24, -.02]], .02, 0x8a6a4a, g, -.02); linea([[0, .12], [0, .2], [.05, .25], [.08, .2]], .02, 0x8a6a4a, g, -.02);
    pz(F.poly([[-.17, 0], [-.07, 0], [0, -.06], [.07, 0], [.17, 0], [.15, -.3], [.1, -.38], [.36, -1.0], [-.36, -1.0], [-.1, -.38], [-.15, -.3]]), color, [0, 0, 0], g, { tinta: .016, papel: .05 });
    det(F.rect(.26, .06, .01), osc(color, .78), [0, -.4, .016], g);
    for (const [x, y] of [[-.15, -.6], [.1, -.55], [-.02, -.75], [.2, -.85], [-.22, -.88], [0, -.25]]) det(F.circ(.03), 0xfff8ec, [x, y, .017], g);
    g.mece = (t, f = 0) => g.rotation.z = Math.sin(t * 2 + f) * .04; return g; }
  const formaRinon = (r = .4) => blob([[-r * .55, r * .95], [r * .25, r * 1.0], [r * .8, r * .55], [r * .9, -r * .2], [r * .55, -r * .9], [-r * .2, -r * 1.0], [-r * .62, -r * .6], [-r * .35, -r * .15], [-r * .35, r * .25], [-r * .75, r * .5]]);
  const formaVejiga = (r = .5) => blob([[-r * .25, r * .95], [r * .25, r * .95], [r * .8, r * .6], [r * .95, 0], [r * .7, -r * .6], [r * .15, -r * .95], [-r * .15, -r * .95], [-r * .7, -r * .6], [-r * .95, 0], [-r * .8, r * .6]]);

  const A = {
    // cejas preocupadas (k 0→1) y gota de sudor opcional en chibis: nervioso, aguantando, frío
    preocupa(g, k) { (g.head?.cejas ?? []).forEach(c => { c.rotation.z = -c.sx * (.12 + .38 * k); c.position.y = .16 + .03 * k; }); },
    // temblar de frío
    tiembla(g, t, k = 1, x0 = g.position.x) { g.position.x = x0 + Math.sin(t * 60) * .025 * k; },
    // camina (mascota de perfil o chibi): patas/piernas alternadas + rebote + brazos
    anda(g, t, on = 1, y0 = .02) { const s = Math.sin(t * 11) * on;
      if (g.patas && g.patas.length >= 4) [0, Math.PI, Math.PI, 0].forEach((f, i) => g.patas[i].rotation.z = Math.sin(t * 11 + f) * .38 * on);
      if (g.piernas) { g.piernas[0].rotation.z = g.piernas[0].r0 + s * .32; g.piernas[1].rotation.z = g.piernas[1].r0 - s * .32; }
      if (g.brazos) { g.brazos[0].rotation.z = g.brazos[0].r0 - s * .35; g.brazos[1].rotation.z = g.brazos[1].r0 - s * .35; }
      g.position.y = y0 + Math.abs(Math.sin(t * 11)) * .06 * on; if (g.head) g.head.rotation.z = g.head.r0 + Math.sin(t * 11) * .04 * on; },
    // cola: vel (rad/s), amp, sesgo (hacia dónde se carga)
    cola(g, t, vel = 14, amp = .35, sesgo = 0) { if (g.cola) g.cola.rotation.z = sesgo + Math.sin(t * vel) * amp; },
    // parpadeo cada ~3.2 s (fase distinta por personaje)
    parpadea(g, t, fase = 0) { const k = ((t + fase) % 3.2) < .1 ? .12 : 1; (g.head?.ojos ?? []).forEach(e => e.scale.y = k); },
    // orejas: 0 = normales, 1 = hacia atrás (nervioso)
    orejas(g, k) { (g.head?.orejas ?? []).forEach(e => { const sx = Math.sign(e.position.x) || 1; e.rotation.z = e.r0 + sx * .55 * k; e.scale.y = 1 - .25 * k; }); },
    // vuelta de cartulina: k 0→1 (a la mitad queda de canto); dir0 = orientación inicial (1 | -1)
    voltea(g, k, dir0 = 1) { const c = Math.cos(Math.min(1, Math.max(0, k)) * Math.PI); g.scale.x = (g.es ?? 1) * dir0 * (Math.abs(c) < .04 ? .04 * (Math.sign(c) || 1) : c); },
    // saludo con el brazo derecho de un chibi
    saluda(p, t) { p.brazos[1].rotation.z = 2.5 + Math.sin(t * 12) * .3; },
    // ladear la cabeza (k 0→1, lado 1 = hacia la derecha de la pantalla): el gesto de "¿qué dijiste?"
    ladea(g, k, lado = 1) { if (g.head) g.head.rotation.z = g.head.r0 - lado * .42 * k; if (g.head) g.head.position.x = (g.head.x0 ??= g.head.position.x) + lado * .06 * k; },
  };
  // ---- labios y bálsamo (13-nov-2026 18:00, short de los labios partidos) ----
  // PM.labios(pos, s, padre): labios grandes de cartulina para lupas/acercamientos. g.seca(k 0..1) los pone pálidos y abre grietas;
  // g.brillo.visible = true muestra el brillo del bálsamo.
  function labios(pos, s = 1, padre = null, o = {}) { const g = group(pos, padre); g.scale.setScalar(s); const col = o.color ?? 0xe8707e;
    const sup = pz(blob([[-.55, -.02], [-.35, .12], [-.12, .2], [0, .14], [.12, .2], [.35, .12], [.55, -.02], [.2, -.04], [0, -.02], [-.2, -.04]]), col, [0, .02, 0], g, { tinta: .014, papel: false });
    const inf = pz(blob([[-.55, -.02], [-.2, -.06], [0, -.05], [.2, -.06], [.55, -.02], [.36, -.18], [0, -.27], [-.36, -.18]]), col, [0, -.02, 0], g, { tinta: .014, papel: false });
    const lin = det(tubo([[-.52, 0], [-.2, -.035], [0, -.025], [.2, -.035], [.52, 0]], .018, .018), 0x8a2a3a, [0, 0, .02], g);
    const own = (grp, op) => { const m = grp.children[0]; m.material = m.material.clone(); if (op !== undefined) { m.material.transparent = true; m.material.opacity = op; } return m; };   // material propio (M() se comparte)
    own(det(F.elipse(.14, .035), 0xffffff, [-.12, -.15, .02], g), .45);
    g.grietas = group([0, 0, .025], g); for (const [x, y, a, l] of [[-.32, .08, .2, .1], [-.1, .12, -.15, .08], [.22, .1, .1, .1], [-.25, -.14, -.1, .11], [.05, -.18, .15, .1], [.3, -.12, -.2, .09]])
      det(tubo([[0, l / 2], [.015, 0], [-.01, -l / 2]], .012, .006), 0x6a1f2a, [x, y, 0], g.grietas, a);
    g.escamas = group([0, 0, .028], g); for (const [x, y] of [[-.4, .03], [.12, .15], [.38, -.06], [-.15, -.2]]) det(F.poly([[0, .03], [.04, 0], [0, -.02], [-.03, 0]]), 0xf6d5d0, [x, y, 0], g.escamas);
    g.brillo = group([0, 0, .03], g); for (const [x, y, rx] of [[-.2, .12, .1], [.22, .12, .08], [.05, -.17, .16]]) own(det(F.elipse(rx, .03), 0xffffff, [x, y, 0], g.brillo), .8); g.brillo.visible = false;
    const ms = [own(sup), own(inf)], c0 = new THREE.Color(col), cs = new THREE.Color(o.colorSeco ?? 0xd9a3a3);
    g.seca = (k) => { ms.forEach(m => m.material.color.copy(c0).lerp(cs, k)); g.grietas.visible = k > .25; g.grietas.scale.setScalar(.4 + .6 * cl01((k - .25) / .6)); g.escamas.visible = k > .5; };
    g.seca(o.seca ?? 0); return g; }
  const cl01 = v => Math.max(0, Math.min(1, v));
  // PM.balsamo(pos, padre): barrita de bálsamo de cartulina (tapa aparte en g.tapa)
  function balsamo(pos, padre = null, o = {}) { const g = group(pos, padre); const c = o.color ?? 0x2ec4a6;
    pz(F.rect(.16, .34, .05), c, [0, 0, 0], g, { tinta: .014, papel: .04 }); det(F.rect(.16, .07, .02), 0xffffff, [0, .02, .03], g);
    pz(F.rect(.12, .12, .04), 0xff8fa6, [0, .23, -.01], g, { tinta: .012, papel: .03 }); det(F.rect(.025, .1, .01), 0xffffff, [-.03, .23, .02], g);
    g.tapa = pz(F.rect(.17, .16, .05), osc(c, .85), [0, .25, .04], g, { tinta: .014, papel: .04 }); return g; }
  return { labios, balsamo, chibi, diorama, pz, det, perroPM, gatoPM, A, ondas, pelota, pregunta, espacio, astro, marca, letrero, comentario, bufanda, copos, lupa, formaRinon, formaVejiga, precio, carrito, caja, vestido };
}
