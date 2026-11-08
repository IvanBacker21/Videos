// Short 3D: ¿Por qué los moscos te pican a ti y a los demás no? (solo pican las hembras; te encuentran por el aire que exhalas;
// el olor de la piel decide; los "imanes de moscos" lo siguen siendo durante años — Rockefeller, 2022)
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-08-1330-moscos.json OUT ../ejemplos/2026-11-08-1330-moscos.js
// Mejoras del motor en este short: mosquito()+volar(), setPatio() (AMB.patioNoche), ronchas(); y MEJORAS 0r (setAlberca, palmera, arrugas, pasa).
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, mat, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    mano, gas, ondas, reloj, gesto, pose, hablar, mosquito, volar, setPatio, ronchas, AMB } = E;
  function camRig(lt, dur, a, b, look, fov = 46) { const q = einout(cl(lt / dur)); cam([lerp(a[0], b[0], q), lerp(a[1], b[1], q), lerp(a[2], b[2], q)], look, fov); }
  const enjambre = (n, s) => Array.from({ length: n }, () => mosquito({ s }));
  function cruz(pos) { const x = group(pos); const r = mat(0xe03a3a, { emissive: 0xa01010, ei: .7 });
    box(.7, .1, .05, r, [0, 0, 0], x).rotation.z = .75; box(.7, .1, .05, r, [0, 0, 0], x).rotation.z = -.75; x.scale.setScalar(.01); return x; }
  // Imán de herradura rojo con puntas plateadas; abre hacia +y (gíralo para apuntarlo).
  function iman(pos, s = 1) { const g = group(pos); g.scale.setScalar(s); const R = mat(0xd8342f, { rough: .5 }), P = mat(0xd9dde3, { metal: .6, rough: .3 });
    box(.62, .18, .2, R, [0, 0, 0], g); for (const x of [-.22, .22]) { box(.18, .5, .2, R, [x, .3, 0], g); box(.18, .14, .2, P, [x, .62, 0], g); } return g; }

  // ---------- 1. GANCHO: patio de noche; a uno lo rodean los moscos, al otro no ----------
  escena('gancho', {
    setup(c) {
      ambiente(AMB.patioNoche); setPatio();
      this.a = persona({ pos: [-.55, 0, 0], shirt: 0x3f8fd0, pants: 0x3d4a66, hair: 0x2a1c14 });
      this.b = persona({ pos: [.6, 0, -.1], shirt: 0xe8a33d, pants: 0x5a4636, pelo: 'largo', hair: 0x4a2c1c }); this.b.rotation.y = -.2;
      this.m = enjambre(6, .38); this.x = cruz([-.45, 1.85, .7]);
    },
    update(lt, c) {
      const a = this.a, t1 = c.f(1) || 2.9;
      this.m.forEach((m, k) => volar(m, lt, [-.55, 2.0 + (k % 3) * .12, .05], .42 + (k % 2) * .12, { vel: 1.3 + k * .12, fase: k * 1.1, alto: .6 }));
      const slap = Math.max(0, Math.sin(lt * 5.5)); a.armR.rotation.set(-2.2 * ease((lt - .6) / .4) * (.6 + .4 * slap), 0, .5);
      a.armL.rotation.set(-1.2 * ease((lt - 1.2) / .4) * Math.max(0, Math.sin(lt * 4 + 1)), 0, -.3);
      a.head.rotation.y = Math.sin(lt * 3) * .25; gesto(a, lt > .5 ? 'enojada' : 'sorpresa');
      gesto(this.b, 'feliz'); this.b.head.rotation.y = -.35; pose(this.b, 'encoger', ease((lt - 1.5) / .5) * .7, lt);
      camRig(lt, c.dur, [.1, 1.9, 5.0], [-.25, 2.0, 3.6], [0, 1.65, 0], 48);
      etiqueta('TÚ', [-.55, 2.75, 0], lt - .3, 56, '#ffd36b', true); etiqueta('TU AMIGO', [.6, 2.6, -.1], lt - .7, 46, '#ffffff', true);
      if (lt > .2) c.ev('zap', .2, .5); if (lt > .9) c.ev('click', .9, .7);
      if (lt < t1) rotulo('¿Por qué a ti?', 'y a los demás no', lt - .25);
      else { this.x.scale.setScalar(Math.max(.01, spring((lt - t1 - .9) / .6))); this.x.lookAt(E.camera.position);
        etiqueta('¿SANGRE DULCE?', [-.2, 2.4, .6], lt - t1 - .2, 54, '#ff8a7a', true);
        rotulo('Mito', 'no es la sangre dulce', lt - t1 - .9); if (lt > t1 + .9) c.ev('impact', t1 + .9, .8); }
    }
  });

  // ---------- 2. HEMBRAS: mosca hembra gigante con pico vs. macho que toma néctar de una flor ----------
  escena('hembras', {
    setup(c) {
      ambiente({ top: 0x2d4a3c, bottom: 0xe0b77a, fog: 0x9c8f6a, near: 5, far: 20, sunColor: 0xffe2b0, sunInt: 2.5, hemiInt: 1.1, sunPos: [4, 8, 6] });
      box(14, .1, 10, 0x4f7f3f, [0, -.05, 0]);
      for (let k = 0; k < 30; k++) { const h = .3 + (k % 4) * .15; box(.06, h, .06, 0x5f9a48, [((k * 37) % 60) / 10 - 3, h / 2, -((k * 53) % 40) / 10 - .5]).rotation.z = (k % 5 - 2) * .1; }
      // flor para el macho
      const fl = group([.75, 0, 0]); cyl(.03, .04, 1.0, 0x3f8a3a, [0, .5, 0], fl, 5); box(.3, .02, .1, 0x4f9a45, [.12, .45, 0], fl).rotation.z = .5;
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; const p = ball(.14, 0xff7fb0, [Math.cos(a) * .17, 1.02, Math.sin(a) * .17], fl, 0); p.scale.set(1, .35, 1); }
      ball(.1, 0xffd34a, [0, 1.06, 0], fl, 1, { emissive: 0xffa020, ei: .3 });
      this.h = mosquito({ pos: [-.45, 1.25, 0], s: .85 }); this.h.rotation.y = Math.PI / 2 - .35;
      this.mc = mosquito({ pos: [.85, 1.38, -.05], s: .6, macho: true, color: 0x4a423a }); this.mc.rotation.set(.35, -Math.PI / 2 + .3, 0);
      this.gota = ball(.07, 0xd0302a, [0, 0, 0], this.h.pico, 1, { emissive: 0x801010, ei: .5 }); this.gota.position.set(0, -.24, 0); this.gota.scale.setScalar(.01);
      this.huevos = Array.from({ length: 9 }, (_, k) => { const e = ball(.045, 0xf4efe0, [-.35 + (k % 3) * .1, .12 + Math.floor(k / 3) * .02, .2 + Math.floor(k / 3) * .1], null, 1); e.scale.set(.7, .7, 1.5); e.scale.multiplyScalar(.01); return e; });
    },
    update(lt, c) {
      const th = c.w('huevitos') || 3.2, tn = c.w('necesitan') || 1.9;
      this.h.position.y = 1.25 + Math.sin(lt * 2.4) * .05; this.h.update(lt); this.mc.update(lt, .2); this.mc.position.y = 1.38 + Math.sin(lt * 3) * .01;
      this.gota.scale.setScalar(Math.max(.01, spring((lt - tn) / .5)));
      this.huevos.forEach((e, k) => { const s = Math.max(.01, spring((lt - th - k * .05) / .5)); e.scale.set(.7 * s, .7 * s, 1.5 * s); });
      const q = einout(cl(lt / c.dur)), ang = lerp(-.2, .15, q), R = lerp(4.6, 4.2, q);
      cam([Math.sin(ang) * R + .2, lerp(1.6, 1.45, q), Math.cos(ang) * R], [.2, 1.1, 0], 50);
      etiqueta('HEMBRA: PICA', [-.25, 1.85, 0], lt - .3, 50, '#ffd36b', true);
      etiqueta('MACHO: NÉCTAR', [.6, 1.95, 0], lt - .9, 42, '#ffffff', true);
      if (lt > th) etiqueta('HUEVITOS', [-.25, .45, .3], lt - th, 44, '#ffd36b', true);
      if (lt > .3) c.ev('pop', .3, .6); if (lt > th) c.ev('ding', th, .6);
      rotulo('Solo pican las hembras', 'necesitan sangre para sus huevitos', lt - tn);
    }
  });

  // ---------- 3. ALIENTO: la persona exhala, la nube viaja y un mosco la sigue desde lejos ----------
  escena('aliento', {
    setup(c) {
      ambiente(AMB.patioNoche); setPatio();
      this.p = persona({ pos: [-.4, 0, .4], shirt: 0x3f8fd0, pants: 0x3d4a66, hair: 0x2a1c14 }); this.p.rotation.y = Math.PI / 2;
      const boca = [-.15, 1.82, .4]; this.boca = boca;
      this.g1 = gas(boca, [2.6, 2.3, -.4], 40, 0xbfe6ff); this.g2 = gas(boca, [2.4, 1.9, .6], 30, 0xd9f2ff);
      this.on = ondas(boca, { color: 0xbfe6ff, n: 3, vel: .9, alcance: .45, dir: [0, 0, 0], opacidad: .5 });
      this.m = mosquito({ s: .45 }); this.curva = new THREE.CatmullRomCurve3([[3.4, 2.6, -.8], [2.4, 2.2, -.3], [1.4, 2.25, .4], [.4, 1.95, .2], [.15, 1.9, .45]].map(a => new THREE.Vector3(...a)));
    },
    update(lt, c) {
      const p = this.p, ph = (lt % 1.6) / 1.6; p.torso.scale.set(1, 1, 1 + .06 * Math.sin(ph * Math.PI * 2));
      gesto(p, lt > 3.3 ? 'sorpresa' : 'neutral'); p.boca.scale.y *= 1 + 1.4 * cl(Math.sin(ph * Math.PI * 2));
      this.g1.update(lt, 1, .32); this.g2.update(lt + .4, 1, .28); this.on.update(lt);
      const u = ease(cl((lt - .6) / 3.0)), q = this.curva.getPoint(u), q2 = this.curva.getPoint(Math.min(1, u + .02));
      this.m.position.set(q.x, q.y + Math.sin(lt * 7) * .05, q.z); if (u < .99) this.m.lookAt(q2); this.m.update(lt);
      if (lt > 3.4) p.head.rotation.y = -.5 * ease((lt - 3.4) / .3);
      const tl = c.w('lejos') || 3.0;
      camRig(lt, c.dur, [.1, 2.0, 5.4], [-.1, 1.95, 4.6], [.55, 1.75, 0], 50);
      etiqueta('AIRE QUE EXHALAS', [.7, 2.65, 0], lt - .5, 46, '#bfe6ff', true);
      if (lt > .7) c.ev('whoosh', .7, .5); if (lt > tl) c.ev('zap', tl, .5);
      rotulo('Te huelen al respirar', 'desde lejos', lt - tl);
    }
  });

  // ---------- 4. PIEL: olor que sale de la mano; mano "imán" con mucho olor y moscos vs. mano con poco ----------
  escena('piel', {
    setup(c) {
      ambiente({ top: 0x1b1630, bottom: 0x4a3360, fog: 0x231c3a, near: 6, far: 20, sunColor: 0xffe2c8, sunInt: 2.2, hemiInt: 1.0, sunPos: [3, 8, 6] });
      box(10, .1, 8, 0x2e2744, [0, -.05, 0]);
      this.A = mano([-.52, .55, 0], .45, null, { manga: 0x3f8fd0 }); this.B = mano([.52, .55, 0], .45, null, { manga: 0xe8a33d, skin: 0xc68e6a, skin2: 0xb27a58 });
      this.A.rotation.y = .15; this.B.rotation.y = -.15;
      const pal = (x) => [x, 1.0, .12];
      this.gA = [gas(pal(-.52), [-.75, 2.3, .4], 36, 0xd8ff7a), gas([-.6, 1.25, .1], [-.3, 2.4, .5], 30, 0xc6ff5a), gas([-.42, .85, .12], [-.9, 2.1, .3], 30, 0xe4ff9a)];
      this.gB = gas(pal(.52), [.6, 1.8, .3], 8, 0xd8ff7a);
      this.m = enjambre(3, .3);
      this.dest = [[-.62, 1.1, .3], [-.42, .85, .3], [-.5, 1.32, .29]];
    },
    update(lt, c) {
      const t1 = c.f(1) || 3.2, ta = c.w('ácidos') || 5.4;
      this.gA.forEach((g, k) => g.update(lt + k * .3, 1, .3)); this.gB.update(lt, lt > t1 ? 1 : 0, .3);
      this.A.flex(.08 + .04 * Math.sin(lt * 2)); this.B.flex(.08);
      this.m.forEach((m, k) => { const d = this.dest[k], u = ease((lt - 1.0 - k * .5) / 1.6);
        if (u <= 0) { m.visible = lt > .5 + k * .4; volar(m, lt, [-.6 + k * .2, 2.3, .8], .4, { vel: 1.5, fase: k }); }
        else { const o = [-.6 + k * .2 + Math.cos(lt * 1.3 + k) * .4, 2.3, .8 + Math.sin(lt * 1.3 + k) * .3];
          m.position.set(lerp(o[0], d[0], u), lerp(o[1], d[1], u), lerp(o[2], d[2], u)); m.rotation.set(-.3, Math.PI, 0); m.update(lt, 1 - u * .85); } });
      if (lt < t1) cam([lerp(-.2, -.35, ease(lt / t1)), 1.25, lerp(2.4, 2.1, ease(lt / t1))], [-.5, 1.1, 0], 46);
      else { const q = ease((lt - t1) / 1.0); cam([lerp(-.35, 0, q), lerp(1.25, 1.35, q), lerp(2.1, 3.9, q)], [lerp(-.5, 0, q), 1.1, 0], 50); }
      if (lt < t1) { etiqueta('OLOR DE TU PIEL', [-.55, 2.0, .3], lt - .4, 48, '#d8ff7a', true); rotulo('El olor de tu piel', 'decide a quién pican', lt - 1.2); }
      else { etiqueta('MÁS ÁCIDOS', [-.4, 1.8, .4], lt - ta + .3, 46, '#d8ff7a', true); etiqueta('MENOS', [.45, 1.85, .2], lt - ta, 46, '#ffffff', true);
        rotulo('Unos ácidos de la piel', 'que a los moscos les encantan', lt - ta - .3); }
      if (lt > 1.6) c.ev('pop', 1.6, .5); if (lt > t1) c.ev('whoosh', t1, .5); if (lt > ta) c.ev('ding', ta, .6);
    }
  });

  // ---------- 5. IMÁN: la persona con un imán gigante; los moscos llegan en fila; el reloj gira (años) ----------
  escena('iman', {
    setup(c) {
      ambiente(AMB.patioNoche); setPatio();
      this.p = persona({ pos: [0, 0, .2], shirt: 0x3f8fd0, pants: 0x3d4a66, hair: 0x2a1c14 });
      this.i = iman([.32, 1.5, 1.0], .75); this.i.rotation.x = Math.PI / 2 - .2;
      this.m = enjambre(9, .26); this.r = reloj([-1.55, 2.55, -2.9], .42);
      this.on = ondas([.32, 1.5, 1.4], { color: 0xff6a5a, n: 4, vel: 1.2, alcance: .55, opacidad: .5 });
    },
    update(lt, c) {
      const p = this.p; p.armR.rotation.set(-1.35, 0, .05); p.armL.rotation.set(-1.25, 0, -.35); gesto(p, lt > 2 ? 'triste' : 'sorpresa');
      this.on.update(lt); this.i.position.y = 1.5 + Math.sin(lt * 3) * .02;
      this.m.forEach((m, k) => { const u = cl((lt * .45 + k / 9) % 1), a = k * 2.4;
        const o = [Math.cos(a) * 3.2, 1.6 + Math.sin(a * 1.7) * .9, 1.4 + Math.sin(a) * 2.2], d = [.32 + Math.cos(lt * 4 + k) * .25, 1.55 + Math.sin(lt * 5 + k) * .2, 1.35];
        const e = ease(u); m.position.set(lerp(o[0], d[0], e), lerp(o[1], d[1], e) + Math.sin(lt * 8 + k) * .04, lerp(o[2], d[2], e)); m.lookAt(d[0], d[1], d[2]); m.update(lt); m.visible = lt > k * .12; });
      this.r.min.rotation.z = -lt * 14; this.r.hor.rotation.z = -lt * 1.2;
      const ta = c.w('años') || 3.2;
      camRig(lt, c.dur, [2.7, 2.0, 4.0], [2.2, 1.9, 3.6], [.1, 1.6, .4], 50);
      etiqueta('IMÁN DE MOSCOS', [.32, 2.2, 1.0], lt - .4, 48, '#ffd36b', true);
      if (lt > .4) c.ev('zap', .4, .5); if (lt > ta) c.ev('ding', ta, .6);
      rotulo('Imán de moscos', 'lo siguieron siendo durante años', lt - (c.w('imanes') || 1.2));
    }
  });

  // ---------- 6. REMATE: en la fiesta, uno lleno de ronchas se rasca; los demás ni un piquete ----------
  escena('remate', {
    setup(c) {
      ambiente(AMB.patioNoche); setPatio();
      this.a = persona({ pos: [0, 0, .4], shirt: 0x3f8fd0, pants: 0x3d4a66, hair: 0x2a1c14 });
      this.b = persona({ pos: [-1.15, 0, -.2], shirt: 0xd04a7a, pants: 0x3d4a66, pelo: 'largo', hair: 0x2a1c14 }); this.b.rotation.y = .55;
      this.c = persona({ pos: [1.15, 0, -.3], shirt: 0xe8a33d, pants: 0x5a4636, hair: 0x5a3a20 }); this.c.rotation.y = -.55;
      this.r = ronchas(this.a, 12); this.m = enjambre(5, .26);
    },
    update(lt, c) {
      const a = this.a; this.r.update(cl(lt / 1.2)); gesto(a, 'triste');
      a.armR.rotation.set(-.9 + Math.sin(lt * 14) * .25, 0, .9); a.armL.rotation.set(-.4, 0, -.2 + Math.sin(lt * 12) * .1); a.head.rotation.z = Math.sin(lt * 6) * .06;
      [this.b, this.c].forEach((p, k) => { gesto(p, 'feliz'); hablar(p, lt + k, .8); pose(p, 'senalar', .9, lt); p.position.y = Math.abs(Math.sin(lt * 7 + k)) * .03; });
      this.m.forEach((m, k) => volar(m, lt, [0, 1.95, .5], .45 + (k % 2) * .1, { vel: 1.4 + k * .1, fase: k * 1.3, alto: .7 }));
      camRig(lt, c.dur, [0, 1.8, 5.2], [.2, 1.85, 4.4], [0, 1.45, 0], 50);
      if (lt > .3) c.ev('pop', .3, .5);
      rotulo('Mándaselo', 'a quien siempre se lo comen los moscos', lt - .25);
    }
  });
}
