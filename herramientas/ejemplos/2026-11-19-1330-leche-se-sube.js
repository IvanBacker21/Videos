// Short 19-nov 13:30 · CARTULINA CHIBI: ¿Por qué la leche siempre se sube y el agua no? (proteínas y grasa forman la nata;
// el vapor queda atrapado debajo y se hace espuma que se derrama; truco: fuego bajito y menearla)
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-19-1330-leche-se-sube.json OUT ../ejemplos/2026-11-19-1330-leche-se-sube.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, PARED = 0xfbe6c8, AGUA = 0x8fd3ff, LECHE = 0xfffaf0;
  const luz = () => P.luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
  const cocina = (o) => { ambiente({ top: PARED, bottom: PARED, fog: PARED, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); const k = PM.cocina(o); luz(); return k; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 6 + f) * .05; };
  const pocillo = (k, x, o = {}) => PM.pocillo([x, k.topY + .25, -1.0], { w: .7, ...o });
  const yo = (x, es = .8, boca = 'abierta') => PM.chibi([x, 0, .3], { logo: true, boca, mira: 1, escala: es });
  // manos a la cabeza (pánico) k 0..1
  const panico = (p, k, t) => { p.brazos[0].rotation.z = lerp(p.brazos[0].r0, -2.5, k) + Math.sin(t * 9) * .08 * k; p.brazos[1].rotation.z = lerp(p.brazos[1].r0, 2.5, k) - Math.sin(t * 9 + 1) * .08 * k; };

  // ---------- 1 · gancho: agua tranquila vs leche que sube ----------
  escena('gancho', {
    setup() { const k = cocina(); this.pa = pocillo(k, .05, { w: .76, liquido: AGUA, color: 0xff6b5b }); this.pl = pocillo(k, .92, { w: .76 });
      this.p = yo(-.95, .78); this.q = PM.pregunta([-.45, 2.3, .5], .6, 0xffc83d); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('sube') - .1, ta = c.w('agua') - .1;
      A.parpadea(this.p, t + 1.3, .6); habla(this.p, t); this.pa.fuego(1, t); this.pl.fuego(1, t + .4);
      this.pa.hierve(t, 1); this.pl.nata(1); this.pl.espuma(lerp(.05, .55, ease(cl((t - .2) / (ts + .3 - .2)))) + Math.sin(t * 3) * .02, t);
      A.preocupa(this.p, eout(cl((t - ts) / .3))); panico(this.p, eout(cl((t - ts) / .35)), t);
      this.p.boca(t > ts ? 'abierta' : 'abierta'); this.p.position.y = t > ts ? Math.abs(Math.sin((t - ts) * 9)) * .04 * Math.max(0, 1 - (t - ts) * 1.5) : 0;
      this.q.scale.setScalar(pop(t, ta, .35) * .6); this.q.rotation.z = Math.sin(t * 3) * .12;
      c.ev('whoosh', .05, .4); if (t > ts) c.ev('pop', ts, .4); if (t > ta) c.ev('ding', ta, .4);
      cam([.0, 1.2, lerp(10.9, 10.4, ease(lt / 2.6))], [.0, 1.15, 0], 34);
      etiqueta('AGUA', [.05, .55, .7], lt - .15, 44, '#ffffff', true);
      etiqueta('LECHE', [.92, .55, .7], lt - .3, 44, '#ffd640', true);
      rotulo('¿Por qué la leche', 'siempre se sube?', lt - .05, RY);
    }
  });

  // ---------- 2 · nata: proteínas y grasa se toman de la mano y forman una telita ----------
  escena('nata', {
    setup() { const k = cocina(); this.pl = pocillo(k, .95, { w: .62 }); this.p = yo(-1.0, .72);
      this.lu = PM.lupa([-.05, 1.75, .45], .62, { fondo: 0xfff4dc });
      this.banda = PM.det(F.rect(1.08, .14, .03), 0xf3d58f, [0, .22, .005], this.lu.dentro);
      this.ms = Array.from({ length: 10 }, (_, i) => { const pr = i % 2 === 0; const m = pr ? PM.pz(F.circ(.085), 0xff8a6b, [0, 0, .02], this.lu.dentro, { tinta: .01, papel: false }) : PM.pz(F.gota(.26), 0xffc83d, [0, 0, .02], this.lu.dentro, { tinta: .01, papel: false });
        m.i = i; m.a = i * 2.4; m.rr = .15 + ((i * .37) % 1) * .27; m.fx = -.48 + i * (.96 / 9); return m; });
      this.manos = Array.from({ length: 9 }, (_, i) => { const l = PM.det(F.rect(.1, .034, .01), 0xb85a3a, [-.48 + (i + .5) * (.96 / 9), .22, .01], this.lu.dentro); return l; }); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('proteínas') - .1, tg = c.w('grasa') - .1, tf = c.w('forman') - .1, tt = c.w('telita') - .1, tn = c.w('nata.') - .1;
      A.parpadea(this.p, t + .5, 1.1); habla(this.p, t);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.15, eout(cl((t - .3) / .4))) + Math.sin(t * 4) * .04; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04;
      this.pl.fuego(1, t); this.pl.nata(ease(cl((t - tt) / .6)));
      this.lu.scale.setScalar(pop(t, .1, .35)); this.lu.rotation.z = Math.sin(t * 1.8) * .03;
      const kj = ease(cl((t - tf) / (tt + .3 - tf)));
      this.ms.forEach(m => { const ang = m.a + t * (1.6 + (m.i % 3) * .4) * (m.i % 2 ? 1 : -1), wx = Math.cos(ang) * m.rr, wy = Math.sin(ang * 1.3) * m.rr * .8 - .05;
        m.position.set(lerp(wx, m.fx, kj), lerp(wy, .22 + Math.sin(t * 6 + m.i) * .01, kj), .02); m.rotation.z = (1 - kj) * Math.sin(t * 3 + m.i) * .5 + (m.i % 2 ? Math.PI : 0) * kj;
        const on = m.i % 2 === 0 ? pop(t, tp - .3, .35) : pop(t, tg - .2, .35); m.scale.setScalar(on); });
      this.manos.forEach((l, i) => l.scale.set(Math.max(.001, cl((kj - .7) / .3 - i * .04) * 1.0), 1, 1));
      this.banda.scale.set(Math.max(.001, ease(cl((t - tn + .1) / .4))), 1, 1);
      c.ev('pop', .1, .4); if (t > tp) c.ev('pop', tp, .4); if (t > tg) c.ev('pop', tg, .4); if (t > tt) c.ev('whoosh', tt, .4); if (t > tn) c.ev('ding', tn, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tp && t < tf) etiqueta('PROTEÍNAS', [-.35, .7, .7], lt - tp, 38, '#ff8a6b', true);
      if (t > tg && t < tf) etiqueta('GRASA', [.55, .7, .7], lt - tg, 38, '#ffd640', true);
      if (t > tn) etiqueta('¡LA NATA!', [-.1, .5, .7], lt - tn, 56, '#ffd640', true);
      if (t < tf) rotulo('Proteínas y grasa', 'de la leche', lt - .1, RY); else rotulo('Forman una telita', 'arriba: la nata', lt - tf, RY);
    }
  });

  // ---------- 3 · vapor: corte del pocillo, burbujas atrapadas bajo la tapita ----------
  escena('vapor', {
    setup() { const k = cocina({ ventana: false }); this.po = PM.pocillo([.32, k.topY + .25, -1.0], { w: 1.35, h: .95, corte: true, nivel: .62 }); this.p = yo(-1.05, .7); },
    update(lt, c) {
      const t = tw(lt), tv = c.w('vapor') - .15, tat = c.w('atrapado') - .15, tta = c.w('tapita') - .15, te = c.w('espuma.') - .2;
      A.parpadea(this.p, t + 1.7, .8); habla(this.p, t); A.preocupa(this.p, .3 * eout(cl((t - tat) / .4)));
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.05, eout(cl((t - .2) / .4))) + Math.sin(t * 4) * .04; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04;
      this.po.fuego(1, t); this.po.nata(1);
      this.po.vapor(t, cl((t - tv + .2) / .3), ease(cl((t - tat) / .7)));
      this.po.espuma(.42 * ease(cl((t - te) / .7)), t);
      this.po.nataG.position.y = this.po.topLiq + .01 + .03 * ease(cl((t - tta) / .5)) + (t > tta ? Math.sin(t * 7) * .008 : 0);
      if (t > tv) c.ev('whoosh', tv, .4); if (t > tat) c.ev('pop', tat, .4); if (t > te) c.ev('ding', te, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tv && t < te) etiqueta('VAPOR', [.32, .5, .7], lt - tv, 50, '#ffffff', true);
      if (t > tat && t < te) etiqueta('¡ATRAPADO!', [.32, 2.4, .7], lt - tat, 44, '#ffd640', true);
      if (t > te) etiqueta('¡ESPUMA!', [.32, 2.45, .7], lt - te, 56, '#ffd640', true);
      rotulo('El vapor queda atrapado', 'bajo la nata', lt - .1, RY);
    }
  });

  // ---------- 4 · derrame: la espuma sube como volcán y se tira en la estufa ----------
  escena('derrame', {
    setup() { const k = cocina(); this.po = pocillo(k, .45, { w: .9 }); this.p = yo(-.95, .78);
      this.humo = PM.olor([-.25, k.topY + .1, -1.0], 0x9aa3b5); },
    update(lt, c) {
      const t = tw(lt), ts2 = c.w('sube…') - .1, tad = c.w('adiós') - .1;
      A.parpadea(this.p, t + .9, .7); habla(this.p, t); A.preocupa(this.p, eout(cl((t - .1) / .4)));
      panico(this.p, eout(cl((t - tad + .2) / .35)), t); this.p.position.y = t > tad ? Math.abs(Math.sin((t - tad) * 9)) * .04 * Math.max(0, 1 - (t - tad) * 1.5) : 0;
      this.po.nata(1); this.po.espuma(lerp(.3, 1, ease(cl((t - .1) / (ts2 + .4 - .1)))), t);
      this.po.fuego(1 - eout(cl((t - tad) / .35)), t); this.humo.update(t, t > tad + .2 ? 1 : 0);
      if (t < tad) A.tiembla(this.po, t, .25 * cl((t - ts2 + .4) / .3), .45); else this.po.position.x = .45;
      c.ev('whoosh', .05, .4); if (t > ts2) c.ev('pop', ts2, .4); if (t > tad) c.ev('ding', tad, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > ts2 - .4) etiqueta('¡SE TIRA!', [.45, 2.5, .7], lt - ts2 + .4, 54, '#ffd640', true);
      rotulo('La espuma sube y sube…', '¡y adiós estufa!', lt - .1, RY);
    }
  });

  // ---------- 5 · remate: fuego bajito y menearla; mándaselo ----------
  escena('remate', {
    setup() { const k = cocina(); this.po = pocillo(k, .5, { w: .9 }); this.p = yo(-.85, .78, 'feliz');
      this.cu = group([.5, k.topY + .25 + .55, -.9]); PM.pz(P.tubo([[0, 0], [.04, .55]], .05, .05), 0xc8893a, [0, 0, 0], this.cu, { tinta: .01, papel: .03 }); PM.pz(F.elipse(.09, .06), 0xc8893a, [0, -.02, .01], this.cu, { tinta: .01, papel: .03 });
      this.ok = PM.marca([1.1, 2.3, .6], true, .55);
      this.ta = PM.taza([0, -.6, .12], this.p.brazos[0], { liquido: 0x8a5a3a }); },
    update(lt, c) {
      const t = tw(lt), tb = c.w('bajito') - .1, tm = c.w('menéala') - .1, tma = c.w('Mándaselo') - .1, tc = c.w('café') - .2;
      A.parpadea(this.p, t + 2.1, .5); habla(this.p, t);
      this.p.boca(t > tm && t < tma ? 'feliz' : t > tma ? 'abierta' : 'feliz');
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.1, eout(cl((t - .15) / .4))) + Math.sin(t * 4) * .05; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .05;
      this.po.fuego(lerp(1, .38, ease(cl((t - tb) / .5))), t); this.po.nata(1 - ease(cl((t - tm) / .8)) * .7);
      this.po.espuma(lerp(.35, 0, ease(cl((t - tb) / 1.2))), t);
      const km = cl((t - tm + .3) / .3); this.cu.position.x = .5 + Math.sin(t * 7) * .14 * km; this.cu.rotation.z = Math.sin(t * 7) * .25 * km;
      this.ok.scale.setScalar(pop(t, tm, .3) * .55);
      this.ta.scale.setScalar(pop(t, tc, .35)); this.ta.humea(t, 1); this.ta.rotation.z = -this.p.brazos[0].rotation.z;
      c.ev('whoosh', .05, .4); if (t > tm) c.ev('ding', tm, .5); if (t > tma) c.ev('pop', tma, .4); if (t > tc) c.ev('pop', tc, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tb && t < tma) etiqueta('FUEGO BAJITO', [.5, .55, .7], lt - tb, 40, '#ffffff', true);
      if (t > tma) etiqueta('MÁNDASELO', [-.3, 2.35, .7], lt - tma, 52, '#ffd640', true);
      if (t < tma) rotulo('Truco: fuego bajito', 'y menéala', lt - .1, RY); else rotulo('Mándaselo a quien', 'se le sube la leche', lt - tma, RY);
    }
  });
  P.cierre();
}
