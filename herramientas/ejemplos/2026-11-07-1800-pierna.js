// Short 3D: ¿Por qué se te duerme la pierna? (+ truco para despertarla)
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-07-1800-pierna.json OUT ../ejemplos/2026-11-07-1800-pierna.js
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, mat, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    setBano, sentar, gesto, pose, chispas } = E;
  const BANO = { top: 0x4a6a8f, bottom: 0xf1d2a6, fog: 0xcfd9d6, near: 6, far: 22, sunColor: 0xfff0d8, sunInt: 2.5, hemiInt: 1.2, sunPos: [4, 9, 7] };
  const AZUL = 0x7d93c9, PANTS = 0x3d4a66;

  // ---------- utilería ----------
  function celular(parent, pos) {
    const g = group(pos, parent); box(.11, .2, .018, 0x1d1f26, [0, 0, 0], g);
    box(.095, .175, .004, 0x8fd3ff, [0, 0, .011], g, { emissive: 0x6fc3ff, ei: 1.1 }); return g;
  }
  // persona sentada en el escusado con el celular en la mano
  function sentado(b, o = {}) {
    const p = persona({ pos: [0, b.personaY, -.23], shirt: o.shirt ?? 0xe8a33d, pants: PANTS, pelo: o.pelo, hair: o.hair });
    sentar(p, 1);
    p.armR.rotation.set(-1.25, 0, .35); p.armL.rotation.set(-.35, 0, -.1);
    p.cel = celular(p.armR, [0, -.8, .07]); p.cel.rotation.set(-1.9, 0, 0);
    p.head.rotation.x = .45;
    return p;
  }
  // pinta la pierna derecha (la "dormida") de un color, sin tocar el zapato
  function tinte(p, color) { [p.legR.children[0], p.kneeR.children[0]].forEach(m => m.material.color.setHex(color)); }

  // Pierna gigante en corte (sentada: muslo horizontal, pantorrilla vertical) con el nervio por dentro.
  function piernaRig() {
    const g = group([0, 0, 0]); g.scale.setScalar(.72);
    const piel = mat(0xf0c09a, { opacity: .5, emissive: 0x6a4030, ei: .35 }); piel.depthWrite = false;
    const muslo = box(2.7, .62, .62, piel, [.15, .15, 0], g); muslo.castShadow = false;
    const panto = box(.52, 1.35, .52, piel, [1.3, -.55, 0], g); panto.castShadow = false;
    const pie = box(.55, .22, .9, piel, [1.3, -1.32, .25], g); pie.castShadow = false;
    // asiento (orilla del escusado) que presiona bajo el muslo
    const asiento = box(1.6, .14, .9, 0xf4f4f4, [-.45, -.3, 0], g);
    cyl(.5, .38, 1.1, 0xffffff, [-.45, -.92, 0], g, 14);
    // nervio: cadena de esferas sobre una curva pie → cadera → hacia el cerebro
    const curva = new THREE.CatmullRomCurve3([[1.3, -1.3, .3], [1.32, -1.0, .05], [1.28, -.1, 0], [1.05, .14, 0], [.2, .14, 0], [-.8, .16, 0], [-1.25, .5, 0], [-1.35, 1.6, 0], [-1.3, 2.6, 0]].map(a => new THREE.Vector3(...a)));
    const nerv = Array.from({ length: 110 }, (_, k) => { const t = k / 109, q = curva.getPoint(t);
      const s = ball(.045, 0xf5c542, [q.x, q.y, q.z], g, 0, { emissive: 0xf0b030, ei: .7 }); s.t = t; s.castShadow = false; return s; });
    const cerebro = group([-1.3, 2.75, 0], g); const cb = ball(.42, 0xf2a0b4, [0, 0, 0], cerebro, 1, { emissive: 0xd06080, ei: .25 }); cb.scale.set(1.25, .9, 1);
    box(.04, .5, .55, 0xd47a92, [0, .05, 0], cerebro);
    const pulsos = Array.from({ length: 7 }, (_, k) => { const s = ball(.085, 0xffffff, [0, 0, 0], g, 1, { emissive: 0xfff2a0, ei: 2 }); s.castShadow = false; s.k = k; return s; });
    const tp = curva.getUtoTmapping ? .5 : .5;   // punto de presión ≈ mitad del muslo
    return { g, muslo, panto, pie, asiento, nerv, pulsos, curva, cerebro, cb, tp: .47, piel,
      // presion 0..1 aplasta el muslo y el nervio sobre el asiento
      apretar(k) { asiento.position.y = -.3 + .1 * k; muslo.scale.y = 1 - .18 * k; muslo.position.y = .15 + .05 * k;
        nerv.forEach(s => { const d = Math.abs(s.t - this.tp); const w = Math.max(0, 1 - d / .12); s.scale.set(1, 1 - .7 * k * w, 1 + .5 * k * w); }); },
      // mueve los pulsos (mensajes). bloqueo 0..1: se detienen y se apagan en el punto de presión
      mensajes(lt, vel = .38, bloqueo = 0, caos = 0) {
        pulsos.forEach(s => { let t = ((lt * vel + s.k / pulsos.length) % 1);
          if (caos) t = ((lt * vel * (1 + (s.k % 3) * .6) + s.k * .37) % 1);
          let vis = 1;
          if (bloqueo > 0 && t > this.tp - .02) { vis = 1 - bloqueo; if (vis <= .05) { t = this.tp - .02 - (s.k % 3) * .015; vis = .5 + .5 * Math.sin(lt * 12 + s.k); } }
          const q = curva.getPoint(Math.min(.99, t)); const j = caos ? .08 : 0;
          s.position.set(q.x + Math.sin(lt * 31 + s.k) * j, q.y + Math.cos(lt * 27 + s.k) * j, q.z);
          s.scale.setScalar(.7 + .5 * vis); s.material.emissiveIntensity = 2 * vis; s.material.opacity = 1; });
        nerv.forEach(s => { const d = Math.min(...pulsos.map(p => Math.abs(curva.getPoint(0).x * 0 + (((lt * vel + p.k / pulsos.length) % 1) - s.t))));
          s.material.emissiveIntensity = (bloqueo > .5 && s.t > this.tp) ? .15 : .5 + (d < .03 ? 1.2 : 0); }); } };
  }
  function camRig(lt, dur, a, b, look, fov = 44) { const q = einout(cl(lt / dur)); cam([lerp(a[0], b[0], q), lerp(a[1], b[1], q), lerp(a[2], b[2], q)], look, fov); }
  const LAB = { top: 0x141b33, bottom: 0x2a3560, fog: 0x141b33, near: 8, far: 30, sunColor: 0xdfe8ff, sunInt: 2.0, hemiInt: 1.0, sunPos: [3, 8, 6] };
  function fondoLab() { const piso = box(14, .1, 14, 0x232c4a, [0, -1.5, 0]); for (let k = 0; k < 40; k++) { const s = ball(.03, 0x9fc0ff, [(k * 3.7 % 12) - 6, (k * 1.9 % 8) - 1, -4 - (k % 4)], null, 0, { emissive: 0x9fc0ff, ei: .9 }); s.castShadow = false; } }

  // 1 · gancho: en el baño con el celular, la pierna se queda dormida
  escena('gancho', {
    setup() { ambiente(BANO); this.b = setBano({ acento: 0x3f8fa6 }); this.p = sentado(this.b); gesto(this.p, 'feliz');
      this.z = [0, 1, 2].map(k => { const s = box(.001, .001, .001, 0xffffff, [0, 0, 0]); s.visible = false; return s; }); },
    update(lt, c) {
      const td = c.w('duerme'); const k = cl((lt - td) / 1.2);
      const col = new THREE.Color(PANTS).lerp(new THREE.Color(AZUL), k); tinte(this.p, col.getHex());
      this.p.cel.rotation.z = Math.sin(lt * 2.2) * .06; this.p.head.rotation.x = .45 + Math.sin(lt * 1.3) * .03;
      if (lt > c.w('final')) { gesto(this.p, 'sorpresa'); this.p.head.rotation.x = lerp(.45, .1, ease((lt - c.w('final')) / .4)); }
      camRig(lt, c.dur, [2.7, 1.9, 4.7], [1.5, 1.45, 3.2], [.1, .8, -.05], 46);
      [0, 1, 2].forEach(i => { const t = lt - td - .3 - i * .45; if (t > 0) etiqueta('z', [.25 + i * .12 + Math.sin(t * 2) * .03, .75 + i * .14 + t * .05, .3], t, 40 + i * 12, '#cfe0ff'); });
      if (lt > td + .2) etiqueta('PIERNA DORMIDA', [.55, .3, .45], lt - td - .2, 44, '#f3c54d', true);
      if (lt > td) c.ev('pop', td, .5);
      if (lt < c.f(1)) rotulo('¿Se te duerme?', 'la pierna, en el baño', lt - .1, 1330);
      else { rotulo('Cómo despertarla', 'te lo digo al final', lt - c.f(1), 1330); c.ev('ding', c.f(1), .6); }
    }
  });
  // 2 · nervio: corte de la pierna; el asiento aplasta el nervio (cable de mensajes)
  escena('nervio', {
    setup() { ambiente(LAB); fondoLab(); this.r = piernaRig(); },
    update(lt, c) {
      const ta = c.w('aplastas'), tn = c.w('nervios'), tc = c.w('cables'), tm = c.w('mensajes');
      this.r.apretar(ease((lt - ta) / .5)); if (lt > ta) c.ev('impact', ta, .5);
      this.r.mensajes(lt, .32, 0);
      this.r.cb.scale.set(1.25 * (1 + .04 * Math.sin(lt * 6)), .9, 1);
      camRig(lt, c.dur, [1.0, .2, 6.3], [-.3, 1.3, 6.9], [0, lerp(.25, .95, ease((lt - 2.5) / 3)), 0], 46);
      if (lt > tn) etiqueta('NERVIO', [.2, .45, .3], lt - tn, 50, '#f5c542', true);
      if (lt > ta) etiqueta('PRESIÓN', [-.75, -.1, .4], lt - ta, 44, '#fff', true);
      if (lt > tm) etiqueta('CEREBRO', [-.94, 2.45, 0], lt - tm, 46, '#f2a0b4', true);
      rotulo('Nervios = cables', 'llevan mensajes al cerebro', lt - tc, 1330); if (lt > tc) c.ev('zap', tc, .4);
    }
  });
  // 3 · silencio: los mensajes se detienen en el punto aplastado; la pierna se apaga
  escena('silencio', {
    setup() { ambiente(LAB); fondoLab(); this.r = piernaRig(); this.r.apretar(1); },
    update(lt, c) {
      const tp = c.w('pasan,'), td = c.w('dormida.');
      const bl = ease((lt - tp + .6) / .6); this.r.mensajes(lt, .32, bl);
      const k = ease((lt - td + .3) / .8); this.r.piel.color.copy(new THREE.Color(0xe0b08c).lerp(new THREE.Color(AZUL), k));
      this.r.cb.material.emissiveIntensity = .25 - .2 * bl;
      camRig(lt, c.dur, [.6, .6, 5.6], [1.2, 1.3, 6.2], [-.1, .75, 0], 46);
      if (lt > tp) { etiqueta('SIN SEÑAL', [-.1, .7, .3], lt - tp, 54, '#ff6b5a', true); c.ev('click', tp, .5); }
      if (lt > tp + .4) etiqueta('?', [-.3, 2.05, 0], lt - tp - .4, 90, '#fff');
      rotulo('Pierna dormida', 'los mensajes no llegan', lt - td + .3, 1330);
    }
  });
  // 4 · hormigueo: se para y la pierna se llena de chispas (mensajes revueltos)
  escena('hormigueo', {
    setup() { ambiente(BANO); this.b = setBano({ acento: 0x3f8fa6 }); this.p = sentado(this.b); tinte(this.p, AZUL);
      this.ch = chispas(70, 0xfff27a); },
    update(lt, c) {
      const tp = c.w('pararte,'), tr = c.w('revueltos:');
      const up = ease((lt - tp) / .7); sentar(this.p, 1); sentar(this.p, 1 - up);
      this.p.position.set(lerp(0, .15, up), lerp(this.b.personaY, 0, up), lerp(-.23, .35, up));
      this.p.cel.visible = lt < tp + .3;
      if (lt > tp + .7) {   // tambaleo con la pierna dormida
        const w = Math.sin(lt * 9); this.p.rotation.z = w * .09; this.p.legR.rotation.x = .25 + .15 * Math.sin(lt * 23); this.p.kneeR.rotation.x = .2;
        pose(this.p, 'brazosArriba', .45, lt); gesto(this.p, 'sorpresa');
      } else { this.p.armR.rotation.set(lerp(-1.25, 0, up), 0, .35); this.p.head.rotation.x = lerp(.45, 0, up); }
      const wp = new THREE.Vector3(); const pts = [];
      [this.p.legR, this.p.kneeR, this.p.pieR].forEach(o => { o.getWorldPosition(wp); pts.push([wp.x, wp.y - .1, wp.z + .05]); });
      this.ch.update(pts, .28, lt, cl((lt - c.w('despiertan')) / .6));
      if (lt > c.w('despiertan')) c.ev('zap', c.w('despiertan'), .7);
      const q = ease(lt / c.dur); cam([lerp(2.6, 2.0, q), lerp(1.6, 1.4, q), lerp(4.9, 4.1, q)], [.15, lerp(1.0, .85, q), .2], 46);
      if (lt > tr) etiqueta('¡BZZZ!', [.65, 1.0, .5], lt - tr, 64, '#fff27a', true);
      rotulo('Hormigueo', 'mensajes revueltos', lt - c.w('hormigueo.') + .2, 1330); if (lt > tr) c.ev('crack', tr, .5);
    }
  });
  // 5 · truco: sentado, mueve el pie y los dedos; las chispas se apagan
  escena('truco', {
    setup() { ambiente({ ...BANO, top: 0x3a5a7f }); this.b = setBano({ acento: 0x3f8fa6 }); this.p = sentado(this.b, {}); this.p.cel.visible = false;
      this.p.armR.rotation.set(-.35, 0, .1); this.p.head.rotation.x = .35; tinte(this.p, AZUL); this.ch = chispas(40, 0xfff27a); },
    update(lt, c) {
      const tg = c.w('golpe.'), tm = c.w('Mueve'), tpa = c.w('pasa.');
      const mov = lt > tm ? 1 : 0;
      this.p.kneeR.rotation.x = Math.PI / 2 - mov * (.35 + .25 * Math.sin(lt * 5));
      this.p.pieR.rotation.set(mov * .5 * Math.sin(lt * 6), mov * .4 * Math.cos(lt * 6), 0);
      const fin = ease((lt - tpa + .3) / .8);
      const col = new THREE.Color(AZUL).lerp(new THREE.Color(PANTS), ease((lt - tm) / (tpa - tm))); tinte(this.p, col.getHex());
      gesto(this.p, fin > .5 ? 'feliz' : 'neutral');
      const wp = new THREE.Vector3(); const pts = []; [this.p.kneeR, this.p.pieR].forEach(o => { o.getWorldPosition(wp); pts.push([wp.x, wp.y, wp.z + .1]); });
      this.ch.update(pts, .22, lt, (1 - ease((lt - tm) / (tpa - tm + .2))) * .9);
      // dedo que dice "no" al pararse de golpe
      if (lt < tm) { pose(this.p, 'senalar', ease(lt / .4), lt); }
      camRig(lt, c.dur, [1.9, .9, 3.3], [1.5, 1.3, 3.8], [.15, lerp(.55, .85, ease((lt - 2.5) / 2)), .15], 46);
      if (lt > tg - .4 && lt < tm + .2) etiqueta('NO DE GOLPE', [-.35, 1.65, .2], lt - tg + .4, 46, '#ff6b5a', true);
      if (lt > tm) { etiqueta('MUEVE EL PIE', [.55, .75, .7], lt - tm, 48, '#f3c54d', true); c.ev('whoosh', tm, .4); }
      if (lt > tpa) c.ev('ding', tpa, .6);
      rotulo('El truco', 'mueve el pie y los dedos', lt - .05, 1330);
    }
  });
  // 6 · remate: sale del baño cojeando hacia la puerta
  escena('remate', {
    setup() { ambiente({ ...BANO, sunInt: 2.8 }); this.b = setBano({ acento: 0x3f8fa6 });
      this.p = persona({ pos: [.2, 0, .7], shirt: 0xe8a33d, pants: PANTS }); tinte(this.p, AZUL); gesto(this.p, 'triste'); this.ch = chispas(24, 0xfff27a); },
    update(lt, c) {
      const q = cl(lt / 3.2), x = lerp(.1, 2.2, q), z = lerp(.8, -.25, q);
      const paso = Math.sin(lt * 7);
      this.p.position.set(x, Math.abs(paso) * .05 * (paso > 0 ? 1 : .2), z); this.p.rotation.y = Math.atan2(2.1, -1.05) * .55;
      this.p.rotation.z = paso > 0 ? .1 * paso : 0;   // cojea: se ladea al pisar con la pierna dormida
      this.p.legL.rotation.x = -.45 * paso; this.p.legR.rotation.x = .12 * paso; this.p.kneeL.rotation.x = Math.max(0, paso) * .5;
      this.p.armL.rotation.x = .35 * paso; this.p.armR.rotation.set(-.3, 0, .35);
      this.b.puerta.rotation.y = -1.3 * ease(lt / 1);
      const wp = new THREE.Vector3(); this.p.kneeR.getWorldPosition(wp); this.ch.update([[wp.x, wp.y, wp.z]], .2, lt, .7);
      cam([lerp(-.9, -.3, ease(q)), 1.6, 4.9], [lerp(.6, 1.4, ease(q)), 1.0, 0], 46);
      if (lt > .6) etiqueta('COJEANDO', [x + .1, 2.25, z], lt - .6, 46, '#fff', true);
      rotulo('Mándaselo', 'a quien sale del baño cojeando', lt - c.w('Mándaselo'), 1330); c.ev('pop', 0, .5);
    }
  });
}
