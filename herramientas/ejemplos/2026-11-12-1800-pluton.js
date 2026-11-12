// Short 12-nov 18:00 · CARTULINA CHIBI: ¿Por qué Plutón ya no es planeta? (pedido de un seguidor)
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-12-1800-pluton.json OUT ../ejemplos/2026-11-12-1800-pluton.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw, rayitas } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, NOCHE = 0x232a63;
  const set = () => { ambiente({ top: NOCHE, bottom: NOCHE, fog: NOCHE, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); const e = PM.espacio(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); return e; };
  const PLU = 0xe9c9a4;                                         // Plutón: beige con su corazón blanco
  const pluton = (pos, r, o = {}) => PM.astro(pos, r, PLU, { corazon: true, sombra: 0xcfa985, ...o });
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, fase = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + fase) * .05; };
  const flota = (g, t, y0, f = 0, a = .06) => g.position.y = y0 + Math.sin(t * 2.2 + f) * a;
  const corazones = () => [0, 1, 2].map(i => { const c = PM.pz(F.corazon(.4), 0xff5d8f, [0, 0, .6], null, { tinta: .015, papel: .04 }); c.visible = false; c.i = i; return c; });
  const animaCorazones = (cs, t, x0, y0, sep = .28, sube = .6, sinCentro = false) => cs.forEach(c => { if (sinCentro && c.i === 1) { c.visible = false; return; } const k = ((t * .9 + c.i / 3) % 1); c.visible = true; c.position.set(x0 + Math.sin(k * 6 + c.i * 2) * .12 + (c.i - 1) * sep, y0 + k * sube, .6); c.scale.setScalar(Math.sin(k * Math.PI) * .9 + .05); });

  // ---------- 1 · gancho: un seguidor pregunta; Plutón colgado de la maqueta, preocupado ----------
  escena('gancho', {
    setup() { this.e = set(); this.p = PM.chibi([-.78, .02, .3], { logo: true, boca: 'abierta', mira: 1 });
      this.c = PM.comentario([.1, 2.28, .5], '¿Por qué Plutón ya\nno es planeta?', { w: 2.0, h: .56 });
      this.pl = pluton([.68, 1.05, .45], .42, { expr: 'duda' }); this.q = PM.pregunta([1.12, 1.62, .7], .75); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('Plutón') - .15; this.e.update(t);
      habla(this.p, t); A.parpadea(this.p, t, .4);
      // señala a Plutón cuando lo nombra
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.35, eout(cl((t - tp) / .3))) + Math.sin(t * 6) * .05 * (t > tp ? 1 : 0);
      this.c.scale.setScalar(pop(t, -.4, .3)); this.c.rotation.z = Math.sin(t * 2) * .02;
      flota(this.pl, t, 1.05); this.pl.rotation.z = Math.sin(t * 2.6) * .08; A.parpadea(this.pl, t, 1.5);
      this.pl.cara(t > tp ? 'triste' : 'duda');
      this.q.scale.setScalar(pop(t, tp + .1) * .75); this.q.rotation.z = Math.sin(t * 4) * .15;
      if (t > tp) c.ev('pop', tp + .1); c.ev('pop', .02, .5);
      cam([-.03, 1.25, lerp(11.0, 10.5, ease(lt / 3.5))], [-.03, 1.15, 0], 34);
      rotulo('¿Por qué Plutón', 'ya no es planeta?', lt - .1, RY);
    }
  });

  // ---------- 2 · tres reglas: gira alrededor del Sol, casi redondo, limpia su camino ----------
  escena('reglas', {
    setup() { this.e = set(); this.p = PM.chibi([-.95, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .78 });
      this.sol = PM.astro([.35, 2.0, -.2], .4, 0xffd23d, { rayos: true, sombra: 0xffb23d });
      this.pl = pluton([0, 0, .4], .2);
      this.orb = []; for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; const pos = [.35 + Math.cos(a) * .85, 2.0 + Math.sin(a) * .34, Math.sin(a) > 0 ? -.3 : .3]; const d = PM.pz(F.circ(.035), 0xffffff, pos, null, { tinta: false, papel: false }); d.on = PM.pz(F.circ(.055), 0xffd23d, pos, null, { tinta: false, papel: false }); d.on.visible = false; d.a = a; this.orb.push(d); } },
    update(lt, c) {
      const t = tw(lt), tg = c.w('girar') - .2, tr = c.w('redondo,') - .2, tl = c.w('limpiar') - .2; this.e.update(t);
      habla(this.p, t, 1); A.parpadea(this.p, t, 2.1); this.p.brazos[1].rotation.z = 2.2 + Math.sin(t * 5) * .1;   // señala arriba, al Sol
      this.sol.rayos.rotation.z = t * .4; A.parpadea(this.sol, t, .9); this.sol.cara('feliz');
      // Plutón da vueltas (por delante y por detrás del Sol)
      const a = -Math.PI / 2 + Math.max(0, t - .3) * 1.25; this.pl.position.set(.35 + Math.cos(a) * .85, 2.0 + Math.sin(a) * .34, Math.sin(a) > 0 ? -.35 : .45);
      A.parpadea(this.pl, t, 1.7); this.pl.cara(t > tr && t < tr + .9 ? 'abierta' : 'feliz');
      const sq = t > tr && t < tr + .6 ? 1 + Math.sin((t - tr) * 16) * .12 : 1; this.pl.scale.set(sq, 2 - sq, 1);
      // al decir "limpiar su camino" el camino se ilumina en amarillo
      this.orb.forEach(d => { const on = t > tl && ((d.a - (t - tl) * 6) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) < 1.4; d.visible = !on; d.on.visible = on; });
      cam([.0, 1.15, 11.0], [.0, 1.1, 0], 34);
      if (t > tg) { etiqueta('1 · GIRA AL SOL', [.5, .95, .7], lt - tg, 48, '#ffffff', true); c.ev('ding', tg, .5); }
      if (t > tr) { etiqueta('2 · CASI REDONDO', [.5, .45, .7], lt - tr, 48, '#ffffff', true); c.ev('ding', tr, .5); }
      if (t > tl) { etiqueta('3 · LIMPIA SU CAMINO', [.42, -.05, .7], lt - tl, 48, '#ffd640', true); c.ev('ding', tl, .6); }
      rotulo('Tres reglas', 'para ser planeta', lt - .1, RY);
    }
  });

  // ---------- 3 · cumple dos, pero su camino está lleno de rocas de hielo ----------
  escena('camino', {
    setup() { this.e = set(); this.pl = pluton([-.3, 1.15, .45], .45);
      this.ok = [PM.marca([-.95, 2.3, .6], true, .9), PM.marca([-.35, 2.3, .6], true, .9)]; this.no = PM.marca([.3, 2.3, .6], false, .9);
      this.ruta = []; for (let i = 0; i < 18; i++) { const x = -1.7 + i * .2; this.ruta.push(PM.pz(F.circ(.03), 0xffffff, [x, 1.15 + Math.sin(x * .9) * .12, .1], null, { tinta: false, papel: false })); }
      const R = [[-1.25, 1.35, .14], [-.95, .75, .1], [.45, 1.5, .17], [.8, .85, .13], [1.15, 1.35, .15], [.25, .65, .09], [-.75, 1.75, .09], [1.0, 1.9, .1], [-1.2, .55, .12], [.65, 1.95, .08]];
      this.rocas = R.map(([x, y, r], i) => { const g = PM.astro([x, y, .3], r, i % 2 ? 0xbcd8ee : 0xd5e6f3, { irregular: true, semilla: i + 2, cara: false, sombra: 0x9fbfd8, papel: .05 }); g.x0 = x; g.y0 = y; g.i = i; return g; }); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('cumple') - .15, tm = c.w('camino') - .2, tr = c.w('rocas') - .2; this.e.update(t);
      flota(this.pl, t, 1.15, 0, .05); A.parpadea(this.pl, t, .6); this.pl.cara(t < tc + 1.0 ? 'feliz' : t < tr ? 'abierta' : 'duda');
      this.pl.position.x = -.3 + Math.min(1, Math.max(0, t - .2) / 3.5) * .12;
      this.ok.forEach((m, i) => m.scale.setScalar(pop(t, tc + .25 + i * .3) * .9));
      this.no.scale.setScalar(pop(t, tr + .1) * .9); this.no.rotation.z = t > tr ? Math.sin((t - tr) * 14) * .12 * Math.max(0, 1 - (t - tr)) : 0;
      this.rocas.forEach(g => { const k = pop(t, tm + g.i * .09, .3); g.scale.setScalar(k); g.position.y = g.y0 + Math.sin(t * 2 + g.i) * .04; g.rotation.z = Math.sin(t * 1.5 + g.i * 2) * .2; });
      if (t > tc + .25) c.ev('ding', tc + .25, .5); if (t > tm) c.ev('pop', tm); if (t > tr) c.ev('impact', tr + .1, .5);
      cam([.0, 1.2, 10.5], [.0, 1.15, 0], 34);
      if (t > tr) etiqueta('ROCAS DE HIELO', [.0, -.2, .7], lt - tr, 56, '#ffd640', true);
      rotulo('No limpia su camino', 'lo comparte con rocas de hielo', lt - .1, RY);
    }
  });

  // ---------- 4 · no por chiquito (más pequeño que la Luna); sigue ahí como planeta enano ----------
  escena('enano', {
    setup() { this.e = set(); this.pl = pluton([.55, 1.05, .45], .3);
      this.luna = PM.astro([-.6, 1.3, .3], .55, 0xc9cbd6, { crateres: [[-.45, -.35, .14], [.35, .45, .1], [-.1, .6, .07]], sombra: 0xa9abb8 });
      this.l = PM.letrero([0, 2.05, .6], 'PLANETA ENANO', { w: 1.6, h: .4, borde: 0x7b5cff });
      this.am = [[-.85, .7, 4], [.85, .7, 7]].map(([x, y, s]) => { const g = PM.astro([x, y, .5], .2, 0xcfe3f2, { irregular: true, semilla: s, sombra: 0xa7c4dc }); g.x0 = x; g.y0 = y; return g; });
      this.cs = corazones(); },
    update(lt, c) {
      const t = tw(lt), tch = c.w('chiquito,') - .2, tq = c.w('pequeño') - .2, ts = c.w('Sigue') - .2, te = c.w('enano.') - .3; this.e.update(t);
      // Luna entra, se compara y se va cuando "sigue ahí"
      const sal = eout(cl((t - ts) / .45)); this.luna.position.x = lerp(-2.6, -.6, eout(cl(t / .45))) - sal * 2.2; flota(this.luna, t, 1.3, 1, .05);
      A.parpadea(this.luna, t, 2.3); this.luna.cara(t > tq ? 'feliz' : 'abierta');
      // Plutón: triste "por chiquito", luego al centro con su letrero, y sonríe con sus amigos helados
      this.pl.position.x = lerp(.55, 0, eout(cl((t - ts) / .45))); flota(this.pl, t, lerp(1.05, 1.15, cl((t - ts) / .45)), 0, .05);
      const sp = 1 + .35 * eout(cl((t - ts) / .45)); this.pl.scale.setScalar(sp); A.parpadea(this.pl, t, .5);
      this.pl.cara(t < tch ? 'feliz' : t < te ? 'triste' : 'abierta');
      this.l.position.y = lerp(4.8, 2.1, eout(cl((t - ts - .15) / .4))); this.l.visible = t > ts; this.l.columpia(t);
      this.am.forEach((g, i) => { g.scale.setScalar(pop(t, te + i * .12)); flota(g, t, g.y0, i * 2, .05); A.parpadea(g, t, i + .3); g.cara('abierta'); });
      if (t > te + .3) { animaCorazones(this.cs, t, 0, 1.2, .62, .45, true); c.ev('pop', te); }
      if (t > ts) c.ev('whoosh', ts, .5);
      cam([.0, 1.2, 10.5], [.0, 1.15, 0], 34);
      if (t > tq && t < ts) etiqueta('MÁS PEQUEÑO QUE LA LUNA', [-.05, -.2, .7], lt - tq, 46, '#ffd640', true);
      if (t > te) etiqueta('¡SIGUE AHÍ!', [.0, -.2, .7], lt - te, 58, '#ffffff', true);
      if (t < ts) rotulo('No fue por chiquito', 'aunque es más pequeño que la Luna', lt - .1, RY);
      else rotulo('Sigue ahí', 'ahora es planeta enano', lt - ts, RY);
    }
  });

  // ---------- 5 · remate: mándaselo a quien dice que son nueve ----------
  escena('remate', {
    setup() { this.e = set(); this.p = PM.chibi([-.82, .02, .3], { logo: true, boca: 'abierta', mira: 1 });
      this.pl = pluton([.68, 1.05, .45], .36);
      this.l = PM.letrero([.68, 1.68, .55], 'PLANETA ENANO', { w: 1.15, h: .3, borde: 0x7b5cff, hilos: false }); this.cs = corazones(); },
    update(lt, c) {
      const t = tw(lt), tm = .0, tn = c.w('nueve') - .2; this.e.update(t);
      A.parpadea(this.p, t, .2); habla(this.p, t); this.p.brazos[1].rotation.z = 2.3 + Math.sin(t * 6) * .12;   // saluda / señala a cámara
      flota(this.pl, t, 1.05, 0, .05); this.pl.rotation.z = Math.sin(t * 2.6) * .07; A.parpadea(this.pl, t, 1.1); this.pl.cara(t > tn ? 'abierta' : 'feliz');
      this.l.position.y = this.pl.position.y + .62; this.l.columpia(t, .04);
      if (t > tn) { animaCorazones(this.cs, t, .68, 2.0); c.ev('ding', tn, .6); }
      cam([.0, 1.25, 10.5], [.0, 1.15, 0], 34);
      if (t > tm) etiqueta('MÁNDASELO', [-.75, 2.5, .7], lt - tm, 50, '#ffffff', true);
      if (t > tn) etiqueta('¿SIGUEN SIENDO 9?', [.05, -.25, .7], lt - tn, 54, '#ffd640', true);
      rotulo('Mándaselo', 'a quien dice que son nueve', lt - .05, RY);
    }
  });
  P.cierre();
}
