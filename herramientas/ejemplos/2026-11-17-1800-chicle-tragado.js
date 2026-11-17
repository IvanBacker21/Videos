// Short 17-nov 18:00 · CARTULINA CHIBI: ¿Si te tragas el chicle se queda siete años en tu panza? (mito: no se digiere, pero el intestino lo empuja y sale en días)
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-17-1800-chicle-tragado.json OUT ../ejemplos/2026-11-17-1800-chicle-tragado.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xbfe3f5;
  const patio = () => { ambiente({ top: CIELO, bottom: CIELO, fog: CIELO, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); P.luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 6 + f) * .05; };
  const amigo = (pos, es = .85) => PM.chibi(pos, { gorra: 0x2ec4a6, ropa: 0xffc83d, pantalon: 0x5a4a7a, boca: 'lengua', mira: -1, escala: es });
  const PX = [.42, 1.32, .3], PS = .95;   // radiografía: posición y escala
  const rayos = () => PM.panzaRayosX(PX, PS);
  const enRuta = (rx, ch, u, dx = 0, dy = 0) => { const [x, y] = rx.ruta(u); ch.position.set(x + dx, y + dy, .04); };

  // ---------- 1 · gancho: se traga el chicle y el amigo lo asusta con los 7 años ----------
  escena('gancho', {
    setup() { patio();
      this.p = PM.chibi([-.72, 0, .3], { logo: true, boca: 'apretada', mira: 1, escala: .85 });
      this.a = amigo([.82, 0, .2]);
      this.ch = PM.chicle([-.72, 1.2, .9], .06, null, { cara: false });
      this.ca = PM.calendario([.06, 2.12, .6], 'EN TU PANZA', '7 AÑOS', { w: .8, h: .7 }); },
    update(lt, c) {
      const t = tw(lt), tt = c.w('tragas') - .05, ts = c.w('siete') - .15;
      A.parpadea(this.p, t + 1.3, .6); A.parpadea(this.a, t, 2.1);
      // mastica → se lo traga (cabeza hacia atrás, glup) → susto
      const kt = cl((t - tt) / .45);
      if (t < tt) this.p.boca(Math.sin(t * 14) > 0 ? 'abierta' : 'apretada'); else this.p.boca(t < ts ? 'apretada' : 'abierta');
      this.p.head.rotation.z = this.p.head.r0 + (t < tt ? Math.sin(t * 7) * .03 : Math.sin(kt * Math.PI) * .18);
      this.ch.visible = kt < 1 && (t < tt ? Math.sin(t * 14) > 0 : true);
      this.ch.position.y = 1.2 - .35 * ease(kt); this.ch.scale.setScalar(Math.max(.001, 1 - .7 * kt));
      A.preocupa(this.p, eout(cl((t - ts) / .3)));
      const ks = eout(cl((t - ts) / .3));
      this.p.brazos[0].rotation.z = -lerp(-this.p.brazos[0].r0, .9, ks) + Math.sin(t * 5) * .04;
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, .9, ks) - Math.sin(t * 5) * .04;
      if (t > ts) A.tiembla(this.p, t, .6, -.72);
      // el amigo bromista señala y saca la lengua
      const ka = eout(cl((t - tt - .2) / .35)); this.a.brazos[0].rotation.z = -lerp(-this.a.brazos[0].r0, 1.25, ka) + Math.sin(t * 4) * .04;
      this.a.brazos[1].rotation.z = this.a.brazos[1].r0 + Math.sin(t * 3) * .03; habla(this.a, t, 1);
      this.a.boca(t > tt + .2 ? 'lengua' : 'feliz');
      this.ca.scale.setScalar(pop(t, ts, .35)); this.ca.columpia(t);
      if (t > tt) c.ev('pop', tt + .3, .4); if (t > ts) c.ev('ding', ts, .5);
      cam([.05, 1.2, lerp(10.9, 10.3, ease(lt / 3))], [.05, 1.15, 0], 34);
      if (t > tt + .3 && t < ts + .2) etiqueta('¡GLUP!', [-.72, -.2, .7], lt - tt - .3, 58, '#ffd640', true);
      if (t > ts + .2) etiqueta('¿7 AÑOS?', [-.1, -.2, .7], lt - ts - .2, 56, '#ffffff', true);
      rotulo('¿Si te tragas el chicle', '¿se queda siete años?', lt - .05, RY);
    }
  });

  // ---------- 2 · ¡mito! pero la panza no puede deshacer la goma ----------
  escena('mito', {
    setup() { patio();
      this.p = PM.chibi([-.92, 0, .3], { logo: true, boca: 'feliz', mira: 1, escala: .78 });
      this.ca = PM.calendario([.42, 1.55, .4], 'EN TU PANZA', '7 AÑOS', { w: 1.0, h: .9 });
      this.se = PM.letrero([.42, 1.5, .6], 'MITO', { w: 1.15, h: .44, borde: 0xff3b5b, color: 0xffffff, tinta: '#ff3b5b', hilos: false });
      this.rx = rayos(); this.ch = PM.chicle([0, 0, 0], .1, this.rx.dentro); },
    update(lt, c) {
      const t = tw(lt), tm = c.w('mito.') - .15, tp = c.w('panza') - .25, td = c.w('deshacer') - .1;
      A.parpadea(this.p, t, 1.4); habla(this.p, t);
      this.p.boca(t < tp ? 'feliz' : 'abierta');
      const kb = eout(cl((t - .1) / .35)); this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.1, kb) + Math.sin(t * 4) * .04;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      // calendario + sello de MITO, y luego se van
      const kf = 1 - eout(cl((t - tp) / .25));
      this.ca.scale.setScalar(Math.max(.001, kf)); this.ca.columpia(t);
      const ks = t < tm ? 0 : Math.min(1, cl((t - tm) / .18)); this.se.visible = t > tm && kf > .01;
      this.se.scale.setScalar(Math.max(.001, (1 + 1.2 * (1 - ks)) * kf)); this.se.rotation.z = .22;
      // radiografía con el chicle entero que rebota en el estómago
      this.rx.scale.setScalar(pop(t, tp, .35) * PS);
      const sq = t > td ? Math.sin((t - td) * 14) * .18 * Math.max(0, 1 - (t - td) * .6) : 0;
      enRuta(this.rx, this.ch, .3, Math.sin(t * 3) * .04, Math.abs(Math.sin(t * 5)) * .05); this.ch.scale.set(1 + sq, 1 - sq, 1);
      if (t > tm) c.ev('pop', tm, .5); if (t > tp) c.ev('whoosh', tp, .4); if (t > td) c.ev('ding', td, .4);
      cam([.1, 1.2, 10.4], [.1, 1.15, 0], 34);
      if (t > tm && t < tp) etiqueta('¡ES UN MITO!', [.1, -.2, .7], lt - tm, 54, '#ffd640', true);
      if (t > td) etiqueta('NO SE DESHACE', [.1, -.2, .7], lt - td, 48, '#ffffff', true);
      if (t < tp) rotulo('¡Es un mito!', 'no son siete años', lt - .05, RY); else rotulo('Tu panza no deshace', 'la goma del chicle', lt - tp, RY);
    }
  });

  // ---------- 3 · no se pega: el intestino lo empuja y sale en unos días ----------
  escena('sale', {
    setup() { patio();
      this.p = PM.chibi([-.92, 0, .3], { logo: true, boca: 'abierta', mira: 1, escala: .78 });
      this.rx = rayos(); this.ch = PM.chicle([0, 0, 0], .1, this.rx.dentro);
      this.ok = PM.marca([1.05, 2.35, .6], true, .6); },
    update(lt, c) {
      const t = tw(lt), tg = c.w('pega:') - .15, ti = c.w('intestino') - .1, ts = c.w('sale') - .1, td = c.w('días.') - .25;
      A.parpadea(this.p, t + .7, .9); habla(this.p, t);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.1, eout(cl((t - .1) / .4))) + Math.sin(t * 4) * .04;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      this.p.boca(t > ts ? 'feliz' : 'abierta');
      // viaje por el intestino (a empujoncitos) y salida
      const k = cl((t - ti) / (ts + .25 - ti)), u = .3 + .7 * (k + Math.sin(k * Math.PI * 6) * .025);
      enRuta(this.rx, this.ch, Math.min(1, u), 0, t < ti ? Math.abs(Math.sin(t * 5)) * .05 : 0);
      this.ch.scale.setScalar(Math.max(.001, 1 - cl((t - ts - .25) / .25)));
      this.rx.flechas(t, cl((t - ti) / .3) * (1 - cl((t - ts - .1) / .3)));
      this.ok.scale.setScalar(pop(t, td, .35) * .6);
      if (t > tg) c.ev('pop', tg, .4); if (t > ti) c.ev('whoosh', ti, .5); if (t > ts) c.ev('pop', ts + .2, .4); if (t > td) c.ev('ding', td, .5);
      cam([.1, 1.2, 10.4], [.1, 1.15, 0], 34);
      if (t > tg && t < ti + .4) etiqueta('NO SE PEGA', [.1, -.2, .7], lt - tg, 52, '#ffffff', true);
      if (t > ti + .4 && t < td) etiqueta('¡LO EMPUJA!', [.1, -.2, .7], lt - ti - .4, 54, '#ffffff', true);
      if (t > td) etiqueta('SALE EN DÍAS', [.1, -.2, .7], lt - td, 52, '#ffd640', true);
      rotulo('No se pega: el intestino', 'lo empuja hasta afuera', lt - .05, RY);
    }
  });

  // ---------- 4 · ojo: muchos chicles seguidos sí pueden atorarse ----------
  escena('ojo', {
    setup() { patio();
      this.p = PM.chibi([-.92, 0, .3], { logo: true, boca: 'apretada', mira: 1, escala: .78 });
      this.rx = rayos(); this.chs = [0, 1, 2, 3, 4].map(i => PM.chicle([0, 0, 0], .085, this.rx.dentro, { cara: i % 2 === 0 }));
      this.no = PM.marca([1.05, 2.35, .6], false, .6); },
    update(lt, c) {
      const t = tw(lt), tm = c.w('muchos') - .3, ta = c.w('atorar.') - .15;
      A.parpadea(this.p, t + 2, 1.1); habla(this.p, t); A.preocupa(this.p, eout(cl((t - tm) / .4)));
      this.p.boca(t < ta ? 'apretada' : 'abierta');
      // dedito de "no, no"
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.3, eout(cl((t - .1) / .35))) + Math.sin(t * 10) * .12;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      // caen uno tras otro y se juntan en una curva del intestino
      const OFF = [[0, 0], [-.11, .05], [.11, .04], [-.05, -.08], [.07, -.07]];
      this.chs.forEach((ch, i) => { const t0 = tm + i * .2, k = eout(cl((t - t0) / .55)), u = .02 + (.66 - .02) * k;
        ch.visible = t > t0; const j = cl((u - .6) / .06); enRuta(this.rx, ch, u, OFF[i][0] * j, OFF[i][1] * j);
        const sq = t > ta ? Math.sin((t - ta) * 12 + i) * .06 : 0; ch.scale.set(1 + sq, 1 - sq, 1); });
      this.rx.flechas(t, cl((t - tm) / .3) * (1 - cl((t - ta) / .3)));
      this.no.scale.setScalar(pop(t, ta, .35) * .6);
      for (let i = 0; i < 5; i++) if (t > tm + i * .2) c.ev('pop', tm + i * .2, .25);
      if (t > ta) c.ev('ding', ta, .5);
      cam([.1, 1.2, 10.4], [.1, 1.15, 0], 34);
      if (t < ta) etiqueta('¡OJO!', [.1, -.2, .7], lt - .15, 58, '#ffd640', true);
      else etiqueta('¡SE ATORAN!', [.1, -.2, .7], lt - ta, 54, '#ffffff', true);
      rotulo('Pero no te tragues', 'muchos seguidos', lt - .05, RY);
    }
  });

  // ---------- 5 · remate: se lo manda al amigo que lo asustaba ----------
  escena('remate', {
    setup() { patio();
      this.p = PM.chibi([-.78, 0, .3], { logo: true, boca: 'feliz', mira: 1, escala: .85 });
      this.a = amigo([.82, 0, .2]);
      this.tel = PM.celular([0, -.62, .14], { h: .5, cara: 'feliz', pct: 90 }, this.p.brazos[1]);
      this.on = PM.ondas([-.2, 1.25, .6], 1, 0xffd640); },
    update(lt, c) {
      const t = tw(lt), tq = c.w('asustaba') - .2;
      A.parpadea(this.p, t, .3); A.parpadea(this.a, t, 1.9); habla(this.p, t);
      const b = this.p.brazos[1]; b.rotation.z = lerp(b.r0, 1.0, eout(cl((t - .05) / .35))) + Math.sin(t * 3) * .03; this.tel.rotation.z = -b.rotation.z;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3 + 1) * .03;
      this.on.update(t, t > .35 && t < tq + .6 ? 1 : 0);
      // el amigo recibe el video: sorpresa y luego se ríe
      this.a.boca(t < tq ? 'lengua' : t < tq + .7 ? 'abierta' : 'feliz'); A.preocupa(this.a, t > tq && t < tq + .7 ? 1 : 0);
      this.a.head.rotation.z = this.a.head.r0 + (t > tq + .7 ? Math.sin(t * 9) * .07 : Math.sin(t * 2.5) * .04);
      const ka = eout(cl((t - tq - .7) / .3));
      this.a.brazos[0].rotation.z = -lerp(-this.a.brazos[0].r0, 2.2, ka) + Math.sin(t * 6) * .05; this.a.brazos[1].rotation.z = lerp(this.a.brazos[1].r0, 2.2, ka) - Math.sin(t * 6) * .05;
      if (t > .35) c.ev('whoosh', .35, .4); if (t > tq) c.ev('pop', tq, .4); if (t > tq + .7) c.ev('ding', tq + .7, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      etiqueta('MÁNDASELO', [-.78, -.2, .7], lt - .1, 50, '#ffd640', true);
      if (t > tq + .7) etiqueta('¡JA, JA!', [.82, -.2, .7], lt - tq - .7, 50, '#ffffff', true);
      rotulo('Mándaselo a quien', 'te asustaba con el chicle', lt - .05, RY);
    }
  });
  P.cierre();
}
