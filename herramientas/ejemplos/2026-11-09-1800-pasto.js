// Short 3D: ¿Por qué tu perro come pasto? (mito: no es porque esté enfermo — estudio de UC Davis, Sueda, Hart y Cliff 2008:
// casi ningún perro mostraba malestar antes y la mayoría no vomitó después; hipótesis: herencia de los lobos, que también comen
// plantas y así ayudarían a barrer parásitos del intestino; a muchos simplemente les gusta; truco: pasto sin químicos y, si
// vomita seguido, al veterinario).
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-09-1800-pasto.json OUT ../ejemplos/2026-11-09-1800-pasto.js
// Mejora del motor en este short (MEJORAS 0l): perroSentar(), perroCome(), perro({lobo}), pasto() (InstancedMesh que se mece),
// arbol() y setJardin() con AMB.jardin / AMB.bosqueNoche.
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    gesto, pose, hablar, gas, ondas, perro, perroAnda, perroSentar, perroCome, pasto, setJardin, tuboDigestivo, germenes, AMB, disco } = E;

  const camRig = (lt, dur, a, b, la, lb, fov = 46) => { const q = einout(cl(lt / dur));
    cam([lerp(a[0], b[0], q), lerp(a[1], b[1], q), lerp(a[2], b[2], q)], [lerp(la[0], lb[0], q), lerp(la[1], lb[1], q), lerp(la[2], lb[2], q)], fov); };
  function corazon(pos, s = .12, parent) { const g = group(pos, parent); const m = { emissive: 0xff4a6a, ei: .7 };
    ball(s * .55, 0xff4a6a, [-s * .38, s * .2, 0], g, 1, m); ball(s * .55, 0xff4a6a, [s * .38, s * .2, 0], g, 1, m);
    const b = box(s * .95, s * .95, s * .5, 0xff4a6a, [0, -s * .2, 0], g, m); b.rotation.z = Math.PI / 4; g.children.forEach(c => c.castShadow = false); return g; }
  function marca(pos, ok, s = .5, parent) { const g = group(pos, parent), col = ok ? 0x46d16a : 0xff4a4a, m = { emissive: col, ei: .8 };
    if (ok) { const a = box(s * .18, s * .5, s * .18, col, [-s * .22, -s * .05, 0], g, m); a.rotation.z = .8; const b = box(s * .18, s * .95, s * .18, col, [s * .12, s * .12, 0], g, m); b.rotation.z = -.6; }
    else { const a = box(s * .18, s, s * .18, col, [0, 0, 0], g, m); a.rotation.z = .78; const b = box(s * .18, s, s * .18, col, [0, 0, 0], g, m); b.rotation.z = -.78; }
    g.children.forEach(c => c.castShadow = false); g.scale.setScalar(.001); return g; }
  function rociador(pos) { const g = group(pos); cyl(.09, .1, .32, 0x8a4fd0, [0, .16, 0], g, 8); box(.07, .08, .14, 0xeeeeee, [0, .36, .03], g); box(.03, .1, .03, 0xeeeeee, [0, .3, .1], g); return g; }
  const ns = (h) => [h, 1.12 * 1, 0];

  // 1 · gancho: el perro come pasto en el jardín y la señora señala preocupada
  escena('gancho', {
    setup() { ambiente(AMB.jardin); this.j = setJardin();
      this.d = perro({ pos: [.2, 0, .7], s: 1.0 }); this.d.rotation.y = -.5;
      this.p = persona({ pos: [-1.15, 0, -.6], shirt: 0xc0583f, pelo: 'largo', hair: 0x8a8a8a }); this.p.rotation.y = .7;
      this.on = ondas([.2, .48, .7], { color: 0xff5c7a, n: 3, vel: 1.4, alcance: .45, grosor: .014, dir: [0, Math.PI / 2 - .5, 0] }); },
    update(lt, c) {
      this.j.pasto.update(lt); this.j.pasto.aplastar(.42, 1.05, .25, .8);
      perroCome(this.d, lt, 1); perroAnda(this.d, lt, 0, .8);
      const td = c.w('duele');
      pose(this.p, 'senalar', ease((lt - .9) / .5), lt); gesto(this.p, lt > td - .3 ? 'sorpresa' : 'neutral'); if (lt > .9) hablar(this.p, lt, .9);
      this.on.update(lt, lt > td);
      camRig(lt, c.dur, [1.5, .75, 3.3], [1.3, 1.3, 4.9], [.05, .45, .6], [-.6, .85, .1], 48);
      etiqueta('¿POR QUÉ COME PASTO?', [.1, 1.05, .7], lt, 50, '#f3c54d', true);
      rotulo('¿Le duele la panza?', 'eso dicen en casa', lt - td, 1330);
      c.ev('pop', 0, .4); if (lt > .9) c.ev('whoosh', .9, .35); if (lt > td) c.ev('heartbeat', td, .5);
    }
  });
  // 2 · mito: muchos perros comiendo pasto, todos sanos (paloma verde en cascada)
  escena('mito', {
    setup() { ambiente({ ...AMB.jardin, top: 0x4f7fc8, bottom: 0xf2c88a }); this.j = setJardin({ w: 10, d: 8, pastoN: 2200, casa: false });
      const cols = [[0xc9925a, 0xf2e2c8, 0x5a3a22], [0x2b2622, 0xd8c8b0, 0x111111], [0xe8d8c0, 0xffffff, 0xb08a60], [0x8b6a4a, 0xe8d8c0, 0x3a2a1c], [0xd9a35a, 0xf6e6c8, 0x7a4a22]];
      this.ps = [[-1.6, -1.2], [0, -1.6], [1.6, -1.1], [-.9, .1], [.9, .2], [-1.9, 1.2], [.1, 1.3], [1.9, 1.3]];
      this.dogs = this.ps.map(([x, z], i) => { const [cc, m, o] = cols[i % 5]; const d = perro({ pos: [x, 0, z], s: .75, color: cc, mancha: m, oscuro: o, collar: [0xe0403a, 0x2f8f83, 0x3f7fd6][i % 3] }); d.rotation.y = (i * 1.9) % 6.28; return d; });
      this.ok = this.ps.map(([x, z]) => marca([x, 1.15, z], true, .45)); },
    update(lt, c) {
      this.j.pasto.update(lt);
      const tn = c.w('ningún'), tv = c.w('vomitó');
      this.dogs.forEach((d, i) => { const come = Math.sin(lt * 1.3 + i * 1.7) > -.4 ? 1 : 0; perroCome(d, lt + i * .3, ease(come), true); perroAnda(d, lt + i, 0, .6); });
      this.ok.forEach((m, i) => { const t0 = tn + i * .12; m.scale.setScalar(Math.max(.001, spring((lt - t0) / .8))); m.rotation.y = Math.sin(lt * 2 + i) * .4; m.position.y = 1.15 + Math.sin(lt * 3 + i) * .04;
        if (lt > t0) c.ev('pop', t0, .35); });
      camRig(lt, c.dur, [0, 1.6, 5.4], [.6, 4.2, 5.2], [0, .3, 0], [0, .1, -.2], 50);
      rotulo('Casi siempre es mito', 'según un estudio con perros', lt - c.w('mito'), 1330);
      etiqueta('SANOS', [0, 1.85, -.4], lt - tn - .5, 64, '#7fe3a0', true);
      etiqueta('NI VOMITARON', [0, 1.45, .4], lt - tv, 48, '#ffffff', true);
      if (lt > c.w('mito')) c.ev('crack', c.w('mito'), .5); if (lt > tv) c.ev('ding', tv, .6);
    }
  });
  // 3 · lobos: un lobo come pasto bajo la luna; rayos X de su tripa: el pasto barre los parásitos
  escena('lobos', {
    setup() { ambiente(AMB.bosqueNoche); this.j = setJardin({ noche: true, casa: false, cerca: false, w: 8, d: 6 });
      this.l = perro({ lobo: true, pos: [-.5, 0, .2], s: 1.35, color: 0x8a8f98, mancha: 0xdfe3e8, oscuro: 0x4a4f58 }); this.l.rotation.y = .9;
      const lz = new THREE.PointLight(0xcfe0ff, 3, 5, 1.4); lz.position.set(.6, 1.8, 2); E.world.add(lz);
      this.t = tuboDigestivo({ pos: [1.15, .35, .3], s: .95, color: 0x7fd0ff, comida: 0 }); this.t.rotation.y = -.25; this.t.visible = false;
      this.fib = Array.from({ length: 9 }, (_, k) => { const b = box(.018, .16, .012, 0x7fdc5a, [0, 0, 0], null, { emissive: 0x5fbf3a, ei: .6 }); b.castShadow = false; b.visible = false; return b; });
      this.gm = germenes(8, { color: 0xff6a5a, r: .035 });
      const luz = new THREE.PointLight(0xaee0ff, 2.2, 5, 1.5); luz.position.set(1.3, 1.4, 1.2); E.world.add(luz); },
    update(lt, c) {
      this.j.pasto.update(lt, .6);
      const tb = c.w('barren'), tx = c.w('cree') - .2, rx = ease((lt - tx) / .5);
      perroCome(this.l, lt, lt < tx + .3 ? 1 : 1 - ease((lt - tx - .3) / .4)); perroAnda(this.l, lt, 0, .3); this.l.tail.rotation.y = 0;
      this.t.visible = rx > .01; this.t.scale.setScalar(.95 * Math.max(.01, rx));
      const ola = lt > tb ? cl((lt - tb) / 1.8) : -1; this.t.update(lt, { ola, apriete: .45, ancho: .06 });
      this.fib.forEach((b, k) => { const tt = ola >= 0 ? cl(ola - .02 - k * .006) : .2 + k * .015; b.visible = rx > .5; b.position.set(...this.t.mundo(tt)); b.position.x += (k % 3 - 1) * .03; b.rotation.z = k; });
      this.gm.G.forEach((g, i) => { const t0 = .35 + i * .07, tt = ola >= 0 ? Math.max(t0, cl(ola + .01)) : t0; const p = this.t.mundo(tt);
        g.visible = rx > .5 && tt < .999; g.position.set(p[0] + Math.sin(i) * .03, p[1] + Math.cos(i * 2) * .03, p[2] + .05); g.rotation.y = lt * 3 + i; });
      camRig(lt, c.dur, [1.4, 1.0, 3.6], [1.9, 1.35, 4.6], [-.3, .7, .2], [.45, .85, .2], 50);
      etiqueta('LOBO', [-.5, 1.5, .2], lt - c.w('lobos'), 56, '#dfe8ff', true);
      etiqueta('PARÁSITOS', [1.05, 1.7, .3], lt - tb, 46, '#ff8a7a', true);
      rotulo('Herencia de los lobos', 'el pasto ayudaría a limpiar la tripa', lt - c.w('heredaron'), 1330);
      if (lt > tx) c.ev('whoosh', tx, .5); if (lt > tb) c.ev('pop', tb, .4);
    }
  });
  // 4 · les gusta: perro sentado masticando feliz, cola a mil y corazones
  escena('gusto', {
    setup() { ambiente({ ...AMB.jardin, top: 0x6fa0e0, bottom: 0xffd59a }); this.j = setJardin();
      this.d = perro({ pos: [0, 0, .8], s: 1.1, color: 0xd9a35a, mancha: 0xf6e6c8, oscuro: 0x7a4a22, collar: 0x3f7fd6 }); this.d.rotation.y = -.25;
      this.h = [0, 1, 2, 3, 4].map(k => corazon([0, 0, 0], .13)); },
    update(lt, c) {
      this.j.pasto.update(lt);
      perroCome(this.d, lt, 0, false); perroSentar(this.d, ease(lt / .35));
      this.d.brizna.visible = true; this.d.brizna.rotation.x = Math.sin(lt * 11) * .3; this.d.jaw.rotation.x = .08 + .22 * Math.abs(Math.sin(lt * 9));
      this.d.tail.rotation.y = Math.sin(lt * 26) * .8; this.d.earL.rotation.z = .5 + Math.sin(lt * 9) * .1; this.d.earR.rotation.z = -.5 - Math.sin(lt * 9) * .1;
      const tg = c.w('gusta') - .2;
      this.h.forEach((h, k) => { const u = (lt - tg - k * .18) / 1.2; h.visible = u > 0 && u < 1; const e = eout(u);
        h.position.set(-.05 + (k - 2) * .17 + Math.sin(lt * 4 + k) * .04, 1.65 + e * .5, .8); h.scale.setScalar(spring(u * 1.4) * (1 - .3 * u)); h.rotation.y = Math.sin(lt * 3 + k) * .5;
        if (u > 0) c.ev('pop', tg + k * .18, .3); });
      camRig(lt, c.dur, [.9, 1.2, 3.4], [.55, 1.3, 2.9], [0, 1.1, .8], [0, 1.2, .8], 46);
      etiqueta('¡ÑAM!', [.4, 1.5, .9], lt - .3, 60, '#f3c54d', true);
      rotulo('Les gusta', 'sobre todo el pasto tierno', lt - tg, 1330);
    }
  });
  // 5 · truco: pasto con químicos (no) vs. pasto limpio (sí); llega la veterinaria
  escena('truco', {
    setup() { ambiente(AMB.jardin); this.j = setJardin({ w: 9, casa: true });
      this.malo = pasto({ pos: [-.95, 0, .3], w: 1.6, d: 1.4, n: 260, h: .3, color: 0x6a7a3a, color2: 0x9a8a4a });
      this.ro = rociador([-1.35, 0, .9]); this.ro.scale.setScalar(1.6);
      this.g = gas([-1.3, .65, .95], [-.8, .25, .2], 34, 0xb07aff);
      this.x = marca([-.95, 1.15, .3], false, .5); this.v = marca([.7, 1.15, .3], true, .5);
      this.d = perro({ pos: [.2, 0, 1.3], s: .9 }); this.d.rotation.y = Math.PI / 2;
      this.vet = persona({ pos: [3.6, 0, .9], bata: true, shirt: 0x5fb0c0, pelo: 'largo', hair: 0x2a1a12 }); this.vet.rotation.y = -Math.PI / 2; },
    update(lt, c) {
      this.j.pasto.update(lt); this.malo.update(lt, .5);
      const tq = c.w('químicos'), tvo = c.w('vomita'), tve = c.w('veterinario');
      this.g.update(lt, lt > .1 && lt < tvo + .5 ? 1 : 0, .7);
      this.x.scale.setScalar(Math.max(.001, spring((lt - tq + .2) / .8))); this.v.scale.setScalar(Math.max(.001, spring((lt - tq - .3) / .8)));
      [this.x, this.v].forEach((m, k) => { m.rotation.y = Math.sin(lt * 2 + k) * .35; });
      // el perro camina al pasto limpio y come
      const w = ease((lt - .2) / 1.2); this.d.position.x = lerp(.2, 1.0, w); this.d.position.z = lerp(1.3, .55, w); this.d.rotation.y = lerp(Math.PI / 2, Math.PI * .15, w);
      if (w < 1) perroAnda(this.d, lt, 1.1, 1); else { perroAnda(this.d, lt, 0, 1); perroCome(this.d, lt, ease((lt - 1.4) / .3)); }
      // llega la veterinaria
      const vv = ease((lt - tvo + .3) / 1.1); this.vet.position.x = lerp(3.2, 1.3, vv);
      this.vet.legL.rotation.x = vv > 0 && vv < 1 ? Math.sin(lt * 9) * .4 : 0; this.vet.legR.rotation.x = -this.vet.legL.rotation.x;
      gesto(this.vet, 'feliz'); if (lt > tve) { pose(this.vet, 'senalar', ease((lt - tve) / .3), lt); hablar(this.vet, lt, .8); }
      camRig(lt, c.dur, [-.2, 1.8, 6.0], [.25, 1.7, 6.3], [-.1, .8, .3], [.2, .85, .3], 52);
      etiqueta('QUÍMICOS', [-.95, 1.7, .3], lt - tq, 46, '#d6b0ff', true);
      etiqueta('VETERINARIO', [.95, 2.15, .9], lt - tve, 46, '#ffffff', true);
      rotulo('Sin químicos', 'y si vomita seguido: al veterinario', lt - .2, 1330);
      if (lt > tq) c.ev('crack', tq - .2, .4); if (lt > tq + .5) c.ev('ding', tq + .5, .5); if (lt > tve) c.ev('pop', tve, .4);
    }
  });
  // 6 · remate: el dueño preocupado con el celular; el perro brinca feliz
  escena('remate', {
    setup() { ambiente({ ...AMB.jardin, top: 0x5a78c0, bottom: 0xf6b98a }); this.j = setJardin();
      this.p = persona({ pos: [-.75, 0, .1], shirt: 0x2f8f83, pants: 0x3d4a66 }); this.p.rotation.y = .35;
      this.cel = box(.1, .18, .02, 0x1c1c22, [0, -.78, .14], this.p.armR); this.pant = box(.085, .15, .005, 0x7fe3a0, [0, -.78, .155], this.p.armR, { emissive: 0x7fe3a0, ei: 1.1 });
      this.d = perro({ pos: [.65, 0, .7], s: 1.0, color: 0xc9925a }); this.d.rotation.y = -.7;
      this.on = ondas([0, 0, 0], { color: 0x7fe3a0, n: 3, vel: 1.3, alcance: .5, grosor: .014 }); },
    update(lt, c) {
      this.j.pasto.update(lt);
      const p = this.p; p.armR.rotation.x = -1.05; p.armR.rotation.z = .25; p.head.rotation.x = .25 - .25 * ease((lt - 1.2) / .4);
      gesto(p, lt < 1.2 ? 'triste' : 'feliz'); if (lt > 1.2) hablar(p, lt, .7);
      // brinco con arco
      const ph = (lt % .8) / .8, hop = Math.sin(ph * Math.PI); this.d.position.y = hop * .35; this.d.rotation.x = -.25 * Math.cos(ph * Math.PI);
      perroAnda(this.d, lt, 0, 1.4); this.d.legs.forEach((L, k) => L.rotation.x = (k < 2 ? -.5 : .5) * hop); this.d.jaw.rotation.x = .25;
      p.updateMatrixWorld(true); const cp = this.pant.getWorldPosition(new THREE.Vector3()); this.on.position.copy(cp); this.on.update(lt, lt > .3);
      camRig(lt, c.dur, [.7, 1.4, 4.4], [.4, 1.5, 3.9], [0, .9, .3], [-.1, 1.0, .3], 48);
      rotulo('Mándaselo', 'a quien cree que su perro está enfermo', lt - c.w('mándaselo'), 1330);
      if (lt > .3) c.ev('whoosh', .3, .4);
    }
  });
}
