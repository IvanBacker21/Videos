// Short 3D: ¿Por qué los perros muerden todo? (pedido de un suscriptor en los comentarios)
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-05-1800-perro.json OUT ../ejemplos/2026-11-05-1800-perro.js
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, mat, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    AMB, setCuarto, setCalle, ondas, perro, perroAnda } = E;

  // ---------- utilería ----------
  function tenis(pos, parent, color = 0x3f7fd6) {
    const g = group(pos, parent);
    box(.16, .05, .36, 0xf4f4f4, [0, .025, 0], g);                       // suela
    box(.15, .1, .26, color, [0, .1, -.04], g); box(.14, .07, .12, color, [0, .08, .12], g);
    box(.12, .02, .1, 0xffffff, [0, .16, .02], g);                         // agujetas
    box(.03, .02, .3, 0xffffff, [.08, .08, -.02], g);                      // franja
    return g;
  }
  function control(pos, parent) {
    const g = group(pos, parent); box(.1, .04, .32, 0x222228, [0, .02, 0], g);
    ball(.018, 0xff3b3b, [0, .05, .11], g, 0, { emissive: 0xff3b3b, ei: .6 });
    for (let k = 0; k < 6; k++) box(.022, .01, .022, 0x777788, [(k % 2 ? .025 : -.025), .045, .04 - Math.floor(k / 2) * .045], g);
    return g;
  }
  function calcetin(pos, parent) { const g = group(pos, parent); box(.12, .04, .3, 0xf3c54d, [0, .02, 0], g); box(.12, .041, .06, 0xff7a59, [0, .02, -.1], g); return g; }
  function cuerda(pos, parent) {                                           // juguete de cuerda con nudos
    const g = group(pos, parent); const c = cyl(.03, .03, .42, 0x5fb0ff, [0, 0, 0], g, 8); c.rotation.z = Math.PI / 2;
    ball(.06, 0xff7a59, [-.21, 0, 0], g, 0); ball(.06, 0xff7a59, [.21, 0, 0], g, 0); return g;
  }
  function hueso(pos, parent, s = 1) {
    const g = group(pos, parent); g.scale.setScalar(s); const c = cyl(.035, .035, .3, 0xfff3d6, [0, 0, 0], g, 8); c.rotation.z = Math.PI / 2;
    for (const x of [-.15, .15]) for (const z of [-.035, .035]) ball(.045, 0xfff3d6, [x, 0, z], g, 0); return g;
  }
  function sofa(pos, color = 0x4f7f9c) {
    const g = group(pos); box(1.8, .4, .8, color, [0, .3, 0], g); box(1.8, .55, .2, color, [0, .75, -.32], g);
    box(.2, .55, .8, color, [-.9, .45, 0], g); box(.2, .55, .8, color, [.9, .45, 0], g);
    g.patas = [[-.8, -.32], [.8, -.32], [-.8, .32], [.8, .32]].map(([x, z]) => box(.08, .1, .08, 0x5a3a22, [x, .05, z], g));
    box(.78, .12, .62, 0x6f9fc0, [-.42, .56, .05], g); box(.78, .12, .62, 0x6f9fc0, [.42, .56, .05], g);
    return g;
  }
  // mordida: sacude la cabeza y abre/cierra la mandíbula
  function mordiendo(p, lt, k = 1) { p.jaw.rotation.x = (.15 + .35 * Math.abs(Math.sin(lt * 9))) * k; p.head.rotation.z = Math.sin(lt * 13) * .18 * k; p.head.rotation.x = .25 * k; }

  // 1 · gancho: un cachorro destroza un tenis; aparece la pregunta del comentario
  escena('gancho', {
    setup() { ambiente(AMB.cuartoDia); setCuarto({ noche: false, tapete: 0x2f8f83 });
      this.d = perro({ pos: [0, 0, .7], s: .8 }); this.d.rotation.y = -.35;
      this.t = tenis([0, .02, .3], this.d.head); this.t.rotation.set(0, Math.PI / 2, 0);
      this.peda = [0, 1, 2, 3, 4].map(k => box(.05, .02, .04, 0xffffff, [-.4 + k * .22, .01, 1.0 + (k % 2) * .25]));   // pedacitos en el piso
    },
    update(lt, c) {
      mordiendo(this.d, lt, 1); perroAnda(this.d, lt, 0, 1.2); this.t.rotation.z = Math.sin(lt * 13) * .3;
      const p = einout(lt / 4);
      cam([lerp(1.6, .9, p), lerp(1.3, 1.0, p), lerp(4.8, 3.6, p)], [0, .55, .8], 46);
      if (lt > .05) c.ev('crack', .05, .5); if (lt > 1.1) c.ev('crack', 1.1, .4);
      rotulo('Nos preguntaron', 'en los comentarios', lt, 1330); c.ev('pop', 0);
      etiqueta('¿POR QUÉ MUERDEN TODO?', [0, 1.15, .8], lt - c.f(1), 56, '#f3c54d'); if (lt > c.f(1)) c.ev('ding', c.f(1), .6);
    }
  });
  // 2 · explora con la boca: el cachorro olfatea y muerde un objeto tras otro (como un bebé que todo lo agarra)
  escena('boca', {
    setup() { ambiente(AMB.cuartoDia); setCuarto({ noche: false, tapete: 0xc0583f });
      this.obj = [tenis([-1.1, 0, .8], null, 0xff7a59), control([0, 0, .9]), calcetin([1.1, 0, .8])]; this.obj.forEach(o => o.scale.setScalar(1.5));
      this.d = perro({ pos: [-1.6, 0, 1.6], s: .8 }); },
    update(lt, c) {
      // tres paradas: cada ~1.3 s llega a un objeto y le da una mordida
      const seg = Math.min(2, Math.floor(lt / 1.35)), u = (lt - seg * 1.35) / 1.35;
      const xs = [-1.1, 0, 1.1], x0 = seg ? xs[seg - 1] : -1.6, x = lerp(x0, xs[seg], ease(u / .45));
      this.d.position.set(x, 0, 1.3); this.d.rotation.y = u < .45 ? Math.PI / 2 * .6 : Math.PI;   // camina de lado; luego voltea al objeto
      perroAnda(this.d, lt, u < .45 ? 1 : 0, 1.4);
      const bite = u > .5 ? 1 : 0; mordiendo(this.d, lt, bite); this.d.head.rotation.x = bite ? .5 : 0;
      const o = this.obj[seg]; o.position.y = bite ? .03 + Math.abs(Math.sin(lt * 9)) * .04 : 0; o.rotation.y = bite ? Math.sin(lt * 13) * .25 : 0;
      if (bite) c.ev('pop', seg * 1.35 + .68, .5);
      cam([lerp(x * .5 - .2, x * .5 + .2, ease(lt / 4.2)), 1.5, 5.0], [x * .55, .35, 1.0], 48);
      ['TENIS', 'CONTROL', 'CALCETÍN'].forEach((n, k) => { if (k <= seg) etiqueta(n, [xs[k], .45, .85], lt - (k * 1.35 + .7), 46, '#ffffff'); });
      rotulo('Explora con la boca', 'como un bebé con las manos', lt - c.w('boca'), 1330); if (lt > c.w('boca')) c.ev('whoosh', c.w('boca'), .5);
    }
  });
  // 3 · dientes nuevos: primer plano de la boca abierta, encías rojas que pulsan, dientitos que salen; muerde la cuerda → alivio
  escena('dientes', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x8a6fb0, bottom: 0xf2b88e });
      setCuarto({ noche: false, tapete: 0xb58bc0 });
      this.d = perro({ pos: [0, 0, .5], s: 1.25 });
      // encías + dientitos en la mandíbula
      this.encia = box(.2, .03, .17, 0xd8566a, [0, .005, .1], this.d.jaw, { emissive: 0xff3050, ei: 0 }); this.d.lengua.visible = false;
      this.dien = [-.07, -.025, .025, .07].map(x => box(.025, .04, .025, 0xffffff, [x, .02, .17], this.d.jaw, { emissive: 0xffffff, ei: .3 }));
      this.c = cuerda([0, -.06, .3], this.d.head); this.c.visible = false;
      this.on = ondas([0, .78 * 1.25, .95], { color: 0xff5c7a, n: 3, vel: 1.2, alcance: .6, grosor: .015, dir: [0, 0, 0] }); },
    update(lt, c) {
      const tb = c.w('morder') - .15, mord = lt > tb;
      // boca abierta mostrando encías; los dientes van saliendo
      const sale = ease((lt - c.w('dientes') + .1) / 1.0);
      this.dien.forEach((d, k) => { d.scale.y = Math.max(.05, sale * (1 + .15 * Math.sin(lt * 6 + k))); d.position.y = .005 + .02 * sale; });
      const duele = lt > c.w('duele') - .2 && !mord;
      this.encia.material.emissiveIntensity = duele ? .5 + .5 * Math.abs(Math.sin(lt * 8)) : .05;
      this.on.update(lt, duele);
      if (!mord) { this.d.jaw.rotation.x = .55; this.d.head.rotation.x = -.15; this.d.head.rotation.z = duele ? Math.sin(lt * 20) * .05 : 0; this.d.earL.rotation.z = duele ? .9 : .5; this.d.earR.rotation.z = duele ? -.9 : -.5; }
      else { this.c.visible = true; mordiendo(this.d, lt, 1); this.d.earL.rotation.z = .4; this.d.earR.rotation.z = -.4; perroAnda(this.d, lt, 0, 1.6); }
      if (duele) c.ev('heartbeat', c.w('duele') - .2, .6); if (mord) c.ev('pop', tb, .6);
      const p = einout(lt / 4.2);
      cam([lerp(.9, .5, p), lerp(1.25, 1.1, p), lerp(3.9, 3.2, p)], [0, .82, .9], 42);
      if (!mord) etiqueta('DIENTES NUEVOS', [0, 1.32, .9], lt - c.w('dientes'), 56, '#ffffff');
      if (mord) etiqueta('ALIVIO', [0, 1.32, .9], lt - c.w('alivio'), 64, '#7fe3a0');
      rotulo('Les duele', 'y morder los alivia', lt - c.w('duele'), 1330);
    }
  });
  // 4 · de grandes: la persona sale por la puerta, el perro se queda solo mirando la puerta… y muerde la pata del sillón
  escena('solo', {
    setup() { ambiente({ ...AMB.cuartoNoche, top: 0x2a3060, bottom: 0x8a6f9a, hemiInt: 1.3, sunInt: 2.0, near: 7, far: 26 });
      // sala: dos paredes, puerta, sillón, lámpara
      for (let k = -6; k < 6; k++) box(.5, .03, 9, k % 2 ? 0x7a5a3e : 0x8a6848, [k * .5 + .25, -.015, 0]);
      box(6, 3.2, .15, 0x6a6f96, [0, 1.6, -2.4]); box(.15, 3.2, 6, 0x6a6f96, [-3, 1.6, .5]);
      this.puerta = group([-2.92, 0, -.1]); box(.06, 2.1, .9, 0x8a5a33, [0, 1.05, .45], this.puerta); ball(.04, 0xf3c54d, [.05, 1.0, .82], this.puerta, 0);
      box(.08, 2.2, 1.04, 0x3a2a1c, [-2.96, 1.1, .35]);                                         // marco
      this.s = sofa([.6, 0, -1.6]);
      const lam = group([2.1, 0, -1.9]); cyl(.03, .03, 1.5, 0x333333, [0, .75, 0], lam, 6); cyl(.12, .25, .3, 0xffe0a0, [0, 1.6, 0], lam, 8, { emissive: 0xffc870, ei: .9 });
      const luz = new THREE.PointLight(0xffc27a, 2.0, 6, 1.6); luz.position.set(2.1, 1.5, -1.6); E.world.add(luz);
      this.p = persona({ pos: [-1.6, 0, .4], shirt: 0xff7a59 }); this.p.rotation.y = -Math.PI / 2;
      this.d = perro({ pos: [-.6, 0, .5], s: 1.05, color: 0x8b6a4a, mancha: 0xe8d8c0, oscuro: 0x3a2a1c, collar: 0x2f8f83 }); this.d.rotation.y = -Math.PI / 2; },
    update(lt, c) {
      const tSale = .2, tSolo = c.w('sienten') - .3;
      // la persona camina a la puerta y sale; la puerta se cierra
      const w = ease((lt - tSale) / 1.4); this.p.position.x = lerp(-1.6, -3.4, w); this.p.visible = w < .95;
      this.p.legL.rotation.x = Math.sin(lt * 9) * .4 * (w < 1); this.p.legR.rotation.x = -this.p.legL.rotation.x;
      const ab = lt < 1.6 ? ease((lt - .6) / .4) : 1 - ease((lt - 1.6) / .3); this.puerta.rotation.y = -1.3 * ab;
      if (lt > 1.6) c.ev('crack', 1.6, .35);
      // perro: primero mira la puerta con orejas caídas, luego se va al sillón y muerde la pata
      const va = ease((lt - (tSolo - .9)) / .8);
      this.d.position.set(lerp(-.6, .15, va), 0, lerp(.5, -1.05, va)); this.d.rotation.y = lerp(-Math.PI / 2, Math.PI * .85, va);
      this.d.earL.rotation.z = .9; this.d.earR.rotation.z = -.9; this.d.tail.rotation.x = lerp(-.7, .4, ease((lt - 1.7) / .5));
      perroAnda(this.d, lt, va > .02 && va < .98 ? 1 : 0, 0);
      if (va >= 1) { mordiendo(this.d, lt, 1); this.s.patas[2].rotation.z = Math.sin(lt * 13) * .1; c.ev('crack', tSolo, .5); }
      const p = einout(lt / 4.7);
      cam([lerp(.6, 1.6, p), lerp(1.6, 1.3, p), lerp(4.8, 3.0, p)], [lerp(-1.6, .2, p), .7, lerp(.1, -1.0, p)], 48);
      rotulo('Aburrimiento', 'o se sienten solos', lt - c.w('aburrimiento'), 1330); if (lt > c.w('aburrimiento')) c.ev('pop', c.w('aburrimiento'));
      if (va >= 1) etiqueta('MORDER LOS CALMA', [.2, 1.45, -1.0], lt - tSolo - .3, 50, '#f3c54d');
    }
  });
  // 5 · el truco: juguetes, paseo y juego (calle al atardecer, persona con correa, hueso y pelota)
  escena('truco', {
    setup() { ambiente(AMB.calle); setCalle({ largo: 34 });
      this.p = persona({ pos: [-.4, 0, -3], shirt: 0x2f8f83 }); this.h0 = 0;
      this.d = perro({ pos: [.35, 0, -2.5], s: 1.0 });
      this.correa = box(.02, .02, 1, 0xe0403a, [0, 0, 0]);
      this.h = hueso([1.05, .5, .9], null, 1.6); this.b = ball(.15, 0xf3c54d, [-1.05, .3, .9], null, 1, { emissive: 0xf3c54d, ei: .2 }); },
    update(lt, c) {
      const z = lerp(-3.2, .2, lt / 3.5);
      this.p.position.set(-.4, 0, z); this.p.legL.rotation.x = Math.sin(lt * 8) * .4; this.p.legR.rotation.x = -this.p.legL.rotation.x; this.p.armR.rotation.x = -.5;
      this.d.position.set(.35, 0, z + .5); perroAnda(this.d, lt, 1.2, 1.5); this.d.jaw.rotation.x = .2;
      const a = new THREE.Vector3(-.12, .95, z + .25), b = new THREE.Vector3(.35, .68, z + .82);
      this.correa.position.copy(a.clone().add(b).multiplyScalar(.5)); this.correa.lookAt(b); this.correa.scale.z = a.distanceTo(b);
      this.h.rotation.y = lt * 2; this.h.position.y = .55 + Math.sin(lt * 3) * .08; this.b.position.y = .3 + Math.abs(Math.sin(lt * 4)) * .6;
      cam([lerp(.6, .2, ease(lt / 3.5)), 1.9, 5.6], [0, .8, lerp(-1.2, .2, lt / 3.5)], 50);
      etiqueta('JUGUETES', [1.0, 1.05, .9], lt - c.w('juguetes'), 54, '#f3c54d'); if (lt > c.w('juguetes')) c.ev('pop', c.w('juguetes'));
      etiqueta('PASEOS', [-.4, 2.15, z], lt - c.w('paseos'), 54, '#7fe3a0'); if (lt > c.w('paseos')) c.ev('pop', c.w('paseos'));
      etiqueta('JUEGO', [-1.0, 1.2, .9], lt - c.w('juego'), 54, '#7fdcff'); if (lt > c.w('juego')) c.ev('ding', c.w('juego'), .6);
      rotulo('El truco', 'que se cansen jugando', lt - .1, 1330);
    }
  });
  // 6 · remate: le mandas el video al amigo cuyo perro se comió media casa (el perro asoma con un cojín en la boca)
  escena('remate', {
    setup() { ambiente(AMB.cuartoDia); setCuarto({ noche: false, tapete: 0x2f8f83 });
      this.a = persona({ pos: [-.55, 0, .9], shirt: 0x6f9bd6 }); this.a.rotation.y = .9;
      this.b = persona({ pos: [.55, 0, .9], shirt: 0xf3c54d, hair: 0x1c1410 }); this.b.rotation.y = -.9;
      this.tel = group([0, -.78, .12], this.a.armR); box(.09, .17, .015, 0x1d1f26, [0, 0, 0], this.tel); box(.08, .15, .005, 0x2a8a7a, [0, 0, .01], this.tel, { emissive: 0x25d366, ei: .5 });
      this.tel.rotation.x = -1.2;
      this.d = perro({ pos: [1.6, 0, 1.8], s: .85, color: 0xf0f0ea, mancha: 0xffffff, oscuro: 0x2a2a2a });
      this.coj = box(.36, .1, .3, 0xff7a59, [0, -.05, .32], this.d.head); for (let k = 0; k < 6; k++) ball(.025, 0xffffff, [-.15 + k * .06, -.1, .32 + (k % 2) * .08], this.d.head, 0); },
    update(lt, c) {
      const ext = ease(lt / .6); this.a.armR.rotation.x = lerp(0, -1.4, ext);
      const tr = c.w('casa') - .3, ri = lt > tr ? 1 : 0, k = Math.sin(lt * 14) * .12 * ri;
      this.b.head.rotation.x = -.15 * ri + k; this.b.armL.rotation.z = lerp(0, 2.3, ease((lt - tr) / .3)) + k; this.b.armR.rotation.z = -this.b.armL.rotation.z;
      this.a.head.rotation.x = .2 + k * .5;
      const en = ease((lt - c.w('perro') + .2) / .8); this.d.position.set(lerp(2.4, .3, en), 0, 2.0); this.d.rotation.y = en < 1 ? -Math.PI / 2 : -.2;
      perroAnda(this.d, lt, en < 1 ? 1 : 0, 1.6); this.d.head.rotation.z = Math.sin(lt * 6) * .1;
      if (lt > tr) c.ev('pop', tr, .6);
      cam([lerp(.9, .6, ease(lt / 3.8)), 1.7, lerp(6.4, 5.6, ease(lt / 3.8))], [.35, 1.0, 1.1], 46);
      etiqueta('MEDIA CASA', [.3, 1.25, 2.0], lt - c.w('media'), 54, '#ff9a7a');
      rotulo('Mándaselo', 'al del perro que se comió media casa', lt - .05, 1330); c.ev('pop', .05);
    }
  });
}
