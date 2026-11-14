// Short 14-nov 18:00 · CARTULINA CHIBI: ¿Una estrella fugaz es una estrella? (tendencia: Leónidas, la lluvia de estrellas de la próxima semana)
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-14-1800-estrella-fugaz.json OUT ../ejemplos/2026-11-14-1800-estrella-fugaz.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, NOCHE = 0x232a63;
  const set = () => { ambiente({ top: NOCHE, bottom: NOCHE, fog: NOCHE, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); const e = PM.espacio(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); return e; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, fase = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + fase) * .05; };
  const flota = (g, t, y0, f = 0, a = .06) => g.position.y = y0 + Math.sin(t * 2.2 + f) * a;
  const brazosArriba = (p, t, k = 1, f = 0) => { p.brazos[1].rotation.z = lerp(p.brazos[1].r0, 2.5, k) + Math.sin(t * 6 + f) * .08 * k; p.brazos[0].rotation.z = lerp(p.brazos[0].r0, -2.5, k) - Math.sin(t * 6 + f) * .08 * k; };
  // chispitas de cartulina (cuando la piedrita se deshace)
  const chispas = (n = 8) => Array.from({ length: n }, (_, i) => { const c = PM.pz(F.estrella(4, .1, .04), i % 2 ? 0xffc83d : 0xff8a3d, [0, 0, .5], null, { tinta: .01, papel: .03 }); c.visible = false; c.a = i / n * Math.PI * 2 + .3; return c; });
  const animaChispas = (cs, t, t0, x, y) => cs.forEach(c => { const k = (t - t0) / .7; c.visible = k > 0 && k < 1; if (!c.visible) return; const r = .15 + eout(k) * .7; c.position.set(x + Math.cos(c.a) * r, y + Math.sin(c.a) * r, .5); c.scale.setScalar(1 - k * .8); c.rotation.z = t * 5; });
  const corazones = () => [0, 1, 2].map(i => { const c = PM.pz(F.corazon(.35), 0xff5d8f, [0, 0, .6], null, { tinta: .015, papel: .04 }); c.visible = false; c.i = i; return c; });
  const animaCorazones = (cs, t, x0, y0) => cs.forEach(c => { const k = ((t * .9 + c.i / 3) % 1); c.visible = true; c.position.set(x0 + Math.sin(k * 6 + c.i * 2) * .1 + (c.i - 1) * .25, y0 + k * .5, .6); c.scale.setScalar(Math.sin(k * Math.PI) * .8 + .05); });

  // ---------- 1 · gancho: el protagonista pide un deseo… y la "estrella" se detiene: es una piedrita ----------
  escena('gancho', {
    setup() { this.e = set(); this.p = PM.chibi([-.85, .02, .3], { logo: true, boca: 'feliz', mira: 1 });
      this.m = PM.meteoro([0, 0, .2], .26, { L: 1.5, semilla: 4 }); this.m.rotation.z = -.42; this.m.roca.rotation.z = .42;
      this.no = PM.marca([1.05, 2.15, .6], false, 1.0); },
    update(lt, c) {
      const t = tw(lt), tno = c.w('no', 1) - .1, td = c.w('deseo') - .2; this.e.update(t);
      A.parpadea(this.p, t, .4); habla(this.p, t);
      // pide el deseo con los brazos arriba; al "no es" se asusta
      brazosArriba(this.p, t, t < tno ? eout(cl((t - td) / .35)) : 1 - eout(cl((t - tno) / .3)));
      this.p.boca(t < 2.4 ? 'feliz' : 'abierta'); A.preocupa(this.p, t > tno ? 1 : 0);
      // la estrella fugaz cruza y se frena al centro
      const k = eout(cl(t / 2.6)); this.m.position.set(lerp(-.3, .5, k), lerp(2.65, 1.45, k), .2); this.m.titila(t);
      this.m.arde(t < tno ? 1 : 1 - eout(cl((t - tno) / .35))); flota(this.m, t, lerp(2.65, 1.45, k), 0, k > .99 ? .05 : 0);
      A.parpadea(this.m.roca, t, 1.3); this.m.roca.cara(t < tno ? 'feliz' : 'duda');
      this.no.scale.setScalar(pop(t, tno + .2)); this.no.rotation.z = t > tno + .2 ? Math.sin((t - tno) * 14) * .12 * Math.max(0, 1 - (t - tno)) : 0;
      c.ev('whoosh', .1, .5); if (t > tno) c.ev('impact', tno + .2, .5);
      cam([-.03, 1.25, lerp(11.0, 10.5, ease(lt / 4))], [-.03, 1.15, 0], 34);
      if (t > tno) etiqueta('¡NO ES UNA ESTRELLA!', [.0, -.25, .7], lt - tno, 54, '#ffd640', true);
      rotulo('¿Una estrella fugaz', 'es una estrella?', lt - .1, RY);
    }
  });

  // ---------- 2 · es una piedrita del espacio, casi como un grano de arena (lupa) ----------
  escena('piedrita', {
    setup() { this.e = set(); this.p = PM.chibi([-1.0, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .8 });
      this.l = PM.lupa([.5, 1.35, .3], .8, { fondo: 0x3a3f8a });
      this.r = PM.astro([0, 0, .02], .3, 0x9a8f86, { irregular: true, semilla: 4, sombra: 0x7a7068, papel: .05 }); this.l.dentro.add(this.r); this.r.position.set(0, 0, .02);
      this.arena = [[-.45, -.42], [.42, -.38], [.5, .3], [-.5, .32]].map(([x, y], i) => { const g = PM.pz(F.circ(.05 + (i % 2) * .015), 0xf1d59a, [x, y, .02], this.l.dentro, { tinta: .008, papel: .02 }); return g; }); },
    update(lt, c) {
      const t = tw(lt), tg = c.w('grano') - .2; this.e.update(t);
      A.parpadea(this.p, t, 1.1); habla(this.p, t, 1); this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.3, eout(cl(t / .3))) + Math.sin(t * 5) * .06;
      this.l.scale.setScalar(pop(t, .0, .4)); this.l.rotation.z = Math.sin(t * 2) * .03; flota(this.l, t, 1.35, 0, .04);
      this.r.rotation.z = Math.sin(t * 2.5) * .15; A.parpadea(this.r, t, .7); this.r.cara(t > tg ? 'abierta' : 'feliz');
      this.arena.forEach((g, i) => g.scale.setScalar(pop(t, tg + .1 + i * .08)));
      c.ev('pop', .05, .5); if (t > tg) c.ev('ding', tg + .1, .5);
      cam([.0, 1.2, 10.5], [.0, 1.15, 0], 34);
      if (t > tg) etiqueta('COMO UN GRANO DE ARENA', [.05, -.25, .7], lt - tg, 48, '#ffd640', true);
      rotulo('Es una piedrita', 'casi como un grano de arena', lt - .1, RY);
    }
  });

  // ---------- 3 · entra al aire rapidísimo, se calienta, brilla y se deshace ----------
  escena('brilla', {
    setup() { this.e = set(); this.p = PM.chibi([-1.05, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .72 });
      this.m = PM.meteoro([0, 0, .2], .3, { L: 1.7, semilla: 4, arde: 0 }); this.m.rotation.z = -.5; this.m.roca.rotation.z = .5; this.cs = chispas(9); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('calienta') - .3, tb = c.w('brilla,') - .2, td = c.w('deshace.') - .1; this.e.update(t);
      A.parpadea(this.p, t, 2.2); this.p.head.rotation.z = this.p.head.r0 + .12 + Math.sin(t * 3) * .03; this.p.boca(t > td ? 'feliz' : 'abierta');
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.0, eout(cl((t - tb) / .3))) + Math.sin(t * 5) * .06 * (t > tb ? 1 : 0);
      // cruza en diagonal y se va encendiendo
      const k = cl(t / (td + .1)), x = lerp(-.45, .75, k), y = lerp(2.45, 1.05, k);
      this.m.position.set(x, y, .2); this.m.titila(t); this.m.arde(eout(cl((t - tc + .5) / .9)));
      A.parpadea(this.m.roca, t, .9); this.m.roca.cara(t < tc ? 'feliz' : 'abierta');
      // se deshace: se encoge y suelta chispitas
      const sd = 1 - eout(cl((t - td) / .35)); this.m.scale.setScalar(Math.max(.001, sd)); this.m.visible = sd > .01;
      animaChispas(this.cs, t, td, x, y);
      c.ev('whoosh', .05, .6); if (t > tb) c.ev('ding', tb, .4); if (t > td) c.ev('pop', td, .6);
      cam([.0, 1.2, 10.5], [.0, 1.15, 0], 34);
      if (t > tc && t < td) etiqueta('¡SE CALIENTA Y BRILLA!', [.15, -.25, .7], lt - tc, 50, '#ffd640', true);
      if (t > td) etiqueta('…Y SE DESHACE', [.15, -.25, .7], lt - td, 54, '#ffffff', true);
      rotulo('Se calienta tanto', 'que brilla y se deshace', lt - .1, RY);
    }
  });

  // ---------- 4 · la próxima semana: Leónidas; truco: después de medianoche, lejos de las luces ----------
  escena('leonidas', {
    setup() { this.e = set({}); this.p = PM.chibi([-.85, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .85 });
      this.l = PM.letrero([.45, 2.2, .5], 'LEÓNIDAS', { w: 1.5, h: .42, borde: 0x7b5cff });
      this.luna = PM.astro([1.3, .98, -.2], .3, 0xf3ecc8, { crateres: [[-.4, -.3, .14], [.35, .35, .1]], sombra: 0xd8cfa0, expr: 'feliz' });
      this.ms = [0, 1, 2].map(i => { const m = PM.meteoro([0, 0, .1], .12, { L: .9, semilla: i + 2, cara: false }); m.rotation.z = -.5; m.i = i; return m; });
      // lucecitas de la ciudad (abajo a la izquierda) que se apagan al decir "lejos de las luces"
      this.luces = [.45, .7, .95].map((x, i) => { const g = group([x, .02, -.4]); PM.pz(F.rect(.2, .35 + i * .12, .02), 0x3a3470, [0, (.35 + i * .12) / 2, 0], g, { tinta: .01, papel: .03 }); g.v = [0, 1].map(j => PM.det(F.rect(.05, .05, .005), 0xffd640, [-.04 + j * .08, .2 + i * .05, .016], g)); return g; }); },
    update(lt, c) {
      const t = tw(lt), tt = c.w('Truco:') - .15, tm = c.w('medianoche,') - .2, tl = c.w('lejos') - .2, tL = c.w('Leónidas.') - .3; this.e.update(t);
      A.parpadea(this.p, t, .8); habla(this.p, t, 2); this.p.head.rotation.z += .08;
      this.p.boca(t > tt ? 'abierta' : 'feliz');
      if (t < tt) brazosArriba(this.p, t, eout(cl((t - tL) / .3)) * .75, 1); else { brazosArriba(this.p, t, 0); this.p.brazos[1].rotation.z = 1.2 + Math.sin(t * 5) * .08; }
      this.l.position.y = lerp(4.6, 2.2, eout(cl((t - tL) / .45))); this.l.visible = t > tL - .05; this.l.columpia(t);
      // lluvia de estrellas fugaces chiquitas
      this.ms.forEach(m => { const k = ((t * .55 + m.i / 3) % 1); m.position.set(lerp(-.55, 1.35, k) + (m.i - 1) * .2, lerp(2.5, 1.6, k) - m.i * .1, .1); m.titila(t + m.i); m.scale.setScalar(Math.sin(Math.min(1, k * 1.1) * Math.PI) * .95 + .02); });
      // luna: aparece en "medianoche"
      this.luna.scale.setScalar(pop(t, tm)); flota(this.luna, t, .98, 1, .05); A.parpadea(this.luna, t, 2.6);
      const apag = t > tl + .2; this.luces.forEach((g, i) => g.v.forEach(v => v.visible = !(apag && t > tl + .2 + i * .15)));
      c.ev('whoosh', tL, .5); if (t > tm) c.ev('pop', tm, .5); if (t > tl) c.ev('ding', tl + .2, .5);
      cam([.0, 1.2, 10.5], [.0, 1.15, 0], 34);
      if (t > tt && t < tl) etiqueta('DESPUÉS DE MEDIANOCHE', [.1, -.25, .7], lt - tt, 48, '#ffd640', true);
      if (t > tl) etiqueta('LEJOS DE LAS LUCES', [.1, -.25, .7], lt - tl, 52, '#ffffff', true);
      if (t < tt) rotulo('La próxima semana', 'lluvia de estrellas Leónidas', lt - .1, RY);
      else rotulo('Truco', 'después de medianoche, lejos de las luces', lt - tt, RY);
    }
  });

  // ---------- 5 · remate: mándaselo a quien todavía pide deseos ----------
  escena('remate', {
    setup() { this.e = set(); this.p = PM.chibi([-.8, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .85 });
      this.a = PM.chibi([.78, .02, .2], { escala: .85, ropa: 0xff6b5b, pantalon: 0x3a3470, pelo: 'cola', colPelo: 0x5a3220, tenis: 0xffc83d, aretes: true, boca: 'feliz', mira: -1 });
      this.m = PM.meteoro([0, 0, .1], .15, { L: .8, semilla: 6 }); this.m.rotation.z = -.15; this.m.roca.rotation.z = .15; this.cs = corazones(); },
    update(lt, c) {
      const t = tw(lt), td = c.w('deseos') - .2; this.e.update(t);
      A.parpadea(this.p, t, .2); habla(this.p, t); this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.25, eout(cl(t / .3))) + Math.sin(t * 6) * .07;   // señala a su amiga
      this.p.boca(t > td ? 'abierta' : 'feliz');
      // la amiga pide su deseo, feliz
      A.parpadea(this.a, t, 1.6); brazosArriba(this.a, t, eout(cl((t - .3) / .35)), 2); this.a.head.rotation.z = this.a.head.r0 + Math.sin(t * 3) * .05; this.a.boca('abierta');
      const k = (t * .45) % 1; this.m.position.set(lerp(-1.1, .2, k), lerp(2.6, 2.4, k), .1); this.m.scale.setScalar(Math.sin(Math.min(1, k * 1.05) * Math.PI) * .95 + .02); this.m.titila(t); A.parpadea(this.m.roca, t, .5); this.m.roca.cara('feliz');
      if (t > td) { animaCorazones(this.cs, t, .78, 2.05); c.ev('ding', td, .6); }
      cam([.0, 1.25, 10.5], [.0, 1.15, 0], 34);
      etiqueta('MÁNDASELO', [.0, -.25, .7], lt, 56, '#ffd640', true);
      rotulo('Mándaselo', 'a quien todavía pide deseos', lt - .05, RY);
    }
  });
  P.cierre();
}
