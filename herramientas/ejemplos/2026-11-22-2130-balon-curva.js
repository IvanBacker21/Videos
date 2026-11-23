// Short 22-nov 21:30 (PRUEBA LARGO 40 s) · CARTULINA CHIBI: ¿cómo se dobla el balón en el aire?
// Pegarle de lado hace girar el balón; al girar desvía el aire hacia un lado y por reacción el balón se va al otro (efecto Magnus, por el
// físico alemán Heinrich Magnus; igual que la curva del beisbol). El tiro libre de Roberto Carlos (1997, ~35 m) parecía irse fuera y se metió:
// físicos en Francia (Dupeux, Clanet y Quéré, New J. Phys. 2010) explicaron que al frenarse el balón la curva se cierra como espiral.
// Sin giro, el aire forma remolinos irregulares y el balón "baila" (tiro de nudillo).
// Fuentes: Physics World (The physics of football), Physics Today (Magnus effect responsible for great soccer goal), Scientific American
// (Physics of free kicks), PBS NOVA (How the Magnus force curves soccer and baseballs), Univ. of Rochester (What is the Magnus effect).
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-22-2130-balon-curva.json OUT ../ejemplos/2026-11-22-2130-balon-curva.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw, tubo } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, AMARILLO = 0xffc83d, ROJO = 0xff5b5b, VERDE = 0x2ec4a6, PASTO = 0x6cc35a, PASTO2 = 0x7fd06a;
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  // ---------- cancha de barrio/estadio: cielo, gradas con público, pasto a rayas y línea blanca ----------
  const cancha = () => {
    ambiente({ top: 0xbfe3f5, bottom: 0xbfe3f5, fog: 0xbfe3f5, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    PM.pz(F.rect(30, 30, 0), 0xa9dcf5, [0, 8, -4.2], null, { tinta: false, papel: false });
    for (const [x, y, s] of [[-1.6, 3.3, .7], [1.5, 3.0, .55]]) PM.pz(F.nube(s * 1.6), 0xffffff, [x, y, -3.9], null, { tinta: .02, papel: .08 });
    const gr = group([0, 0, -3.2]); let sm = 7; const rnd = () => (sm = (sm * 16807) % 2147483647) / 2147483647;
    const cols = [0xff6b5b, 0xffc83d, 0x3d7bff, 0xffffff, 0x2ec4a6, 0xff8fb1, 0x7b5cff];
    [[.62, 0x8a93b0], [1.12, 0x9aa3c2], [1.62, 0xaab3d2]].forEach(([y, c], j) => {
      PM.pz(F.rect(30, .5, .02), c, [0, y, -j * .05], gr, { tinta: .016, papel: false });
      for (let x = -3.2 + j * .09; x < 3.2; x += .19) { const h = PM.det(F.circ(.065), cols[Math.floor(rnd() * cols.length)], [x, y + .17, .02 - j * .05], gr); h.scale.y = 1.1; } });
    PM.pz(F.rect(30, .3, .02), 0xf3ead8, [0, 2.0, -.2], gr, { tinta: .016, papel: false });
    const pa = PM.pz(F.rect(30, 6.6, 0), PASTO, [0, -2.75, -1.7], null, { tinta: false, papel: false });
    const sinSombra = g => g.traverse(o => { if (o.isMesh) o.receiveShadow = false; }); sinSombra(pa);
    for (let k = -8; k < 8; k++) sinSombra(PM.det(F.rect(.4, 6.6, 0), PASTO2, [k * .8 + .2, -2.75, -1.69]));
    sinSombra(PM.det(F.rect(30, .05, 0), 0x5aa94a, [0, .55, -1.68]));
    sinSombra(PM.det(F.rect(30, .045, 0), 0xffffff, [0, -.42, -1.68]));
    luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
  };
  // portería de frente: postes blancos y red
  const porteria = (pos, w = .66, h = .55) => { const g = group(pos);
    for (let i = 0; i <= 8; i++) PM.det(F.rect(.012, h, 0), 0xdfe6ee, [-w / 2 + i * w / 8, h / 2, -.06], g);
    for (let i = 0; i <= 5; i++) PM.det(F.rect(w, .012, 0), 0xdfe6ee, [0, i * h / 5, -.06], g);
    for (const sx of [-1, 1]) PM.pz(F.rect(.05, h + .025, .02), 0xffffff, [sx * w / 2, h / 2, 0], g, { tinta: .012, papel: .03 });
    PM.pz(F.rect(w + .05, .05, .02), 0xffffff, [0, h, 0], g, { tinta: .012, papel: .03 }); return g; };
  // flecha de cartulina que apunta hacia +y
  const flecha = (pos, L = .6, color = AMARILLO, parent = null) => { const g = group(pos, parent);
    PM.pz(F.rect(.11, L, .02), color, [0, L / 2, 0], g, { tinta: .014, papel: .04 }); PM.pz(F.poly([[-.15, 0], [.15, 0], [0, .2]]), color, [0, L, .01], g, { tinta: .014, papel: .04 }); return g; };
  const jugador = (pos, o) => PM.chibi(pos, { boca: 'feliz', ...o });
  // patada con la pierna derecha (la de la derecha de la pantalla): k0 = atrás, k1 = adelante
  const patea = (p, t, t0, d = .18) => { const l = p.piernas[1]; const kb = ease(cl((t - t0 + .3) / .3)), kf = eout(cl((t - t0) / d)), kv = ease(cl((t - t0 - .35) / .35));
    l.rotation.z = l.r0 - .7 * kb * (1 - kf) + 1.05 * kf * (1 - kv); p.brazos[0].rotation.z = p.brazos[0].r0 - .6 * kf * (1 - kv); };

  // ---------- 1 · gancho: el balón rodea la barrera y se mete ----------
  escena('gancho', {
    setup() { cancha();
      this.po = porteria([1.05, .02, -.3], .62, .5);
      this.ba = [-.16, .32].map((x, i) => jugador([x, .02, -.1], { ropa: ROJO, pantalon: 0xffffff, tenis: 0x2b2f4a, escala: .48, colPelo: i ? 0x2a1a12 : 0x5a3a20, mira: -1 }));
      this.p = PM.chibi([-1.12, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .56 });
      const pts = PM.curvaBalon([-.86, .1], [-.5, 1.9], [1.45, 1.75], [1.0, .3]);
      this.es = PM.estela(pts, { z: .5 }); this.b = PM.balonGiro([-.86, .1, .5], { r: .085 });
      this.pr = PM.pregunta([-.55, 2.2, .6], .5); },
    update(lt, c) {
      const t = tw(lt), tai = c.w('aire') - .1, tk = .35;
      A.parpadea(this.p, t + 1.1, .3); this.ba.forEach((b, i) => { A.parpadea(b, t + i * .9, 2); respira(b, t, .02, i); b.brazos.forEach(a => a.rotation.z = a.r0 * 2.2); });
      patea(this.p, t, tk);
      const k = ease(cl((t - tk) / 1.5)); this.es.update(k); const [x, y] = this.es.en(k); this.b.position.set(x, y, .5); this.b.gira(t > tk ? (t - tk) * 9 : 0);
      this.b.flechas.update(t, t > tk && k < 1 ? .7 : 0);
      this.ba.forEach(b => { b.head.rotation.z = b.head.r0 + (t > tk + .2 ? -.25 * ease(cl((t - tk - .2) / .6)) : 0); b.boca(t > tk + .6 ? 'abierta' : 'feliz'); });
      this.p.boca(t > tai ? 'abierta' : 'feliz'); if (t > tai) A.ladea(this.p, .3, 1);
      this.pr.scale.setScalar(pop(t, tai, .35) * .5); this.pr.rotation.z = Math.sin(t * 3) * .1;
      c.ev('whoosh', .05, .4); if (t > tk) c.ev('impact', tk, .35); if (t > tk + .1) c.ev('whoosh', tk + .1, .6); if (t > tk + 1.5) c.ev('pop', tk + 1.5, .4); if (t > tai) c.ev('ding', tai, .5);
      cam([0, 1.2, lerp(11.2, 10.7, ease(lt / 2.7))], [0, 1.15, 0], 34);
      rotulo('¿Cómo se dobla el balón', 'en el aire?', lt - .05, RY);
    }
  });

  // ---------- 2 · efecto: le pega de lado y el balón sale girando ----------
  escena('efecto', {
    setup() { cancha();
      this.p = PM.chibi([-.62, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .95 });
      this.b = PM.balonGiro([.12, .22, .5], { r: .2 });
      this.ch = PM.pz(F.estrella(8, .16, .07), AMARILLO, [0, 0, .7], null, { tinta: .012, papel: .03 }); },
    update(lt, c) {
      const t = tw(lt), tpe = c.w('pegarle'), tla = c.w('lado') - .1, tgi = c.w('girando') - .15, tk = tpe + .15;
      A.parpadea(this.p, t + 2.2, .9); respira(this.p, t); habla(this.p, t);
      patea(this.p, t, tk, .14);
      this.ch.position.set(-.02, .14, .75); this.ch.scale.setScalar(t > tk && t < tk + .35 ? Math.sin((t - tk) / .35 * Math.PI) * 1.1 + .001 : .001);
      const kv = ease(cl((t - tk) / 1.8)), kz = ease(cl((t - tgi) / .5));
      this.b.position.set(lerp(.12, .55, kv), lerp(.22, 1.35, kv), .5); this.b.scale.setScalar(1 + .9 * kz);
      this.b.gira(t > tk ? (t - tk) * 10 : 0); this.b.flechas.update(t, t > tk ? eout(cl((t - tgi) / .4)) : 0);
      this.p.boca(t > tla ? 'abierta' : 'feliz');
      c.ev('whoosh', .05, .4); if (t > tk) c.ev('impact', tk, .4); if (t > tla) c.ev('ding', tla, .4); if (t > tgi) c.ev('whoosh', tgi, .6);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.4))], [0, 1.15, 0], 34);
      if (t > tla) etiqueta('¡DE LADO!', [0, -.3, .9], lt - tla, 58, '#ffd640', true);
      rotulo('El secreto: pegarle', 'de lado', lt - .05, RY);
    }
  });

  // ---------- 3 · aire: el balón que gira avienta el aire hacia abajo y el aire lo empuja hacia arriba ----------
  escena('aire', {
    setup() { cancha();
      this.b = PM.balonGiro([.25, 1.25, .5], { r: .36 });
      this.fa = flecha([.25, 1.62, .85], .5); this.fa.scale.setScalar(.001);
      this.fb = flecha([.95, .95, .85], .35, 0xffffff); this.fb.rotation.z = Math.PI; this.fb.scale.setScalar(.001);
      const pts = PM.curvaBalon([-.48, .42], [-.25, .5], [0, .9], [.2, 1.42]); this.es = PM.estela(pts, { z: .3, r: .035 });
      this.p = PM.chibi([-1.05, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .62 }); },
    update(lt, c) {
      const t = tw(lt), tem = c.w('empuja') - .1, tla = c.w('lado') - .1, tot = c.w('otro') - .15, tcu = c.w('curva') - .15;
      A.parpadea(this.p, t + .7, 2.0); respira(this.p, t);
      const ka = ease(cl((t - tem) / .5)), ku = ease(cl((t - tot) / .6));
      this.b.gira(t * 7); this.b.flechas.update(t, 1);
      this.b.aire.update(t, ka, -1);
      this.b.position.set(.25, 1.25 + .28 * ku + Math.sin(t * 2.5) * .02, .5);
      this.fb.scale.setScalar(t > tla ? pop(t, tla, .35) : .001); this.fb.position.y = .95 - Math.sin(t * 5) * .03;
      this.fa.scale.setScalar(t > tot ? pop(t, tot, .35) : .001); this.fa.position.y = this.b.position.y + .45;
      this.es.update(ease(cl((t - tcu) / .5)));
      this.p.boca(t > tot ? 'feliz' : 'abierta'); this.p.head.rotation.z = this.p.head.r0 + (t > tla && t < tot ? .2 : 0) - (t > tot ? .2 : 0) * ku;
      c.ev('whoosh', .05, .4); if (t > tem) c.ev('whoosh', tem, .6); if (t > tla) c.ev('pop', tla, .3); if (t > tot) c.ev('ding', tot, .5); if (t > tcu) c.ev('whoosh', tcu, .4);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tla && t < tot) etiqueta('EL AIRE BAJA…', [.3, -.3, .9], lt - tla, 52, '#ffffff', true);
      if (t > tot) etiqueta('¡Y EL BALÓN SUBE!', [.2, -.3, .9], lt - tot, 52, '#ffd640', true);
      rotulo('El aire se va a un lado', '…y el balón al otro', lt - .05, RY);
    }
  });

  // ---------- 4 · Magnus: letrero, el físico alemán y la curva del beisbol (el protagonista poncha) ----------
  escena('magnus', {
    setup() { cancha();
      this.lt = PM.letrero([.15, 2.15, .5], 'EFECTO MAGNUS', { w: 1.9, h: .4, borde: AMARILLO });
      this.b = PM.balonGiro([.55, 1.15, .5], { r: .26 });
      this.f = PM.chibi([-.75, .02, .3], { ropa: 0x8a5a3a, pantalon: 0x3a3340, tenis: 0x2b2f4a, lentes: 0x2a1f2e, colPelo: 0xd8d2c8, boca: 'feliz', mira: 1, escala: .8 });
      this.pi = jugador([-1.0, .02, .3], { ropa: 0xffffff, pantalon: 0x9aa3b5, tenis: 0x2b2f4a, gorra: ROJO, escala: .7, mira: 1 });
      this.p = PM.chibi([1.0, .02, .3], { logo: true, gorra: 0x2b5bd6, boca: 'feliz', mira: -1, escala: .7 });
      this.bat = group([0, -.48, .06], this.p.brazos[0]); PM.pz(tubo([[0, 0], [-.05, .7]], .05, .1), 0xc98a4a, [0, 0, 0], this.bat, { tinta: .012, papel: .03 });
      const pts = PM.curvaBalon([-.72, .95], [-.1, 1.05], [.45, 1.0], [.72, .22]); this.es = PM.estela(pts, { z: .5, r: .022, paso: .07 });
      this.bb = PM.balonGiro([-.72, .95, .5], { r: .07, tipo: 'beis' }); },
    update(lt, c) {
      const t = tw(lt), tma = c.w('Magnus') - .15, tfi = c.w('físico') - .1, tas = c.w('así') - .15, tcu = c.w('curva') - .1, tbe = c.w('beisbol') - .1;
      const kA = t < tas ? 1 : Math.max(.001, 1 - ease(cl((t - tas) / .3))), kB = t < tas ? .001 : pop(t, tas + .15, .35);
      this.lt.scale.setScalar(pop(t, tma, .35) * kA); this.lt.columpia(t, .03);
      this.b.scale.setScalar(Math.max(.001, pop(t, 0, .3) * kA)); this.b.gira(t * 7); this.b.flechas.update(t, 1); this.b.aire.update(t, 1, -1);
      this.f.scale.set(.8 * pop(t, tfi, .35) * kA, .8 * pop(t, tfi, .35) * kA, .16); A.parpadea(this.f, t + .4, .7); habla(this.f, t);
      this.f.brazos[1].rotation.z = lerp(this.f.brazos[1].r0, 1.9, eout(cl((t - tfi - .3) / .3))) + Math.sin(t * 4) * .05;
      // parte B: lanzador y bateador
      [this.pi, this.p].forEach(g => g.scale.set(.7 * kB, .7 * kB, .14));
      A.parpadea(this.pi, t + 1.7, .2); A.parpadea(this.p, t + .9, 1.4); respira(this.pi, t, .02, 1);
      const tl = tas + .55, kl = eout(cl((t - tl) / .25));
      this.pi.brazos[1].rotation.z = t < tl ? lerp(this.pi.brazos[1].r0, 2.6, ease(cl((t - tas - .2) / .3))) : lerp(2.6, -.6, kl);
      const kv = ease(cl((t - tl - .1) / 1.1)); this.es.update(t > tl ? kv : 0); const [x, y] = this.es.en(kv);
      this.bb.position.set(x, y, .5); this.bb.gira(t * 12); this.bb.visible = t > tl && kv < 1; this.bb.flechas.update(t, .8);
      const ts = tbe - .15; this.p.brazos[0].rotation.z = t < ts ? -2.3 : lerp(-2.3, .6, eout(cl((t - ts) / .2)));
      this.p.boca(t > tbe + .1 ? 'abierta' : 'feliz'); if (t > tbe + .1) A.preocupa(this.p, .6);
      this.pi.boca(t > tbe + .1 ? 'abierta' : 'feliz');
      c.ev('whoosh', .05, .4); if (t > tma) c.ev('pop', tma, .4); if (t > tfi) c.ev('pop', tfi, .3); if (t > tas) c.ev('whoosh', tas, .5);
      if (t > tl) c.ev('whoosh', tl, .5); if (t > ts) c.ev('whoosh', ts, .4);
      cam([0, 1.2, 10.6], [0, 1.15, 0], 34);
      if (t > tfi + .3 && t < tas) etiqueta('FÍSICO ALEMÁN', [-.7, -.3, .9], lt - tfi - .3, 48, '#ffffff', true);
      if (t > tcu) etiqueta('¡CURVA!', [0, 2.4, .9], lt - tcu, 58, '#ffd640', true);
      rotulo(t < tas ? 'Efecto Magnus' : 'Igual que la curva', t < tas ? 'por un físico alemán' : 'del beisbol', lt - (t < tas ? .05 : tas), RY);
    }
  });

  // ---------- 5 · Roberto Carlos (jugador genérico de amarillo): tiro libre de lejos que parece irse fuera… ¡y se mete! ----------
  escena('roberto', {
    setup() { cancha();
      this.po = porteria([.55, .02, -.3], .64, .52);
      this.pt = jugador([.55, .02, -.15], { ropa: 0x2b2f4a, pantalon: 0x2b2f4a, tenis: AMARILLO, escala: .42, mira: -1, colPelo: 0x2a1a12 });
      this.pt.brazos.forEach(a => a.r0 *= 2);
      this.j = jugador([-1.12, .02, .3], { ropa: 0xffd23d, pantalon: 0x2b5bd6, tenis: 0xffffff, piel: 0xb07a52, colPelo: 0x1a120c, escala: .52, mira: 1 });
      const pts = PM.curvaBalon([-.86, .08], [-.15, 1.65], [2.4, 1.85], [.55, .28]); this.es = PM.estela(pts, { z: .5, r: .022, paso: .075 });
      this.b = PM.balonGiro([-.86, .08, .5], { r: .07 });
      this.di = group([0, 0, .4]); for (let i = 0; i < 12; i++) PM.det(F.rect(.08, .02, .01), 0xffffff, [lerp(-.82, .5, i / 11), -.18, 0], this.di); },
    update(lt, c) {
      const t = tw(lt), tmi = c.w('mil') - .1, tme = c.w('treinta') - .1, tpa = c.w('parecía') - .1, tfu = c.w('fuera') - .1, tmt = c.w('metió') - .2, tk = tpa - .25;
      A.parpadea(this.j, t + 1.3, .2); A.parpadea(this.pt, t + .6, 1.5); respira(this.pt, t, .02, .5);
      // carrerita: se aleja y luego corre hacia el balón
      const xr = t < tme - .6 ? lerp(-1.12, -1.3, ease(cl((t - .3) / .8))) : lerp(-1.3, -1.06, ease(cl((t - (tk - .55)) / .55)));
      this.j.position.x = xr; A.anda(this.j, t, (t > .3 && t < 1.1) || (t > tk - .55 && t < tk) ? 1 : 0);
      if (t > tk - .1) patea(this.j, t, tk);
      this.j.boca(t > tmt ? 'abierta' : 'feliz');
      const kv = ease(cl((t - tk) / (tmt - tk + .05)) * .98 + .0); this.es.update(t > tk ? kv : 0); const [x, y] = this.es.en(t > tk ? kv : 0);
      this.b.position.set(x, y, .5); this.b.gira(t > tk ? (t - tk) * 10 : 0); this.b.scale.setScalar(t > tk ? 1 : 1);
      // portero: tranquilo mirando que se va fuera; cuando se mete, ¡sorpresa!
      this.pt.position.x = .55 + (t > tfu && t < tmt ? Math.sin((t - tfu) * 3) * .02 : 0);
      this.pt.boca(t > tmt ? 'abierta' : 'feliz'); A.preocupa(this.pt, t > tmt ? .8 : 0); if (t > tmt) A.tiembla(this.pt, t, .6, .55);
      this.pt.head.rotation.z = this.pt.head.r0 + (t > tfu && t < tmt ? -.25 : 0); this.pt.boca(t > tmt ? 'abierta' : 'feliz');
      this.di.visible = t > tme && t < tk; this.di.scale.x = ease(cl((t - tme) / .5)) + .001;
      c.ev('whoosh', .05, .4); if (t > tmi) c.ev('pop', tmi, .3); if (t > tme) c.ev('ding', tme, .4); if (t > tk) c.ev('impact', tk, .4); if (t > tk + .1) c.ev('whoosh', tk + .1, .8);
      if (t > tmt) c.ev('ding', tmt, .6);
      cam([0, 1.2, lerp(11.5, 11.1, ease(lt / 8))], [0, 1.15, 0], 34);
      if (t > tmi && t < tme) etiqueta('TIRO LIBRE · 1997', [0, 2.45, .9], lt - tmi, 46, '#ffffff', true);
      if (t > tme && t < tfu) etiqueta('¡35 METROS!', [0, 2.45, .9], lt - tme, 52, '#ffffff', true);
      if (t > tfu && t < tmt) etiqueta('¿SE VA FUERA…?', [-.2, 2.45, .9], lt - tfu, 50, '#ffffff', true);
      if (t > tmt) etiqueta('¡GOOOL!', [0, 2.4, .9], lt - tmt, 64, '#ffd640', true);
      rotulo('El tiro libre de 1997', t < tpa ? 'a unos 35 metros' : '¡parecía irse fuera!', lt - .05, RY);
    }
  });

  // ---------- 6 · caracol: al frenarse, la curva se cierra cada vez más (espiral) ----------
  escena('caracol', {
    setup() { cancha();
      const C = [.3, 1.35], pts = []; for (let i = 0; i <= 120; i++) { const th = i / 120 * Math.PI * 3.1, r = 1.15 * Math.exp(-.28 * th); pts.push([C[0] - Math.cos(th) * r, C[1] - Math.sin(th) * r * .85]); }
      this.es = PM.estela(pts, { z: .5, r: .026, paso: .07 }); this.b = PM.balonGiro([pts[0][0], pts[0][1], .55], { r: .11 });
      // caracol de cartulina con concha en espiral
      const s = this.ca = group([-.75, .05, .4]); const esp = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 4.2, rr = .26 - i / 40 * .22; esp.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
      PM.pz(tubo([[-.4, .05], [-.1, .02], [.32, .04], [.42, .14]], .16, .12), 0xb8e07a, [0, 0, 0], s, { tinta: .014, papel: .05 });
      this.cuello = group([.38, .14, .02], s);
      for (const dx of [-.06, .06]) { PM.det(tubo([[dx, 0], [dx * 1.6, .26]], .03, .025), 0xb8e07a, [0, 0, 0], this.cuello); }
      s.head = { ojos: [-.06, .06].map(dx => { const e = PM.pz(F.elipse(.035, .05), 0x2a1f2e, [dx * 1.6, .28, .02], this.cuello, { tinta: .008, papel: .02 }); PM.det(F.circ(.012), 0xffffff, [.01, .015, .016], e); return e; }) };
      PM.det(F.arco(.035, .012, Math.PI * 1.15, Math.PI * 1.85), 0x7a1f30, [.05, .06, .02], this.cuello);
      PM.pz(F.circ(.27), 0xff9a5c, [-.05, .3, .03], s, { tinta: .014, papel: .05 }); PM.det(tubo(esp, .035, .035), 0xc9653a, [-.05, .3, .05], s);
      this.ca.scale.setScalar(.001);
      this.p = PM.chibi([1.12, .02, .3], { logo: true, boca: 'abierta', mira: -1, escala: .6 }); },
    update(lt, c) {
      const t = tw(lt), tfr = c.w('frenarse') - .15, tma = c.w('más') - .1, tca = c.w('caracol') - .15;
      const k = eout(cl(t / 4.4)); this.es.update(k); const [x, y] = this.es.en(k); this.b.position.set(x, y, .55); this.b.gira(t * 8);
      this.b.flechas.update(t, .6);
      this.ca.scale.setScalar(pop(t, tca, .4) * 1.35); this.ca.position.x = -.75 + (t > tca ? (t - tca) * .05 : 0); A.parpadea(this.ca, t, .8);
      this.cuello.rotation.z = Math.sin(t * 3) * .08;
      A.parpadea(this.p, t + 1.9, .5); respira(this.p, t); this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 2.2) * .12;
      this.p.boca(t > tca ? 'feliz' : 'abierta'); A.preocupa(this.p, t > tma && t < tca ? .5 : 0);
      c.ev('whoosh', .05, .6); if (t > tfr) c.ev('pop', tfr, .3); if (t > tma) c.ev('ding', tma, .4); if (t > tca) c.ev('pop', tca, .5);
      cam([0, 1.2, 10.6], [0, 1.15, 0], 34);
      if (t < tfr) etiqueta('FÍSICOS EN FRANCIA', [0, 2.45, .9], lt, 44, '#ffffff', true);
      if (t > tfr && t < tma) etiqueta('SE FRENA…', [0, 2.45, .9], lt - tfr, 52, '#ffffff', true);
      if (t > tma && t < tca) etiqueta('¡SE CIERRA MÁS!', [0, 2.45, .9], lt - tma, 52, '#ffd640', true);
      if (t > tca) etiqueta('¡COMO CARACOL!', [0, 2.45, .9], lt - tca, 52, '#ffd640', true);
      rotulo('Al frenarse se curva', 'cada vez más', lt - .05, RY);
    }
  });

  // ---------- 7 · sin giro: el balón baila con remolinos y el portero se marea ----------
  escena('sinGiro', {
    setup() { cancha();
      this.po = porteria([.75, .02, -.3], .9, .7);
      this.pt = jugador([.75, .02, -.15], { ropa: 0x2b2f4a, pantalon: 0x2b2f4a, tenis: AMARILLO, escala: .58, mira: -1, colPelo: 0x2a1a12 });
      this.pt.brazos.forEach(a => a.r0 *= 2.2);
      this.b = PM.balonGiro([-1.2, 1.0, .5], { r: .14 });
      this.ma = PM.mareo([.75, 1.6, .2], .7); },
    update(lt, c) {
      const t = tw(lt), tgi = c.w('giro') - .1, tza = c.w('zarandea') - .15, tba = c.w('baila') - .1, tad = c.w('adivine') - .15;
      A.parpadea(this.pt, t + .4, .9);
      const u = cl((t - .2) / 3.9), x = lerp(-1.25, .55, u), y = 1.0 + (t > tza ? (Math.sin(t * 7) * .22 + Math.sin(t * 11.3) * .1) * Math.sin(u * Math.PI) : 0) - .45 * u * u;
      this.b.position.set(x, y, .5); this.b.gira(Math.sin(t * 2) * .2); this.b.remolinos.update(t, eout(cl((t - tza) / .4)));
      this.b.scale.setScalar(u >= 1 ? .85 : 1);
      // el portero se avienta de un lado al otro, siempre tarde
      const lado = Math.sin(t * 5.5 + 1.2); this.pt.position.x = .75 + (t > tba ? lado * .16 : 0); this.pt.rotation.z = t > tba ? -lado * .15 : 0;
      this.pt.boca(t > tad ? 'abierta' : 'feliz'); A.preocupa(this.pt, t > tba ? .7 : 0);
      this.ma.update(t, t > tad ? eout(cl((t - tad) / .3)) : 0); this.ma.position.x = this.pt.position.x; this.ma.position.y = 1.32;
      c.ev('whoosh', .05, .4); if (t > tgi) c.ev('pop', tgi, .3); if (t > tza) c.ev('whoosh', tza, .5); if (t > tba) c.ev('whoosh', tba, .4); if (t > tad) c.ev('ding', tad, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tgi && t < tba) etiqueta('SIN GIRO', [-.4, 2.45, .9], lt - tgi, 54, '#ffffff', true);
      if (t > tba) etiqueta('¡EL BALÓN BAILA!', [-.2, 2.45, .9], lt - tba, 52, '#ffd640', true);
      rotulo('¿Y sin giro?', 'el aire lo zarandea', lt - .05, RY);
    }
  });

  // ---------- 8 · remate: en la cascarita, el amigo que se cree crack; el protagonista manda el avioncito ----------
  escena('remate', {
    setup() { cancha();
      this.a = jugador([-.62, .02, .38], { ropa: ROJO, pantalon: 0xffffff, tenis: AMARILLO, colPelo: 0x2a1a12, escala: .85, mira: 1 });
      this.b = PM.balonGiro([-.45, .3, .6], { r: .13 });
      this.p = PM.chibi([.72, .02, .3], { logo: true, boca: 'feliz', mira: -1, escala: .85 });
      this.av = PM.avion([.72, 1.3, .9], .45); },
    update(lt, c) {
      const t = tw(lt), tma = c.w('Mándaselo') - .1, tcr = c.w('cree') - .1;
      A.parpadea(this.a, t + .6, .4); A.parpadea(this.p, t + 2.0, 1.6); respira(this.p, t);
      // dominadas: el balón sube y baja sobre la rodilla derecha
      const ph = (t * 1.6) % 1, hb = Math.sin(ph * Math.PI); this.b.position.set(-.12, .22 + hb * .5, .6); this.b.gira(t * 5);
      const l = this.a.piernas[1]; l.rotation.z = l.r0 + (ph < .12 || ph > .9 ? .7 : .1);
      this.a.brazos[0].rotation.z = this.a.brazos[0].r0 - .5; this.a.brazos[1].rotation.z = this.a.brazos[1].r0 + .5;
      this.a.boca(t > tcr ? 'abierta' : 'feliz'); if (t > tcr) A.ladea(this.a, .2, 1);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.3, eout(cl((t - tma) / .3))) - lerp(0, 1.2, ease(cl((t - tma - .4) / .3)));
      const kv = cl((t - tma - .45) / 1.4); this.av.visible = t > tma + .45 && kv < 1; this.av.position.set(lerp(.7, 1.75, ease(kv)), 1.35 + Math.sin(kv * Math.PI) * .9 + kv * .4, .9); this.av.rotation.z = .5 - kv * .3;
      for (let i = 0; i < 6; i++) if (t > i / 1.6 + .02) c.ev('pop', i / 1.6 + .02, .15);
      c.ev('whoosh', .05, .4); if (t > tma + .45) c.ev('whoosh', tma + .45, .5); if (t > tcr) c.ev('ding', tcr, .4);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.6))], [0, 1.15, 0], 34);
      if (t > tcr) etiqueta('¡SOY CRACK!', [-.55, 2.45, .9], lt - tcr, 50, '#ffd640', true);
      rotulo('Mándaselo al que se cree', 'crack en la cascarita', lt - .05, RY);
    }
  });
  P.cierre();
}
