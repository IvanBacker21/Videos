// Short 16-nov 13:30 · CARTULINA CHIBI: ¿Por qué si ves el celular en el carro SIEMPRE te mareas?
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-16-1330-mareo-carro.json OUT ../ejemplos/2026-11-16-1330-mareo-carro.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xa9dcf5;
  const amb = (c) => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const luz = () => luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, fase = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + fase) * .05; };
  const carretera = () => { amb(CIELO); PM.diorama(); luz(); return PM.camino({ y: -.22, z: -.9 }); };
  // chibi con celular en la mano derecha (la mano sube y el cel queda derecho)
  const conCel = (p, o = {}) => { const b = p.brazos[1]; b.a = o.a ?? 2.0; b.rotation.z = b.a;
    const ce = PM.celular([0, -.6, .1], { h: .5, pct: 80, cara: 'feliz' }, b); ce.rotation.z = -b.a; return ce; };
  const sostiene = (p, ce, t) => { const b = p.brazos[1]; b.rotation.z = b.a + Math.sin(t * 3) * .04; ce.rotation.z = -b.rotation.z; };
  const puntos = (a, b, n = 6, color = 0xffc83d) => { const ps = []; for (let i = 0; i < n; i++) { const k = (i + .5) / n; ps.push(PM.pz(F.circ(.045), color, [lerp(a[0], b[0], k), lerp(a[1], b[1], k), a[2]], null, { tinta: .01, papel: .03 })); }
    return { ps, update(t, on) { ps.forEach((q, i) => { const k = ((i / n) - t * 1.4) % 1; q.visible = on > 0 && i / n < on; q.scale.setScalar(1 + .45 * Math.max(0, Math.cos(((i / n + t * 1.2) % 1) * Math.PI * 2))); }); } }; };

  // ---------- 1 · gancho: viendo el celular en el carro… y se marea ----------
  escena('gancho', {
    setup() { this.cm = carretera();
      this.car = PM.carro([-.05, .0, .2], { color: 0xff6b5b, asientos: [-.45], escala: .95 });
      this.p = this.car.sube(PM.chibi([0, 0, 0], { logo: true, boca: 'feliz', mira: 1, escala: .72 }), -.45); this.ce = conCel(this.p);
      this.ma = PM.mareo([0, 2.45, .3], .9, this.p); this.ma.update(0, 0); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('carro') - .1, tm = c.w('mareas') - .15; this.cm.update(t, 1); this.car.update(t, 1);
      const km = cl((t - tm) / .4);
      this.car.rotation.z = Math.sin(t * 2.6) * .035 * (1 + km); this.car.position.x = -.05 + Math.sin(t * 1.3) * .03;
      A.parpadea(this.p, t, 1.1); sostiene(this.p, this.ce, t); A.parpadea(this.ce, t, .6);
      this.p.head.rotation.z = this.p.head.r0 - .1 + Math.sin(t * (3 + km * 3)) * (.04 + .08 * km);
      this.p.boca(t > tm ? 'apretada' : 'feliz'); A.preocupa(this.p, km);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 2.5) * .05;
      this.ma.update(t, eout(km));
      c.ev('whoosh', .05, .5); if (t > tm) c.ev('pop', tm, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tc && t < tm) etiqueta('EN EL CARRO', [.0, -.32, .7], lt - tc, 42, '#ffffff', true);
      if (t > tm) etiqueta('¡MAREO!', [.0, -.32, .7], lt - tm, 54, '#ffd640', true);
      rotulo('¿Ves el celular en el carro', 'y SIEMPRE te mareas?', lt + .4, RY);
    }
  });

  // ---------- 2 · en el oído hay un sensor que siente cada curva y cada frenón ----------
  escena('oido', {
    setup() { this.cm = carretera();
      this.car = PM.carro([-.4, -.15, .2], { color: 0xff6b5b, asientos: [-.35], escala: .78 });
      this.p = this.car.sube(PM.chibi([0, 0, 0], { logo: true, boca: 'abierta', mira: 1, escala: .72 }), -.35);
      this.lu = PM.lupa([.82, 2.0, .5], .66, { fondo: 0xfff1f4 }); this.oi = PM.oidoInterno([0, .05, 0], 1.0, this.lu.dentro);
      // la oreja del chibi (cabeza en x≈-.67, y≈.98) conectada con la lupa
      this.pt = puntos([-.36, 1.1, .6], [.2, 1.72, .6], 5, 0xffc83d); },
    update(lt, c) {
      const t = tw(lt), to = c.w('oído') - .2, ts = c.w('sensor') - .15, tcu = c.w('curva') - .15, tf = c.w('frenón') - .15; this.cm.update(t, 1); this.car.update(t, 1);
      // curva: el carro se ladea; frenón: se va para adelante
      const kc = t > tcu && t < tf ? Math.sin(cl((t - tcu) / .6) * Math.PI) : 0, kf = t > tf ? Math.sin(cl((t - tf) / .45) * Math.PI) : 0;
      this.car.rotation.z = kc * .09 + kf * -.06; this.car.position.x = -.4 + kf * .1;
      A.parpadea(this.p, t, 1.6); A.preocupa(this.p, Math.max(kc, kf) * .8); this.p.boca(kc + kf > .3 ? 'apretada' : 'abierta');
      this.p.head.rotation.z = this.p.head.r0 + kc * .28 - kf * .22 + Math.sin(t * 7) * .04 * (1 - Math.max(kc, kf));
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + Math.sin(t * 3) * .05 + kc * .3; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - Math.sin(t * 3) * .05 + kc * .3;
      this.lu.scale.setScalar(pop(t, to, .35)); this.lu.rotation.z = Math.sin(t * 1.6) * .03;
      this.oi.chapotea(t, Math.max(kc, kf) * .9 + .1, kf > kc ? -1 : 1);
      this.pt.update(t, cl((t - to) / .4));
      c.ev('pop', to, .4); if (t > tcu) c.ev('whoosh', tcu, .5); if (t > tf) c.ev('pop', tf, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > ts && t < tcu) etiqueta('SENSOR', [.82, 1.12, .7], lt - ts, 44, '#ffffff', true);
      if (t > tcu && t < tf) etiqueta('CURVA', [-.4, -.36, .7], lt - tcu, 50, '#ffd640', true);
      if (t > tf) etiqueta('¡FRENÓN!', [-.4, -.36, .7], lt - tf, 50, '#ffd640', true);
      rotulo(t < tcu ? 'Tu oído tiene' : 'Siente cada curva', t < tcu ? 'un sensor de movimiento' : 'y cada frenón', t < tcu ? lt - .1 : lt - tcu, RY);
    }
  });

  // ---------- 3 · los ojos en la pantalla le dicen al cerebro "estás quieto" ----------
  escena('ojos', {
    setup() { this.cm = carretera();
      this.car = PM.carro([-.4, -.15, .2], { color: 0xff6b5b, asientos: [-.4], escala: .78 });
      this.p = this.car.sube(PM.chibi([0, 0, 0], { logo: true, boca: 'feliz', mira: 1, escala: .72 }), -.4); this.ce = conCel(this.p);
      this.ce.scale.setScalar(1.15);
      this.ce2 = null;
      this.br = PM.cerebro([.85, 2.05, .5], .42, {}); this.br.cara('feliz');
      this.pt = puntos([-.2, 1.2, .6], [.5, 1.8, .6], 5, 0x8fd3ff); },
    update(lt, c) {
      const t = tw(lt), to = c.w('ojos') - .2, tp = c.w('pantalla') - .2, tc = c.w('cerebro') - .2, tq = c.w('quieto') - .15; this.cm.update(t, 1); this.car.update(t, 1);
      this.car.rotation.z = Math.sin(t * 2.6) * .04;
      A.parpadea(this.p, t, .4); sostiene(this.p, this.ce, t); A.parpadea(this.ce, t, 1.2);
      // ojos más grandes, clavados en la pantalla
      const ko = eout(cl((t - to) / .3)); this.p.head.ojos.forEach(e => { if (e.scale.y > .5) e.scale.set(1 + ko * .25, 1 + ko * .25, 1); else e.scale.x = 1 + ko * .25; });
      this.p.head.rotation.z = this.p.head.r0 - .14 + Math.sin(t * 2) * .03; this.p.boca('feliz');
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 2.5) * .05;
      this.br.scale.setScalar(pop(t, tc, .35)); this.br.rotation.z = Math.sin(t * 2) * .05; A.parpadea(this.br, t, 1.9);
      this.pt.update(t, cl((t - tc) / .4));
      c.ev('pop', to, .4); if (t > tc) c.ev('pop', tc, .4); if (t > tq) c.ev('ding', tq, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tp && t < tq) etiqueta('PANTALLA', [-.4, -.36, .7], lt - tp, 44, '#ffffff', true);
      if (t > tq) etiqueta('¡ESTÁS QUIETO!', [.6, 1.25, .7], lt - tq, 44, '#ffd640', true);
      if (t > tq) etiqueta('PANTALLA', [-.4, -.36, .7], 5, 44, '#ffffff', true);
      rotulo(t < tc ? 'Tus ojos ven' : 'y le dicen al cerebro', t < tc ? 'la pantalla quieta' : 'que estás quieto', t < tc ? lt - .1 : lt - tc, RY);
    }
  });

  // ---------- 4 · dos mensajes que no cuadran: el cerebro se confunde y te revuelve la panza ----------
  escena('cerebro', {
    setup() { amb(0xffe3ea); luz();
      { const bg = PM.pz(F.rect(30, 30, 0), 0xffd3df, [0, 8, -3], null, { tinta: false, papel: false }); bg.traverse(m => m.receiveShadow = false); }
      for (const [x, y, r] of [[-1.4, 2.6, .18], [1.5, .2, .24], [-1.5, -.1, .14], [1.3, 2.9, .12], [.2, -.5, .1]]) PM.pz(F.circ(r), 0xffeef3, [x, y, -2.8], null, { tinta: .012, papel: .05 });
      this.br = PM.cerebro([0, 1.7, .3], .62, {}); this.br.cara('feliz');
      this.l1 = PM.letrero([-.82, .6, .5], '¡TE MUEVES!', { w: 1.35, h: .4, borde: 0xff6b5b }); this.l2 = PM.letrero([.82, .6, .5], '¡QUIETO!', { w: 1.35, h: .4, borde: 0x3d6bff });
      this.ma = PM.mareo([0, .95, .2], 1.1, this.br); this.ma.update(0, 0);
      this.pa = PM.astro([0, .45, .5], .62, 0xffb07a, { expr: 'duda', forma: P.blob([[-.6, .25], [-.35, .55], [.05, .5], [.25, .2], [.55, .05], [.62, -.3], [.3, -.55], [-.2, -.5], [-.55, -.25]]) });
      const pts = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 4, r = .03 + i / 40 * .22; pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
      this.rem = group([.05, -.08, .06], this.pa); PM.det(P.tubo(pts, .05, .05), 0xe0703a, [0, 0, 0], this.rem); },
    update(lt, c) {
      const t = tw(lt), tm = c.w('mensajes') - .25, tn = c.w('cuadran') - .2, tc = c.w('confunde') - .2, tr = c.w('revuelve') - .2;
      const kl = t > tm ? 1 : 0, kp = eout(cl((t - tr) / .45));
      this.l1.scale.setScalar(pop(t, .15, .35) * (1 - kp) + .001); this.l2.scale.setScalar(pop(t, tm, .35) * (1 - kp) + .001);
      this.l1.columpia(t + .5, t > tn ? .14 : .05); this.l2.columpia(t, t > tn ? .14 : .05);
      // el cerebro voltea a uno y a otro, luego se marea
      const kc = cl((t - tc) / .4);
      this.br.position.y = lerp(1.7, 2.05, kp); this.br.scale.setScalar(lerp(1, .72, kp));
      this.br.rotation.z = t < tc ? (t > tm ? Math.sin(t * 6) * .12 : Math.sin(t * 2) * .04) : Math.sin(t * 9) * .12;
      this.br.cara(t > tn ? 'duda' : 'feliz'); A.parpadea(this.br, t, .7); this.ma.update(t, eout(kc));
      this.pa.scale.setScalar(pop(t, tr, .4)); this.rem.rotation.z = -t * 6; this.pa.rotation.z = Math.sin(t * 7) * .08 * kp; A.parpadea(this.pa, t, 1.4);
      c.ev('pop', .15, .4); if (t > tm) c.ev('pop', tm, .4); if (t > tc) c.ev('whoosh', tc, .5); if (t > tr) c.ev('pop', tr, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > .3 && t < tm) etiqueta('OÍDO', [-.82, 1.05, .7], lt - .3, 36, '#ffffff', true);
      if (t > tm && t < tr) { etiqueta('OÍDO', [-.82, 1.05, .7], 5, 36, '#ffffff', true); etiqueta('OJOS', [.82, 1.05, .7], lt - tm, 36, '#ffffff', true); }
      if (t > tc && t < tr) etiqueta('¿¿EH??', [0, -.1, .7], lt - tc, 50, '#ffd640', true);
      if (t > tr) etiqueta('¡PANZA REVUELTA!', [0, -.38, .7], lt - tr, 44, '#ffd640', true);
      rotulo(t < tc ? 'Dos mensajes' : t < tr ? 'Tu cerebro' : 'y te revuelve', t < tc ? 'que no cuadran' : t < tr ? 'se confunde' : 'la panza', t < tc ? lt - .1 : t < tr ? lt - tc : lt - tr, RY);
    }
  });

  // ---------- 5 · truco: siéntate adelante y mira lejos · mándaselo ----------
  escena('remate', {
    setup() { this.cm = carretera();
      this.car = PM.carro([-.05, .0, .2], { color: 0xff6b5b, asientos: [-.62, .42], escala: .95 });
      this.p = this.car.sube(PM.chibi([0, 0, 0], { logo: true, boca: 'apretada', mira: 1, escala: .72 }), -.62); this.ce = conCel(this.p);
      this.ma = PM.mareo([0, 2.45, .3], .85, this.p); this.ma.update(0, 1);
      this.a = this.car.sube(PM.chibi([0, 0, 0], { ropa: 0x2ec4a6, pelo: 'cola', colPelo: 0x1f1410, boca: 'apretada', mira: 1, escala: .7 }), -.62); this.a.visible = false;
      this.ca = conCel(this.a); this.ma2 = PM.mareo([0, 2.45, .3], .85, this.a); this.ma2.update(0, 0);
      this.fl = PM.pz(F.poly([[-.35, .06], [.15, .06], [.15, .16], [.4, 0], [.15, -.16], [.15, -.06], [-.35, -.06]]), 0xffc83d, [1.25, 2.35, .6], null, { tinta: .014, papel: .05 }); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('siéntate') - .1, tad = c.w('adelante') - .1, tl = c.w('lejos') - .2, tm = c.w('Mándaselo') - .2, tma = c.w('marea') - .2;
      this.cm.update(t, 1); this.car.update(t, 1); this.car.rotation.z = Math.sin(t * 2.6) * .03;
      // brinca del asiento de atrás al de adelante
      const kj = ease(cl((t - ts) / (tad - ts + .3)));
      this.p.position.x = lerp(-.62, .42, kj); this.p.position.y = .32 + Math.sin(kj * Math.PI) * .06;
      const kl = eout(cl((t - tl) / .35));
      A.parpadea(this.p, t, .5); A.preocupa(this.p, 1 - kj);
      this.p.boca(t > tl ? 'feliz' : t > tad ? 'abierta' : 'apretada');
      this.ma.update(t, 1 - eout(cl((t - tad) / .4)));
      // guarda el cel y mira al frente
      const b = this.p.brazos[1]; b.rotation.z = lerp(2.0, b.r0, kl) + Math.sin(t * 3) * .04; this.ce.rotation.z = -b.rotation.z; this.ce.scale.setScalar(Math.max(.001, 1 - kl));
      this.p.head.rotation.z = this.p.head.r0 + lerp(-.12, .06, kj) + Math.sin(t * 3) * .03;
      if (t > tm) { const kb = eout(cl((t - tm) / .35)); this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -1.6, kb) + Math.sin(t * 5) * .06 * kb; } else this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 2.5) * .05;
      this.fl.scale.setScalar(t > tl && t < tm ? pop(t, tl, .35) : .001); this.fl.position.x = 1.2 + Math.sin(t * 6) * .05;
      // amiga mareada en el asiento de atrás
      const va = t > tm - .2; this.a.visible = va; if (va) { this.a.scale.set(.7 * pop(t, tm - .2, .35), .7 * pop(t, tm - .2, .35), .14);
        A.parpadea(this.a, t, 1.3); A.preocupa(this.a, 1); sostiene(this.a, this.ca, t); this.a.head.rotation.z = this.a.head.r0 - .1 + Math.sin(t * 6) * .1;
        this.a.brazos[0].rotation.z = this.a.brazos[0].r0 + Math.sin(t * 2.5) * .05; this.ma2.update(t, eout(cl((t - tma) / .4))); }
      if (t > ts) c.ev('whoosh', ts, .5); if (t > tl) c.ev('ding', tl, .4); if (t > tm) c.ev('pop', tm, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t < tl) etiqueta('TRUCO', [-.05, -.34, .7], lt - .1, 52, '#ffd640', true);
      else if (t < tm) etiqueta('MIRA LEJOS', [-.05, -.34, .7], lt - tl, 48, '#ffd640', true);
      else etiqueta('MÁNDASELO', [-.05, -.34, .7], lt - tm, 48, '#ffd640', true);
      if (t < tm) rotulo(t < tl ? 'Siéntate adelante' : 'y mira lejos,', t < tl ? '' : 'al camino', t < tl ? lt - .1 : lt - tl, RY);
      else rotulo('Mándaselo al que', 'siempre se marea', lt - tm, RY);
    }
  });
  P.cierre();
}
