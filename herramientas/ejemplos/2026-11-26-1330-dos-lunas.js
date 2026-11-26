// Short 26-nov 13:30 · CARTULINA CHIBI (pedido de un seguidor): ¿qué pasaría si la Tierra tuviera DOS lunas?
// Dos lunas jalarían el mar: mareas más altas; noches más brillantes y más eclipses; el sistema no sería estable y acabarían chocando.
// Hipótesis de Jutzi y Asphaug (Nature 2011): una segunda luna pequeña chocó lentamente con la nuestra (cara oculta más montañosa).
// Fuentes: Discover, Universe Today, National Geographic, NPR, NBC News.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-26-1330-dos-lunas.json OUT ../ejemplos/2026-11-26-1330-dos-lunas.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, NOCHE = 0x27306e;
  const noche = (o = {}) => { const c = o.cielo ?? NOCHE; ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    const n = PM.nocheCalle(o); luces({ pos: [-3, 5, 8], hemi: o.hemi ?? 1.65, sol: 1.4, radio: 6 }); return n; };
  const cosmos = () => { ambiente({ top: 0x232a63, bottom: 0x232a63, fog: 0x232a63, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    const e = PM.espacio(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); return e; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const amigo = (pos, o = {}) => PM.chibi(pos, { ropa: 0xff8a3d, pantalon: 0x2b2f4a, tenis: 0xffc83d, colPelo: 0x1d1410, boca: 'feliz', ...o });
  const lunaC = (pos, r, o = {}) => PM.luna(pos, r, { cara: true, ...o });
  // polvito gris de choque: bolitas que salen disparadas en círculo y se encogen. g.update(t, t0)
  const polvo = (pos, n = 10, s = 1) => { const g = group(pos), ps = [];
    for (let i = 0; i < n; i++) { const q = PM.pz(F.circ((.06 + (i % 3) * .025) * s), [0xd8d2c4, 0xbdb6a6, 0xeee8da][i % 3], [0, 0, .02 * (i % 3)], g, { tinta: .008, papel: false }); q.a = i / n * Math.PI * 2 + (i % 2) * .2; q.v = (.5 + (i % 4) * .14) * s; ps.push(q); }
    g.update = (t, t0) => ps.forEach(q => { const k = t - t0; q.visible = k > 0 && k < 1.6; const d = eout(cl(k / 1.1)) * q.v; q.position.x = Math.cos(q.a) * d; q.position.y = Math.sin(q.a) * d; q.scale.setScalar(Math.max(.001, 1 - cl((k - .6) / 1))); });
    g.update(0, 99); return g; };

  // ---------- 1 · gancho: comentario de un seguidor y aparece una SEGUNDA luna ----------
  escena('gancho', {
    setup() { this.n = noche({ estrellas: 26 });
      this.l1 = lunaC([.55, 1.9, this.n.zLuna], .34);
      this.l2 = lunaC([1.45, 1.35, this.n.zLuna], .26, { color: 0xffe2c4 });
      this.k = PM.comentario([.0, 2.32, .6], '¿Y si la Tierra tuviera\nDOS lunas?', { w: 2.25, h: .5 });
      this.p = PM.chibi([-.72, .02, .35], { logo: true, boca: 'abierta', mira: 1, escala: .8 }); },
    update(lt, c) {
      const t = tw(lt), td = c.w('dos') - .1;
      this.n.update(t); A.parpadea(this.p, t + 1.2, .4); respira(this.p, t);
      A.parpadea(this.l1, t + .4, .9); A.parpadea(this.l2, t + 1.5, .2);
      this.k.scale.setScalar(pop(t, .05, .4)); this.k.position.y = 2.32 + Math.sin(t * 2.2) * .02;
      this.l1.cara(t > td ? 'abierta' : 'feliz'); this.l1.position.y = 1.9 + Math.sin(t * 1.8) * .03;
      this.l2.scale.setScalar(pop(t, td, .45)); this.l2.position.y = 1.35 + Math.sin(t * 1.8 + 1) * .03; this.l2.cara('feliz');
      // señala al cielo leyendo la pregunta y luego se sorprende con la segunda luna
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 2.5 + Math.sin(t * 6) * .07; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .2;
      A.ladea(this.p, .35 * ease(cl(t / .5)), 1); habla(this.p, t); this.p.boca(t > td ? 'abierta' : 'feliz');
      A.preocupa(this.p, t > td ? .0 : .3);
      c.ev('pop', .05, .5); if (t > td) c.ev('ding', td, .7);
      cam([0, 1.2, lerp(10.8, 10.3, ease(lt / 3.6))], [0, 1.15, 0], 34);
      rotulo('¿Y si la Tierra tuviera', 'DOS lunas?', lt - .05, RY);
    }
  });

  // ---------- 2 · mareas: dos lunas jalan el mar y la marea sube de más ----------
  escena('mareas', {
    setup() { this.n = noche({ estrellas: 20 });
      this.l1 = lunaC([-1.0, 2.3, this.n.zLuna], .3); this.l2 = lunaC([1.05, 2.35, this.n.zLuna], .24, { color: 0xffe2c4 });
      this.m = PM.olaMarea([0, -.05, -1.3], { w: 7 });
      PM.pz(F.rect(30, 3, 0), 0xf1d59a, [0, -1.48, -.9], null, { tinta: .014, papel: .06 }); PM.pz(F.rect(30, 6, 0), 0xf1d59a, [0, -5.4, -.92], null, { tinta: false, papel: false });
      for (let x = -1.4; x < 1.5; x += .42) PM.det(F.circ(.025), 0xd9b877, [x, -.2 - (x * 3 % .3), -.88]);
      this.fa = [[-.62, .6, .3], [.7, .62, -.25]].map(([x, y, r]) => { const f = PM.flechaAire([x, y, .2], null, 1.6); f.rotation.z = Math.PI / 2 + r; f.color(0xffd640); f.y0 = y; return f; });
      this.p = PM.chibi([0, .02, .35], { logo: true, boca: 'abierta', mira: 1, escala: .66 }); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('altas') - .25, tj = c.w('jalarían') - .1;
      this.n.update(t); A.parpadea(this.p, t + .7, 1.9); respira(this.p, t);
      A.parpadea(this.l1, t + .2, .6); A.parpadea(this.l2, t + 1.1, 1.3);
      // la marea sube de .18 a .72 y sigue meciéndose
      const km = ease(cl((t - .2) / Math.max(.6, ta - .2 + .4))); this.m.update(t, lerp(.12, .72, km) + Math.sin(t * 3.2) * .04 * km);
      this.fa.forEach((f, i) => { f.scale.setScalar(1.6 * pop(t, tj + i * .12, .4)); f.position.y = f.y0 + .5 + ((t * .6 + i * .5) % .5); });
      this.l1.cara(t > tj ? 'abierta' : 'feliz'); this.l2.cara(t > tj ? 'abierta' : 'feliz');
      [this.l1, this.l2].forEach((l, i) => { l.rotation.z = t > tj ? Math.sin(t * 9 + i) * .08 : 0; });
      // se preocupa y levanta los brazos mientras el agua sube
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - 1.0 * km - Math.sin(t * 9) * .1 * km; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.0 * km + Math.sin(t * 9 + 1) * .1 * km;
      A.preocupa(this.p, km); habla(this.p, t); this.p.boca('abierta'); this.p.position.x = Math.sin(t * 5) * .03 * km;
      c.ev('whoosh', .1, .6); if (t > ta) c.ev('pop', ta, .5); if (t > tj) c.ev('whoosh', tj, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      etiqueta(t < tj ? '¡MAREAS MÁS ALTAS!' : '¡DOS LUNAS JALANDO!', [0, 2.6, .9], lt - (t < tj ? .15 : tj), 42, t < tj ? '#8fd3ff' : '#ffd640', true);
      rotulo('Mareas más altas', 'por el doble jalón', lt - .05, RY);
    }
  });

  // ---------- 3 · noches más brillantes y más eclipses (una luna se pone roja en la sombra) ----------
  escena('noches', {
    setup() { this.n = noche({ estrellas: 14, cielo: 0x323c86 });
      this.l1 = lunaC([-.75, 2.3, this.n.zLuna], .34, { haloR: 1.3 }); this.l2 = lunaC([.95, 2.38, this.n.zLuna], .3, { color: 0xffe2c4, haloR: 1.3 });
      // sombra de la Tierra que tapa a la segunda luna (eclipse de luna): disco oscuro que la cruza
      this.sh = PM.pz(F.circ(.36), 0x1a1f4a, [1.95, 2.38, this.n.zLuna + .06], null, { tinta: false, papel: .03 });
      this.p = PM.chibi([-.62, .02, .35], { logo: true, boca: 'feliz', mira: 1, escala: .64 });
      this.a = amigo([.7, .02, .3], { escala: .6, mira: -1, lentes: 0x2b2f4a }); },
    update(lt, c) {
      const t = tw(lt), tb = c.w('brillantes') - .2, te = c.w('eclipses') - .25;
      this.n.update(t); A.parpadea(this.p, t + .2, 2.4); A.parpadea(this.a, t + 1.7, .8); respira(this.p, t); respira(this.a, t, .02, .9);
      A.parpadea(this.l1, t + .5, .3); A.parpadea(this.l2, t + 2, .7);
      const kb = ease(cl((t - tb) / .5)); [this.l1, this.l2].forEach((l, i) => { l.halo.scale.setScalar(1 + .25 * kb + Math.sin(t * 4 + i) * .04 * kb); l.position.y = (i ? 2.38 : 2.3) + Math.sin(t * 1.8 + i) * .03; });
      const ke = ease(cl((t - te) / .7)); this.sh.position.x = lerp(1.95, .97, ke); this.sh.position.y = this.l2.position.y; this.sh.visible = ke > .01;
      this.l2.cara(ke > .5 ? 'abierta' : 'feliz'); this.l1.cara('feliz');
      // los dos se maravillan: brazos arriba con las noches claras, luego señalan el eclipse
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - lerp(.2, 2.3, kb) + Math.sin(t * 7) * .06 * kb; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + lerp(.2, 2.3, kb) - Math.sin(t * 7) * .06 * kb;
      this.a.brazos[0].rotation.z = this.a.brazos[0].r0 - lerp(.2, 2.6, ke); A.ladea(this.a, .4 * ke, -1);
      habla(this.p, t); this.p.boca(t > te ? 'abierta' : 'feliz'); this.a.boca(t > te ? 'abierta' : 'feliz');
      c.ev('ding', Math.max(.05, tb), .6); if (t > te) c.ev('whoosh', te, .7);
      cam([0, 1.2, lerp(10.4, 10.1, ease(lt / 3))], [0, 1.15, 0], 34);
      etiqueta(t < te ? 'NOCHES MÁS CLARAS' : '¡Y MÁS ECLIPSES!', [0, 2.6, .9], lt - (t < te ? Math.max(0, tb) : te), 44, t < te ? '#fff2a8' : '#ff8a5b', true);
      rotulo('Noches más brillantes', 'y más eclipses', lt - .05, RY);
    }
  });

  // ---------- 4 · choque: las órbitas se cruzan… ¡PUM! · y quizá ya pasó (lunita que se aplasta contra la nuestra) ----------
  escena('choque', {
    setup() { this.e = cosmos();
      this.o = PM.orbitaLunaGiro([0, 1.35, 0], { R: 1.0, rT: .38, rL: .19 });
      this.b = group([0, 0, .07], this.o); this.l2 = lunaC([0, 0, 0], .15, { halo: false, color: 0xffe2c4 }); this.b.add(this.l2);
      this.pA = polvo([0, 0, .2], 10, 1); this.o.add(this.pA);
      // parte B: la Luna grande y la lunita que llega despacito
      this.B = group([0, 0, 0]);
      this.L = lunaC([-.38, 1.45, 0], .68, { halo: false }); this.B.add(this.L);
      this.chica = lunaC([1.4, 1.75, .1], .26, { halo: false, color: 0xd9d2c2 }); this.B.add(this.chica);
      this.pB = polvo([.4, 1.6, .3], 12, 1.1); this.B.add(this.pB);
      this.s = PM.chibi([1.02, .02, .35], { ropa: 0xf4f4f4, pantalon: 0x3d6bff, tenis: 0x2b2f4a, colPelo: 0x6b4a2e, lentes: 0x2b2f4a, boca: 'feliz', mira: -1, escala: .62 }); this.B.add(this.s); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('chocarían') + .15, tq = c.w('quizá') - .15, tci = c.w('científicos') - .1, tl = c.w('lunita') - .1, tch = c.w('chocó') - .1;
      this.e.update?.(t);
      const A_ = t < tq;
      this.o.visible = A_; this.B.visible = !A_;
      if (A_) {
        // la Luna normal gira; la segunda se va acercando en espiral (órbita inestable) hasta tocarla en tc
        const a1 = 1.0 + (t - tc) * 1.3, a2 = 1.0 + (t - tc) * 2.4, r2 = lerp(.45, .86, ease(cl(t / tc)));
        const ch = t > tc;
        this.o.update(ch ? 1.0 : a1); this.o.luna.visible = true;
        this.b.position.set(Math.cos(ch ? 1.0 : a2) * (ch ? .86 : r2), Math.sin(ch ? 1.0 : a2) * (ch ? .86 : r2), .07);
        this.l2.visible = !ch || t < tc + .12; this.l2.scale.setScalar(ch ? .001 : 1); this.l2.cara(t > tc - .7 ? 'abierta' : 'feliz'); this.o.luna.cara(t > tc - .7 ? 'abierta' : 'feliz');
        if (ch) { this.o.luna.scale.set(1 + .25 * Math.sin(cl((t - tc) / .4) * Math.PI), 1 - .2 * Math.sin(cl((t - tc) / .4) * Math.PI), 1); }
        this.pA.position.set(Math.cos(1.0) * .95, Math.sin(1.0) * .95, .2); this.pA.update(t, tc);
        A.parpadea(this.o.tierra, t + .3, .9); this.o.tierra.cara(t > tc - .4 ? 'abierta' : 'feliz'); A.preocupa?.(this.o.tierra, 0);
        A.parpadea(this.o.luna, t + 1.1, .4); A.parpadea(this.l2, t + .6, 1.7);
        c.ev('whoosh', .05, .6); if (t > tc) c.ev('crack', tc, .8);
        cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
        etiqueta(t < tc ? 'ÓRBITAS QUE SE CRUZAN' : '¡PUM!', [0, 2.62, .9], lt - (t < tc ? .1 : tc), t < tc ? 38 : 64, t < tc ? '#8fd3ff' : '#ff6b5b', true);
        rotulo('Tarde o temprano', 'chocarían', lt - .05, RY);
      } else {
        const lb = t - tq;
        // la lunita llega despacio desde la derecha y se aplasta contra la Luna (choque lento)
        const kl = ease(cl((t - tl) / Math.max(.8, tch - tl + .5))), x = lerp(1.4, .42, kl);
        this.chica.position.set(x, lerp(1.75, 1.62, kl), .1); const ap = cl((t - tch - .3) / .6);
        this.chica.scale.set(Math.max(.001, 1 - .6 * ap), 1 + .25 * ap, 1); this.chica.position.x = x - .08 * ap;
        this.chica.cara(kl > .6 ? 'abierta' : 'feliz'); this.L.cara(kl > .7 ? 'abierta' : 'feliz');
        this.L.position.x = -.38 - .04 * Math.sin(cl((t - tch - .3) / .4) * Math.PI);
        this.pB.update(t, tch + .3);
        A.parpadea(this.L, t + .8, 1.2); A.parpadea(this.chica, t + .1, .5); A.parpadea(this.s, t + 2.1, 1.0); respira(this.s, t);
        // científico de bata señala la Luna
        const kp = ease(cl((t - tci) / .35));
        this.s.brazos[0].rotation.z = this.s.brazos[0].r0 - lerp(.2, 1.9, kp) + Math.sin(t * 6) * .05; A.ladea(this.s, .25 * kp, -1); habla(this.s, t); this.s.boca(kp > .5 ? 'abierta' : 'feliz');
        if (lb < .05) c.ev('ding', tq + .15, .7); if (t > tch + .3) c.ev('pop', tch + .3, .7);
        cam([0, 1.2, lerp(10.6, 10.2, ease(lb / 4))], [0, 1.15, 0], 34);
        etiqueta(t < tch ? '¡QUIZÁ YA PASÓ!' : '¡CHOQUE LENTO!', [0, 2.62, .9], lt - (t < tch ? tq + .15 : tch), 46, '#ffd640', true);
        rotulo('Quizá una lunita', 'chocó con la nuestra', lt - tq, RY);
      }
    }
  });

  // ---------- 5 · remate: el amigo del "¿y qué pasaría si…?" ----------
  escena('remate', {
    setup() { this.n = noche({ estrellas: 22 });
      this.l1 = lunaC([-.95, 2.32, this.n.zLuna], .3); this.l2 = lunaC([.05, 2.42, this.n.zLuna], .22, { color: 0xffe2c4 });
      this.p = PM.chibi([-.68, .02, .35], { logo: true, boca: 'feliz', mira: 1, escala: .74 });
      this.a = amigo([.66, .02, .35], { escala: .74, mira: -1, boca: 'abierta' });
      this.q = PM.pregunta([1.0, 1.55, .5], .9); },
    update(lt, c) {
      const t = tw(lt), tm = c.w('Mándaselo'), tp = c.w('pregunta') - .1, ts = c.w('pasaría') - .1;
      this.n.update(t); A.parpadea(this.p, t + 1.6, .5); A.parpadea(this.a, t + .3, 1.4); respira(this.p, t); respira(this.a, t, .02, 1.1);
      A.parpadea(this.l1, t + .9, .2); A.parpadea(this.l2, t + .2, 1.3); this.l1.cara('feliz'); this.l2.cara('feliz');
      this.q.scale.setScalar(.9 * pop(t, tp, .4)); this.q.rotation.z = Math.sin(t * 4) * .15; this.q.position.y = 1.55 + Math.sin(t * 3) * .04;
      // el amigo pregunta emocionado con la mano arriba
      this.a.brazos[1].rotation.z = this.a.brazos[1].r0 + lerp(.2, 2.4, ease(cl((t - tp) / .3))) + Math.sin(t * 8) * .08;
      A.ladea(this.a, .35 * ease(cl((t - ts) / .4)), -1); habla(this.a, t, 1); this.a.boca(t > tp ? 'abierta' : 'feliz');
      this.p.boca(t > ts ? 'feliz' : 'abierta'); habla(this.p, t);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.25 * eout(cl((t - tm - .1) / .3)) + Math.sin(t * 9) * .05;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .2 - Math.sin(t * 9) * .05;
      c.ev('whoosh', .05, .4); if (t > tp) c.ev('pop', tp, .5); if (t > ts) c.ev('ding', ts, .5);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.6))], [0, 1.15, 0], 34);
      if (t > ts - .2) etiqueta('¿Y QUÉ PASARÍA SI…?', [0, 2.62, .9], lt - ts + .2, 42, '#ffd640', true);
      rotulo('Mándaselo a tu amigo', 'del "¿y qué pasaría si…?"', lt - .05, RY);
    }
  });
  P.cierre();
}
