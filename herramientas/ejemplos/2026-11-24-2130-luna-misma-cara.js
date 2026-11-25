// Short 24-nov 21:30 (PRUEBA LARGO 40 s) · CARTULINA CHIBI: ¿por qué la Luna SIEMPRE nos enseña la misma cara? (hoy, superluna del castor)
// Acoplamiento de marea: la Luna gira una vez sobre su eje por cada órbita (~27 días); la gravedad terrestre la deformó y frenó hasta sincronizarla.
// Mito "lado oscuro": la cara lejana recibe la misma luz solar (en luna nueva está totalmente iluminada). Libración: vemos ~59 % de la superficie.
// Se aleja ~3.8 cm/año (medido rebotando láser en los retrorreflectores que dejaron las misiones Apolo), parecido a lo que crecen las uñas.
// Fuentes: NASA Science (Tidal locking), timeanddate (Far side of the Moon), Live Science (far side), NASA (Apollo laser ranging), N+ / Star Walk (superluna).
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-24-2130-luna-misma-cara.json OUT ../ejemplos/2026-11-24-2130-luna-misma-cara.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw, tubo } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, NOCHE = 0x27306e, ESP = 0x232a63, AMARILLO = 0xffc83d, ROJO = 0xff5b5b, SOL = 0xffd23d, OSCURO = 0x3a3f6a;
  const noche = () => { ambiente({ top: NOCHE, bottom: NOCHE, fog: NOCHE, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); const n = PM.nocheCalle(); luces({ pos: [-3, 5, 8], hemi: 1.6, sol: 1.4, radio: 6 }); return n; };
  const espacio = () => { ambiente({ top: ESP, bottom: ESP, fog: ESP, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); const n = PM.espacio(); luces({ pos: [-3, 5, 8], hemi: 1.7, sol: 1.4, radio: 6 }); return n; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const sale = (t, t0, d = .3) => t < t0 ? 1 : Math.max(.001, 1 - ease(cl((t - t0) / d)));
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const ZL = -2.8;
  const sol = (pos, r) => PM.astro(pos, r, SOL, { rayos: true });
  // semicírculo (lado izquierdo por defecto) para la mitad en sombra
  const semi = (r, a0 = Math.PI / 2, a1 = Math.PI * 1.5) => { const p = []; for (let i = 0; i <= 24; i++) { const a = lerp(a0, a1, i / 24); p.push([Math.cos(a) * r, Math.sin(a) * r]); } return F.poly(p); };
  // rayitos de sol (tubos amarillos) de a → b
  const rayos = (a, b, n = 3, sep = .16) => { const g = group([0, 0, 0]); const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * sep; PM.det(tubo([[a[0] + nx * o, a[1] + ny * o], [b[0] + nx * o, b[1] + ny * o]], .022, .022), 0xfff2a8, [0, 0, -.06], g); } return g; };

  // ---------- 1 · gancho: superluna enorme sobre las casas, siempre con la misma carita ----------
  escena('gancho', {
    setup() { this.n = noche();
      this.l = PM.luna([.35, 1.6, ZL], 1.15, { cara: true });
      this.p = PM.chibi([-.9, 0, .3], { logo: true, boca: 'abierta', mira: 1, escala: .8 }); },
    update(lt, c) {
      const t = tw(lt), tsi = c.w('SIEMPRE') - .1, tmi = c.w('misma') - .1;
      this.n.update(t); A.parpadea(this.p, t + 1.1, .4); A.parpadea(this.l, t + .3, 1.3);
      this.l.position.y = lerp(1.3, 1.75, eout(cl(t / 1.4))) + Math.sin(t * 1.5) * .02; this.l.scale.setScalar(lerp(.92, 1, eout(cl(t / 1.4))) * (1 + (t > tmi ? .04 * Math.sin(cl((t - tmi) / .4) * Math.PI) : 0)));
      this.l.cara(t > tsi && t < tmi ? 'abierta' : 'feliz');
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.1, eout(cl((t - .15) / .4))) + Math.sin(t * 5) * .05;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      this.p.head.rotation.z = this.p.head.r0 - .12 + Math.sin(t * 4) * .03; this.p.boca(t < tmi + .4 ? 'abierta' : 'feliz');
      this.p.position.y = t > tsi && t < tsi + .45 ? Math.sin((t - tsi) / .45 * Math.PI) * .1 : 0;
      c.ev('whoosh', 0, .5); if (t > tsi) c.ev('pop', tsi, .4); if (t > tmi) c.ev('ding', tmi, .5);
      cam([0, 1.2, lerp(10.9, 10.3, ease(lt / 3.2))], [0, 1.15, 0], 34);
      if (t > .3 && t < tmi) etiqueta('¡SUPERLUNA!', [0, -.25, .9], lt - .3, 56, '#ffffff', true);
      if (t > tmi) etiqueta('¡SIEMPRE LA MISMA CARA!', [0, -.25, .9], lt - tmi, 42, '#ffd640', true);
      rotulo('¿Por qué la Luna SIEMPRE', 'nos da la misma cara?', lt - .05, RY);
    }
  });

  // ---------- 2 · giro: vista desde arriba, la Luna da UNA vuelta sobre sí misma por cada vuelta a la Tierra ----------
  escena('giro', {
    setup() { this.n = espacio();
      this.o = PM.orbitaLunaGiro([0, 1.3, 0], { R: .98, rT: .42, rL: .24 }); },
    update(lt, c) {
      const t = tw(lt), tun = c.w('vuelta') - .1, tca = c.w('cada') - .1;
      this.n.update(t);
      const ang = -Math.PI / 2 + Math.PI * 2 * cl((t - .25) / 4.1);
      this.o.update(ang); this.o.tierra.mapa.rotation.z = t * .4;
      A.parpadea(this.o.luna, t + .4, .6); A.parpadea(this.o.tierra, t + 1.4, 1.7);
      this.o.tierra.cara(t > tca ? 'abierta' : 'feliz'); this.o.marca.scale.setScalar(1 + (t > tun ? .25 * Math.abs(Math.sin(t * 5)) : 0));
      c.ev('whoosh', .05, .5); if (t > tun) c.ev('pop', tun, .4); if (t > tca) c.ev('ding', tca, .5);
      cam([0, 1.2, 10.6], [0, 1.15, 0], 34);
      if (t < tca) etiqueta('¿NO GIRA?', [0, -.3, .9], lt - .05, 56, '#ffffff', true);
      else etiqueta('1 GIRO = 1 VUELTA', [0, -.3, .9], lt - tca, 50, '#ffd640', true);
      rotulo('Gira una vez por cada', 'vuelta a la Tierra', lt - .05, RY);
    }
  });

  // ---------- 3 · trabada: Luna joven girando rápido; la Tierra la jala con una liga y la frena hasta dejarla mirándonos ----------
  escena('trabada', {
    setup() { this.n = espacio();
      this.T = PM.tierra([-.8, 1.4, 0], .5, { cara: true });
      this.w = group([.78, 1.4, .05]); this.L = PM.luna([0, 0, 0], .38, { halo: false, cara: true, expr: 'abierta' }); this.w.add(this.L);
      this.li = group([-.8, 1.4, -.02]); this.li.k = group([0, 0, 0], this.li); PM.pz(F.rect(1, .07, .035), 0xff7ab8, [.5, 0, 0], this.li.k, { tinta: .012, papel: .03 }); },
    update(lt, c) {
      const t = tw(lt), tgr = c.w('gravedad') - .1, tfr = c.w('frenando') - .2, ttr = c.w('trabada') - .1, tmi = c.w('mirándonos') - .1;
      this.n.update(t); this.T.mapa.rotation.z = t * .3;
      // giro rápido que se frena con desaceleración constante entre tfr y ttr, termina derechita (rot = 0)
      const W = 9, k = cl((t - tfr) / (ttr - tfr)), ang = W * Math.min(t, tfr) + W * (ttr - tfr) * (k - k * k / 2), fin = W * tfr + W * (ttr - tfr) / 2;
      this.L.rotation.z = ang - fin;
      const kl = pop(t, tgr, .4), est = (1 - ease(k)) * (t > tgr ? 1 : 0);
      this.w.scale.set(1 + .14 * est + .03 * est * Math.sin(t * 18), 1 - .06 * est, 1);
      this.li.position.x = -.33; this.li.k.scale.set(Math.max(.001, (.78 - .38 * (1 + .14 * est) + .36) * kl), 1 + .35 * est * Math.sin(t * 22), 1);
      A.parpadea(this.T, t + .5, .9); A.parpadea(this.L, t + 1.9, 1.6);
      this.T.cara(t > tgr && t < ttr ? 'abierta' : 'feliz'); this.L.cara(t < ttr ? 'abierta' : 'feliz');
      this.L.head.position.x = -.07 * eout(cl((t - tmi) / .3));
      c.ev('whoosh', .05, .6); if (t > tgr) c.ev('pop', tgr, .4); if (t > tfr) c.ev('whoosh', tfr, .6); if (t > ttr) c.ev('impact', ttr, .4); if (t > tmi) c.ev('ding', tmi, .5);
      cam([0, 1.2, 10.6], [0, 1.15, 0], 34);
      if (t > tgr && t < ttr) etiqueta('GRAVEDAD', [0, 2.2, .9], lt - tgr, 54, '#ffffff', true);
      if (t > ttr && t < tmi) etiqueta('¡TRABADA!', [0, 2.2, .9], lt - ttr, 58, '#ffd640', true);
      if (t > tmi) etiqueta('¡MIRÁNDONOS!', [0, 2.2, .9], lt - tmi, 54, '#ffd640', true);
      rotulo('La gravedad la frenó', 'hasta dejarla trabada', lt - .05, RY);
    }
  });

  // ---------- 4 · lado oscuro: ¡no existe! la cara de atrás también recibe Sol ----------
  escena('lado-oscuro', {
    setup() { this.n = espacio();
      this.le = PM.letrero([.15, 2.15, .4], 'LADO OSCURO', { w: 1.45, h: .4, borde: 0x14183a, color: 0x2b3060, tinta: '#ffffff' });
      this.m = PM.marca([.85, 2.3, .6], false, .001);
      this.so = sol([1.05, 2.05, -.3], .26); this.so.scale.setScalar(.001);
      this.ra = rayos([.85, 1.85], [.5, 1.35], 3, .14); this.ra.visible = false;
      this.fr = PM.luna([.15, 1.0, 0], .6, { halo: false, cara: true });
      this.at = PM.astro([.15, 1.0, 0], .6, 0xf2e6b8, { crateres: [[-.3, .35, .12], [.35, .1, .14], [-.1, -.4, .18], [.4, -.45, .08], [-.5, -.1, .07]], papel: .05 }); this.at.visible = false;
      this.p = PM.chibi([-1.08, .02, .35], { logo: true, boca: 'feliz', mira: 1, escala: .62 }); },
    update(lt, c) {
      const t = tw(lt), tex = c.w('existe') - .15, tca = c.w('cara') - .1, tat = c.w('atrás') - .15, tso = c.w('Sol') - .1, tes = c.w('esta') - .2;
      this.n.update(t);
      const kl = sale(t, tca - .1, .3); this.le.scale.setScalar(kl); this.le.columpia(t, .05); this.m.scale.setScalar(pop(t, tex, .35) * kl);
      this.so.scale.setScalar(pop(t, tso, .4)); if (this.so.rayos) this.so.rayos.rotation.z = t * .5; A.parpadea(this.so, t + .8, .4);
      this.ra.visible = t > tso + .15; this.ra.children.forEach((r, i) => r.visible = Math.sin(t * 8 + i * 2) > -.6);
      // la Luna se voltea (como cartulina) para enseñar la cara de atrás, y regresa al decir "esta"
      const giro = t < tes ? cl((t - tat) / .45) : 1 - cl((t - tes) / .45), s = Math.cos(Math.PI * giro);
      this.fr.visible = s >= 0; this.at.visible = s < 0;
      this.fr.scale.set(Math.max(.001, Math.abs(s)), 1, 1); this.at.scale.set(Math.max(.001, Math.abs(s)), 1, 1);
      this.fr.position.y = this.at.position.y = 1.0 + Math.sin(t * 1.8) * .03;
      A.parpadea(this.fr, t + 1.6, .3); A.parpadea(this.at, t + .4, .3); this.at.cara(t > tso ? 'feliz' : 'abierta');
      A.parpadea(this.p, t + 2.2, .5); respira(this.p, t);
      const kn = t > tex - .2 && t < tca + .2 ? 1 : 0;
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.3, eout(cl((t - tex + .2) / .25))) * kn + this.p.brazos[1].r0 * (1 - kn) + kn * Math.sin(t * 14) * .18;
      this.p.boca(t > tex - .2 && t < tex + .6 ? 'abierta' : 'feliz'); this.p.head.rotation.z = this.p.head.r0 + (kn ? Math.sin(t * 9) * .08 : 0);
      c.ev('whoosh', .05, .4); if (t > tex) c.ev('impact', tex, .4); if (t > tat) c.ev('whoosh', tat, .5); if (t > tso) c.ev('ding', tso, .5); if (t > tes) c.ev('whoosh', tes, .4);
      cam([0, 1.2, 10.6], [0, 1.15, 0], 34);
      if (t > tat && t < tso) etiqueta('LA CARA DE ATRÁS', [.15, -.3, .9], lt - tat, 46, '#ffffff', true);
      if (t > tso) etiqueta('¡TAMBIÉN LE DA EL SOL!', [.15, -.3, .9], lt - tso, 42, '#ffd640', true);
      rotulo(t < tat ? 'El lado oscuro' : 'La cara de atrás', t < tat ? 'NO existe' : 'recibe el mismo Sol', lt - (t < tat ? .05 : tat), RY);
    }
  });

  // ---------- 5 · luna nueva: desde la Tierra se ve negra, pero allá atrás es pleno día ----------
  escena('luna-nueva', {
    setup() { this.n = espacio();
      this.T = PM.tierra([-1.0, 1.3, 0], .32, { cara: true });
      this.L = PM.luna([-.02, 1.3, 0], .38, { halo: false });
      this.sm = PM.det(semi(.385), OSCURO, [0, 0, .05], this.L);
      this.so = sol([1.0, 1.3, -.1], .26);
      this.ra = rayos([.78, 1.3], [.38, 1.3], 3, .16); },
    update(lt, c) {
      const t = tw(lt), tnu = c.w('nueva') - .2, tal = c.w('allá') - .1, tdi = c.w('día') - .2;
      this.n.update(t); this.T.mapa.rotation.z = t * .3; this.so.rayos.rotation.z = t * .5;
      this.L.position.y = 1.3 + Math.sin(t * 1.8) * .03; this.ra.children.forEach((r, i) => r.visible = Math.sin(t * 8 + i * 2) > -.6);
      A.parpadea(this.T, t + .3, .8); A.parpadea(this.so, t + 1.4, .4);
      this.T.cara(t > tdi ? 'abierta' : t > tnu ? 'duda' : 'feliz'); this.so.cara(t > tal ? 'abierta' : 'feliz');
      this.sm.scale.setScalar(1 + (t > tnu && t < tal ? .04 * Math.sin(t * 10) : 0));
      c.ev('whoosh', .05, .4); if (t > tnu) c.ev('pop', tnu, .4); if (t > tdi) c.ev('ding', tdi, .5);
      cam([0, 1.2, 10.6], [0, 1.15, 0], 34);
      if (t > tnu) etiqueta('LUNA NUEVA', [-.75, .55, .9], lt - tnu, 40, '#ffffff', true);
      if (t > tdi) etiqueta('¡PLENO DÍA!', [.45, 2.1, .9], lt - tdi, 50, '#ffd640', true);
      rotulo('Luna nueva aquí =', 'pleno día allá atrás', lt - .05, RY);
    }
  });

  // ---------- 6 · bamboleo: la Luna se bambolea ("más o menos") y vemos un poquito más de la mitad ----------
  escena('bamboleo', {
    setup() { this.n = noche();
      this.l = PM.luna([.35, 1.75, ZL], 1.0, { cara: true });
      this.p = PM.chibi([-.95, 0, .3], { logo: true, boca: 'feliz', mira: 1, escala: .74 });
      this.me = group([.95, .42, .6]); PM.pz(F.circ(.3), 0x4d4680, [0, 0, 0], this.me, { tinta: .016, papel: .05 });
      this.me.mi = PM.det(semi(.27, Math.PI / 2, Math.PI * 1.5), AMARILLO, [0, 0, .02], this.me);
      this.me.ex = PM.det(semi(.27, Math.PI * 1.5, Math.PI * 1.5 + Math.PI * 2 * .09), 0xffe27a, [0, 0, .024], this.me); },
    update(lt, c) {
      const t = tw(lt), tba = c.w('bambolea') - .1, tve = c.w('vemos') - .2, tma = c.w('más', 1) - .1;
      this.n.update(t);
      const kb = t > tba ? 1 : 0;
      this.l.rotation.z = kb * Math.sin((t - tba) * 4.2) * .22; this.l.position.x = .35 + kb * Math.sin((t - tba) * 4.2) * .08; this.l.position.y = 1.75 + Math.sin(t * 1.5) * .02;
      A.parpadea(this.l, t + .5, 1.0); this.l.cara(t > tma ? 'abierta' : 'feliz');
      A.parpadea(this.p, t + 2.1, .2); respira(this.p, t);
      this.p.head.rotation.z = this.p.head.r0 + kb * Math.sin((t - tba) * 4.2) * .18;
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.4, eout(cl((t - tba) / .3))) + kb * Math.sin((t - tba) * 8) * .2;
      this.p.boca(t > tba && t < tve ? 'abierta' : 'feliz');
      this.me.scale.setScalar(pop(t, tve, .4)); this.me.ex.visible = t > tma; this.me.ex.scale.setScalar(1 + (t > tma ? .08 * Math.sin(cl((t - tma) / .4) * Math.PI) : 0));
      c.ev('whoosh', .05, .4); if (t > tba) c.ev('whoosh', tba, .5); if (t > tve) c.ev('pop', tve, .4); if (t > tma) c.ev('ding', tma, .5);
      cam([0, 1.2, 10.5], [0, 1.15, 0], 34);
      if (t > tba && t < tma) etiqueta('SE BAMBOLEA', [-.1, -.3, .9], lt - tba, 50, '#ffffff', true);
      if (t > tma) etiqueta('¡MÁS DE LA MITAD!', [-.1, -.3, .9], lt - tma, 48, '#ffd640', true);
      rotulo('Se bambolea tantito', 'y vemos más de la mitad', lt - .05, RY);
    }
  });

  // ---------- 7 · se aleja: la regla entre Tierra y Luna crece; igual que tus uñas ----------
  escena('se-aleja', {
    setup() { this.n = espacio();
      this.T = PM.tierra([-.95, 1.95, 0], .32, { cara: true });
      this.L = PM.luna([.5, 1.95, 0], .22, { halo: false, cara: true });
      this.rg = PM.regla([0, 1.95, .1], 1);
      this.p = PM.chibi([-.85, .02, .35], { logo: true, boca: 'feliz', mira: 1, escala: .58 });
      // dedo de cartulina con uña que crece (punta blanca) y reglita
      this.de = group([.5, .62, .5]); PM.pz(F.rect(.5, 1.0, .24), 0xe8b48c, [0, 0, 0], this.de, { tinta: .016, papel: .05 }); PM.det(F.arco(.12, .02, Math.PI * 1.1, Math.PI * 1.9), 0xc98f6a, [0, -.05, .02], this.de); PM.det(F.arco(.12, .02, Math.PI * 1.1, Math.PI * 1.9), 0xc98f6a, [0, -.25, .02], this.de);
      PM.det(F.rect(.34, .3, .12), 0xffd0d6, [0, .3, .02], this.de);
      this.de.pu = group([0, .44, .01], this.de); PM.pz(F.rect(.34, .14, .06), 0xfffaf0, [0, .07, 0], this.de.pu, { tinta: .01, papel: .02 });
      this.de.rg = PM.regla([.36, .5, .05], .24, this.de); this.de.rg.rotation.z = Math.PI / 2; this.de.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), tal = c.w('aleja') - .1, tcu = c.w('cuatro') - .1, tcr = c.w('crecen') - .15, tun = c.w('uñas') - .1;
      this.n.update(t); this.T.mapa.rotation.z = t * .3;
      const x = lerp(.45, 1.0, ease(cl((t - tal) / 2.4))); this.L.position.x = x; this.L.position.y = 1.95 + Math.sin(t * 2) * .02;
      const a = -.95 + .32 + .04, b = x - .22 - .04; this.rg.position.x = (a + b) / 2; this.rg.scale.x = Math.max(.001, (b - a) / 1.08);
      A.parpadea(this.T, t + .7, .5); A.parpadea(this.L, t + 1.9, 1.1); this.L.cara(t > tal && t < tcu + .6 ? 'abierta' : 'feliz'); this.T.cara(t > tal ? 'duda' : 'feliz');
      A.parpadea(this.p, t + 1.2, .9); respira(this.p, t); this.p.head.rotation.z = this.p.head.r0 - .05 + Math.sin(t * 1.6) * .04;
      this.de.scale.setScalar(pop(t, tcr, .4)); this.de.rotation.z = Math.sin(t * 2) * .03;
      this.de.pu.scale.y = lerp(.25, 1.3, ease(cl((t - tun) / 1.0)));
      this.p.boca(t > tun ? 'abierta' : 'feliz'); this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.6, eout(cl((t - tcr) / .3)));
      c.ev('whoosh', .05, .4); if (t > tal) c.ev('whoosh', tal, .6); if (t > tcu) c.ev('pop', tcu, .4); if (t > tcr) c.ev('pop', tcr, .4); if (t > tun) c.ev('ding', tun, .5);
      cam([0, 1.2, 10.6], [0, 1.15, 0], 34);
      if (t > tcu) etiqueta('+4 CM CADA AÑO', [-.1, 2.5, .9], lt - tcu, 48, '#ffd640', true);
      if (t > tun) etiqueta('¡COMO TUS UÑAS!', [0, -.3, .9], lt - tun, 48, '#ffd640', true);
      rotulo('Se aleja 4 cm al año', 'lo que crecen tus uñas', lt - .05, RY);
    }
  });

  // ---------- 8 · láser: le rebotamos un láser a espejos que dejaron los astronautas ----------
  escena('laser', {
    setup() { this.n = espacio();
      this.T = PM.tierra([-.85, .62, 0], .5, { cara: true });
      this.L = PM.luna([.55, 1.62, 0], .5, { halo: false, cara: true });
      const d = [-.85 - .55, .62 - 1.62], n = Math.hypot(...d); this.u = [d[0] / n, d[1] / n];
      this.es = group([.55 + this.u[0] * .44, 1.62 + this.u[1] * .44, .1]); this.es.rotation.z = Math.atan2(this.u[1], this.u[0]) + Math.PI / 2;
      PM.pz(F.rect(.2, .11, .02), 0xc9cfd8, [0, 0, 0], this.es, { tinta: .012, papel: .03 }); PM.det(F.rect(.14, .05, .01), 0x8fd3ff, [0, .01, .016], this.es);
      this.a0 = [-.85 - this.u[0] * .5, .62 - this.u[1] * .5]; this.a1 = [this.es.position.x, this.es.position.y];
      this.ls = group([this.a0[0], this.a0[1], .05]); this.ls.rotation.z = Math.atan2(this.a1[1] - this.a0[1], this.a1[0] - this.a0[0]);
      this.ls.k = group([0, 0, 0], this.ls); PM.det(F.rect(1, .035, .017), ROJO, [.5, 0, 0], this.ls.k);
      this.pu = PM.pz(F.circ(.05), 0xff8a8a, [0, 0, .08], null, { tinta: .01, papel: .02 });
      this.as = PM.chibi([.42, 2.08, .2], { ropa: 0xffffff, pantalon: 0xe9eef5, tenis: 0x9aa3b5, colPelo: 0x3a2416, boca: 'feliz', mira: 1, escala: .26 });
      PM.det(F.arco(.36, .05, 0, Math.PI * 2), 0xffffff, [0, .02, .08], this.as.head);
      this.ba = group([.78, 2.1, .1]); PM.det(F.rect(.02, .32, .01), 0xdfe6f2, [0, .16, 0], this.ba); PM.pz(F.rect(.18, .11, .01), ROJO, [.1, .27, .01], this.ba, { tinta: .008, papel: .02 }); },
    update(lt, c) {
      const t = tw(lt), tre = c.w('rebotamos') - .1, tla = c.w('láser') - .1, tes = c.w('espejos') - .1, tas = c.w('astronautas') - .1;
      this.n.update(t); this.T.mapa.rotation.z = t * .3; this.L.position.y = 1.62;
      const L = Math.hypot(this.a1[0] - this.a0[0], this.a1[1] - this.a0[1]), kl = ease(cl((t - tre) / .4));
      this.ls.k.scale.x = Math.max(.001, L * kl); this.ls.visible = t > tre;
      const q = ((t - tre - .4) * 1.4) % 2, f = q < 1 ? q : 2 - q; this.pu.visible = t > tre + .4;
      this.pu.position.set(lerp(this.a0[0], this.a1[0], f), lerp(this.a0[1], this.a1[1], f), .1);
      this.es.scale.setScalar(t > tes ? 1 + .45 * Math.sin(cl((t - tes) / .5) * Math.PI) + .05 * Math.sin(t * 8) : 1);
      A.parpadea(this.T, t + .4, .6); A.parpadea(this.L, t + 1.7, 1.4); this.T.cara(t > tla ? 'abierta' : 'feliz'); this.L.cara(t > tre + .4 ? 'abierta' : 'feliz');
      const ka = pop(t, tas, .35); this.as.scale.set(.26 * ka, .26 * ka, .052 * ka); this.ba.scale.setScalar(pop(t, tas + .1, .35));
      A.parpadea(this.as, t + .9, .3); this.as.brazos[1].rotation.z = lerp(this.as.brazos[1].r0, 2.5, eout(cl((t - tas - .2) / .3))) + Math.sin(t * 9) * .2;
      c.ev('whoosh', .05, .4); if (t > tre) c.ev('whoosh', tre, .5); if (t > tla) c.ev('pop', tla, .3); if (t > tes) c.ev('ding', tes, .5); if (t > tas) c.ev('pop', tas, .4);
      cam([0, 1.2, 10.6], [0, 1.15, 0], 34);
      if (t > .1 && t < tla) etiqueta('¿CÓMO LO SABEMOS?', [.35, -.3, .9], lt - .1, 44, '#ffffff', true);
      if (t > tla && t < tes) etiqueta('¡LÁSER!', [.35, -.3, .9], lt - tla, 60, '#ff8a8a', true);
      if (t > tes) etiqueta('¡ESPEJOS EN LA LUNA!', [.35, -.3, .9], lt - tes, 44, '#ffd640', true);
      rotulo('Lo medimos con un láser', 'y espejos en la Luna', lt - .05, RY);
    }
  });

  // ---------- 9 · remate: el amigo de la playera "LADO OSCURO" se queda pensando; el protagonista le manda el avioncito ----------
  escena('remate', {
    setup() { this.n = noche();
      this.l = PM.luna([.1, 2.45, ZL], .55, { cara: true });
      this.a = PM.chibi([-.62, .02, .38], { ropa: 0x2b2f4a, pantalon: 0x4a5a7a, tenis: AMARILLO, colPelo: 0x2a1a12, boca: 'feliz', mira: 1, escala: .82 });
      this.pl = PM.letrero([0, .72, .4], 'LADO OSCURO', { w: .68, h: .28, hilos: false, borde: 0x14183a, color: 0x2b3060, tinta: '#ffffff' }, this.a);
      this.pq = PM.pregunta([-1.0, 1.85, .5], .9);
      this.p = PM.chibi([.72, .02, .3], { logo: true, boca: 'feliz', mira: -1, escala: .82 });
      this.pa = PM.avion([.72, 1.3, .9], .45); },
    update(lt, c) {
      const t = tw(lt), tma = c.w('Mándaselo') - .1, tdi = c.w('dice') - .1, tos = c.w('oscuro') - .15;
      this.n.update(t); A.parpadea(this.l, t + .5, 1.2); this.l.position.y = 2.45 + Math.sin(t * 1.5) * .02; this.l.cara(t > tos ? 'abierta' : 'feliz');
      A.parpadea(this.a, t + .6, .4); A.parpadea(this.p, t + 2.0, 1.6); respira(this.p, t); respira(this.a, t, .02, 1);
      const kq = ease(cl((t - tos) / .4));
      this.a.boca(t > tos ? 'apretada' : t > tdi ? 'abierta' : 'feliz'); A.preocupa(this.a, .8 * kq); if (t > tos) A.ladea(this.a, .3 * kq, -1);
      this.a.brazos[0].rotation.z = lerp(this.a.brazos[0].r0, -2.3, kq) + Math.sin(t * 3) * .04;
      this.pq.scale.setScalar(pop(t, tos, .35) * .9); this.pq.rotation.z = Math.sin(t * 4) * .1;
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.3, eout(cl((t - tma) / .3))) - lerp(0, 1.2, ease(cl((t - tma - .4) / .3)));
      const kv = cl((t - tma - .45) / 1.4); this.pa.visible = t > tma + .45 && kv < 1; this.pa.position.set(lerp(.7, -.35, ease(kv)), 1.5 + Math.sin(kv * Math.PI) * .7, .9); this.pa.scale.set(-.6, .6, .6); this.pa.rotation.z = -.2 + kv * .3;
      c.ev('whoosh', .05, .4); if (t > tma + .45) c.ev('whoosh', tma + .45, .5); if (t > tdi) c.ev('pop', tdi, .3); if (t > tos) c.ev('ding', tos, .4);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.2))], [0, 1.15, 0], 34);
      if (t > tos) etiqueta('¿LADO OSCURO?', [.05, -.3, .9], lt - tos, 50, '#ffd640', true);
      rotulo('Mándaselo a quien dice', '“el lado oscuro”', lt - .05, RY);
    }
  });
  P.cierre();
}
