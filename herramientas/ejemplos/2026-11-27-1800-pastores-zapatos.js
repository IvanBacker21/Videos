// Short 27-nov 18:00 · CARTULINA CHIBI · NAVIDAD CÓSMICA ep. 1: los pastores a Belén y sus zapatos rotos.
// Hace dos mil años los pastores de Judea usaban sandalias de cuero (suela + correas); se han hallado sandalias de época romana
// en cuevas del desierto de Judea (Qumrán, Cueva de las Cartas). Con piedras y kilómetros detrás de las ovejas se rompían.
// Fuentes: ibiblio Dead Sea Scrolls exhibit (leather), Center for Online Judaic Studies (sandalias de Qumrán y de época romana).
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-27-1800-pastores-zapatos.json OUT ../ejemplos/2026-11-27-1800-pastores-zapatos.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600;
  const desierto = (o = {}) => { const c = o.noche ? 0x2b3466 : 0xffe2b0;
    ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    PM.desierto(o); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const sinSombra = g => { g.traverse(m => { if (m.isMesh) m.castShadow = false; }); return g; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const pastor2 = pos => PM.pastor(pos, { ropa: 0x9bb0c9, franja: 0x3d5a80, tela: 0xe8dcc0, cinta: 0x2e7d5b, colPelo: 0x5a3420, escala: .78, mira: -1 });
  // nubecitas de polvo que salen de los pies y se deshacen. g.update(t, k)
  const polvo = (pos, n = 4) => { const g = group(pos), bs = [];
    for (let i = 0; i < n; i++) { const b = PM.pz(F.circ(.07), 0xe9cf9c, [0, 0, 0], g, { tinta: .008, papel: false }); b.f = i / n; bs.push(b); }
    g.update = (t, k = 1) => bs.forEach(b => { const u = (t * 1.4 + b.f) % 1; b.visible = k > .05; b.position.set(-u * .5, .05 + u * .18, 0); b.scale.setScalar(Math.max(.001, k * (.6 + u) * (1 - u))); });
    g.update(0, 0); return g; };

  // ---------- 1 · gancho: el pastorcito camina a Belén con la sandalia rota aleteando (notas y nieve ligera) ----------
  escena('gancho', {
    setup() { desierto();
      this.p = PM.pastor([-.3, .02, .3], { escala: .8, boca: 'abierta' });
      this.o1 = sinSombra(PM.oveja([.75, .02, .1], { escala: .5 })); this.o2 = sinSombra(PM.oveja([-1.25, .02, .1], { escala: .45 }));
      this.n = PM.notas({ n: 4, x: 0, y: 1.95, ancho: 1.8, alto: .6 }); this.cp = PM.copos({ n: 10, y0: .2, y1: 3.2 }); },
    update(lt, c) {
      const t = tw(lt), tz = c.w('zapatos') - .3, kz = ease(cl((t - tz) / .45));
      const x = lerp(-.45, .2, cl(t / 3.5));
      this.p.position.x = x; A.anda(this.p, t, 1, .02); this.p.cayadoRecto(); A.parpadea(this.p, t + 1.2, .3);
      this.p.boca(t < c.w('Belén') + .3 || t > tz + .3 ? 'abierta' : 'feliz'); A.preocupa(this.p, kz * .7);
      this.p.sandalias[1].rompe(1, t);
      [this.o1, this.o2].forEach((o, i) => { o.position.x = x + (i ? -.95 : 1.05); A.anda(o, t + i * .3, 1, .02); A.parpadea(o, t + i * 1.7, .5); o.bala(Math.sin(t * 2 + i) > .7 ? 1 : 0); });
      this.n.update(t, 1 - kz); this.cp.update(t, 1);
      c.ev('pop', .1, .4); if (t > tz) c.ev('crack', tz + .1, .5);
      // a "zapatos": la cámara baja a los pies para ver la sandalia rota
      cam([lerp(0, x + .1, kz), lerp(1.2, .62, kz), lerp(10.4, 5.4, kz)], [lerp(0, x + .1, kz), lerp(1.15, .6, kz), 0], 34);
      if (t > tz + .15) etiqueta('¿ZAPATOS ROTOS?', [x + .1, .75, .9], lt - tz - .15, 52, '#ff5b5b', true);
      rotulo('Navidad Cósmica', 'episodio 1', lt - .05, RY);
    }
  });

  // ---------- 2 · hace dos mil años: dos pastores con sus ovejas · zoom a las sandalias de cuero ----------
  escena('sandalias', {
    setup() { desierto();
      this.p = PM.pastor([-.5, .02, .3], { escala: .8, mira: 1 }); this.q = pastor2([.5, .02, .25]);
      this.o = sinSombra(PM.oveja([1.25, .02, 0], { escala: .42 })); this.o.scale.x = -.42;
      this.l = PM.letrero([0, 2.35, .6], 'HACE DOS MIL AÑOS', { w: 2.0, h: .44, color: 0xfff6e0, borde: 0xd4a24a, tinta: '#8a5a2b' }); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('sandalias') - .35, ks = ease(cl((t - ts) / .5)), tc = c.w('cuero') - .1;
      A.parpadea(this.p, t + .4, .5); A.parpadea(this.q, t + 1.9, 1.2); A.parpadea(this.o, t + .9, .3);
      this.p.position.y = .02 + Math.abs(Math.sin(t * 2.6)) * .015; this.q.position.y = .02 + Math.abs(Math.sin(t * 2.6 + 1)) * .015;
      this.p.boca(t < ts ? 'abierta' : 'feliz'); if (t < ts) habla(this.p, t); this.q.boca('feliz'); this.q.head.rotation.z = this.q.head.r0 + Math.sin(t * 2) * .05;
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + .1 + Math.sin(t * 2) * .05; this.p.cayadoRecto(); this.q.brazos[1].rotation.z = this.q.brazos[1].r0 + .15; this.q.cayadoRecto();
      this.o.position.y = .02 + Math.abs(Math.sin(t * 3)) * .01; this.o.bala(t > 1 && t < 1.5 ? 1 : 0); this.o.head.rotation.z = this.o.head.r0 + Math.sin(t * 3) * .06;
      // al acercarnos, el pastor presume su sandalia (levanta la punta del pie)
      const pie = this.p.piernas[1]; pie.rotation.z = pie.r0 + ks * (.25 + Math.sin(t * 5) * .1);
      this.l.scale.setScalar(Math.max(.001, pop(t, .1, .4) * (1 - cl(ks * 2.5)))); this.l.columpia?.(t, .05);
      c.ev('pop', .1, .5); if (t > ts) c.ev('whoosh', ts, .5); if (t > tc) c.ev('ding', tc, .5);
      cam([lerp(0, -.45, ks), lerp(1.2, .36, ks), lerp(10.4, 3.3, ks)], [lerp(0, -.45, ks), lerp(1.15, .32, ks), 0], 34);
      if (t > tc) etiqueta('DE CUERO', [-.45, .72, .9], lt - tc, 56, '#ffd640', true);
      rotulo('Hace dos mil años', 'sandalias de cuero', lt - .05, RY);
    }
  });

  // ---------- 3 · cueva del desierto: el arqueólogo ilumina y aparece una sandalia antigua: suela y correas, y ya ----------
  escena('cueva', {
    setup() { const C = 0x4a3324; ambiente({ top: C, bottom: C, fog: C, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
      PM.pz(F.rect(30, 30, 0), 0x5e4230, [0, 8, -4], null, { tinta: false, papel: false });
      // boca de la cueva al fondo (luz del desierto) y pared de roca alrededor
      const bc = PM.pz(F.poly([[-1.1, 0], [-1.05, 1.2], [-.7, 2.0], [0, 2.35], [.7, 2.0], [1.05, 1.2], [1.1, 0]]), 0xffe2b0, [1.2, .03, -3.6], null, { tinta: .03, papel: .12 });
      PM.det(F.poly([[-1.1, 0], [-1.1, .3], [-.4, .55], [.3, .4], [1.1, .7], [1.1, 0]]), 0xe7b96e, [0, 0, .02], bc); PM.det(F.circ(.2), 0xffc24a, [.45, 1.55, .02], bc);
      for (const [x, y, r, col] of [[-1.6, 2.8, 1.3, 0x6e4c36], [1.9, 3.6, 1.1, 0x6e4c36], [-.2, 3.9, 1.2, 0x664532], [-2.2, .9, .9, 0x664532], [2.6, 1.2, .8, 0x664532]])
        PM.pz(F.elipse(r, r * .8), col, [x, y, -3.2], null, { tinta: .02, papel: .06 });
      PM.pz(F.rect(30, 6, 0), 0x8a6a4a, [0, -2.95, -1.7], null, { tinta: false, papel: false });
      PM.pz(F.rect(30, .06, 0), 0x6e523a, [0, .03, -1.69], null, { tinta: false, papel: false });
      luces({ pos: [-3, 5, 8], hemi: 1.6, sol: 1.4, radio: 6 });
      // arqueólogo con sombrero y lámpara
      this.a = PM.chibi([-.7, .02, .3], { ropa: 0xc8b27a, pantalon: 0x7a5a3a, tenis: 0x5a4030, gorra: 0xb08850, lentes: 0x2b2f4a, mira: 1, escala: .78, boca: 'feliz' });
      const la = this.la = group([0, -.55, .1], this.a.brazos[0]);
      PM.pz(F.arco(.1, .025, 0, Math.PI), 0x3a3f55, [0, .2, 0], la, { tinta: .008, papel: false });
      PM.pz(F.rect(.2, .26, .04), 0x3a3f55, [0, 0, 0], la, { tinta: .012, papel: .03 }); PM.det(F.rect(.14, .18, .02), 0xffe27a, [0, 0, .016], la);
      this.luz = new THREE.Mesh(new THREE.CircleGeometry(.75, 48), new THREE.MeshBasicMaterial({ color: 0xffe27a, transparent: true, opacity: .2, depthWrite: false }));
      this.luz.position.set(0, 0, .05); la.add(this.luz);
      // montoncito de arena y la sandalia antigua
      PM.pz(F.elipse(.75, .16), 0xc9a26e, [.55, .04, .35], null, { tinta: .014, papel: .04 });
      this.s = PM.sandalia([.55, .1, .5], { pie: false, vista: 'arriba', cuero: 0xc08a52, correas: 0x6a3f1f, s: 1.9 }); sinSombra(this.s); },
    update(lt, c) {
      const t = tw(lt), th = c.w('hallado') - .2, tsu = c.w('suela') - .1, tco = c.w('correas') - .1, tya = c.w('ya.') - .1;
      const kh = ease(cl((t - th) / .6));
      A.parpadea(this.a, t + .8, .4); this.a.position.y = .02 + Math.abs(Math.sin(t * 2.6)) * .015;
      const bl = this.a.brazos[0]; bl.rotation.z = bl.r0 - lerp(.6, 1.5, kh) + Math.sin(t * 2.2) * .06; this.la.rotation.z = -bl.rotation.z;
      this.luz.material.opacity = .18 + .05 * Math.sin(t * 6);
      const br = this.a.brazos[1]; br.rotation.z = br.r0 + (t > tsu ? .6 + .1 * Math.sin(t * 4) : .1);
      this.a.boca(t > th && t < th + 1.2 ? 'abierta' : (t > tsu ? 'abierta' : 'feliz')); A.ladea(this.a, kh * .3, 1);
      // la sandalia sube del montón de arena y flota girando poquito
      this.s.position.y = lerp(.25, 1.15, kh) + Math.sin(t * 2.4) * .03 * kh; this.s.rotation.z = Math.sin(t * 1.8) * .06 * kh;
      if (t > tya) { const u = cl((t - tya) / .3); this.s.position.y += Math.sin(u * Math.PI) * .18; }
      c.ev('whoosh', .05, .5); if (t > th) c.ev('ding', th + .2, .6); if (t > tsu) c.ev('pop', tsu, .5); if (t > tco) c.ev('pop', tco, .5); if (t > tya) c.ev('ding', tya, .5);
      cam([.1, 1.2, lerp(9.6, 9.0, ease(cl(lt / 5.3)))], [.1, 1.1, 0], 34);
      if (t > tsu) etiqueta('SUELA', [.95, .65, .9], lt - tsu, 44, '#ffffff', true);
      if (t > tco) etiqueta('CORREAS', [.15, 1.55, .9], lt - tco, 44, '#ffd640', true);
      if (t > tya) etiqueta('¡Y YA!', [0, 2.45, .9], lt - tya, 60, '#ff5b5b', true);
      rotulo('Halladas en cuevas', 'del desierto', lt - .05, RY);
    }
  });

  // ---------- 4 · el camino: piedras, polvo y kilómetros detrás de las ovejas… ¡CRAC! se rompe la correa ----------
  escena('camino', {
    setup() { desierto();
      this.p = PM.pastor([-.25, .02, .3], { escala: .8, mira: 1 }); this.o = sinSombra(PM.oveja([.85, .02, .1], { escala: .5 }));
      this.pd = []; for (let i = 0; i < 7; i++) { const r = PM.pz(F.elipse(.09 + (i % 3) * .03, .06 + (i % 2) * .02), [0xa88d72, 0x9a8068, 0xb8a084][i % 3], [0, .04, .7], null, { tinta: .01, papel: .03 }); r.f = i / 7; this.pd.push(r); }
      this.po = polvo([-.25, .02, .4]); },
    update(lt, c) {
      const t = tw(lt), tr = c.w('rompían') - .1, kr = ease(cl((t - tr) / .25)), on = 1 - ease(cl((t - tr) / .2));
      const tp = c.w('piedras') - .1, tpo = c.w('polvo') - .1, tk = c.w('kilómetros') - .1, tov = c.w('ovejas') - .1;
      A.anda(this.p, t, on, .02); A.parpadea(this.p, t + .6, .4);
      const bl = this.p.brazos[0]; if (kr > 0) { bl.rotation.z = bl.r0 - lerp(.4, 2.55, kr); A.preocupa(this.p, kr); }
      this.p.cayadoRecto(); this.p.boca(kr > .3 ? 'apretada' : (t > 2.9 ? 'abierta' : 'feliz'));
      this.p.sandalias[1].rompe(kr, t);
      A.anda(this.o, t + .2, on, .02); A.parpadea(this.o, t + 1.5, .9); this.o.bala(kr > .2 ? 1 : (Math.sin(t * 2) > .8 ? 1 : 0)); this.o.position.x = .85 + kr * .15;
      // piedritas que pasan (el camino corre hacia la izquierda) y polvo en los pies
      this.pd.forEach(r => { const u = ((t * .35 * on + r.f + kr * .02) % 1 + 1) % 1; r.position.x = 1.8 - u * 3.6; r.position.z = .7 - (r.f > .5 ? .25 : 0); });
      this.po.update(t, on * cl((t - tpo) / .3)); this.po.position.x = this.p.position.x - .05;
      if (t > tp) c.ev('pop', tp, .4); if (t > tpo) c.ev('whoosh', tpo, .4); if (t > tk) c.ev('pop', tk, .4); if (t > tr) c.ev('crack', tr, .6);
      cam([0, lerp(1.2, .75, kr), lerp(10.2, 6.4, kr)], [0, lerp(1.15, .72, kr), 0], 34);
      const lab = t < tpo ? ['PIEDRAS', '#ffffff', tp] : t < tk ? ['POLVO', '#ffd640', tpo] : t < tov ? ['KILÓMETROS', '#2ec4a6', tk] : ['DETRÁS DE LAS OVEJAS', '#ffffff', tov];
      if (t < tr && t > tp) etiqueta(lab[0], [0, 2.45, .9], lt - lab[2], 50, lab[1], true);
      if (t > tr) etiqueta('¡CRAC!', [.15, 1.55, .9], lt - tr, 64, '#ff5b5b', true);
      if (t < tr - .7) rotulo('Piedras, polvo', 'y kilómetros', lt - .05, RY); else rotulo('¡Con razón', 'se les rompían!', lt - (tr - .7), RY);
    }
  });

  // ---------- 5 · remate A o B: ¿te sabes completo el villancico o solo esa parte? ----------
  escena('remate', {
    setup() { desierto({ noche: true });
      this.p = PM.chibi([0, .02, .3], { logo: true, boca: 'abierta', escala: .8 });
      this.o = sinSombra(PM.oveja([1.05, .02, .1], { escala: .45 })); this.o.scale.x = -.45;
      this.n = PM.notas({ n: 4, x: 0, y: 2.2, ancho: 2.2, alto: .5 }); this.cp = PM.copos({ n: 10, y0: .2, y1: 3.2 });
      this.ls = [[0, 'ME LO SÉ COMPLETO', 0x2e7d5b, '#1f6b4a'], [1, 'SOLO ESA PARTE', 0xc0392b, '#b02a1e']].map(([i, tx, b, ti]) => { const br = this.p.brazos[i];
        const h = group([0, -.5, .08], br); PM.pz(F.rect(.06, 1.0, .02), 0xc8a06a, [0, .5, -.01], h, { tinta: .008, papel: false });
        const L = PM.letrero([0, 1.2, .02], tx, { w: 1.5, h: .62, hilos: false, color: 0xffffff, borde: b, tinta: ti }, h); h.L = L; return h; }); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('completo') - .2, tb = c.w('solo') - .15;
      A.parpadea(this.p, t + 1.1, .4); this.p.position.y = .02 + Math.abs(Math.sin(t * 2.6)) * .015;
      const th = [ta, tb]; this.ls.forEach((h, i) => { const br = this.p.brazos[i], s = i ? 1 : -1, k = ease(cl((t - th[i] + .15) / .3));
        br.rotation.z = br.r0 + s * lerp(.15, 1.9, k) + Math.sin(t * 5 + i) * .04 * k; h.rotation.z = -br.rotation.z - s * .5 * k; h.visible = k > .02; h.L.scale.setScalar(pop(t, th[i], .35)); h.L.rotation.z = s * .5 * k + Math.sin(t * 3 + i * 2) * .04; });
      A.ladea(this.p, t > ta ? .35 + .1 * Math.sin(t * 3) : 0, t < tb ? -1 : 1); A.preocupa(this.p, t > ta ? .6 : 0);
      this.p.boca(t > tb + .6 ? 'apretada' : 'abierta'); if (t < ta) habla(this.p, t);
      A.parpadea(this.o, t + .5, .8); this.o.head.rotation.z = this.o.head.r0 + Math.sin(t * 3) * .06; this.o.bala(t > tb + .3 ? 1 : 0);
      this.n.update(t, 1); this.cp.update(t, 1);
      if (t > ta) c.ev('pop', ta, .6); if (t > tb) c.ev('pop', tb, .6);
      cam([0, 1.2, lerp(10.4, 10.0, ease(cl(lt / 3.4)))], [0, 1.15, 0], 34);
      rotulo('¿Completo', 'o solo esa parte?', lt - .05, RY);
    }
  });
  P.cierre();
}
