// Short 20-nov 18:00 · CARTULINA CHIBI: ¿por qué no te puedes hacer cosquillas tú solo? El cerebelo predice lo que vas a sentir
// con tus propios movimientos y le baja el volumen (sin sorpresa no hay cosquillas). En el University College London (Blakemore,
// Wolpert y Frith) un robot que retrasaba el movimiento de tu propia mano hacía que las autocosquillas se sintieran más.
// Fuentes: Scientific American (Why can't a person tickle himself?), Britannica, Blakemore et al. 2000 (Neuroreport), UCL News.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-20-1800-cosquillas.json OUT ../ejemplos/2026-11-20-1800-cosquillas.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, PARED = 0xf6d7b8, ROSA = 0xff6b9b, ROJO = 0xff4d5e, MORADO = 0x7b5cff;
  const set = (ven = [-1.0, 2.05]) => { ambiente({ top: PARED, bottom: PARED, fog: PARED, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.cuarto({ ventana: ven, abierta: 1 }); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const rie = (p, t, k, y0 = .02) => { p.position.y = y0 + Math.abs(Math.sin(t * 14)) * .07 * k; p.head.rotation.z = p.head.r0 + Math.sin(t * 14) * .1 * k; };
  // pluma delante del chibi: la base en su mano derecha y la punta en la panza (hija del chibi, z al frente)
  const plumaMano = (p, col = ROSA) => { const pl = PM.pluma([.37, .5, .7], { color: col, largo: .6 }, p); pl.scale.z = 5; pl.rotation.z = pl.r0 = .95; return pl; };
  const manoPluma = (p, t, on = 1) => { p.brazos[1].rotation.z = p.brazos[1].r0 + Math.sin(t * 28) * .05 * on; };

  // ---------- 1 · gancho: se hace cosquillas con una pluma en la panza… y nada ----------
  escena('gancho', {
    setup() { set();
      this.p = PM.chibi([-.05, .02, .3], { logo: true, boca: 'apretada', mira: 0, escala: .95 });
      this.pl = plumaMano(this.p);
      this.pr = PM.pregunta([.85, 1.95, .5], .55); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('cosquillas') - .1, ts = c.w('solo?') - .1;
      A.parpadea(this.p, t + 1.3, .2); respira(this.p, t);
      manoPluma(this.p, t); this.pl.cosquillea(t, 1);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 2) * .04;
      A.ladea(this.p, ease(cl((t - tc) / .4)) * .6, -1); A.preocupa(this.p, .3 + .5 * ease(cl((t - tc) / .4)));
      this.p.boca(t > ts ? 'apretada' : 'abierta');
      this.pr.scale.setScalar(pop(t, ts, .35) * .55); this.pr.rotation.z = Math.sin(t * 3) * .1;
      c.ev('whoosh', .05, .4); if (t > tc) c.ev('pop', tc, .4); if (t > ts) c.ev('ding', ts, .5);
      cam([0, 1.2, lerp(10.9, 10.3, ease(lt / 2.9))], [0, 1.15, 0], 34);
      if (t > tc) etiqueta('¿NADA?', [-.75, 2.35, .9], lt - tc, 60, '#ffd640', true);
      rotulo('¿Por qué no puedes', 'hacerte cosquillas?', lt - .05, RY);
    }
  });

  // ---------- 2 · cerebelo: cerebro con carita; el cerebelo (morado, atrás y abajo) se ilumina y ya "ve" la pluma antes de moverse ----------
  escena('cerebelo', {
    setup() { set([-1.6, 2.05]);
      this.p = PM.chibi([-.78, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .8 });
      this.pl = plumaMano(this.p);
      this.cb = PM.cerebro([.55, 1.55, .5], .5, { expr: 'feliz' });
      this.ce = group([.42, -.38, .03], this.cb.cuerpo);
      PM.pz(F.elipse(.28, .17), MORADO, [0, 0, 0], this.ce, { tinta: .014, papel: .04 });
      for (const y of [-.05, .05]) PM.det(F.rect(.36, .02, .008), 0x5a3fd6, [0, y, .016], this.ce);
      this.lt = PM.letrero([.55, .55, .6], 'CEREBELO', { w: 1.05, h: .3, hilos: false, borde: MORADO });
      this.nube = group([-.12, 2.28, .55]); PM.pz(F.nube(.42), 0xffffff, [0, 0, 0], this.nube, { tinta: .016, papel: .05 });
      this.mini = PM.pluma([0, -.2, .03], { color: ROSA, largo: .55 }, this.nube); this.mini.rotation.z = .5;
      this.ok = PM.marca([.25, .1, .05], true, .4, this.nube); },
    update(lt, c) {
      const t = tw(lt), tce = c.w('cerebelo,') - .1, tca = c.w('cabeza,') - .1, tad = c.w('adivina') - .1, tan = c.w('antes') - .1;
      A.parpadea(this.p, t + .4, 1.4); A.parpadea(this.cb, t + 2.1, .9); respira(this.p, t);
      // la mano se queda quieta hasta "antes", luego se mueve (lo que el cerebelo ya adivinó)
      const mov = t > tan; manoPluma(this.p, t, mov ? 1 : 0); this.pl.cosquillea(t, mov ? 1 : 0);
      this.p.boca(t > tad ? 'feliz' : 'abierta'); this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 2) * .03;
      this.cb.scale.setScalar(pop(t, 0, .4)); this.cb.position.y = 1.55 + Math.sin(t * 2.4) * .03;
      const kc = ease(cl((t - tce) / .35)); this.ce.scale.setScalar(Math.max(.001, kc * (1 + .12 * Math.sin(t * 8) * (t > tca ? 1 : 0))));
      this.lt.scale.setScalar(pop(t, tce + .1, .35));
      this.nube.scale.setScalar(pop(t, tad, .35)); this.mini.cosquillea(t, 1); this.ok.scale.setScalar(t > tan ? pop(t, tan, .3) * .4 : .001);
      this.cb.cara(t > tad ? 'abierta' : 'feliz');
      c.ev('whoosh', .05, .4); if (t > tce) c.ev('pop', tce, .4); if (t > tad) c.ev('pop', tad, .4); if (t > tan) c.ev('ding', tan, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tad) etiqueta('¡LO ADIVINA!', [.6, -.3, .9], lt - tad, 50, '#ffd640', true);
      rotulo('Tu cerebelo adivina', 'cada movimiento', lt - .1, RY);
    }
  });

  // ---------- 3 · volumen: barras de "COSQUILLAS" que bajan una por una; cara seria y tache ----------
  escena('volumen', {
    setup() { set([-1.6, 2.05]);
      this.p = PM.chibi([-.72, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .82 });
      this.pl = plumaMano(this.p);
      this.pa = group([.68, 1.15, .45]);
      PM.pz(F.rect(1.2, 1.25, .06), 0x34313d, [0, 0, 0], this.pa, { tinta: .016, papel: .06 });
      this.bs = [0, 1, 2, 3, 4].map(i => { const h = .22 + i * .17, b = group([-.4 + i * .2, -.48, .03], this.pa);
        PM.pz(F.rect(.14, h, .03), [0x2ec4a6, 0x2ec4a6, 0xffc83d, 0xffc83d, ROJO][i], [0, h / 2, 0], b, { tinta: .01, papel: false }); return b; });
      this.lt = PM.letrero([0, .82, .02], 'COSQUILLAS', { w: 1.2, h: .3, hilos: false, borde: ROSA }, this.pa);
      this.tache = PM.marca([.68, 1.2, .8], false, .8); },
    update(lt, c) {
      const t = tw(lt), tsa = c.w('sabe') - .1, tba = c.w('baja') - .1, tce = c.w('cero') - .1;
      A.parpadea(this.p, t + 2.5, .7); respira(this.p, t);
      manoPluma(this.p, t); this.pl.cosquillea(t, 1);
      this.pa.scale.setScalar(pop(t, 0, .4));
      this.bs.forEach((b, i) => { const ti = tba + (4 - i) * .18; const k = i === 0 ? 1 : 1 - ease(cl((t - ti) / .25)); b.scale.y = Math.max(.02, k * (1 + .05 * Math.sin(t * 10 + i))); });
      const kb = ease(cl((t - tba) / 1.0)); A.preocupa(this.p, 0); this.p.boca(t > tba ? 'apretada' : 'feliz');
      A.ladea(this.p, kb * .4, -1);
      this.tache.scale.setScalar(t > tce ? pop(t, tce, .3) * .8 : .001);
      c.ev('whoosh', .05, .4); if (t > tsa) c.ev('pop', tsa, .4); for (let i = 4; i >= 1; i--) { const ti = tba + (4 - i) * .18; if (t > ti) c.ev('pop', ti, .25); } if (t > tce) c.ev('impact', tce, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tce) etiqueta('¡CERO RISA!', [0, 2.45, .9], lt - tce, 54, '#ffd640', true);
      rotulo('Ya sabe lo que sentirás', 'y le baja el volumen', lt - .1, RY);
    }
  });

  // ---------- 4 · robot: el chibi mueve una palanca; el robot copia el movimiento CON RETRASO y la pluma sí da risa ----------
  escena('robot', {
    setup() { set([-1.6, 2.05]);
      this.p = PM.chibi([-.8, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .8 });
      // palanca en la mano izquierda del protagonista
      this.pal = group([.0, -.5, .1], this.p.brazos[1]); PM.pz(F.rect(.06, .35, .02), 0x9aa3b5, [0, .12, 0], this.pal, { tinta: .01, papel: false }); PM.pz(F.circ(.08), ROJO, [0, .3, .01], this.pal, { tinta: .01, papel: .03 });
      // robot de cartulina
      this.r = group([.72, 0, .2]);
      PM.pz(F.rect(.7, .7, .06), 0x9aa3b5, [0, .75, 0], this.r, { tinta: .018, papel: .06 });
      PM.det(F.rect(.4, .22, .02), 0x6a7088, [0, .78, .02], this.r); this.luz = PM.det(F.circ(.05), 0x2ec4a6, [0, .78, .03], this.r);
      for (const x of [-.18, .18]) PM.pz(F.rect(.12, .38, .03), 0x6a7088, [x, .2, -.02], this.r, { tinta: .014, papel: .04 });
      this.cab = group([0, 1.35, .01], this.r); PM.pz(F.rect(.55, .42, .06), 0xc9d1e0, [0, 0, 0], this.cab, { tinta: .018, papel: .06 });
      this.ojos = [-.12, .12].map(x => PM.det(F.circ(.065), 0x1f1b2e, [x, .03, .02], this.cab)); PM.det(F.rect(.2, .04, .01), 0x1f1b2e, [0, -.11, .02], this.cab);
      PM.det(F.rect(.025, .2, .01), 0x6a7088, [0, .3, -.01], this.cab); PM.pz(F.circ(.05), ROJO, [0, .42, 0], this.cab, { tinta: .01, papel: .03 });
      this.br = group([-.3, .95, .03], this.r); PM.pz(F.rect(.6, .1, .03), 0x6a7088, [-.3, 0, 0], this.br, { tinta: .014, papel: .04 });
      this.pl = PM.pluma([-.6, 0, .03], { color: ROSA, largo: .6 }, this.br); this.pl.rotation.z = this.pl.r0 = 1.9;
      this.rl = group([.72, 2.15, .6]); PM.pz(F.circ(.22), 0xffffff, [0, 0, 0], this.rl, { tinta: .016, papel: .05 });
      this.aguja = group([0, 0, .02], this.rl); PM.det(F.rect(.03, .17, .01), 0x1f1b2e, [0, .07, 0], this.aguja);
      this.lon = PM.letrero([-.55, 2.2, .55], 'LONDRES', { w: .95, h: .28, hilos: false, borde: 0x3d6bff }); },
    update(lt, c) {
      const t = tw(lt), tlo = c.w('Londres') - .1, tro = c.w('robot') - .1, tre = c.w('retrasaba') - .1, tpa = c.w('pausita,') - .1, tsi = c.w('¡sentías') - .1;
      A.parpadea(this.p, t + 1.7, .5); this.ojos.forEach(o => o.scale.y = ((t + .9) % 2.6) < .1 ? .15 : 1);
      // palanca: el chibi la sube y baja; el robot copia con 0.5 s de retraso
      const mano = tt => tt < tro ? 0 : Math.sin((tt - tro) * 4.5);
      this.p.brazos[1].rotation.z = .9 + mano(t) * .25; this.pal.rotation.z = -.9 - mano(t) * .25;
      const tr = t - (t > tre ? .5 : 0); this.br.rotation.z = mano(tr) * .18; this.pl.cosquillea(t, t > tpa ? 1 : 0);
      this.r.scale.setScalar(pop(t, tro, .4)); this.cab.rotation.z = Math.sin(t * 3) * .05; this.luz.visible = Math.sin(t * 8) > 0;
      this.rl.scale.setScalar(t > tre ? pop(t, tre, .3) : .001); this.aguja.rotation.z = -t * 3;
      this.lon.scale.setScalar(t > tsi - .15 ? Math.max(.001, 1 - ease(cl((t - tsi + .15) / .2))) : pop(t, tlo, .35)); this.lon.columpia(t, .03);
      const kr = ease(cl((t - tsi) / .3));
      if (t > tsi) { rie(this.p, t, kr); this.p.boca('abierta'); } else { respira(this.p, t); habla(this.p, t); this.p.boca(t > tpa ? 'apretada' : 'abierta'); }
      A.preocupa(this.p, t > tpa && t < tsi ? .6 : 0);
      c.ev('whoosh', .05, .4); if (t > tlo) c.ev('pop', tlo, .4); if (t > tro) c.ev('pop', tro, .4); if (t > tre) c.ev('whoosh', tre, .4); if (t > tsi) c.ev('ding', tsi, .5);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 5.5))], [0, 1.15, 0], 34);
      if (t > tre && t < tsi) etiqueta('PAUSITA…', [.0, -.3, .9], lt - tre, 48, '#ffffff', true);
      if (t > tsi) etiqueta('¡JAJAJA!', [-.7, 2.5, .9], lt - tsi, 56, '#ffd640', true);
      rotulo('Un robot con retraso', '¡y sientes más cosquillas!', lt - .1, RY);
    }
  });

  // ---------- 5 · remate: el hermano ataca a cosquillas; el protagonista se ríe y manda el avioncito ----------
  escena('remate', {
    setup() { set([-1.6, 2.05]);
      this.h = PM.chibi([-.22, .02, .38], { ropa: 0x2ec4a6, pantalon: 0x2b2f4a, tenis: 0xffc83d, colPelo: 0x2a1a12, boca: 'feliz', mira: 1, escala: .85 });
      this.p = PM.chibi([.6, .02, .3], { logo: true, boca: 'abierta', mira: -1, escala: .85 });
      this.av = PM.avion([.62, 1.3, .9], .45); },
    update(lt, c) {
      const t = tw(lt), tma = c.w('Mándaselo') - .1, the = c.w('hermano,') - .1, tat = c.w('ataca') - .1;
      A.parpadea(this.h, t + .6, .4); A.parpadea(this.p, t + 2.0, 1.6);
      // hermano: manos de cosquillas
      A.anda(this.h, t, .4, .02);
      const ka = 1; this.h.brazos[0].rotation.z = .9 + Math.sin(t * 16) * .2 * ka; this.h.brazos[1].rotation.z = 1.45 + Math.sin(t * 16 + 1) * .2 * ka;
      this.h.position.x = -.25 + Math.sin(t * 2) * .05;
      this.h.boca(Math.sin(t * 5) > 0 ? 'feliz' : 'abierta');
      rie(this.p, t, 1); this.p.boca('abierta'); A.preocupa(this.p, .2);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 14) * .15;
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.3, eout(cl((t - tma) / .3))) - lerp(0, 1.2, ease(cl((t - tma - .4) / .3)));
      const kv = cl((t - tma - .45) / 1.4); this.av.visible = t > tma + .45 && kv < 1; this.av.position.set(lerp(.7, 1.75, ease(kv)), 1.35 + Math.sin(kv * Math.PI) * .9 + kv * .4, .9); this.av.rotation.z = .5 - kv * .3;
      c.ev('whoosh', .05, .4); if (t > tma + .45) c.ev('whoosh', tma + .45, .5); if (t > the) c.ev('ding', the, .5); if (t > tat) c.ev('pop', tat, .4);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.5))], [0, 1.15, 0], 34);
      if (t > the) etiqueta('¡MÁNDASELO A TU HERMANO!', [0, 2.5, .9], lt - the, 38, '#ffd640', true);
      rotulo('Mándaselo a tu hermano', '(el de las cosquillas)', lt - .05, RY);
    }
  });
  P.cierre();
}
