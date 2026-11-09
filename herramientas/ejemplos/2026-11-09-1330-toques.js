// Short 3D: ¿Por qué siempre te da toques al bajarte del coche? (electricidad estática: la ropa se frota con el asiento
// y el cuerpo se carga; al tocar el metal la carga brinca en una chispa; con aire seco no se escapa; truco: agarrar el
// metal de la puerta antes de poner los pies en el suelo para descargarse sin sentirlo).
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-09-1330-toques.json OUT ../ejemplos/2026-11-09-1330-toques.js
// Mejora del motor en este short (MEJORAS 0s): coche() (sedán de paneles con puerta que abre, asientos, llantas, faros) y
// rayo() (arco eléctrico en zigzag con destellos) en engine.js.
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    gesto, pose, hablar, sentar, chispas, gas, coche, rayo, setCalle, AMB } = E;
  const CALLE = { ...AMB.calle, near: 8, far: 45 };
  const CPOS = [-1.6, 0, -2];
  function camRig(lt, dur, a, b, look, fov = 46, shake = 0) { const q = einout(cl(lt / dur));
    const s = shake * Math.exp(-lt * 0) ; cam([lerp(a[0], b[0], q) + Math.sin(lt * 61) * s, lerp(a[1], b[1], q) + Math.cos(lt * 53) * s, lerp(a[2], b[2], q)], look, fov); }
  function auto(abierta = 0) { const c = coche({ pos: CPOS, color: 0xc0392b }); c.rotation.y = Math.PI / 2; c.puerta.rotation.y = abierta; c.updateMatrixWorld(true); return c; }
  const W = (c, p) => { c.updateMatrixWorld(true); return c.localToWorld(new THREE.Vector3(...p)).toArray(); };
  const manoMundo = (p, lado = 'R') => { p.updateMatrixWorld(true); return p['arm' + lado].children[1].getWorldPosition(new THREE.Vector3()).toArray(); };
  function luzZap() { const l = new THREE.PointLight(0xbfe8ff, 0, 4, 1.5); E.world.add(l); return l; }
  function sentado(c, x) {   // persona sentada en el asiento del conductor mirando hacia la puerta (+x del mundo)
    const p = persona({ shirt: 0x3f7fd0, pants: 0x2f3a55 }); const s = W(c, [c.asiento[0], 0, c.asiento[2]]);
    p.position.set(x ?? s[0], c.personaY, s[2]); p.rotation.y = Math.PI / 2; sentar(p, 1); return p; }

  // 1 · gancho: se baja, toca el coche y ¡toque!
  escena('gancho', {
    setup() { ambiente(CALLE); setCalle(); this.c = auto(1.15);
      this.p = persona({ pos: [0.15, 0, -1.75], shirt: 0x3f7fd0, pants: 0x2f3a55 }); this.p.rotation.y = -Math.PI / 2;
      this.r = rayo([0, 0, 0], [0, 0, 0], { n: 8, amp: .35 }); this.l = luzZap(); },
    update(lt, c) {
      const tz = Math.max(1.1, c.w('toques') + .1), p = this.p;
      const reach = ease(lt / tz), back = lt > tz ? eout((lt - tz) / .25) : 0;
      p.armR.rotation.x = lerp(0, -1.25, reach) * (1 - back) + .4 * back; p.armL.rotation.x = 0;
      gesto(p, lt > tz ? 'sorpresa' : 'neutral');
      if (lt > tz) { pose(p, 'brazosArriba', .6 * back, lt); p.position.y = Math.max(0, Math.sin(cl((lt - tz) / .35) * Math.PI) * .12); p.position.x = .15 + .15 * back; }
      const h = manoMundo(p); this.r.setAB(h, [h[0] - .22, h[1] - .02, h[2]]);
      const k = lt > tz - .08 && lt < tz + .3 ? 1 - (lt - tz + .08) / .38 : 0; this.r.update(lt, k); this.l.position.set(...h); this.l.intensity = 12 * k;
      if (lt > tz - .08) c.ev('zap', tz - .08, 1);
      camRig(lt, c.dur, [1.1, 1.65, 2.1], [.7, 1.55, 1.5], [-.1, 1.2, -1.85], 46, lt > tz && lt < tz + .4 ? .03 : 0);
      rotulo('¡Toque!', 'cada vez que te bajas', lt - tz - .2, 1330); if (lt > tz + .2) c.ev('pop', tz + .2, .6);
    }
  });
  // 2 · frota: la ropa contra el asiento te carga
  escena('frota', {
    setup() { ambiente(CALLE); setCalle(); this.c = auto(1.15); this.p = sentado(this.c);
      this.x0 = this.p.position.x; this.ch = chispas(46, 0x8fe3ff); },
    update(lt, c) {
      const p = this.p, sl = Math.sin(lt * 7) * .03 * (lt < 3 ? 1 : 0);   // se mueve en el asiento: fricción
      p.position.x = this.x0 + ease(lt / c.dur) * .35 + sl; p.torso.rotation.y = Math.sin(lt * 7) * .08;
      const q = cl((lt - c.w('frota')) / 2.2);
      const b = [p.position.x - .05, p.position.y + .95, p.position.z], t = [p.position.x - .05, p.position.y + 1.35, p.position.z];
      this.ch.update([b, t], .3, lt, q);
      gesto(p, lt > c.w('cargas') ? 'sorpresa' : 'neutral');
      const pl = [[-.15, .5, .3], [.12, .7, -.25], [-.1, .95, -.32], [.1, 1.15, .3], [0, 1.45, -.3], [-.12, .3, -.05]];
      pl.forEach((o, i) => etiqueta('+', [p.position.x + o[0], p.position.y + o[1], p.position.z + o[2]], lt - c.w('cargas') - i * .12, 74, '#f3c54d'));
      etiqueta('ROPA', [p.position.x + .25, p.position.y + .62, p.position.z + .35], lt - c.w('ropa'), 46, '#fff', true);
      etiqueta('ASIENTO', W(this.c, [.2, .55, -.05]), lt - c.w('asiento'), 46, '#fff', true);
      if (lt > c.w('cargas')) c.ev('zap', c.w('cargas'), .35);
      camRig(lt, c.dur, [2.7, 1.75, .2], [2.3, 1.6, -.5], [-.9, .9, -2.4], 46);
      rotulo('Te cargas', 'ropa + asiento = electricidad', lt - c.w('cargas'), 1330);
    }
  });
  // 3 · chispa: el dedo se acerca al metal y la carga brinca
  escena('chispa', {
    setup() { ambiente({ ...CALLE, near: 4, far: 30 }); setCalle(); this.c = auto(0);
      this.m = E.mano([.3, .82, -2.42], .22, null, { manga: 0x3f7fd0 }); this.m.rotation.z = Math.PI / 2; this.m.flex(1.3); this.m.flex(0, 1);
      this.r = rayo([0, 0, 0], [0, 0, 0], { n: 9, amp: .5, grosor: .012 }); this.l = luzZap(); this.ch = chispas(22, 0x8fe3ff); },
    update(lt, c) {
      const tz = Math.max(.9, c.w('brinca')), x = lt < tz ? lerp(.35, .02, ease(lt / tz)) : .02 + .28 * eout((lt - tz - .15) / .4) * (lt > tz + .15 ? 1 : 0);
      this.m.position.x = x; this.m.flex(lt > tz + .15 ? 1.5 : 1.3); this.m.flex(lt > tz + .15 ? .9 : 0, 1);
      const tip = [x - .45, .9, -2.42], wall = [-.68, .9, -2.42];
      this.r.setAB(tip, wall); const k = lt > tz - .05 && lt < tz + .45 ? (Math.sin(lt * 60) > -.3 ? 1 : .4) * (1 - (lt - tz) / .5) : 0;
      this.r.update(lt, k); this.l.position.set(-.55, .95, -2.3); this.l.intensity = 30 * k;
      this.ch.update([[x - .2, .9, -2.42]], .12, lt, lt < tz ? .8 : 0);
      if (lt > tz - .05) c.ev('zap', tz - .05, 1); if (lt > c.w('zas')) c.ev('impact', c.w('zas'), .5);
      const sh = lt > tz && lt < tz + .5 ? .012 : 0;
      cam([lerp(-.1, -.2, ease(lt / c.dur)) + Math.sin(lt * 61) * sh, 1.1 + Math.cos(lt * 47) * sh, lerp(-.2, -.6, ease(lt / c.dur))], [-.22, .9, -2.42], 44);
      etiqueta('METAL', [-.7, 1.12, -2.2], lt - .3, 50, '#fff', true);
      rotulo('¡Zas!', 'la carga brinca de golpe', lt - c.w('zas'), 1330);
    }
  });
  // 4 · seco: con aire seco la carga se queda; con humedad se escapa
  escena('seco', {
    setup() { ambiente({ top: 0x6f8fc2, bottom: 0xf2c58e, fog: 0xd8b48e, near: 9, far: 40, sunColor: 0xffe2b8, sunInt: 2.6, hemiInt: 1.1 }); setCalle();
      this.a = persona({ pos: [-.85, 0, 0], shirt: 0xe0a33a, pants: 0x3d4a66 }); this.b = persona({ pos: [.85, 0, 0], shirt: 0x3fa7a0, pants: 0x3d4a66, pelo: 'largo' });
      this.ca = chispas(50, 0x8fe3ff); this.cb = chispas(50, 0x8fe3ff);
      this.gotas = Array.from({ length: 22 }, (_, k) => { const d = ball(.045, 0x7fc8ff, [0, 0, 0], null, 1, { emissive: 0x3a90ff, ei: .4, opacity: .8 }); d.castShadow = false; d.k = k; return d; }); },
    update(lt, c) {
      this.ca.update([[-.85, 1.0, 0], [-.85, 1.5, 0]], .45, lt, 1);
      const esc = ease(lt / 3); this.cb.update([[.85, 1.0 + esc * 1.2, 0], [.85, 1.5 + esc * 1.4, 0]], .45 + esc * .5, lt, 1 - esc * .85);
      this.gotas.forEach(d => { const ph = (lt * .35 + d.k / 22) % 1, a = d.k * 2.4; d.position.set(.85 + Math.cos(a) * (.4 + ph * .3), .3 + ph * 2.4, Math.sin(a) * (.4 + ph * .3)); d.material.opacity = .8 * Math.sin(Math.PI * ph); });
      gesto(this.a, 'sorpresa'); this.a.armL.rotation.z = -.25 - Math.sin(lt * 9) * .05; this.a.armR.rotation.z = .25 + Math.sin(lt * 9) * .05;
      gesto(this.b, lt > 1.5 ? 'feliz' : 'neutral');
      camRig(lt, c.dur, [0, 1.5, 5.6], [0, 1.4, 5.0], [0, 1.2, 0], 50);
      etiqueta('AIRE SECO', [-.85, 2.45, 0], lt - .15, 50, '#f3c54d', true); etiqueta('HÚMEDO', [.85, 2.45, 0], lt - .45, 50, '#fff', true);
      if (lt > .2) c.ev('whoosh', .2, .4);
      rotulo('Aire seco', 'la carga no se escapa', lt - c.w('escapa') + .3, 1330);
    }
  });
  // 5 · truco: agarra el metal antes de pisar el suelo
  escena('truco', {
    setup() { ambiente(CALLE); setCalle(); this.c = auto(1.15); this.p = sentado(this.c); this.x0 = this.p.position.x;
      this.g = null; this.ch = chispas(40, 0x8fe3ff); this.marco = W(this.c, [0, 1.0, .9]); this.glow = ball(.06, 0xbfe8ff, this.marco, null, 1, { emissive: 0xbfe8ff, ei: 2, opacity: .7 }); this.glow.castShadow = false; },
    update(lt, c) {
      const p = this.p, ta = c.w('agarra'), tp = c.w('pisar'), td = c.w('descarga');
      const g = ease((lt - ta + .3) / .7);
      p.armL.rotation.x = lerp(0, -1.05, g); p.armL.rotation.z = lerp(0, -.55, g);
      const st = ease((lt - tp) / 1.4); p.position.x = this.x0 + .2 + st * .45; sentar(p, 1 - st * .55); p.position.y = this.c.personaY + st * .12;
      const h = manoMundo(p, 'L');
      if (!this.g) this.g = gas([p.position.x, 1.05, p.position.z], h, 26, 0x8fe3ff);
      const fl = lt > ta + .3 && lt < td + 1.4 ? 1 : 0; this.g.update(lt, fl, .9);
      this.g.ps.forEach(q => { if (q.visible) { } });
      const dren = cl((lt - ta - .3) / 3); this.ch.update([[p.position.x - .05, p.position.y + 1.05, p.position.z], [p.position.x - .05, p.position.y + 1.4, p.position.z]], .3, lt, 1 - dren);
      this.glow.position.set(...h); this.glow.scale.setScalar(fl ? 1 + .4 * Math.sin(lt * 20) : .01);
      gesto(p, lt > td ? 'feliz' : 'neutral');
      camRig(lt, c.dur, [2.6, 1.75, .3], [2.2, 1.6, -.3], [-.75, .95, -2.3], 46);
      if (lt < td) etiqueta('METAL', [this.marco[0] + .05, this.marco[1] + .32, this.marco[2]], lt - ta, 46, '#f3c54d', true);
      etiqueta('SIN DOLOR', [p.position.x + .2, p.position.y + 1.45, p.position.z + .55], lt - td, 50, '#fff', true);
      if (lt > ta) c.ev('click', ta, .6); if (lt > td) c.ev('ding', td, .7);
      rotulo('Agarra el metal', 'antes de pisar el suelo', lt - ta, 1330);
    }
  });
  // 6 · remate: a quien siempre se queja de los toques
  escena('remate', {
    setup() { ambiente(CALLE); setCalle(); this.c = auto(1.15);
      this.a = persona({ pos: [0.15, 0, -1.75], shirt: 0x3f7fd0, pants: 0x2f3a55 }); this.a.rotation.y = -Math.PI / 2;
      this.b = persona({ pos: [1.7, 0, -.9], shirt: 0xe0a33a, pelo: 'largo' }); this.b.rotation.y = -1.3;
      this.r = rayo([0, 0, 0], [0, 0, 0], { n: 8, amp: .35 }); this.l = luzZap(); },
    update(lt, c) {
      const a = this.a, ph = (lt % 1.1) / 1.1, zap = ph > .55 && ph < .75;
      a.armR.rotation.x = ph < .55 ? lerp(0, -1.25, ease(ph / .55)) : lerp(-1.25, .3, eout((ph - .55) / .2));
      a.position.y = zap ? .08 : 0; gesto(a, 'enojada'); if (!zap) hablar(a, lt, .8);
      const h = manoMundo(a); this.r.setAB(h, [h[0] - .2, h[1], h[2]]); this.r.update(lt, zap ? 1 : 0); this.l.position.set(...h); this.l.intensity = zap ? 7 : 0;
      if (zap) c.ev('zap', lt - (ph - .55) * 1.1, .7);
      gesto(this.b, 'feliz'); hablar(this.b, lt, 1); pose(this.b, 'senalar', 1, lt);
      camRig(lt, c.dur, [1.0, 1.75, 3.6], [.9, 1.7, 3.2], [.8, 1.1, -1.3], 50);
      rotulo('Mándaselo', 'a quien siempre se queja de los toques', lt - c.w('mándaselo'), 1330);
    }
  });
}
