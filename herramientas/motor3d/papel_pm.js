// PROPUESTA estilo "papel tipo Paper Mario" (11-nov-2026): personajes chibi de cartulina con borde blanco grueso de recorte,
// contorno fino de tinta, ojos ovalados con brillo, chapitas, colores planos con sombra suave y detalles de ropa.
// Solo personajes propios del canal (nada de personajes de Nintendo).
export function kitPM(P, THREE, group) {
  const { F, M, agrandada, blob, tubo, capsula, INK, logoMini } = P;
  const osc = (c, k) => new THREE.Color(c).multiplyScalar(k).getHex();
  const mez = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), k).getHex();
  const PAPEL = 0xfffdf6;
  const geo = (s, d) => new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 40 });
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
    const g = group(pos); const es = o.escala ?? 1; g.scale.set(es, es, es * .2);   // profundidad aplastada: se ve como UNA cartulina delgada al girar
    const piel = o.piel ?? 0xe8b48c, ropa = o.ropa ?? 0x3d6bff, pan = o.pantalon ?? 0x2b2f4a, ten = o.tenis ?? 0x2ec4a6, cp = o.colPelo ?? 0x3a2416;
    const sPiel = osc(piel, .86), sRopa = osc(ropa, .82), sPan = osc(pan, .78);
    // ---- piernas y tenis ----
    for (const sx of [-1, 1]) {
      const p = group([sx * .14, .56, .0], g); p.rotation.z = sx * .03;
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
      b.rotation.z = up ? 2.55 : sx * .22;
      pz(capsula(.48, .17, .14), piel, [0, 0, 0], b); det(capsula(.4, .05, .04), sPiel, [.04, -.04, .014], b);
      pz(capsula(.2, .2, .19), ropa, [0, 0, .024], b); linea([[-.1, -.2], [.1, -.2]], .014, sRopa, b, .042);                            // manga y costura
      const m = group([0, -.5, .05], b); pz(F.elipse(.105, .11), piel, [0, 0, 0], m); pz(F.elipse(.04, .065), piel, [-sx * .085, .03, .004], m, { rot: sx * .5, papel: false });
      linea([[-.03, -.06], [.03, -.06]], .01, sPiel, m, .018); return b; });
    // ---- cabeza grande ----
    const h = group([0, 1.66, .06], g); g.head = h; h.rotation.z = o.inclina ?? .04;
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
    else { pz(blob([[-.53, .02], [-.5, .32], [-.34, .5], [-.05, .56], [.18, .68], [.44, .74], [.38, .58], [.52, .42], [.53, .1], [.42, .22], [.28, .28], [.08, .25], [-.12, .3], [-.3, .23], [-.45, .1]]), cp, [0, 0, .02], h);
      linea([[-.3, .4], [-.08, .5], [.14, .56]], .026, brillo, h, .036); for (const sx of [-1, 1]) pz(blob([[-.04, .1], [.04, .1], [.03, -.08], [-.02, -.06]]), cp, [sx * .45, .02, .02], h, { papel: false }); }
    // ojos ovalados con brillo
    h.ojos = [-1, 1].map(sx => { const e = group([sx * .17 + (o.mira ?? 0) * .02, -.02, .03], h);
      det(F.elipse(.068, .125), INK, [0, 0, 0], e); det(F.elipse(.026, .042), 0xffffff, [.018, .05, .003], e); det(F.circ(.012), 0xffffff, [-.02, -.06, .003], e); return e; });
    for (const sx of [-1, 1]) det(F.rect(.12, .032, .016), o.pelo === 'chongo' ? 0x9a948a : osc(cp, .8), [sx * .17, .16, .03], h, -sx * .12);   // cejas
    for (const sx of [-1, 1]) det(F.elipse(.085, .045), mez(piel, 0xff6f86, .45), [sx * .3, -.17, .028], h);                                   // chapitas
    det(F.elipse(.025, .018), osc(piel, .72), [0, -.12, .03], h);                                                                              // nariz
    const bc = group([0, -.25, .03], h);
    if ((o.boca ?? 'abierta') === 'abierta') { det(blob([[-.11, .03], [.11, .03], [.08, -.06], [0, -.09], [-.08, -.06]]), 0x7a1f30, [0, 0, 0], bc); det(F.elipse(.05, .025), 0xff8a9a, [0, -.055, .002], bc); det(F.rect(.15, .022, .008), 0xffffff, [0, .015, .002], bc); }
    else det(F.arco(.08, .024, Math.PI * 1.2, Math.PI * 1.8), 0x7a1f30, [0, .06, 0], bc);
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
    pz(F.rect(30, 1.2, 0), 0xe9c48f, [0, -.55, -1.7], null, { tinta: false, papel: false });
    const piso = pz(F.rect(30, .06, 0), 0xd4a96e, [0, .03, -1.69], null, { tinta: false, papel: false });
    for (let i = -14; i < 14; i++) det(F.rect(.18, .03, .01), 0xfff3dc, [i * .4, -.35, -1.68]);                                       // puntadas
  }
  return { chibi, diorama, pz, det };
}
