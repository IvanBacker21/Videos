// Short 23-nov 21:30 (PRUEBA LARGO 40 s) · CARTULINA CHIBI: ¿qué son las rayas blancas que dejan los aviones?
// Estelas de condensación: el motor suelta vapor de agua caliente; a la altura de crucero hace -40 °C o menos (más frío que un congelador,
// ~-18 °C) y el vapor se congela en cristalitos de hielo: una nube hecha por el avión (como el vaho). Si allá arriba el aire está seco se
// borran en segundos; si hay mucha humedad duran horas y se esparcen (a veces antes de un cambio de tiempo). Mito "chemtrails": encuesta de
// Shearer et al. (Environ. Res. Lett. 2016) a 77 expertos: 76 no hallaron evidencia de un programa secreto de rociado.
// Fuentes: FAA (Contrails fact sheet), EPA (Contrails), EarthSky (Atmospheric scientists say no to chemtrails), IOP/ERL Shearer 2016.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-23-2130-estelas-avion.json OUT ../ejemplos/2026-11-23-2130-estelas-avion.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw, blob, tubo } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xbfe3f5, AMARILLO = 0xffc83d, ROJO = 0xff5b5b, VERDE = 0x2ec4a6, HIELO = 0xbfe8ff;
  const set = () => { ambiente({ top: CIELO, bottom: CIELO, fog: CIELO, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const sale = (t, t0, d = .3) => t < t0 ? 1 : Math.max(.001, 1 - ease(cl((t - t0) / d)));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const nino = (pos, o = {}) => PM.chibi(pos, { boca: 'feliz', ...o });
  // avión con estela que cruza el cielo: la cola de la estela queda fija en x = cola (fuera de cuadro)
  const vuelo = (y, o = {}) => PM.estelaAvion([0, y, .2], { escala: o.escala ?? .62, largo: 9, n: o.n ?? 100, r: o.r ?? .13, cara: true });
  const vuela = (av, t, x0, v, cola = -2.2, vida = 1, abre = 0) => { const x = x0 + v * t, s = av.scale.x; av.position.x = x;
    av.position.y = (av.y0 ??= av.position.y) + Math.sin(t * 1.8) * .02; av.update(t, cl((x - cola) / (9 * s)), vida, abre); A.parpadea(av, t, .7); };
  // nube alargada con carita (silueta propia para que la cara quede dentro); ax estira a lo ancho
  const nubeCara = (pos, r, color = 0xffffff, ax = 1.3, sombra = 0xdbe9f5) => { const pts = []; for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, k = 1 + .12 * Math.cos(a * 7); pts.push([Math.cos(a) * r * ax * k, Math.sin(a) * r * .82 * k]); }
    return PM.astro(pos, r, color, { forma: blob(pts), sombra }); };
  // termómetro de cartulina: g.nivel(k 0..1)
  const termo = (pos, H = 1.6) => { const g = group(pos);
    PM.pz(F.rect(.24, H, .12), 0xffffff, [0, H / 2, 0], g, { tinta: .014, papel: .05 }); PM.pz(F.circ(.17), ROJO, [0, 0, .02], g, { tinta: .014, papel: .05 });
    for (let i = 1; i < 8; i++) PM.det(F.rect(.07, .016, 0), 0x8a93b0, [.075, .1 + i * (H - .2) / 8, .03], g);
    g.liq = group([0, .05, .035], g); PM.det(F.rect(.1, 1, .04), ROJO, [0, .5, 0], g.liq);
    g.nivel = k => g.liq.scale.y = Math.max(.02, k * (H - .16)); g.nivel(.8); return g; };
  // gorro de papel aluminio (cono plateado arrugado) sobre la cabeza de un chibi
  const gorroAlu = p => { const g = group([0, 0, .07], p.head);
    PM.pz(F.poly([[-.44, .3], [.44, .3], [.04, 1.08]]), 0xc9cfd8, [0, 0, 0], g, { tinta: .014, papel: .05 });
    for (const [a, b] of [[[-.25, .4], [-.05, .62]], [[.1, .36], [.22, .58]], [[-.1, .75], [.06, .9]], [[-.32, .33], [-.18, .48]]]) PM.det(tubo([a, b], .014, .014), 0xf4f7fb, [0, 0, .016], g);
    PM.det(tubo([[-.4, .33], [.4, .33]], .02, .02), 0x9aa3b5, [0, 0, .02], g); return g; };
  // cristalitos de hielo que brillan
  const cristales = (par, n, R) => { let sm = 3; const rnd = () => (sm = (sm * 16807) % 2147483647) / 2147483647;
    return Array.from({ length: n }, (_, i) => { const a = i * 2.39996, rr = R * Math.sqrt((i + .5) / n);
      const c = PM.pz(F.estrella(6, .085, .035), i % 2 ? 0xffffff : HIELO, [Math.cos(a) * rr, Math.sin(a) * rr, .05], par, { tinta: .01, papel: .02 }); c.f = rnd(); c.scale.setScalar(.001); return c; }); };

  // ---------- 1 · gancho: el avión pinta una raya en el cielo; ¿humo? ----------
  escena('gancho', {
    setup() { set();
      this.av = vuelo(2.32);
      this.p = nino([-.95, .02, .3], { logo: true, mira: 1, escala: .76 });
      this.a = nino([.95, .02, .3], { ropa: 0xff8a5b, pantalon: 0x3a4a6a, tenis: AMARILLO, colPelo: 0x1a120c, mira: -1, escala: .74 });
      this.m = PM.marca([0, 1.2, .6], false, .001); },
    update(lt, c) {
      const t = tw(lt), thu = c.w('humo') - .1, tno = c.w('no') - .1;
      vuela(this.av, t, -.9, .55);
      A.parpadea(this.p, t + 1.1, .3); A.parpadea(this.a, t + .4, 1.6); respira(this.a, t, .02, 1);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.5, eout(cl((t - .15) / .35))) + Math.sin(t * 4) * .05;
      this.p.head.rotation.z = this.p.head.r0 - .12; this.p.boca(t > .2 && t < tno ? 'abierta' : 'feliz');
      this.a.head.rotation.z = this.a.head.r0 + .15 + Math.sin(t * 2) * .03; this.a.boca(t > 1.2 ? 'abierta' : 'feliz'); if (t > thu) A.ladea(this.a, .35, -1);
      this.m.scale.setScalar(pop(t, thu, .35) * .9); this.m.rotation.z = Math.sin(t * 4) * .08;
      c.ev('whoosh', .05, .5); if (t > 1.2) c.ev('pop', 1.2, .3); if (t > thu) c.ev('ding', thu, .5);
      cam([0, 1.2, lerp(11.0, 10.5, ease(lt / 3.4))], [0, 1.15, 0], 34);
      if (t > 1.2) etiqueta('¿HUMO?', [0, .45, .9], lt - 1.2, 60, '#ffffff', true);
      rotulo('¿Qué son las rayas', 'blancas de los aviones?', lt - .05, RY);
    }
  });

  // ---------- 2 · motor: sale vapor de agua calientito, igual que tu aliento ----------
  escena('motor', {
    setup() { set();
      this.av = PM.estelaAvion([.42, 1.75, .2], { escala: 1.45, n: 4, cara: true });
      this.va = PM.aliento([this.av.salida[0] - .06, this.av.salida[1] + .02, .08], this.av, { n: 6, color: 0xeaf6ff });
      this.oc = PM.ondasCalor([-.32, -.19, .1], this.av, { n: 3, largo: .3, sep: .1, grosor: .035 }); this.oc.rotation.z = Math.PI / 2;
      this.p = nino([-.97, .02, .3], { logo: true, mira: 1, escala: .7, boca: 'abierta' }); this.bu = PM.bufanda(this.p, ROJO);
      this.vp = PM.aliento([.3, -.27, .05], this.p.head, { n: 5 }); },
    update(lt, c) {
      const t = tw(lt), tva = c.w('vapor') - .1, tca = c.w('calientito') - .1, tal = c.w('aliento') - .15;
      this.av.update(t, 0); A.parpadea(this.av, t + .5, .2); this.av.position.y = 1.75 + Math.sin(t * 1.8) * .03; this.av.rotation.z = Math.sin(t * 1.3) * .015;
      this.va.update(t, t > tva ? eout(cl((t - tva) / .3)) : 0, -1, .75, 1.1);
      this.oc.update(t, t > tca ? eout(cl((t - tca) / .3)) : 0);
      A.parpadea(this.p, t + 2.0, .5); respira(this.p, t); this.bu.mece(t);
      this.p.boca(t > tal ? 'abierta' : 'feliz'); this.vp.update(t, t > tal ? eout(cl((t - tal) / .25)) : 0, 1, .8, 1.1);
      if (t < tal) this.p.head.rotation.z = this.p.head.r0 - .15;
      c.ev('whoosh', .05, .5); if (t > tva) c.ev('whoosh', tva, .6); if (t > tca) c.ev('pop', tca, .4); if (t > tal) c.ev('ding', tal, .5);
      cam([lerp(0, .15, ease(lt / 4)), 1.2, lerp(10.9, 10.2, ease(lt / 4))], [lerp(0, .15, ease(lt / 4)), 1.15, 0], 34);
      if (t > tva && t < tal) etiqueta('VAPOR DE AGUA', [.25, .45, .9], lt - tva, 50, '#ffffff', true);
      if (t > tal) etiqueta('¡COMO TU ALIENTO!', [.1, .45, .9], lt - tal, 50, '#ffd640', true);
      rotulo('El motor suelta vapor', 'de agua calientito', lt - .05, RY);
    }
  });

  // ---------- 3 · hielo: más frío que tu congelador → el vapor se vuelve cristalitos de hielo ----------
  escena('hielo', {
    setup() { set(); this.cp = PM.copos({ n: 10, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.rf = PM.refri([-.72, .02, .1], { w: .85, h: 1.55, color: 0xe9eef5 });
      this.te = termo([.78, .25, .3], 1.8);
      this.lu = PM.lupa([0, 1.3, .6], .82, { fondo: 0x9fd0f0, mango: 0x7b5cff }); this.lu.scale.setScalar(.001);
      this.vp = PM.vapor(this.lu.dentro, { n: 15, r: .5 }); this.cr = cristales(this.lu.dentro, 13, .55); },
    update(lt, c) {
      const t = tw(lt), tfr = c.w('frío') - .1, tco = c.w('congelador') - .1, tva = c.w('vapor') - .2, tcr = c.w('cristalitos') - .1, thi = c.w('hielo') - .1;
      this.cp.update(t, 1);
      const kA = sale(t, tva - .1, .3), kB = t < tva ? .001 : pop(t, tva, .4);
      this.rf.scale.setScalar(kA); this.te.scale.setScalar(kA);
      this.rf.abre(eout(cl((t - .2) / .5)) * .7); this.rf.frio(t, 1);
      this.te.nivel(lerp(.8, .03, ease(cl((t - tfr) / 1.6)))); this.te.position.x = .78 + (t > tco ? Math.sin(t * 40) * .01 : 0);
      this.lu.scale.setScalar(kB); this.lu.rotation.z = Math.sin(t * 1.5) * .04;
      const kc = cl((t - tcr) / .6); this.vp.update(t, Math.min(.55, ease(cl((t - tva - .2) / .8)) * .55)); this.vp.scale.setScalar(Math.max(.001, 1 - kc));
      this.cr.forEach((q, i) => { q.scale.setScalar(t > tcr + q.f * .4 ? pop(t, tcr + q.f * .4, .3) * (1 + Math.sin(t * 6 + i) * .12) : .001); q.rotation.z = t * .8 + i; });
      c.ev('whoosh', .05, .4); if (t > tfr) c.ev('whoosh', tfr, .5); if (t > tco) c.ev('ding', tco, .4); if (t > tva) c.ev('pop', tva, .4); if (t > tcr) c.ev('ding', tcr, .6);
      cam([0, 1.2, 10.6], [0, 1.15, 0], 34);
      if (t > .3 && t < tva - .1) etiqueta('CONGELADOR: −18 °C', [-.55, 2.1, .9], lt - .3, 40, '#ffffff', true);
      if (t > tco && t < tva - .1) etiqueta('ALLÁ ARRIBA: −40 °C', [.25, -.2, .9], lt - tco, 44, '#ffd640', true);
      if (t > tcr) etiqueta('¡CRISTALITOS DE HIELO!', [0, 2.45, .9], lt - tcr, 44, '#ffd640', true);
      rotulo(t < tva ? 'Allá arriba: más frío' : 'El vapor se vuelve', t < tva ? 'que tu congelador' : 'cristalitos de hielo', lt - (t < tva ? .05 : tva), RY);
    }
  });

  // ---------- 4 · nube: la raya se vuelve una nube con carita (como tu vaho) ----------
  escena('nube', {
    setup() { set();
      this.av = vuelo(2.3); this.nu = nubeCara([-.2, 2.25, .1], .3, 0xffffff, 2.8); this.nu.scale.setScalar(.001);
      this.p = nino([-.8, .02, .3], { logo: true, mira: 1, escala: .78 }); this.bu = PM.bufanda(this.p, ROJO);
      this.vp = PM.aliento([.3, -.27, .05], this.p.head, { n: 6 }); },
    update(lt, c) {
      const t = tw(lt), tnu = c.w('nube') - .15, tfa = c.w('fabrica') - .1, tvh = c.w('vaho') - .15;
      vuela(this.av, t, .35, .45, -2.2, t < tnu ? 1 : Math.max(.02, 1 - ease(cl((t - tnu) / .5))));
      const kn = pop(t, tnu, .5); this.nu.scale.set(kn, kn, 1); this.nu.position.y = 2.25 + Math.sin(t * 2) * .03;
      A.parpadea(this.nu, t + .3, 1.2); this.nu.cara(t > tfa ? 'abierta' : 'feliz');
      A.parpadea(this.p, t + 1.5, .5); respira(this.p, t); this.bu.mece(t);
      this.p.head.rotation.z = this.p.head.r0 - (t < tvh ? .12 : 0); this.p.boca(t > tvh ? 'abierta' : 'feliz');
      this.vp.update(t, t > tvh ? eout(cl((t - tvh) / .25)) : 0, 1, .9, 1.2);
      c.ev('whoosh', .05, .5); if (t > tnu) c.ev('pop', tnu, .5); if (t > tvh) c.ev('ding', tvh, .5);
      cam([0, 1.2, 10.5], [0, 1.15, 0], 34);
      if (t > tnu && t < tvh) etiqueta('¡NUBE HECHA POR EL AVIÓN!', [.3, .55, .9], lt - tnu, 42, '#ffd640', true);
      if (t > tvh) etiqueta('¡COMO TU VAHO!', [.4, .55, .9], lt - tvh, 50, '#ffd640', true);
      rotulo('Es una nube que', 'fabrica el avión', lt - .05, RY);
    }
  });

  // ---------- 5 · sorpresa: si se borra en segundos, el aire allá arriba está seco ----------
  escena('sorpresa', {
    setup() { set();
      this.so = PM.astro([1.0, 2.25, -.4], .26, 0xffd23d, { rayos: true });
      this.av = vuelo(2.25);
      this.p = nino([-.95, .02, .3], { logo: true, mira: 1, escala: .76 }); },
    update(lt, c) {
      const t = tw(lt), tfi = c.w('fíjate') - .1, tbo = c.w('borran') - .1, tse = c.w('seco') - .15;
      vuela(this.av, t, -1.1, .55, -2.2, .2);
      this.so.rayos.rotation.z = t * .5; A.parpadea(this.so, t + .8, .4);
      A.parpadea(this.p, t + 2.4, .2); respira(this.p, t);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.2, eout(cl((t - tfi) / .35))) + Math.sin(t * 3) * .05;
      this.p.head.rotation.z = this.p.head.r0 - .1 - .1 * Math.sin(t * .9); this.p.boca(t > tbo && t < tbo + 1 || t > tse ? 'abierta' : 'feliz');
      c.ev('whoosh', .05, .5); if (t > tfi) c.ev('pop', tfi, .3); if (t > tbo) c.ev('whoosh', tbo, .5); if (t > tse) c.ev('ding', tse, .5);
      cam([0, 1.2, 10.6], [0, 1.15, 0], 34);
      if (t > tbo && t < tse) etiqueta('¡SE BORRA EN SEGUNDOS!', [.35, .55, .9], lt - tbo, 42, '#ffffff', true);
      if (t > tse) etiqueta('¡AIRE SECO!', [.4, .55, .9], lt - tse, 56, '#ffd640', true);
      rotulo('Si se borra rápido…', 'allá arriba está seco', lt - .05, RY);
    }
  });

  // ---------- 6 · humedad: la raya se queda y se esparce; llegan nubes grises ----------
  escena('humedad', {
    setup() { set();
      this.av = vuelo(2.3);
      this.gr = [[1.0, 2.25, .38], [1.35, 1.75, .3]].map(([x, y, r], i) => { const n = nubeCara([x + 1.6, y, .05 - i * .02], r, 0x9aa3b5, 1.4, 0x7f889c); n.x0 = x; return n; });
      this.go = Array.from({ length: 8 }, (_, i) => { const d = PM.pz(F.gota(.09), 0x5aa9ff, [0, 0, .1], null, { tinta: .008, papel: .02 }); d.f = i / 8; d.visible = false; return d; });
      this.p = nino([-.95, .02, .3], { logo: true, mira: 1, escala: .76 }); },
    update(lt, c) {
      const t = tw(lt), tqu = c.w('quedan') - .1, thu = c.w('humedad') - .1, tca = c.w('cambio') - .15, tcl = c.w('clima') - .1;
      vuela(this.av, t, -.3, .5, -2.2, 1, ease(cl((t - thu + .3) / 2.2)) * .85);
      this.gr.forEach((n, i) => { n.position.x = lerp(n.x0 + 1.6, n.x0, eout(cl((t - tca + .2 - i * .15) / .8))); n.position.y += Math.sin(t * 2 + i) * .002; A.parpadea(n, t + i, .5); n.cara(t > tcl ? 'triste' : 'duda'); });
      this.go.forEach((d, i) => { const q = (t * 1.1 + d.f) % 1; d.visible = t > tcl; d.position.set(.65 + (i % 4) * .2 + (i > 3 ? .1 : 0), 1.75 - q * 1.3, .1); d.rotation.z = Math.PI; d.scale.setScalar(Math.min(1, (1 - q) * 4)); });
      A.parpadea(this.p, t + .9, .8); respira(this.p, t);
      this.p.head.rotation.z = this.p.head.r0 - .12 + Math.sin(t * 1.4) * .04; this.p.boca(t > tca ? 'abierta' : 'feliz'); A.preocupa(this.p, t > tca ? .8 : 0);
      c.ev('whoosh', .05, .5); if (t > thu) c.ev('whoosh', thu, .6); if (t > tca) c.ev('whoosh', tca, .5); if (t > tcl) c.ev('pop', tcl, .4);
      cam([0, 1.2, 10.6], [0, 1.15, 0], 34);
      if (t > tqu && t < thu) etiqueta('¡SE QUEDA HORAS!', [.3, .55, .9], lt - tqu, 48, '#ffffff', true);
      if (t > thu && t < tca) etiqueta('¡MUCHA HUMEDAD!', [.3, .55, .9], lt - thu, 50, '#ffd640', true);
      if (t > tca) etiqueta('¿CAMBIO DE CLIMA?', [.3, .55, .9], lt - tca, 48, '#ffd640', true);
      rotulo('Si se queda horas…', 'hay mucha humedad', lt - .05, RY);
    }
  });

  // ---------- 7 · mito: ¿químicos para fumigar? 76 de 77 expertos: ninguna prueba ----------
  escena('mito', {
    setup() { set();
      this.av = PM.estelaAvion([-.1, 1.9, .2], { escala: 1.45, n: 4, cara: true });
      this.ta = PM.letrero([.02, -.55, .1], 'QUÍMICOS', { w: 1.0, h: .3, borde: 0x6acc3a, color: 0xeaffd8 }, this.av);
      this.m = PM.marca([.95, 1.0, .7], false, .001);
      this.pe = PM.personitas([-.08, 1.33, .3], 77, { porFila: 11, sep: .2, s: .58, color: VERDE }); this.pe.scale.setScalar(.001);
      this.ci = nino([1.2, .02, .45], { ropa: 0xffffff, pantalon: 0x3a4a6a, tenis: 0x2b2f4a, lentes: 0x2a1f2e, colPelo: 0x6a4a2a, mira: -1, escala: .55 }); this.ci.scale.set(.001, .001, .001); },
    update(lt, c) {
      const t = tw(lt), tfu = c.w('fumigar') - .1, tse = c.w('setenta') - .15, tex = c.w('expertos') - .1, t76 = c.w('setenta', 1) - .1, tpr = c.w('prueba') - .15;
      const kA = sale(t, tse - .15, .3);
      this.av.update(t, 0); this.av.scale.setScalar(1.45 * kA); A.parpadea(this.av, t + .6, .3); this.av.position.y = 1.9 + Math.sin(t * 1.8) * .03;
      this.av.head.ojos.forEach(e => e.scale.y = t > tfu ? .55 : e.scale.y); this.ta.columpia(t, .06);
      this.m.scale.setScalar(pop(t, tfu, .35) * 1.1 * kA);
      const kB = t < tse ? .001 : pop(t, tse, .4); this.pe.scale.setScalar(kB); this.pe.position.y = 1.33 + Math.sin(t * 2.2) * .015;
      this.pe.marca(t < t76 ? 0 : Math.min(76, 76 * ease(cl((t - t76) / .7))), t);
      const es = .45 * pop(t, tex, .35); this.ci.scale.set(es, es, es * .2); A.parpadea(this.ci, t + 1.2, .4); respira(this.ci, t, .02);
      this.ci.boca(t > tpr ? 'abierta' : 'feliz'); this.ci.brazos[1].rotation.z = t > tpr ? lerp(this.ci.brazos[1].r0, 2.4, eout(cl((t - tpr) / .3))) : this.ci.brazos[1].r0;
      c.ev('whoosh', .05, .4); if (t > tfu) c.ev('impact', tfu, .4); if (t > tse) c.ev('whoosh', tse, .5); if (t > tex) c.ev('pop', tex, .3);
      if (t > t76) c.ev('pop', t76, .4); if (t > tpr) c.ev('ding', tpr, .6);
      cam([0, 1.2, 10.6], [0, 1.15, 0], 34);
      if (t > tfu && t < tse - .1) etiqueta('¿NOS FUMIGAN?', [0, 2.5, .9], lt - tfu, 54, '#ffffff', true);
      if (t > tex && t < t76) etiqueta('77 EXPERTOS', [0, 2.5, .9], lt - tex, 50, '#ffffff', true);
      if (t > t76 && t < tpr) etiqueta('¡76 DE 77!', [0, 2.5, .9], lt - t76, 56, '#ffd640', true);
      if (t > tpr) etiqueta('¡NINGUNA PRUEBA!', [0, 2.5, .9], lt - tpr, 52, '#ffd640', true);
      rotulo(t < tse ? '¿Químicos para fumigar?' : '76 de 77 expertos:', t < tse ? 'el famoso mito' : 'ninguna prueba', lt - (t < tse ? .05 : tse), RY);
    }
  });

  // ---------- 8 · remate: el amigo del gorro de aluminio se lo quita apenado; el protagonista manda el avioncito ----------
  escena('remate', {
    setup() { set();
      this.av = vuelo(2.35, { escala: .45 });
      this.a = nino([-.62, .02, .38], { ropa: 0x7b5cff, pantalon: 0x3a4a6a, tenis: AMARILLO, colPelo: 0x2a1a12, mira: 1, escala: .82 }); this.go = gorroAlu(this.a);
      this.p = PM.chibi([.72, .02, .3], { logo: true, boca: 'feliz', mira: -1, escala: .82 });
      this.pa = PM.avion([.72, 1.3, .9], .45); },
    update(lt, c) {
      const t = tw(lt), tma = c.w('Mándaselo') - .1, tju = c.w('jura') - .1, tfu = c.w('fumigan') - .2;
      vuela(this.av, t, -.6, .5);
      A.parpadea(this.a, t + .6, .4); A.parpadea(this.p, t + 2.0, 1.6); respira(this.p, t); respira(this.a, t, .02, 1);
      // el amigo jura señalando al cielo; luego se quita el gorro apenado
      const kq = ease(cl((t - tfu) / .45));
      this.a.brazos[1].rotation.z = t < tfu ? lerp(this.a.brazos[1].r0, 2.4, eout(cl((t - tju) / .3))) + Math.sin(t * 6) * .06 : lerp(2.4, 2.9, kq);
      this.go.position.set(.12 * kq, .35 * kq, .07); this.go.rotation.z = -.45 * kq;
      this.a.boca(t > tfu ? 'apretada' : t > tju ? 'abierta' : 'feliz'); A.preocupa(this.a, t > tfu ? .9 : 0); if (t > tfu) A.ladea(this.a, .3 * kq, -1);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.3, eout(cl((t - tma) / .3))) - lerp(0, 1.2, ease(cl((t - tma - .4) / .3)));
      const kv = cl((t - tma - .45) / 1.4); this.pa.visible = t > tma + .45 && kv < 1; this.pa.position.set(lerp(.7, -.35, ease(kv)), 1.5 + Math.sin(kv * Math.PI) * .75, .9); this.pa.scale.set(-.6, .6, .6); this.pa.rotation.z = -.2 + kv * .3;
      c.ev('whoosh', .05, .4); if (t > tma + .45) c.ev('whoosh', tma + .45, .5); if (t > tju) c.ev('pop', tju, .3); if (t > tfu) c.ev('ding', tfu, .4);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.2))], [0, 1.15, 0], 34);
      if (t > tju && t < tfu) etiqueta('¡NOS FUMIGAN!', [.05, .5, .9], lt - tju, 46, '#ffffff', true);
      if (t > tfu) etiqueta('UPS…', [.05, .5, .9], lt - tfu, 52, '#ffd640', true);
      rotulo('Mándaselo al que jura', 'que nos fumigan', lt - .05, RY);
    }
  });
  P.cierre();
}
