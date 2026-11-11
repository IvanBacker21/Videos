// Short 3D: ¿Por qué entras a la cocina y se te olvida a qué ibas? (efecto puerta: el cerebro guarda lo vivido por "escenas" o
// episodios; cruzar una puerta marca un límite de evento, se cierra el episodio y la intención se queda en el anterior.
// Estudio de Gabriel Radvansky, Universidad de Notre Dame, 2011: la gente olvidaba más al cruzar una puerta que al recorrer la
// misma distancia en un solo cuarto. Fuentes: Notre Dame News, Live Science).
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-11-1330-puerta.json OUT ../ejemplos/2026-11-11-1330-puerta.js
// Mejora del motor en este short: marcoPuerta() (pared con hueco, marco que brilla y hoja con bisagra), pensamiento() (globo de
// pensamiento 3D que se revienta) e interrogacion() (signo "?" 3D).
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    gesto, pose, hablar, setCocina, caminar, vaso, polvo, polvoMueve, rayoLuz, ondas, marcoPuerta, pensamiento, interrogacion, AMB } = E;

  const camRig = (lt, dur, a, b, la, lb, fov = 48) => { const q = einout(cl(lt / dur));
    cam([lerp(a[0], b[0], q), lerp(a[1], b[1], q), lerp(a[2], b[2], q)], [lerp(la[0], lb[0], q), lerp(la[1], lb[1], q), lerp(la[2], lb[2], q)], fov); };
  const cabeza = (p) => { const v = new THREE.Vector3(); p.head.getWorldPosition(v); return [v.x, v.y, v.z]; };
  function marca(pos, s = .5, ok = true, parent) { const g = group(pos, parent), col = ok ? 0x46d16a : 0xe8453c, m = { emissive: col, ei: .8 };
    if (ok) { const a = box(s * .18, s * .5, s * .18, col, [-s * .22, -s * .05, 0], g, m); a.rotation.z = .8; const b = box(s * .18, s * .95, s * .18, col, [s * .12, s * .12, 0], g, m); b.rotation.z = -.6; }
    else { const a = box(s * .18, s * .95, s * .18, col, [0, 0, 0], g, m); a.rotation.z = .78; const b = box(s * .18, s * .95, s * .18, col, [0, 0, 0], g, m); b.rotation.z = -.78; }
    g.children.forEach(c => c.castShadow = false); g.scale.setScalar(.001); return g; }
  const MAMA = { pelo: 'largo', shirt: 0xd0607a, pants: 0x3d4a66, hair: 0x2a1c14 };
  const YO = { shirt: 0x2f8f83, pants: 0x3d4a66 };
  // pasillo oscuro detrás de la puerta (para que se note "otro cuarto")
  function pasillo(x0 = -2.8) { for (let z = -3; z < 3.5; z += .5) box(2.4, .02, .5, 0x7a5a3e, [x0 - 1.2, .0, z + .25], null, { recto: true });
    box(.15, 3, 7, 0x6c7aa6, [x0 - 2.4, 1.5, .2]); const l = new THREE.PointLight(0x9fb4ff, 1.4, 5, 1.5); l.position.set(x0 - 1.4, 2.4, .3); E.world.add(l); }

  // 1 · gancho: entras a la cocina con la idea del vaso de agua… cruzas la puerta y ¡pum! se borra
  escena('gancho', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x7aa0d0, bottom: 0xffd59a }); this.k = setCocina({ acento: 0x4f8a7a }); pasillo(-2.8);
      this.pu = marcoPuerta({ pos: [-2.8, 0, .3], rotY: Math.PI / 2, ancho: 7, pared: 0xf1e6d2, abre: 1.45 });
      this.p = persona({ pos: [-4.1, 0, .3], ...YO }); this.p.rotation.y = Math.PI / 2;
      this.idea = pensamiento({ r: .36 }); vaso([0, -.17, 0], this.idea.contenido, 1.6);
      this.q = interrogacion([0, -9, 0], 1.1); this.pv = polvo([-1, 1.4, 0], [4, 2, 3], 80); },
    update(lt, c) {
      const d = caminar(this.p, Math.min(lt, 1.75), 1.1); const x = -4.1 + d; this.p.position.x = x;
      if (lt > 1.75) { ['L', 'R'].forEach(s => { this.p['leg' + s].rotation.x *= .8; this.p['knee' + s].rotation.x *= .8; }); }
      const tc = 1.15;   // cruza la puerta
      const h = cabeza(this.p);
      this.idea.seguir([Math.max(x + .15, -2.4), 2.5, h[2]], [h[0] + .1, h[1] + .28, h[2]]);
      const rompe = cl((lt - tc) / .55); this.idea.update(lt, cl(lt / .35), rompe);
      const to = c.w('olvida');
      this.p.rotation.y = lt < 1.9 ? Math.PI / 2 : lerp(Math.PI / 2, .55, ease((lt - 1.9) / .4));
      this.p.head.rotation.z = lt > to ? .18 * ease((lt - to) / .3) : 0;
      gesto(this.p, lt < tc + .2 ? 'feliz' : 'sorpresa'); if (lt > to) pose(this.p, 'encoger', ease((lt - to) / .3), lt);
      const kq = spring((lt - tc - .3) / .7); this.q.position.set(x + .1, 2.42 + Math.sin(lt * 3) * .04, .3); this.q.scale.setScalar(Math.max(.001, kq * .75)); this.q.rotation.y = Math.sin(lt * 2.5) * .6;
      polvoMueve(this.pv, lt);
      camRig(lt, c.dur, [1.5, 1.55, 3.3], [1.0, 1.5, 2.7], [-2.8, 1.5, .3], [-2.3, 1.45, .3], 50);
      etiqueta('VASO DE AGUA', [this.idea.position.x + .2, this.idea.position.y - .5, .9], lt - .3 < 0 || lt > tc ? -1 : lt - .3, 46, '#ffffff', true);
      etiqueta('¿A QUÉ VENÍA?', [x + .1, 1.0, .9], lt - to, 60, '#f3c54d', true);
      c.ev('pop', 0, .35); if (lt > tc) c.ev('pop', tc, .7); if (lt > tc + .3) c.ev('whoosh', tc + .3, .4); if (lt > to) c.ev('ding', to, .4);
    }
  });

  // 2 · la culpa es de la puerta: volteas, la señalas y el marco se enciende
  escena('culpa', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x6f8fc2, bottom: 0xffc98a }); this.k = setCocina({ acento: 0x4f8a7a }); pasillo(-2.8);
      this.pu = marcoPuerta({ pos: [-2.8, 0, .3], rotY: Math.PI / 2, ancho: 7, pared: 0xf1e6d2, abre: -1.5 });
      this.p = persona({ pos: [-1.85, 0, .95], ...YO }); this.p.rotation.y = .4;
      this.on = ondas([-2.72, 1.15, .3], { color: 0xffb347, n: 4, alcance: 1.1, vel: 1.1, dir: [0, Math.PI / 2, 0] });
      this.luz = new THREE.PointLight(0xffa040, 0, 5, 1.4); this.luz.position.set(-2.4, 1.4, .3); E.world.add(this.luz); },
    update(lt, c) {
      const te = c.w('edad'), tp = c.w('puerta');
      const giro = ease((lt - tp + .55) / .45);
      this.p.rotation.y = lerp(.4, -1.2, giro);
      gesto(this.p, lt < tp - .5 ? 'neutral' : 'enojada');
      if (lt < tp - .5) { pose(this.p, 'encoger', ease(lt / .3), lt); hablar(this.p, lt, .6); } else pose(this.p, 'senalar', ease((lt - tp + .5) / .35), lt);
      const kb = ease((lt - tp + .1) / .3); this.pu.brillo(kb * (.75 + .25 * Math.sin(lt * 9)));
      this.luz.intensity = kb * 3; this.on.update(lt, lt > tp);
      this.pu.puerta.rotation.y = -1.5 + .25 * Math.sin(Math.max(0, lt - tp) * 7) * Math.exp(-Math.max(0, lt - tp) * 2.5) * (lt > tp ? 1 : 0);
      camRig(lt, c.dur, [1.0, 1.6, 5.2], [.5, 1.5, 4.6], [-2.3, 1.3, .5], [-2.4, 1.25, .5], 50);
      etiqueta('NO ES LA EDAD', [-1.85, .5, 1.1], lt - te + .3 < 0 || lt > tp - .3 ? -1 : lt - te + .3, 54, '#ffffff', true);
      etiqueta('¡LA CULPABLE!', [-2.7, 2.4, .3], lt - tp, 62, '#f3c54d', true);
      rotulo('La culpa es de la puerta', 'no de la edad', lt - tp, 1330);
      c.ev('whoosh', 0, .3); if (lt > tp) { c.ev('impact', tp, .7); c.ev('zap', tp + .05, .35); }
    }
  });

  // 3 · tu cerebro guarda por capítulos: tres "capítulos" con mini-cuartos que aparecen en fila
  escena('capitulos', {
    setup() { ambiente({ top: 0x141a3a, bottom: 0x4a3470, fog: 0x1a1d40, near: 8, far: 30, sunColor: 0xffe6c4, sunInt: 2.2, hemiInt: .9, sunPos: [4, 8, 6] });
      box(30, .02, 30, 0x241f45, [0, -.01, 0], null, { recto: true });
      const mk = (x, y, z, ry, titulo, fondo, f) => { const g = group([x, y, z]); g.userData.y = y; g.rotation.y = ry;
        box(1.55, 1.15, .1, 0xf4ead6, [0, 0, 0], g); box(1.38, .98, .04, fondo, [0, 0, .06], g, { emissive: fondo, ei: .25 });
        const marco = box(1.65, 1.25, .06, 0xf3c54d, [0, 0, -.06], g, { emissive: 0xf3c54d, ei: .4 });
        const d = group([0, -.42, .1], g); f(d); cyl(.03, .03, 1.45, 0x6a5a8a, [0, -.75, -.05], g, 8, { opacity: 0 });
        g.titulo = titulo; g.scale.setScalar(.001); return g; };
      this.cs = [
        mk(-.42, 2.5, -.3, .18, 'SALA', 0x7fb0e0, d => { box(.7, .22, .3, 0x3f6fb0, [0, .14, 0], d); box(.7, .3, .1, 0x3f6fb0, [0, .3, -.12], d); box(.12, .3, .3, 0x335c94, [-.38, .2, 0], d); box(.12, .3, .3, 0x335c94, [.38, .2, 0], d); box(.36, .26, .03, 0x222831, [0, .66, -.15], d, { emissive: 0x7fd0ff, ei: .5 }); }),
        mk(.42, 1.68, -.1, -.18, 'PASILLO', 0xd9b48a, d => { box(.4, .72, .05, 0xa8703f, [0, .36, .03], d); ball(.03, 0xd9c08a, [.13, .36, .07], d, 1, { metal: .6 }); box(.5, .05, .08, 0x8a5a36, [0, .74, .03], d); }),
        mk(-.42, .86, .1, .18, 'COCINA', 0xf2c879, d => { box(.32, .72, .3, 0xe8ecef, [.18, .36, -.05], d); box(.5, .3, .26, 0x4f8a7a, [-.28, .15, -.05], d); const v = vaso([-.28, .3, 0], d, 1.0); }),
      ];
      this.cer = group([.62, 2.75, -.6]); this.cer.scale.setScalar(.6);   // cerebro que "archiva"
      [[0, 0, 0, .42], [-.32, .05, 0, .3], [.32, .05, 0, .3], [-.18, .22, .1, .26], [.18, .22, .1, .26], [0, -.18, .12, .26]].forEach(([x, y, z, r]) => ball(r, 0xf4a6b8, [x, y, z], this.cer, 1, { emissive: 0xff7fa0, ei: .25 }));
      box(.04, .55, .7, 0xd98096, [0, .05, 0], this.cer);
      this.pv = polvo([0, 1.8, -.3], [5, 3, 3], 120, 0xf3e0ff); },
    update(lt, c) {
      const ts = [c.w('cerebro') + .1, c.w('escenas') - .1, c.w('capítulos') - .15];
      this.cs.forEach((g, i) => { const k = spring((lt - ts[i]) / .7); g.scale.setScalar(Math.max(.001, k)); g.position.y = g.userData.y + Math.sin(lt * 1.6 + i) * .04; g.scale.multiplyScalar(.72); if (lt > ts[i]) c.ev('pop', ts[i], .5); });
      this.cer.scale.setScalar(Math.max(.001, .55 * spring(lt / .7))); this.cer.rotation.y = Math.sin(lt * .8) * .4; this.cer.position.y = 2.75 + Math.sin(lt * 2) * .05;
      polvoMueve(this.pv, lt);
      camRig(lt, c.dur, [-.5, 1.55, 4.9], [.4, 1.5, 4.4], [0, 1.6, -.2], [0, 1.6, -.2], 50);
      this.cs.forEach((g, i) => etiqueta(`CAP. ${i + 1}: ${g.titulo}`, [g.position.x + (g.position.x < 0 ? .8 : -.8), g.position.y, g.position.z + .1], lt - ts[i] - .2, 38, '#f3c54d', true));
      rotulo('Por capítulos', 'así guarda tu cerebro lo que vives', lt - ts[2], 1330);
      c.ev('whoosh', 0, .35);
    }
  });

  // 4 · al cruzar la puerta se cierra el capítulo: la idea se queda en el cuarto de atrás
  escena('corte', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x6f8fc2, bottom: 0xf2c58e });
      for (let x = -4; x < 0; x += .5) box(.5, .02, 6, x % 1 ? 0x8a6242 : 0x9a7050, [x + .25, -.01, 0], null, { recto: true });   // sala: duela
      for (let x = 0; x < 4; x += .5) for (let z = -3; z < 3; z += .5) box(.5, .02, .5, ((x + z) * 2) % 2 ? 0xd8cdb8 : 0xb8a58a, [x + .25, -.01, z + .25], null, { recto: true });   // cocina
      box(8, 2.9, .15, 0xe9dcc6, [0, 1.45, -2.4]);
      this.pu = marcoPuerta({ pos: [0, 0, 0], rotY: Math.PI / 2, ancho: 4.8, pared: 0xf1e6d2, abre: -1.6 });
      const sofa = group([-2.4, 0, -1.6]); box(1.6, .45, .7, 0x3f6fb0, [0, .3, 0], sofa); box(1.6, .5, .2, 0x3f6fb0, [0, .65, -.3], sofa); box(.2, .55, .7, 0x335c94, [-.85, .35, 0], sofa); box(.2, .55, .7, 0x335c94, [.85, .35, 0], sofa);
      box(1.2, .05, 1.4, 0xc0583f, [-2.0, .01, .3]);
      const refri = group([2.6, 0, -1.9]); box(.85, 1.9, .7, 0xe8ecef, [0, .95, 0], refri); box(.04, .5, .05, 0x9aa3ab, [.3, 1.25, .37], refri);
      box(1.6, .9, .6, 0x4f8a7a, [1.4, .45, -2.0]); box(1.65, .06, .66, 0xe9e2d6, [1.4, .92, -2.0]);
      this.p = persona({ pos: [-1.6, 0, .4], ...YO }); this.p.rotation.y = Math.PI / 2;
      this.idea = pensamiento({ r: .36 }); vaso([0, -.17, 0], this.idea.contenido, 1.6);
      const pm = new THREE.MeshBasicMaterial({ color: 0xf3c54d, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
      this.pag = group([.05, 0, -.5]); const pg = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 2.15), pm); pg.position.set(0, 1.08, .5); this.pag.add(pg); this.pagM = pm;   // "página" que se cierra
      this.q = interrogacion([0, -9, 0], .9); },
    update(lt, c) {
      const tcr = c.w('cruzar'), tci = c.w('cierra'), tat = c.w('atrás');
      const d = caminar(this.p, Math.min(lt, 3.0), .95); const x = -1.6 + d; const tk = Math.max(tci, 1.55); this.p.position.x = x;
      const h = cabeza(this.p), suelta = Math.max(-.55, Math.min(x, -.55));
      const ix = x < -.75 ? x + .1 : -.65; this.idea.seguir([ix, 2.72, .4], x < -.2 ? [h[0] + .1, h[1] + .28, h[2]] : null);
      const atras = cl((lt - tat) / .6); this.idea.update(lt, cl(lt / .35), 0);
      this.idea.scale.setScalar(1 - .25 * atras);
      // "página" dorada que se cierra en el marco de la puerta cuando dice "cierra el capítulo"
      const kp = ease((lt - tk) / .45); this.pag.rotation.y = lerp(-1.4, 0, kp); this.pagM.opacity = kp * (.55 - .25 * cl((lt - tci - .6) / .8));
      this.pu.brillo(kp * .6 * (1 - cl((lt - tk - .5) / .8)));
      if (lt > 3.0) { this.p.rotation.y = lerp(Math.PI / 2, -2.4, ease((lt - tat + .2) / .5)); gesto(this.p, 'sorpresa'); pose(this.p, 'encoger', ease((lt - tat) / .3), lt);
        ['L', 'R'].forEach(s => { this.p['leg' + s].rotation.x *= .85; this.p['knee' + s].rotation.x *= .85; }); } else gesto(this.p, 'feliz');
      const kq = spring((lt - tat - .1) / .7); this.q.position.set(x, 2.6 + Math.sin(lt * 3) * .04, .4); this.q.scale.setScalar(Math.max(.001, kq)); this.q.rotation.y = Math.sin(lt * 2.5) * .6;
      camRig(lt, c.dur, [-.4, 4.4, 7.0], [.7, 4.1, 6.5], [-.3, 1.15, -.2], [.55, 1.2, -.2], 52);
      etiqueta('SALA', [-1.3, .3, 1.4], lt - .2, 46, '#ffffff', true); etiqueta('COCINA', [1.3, .3, 1.4], lt - .4, 46, '#ffffff', true);
      etiqueta('SE QUEDA ATRÁS', [-.25, 2.1, .6], lt - tat, 52, '#f3c54d', true);
      rotulo('Fin del capítulo', 'la idea se quedó en el otro cuarto', lt - tci, 1330);
      c.ev('whoosh', 0, .3); if (lt > tci) c.ev('whoosh', tci, .55); if (lt > tci + .4) c.ev('impact', tci + .4, .45); if (lt > tat) c.ev('ding', tat, .4);
    }
  });

  // 5 · el estudio: con puerta vs. sin puerta
  escena('estudio', {
    setup() { ambiente({ top: 0x5f7fb8, bottom: 0xe9d6b8, fog: 0xcfc6b8, near: 9, far: 30, sunColor: 0xfff0d6, sunInt: 2.5, hemiInt: 1.1, sunPos: [-5, 10, 7] });
      for (let x = -4; x < 4; x += .5) for (let z = -6; z < 4; z += .5) box(.5, .02, .5, ((x + z) * 2) % 2 ? 0xe4ddd0 : 0xcfc8ba, [x + .25, -.01, z + .25], null, { recto: true });
      box(9, 3, .15, 0xe9e4da, [0, 1.5, -5.5]);
      box(.12, 1.0, 7.5, 0x3f5f8f, [0, .5, -1.6]);   // divisor entre carriles
      box(1.0, .02, 6.6, 0x8fbf8f, [-1.1, .005, -1.6], null, { recto: true, opacity: .45 }); box(1.0, .02, 6.6, 0xf3c54d, [1.1, .005, -1.6], null, { recto: true, opacity: .35 });
      this.pu = marcoPuerta({ pos: [1.15, 0, -2.4], ancho: 2.0, pared: 0xd8e2ec, abre: -1.5 });
      this.a = persona({ pos: [-1.1, 0, -4.2], shirt: 0x2f8f83, pants: 0x3d4a66 });
      this.b = persona({ pos: [1.1, 0, -4.2], shirt: 0xc0583f, pants: 0x3d4a66, pelo: 'largo', hair: 0x4a2a1a });
      this.ia = pensamiento({ r: .3 }); vaso([0, -.15, 0], this.ia.contenido, 1.35);
      this.ib = pensamiento({ r: .3 }); vaso([0, -.15, 0], this.ib.contenido, 1.35);
      this.ok = marca([-1.1, 2.75, .9], .55, true); this.no = marca([1.1, 2.75, .9], .55, false); },
    update(lt, c) {
      const tc = c.w('cruzar');
      const za = -4.2 + caminar(this.a, Math.min(lt, 2.9), 1.1), zb = -4.2 + caminar(this.b, Math.min(lt, 2.9), 1.1);
      this.a.position.z = za; this.b.position.z = zb;
      if (lt > 2.9) [this.a, this.b].forEach(p => ['L', 'R'].forEach(s => { p['leg' + s].rotation.x *= .85; p['knee' + s].rotation.x *= .85; }));
      const cruza = lt0 => lt0;   // momento en que b pasa por la puerta (z = -.8)
      const tb = (-2.4 + 4.2) / (1.1 * 1.05);
      [[this.a, this.ia, 0], [this.b, this.ib, cl((lt - tb) / .5)]].forEach(([p, idea, r]) => { const h = cabeza(p);
        idea.seguir([p.position.x + .05, 2.68, p.position.z], [h[0] + .08, h[1] + .26, h[2]]); idea.update(lt, cl(lt / .35), r); });
      gesto(this.a, 'feliz'); gesto(this.b, lt > tb + .3 ? 'sorpresa' : 'feliz');
      if (lt > tb + .4) pose(this.b, 'encoger', ease((lt - tb - .4) / .3), lt);
      this.ok.position.z = za; this.no.position.z = zb;
      const kf = spring((lt - 3.0) / .7); this.ok.scale.setScalar(Math.max(.001, kf)); this.no.scale.setScalar(Math.max(.001, spring((lt - tb - .35) / .7)));
      this.pu.brillo(cl((lt - tb + .4) / .3) * (1 - cl((lt - tb - .4) / .6)) * .8);
      camRig(lt, c.dur, [0, 2.4, 6.4], [0, 2.2, 5.6], [0, 1.25, -2.0], [0, 1.25, -1.4], 52);
      etiqueta('SIN PUERTA', [-1.1, .75, .6], lt - .2, 44, '#bff2c4', true); etiqueta('CON PUERTA', [1.1, .75, .6], lt - .35, 44, '#f3c54d', true);
      rotulo('Un estudio lo comprobó', 'Universidad de Notre Dame', lt - .15, 1330);
      c.ev('whoosh', 0, .3); if (lt > tb) c.ev('pop', tb, .7); if (lt > tb + .35) c.ev('zap', tb + .35, .3); if (lt > 3.0) c.ev('ding', 3.0, .45);
    }
  });

  // 6 · remate: tu mamá parada frente al refri… "¿a qué venía?"
  escena('remate', {
    setup() { ambiente({ ...AMB.cuartoDia, top: 0x7aa0d0, bottom: 0xffd59a }); this.k = setCocina({ acento: 0xc0583f });
      this.p = persona({ pos: [1.9, 0, -.45], ...MAMA }); this.p.rotation.y = -.25;
      this.qs = [[-.6, 2.1, .2, .7], [.62, 2.2, .1, .6], [.0, 2.5, -.1, .5]].map(([x, y, z, s]) => { const q = interrogacion([0, -9, 0], s); q.userData.o = [x, y, z]; return q; });
      const sol = rayoLuz([.6, 2.6, -1.6], [.45, 0, .35], { largo: 3.2 }); this.pv = polvo([1.4, 1.5, -.5], [3, 2, 2], 90); },
    update(lt, c) {
      this.k.refri.puerta.rotation.y = -1.9 * ease(lt / .6);
      const tm = c.w('mamá'), tp = c.w('parada');
      gesto(this.p, 'sorpresa'); pose(this.p, 'encoger', ease((lt - .3) / .35), lt); this.p.head.rotation.z = .15 * Math.sin(lt * 1.5);
      this.p.head.rotation.y = Math.sin(lt * 1.1) * .45;
      this.qs.forEach((q, i) => { const o = q.userData.o, k = spring((lt - .4 - i * .25) / .7); q.position.set(1.9 + o[0], o[1] + Math.sin(lt * 2.4 + i) * .05, -.45 + o[2]); q.scale.setScalar(Math.max(.001, k)); q.rotation.y = Math.sin(lt * 2 + i) * .7; if (lt > .4 + i * .25) c.ev('pop', .4 + i * .25, .35); });
      polvoMueve(this.pv, lt);
      camRig(lt, c.dur, [.3, 1.6, 4.6], [.7, 1.55, 4.0], [1.9, 1.3, -.5], [1.9, 1.35, -.5], 50);
      etiqueta('¿A QUÉ VENÍA?', [1.9, .45, .2], lt - tp + .2, 58, '#f3c54d', true);
      rotulo('Mándaselo a tu mamá', 'la que se queda parada en la cocina', lt - tm, 1330);
      c.ev('whoosh', 0, .3); if (lt > tm) c.ev('ding', tm, .45);
    }
  });
}
