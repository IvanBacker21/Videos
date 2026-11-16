// Short 16-nov 18:00 · CARTULINA CHIBI: ¿Por qué el bolillo de ayer amanece DURO como piedra?
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-16-1800-pan-duro.json OUT ../ejemplos/2026-11-16-1800-pan-duro.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, PARED = 0xfbe6c8;
  const luz = () => luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const cocina = (o) => { ambiente({ top: PARED, bottom: PARED, fog: PARED, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); const k = PM.cocina(o); luz(); return k; };
  const CAM = () => cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 6 + f) * .05; };
  const brazosReposo = (p, t) => { p.brazos[0].rotation.z = p.brazos[0].r0 + Math.sin(t * 2.5) * .05; p.brazos[1].rotation.z = p.brazos[1].r0 - Math.sin(t * 2.5) * .05; };
  // gotitas de agua que caen de (x, y0) a y1
  const gotitas = (x, y0, y1, z = .6) => { const gs = []; for (let i = 0; i < 4; i++) { const g = PM.pz(F.gota(.16), 0x6fc3ff, [x + (i - 1.5) * .14, y0, z], null, { tinta: .01, papel: .04 }); g.f = i * .25; gs.push(g); }
    return { update(t, on) { gs.forEach(g => { const q = (t * 1.3 + g.f) % 1; g.visible = on > 0; g.position.y = lerp(y0, y1, q * q); g.scale.setScalar(Math.max(.001, on * (q < .9 ? 1 : (1 - q) * 10))); }); } }; };

  // ---------- 1 · gancho: el bolillo de ayer amanece duro como piedra ----------
  escena('gancho', {
    setup() { const k = this.k = cocina();
      this.p = PM.chibi([-.62, 0, .3], { logo: true, boca: 'feliz', mira: 1, escala: .82 });
      this.b = PM.pan([.62, k.topY + .3, -.95], { tipo: 'bolillo', r: .42, expr: 'feliz' }); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('amanece') - .1, td = c.w('duro') - .15, tp = c.w('piedra') - .15;
      const kd = eout(cl((t - ta) / .7));
      this.b.duro(kd); this.b.cara(t > td ? 'duda' : 'feliz'); A.parpadea(this.b, t, .9);
      // el chibi toca el pan: toc, toc
      const toc = t > tp ? Math.abs(Math.sin((t - tp) * 9)) : 0;
      const br = this.p.brazos[1]; br.rotation.z = lerp(br.r0, 1.3, eout(cl((t - td) / .3))) - toc * .18;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - Math.sin(t * 2.5) * .05;
      this.b.position.y = this.k.topY + .3 + toc * .03; this.b.rotation.z = toc * .03;
      A.parpadea(this.p, t, 1.3); this.p.boca(t > tp ? 'apretada' : t > td ? 'abierta' : 'feliz'); A.preocupa(this.p, cl((t - td) / .3));
      this.p.head.rotation.z = this.p.head.r0 - .12 + Math.sin(t * 3) * .04;
      c.ev('whoosh', .05, .5); if (t > td) c.ev('pop', td, .4); if (t > tp) c.ev('pop', tp, .4);
      CAM();
      if (t > .25 && t < td) etiqueta('BOLILLO DE AYER', [.62, .2, .7], lt - .25, 40, '#ffffff', true);
      if (t > td) etiqueta(t > tp ? '¡COMO PIEDRA!' : '¡DURO!', [.62, .2, .7], lt - (t > tp ? tp : td), 48, '#ffd640', true);
      rotulo('¿Por qué el bolillo', 'amanece DURO?', lt + .4, RY);
    }
  });

  // ---------- 2 · no es que se seque: aunque lo guardes en bolsa, se pone duro ----------
  escena('mito', {
    setup() { const k = this.k = cocina();
      this.p = PM.chibi([-.68, 0, .3], { logo: true, boca: 'abierta', mira: 1, escala: .82 });
      this.b = PM.pan([.58, k.topY + .32, -.95], { tipo: 'bolillo', r: .4, expr: 'feliz' });
      this.bo = PM.bolsa([.58, k.topY + .42, -.75], 1.55, .95);
      this.x = PM.marca([.95, 1.95, .5], false, .8);
      this.gt = []; for (const [x, y] of [[.4, 1.28], [.78, 1.3]]) this.gt.push(PM.pz(F.gota(.18), 0x6fc3ff, [x, y, -.85], null, { tinta: .01, papel: .04 })); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('seque') - .15, tb = c.w('bolsa') - .25, tdu = c.w('duro') - .2;
      // "se secó" ❌ ; el agua sigue adentro (gotitas en el pan)
      this.x.scale.setScalar(t > ts && t < tb + .2 ? pop(t, ts, .3) * .8 : .001);
      this.gt.forEach((g, i) => { g.scale.setScalar(t < tb + .2 ? pop(t, ts + .15 + i * .1, .3) * (1 + .08 * Math.sin(t * 6 + i)) : .001); });
      this.bo.scale.setScalar(pop(t, tb, .35)); this.bo.rotation.z = Math.sin(t * 2) * .02;
      const kd = eout(cl((t - tdu) / .5)); this.b.duro(kd); this.b.cara(t > tdu ? 'triste' : 'feliz'); A.parpadea(this.b, t, .3);
      A.parpadea(this.p, t, 1.0); habla(this.p, t);
      // niega con el dedo al principio, señala la bolsa después
      const bl = this.p.brazos[1]; bl.rotation.z = t < tb ? lerp(bl.r0, 2.3, eout(cl((t - .1) / .3))) + Math.sin(t * 10) * .14 * (t > ts ? 1 : 0) : lerp(2.3, 1.3, eout(cl((t - tb) / .3)));
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - Math.sin(t * 2.5) * .05;
      this.p.boca(t > tdu ? 'apretada' : 'abierta'); A.preocupa(this.p, cl((t - tdu) / .3));
      if (t > ts) c.ev('pop', ts, .4); if (t > tb) c.ev('whoosh', tb, .5); if (t > tdu) c.ev('pop', tdu, .4);
      CAM();
      if (t > ts && t < tb) etiqueta('¿SE SECÓ?', [.58, .25, .7], lt - ts, 46, '#ffffff', true);
      if (t > tb && t < tdu) etiqueta('EN BOLSA', [.58, .25, .7], lt - tb, 46, '#ffffff', true);
      if (t > tdu) etiqueta('¡IGUAL SE PONE DURO!', [.3, .25, .7], lt - tdu, 40, '#ffd640', true);
      rotulo(t < tb ? 'No es que se seque' : 'Aunque esté en bolsa', t < tb ? '' : 'se pone duro', t < tb ? lt - .1 : lt - tb, RY);
    }
  });

  // ---------- 3 · el almidón se reacomoda en cristalitos y la miga se pone tiesa ----------
  escena('almidon', {
    setup() { cocina({ ventana: false });
      this.p = PM.chibi([-.88, 0, .3], { logo: true, boca: 'abierta', mira: 1, escala: .74 });
      this.lu = PM.lupa([.4, 1.62, .5], .92, { fondo: 0xfbe6b4 }); this.mi = PM.miga([0, 0, 0], .9, this.lu.dentro); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('almidón') - .15, tr = c.w('reacomoda') - .1, tc = c.w('cristalitos') - .15, tt = c.w('tiesa') - .15;
      this.lu.scale.setScalar(pop(t, .05, .4)); this.lu.rotation.z = Math.sin(t * 1.5) * .03;
      const kc = ease(cl((t - tr) / (tc - tr + .5)));
      this.mi.cristaliza(kc, t);
      A.parpadea(this.p, t, 2.1); habla(this.p, t, 1);
      const sor = t > tc ? 1 : 0; this.p.boca(t > tt ? 'apretada' : 'abierta');
      this.p.head.ojos.forEach(e => { if (e.scale.y > .5) e.scale.set(1 + .2 * sor, 1 + .2 * sor, 1); });
      // señala la lupa
      const br = this.p.brazos[1]; br.rotation.z = lerp(br.r0, 1.35, eout(cl((t - .2) / .3))) + Math.sin(t * 3) * .05;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - Math.sin(t * 2.5) * .05;
      A.tiembla(this.p, t, t > tt ? .5 : 0, -.88);
      c.ev('pop', .05, .4); if (t > tc) c.ev('ding', tc, .4); if (t > tt) c.ev('pop', tt, .4);
      CAM();
      if (t > ta && t < tc) etiqueta('ALMIDÓN', [.4, .45, .7], lt - ta, 46, '#ffffff', true);
      if (t > tc && t < tt) etiqueta('CRISTALITOS', [.4, .45, .7], lt - tc, 46, '#ffd640', true);
      if (t > tt) etiqueta('¡MIGA TIESA!', [.4, .45, .7], lt - tt, 46, '#ffd640', true);
      rotulo(t < tc ? 'El almidón del pan' : 'se acomoda en', t < tc ? 'se reacomoda' : 'cristalitos duros', t < tc ? lt - .1 : lt - tc, RY);
    }
  });

  // ---------- 4 · y en el refri se endurece todavía más rápido ----------
  escena('refri', {
    setup() { cocina({ ventana: false });
      this.r = PM.refri([.55, 0, -.3], { w: 1.25, h: 2.4 });
      this.b = PM.pan([0, 1.25, .1], { tipo: 'bolillo', r: .3, expr: 'feliz' }, null); this.r.dentro.add(this.b); this.b.position.set(0, 1.21 + .02, .05);
      this.p = PM.chibi([-.8, 0, .4], { logo: true, boca: 'abierta', mira: 1, escala: .78 });
      this.co = PM.copos({ n: 8, x0: .05, x1: 1.1, y0: .4, y1: 2.3, z: -.29 }); },   // copos detrás del pan para no taparle la cara
    update(lt, c) {
      const t = tw(lt), tr = c.w('refri') - .25, te = c.w('endurece') - .15, tm = c.w('rápido') - .15;
      const ka = eout(cl((t - tr) / .4)); this.r.abre(ka); this.r.frio(t, ka);
      this.co.update(t); this.co.update && this.co.ps;
      const kd = cl((t - te) / .9); this.b.duro(kd); this.b.cara(t > te ? 'triste' : 'feliz'); A.parpadea(this.b, t, .5);
      this.b.position.x = Math.sin(t * 40) * .015 * ka;
      A.parpadea(this.p, t, 1.7); this.p.boca(t > tm ? 'apretada' : 'abierta'); A.preocupa(this.p, cl((t - te) / .3));
      const br = this.p.brazos[1]; br.rotation.z = lerp(br.r0, 1.3, eout(cl((t - tr) / .3))) + Math.sin(t * 3) * .05;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - Math.sin(t * 2.5) * .05; habla(this.p, t, 2);
      if (t > tr) c.ev('whoosh', tr, .5); if (t > tm) c.ev('pop', tm, .4);
      CAM();
      if (t < te) etiqueta('REFRI', [.55, -.15, .7], lt - Math.max(.1, tr), 46, '#ffffff', true);
      else etiqueta('¡MÁS RÁPIDO!', [.4, -.15, .7], lt - te, 46, '#ffd640', true);
      rotulo('En el refri', 'se endurece MÁS rápido', lt - .1, RY);
    }
  });

  // ---------- 5 · truco: gotitas de agua y al comal · mándaselo ----------
  escena('remate', {
    setup() { const k = this.k = cocina();
      this.co = PM.comal([.55, k.topY - .02, -1.0], { w: 1.35, k: 0 });
      this.b = PM.pan([.55, k.topY + .7, -.95], { tipo: 'bolillo', r: .44, expr: 'triste' });
      this.p = PM.chibi([-.62, 0, .3], { logo: true, boca: 'feliz', mira: 1, escala: .82 });
      this.go = gotitas(.55, 2.45, 1.85, -.6);
      this.a = PM.chibi([1.08, 0, .5], { ropa: 0xff6b5b, pelo: 'cola', colPelo: 0x1f1410, boca: 'apretada', mira: -1, escala: .68 }); this.a.visible = false; },
    update(lt, c) {
      const t = tw(lt), tg = c.w('gotitas') - .2, tc = c.w('caliéntalo') - .15, tca = c.w('calor') - .15, tm = c.w('Mándaselo') - .2;
      this.go.update(t, t > tg && t < tc + .4 ? 1 : 0);
      const kf = eout(cl((t - tc) / .4)); this.co.fuego(kf, t);
      const ks = ease(cl((t - tca) / 1.0));
      this.b.duro(1 - ks); this.b.suave(ks, t); this.b.cara(ks > .5 ? 'abierta' : 'triste'); A.parpadea(this.b, t, .8);
      this.b.position.y = this.k.topY + .7 + (ks > 0 ? Math.abs(Math.sin(t * 5)) * .05 * ks : 0);
      // el chibi rocía con la mano levantada sobre el pan
      const br = this.p.brazos[1]; br.rotation.z = (t < tc + .4 ? lerp(br.r0, 1.5, eout(cl((t - tg + .3) / .3))) : lerp(1.5, br.r0, eout(cl((t - tc - .4) / .3)))) + Math.sin(t * 8) * .05 * (t > tg && t < tc ? 1 : 0);
      A.parpadea(this.p, t, 1.2); habla(this.p, t, 3); this.p.boca(t > tca ? 'feliz' : 'abierta');
      // mándaselo: la amiga que guarda el pan en el refri
      const va = t > tm - .1; this.a.visible = va;
      if (va) { const s = pop(t, tm - .1, .35); this.a.scale.set(.68 * s, .68 * s, .136); A.parpadea(this.a, t, .3); A.preocupa(this.a, 1); this.a.head.rotation.z = this.a.head.r0 + Math.sin(t * 5) * .06;
        this.a.brazos[0].rotation.z = this.a.brazos[0].r0 + Math.sin(t * 2.5) * .05; this.a.brazos[1].rotation.z = this.a.brazos[1].r0 - Math.sin(t * 2.5) * .05;
        this.p.position.x = -.62 - .2 * eout(cl((t - tm) / .3));
        br.rotation.z = lerp(br.r0, 1.35, eout(cl((t - tm) / .3))) + Math.sin(t * 6) * .06; }
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - Math.sin(t * 2.5) * .05;
      if (t > tg) c.ev('whoosh', tg, .5); if (t > tc) c.ev('pop', tc, .4); if (t > tca) c.ev('ding', tca, .4); if (t > tm) c.ev('pop', tm, .4);
      CAM();
      if (t < tc) etiqueta('TRUCO', [.55, .2, .7], lt - .1, 52, '#ffd640', true);
      else if (t < tca) etiqueta('AL COMAL', [.55, .2, .7], lt - tc, 48, '#ffffff', true);
      else if (t < tm) etiqueta('¡SE DESHACEN!', [.55, .2, .7], lt - tca, 48, '#ffd640', true);
      else etiqueta('MÁNDASELO', [-.2, .2, .7], lt - tm, 48, '#ffd640', true);
      if (t < tm) rotulo(t < tca ? 'Gotitas de agua' : 'El calor deshace', t < tca ? 'y al comal' : 'los cristalitos', t < tca ? lt - .1 : lt - tca, RY);
      else rotulo('Mándaselo al que', 'guarda el pan en el refri', lt - tm, RY);
    }
  });
  P.cierre();
}
