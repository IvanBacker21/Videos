// Short 3D: ¿De qué están hechos los átomos? (pedido de un seguidor)
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-07-1330-atomos.json OUT ../ejemplos/2026-11-07-1330-atomos.js
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, mat, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    AMB, setLaboratorio, setEspacio, setCalle, ondas, gesto, hablar, pose, mano, atomo } = E;
  const AZUL = 0x58c8ff;
  const COSMO = { top: 0x070b1e, bottom: 0x1d2350, fog: 0x070b1e, near: 14, far: 60, sunColor: 0xfff1dc, sunInt: 2.2, hemiInt: 1.0, sunPos: [5, 9, 8] };

  // ---------- utilería ----------
  function taco(pos, s = 1) {
    const g = group(pos); g.scale.setScalar(s);
    cyl(1.25, 1.1, .08, 0xf4efe6, [0, -.42, 0], g, 24);                                  // plato
    const geo = new THREE.CylinderGeometry(.62, .62, 1.5, 18, 1, true, 0, Math.PI);
    const tort = new THREE.Mesh(geo, mat(0xe8c27a)); tort.material.side = THREE.DoubleSide; tort.rotation.set(0, 0, Math.PI / 2); tort.rotation.y = Math.PI / 2;
    tort.rotation.set(Math.PI, 0, Math.PI / 2); tort.castShadow = true; g.add(tort);
    for (let k = 0; k < 22; k++) { const x = -.6 + (k % 11) * .12, z = (k < 11 ? -.18 : .14);
      box(.13, .12, .14, k % 3 ? 0x8a4a2a : 0xa8592f, [x, .08 + (k % 4) * .03, z], g).rotation.y = k; }
    for (let k = 0; k < 14; k++) box(.07, .05, .07, k % 2 ? 0xf6f2e8 : 0x4f9a3a, [-.6 + k * .09, .2 + (k % 3) * .03, -.02 + (k % 2) * .08], g);
    return g;
  }
  // Red de átomos (cristal): bolitas con halo azul
  function red(pos, nx, ny, sep, r, color) {
    const g = group(pos); g.items = [];
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
      const a = ball(r, color, [(i - (nx - 1) / 2) * sep, (j - (ny - 1) / 2) * sep, 0], g, 1, { emissive: color, ei: .25, rough: .5 });
      const h = new THREE.Mesh(new THREE.IcosahedronGeometry(r * 1.6, 1), new THREE.MeshBasicMaterial({ color: AZUL, transparent: true, opacity: .16, depthWrite: false }));
      a.add(h); a.userData.d = Math.hypot(i - (nx - 1) / 2, j - (ny - 1) / 2); g.items.push(a); }
    return g;
  }
  // Estadio low-poly: cancha, pista, gradas en anillos elípticos y torres de luz.
  function estadio() {
    const g = group([0, 0, 0]); const A = 11, B = 8;
    const campo = cyl(1, 1, .06, 0x3d8f45, [0, .03, 0], g, 40); campo.scale.set(A * .62, 1, B * .62);
    for (let k = -4; k <= 4; k++) box(A * 1.1 / 9 * .98, .065, B * .95, k % 2 ? 0x45a04e : 0x3a8a42, [k * A * 1.1 / 9, .035, 0], g);
    box(.06, .08, B * .95, 0xffffff, [0, .05, 0], g);
    const circ = new THREE.Mesh(new THREE.TorusGeometry(1.1, .035, 4, 32), mat(0xffffff)); circ.rotation.x = Math.PI / 2; circ.position.y = .07; g.add(circ);
    for (const s of [-1, 1]) { box(.06, .08, 3.2, 0xffffff, [s * 4.6, .05, 0], g); box(1.2, .08, .06, 0xffffff, [s * 5.2, .05, 1.6], g); box(1.2, .08, .06, 0xffffff, [s * 5.2, .05, -1.6], g); }
    const cols = [0xd9d4c8, 0xc0583f, 0x2f6fb0, 0xd9d4c8, 0x3d8f45];
    for (let t = 0; t < 5; t++) { const a = A * .72 + t * 1.15, b = B * .72 + t * 1.15, n = 56;
      for (let k = 0; k < n; k++) { const th = k / n * Math.PI * 2, x = Math.cos(th) * a, z = Math.sin(th) * b;
        const st = box(2 * Math.PI * Math.max(a, b) / n * 1.08, .5 + t * .02, 1.1, cols[(t + (k % 7 === 0 ? 1 : 0)) % cols.length], [x, .3 + t * .62, z], g);
        st.rotation.y = -Math.atan2(z * a * a, x * b * b) + Math.PI / 2; } }
    // techo (anillo superior)
    const roof = new THREE.Mesh(new THREE.TorusGeometry(1, .06, 4, 64), mat(0xe8e2d4)); roof.scale.set(A * .72 + 5.4, B * .72 + 5.4, 18); roof.rotation.x = Math.PI / 2; roof.position.y = 3.8; g.add(roof);
    for (const [x, z] of [[-A, -B], [A, -B], [-A, B], [A, B]]) { cyl(.12, .16, 6, 0x5a5f6a, [x * .95, 3, z * .95], g, 6);
      box(1.1, .5, .2, 0xfff4d0, [x * .95, 6.1, z * .95], g, { emissive: 0xfff0c0, ei: 1 }).lookAt(0, 0, 0); }
    return g;
  }

  // 1 · gancho: comentario de un seguidor + átomo gigante girando en el laboratorio
  escena('gancho', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x2c3f6e, bottom: 0xe2b98e, fog: 0xb8a690, near: 8, far: 28 });
      setLaboratorio({ acento: AZUL });
      this.a = atomo([0, 1.95, -.4], { r: 1.15, rn: .15 });
      this.cien = persona({ pos: [1.75, 0, .4], shirt: 0x6f9bd6, hair: 0x2a1a14, bata: true }); this.cien.rotation.y = -.6;
      this.card = group([0, 3.45, .2]); box(3.3, .5, .06, 0xffffff, [0, 0, 0], this.card); box(.3, .3, .07, 0x3ccf7a, [-1.45, 0, .01], this.card, { emissive: 0x3ccf7a, ei: .3 });
      this.on = ondas([0, 2.0, -.4], { color: AZUL, n: 3, vel: 1.2, alcance: 1.8, grosor: .02, dir: [0, 0, 0] }); },
    update(lt, c) {
      this.a.update(lt, 1); this.a.rotation.y = lt * .4; this.a.scale.setScalar(Math.max(.01, spring(lt / .6)));
      this.on.update(lt, true);
      const kc = spring((lt - .1) / .6); this.card.scale.setScalar(Math.max(.01, kc)); this.card.position.y = 3.45 + Math.sin(lt * 2) * .04;
      pose(this.cien, 'senalar', ease((lt - .4) / .4), lt); gesto(this.cien, lt < c.f(1) ? 'sorpresa' : 'feliz'); hablar(this.cien, lt, lt > c.f(1) ? 1 : 0);
      const p = einout(lt / c.dur);
      cam([lerp(.6, .15, p), lerp(2.4, 2.3, p), lerp(7.6, 6.4, p)], [0, 2.45, -.2], 48);
      etiqueta('¿De qué están hechos los átomos?', [.12, 3.45, .3], lt - .25, 40, '#1d2350'); if (lt > .25) c.ev('pop', .25, .7);
      etiqueta('ÁTOMO', [0, .92 + .15, .4], lt - c.w('átomos'), 52, '#7fdcff', true);
      if (lt < c.f(1)) rotulo('Nos preguntaron', '¿de qué están hechos los átomos?', lt - .05, 1330);
      else { rotulo('Ojo al final', 'te va a sorprender', lt - c.f(1), 1330); c.ev('ding', c.f(1), .6); }
    }
  });
  // 2 · potencias de diez: del taco a los átomos; luego un cabello con átomos en fila
  escena('zoom', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x50608f, bottom: 0xf0c08e, fog: 0xd8b48e, near: 6, far: 24 });
      this.mesa = box(6, .1, 4, 0x8a6242, [0, -.55, 0]);                                                   // mesa de madera
      this.t = taco([0, 0, 0], 1);
      this.r = red([0, .3, .2], 9, 13, .34, .12, 0xe8c27a); this.r.visible = false;
      this.cab = group([0, 0, 0]); this.cab.visible = false;
      const h = cyl(.55, .55, 14, 0x3a2418, [0, 0, 0], this.cab, 12); h.rotation.z = Math.PI / 2 + .12;
      this.fila = red([0, 0, .62], 1, 9, .12, .05, 0xffd27a); this.fila.rotation.z = .12; this.cab.add(this.fila); },
    update(lt, c) {
      const t1 = c.w('átomos') - .35, t2 = c.f(1) - .1;
      const A = lt < t1, B = lt >= t1 && lt < t2, C = lt >= t2;
      this.t.visible = A || B; this.r.visible = B; this.mesa.visible = A; this.cab.visible = C;
      if (A) { const p = einout(lt / t1); cam([lerp(2.2, .5, p), lerp(2.0, 1.1, p), lerp(4.2, 2.0, p)], [0, .1, 0], 46); }
      if (B) { const q = (lt - t1); const p = eout(q / .9); ambiente({ ...COSMO });
        this.t.visible = false; cam([0, .3, lerp(1.6, 4.4, p)], [0, .3, 0], 46);
        this.r.items.forEach((a, k) => { const s = Math.max(.01, spring((q - a.userData.d * .05) / .5)); a.scale.setScalar(s); a.position.z = Math.sin(lt * 3 + k) * .03; });
        if (lt > t1) c.ev('whoosh', t1, .7); }
      if (C) { const q = lt - t2; ambiente({ ...COSMO, bottom: 0x2a2050 }); const p = einout(q / (c.dur - t2));
        this.fila.items.forEach((a, k) => { a.scale.setScalar(Math.max(.01, spring((q - .2 - k * .08) / .4))); });
        cam([lerp(-1.6, .9, p), lerp(.6, .2, p), lerp(4.4, 3.0, p)], [lerp(-.3, .1, p), 0, .3], 44);
        etiqueta('UN CABELLO', [-.6, .9, .6], q - .1, 48, '#ffffff', true);
        etiqueta('CIENTOS DE MILES', [.15, -.95, .6], lt - c.w('cientos'), 56, '#f3c54d', true); if (lt > c.w('cientos')) c.ev('ding', c.w('cientos'), .6);
        if (lt > t2) c.ev('whoosh', t2, .6); }
      if (A) etiqueta('UN TACO', [0, .75, 0], lt - c.w('taco') + .2, 56, '#f3c54d', true);
      if (lt < t2) rotulo('Todo es átomos', 'tu mano, tu celular… hasta un taco', lt - .05, 1330);
      else rotulo('A lo ancho de un cabello', 'caben cientos de miles de átomos', lt - t2, 1330);
    }
  });
  // 3 · el átomo: núcleo al centro y nube de electrones alrededor
  escena('atomo', {
    setup() { ambiente(COSMO); setEspacio({ estrellas: 120 }); this.a = atomo([0, 0, 0], { r: 1.6, rn: .2, nucleones: 18 }); },
    update(lt, c) {
      const tn = c.w('núcleo'), te = c.w('nube');
      this.a.update(lt, ease((lt - te + .5) / .7)); this.a.nucleo.scale.setScalar(1 + .25 * Math.max(0, Math.sin(cl((lt - tn) / .5) * Math.PI)));
      const ang = lerp(-.6, .5, einout(lt / c.dur)), r = lerp(4.6, 6.4, einout(lt / c.dur));
      cam([Math.sin(ang) * r, lerp(.9, 1.6, lt / c.dur), Math.cos(ang) * r], [0, 0, 0], 48);
      etiqueta('NÚCLEO', [0, .8, .4], lt - tn, 58, '#ff9a8a', true); if (lt > tn) c.ev('pop', tn, .7);
      etiqueta('ELECTRONES', [0, 2.15, 0], lt - te, 58, '#7fdcff', true); if (lt > te) c.ev('zap', te, .5);
      rotulo('El átomo', 'núcleo + nube de electrones', lt - .05, 1330);
    }
  });
  // 4 · zoom al núcleo y a un protón: tres quarks de colores unidos
  escena('quarks', {
    setup() { ambiente({ ...COSMO, bottom: 0x3a1d40 }); setEspacio({ estrellas: 90 });
      this.nuc = group([0, 0, 0]); const n = 12;
      for (let k = 0; k < n; k++) { const ph = Math.acos(1 - 2 * (k + .5) / n), th = k * 2.399, rr = k ? .62 : 0;
        ball(.5, k % 2 ? 0xb9bec6 : 0xe0453a, [rr * Math.sin(ph) * Math.cos(th), rr * Math.cos(ph), rr * Math.sin(ph) * Math.sin(th) + (k ? 0 : -.2)], this.nuc, 1, { rough: .5 }); }
      // protón gigante transparente con 3 quarks
      this.pr = group([0, 0, 0]); this.pr.visible = false;
      const piel = ball(1.6, 0xe0453a, [0, 0, 0], this.pr, 2, { opacity: .22, emissive: 0xe0453a, ei: .3 }); piel.material.depthWrite = false; piel.castShadow = false;
      this.q = [[0xff5a5a, [0, .7, 0]], [0x4fdc7a, [-.62, -.38, .1]], [0x4f8bff, [.62, -.38, -.1]]].map(([col, p]) => ball(.32, col, p, this.pr, 1, { emissive: col, ei: .6 }));
      this.gl = [[0, 1], [1, 2], [2, 0]].map(([a, b]) => { const m = cyl(.035, .035, 1, 0xf3c54d, [0, 0, 0], this.pr, 6, { emissive: 0xf3c54d, ei: .8 }); m.userData.ab = [a, b]; return m; }); },
    update(lt, c) {
      const tq = c.w('quarks') - .45, tp = c.w('protones');
      const zoom = lt < tq; this.nuc.visible = zoom || lt < tq + .25; this.pr.visible = lt > tq;
      this.nuc.rotation.y = lt * .5;
      if (this.pr.visible) { const k = Math.max(.01, spring((lt - tq) / .6)); this.pr.scale.setScalar(k); this.pr.rotation.z = lt * .4;
        this.q.forEach((m, j) => { m.position.x += Math.sin(lt * 7 + j) * .004; });
        this.gl.forEach(m => { const [a, b] = m.userData.ab; const A = this.q[a].position, B = this.q[b].position;
          m.position.set((A.x + B.x) / 2, (A.y + B.y) / 2, (A.z + B.z) / 2); m.scale.y = A.distanceTo(B) * (1 + .06 * Math.sin(lt * 12));
          m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3().subVectors(B, A).normalize()); });
        if (lt > tq) c.ev('whoosh', tq, .6); }
      const p = einout(lt / tq);
      if (zoom) cam([lerp(1.2, .3, p), lerp(1.0, .2, p), lerp(6.5, 3.0, p)], [0, 0, 0], 46);
      else { const q = einout((lt - tq) / (c.dur - tq)); cam([lerp(.4, -.4, q), lerp(.3, .5, q), lerp(5.8, 5.0, q)], [0, 0, 0], 46); }
      if (zoom) { etiqueta('PROTONES', [-.5, 1.25, .3], lt - tp, 52, '#ff9a8a', true); etiqueta('NEUTRONES', [.5, -1.25, .3], lt - c.w('neutrones'), 52, '#dfe3e6', true); }
      else { etiqueta('QUARKS', [0, -1.3, .6], lt - tq - .3, 70, '#f3c54d', true); if (lt > tq + .3) c.ev('ding', tq + .3, .6); }
      if (zoom) rotulo('El núcleo', 'protones y neutrones', lt - .05, 1330);
      else rotulo('Quarks', 'dentro de cada protón y neutrón', lt - tq, 1330);
    }
  });
  // 5 · el estadio: canica en el centro del campo, electrones en las gradas
  escena('estadio', {
    setup() { ambiente({ top: 0x22305e, bottom: 0xf0a868, fog: 0xc98e6a, near: 30, far: 90, sunColor: 0xffd8a8, sunInt: 2.4, hemiInt: 1.1, sunPos: [-10, 14, 8] });
      box(80, .02, 80, 0x6a7a5a, [0, -.02, 0]);
      this.e = estadio();
      this.can = ball(.22, 0xff5a4a, [0, .3, 0], null, 2, { emissive: 0xff3a2a, ei: 1.2, rough: .2 }); this.can.castShadow = false;
      this.on = ondas([0, .12, 0], { color: 0xff8a6a, n: 3, vel: 1.1, alcance: 1.6, grosor: .04, dir: [Math.PI / 2, 0, 0] });
      this.el = Array.from({ length: 6 }, (_, k) => { const m = ball(.5, 0xbff0ff, [0, 0, 0], null, 1, { emissive: AZUL, ei: 2 }); m.castShadow = false;
        const h = new THREE.Mesh(new THREE.IcosahedronGeometry(.7, 1), new THREE.MeshBasicMaterial({ color: AZUL, transparent: true, opacity: .25, depthWrite: false })); m.add(h); return m; }); },
    update(lt, c) {
      const tc = c.w('canica'), tg = c.w('electrones') - .3;
      this.on.update(lt, lt > tc - .2); this.can.scale.setScalar(1 + .15 * Math.sin(lt * 5));
      this.el.forEach((m, k) => { m.visible = lt > tg; const th = lt * .35 + k * Math.PI / 3; m.position.set(Math.cos(th) * 11.2, 2.6 + Math.sin(lt * 2 + k) * .3, Math.sin(th) * 8.2);
        m.scale.setScalar(Math.max(.01, spring((lt - tg - k * .07) / .5))); });
      if (lt > tg) c.ev('zap', tg, .6); if (lt > tc) c.ev('pop', tc, .7);
      // grúa: del ras del pasto junto a la canica hasta una vista aérea de todo el estadio
      const p = einout((lt - .2) / (c.dur - .6));
      cam([lerp(0, 0, p), lerp(.55, 23, p), lerp(2.2, 19, p)], [0, lerp(.3, 0, p), lerp(0, 1, p)], lerp(48, 50, p));
      etiqueta('CANICA = NÚCLEO', [0, lerp(.75, 2.2, p), 0], lt - tc, 52, '#ff9a8a', true);
      etiqueta('ELECTRONES EN LAS GRADAS', [0, 1.6, -5.2], lt - tg - .4, 54, '#7fdcff', true);
      if (lt < tc - .3) rotulo('Casi puro vacío', 'el átomo está casi vacío', lt - .05, 1330);
      else rotulo('Como el Estadio Azteca', 'canica al centro · electrones en las gradas', lt - tc + .3, 1330);
    }
  });
  // 6 · remate: dos manos que van a chocar los cinco… y se quedan a un pelo, con brillo azul entre ellas
  escena('remate', {
    setup() { ambiente({ ...AMB.calle, near: 6, far: 30 }); setCalle({ largo: 30 });
      this.hl = mano([-1.4, 1.2, 0], .9, null, { manga: 0xf3c54d }); this.hl.rotation.set(0, Math.PI / 2, -.15);
      this.hr = mano([1.4, 1.2, 0], .9, null, { manga: 0x6f9bd6, skin: 0xc68e62, skin2: 0xa8754e }); this.hr.rotation.set(0, -Math.PI / 2, .15);
      this.glow = new THREE.Mesh(new THREE.CircleGeometry(.75, 24), new THREE.MeshBasicMaterial({ color: AZUL, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
      this.glow.rotation.y = Math.PI / 2; this.glow.position.set(0, 1.75, 0); E.world.add(this.glow);
      this.on = ondas([0, 1.75, 0], { color: AZUL, n: 3, vel: 2.4, alcance: .9, grosor: .03, dir: [0, Math.PI / 2, 0] });
      this.chis = Array.from({ length: 16 }, (_, k) => { const m = ball(.025, 0xdff6ff, [0, 0, 0], null, 0, { emissive: 0xbff0ff, ei: 1.5 }); m.castShadow = false; return m; });
      this.p1 = persona({ pos: [-.8, 0, -4.5], shirt: 0xf3c54d, hair: 0x1c1410 }); this.p1.rotation.y = 1.2;
      this.p2 = persona({ pos: [.8, 0, -4.5], shirt: 0x6f9bd6, hair: 0x2a1a14, skin: 0xc68e62 }); this.p2.rotation.y = -1.2;
      this.p1.visible = this.p2.visible = false; },
    update(lt, c) {
      const t2 = c.f(1) - .15, tt = .9;
      const close = lt < t2;
      // las manos se acercan rápido y frenan a un pelo de distancia
      const k = eout(lt / tt); const gap = .03 + .02 * Math.sin(lt * 9);
      const x = lerp(1.4, .23 + gap, k);
      this.hl.position.x = -x; this.hr.position.x = x; this.hl.visible = this.hr.visible = this.glow.visible = close;
      const g = lt > tt * .8 ? (.55 + .2 * Math.sin(lt * 14)) : 0; this.glow.material.opacity = close ? g : 0;
      this.on.update(lt, close && lt > tt * .8);
      this.chis.forEach((m, j) => { m.visible = close && lt > tt * .8; const a = j * 2.4 + lt * 3, r = .2 + ((lt * 1.5 + j * .13) % 1) * .6; m.position.set(Math.sin(lt * 20 + j) * .04, 1.75 + Math.sin(a) * r, Math.cos(a) * r); });
      if (lt > tt * .8) c.ev('zap', tt * .8, .9);
      this.p1.visible = this.p2.visible = !close;
      if (close) { const p = einout(lt / t2); cam([lerp(3.2, 2.5, p), lerp(2.4, 2.2, p), lerp(4.9, 4.2, p)], [0, 1.7, 0], 46);
        etiqueta('NUNCA SE TOCAN', [0, 3.0, 0], lt - c.w('nunca'), 60, '#7fdcff', true);
        etiqueta('SE EMPUJAN', [0, .7, 0], lt - c.w('empujan'), 50, '#ffffff', true);
        rotulo('Nunca se tocan', 'sus electrones se empujan', lt - c.w('nunca'), 1330); }
      else { const q = lt - t2;
        for (const [pp, s] of [[this.p1, 1], [this.p2, -1]]) { const up = ease(q / .35); (s > 0 ? pp.armR : pp.armL).rotation.x = -2.6 * up; (s > 0 ? pp.armR : pp.armL).rotation.z = -.35 * s * up; gesto(pp, 'feliz'); }
        hablar(this.p1, q, .5);
        const p = einout(q / (c.dur - t2)); cam([lerp(-.8, .6, p), 1.7, lerp(-.6, -1.2, p)], [0, 1.7, -4.5], 46);
        etiqueta('@TU COMPA', [0, 1.5, -4.5], q - (c.w('compa') - t2), 60, '#f3c54d', true); if (lt > c.w('compa')) c.ev('pop', c.w('compa'), .7);
        rotulo('Mándaselo a tu compa', 'el de los choques de cinco', q, 1330); c.ev('whoosh', t2, .5); }
    }
  });
}
