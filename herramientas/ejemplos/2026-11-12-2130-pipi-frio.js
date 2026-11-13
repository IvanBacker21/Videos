// Short 12-nov 21:30 · CARTULINA CHIBI: ¿Por qué con el frío te dan más ganas de ir al baño? (diuresis por frío)
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-12-2130-pipi-frio.json OUT ../ejemplos/2026-11-12-2130-pipi-frio.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xbfe3f5, ROJO = 0xe0414f;
  const set = () => { ambiente({ top: CIELO, bottom: CIELO, fog: CIELO, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, fase = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + fase) * .05; };
  const flota = (g, t, y0, f = 0, a = .06) => g.position.y = y0 + Math.sin(t * 2.2 + f) * a;
  // piernas cruzadas de "ya no aguanto" (k 0→1) con bailecito
  const aguanta = (p, t, k) => { p.piernas[0].rotation.z = p.piernas[0].r0 - .2 * k + Math.sin(t * 9) * .06 * k; p.piernas[1].rotation.z = p.piernas[1].r0 + .2 * k - Math.sin(t * 9) * .06 * k; };
  const gotaPiel = () => { const g = PM.pz(F.gota(.15), 0x8fd3ff, [0, 0, 0], null, { tinta: .01, papel: .02 }); g.visible = false; return g; };
  const sudor = (g, p, t, on, x = .42) => { g.visible = on; if (!on) return; const k = (t * .8) % 1; g.position.set(p.position.x + x * (p.es ?? 1), p.position.y + (2.05 - k * .35) * (p.es ?? 1), .7); g.scale.setScalar(.8 + .2 * Math.sin(k * Math.PI)); };
  const corazones = () => [0, 1, 2].map(i => { const c = PM.pz(F.corazon(.4), 0xff5d8f, [0, 0, .6], null, { tinta: .015, papel: .04 }); c.visible = false; c.i = i; return c; });
  const animaCorazones = (cs, t, x0, y0, sep = .3, sube = .5) => cs.forEach(c => { const k = ((t * .9 + c.i / 3) % 1); c.visible = true; c.position.set(x0 + (c.i - 1) * sep + Math.sin(k * 6 + c.i * 2) * .08, y0 + k * sube, .6); c.scale.setScalar(Math.sin(k * Math.PI) * .8 + .05); });
  const senal = (pos) => { const g = group(pos); PM.pz(F.rect(.08, 1.45, .03), 0x9a6a42, [0, -.75, -.05], g, { tinta: .016, papel: .05 }); g.l = PM.letrero([0, 0, 0], 'BAÑO', { w: .78, h: .34, borde: 0x3d6bff, hilos: false }, g);
    PM.pz(F.poly([[0, .1], [.16, 0], [0, -.1]]), 0x3d6bff, [.47, 0, .02], g, { tinta: .012, papel: .03 }); return g; };
  const vaso = (padre) => { const v = group([0, -.6, .12], padre); PM.pz(F.poly([[-.11, .17], [.11, .17], [.085, -.17], [-.085, -.17]]), 0xe6f6ff, [0, 0, 0], v, { tinta: .014, papel: .04 });
    PM.det(F.poly([[-.1, .06], [.1, .06], [.085, -.15], [-.085, -.15]]), 0x6cc4ff, [0, 0, .016], v); PM.det(F.rect(.03, .2, .01), 0xffffff, [-.05, 0, .02], v); return v; };

  // ---------- 1 · gancho: hace frío, tiembla y ya anda buscando el baño ----------
  escena('gancho', {
    setup() { set(); this.cp = PM.copos({ n: 16, x0: -1.5, x1: 1.5, y0: .0, y1: 2.9 });
      this.p = PM.chibi([-.42, .02, .3], { logo: true, boca: 'apretada', mira: 1 });
      this.s = senal([.86, 1.5, .1]); this.q = PM.pregunta([.2, 2.35, .7], .6); this.su = gotaPiel(); },
    update(lt, c) {
      const t = tw(lt), tb = c.w('baño?') - .25; this.cp.update(t);
      A.parpadea(this.p, t, .6); A.preocupa(this.p, 1); A.tiembla(this.p, t, 1, -.42); aguanta(this.p, t, 1);
      this.p.boca(t > tb ? 'abierta' : 'apretada'); this.p.head.rotation.z = this.p.head.r0 - .1 + Math.sin(t * 5) * .04;
      this.p.brazos[0].rotation.z = .35 + Math.sin(t * 40) * .03; this.p.brazos[1].rotation.z = -.35 - Math.sin(t * 40) * .03;   // se abraza de frío
      sudor(this.su, this.p, t, true);
      this.s.scale.setScalar(pop(t, -.4, .35)); this.s.l.columpia(t, .04);
      this.q.scale.setScalar(pop(t, tb + .05) * .6); this.q.rotation.z = Math.sin(t * 4) * .15;
      c.ev('pop', .15, .5); if (t > tb) c.ev('pop', tb + .05, .5);
      cam([.05, 1.2, lerp(10.9, 10.4, ease(lt / 3.7))], [.05, 1.15, 0], 34);
      etiqueta('BRRR…', [-.42, -.2, .7], lt - .2, 56, '#ffffff', true);
      rotulo('¿Por qué con frío', 'te dan más ganas de ir al baño?', lt - .1, RY);
    }
  });

  // ---------- 2 · las venitas de la piel se cierran para no perder calor ----------
  escena('venas', {
    setup() { set(); this.cp = PM.copos({ n: 10, x0: -1.5, x1: -.1, y0: .0, y1: 2.9 });
      this.p = PM.chibi([-.82, .02, .3], { logo: true, boca: 'apretada', mira: 1, escala: .82 });
      this.lu = PM.lupa([.55, 1.45, .4], .68); const d = this.lu.dentro;
      this.vena = group([0, 0, 0], d); PM.pz(F.rect(1.2, .36, .18), 0xc8323f, [0, 0, 0], this.vena, { tinta: .012, papel: false }); PM.det(F.rect(1.2, .12, .06), 0xe66a74, [0, .07, .016], this.vena);
      this.gl = []; for (let i = 0; i < 6; i++) { const g = PM.pz(F.elipse(.08, .06), 0xff5d6a, [0, 0, .04], d, { tinta: .008, papel: false }); g.i = i; this.gl.push(g); }
      this.fl = [1, -1].map(s => { const g = PM.pz(F.poly([[-.1, 0], [.1, 0], [0, -.14]]), 0x3d6bff, [0, s * .42, .05], d, { tinta: .01, papel: false }); g.rotation.z = s > 0 ? 0 : Math.PI; g.s = s; return g; });
      this.su = gotaPiel(); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('piel') - .2, tc = c.w('cierran') - .2, tk = c.w('calor.') - .2; this.cp.update(t);
      A.parpadea(this.p, t, 1.9); A.preocupa(this.p, .8); A.tiembla(this.p, t, .8, -.82); this.p.boca(t > tc ? 'abierta' : 'apretada');
      this.p.brazos[0].rotation.z = .3; this.p.brazos[1].rotation.z = -.3 + Math.sin(t * 40) * .03; sudor(this.su, this.p, t, false);
      this.lu.scale.setScalar(pop(t, tp - .5, .4)); this.lu.rotation.z = Math.sin(t * 1.8) * .03;
      const k = eout(cl((t - tc) / .5)); this.vena.scale.y = 1 - .62 * k;
      this.gl.forEach(g => { const u = ((t * (.5 - .3 * k) + g.i / 6) % 1); g.position.set(-.55 + u * 1.1, Math.sin(g.i * 2.1) * .06 * (1 - k), .04); g.scale.setScalar(1 - .35 * k); });
      this.fl.forEach(g => { g.visible = t > tc; g.position.y = g.s * lerp(.42, .2, k) + g.s * Math.sin(t * 8) * .02; });
      if (t > tc) c.ev('whoosh', tc, .5); c.ev('pop', tp - .5, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tp - .2) etiqueta('VENITAS DE LA PIEL', [.5, .45, .7], lt - tp + .2, 46, '#ffffff', true);
      if (t > tc) etiqueta('¡SE CIERRAN!', [.5, -.15, .7], lt - tc, 56, '#ffd640', true);
      if (t < tk) rotulo('Las venitas se cierran', 'para no perder calor', lt - .1, RY); else rotulo('Las venitas se cierran', 'para no perder calor', lt - .1, RY);
    }
  });

  // ---------- 3 · la sangre se va al centro y el cuerpo cree que sobra líquido ----------
  escena('centro', {
    setup() { set(); this.p = PM.chibi([0, .02, .3], { logo: true, boca: 'abierta', mira: 0 });
      this.cor = PM.pz(F.corazon(.5), ROJO, [.13, .86, .5], null, { tinta: .014, papel: .04 });
      const O = [[-.62, .5], [.62, .5], [-.2, .12], [.2, .12], [-.62, .5], [.62, .5]];
      this.gs = O.map(([x, y], i) => { const g = PM.pz(F.gota(.16), ROJO, [x, y, .55], null, { tinta: .01, papel: .03 }); g.x0 = x; g.y0 = y; g.i = i; return g; });
      this.gota = PM.astro([.95, 2.05, .6], .28, 0x8fd3ff, { forma: F.gota(.62), sombra: 0x6cb6e6 }); this.q = PM.pregunta([-.85, 2.15, .7], .6); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('sangre') - .2, tce = c.w('centro') - .2, tcr = c.w('cree') - .2, tl = c.w('líquido.') - .3;
      A.parpadea(this.p, t, .3); habla(this.p, t, 1); A.preocupa(this.p, t > tcr ? .7 : 0); this.p.boca(t > tcr ? 'apretada' : 'abierta');
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .25; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + .25;
      // gotitas rojas viajan de manos y pies al pecho
      this.gs.forEach(g => { const u = cl((t - ts - g.i * .25) / .9); g.visible = t > ts && u < 1; const e = ease(u);
        g.position.set(lerp(g.x0, .13, e), lerp(g.y0, .86, e) + Math.sin(u * Math.PI) * .15, .55); g.scale.setScalar(.9 - .4 * e); });
      const lleno = cl((t - ts) / 2.4); this.cor.scale.setScalar((.7 + .45 * lleno) * (1 + Math.sin(t * 9) * .06));
      this.gota.scale.setScalar(pop(t, tcr + .1) ); flota(this.gota, t, 2.05, 0, .05); A.parpadea(this.gota, t, 1.2); this.gota.cara(t > tl ? 'abierta' : 'feliz');
      this.q.scale.setScalar(pop(t, tl) * .6); this.q.rotation.z = Math.sin(t * 4) * .15;
      if (t > ts) c.ev('pop', ts, .4); if (t > tcr) c.ev('pop', tcr + .1, .5); if (t > tl) c.ev('ding', tl, .5);
      cam([.0, 1.2, lerp(10.4, 9.9, ease(lt / 4.6))], [.0, 1.15, 0], 34);
      if (t > tce) etiqueta('AL CENTRO', [-.75, .95, .7], lt - tce, 46, '#ffffff', true);
      if (t > tcr) etiqueta('¿LE SOBRA LÍQUIDO?', [0, -.2, .7], lt - tcr, 52, '#ffd640', true);
      rotulo('La sangre se va al centro', 'y el cuerpo cree que sobra líquido', lt - .1, RY);
    }
  });

  // ---------- 4 · los riñones lo sacan directo a la vejiga ----------
  escena('rinones', {
    setup() { const ROSA = 0xf6c1bd; ambiente({ top: ROSA, bottom: ROSA, fog: ROSA, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
      PM.pz(F.rect(30, 30, 0), ROSA, [0, 8, -4], null, { tinta: false, papel: false });
      for (const [x, y, rx, ry] of [[-1.5, 2.6, 1.0, .5], [1.6, .4, 1.1, .6], [1.4, 3.4, .8, .4], [-1.6, .2, .9, .5]]) PM.det(F.elipse(rx, ry), 0xfbd6d2, [x, y, -3.9]);
      luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
      this.r = [-1, 1].map(s => { const g = PM.astro([s * .7, 1.9, .3], .42, 0xd9605a, { forma: PM.formaRinon(.42), sombra: 0xbf4a46 }); if (s > 0) { g.cuerpo.scale.x = -1; } return g; });
      this.tubos = [-1, 1].map(s => PM.det(P.tubo([[s * .62, 1.5], [s * .45, 1.1], [s * .25, .85]], .05, .05), 0xffd86b, [0, 0, .1], null));
      this.vj = PM.astro([0, .55, .32], .5, 0xffd86b, { forma: PM.formaVejiga(.5), sombra: 0xf0c050 });
      this.gs = []; for (let i = 0; i < 8; i++) { const g = PM.pz(F.gota(.12), 0xffe27a, [0, 0, .5], null, { tinta: .01, papel: .02 }); g.i = i; g.s = i % 2 ? 1 : -1; g.visible = false; this.gs.push(g); } },
    update(lt, c) {
      const t = tw(lt), tri = c.w('riñones') - .2, tsa = c.w('sacan…') - .2, tv = c.w('vejiga.') - .25;
      this.r.forEach((g, i) => { A.parpadea(g, t, i * 1.3); flota(g, t, 1.9, i * 2, .04); g.scale.setScalar(pop(t, -.3 + i * .1, .3) * (1 + (t > tsa ? Math.sin(t * 10 + i) * .04 : 0))); g.cara(t > tsa ? 'abierta' : 'feliz'); });
      this.gs.forEach(g => { const u = ((t - tsa) * .9 + g.i / 8) % 1; g.visible = t > tsa; const e = u; g.position.set(lerp(g.s * .62, g.s * .2, e), lerp(1.5, .75, e), .5); g.scale.setScalar(.8); });
      const ll = eout(cl((t - tv) / .5)); const s = (.8 + .35 * cl((t - tsa) / 1.5) + .1 * ll) * pop(t, -.1, .3); this.vj.scale.set(s * (1 + Math.sin(t * 8) * .03 * ll), s, 1);
      A.parpadea(this.vj, t, .8); this.vj.cara(t > tv ? 'abierta' : 'feliz');
      if (t > tsa) c.ev('whoosh', tsa, .4); if (t > tv) c.ev('pop', tv, .6);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tri) etiqueta('RIÑONES', [0, 2.5, .7], lt - tri, 48, '#ffffff', true);
      if (t > tv - .3) etiqueta('VEJIGA', [0, -.2, .7], lt - tv + .3, 54, '#ffd640', true);
      rotulo('Los riñones lo sacan', 'directo a la vejiga', lt - .1, RY);
    }
  });

  // ---------- 5 · truco + remate: abrígate, toma agua y mándaselo ----------
  escena('remate', {
    setup() { set(); this.cp = PM.copos({ n: 14, x0: -1.5, x1: 1.5, y0: .0, y1: 2.9 });
      this.p = PM.chibi([-.6, .02, .3], { logo: true, boca: 'abierta', mira: 1 });
      this.bu = PM.bufanda(this.p, 0xff6b5b); this.v = vaso(this.p.brazos[1]);
      this.a = PM.chibi([.82, .02, .3], { pelo: 'cola', ropa: 0xffc83d, pantalon: 0x7b5cff, colPelo: 0x2a1a12, boca: 'apretada', mira: -1, escala: .9 });
      this.su = gotaPiel(); this.cs = corazones(); },
    update(lt, c) {
      const t = tw(lt), tab = c.w('abrígate') - .2, tag = c.w('agua.') - .25, tm = c.w('mándaselo') - .2, tbu = c.w('baño.') - .3; this.cp.update(t);
      const abr = t > tab; A.parpadea(this.p, t, .2); habla(this.p, t);
      this.bu.scale.setScalar(pop(t, tab, .35)); this.bu.mece(t);
      A.preocupa(this.p, abr ? 0 : .7); A.tiembla(this.p, t, abr ? 0 : 1, -.6); this.p.boca(abr ? 'abierta' : 'apretada');
      // brazo con el vaso: lo sube al decir "agua"
      const kv = eout(cl((t - tag + .5) / .4)); const br = this.p.brazos[1]; br.rotation.z = lerp(br.r0 + .1, 1.0, kv) + Math.sin(t * 5) * .04 * kv; this.v.rotation.z = -br.rotation.z; this.v.visible = t > tag - .8; this.v.scale.setScalar(pop(t, tag - .8, .3));
      this.p.brazos[0].rotation.z = abr ? this.p.brazos[0].r0 : .3;
      if (abr && t < tm) animaCorazones(this.cs, t, -.6, 2.45, .5, .2); else this.cs.forEach(h => h.visible = false);
      // la amiga que ya anda buscando baño
      this.a.visible = t > tm - .1; this.a.scale.set(.9, .9 * pop(t, tm - .1, .35), .18); A.parpadea(this.a, t, 1.4); A.preocupa(this.a, 1); aguanta(this.a, t, 1); A.tiembla(this.a, t, .7, .82);
      this.a.head.rotation.z = this.a.head.r0 + Math.sin(t * 6) * .06; this.a.brazos[0].rotation.z = .35; this.a.brazos[1].rotation.z = -.35;
      sudor(this.su, this.a, t, t > tm);
      if (t > tab) c.ev('pop', tab, .5); if (t > tag) c.ev('ding', tag, .5); if (t > tm) c.ev('whoosh', tm - .1, .5);
      cam([.1, 1.2, 10.4], [.1, 1.15, 0], 34);
      if (t > tab && t < tm) etiqueta('ABRÍGATE', [-.6, -.2, .7], lt - tab, 52, '#ffffff', true);
      if (t > tag && t < tm) etiqueta('TOMA AGUA', [.65, .9, .7], lt - tag, 50, '#ffd640', true);
      if (t > tm) etiqueta('MÁNDASELO', [.1, -.2, .7], lt - tm, 56, '#ffd640', true);
      if (t > tbu) etiqueta('¿Y EL BAÑO?', [.82, 2.45, .7], lt - tbu, 46, '#ffffff', true);
      if (t < tm) rotulo('Truco', 'abrígate y sigue tomando agua', lt - .1, RY); else rotulo('Mándaselo', 'a quien ya anda buscando baño', lt - tm, RY);
    }
  });
  P.cierre();
}
