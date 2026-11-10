// Short 3D (estilo MEZCLA): ¿Cómo brillan las estrellas? — pedido de un seguidor.
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-10-1330-estrellas.json OUT ../ejemplos/2026-11-10-1330-estrellas.js
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, gesto, pose, caminar, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    AMB, setCalle, chispas, polvo, polvoMueve, rayoLuz } = E;

  // ---------- utilería ----------
  function sol(pos, r, parent) {                         // Sol brillante con halo (el bloom hace el resplandor)
    const g = group(pos, parent);
    g.nucleo = ball(r, 0xffb43a, [0, 0, 0], g, 2, { emissive: 0xff9a1f, ei: 1.6 });
    g.halo = [1.18, 1.4].map((k, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r * k, 32, 20), new THREE.MeshBasicMaterial({ color: i ? 0xffd27a : 0xffb347, transparent: true, opacity: i ? .10 : .18, depthWrite: false })); g.add(m); return m; });
    g.manchas = [0, 1, 2, 3, 4].map(k => { const a = k * 1.3; const m = ball(r * .12, 0xffe08a, [Math.cos(a) * r * .75, Math.sin(a * 1.7) * r * .5, r * .62], g, 1, { emissive: 0xffd060, ei: 2 }); m.castShadow = false; return m; });
    return g;
  }
  function solPulso(g, lt) { const k = 1 + Math.sin(lt * 3) * .02; g.nucleo.scale.setScalar(k); g.halo.forEach((h, i) => h.scale.setScalar(1 + Math.sin(lt * 2 + i) * .04)); g.rotation.y = lt * .2; }
  function cielo(n = 120, cerca = false) {               // estrellas que titilan
    return Array.from({ length: n }, (_, k) => {
      const s = ball(.03 + (k % 5) * .012, k % 7 ? 0xffffff : 0xffe7a0, [(Math.random() - .5) * 26, 3 + Math.random() * 14, -8 - Math.random() * 14], null, 1, { emissive: 0xffffff, ei: 2.2 });
      s.castShadow = false; s.f = Math.random() * 6; return s; });
  }
  const titilar = (est, lt) => est.forEach(s => s.scale.setScalar(.7 + .5 * Math.abs(Math.sin(lt * 2.2 + s.f))));
  function atomoH(pos, color = 0xff6a4a) {               // átomo de hidrógeno: bolita con carita
    const g = group(pos); g.b = ball(.2, color, [0, 0, 0], g, 2, { emissive: color, ei: .25 });
    E.ojo(g, [-.065, .04, .17], .75); E.ojo(g, [.065, .04, .17], .75); return g;
  }
  function tierra(pos, r = .35) {
    const g = group(pos); ball(r, 0x3a8fd9, [0, 0, 0], g, 2, { cc: .5 });
    for (let k = 0; k < 6; k++) { const a = k * 1.05, b = Math.sin(k * 2.1) * .6; ball(r * .32, 0x58b56a, [Math.cos(a) * Math.cos(b) * r * .82, Math.sin(b) * r * .82, Math.sin(a) * Math.cos(b) * r * .82], g, 1); }
    return g;
  }

  // 1 · gancho: de noche, alguien mira un cielo lleno de estrellas que titilan
  escena('gancho', {
    setup() { ambiente({ ...AMB.cuartoNoche, top: 0x070b22, bottom: 0x2b2a5e, fog: 0x10142e, near: 12, far: 40, sunColor: 0x8fa6ff, sunInt: 1.2, hemiInt: .9 });
      setCalle({ largo: 26 });
      this.est = cielo(150);
      this.p = persona({ pos: [.9, .15, -.6], shirt: 0xff7a59, mira: [0, 1] }); this.p.rotation.y = Math.PI; this.p.head.rotation.x = -.55;
      const farol = group([1.6, .15, .6]); cyl(.05, .07, 2.8, 0x2a2d36, [0, 1.4, 0], farol, 10); ball(.17, 0xffe0a0, [0, 2.85, 0], farol, 2, { emissive: 0xffc870, ei: 2.4 });
      const l = new THREE.PointLight(0xffc27a, 6, 6, 1.6); l.position.set(1.6, 2.8, .6); E.world.add(l);
      this.pv = polvo([0, 2.4, 0], [6, 3.5, 5], 120, 0xcfd8ff); },
    update(lt, c) {
      titilar(this.est, lt); polvoMueve(this.pv, lt);
      const p = einout(lt / 4);
      cam([lerp(2.4, 2.0, p), lerp(1.0, .85, p), lerp(6.2, 5.4, p)], [lerp(.6, .3, p), lerp(2.0, 2.9, p), -2], 46);
      rotulo('Nos preguntaron', 'en los comentarios', lt, 1330); c.ev('pop', 0);
      etiqueta('¿CÓMO BRILLAN LAS ESTRELLAS?', [.2, 4.4, -4], lt - c.f(1), 46, '#f3c54d'); if (lt > c.f(1)) c.ev('ding', c.f(1), .6);
    }
  });
  // 2 · el Sol es una estrella: de día, la persona cierra los ojos al sol y la cámara sube hacia él
  escena('sol', {
    setup() { ambiente({ ...AMB.calle, top: 0x4a7fd0, bottom: 0xffd7a0, sunInt: 3.0, sunPos: [-6, 9, -10] }); setCalle({ largo: 30 });
      this.s = sol([-3.5, 7.5, -16], 2.2);
      this.p = persona({ pos: [0, .15, 1.2], shirt: 0x2f8f83 }); this.p.rotation.y = Math.PI * .85; this.p.head.rotation.x = -.35; gesto(this.p, 'feliz');
      rayoLuz([-1.6, 3.6, -5], [.9, 0, .55], { largo: 9, r1: .4, r2: 2.6, op: .07 });
      this.pv = polvo([0, 2, 0], [6, 3, 5], 160); },
    update(lt, c) {
      solPulso(this.s, lt); polvoMueve(this.pv, lt);
      const sube = einout((lt - 1.6) / 2.6);
      cam([lerp(1.2, .6, sube), lerp(1.7, 3.0, sube), lerp(4.6, 5.6, sube)], [lerp(0, -3.2, sube), lerp(1.9, 7.0, sube), lerp(1, -14, sube)], lerp(42, 34, sube));
      etiqueta('UNA ESTRELLA', [-3.5, 6.1, -16], lt - c.w('estrella'), 64, '#ffd27a'); if (lt > c.w('estrella')) c.ev('ding', c.w('estrella'), .6);
      rotulo('El Sol', 'es una estrella', lt - c.w('Sol'), 1330); c.ev('whoosh', 1.6, .5);
    }
  });
  // 3 · fusión: en el centro del Sol dos átomos de hidrógeno chocan, se pegan y sueltan un destello de luz
  escena('fusion', {
    setup() { ambiente({ top: 0x5a1606, bottom: 0xd2541a, fog: 0x8a2a0a, near: 4, far: 18, sunColor: 0xffc070, sunInt: 1.4, hemiInt: 1.2, sunPos: [3, 6, 5] });
      this.bur = Array.from({ length: 40 }, (_, k) => { const b = ball(.1 + (k % 4) * .06, k % 2 ? 0xff8a2a : 0xffb347, [(Math.random() - .5) * 9, (Math.random() - .5) * 12, -3 - Math.random() * 6], null, 1, { emissive: 0xff6a10, ei: 1.1, opacity: .7 }); b.castShadow = false; b.f = Math.random() * 6; return b; });
      this.a = atomoH([0, 1.3, 0], 0xff6a4a); this.b = atomoH([0, -1.3, 0], 0x6aa8ff); this.a.scale.setScalar(1.5); this.b.scale.setScalar(1.5);
      this.flash = ball(.35, 0xffffff, [0, 0, .1], null, 2, { emissive: 0xfff3c0, ei: 2.2, opacity: .85 }); this.flash.visible = false; this.flash.castShadow = false;
      this.luz = new THREE.PointLight(0xffe2a0, 0, 10, 1.5); this.luz.position.set(0, 0, 1); E.world.add(this.luz);
      this.ch = chispas(46, 0xfff27a); },
    update(lt, c) {
      this.bur.forEach(b => { b.position.y += Math.sin(lt + b.f) * .004; b.scale.setScalar(.8 + .3 * Math.sin(lt * 2 + b.f)); });
      const tc = c.w('pegan') - .15, ir = ease(lt / tc), dx = lerp(1.3, .29, ir) + Math.sin(lt * 18) * .02 * (1 - ir);
      this.a.position.set(Math.sin(lt * 3) * .12, dx, 0); this.b.position.set(-Math.sin(lt * 3) * .12, -dx, 0);
      this.a.rotation.z = Math.sin(lt * 9) * .15; this.b.rotation.z = -this.a.rotation.z;
      const f = lt - tc;
      if (f > 0) { this.flash.visible = f < 1.6; const s = eout(f / .35) * (1 - ease((f - .4) / 1.2)); this.flash.scale.setScalar(.2 + s * 1.5); this.luz.intensity = 14 * s;
        this.a.b.material.emissiveIntensity = this.b.b.material.emissiveIntensity = .25 + 1.6 * s; c.ev('impact', tc, .8); }
      this.ch.update([[0, 0, .2]], .9 + (f > 0 ? f * 1.6 : 0), lt, f > 0 ? cl(1 - f / 2) : 0);
      const p = einout(lt / 4.4);
      cam([lerp(.4, 0, p), lerp(.5, .2, p), lerp(5.4, 3.6, p)], [0, 0, 0], 44);
      if (f < 0) etiqueta('HIDRÓGENO', [1.15, this.a.position.y, 0], lt - c.w('átomos') - .1, 44, '#ffffff');
      if (f > 0) etiqueta('¡LUZ!', [0, -1.15, 0], f - .25, 84, '#ffe27a');
      rotulo('Chocan y se pegan', 'y sueltan luz', lt - c.w('chocan'), 1330);
    }
  });
  // 4 · el viaje de la luz: zigzag por dentro del Sol (miles de años) y luego directo a la Tierra (8 minutos)
  escena('viaje', {
    setup() { ambiente({ ...AMB.espacio, hemiInt: .9 }); this.est = cielo(100);
      this.s = sol([0, -3.2, -2], 2.6);
      this.s.halo.forEach(h => h.material.opacity *= .7);
      this.cut = new THREE.Mesh(new THREE.CircleGeometry(2.62, 48), new THREE.MeshBasicMaterial({ color: 0xff7a1a })); this.cut.position.set(0, -3.2, .62); E.world.add(this.cut);   // corte del Sol
      [[1.9, 0xffa040], [1.2, 0xffd060], [.55, 0xfff4b0]].forEach(([r, col], i) => { const m = new THREE.Mesh(new THREE.CircleGeometry(r, 48), new THREE.MeshBasicMaterial({ color: col })); m.position.set(0, -3.2, .63 + i * .005); E.world.add(m); });
      // camino en zigzag desde el centro hasta la orilla (y = -3.2 + 2.6)
      const pts = [[0, -3.2]]; let x = 0, y = -3.2; for (let k = 0; k < 26; k++) { x += Math.sin(k * 2.7) * .38; y += .1 + Math.cos(k * 1.9) * .05 + (k % 3 ? .02 : -.1); x = Math.max(-1.6, Math.min(1.6, x)); pts.push([x, y]); } pts.push([.2, -.55]);
      this.pts = pts; const M = new THREE.MeshBasicMaterial({ color: 0xffffff });
      this.segs = pts.slice(1).map((q, i) => { const a = pts[i]; const dx = q[0] - a[0], dy = q[1] - a[1], L = Math.hypot(dx, dy);
        const m = new THREE.Mesh(new THREE.BoxGeometry(L, .045, .02), M); m.position.set((a[0] + q[0]) / 2, (a[1] + q[1]) / 2, .66); m.rotation.z = Math.atan2(dy, dx); m.visible = false; E.world.add(m); return m; });
      this.foton = ball(.09, 0xffffff, [0, -3.2, .7], null, 2, { emissive: 0xffffff, ei: 3 });
      this.t = tierra([1.0, 3.3, -1.5], .45);
      this.rayoR = box(.06, 1, .06, 0xfff2b0, [0, 0, 0], null, { emissive: 0xfff0a0, ei: 2.5, recto: true }); this.rayoR.visible = false; },
    update(lt, c) {
      titilar(this.est, lt); solPulso(this.s, lt); this.t.rotation.y = lt * .6;
      const t8 = c.w('ocho') - .5, zz = cl((lt - .15) / (t8 - .3)), n = Math.floor(zz * this.segs.length);
      this.segs.forEach((m, i) => m.visible = i < n);
      const q = this.pts[Math.min(n, this.pts.length - 1)];
      if (lt < t8) { this.foton.position.set(q[0], q[1], .7); if (n % 4 === 1) c.ev('click', .15 + (n / this.segs.length) * (t8 - .3), .25); }
      else { const v = eout((lt - t8) / .9), a = new THREE.Vector3(.2, -.55, .7), b = this.t.position.clone(); const pnt = a.clone().lerp(b, v);
        this.foton.position.copy(pnt); this.rayoR.visible = true; const mid = a.clone().add(pnt).multiplyScalar(.5); this.rayoR.position.copy(mid);
        this.rayoR.scale.y = Math.max(.01, a.distanceTo(pnt)); this.rayoR.lookAt(pnt); this.rayoR.rotateX(Math.PI / 2); c.ev('zap', t8, .6); }
      const p = einout(lt / 5.2);
      cam([0, lerp(-1.6, .6, p), lerp(7.2, 10.5, p)], [0, lerp(-2.4, .9, p), 0], lerp(48, 56, p));
      if (lt > t8) etiqueta('8 MINUTOS', [1.0, 2.5, -1.5], lt - t8 - .4, 58, '#7fdcff');
      rotulo('Miles de años', 'y luego solo 8 minutos', lt - c.w('miles'), 1330);
    }
  });
  // 5 · remate: uno espera con los brazos en jarras; el amigo llega corriendo tarde bajo el sol
  escena('remate', {
    setup() { ambiente({ ...AMB.calle, top: 0x4a7fd0, bottom: 0xffd7a0, sunInt: 3.0 }); setCalle({ largo: 30 });
      this.s = sol([3, 7.2, -16], 1.8);
      this.a = persona({ pos: [-.7, .15, 1.0], shirt: 0x6f9bd6 }); this.a.rotation.y = .35;
      this.b = persona({ pos: [3.5, .15, .6], shirt: 0xf3c54d, hair: 0x1c1410, pelo: 'largo' }); this.b.rotation.y = -Math.PI / 2;
      this.reloj = group([0, -.8, .1], this.a.armL); cyl(.07, .07, .03, 0x222222, [0, 0, 0], this.reloj, 20).rotation.x = Math.PI / 2;
      this.pv = polvo([0, 2, 0], [6, 3, 5], 140); },
    update(lt, c) {
      solPulso(this.s, lt); polvoMueve(this.pv, lt);
      pose(this.a, 'jarras', 1, lt); gesto(this.a, lt > c.w('excusa') - .2 ? 'sorpresa' : 'enojada'); this.a.pieR.rotation.x = Math.max(0, Math.sin(lt * 9)) * .3;
      const llega = ease(lt / 2.6); this.b.position.x = lerp(3.5, .7, llega); caminar(this.b, lt, llega < 1 ? 1.6 : 0); gesto(this.b, llega < 1 ? 'sorpresa' : 'feliz');
      if (llega >= 1) { this.b.rotation.y = lerp(-Math.PI / 2, -.4, ease((lt - 2.6) / .4)); pose(this.b, 'encoger', ease((lt - 2.7) / .4), lt); }
      cam([lerp(.9, .5, ease(lt / 5)), 1.6, lerp(7.6, 6.8, ease(lt / 5))], [.2, 1.25, .8], 42);
      if (lt < c.w('excusa') - .2) etiqueta('TARDE', [this.b.position.x, 2.45, .6], lt - c.w('tarde'), 56, '#ff9a7a'); if (lt > c.w('tarde')) c.ev('pop', c.w('tarde'));
      if (lt > c.w('excusa') - .2) etiqueta('¡CON EXCUSA!', [this.b.position.x, 2.45, .6], lt - c.w('excusa') + .2, 50, '#ffd27a');
      rotulo('Mándaselo', 'al que siempre llega tarde', lt - .05, 1330); c.ev('pop', .05);
    }
  });
}
