// Short 25-nov 21:30 · CARTULINA CHIBI (🧪 PRUEBA LARGO 40 s): ¿cuál es la hora más fría del día?
// Justo después del amanecer: toda la noche el suelo pierde calor por radiación y sigue enfriándose hasta que el sol calienta más
// de lo que la tierra pierde. Las nubes regresan calor infrarrojo (cobija); con cielo despejado se escapa. Helada en el pasto aunque
// el termómetro (a ~1.5 m) marque sobre cero: el suelo está más frío que el aire. Fuentes: Georgia Tech, AccuWeather, UBC ATSC 113.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-25-2130-hora-mas-fria.json OUT ../ejemplos/2026-11-25-2130-hora-mas-fria.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, NOCHE = 0x27306e, ALBA = 0x4a5aa8;
  const noche = (o = {}) => { const c = o.cielo ?? NOCHE; ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    const n = PM.nocheCalle(o); luces({ pos: [-3, 5, 8], hemi: o.hemi ?? 1.65, sol: 1.4, radio: 6 }); return n; };
  const dia = () => { ambiente({ top: 0xbfe3f5, bottom: 0xbfe3f5, fog: 0xbfe3f5, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const tirita = (p, t, k = 1) => { p.brazos[0].rotation.z = p.brazos[0].r0 - .9 * k + Math.sin(t * 30) * .04 * k; p.brazos[1].rotation.z = p.brazos[1].r0 + .9 * k + Math.sin(t * 30 + 1) * .04 * k;
    p.rotation.z = Math.sin(t * 30) * .014 * k; A.preocupa(p, k); };
  const amigo = (pos, o = {}) => PM.chibi(pos, { ropa: 0xff8a3d, pantalon: 0x2b2f4a, tenis: 0xffc83d, colPelo: 0x1d1410, lentes: 0x2b2f4a, boca: 'feliz', ...o });
  const sol = (pos, r = .4) => PM.astro(pos, r, 0xffd23d, { rayos: true, sombra: 0xffb52e });
  // pasto de cartulina en primer plano: cada hoja tiene su capa de escarcha blanca (g.escarcha(k))
  const pasto = (o = {}) => { const g = group([0, 0, o.z ?? .75]), hs = []; let sm = 5; const rnd = () => (sm = (sm * 16807) % 2147483647) / 2147483647;
    for (let x = -1.6; x < 1.6; x += .13) { const h = .2 + rnd() * .14, w = .07, hj = group([x, -.02, rnd() * .04], g);
      PM.pz(F.poly([[-w, 0], [w, 0], [w * .2, h]]), rnd() < .5 ? 0x4fb05a : 0x3f9a4c, [0, 0, 0], hj, { tinta: .01, papel: .03, rot: (rnd() - .5) * .3 });
      const e = PM.det(F.poly([[-w * .8, h * .25], [w * .8, h * .25], [w * .15, h * .95]]), 0xf4fbff, [0, 0, .02], hj, 0); e.scale.setScalar(.001); hs.push(e); hj.f = rnd() * 6; }
    g.escarcha = k => hs.forEach((e, i) => e.scale.setScalar(Math.max(.001, cl(k * 1.4 - (i % 7) * .06)))); return g; };

  // ---------- 1 · gancho: el reloj marca las doce… ¡no! ----------
  escena('gancho', {
    setup() { this.n = noche();
      this.p = PM.chibi([-.78, .02, .35], { logo: true, boca: 'abierta', mira: 1, escala: .82 });
      this.r = PM.despertador([.52, 1.35, .4], .55, { h: 0 });
      this.x = PM.marca([.52, 1.35, .75], false, 1.6); this.x.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), tn = c.w('No,') - .05;
      this.n.update(t); A.parpadea(this.p, t + 1.2, .4); respira(this.p, t);
      // se rasca la cabeza pensando y luego niega
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 2.4 + Math.sin(t * 6) * .08; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .15;
      if (t < tn) { habla(this.p, t); A.ladea(this.p, .5 * ease(cl(t / .4)), 1); } else { A.ladea(this.p, 0); this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 14) * .14 * (1 - cl((t - tn) / 1.2)); }
      this.p.boca(t < tn ? 'abierta' : 'feliz');
      this.r.suena(t, t < tn ? .35 : 0); this.r.position.y = 1.35 + Math.sin(t * 2) * .03;
      this.x.scale.setScalar(.82 * pop(t, tn));
      c.ev('pop', .05, .5); if (t > tn) c.ev('crack', tn, .7);
      cam([0, 1.2, lerp(10.9, 10.3, ease(lt / 3.4))], [0, 1.15, 0], 34);
      etiqueta(t < tn ? '¿LAS 12?' : '¡NO!', [.52, 2.45, .9], lt - (t < tn ? .1 : tn), t < tn ? 54 : 64, t < tn ? '#ffffff' : '#ff6b5b', true);
      rotulo('¿Cuál es la hora más', 'fría del día?', lt - .05, RY);
    }
  });

  // ---------- 2 · amanecer: el reloj corre, sale el sol y el suelo sigue soltando calor ----------
  escena('amanecer', {
    setup() { this.n = noche({ estrellas: 18 });
      this.s = sol([-.75, -.6, this.n.zLuna], .45);
      this.r = PM.despertador([-.95, 2.05, .4], .3, { h: 0 });
      this.f = PM.flechasCalor({ x0: -1.25, x1: .05, n: 4, y0: .15, y1: 2.3, z: .55, s: 1.3 });
      this.th = PM.termometro([1.02, .15, .45], { h: 1.3 });
      this.p = PM.chibi([.42, .02, .3], { logo: true, boca: 'abierta', mira: -1, escala: .62 }); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('sol:') - .4, tsu = c.w('suelo') - .15, te = c.w('enfriando') - .1;
      this.n.update(t); A.parpadea(this.p, t + .5, 1.3); respira(this.p, t);
      this.r.hora(lerp(0, 6.6, ease(cl(t / (ts + .4))))); this.r.suena(t, t < ts + .4 ? .25 : 0);
      const ks = ease(cl((t - ts + .3) / 1.0)); this.s.position.y = lerp(-.6, 1.25, ks); this.s.rayos.rotation.z = t * .4; A.parpadea(this.s, t + .8, .9); this.s.cara(ks > .5 ? 'abierta' : 'feliz');
      this.f.update(t, ease(cl((t - tsu) / .4)));
      this.th.nivel(lerp(.55, .14, ease(cl((t - tsu) / (te - tsu + .6)))) + Math.sin(t * 5) * .01);
      const kf = ease(cl((t - tsu) / .5)); tirita(this.p, t, kf); if (kf < .5) habla(this.p, t);
      this.p.boca(t > te ? 'apretada' : 'abierta');
      c.ev('whoosh', .05, .4); if (t > ts + .3) c.ev('ding', ts + .3, .6); if (t > tsu) c.ev('whoosh', tsu, .5); if (t > te) c.ev('pop', te, .4);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      const lab = t < tsu ? ['¡AL SALIR EL SOL!', ts + .2, '#ffd640', 46] : t < te ? ['EL SUELO PIERDE CALOR', tsu, '#ff8a3d', 40] : ['¡Y SE ENFRÍA MÁS!', te, '#8fd3ff', 46];
      etiqueta(lab[0], [0, 2.6, .9], lt - Math.max(0, lab[1]), lab[3], lab[2], true);
      rotulo('Justo al salir el sol', 'el suelo sigue enfriando', lt - .05, RY);
    }
  });

  // ---------- 3 · sol vs suelo: al principio entra menos calor del que sale ----------
  escena('sol', {
    setup() { dia();
      this.s = sol([-.92, 2.05, .2], .36);
      this.fs = PM.flechasCalor({ x0: .45, x1: 1.25, n: 3, y0: -1.75, y1: -.2, fin: 0, color: 0xffa800, z: .45, s: 1.5 });
      this.fs.rotation.z = Math.PI;
      this.ft = PM.flechasCalor({ x0: .35, x1: 1.25, n: 4, y0: .15, y1: 2.0, fin: .4, color: 0xff5b4d, z: .45, s: 1.4 });
      this.p = PM.chibi([-.12, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .56 }); },
    update(lt, c) {
      const t = tw(lt), tso = c.w('sol') - .1, tm = c.w('menos') - .1, tp = c.w('pierde') - .1;
      A.parpadea(this.p, t + 2.2, .3); respira(this.p, t); A.parpadea(this.s, t + .3, 1.7);
      this.s.rayos.rotation.z = t * .5; this.s.cara(t > tm ? 'duda' : 'feliz'); this.s.position.y = 2.05 + Math.sin(t * 2) * .03;
      this.fs.tam(lerp(1, .6, ease(cl((t - tm) / .4)))); this.fs.update(t, ease(cl((t - tso) / .4)), 0, .55);
      this.ft.tam(lerp(1, 1.35, ease(cl((t - tp) / .4)))); this.ft.update(t, ease(cl((t - .1) / .4)), 0, .55);
      tirita(this.p, t, .6); habla(this.p, t); this.p.boca(t > tp ? 'apretada' : 'abierta');
      c.ev('whoosh', .05, .4); if (t > tm) c.ev('pop', tm, .5); if (t > tp) c.ev('whoosh', tp, .6);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tm) { etiqueta('ENTRA POCO', [-.85, .6, .9], lt - tm, 36, '#e6a100', true); }
      if (t > tp) etiqueta('¡SALE MÁS!', [.82, 2.5, .9], lt - tp, 44, '#ff5b4d', true);
      rotulo('Al principio el sol', 'calienta menos', lt - .05, RY);
    }
  });

  // ---------- 4 · SORPRESA: las nubes son una cobija que regresa el calor ----------
  escena('cobija', {
    setup() { this.n = noche({ estrellas: 6 });
      this.a = PM.nubeCobija([-.62, 1.95, .25], { s: .95 });
      this.b = PM.nubeCobija([.72, 2.1, .1], { s: .75, cobija: [0x7b5cff, 0x8fd3ff, 0xff6b9b, 0xffc83d] });
      this.f = PM.flechasCalor({ x0: -1.15, x1: 1.15, n: 5, y0: .15, y1: 1.22, z: .5, s: 1.25 });
      this.p = PM.chibi([.05, .02, .35], { logo: true, boca: 'feliz', mira: 1, escala: .62 }); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('Sorpresa') , tn = c.w('nubes') - .1, tc = c.w('cobija') - .1, tr = c.w('regresa') - .1;
      this.n.update(t); A.parpadea(this.p, t + .9, 2.1); respira(this.p, t);
      const ka = pop(t, tn - .2, .5), kb = pop(t, tn, .5);
      this.a.scale.setScalar(ka); this.b.scale.setScalar(kb); this.a.update(t); this.b.update(t + 1);
      A.parpadea(this.a, t + .2, 1.4); A.parpadea(this.b, t + 1.1, .6);
      this.a.cobija.visible = this.b.cobija.visible = t > tc - .1; const kc = ease(cl((t - tc + .1) / .35));
      this.a.cobija.scale.set(1, Math.max(.001, kc), 1); this.b.cobija.scale.set(1, Math.max(.001, kc), 1);
      this.a.cara(t > tc ? 'feliz' : 'abierta'); this.b.cara(t > tc ? 'feliz' : 'abierta');
      this.f.update(t, ease(cl((t - .1) / .4)), t > tr - .2 ? 1 : 0, .5);
      // primero sorprendido, luego feliz y abrazándose (calientito)
      const kh = ease(cl((t - tr) / .4));
      this.p.boca(t < ts + .9 ? 'abierta' : 'feliz');
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + lerp(1.6 + Math.sin(t * 8) * .1, -.7, kh); this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + lerp(-1.6 - Math.sin(t * 8) * .1, .7, kh);
      this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 3) * .08 * kh; if (kh < .5) habla(this.p, t);
      c.ev('ding', ts, .7); if (t > tn - .2) c.ev('pop', tn - .2, .5); if (t > tn) c.ev('pop', tn, .4); if (t > tc) c.ev('whoosh', tc, .5); if (t > tr) c.ev('ding', tr + .3, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      etiqueta(t < tc ? '¡SORPRESA!' : '¡NUBES = COBIJA!', [0, 2.62, .9], lt - (t < tc ? ts : tc), t < tc ? 54 : 46, '#ffd640', true);
      rotulo('Las nubes son una cobija', 'que regresa el calor', lt - .05, RY);
    }
  });

  // ---------- 5 · cielo despejado y estrellado: el calor se escapa al espacio ----------
  escena('estrellas', {
    setup() { this.n = noche({ estrellas: 48 });
      this.l = PM.luna([1.0, 2.05, this.n.zLuna], .32);
      this.f = PM.flechasCalor({ x0: -1.2, x1: 1.2, n: 6, y0: .15, y1: 2.4, z: .5, s: 1.3 });
      this.p = PM.chibi([-.05, .02, .35], { logo: true, boca: 'abierta', mira: 1, escala: .66 }); },
    update(lt, c) {
      const t = tw(lt), td = c.w('despejado') - .1, te = c.w('escapa') - .1, tes = c.w('espacio') - .1;
      this.n.update(t); this.n.estrellas.forEach(e => e.scale.multiplyScalar(1 + .25 * ease(cl((t - td) / .5))));
      A.parpadea(this.p, t + .3, 2.6); respira(this.p, t);
      this.f.update(t, ease(cl((t - .1) / .4)), 0, lerp(.4, .75, ease(cl((t - te) / .4))));
      const kf = ease(cl((t - te) / .4)); tirita(this.p, t, .3 + .7 * kf); if (kf < .5) habla(this.p, t);
      this.p.head.rotation.z = this.p.head.r0 + (kf < .5 ? 0 : Math.sin(t * 25) * .03);
      this.p.boca(t > tes ? 'apretada' : 'abierta');
      c.ev('whoosh', .05, .4); if (t > td) c.ev('ding', td, .5); if (t > te) c.ev('whoosh', te, .7); if (t > tes) c.ev('whoosh', tes + .2, .5);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 4.4))], [0, 1.15, 0], 34);
      etiqueta(t < te ? 'CIELO DESPEJADO' : '¡SE ESCAPA AL ESPACIO!', [0, 2.6, .9], lt - (t < te ? Math.max(0, td) : te), t < te ? 44 : 38, t < te ? '#ffffff' : '#ff8a3d', true);
      rotulo('Cielo despejado:', 'el calor se escapa', lt - .05, RY);
    }
  });

  // ---------- 6 · helada: el pasto amanece blanco aunque el termómetro marque sobre cero ----------
  const madrugada = (self) => { self.n = noche({ cielo: ALBA, estrellas: 10, hemi: 1.75 });
    self.s = sol([-.9, 1.0, self.n.zLuna], .4);
    self.g = pasto(); };
  escena('helada', {
    setup() { madrugada(this);
      this.poste = PM.pz(F.rect(.1, 1.55, .02), 0x8a5a3a, [.95, .78, .3], null, { tinta: .014, papel: .04 });
      this.th = PM.termometro([.95, .75, .42], { h: .95, color: 0xff4d5e, copo: false }); this.th.nivel(.42);
      this.p = PM.chibi([-.55, .02, .35], { logo: true, boca: 'abierta', mira: 1, escala: .7 }); this.ok = PM.marca([1.2, 1.85, .6], true, .8); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('pasto') - .1, tb = c.w('blanco') - .1, tt = c.w('termómetro') - .1, tc = c.w('cero.') - .1;
      this.n.update(t); A.parpadea(this.p, t + 1.7, .2); respira(this.p, t);
      this.s.rayos.rotation.z = t * .3; A.parpadea(this.s, t + .6, 1.1); this.s.position.y = 1.0 + .1 * ease(cl(t / 4));
      this.g.escarcha(ease(cl((t - tp) / (tb - tp + .5))));
      this.th.nivel(.42 + Math.sin(t * 4) * .015); this.ok.scale.setScalar(.8 * pop(t, tc));
      // se agacha a ver el pasto y luego voltea al termómetro, sorprendido
      const kv = ease(cl((t - tt) / .4));
      this.p.rotation.z = lerp(.12, -.06, kv) * ease(cl((t - tp) / .4)); this.p.boca(t > tb && t < tt ? 'abierta' : 'abierta');
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + lerp(.3, 1.35, kv) + Math.sin(t * 6) * .05; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + lerp(.9, -.2, kv) - Math.sin(t * 6) * .05;
      A.preocupa(this.p, t > tb ? .6 * (1 - kv) : 0); habla(this.p, t);
      c.ev('whoosh', .05, .4); if (t > tb) c.ev('ding', tb, .6); if (t > tt) c.ev('pop', tt, .4); if (t > tc) c.ev('ding', tc, .6);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t < tt) etiqueta('¡PASTO BLANCO!', [-.45, 2.55, .9], lt - Math.max(0, tb), 46, '#ffffff', true);
      else etiqueta('¡ARRIBA DE CERO!', [.2, 2.55, .9], lt - tt, 46, '#ff6b5b', true);
      rotulo('Pasto blanco aunque', 'esté arriba de cero', lt - .05, RY);
    }
  });

  // ---------- 7 · el termómetro mide el aire a metro y medio; pegado al suelo hace más frío ----------
  escena('suelo', {
    setup() { madrugada(this); this.g.escarcha(1);
      this.poste = PM.pz(F.rect(.1, 1.75, .02), 0x8a5a3a, [.95, .875, .3], null, { tinta: .014, papel: .04 });
      this.th = PM.termometro([.95, 1.38, .42], { h: .7, color: 0xff4d5e, copo: false }); this.th.nivel(.42);
      this.reg = group([.55, 0, .5]); PM.pz(F.rect(.05, 1.5, .02), 0xffc83d, [0, .75, 0], this.reg, { tinta: .012, papel: .03 });
      for (const y of [0, 1.5]) PM.pz(F.rect(.2, .05, .02), 0xffc83d, [0, y, .01], this.reg, { tinta: .012, papel: .03 });
      this.t2 = PM.termometro([-.15, .05, .8], { h: .6, color: 0x3d9bff }); this.t2.rotation.z = -.15; this.t2.nivel(.4);
      this.p = PM.chibi([-.95, .02, .35], { logo: true, boca: 'abierta', mira: 1, escala: .62 }); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('aire') - .1, tm = c.w('metro') - .1, tpe = c.w('pegado') - .1, tf = c.w('frío.') - .1;
      this.n.update(t); A.parpadea(this.p, t + .4, 1.9); respira(this.p, t); this.s.rayos.rotation.z = t * .3; A.parpadea(this.s, t + 1.6, .5); this.s.position.y = 1.1;
      this.reg.scale.y = Math.max(.001, ease(cl((t - tm) / .5))); this.reg.visible = t > tm - .05;
      const k2 = pop(t, tpe - .1); this.t2.scale.setScalar(k2); this.t2.nivel(lerp(.4, .08, ease(cl((t - tf) / .6))));
      this.th.nivel(.42 + Math.sin(t * 4) * .015);
      // señala arriba (termómetro) y luego abajo (suelo) y tirita
      const kd = ease(cl((t - tpe) / .4));
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + lerp(2.3, .9, kd) + Math.sin(t * 7) * .05; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .2;
      habla(this.p, t); this.p.boca(t > tf ? 'apretada' : 'abierta'); A.preocupa(this.p, ease(cl((t - tf) / .3)));
      c.ev('whoosh', .05, .4); if (t > ta) c.ev('pop', ta, .4); if (t > tm) c.ev('whoosh', tm, .5); if (t > tpe) c.ev('pop', tpe, .5); if (t > tf) c.ev('ding', tf, .6);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tm) etiqueta('AIRE A 1.5 m', [.6, 2.5, .9], lt - tm, 40, '#ffffff', true);
      if (t > tpe) etiqueta('¡SUELO MÁS FRÍO!', [-.2, 1.65, .9], lt - tpe, 38, '#8fd3ff', true);
      rotulo('Pegado al suelo', 'hace mucho más frío', lt - .05, RY);
    }
  });

  // ---------- 8 · truco: si ves muchas estrellas, deja lista la chamarra ----------
  escena('truco', {
    setup() { this.n = noche({ estrellas: 50 });
      this.p = PM.chibi([.05, .02, .35], { logo: true, boca: 'feliz', mira: 1, escala: .8 });
      this.ch = PM.chamarra(this.p, 0x2ec4a6); this.ch.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), te = c.w('estrellas') - .1, tc = c.w('chamarra') - .15;
      this.n.update(t); this.n.estrellas.forEach(e => e.scale.multiplyScalar(1 + .35 * ease(cl((t - te) / .4))));
      A.parpadea(this.p, t + 2.5, .7); respira(this.p, t);
      const kc = pop(t, tc, .45); this.ch.scale.setScalar(kc);
      // mira al cielo señalando las estrellas y luego se pone la chamarra contento
      const kv = ease(cl((t - tc) / .3));
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + lerp(2.6 + Math.sin(t * 5) * .08, .4, kv); this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - lerp(.15, .4, kv);
      A.ladea(this.p, .45 * (1 - kv) * ease(cl(t / .4)), -1); if (kv > .5) habla(this.p, t);
      this.p.boca(t < tc ? 'abierta' : 'feliz');
      c.ev('ding', .1, .5); if (t > te) c.ev('ding', te, .6); if (t > tc) c.ev('pop', tc, .7);
      cam([0, 1.2, lerp(10.6, 10.1, ease(lt / 4))], [0, 1.15, 0], 34);
      etiqueta(t < tc ? '¿MUCHAS ESTRELLAS?' : '¡CHAMARRA LISTA!', [0, 2.6, .9], lt - (t < tc ? .1 : tc), t < tc ? 42 : 46, t < tc ? '#ffd640' : '#2ec4a6', true);
      rotulo('Truco: ¿muchas estrellas?', 'Deja lista la chamarra', lt - .05, RY);
    }
  });

  // ---------- 9 · remate: el amigo que sale de madrugada en puro suéter ----------
  escena('remate', {
    setup() { madrugada(this); this.g.escarcha(.8);
      this.p = PM.chibi([-.78, .02, .35], { logo: true, boca: 'feliz', mira: 1, escala: .72 }); PM.chamarra(this.p, 0x2ec4a6);
      this.a = amigo([.68, .02, .35], { escala: .76, mira: -1, boca: 'apretada' }); PM.sueter(this.a, 0xd9534f);
      this.v = PM.aliento([-.4, -.3, .05], this.a.head, { n: 4 }); },
    update(lt, c) {
      const t = tw(lt), tm = c.w('Mándaselo'), ts = c.w('suéter') - .1;
      this.n.update(t); A.parpadea(this.p, t + 1.6, .5); A.parpadea(this.a, t + .3, 1.4); respira(this.p, t); respira(this.a, t, .02, 1.1);
      this.s.rayos.rotation.z = t * .3; A.parpadea(this.s, t + 2, .2); this.s.position.y = 1.1;
      tirita(this.a, t, 1); this.a.boca('apretada'); this.a.head.rotation.z = this.a.head.r0 + Math.sin(t * 25) * .03;
      this.v.update(t, 1, -1, .42, .8);
      this.p.boca(t > ts ? 'abierta' : 'feliz'); habla(this.p, t);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.25 * eout(cl((t - tm - .1) / .3)) + Math.sin(t * 9) * .05;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .2 - Math.sin(t * 9) * .05;
      c.ev('whoosh', .05, .4); if (t > ts) c.ev('pop', ts, .6);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.4))], [0, 1.15, 0], 34);
      if (t > ts - .3) etiqueta('¡BRRR!', [.7, 2.35, .9], lt - ts + .3, 54, '#8fd3ff', true);
      rotulo('Mándaselo al que sale', 'en puro suéter', lt - .05, RY);
    }
  });
  P.cierre();
}
