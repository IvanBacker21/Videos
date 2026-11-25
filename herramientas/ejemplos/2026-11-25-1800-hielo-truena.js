// Short 25-nov 18:00 · CARTULINA CHIBI: ¿por qué el hielo truena cuando le echas refresco?
// Choque térmico: el hielo del congelador está a casi -18 °C; el líquido calienta y dilata la capa de afuera mientras el centro
// sigue frío y sin dilatarse; la tensión abre grietas internas y el crujido es el sonido de esas fracturas.
// Fuentes: Univ. de Illinois Physics Van (Ask the Van), Mental Floss, Gizmodo.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-25-1800-hielo-truena.json OUT ../ejemplos/2026-11-25-1800-hielo-truena.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, PARED = 0xfbe6c8, LIQ = 0x6e3418, V = new THREE.Vector3();
  const amb = c => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const cocina = () => { amb(PARED); PM.cocina({ topY: .6 }); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const zoom = () => { amb(0xdff1ff); PM.pz(F.rect(30, 30, 0), 0xdff1ff, [0, 8, -4], null, { tinta: false, papel: false }).traverse(m => m.receiveShadow = false);
    for (const [x, y, r] of [[-1.15, 2.75, .35], [1.15, 2.4, .3], [-1.1, -.25, .25]]) PM.det(F.circ(r), 0xcbe6fb, [x, y, -3.9]);
    luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const amigo = (pos, o = {}) => PM.chibi(pos, { ropa: 0xff8a3d, pantalon: 0x2b2f4a, tenis: 0xffc83d, colPelo: 0x1d1410, lentes: 0x2b2f4a, boca: 'feliz', ...o });
  const mano = (p, i) => p.brazos[i].children.find(c => Math.abs(c.position.y + .5) < 1e-6 && Math.abs(c.position.x) < 1e-6);
  const manoMundo = (p, i) => { p.updateMatrixWorld(true); return mano(p, i).getWorldPosition(V).clone(); };
  const mesita = (pos, w = .8, h = .72) => { const g = group(pos); PM.pz(F.rect(w, .1, .03), 0xc98f5e, [0, h - .05, 0], g, { tinta: .016, papel: .05 });
    for (const sx of [-1, 1]) PM.pz(F.rect(.08, h - .1, .02), 0xa8703f, [sx * (w / 2 - .1), (h - .1) / 2, -.02], g, { tinta: .014, papel: .04 }); return g; };
  // acercamiento: cubo de hielo gigante en corte + chibi chiquito que explica + gotitas de refresco que le caen
  const diagrama = (self) => { zoom();
    self.h = PM.hieloCorte([-.2, 1.3, .3], { s: 1.3 });
    self.gotas = [-.35, .05, .4].map((x, i) => { const d = PM.pz(F.gota(.22), LIQ, [x - .2, 3, .5], null, { tinta: .012, papel: .03 }); d.rotation.z = Math.PI; d.f = i * .18; d.x = x - .2; return d; });
    self.p = PM.chibi([1.1, .05, .45], { logo: true, boca: 'abierta', mira: -1, escala: .42 }); };
  const llueve = (gotas, t, t0, top = 2.0) => gotas.forEach(d => { const q = cl((t - t0 - d.f) / .45); d.visible = q > 0 && q < 1;
    d.position.set(d.x, lerp(3.0, top, q * q), .5); d.scale.setScalar(Math.max(.001, 1 - Math.max(0, q - .85) * 6)); });

  // ---------- 1 · gancho: sirve refresco sobre los hielos y ¡crac! ----------
  escena('gancho', {
    setup() { cocina();
      this.p = PM.chibi([-.72, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .9 });
      const br = this.p.brazos[1]; br.rotation.z = br.r0 + 2.1; const hm = manoMundo(this.p, 1);
      this.b = PM.botellaRefresco([hm.x - .04, hm.y - .1, .42], { h: .6 }); this.b.rotation.z = -1.9;
      this.b.updateMatrixWorld(true); const boca = new THREE.Vector3(0, .6 * .95, 0); this.b.localToWorld(boca);
      const VH = .6, mh = Math.max(.3, boca.y - .32 - VH);
      this.me = mesita([boca.x + .02, 0, .25], .7, mh); this.v = PM.vasoHielos([boca.x + .02, mh, .3], { w: .46, h: VH }); this.alto = boca.y - mh - VH; },
    update(lt, c) {
      const t = tw(lt), tt = c.w('truena') - .08, tr = c.w('refresco?') - .05;
      A.parpadea(this.p, t + 1.2, .35); respira(this.p, t);
      const br = this.p.brazos[1]; br.rotation.z = br.r0 + 2.1 + (t > tt ? Math.sin(t * 30) * .02 * (1 - cl((t - tt) / .6)) : 0);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - (t > tt ? 1.3 * eout(cl((t - tt) / .25)) : .1);
      this.b.update(t, { burb: 1 });
      const kc = ease(cl((t - .05) / .25)); this.v.chorro(t, kc, this.alto); this.v.llena(.3 + .45 * ease(cl((t - .1) / 2.4)));
      this.v.update(t); this.v.truena(t, ease(cl((t - tt) / .3)));
      this.p.boca(t < tt ? 'feliz' : 'abierta'); A.preocupa(this.p, ease(cl((t - tt) / .3)));
      if (t < tt) habla(this.p, t); else this.p.head.rotation.z = this.p.head.r0 + .1 * eout(cl((t - tt) / .2)) + Math.sin(t * 9) * .02;
      c.ev('whoosh', .02, .4); if (t > tt) c.ev('crack', tt, 1.0); if (t > tr) c.ev('crack', tr, .8); if (t > tr + .45) c.ev('pop', tr + .45, .4);
      cam([-.2, 1.1, lerp(8.8, 8.2, ease(lt / 3))], [-.2, 1.05, 0], 34);
      if (t > tt) etiqueta('¡CRAC!', [.5, 2.0, .9], lt - tt, 58, '#ffd640', true);
      if (t > tr) etiqueta('¡CRIC!', [-.05, 2.15, .9], lt - tr, 46, '#ffffff', true);
      rotulo('¿Por qué el hielo truena', 'con el refresco?', lt - .05, RY);
    }
  });

  // ---------- 2 · congelador: el termómetro baja hasta casi veinte bajo cero ----------
  escena('congelador', {
    setup() { cocina();
      this.r = PM.refri([-.72, 0, -.35], { w: 1.0, h: 2.05 }); this.r.abre(1);
      this.cubos = [[-.92, .55], [-.6, .55], [-.76, .78]].map(([x, y]) => { const q = PM.pz(F.rect(.2, .2, .04), 0xd9f4ff, [x + .72, y, .02], this.r.dentro, { tinta: .01, papel: .02 }); PM.det(F.rect(.04, .1, .01), 0xffffff, [-.05, .02, .012], q); return q; });
      this.th = PM.termometro([.28, .25, .45], { h: 1.45 });
      this.p = PM.chibi([.95, .02, .3], { logo: true, boca: 'abierta', mira: -1, escala: .74 });
      this.cp = PM.copos({ n: 8, x0: -1.3, x1: .1, y0: .4, y1: 2.6 }); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('congelador') - .1, tv = c.w('veinte') - .1, tb = c.w('bajo') - .05, tz = c.w('cero.');
      A.parpadea(this.p, t + .5, 1.3); respira(this.p, t); habla(this.p, t);
      this.r.frio(t, 1); this.cp.update(t, 1);
      this.th.nivel(lerp(.62, .06, ease(cl((t - .3) / (tb - .3)))) + Math.sin(t * 5) * .01);
      this.cubos.forEach((q, i) => q.rotation.z = Math.sin(t * 3 + i) * .05);
      // se abraza de frío y tiembla
      const fr = ease(cl((t - tv) / .4));
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + lerp(.2, -.9, fr) + Math.sin(t * 4) * .05 * (1 - fr);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + lerp(1.2 + Math.sin(t * 4) * .06, .9, fr);
      this.p.rotation.z = Math.sin(t * 30) * .014 * fr; A.preocupa(this.p, fr); this.p.boca(t > tz ? 'apretada' : 'abierta');
      c.ev('whoosh', .05, .5); if (t > tc) c.ev('pop', tc, .4); if (t > tv) c.ev('whoosh', tv, .5); if (t > tb) c.ev('ding', tb, .6);
      cam([0, 1.2, lerp(10.4, 10.1, ease(lt / 3.6))], [0, 1.15, 0], 34);
      etiqueta(t < tb ? 'CONGELADOR' : '¡BAJO CERO!', [0, 2.55, .9], lt - (t < tb ? .15 : tb), t < tb ? 46 : 56, t < tb ? '#ffffff' : '#8fd3ff', true);
      rotulo('Del congelador sale a', 'casi veinte bajo cero', lt - .05, RY);
    }
  });

  // ---------- 3 · choque: la capa de afuera se calienta y se estira; el centro sigue helado ----------
  escena('choque', {
    setup() { diagrama(this); },
    update(lt, c) {
      const t = tw(lt), tr = c.w('refresco,') - .2, ta = c.w('afuera') - .1, tc = c.w('calienta') - .1, te = c.w('estira,') - .1, tce = c.w('centro') - .1, th = c.w('helado.') - .1;
      A.parpadea(this.p, t + .4, 1.1); respira(this.p, t, .05); habla(this.p, t);
      llueve(this.gotas, t, tr, 2.0); llueve(this.gotas, t, tr + .7, 2.0);
      this.h.calienta(ease(cl((t - tc) / .5))); this.h.estira(t, ease(cl((t - te) / .4)));
      const kc = t > tce ? Math.sin(Math.PI * cl((t - tce) / .7)) : 0; this.h.centro.scale.setScalar(1 + .12 * kc);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + .3; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.3 * eout(cl((t - .3) / .3)) + Math.sin(t * 4) * .05;
      this.p.boca(t > th ? 'feliz' : 'abierta');
      c.ev('whoosh', .05, .5); if (t > tr + .4) c.ev('pop', tr + .4, .4); if (t > tc) c.ev('pop', tc, .4); if (t > te) c.ev('whoosh', te, .6); if (t > tce) c.ev('ding', tce, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      const lab = t < tc ? ['¡LE CAE REFRESCO!', 0, '#ffffff', 42] : t < te ? ['AFUERA SE CALIENTA', tc, '#ff8a3d', 40] : t < tce ? ['¡Y SE ESTIRA!', te, '#ffd640', 50] : ['EL CENTRO, HELADO', tce, '#3d9bff', 42];
      etiqueta(lab[0], [0, 2.6, .9], lt - lab[1], lab[3], lab[2], true);
      rotulo(t < tce ? 'Afuera se calienta' : 'pero el centro', t < tce ? 'y se estira' : 'sigue helado', lt - (t < tce ? .05 : tce), RY);
    }
  });

  // ---------- 4 · grietas: la jaloneada lo cuartea por dentro ----------
  escena('grietas', {
    setup() { diagrama(this); this.h.calienta(1); this.gotas.forEach(d => d.visible = false); },
    update(lt, c) {
      const t = tw(lt), tj = c.w('jaloneada') - .1, tq = c.w('cuartea') - .1, tt = c.w('tronido') - .1, tg = c.w('grietas') - .1;
      A.parpadea(this.p, t + 2.1, .6); respira(this.p, t, .05);
      this.h.estira(t, 1 - .5 * ease(cl((t - tq) / .5)));
      const kg = ease(cl((t - tq) / 1.4)); this.h.grietas(kg); this.h.chispas(t, ease(cl((t - tt) / .3)));
      this.h.tiembla(t, t > tq ? .5 + .5 * Math.max(0, Math.sin(t * 5)) : (t > tj ? .25 : 0));
      // el chibi se tapa las orejas al oír el tronido
      const ko = ease(cl((t - tt) / .3));
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + lerp(.3, 2.6, ko); this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + lerp(1.3 + Math.sin(t * 4) * .05, -2.6, ko);
      this.p.boca(t > tt ? 'apretada' : 'abierta'); A.preocupa(this.p, ko); if (t < tt) habla(this.p, t); else this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 25) * .03;
      c.ev('whoosh', .05, .4); if (t > tj) c.ev('whoosh', tj, .5); if (t > tq) c.ev('crack', tq, .9); if (t > tt) c.ev('crack', tt, 1.0); if (t > tg) c.ev('crack', tg + .25, .8);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      const lab = t < tq ? ['¡JALONEADA!', tj - .3, '#ffffff', 50] : t < tt ? ['¡SE CUARTEA!', tq, '#ffd640', 50] : ['¡CRAC! = GRIETAS', tt, '#ffd640', 46];
      etiqueta(lab[0], [0, 2.6, .9], lt - Math.max(0, lab[1]), lab[3], lab[2], true);
      rotulo(t < tt ? 'Ese jalón lo cuartea' : 'El tronido: grietas', t < tt ? 'por dentro' : 'que se abren', lt - (t < tt ? .05 : tt), RY);
    }
  });

  // ---------- 5 · remate: el amigo asustado revisa su vaso ----------
  escena('remate', {
    setup() { cocina();
      this.p = PM.chibi([-.88, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .72 });
      this.a = amigo([.72, .02, .3], { escala: .78, mira: -1, boca: 'apretada' });
      this.me = mesita([-.02, 0, .25], .7, .72); this.v = PM.vasoHielos([-.02, .72, .3], { w: .48, h: .7 }); this.v.llena(.7); },
    update(lt, c) {
      const t = tw(lt), tm = c.w('Mándaselo') , tv = c.w('vaso') - .1, tro = c.w('rompiendo.') - .1;
      A.parpadea(this.p, t + 1.6, .5); A.parpadea(this.a, t + .3, 1.4); respira(this.p, t); respira(this.a, t, .02, 1.1);
      this.v.llena(.7); this.v.update(t); this.v.truena(t, .6 + .4 * Math.max(0, Math.sin(t * 3)));
      // el amigo se echa para atrás con las manos en la cara y se asoma al vaso
      const ka = .5 + .5 * Math.sin(t * 2.2);
      this.a.brazos[0].rotation.z = this.a.brazos[0].r0 - .75 - Math.sin(t * 20) * .06; this.a.brazos[1].rotation.z = this.a.brazos[1].r0 + .75 + Math.sin(t * 20 + 1) * .06;
      this.a.boca('apretada'); A.preocupa(this.a, 1); this.a.position.x = .72 + .06 * ka; this.a.head.rotation.z = this.a.head.r0 - .1 * (1 - ka);
      this.a.rotation.z = Math.sin(t * 28) * .012;
      // el protagonista se ríe y lo señala
      this.p.boca(t > tv ? 'abierta' : 'feliz'); habla(this.p, t);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.25 * eout(cl((t - tm - .1) / .3)) + Math.sin(t * 9) * .05;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .2 - Math.sin(t * 9) * .05;
      c.ev('whoosh', .05, .4); if (t > tv) c.ev('crack', tv, .7); if (t > tro) c.ev('ding', tro, .6);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.4))], [0, 1.15, 0], 34);
      if (t > tv) etiqueta('¿¡SE ROMPIÓ!?', [.55, 2.5, .9], lt - tv, 44, '#ffd640', true);
      rotulo('Mándaselo al que cree', 'que su vaso se rompe', lt - .05, RY);
    }
  });
  P.cierre();
}
