// Short 3D: ¿Por qué se te arrugan los dedos en la alberca? (orden de los nervios, efecto llanta, experimento de las canicas)
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-07-2130-dedos-pasa.json OUT ../ejemplos/2026-11-07-2130-dedos-pasa.js
// Mejora del motor en este short: caminar(p, lt, vel, {cojear}) (MEJORAS 0p), usada en el remate.
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, mat, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    mano, ondas, setLaboratorio, setCalle, comedor, reloj, gesto, pose, caminar, hablar } = E;
  const SOL = { top: 0x3f7fc9, bottom: 0xf6d2a0, fog: 0xe9c9a0, near: 10, far: 40, sunColor: 0xfff0d6, sunInt: 2.6, hemiInt: 1.15, sunPos: [5, 10, 6] };
  function camRig(lt, dur, a, b, look, fov = 46) { const q = einout(cl(lt / dur)); cam([lerp(a[0], b[0], q), lerp(a[1], b[1], q), lerp(a[2], b[2], q)], look, fov); }

  // ---------- utilería ----------
  // Alberca low-poly: andador de loseta, hueco con azulejo azul, agua translúcida a y=-.12, sombrilla y palmeras.
  function alberca() {
    const deck = 0xe9dcc4;
    box(6, .2, 16, deck, [-5, -.1, -2]); box(6, .2, 16, deck, [5, -.1, -2]);
    box(4, .2, 5, deck, [0, -.1, 3.5]); box(4, .2, 6, deck, [0, -.1, -7]);
    for (const x of [-2.1, 2.1]) box(.2, .06, 5.2, 0xffffff, [x, .03, -1.5]);
    for (const z of [1.1, -4.1]) box(4.4, .06, .2, 0xffffff, [0, .03, z]);
    box(4, .1, 5, 0x2f9fd0, [0, -1.45, -1.5]);
    for (const x of [-2, 2]) box(.05, 1.4, 5, 0x5cc0e6, [x, -.75, -1.5]);
    box(4, 1.4, .05, 0x5cc0e6, [0, -.75, -4]);
    for (let k = 0; k < 8; k++) box(.5, .02, .04, 0x2a86b8, [0, -1.39, -3.6 + k * .55]).castShadow = false;
    const agua = box(4, .02, 5, mat(0x3fc4e8, { opacity: .6, rough: .12, emissive: 0x0d6f9a, ei: .35 }), [0, -.12, -1.5]);
    agua.material.depthWrite = false; agua.castShadow = false;
    const palmera = (x, z, h) => { const g = group([x, 0, z]); for (let k = 0; k < 6; k++) cyl(.11 - k * .01, .13 - k * .01, h / 6, 0x8a6a45, [Math.sin(k * .3) * .15, h / 12 + k * h / 6, 0], g, 6);
      for (let k = 0; k < 6; k++) { const hoja = box(1.4, .04, .32, 0x3f8f4a, [0, 0, 0], group([Math.sin(1.5) * .15, h, 0], g)); hoja.parent.rotation.y = k * 1.05; hoja.position.x = .65; hoja.rotation.z = -.35; } return g; };
    palmera(-4.5, -6, 3.6); palmera(4.3, -7.5, 4.2); palmera(-6.5, -9, 3.2);
    const somb = group([3.4, 0, -3]); cyl(.03, .03, 2.1, 0xdddddd, [0, 1.05, 0], somb, 6); cyl(.05, 1.1, .4, 0xe85a4f, [0, 2.15, 0], somb, 8);
    box(.7, .25, 1.6, 0xf4efe6, [-.9, .2, .2], somb); box(.7, .5, .1, 0xf4efe6, [-.9, .45, -.6], somb).rotation.x = .5;
    box(14, 1.2, .3, 0xf0e2c8, [0, .6, -10]);
    return { agua, aguaY: -.12 };
  }
  // Arrugas en las yemas de una mano() (cara de la palma, +z): update(k 0..1) las hace crecer y palidece la yema.
  function arrugas(m) {
    const R = [], S = []; const dark = mat(0xb9805e);
    m.dedos.forEach(segs => segs.forEach((sg, k) => { if (k === 0) return; const l = sg.userData.l, zf = (.24 - k * .02) / 2 + .004;
      const n = k === 2 ? 4 : 3; for (let j = 0; j < n; j++) { const r = box(.17 - k * .02, .016, .016, dark, [0, l * (j + .7) / (n + .4), zf], sg); r.castShadow = false; r.scale.x = .01; R.push(r); }
      sg.children.forEach(c => { if (c.geometry && c.geometry.type === 'BoxGeometry' && c.material.color) S.push([c, c.material.color.clone()]); }); }));
    const palida = new THREE.Color(0xeec9b4);
    return { update(k) { R.forEach((r, i) => { r.scale.x = Math.max(.01, cl(k * 1.3 - (i % 4) * .08)); r.visible = k > .02; });
      S.forEach(([c, c0]) => c.material.color.copy(c0).lerp(palida, .6 * k)); } };
  }
  // Pasa (uva seca) arrugada: icosaedro con relieve que depende de la posición (sin grietas).
  function pasa(pos, r = .25, parent) {
    const geo = new THREE.IcosahedronGeometry(r, 2); const p = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = Math.sin(v.x * 40) * Math.sin(v.y * 34) * Math.sin(v.z * 46);
      v.multiplyScalar(1 + .16 * n); v.y *= .85; p.setXYZ(i, v.x, v.y, v.z); }
    geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mat(0x5b2748, { rough: .55 })); m.castShadow = true; m.position.set(...pos); (parent ?? E.world).add(m); return m;
  }
  function gotas(n, parent) { return Array.from({ length: n }, (_, k) => { const d = ball(.03, 0x8fe0ff, [0, 0, 0], parent, 0, { emissive: 0x3aa8ff, ei: .5, opacity: .85 }); d.scale.set(.8, 1.4, .8); d.castShadow = false; d.k = k; return d; }); }

  // ---------- 1. GANCHO: persona en la alberca mira su mano → mano gigante que se arruga ----------
  escena('gancho', {
    setup(c) {
      ambiente(SOL); this.a = alberca();
      this.p = persona({ pos: [0, -1.0, -1.2], shirt: 0x2f7fd0, pants: 0x2f7fd0, hair: 0x2a1c14 });
      this.p.armL.rotation.set(-.3, 0, -.2);
      this.on = ondas([0, -.1, -1.2], { color: 0xffffff, n: 4, vel: .8, alcance: 1.3, dir: [-Math.PI / 2, 0, 0], opacidad: .7 });
      this.m = mano([.15, -1.25, -1.4], 1.05, null, { manga: null }); this.arr = arrugas(this.m); this.m.visible = false;
      this.on2 = ondas([.15, -.1, -1.4], { color: 0xffffff, n: 4, vel: .9, alcance: 1.6, dir: [-Math.PI / 2, 0, 0], opacidad: .8 });
      this.g = gotas(8, this.m);
    },
    update(lt, c) {
      const t2 = c.f(1) || 2.4, p = this.p;
      if (lt < t2) {
        const up = eout(cl((lt - .2) / .8));
        p.armR.rotation.set(-2.3 * up, 0, .25 * up); p.head.rotation.x = .25 * up; gesto(p, lt > 1.0 ? 'sorpresa' : 'neutral');
        p.position.y = -1.0 + Math.sin(lt * 2) * .03; this.on.update(lt);
        camRig(lt, t2, [1.2, .9, 3.4], [.5, 1.0, 1.6], [0, .75, -1.2], 46);
        rotulo('¿Dedos de pasa?', 'te pasa en la alberca', lt - .35);
        this.m.visible = false; this.on2.visible = false; if (lt > .3) c.ev('pop', .35);
      } else {
        const t = lt - t2; this.m.visible = true; this.on2.visible = true; this.on.visible = false; p.visible = false;
        this.m.position.y = lerp(-1.25, -.55, eout(t / .7)); this.on2.update(lt);
        this.arr.update(ease((t - .4) / 1.4)); this.m.flex(.12 + .05 * Math.sin(lt * 3));
        this.g.forEach(d => { const ph = (lt * .9 + d.k / 8) % 1, dx = [-.36, -.12, .12, .36][d.k % 4]; d.position.set(dx, 1.5 - ph * 2.2, .15); d.visible = t > .3; });
        cam([0, 1.0, 3.6 - t * .3], [0, 1.05, -1.4], 46);
        rotulo('Dedos de pasa', 'al final te digo para qué sirven', t - .25);
        c.ev('whoosh', t2, .8); if (t > .4) c.ev('crack', t2 + .5, .5);
      }
    }
  });

  // ---------- 2. MITO: la esponja se infla de agua… pero la piel no ----------
  escena('mito', {
    setup(c) {
      ambiente({ top: 0x2c4a6e, bottom: 0xd7c3a2, fog: 0xbfb6a6, near: 6, far: 22, sunColor: 0xfff0d8, sunInt: 2.4, hemiInt: 1.1, sunPos: [4, 9, 7] });
      setLaboratorio({ acento: 0x4fb3e8 });
      this.esp = group([-.36, .92, .2]); const e = box(.7, .34, .48, 0xf2c84b, [0, .17, 0], this.esp);
      for (let k = 0; k < 14; k++) box(.05, .05, .02, 0xb08a20, [-.28 + (k % 7) * .09, .07 + Math.floor(k / 7) * .16, .245], this.esp).castShadow = false;
      this.m = mano([.42, .92, .2], .42, null, { manga: 0xd8d0c4 }); this.m.rotation.y = -.25;
      this.gt = gotas(6, null);
      this.x = group([-.36, 1.25, .55]); const r = mat(0xe03a3a, { emissive: 0xa01010, ei: .6 });
      box(.95, .12, .06, r, [0, 0, 0], this.x).rotation.z = .75; box(.95, .12, .06, r, [0, 0, 0], this.x).rotation.z = -.75; this.x.scale.setScalar(.01);
    },
    update(lt, c) {
      const tp = c.w('pero') || 2.8;
      const inf = ease(lt / 2.2); this.esp.scale.set(1 + .25 * inf, 1 + .45 * inf, 1 + .25 * inf);
      this.gt.forEach(d => { const ph = (lt * 1.2 + d.k / 6) % 1; d.position.set(-.36 + ((d.k * 7) % 5 - 2) * .08, 2.0 - ph * 1.0, .2); d.visible = lt < tp; });
      this.x.scale.setScalar(Math.max(.01, spring((lt - tp) / .6)));
      this.m.rotation.z = lt > tp ? Math.sin((lt - tp) * 10) * .08 * cl(1 - (lt - tp)) : 0;
      camRig(lt, c.dur, [0, 1.6, 4.9], [0, 1.5, 4.3], [0, 1.25, 0], 44);
      etiqueta('ESPONJA', [-.36, 1.7, .2], lt - .2, 56, '#ffd36b', true);
      etiqueta('PIEL', [.42, 1.85, .2], lt - .9, 56, '#ffd36b', true);
      if (lt > .2) c.ev('pop', .2, .6); if (lt > tp) c.ev('impact', tp);
      rotulo('Mito', 'la piel no se infla como esponja', lt - tp);
    }
  });

  // ---------- 3. NERVIOS: dedo gigante translúcido; los nervios aprietan los vasitos y la yema se arruga ----------
  escena('nervios', {
    setup(c) {
      ambiente({ top: 0x0f1a33, bottom: 0x3a2f5c, fog: 0x141c35, near: 8, far: 30, sunColor: 0xffe7c8, sunInt: 2.0, hemiInt: 1.0, sunPos: [4, 8, 6] });
      const piso = box(12, .1, 12, 0x232b45, [0, -.05, 0]); piso.castShadow = false;
      const g = group([0, .1, 0]); this.g = g;
      const piel = mat(0xf0b896, { opacity: .32, emissive: 0x6a3a2a, ei: .3 }); piel.depthWrite = false;
      this.seg = [[0, 1.3, .9], [1.32, .95, .8], [2.3, .9, .72]].map(([y, h, w]) => { const s = box(w, h, w * .9, piel.clone(), [0, y + h / 2, 0], g); s.castShadow = false; s.material.depthWrite = false; return s; });
      box(.55, .06, .5, 0xf7d9d0, [0, 3.0, -.36], g, { opacity: .8 }).rotation.x = -.15;   // uña (atrás)
      // nervio (amarillo, al centro) y dos vasitos (rojos) a los lados
      const curva = new THREE.CatmullRomCurve3([[0, -.1, 0], [.05, 1.2, .05], [-.05, 2.2, .05], [0, 2.95, .05]].map(a => new THREE.Vector3(...a)));
      this.curva = curva;
      for (let k = 0; k < 60; k++) { const q = curva.getPoint(k / 59); const s = ball(.05, 0xf5c542, [q.x, q.y, q.z], g, 0, { emissive: 0xf0b030, ei: .8 }); s.castShadow = false; }
      this.pulsos = Array.from({ length: 5 }, (_, k) => { const s = ball(.1, 0xffffff, [0, 0, 0], g, 1, { emissive: 0xfff2a0, ei: 2.2 }); s.castShadow = false; s.k = k; return s; });
      this.vasos = [-1, 1].map(sx => { const cv = new THREE.CatmullRomCurve3([[sx * .28, -.1, .1], [sx * .3, 1.3, .12], [sx * .26, 2.3, .1], [sx * .1, 3.0, .12], [0, 3.05, .1]].map(a => new THREE.Vector3(...a)));
        const m = new THREE.Mesh(new THREE.TubeGeometry(cv, 40, .07, 6), mat(0xe0453a, { emissive: 0x901818, ei: .5 })); g.add(m); return m; });
      this.rid = Array.from({ length: 6 }, (_, k) => { const r = box(.5, .03, .03, 0xa86a50, [0, 2.45 + k * .1, .33], g); r.castShadow = false; r.scale.x = .01; return r; });
      this.pasa = pasa([.95, 2.05, .4], .32); this.pasa.scale.setScalar(.01);
    },
    update(lt, c) {
      const ta = c.w('aprietan') || 2.0, ty = c.w('yema') || 3.6, tps = c.w('pasa') || 5.6;
      this.pulsos.forEach(s => { const t = ((lt * .45 + s.k / 5) % 1); const q = this.curva.getPoint(t); s.position.copy(q); s.visible = lt > .2; });
      const sq = ease((lt - ta) / .8); this.vasos.forEach(v => { v.scale.set(1 - .55 * sq, 1, 1 - .55 * sq); v.material.emissiveIntensity = .5 + .8 * sq * Math.abs(Math.sin(lt * 6)); });
      const sh = ease((ty - lt > 0 ? 0 : (lt - ty) / 1.2)); this.seg[2].scale.set(1 - .12 * sh, 1 - .05 * sh, 1 - .12 * sh);
      this.rid.forEach((r, k) => r.scale.x = Math.max(.01, cl(sh * 1.4 - k * .08)));
      this.pasa.scale.setScalar(Math.max(.01, spring((lt - tps) / .6))); this.pasa.rotation.y = lt * .8;
      const q = einout(cl(lt / c.dur)); const a = lerp(.55, -.35, q), R = 5.0;
      cam([Math.sin(a) * R, lerp(1.9, 2.2, q), Math.cos(a) * R], [.25, 1.45, 0], 48);
      etiqueta('NERVIO', [-.1, .8, .05], lt - .3, 52, '#ffd36b', true);
      etiqueta('VASITOS', [.45, 1.6, .1], lt - ta, 52, '#ff8a7a', true);
      if (lt > .3) c.ev('zap', .3, .5); if (lt > ta) c.ev('click', ta); if (lt > tps) c.ev('pop', tps);
      rotulo('Orden de tus nervios', 'la yema se encoge y se arruga', lt - ty);
    }
  });

  // ---------- 4. LLANTA: llanta con dibujo rodando sobre calle mojada; el agua sale por las ranuras ----------
  escena('llanta', {
    setup(c) {
      ambiente({ top: 0x3e4c6c, bottom: 0xa9b3c2, fog: 0x8e9bb0, near: 8, far: 40, sunColor: 0xe6eeff, sunInt: 1.8, hemiInt: 1.2, sunPos: [-6, 10, 6] });
      setCalle({ largo: 40 });
      const charco = box(7, .01, 40, mat(0x9fc4e8, { opacity: .3, rough: .05, metal: .3 }), [0, .012, -16]); charco.castShadow = false;
      this.lluvia = Array.from({ length: 140 }, (_, k) => { const d = box(.012, .32, .012, 0xcfe6ff, [0, 0, 0], null, { opacity: .55 }); d.castShadow = false; d.k = k; return d; });
      this.t = group([0, .56, -2]); const rueda = group([0, 0, 0], this.t); this.rueda = rueda;
      const ll = cyl(.55, .55, .44, 0x2a2a2e, [0, 0, 0], rueda, 22); ll.rotation.z = Math.PI / 2;
      const rin = cyl(.32, .32, .46, 0xc9ced6, [0, 0, 0], rueda, 10, { metal: .6, rough: .3 }); rin.rotation.z = Math.PI / 2;
      for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; const L = box(.44, .06, .1, 0x1a1a1d, [0, Math.cos(a) * .575, Math.sin(a) * .575], rueda); L.rotation.x = -a; L.rotation.y = 0;
        const L2 = box(.08, .06, .16, 0x1a1a1d, [(k % 2 ? .12 : -.12), Math.cos(a) * .575, Math.sin(a) * .575], rueda); L2.rotation.x = -a; L2.rotation.y = k % 2 ? .6 : -.6; }
      box(.5, .1, 1.3, 0xc8423a, [0, .66, -.1], this.t);   // salpicadera del coche
      this.spray = Array.from({ length: 50 }, (_, k) => { const d = ball(.035, 0xbfe6ff, [0, 0, 0], null, 0, { emissive: 0x4fa8e8, ei: .4, opacity: .8 }); d.castShadow = false; d.k = k; return d; });
    },
    update(lt, c) {
      const z = lerp(-3.2, -.6, lt / c.dur); this.t.position.z = z; this.rueda.rotation.x = (z + 3.2) / .55;
      this.lluvia.forEach(d => { const ph = (lt * 1.6 + d.k * .137) % 1; d.position.set(((d.k * 37) % 70) / 10 - 3.5, 4 - ph * 4.2, -((d.k * 53) % 90) / 10 + 2); });
      this.spray.forEach(d => { const ph = (lt * 1.8 + d.k / 50) % 1, s = d.k % 2 ? 1 : -1, sp = ((d.k * 13) % 7) / 7;
        d.position.set(s * (.22 + ph * (1.1 + sp)), .05 + Math.sin(ph * Math.PI) * (.35 + sp * .3), z - .45 - ph * (.6 + sp * .8)); d.scale.setScalar(1.2 - ph * .8); });
      const td = c.w('dibujo') || 1.6, ts = c.w('sacan') || 3.0;
      cam([lerp(2.3, 1.8, einout(lt / c.dur)), lerp(.8, 1.0, einout(lt / c.dur)), z + lerp(3.6, 3.1, einout(lt / c.dur))], [0, .55, z - .1], 50);
      etiqueta('DIBUJO DE LLANTA', [.15, 1.25, z], lt - td, 52, '#ffd36b', true);
      if (lt > td) c.ev('ding', td, .6); if (lt > ts) c.ev('whoosh', ts, .5);
      rotulo('Como una llanta', 'sacan el agua y no resbalas', lt - ts);
    }
  });

  // ---------- 5. CANICAS: mano arrugada pasa canicas mojadas de un tazón a otro, rápido ----------
  escena('canicas', {
    setup(c) {
      ambiente(E.AMB.cuartoDia); const mesa = comedor({ mantel: 0x4fa8d8 }); const Y = mesa.topY;
      this.Y = Y; const taz = (x, agua) => { const g = group([x, Y, .1]); cyl(.24, .15, .16, 0xf4efe6, [0, .08, 0], g, 14);
        cyl(.21, .21, .01, agua ? 0x4fb8f0 : 0xd8d2c8, [0, .165, 0], g, 14, agua ? { emissive: 0x1a7fe0, ei: .3 } : {}); return g; };
      this.A = taz(-.36, true); this.B = taz(.36, false);
      const cols = [0xe0453a, 0x3fa34d, 0xf2c84b, 0x6b5cff, 0xff8a3a, 0x2fb8c8];
      this.can = cols.map((col, k) => { const b = ball(.055, col, [0, 0, 0], null, 1, { rough: .15, metal: .1, emissive: col, ei: .15 }); b.k = k; return b; });
      this.home = (k, lado) => [lado + Math.cos(k * 2.1) * .1, Y + .21, .1 + Math.sin(k * 2.1) * .08];
      this.m = mano([0, 1.4, .2], .3, null, { manga: 0x2f7fd0 }); this.m.rotation.z = Math.PI; this.arr = arrugas(this.m); this.arr.update(1);
      this.r = reloj([.75, 1.75, -2.1], .32);
    },
    update(lt, c) {
      const T = .78, n = Math.floor(lt / T), ph = (lt % T) / T, Y = this.Y;
      this.can.forEach((b, k) => { const h = this.home(k, k < n ? .36 : -.36); b.position.set(...h); });
      const k = n % 6, a = this.home(k, -.36), b = this.home(k, .36), up = Math.sin(ph * Math.PI);
      const x = lerp(a[0], b[0], einout(ph)), y = Y + .32 + up * .2;
      this.m.position.set(x, y + .58, .2); this.m.flex(ph < .15 || ph > .85 ? .2 : .75);
      if (n < 6) this.can[k].position.set(x, y - .06, .14);
      this.r.min.rotation.z = -lt * 5; this.r.hor.rotation.z = -lt * .5;
      const tr = c.w('rápido') || 3.8;
      camRig(lt, c.dur, [.15, 1.45, 3.1], [0, 1.4, 2.7], [0, 1.2, 0], 46);
      if (ph > .5) c.ev('click', n * T + .5 * T, .5);
      if (lt < tr) { rotulo('Experimento', 'canicas mojadas', lt - .2); etiqueta('MOJADAS', [-.36, Y + .45, .1], lt - .5, 50, '#ffd36b', true); }
      else { rotulo('Mejor agarre', 'con dedos arrugados', lt - tr); if (lt > tr) c.ev('ding', tr, .6); }
    }
  });

  // ---------- 6. REMATE: una persona camina por la orilla (caminar()) y otra no se quiere salir del agua ----------
  escena('remate', {
    setup(c) {
      ambiente({ ...SOL, top: 0x355f9e, bottom: 0xf3b07a, sunColor: 0xffd7a8 }); alberca();
      this.a = persona({ pos: [-2.6, 0, -5], shirt: 0xe8a33d, pants: 0x3d4a66, hair: 0x3a2a20 });
      this.b = persona({ pos: [-1.0, -1.0, -3.4], shirt: 0xd04a7a, pants: 0xd04a7a, pelo: 'largo', hair: 0x2a1c14 });
      this.b.rotation.y = -.5;
      this.on = ondas([-1.0, -.1, -3.4], { color: 0xffffff, n: 4, vel: 1.1, alcance: 1.4, dir: [-Math.PI / 2, 0, 0], opacidad: .8 });
    },
    update(lt, c) {
      const d = caminar(this.a, lt, .9); this.a.position.z = -5 + d; gesto(this.a, 'feliz');
      const turn = ease((lt - 1.4) / .5); this.a.head.rotation.y = .9 * turn;
      if (lt > 1.4) { pose(this.a, 'senalar', turn, lt); this.a.armR.rotation.y = .9 * turn; }
      const b = this.b; b.head.rotation.y = Math.sin(lt * 9) * .35 * cl((lt - 1.6) / .3); gesto(b, lt > 1.6 ? 'enojada' : 'feliz');
      pose(b, 'brazosArriba', lt < 1.6 ? .9 : .3, lt); b.position.y = -1.0 + Math.sin(lt * 4) * .04; this.on.update(lt);
      const z = this.a.position.z;
      cam([-1.0, 1.7, z + 4.6], [-1.9, .9, z - .6], 50);
      if (lt > 1.5) c.ev('pop', 1.5, .6);
      rotulo('Mándaselo', 'a quien no se sale de la alberca', lt - .3);
    }
  });
}
