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
  // ---- calendario de pared (13-nov-2026 21:30, short del viernes 13) ----
  // hoja de calendario de cartulina con espiral arriba, encabezado de color con el día y número grande.
  // o: {w, h, color (encabezado), fondo, tinta, numColor}. g.texto(dia, num) cambia lo impreso (úsalo a la mitad de una vuelta con scale.x = |cos|); g.columpia(t, amp)
  function calendario(pos, dia, num, o = {}, parent = null) {
    const g = group(pos, parent), w = o.w ?? 1.1, hh = o.h ?? 1.25, cab = hh * .27, col = o.color ?? 0xff6b5b, fon = o.fondo ?? 0xfff8ec;
    pz(F.rect(w, hh, .06), fon, [0, 0, 0], g, { tinta: .016, papel: .06 });
    pz(F.rect(w - .06, cab, .03), col, [0, hh / 2 - cab / 2 - .03, .016], g, { tinta: false, papel: false });
    for (let i = 0; i < 5; i++) { const x = -w * .36 + i * w * .18; det(F.circ(.035), INK, [x, hh / 2 - .07, .03], g); pz(F.rect(.035, .16, .017), 0xb9bfcc, [x, hh / 2 + .01, .045], g, { tinta: .008, papel: false }); }
    const mk = (txt, ww, h2, f, ti, y) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(ww, h2), new THREE.MeshStandardMaterial({ map: textoTx(txt, ww, h2, f, ti), roughness: 1, metalness: 0 })); m.position.set(0, y, .04); m.receiveShadow = true; g.add(m); return m; };
    const md = mk(dia, w - .2, cab * .62, col, o.tintaCab ?? '#ffffff', hh / 2 - cab / 2 - .05);
    const mn = mk(String(num), w - .2, hh - cab - .2, fon, o.numColor ?? '#1f1b2e', -cab / 2 - .02);
    const cambia = (m, txt, ww, h2, f, ti) => { m.material.map.dispose(); m.material.map = textoTx(txt, ww, h2, f, ti); m.material.needsUpdate = true; };
    g.texto = (d2, n2) => { cambia(md, d2, w - .2, cab * .62, col, o.tintaCab ?? '#ffffff'); if (n2 !== undefined) cambia(mn, String(n2), w - .2, hh - cab - .2, fon, o.numColor ?? '#1f1b2e'); };
    g.columpia = (t, amp = .04) => g.rotation.z = Math.sin(t * 2.4) * amp; return g; }

  // ---- arenero, tierrita y olor (14-nov-2026 13:30, short del arenero) ----
  // PM.arenero(pos, o): arenero de cartulina visto de frente (charola con arena en montoncito y huellita). o: {w, color, arena}
  // g.topY = altura de la arena (para parar al gato encima: y = pos.y + g.topY - .05); g.frente se puede ocultar.
  function arenero(pos, o = {}) { const g = group(pos), w = o.w ?? 1.7, col = o.color ?? 0x2ec4a6, ar = o.arena ?? 0xf1d59a;
    pz(F.rect(w * .96, .14, .05), osc(col, .78), [0, .36, -.16], g, { tinta: .016, papel: .06 });                                             // borde de atrás
    pz(blob([[-w * .46, .26], [-w * .3, .42], [-w * .1, .47], [w * .12, .46], [w * .32, .41], [w * .46, .26]]), ar, [0, 0, -.08], g, { tinta: .014, papel: false });   // arena
    for (const [x, y] of [[-.42, .36], [-.12, .41], [.18, .4], [.44, .34], [-.28, .3], [.3, .3]]) det(F.circ(.022), osc(ar, .8), [x * w / 1.7, y, -.06], g);
    g.frente = pz(F.poly([[-w / 2, .4], [w / 2, .4], [w / 2 - .08, 0], [-w / 2 + .08, 0]]), col, [0, 0, .06], g, { tinta: .018, papel: .07 });
    det(F.rect(w * .82, .035, .015), osc(col, 1.18), [0, .33, .016], g.frente);
    const hu = group([w * .28, .17, .018], g.frente); det(F.elipse(.07, .055), 0xffffff, [0, -.03, 0], hu); for (const [x, y] of [[-.07, .05], [-.025, .08], [.025, .08], [.07, .05]]) det(F.circ(.025), 0xffffff, [x, y, 0], hu);
    g.topY = .45; sombraPiso(g, w * .45); return g; }
  // PM.tierrita(pos, color, n, padre): granitos (arena, tierra, pasto) que salen disparados en arco. g.update(t, on, dir = 1, alto = .55, largo = .8)
  function tierrita(pos, color = 0xf1d59a, n = 9, parent = null) { const g = group(pos, parent);
    g.gr = Array.from({ length: n }, (_, i) => { const c = pz(i % 3 === 2 ? F.rect(.05, .1, .02) : F.circ(.035 + (i % 3) * .012), i % 4 === 3 ? osc(color, .8) : color, [0, 0, .1], g, { tinta: .01, papel: .025 }); c.visible = false; return c; });
    g.update = (t, on = 1, dir = 1, alto = .55, largo = .8) => g.gr.forEach((c, i) => { const k = (t * 1.7 + i / n) % 1; c.visible = on > 0 && k < .92;
      c.position.set(dir * k * largo * (.55 + (i % 4) * .15), Math.sin(k * Math.PI) * alto * (.6 + (i % 3) * .2) - k * .12, .1); c.rotation.z = k * 6 + i; c.scale.setScalar(on * (1 - k * .5)); });
    return g; }
  // PM.olor(pos, color, padre): nubecitas de olor de cartulina que suben ondulando y se desvanecen. g.update(t, on, deriva)
  function olor(pos, color = 0xc7e88a, parent = null) { const g = group(pos, parent);
    g.nb = [0, 1, 2].map(i => { const c = pz(F.nube(.3), color, [0, 0, .1], g, { tinta: .012, papel: .04 }); for (const dx of [-.08, .08]) linea([[dx, .02], [dx + .03, .07]], .012, osc(color, .7), c, .016); c.visible = false; return c; });
    g.update = (t, on = 1, deriva = 0) => g.nb.forEach((c, i) => { const k = (t * .55 + i / 3) % 1; c.visible = on > 0;
      c.position.set(Math.sin(k * 7 + i * 2) * .12 + deriva * k + (i - 1) * .18, k * .9, .1); c.scale.setScalar(on * Math.sin(Math.min(1, k * 1.15) * Math.PI) * .95 + .02); });
    return g; }
  // PM.tapete(pos, o): tapete entrenador para perro (cuadro acolchado con puntadas y huellita). o: {w, color}
  function tapete(pos, o = {}) { const g = group(pos), w = o.w ?? 1.5, col = o.color ?? 0x8fd3ff;
    pz(F.poly([[-w / 2 + .12, .14], [w / 2 - .12, .14], [w / 2, 0], [-w / 2, 0]]), col, [0, 0, 0], g, { tinta: .016, papel: .06 });
    for (let i = 1; i < 4; i++) det(F.rect(.02, .1, .01), 0xffffff, [-w / 2 + i * w / 4, .07, .016], g);
    det(F.rect(w * .9, .02, .01), 0xffffff, [0, .07, .016], g); return g; }
  // escarbar con la patita delantera (gato de perfil): k 0→1
  A.escarba = (g, t, k = 1) => { if (g.patas && g.patas[3]) g.patas[3].rotation.z = k * (.35 + Math.sin(t * 15) * .55); if (g.patas && g.patas[1]) g.patas[1].rotation.z = k * (.2 + Math.sin(t * 15 + Math.PI) * .35);
    if (g.head) g.head.rotation.z = g.head.r0 - .22 * k; };
  // rascar el piso con las patas de ATRÁS (perro de perfil, después de ir al baño): k 0→1
  A.rasca = (g, t, k = 1) => { if (g.patas && g.patas[2]) g.patas[2].rotation.z = -k * (.35 + (.5 + .5 * Math.sin(t * 17)) * .6); if (g.patas && g.patas[0]) g.patas[0].rotation.z = -k * (.3 + (.5 + .5 * Math.sin(t * 17 + Math.PI)) * .5);
    g.rotation.z = -.07 * k; };
  // PM.meteoro(pos, r, o): piedrita espacial (estrella fugaz) de cartulina con carita, fuego y estela. Viaja hacia +x local (rota el grupo).
  //   g.arde(k 0→1): fuego y estela crecen; g.roca = astro con carita (cara/parpadea); g.titila(t) hace temblar el fuego. o: {L (largo de estela), cara, color}
  function meteoro(pos, r = .25, o = {}) { const g = group(pos); const L = o.L ?? 1.6;
    g.estela = group([0, 0, -.12], g);
    pz(F.poly([[0, r * .95], [-L * .35, r * .55], [-L, 0], [-L * .35, -r * .55], [0, -r * .95]]), 0xffc83d, [0, 0, 0], g.estela, { tinta: .014, papel: .05 });
    det(F.poly([[0, r * .55], [-L * .5, r * .2], [-L * .8, 0], [-L * .5, -r * .2], [0, -r * .55]]), 0xfff6c0, [0, 0, .016], g.estela);
    g.fuego = group([0, 0, -.06], g); pz(F.estrella(11, r * 1.45, r * 1.12), 0xff8a3d, [0, 0, 0], g.fuego, { tinta: .014, papel: .05 }); det(F.estrella(11, r * 1.2, r * .98), 0xffc83d, [0, 0, .016], g.fuego);
    g.roca = astro([0, 0, 0], r, o.color ?? 0x9a8f86, { irregular: true, semilla: o.semilla ?? 5, sombra: 0x7a7068, cara: o.cara ?? true, papel: .05 }); g.add(g.roca); g.roca.position.set(0, 0, .02);
    g.arde = (k = 1) => { const a = Math.max(.001, k); g.fuego.scale.setScalar(a); g.estela.scale.set(a, Math.max(.001, .4 + .6 * k), 1); g.fuego.visible = g.estela.visible = k > .01; };
    g.titila = t => { g.fuego.rotation.z = t * 4; g.fuego.children.forEach((c, i) => c.scale.setScalar(1 + Math.sin(t * 20 + i) * .05)); };
    g.arde(o.arde ?? 1); return g; }

  // ================= PIEL CHINITA (14-nov-2026 21:30) =================
  const lerp = (a, b, k) => a + (b - a) * k;
  // corte de piel de cartulina para meter en una lupa: capa de piel, pelito y su musculito (erector).
  // g.eriza(k) 0→1: el músculo se encoge (más gordo y corto), el pelito se para y sale el bultito. g.musculo / g.pelo / g.bulto para etiquetar.
  function pielChinita(pos, s = 1, padre = null, o = {}) { const g = group(pos, padre); g.scale.setScalar(s); const piel = o.piel ?? 0xe8b48c;
    pz(F.rect(.92, .42, .1), o.dermis ?? 0xf3c9b4, [0, -.3, 0], g, { tinta: .012, papel: false });                       // capa de adentro
    for (const [x, y] of [[-.3, -.42], [.28, -.38], [.36, -.2], [-.36, -.2]]) det(F.circ(.025), 0xe39a8a, [x, y, .015], g);
    g.bulto = group([0, .1, -.004], g); pz(F.elipse(.24, .17), piel, [0, 0, 0], g.bulto, { tinta: .012, papel: false });
    pz(F.rect(1.12, .2, .05), piel, [0, .02, .002], g, { tinta: .012, papel: false });                                   // capa de arriba
    det(F.rect(1.0, .025, .01), osc(piel, .88), [0, -.05, .016], g);
    g.pelo = group([0, -.22, .03], g); pz(tubo([[0, 0], [.01, .25], [-.02, .5], [.02, .62]], .045, .03), o.colPelo ?? 0x3a2416, [0, 0, 0], g.pelo, { tinta: .01, papel: false });
    det(F.elipse(.07, .09), 0xd98f7a, [0, -.23, .02], g);                                                                    // raíz
    g.musculo = group([-.17, -.24, .035], g); pz(F.elipse(.2, .055), o.colMusculo ?? 0xff6b5b, [0, 0, 0], g.musculo, { tinta: .012, papel: false });
    for (const x of [-.1, 0, .1]) det(F.rect(.012, .07, .005), osc(o.colMusculo ?? 0xff6b5b, .7), [x, 0, .014], g.musculo);
    g.musculo.rotation.z = -.35;
    g.eriza = (k) => { const e = cl01(k); g.pelo.rotation.z = lerp(-1.05, 0, e); g.bulto.scale.set(1, Math.max(.001, e), 1); g.bulto.position.y = .02 + .13 * e;
      g.musculo.scale.set(lerp(1, .72, e), lerp(1, 1.55, e), 1); g.musculo.position.x = lerp(-.17, -.12, e); };
    g.eriza(o.k ?? 0); return g; }
  // pelaje de cartulina alrededor de un chibi (antepasado peludo, disfraz): mechones que se esponjan con f.eriza(k) y bolitas de aire calientito (f.aire)
  function pelaje(p, color = 0x8a5a3a, o = {}) { const f = group([0, 0, -.02], p); const ms = []; let sm = 5; const rnd = () => (sm = (sm * 16807) % 2147483647) / 2147483647;
    const pts = [[-.42, .7], [-.45, .95], [-.4, 1.2], [-.3, 1.35], [.42, .7], [.45, .95], [.4, 1.2], [.3, 1.35], [-.6, 1.65], [-.55, 1.95], [-.35, 2.15], [0, 2.22], [.35, 2.15], [.55, 1.95], [.6, 1.65], [-.25, .55], [.25, .55]];
    for (const [x, y] of pts) { const a = Math.atan2(y - (y > 1.45 ? 1.66 : .95), x); const m = group([x, y, 0], f); m.rotation.z = a - Math.PI / 2;
      pz(F.poly([[-.11, 0], [0, .2 + rnd() * .06], [.11, 0]]), color, [0, 0, 0], m, { tinta: .012, papel: .03 }); m.i = ms.length; ms.push(m); }
    f.aire = [[-.62, 1.05], [.62, 1.0], [-.75, 1.85], [.75, 1.8], [0, 2.45]].map(([x, y], i) => { const b = pz(F.circ(.07), 0xffa94d, [x, y, .3], p, { tinta: .01, papel: false }); b.i = i; b.x0 = x; b.y0 = y; b.visible = false; return b; });
    f.eriza = (k, t = 0) => { const e = cl01(k); ms.forEach(m => m.scale.set(1, .55 + .75 * e + Math.sin(t * 6 + m.i) * .04 * e, 1)); };
    f.calienta = (k, t = 0) => f.aire.forEach(b => { b.visible = k > 0; b.scale.setScalar(Math.max(.001, cl01(k * 2 - b.i * .2)) * (1 + .12 * Math.sin(t * 4 + b.i))); b.position.set(b.x0 + Math.sin(t * 2 + b.i) * .03, b.y0 + Math.sin(t * 2.6 + b.i * 2) * .03, .3); });
    f.eriza(o.k ?? 0); return f; }
  // notas musicales de cartulina que suben flotando: { update(t, on) }. o: {n, x, y, ancho, alto, color}
  function notas(o = {}) { const n = o.n ?? 4, cols = [0x7b5cff, 0xff6b5b, 0x2ec4a6, 0xffc83d]; const ns = [];
    for (let i = 0; i < n; i++) { const g = group([0, 0, .7]); const c = o.color ?? cols[i % 4];
      pz(F.elipse(.09, .07), c, [0, 0, 0], g, { tinta: .012, papel: .03, rot: .3 }); pz(F.rect(.03, .3, .01), c, [.075, .15, .002], g, { tinta: .01, papel: .03 });
      if (i % 2) pz(F.poly([[.06, .3], [.2, .2], [.2, .14], [.06, .22]]), c, [0, 0, .003], g, { tinta: .01, papel: .03 }); g.i = i; ns.push(g); }
    return { ns, update(t, on = 1) { ns.forEach(g => { const k = (t * .45 + g.i / n) % 1; g.visible = on > 0 && k > .02 && k < .98; g.position.set((o.x ?? 0) + (g.i / Math.max(1, n - 1) - .5) * (o.ancho ?? 1) + Math.sin(t * 2 + g.i) * .08, (o.y ?? 1.5) + k * (o.alto ?? .8), .7); g.rotation.z = Math.sin(t * 3 + g.i) * .2; g.scale.setScalar(Math.sin(k * Math.PI) * .9 + .05); }); } }; }
  // ================= RECÁMARA Y SUEÑO (15-nov 18:00, short de dormir de más) =================
  // CUARTO interior: pared con zoclo, piso de duela, ventana con cortinas y cuadrito. o: {pared, piso, ventana:[x,y], noche, sinVentana}
  //   devuelve { ventana, update(t) }; ventana.abre(k 0→1) corre las cortinas y prende el sol/rayos (de día).
  function cuarto(o = {}) {
    const PAR = o.pared ?? 0xf6d7b8, PIS = o.piso ?? 0xc98f5e;
    pz(F.rect(30, 30, 0), PAR, [0, 15, -3], null, { tinta: false, papel: false });
    for (let i = -12; i <= 12; i++) det(F.rect(.05, 30, 0), osc(PAR, .965), [i * .55, 15, -2.99]);           // rayitas del tapiz
    pz(F.rect(30, .16, 0), 0xffffff, [0, .08, -2.97], null, { tinta: false, papel: false });                   // zoclo
    pz(F.rect(30, 6, 0), PIS, [0, -3, -1.7], null, { tinta: false, papel: false });                           // piso
    for (let i = -14; i < 14; i++) { det(F.rect(.025, 6, 0), osc(PIS, .82), [i * .5, -3, -1.69]); det(F.rect(.5, .02, 0), osc(PIS, .86), [i * .5 + .25, -.6 - (i & 1) * .5, -1.68]); }
    // cuadrito con montañas
    const cu = group(o.cuadro ?? [1.35, 1.7, -2.6]); pz(F.rect(.62, .5, .03), 0xff6b5b, [0, 0, 0], cu, { tinta: .014, papel: .04 }); pz(F.rect(.5, .38, .02), 0xbfe3f5, [0, 0, .016], cu, { tinta: false, papel: false });
    det(F.poly([[-.25, -.19], [-.06, .08], [.08, -.06], [.16, .02], [.25, -.19]]), 0x2ec4a6, [0, 0, .03], cu); det(F.circ(.05), 0xffc83d, [.14, .1, .03], cu);
    let ventana = null;
    if (!o.sinVentana) { const v = ventana = group(o.ventana ? [...o.ventana, -2.5] : [-1.0, 1.75, -2.5]); const W = o.vw ?? 1.1, H = o.vh ?? 1.05;
      pz(F.rect(W + .14, H + .14, .04), 0xffffff, [0, 0, 0], v, { tinta: .016, papel: .05 });
      const cielo = pz(F.rect(W, H, .02), o.noche ? 0x2a3270 : 0x8fd3ff, [0, 0, .016], v, { tinta: false, papel: false });
      v.astro = group([W * .18, H * .14, .03], v);
      if (o.noche) { pz(F.circ(.17), 0xfff2a8, [0, 0, 0], v.astro, { tinta: .01, papel: false }); det(F.circ(.15), 0x2a3270, [.08, .05, .004], v.astro); for (const [x, y] of [[-.35, .3], [-.2, -.25], [.3, -.3]]) det(F.estrella(5, .05, .022), 0xffffff, [x - W * .18, y, .01], v.astro); }
      else { v.rayos = pz(F.estrella(12, .3, .21), 0xffa53d, [0, 0, 0], v.astro, { tinta: .01, papel: false }); pz(F.circ(.19), 0xffd640, [0, 0, .01], v.astro, { tinta: .01, papel: false });
        det(F.nube(.22), 0xffffff, [-W * .38, -H * .2, .02], v); }
      pz(F.rect(.05, H, 0), 0xffffff, [0, 0, .04], v, { tinta: .01, papel: false }); pz(F.rect(W, .05, 0), 0xffffff, [0, 0, .045], v, { tinta: .01, papel: false });
      pz(F.rect(W + .5, .09, .04), 0x8a6a4a, [0, H / 2 + .14, .07], v, { tinta: .012, papel: .03 });                         // barra
      const col = o.cortina ?? 0x7b5cff; v.cort = [-1, 1].map(sx => { const c = group([sx * W * .25, .02, .09], v); pz(F.rect(W * .54, H + .2, .03), col, [0, 0, 0], c, { tinta: .014, papel: .04 });
        for (const x of [-.16, 0, .16]) det(F.rect(.035, H + .15, .01), osc(col, .82), [x * W * .9, 0, .016], c); c.sx = sx; return c; });
      // haz de luz que entra (solo de día)
      v.haz = det(F.poly([[-W * .45, -H * .5], [W * .45, -H * .5], [W * 1.4, -H * 2.3], [-W * .2, -H * 2.3]]), 0xfff2b0, [0, 0, .5], v); v.haz.children[0].material = v.haz.children[0].material.clone(); v.haz.children[0].material.transparent = true; v.haz.children[0].material.depthWrite = false;
      v.abre = (k, t = 0) => { v.cort.forEach(c => { c.position.x = c.sx * W * (.25 + .5 * k); c.scale.x = 1 - .45 * k; });
        v.haz.visible = !o.noche && k > .05; v.haz.children[0].material.opacity = .35 * k;
        if (v.rayos) { v.rayos.rotation.z = t * .6; v.astro.scale.setScalar(.6 + .4 * k); } };
      v.abre(o.abierta ?? 0); }
    return { ventana, update(t) { if (ventana?.rayos) ventana.rayos.rotation.z = t * .6; } };
  }
  // CAMA de lado (cabecera a la izquierda). o: {w, color (cobija), cabecera}. g.cobija (se puede bajar), g.topY = colchón.
  function cama(pos, o = {}, parent = null) { const g = group(pos, parent), w = o.w ?? 2.6, cab = o.cabecera ?? 0x8a5a3a, col = o.color ?? 0x2ec4a6;
    pz(F.rect(.16, 1.35, .05), cab, [-w / 2 - .02, .67, -.25], g, { tinta: .016, papel: .05 });                  // cabecera
    pz(F.rect(.14, .7, .05), cab, [w / 2 + .02, .35, -.25], g, { tinta: .016, papel: .05 });                     // piecera
    pz(F.rect(w, .2, .04), osc(cab, 1.1), [0, .32, -.24], g, { tinta: .014, papel: .04 });                        // base
    pz(F.rect(w - .05, .26, .08), 0xffffff, [0, .54, -.22], g, { tinta: .014, papel: .04 });                     // colchón
    for (const sx of [-1, 1]) pz(F.rect(.1, .22, .03), cab, [sx * (w / 2 - .15), .12, -.23], g, { tinta: .012, papel: .03 });   // patas
    g.almohada = pz(blob([[-.32, -.12], [-.36, .05], [-.22, .16], [.22, .16], [.36, .05], [.32, -.12], [0, -.16]]), 0xfff6e0, [-w / 2 + .45, .78, -.2], g, { tinta: .014, papel: .04 });
    g.cobija = group([w * .12, .62, .35], g);   // EN FRENTE del chibi acostado
    pz(blob([[-w * .36, .28], [w * .38, .26], [w * .42, -.28], [-w * .38, -.3]]), col, [0, 0, 0], g.cobija, { tinta: .016, papel: .05 });
    for (let i = 0; i < 4; i++) det(F.rect(.07, .52, .01), osc(col, .8), [-w * .26 + i * w * .19, 0, .016], g.cobija);
    det(F.rect(w * .76, .07, .01), 0xffffff, [0, .2, .018], g.cobija);
    g.topY = .67; return g; }
  // acuesta a un chibi en una cama: devuelve un pivote en la cadera; piv.sienta(k) 0 = acostado, 1 = sentado. El chibi conserva sus métodos.
  function acuesta(p, c, x = -.25) { const es = p.es ?? 1, piv = group([x, c.topY + .05, .0], c); piv.add(p); p.position.set(0, -.55 * es, 0);
    piv.sienta = k => { piv.rotation.z = Math.PI / 2 * (1 - k) * 1.0; piv.position.y = c.topY + .05 + .12 * (1 - k); piv.position.x = x + (1 - k) * .1; }; piv.sienta(0); return piv; }
  // ojos: k = 1 abiertos, .45 adormilado, .1 cerrados (respeta el parpadeo si se llama después de A.parpadea con Math.min)
  const ojos = (p, k) => (p.head?.ojos ?? []).forEach(e => e.scale.y = Math.min(e.scale.y, k));
  // DESPERTADOR de cartulina con campanitas: g.hora(h), g.suena(t, k) (tiembla y salen rayitas)
  function despertador(pos, r = .45, o = {}, parent = null) { const g = group(pos, parent), col = o.color ?? 0xff6b5b;
    g.cuerpo = group([0, 0, 0], g);
    for (const sx of [-1, 1]) { pz(F.circ(r * .32), 0xffc83d, [sx * r * .62, r * .82, -.05], g.cuerpo, { tinta: .014, papel: .04 }); pz(F.rect(.06, r * .5, .02), INK, [sx * r * .55, -r * .95, -.05], g.cuerpo, { tinta: false, papel: .03, rot: sx * .4 }); }
    pz(F.circ(r), col, [0, 0, 0], g.cuerpo, { tinta: .018, papel: .06 }); pz(F.circ(r * .8), 0xfffaf0, [0, 0, .016], g.cuerpo, { tinta: .01, papel: false });
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; det(F.rect(k % 3 ? .025 : .045, k % 3 ? .06 : .1, .01), INK, [Math.sin(a) * r * .66, Math.cos(a) * r * .66, .03], g.cuerpo, -a); }
    const mano = (L, w) => { const m = group([0, 0, .045], g.cuerpo); det(F.rect(w, L, w / 2), INK, [0, L / 2 - .03, 0], m); return m; };
    g.hor = mano(r * .38, .06); g.min = mano(r * .56, .04); det(F.circ(.04), col, [0, 0, .06], g.cuerpo);
    g.rayas = [-1, 1].map(sx => { const ry = group([sx * r * 1.25, r * .55, .05], g); [0, 1, 2].forEach(i => det(F.rect(.05, .2, .02), 0xffc83d, [sx * i * .02, (i - 1) * .2, 0], ry, sx * (i - 1) * -.5)); ry.visible = false; return ry; });
    g.hora = h => { g.hor.rotation.z = -(h % 12) / 12 * Math.PI * 2; g.min.rotation.z = -(h % 1) * Math.PI * 2; };
    g.suena = (t, k) => { g.cuerpo.rotation.z = Math.sin(t * 50) * .12 * k; g.cuerpo.position.y = Math.abs(Math.sin(t * 25)) * .04 * k; g.rayas.forEach(ry => { ry.visible = k > .1; ry.scale.setScalar(.8 + .3 * Math.abs(Math.sin(t * 12))); }); };
    g.hora(o.h ?? 7); return g; }
  // FOCO de idea / cerebro que se prende: g.prende(k 0→1, t) (gris → amarillo con rayitos)
  function foco(pos, r = .35, parent = null) { const g = group(pos, parent);
    g.rayos = group([0, r * .15, -.06], g); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; pz(F.rect(.06, r * .4, .03), 0xffc83d, [Math.cos(a) * r * 1.45, Math.sin(a) * r * 1.45, 0], g.rayos, { tinta: .01, papel: false, rot: a - Math.PI / 2 }); }
    g.on = pz(F.circ(r), 0xffe066, [0, r * .15, 0], g, { tinta: .016, papel: .05 }); g.off = pz(F.circ(r), 0xc9c6d6, [0, r * .15, .005], g, { tinta: .016, papel: .05 });
    det(F.arco(r * .6, .04, 2.1, 2.9), 0xffffff, [0, r * .15, .03], g);
    pz(F.rect(r * .8, r * .55, .04), 0x9aa0b4, [0, -r * .95, -.01], g, { tinta: .014, papel: .04 }); for (const y of [-.85, -1.05]) det(F.rect(r * .8, .025, .01), 0x6a7088, [0, r * y, .02], g);
    g.prende = (k, t = 0) => { g.off.visible = k < .5; g.on.visible = k >= .5; g.rayos.visible = k >= .5; g.rayos.scale.setScalar(.7 + .3 * Math.abs(Math.sin(t * 5))); };
    g.prende(0); return g; }
  // CEREBRO de cartulina con carita (astro rosa con pliegues): usa g.cara(), g.head con A.parpadea
  function cerebro(pos, r = .5, o = {}) { const g = astro(pos, r, o.color ?? 0xffa3b8, { forma: blob([[-r * 1.15, -r * .1], [-r * 1.05, r * .5], [-r * .5, r * .9], [r * .2, r * .92], [r * .85, r * .65], [r * 1.15, r * .05], [r * .95, -r * .55], [r * .3, -r * .75], [-r * .6, -r * .7]]), cara: o.cara ?? true, expr: o.expr });
    for (const [x, y, a] of [[-.7, .45, .3], [.0, .62, 1.2], [.65, .35, 2.2], [-.8, -.25, 4.8], [.75, -.3, 5.4]]) det(F.arco(r * .2, .03, a, a + 2.4), osc(o.color ?? 0xffa3b8, .75), [x * r, y * r, .016], g.cuerpo);
    return g; }
  // AVIONCITO de papel (viaje, mensaje): mira a +x
  function avion(pos, s = 1, parent = null) { const g = group(pos, parent); g.scale.setScalar(s);
    pz(F.poly([[-.5, .05], [.5, 0], [-.35, -.22]]), 0xffffff, [0, 0, 0], g, { tinta: .014, papel: .04 }); det(F.poly([[-.5, .05], [.5, 0], [-.2, .2]]), 0xdfe6f2, [0, 0, .016], g); return g; }
  // TIERRA de cartulina con continentes (sin carita por defecto)
  function tierra(pos, r = .8, o = {}) { const g = astro(pos, r, 0x4aa8ff, { cara: o.cara ?? false, sombra: 0x3a8ae0 });
    g.mapa = group([0, 0, .02], g.cuerpo); for (const [x, y, k] of [[-.4, .35, .38], [.35, .1, .3], [-.1, -.45, .28], [.55, -.45, .18]]) det(blob([[-k, 0], [-k * .6, k * .7], [k * .2, k * .8], [k, k * .1], [k * .5, -k * .7], [-k * .5, -k * .6]].map(([a, b]) => [a * r, b * r])), 0x3fbf6a, [x * r, y * r, 0], g.mapa);
    return g; }

  // CELULAR de cartulina (15-nov 21:30): pantalla con batería y porcentaje. g.pct(n) cambia la carga; g.apaga(true|false) pantalla negra;
  // g.cara(e) carita en la pantalla ('feliz'|'triste'|'ninguna'); g.frio(k) escarcha azul encima (0..1). o: {h, color, pct}
  function celular(pos, o = {}, parent = null) { const g = group(pos, parent), H = o.h ?? 1.0, W = H * .52;
    pz(F.rect(W, H, W * .16), o.color ?? 0x2b2f4a, [0, 0, 0], g, { tinta: .016, papel: .05 });
    det(F.rect(W * .28, .03, .015), 0x101322, [0, H * .44, .02], g);                                   // bocina
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = Math.round(256 * (H * .82) / (W * .84)); const x = cv.getContext('2d');
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(W * .84, H * .82), new THREE.MeshStandardMaterial({ map: tx, roughness: 1, metalness: 0, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: .35 }));
    scr.position.set(0, -H * .02, .03); g.add(scr);
    let st = { n: o.pct ?? 40, off: false }, hielo = null;
    const dibuja = () => { const w = cv.width, h = cv.height;
      scr.material.emissiveIntensity = st.off ? 0 : .35; if (hielo) hielo.visible = !st.off;
      if (st.off) { x.fillStyle = '#0d0f1a'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(255,255,255,.08)'; x.beginPath(); x.moveTo(w * .15, 0); x.lineTo(w * .55, 0); x.lineTo(w * .1, h * .45); x.lineTo(0, h * .45); x.fill(); tx.needsUpdate = true; return; }
      const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9fd8ff'); gr.addColorStop(1, '#c8b6ff'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
      const n = Math.round(st.n), col = n > 30 ? '#2ec4a6' : n > 12 ? '#ffc83d' : '#ff5b5b';
      const bw = w * .62, bh = bw * .46, bx = (w - bw) / 2, by = h * .2;                               // pila
      x.lineWidth = w * .035; x.strokeStyle = '#1f1b2e'; x.fillStyle = '#ffffff'; x.beginPath(); x.roundRect(bx, by, bw, bh, w * .05); x.fill(); x.stroke();
      x.fillStyle = '#1f1b2e'; x.fillRect(bx + bw, by + bh * .3, w * .05, bh * .4);
      x.fillStyle = col; const m = w * .04; if (n > 0) { x.beginPath(); x.roundRect(bx + m, by + m, Math.max(4, (bw - 2 * m) * n / 100), bh - 2 * m, w * .025); x.fill(); }
      x.fillStyle = '#1f1b2e'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = `900 ${w * .3}px Poppins, "Arial Black", sans-serif`; x.fillText(n + '%', w / 2, by + bh + h * .17);
      tx.needsUpdate = true; };
    g.pct = n => { if (Math.round(n) !== Math.round(st.n) || st.off) { st.n = n; st.off = false; dibuja(); } };
    g.apaga = (v = true) => { if (v !== st.off) { st.off = v; dibuja(); if (v) hielo.material.opacity = Math.min(hielo.material.opacity, .12); } };
    // carita impresa en la parte de abajo de la pantalla
    const cara = group([0, -H * .3, .036], g); const ojo = sx => { const e = group([sx * W * .13, 0, 0], cara); det(F.elipse(W * .045, W * .07), INK, [0, 0, 0], e); det(F.circ(W * .018), 0xffffff, [W * .012, W * .03, .003], e); return e; };
    g.head = cara; cara.r0 = 0; cara.ojos = [ojo(-1), ojo(1)];
    const bF = det(F.arco(W * .07, W * .025, Math.PI * 1.15, Math.PI * 1.85), 0x7a1f30, [0, -W * .02, 0], cara), bT = det(F.arco(W * .07, W * .025, Math.PI * .2, Math.PI * .8), 0x7a1f30, [0, -W * .12, 0], cara);
    const gota = det(F.gota(W * .09), 0x8fd3ff, [W * .26, W * .08, .004], cara);
    g.cara = e => { cara.visible = e !== 'ninguna'; bF.visible = e === 'feliz'; bT.visible = e === 'triste'; gota.visible = e === 'triste'; };
    hielo = new THREE.Mesh(new THREE.PlaneGeometry(W * .84, H * .82), new THREE.MeshBasicMaterial({ color: 0xdff3ff, transparent: true, opacity: 0 })); hielo.position.set(0, -H * .02, .05); g.add(hielo);
    g.frio = k => { hielo.material.opacity = k * (st.off ? .12 : .4); };
    g.cara(o.cara ?? 'ninguna'); dibuja(); return g; }
  // PILA por dentro (15-nov 21:30): iones (bolitas) que viajan de un lado a otro; g.update(t, vel) con vel 1 = normal, .15 = lenta por frío; g.frio(k) la pinta azulada
  function pilaIones(pos, o = {}, parent = null) { const g = group(pos, parent), W = o.w ?? 1.2, H = o.h ?? .62;
    pz(F.rect(W, H, .08), 0x2b2f4a, [0, 0, 0], g, { tinta: .016, papel: .05 }); pz(F.rect(.09, H * .4, .03), 0x2b2f4a, [W / 2 + .04, 0, -.01], g, { tinta: .012, papel: false });
    const dentro = pz(F.rect(W - .1, H - .1, .05), 0xfff4e4, [0, 0, .016], g, { tinta: false, papel: false });
    det(F.rect(.08, H - .14, .02), 0x9aa0b4, [-W / 2 + .12, 0, .03], g); det(F.rect(.08, H - .14, .02), 0xffb37a, [W / 2 - .12, 0, .03], g);   // electrodos
    det(F.rect(.1, .03, .01), 0xff5b5b, [W / 2 - .12, H / 2 + .07, .03], g); det(F.rect(.03, .1, .01), 0xff5b5b, [W / 2 - .12, H / 2 + .07, .032], g);   // +
    det(F.rect(.1, .03, .01), 0x3d6bff, [-W / 2 + .12, H / 2 + .07, .03], g);                                                                       // −
    const N = 7; g.iones = []; for (let i = 0; i < N; i++) { const b = group([0, 0, .04], g); pz(F.circ(.055), 0xffc83d, [0, 0, 0], b, { tinta: .01, papel: false }); det(F.rect(.05, .015, .01), INK, [0, 0, .014], b); det(F.rect(.015, .05, .01), INK, [0, 0, .016], b); b.f = i / N; b.y = ((i * 37) % 7 / 6 - .5) * (H - .26); g.iones.push(b); }
    const hielo = new THREE.Mesh(new THREE.PlaneGeometry(W - .1, H - .1), new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0 })); hielo.position.z = .07; g.add(hielo);
    let fase = 0, tPrev = null; const x0 = -W / 2 + .2, x1 = W / 2 - .2;
    g.update = (t, vel = 1) => { if (tPrev !== null) fase += Math.max(0, t - tPrev) * vel * .55; tPrev = t;
      for (const b of g.iones) { const k = (b.f + fase) % 1; b.position.x = x0 + (x1 - x0) * k; b.position.y = b.y + Math.sin((k + b.f) * 12) * .03; } };
    g.frio = k => { hielo.material.opacity = k * .5; };
    g.update(0, 0); return g; }

  // ================= CARRO, CAMINO, MAREO Y OÍDO INTERNO (16-nov-2026 13:30, short del mareo en el carro) =================
  // CARRO de cartulina de lado (mira a +x), en corte: la carrocería de abajo va DELANTE de los pasajeros y la cabina con
  // ventana DETRÁS, así se ven cabeza y hombros. o: {color, asientos:[x...], escala}. g.sube(p, x) mete un chibi sentado;
  // g.update(t, vel) gira llantas y rebota; g.topY ≈ .85 (tablero). Ancho ≈ 3.2 · escala.
  function carro(pos, o = {}) { const g = group(pos), col = o.color ?? 0xff6b5b, es = o.escala ?? 1; g.scale.setScalar(es); g.es = es;
    g.cuerpo = group([0, 0, 0], g);
    const cab = pz(blob([[-1.32, .8], [-1.2, 1.9], [-.95, 2.12], [.45, 2.14], [.78, 2.0], [1.25, .8]]), col, [0, 0, -.32], g.cuerpo, { tinta: .02, papel: .08 });
    det(blob([[-1.13, .86], [-1.03, 1.82], [-.84, 2.0], [.42, 2.02], [.66, 1.9], [1.06, .86]]), 0xc9ecff, [0, 0, .014], cab);
    det(F.poly([[.25, 1.95], [.5, 1.9], [-.1, .95], [-.35, .95]]), 0xe8f7ff, [0, 0, .016], cab);                       // reflejo
    for (const x of (o.asientos ?? [-.5])) { const a = pz(F.rect(.62, .95, .14), osc(col, .55), [x, 1.25, -.3], g.cuerpo, { tinta: .014, papel: false }); det(F.rect(.44, .7, .1), osc(col, .65), [0, .04, .014], a); }
    const bod = pz(blob([[-1.55, .3], [-1.6, .72], [-1.42, .9], [1.2, .92], [1.52, .78], [1.62, .5], [1.55, .3]]), col, [0, 0, .5], g.cuerpo, { tinta: .02, papel: .08 });
    det(blob([[-1.5, .32], [1.5, .32], [1.56, .46], [-1.55, .44]]), osc(col, .8), [0, 0, .014], bod);                    // sombra de abajo
    linea([[-.15, .38], [-.12, .86]], .02, osc(col, .6), bod, .018); det(F.rect(.2, .05, .025), osc(col, .6), [.25, .74, .018], bod); det(F.rect(.2, .05, .025), osc(col, .6), [-.6, .74, .018], bod);
    pz(F.elipse(.1, .08), 0xffe27a, [1.53, .66, .02], bod, { tinta: .012, papel: false }); pz(F.rect(.08, .14, .03), 0xff3b3b, [-1.56, .66, .02], bod, { tinta: .012, papel: false });
    det(F.rect(3.0, .06, .03), mez(col, 0xffffff, .45), [0, .82, .016], bod);                                          // filo brillante
    g.llantas = [-1.0, 1.0].map(x => { const w = group([x, .28, .62], g); pz(F.circ(.29), 0x2b2f4a, [0, 0, 0], w, { tinta: .016, papel: .05 }); pz(F.circ(.13), 0xdfe3ea, [0, 0, .016], w, { tinta: .01, papel: false });
      for (let i = 0; i < 3; i++) det(F.rect(.2, .035, .015), 0x9aa0ad, [0, 0, .032], w, i * Math.PI / 3); return w; });
    g.sube = (p, x = -.5) => { g.cuerpo.add(p); p.position.set(x, .32, 0); p.sombra && (p.sombra.visible = false); return p; };
    g.update = (t, vel = 1) => { g.llantas.forEach(w => w.rotation.z = -t * 9 * vel); g.cuerpo.position.y = Math.abs(Math.sin(t * 9)) * .025 * vel; };
    return g; }
  // CAMINO que pasa: carretera gris con rayitas, postes y arbolitos que corren hacia -x. Devuelve {update(t, vel)}. o: {y, z, ancho}
  function camino(o = {}) { const y = o.y ?? .05, z = o.z ?? -.9, W = o.ancho ?? 9;
    pz(F.rect(30, .55, 0), 0x6d7180, [0, y - .1, z], null, { tinta: false, papel: false });
    det(F.rect(30, .06, 0), 0x50535f, [0, y + .17, z + .014]);
    const ray = [], cos = [];
    for (let i = 0; i < 10; i++) ray.push(det(F.rect(.42, .07, .03), 0xfff3c4, [0, y - .1, z + .02]));
    for (let i = 0; i < 4; i++) { const c = group([0, 0, z - .35]);
      if (i % 2) { pz(F.rect(.12, .8, .03), 0x9a6a42, [0, .55, 0], c, { tinta: .016, papel: .06 }); pz(F.circ(.4), 0x4fae5a, [0, 1.1, .02], c, { tinta: .02, papel: .07 }); }
      else { pz(F.rect(.06, 1.1, .02), 0x8a8f9c, [0, .6, 0], c, { tinta: .014, papel: .05 }); pz(F.rect(.5, .32, .05), 0x2ec4a6, [0, 1.15, .02], c, { tinta: .014, papel: .05 }); det(F.rect(.3, .05, .02), 0xffffff, [0, 1.15, .04], c); }
      cos.push(c); }
    const wrap = (v, a) => ((v % a) + a) % a - a / 2;
    return { update(t, vel = 1) { ray.forEach((r, i) => r.position.x = wrap(i * .9 - t * 4 * vel, W)); cos.forEach((c, i) => c.position.x = wrap(i * W / 4 + 1.1 - t * 2.4 * vel, W)); } }; }
  // MAREO: espirales y estrellitas girando sobre la cabeza. g.update(t, k) (k 0→1 aparece)
  function mareo(pos, s = 1, parent = null) { const g = group(pos, parent); g.scale.setScalar(s);
    const pts = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 4.2, r = .03 + i / 40 * .2; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    g.esp = [-.22, .22].map((x, i) => { const e = group([x, 0, 0], g); pz(tubo(pts, .045, .045), i ? 0x7b5cff : 0x2ec4a6, [0, 0, 0], e, { tinta: .01, papel: .035 }); return e; });
    g.est = [0, 1, 2].map(i => pz(F.estrella(5, .1, .05), 0xffc83d, [0, 0, .05], g, { tinta: .012, papel: .035 }));
    g.update = (t, k = 1) => { g.visible = k > .01; g.scale.setScalar(s * Math.max(.001, k)); g.esp.forEach((e, i) => e.rotation.z = (i ? 1 : -1) * t * 5);
      g.est.forEach((e, i) => { const a = t * 3 + i * 2.1; e.position.set(Math.cos(a) * .45, Math.sin(a) * .12 + .05, .05 + Math.sin(a) * .05); e.rotation.z = t * 4; }); };
    return g; }
  // OÍDO INTERNO de cartulina (para meter en PM.lupa): tres canales en anillo con líquido azul y el caracol.
  // g.chapotea(t, k, dir): el líquido se carga hacia dir (1 | -1) con fuerza k y se mece; g.sensor = pelito-sensor que se dobla.
  function oidoInterno(pos, s = 1, padre = null) { const g = group(pos, padre); g.scale.setScalar(s); const ROSA = 0xffb3c1;
    const canales = [[-.28, .3, .26, .2], [.12, .38, .24, -.15], [-.05, .02, .22, 1.2]].map(([x, y, r, a]) => { const c = group([x, y, 0], g); c.rotation.z = a;
      pz(F.arco(r, .11, 0, Math.PI * 2), ROSA, [0, 0, 0], c, { tinta: .014, papel: .04 });
      c.liq = group([0, 0, .02], c); det(F.arco(r, .06, -.5, .5), 0x3d9bff, [0, 0, 0], c.liq); c.liq.rotation.z = -Math.PI / 2; c.r = r; return c; });
    g.canales = canales;
    pz(F.elipse(.2, .16), ROSA, [.0, -.18, .03], g, { tinta: .014, papel: .04 });
    const pts = []; for (let i = 0; i <= 50; i++) { const a = i / 50 * Math.PI * 4.5, r = .26 - i / 50 * .22; pts.push([.38 + Math.cos(a) * r, -.42 + Math.sin(a) * r]); }
    pz(tubo(pts, .1, .05), ROSA, [0, 0, .02], g, { tinta: .014, papel: .04 });
    g.sensor = group([-.05, -.14, .06], g); det(F.rect(.04, .2, .02), 0x7b5cff, [0, .1, 0], g.sensor); det(F.circ(.045), 0x7b5cff, [0, .2, .002], g.sensor);
    g.chapotea = (t, k = 0, dir = 1) => { canales.forEach((c, i) => c.liq.rotation.z = -Math.PI / 2 - c.rotation.z * 0 + dir * k * 1.1 + Math.sin(t * 6 + i) * .12 * (k + .2)); g.sensor.rotation.z = -dir * k * .6 + Math.sin(t * 6) * .06; };
    return g; }

  // ---- cocina y pan (16-nov-2026 18:00, short del pan duro) ----
  // material propio (no compartido) para piezas que cambian de opacidad o color
  const matPropio = (g, color, op = 1) => { g.traverse(m => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.setHex(color); m.material.transparent = true; m.material.opacity = op; m.material.depthWrite = false; } }); return g; };
  // COCINA de frente: pared crema, franja de azulejo talavera, barra con cubierta (g.topY) detrás del chibi, alacenas arriba y ventanita.
  // o: {pared, barra, cubierta, azulejo, ventana:false}. Pon objetos sobre la barra en y = topY, z ≈ -1.05.
  function cocina(o = {}) {
    const PAR = o.pared ?? 0xfbe6c8, BAR = o.barra ?? 0x2ec4a6, CUB = o.cubierta ?? 0xf3efe6, AZ = o.azulejo ?? 0x3d6bff, topY = o.topY ?? .95;
    pz(F.rect(30, 30, 0), PAR, [0, 15, -3], null, { tinta: false, papel: false });
    // azulejo talavera: cuadritos blancos con florecita azul
    for (let i = -9; i <= 9; i++) for (let j = 0; j < 3; j++) { const x = i * .42, y = topY + .28 + j * .42; const a = det(F.rect(.38, .38, .03), 0xffffff, [x, y, -2.97]); det(F.estrella(4, .13, .05), AZ, [0, 0, .006], a, Math.PI / 4); det(F.circ(.04), 0xffc83d, [0, 0, .01], a); }
    // alacenas
    for (const x of [-2.2, -1.1, 1.1, 2.2]) { const a = pz(F.rect(1.0, .8, .04), 0xf2a65a, [x, topY + 2.05, -2.9], null, { tinta: .016, papel: .05 }); det(F.circ(.04), 0x8a5a3a, [x > 0 ? -.38 : .38, -.25, .02], a); }
    if (o.ventana !== false) { const v = group([0, topY + 1.95, -2.92]); pz(F.rect(1.1, .9, .04), 0xffffff, [0, 0, 0], v, { tinta: .016, papel: .05 }); pz(F.rect(.96, .76, .02), 0x8fd3ff, [0, 0, .02], v, { tinta: false, papel: false });
      det(F.nube(.2), 0xffffff, [-.18, .12, .035], v); pz(F.rect(.04, .76, 0), 0xffffff, [0, 0, .04], v, { tinta: .01, papel: false }); }
    // piso de mosaico
    const piso = group([0, 0, 0]); pz(F.rect(30, 6, 0), 0xe9d3b0, [0, -3, -1.7], piso, { tinta: false, papel: false });
    for (let i = -14; i < 14; i++) det(F.rect(.03, 6, 0), 0xd2b78f, [i * .6, -3, -1.69], piso);
    piso.traverse(m => m.receiveShadow = false);   // sin siluetas grises gigantes de los personajes
    // barra
    const bar = group([0, 0, 0]); det(F.rect(30, topY, .02), BAR, [0, topY / 2, -1.25], bar);   // con radio 0 la figura ancha y baja no se triangula (sale invisible u oscura): usa radio > 0
    for (let i = -8; i <= 8; i++) { det(F.rect(.03, topY - .2, 0), osc(BAR, .85), [i * .9, topY / 2 - .05, -1.235], bar); det(F.circ(.035), 0xffffff, [i * .9 + .45, topY - .2, -1.235], bar); }
    bar.traverse(m => m.receiveShadow = false);
    det(F.rect(30, .1, .02), CUB, [0, topY, -1.2], bar); det(F.rect(30, .025, .01), osc(BAR, .6), [0, topY - .06, -1.195], bar);
    bar.traverse(m => m.receiveShadow = false);
    return { topY, z: -1.05 }; }
  // REFRIGERADOR de frente con puerta que abre (g.abre(k): 0 cerrado → 1 abierto, la puerta se dobla a la izquierda como cartulina);
  // g.dentro: grupo para meter cosas en las repisas (y = .55, 1.15, 1.75 con h 2.3). o: {w, h, color}. g.frio(t, k): vaho frío que sale.
  function refri(pos, o = {}, parent = null) { const g = group(pos, parent), W = o.w ?? 1.15, H = o.h ?? 2.3, col = o.color ?? 0xe9eef5;
    pz(F.rect(W + .08, H + .08, .08), osc(col, .8), [0, H / 2, -.06], g, { tinta: .02, papel: .06 });                 // caja (marco)
    pz(F.rect(W - .1, H - .1, .04), 0xcfe9ff, [0, H / 2, -.03], g, { tinta: false, papel: false });                   // interior
    g.luz = det(F.circ(.09), 0xfff2a8, [0, H - .2, -.005], g);
    for (const y of [.55, 1.15, 1.75]) pz(F.rect(W - .14, .05, .02), 0xffffff, [0, y - .05, 0], g, { tinta: .01, papel: false });
    g.dentro = group([0, 0, .01], g);
    const bis = g.puerta = group([-W / 2, 0, .06], g);
    const pu = pz(F.rect(W, H, .08), col, [W / 2, H / 2, 0], bis, { tinta: .02, papel: .06 });
    det(F.rect(W - .02, .03, 0), osc(col, .85), [0, H * .18, .014], pu);                                               // división congelador
    pz(F.rect(.07, .5, .03), 0x9aa3b5, [W * .38, H * .02, .02], pu, { tinta: .01, papel: false });                     // manija
    pz(F.rect(.07, .3, .03), 0x9aa3b5, [W * .38, H * .32, .02], pu, { tinta: .01, papel: false });
    for (const [x, y, c] of [[-.25, .1, 0xff6b5b], [.05, -.15, 0xffc83d], [-.1, -.42, 0x7b5cff]]) det(F.circ(.07), c, [x, y, .016], pu);   // imanes
    g.vaho = []; for (let i = 0; i < 4; i++) { const v = matPropio(det(F.nube(.22), 0xffffff, [0, 0, .3], g), 0xffffff, .0); v.f = i / 4; g.vaho.push(v); }
    g.abre = (k) => { bis.scale.x = Math.max(.001, 1 - 1.25 * k); g.luz.visible = k > .1; };
    g.frio = (t, k) => g.vaho.forEach(v => { const q = (t * .5 + v.f) % 1; v.visible = k > .02; v.position.set(-.1 + q * .7, H * .25 + q * 1.2 + Math.sin(t * 2 + v.f * 6) * .06, .3); v.children[0].material.opacity = k * .75 * Math.sin(q * Math.PI); v.scale.setScalar(.6 + q * .7); });
    g.abre(0); g.frio(0, 0); return g; }
  // PAN de cartulina con carita (PM.astro): o.tipo 'bolillo' (con greña) | 'concha' (costra de azúcar) | 'rebanada' (con miga). o: {r, cara, expr}.
  // g.duro(k): se pone gris piedra con grietas (k 0..1); g.suave(k, t): brillito y rayitas de vapor para el pan recién calentado.
  function pan(pos, o = {}) { const r = o.r ?? .5, tipo = o.tipo ?? 'bolillo';
    const formas = { bolillo: blob([[-r * 1.35, 0], [-r * 1.1, r * .45], [-r * .4, r * .7], [r * .4, r * .7], [r * 1.1, r * .45], [r * 1.35, 0], [r * 1.05, -r * .42], [r * .3, -r * .55], [-r * .3, -r * .55], [-r * 1.05, -r * .42]]),
      concha: blob([[-r, -r * .45], [-r * 1.02, -r * .05], [-r * .75, r * .5], [0, r * .75], [r * .75, r * .5], [r * 1.02, -r * .05], [r, -r * .45], [0, -r * .55]]),
      rebanada: blob([[-r * .85, -r * .8], [-r * .9, r * .2], [-r * 1.05, r * .55], [-r * .55, r * .95], [0, r * .85], [r * .55, r * .95], [r * 1.05, r * .55], [r * .9, r * .2], [r * .85, -r * .8]]) };
    const col = o.color ?? (tipo === 'concha' ? 0xf0c27a : tipo === 'rebanada' ? 0xc98a46 : 0xe0a050);
    const g = astro(pos, r, col, { forma: formas[tipo], cara: o.cara ?? true, expr: o.expr ?? 'feliz', sombra: osc(col, .85) });
    const cu = g.cuerpo;
    if (tipo === 'bolillo') det(tubo([[-r * .75, r * .38], [-r * .2, r * .52], [r * .35, r * .5], [r * .85, r * .34]], .045 * r / .5, .03 * r / .5), osc(col, .7), [0, 0, .02], cu);
    if (tipo === 'concha') { const c = det(blob([[-r * .82, -r * .02], [-r * .62, r * .45], [0, r * .66], [r * .62, r * .45], [r * .82, -r * .02], [0, r * .08]]), o.azucar ?? 0xffd1dc, [0, 0, .018], cu);
      for (let i = -2; i <= 2; i++) det(tubo([[i * r * .18, r * .1], [i * r * .3, r * .6]], .02, .02), 0xf3a6b8, [0, 0, .006], c); }
    if (tipo === 'rebanada') { det(blob([[-r * .72, -r * .68], [-r * .76, r * .2], [-r * .9, r * .5], [-r * .5, r * .8], [0, r * .7], [r * .5, r * .8], [r * .9, r * .5], [r * .76, r * .2], [r * .72, -r * .68]]), 0xfbe6b4, [0, 0, .018], cu);
      for (const [x, y, k] of [[-.4, -.4, .07], [.35, -.5, .06], [.5, .3, .05], [-.55, .35, .05], [.1, -.65, .04]]) det(F.circ(r * k), 0xe9cf95, [r * x, r * y, .022], cu); }
    // capa de "piedra" + grietas
    const piedra = g.piedra = matPropio(det(formas[tipo], 0x8f8a80, [0, 0, .024], cu), 0x8f8a80, 0);
    const grietas = g.grietas = group([0, 0, .026], cu);
    for (const pts of [[[-r * .9, r * .1], [-r * .65, -r * .05], [-r * .7, -r * .3]], [[r * .7, r * .3], [r * .85, r * .05], [r * .65, -r * .2]], [[-r * .1, -r * .5], [0, -r * .32], [r * .12, -r * .42]]]) det(tubo(pts, .022, .022), 0x4a4640, [0, 0, 0], grietas);
    g.duro = (k) => { piedra.children[0].material.opacity = .62 * k; grietas.visible = k > .45; grietas.scale.setScalar(Math.max(.001, cl1((k - .45) / .4))); };
    const brillos = g.brillos = group([0, 0, .05], g); for (const [x, y] of [[-r * .8, r * .55], [r * .9, r * .6], [r * .1, r * .95]]) det(F.estrella(4, .09, .03), 0xffffff, [x, y, 0], brillos);
    const vap = g.vapor = group([0, r * .7, .02], g); for (let i = 0; i < 3; i++) { const v = det(tubo([[0, 0], [.06, .12], [-.04, .26], [.05, .4]], .03, .03), 0xffffff, [(i - 1) * r * .5, 0, 0], vap); v.f = i * .33; }
    g.suave = (k, t = 0) => { brillos.visible = k > .02; brillos.scale.setScalar(Math.max(.001, k * (1 + .15 * Math.sin(t * 8)))); brillos.rotation.z = Math.sin(t * 2) * .1;
      vap.visible = k > .02; vap.children.forEach(v => { const q = (t * .7 + v.f) % 1; v.position.y = q * .35; v.scale.setScalar(Math.max(.001, k * Math.sin(q * Math.PI))); }); };
    g.traverse(m => m.receiveShadow = false);   // sin manchas oscuras de la sombra del chibi (parecen moho)
    g.duro(0); g.suave(0); return g; }
  const cl1 = (x) => Math.min(1, Math.max(0, x));
  // MIGA vista de cerca (para meter en PM.lupa): pan con hoyitos, cadenitas de almidón sueltas que se mueven y cristalitos que aparecen.
  // g.cristaliza(k, t): 0 = cadenitas sueltas y flojitas; 1 = cristalitos ordenados en filas (pan duro).
  function miga(pos, s = 1, padre = null) { const g = group(pos, padre); g.scale.setScalar(s);
    det(F.circ(.98), 0xfbe6b4, [0, 0, 0], g);
    for (const [x, y, k] of [[-.55, .45, .1], [.5, .5, .08], [.6, -.35, .1], [-.45, -.5, .09], [0, .05, .07], [.05, -.7, .06], [-.75, -.05, .06]]) det(F.circ(k), 0xe9cf95, [x, y, .004], g);
    g.cad = []; let sm = 7; const rnd = () => (sm = (sm * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 9; i++) { const a = i * 2.39996, rr = .62 * Math.sqrt((i + .5) / 9); const c = group([Math.cos(a) * rr, Math.sin(a) * rr, .01], g);
      det(tubo([[-.16, 0], [-.08, .06], [0, -.04], [.08, .06], [.16, -.02]], .035, .035), 0xffffff, [0, 0, 0], c); c.r0 = rnd() * 6; c.rotation.z = c.r0; g.cad.push(c); }
    g.cri = []; for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) { const h = pz(F.estrella(3, .13, .13), 0x8fd3ff, [i * .36, j * .36, .02], g, { tinta: .01, papel: .03 }); h.rotation.z = Math.PI / 6; h.k = (i + 1) * .1 + (j + 1) * .05; g.cri.push(h); }
    g.cristaliza = (k, t = 0) => { g.cad.forEach((c, i) => { c.rotation.z = c.r0 + Math.sin(t * 3 + i) * .4 * (1 - k); c.scale.setScalar(Math.max(.001, 1 - cl1(k * 1.6 - .2))); });
      g.cri.forEach(h => h.scale.setScalar(Math.max(.001, cl1((k - h.k) / .4)))); };
    g.cristaliza(0); return g; }
  // ESTUFA con COMAL: hornilla con llamitas que titilan y comal negro encima (g.topY para poner cosas). g.fuego(k, t).
  function comal(pos, o = {}, parent = null) { const g = group(pos, parent), w = o.w ?? 1.5;
    pz(F.rect(w + .3, .18, .04), 0x9aa3b5, [0, .09, -.02], g, { tinta: .016, papel: .04 });
    const fu = g.llamas = group([0, .2, -.03], g); for (let i = -2; i <= 2; i++) { const l = pz(F.gota(.32), i & 1 ? 0xffc83d : 0xff8a3d, [i * w * .14, .1, 0], fu, { tinta: .01, papel: .03 }); l.f = i * 1.7; }
    pz(F.rect(w, .09, .04), 0x34313d, [0, .36, 0], g, { tinta: .016, papel: .04 });
    pz(F.rect(.2, .05, .02), 0x34313d, [-w / 2 - .08, .36, 0], g, { tinta: .01, papel: false }); pz(F.rect(.2, .05, .02), 0x34313d, [w / 2 + .08, .36, 0], g, { tinta: .01, papel: false });
    g.topY = .41;
    g.fuego = (k, t = 0) => fu.children.forEach(l => { l.scale.set(Math.max(.001, k * (.9 + .15 * Math.sin(t * 11 + l.f))), Math.max(.001, k * (.85 + .25 * Math.sin(t * 13 + l.f * 2))), 1); });
    g.fuego(o.k ?? 1); return g; }
  // BOLSA de plástico transparente con amarre (para pan, tortillas…). Pon la bolsa DELANTE (z mayor) de lo que contiene.
  function bolsa(pos, w = 1.6, h = 1.0, parent = null) { const g = group(pos, parent);
    const cu = blob([[-w / 2, -h / 2], [-w / 2 - .04, h * .1], [-w / 2 + .05, h / 2], [-w * .1, h / 2 + .05], [0, h / 2 + .18], [w * .1, h / 2 + .05], [w / 2 - .05, h / 2], [w / 2 + .04, h * .1], [w / 2, -h / 2]]);
    matPropio(det(cu, 0xcfeaff, [0, 0, 0], g), 0xcfeaff, .35);
    det(tubo([[-w / 2, -h / 2], [-w / 2 - .04, h * .1], [-w / 2 + .05, h / 2], [-w * .1, h / 2 + .05], [0, h / 2 + .18], [w * .1, h / 2 + .05], [w / 2 - .05, h / 2], [w / 2 + .04, h * .1], [w / 2, -h / 2], [-w / 2, -h / 2]], .02, .02), 0x9cc8ea, [0, 0, .01], g);
    det(F.elipse(.07, .2), 0xffffff, [-w * .32, h * .1, .012], g, .2);
    pz(F.rect(.3, .07, .03), 0xff6b5b, [0, h / 2 + .04, .02], g, { tinta: .01, papel: false });
    return g; }

  // ---- 16-nov 21:30 (vaho con frío) ----
  // PM.aliento(pos, padre, o): nubecitas de vaho que salen de la boca y se deshacen (aliento visible con frío, soplar, dragón). o: {n, color, vel}
  // g.update(t, on 0..1, dir ±1, largo, tam). Ponlo de hijo de p.head en [.3·dir, -.27, .05] para que siga a la cabeza.
  function aliento(pos, parent = null, o = {}) { const g = group(pos, parent), n = o.n ?? 5, col = o.color ?? 0xffffff;
    g.nb = Array.from({ length: n }, (_, i) => { const c = group([0, 0, .12], g);
      const borde = matPropio(det(F.nube(.42), 0x8fb6d6, [0, 0, -.004], c), 0x8fb6d6, 0); const cu = matPropio(det(F.nube(.38), col, [0, .005, 0], c), col, 0);
      c.ms = [borde.children[0].material, cu.children[0].material]; c.f = i / n; return c; });
    g.update = (t, on = 1, dir = 1, largo = .9, tam = 1) => g.nb.forEach(c => { const q = (t * (o.vel ?? .85) + c.f) % 1; c.visible = on > .01;
      c.position.set(dir * q * largo, q * .28 + Math.sin(t * 3 + c.f * 6) * .04, .12 + c.f * .01); c.scale.setScalar(Math.max(.001, tam * (.3 + q * 1.0)));
      const op = on * Math.min(1, q * 6) * Math.min(1, (1 - q) * 2.2); c.ms[0].opacity = op * .8; c.ms[1].opacity = op * .95; });
    g.update(0, 0); return g; }
  // PM.vapor(padre, o): vapor de agua visto de cerca (para PM.lupa): bolitas azules que vuelan rápido (gas caliente) y con g.update(t, k)
  // se frenan y se juntan en gotitas (k 0 = gas → 1 = gotas). o: {n, r, color}
  function vapor(parent, o = {}) { const g = group([0, 0, .03], parent), n = o.n ?? 15, R = o.r ?? .42, col = o.color ?? 0x3d9bff;
    const cen = [[-.17, .13], [.18, .08], [-.02, -.17]];
    g.bs = Array.from({ length: n }, (_, i) => { const b = pz(F.circ(.04), col, [0, 0, .02], g, { tinta: .008, papel: false }); b.i = i; b.c = cen[i % 3]; b.a = i * 2.39996; b.rr = Math.sqrt((i + .5) / n);
      b.rayas = det(tubo([[-.13, 0], [-.05, 0]], .012, .012), 0xffffff, [0, 0, -.01], b); return b; });
    g.gotas = cen.map(c => { const d = pz(F.gota(.32), col, [c[0], c[1] - .03, .03], g, { tinta: .01, papel: .02 }); det(F.circ(.025), 0xffffff, [-.04, .02, .016], d); return d; });
    g.update = (t, k) => { const e = k * k * (3 - 2 * k);
      g.bs.forEach(b => { const v = (3.4 * (1 - k) + .3) * (b.i % 2 ? 1 : -1), ang = b.a + t * v;
        const gx = Math.cos(ang) * R * b.rr, gy = Math.sin(ang * 1.37 + b.i) * R * b.rr, cx = b.c[0] + Math.cos(b.a) * .06, cy = b.c[1] + Math.sin(b.a) * .06;
        b.position.set(gx + (cx - gx) * e, gy + (cy - gy) * e, .02); b.visible = k < .95; b.scale.setScalar(1 - .3 * e); b.rayas.visible = k < .35; b.rotation.z = v > 0 ? ang + Math.PI / 2 : ang - Math.PI / 2; });
      g.gotas.forEach(d => { d.visible = k > .78; d.scale.setScalar(Math.max(.001, Math.min(1, (k - .78) / .2))); }); };
    g.update(0, 0); return g; }
  // PM.taza(pos, padre, o): jarrito de barro / taza de cartulina con atole, café o chocolate y vapor que sube. o: {color, liquido, vapor}
  // g.humea(t, k) anima el vapor (k 0..1). Para colgarla de la mano: padre = p.brazos[1], pos [0, -.6, .12] y contrarrota g.rotation.z.
  function taza(pos, parent = null, o = {}) { const g = group(pos, parent), col = o.color ?? 0xc8693a, liq = o.liquido ?? 0xead2a4;
    pz(F.arco(.085, .04, -1.45, 1.45), col, [.16, .02, -.01], g, { tinta: .01, papel: .04 });
    pz(blob([[-.18, .16], [.18, .16], [.16, -.06], [.1, -.15], [-.1, -.15], [-.16, -.06]]), col, [0, 0, 0], g, { tinta: .012, papel: .045 });
    det(F.elipse(.17, .035), liq, [0, .15, .016], g);
    for (const x of [-.09, 0, .09]) det(F.circ(.022), 0xfff1c9, [x, .02, .016], g);
    det(tubo([[-.15, -.04], [-.05, -.07], [.05, -.07], [.15, -.04]], .016, .016), osc(col, .7), [0, 0, .016], g);
    const vp = g.vap = group([0, .22, .02], g);
    for (let i = 0; i < 3; i++) { const v = det(tubo([[0, 0], [.05, .1], [-.04, .22], [.04, .34]], .04, .04), o.vapor ?? 0xffffff, [(i - 1) * .08, 0, 0], vp); v.f = i * .33; }
    g.humea = (t, k = 1) => { vp.visible = k > .02; vp.children.forEach(v => { const q = (t * .8 + v.f) % 1; v.position.y = q * .3; v.scale.setScalar(Math.max(.001, k * Math.sin(q * Math.PI))); }); };
    g.humea(0, 1); return g; }
  return { aliento, vapor, taza, cocina, refri, pan, miga, comal, bolsa, carro, camino, mareo, oidoInterno, celular, pilaIones, cuarto, cama, acuesta, ojos, despertador, foco, cerebro, avion, tierra, pielChinita, pelaje, notas, meteoro, arenero, tierrita, olor, tapete, calendario, labios, balsamo, chibi, diorama, pz, det, perroPM, gatoPM, A, ondas, pelota, pregunta, espacio, astro, marca, letrero, comentario, bufanda, copos, lupa, formaRinon, formaVejiga, precio, carrito, caja, vestido };
}
