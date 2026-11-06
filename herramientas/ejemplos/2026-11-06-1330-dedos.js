// Short 3D: ¿Tronarte los dedos da artritis? (pedido de Iván)
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-06-1330-dedos.json OUT ../ejemplos/2026-11-06-1330-dedos.js
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, mat, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    AMB, setCuarto, setLaboratorio, ondas, gesto, hablar, pose } = E;
  const SKIN = 0xe0b08c, SKIN2 = 0xc99872;

  // ---------- utilería ----------
  // Mano grande low-poly con la palma hacia +z. Dedos de 3 falanges (g.dedos[i] = [f0,f1,f2]); doblar con rotation.x > 0.
  function mano(pos, s = 1, parent, o = {}) {
    const g = group(pos, parent); g.scale.setScalar(s); const sk = o.skin ?? SKIN;
    box(.95, 1.0, .32, sk, [0, .5, 0], g);
    box(.85, .45, .34, o.manga ?? 0x6f9bd6, [0, -.22, 0], g);                       // puño de la manga
    g.dedos = [[-.36, .78], [-.12, .95], [.12, .9], [.36, .7]].map(([x, L]) => {
      const segs = []; let par = group([x, 1.0, 0], g);
      ball(.135, SKIN2, [0, 0, 0], par, 0);                                           // nudillo
      [L * .42, L * .33, L * .25].forEach((l, k) => { if (k) { par = group([0, segs[k - 1].userData.l, 0], segs[k - 1]); ball(.105, sk, [0, 0, 0], par, 0); }
        box(.2 - k * .02, l, .24 - k * .02, sk, [0, l / 2, 0], par); par.userData.l = l; segs.push(par); });
      box(.12, .06, .04, 0xf4dccb, [0, segs[2].userData.l - .06, .12], segs[2]);     // uña
      return segs; });
    const th = group([-.5, .3, .05], g); th.rotation.z = .75; ball(.13, SKIN2, [0, 0, 0], th, 0); box(.22, .42, .24, sk, [0, .21, 0], th);
    const th2 = group([0, .42, 0], th); box(.2, .3, .22, sk, [0, .15, 0], th2); g.pulgar = [th, th2];
    g.flex = (k, i = -1) => g.dedos.forEach((d, j) => { if (i < 0 || i === j) d.forEach((sg, n) => sg.rotation.x = k * (n ? 1.0 : .7)); });
    return g;
  }
  // Corte del nudillo (eje vertical): hueso de abajo con cabeza redonda, hueso de arriba con base plana, cartílago,
  // líquido entre ambos, cápsula y la piel del dedo translúcida alrededor. sep() separa los huesos.
  function nudillo() {
    const g = group([0, 0, 0]); const HUESO = 0xf1e6cc;
    g.piel = cyl(1.05, 1.05, 7, SKIN, [0, 0, 0], g, 14, { opacity: .16 }); g.piel.material.depthWrite = false; g.piel.castShadow = false;
    const ab = group([0, 0, 0], g); cyl(.36, .42, 3, HUESO, [0, -1.85, 0], ab, 10); ball(.5, HUESO, [0, -.42, 0], ab, 1);
    ball(.5, 0xbfe3ff, [0, -.38, 0], ab, 1, { opacity: .55 }).castShadow = false;        // cartílago (brillo azulado)
    const ar = group([0, 0, 0], g); cyl(.42, .34, 3, HUESO, [0, 1.95, 0], ar, 10); cyl(.5, .46, .22, 0xbfe3ff, [0, .36, 0], ar, 10);
    g.liq = cyl(.62, .62, 1, 0x39c6ff, [0, .05, 0], g, 16, { opacity: .42, emissive: 0x1aa8ff, ei: .35 }); g.liq.material.depthWrite = false; g.liq.castShadow = false;
    g.cap = cyl(.72, .72, 1, 0xb58bc0, [0, .05, 0], g, 16, { opacity: .2 }); g.cap.material.depthWrite = false; g.cap.material.side = THREE.DoubleSide; g.cap.castShadow = false;
    g.motas = Array.from({ length: 14 }, (_, k) => { const m = ball(.035, 0xdff6ff, [0, 0, 0], g, 0, { emissive: 0xbff0ff, ei: .8 }); m.castShadow = false; return m; });
    g.burbuja = ball(.3, 0xffffff, [0, .05, .1], g, 2, { opacity: .7, emissive: 0xcff4ff, ei: .6, rough: .2 }); g.burbuja.castShadow = false; g.burbuja.visible = false;
    g.sep = (d, lt) => { ar.position.y = d; const h = .95 + d; g.liq.scale.y = h * .55; g.liq.position.y = .0 + d / 2; g.cap.scale.y = h * .75; g.cap.position.y = d / 2;
      g.motas.forEach((m, k) => { const a = k * 2.4 + lt * (.6 + (k % 3) * .2); m.position.set(Math.cos(a) * .55, -.05 + d / 2 + Math.sin(lt * 1.3 + k) * .22 * (1 + d), Math.sin(a) * .55); }); };
    return g;
  }
  function reloj(pos, r = .55) {
    const g = group(pos); cyl(r, r, .1, 0xf4efe6, [0, 0, 0], g, 24).rotation.x = Math.PI / 2;
    const aro = new THREE.Mesh(new THREE.TorusGeometry(r, .06, 6, 24), mat(0xd9a93a)); g.add(aro);
    for (let k = 0; k < 12; k++) box(.04, .1, .02, 0x333333, [Math.sin(k * Math.PI / 6) * r * .82, Math.cos(k * Math.PI / 6) * r * .82, .06], g).rotation.z = -k * Math.PI / 6;
    g.hor = group([0, 0, .08], g); box(.05, r * .5, .02, 0x222222, [0, r * .25, 0], g.hor);
    g.min = group([0, 0, .09], g); box(.035, r * .78, .02, 0xd94a3a, [0, r * .39, 0], g.min);
    return g;
  }
  function celular(parent, pos) { const t = group(pos, parent); box(.11, .2, .015, 0x1d1f26, [0, 0, 0], t); box(.095, .17, .005, 0x2a8a7a, [0, 0, .01], t, { emissive: 0x7fdcff, ei: .7 }); return t; }

  // 1 · gancho: el niño se truena los dedos en la sala y mamá lo regaña señalándolo
  escena('gancho', {
    setup() { ambiente(AMB.cuartoDia); setCuarto({ noche: false, tapete: 0x2f8f83 });
      this.m = persona({ pos: [-.75, 0, .2], shirt: 0xc0583f, pants: 0x4a3a5a, hair: 0x2a1a14, pelo: 'largo' }); this.m.rotation.y = .55;
      this.k = persona({ pos: [.6, 0, .9], shirt: 0xf3c54d, pants: 0x3d4a66, hair: 0x1c1410 }); this.k.scale.setScalar(.72); this.k.rotation.y = -.35;
      this.on = ondas([.5, .78, 1.3], { color: 0xf3c54d, n: 3, vel: 2.2, alcance: .55, grosor: .02, dir: [0, 0, 0] }); },
    update(lt, c) {
      // niño: manos entrelazadas al frente, empuja y CRAC
      pose(this.k, 'manosJuntas', 1); const pu = Math.max(0, Math.sin(cl((lt - .15) / .35) * Math.PI)); this.k.armL.rotation.x -= pu * .35; this.k.armR.rotation.x -= pu * .35;
      gesto(this.k, lt < .6 ? 'feliz' : 'sorpresa'); this.k.head.rotation.y = lt > .6 ? .5 : 0;
      this.on.update(lt, lt > .3 && lt < 1.2); if (lt > .32) c.ev('crack', .32, .9);
      // mamá: voltea, se enoja y señala
      const vt = ease((lt - .45) / .4); this.m.rotation.y = lerp(1.6, .55, vt);
      pose(this.m, 'senalar', ease((lt - .6) / .35), lt); gesto(this.m, lt > .6 ? 'enojada' : 'neutral'); hablar(this.m, lt, lt > .7 && lt < c.f(1) ? 1 : 0);
      const p = einout(lt / 4.4);
      cam([lerp(1.6, .9, p), lerp(1.5, 1.35, p), lerp(5.2, 4.0, p)], [lerp(.1, 0, p), 1.0, .5], 46);
      etiqueta('¡CRAC!', [.5, 1.35, 1.0], lt - .32, 74, '#f3c54d');
      if (lt < c.f(1)) { rotulo('¿Te regañaban?', 'por tronarte los dedos', lt - .05, 1330); c.ev('pop', .05, .6); }
      else { rotulo('¿Da artritis?', 'esto es lo que pasa de verdad', lt - c.f(1), 1330); c.ev('ding', c.f(1), .6); }
    }
  });
  // 2 · dentro del nudillo: la cámara atraviesa la piel y vemos los dos huesos flotando en el líquido
  escena('liquido', {
    setup() { ambiente({ top: 0x0f1a33, bottom: 0x2a3f6e, fog: 0x0f1a33, near: 6, far: 22, sunColor: 0xfff1dc, sunInt: 2.2, hemiInt: 1.2, sunPos: [4, 8, 7] });
      this.n = nudillo(); this.n.rotation.z = .12; },
    update(lt, c) {
      this.n.sep(0, lt);
      const p = einout(lt / 4.0); const a = lerp(-.5, .35, p), r = lerp(10, 6.4, p);
      cam([Math.sin(a) * r, lerp(1.2, .35, p), Math.cos(a) * r], [0, .05, 0], 44);
      this.n.liq.material.emissiveIntensity = .3 + .25 * ease((lt - c.w('líquido')) / .4);
      etiqueta('LÍQUIDO', [0, .05, 1.1], lt - c.w('líquido'), 64, '#7fdcff'); if (lt > c.w('líquido')) c.ev('pop', c.w('líquido'), .6);
      etiqueta('HUESO', [0, 1.05, .6], lt - .5, 46, '#ffffff'); etiqueta('HUESO', [0, -1.3, .6], lt - .7, 46, '#ffffff');
      rotulo('Dentro del nudillo', 'un líquido que lo lubrica', lt - .1, 1330); c.ev('whoosh', .05, .5);
    }
  });
  // 3 · la burbuja: los huesos se separan, baja la presión, nace la burbuja… ¡CRAC!
  escena('burbuja', {
    setup() { ambiente({ top: 0x1a1030, bottom: 0x4a2f6e, fog: 0x1a1030, near: 6, far: 22, sunColor: 0xffe7c4, sunInt: 2.2, hemiInt: 1.2, sunPos: [4, 8, 7] });
      this.n = nudillo(); this.on = ondas([0, .4, .2], { color: 0xf3c54d, n: 3, vel: 2.4, alcance: 2.2, grosor: .05, dir: [0, 0, 0] }); },
    update(lt, c) {
      const te = c.w('estirarlos') - .1, tb = c.w('burbuja') - .2, tc = c.f(1);
      const d = .55 * eout((lt - te) / 1.2); this.n.sep(d, lt);
      // flechas de "jalar"
      const b = this.n.burbuja; b.visible = lt > tb; const gr = eout((lt - tb) / .6);
      const pop = lt > tc ? Math.max(0, 1 - (lt - tc) / .12) : 1;
      b.scale.setScalar(Math.max(.01, gr * (1 + .06 * Math.sin(lt * 7)) * (lt > tc ? 1.12 : 1))); b.position.y = d / 2 + .02;
      b.material.emissiveIntensity = lt > tc ? .6 + 2.5 * pop : .6;
      this.on.update(lt - tc, lt > tc && lt < tc + 1.4);
      if (lt > tc) c.ev('crack', tc, 1); if (lt > tb) c.ev('pop', tb, .5);
      const sh = lt > tc && lt < tc + .35 ? (1 - (lt - tc) / .35) * .08 : 0;
      const p = einout(lt / 5.4);
      cam([lerp(1.4, -.6, p) + Math.sin(lt * 70) * sh, lerp(.9, .45, p) + Math.cos(lt * 60) * sh, lerp(6.4, 5.4, p)], [0, .25, 0], 44);
      if (lt < tc) etiqueta('SE ESTIRA', [0, 1.1, 1.0], lt - te, 50, '#ffffff');
      etiqueta('BAJA LA PRESIÓN', [0, -.95, 1.0], lt - c.w('presión'), 52, '#7fdcff');
      etiqueta('BURBUJA DE GAS', [0, -1.4, 1.0], lt - tb, 52, '#ffffff');
      if (lt > tc) etiqueta('¡CRAC!', [0, 1.35, 1.0], lt - tc, 110, '#f3c54d');
      rotulo('Una burbuja de gas', 'ese es el crac', lt - tb, 1330);
    }
  });
  // 4 · no truena otra vez: la mano intenta y no pasa nada; el reloj corre mientras el gas se vuelve a disolver
  escena('esperar', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x50608f, bottom: 0xe9b98a });
      box(8, 6, .2, 0xe9dcc6, [0, 2, -2.2]); for (let k = -8; k < 8; k++) box(.5, .03, 6, k % 2 ? 0x8a6242 : 0x9a7050, [k * .5 + .25, -.015, .5]);
      this.r = reloj([.75, 2.75, -2.05], .55);
      this.h = mano([-.15, .65, .6], .95, null, { manga: 0xf3c54d }); this.h.rotation.set(-.1, .25, 0); },
    update(lt, c) {
      // tres intentos: dobla el índice, nada
      const ph = (lt % 1.1) / 1.1, k = Math.sin(ph * Math.PI);
      this.h.flex(.15, -1); this.h.flex(.15 + k * 1.1, 1); this.h.dedos[1][0].rotation.x = .1 - k * .55;
      this.r.min.rotation.z = -lt * 5.5; this.r.hor.rotation.z = -lt * .45;
      if (lt > .55) c.ev('click', .55, .5); if (lt > 1.65) c.ev('click', 1.65, .5);
      const p = einout(lt / 4.5);
      cam([lerp(-.3, .3, p), lerp(1.55, 1.75, p), lerp(5.2, 4.6, p)], [lerp(.1, .3, p), 1.6, -.3], 46);
      if (lt > .55 && lt < c.w('esperar')) etiqueta('…NADA', [-.15, 2.05, .9], lt - .55, 62, '#c9cfd4');
      etiqueta('HAY QUE ESPERAR', [.75, 1.95, -1.9], lt - c.w('esperar'), 54, '#f3c54d'); if (lt > c.w('esperar')) c.ev('ding', c.w('esperar'), .6);
      rotulo('No truena dos veces', 'el gas tarda en disolverse', lt - .1, 1330); c.ev('whoosh', .05, .4);
    }
  });
  // 5 · el médico: una mano tronada durante sesenta años y la otra no… ninguna con artritis
  escena('medico', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x5f7fa8, bottom: 0xe8d2b0, fog: 0xc9c2b0, near: 8, far: 26 });
      setLaboratorio({ acento: 0x4fd1c5 });
      this.d = persona({ pos: [0, 0, .25], shirt: 0x6f9bd6, hair: 0xd8d8d8, bata: true });
      this.hL = mano([-.82, 1.05, .55], .46, null, { manga: 0xf3c54d }); this.hL.rotation.y = .2;
      this.hR = mano([.82, 1.05, .55], .46, null, { manga: 0x7fdcff }); this.hR.rotation.y = -.2;
      for (const x of [-.82, .82]) { cyl(.3, .34, .9, 0x34495e, [x, .45, .55], null, 10); }      // pedestales
      this.onL = ondas([-.82, 1.55, .75], { color: 0xf3c54d, n: 2, vel: 1.8, alcance: .5, grosor: .02, dir: [0, 0, 0] });
      // hojas de calendario que vuelan (años)
      this.hojas = Array.from({ length: 10 }, (_, k) => { const h = box(.34, .4, .01, k % 2 ? 0xffffff : 0xf6efe0, [0, 0, 0]); h.castShadow = false; return h; });
      this.cal = group([1.55, 2.5, -2.3]); box(.5, .58, .05, 0xffffff, [0, 0, 0], this.cal); box(.5, .14, .06, 0xd94a3a, [0, .23, 0], this.cal);
      this.chk = [-.82, .82].map(x => { const g = group([x, 2.2, .7]); g.visible = false;
        const a = box(.08, .22, .06, 0x3ccf7a, [-.07, -.03, 0], g, { emissive: 0x3ccf7a, ei: .5 }); a.rotation.z = .7;
        const b2 = box(.08, .42, .06, 0x3ccf7a, [.08, .05, 0], g, { emissive: 0x3ccf7a, ei: .5 }); b2.rotation.z = -.55; return g; }); },
    update(lt, c) {
      const t2 = c.f(1);
      // mano izquierda tronando sin parar; la derecha quieta
      const k = Math.max(0, Math.sin(lt * 5.5)); this.hL.flex(k * .9); this.onL.update(lt, lt < t2);
      this.hR.flex(.05);
      pose(this.d, lt < t2 ? 'jarras' : 'brazosArriba', lt < t2 ? 1 : ease((lt - t2) / .4), lt); gesto(this.d, lt < t2 ? 'neutral' : 'feliz'); hablar(this.d, lt, .6);
      this.d.head.rotation.y = lt < t2 ? Math.sin(lt * 1.2) * .35 : 0;
      this.hojas.forEach((h, j) => { const ph = ((lt * .9 + j / 10) % 1); h.position.set(Math.sin(j * 1.7) * 1.5 * ph, 2.55 + ph * 1.2 - ph * ph * 2.2, -1.5 + ph * 1.2); h.rotation.set(ph * 3 + j, ph * 4, ph * 2); h.visible = false; });
      [.3, 1.45, 2.6, 3.75].forEach(tt => { if (lt > tt && tt < t2) c.ev('click', tt, .3); });
      this.chk.forEach((g, j) => { const tt = t2 + c.dur * 0 + .5 + j * .25; g.visible = lt > tt; g.scale.setScalar(Math.max(.01, spring((lt - tt) / .5))); if (lt > tt) c.ev('ding', tt, .5); });
      const p = einout(lt / 6.4);
      cam([lerp(-.15, .15, p), lerp(1.7, 1.55, p), lerp(6.6, 5.8, p)], [0, 1.3, 0], 46);
      etiqueta('LA TRONABA', [-.82, .62, .95], lt - c.w('sola') + .2, 44, '#f3c54d');
      etiqueta('NO LA TRONABA', [.82, .62, .95], lt - c.w('sola') - .3, 44, '#7fdcff');
      if (lt < t2) rotulo('Sesenta años', 'una mano sí y la otra no', lt - c.w('sesenta'), 1330);
      else { rotulo('Sin artritis', 'en ninguna de las dos manos', lt - c.w('artritis'), 1330); }
      if (lt > c.w('sesenta')) c.ev('pop', c.w('sesenta'), .6);
      if (lt > t2 + .4) etiqueta('SIN ARTRITIS', [0, 2.45, .4], lt - t2 - .4, 60, '#7fe3a0');
    }
  });
  // 6 · remate: le enseñas el video a tu mamá; ella se encoge de hombros y tú tronas los dedos
  escena('remate', {
    setup() { ambiente(AMB.cuartoDia); setCuarto({ noche: false, tapete: 0xc0583f });
      this.m = persona({ pos: [-.55, 0, .9], shirt: 0xc0583f, pants: 0x4a3a5a, hair: 0x2a1a14, pelo: 'largo' }); this.m.rotation.y = .8;
      this.k = persona({ pos: [.55, 0, 1.0], shirt: 0xf3c54d, hair: 0x1c1410 }); this.k.scale.setScalar(.8); this.k.rotation.y = -.8;
      this.tel = celular(this.k.armR, [0, -.8, .1]); this.tel.rotation.x = -1.2;
      this.on = ondas([.4, 1.0, 1.4], { color: 0xf3c54d, n: 2, vel: 2.2, alcance: .4, grosor: .02, dir: [0, 0, 0] }); },
    update(lt, c) {
      const tm = c.w('mamá') - .1, tr = c.w('regañaba');
      this.k.armR.rotation.x = lerp(0, -1.4, ease(lt / .5)); this.k.armR.rotation.z = .25;
      gesto(this.k, 'feliz'); gesto(this.m, lt < tr ? 'sorpresa' : 'neutral');
      if (lt > tr) { pose(this.m, 'encoger', ease((lt - tr) / .4)); this.m.head.rotation.z = .12 * ease((lt - tr) / .4); }
      else this.m.head.rotation.x = .15;
      if (lt > tr + .6) { pose(this.k, 'manosJuntas', 1); this.on.update(lt, true); c.ev('crack', tr + .75, .7); } else this.on.update(lt, false);
      const p = einout(lt / 3.6);
      cam([lerp(.9, .5, p), 1.6, lerp(5.6, 4.6, p)], [0, 1.1, 1.0], 46);
      etiqueta('@MAMÁ', [-.55, 1.3, 1.3], lt - tm, 64, '#f3c54d'); if (lt > tm) c.ev('pop', tm, .7);
      rotulo('Etiqueta a tu mamá', 'la que siempre te regañaba', lt - .05, 1330); c.ev('whoosh', .05, .4);
    }
  });
}
