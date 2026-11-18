// Short 17-nov 21:30 · CARTULINA CHIBI: ¿Por qué la Luna se ve enorme cuando apenas va saliendo? (ilusión lunar: mide casi igual; el cerebro la compara con casas y árboles; truco del pulgar)
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-17-2130-luna-gigante.json OUT ../ejemplos/2026-11-17-2130-luna-gigante.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, NOCHE = 0x27306e;
  const noche = () => { ambiente({ top: NOCHE, bottom: NOCHE, fog: NOCHE, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); const n = PM.nocheCalle(); P.luces({ pos: [-3, 5, 8], hemi: 1.6, sol: 1.4, radio: 6 }); return n; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 6 + f) * .05; };
  const ZL = -2.8;

  // ---------- 1 · gancho: Luna naranja enorme saliendo detrás de las casas ----------
  escena('gancho', {
    setup() { this.n = noche();
      this.l = PM.luna([.45, -.6, ZL], 1.05, { color: 0xffa64d });
      this.p = PM.chibi([-.88, 0, .3], { logo: true, boca: 'abierta', mira: 1, escala: .82 }); },
    update(lt, c) {
      const t = tw(lt), te = c.w('enorme') - .1;
      this.n.update(t); A.parpadea(this.p, t + 1.1, .4);
      // la Luna sale despacio detrás de las casas
      this.l.position.y = lerp(.8, 1.55, eout(cl(t / 1.6))) + Math.sin(t * 1.5) * .02;
      // boquiabierto: brazo señalando y cabeza que se echa para atrás al ver lo enorme
      const kb = eout(cl((t - .15) / .4)); this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.0, kb) + Math.sin(t * 5) * .05;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      this.p.head.rotation.z = this.p.head.r0 - .12 * eout(cl((t - te) / .3)) + Math.sin(t * 4) * .03;
      A.preocupa(this.p, .6 * eout(cl((t - te) / .3)));
      this.p.position.y = t > te && t < te + .5 ? Math.sin((t - te) / .5 * Math.PI) * .12 : 0;
      if (t > te) c.ev('ding', te, .5); c.ev('whoosh', 0, .5);
      cam([.0, 1.2, lerp(10.9, 10.3, ease(lt / 3))], [.0, 1.15, 0], 34);
      if (t > te) etiqueta('¡ENORME!', [.0, -.2, .7], lt - te, 60, '#ffd640', true);
      rotulo('¿Por qué la Luna se ve', 'enorme al salir?', lt - .05, RY);
    }
  });

  // ---------- 2 · mito: en fotos mide casi igual abajo que arriba ----------
  escena('mito', {
    setup() { this.n = noche();
      this.p = PM.chibi([-1.0, 0, .3], { logo: true, boca: 'feliz', mira: 1, escala: .72 });
      this.f1 = PM.fotoNoche([.02, 1.62, .6], { w: .8, h: 1.02, lunaY: .32, lunaR: .1, texto: 'ABAJO' });
      this.f2 = PM.fotoNoche([.92, 1.62, .6], { w: .8, h: 1.02, lunaY: .8, lunaR: .1, texto: 'ARRIBA' });
      this.rg = PM.regla([0, 0, 0], .2); },
    update(lt, c) {
      const t = tw(lt), tf = c.w('fotos') - .2, tm = c.w('mide') - .1, ti = c.w('igual') - .1;
      this.n.update(t); A.parpadea(this.p, t, 1.4); habla(this.p, t);
      this.p.boca(t < ti + .3 ? 'abierta' : 'feliz');
      // "no": dedito; luego señala las fotos
      const kn = eout(cl((t - .05) / .3)) * (1 - eout(cl((t - tf) / .3)));
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.1, eout(cl((t - tf) / .35))) + kn * (1.9 + Math.sin(t * 10) * .14);
      // fotos que caen columpiándose
      [this.f1, this.f2].forEach((f, i) => { const k = pop(t, tf + i * .15, .4); f.scale.setScalar(k); f.rotation.z = (i ? -.06 : .06) + Math.sin(t * 2 + i) * .03; });
      // la regla mide la Luna de abajo y luego se va a la de arriba: misma medida
      const L1 = this.f1.luna.getWorldPosition(new THREE.Vector3()), L2 = this.f2.luna.getWorldPosition(new THREE.Vector3());
      const km = eout(cl((t - ti) / .4)); this.rg.position.set(lerp(L1.x, L2.x, km), lerp(L1.y, L2.y, km) - .13 - Math.sin(km * Math.PI) * .1, .72);
      this.rg.scale.setScalar(pop(t, tm, .3));
      if (t > tf) c.ev('whoosh', tf, .4); if (t > tm) c.ev('pop', tm, .4); if (t > ti + .4) c.ev('ding', ti + .4, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t < tf) etiqueta('NO ESTÁ MÁS CERCA', [.0, -.2, .7], lt - .1, 44, '#ffffff', true);
      if (t > ti + .4) etiqueta('¡CASI IGUAL!', [.0, -.2, .7], lt - ti - .4, 54, '#ffd640', true);
      rotulo('No está más cerca:', 'en fotos mide casi igual', lt - .05, RY);
    }
  });

  // ---------- 3 · cerebro: la compara con casas y árboles y la siente gigante ----------
  escena('cerebro', {
    setup() { this.n = noche();
      this.p = PM.chibi([-1.02, 0, .3], { logo: true, boca: 'feliz', mira: 1, escala: .72 });
      const b = this.b = group([.42, 1.78, .5]);
      PM.pz(P.F.rect(1.9, 1.3, .45), 0xffffff, [0, 0, 0], b, { tinta: .02, papel: .06 });
      this.bol = [[-.58, .92, .07], [-.72, 1.18, .1]].map(([x, y, r]) => PM.pz(P.F.circ(r), 0xffffff, [x, y, .5], null, { tinta: .016, papel: .04 }));
      PM.det(P.F.rect(1.66, 1.06, .32), NOCHE, [0, 0, .02], b);
      this.cb = PM.cerebro([-.5, -.08, .05], .27); b.add(this.cb);
      this.casas = [[.05, .22, 0x6d5aa0], [.3, .3, 0x5a4f8f], [.55, .2, 0x7a5f9e]].map(([x, h, c]) => { const g = group([x, -.53, .04], b);
        PM.det(P.F.rect(.22, h, .01), c, [0, h / 2, 0], g); PM.det(P.F.rect(.07, .08, 0), 0xffd36b, [0, h * .45, .003], g); return g; });
      this.arb = [[-.12, .14], [.72, .12]].map(([x, r]) => { const g = group([x, -.53, .045], b); PM.det(P.F.rect(.03, .12, 0), 0x6a5a6a, [0, .06, 0], g); PM.det(P.F.circ(r), 0x3f7a6a, [0, .12 + r, .002], g); return g; });
      this.l = PM.luna([.42, .08, .03], .12, { halo: false }); b.add(this.l); this.l.scale.setScalar(1); },
    update(lt, c) {
      const t = tw(lt), ti = c.w('ilusión:') - .15, tc = c.w('cerebro') - .1, tk = c.w('casas') - .1, ta = c.w('árboles') - .1, tg = c.w('siente') - .1, tG = c.w('gigante.') - .1;
      this.n.update(t); A.parpadea(this.p, t + .5, .8); habla(this.p, t);
      this.p.boca(t > tG ? 'abierta' : 'feliz'); A.preocupa(this.p, .5 * eout(cl((t - tG) / .3)));
      // se rasca la cabeza pensando
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.6, eout(cl((t - .1) / .4))) + Math.sin(t * 9) * .1;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      // burbuja de pensamiento
      const kb = pop(t, ti, .4); this.b.scale.setScalar(kb); this.b.rotation.z = Math.sin(t * 1.8) * .02;
      this.bol.forEach((o, i) => o.scale.setScalar(pop(t, ti - .2 + (1 - i) * .1, .3)));
      // cerebro con ojitos: mira casas, árboles y la Luna
      A.parpadea(this.cb, t, 2.2); this.cb.position.y = -.08 + Math.sin(t * 4) * .025; this.cb.cara(t > tG ? 'abierta' : 'feliz');
      this.cb.head.rotation.z = Math.sin(t * 2) * .06; this.cb.scale.setScalar(t > tc ? 1 + .12 * Math.max(0, Math.sin((t - tc) * Math.PI / .4)) * (t < tc + .4) : 1);
      // casas y árboles brincan cuando los nombra; la Luna se infla SOLO en la burbuja
      this.casas.forEach((g, i) => g.scale.setScalar(t > tk + i * .08 && t < tk + i * .08 + .35 ? 1 + .25 * Math.sin((t - tk - i * .08) / .35 * Math.PI) : 1));
      this.arb.forEach((g, i) => g.scale.setScalar(t > ta + i * .08 && t < ta + i * .08 + .35 ? 1 + .3 * Math.sin((t - ta - i * .08) / .35 * Math.PI) : 1));
      const kg = spring(cl((t - tg) / .5), 1.3, 6); this.l.scale.setScalar(1 + 1.7 * kg); this.l.position.y = .08 + .1 * kg;
      if (t > ti) c.ev('pop', ti, .4); if (t > tk) c.ev('pop', tk, .3); if (t > ta) c.ev('pop', ta, .3); if (t > tg) c.ev('whoosh', tg, .5); if (t > tG) c.ev('ding', tG, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > ti && t < tk) etiqueta('¡ILUSIÓN!', [.0, -.2, .7], lt - ti, 56, '#ffd640', true);
      if (t > tk && t < tg) etiqueta('CASAS Y ÁRBOLES', [.0, -.2, .7], lt - tk, 46, '#ffffff', true);
      if (t > tg) etiqueta('¡LA VES GIGANTE!', [.0, -.2, .7], lt - tg, 48, '#ffd640', true);
      rotulo('Tu cerebro la compara', 'con casas y árboles', lt - .05, RY);
    }
  });

  // ---------- 4 · truco: tápala con el pulgar, abajo y arriba (primera persona) ----------
  escena('truco', {
    setup() { this.n = noche();
      this.l = PM.luna([.3, 1.2, ZL], .26, { haloR: 1.75 });
      this.m = PM.manoPulgar([0, 0, 2], 1.45); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('tápala') - .05, ta = c.w('abajo') - .1, tr = c.w('arriba,') - .25, ti = c.w('igual.') - .1;
      this.n.update(t);
      // la Luna sube (como si pasaran horas)
      const ks = ease(cl((t - tr) / .55)); this.l.position.set(lerp(.3, .5, ks), lerp(1.2, 3.0, ks), ZL);
      // el pulgar va siempre sobre la Luna (proyección desde la cámara)
      const C = new THREE.Vector3(.0, 1.2, 10.4), L = this.l.position, z = 2, k = (z - C.z) / (L.z - C.z);
      const px = C.x + (L.x - C.x) * k, py = C.y + (L.y - C.y) * k + .1;
      const ke = eout(cl((t - c.w('pulgar;') + .45) / .5)), lag = t > tr ? Math.sin(cl((t - tr) / .6) * Math.PI) * .12 : 0;
      this.m.position.set(px + (1 - ke) * 1.4, py - (1 - ke) * 2.6 - lag, z); this.m.rotation.z = (1 - ke) * -.25 + Math.sin(t * 2) * .015;
      if (t > c.w('pulgar;') - .45) c.ev('whoosh', c.w('pulgar;') - .45, .4); if (t > ta) c.ev('pop', ta, .3); if (t > tr) c.ev('whoosh', tr, .4); if (t > ti) c.ev('ding', ti, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t < ta) etiqueta('TRUCO', [-.75, 2.3, .7], lt - .05, 54, '#ffd640', true);
      else if (t < ti) etiqueta('¡LA TAPA!', [-.75, 2.3, .7], lt - ta, 54, '#ffffff', true);
      else etiqueta('¡IGUAL!', [-.75, 2.3, .7], lt - ti, 56, '#ffd640', true);
      rotulo('Tápala con tu pulgar', 'abajo y arriba: igual', lt - .05, RY);
    }
  });

  // ---------- 5 · remate: le toma foto a la Luna y le sale chiquita ----------
  escena('remate', {
    setup() { this.n = noche();
      this.l = PM.luna([.55, 1.1, ZL], .9, { color: 0xffa64d });
      this.p = PM.chibi([-.82, 0, .3], { logo: true, boca: 'feliz', mira: 1, escala: .82 });
      this.tel = PM.celular([0, -.62, .14], { h: .5, cara: 'ninguna', pct: 80 }, this.p.brazos[1]);
      this.f = PM.fotoNoche([.62, 1.45, .8], { w: .82, h: 1.04, lunaY: .45, lunaR: .045, texto: 'MI FOTO' });
      this.fl = PM.pz(P.F.estrella(8, .32, .14), 0xffffff, [-.2, 1.75, .9], null, { tinta: .014, papel: false }); },
    update(lt, c) {
      const t = tw(lt), tf = c.w('foto') - .05, ts = c.w('sale') - .2, tc = c.w('chiquita.') - .1;
      this.n.update(t); A.parpadea(this.p, t, .3);
      const b = this.p.brazos[1]; b.rotation.z = lerp(b.r0, 1.0, eout(cl((t - .05) / .35))) + Math.sin(t * 3) * .03; this.tel.rotation.z = -b.rotation.z;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3 + 1) * .03;
      // ¡clic! flash
      this.fl.visible = t > tf && t < tf + .25; this.fl.scale.setScalar(.6 + 2 * cl((t - tf) / .25)); this.fl.rotation.z = t;
      // sale la foto con la Luna chiquita → se ríe
      this.f.scale.setScalar(pop(t, ts, .4)); this.f.rotation.z = -.08 + Math.sin(t * 2) * .03;
      this.p.boca(t < tf ? 'feliz' : t < tc ? 'abierta' : 'feliz'); A.preocupa(this.p, t > ts && t < tc + .2 ? .8 : 0);
      this.p.head.rotation.z = this.p.head.r0 + (t > tc + .2 ? Math.sin(t * 9) * .07 : Math.sin(t * 2.5) * .04);
      if (t > tc + .2) this.p.brazos[0].rotation.z = -lerp(-this.p.brazos[0].r0, 2.0, eout(cl((t - tc - .2) / .3))) + Math.sin(t * 6) * .05;
      c.ev('whoosh', .05, .4); if (t > tf) c.ev('pop', tf, .4); if (t > ts) c.ev('pop', ts, .4); if (t > tc) c.ev('ding', tc, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t < tf) etiqueta('MÁNDASELO', [-.1, -.2, .7], lt - .1, 50, '#ffd640', true);
      else if (t < tc) etiqueta('¡CLIC!', [-.1, -.2, .7], lt - tf, 54, '#ffffff', true);
      else etiqueta('¡CHIQUITA!', [-.1, -.2, .7], lt - tc, 56, '#ffd640', true);
      rotulo('Mándaselo a quien le', 'sale chiquita en la foto', lt - .05, RY);
    }
  });
  P.cierre();
}
