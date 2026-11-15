// Short 15-nov 18:00 · CARTULINA CHIBI: ¿Por qué si duermes de más en el puente, despiertas MÁS cansado?
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-15-1800-dormir-de-mas.json OUT ../ejemplos/2026-11-15-1800-dormir-de-mas.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xbfe3f5, PARED = 0xf6d7b8;
  const amb = (c) => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const luz = () => luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, fase = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + fase) * .05; };
  const mueve = (p, t, f = 0) => { p.brazos[0].rotation.z = p.brazos[0].r0 + Math.sin(t * 3 + f) * .04; p.brazos[1].rotation.z = p.brazos[1].r0 - Math.sin(t * 3 + f) * .04; };
  const buro = (pos) => { const b = group(pos); PM.pz(F.rect(.62, .7, .04), 0x8a5a3a, [0, .35, -.1], b, { tinta: .014, papel: .04 }); PM.det(F.rect(.5, .025, .01), 0x6a4430, [0, .4, -.08], b); PM.det(F.circ(.035), 0xffc83d, [0, .55, -.08], b); return b; };

  // ---------- 1 · gancho: ¡las doce! despierta y se levanta MÁS cansado ----------
  escena('gancho', {
    setup() { amb(PARED); this.cu = PM.cuarto({ ventana: [-.55, 2.0], abierta: 1 }); luz();
      this.c = PM.cama([-.1, 0, 0], { color: 0x2ec4a6, w: 2.3 }); this.p = PM.chibi([0, 0, 0], { logo: true, boca: 'abierta', escala: .8 }); this.pv = PM.acuesta(this.p, this.c, 0); this.c.cobija.position.x += .22;
      buro([1.43, 0, -.2]); this.d = PM.despertador([1.43, .98, .1], .26, { h: 12 }); },
    update(lt, c) {
      const t = tw(lt), td = c.w('despiertas') - .15, tc = c.w('cansado') - .2; this.cu.update(t);
      this.cu.ventana.abre(1, t);
      const ks = eout(cl((t - td) / .45)); this.pv.sienta(ks);
      A.parpadea(this.p, t, .9); PM.ojos(this.p, t < 1.0 ? 1 : t < td ? .3 : .45);
      this.p.boca(t < 1.0 ? 'abierta' : 'apretada'); A.preocupa(this.p, t < 1.0 ? .2 : .9);
      this.p.head.rotation.z = this.p.head.r0 + (t > td ? -.12 + Math.sin(t * 2.2) * .07 : Math.sin(t * 3) * .04);   // cabeceando
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 2) * .05; this.p.brazos[1].rotation.z = t > tc ? lerp(this.p.brazos[1].r0, 2.3, eout(cl((t - tc) / .3))) + Math.sin(t * 2) * .05 : this.p.brazos[1].r0;   // se talla / estira
      this.d.suena(t, t < 1.2 ? 1 : 0); this.d.hora(12);
      c.ev('ding', .05, .6); if (t > td) c.ev('whoosh', td, .4); if (t > tc) c.ev('pop', tc, .4);
      cam([.0, 1.2, lerp(10.9, 10.4, ease(lt / 3.6))], [.0, 1.15, 0], 34);
      etiqueta('¡MEDIODÍA!', [1.2, 1.65, .7], lt - .1, 46, '#ffd640', true);
      if (t > tc) etiqueta('MÁS CANSADO', [-.3, -.25, .7], lt - tc, 50, '#ffffff', true);
      rotulo('¿Dormiste de más?', 'y despiertas MÁS cansado', lt + .4, RY);
    }
  });

  // ---------- 2 · tu cuerpo tiene un reloj que espera la misma hora ----------
  escena('reloj', {
    setup() { amb(CIELO); PM.diorama(); luz();
      this.p = PM.chibi([-.85, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .85 });
      this.lu = PM.lupa([.62, 1.55, .4], .72, { fondo: 0xfff4e4 }); this.d = PM.despertador([0, -.02, 0], .42, { h: 7 }, this.lu.dentro); },
    update(lt, c) {
      const t = tw(lt), tr = c.w('reloj') - .2, tm = c.w('misma') - .2;
      A.parpadea(this.p, t, 1.4); habla(this.p, t); this.p.boca(t > tm ? 'feliz' : 'abierta');
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.05, eout(cl((t - tr) / .4))) + Math.sin(t * 4) * .05; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04;
      this.lu.scale.setScalar(pop(t, tr - .15, .35)); this.lu.rotation.z = Math.sin(t * 1.6) * .03;
      this.d.hora(t < tm ? 7 + Math.sin(t * 2) * .03 : 7); this.d.suena(t, t > tm && t < tm + .7 ? 1 : 0);
      c.ev('pop', tr, .4); if (t > tm) c.ev('ding', tm, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tr) etiqueta('RELOJ INTERNO', [.4, .55, .7], lt - tr, 44, '#ffffff', true);
      if (t > tm) etiqueta('¡MISMA HORA!', [-.85, -.25, .7], lt - tm, 48, '#ffd640', true);
      rotulo('Tu cuerpo tiene un reloj', 'que espera la misma hora', lt - .1, RY);
    }
  });

  // ---------- 3 · tres horas tarde = viajar a otro país sin salir de la cama ----------
  escena('viaje', {
    setup() { amb(0x232a63); this.es = PM.espacio(); luz();
      this.ti = PM.tierra([0, -.35, .2], .95); this.ti.mapa.rotation.z = 0;
      this.d = PM.despertador([-1.05, 2.15, .4], .3, { h: 7 });
      this.cg = group([0, 0, .6]); this.c = PM.cama([0, 0, 0], { color: 0xff6b5b }, this.cg); this.cg.scale.setScalar(.5);
      this.p = PM.chibi([0, 0, 0], { logo: true, boca: 'feliz', escala: .8 }); this.pv = PM.acuesta(this.p, this.c, 0);
      this.z = P.zzz([-.6, 1.6, .2], { color: 0xffffff }, this.cg);
      this.av = PM.avion([0, 0, .7], .45); },
    update(lt, c) {
      const t = tw(lt), th = c.w('tres') - .2, tv = c.w('viajar') - .25, tp = c.w('país') - .2; this.es.update(t);
      this.d.hora(7 + 3 * ease(cl((t - th) / .8))); this.d.suena(t, t > th + .8 && t < th + 1.3 ? 1 : 0);
      this.d.scale.setScalar(t < tv ? 1 : Math.max(.001, 1 - eout(cl((t - tv) / .3))));
      // la cama vuela en arco sobre la Tierra
      const k = ease(cl((t - tv + .3) / 2.4)), a = lerp(2.1, 1.05, k), R = 1.72;
      this.cg.position.set(Math.cos(a) * R, -.35 + Math.sin(a) * R - .2, .6); this.cg.rotation.z = a - Math.PI / 2 + Math.sin(t * 3) * .03;
      this.cg.visible = t > tv - .1; this.cg.scale.setScalar(t < tv - .1 ? .001 : .5 * Math.min(1, pop(t, tv - .1, .3)));
      this.z.update(t, 1); A.parpadea(this.p, t, 0); PM.ojos(this.p, .1); this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 2) * .05;
      const aa = a - .45; this.av.position.set(Math.cos(aa) * R, -.35 + Math.sin(aa) * R - .1, .7); this.av.rotation.z = aa - Math.PI / 2 + Math.sin(t * 4) * .08; this.av.visible = t > tv + .1;
      this.ti.mapa.rotation.z = -t * .25; this.ti.rotation.z = Math.sin(t) * .02;
      if (t > th) c.ev('pop', th, .4); if (t > tv) c.ev('whoosh', tv, .7); if (t > tp) c.ev('ding', tp, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > th && t < tv - .3) etiqueta('+3 HORAS', [-1.0, 1.55, .7], lt - th, 50, '#ffd640', true);
      if (t > tp) etiqueta('¡OTRO PAÍS!', [0, -.35, 1.3], lt - tp, 50, '#ffd640', true);
      if (t < tv) rotulo('Si te levantas', 'tres horas tarde…', lt - .1, RY); else rotulo('Viajas a otro país', 'sin salir de tu cama', lt - tv, RY);
    }
  });

  // ---------- 4 · si despiertas en sueño profundo, el cerebro tarda en prenderse ----------
  escena('profundo', {
    setup() { amb(PARED); this.cu = PM.cuarto({ ventana: [-1.15, 2.05], abierta: .3, cuadro: [1.45, .95, -2.6] }); luz();
      this.cg = group([-.4, 0, 0]); this.c = PM.cama([0, 0, 0], { color: 0x7b5cff }, this.cg); this.cg.scale.setScalar(.85); this.c.cobija.position.x += .22;
      this.p = PM.chibi([0, 0, 0], { logo: true, boca: 'apretada', escala: .8 }); this.pv = PM.acuesta(this.p, this.c, 0);
      this.lu = PM.lupa([.88, 1.85, .4], .58, { fondo: 0xffe9ef }); this.ce = PM.cerebro([-.14, .02, 0], .26, { expr: 'feliz' }); this.lu.dentro.add(this.ce);
      this.fo = PM.foco([.32, .12, 0], .14, this.lu.dentro); this.z = P.zzz([-.05, .25, .05], { color: 0x7b5cff }, this.lu.dentro); this.z.scale.setScalar(.45);
      this.d = PM.despertador([1.38, .45, .5], .24, { h: 7 }); },
    update(lt, c) {
      const t = tw(lt), td = c.w('despiertas') - .15, ts = c.w('sueño') - .2, tc = c.w('cerebro') - .2, tt = c.w('tarda') - .2, tpr = c.w('prenderse') - .1; this.cu.update(t); this.cu.ventana.abre(.3, t);
      this.d.suena(t, t > td && t < tc ? 1 : 0); this.d.hora(7);
      const ks = eout(cl((t - tc) / .5)) * .9; this.pv.sienta(ks);
      A.parpadea(this.p, t, 2.0); PM.ojos(this.p, t < tc ? .1 : .4); A.preocupa(this.p, t > td ? .8 : 0); this.p.boca(t > td ? 'apretada' : 'feliz');
      this.p.head.rotation.z = this.p.head.r0 + (t > tc ? -.15 + Math.sin(t * 2) * .08 : Math.sin(t * 2) * .04); this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 2.5) * .05; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 - Math.sin(t * 2.5) * .05;
      this.lu.scale.setScalar(pop(t, ts - .25, .35)); this.lu.rotation.z = Math.sin(t * 1.5) * .02;
      A.parpadea(this.ce, t, 0); (this.ce.head.ojos).forEach(e => e.scale.y = t < tt ? .1 : Math.min(e.scale.y, .5)); this.ce.cara(t < tt ? 'feliz' : 'duda'); this.ce.rotation.z = Math.sin(t * 2) * .05;
      this.z.update(t, t < tt ? 1 : 0);
      const parp = t > tt && t < tpr + .4 ? (Math.sin(t * 40) > .3 ? 1 : 0) : t >= tpr + .4 ? 1 : 0; this.fo.prende(parp, t);
      if (t > td) c.ev('ding', td, .5); if (t > ts) c.ev('pop', ts, .4); if (t > tpr + .4) c.ev('ding', tpr + .4, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > ts && t < tt) etiqueta('SUEÑO PROFUNDO', [.6, .85, .7], lt - ts, 42, '#ffffff', true);
      if (t > tt) etiqueta('CARGANDO…', [.75, .85, .7], lt - tt, 46, '#ffd640', true);
      rotulo(t < tc ? 'Si despiertas' : 'tu cerebro', t < tc ? 'en sueño profundo…' : 'tarda en prenderse', t < tc ? lt - .1 : lt - tc, RY);
    }
  });

  // ---------- 5 · truco: levántate a tu hora y abre la cortina · mándaselo ----------
  escena('remate', {
    setup() { amb(PARED); this.cu = PM.cuarto({ ventana: [-.95, 2.0], cuadro: [1.45, 2.1, -2.6] }); luz();
      this.p = PM.chibi([-1.0, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .8 });
      this.cg = group([.66, 0, 0]); this.c = PM.cama([0, 0, 0], { color: 0xffc83d }, this.cg); this.cg.scale.setScalar(.56);
      this.a = PM.chibi([0, 0, 0], { ropa: 0x2ec4a6, colPelo: 0x1f1410, boca: 'feliz', escala: .8 }); this.pa = PM.acuesta(this.a, this.c, 0);
      this.z = P.zzz([-.35, 1.25, .3], { color: 0x7b5cff }, this.cg); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('abre') - .2, tm = c.w('mándaselo') - .2, tdu = c.w('duerme') - .2; this.cu.update(t);
      const ko = eout(cl((t - ta) / .6)); this.cu.ventana.abre(ko, t);
      A.parpadea(this.p, t, .5); habla(this.p, t); this.p.boca(t > ta + .4 ? 'feliz' : 'abierta');
      // abre la cortina (brazo arriba) y luego señala al dormilón
      if (t < tm) { this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -2.4, eout(cl((t - ta + .3) / .3))) + Math.sin(t * 4) * .06; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + Math.sin(t * 3) * .04; }
      else { this.p.brazos[0].rotation.z = lerp(-2.4, this.p.brazos[0].r0, eout(cl((t - tm) / .3))); this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.1, eout(cl((t - tm) / .35))) + Math.sin(t * 4) * .05; }
      A.parpadea(this.a, t, 1.3); PM.ojos(this.a, .1); this.a.head.rotation.z = this.a.head.r0 + Math.sin(t * 1.8) * .05; this.z.update(t, 1);
      this.a.brazos[0].rotation.z = this.a.brazos[0].r0 + Math.sin(t * 1.5) * .05;
      if (t > ta) c.ev('whoosh', ta, .5); if (t > tm) c.ev('pop', tm, .4); if (t > tdu) c.ev('ding', tdu, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > .2 && t < tm) etiqueta('TRUCO', [-1.0, -.25, .7], lt - .2, 52, '#ffd640', true);
      if (t > tm) etiqueta('MÁNDASELO', [-1.0, -.25, .7], lt - tm, 50, '#ffd640', true);
      if (t > tdu) etiqueta('¡DORMILÓN!', [.66, 1.4, .7], lt - tdu, 44, '#ffffff', true);
      if (t < tm) rotulo('Levántate a tu hora', 'y abre la cortina', lt - .1, RY); else rotulo('Mándaselo al que duerme', 'hasta mediodía', lt - tm, RY);
    }
  });
  P.cierre();
}
