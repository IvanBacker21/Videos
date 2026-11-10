// Short 3D: ¿Por qué tu perro te sigue hasta al baño? (vienen de los lobos, animales de manada: para tu perro, tú eres su
// manada; además aprendió que contigo llegan cosas buenas —comida, caricias, paseos— y por eso te sigue; truco: si llora cuando
// no te ve, premiar los momentos en que se queda tranquilo. Fuentes: AKC "Why does my dog follow me everywhere", PetMD).
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-10-1800-perro-bano.json OUT ../ejemplos/2026-11-10-1800-perro-bano.js
// Mejora del motor en este short (MEJORAS 0l2): perro() con ojos grandes y cejas (estilo mezcla), perroGesto() y perroSalta().
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    gesto, pose, hablar, ondas, perro, perroAnda, perroSentar, perroGesto, perroSalta, setJardin, setBano, setCocina, setCuarto,
    caminar, sentar, galleta, polvo, polvoMueve, rayoLuz, AMB } = E;

  const camRig = (lt, dur, a, b, la, lb, fov = 46) => { const q = einout(cl(lt / dur));
    cam([lerp(a[0], b[0], q), lerp(a[1], b[1], q), lerp(a[2], b[2], q)], [lerp(la[0], lb[0], q), lerp(la[1], lb[1], q), lerp(la[2], lb[2], q)], fov); };
  function corazon(pos, s = .12, parent) { const g = group(pos, parent); const m = { emissive: 0xff4a6a, ei: .7 };
    ball(s * .55, 0xff4a6a, [-s * .38, s * .2, 0], g, 1, m); ball(s * .55, 0xff4a6a, [s * .38, s * .2, 0], g, 1, m);
    const b = box(s * .95, s * .95, s * .5, 0xff4a6a, [0, -s * .2, 0], g, m); b.rotation.z = Math.PI / 4; g.children.forEach(c => c.castShadow = false); return g; }
  function marca(pos, s = .5, parent) { const g = group(pos, parent), col = 0x46d16a, m = { emissive: col, ei: .8 };
    const a = box(s * .18, s * .5, s * .18, col, [-s * .22, -s * .05, 0], g, m); a.rotation.z = .8; const b = box(s * .18, s * .95, s * .18, col, [s * .12, s * .12, 0], g, m); b.rotation.z = -.6;
    g.children.forEach(c => c.castShadow = false); g.scale.setScalar(.001); return g; }
  function celular(p) { box(.1, .18, .02, 0x1c1c22, [0, -.78, .14], p.armR); return box(.085, .15, .005, 0x7fd0ff, [0, -.78, .155], p.armR, { emissive: 0x7fd0ff, ei: 1.1 }); }
  function corazones(n, s = .13) { return Array.from({ length: n }, () => corazon([0, -9, 0], s)); }
  function subirCorazones(hs, lt, t0, base, c) { hs.forEach((h, k) => { const u = (lt - t0 - k * .18) / 1.2; h.visible = u > 0 && u < 1; const e = eout(u);
    h.position.set(base[0] + (k - (hs.length - 1) / 2) * .17 + Math.sin(lt * 4 + k) * .04, base[1] + e * .5, base[2]); h.scale.setScalar(Math.max(.001, spring(u * 1.4) * (1 - .3 * u)));
    h.rotation.y = Math.sin(lt * 3 + k) * .5; if (u > 0) c.ev('pop', t0 + k * .18, .3); }); }

  // 1 · gancho: tú en el escusado… y tu perro sentado junto a ti, mirándote fijo
  escena('gancho', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x7f9fcf, bottom: 0xf6d6a8 }); this.b = setBano({ acento: 0x3f8fa6 });
      this.p = persona({ pos: [0, this.b.personaY, this.b.asiento[2]], shirt: 0xc0583f, pants: 0x3d4a66 }); sentar(this.p, 1);
      this.cel = celular(this.p);
      this.d = perro({ pos: [1.2, 0, .3], s: 1.0, color: 0xd9a35a, mancha: 0xf6e6c8, oscuro: 0x7a4a22, collar: 0x3f7fd6 }); this.d.rotation.y = -Math.PI / 2 + .35;
      const luz = new THREE.PointLight(0xffe2b0, 1.6, 6, 1.5); luz.position.set(.6, 2.4, 1.4); E.world.add(luz);
      this.pv = polvo([.3, 1.2, .4], [3, 2, 2], 90); },
    update(lt, c) {
      const tb = c.w('baño');
      perroSentar(this.d, 1); perroGesto(this.d, 'atento', lt);
      this.d.head.rotation.y = lt > tb - .2 ? .55 * ease((lt - tb + .2) / .4) : 0;   // al final voltea a cámara
      const p = this.p; p.armR.rotation.x = -1.0; p.armR.rotation.z = .2; p.armL.rotation.x = -.3;
      p.head.rotation.y = lt < .7 ? 0 : .75 * ease((lt - .7) / .35); gesto(p, lt < .7 ? 'neutral' : 'sorpresa');
      polvoMueve(this.pv, lt);
      camRig(lt, c.dur, [1.0, 1.4, 4.1], [.8, 1.15, 3.25], [.55, .8, 0], [.6, .75, .05], 48);
      etiqueta('¿HASTA AQUÍ?', [.95, 1.5, .3], lt - .7, 58, '#f3c54d', true);
      rotulo('Ni en el baño', 'te deja solo', lt - tb, 1330);
      c.ev('pop', 0, .35); if (lt > .7) c.ev('whoosh', .7, .4); if (lt > tb) c.ev('ding', tb, .5);
    }
  });
  // 2 · manada: lobos caminando juntos bajo la luna; luego al frente apareces tú con tu perro
  escena('manada', {
    setup() { ambiente(AMB.bosqueNoche); this.j = setJardin({ noche: true, casa: false, cerca: false, w: 10, d: 14, pastoN: 2400 });
      const lz = new THREE.PointLight(0xcfe0ff, 3, 8, 1.4); lz.position.set(1, 3, 3); E.world.add(lz); this.lz = lz;
      this.lobos = [[-1.0, -1.2], [0, -1.8], [1.0, -1.1]].map(([x, z], i) => { const l = perro({ lobo: true, pos: [x, 0, z], s: 1.05 + (i === 1 ? .15 : 0), color: 0x8a8f98, mancha: 0xdfe3e8, oscuro: 0x4a4f58 }); l.userData.z0 = z; return l; });
      this.p = persona({ pos: [-.45, 0, .5], shirt: 0x2f8f83, pants: 0x3d4a66 }); this.p.userData.z0 = .5;
      this.d = perro({ pos: [.55, 0, .45], s: .95, color: 0xd9a35a, mancha: 0xf6e6c8, oscuro: 0x7a4a22, collar: 0xf3c54d }); this.d.userData.z0 = .45;
      this.p.scale.setScalar(.001); this.d.scale.setScalar(.001); },
    update(lt, c) {
      this.j.pasto.update(lt, .5);
      const t2 = c.f(1), m = lt * .45;
      this.lobos.forEach((l, i) => { l.position.z = l.userData.z0 + m; perroAnda(l, lt + i * .37, .8, .4); l.head.rotation.y = Math.sin(lt * .8 + i) * .15; });
      const k = spring((lt - t2 + .1) / .8);
      this.p.scale.setScalar(Math.max(.001, k)); this.d.scale.setScalar(Math.max(.001, k * .95));
      this.p.position.z = this.p.userData.z0 + m; caminar(this.p, lt, .7); gesto(this.p, 'feliz');
      this.d.position.z = this.d.userData.z0 + m; perroAnda(this.d, lt, .8, 1); this.d.head.rotation.y = -.35; // mira hacia ti
      this.j.pasto.position.z = 0; this.lz.position.z = 3 + m;
      camRig(lt, c.dur, [1.6, 1.5, 4.6], [.3, 1.35, 4.9 + m * 0], [0, .7, -.6], [0, .9, .3], 50);
      E.camera.position.z += m; E.camera.lookAt(lerp(0, 0, 1), lerp(.7, .9, ease(lt / c.dur)), lerp(-.6, .3, ease(lt / c.dur)) + m);
      etiqueta('MANADA', [0, 1.55, -1.6 + m], lt - .4, 58, '#dfe8ff', true);
      etiqueta('TÚ', [-.45, 1.3, .8 + m], lt - t2 - .3, 64, '#f3c54d', true);
      rotulo('Tú eres su manada', 'por eso no se separa de ti', lt - t2, 1330);
      c.ev('whoosh', 0, .35); if (lt > t2) c.ev('pop', t2, .5); if (lt > t2 + .3) c.ev('ding', t2 + .3, .45);
    }
  });
  // 3 · premio: caminas por la cocina y te sigue; croquetas y caricias
  escena('premio', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x7aa0d0, bottom: 0xffd59a }); this.k = setCocina({ acento: 0x4f8a7a });
      this.p = persona({ pos: [-1.9, 0, -.3], shirt: 0xc0583f, pants: 0x3d4a66 }); this.p.rotation.y = Math.PI / 2;
      this.d = perro({ pos: [-2.9, 0, -.15], s: 1.0, color: 0xd9a35a, mancha: 0xf6e6c8, oscuro: 0x7a4a22, collar: 0x3f7fd6 }); this.d.rotation.y = Math.PI / 2;
      this.plato = group([.2, 0, 1.25]); const pl = cyl(.24, .18, .1, 0xe0403a, [0, .05, 0], this.plato, 20); cyl(.19, .19, .02, 0x8a2420, [0, .09, 0], this.plato, 20);
      this.croq = Array.from({ length: 14 }, (_, i) => { const a = i * 2.4, r = .05 + (i % 4) * .035; return ball(.032, 0x8a5a2e, [Math.cos(a) * r, .12 + (i % 3) * .02, Math.sin(a) * r], this.plato, 1, { facetas: true }); });
      this.croq.forEach(b => b.visible = false);
      this.hs = corazones(4); },
    update(lt, c) {
      const tc = c.w('croquetas'), tca = c.w('caricias');
      // caminas → te sigue
      const w = ease(lt / 1.6), p = this.p, d = this.d;
      p.position.x = lerp(-1.9, .2, w); if (w < 1) caminar(p, lt, .9); else { sentar(p, 0); ['L', 'R'].forEach(s => { p['leg' + s].rotation.x = 0; p['knee' + s].rotation.x = 0; }); }
      p.rotation.y = lerp(Math.PI / 2, .25, ease((lt - 1.5) / .4));
      d.position.x = lerp(-2.9, .75, ease((lt - .2) / 1.7)); d.position.z = lerp(-.15, .55, ease((lt - 1.2) / .7));
      d.rotation.y = lerp(Math.PI / 2, -.45, ease((lt - 1.6) / .4));
      const sit = ease((lt - 2.0) / .3); if (sit < .01) perroAnda(d, lt, 1, 1); else { perroSentar(d, sit); perroGesto(d, 'feliz', lt); }
      // croquetas
      this.croq.forEach((b, i) => { const t0 = tc + i * .04; b.visible = lt > t0; b.position.y = .12 + (i % 3) * .02 + Math.max(0, .5 - (lt - t0) * 2.5); });
      if (lt > tc) c.ev('pop', tc, .4);
      // caricias: brazo hacia la cabeza del perro + corazones
      const ka = ease((lt - tca + .2) / .4); p.armR.rotation.x = lerp(0, -.75 + Math.sin(lt * 7) * .12 * ka, ka); p.armR.rotation.z = lerp(0, .25, ka);
      gesto(p, lt > tca - .2 ? 'feliz' : 'neutral');
      subirCorazones(this.hs, lt, tca, [1.05, 1.0, .6], c);
      camRig(lt, c.dur, [-1.2, 1.45, 3.9], [.7, 1.2, 3.5], [-1.5, .75, 0], [.35, .7, .3], 50);
      etiqueta('CROQUETAS', [.2, .55, 1.25], lt - tc, 50, '#f3c54d', true);
      etiqueta('CARICIAS', [.4, 2.15, .4], lt - tca, 50, '#ff9ab0', true);
      rotulo('Contigo llega lo bueno', 'comida, caricias y paseos', lt - c.w('aprendió'), 1330);
      c.ev('whoosh', 0, .35);
    }
  });
  // 4 · truco: llora en la puerta cuando no te ve… y le das premio cuando se queda tranquilo en su cama
  escena('truco', {
    setup() { ambiente(AMB.cuartoDia); this.cu = setCuarto({ noche: false, tapete: 0x3f8fa6 });
      this.puerta = box(.95, 2.1, .08, 0x9a6a42, [2.2, 1.05, -2.3]); ball(.05, 0xd9c08a, [1.85, 1.0, -2.24], null, 0, { metal: .6 });
      this.camaP = group([.2, 0, .9]); const cj = cyl(.62, .62, .14, 0x3f8fa6, [0, .07, 0], this.camaP, 24); cj.scale.z = .8; const bo = cyl(.68, .68, .2, 0x2f6f86, [0, .1, -.05], this.camaP, 24); bo.scale.set(1, 1, .82); cj.position.y = .16;
      this.d = perro({ pos: [2.1, 0, -1.3], s: 1.0, color: 0xd9a35a, mancha: 0xf6e6c8, oscuro: 0x7a4a22, collar: 0x3f7fd6 }); this.d.rotation.y = Math.PI;
      this.on = ondas([1.55, 1.3, -1.45], { color: 0x9fc4ff, n: 3, vel: 1.2, alcance: .3, grosor: .014, dir: [0, -.35, 0] });
      this.gal = galleta([0, -9, 0], .12); this.ok = marca([-.55, 1.25, .9], .45);
      this.rl = rayoLuz([1.5, 2.6, -1.6], [.55, 0, .45], { op: .12 }); },
    update(lt, c) {
      const tp = c.w('prémialo') - .15, B = lt > tp, d = this.d;
      if (!B) { d.position.set(2.0, 0, -1.7); d.rotation.y = -.35; d.rotation.x = 0; perroSentar(d, 1); perroGesto(d, 'triste', lt); d.head.rotation.x = .3; this.on.update(lt, true); this.on.visible = true;
        camRig(lt, tp, [1.1, 1.25, 1.5], [1.45, 1.1, .9], [1.9, .75, -1.6], [2.0, .7, -1.6], 46);
        etiqueta('NO TE VE', [2.45, 1.3, -2.1], lt - c.w('llora'), 50, '#9fc4ff', true);
      } else { const u = lt - tp; d.position.set(.2, .22, .9); d.rotation.y = -.25; perroSentar(d, 1); perroGesto(d, u > .9 ? 'feliz' : 'neutral', lt); this.on.visible = false;
        const g = this.gal; g.position.set(.2 + .02, lerp(2.0, 1.05, eout(u / .6)), 1.25); g.rotation.z = u * 5; g.visible = u < 1.0;
        if (u > .55) { d.jaw.rotation.x = .25 * Math.abs(Math.sin(u * 10)); }
        this.ok.scale.setScalar(Math.max(.001, spring((u - .8) / .8))); this.ok.rotation.y = Math.sin(lt * 2) * .35;
        camRig(u, c.dur - tp, [1.1, 1.35, 3.7], [.75, 1.25, 3.2], [.2, .75, .7], [.2, .8, .8], 46);
        etiqueta('TRANQUILO', [.2, 2.2, .9], u - .8, 54, '#7fe3a0', true);
        c.ev('whoosh', tp, .4); if (u > .6) c.ev('pop', tp + .6, .4); if (u > .8) c.ev('ding', tp + .8, .55);
      }
      rotulo('Premia la calma', 'no cuando llora', lt - tp, 1330);
      c.ev('heartbeat', .2, .3);
    }
  });
  // 5 · remate: otra vez en el baño; tú riéndote con el celular y tu perro brincando de gusto
  escena('remate', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x7f9fcf, bottom: 0xffc98a }); this.b = setBano({ acento: 0xe0703a });
      this.p = persona({ pos: [0, this.b.personaY, this.b.asiento[2]], shirt: 0x2f8f83, pants: 0x3d4a66 }); sentar(this.p, 1); this.pant = celular(this.p);
      this.d = perro({ pos: [.9, 0, .55], s: 1.05, color: 0xd9a35a, mancha: 0xf6e6c8, oscuro: 0x7a4a22, collar: 0x3f7fd6 }); this.d.rotation.y = -.55;
      this.on = ondas([0, 0, 0], { color: 0x7fe3a0, n: 3, vel: 1.3, alcance: .5, grosor: .014 });
      this.hs = corazones(3, .11); },
    update(lt, c) {
      const p = this.p; p.armR.rotation.x = -1.05; p.armR.rotation.z = .2; p.head.rotation.x = .2 - .2 * ease((lt - 1.0) / .4);
      gesto(p, 'feliz'); hablar(p, lt, .5);
      const hop = perroSalta(this.d, lt, { periodo: .75, alto: .4 }); perroGesto(this.d, 'feliz', lt); this.d.legs.forEach((L, k) => L.rotation.x = (k < 2 ? -.7 : .7) * hop);
      p.updateMatrixWorld(true); const cp = this.pant.getWorldPosition(new THREE.Vector3()); this.on.position.copy(cp); this.on.update(lt, lt > .3);
      subirCorazones(this.hs, lt, .6, [.9, 1.5, .55], c);
      camRig(lt, c.dur, [.8, 1.4, 3.9], [.55, 1.2, 3.1], [.35, .85, .1], [.4, .8, .15], 48);
      rotulo('Mándaselo', 'a quien no va solo al baño', lt - c.w('Mándaselo'), 1330);
      c.ev('whoosh', 0, .35); if (lt > .3) c.ev('click', .3, .4);
    }
  });
}
