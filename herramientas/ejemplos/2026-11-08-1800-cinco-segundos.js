// Short 3D: ¿La regla de los cinco segundos funciona? (Rutgers, 2016: las bacterias pasan en menos de un segundo;
// lo que más importa es la humedad: la sandía es la peor, la gomita casi no recoge; la alfombra pasa menos que el piso liso)
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-08-1800-cinco-segundos.json OUT ../ejemplos/2026-11-08-1800-cinco-segundos.js
// Mejoras del motor en este short (MEJORAS 0t): mosca(), abeja(), flor() y germenes() (bacterias que brincan de un lugar a otro).
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, mat, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    setCocina, setLaboratorio, gesto, pose, hablar, reloj, germenes, mosca, volar, ondas } = E;
  function camRig(lt, dur, a, b, look, fov = 46) { const q = einout(cl(lt / dur)); cam([lerp(a[0], b[0], q), lerp(a[1], b[1], q), lerp(a[2], b[2], q)], look, fov); }

  // ---------- utilería ----------
  // Galleta con chispas de chocolate (cara arriba).
  function galleta(pos, r = .1, parent) { const g = group(pos, parent);
    cyl(r, r * 1.02, r * .28, 0xd9a35a, [0, 0, 0], g, 12, { rough: .8 });
    for (let k = 0; k < 7; k++) { const a = k * 2.4, d = r * (.25 + (k % 3) * .22); box(r * .18, r * .1, r * .18, 0x4a2a18, [Math.cos(a) * d, r * .15, Math.sin(a) * d], g).rotation.y = k; }
    return g; }
  // Rebanada de sandía (cuña): pulpa roja con semillas, cáscara verde; brillo húmedo y gotitas.
  function sandia(pos, s = 1, parent) { const g = group(pos, parent); g.scale.setScalar(s);
    const geo = (r, col, o) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, .22, 16, 1, false, -Math.PI / 4, Math.PI / 2), mat(col, o)); m.castShadow = true; m.receiveShadow = true; m.rotation.x = Math.PI / 2; g.add(m); return m; };
    const rind = geo(.62, 0x2f8a3a); rind.scale.z = .98; const blanco = geo(.56, 0xe9f2c8); blanco.position.z = .001;
    const pulpa = geo(.5, 0xf0434f, { rough: .25, emissive: 0x801018, ei: .2 }); pulpa.scale.set(1, 1.05, 1.05);
    for (let k = 0; k < 7; k++) { const a = -Math.PI / 4 + .18 + (k % 4) * .38, d = .2 + (k % 2) * .16; const se = ball(.025, 0x1a1210, [Math.sin(a) * d, Math.cos(a) * d - .1, .13], g, 0); se.scale.set(1, 1.6, .6); }
    g.gotas = Array.from({ length: 5 }, (_, k) => ball(.03, 0xbfe9ff, [-.2 + k * .1, .22 + (k % 2) * .08, .14], g, 1, { opacity: .7, rough: .05, emissive: 0x6fbfe0, ei: .4 }));
    g.rotation.x = -Math.PI / 2; g.rotation.z = Math.PI; return g; }
  // Gomita (ositos) — seca: casi no recoge nada.
  function gomita(pos, s = 1, color = 0x4fc46a, parent) { const g = group(pos, parent); g.scale.setScalar(s);
    const M = mat(color, { opacity: .85, rough: .25, emissive: color, ei: .25 });
    ball(.2, M, [0, .2, 0], g, 1).scale.set(1, 1.15, .7); ball(.15, M, [0, .5, 0], g, 1).scale.set(1, 1, .75);
    for (const sx of [-1, 1]) { ball(.06, M, [sx * .11, .63, 0], g, 0); ball(.07, M, [sx * .2, .3, 0], g, 0); ball(.08, M, [sx * .1, .04, 0], g, 0); }
    return g; }
  // Piso de prueba (loseta) y tapete de alfombra con pelitos.
  function loseta(pos, w = 1.6, d = 1.6, color = 0xd8d2c4) { const g = group(pos); box(w, .06, d, color, [0, -.03, 0], g, { rough: .25 });
    box(w + .04, .02, .02, 0x9a958a, [0, 0, d / 2], g); return g; }
  function alfombra(pos, w = 1.6, d = 1.6, color = 0xb0566a) { const g = group(pos); box(w, .06, d, color, [0, -.03, 0], g, { rough: 1 });
    for (let x = 0; x < 12; x++) for (let z = 0; z < 12; z++) { const p = box(.05, .06 + ((x * 7 + z * 3) % 4) * .012, .05, (x + z) % 3 ? color : 0x9a4458, [-w / 2 + (x + .5) * w / 12, .03, -d / 2 + (z + .5) * d / 12], g); p.castShadow = false; }
    return g; }
  function cruz(pos, s = 1) { const x = group(pos); const r = mat(0xe03a3a, { emissive: 0xa01010, ei: .7 });
    box(.7, .1, .05, r, [0, 0, 0], x).rotation.z = .75; box(.7, .1, .05, r, [0, 0, 0], x).rotation.z = -.75; x.userData.s = s; x.scale.setScalar(.01); return x; }
  // Esparce gérmenes sobre un rectángulo del piso.
  // Punto i de n repartido en un disco/elipse (ángulo dorado: sin filas ni rayas).
  const disco = (i, n, cx, cz, rx, rz, y) => { const a = i * 2.39996, r = Math.sqrt((i + .5) / n); return [cx + Math.cos(a) * r * rx, y, cz + Math.sin(a) * r * (rz ?? rx)]; };
  function sembrar(gm, cx, cz, w, d, y = .05) { const n = gm.G.length; gm.G.forEach((g, i) => gm.setA(i, disco((i * 7) % n, n, cx, cz, w / 2, d / 2, y))); }

  // ---------- 1. GANCHO: en la cocina se cae una galleta; él la señala: "¡cinco segundos!" ----------
  escena('gancho', {
    setup(c) {
      ambiente({ top: 0x6a7f9a, bottom: 0xf0c48a, fog: 0xd9c4a4, near: 6, far: 22, sunColor: 0xfff0d8, sunInt: 2.5, hemiInt: 1.15, sunPos: [3, 8, 7] });
      setCocina({ acento: 0x4f8a7a });
      this.p = persona({ pos: [-.35, 0, .2], shirt: 0xe0573f, pants: 0x3d4a66, hair: 0x2a1c14 }); this.p.rotation.y = .35;
      this.gal = galleta([0, 0, 0], .2); this.r = reloj([.6, 1.6, -.3], .28); this.r.scale.setScalar(.01);
      this.on = ondas([.25, .06, .75], { color: 0xffd36b, n: 3, vel: 1.2, alcance: .6, opacidad: .6 });
    },
    update(lt, c) {
      const p = this.p, tc = c.w('¡cinco') || 1.7, tf = c.f(1) || 2.8;
      // la galleta cae de la mano (y≈1.15) al piso con rebote y giro
      const u = cl((lt - .15) / .55), y = lt < .7 ? lerp(1.15, .03, u * u) : .03 + Math.abs(Math.sin((lt - .7) * 9)) * .12 * Math.max(0, 1 - (lt - .7) * 2.2);
      this.gal.position.set(lerp(-.05, .25, ease(u)), y, lerp(.45, .75, ease(u))); this.gal.rotation.set(lt < .7 ? u * 5 : 0, 0, lt < .7 ? u * 2 : 0);
      if (lt > .7) this.on.update(lt - .7);
      p.armR.rotation.set(lt < .2 ? -1.0 : -1.0 + ease((lt - .2) / .3) * .6, 0, .2); gesto(p, lt > .65 ? 'sorpresa' : 'neutral');
      if (lt > tc - .3) { pose(p, 'senalar', ease((lt - tc + .3) / .3), lt); hablar(p, lt, lt < tf ? 1 : .2); p.head.rotation.x = .25; }
      this.r.scale.setScalar(Math.max(.01, spring((lt - tc) / .6))); this.r.min.rotation.z = -(lt - tc) * 6; this.r.lookAt(E.camera.position);
      camRig(lt, c.dur, [1.0, 1.35, 4.9], [.7, 1.15, 4.1], [.15, 1.2, .3], 50);
      if (lt > .7) c.ev('impact', .7, .8); if (lt > tc) c.ev('zap', tc, .5);
      if (lt < tf) { rotulo('¡Cinco segundos!', 'la regla de la casa', lt - tc); etiqueta('5 SEGUNDOS', [.6, 2.0, -.3], lt - tc, 56, '#ffd36b', true); }
      else { rotulo('¿Sí funciona?', 'al final: la peor comida', lt - tf); etiqueta('¿MITO?', [.25, .6, .75], lt - tf - .2, 60, '#ff8a7a', true); }
    }
  });

  // ---------- 2. PRUEBA: laboratorio; la científica deja caer comida sobre muestras de piso con bacterias ----------
  escena('prueba', {
    setup(c) {
      ambiente({ top: 0x274a5a, bottom: 0xcfe3e0, fog: 0x9fbcc0, near: 6, far: 20, sunColor: 0xf4fbff, sunInt: 2.3, hemiInt: 1.2, sunPos: [3, 9, 6] });
      const L = setLaboratorio({ acento: 0x7dff6a }); const y = L.topY;
      this.p = persona({ pos: [-.95, 0, -1.25], shirt: 0x4f6fa0, pants: 0x3d4a66, pelo: 'largo', bata: true, hair: 0x3a2418 }); this.p.rotation.y = .5;
      this.mu = [[-.6, 0xd8d2c4], [0, 0xa77b52], [.6, 0xb0566a]].map(([x, col]) => { const t = box(.5, .03, .4, col, [x, y + .015, -.4], null, { rough: .4 }); return [x, t]; });
      this.gm = germenes(36, { r: .022 }); this.gm.G.forEach((g, i) => { const m = this.mu[i % 3][0]; this.gm.setA(i, [m + ((i * 37) % 100 / 100 - .5) * .4, y + .05, -.4 + ((i * 61) % 100 / 100 - .5) * .3]); });
      this.comida = [galleta([0, 0, 0], .07), galleta([0, 0, 0], .07), galleta([0, 0, 0], .07)];
      this.y = y;
    },
    update(lt, c) {
      const tt = c.w('tiraron') || 2.1, y = this.y; gesto(this.p, 'feliz'); hablar(this.p, lt, .3);
      this.p.armR.rotation.set(-1.3 + Math.sin(lt * 3) * .1, 0, .3);
      this.comida.forEach((g, k) => { const t0 = tt + k * .35, u = cl((lt - t0) / .45); g.position.set(this.mu[k][0], lt < t0 ? 1.55 : lerp(1.55, y + .05, u * u), -.4); g.visible = lt > t0 - .4; g.rotation.x = u < 1 ? u * 4 : 0; if (lt > t0 + .45) c.ev('pop', t0 + .45, .5); });
      this.gm.update(lt, 0);
      camRig(lt, c.dur, [.9, 1.8, 3.4], [.4, 1.6, 2.8], [-.3, 1.1, -.6], 50);
      etiqueta('BACTERIAS', [0, y + .35, -.2], lt - .5, 46, '#7dff6a', true);
      rotulo('Universidad Rutgers', 'lo pusieron a prueba', lt - (c.w('Rutgers') || 1.7) + .2);
    }
  });

  // ---------- 3. SEGUNDO: macro sobre la loseta; la galleta toca el piso y las bacterias brincan al instante ----------
  escena('segundo', {
    setup(c) {
      ambiente({ top: 0x1c2a3a, bottom: 0x5a6f80, fog: 0x2a3644, near: 5, far: 16, sunColor: 0xfff4e0, sunInt: 2.6, hemiInt: 1.0, sunPos: [2, 8, 5] });
      for (let x = -4; x < 4; x++) for (let z = -4; z < 3; z++) box(.98, .06, .98, (x + z) % 2 ? 0xd8d2c4 : 0xc4bcaa, [x + .5, -.03, z + .5], null, { rough: .25 });
      this.gal = galleta([0, 0, 0], .6); this.gm = germenes(40, { r: .045 }); sembrar(this.gm, 0, 0, 3.0, 2.2, .06);
      this.gm.G.forEach((g, i) => this.gm.setB(i, disco(i, 40, 0, 0, .5, .5, .24)));
      this.r = reloj([.95, .75, -1.1], .34); this.x = cruz([0, .85, .3]); this.n5 = null;
    },
    update(lt, c) {
      const tp = c.w('pasan') || 1.0, t5 = c.w('Cinco') || 2.7;
      const u = cl(lt / .5); this.gal.position.set(0, lerp(1.6, .1, u * u), 0); this.gal.rotation.x = (1 - u) * .5;
      this.gm.update(lt, cl((lt - .55) / 1.1), .5);
      this.r.min.rotation.z = -cl((lt - .5) / 1.0) * Math.PI * 2 * .2; this.r.lookAt(E.camera.position);
      this.x.scale.setScalar(Math.max(.01, spring((lt - t5 - .3) / .6)) * 1.3); this.x.lookAt(E.camera.position);
      camRig(lt, c.dur, [0, 2.7, 3.9], [.3, 2.3, 3.3], [.15, .35, -.1], 50);
      if (lt > .5) c.ev('impact', .5, .8); if (lt > .6) c.ev('zap', .6, .6); if (lt > t5 + .3) c.ev('crack', t5 + .3, .6);
      etiqueta('MENOS DE 1 SEGUNDO', [.5, 1.25, -1.1], lt - tp, 50, '#ffd36b', true);
      if (lt < t5) rotulo('Menos de un segundo', 'las bacterias ya se pasaron', lt - tp);
      else { rotulo('Cinco segundos', 'no te salvan', lt - t5); etiqueta('5 SEGUNDOS', [0, 1.35, .3], lt - t5, 56, '#ffffff', true); }
    }
  });

  // ---------- 4. HUMEDAD: sandía (mojada) se llena de bacterias; gomita (seca) casi nada ----------
  escena('humedad', {
    setup(c) {
      ambiente({ top: 0x2a2140, bottom: 0x6a4a72, fog: 0x2e2444, near: 5, far: 16, sunColor: 0xffefd8, sunInt: 2.6, hemiInt: 1.05, sunPos: [2, 8, 6] });
      for (let x = -4; x < 4; x++) for (let z = -4; z < 3; z++) box(.98, .06, .98, (x + z) % 2 ? 0xd8d2c4 : 0xc4bcaa, [x + .5, -.03, z + .5], null, { rough: .25 });
      this.s = sandia([-.4, .12, .1], 1.25); this.g = gomita([.6, 0, .1], 1.0, 0x4fc46a);
      this.gm = germenes(44, { r: .04 }); sembrar(this.gm, 0, .2, 3.2, 1.6, .05);
      this.gm.G.forEach((g, i) => { const aS = i % 11 !== 0; this.gm.setB(i, aS ? disco(i, 44, -.4, -.05, .38, .3, .27 + (i % 4) * .01) : [.6 + ((i * 7) % 3 - 1) * .1, .58, .28]); });
    },
    update(lt, c) {
      const th = c.w('humedad.') || 1.5, ts = c.w('sandía') || 2.3, tg = c.w('gomita,') || 5.1;
      this.s.gotas.forEach((d, k) => { d.position.y = .22 + (k % 2) * .08 + Math.sin(lt * 3 + k) * .015; d.scale.setScalar(1 + .15 * Math.sin(lt * 4 + k)); });
      this.g.rotation.y = Math.sin(lt * 1.5) * .25;
      this.gm.update(lt, cl((lt - ts + .2) / 1.6), .4);
      const q = einout(cl(lt / c.dur)); let look = [lerp(-.35, 0, q), .35, 0];
      if (lt > tg - .2) look = [lerp(-.35, .35, ease((lt - tg + .2) / .6)), .35, 0];
      camRig(lt, c.dur, [-.2, 1.5, 2.9], [.2, 1.35, 2.6], look, 50);
      if (lt > th) c.ev('pop', th, .5); if (lt > ts + .3) c.ev('zap', ts + .3, .6); if (lt > tg) c.ev('ding', tg, .5);
      if (lt < tg - .2) { etiqueta('MOJADA', [-.4, .5, .1], lt - th, 46, '#bfe9ff', true);
      if (lt > ts) etiqueta('LA PEOR', [-.4, .8, .1], lt - ts - .4, 58, '#ff6a6a', true); }
      if (lt > tg - .2) etiqueta('CASI NADA', [.6, .95, .1], lt - tg, 50, '#ffffff', true);
      if (lt < ts) rotulo('La humedad', 'es lo que más importa', lt - th);
      else if (lt < tg) rotulo('La peor: la sandía', 'jaló más bacterias que ninguna', lt - ts);
      else rotulo('La gomita', 'seca: casi nada', lt - tg);
    }
  });

  // ---------- 5. PISO: alfombra vs. piso liso, cada uno con una galleta ----------
  escena('piso', {
    setup(c) {
      ambiente({ top: 0x3a3020, bottom: 0xd8b07a, fog: 0x8a7458, near: 5, far: 16, sunColor: 0xfff0d8, sunInt: 2.5, hemiInt: 1.1, sunPos: [2, 8, 6] });
      box(8, .04, 6, 0x6b4a32, [0, -.08, 0]);
      alfombra([-.85, 0, 0], 1.5, 1.6); loseta([.85, 0, 0], 1.5, 1.6);
      this.a = galleta([-.85, .14, 0], .38); this.b = galleta([.85, .07, 0], .38);
      this.gm = germenes(32, { r: .035 });
      this.gm.G.forEach((g, i) => { const izq = i < 10; const cx = izq ? -.85 : .85;
        this.gm.setA(i, disco(izq ? i : i - 10, izq ? 10 : 22, cx, 0, .65, .65, izq ? .1 : .05));
        const sube = izq ? i % 3 === 0 : i % 5 !== 0; if (sube) this.gm.setB(i, disco(i, 32, cx, 0, .28, .28, (izq ? .14 : .07) + .12)); });
    },
    update(lt, c) {
      const ta = c.w('alfombra') || .4, tl = c.w('liso.') || 2.4;
      this.gm.update(lt, cl((lt - .3) / 1.3), .3);
      camRig(lt, c.dur, [0, 2.9, 4.4], [0, 2.6, 4.0], [0, .25, 0], 50);
      if (lt > .5) c.ev('whoosh', .5, .4); if (lt > 1.6) c.ev('ding', 1.6, .5);
      etiqueta('ALFOMBRA: MENOS', [-.55, .75, 0], lt - ta, 46, '#ffd36b', true);
      etiqueta('PISO LISO: MÁS', [.6, .75, 0], lt - Math.min(tl, 1.4), 46, '#ffffff', true);
      rotulo('El piso cuenta', 'la alfombra pasa menos', lt - .2);
    }
  });

  // ---------- 6. REMATE: el amigo levanta la galleta y se la come; tú con las manos en la cintura; una mosca ronda ----------
  escena('remate', {
    setup(c) {
      ambiente({ top: 0x6a7f9a, bottom: 0xf0c48a, fog: 0xd9c4a4, near: 6, far: 22, sunColor: 0xfff0d8, sunInt: 2.5, hemiInt: 1.15, sunPos: [3, 8, 7] });
      setCocina({ acento: 0x4f8a7a });
      this.a = persona({ pos: [-.55, 0, .3], shirt: 0x3f8fd0, pants: 0x3d4a66, hair: 0x5a3a20 }); this.a.rotation.y = .35;
      this.b = persona({ pos: [.75, 0, .1], shirt: 0xe0573f, pants: 0x3d4a66, hair: 0x2a1c14 }); this.b.rotation.y = -.45;
      this.gal = galleta([0, 0, 0], .1, this.a.armR); this.gal.position.set(0, -.72, .08); this.gal.rotation.x = Math.PI / 2;
      this.m = mosca({ s: .18 });
    },
    update(lt, c) {
      const a = this.a, b = this.b;
      // agachado → se para → muerde (mano a la boca)
      const up = ease((lt - .2) / .7), boca = ease((lt - 1.3) / .5);
      a.rotation.x = lerp(.55, 0, up); a.position.y = lerp(-.15, 0, up);
      a.armR.rotation.set(lerp(-.4, -2.5, boca), 0, lerp(.1, .55, boca)); gesto(a, 'feliz'); if (lt > 1.8) hablar(a, lt, 1);
      this.gal.visible = lt < 2.6; if (lt > 2.0) this.gal.scale.setScalar(Math.max(.4, 1 - (lt - 2.0) * .8));
      gesto(b, 'enojada'); pose(b, 'jarras', ease((lt - .3) / .4), lt); b.head.rotation.z = Math.sin(lt * 2) * .08;
      volar(this.m, lt, [-.4, 1.75, .55], .35, { vel: 1.4, alto: .6 });
      camRig(lt, c.dur, [.1, 1.6, 4.6], [.1, 1.65, 4.0], [.1, 1.2, .2], 50);
      etiqueta('NO PASA NADA', [-.25, 2.35, .3], lt - (c.w('dice:') || 2.7), 50, '#ffd36b', true);
      if (lt > .3) c.ev('pop', .3, .5); if (lt > 1.8) c.ev('crack', 1.8, .4);
      rotulo('Mándaselo', 'al amigo que levanta todo del piso', lt - .25);
    }
  });
}
