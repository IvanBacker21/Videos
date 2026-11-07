// Short 3D: ¿Por qué lloras al picar cebolla? (+2 trucos)
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-06-2130-cebolla.json OUT ../ejemplos/2026-11-06-2130-cebolla.js
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, mat, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    AMB, setCocina, gesto, hablar, pose } = E;
  const COC = { ...AMB.cuartoDia, top: 0x5a6f98, bottom: 0xf0b884, fog: 0xd8b996, near: 6, far: 24 };
  const ISLA = .92, ZI = 0;   // cubierta de la isla y su z

  // ---------- utilería ----------
  function isla() {
    const g = group([0, 0, ZI]); box(1.8, ISLA - .04, .8, 0x8a5a36, [0, (ISLA - .04) / 2, 0], g); box(1.9, .06, .9, 0xe9e2d6, [0, ISLA - .03, 0], g);
    const tabla = box(.75, .04, .45, 0xc89a62, [0, ISLA + .02, .05], g); return { g, tabla };
  }
  // Cebolla blanca entera (origen en la base)
  function cebolla(pos, s = 1, parent) {
    const g = group(pos, parent); g.scale.setScalar(s);
    const b = ball(.13, 0xf1e4c8, [0, .12, 0], g, 1); b.scale.set(1, .9, 1);
    cyl(.004, .02, .07, 0xb89a62, [0, .26, 0], g, 6); cyl(.02, .015, .02, 0xc9b48a, [0, .005, 0], g, 6);
    for (let k = 0; k < 6; k++) { const l = box(.006, .2, .004, 0xd9c79f, [Math.cos(k) * .128, .12, Math.sin(k) * .128], g); l.rotation.y = -k; }
    return g;
  }
  // Media cebolla con la cara cortada hacia arriba: anillos concéntricos
  function mediaCebolla(pos, s = 1, parent) {
    const g = group(pos, parent); g.scale.setScalar(s);
    const geo = new THREE.SphereGeometry(.13, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2);
    const m = new THREE.Mesh(geo, mat(0xf1e4c8)); m.position.y = .12; m.castShadow = true; g.add(m);
    for (let k = 0; k < 5; k++) { const r = .13 - k * .025; cyl(r, r, .004 + k * .001, k % 2 ? 0xfaf5e8 : 0xe9e6c4, [0, .12 + k * .001, 0], g, 16); }
    g.cara = .12 + .006; return g;
  }
  function cuchillo(parent, pos, filo = true) {
    const g = group(pos, parent);
    box(.03, .1, .035, 0x3a2a20, [0, 0, 0], g);                                   // mango
    g.hoja = box(.008, .26, .055, filo ? 0xdfe6ec : 0x8d9296, [0, -.17, .008], g, { metal: filo ? .6 : .1, rough: filo ? .25 : .9 });
    if (filo) box(.004, .26, .006, 0xffffff, [0, -.17, .036], g, { emissive: 0xffffff, ei: .6 });   // filo brillante
    return g;
  }
  // Gas: partículas que suben por un camino curvo de a → b. update(lt, on 0..1)
  function gas(a, b, n = 26, color = 0xd9ffb0) {
    const ps = Array.from({ length: n }, (_, k) => { const p = ball(.018 + (k % 3) * .008, color, [0, 0, 0], null, 0, { emissive: color, ei: .8, opacity: .55 });
      p.material.depthWrite = false; p.castShadow = false; p.visible = false; return p; });
    return { ps, update(lt, on = 1, vel = .35) {
      ps.forEach((p, k) => { const ph = ((lt * vel + k / n) % 1 + 1) % 1; p.visible = on > 0 && ph < on + .02 && lt * vel > k / n * .5;
        const w = Math.sin(ph * 9 + k) * .06 * (1 + ph);
        p.position.set(lerp(a[0], b[0], ph) + w, lerp(a[1], b[1], ease(ph)), lerp(a[2], b[2], ph) + Math.cos(ph * 7 + k) * .05);
        p.scale.setScalar(.6 + ph * 1.4); p.material.opacity = .65 * Math.sin(Math.PI * Math.min(1, ph * 1.1)); }); } };
  }
  // Lágrimas que escurren desde los ojos de una persona (en coords de la cabeza)
  function lagrimas(p, n = 3) {
    return Array.from({ length: n * 2 }, (_, k) => { const d = ball(.022, 0x7fd0ff, [0, 0, 0], p.head, 0, { emissive: 0x3aa0ff, ei: .6, opacity: .9 }); d.scale.set(.8, 1.3, .8); d.castShadow = false; d.visible = false; d.k = k; return d; });
  }
  function llorar(ls, lt, on = 1) {
    ls.forEach(d => { const lado = d.k % 2 ? 1 : -1, ph = ((lt * .9 + Math.floor(d.k / 2) / 3) % 1);
      d.visible = on > 0; d.position.set(lado * (.1 + ph * .02), .0 - ph * .3, .2 + ph * .01); d.material.opacity = .9 * (1 - ph * .6); });
  }
  // Persona picando: brazo derecho al frente con cuchillo que sube y baja
  function cocinero(o = {}) {
    const p = persona({ pos: [0, 0, ZI - .7], shirt: o.shirt ?? 0xe0604a, pelo: o.pelo, hair: o.hair });
    box(.62, .7, .02, 0xf4efe6, [0, 1.1, .17], p);   // mandil
    p.cu = cuchillo(p.armR, [0, -.78, .06]); p.cu.rotation.x = Math.PI / 2;
    return p;
  }
  function picar(p, lt, vel = 3.2, k = 1) {
    const s = Math.abs(Math.sin(lt * vel * Math.PI));
    p.armR.rotation.x = -1.05 + .32 * s * k; p.armR.rotation.z = .25;
    p.armL.rotation.x = -.95; p.armL.rotation.z = -.35;
    p.head.rotation.x = .38;
    return s;
  }
  function pico(pos) {   // tazón de pico de gallo: jitomate, cebolla, chile, cilantro
    const g = group(pos); cyl(.2, .13, .12, 0xd9733f, [0, .06, 0], g, 14); cyl(.18, .18, .02, 0x8a2a1c, [0, .11, 0], g, 14);
    for (let k = 0; k < 22; k++) { const a = k * 2.3, r = .04 + (k % 5) * .025; box(.035, .03, .035, [0xe23b2e, 0xf6f1e4, 0x3f9a3a, 0x6fc24a][k % 4], [Math.cos(a) * r, .13 + (k % 3) * .01, Math.sin(a) * r], g); }
    return g;
  }

  // 1 · gancho: alguien pica cebolla y llora a mares
  escena('gancho', {
    setup() { ambiente(COC); this.k = setCocina({ acento: 0x4f8a7a }); const is = isla();
      this.p = cocinero(); gesto(this.p, 'triste'); this.ls = lagrimas(this.p);
      this.ceb = mediaCebolla([-.08, ISLA + .04, ZI + .05], 1.5); this.ent = cebolla([.55, ISLA, ZI + .1], 1.3);
      this.g = gas([-.05, ISLA + .25, ZI + .05], [0, 1.9, ZI - .45], 20); },
    update(lt, c) {
      const s = picar(this.p, lt); if (s > .97) c.ev('click', Math.round(lt * 3.2) / 3.2, .35);
      llorar(this.ls, lt, 1); this.g.update(lt, 1, .5);
      this.p.head.rotation.x = .3 + Math.sin(lt * 7) * .03;
      const q = ease(lt / 5);
      cam([lerp(.9, .45, q), lerp(1.75, 1.85, q), lerp(2.9, 1.9, q)], [0, lerp(1.45, 1.6, q), ZI - .45], 46);
      if (lt < c.f(1)) { rotulo('¿Por qué lloras?', 'al picar cebolla', lt - .15, 1330); c.ev('pop', .15); }
      else { rotulo('2 trucos', 'para no llorar · al final', lt - c.f(1), 1330); c.ev('ding', c.f(1), .6); }
    }
  });
  // 2 · gas: corte en primer plano, las células se rompen y sale el gas
  escena('gas', {
    setup() { ambiente(COC); setCocina(); isla();
      this.m = mediaCebolla([0, ISLA + .04, ZI + .05], 2.2);
      this.cu = cuchillo(null, [.0, 0, 0]);
      this.cel = []; for (let x = -3; x <= 3; x++) for (let z = -3; z <= 3; z++) if (x * x + z * z <= 9) {
        const b = box(.032, .016, .032, 0xeaf7c8, [x * .04, ISLA + .04 + this.m.cara * 2.2 + .01, ZI + .05 + z * .04], null, { emissive: 0xc8f08a, ei: .3 }); b.d = Math.hypot(x, z); this.cel.push(b); }
      this.g = gas([0, ISLA + .35, ZI + .05], [-.1, 2.1, ZI + .3], 30); },
    update(lt, c) {
      const tr = c.w('rompes'), tg = c.w('gas');
      // cuchillo baja y corta
      const cut = lt < tr ? ease(lt / Math.max(.1, tr)) : 1;
      this.cu.position.set(.03, lerp(ISLA + .95, ISLA + .58, cut), ZI + .05); this.cu.rotation.set(0, Math.PI / 2, 0);
      // células que se rompen en onda desde el centro
      this.cel.forEach(b => { const t = lt - tr - b.d * .06; const s = t < 0 ? 1 : Math.max(.01, 1 + spring(t / .3) * .5 - eout(t / .5) * 1.3);
        b.scale.set(s, 1, s); b.material.emissiveIntensity = t > 0 && t < .4 ? 1.4 : .3; });
      if (lt > tr) c.ev('crack', tr, .6);
      this.g.update(Math.max(0, lt - tg + .3), cl((lt - tg + .3) / 1.2), .45);
      const q = einout(cl((lt - .4) / (c.dur - .4)));
      cam([lerp(.55, .7, q), lerp(1.45, 2.05, q), lerp(1.0, 1.45, q)], [0, lerp(ISLA + .25, 1.55, q), ZI + .05], 46);
      if (lt > tr) etiqueta('CÉLULAS ROTAS', [.2, ISLA + .5, ZI + .3], lt - tr, 46, '#fff', true);
      rotulo('Un gas invisible', 'que sube a tu cara', lt - tg, 1330); if (lt > tg) c.ev('whoosh', tg, .5);
    }
  });
  // 3 · ojos: el gas llega a los ojos, pica, y salen lágrimas para lavarlo
  escena('ojos', {
    setup() { ambiente(COC); setCocina(); isla();
      this.p = cocinero(); this.ls = lagrimas(this.p, 4);
      this.g = gas([0, ISLA + .2, ZI + .05], [0, 1.95, ZI - .5], 30);
      this.ring = new THREE.Mesh(new THREE.TorusGeometry(.13, .01, 6, 24), mat(0xff5a4a, { emissive: 0xff3a2a, ei: .8, opacity: .8 }));
      this.ring.position.set(0, 1.95, ZI - .45); this.ring.scale.set(1.6, .7, 1); E.world.add(this.ring); },
    update(lt, c) {
      const tp = c.w('pica'), tl = c.w('lágrimas');
      picar(this.p, lt, 1.0, .25); this.p.head.rotation.x = .12;
      this.g.update(lt, 1, .55);
      gesto(this.p, lt > tp ? 'triste' : 'neutral');
      // parpadeo rápido cuando pica
      const blink = lt > tp && lt < tl + 1 ? (Math.sin(lt * 26) > .3 ? .25 : 1) : 1;
      this.p.head.children.filter(o => o.geometry && o.geometry.parameters.width === .05).forEach(o => o.scale.y = blink);
      llorar(this.ls, lt - tl, lt > tl ? 1 : 0);
      const pr = lt - tp; this.ring.visible = pr > 0 && pr < 1.6; this.ring.scale.set(1.6 + Math.sin(lt * 14) * .1, .7, 1); this.ring.material.opacity = .8 * (1 - cl(pr / 1.6));
      if (lt > tp) c.ev('zap', tp, .5); if (lt > tl) c.ev('pop', tl, .5);
      const q = ease(lt / c.dur);
      cam([lerp(.75, .45, q), lerp(1.8, 1.88, q), lerp(1.7, 1.25, q)], [0, 1.8, ZI - .7], 46);
      if (lt > tp) etiqueta('¡PICA!', [.32, 2.05, ZI - .5], pr, 60, '#ff6b5a', true);
      rotulo('Lágrimas', 'para lavar tus ojos', lt - tl, 1330);
    }
  });
  // 4 · truco 1: afilado y despacio vs. sin filo que aplasta y salpica
  escena('cuchillo', {
    setup() { ambiente({ ...COC, top: 0x41557d }); setCocina(); const is = isla(); is.tabla.scale.set(2.2, 1, 1.3);
      this.a = mediaCebolla([-.24, ISLA + .04, ZI + .05], 1.3); this.b = mediaCebolla([.24, ISLA + .04, ZI + .05], 1.3);
      this.ka = cuchillo(null, [0, 0, 0], true); this.kb = cuchillo(null, [0, 0, 0], false);
      [this.ka, this.kb].forEach(k => { k.scale.setScalar(1.3); k.rotation.set(0, Math.PI / 2, 0); });
      this.ga = gas([-.24, ISLA + .25, ZI + .05], [-.28, ISLA + .8, ZI + .1], 5, 0xd9ffb0);
      this.gotas = Array.from({ length: 22 }, (_, k) => { const d = ball(.016, 0xe8ffc0, [0, 0, 0], null, 0, { emissive: 0xc8f08a, ei: .8, opacity: .85 }); d.castShadow = false; d.visible = false; d.k = k; return d; }); },
    update(lt, c) {
      const ts = c.w('sin');
      // afilado: corta lento todo el tiempo
      const ca = (Math.sin(lt * 1.4) * .5 + .5);
      this.ka.position.set(-.22, ISLA + .58 + ca * .25, ZI + .05);
      this.ga.update(lt, .5, .4);
      // sin filo: entra en "sin" y aplasta
      const pb = lt - ts, ab = pb < 0 ? 0 : ease(pb / .5);
      this.kb.position.set(.26, lerp(ISLA + 1.0, ISLA + .5, ab), ZI + .05);
      const sq = pb < 0 ? 1 : 1 - .35 * ab + .08 * Math.exp(-pb * 6) * Math.sin(pb * 30);
      this.b.scale.set(1.3 * (2 - sq), 1.3 * sq, 1.3 * (2 - sq));
      this.gotas.forEach(d => { const t = pb - .35 - (d.k % 4) * .08; d.visible = t > 0 && t < 1.5; if (!d.visible) return;
        const a = d.k * 2.39, v = .9 + (d.k % 5) * .25; d.position.set(.24 + Math.cos(a) * v * t * .5, ISLA + .25 + v * t * 1.4 - 2.2 * t * t, ZI + .05 + Math.sin(a) * v * t * .4); });
      if (pb > .35) c.ev('crack', ts + .35, .7);
      const q = ease(lt / c.dur);
      cam([lerp(0, .1, q), lerp(1.7, 1.6, q), lerp(2.3, 2.0, q)], [0, ISLA + .35, ZI], 46);
      etiqueta('AFILADO', [-.25, ISLA + .3, ZI + .3], lt - .3, 50, '#f3c54d', true);
      if (lt > ts) etiqueta('SIN FILO', [.25, ISLA + .3, ZI + .3], pb, 50, '#ff6b5a', true);
      rotulo('Truco 1', 'cuchillo afilado y despacio', lt - c.w('truco'), 1330); c.ev('ding', c.w('truco'), .6);
    }
  });
  // 5 · truco 2: al refri media hora antes
  escena('refri', {
    setup() { ambiente(COC); this.k = setCocina({ acento: 0x3f6f9a });
      this.c = cebolla([0, .85, .12], 1.1, this.k.refri.g);
      this.esc = Array.from({ length: 14 }, (_, k) => { const s = box(.025, .025, .025, 0xffffff, [0, 0, 0], this.k.refri.g, { emissive: 0xcfefff, ei: 1 }); s.castShadow = false; s.k = k; return s; }); },
    update(lt, c) {
      const tr = c.w('refri'), tf = c.w('fría');
      this.k.refri.puerta.rotation.y = -1.9 * eout(cl((lt - tr + .4) / .8));
      if (lt > tr - .4) c.ev('whoosh', tr - .4, .5);
      // escarcha que brilla alrededor de la cebolla
      this.esc.forEach(s => { const a = s.k * .45 + lt * .8, r = .2 + (s.k % 3) * .04; s.position.set(Math.cos(a) * r, .97 + Math.sin(a * 1.7) * .1, .12 + Math.sin(a) * r * .5); s.rotation.set(lt * 2, s.k, lt); s.visible = lt > tr; });
      this.c.scale.setScalar(1.1 + .04 * Math.sin(lt * 3));
      const q = einout(lt / c.dur);
      cam([lerp(1.0, 2.2, q), lerp(1.6, 1.35, q), lerp(2.6, 1.0, q)], [lerp(1.9, 2.95, q), lerp(1.2, .95, q), -1.5], 48);
      if (lt > tr + .5) etiqueta('MEDIA HORA', [2.85, 1.45, -1.2], lt - tr - .5, 54, '#9fdcff', true);
      if (lt > tf) etiqueta('MENOS GAS', [2.85, .72, -1.2], lt - tf, 50, '#f3c54d', true);
      rotulo('Truco 2', 'al refri media hora antes', lt - c.w('truco'), 1330); c.ev('ding', c.w('truco'), .6);
    }
  });
  // 6 · remate: ahora pica feliz y sin lágrimas, con su pico de gallo
  escena('remate', {
    setup() { ambiente({ ...COC, sunInt: 2.9 }); setCocina(); isla();
      this.p = cocinero({ shirt: 0x5b8fd6, pelo: 'largo', hair: 0x2a1c14 }); gesto(this.p, 'feliz');
      this.m = mediaCebolla([-.08, ISLA + .04, ZI + .05], 1.5); this.pg = pico([.45, ISLA, ZI + .15]); },
    update(lt, c) {
      const tm = c.w('mándaselo');
      if (lt < 1.4) picar(this.p, lt, 2.4); else { pose(this.p, 'brazosArriba', ease((lt - 1.4) / .4), lt); this.p.head.rotation.x = 0; }
      if (lt > 1.4) c.ev('pop', 1.4, .5);
      this.pg.rotation.y = lt * .4;
      const q = ease(lt / c.dur);
      cam([lerp(-.9, -.4, q), lerp(1.7, 1.75, q), lerp(2.6, 2.3, q)], [.1, 1.3, ZI - .3], 46);
      etiqueta('PICO DE GALLO', [.3, ISLA + .34, ZI + .15], lt - c.w('pico'), 46, '#fff', true);
      rotulo('Mándaselo', 'a quien llora con la salsa', lt - tm, 1330); if (lt > tm) c.ev('pop', tm);
    }
  });
}
