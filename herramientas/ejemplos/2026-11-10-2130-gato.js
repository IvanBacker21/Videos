// Short 3D: ¿Por qué los gatos tiran cosas de la mesa? — VERSIÓN REHECHA (10-nov 21:30) en estilo MEZCLA y ≤30 s (pedido de Iván;
// el original del 6-nov nunca se publicó por el límite de Metricool). Mejora: gato() con ojos grandes y cejas, gatoGesto(), gatoSentar().
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-10-2130-gato.json OUT ../ejemplos/2026-11-10-2130-gato.js
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, mat, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    AMB, setCuarto, ondas, gesto, hablar, pose, gato, gatoAnda, colaGato, patita, ojosCazador, gatoGesto, gatoSentar, polvo, polvoMueve, rayoLuz } = E;
  const TOP = .8;   // altura de la cubierta de la mesa

  // ---------- utilería ----------
  // Comedor: piso de duela, pared con lambrín, ventana, cuadro y mesa de madera (cubierta a y=TOP, centrada en x=0,z=0).
  function comedor(o = {}) {
    for (let k = -8; k < 8; k++) box(.5, .03, 10, k % 2 ? 0x8a6242 : 0x9a7050, [k * .5 + .25, -.015, 0]);
    box(8, 3.4, .15, o.pared ?? 0xe9dcc6, [0, 1.7, -2.2]); box(8, .9, .17, 0x7f9a8a, [0, .45, -2.18]); box(8, .06, .2, 0xf4efe6, [0, .92, -2.16]);
    box(1.3, 1.0, .05, o.vidrio ?? 0xbfe3ff, [1.6, 2.0, -2.1], null, { emissive: o.vidrio ?? 0xbfe3ff, ei: .45 }); box(1.4, .07, .1, 0xf4efe6, [1.6, 1.47, -2.08]);
    box(.8, .6, .04, 0xd9a93a, [-1.5, 2.1, -2.1]); box(.7, .5, .02, 0x3f7fb0, [-1.5, 2.1, -2.08]);
    const mesa = group([0, 0, 0]); box(1.9, .08, 1.0, 0x8a5a36, [0, TOP - .04, 0], mesa);
    for (const x of [-.85, .85]) for (const z of [-.42, .42]) box(.08, TOP - .08, .08, 0x6b4428, [x, (TOP - .08) / 2, z], mesa);
    box(.9, .01, .5, o.mantel ?? 0xf3c54d, [-.35, TOP + .005, 0], mesa).castShadow = false;
    return mesa;
  }
  // Vaso de vidrio con agua (origen en la base). .agua para ajustar nivel.
  function vaso(pos, parent, s = 1) {
    const g = group(pos, parent); g.scale.setScalar(s);
    const v = cyl(.075, .06, .22, 0xdff3ff, [0, .11, 0], g, 12, { opacity: .38, rough: .1 }); v.material.depthWrite = false;
    g.agua = cyl(.066, .056, .14, 0x4fb3ff, [0, .075, 0], g, 12, { opacity: .7, emissive: 0x1a7fe0, ei: .25 });
    cyl(.06, .06, .012, 0xdff3ff, [0, .006, 0], g, 12, { opacity: .6 });
    return g;
  }
  function raton(pos, parent, s = 1) {
    const g = group(pos, parent); g.scale.setScalar(s);
    box(.12, .08, .18, 0x9a9aa6, [0, .045, 0], g); box(.08, .07, .08, 0x9a9aa6, [0, .06, .11], g);
    for (const x of [-.045, .045]) ball(.035, 0xf2a7b0, [x, .11, .09], g, 0);
    box(.02, .02, .02, 0x111111, [-.022, .075, .15], g); box(.02, .02, .02, 0x111111, [.022, .075, .15], g);
    const c = box(.015, .015, .2, 0xf2a7b0, [0, .03, -.18], g); c.rotation.x = -.3; return g;
  }
  function varita(parent, pos) {   // varita con plumas colgando de un hilo
    const g = group(pos, parent); const pal = cyl(.012, .012, .9, 0x7a4e2f, [0, .45, 0], g, 6);
    g.punta = group([0, .9, 0], g); const hilo = cyl(.004, .004, .5, 0xffffff, [0, -.25, 0], g.punta, 4); hilo.castShadow = false;
    g.plumas = group([0, -.5, 0], g.punta);
    [[0xff5c9a, .3], [0x4fd1c5, -.3], [0xf3c54d, 0]].forEach(([c, r]) => { const p = box(.04, .2, .01, c, [r * .1, -.08, 0], g.plumas); p.rotation.z = r; });
    return g;
  }
  function pedazos(n, centro, radio, colores = [0xffffff, 0x3f7fb0, 0xf4efe6]) {
    return Array.from({ length: n }, (_, k) => { const a = k * 2.4, r = radio * (.3 + ((k * 37) % 10) / 14);
      const b = box(.06 + (k % 3) * .03, .015, .05 + (k % 2) * .04, colores[k % colores.length], [centro[0] + Math.cos(a) * r, .01, centro[1] + Math.sin(a) * r]);
      b.rotation.y = k; return b; });
  }
  function gotas(n, parent) { return Array.from({ length: n }, () => { const d = ball(.025, 0x6fc3ff, [0, 0, 0], parent, 0, { emissive: 0x2a8fe0, ei: .4, opacity: .85 }); d.castShadow = false; d.visible = false; return d; }); }
  const CAT = { s: 1.5 };

  // 1 · gancho: el gato te mira a los ojos y empuja el vaso al borde… ¡y lo tira!
  escena('gancho', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x5f7fa8, bottom: 0xf0c08e });
      comedor();
      this.g = gato({ pos: [.15, TOP, -.05], ...CAT }); this.g.rotation.y = -.25;
      this.v = vaso([.62, TOP, .25], null, 1.4);
      this.gt = gotas(10); this.pv = polvo([.5, 1.4, 0], [3, 2, 2], 80); rayoLuz([1.6, 2.2, -1.6], [.5, 0, .4], { op: .1 }); },
    update(lt, c) {
      const tt = c.w('tira') - .05; polvoMueve(this.pv, lt); gatoGesto(this.g, lt < tt + .3 ? 'travieso' : 'feliz');                 // momento en que el vaso pasa el borde
      // gato: mira a cámara; la pata derecha empuja despacio
      this.g.head.rotation.y = .3 + Math.sin(lt * .8) * .05; this.g.head.rotation.z = -.08; colaGato(this.g, lt, .8, .6); ojosCazador(this.g, lt > tt ? .2 : .55);
      const push = lt < tt ? (Math.abs(Math.sin(lt * 2.4)) * .7 + .3) : Math.max(0, 1 - (lt - tt) * 2);
      patita(this.g, push * .9, 1); this.g.legs[1].rotation.z = -.35 * push;
      // vaso: avanza a toquecitos hasta el borde y cae girando
      const x0 = .62, xb = .97; let x = lerp(x0, xb, ease(lt / tt)), y = TOP, rz = 0;
      if (lt > tt) { const f = lt - tt; x = xb + f * .5; y = TOP - 4.9 * f * f; rz = -f * 6; }
      this.v.position.set(x, Math.max(y, -.4), .25); this.v.rotation.z = rz; this.v.visible = y > -.3;
      if (lt > tt) c.ev('whoosh', tt, .5);
      const tc = tt + Math.sqrt(TOP / 4.9); if (lt > tc) c.ev('crack', tc, 1);
      this.gt.forEach((d, k) => { const f = lt - tc; d.visible = f > 0 && f < .9; const a = k * .63; d.position.set(1.3 + Math.cos(a) * f * .9, .03 + f * 2.2 - f * f * 4.6, .25 + Math.sin(a) * f * .9); });
      const p = einout(lt / c.dur);
      cam([lerp(1.1, .9, p), lerp(1.4, 1.3, p), lerp(4.6, 4.2, p)], [lerp(.45, .55, p), lerp(1.1, 1.05, p), 0], 46);
      rotulo('¿Por qué lo hace?', 'te mira… y lo tira', lt - .05, 1330); c.ev('pop', .05, .6);
    }
  });
  // 2 · modo cazador: pupilas grandes, cola que latiguea y toquecitos a una corcholata… que se vuelve ratón
  escena('cazador', {
    setup() { ambiente({ top: 0x22283f, bottom: 0x6a4a5e, fog: 0x22283f, near: 5, far: 18, sunColor: 0xffc890, sunInt: 2.2, hemiInt: .8, sunPos: [-4, 7, 5] });
      comedor({ pared: 0x8a8098, vidrio: 0x2a3a6e, mantel: 0xc0583f });
      this.g = gato({ pos: [-.35, TOP, -.05], ...CAT }); this.g.rotation.y = 1.15;
      this.tapa = cyl(.07, .07, .04, 0xd94a3a, [.55, TOP + .02, .1], null, 10);
      this.r = raton([.5, TOP, .1], null, 2); this.r.rotation.y = -1.4; this.r.visible = false;
      this.on = ondas([.55, TOP + .05, .1], { color: 0xf3c54d, n: 3, vel: 2, alcance: .4, grosor: .012, dir: [Math.PI / 2, 0, 0] }); },
    update(lt, c) {
      const tr = c.w('ratón') - .1;
      ojosCazador(this.g, ease(lt / .6)); colaGato(this.g, lt, 1.8, 1.4); gatoGesto(this.g, 'enojado');
      this.g.body.rotation.x = .12; this.g.head.rotation.x = .15; 
      const tap = lt > c.w('patita') - .2 ? Math.abs(Math.sin((lt - c.w('patita')) * 6)) : 0; patita(this.g, tap * .8, 1);
      const hit = tap > .75; this.tapa.position.x = .55 + Math.sin(lt * 6) * .02 * (tap > .3 ? 1 : 0);
      this.on.update(lt, tap > .2 && lt < tr);
      [1.5, 2.0, 2.5, 3.0].forEach(t => { if (lt > t) c.ev('click', t, .4); });
      this.tapa.visible = lt < tr; this.r.visible = lt >= tr; this.r.scale.setScalar(2 * Math.max(.01, spring((lt - tr) / .5)));
      if (lt > tr) c.ev('pop', tr, .8);
      const p = einout(lt / c.dur);
      cam([lerp(.1, .3, p), lerp(1.3, 1.15, p), lerp(3.9, 3.3, p)], [.15, 1.1, 0], 46);
      etiqueta('PUPILAS GRANDES', [-.2, 1.75, 0], lt - .4, 46, '#ffffff', true);
      etiqueta('¿ESTÁ VIVO?', [.35, 1.3, .1], lt - c.w('vivo'), 54, '#f3c54d');
      rotulo('1 · Cazador', 'prueba si algo está vivo', lt - .05, 1330); c.ev('whoosh', .05, .4);
    }
  });
  // 3 · curiosidad: cámara lenta desde el piso; el vaso cae y el gato se asoma por el borde a ver qué pasa
  escena('caida', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x4f6f9e, bottom: 0xf3c08e, fog: 0xc9b39a, near: 6, far: 24 });
      comedor({ mantel: 0x4fd1c5 });
      this.g = gato({ pos: [.55, TOP, 0], ...CAT }); this.g.rotation.y = Math.PI / 2;
      this.v = vaso([1.05, TOP, .1], null, 1.4); this.gt = gotas(14); this.sombra = null; },
    update(lt, c) {
      const t0 = .5, tc = c.w('cae') + .15, f = cl((lt - t0) / (tc - t0));
      // caída en cámara lenta (gira media vuelta)
      const y = TOP + .1 - (TOP + .1) * f * f; this.v.position.set(1.1 + f * .25, Math.max(y, 0), .1); this.v.rotation.z = -f * 2.2;
      this.v.agua.scale.y = 1; this.v.visible = lt < tc + .05;
      // el gato se asoma y sigue el vaso con la cabeza
      this.g.head.rotation.x = lerp(0, .9, ease((lt - t0) / 1.6)); this.g.head.rotation.z = .25 * Math.sin(lt * 1.5);
      this.g.body.rotation.z = 0; this.g.position.x = .55 + .12 * ease(lt / 1);
      ojosCazador(this.g, .9); colaGato(this.g, lt, 1, .7); gatoGesto(this.g, lt > c.w('cae') + .15 ? 'feliz' : 'sorpresa');
      if (lt > tc) { c.ev('crack', tc, 1); }
      this.gt.forEach((d, k) => { const ff = lt - tc; d.visible = ff > 0 && ff < 1.1; const a = k * .45; d.position.set(1.35 + Math.cos(a) * ff * 1.0, .03 + ff * 2.4 - ff * ff * 4.6, .1 + Math.sin(a) * ff * 1.0); });
      if (lt > tc) { this.ped ??= pedazos(9, [1.35, .1], .45, [0xdff3ff, 0xbfe3ff, 0xffffff]); }
      const p = einout(lt / c.dur);
      cam([lerp(2.9, 2.7, p), lerp(.45, .55, p), lerp(4.0, 3.6, p)], [lerp(.9, 1.0, p), lerp(1.15, .95, p), 0], 48);
      if (lt > tc) etiqueta('¡CRASH!', [1.35, .6, .1], lt - tc, 84, '#f3c54d');
      etiqueta('¿QUÉ PASA SI…?', [.6, 1.45, 0], lt - .3, 50, '#ffffff', true);
      rotulo('2 · Curiosidad', 'le parece divertidísimo', lt - .05, 1330); c.ev('whoosh', .05, .4);
      if (lt > c.w('divertid')) c.ev('ding', c.w('divertid'), .5);
    }
  });
  // 4 · tu atención: suena el golpe, tú llegas corriendo; el gato, tranquilísimo sobre la mesa
  escena('atencion', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x5f7fa8, bottom: 0xf0c08e });
      comedor();
      this.g = gato({ pos: [.3, TOP, 0], ...CAT }); this.g.rotation.y = .5;
      this.ped = pedazos(10, [1.25, .3], .4, [0xdff3ff, 0xbfe3ff, 0xffffff]);
      this.pr = persona({ pos: [-3, 0, 1], shirt: 0x7f5fd6, pants: 0x3d4a66, hair: 0x2a1a14 }); this.pr.rotation.y = 1.2;
      this.on = ondas([1.25, .1, .3], { color: 0xff7a59, n: 3, vel: 2, alcance: .8, grosor: .02, dir: [Math.PI / 2, 0, 0] }); },
    update(lt, c) {
      const tr = c.w('llegas') - .3, k = ease((lt - tr) / .9);
      this.on.update(lt, lt < tr + .3); if (lt > .05) c.ev('crack', .05, .5);
      // la persona entra corriendo
      const run = lt > tr && k < 1;
      this.pr.position.x = lerp(-3, -.65, k); this.pr.position.z = lerp(1.4, .8, k);
      const sw = run ? Math.sin(lt * 18) * .7 : 0; this.pr.legL.rotation.x = sw; this.pr.legR.rotation.x = -sw;
      this.pr.armL.rotation.x = -sw; this.pr.armR.rotation.x = sw;
      if (k >= 1) { pose(this.pr, 'brazosArriba', ease((lt - tr - .9) / .3), lt); }
      gesto(this.pr, 'sorpresa'); this.pr.head.rotation.y = .3;
      if (lt > tr) c.ev('whoosh', tr, .6);
      // el gato: satisfecho, voltea a verte
      this.g.head.rotation.y = lerp(.4, -.6, ease((lt - tr - .4) / .5)); colaGato(this.g, lt, .5, .4); ojosCazador(this.g, lt > tr + .6 ? .1 : .5); gatoSentar(this.g, 1); gatoGesto(this.g, lt > tr + .6 ? 'feliz' : 'neutral');
      const p = einout(lt / c.dur);
      cam([lerp(.3, 0, p), lerp(1.5, 1.6, p), lerp(5.8, 5.5, p)], [lerp(.05, -.1, p), 1.05, .3], 46);
      etiqueta('¡¿QUÉ PASÓ?!', [-.6, 1.3, .9], lt - tr - .5, 54, '#ffffff', true);
      if (lt > tr + .9) etiqueta('MISIÓN CUMPLIDA', [.35, 1.85, 0], lt - tr - .9, 44, '#f3c54d');
      rotulo('3 · Tu atención', 'si tira algo, tú vienes', lt - .05, 1330); c.ev('pop', .05, .5);
    }
  });
  // 5 · el truco: juega con él con una varita de plumas; el gato salta tras ellas
  escena('truco', {
    setup() { ambiente(AMB.cuartoDia); setCuarto({ noche: false, tapete: 0x2f8f83 });
      this.pr = persona({ pos: [-.9, 0, .6], shirt: 0x7f5fd6, pants: 0x3d4a66, hair: 0x2a1a14 }); this.pr.rotation.y = .9;
      this.vr = varita(this.pr.armR, [0, -.78, 0]); this.vr.rotation.x = Math.PI / 2 + .2;
      this.g = gato({ pos: [.4, 0, 1.0], ...CAT }); this.g.rotation.y = -1.2;
      this.hil = []; },
    update(lt, c) {
      // brazo con la varita dibujando ochos
      this.pr.armR.rotation.x = -1.0 + Math.sin(lt * 3) * .25; this.pr.armR.rotation.z = .5 + Math.sin(lt * 1.5) * .3; gesto(this.pr, 'feliz');
      this.vr.punta.rotation.z = Math.sin(lt * 4) * .5; this.vr.plumas.rotation.y = lt * 3;
      // gato: saltitos con las patas delanteras hacia arriba
      const j = Math.max(0, Math.sin(lt * 4.2)); this.g.position.y = j * .3; this.g.rotation.x = -j * .5;
      patita(this.g, j, 1); patita(this.g, j * .8, 0); ojosCazador(this.g, 1); colaGato(this.g, lt, 1.4, 1.2);
      this.g.head.rotation.x = -.3 * j;
      if (Math.sin(lt * 4.2) > .95) c.ev('pop', Math.round(lt * 10) / 10, .3);
      const p = einout(lt / c.dur);
      cam([lerp(.6, .3, p), lerp(1.35, 1.45, p), lerp(5.9, 5.4, p)], [-.1, 1.0, .7], 46);
      etiqueta('A DIARIO', [-.9, 1.6, .6], lt - c.w('diario'), 50, '#ffffff', true); gatoGesto(this.g, 'feliz');
      etiqueta('JUGUETES QUE SE MUEVEN', [.3, .15, 1.4], lt - c.w('juguetes'), 42, '#f3c54d', true);
      rotulo('El truco', 'juega con él', lt - .05, 1330); c.ev('ding', .05, .5);
    }
  });
  // 6 · remate: platos rotos en el piso, el gato orgulloso; tu amigo se encoge de hombros
  escena('remate', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x6f8fc2, bottom: 0xf2c58e });
      comedor({ mantel: 0xff7a59 });
      // repisa con platos que quedan
      box(1.4, .05, .3, 0x6b4428, [-1.3, 1.6, -2.0]); this.pl = [-1.7, -1.4, -1.1].map(x => { const p = cyl(.13, .13, .02, 0xf4efe6, [x, 1.76, -1.98], null, 14); p.rotation.x = Math.PI / 2 - .2; return p; });
      this.ped = pedazos(16, [.9, .7], .7, [0xffffff, 0x3f7fb0, 0xf4efe6, 0xd9a93a]);
      this.g = gato({ pos: [-.1, TOP, 0], ...CAT }); this.g.rotation.y = .25;
      this.pr = persona({ pos: [1.15, 0, .35], shirt: 0x3fa37a, pants: 0x3d4a66, hair: 0x1c1410 }); this.pr.rotation.y = -.7; },
    update(lt, c) {
      const tv = c.w('vajilla') - .2;
      colaGato(this.g, lt, .6, .5); ojosCazador(this.g, 0); gatoSentar(this.g, 1); gatoGesto(this.g, 'travieso'); this.g.head.rotation.y = .1 + Math.sin(lt * .9) * .1; this.g.head.rotation.z = .1;
      pose(this.pr, 'encoger', ease((lt - .6) / .4)); gesto(this.pr, lt > .6 ? 'triste' : 'sorpresa'); this.pr.head.rotation.x = .25;
      const p = einout(lt / c.dur);
      cam([lerp(.4, .5, p), lerp(1.5, 1.55, p), lerp(5.6, 5.1, p)], [.5, 1.0, .3], 46);
      etiqueta('MEDIA VAJILLA', [.6, .75, .9], lt - tv, 56, '#f3c54d', true); if (lt > tv) c.ev('crack', tv, .5);
      etiqueta('@TU AMIGO', [1.15, 1.6, .55], lt - c.w('quien'), 58, '#ffffff'); if (lt > c.w('quien')) c.ev('pop', c.w('quien'), .7);
      rotulo('Mándaselo', 'a quien tiene un gato así', lt - .05, 1330); c.ev('whoosh', .05, .4);
    }
  });
}
