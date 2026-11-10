// Short 3D: ¿Por qué siempre te da hipo cuando comes rápido? (el diafragma, músculo bajo los pulmones, se irrita —comer rápido,
// refresco, tragar aire— y se contrae de golpe; el aire entra y unos 35 ms después la glotis/cuerdas vocales se cierran = "hic";
// el susto no está comprobado; remedios caseros que sugieren MedlinePlus/Mayo: aguantar la respiración, agua fría a sorbitos).
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-09-2130-hipo.json OUT ../ejemplos/2026-11-09-2130-hipo.js
// Mejora del motor en este short (MEJORAS 0x): rayosX(), verRayosX(), respirar() y hipoDesde() — persona con pulmones, diafragma,
// tráquea y cuerdas vocales que respira y le da hipo.
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    gesto, pose, hablar, ondas, gas, setCocina, vaso, verRayosX, respirar, hipoDesde, AMB } = E;

  const camRig = (lt, dur, a, b, la, lb, fov = 46, temblor = 0) => { const q = einout(cl(lt / dur)), s = temblor * .03;
    cam([lerp(a[0], b[0], q) + Math.sin(lt * 53) * s, lerp(a[1], b[1], q) + Math.cos(lt * 47) * s, lerp(a[2], b[2], q)],
      [lerp(la[0], lb[0], q), lerp(la[1], lb[1], q), lerp(la[2], lb[2], q)], fov); };
  function marca(pos, ok, s = .5, parent) { const g = group(pos, parent), col = ok ? 0x46d16a : 0xff4a4a, m = { emissive: col, ei: .8 };
    if (ok) { const a = box(s * .18, s * .5, s * .18, col, [-s * .22, -s * .05, 0], g, m); a.rotation.z = .8; const b = box(s * .18, s * .95, s * .18, col, [s * .12, s * .12, 0], g, m); b.rotation.z = -.6; }
    else { const a = box(s * .18, s, s * .18, col, [0, 0, 0], g, m); a.rotation.z = .78; const b = box(s * .18, s, s * .18, col, [0, 0, 0], g, m); b.rotation.z = -.78; }
    g.children.forEach(c => c.castShadow = false); g.scale.setScalar(.001); return g; }
  // taco low-poly (tortilla doblada con relleno) y refresco genérico
  function taco(pos, parent, s = 1) { const g = group(pos, parent); g.scale.setScalar(s);
    const t = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .07, 12, 1, true, 0, Math.PI), E.mat(0xe8c27a)); t.material.side = THREE.DoubleSide; t.rotation.z = Math.PI / 2; g.add(t);
    box(.06, .05, .2, 0xb5452a, [0, .03, 0], g); box(.05, .03, .16, 0x5fb04a, [0, .07, 0], g); box(.04, .03, .12, 0xf4f0e0, [.0, .085, .02], g); return g; }
  function refresco(pos, parent, s = 1) { const g = group(pos, parent); g.scale.setScalar(s);
    cyl(.06, .065, .26, 0x3a1a10, [0, .13, 0], g, 10, { opacity: .9, rough: .2 }); cyl(.066, .066, .09, 0xd8302a, [0, .14, 0], g, 10);
    cyl(.025, .055, .08, 0x3a1a10, [0, .3, 0], g, 10, { opacity: .9, rough: .2 }); cyl(.028, .028, .03, 0xd8302a, [0, .35, 0], g, 10); return g; }
  // personaje base del short: camisa verde, frente a la barra de la cocina
  const prota = (pos = [0, 0, -.75]) => { const p = persona({ pos, shirt: 0x2f8f83, pants: 0x3d4a66, hair: 0x2a1a12 }); return p; };
  const HIC = (lt, t, c, label = true, pos = [.45, 2.25, -.6]) => { if (lt < t) return; const u = lt - t;
    if (label && u < 1.1) etiqueta('¡HIC!', pos, u, 92 * (1 + .25 * Math.exp(-u * 8)), '#f3c54d', true); c.ev('pop', t, .55); };

  // 1 · gancho: come tacos a toda velocidad en la cocina… ¡hic!
  escena('gancho', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x6f8fc2, bottom: 0xf2c58e }); this.k = setCocina({ acento: 0x4f8a7a });
      this.p = prota(); this.t = taco([0, -.82, .1], this.p.armR, 1.15); this.r = refresco([.75, this.k.topY, -1.55]);
      this.r2 = refresco([-.55, this.k.topY, -1.5]); this.r2.rotation.z = 1.4; this.r2.position.y += .07;
      this.on = ondas([0, 1.25, -.55], { color: 0xf3c54d, n: 3, vel: 1.6, alcance: .5, grosor: .015 }); },
    update(lt, c) {
      const th = c.w('hipo') + .15, hp = hipoDesde(lt, [th]);
      const bite = Math.max(0, Math.sin(lt * 9)); const p = this.p;
      p.armR.rotation.set(-1.75 - .45 * bite, 0, -.6); p.armL.rotation.set(-.4, 0, -.15); p.head.rotation.x = -.1 + .12 * bite;
      gesto(p, hp >= 0 ? 'sorpresa' : 'feliz'); if (hp < 0) hablar(p, lt, .8 * bite);
      const h = respirar(p, lt, { hipo: hp, k: 0 }); this.on.update(lt, hp >= 0 && hp < 1.2);
      camRig(lt, c.dur, [.55, 1.6, 3.4], [.3, 1.75, 2.35], [0, 1.45, -.75], [0, 1.6, -.75], 46, h);
      HIC(lt, th, c, true, [.5, 2.3, -.7]);
      rotulo('¿Por qué el hipo?', 'siempre que comes rápido', lt - .25, 1330);
      c.ev('whoosh', 0, .35);
    }
  });
  // 2 · diafragma: rayos X del pecho; los pulmones respiran y el diafragma (abajo) se ilumina y brinca
  escena('diafragma', {
    setup() { ambiente({ top: 0x0e1a33, bottom: 0x24365e, fog: 0x101c36, near: 5, far: 20, sunColor: 0xbfd8ff, sunInt: 1.8, hemiInt: .9 });
      this.k = setCocina({ acento: 0x2f4a6a });
      this.p = prota(); this.t = taco([0, -.82, .1], this.p.armR, 1.15);
      const lz = new THREE.PointLight(0x9fe0ff, 2.5, 4, 1.4); lz.position.set(0, 1.5, .4); E.world.add(lz);
      this.on = ondas([0, 1.1, -.55], { color: 0xff7a5a, n: 3, vel: 1.5, alcance: .42, grosor: .012 }); },
    update(lt, c) {
      const p = this.p, tp = c.w('pulmones'), td = c.w('diafragma'), tb = c.w('brinca') + .1;
      p.armR.rotation.set(-.5, 0, .2); p.armL.rotation.set(-.2, 0, -.1);
      verRayosX(p, ease(lt / .5)); gesto(p, 'neutral');
      const hp = hipoDesde(lt, [tb, tb + 1.1]); const irr = ease((lt - c.w('irrita')) / .4);
      const h = respirar(p, lt, { hipo: hp, vel: .35, brillo: lt > td ? .6 + .4 * Math.sin(lt * 8) * irr : 0 });
      this.on.update(lt, hp >= 0);
      camRig(lt, c.dur, [.4, 1.55, 2.6], [.15, 1.35, 1.6], [0, 1.4, -.75], [0, 1.24, -.75], 46, h * .6);
      etiqueta('PULMONES', [-.32, 1.6, -.6], lt - tp, 44, '#ffb0c0', true);
      etiqueta('DIAFRAGMA', [0, 1.0, -.55], lt - td, 52, '#f3c54d', true);
      rotulo('El diafragma', 'el músculo con el que respiras', lt - td, 1330);
      if (lt > td) c.ev('ding', td, .5); if (hp >= 0) c.ev('pop', tb, .5); if (lt > tb + 1.1) c.ev('pop', tb + 1.1, .45);
    }
  });
  // 3 · hic: primer plano gigante de la tráquea; el aire baja de golpe y las cuerdas vocales se cierran: ¡HIC!
  escena('hic', {
    setup() { ambiente({ top: 0x2a0f1e, bottom: 0x5a2338, fog: 0x2a0f1e, near: 4, far: 16, sunColor: 0xffd0d8, sunInt: 1.6, hemiInt: 1.0 });
      const g = this.g = group([0, 0, 0]);
      const M = (c, op, ei = .25) => { const m = E.mat(c, { opacity: op, rough: .5, emissive: c, ei }); m.depthWrite = false; return m; };
      // tubo de anillos (tráquea) translúcido
      for (let k = 0; k < 9; k++) { const r = new THREE.Mesh(new THREE.TorusGeometry(.42, .06, 6, 18), M(0xf2c8b8, .75, .15)); r.rotation.x = Math.PI / 2; r.position.y = .2 + k * .22; g.add(r); }
      const tubo = cyl(.42, .42, 2.0, M(0xe89a9a, .22, .1), [0, 1.08, 0], g, 18); tubo.castShadow = false;
      // cuerdas vocales: dos pliegues que se abren y cierran
      this.cu = [-1, 1].map(s => { const pv = group([s * .44, 2.12, 0], g); const b = box(.42, .1, .55, 0xff5a72, [-s * .21, 0, 0], pv, { emissive: 0xff3a5a, ei: .5 }); b.castShadow = false; pv.s = s; return pv; });
      // anillo de garganta alrededor
      const gar = new THREE.Mesh(new THREE.TorusGeometry(.5, .1, 6, 20), M(0xd87a8a, .9, .2)); gar.rotation.x = Math.PI / 2; gar.position.y = 2.12; g.add(gar);
      this.aire = gas([0, 3.3, .1], [0, .0, .1], 40, 0xbfeaff);
      this.on = ondas([0, 2.3, 0], { color: 0xf3c54d, n: 4, vel: 1.8, alcance: 1.3, grosor: .03, dir: [Math.PI / 2, 0, 0] });
      const lz = new THREE.PointLight(0xffe0e8, 3, 6, 1.3); lz.position.set(.8, 2.6, 1.6); E.world.add(lz); },
    update(lt, c) {
      const ta = c.w('golpe') - .3, tc = c.w('cierran') + .1, thic = c.w('¡hic!') - .05;
      const cerrar = ease((lt - tc) / .12);
      this.cu.forEach(pv => { pv.rotation.z = pv.s * (-.9 + .9 * cerrar) ; });
      this.aire.update(lt, lt > ta && lt < tc + .05 ? 1 : 0, 1.4);
      this.aire.ps.forEach(q => { if (q.position.y < 2.1 && lt > tc) q.visible = q.visible && q.position.y < 1.9; });
      const s = lt > tc ? Math.exp(-(lt - tc) * 6) : 0;
      this.on.update(lt - tc, lt > tc && lt < tc + 1.4);
      camRig(lt, c.dur, [1.7, 3.5, 3.4], [1.0, 3.2, 2.7], [0, 1.6, 0], [0, 2.0, 0], 48, s * 1.6);
      etiqueta('AIRE', [-.55, 2.55, .2], lt - ta, 50, '#bfeaff', true);
      etiqueta('CUERDAS VOCALES', [0, 2.65, .3], lt - c.w('cuerdas'), 44, '#ffb0c0', true);
      HIC(lt, thic, c, true, [.55, 3.15, .2]);
      rotulo('¡Se cierran de golpe!', 'por eso suena hic', lt - tc, 1330);
      if (lt > ta) c.ev('whoosh', ta, .55); if (lt > tc) c.ev('impact', tc, .6);
    }
  });
  // 4 · susto: la abuela aparece por detrás: ¡BU! … y el hipo sigue
  escena('susto', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x55689a, bottom: 0xe9a87a }); this.k = setCocina({ acento: 0x8a4f7a });
      this.p = prota([.35, 0, -.5]); this.p.rotation.y = -.25;
      this.a = persona({ pos: [-.75, 0, -1.0], shirt: 0x8a5ab0, pants: 0x4a3a5a, pelo: 'largo', hair: 0xc8c8c8 }); this.a.rotation.y = .5;
      this.a.scale.setScalar(.92); this.x = marca([.7, 2.2, -.4], false, .5); },
    update(lt, c) {
      const tb = .25, tcp = c.w('comprobado'), thic = tcp + .15, hp = hipoDesde(lt, [thic]);
      const sal = spring((lt - tb) / .6); pose(this.a, 'brazosArriba', cl(sal), lt); gesto(this.a, 'feliz'); hablar(this.a, lt, lt > tb && lt < tb + .8 ? 1 : 0);
      this.a.position.x = lerp(-1.0, -.65, cl(sal));
      const brinco = lt > tb + .1 ? Math.exp(-(lt - tb - .1) * 5) * Math.sin((lt - tb) * 20) : 0;
      this.p.position.y = Math.max(0, brinco * .12); gesto(this.p, lt < tb + .1 ? 'neutral' : (hp >= 0 ? 'triste' : 'sorpresa'));
      pose(this.p, hp >= 0 ? 'encoger' : 'brazosArriba', hp >= 0 ? ease(hp / .3) : cl(brinco * 2) * .4, lt);
      const h = respirar(this.p, lt, { hipo: hp, k: 0 });
      this.x.scale.setScalar(Math.max(.001, spring((lt - tcp + .1) / .8))); this.x.rotation.y = Math.sin(lt * 2) * .35;
      camRig(lt, c.dur, [.1, 1.6, 3.9], [-.05, 1.55, 3.2], [-.15, 1.4, -.7], [-.1, 1.5, -.7], 50, h);
      if (lt > tb && lt < tb + 1.1) etiqueta('¡BU!', [-.85, 2.45, -.9], lt - tb, 86, '#ffffff', true);
      HIC(lt, thic, c, true, [.45, 2.5, -.5]);
      rotulo('No está comprobado', 'el susto de la abuela', lt - tcp + .2, 1330);
      if (lt > tb) c.ev('impact', tb, .5); if (lt > tcp) c.ev('crack', tcp - .1, .4);
    }
  });
  // 5 · truco: aguanta el aire (cachetes inflados) y luego agua fría a sorbitos; el diafragma se calma (verde)
  escena('truco', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x5f8fd0, bottom: 0xf5d39a }); this.k = setCocina({ acento: 0x4f8a7a });
      this.p = prota(); this.v = vaso([0, -.86, .06], this.p.armR, 1.3); this.v.rotation.x = Math.PI / 2;
      this.cach = [-1, 1].map(s => { const b = ball(.07, 0xe8a888, [s * .16, -.08, .14], this.p.head, 1); b.scale.setScalar(.01); return b; });
      this.hielo = [0, 1].map(k => box(.04, .04, .04, 0xeaffff, [.02 * k, .12, .0], this.v, { opacity: .8, emissive: 0xcff, ei: .3 }));
      this.ok = marca([.75, 2.2, -.6], true, .5); this.vapor = gas([.0, 1.1, -.55], [-.1, 1.0, -.4], 1, 0x000000); },
    update(lt, c) {
      const p = this.p, tag = c.w('fría') - .3, tr = c.w('aguanta');
      const inf = lt < tag - .1 ? ease((lt - tr) / .3) : 1 - ease((lt - tag + .1) / .25); this.cach.forEach(b => b.scale.setScalar(Math.max(.01, inf)));
      const sorbo = ease((lt - tag + .05) / .5); p.armR.rotation.set(lerp(-.6, -2.1, sorbo), 0, lerp(-.2, -.6, sorbo)); this.v.rotation.x = lerp(0, -.9, sorbo);
      p.head.rotation.x = -.15 * sorbo; gesto(p, inf > .5 ? 'neutral' : 'feliz'); if (inf > .5) { p.boca.scale.set(.6, .6, 1); }
      verRayosX(p, .55 * ease((lt - .2) / .5));
      respirar(p, lt, { vel: .2, k: lt < tag ? .2 : 1 }); p.rx.diafragma.material.color.setHex(lt > tag + .6 ? 0x4fd17a : 0xff6a4a); p.rx.diafragma.material.emissive.setHex(lt > tag + .6 ? 0x2fbf5a : 0xff5a3a);
      this.ok.scale.setScalar(Math.max(.001, spring((lt - tag - .6) / .8))); this.ok.rotation.y = Math.sin(lt * 2) * .35;
      camRig(lt, c.dur, [-.45, 1.65, 2.9], [-.2, 1.6, 2.4], [0, 1.45, -.75], [0, 1.5, -.75], 46);
      if (lt < tag) etiqueta('AGUANTA EL AIRE', [-.1, 2.18, -.7], lt - tr, 46, '#ffffff', true);
      etiqueta('AGUA FRÍA', [-.2, 1.95, -.4], lt - tag, 50, '#9fe0ff', true);
      rotulo('El truco', 'aguanta el aire o agua fría a sorbitos', lt - .2, 1330);
      if (lt > tag) c.ev('click', tag, .4); if (lt > tag + .6) c.ev('ding', tag + .6, .6);
    }
  });
  // 6 · remate: el amigo con su refresco… ¡hic! y tú le mandas el video
  escena('remate', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x5a78c0, bottom: 0xf6b98a }); this.k = setCocina({ acento: 0xc0583f });
      this.a = persona({ pos: [.55, 0, -.75], shirt: 0xd9a33a, pants: 0x3d4a66 }); this.a.rotation.y = -.35; this.rf = refresco([0, -.9, .05], this.a.armR, 1.3);
      this.p = prota([-.6, 0, -.3]); this.p.rotation.y = .45;
      this.cel = box(.1, .18, .02, 0x1c1c22, [0, -.78, .14], this.p.armR); this.pant = box(.085, .15, .005, 0x7fe3a0, [0, -.78, .155], this.p.armR, { emissive: 0x7fe3a0, ei: 1.1 });
      this.on = ondas([0, 0, 0], { color: 0x7fe3a0, n: 3, vel: 1.3, alcance: .5, grosor: .014 }); },
    update(lt, c) {
      const th = [.5, 1.7], hp = hipoDesde(lt, th);
      this.a.armR.rotation.set(-1.0, 0, -.3); respirar(this.a, lt, { hipo: hp, k: 0 }); gesto(this.a, hp >= 0 && hp < .5 ? 'sorpresa' : 'feliz');
      const p = this.p; p.armR.rotation.x = -1.05; p.armR.rotation.z = .25; gesto(p, 'feliz'); hablar(p, lt, .6);
      p.updateMatrixWorld(true); const cp = this.pant.getWorldPosition(new THREE.Vector3()); this.on.position.copy(cp); this.on.update(lt, lt > .3);
      camRig(lt, c.dur, [.1, 1.7, 3.8], [-.1, 1.65, 3.3], [0, 1.45, -.5], [0, 1.5, -.5], 50);
      th.forEach(t => HIC(lt, t, c, true, [.75, 2.4, -.7]));
      rotulo('Mándaselo', 'al que le da hipo con el refresco', lt - c.w('mándaselo'), 1330);
    }
  });
}
