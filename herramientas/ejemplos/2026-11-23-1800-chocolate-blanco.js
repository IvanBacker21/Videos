// Short 23-nov 18:00 · CARTULINA CHIBI: ¿por qué el chocolate se pone blanco?
// No son hongos: es "bloom". Con calor la manteca de cacao se derrite, sale a la superficie y recristaliza (fat bloom);
// en el refri la humedad disuelve el azúcar de la superficie y al secarse queda polvito (sugar bloom). Es seguro comerlo.
// Fuentes: Agencia Canadiense de Inspección de Alimentos (Chocolate bloom), Live Science, The Conversation.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-23-1800-chocolate-blanco.json OUT ../ejemplos/2026-11-23-1800-chocolate-blanco.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600;
  const amb = c => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const cocina = () => { amb(0xfbe6c8); const k = PM.cocina(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); return k; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const yo = (x, s, o = {}) => PM.chibi([x, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: s, ...o });
  const amigo = (pos, o = {}) => PM.chibi(pos, { ropa: 0xff8a3d, pantalon: 0x2b2f4a, tenis: 0xffc83d, colPelo: 0x1d1410, lentes: true, boca: 'feliz', ...o });

  // ---- piezas locales ----
  // hongo de cartulina (sombrero rojo con puntos y ojitos)
  const hongo = (pos, s = 1, padre = null) => { const g = group(pos, padre); g.scale.setScalar(s);
    PM.pz(F.rect(.2, .3, .06), 0xf3e6cc, [0, -.12, 0], g, { tinta: .014, papel: .05 });
    PM.pz(F.poly([[-.36, 0], [-.3, .14], [-.16, .25], [0, .29], [.16, .25], [.3, .14], [.36, 0]]), 0xe2463c, [0, 0, .02], g, { tinta: .014, papel: .05 });
    for (const [x, y, r] of [[-.17, .1, .045], [.05, .19, .04], [.2, .07, .05]]) PM.det(F.circ(r), 0xffffff, [x, y, .04], g);
    for (const sx of [-1, 1]) PM.det(F.elipse(.025, .04), 0x2b1d2e, [sx * .05, -.1, .03], g);
    return g; };
  // bote de basura con tapa
  const bote = (pos) => { const g = group(pos);
    PM.pz(F.poly([[-.27, .62], [.27, .62], [.22, 0], [-.22, 0]]), 0x7d8799, [0, 0, 0], g, { tinta: .016, papel: .05 });
    for (const x of [-.11, 0, .11]) PM.det(F.rect(.03, .46, .01), 0x6a7385, [x, .3, .016], g);
    g.tapa = group([-.3, .64, .02], g); PM.pz(F.rect(.62, .07, .03), 0x5f6879, [.3, 0, 0], g.tapa, { tinta: .014, papel: .04 }); PM.pz(F.rect(.14, .05, .02), 0x5f6879, [.3, .06, 0], g.tapa, { tinta: .012, papel: .03 });
    return g; };

  // ---------- 1 · gancho: encuentra en la alacena una tablilla toda blanca ----------
  escena('gancho', {
    setup() { cocina();
      this.p = yo(-.8, .8, { boca: 'abierta' });
      this.ch = PM.tablillaChocolate([.3, 1.25, .6], { w: 1.15, h: .62, semilla: 3 }); this.ch.blanquea(1);
      this.q = PM.pregunta([.72, 2.08, .6], .8); this.q.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('chocolate') - .1, tb = c.w('blanco?') - .1;
      A.parpadea(this.p, t + 1.1, .4); respira(this.p, t);
      // la tablilla sale de golpe hacia él; él la aleja con cara de asco
      const ks = eout(cl((t + .1) / .45)), asco = ease(cl((t - tc) / .3));
      this.ch.position.set(lerp(.7, .3, ks) + Math.sin(t * 3) * .02, lerp(1.5, 1.25, ks), .6); this.ch.rotation.z = lerp(.5, -.08, ks) + Math.sin(t * 2.4) * .03;
      this.ch.scale.setScalar(lerp(.7, 1, ks) * (1 + .06 * Math.sin(Math.min(1, cl((t - tb) / .3)) * Math.PI)));
      const br = this.p.brazos[1]; br.rotation.z = br.r0 + 1.25 + Math.sin(t * 4) * .05; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .3 - .5 * asco;
      this.p.position.x = -.8 - .1 * asco; this.p.head.rotation.z = this.p.head.r0 + .12 * asco + Math.sin(t * 7) * .03;
      this.p.boca(t < tc ? 'abierta' : 'apretada'); A.preocupa(this.p, asco);
      this.q.scale.setScalar(.8 * pop(t, tb, .35)); this.q.rotation.z = Math.sin(t * 5) * .12;
      c.ev('whoosh', .02, .5); if (t > tc) c.ev('zap', tc, .5); if (t > tb) c.ev('ding', tb, .5);
      cam([0, 1.2, lerp(10.8, 10.4, ease(lt / 2.5))], [0, 1.15, 0], 34);
      if (t > tc) etiqueta('¿SE ECHÓ A PERDER?', [0, 2.6, .9], lt - tc, 44, '#ffd640', true);
      rotulo('¿Por qué el chocolate', 'se pone BLANCO?', lt - .05, RY);
    }
  });

  // ---------- 2 · grasa: con la lupa: ¡no son hongos! es manteca de cacao ----------
  escena('grasa', {
    setup() { cocina();
      this.p = yo(-1.08, .62);
      this.lu = PM.lupa([.32, 1.42, .6], .82, { fondo: 0xfff4e4 });
      this.ho = hongo([0, -.02, .02], 1.25, this.lu.dentro);
      this.no = PM.marca([.33, .3, .2], false, .7, this.lu.dentro); this.no.scale.setScalar(.001);
      this.co = PM.tablillaChocolate([0, -.05, .02], { vista: 'corte', w: 1.25, h: .6, semilla: 5 }, this.lu.dentro); this.co.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), th = c.w('hongos:') - .1, tg = c.w('grasa,') - .15, tm = c.w('manteca') - .1;
      A.parpadea(this.p, t + 2.3, 1.3); respira(this.p, t);
      // la lupa se acerca un poquito
      this.lu.position.y = 1.42 + Math.sin(t * 2.2) * .02; this.lu.rotation.z = Math.sin(t * 1.7) * .03;
      // hongo: tache y se encoge; entra el corte de chocolate con sus gotitas doradas que laten
      this.no.scale.setScalar(.7 * pop(t, th, .3) * (t < tg ? 1 : Math.max(.001, 1 - cl((t - tg) / .2))));
      const kh = t < tg ? 1 : Math.max(.001, 1 - ease(cl((t - tg) / .25))); this.ho.scale.setScalar(1.25 * kh); this.ho.rotation.z = t > th && t < tg ? Math.sin(t * 20) * .08 : 0;
      this.co.scale.setScalar(pop(t, tg + .12, .35));
      this.co.gotas.forEach((d, i) => d.scale.setScalar(t > tm ? 1 + .25 * Math.max(0, Math.sin(t * 8 - i * .7)) : 1));
      // él niega con la cabeza en "No son hongos" y luego señala
      const br = this.p.brazos[1]; br.rotation.z = br.r0 + 1.3 * eout(cl((t - tg) / .3)) + Math.sin(t * 4) * .05;
      if (t < th + .4) this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 14) * .1; else habla(this.p, t);
      this.p.boca(t > tm ? 'feliz' : 'abierta');
      c.ev('whoosh', .02, .4); if (t > th) c.ev('zap', th, .5); if (t > tg) c.ev('pop', tg + .12, .5); if (t > tm) c.ev('ding', tm, .6);
      cam([0, 1.25, 10.4], [0, 1.2, 0], 34);
      if (t < tg) etiqueta('¡NO SON HONGOS!', [0, 2.6, .9], lt, 50, '#ffffff', true);
      else etiqueta('MANTECA DE CACAO', [0, 2.6, .9], lt - tg, 46, '#ffd640', true);
      rotulo(t < tg ? 'No son hongos:' : 'es su propia grasa', t < tg ? '¡es otra cosa!' : 'la manteca de cacao', lt - .05, RY);
    }
  });

  // ---------- 3 · calor: el sol la derrite, sube a la superficie y cuaja en polvito blanco ----------
  escena('calor', {
    setup() { cocina();
      this.so = PM.astro([-.92, 2.22, .45], .25, 0xffd23d, { rayos: true, expr: 'feliz' });
      this.oc = PM.ondasCalor([.3, 2.0, .55], null, { n: 4, sep: .3, largo: .36 });
      this.co = PM.tablillaChocolate([.32, 1.4, .55], { vista: 'corte', w: 1.8, h: .62, semilla: 9 });
      this.p = yo(-1.15, .52); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('calor') - .1, td = c.w('derrite,') - .1, ts = c.w('sale') - .1, tq = c.w('cuaja') - .1, tp = c.w('polvito') - .1;
      A.parpadea(this.p, t + .7, 2.1); respira(this.p, t);
      this.so.rayos.rotation.z = t * .6; this.so.scale.setScalar(pop(t, tc - .25, .35) * (1 + .05 * Math.sin(t * 6)));
      this.oc.update(t, ease(cl((t - tc) / .3)) * (1 - .6 * ease(cl((t - tq) / .4))));
      // las gotitas se ablandan (tiemblan), suben y se vuelven costra blanca
      this.co.sube(cl((t - ts) / (tq - ts + .1)));
      this.co.gotas.forEach((d, i) => { if (t > td && t < tq) d.position.x += Math.sin(t * 22 + i) * .004; });
      this.co.polvo(cl((t - tq) / (tp - tq + .35)));
      this.co.cuerpo.position.x = t > td && t < ts ? Math.sin(t * 30) * .01 : 0;
      // él se abanica por el calor y luego señala el polvito
      const b0 = this.p.brazos[0], b1 = this.p.brazos[1];
      b1.rotation.z = b1.r0 + (t < tq ? 1.9 + Math.sin(t * 14) * .35 : 1.25 + Math.sin(t * 4) * .05);
      b0.rotation.z = b0.r0 - .2; A.preocupa(this.p, t > tc && t < tq ? .6 : 0);
      this.p.boca(t > tp ? 'feliz' : 'abierta'); habla(this.p, t);
      c.ev('whoosh', .02, .4); if (t > tc) c.ev('pop', tc - .25, .5); if (t > ts) c.ev('whoosh', ts, .5); if (t > tq) c.ev('pop', tq, .5); if (t > tp) c.ev('ding', tp, .6);
      cam([0, 1.25, 10.4], [0, 1.2, 0], 34);
      if (t < ts) etiqueta(t < td ? '¡CALOR!' : '¡SE DERRITE!', [.25, 2.6, .9], lt - (t < td ? tc : td), 48, '#ffd640', true);
      else if (t < tq) etiqueta('¡SUBE!', [.25, 2.6, .9], lt - ts, 56, '#ffffff', true);
      else etiqueta('¡POLVITO BLANCO!', [.25, 2.6, .9], lt - tq, 46, '#ffd640', true);
      rotulo(t < tq ? 'Con el calor se derrite' : 'y cuaja en', t < tq ? 'y sale a la superficie' : 'polvito blanco', lt - .05, RY);
    }
  });

  // ---------- 4 · refri: sale del refri, se le pegan gotitas y al secarse queda polvo de azúcar ----------
  escena('refri', {
    setup() { cocina();
      this.re = PM.refri([.78, .02, -.45], { h: 2.3 });
      this.ch = PM.tablillaChocolate([.78, 1.2, -.42], { w: .9, h: .5, semilla: 11 }); this.ch.scale.setScalar(.55);
      this.p = yo(-.95, .7); },
    update(lt, c) {
      const t = tw(lt), tr = c.w('refri') - .25, tp = c.w('pasa') - .05, ta = c.w('azúcar,') - .1, th = c.w('humedad.') - .1;
      A.parpadea(this.p, t + 1.6, .9); respira(this.p, t);
      const ka = ease(cl((t - tr) / .35)), kc = ease(cl((t - tp) / .5)) * (1 - .0);
      this.re.abre(ka * (1 - ease(cl((t - th - .2) / .3)))); this.re.frio(t, ka * (1 - ease(cl((t - th) / .4))));
      // la tablilla sale del refri hacia su mano
      this.ch.position.set(lerp(.78, -.12, kc), lerp(1.2, 1.18, kc) + Math.sin(kc * Math.PI) * .25, lerp(-.42, .6, kc)); this.ch.scale.setScalar(lerp(.55, .85, kc)); this.ch.rotation.z = Math.sin(t * 2.2) * .03;
      this.ch.suda(cl((t - ta) / .45) * (1 - cl((t - th - .45) / .3)));
      this.ch.blanquea(cl((t - th - .25) / .45));
      const br = this.p.brazos[1]; br.rotation.z = br.r0 + lerp(.4, 1.15, kc) + Math.sin(t * 4) * .04;
      A.preocupa(this.p, t > ta ? .5 : 0); this.p.boca(t > th + .3 ? 'apretada' : 'abierta'); habla(this.p, t);
      c.ev('whoosh', .02, .4); if (t > tr) c.ev('pop', tr, .5); if (t > tp) c.ev('whoosh', tp, .5); if (t > ta) c.ev('pop', ta, .5); if (t > th) c.ev('ding', th + .25, .6);
      cam([0, 1.22, 10.4], [0, 1.18, 0], 34);
      if (t < ta) etiqueta('EN EL REFRI…', [0, 2.6, .9], lt - Math.max(0, tr), 46, '#ffffff', true);
      else etiqueta('AZÚCAR + HUMEDAD', [0, 2.6, .9], lt - ta, 44, '#ffd640', true);
      rotulo('En el refri: el azúcar', 'por la humedad', lt - .05, RY);
    }
  });

  // ---------- 5 · remate: se derrite en el chocolate caliente ✓ … y el amigo junto al bote de basura ----------
  escena('remate', {
    setup() { const k = cocina();
      this.po = PM.pocillo([-.12, k.topY + .25, -1.0], { w: .82, liquido: 0x7a3f22 });
      this.ch = PM.tablillaChocolate([-.12, 2.0, -.5], { w: .7, h: .4, envoltura: false, semilla: 13 }); this.ch.blanquea(1);
      this.ok = PM.marca([.5, 2.1, .7], true, .7); this.ok.scale.setScalar(.001);
      this.p = yo(-1.1, .66, { boca: 'feliz' });
      this.bo = bote([2.4, .02, .1]);
      this.a = amigo([2.6, .02, .35], { escala: .62, mira: -1, boca: 'apretada' }); },
    update(lt, c) {
      const t = tw(lt), tco = c.w('comer.') - .1, tm = c.w('Mándaselo') - .1, tt = c.w('tiró') - .1, tpe = c.w('perder.') - .1;
      A.parpadea(this.p, t + 2.0, 1.6); A.parpadea(this.a, t + .6, .4); respira(this.p, t); respira(this.a, t, .02, 1.1);
      // la tablilla blanca baja al pocillo y se derrite: chocolate caliente
      const kb = ease(cl(t / .45)), kd = cl((t - .25) / .8); this.ch.position.y = lerp(2.0, 1.55, kb) - .12 * kd; this.ch.derrite(kd); this.ch.blanquea(1 - kd);
      this.ch.visible = t < 1.35; if (t > 1.05) this.ch.scale.setScalar(Math.max(.001, 1 - cl((t - 1.05) / .25)));
      this.po.fuego(1, t); this.po.espuma(.25 + .1 * Math.sin(t * 3), t);
      this.ok.scale.setScalar(.7 * pop(t, tco, .35) * (t < tm + .2 ? 1 : Math.max(.001, 1 - cl((t - tm - .2) / .25))));
      // el chibi festeja y luego voltea a ver al amigo
      const b1 = this.p.brazos[1]; b1.rotation.z = b1.r0 + (t < tm ? 2.4 + Math.sin(t * 10) * .25 : 1.3 + Math.sin(t * 4) * .05);
      if (t < tm) habla(this.p, t); this.p.boca(t > tt && t < tpe ? 'abierta' : 'feliz');
      // entra el amigo (con el bote de basura) y se arrepiente
      const ke = ease(cl((t - tm) / .6)), xa = lerp(2.6, 1.05, ke);
      this.a.position.x = xa; this.a.position.y = .02 + (ke > 0 && ke < 1 ? Math.abs(Math.sin(t * 10)) * .05 : 0);
      this.bo.position.x = lerp(2.4, .45, ke); this.bo.tapa.rotation.z = t > tt ? .7 * ease(cl((t - tt) / .3)) : 0;
      A.preocupa(this.a, ease(cl((t - tt) / .3))); this.a.boca(t > tt ? 'apretada' : 'abierta');
      this.a.head.rotation.z = this.a.head.r0 + (t > tt ? -.18 * ease(cl((t - tt) / .3)) + Math.sin(t * 6) * .03 : 0);
      for (const [i, b] of this.a.brazos.entries()) b.rotation.z = b.r0 + (i ? 1 : -1) * (t > tpe ? .9 + Math.sin(t * 7) * .1 : .2);
      c.ev('whoosh', .02, .4); if (t > .5) c.ev('pop', .6, .4); if (t > tco) c.ev('ding', tco, .6); if (t > tm) c.ev('whoosh', tm, .5); if (t > tt) c.ev('zap', tt, .5); if (t > tpe) c.ev('pop', tpe, .5);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 5.4))], [0, 1.15, 0], 34);
      if (t < tm) etiqueta('¡SÍ SE PUEDE COMER!', [0, 2.6, .9], lt, 44, '#ffd640', true);
      else etiqueta('¡NO LO TIRES!', [0, 2.6, .9], lt - tm, 54, '#ffffff', true);
      rotulo(t < tm ? '¡Sí se puede comer!' : 'Mándaselo a quien', t < tm ? 'y derretido queda normal' : 'tiró uno a la basura', lt - .05, RY);
    }
  });
  P.cierre();
}
