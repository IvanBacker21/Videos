// Short 15-nov 21:30 · CARTULINA CHIBI: ¿Por qué con el frío tu celular se apaga aunque tenía batería?
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-15-2130-celular-frio.json OUT ../ejemplos/2026-11-15-2130-celular-frio.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xcfe6f2, PARED = 0xf6d7b8;
  const amb = (c) => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const luz = () => luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, fase = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + fase) * .05; };
  const nieve = () => { amb(CIELO); PM.diorama(); luz(); return PM.copos({ n: 14, x0: -1.7, x1: 1.7, y0: .0, y1: 2.9 }); };
  const flota = (g, t, y0, f = 0) => { g.position.y = y0 + Math.sin(t * 2.2 + f) * .03; g.rotation.z = Math.sin(t * 1.7 + f) * .04; };

  // ---------- 1 · gancho: con el frío el celular se apaga aunque tenía 40 % ----------
  escena('gancho', {
    setup() { this.cp = nieve();
      this.p = PM.chibi([-.78, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .9 }); this.bu = PM.bufanda(this.p, 0xff6b5b);
      this.ce = PM.celular([.22, 1.2, .5], { h: 1.15, pct: 40 }); this.ce.rotation.z = -.06; },
    update(lt, c) {
      const t = tw(lt), ta = c.w('apaga') - .1, tb = c.w('batería') - .1; this.cp.update(t);
      A.parpadea(this.p, t, 1.1); A.tiembla(this.p, t, t < ta ? .6 : .9, -.78); this.bu.mece(t);
      A.preocupa(this.p, t < ta ? .4 : 1); this.p.boca(t < ta ? 'apretada' : 'abierta');
      this.p.head.rotation.z = this.p.head.r0 + (t > ta ? -.1 : 0) + Math.sin(t * 3) * .04;
      this.p.brazos[1].rotation.z = 1.25 + Math.sin(t * 3) * .04; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 2.5) * .05;
      this.ce.apaga(t > ta); this.ce.frio(cl(t / 2)); flota(this.ce, t, 1.2);
      if (t > ta) { const k = cl((t - ta) / .25); this.ce.position.x = .22 + Math.sin(t * 45) * .03 * (1 - k); }
      c.ev('whoosh', .05, .5); if (t > ta) c.ev('pop', ta, .4); if (t > tb) c.ev('ding', tb, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > ta) etiqueta('¡SE APAGÓ!', [.7, .3, .7], lt - ta, 50, '#ffd640', true);
      if (t > tb) etiqueta('¡TENÍA 40%!', [-.75, -.28, .7], lt - tb, 44, '#ffffff', true);
      rotulo('¿Con el frío tu celular', 'se apaga solito?', lt + .4, RY);
    }
  });

  // ---------- 2 · la batería es una reacción química y el frío la vuelve lenta ----------
  escena('pila', {
    setup() { this.cp = nieve();
      this.p = PM.chibi([-1.0, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .85 }); this.bu = PM.bufanda(this.p, 0xff6b5b);
      this.lu = PM.lupa([.52, 1.55, .4], .85, { fondo: 0xfff4e4 }); this.pi = PM.pilaIones([0, 0, 0], { w: 1.15, h: .62 }, this.lu.dentro);
      this.mi = PM.astro([1.15, .2, .6], .22, 0xffb52e, { expr: 'feliz', forma: F.gota(.62) }); },
    update(lt, c) {
      const t = tw(lt), tr = c.w('reacción') - .25, tf = c.w('frío') - .15, tl = c.w('lenta') - .15, tm = c.w('miel') - .2; this.cp.update(t);
      A.parpadea(this.p, t, 1.6); habla(this.p, t); A.tiembla(this.p, t, t > tf ? .5 : .2, -1.0); this.bu.mece(t);
      this.p.boca(t > tl ? 'apretada' : 'abierta'); A.preocupa(this.p, t > tf ? .8 : .1);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.05, eout(cl((t - .2) / .4))) + Math.sin(t * 4) * .05; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04;
      this.lu.scale.setScalar(pop(t, .1, .35)); this.lu.rotation.z = Math.sin(t * 1.6) * .03;
      const kf = eout(cl((t - tf) / .6)); this.pi.update(t, lerp(1.4, .12, kf)); this.pi.frio(kf);
      this.mi.scale.setScalar(pop(t, tm, .35)); this.mi.rotation.z = Math.sin(t * 2) * .06; A.parpadea(this.mi, t, .4);
      c.ev('pop', .1, .4); if (t > tf) c.ev('whoosh', tf, .5); if (t > tm) c.ev('pop', tm, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tr && t < tf) etiqueta('REACCIÓN QUÍMICA', [.45, .45, .7], lt - tr, 40, '#ffffff', true);
      if (t > tl) etiqueta('¡LENTA!', [.2, .3, .7], lt - tl, 50, '#8fd3ff', true);
      if (t > tm) etiqueta('COMO MIEL', [-.85, -.28, .7], lt - tm, 44, '#ffd640', true);
      if (t < tf) rotulo('Su batería es una', 'reacción química', lt - .1, RY); else rotulo('El frío la vuelve', 'lenta como miel', lt - tf, RY);
    }
  });

  // ---------- 3 · el celular cree que no tiene carga y se apaga ----------
  escena('engano', {
    setup() { this.cp = nieve();
      this.p = PM.chibi([-1.08, .02, .3], { logo: true, boca: 'apretada', mira: 1, escala: .8 }); this.bu = PM.bufanda(this.p, 0xff6b5b);
      this.ce = PM.celular([.42, 1.35, .5], { h: 1.6, pct: 40, cara: 'feliz' }); this.ce.frio(.6); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('cree') - .15, tg = c.w('carga') - .1, ta = c.w('apaga') - .1; this.cp.update(t);
      A.parpadea(this.p, t, .3); A.tiembla(this.p, t, .5, -1.08); this.bu.mece(t); A.preocupa(this.p, 1); this.p.boca(t > ta ? 'abierta' : 'apretada');
      this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 3) * .05; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + Math.sin(t * 3) * .05; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - Math.sin(t * 3) * .05;
      const kc = ease(cl((t - tc) / (tg - tc + .2))); this.ce.pct(lerp(40, 0, kc)); this.ce.apaga(t > ta);
      this.ce.cara(t > ta ? 'ninguna' : t > tc ? 'triste' : 'feliz'); A.parpadea(this.ce, t, .8); flota(this.ce, t, 1.35, 1);
      if (t > tc) c.ev('whoosh', tc, .6); if (t > ta) c.ev('pop', ta, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tg && t < ta) etiqueta('¿VACÍO?', [.42, 2.35, .7], lt - tg, 46, '#ffffff', true);
      if (t > ta) etiqueta('¡FALSO 0%!', [.42, -.28, .7], lt - ta, 50, '#ffd640', true);
      rotulo(t < ta ? 'Cree que ya' : 'y se apaga', t < ta ? 'no tiene carga' : 'solito', t < ta ? lt - .1 : lt - ta, RY);
    }
  });

  // ---------- 4 · la carga no se perdió: con calor el porcentaje regresa ----------
  escena('regresa', {
    setup() { amb(PARED); this.cu = PM.cuarto({ ventana: [-1.0, 2.05], abierta: .4, cuadro: [1.45, 2.1, -2.6] }); luz();
      this.p = PM.chibi([-.95, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .82 });
      this.so = PM.astro([.45, 1.35, .3], .95, 0xffd25e, { rayos: true, cara: false });
      this.ce = PM.celular([.45, 1.35, .5], { h: 1.3, pct: 0, cara: 'ninguna' }); this.ce.apaga(true); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('perdió') - .2, tca = c.w('calienta') - .2, tr = c.w('regresa') - .2; this.cu.update(t); this.cu.ventana.abre(.4, t);
      A.parpadea(this.p, t, 2.1); habla(this.p, t); this.p.boca(t > tr ? 'feliz' : 'abierta'); A.preocupa(this.p, t < tca ? .3 : 0);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.0, eout(cl((t - .2) / .4))) + Math.sin(t * 4) * .05; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04;
      const kw = cl((t - tca) / .5); this.so.scale.setScalar(pop(t, tca, .4)); this.so.rayos.rotation.z = t * .6;
      this.ce.frio(.6 * (1 - kw));
      if (t < tca + .3) this.ce.apaga(true); else { this.ce.pct(lerp(0, 40, ease(cl((t - tca - .3) / (tr - tca + .1))))); this.ce.cara(t > tr ? 'feliz' : 'ninguna'); }
      A.parpadea(this.ce, t, 1.7); flota(this.ce, t, 1.35, 2);
      if (t > tp) c.ev('pop', tp, .4); if (t > tca) c.ev('whoosh', tca, .5); if (t > tr) c.ev('ding', tr, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tp && t < tca) etiqueta('¡NO SE PERDIÓ!', [.45, -.28, .7], lt - tp, 44, '#ffffff', true);
      if (t > tca && t < tr) etiqueta('CALORCITO', [.45, -.28, .7], lt - tca, 46, '#ffd640', true);
      if (t > tr) etiqueta('¡REGRESA!', [.45, -.28, .7], lt - tr, 52, '#ffd640', true);
      rotulo(t < tca ? 'La carga' : 'Al calentarse', t < tca ? 'no se perdió' : 'el porcentaje regresa', t < tca ? lt - .1 : lt - tca, RY);
    }
  });

  // ---------- 5 · truco: llévalo pegado al cuerpo · mándaselo ----------
  escena('remate', {
    setup() { this.cp = nieve();
      this.p = PM.chibi([-.85, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .85 }); this.bu = PM.bufanda(this.p, 0xff6b5b);
      this.ce = PM.celular([0, 0, .5], { h: .5, pct: 40, cara: 'feliz' });
      this.bo = PM.pz(F.rect(.4, .24, .05), 0x2c4fd0, [-.85 + .02, .62, .62], null, { tinta: .012, papel: .04 }); this.bo.visible = false;
      this.co = PM.pz(F.corazon(.3), 0xff5d8f, [-.6, 1.25, .7], null, { tinta: .012, papel: .04 });
      this.a = PM.chibi([.88, .02, .3], { ropa: 0x2ec4a6, pelo: 'cola', colPelo: 0x1f1410, boca: 'apretada', escala: .82 }); this.bu2 = PM.bufanda(this.a, 0xffc83d, 0x7b5cff);
      this.c2 = PM.celular([.36, 1.0, .55], { h: .5, pct: 0 }); this.c2.apaga(true); this.c2.frio(.6); this.c2.rotation.z = .2; },
    update(lt, c) {
      const t = tw(lt), tl = c.w('llévalo') - .1, tcu = c.w('cuerpo') - .3, tm = c.w('mándaselo') - .2, tmu = c.w('muerto') - .2; this.cp.update(t);
      A.parpadea(this.p, t, .5); habla(this.p, t); this.bu.mece(t); this.p.boca(t > tcu ? 'feliz' : 'abierta');
      // el celular viaja de la mano a la bolsa del pecho
      const kg = ease(cl((t - tl) / (tcu - tl + .1)));
      const x = lerp(-.1, -.83, kg), y = lerp(1.15, .78, kg); this.ce.position.set(x, y + Math.sin(t * 3) * .02 * (1 - kg), .5); this.ce.rotation.z = lerp(-.15, 0, kg);
      this.bo.visible = kg > .6; this.ce.cara('feliz'); A.parpadea(this.ce, t, .9);
      if (t < tm) this.p.brazos[1].rotation.z = lerp(1.0, this.p.brazos[1].r0, kg) + Math.sin(t * 3) * .04;
      else this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.1, eout(cl((t - tm) / .35))) + Math.sin(t * 4) * .05;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04;
      this.co.scale.setScalar(t > tcu ? pop(t, tcu, .35) * (1 + Math.sin(t * 8) * .06) : .001); this.co.position.y = 1.25 + Math.sin(t * 2) * .04;
      // amiga con el celular muerto, temblando
      const vis = t > tm - .3; this.a.visible = vis; this.c2.visible = vis; this.bu2.visible = vis;
      this.a.scale.setScalar(.82 * Math.min(1, pop(t, tm - .3, .35))); this.a.scale.z = .82 * .2;
      A.parpadea(this.a, t, 1.3); A.tiembla(this.a, t, .8, .88); A.preocupa(this.a, 1); this.bu2.mece(t);
      this.a.brazos[0].rotation.z = -1.0 + Math.sin(t * 3) * .04; this.a.brazos[1].rotation.z = this.a.brazos[1].r0 + Math.sin(t * 2.5) * .04;
      this.c2.scale.setScalar(Math.min(1, pop(t, tm - .2, .35))); this.c2.position.x = .36 + Math.sin(t * 60) * .02;
      if (t > tl) c.ev('whoosh', tl, .5); if (t > tcu) c.ev('ding', tcu, .4); if (t > tm) c.ev('pop', tm, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > .15 && t < tm) etiqueta('TRUCO', [-.85, -.28, .7], lt - .15, 52, '#ffd640', true);
      if (t > tm) etiqueta('MÁNDASELO', [-.85, -.28, .7], lt - tm, 48, '#ffd640', true);
      if (t > tmu) etiqueta('¡SIN PILA!', [.88, 2.3, .7], lt - tmu, 42, '#ffffff', true);
      if (t < tm) rotulo('Llévalo en una bolsa', 'pegada a tu cuerpo', lt - .1, RY); else rotulo('Mándaselo al del', 'celular muerto', lt - tm, RY);
    }
  });
  P.cierre();
}
