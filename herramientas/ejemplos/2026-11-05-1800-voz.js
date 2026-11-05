// Short 3D: ¿Por qué odias cómo suena tu voz en las grabaciones? (conducción por aire vs. por hueso)
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-05-1800-voz.json OUT ../ejemplos/2026-11-05-1800-voz.js
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, mat, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    AMB, setCuarto, setCalle, setLaboratorio, ondas } = E;
  const CYAN = 0x5fd4ff, NAR = 0xff9a3c;
  const LAB = { top: 0x2d4052, bottom: 0xbfd8d6, fog: 0x8fa6ad, near: 6, far: 24, sunColor: 0xfff1dc, sunInt: 2.4, hemiInt: 1.15 };

  // Celular low-poly con pantalla de nota de voz (barras de onda animables y punto rojo de grabar)
  function celular(pos, parent, s = 1) {
    const g = group(pos, parent); g.scale.setScalar(s);
    box(.5, 1.0, .06, 0x1d1f26, [0, 0, 0], g, { rough: .4 });
    box(.44, .9, .01, 0x0e3b33, [0, 0, .032], g, { emissive: 0x0e5a4a, ei: .7 });
    box(.36, .12, .012, 0x25d366, [0, .3, .036], g, { emissive: 0x25d366, ei: .6 });           // burbuja de nota de voz
    g.bars = []; for (let k = 0; k < 9; k++) g.bars.push(box(.025, .1, .012, 0xffffff, [-.16 + k * .04, -.05, .04], g, { emissive: 0xffffff, ei: .8 }));
    g.rec = ball(.035, 0xff3b3b, [0, -.32, .04], g, 0, { emissive: 0xff3b3b, ei: 1 });
    g.anim = (lt, on = true) => { g.bars.forEach((b, k) => { b.scale.y = on ? .4 + 2.2 * Math.abs(Math.sin(lt * 7 + k * 1.3)) : .4; }); g.rec.visible = on && (lt * 2 % 1) < .6; };
    return g;
  }
  // Busto grande (modelo de laboratorio) mirando a +z: cabeza, orejas, boca, ojos; cráneo interior para la escena de huesos.
  function busto(pos) {
    const g = group(pos);
    const piel = mat(0xe0b08c); piel.transparent = true; g.piel = piel;
    box(.5, .35, .3, 0x6f9bd6, [0, .17, 0], g);                                                   // hombros
    box(.18, .2, .18, piel, [0, .42, 0], g);                                                      // cuello
    g.cab = box(.62, .72, .62, piel, [0, .86, 0], g);
    g.orejaL = box(.07, .18, .12, 0xe0b08c, [-.34, .86, -.02], g); g.orejaR = box(.07, .18, .12, 0xe0b08c, [.34, .86, -.02], g);
    g.pelo = box(.66, .16, .66, 0x3a2a20, [0, 1.25, -.02], g); g.pelo.material.transparent = true;
    g.ojos = [box(.07, .07, .02, 0x111111, [-.13, .95, .315], g), box(.07, .07, .02, 0x111111, [.13, .95, .315], g)];
    g.boca = box(.18, .05, .02, 0x7a2a2a, [0, .66, .315], g);
    // cráneo (oculto hasta la escena de huesos)
    g.craneo = group([0, 0, 0], g);
    const hueso = mat(0xfff3d6, { emissive: 0xfff0d0, ei: .25 });
    box(.5, .45, .5, hueso, [0, .98, 0], g.craneo); box(.42, .14, .4, hueso, [0, .62, .04], g.craneo);   // bóveda y mandíbula
    box(.06, .3, .4, hueso, [-.22, .74, -.02], g.craneo); box(.06, .3, .4, hueso, [.22, .74, -.02], g.craneo);
    g.oido = ball(.06, NAR, [.3, .86, -.02], g, 1, { emissive: NAR, ei: .2 });
    g.craneo.visible = false; g.oido.visible = false;
    return g;
  }
  // Partículas de sonido que viajan por una curva (aire) o por dentro (hueso).
  function chorro(curva, color, n = 10) {
    const ps = []; for (let k = 0; k < n; k++) { const b = ball(.022, color, [0, 0, 0], null, 0, { emissive: color, ei: 1 }); b.castShadow = false; ps.push(b); }
    return { ps, update(lt, vel = .5, on = true) { ps.forEach((b, k) => { const u = ((lt * vel + k / n) % 1 + 1) % 1; b.position.copy(curva.getPoint(u));
      b.visible = on; b.scale.setScalar((b.userData.k ?? 1) * (.7 + .6 * Math.sin(Math.PI * u))); }); } };
  }
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // Busto en la mesa del laboratorio: base en y=.92
  const B = [0, .92, -.5];
  const boca = V(0, B[1] + .66, B[2] + .33), oreja = V(.36, B[1] + .86, B[2] - .02);
  const curvaAire = new THREE.CatmullRomCurve3([boca, V(.25, B[1] + .7, B[2] + .75), V(.75, B[1] + .95, B[2] + .55), V(.62, B[1] + 1.0, B[2] + .05), oreja]);
  const curvaHueso = new THREE.CatmullRomCurve3([V(0, B[1] + .64, B[2] + .2), V(.12, B[1] + .76, B[2] + .05), V(.22, B[1] + .84, B[2] - .02), oreja]);

  // 1 · gancho: escuchas tu audio y te tapas la cara
  escena('gancho', {
    setup() { ambiente(AMB.cuartoDia); setCuarto({ noche: false, tapete: 0x2f8f83 });
      this.p = persona({ pos: [0, 0, .6], shirt: 0xff7a59 });
      this.tel = celular([0, -.78, .12], this.p.armR, .55); this.tel.rotation.set(-1.2, Math.PI, 0);
      this.on = ondas([0, 0, .06], { color: 0x25d366, n: 4, alcance: .9, grosor: .03 }, this.tel); },
    update(lt, c) {
      const tc = c.f(1) - .25, cov = ease((lt - tc) / .35);
      // brazo derecho levanta el celular; al "No eres el único" ambos brazos tapan la cara
      this.p.armR.rotation.x = lerp(-1.25, -.35, cov); this.p.armR.rotation.z = lerp(0, 2.75, cov);
      this.p.armL.rotation.x = lerp(0, -.35, cov); this.p.armL.rotation.z = lerp(0, -2.75, cov);
      this.p.head.rotation.x = lerp(Math.sin(lt * 2) * .04, .35, cov) + Math.sin(lt * 16) * .04 * cov; this.p.head.rotation.y = lerp(0, -.25, ease(lt / .8)) * (1 - cov);
      this.tel.anim(lt, lt < tc); this.on.update(lt, lt < tc);
      if (lt > tc) c.ev('crack', tc, .6);
      cam([lerp(1.8, 1.0, ease(lt / 4.2)), lerp(1.6, 1.75, ease(lt / 4.2)), lerp(5.6, 4.3, ease(lt / 4.2))], [0, 1.45, .5], 40);
      rotulo('No eres el único', 'a casi todos nos pasa', lt - c.f(1), 1330); if (lt > c.f(1)) c.ev('pop', c.f(1));
    }
  });
  // 2 · por el aire: del busto sale el sonido, da la vuelta y entra al oído
  escena('aire', {
    setup() { ambiente(LAB); setLaboratorio({ acento: CYAN }); this.b = busto(B);
      this.air = chorro(curvaAire, CYAN, 12); this.air.ps.forEach(p => p.userData.k = 1.7); this.on = ondas([0, .66, .36], { color: CYAN, n: 4, alcance: .5, grosor: .015 }, this.b); },
    update(lt, c) {
      const t0 = c.w('sale') - .2; this.air.update(lt - t0, .55, lt > t0); this.on.update(lt, lt > t0);
      this.b.boca.scale.y = 1 + 1.6 * Math.abs(Math.sin(lt * 9)) * (lt < 3.2);
      if (lt > c.w('oídos')) { this.b.orejaR.material.emissive.set(CYAN); this.b.orejaR.material.emissiveIntensity = .4 + .3 * Math.sin(lt * 10); }
      const a = lerp(.75, .35, einout(lt / 3.5));
      cam([Math.sin(a) * 4.0, 1.9, B[2] + Math.cos(a) * 4.0], [.22, 1.62, B[2]], 36);
      etiqueta('AIRE', [.5, B[1] + 1.25, B[2] + .55], lt - c.w('aire'), 60, '#7fdcff');
      rotulo('Por el aire', 'de tu boca a tus oídos', lt - c.w('aire'), 1330); if (lt > c.w('aire')) c.ev('whoosh', c.w('aire'), .6);
    }
  });
  // 3 · por dentro: la cabeza se vuelve transparente y el sonido viaja por los huesos
  escena('huesos', {
    setup() { ambiente({ ...LAB, top: 0x1f2a3a, bottom: 0x6f8f98, hemiInt: .9 }); setLaboratorio({ acento: NAR }); this.b = busto(B);
      this.air = chorro(curvaAire, CYAN, 8); this.bone = chorro(curvaHueso, NAR, 9); this.bone.ps.forEach(p => { p.material.depthTest = false; p.renderOrder = 10; p.userData.k = 1.6; }); },
    update(lt, c) {
      const tr = ease((lt - c.w('dentro') + .2) / .6);
      this.b.piel.opacity = lerp(1, .28, tr); this.b.pelo.material.opacity = lerp(1, .28, tr); this.b.pelo.material.transparent = true;
      this.b.craneo.visible = tr > .05; this.b.craneo.scale.setScalar(lerp(.9, 1, tr));
      this.b.oido.visible = tr > .3; this.b.oido.material.emissiveIntensity = .4 + .5 * Math.abs(Math.sin(lt * 6));
      this.air.update(lt, .55, lt < c.w('dentro'));
      const tb = c.w('huesos') - .4; this.bone.update(lt - tb, .9, lt > tb);
      this.b.boca.scale.y = 1 + 1.4 * Math.abs(Math.sin(lt * 9)) * (lt < 3.3);
      if (lt > c.w('dentro') - .2) c.ev('zap', c.w('dentro') - .2, .5);
      cam([lerp(2.0, 1.4, einout(lt / 3.6)), 1.85, lerp(B[2] + 3.4, B[2] + 2.7, einout(lt / 3.6))], [.12, 1.66, B[2]], 36);
      etiqueta('HUESOS', [0, B[1] + 1.12, B[2] + .45], lt - c.w('huesos'), 64, '#ff8a2a');
      rotulo('Por dentro', 'a través de los huesos', lt - c.w('huesos'), 1330); if (lt > c.w('huesos')) c.ev('pop', c.w('huesos'));
    }
  });
  // 4 · más grave: los huesos refuerzan los tonos bajos → bocina grande que retumba junto al busto
  escena('grave', {
    setup() { ambiente({ top: 0x2a1f3a, bottom: 0xd08a5c, fog: 0x3a2a3a, near: 6, far: 22, sunColor: 0xffd2a0, sunInt: 2.4, hemiInt: 1.0 });
      setLaboratorio({ acento: NAR }); this.b = busto(B); this.b.piel.opacity = .28; this.b.pelo.material.opacity = .28; this.b.craneo.visible = true; this.b.oido.visible = true;
      this.bone = chorro(curvaHueso, NAR, 9); this.bone.ps.forEach(p => { p.material.depthTest = false; p.renderOrder = 10; p.userData.k = 1.6; });
      const sp = group([-.95, .92, -.55]); this.sp = sp;
      box(.7, 1.05, .55, 0x2b2b33, [0, .53, 0], sp, { rough: .5 });
      this.cono = cyl(.26, .14, .08, 0x55555f, [0, .4, .3], sp, 14); this.cono.rotation.x = Math.PI / 2;
      cyl(.1, .1, .1, 0x8a8a95, [0, .4, .33], sp, 10).rotation.x = Math.PI / 2;
      cyl(.11, .06, .05, 0x55555f, [0, .82, .29], sp, 10).rotation.x = Math.PI / 2;
      this.on = ondas([0, .4, .36], { color: NAR, n: 3, vel: .9, alcance: 1.4, grosor: .03 }, sp);
      sp.rotation.y = .35; },
    update(lt, c) {
      this.bone.update(lt, .9, true); this.b.oido.material.emissiveIntensity = .4 + .6 * Math.abs(Math.sin(lt * 4));
      const tg = c.w('grave'); const k = lt > tg - .3 ? 1 : .25; this.on.update(lt, lt > tg - .6);
      this.cono.position.z = .3 + .05 * k * Math.sin(lt * 18); this.sp.scale.setScalar(1 + .02 * k * Math.sin(lt * 18));
      if (lt > tg) c.ev('heartbeat', tg, .8);
      cam([lerp(-.6, .2, einout(lt / 3.4)), lerp(2.1, 1.85, einout(lt / 3.4)), lerp(4.6, 5.1, einout(lt / 3.4))], [-.45, 1.45, -.5], 40);
      etiqueta('MÁS GRAVE', [-.95, 2.3, -.5], lt - tg, 60, '#ffb066');
      rotulo('Más grave', 'así te oyes tú por dentro', lt - c.w('grave'), 1330); if (lt > tg) c.ev('pop', tg);
    }
  });
  // 5 · el celular solo graba el aire → esa es la voz que oyen todos
  escena('celular', {
    setup() { ambiente(AMB.cuartoDia); setCuarto({ noche: false, tapete: 0x2f8f83 });
      const t = group([0, 0, .4]); box(1.4, .05, .9, 0xb07a4a, [0, .72, 0], t); for (const [x, z] of [[-.62, -.38], [.62, -.38], [-.62, .38], [.62, .38]]) box(.06, .72, .06, 0x8a5a33, [x, .36, z], t);
      this.tel = celular([0, 1.27, .45], null, 1); this.tel.rotation.x = -.15;
      cyl(.18, .2, .05, 0x333333, [0, .77, .4]);                                                   // soporte
      this.on = ondas([0, 1.4, .48], { color: CYAN, n: 4, alcance: .8, grosor: .02 });
      this.ps = [persona({ pos: [-1.0, 0, 1.1], shirt: 0x6f9bd6 }), persona({ pos: [1.15, 0, -.2], shirt: 0xb58bc0, hair: 0x1c1410 }), persona({ pos: [0, 0, -.5], shirt: 0xff7a59 })];
      this.ps[0].rotation.y = 2.15; this.ps[1].rotation.y = -1.04; },
    update(lt, c) {
      this.tel.anim(lt, true); this.on.update(lt, true);
      const t1 = c.f(1), r = einout((lt - t1 + .3) / 1.4);
      // amigos escuchan: giran la cabeza hacia el celular y asienten
      this.ps.forEach((p, k) => { p.head.rotation.x = .25 + Math.sin(lt * 4 + k) * .06 * (lt > t1); });
      this.ps[2].armL.rotation.z = lerp(0, .4, r); this.ps[2].armR.rotation.z = lerp(0, -.4, r);
      cam([lerp(.3, 1.3, r), lerp(1.4, 2.8, r), lerp(3.4, 6.0, r)], [0, lerp(1.2, 1.0, r), lerp(.45, .2, r)], lerp(36, 40, r));
      if (lt < t1 - .1) etiqueta('SOLO AIRE', [0, .88, .7], lt - c.w('graba'), 64, '#7fdcff');
      if (lt > c.w('graba')) c.ev('click', c.w('graba'), .7);
      rotulo('Tu voz real', 'la que oyen todos', lt - t1, 1330); if (lt > t1) c.ev('ding', t1, .6);
    }
  });
  // 6 · remate: le mandas el video al amigo que nunca manda audios
  escena('remate', {
    setup() { ambiente(AMB.calle); setCalle({ largo: 34 });
      this.a = persona({ pos: [-.55, .15, 1], shirt: 0x2f8f83 }); this.a.rotation.y = .9;
      this.b = persona({ pos: [.55, .15, 1], shirt: 0xf3c54d, hair: 0x1c1410 }); this.b.rotation.y = -.9;
      this.tel = celular([0, -.78, .12], this.a.armR, .5); this.tel.rotation.x = -1.2; },
    update(lt, c) {
      const ext = ease(lt / .6); this.a.armR.rotation.x = lerp(0, -1.4, ext);
      const ri = lt > 1.0 ? 1 : 0, k = Math.sin(lt * 14) * .12 * ri;
      this.b.head.rotation.x = -.15 * ri + k; this.b.armL.rotation.z = lerp(0, 2.3, ease((lt - 1) / .3)) + k; this.b.armR.rotation.z = -this.b.armL.rotation.z;
      this.a.head.rotation.x = .2 + k * .5; this.tel.anim(lt, true);
      if (lt > 1.0) c.ev('pop', 1.0, .5);
      cam([lerp(.8, .3, ease(lt / 3.6)), 1.75, lerp(6.2, 5.2, ease(lt / 3.6))], [0, 1.4, 1], 40);
      rotulo('Mándaselo', 'al que nunca manda audios', lt - c.w('mándaselo'), 1330); if (lt > c.w('mándaselo')) c.ev('pop', c.w('mándaselo'));
    }
  });
}
