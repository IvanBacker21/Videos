// Short 23-nov 13:30 · CARTULINA CHIBI: ¿por qué las luces de Navidad SIEMPRE salen enredadas?
// Raymer y Smith (UC San Diego, PNAS 2007): cuerdas en una caja que giraba se anudaban solas en segundos; entre más larga, más nudos.
// La punta se cuela entre las vueltas paralelas y cada sacudida la amarra. Truco: enrollarlas en un cartón y amarrar las puntas.
// Fuentes: PNAS/PMC2034230, Physics Today, NPR.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-23-1330-luces-enredadas.json OUT ../ejemplos/2026-11-23-1330-luces-enredadas.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600;
  const amb = c => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const sala = () => { amb(0xf6d7b8); PM.cuarto({ cortina: 0xd9534f }); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const lab = () => { amb(0xe3f1fb); PM.cuarto({ pared: 0xe3f1fb, piso: 0xaab6c8, sinVentana: true }); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const amigo = (pos, o = {}) => PM.chibi(pos, { ropa: 0xff8a3d, pantalon: 0x2b2f4a, tenis: 0xffc83d, colPelo: 0x1d1410, lentes: true, boca: 'feliz', ...o });
  const cientifica = (pos, o = {}) => PM.chibi(pos, { ropa: 0xf4f6fb, pantalon: 0x5a5f7a, tenis: 0x7b5cff, pelo: 'cola', colPelo: 0x7a4a2a, lentes: true, boca: 'feliz', ...o });

  // ---- piezas locales ----
  // pino de Navidad a medio adornar
  const pino = (pos, s = 1) => { const g = group(pos); g.scale.setScalar(s);
    PM.pz(F.rect(.22, .3, .02), 0x8a5a3a, [0, .15, -.05], g, { tinta: .014, papel: .04 });
    [[1.3, .3, .75], [1.05, .85, .62], [.78, 1.35, .5]].forEach(([w, y, h], i) => PM.pz(F.poly([[-w / 2, 0], [w / 2, 0], [0, h]]), i % 2 ? 0x2b9a5a : 0x2f8a52, [0, y, i * .01], g, { tinta: .016, papel: .05 }));
    PM.pz(F.estrella(5, .17, .08), 0xffd23d, [0, 1.88, .05], g, { tinta: .012, papel: .04 });
    [[-.3, .5, 0xff4b5c], [.25, .62, 0x3dd6ff], [-.12, 1.05, 0xffd23d]].forEach(([x, y, c]) => PM.pz(F.circ(.065), c, [x, y, .06], g, { tinta: .01, papel: .03 }));
    return g; };
  const mesita = (pos, w = .8, h = .72) => { const g = group(pos); PM.pz(F.rect(w, .1, .03), 0xc98f5e, [0, h - .05, 0], g, { tinta: .016, papel: .05 });
    for (const sx of [-1, 1]) PM.pz(F.rect(.08, h - .1, .02), 0xa8703f, [sx * (w / 2 - .1), (h - .1) / 2, -.02], g, { tinta: .014, papel: .04 }); return g; };
  // caja transparente que gira (marco azul y vidrio clarito)
  const cajaGira = (pos, a = .9) => { const g = group(pos);
    PM.pz(F.rect(a, a, .04), 0xeaf7ff, [0, 0, -.04], g, { tinta: false, papel: .05 });
    for (const [x, y, w, h] of [[0, a / 2, a + .06, .07], [0, -a / 2, a + .06, .07], [a / 2, 0, .07, a + .06], [-a / 2, 0, .07, a + .06]]) PM.pz(F.rect(w, h, .02), 0x3d7bff, [x, y, .06], g, { tinta: .012, papel: false });
    PM.det(F.rect(.05, a * .5, .01), 0xffffff, [-a * .3, a * .12, .07], g, .5); return g; };
  const base = (pos) => { const g = group(pos); PM.pz(F.rect(.18, .55, .02), 0x5a5f7a, [0, .28, -.1], g, { tinta: .014, papel: .04 });
    PM.pz(F.rect(.7, .12, .03), 0x3b3f55, [0, .06, -.08], g, { tinta: .014, papel: .04 }); PM.pz(F.circ(.09), 0xffc83d, [0, .58, .1], g, { tinta: .012, papel: .03 }); return g; };
  // flecha gruesa
  const flecha = (pos, s = 1, col = 0xffd23d) => { const g = group(pos); g.scale.setScalar(s);
    PM.pz(F.poly([[-.1, .32], [.1, .32], [.1, .02], [.22, .02], [0, -.28], [-.22, .02], [-.1, .02]]), col, [0, 0, 0], g, { tinta: .016, papel: .05 }); return g; };

  // ---------- 1 · gancho: saca de la caja una bola de luces toda enredada ----------
  escena('gancho', {
    setup() { sala();
      this.pi = pino([.95, .02, -.9], 1.05);
      this.p = PM.chibi([-.78, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .8 });
      this.bo = PM.serieLuces([-.1, .95, .42], { modo: 'bola', r: .32, enchufe: true });
      this.cj = PM.caja([-.12, .3, .6], .9, .6, 0xc98f5e, null, { color2: 0xe8c48a });
      this.q = PM.pregunta([-1.2, 2.1, .6], .8); this.q.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), tl = c.w('luces') - .1, ts = c.w('SIEMPRE') - .1, te = c.w('enredadas?') - .1;
      A.parpadea(this.p, t + 1.1, .4); respira(this.p, t);
      // la bola sale de la caja de un jalón y él la sacude, desesperado
      const ks = eout(cl((t + .15) / .55)), sac = t > ts ? Math.sin(t * 18) * .035 : 0;
      this.bo.position.set(-.1 + sac, lerp(.55, 1.05, ks), .42); this.bo.rotation.z = sac * 2; this.bo.update(t);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + lerp(.5, 1.25, ks) + sac * 4; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - (t > ts ? .9 + Math.sin(t * 9) * .2 : .15);
      this.p.boca(t < ts ? 'abierta' : 'apretada'); A.preocupa(this.p, ease(cl((t - ts) / .25)));
      if (t > ts) this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 9) * .06; else habla(this.p, t);
      this.q.scale.setScalar(.8 * pop(t, te, .35)); this.q.rotation.z = Math.sin(t * 5) * .12;
      c.ev('whoosh', .02, .5); if (t > tl) c.ev('pop', tl, .5); if (t > ts) c.ev('zap', ts, .5); if (t > te) c.ev('ding', te, .5);
      cam([0, 1.2, lerp(10.8, 10.4, ease(lt / 3))], [0, 1.15, 0], 34);
      if (t > ts) etiqueta('¡OTRA VEZ!', [.2, 2.5, .9], lt - ts, 56, '#ffd640', true);
      rotulo('¿Por qué las luces', 'SIEMPRE se enredan?', lt - .05, RY);
    }
  });

  // ---------- 2 · caja: unos físicos meten una cuerda en una caja que gira ----------
  escena('caja', {
    setup() { lab();
      this.b = base([.2, 0, -.2]);
      this.cg = cajaGira([.2, 1.18, .2], .9);
      this.cu = PM.serieLuces([0, .8, .05], { modo: 'recta', focos: false, largo: .66, fase: 1 }, this.cg);
      this.ci = cientifica([1.18, .02, .3], { escala: .68, mira: -1 });
      this.p = PM.chibi([-1.0, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .68 }); },
    update(lt, c) {
      const t = tw(lt), tf = c.w('físicos') - .1, tm = c.w('metieron') - .1, tc = c.w('caja') - .15, tg = c.w('giraba.') - .1;
      A.parpadea(this.p, t + .3, 1.3); A.parpadea(this.ci, t + 2.2, .5); respira(this.p, t); respira(this.ci, t, .02, 1.3); habla(this.p, t);
      // la cuerda cae dentro de la caja; luego la caja empieza a girar cada vez más rápido
      const kc = ease(cl((t - tm) / .5)); this.cu.position.y = lerp(.85, 0, kc); this.cu.rotation.z = Math.sin(t * 3) * .1 * (1 - kc) + .25 * kc;
      const w = t < tc ? 0 : Math.min(1, (t - tc) / .6), ang = t < tc ? 0 : (t - tc) * (t - tc) * 3.2 * (t - tc < .6 ? 1 : 1) ;
      this.cg.rotation.z = -Math.min(ang, 1e3); this.cu.position.x = Math.sin(t * 13) * .05 * w; this.cu.rotation.z += Math.sin(t * 9) * .4 * w;
      // la científica suelta la cuerda y luego le da vuelta a la manivela
      const bc = this.ci.brazos[1]; bc.rotation.z = bc.r0 + lerp(1.5, .5, ease(cl((t - tm - .3) / .4))) * (t < tc ? 1 : 0) + (t > tc ? .9 + Math.sin(t * 12) * .35 : 0);
      this.ci.boca(t > tg ? 'abierta' : 'feliz');
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.35 * eout(cl((t - tf) / .3)) + Math.sin(t * 4) * .05;
      this.p.boca(t > tg ? 'feliz' : 'abierta');
      c.ev('whoosh', .05, .4); if (t > tm) c.ev('pop', tm + .4, .5); if (t > tc) c.ev('whoosh', tc, .5); if (t > tg) c.ev('zap', tg, .5);
      cam([0, 1.25, 10.4], [0, 1.2, 0], 34);
      if (t > tf && t < tg) etiqueta('FÍSICOS DE CALIFORNIA', [0, 2.55, .9], lt - tf, 38, '#ffffff', true);
      if (t > tg) etiqueta('¡A GIRAR!', [0, 2.55, .9], lt - tg, 56, '#ffd640', true);
      rotulo('Metieron una cuerda en', 'una caja que giraba', lt - .05, RY);
    }
  });

  // ---------- 3 · nudos: la caja se detiene y la cuerda sale anudada; entre más larga, más nudos ----------
  escena('nudos', {
    setup() { lab();
      this.lab = group([0, 0, 0]);
      this.b = base([.2, 0, -.2]); this.lab.add(this.b);
      this.cg = cajaGira([.2, 1.18, .2], .9); this.lab.add(this.cg);
      this.c0 = PM.serieLuces([0, 0, .05], { modo: 'recta', focos: false, largo: .66, fase: 1 }, this.cg);
      this.c1 = PM.serieLuces([0, -.05, .05], { modo: 'recta', focos: false, largo: .66, fase: 1, nudos: [.3, .72], rNudo: .08 }, this.cg); this.c1.visible = false;
      this.cs = [[.5, [], 2.25], [1.1, [.5], 1.85], [1.8, [.2, .5, .8], 1.42]].map(([L, nd, y]) => { const s = PM.serieLuces([0, y, .5], { modo: 'recta', focos: false, largo: L, nudos: nd, rNudo: .11, grosor: .05, fase: L * 2 }); s.scale.setScalar(.001); return s; });
      this.ci = cientifica([1.18, .02, .3], { escala: .62, mira: -1 });
      this.p = PM.chibi([-1.15, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .62 }); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('anudaban') - .1, ty = c.w('y') - .05, tl = c.w('larga') - .1, tcu = c.w('cuerda,') - .1, tn = c.w('nudos.') - .1;
      A.parpadea(this.p, t + 2.4, .7); A.parpadea(this.ci, t + .9, 1.7); respira(this.p, t); respira(this.ci, t, .02, 1.3);
      // sigue girando y frena; la cuerda ya sale con nudos
      const v = 6 * (1 - ease(cl(t / (ta + .2)))); this.ang = (this.ang ?? 0); if (lt < .02) this.ang = 0;
      this.cg.rotation.z = -(1.25 + 6 * (t - .5 * t * t / (ta + .2)) * (t < ta + .2 ? 1 : 0) + (t >= ta + .2 ? 6 * (ta + .2) / 2 : 0)) % (Math.PI * 2);
      const sw = t > ta - .35; this.c0.visible = !sw; this.c1.visible = sw;
      this.c1.nudos.forEach((n, i) => n.scale.setScalar(pop(t, ta + i * .25, .3)));
      // el laboratorio se hace chiquito y aparecen tres cuerdas: corta, mediana y larga
      const kv = 1 - ease(cl((t - ty) / .3)); this.lab.scale.setScalar(Math.max(.001, kv));
      [ty + .35, tcu, tn].forEach((t0, i) => { const s = this.cs[i]; s.scale.setScalar(pop(t, t0 - .15, .35)); s.nudos.forEach((n, j) => n.scale.setScalar(pop(t, t0 + .1 + j * .12, .3))); });
      this.p.boca(t > tn ? 'feliz' : 'abierta'); A.preocupa(this.p, t > ta && t < ty ? .4 : 0); habla(this.p, t);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.2 * eout(cl((t - ta) / .3)) + Math.sin(t * 4) * .05;
      this.ci.brazos[0].rotation.z = this.ci.brazos[0].r0 - 1.3 * eout(cl((t - tl) / .3)) - Math.sin(t * 4) * .05; this.ci.boca(t > ta ? 'feliz' : 'abierta');
      c.ev('whoosh', .05, .4); if (t > ta) c.ev('pop', ta, .5); if (t > ta + .25) c.ev('pop', ta + .25, .5); if (t > ty) c.ev('whoosh', ty, .5);
      if (t > tl) c.ev('pop', tl - .1, .5); if (t > tcu) c.ev('pop', tcu - .1, .5); if (t > tn) c.ev('ding', tn, .6);
      cam([0, 1.25, 10.4], [0, 1.2, 0], 34);
      if (t > ta && t < ty + .2) etiqueta('¡SE ANUDAN SOLITAS!', [0, 2.55, .9], lt - ta, 42, '#ffd640', true);
      if (t > tn) etiqueta('+ LARGA = + NUDOS', [0, 2.6, .9], lt - tn, 42, '#ffd640', true);
      rotulo(t < ty ? 'En segundos se' : 'Entre más larga,', t < ty ? 'anudaban solitas' : 'más nudos', lt - .05, RY);
    }
  });

  // ---------- 4 · punta: zoom a las vueltas; con la sacudida la punta se cuela entre ellas y ¡nudo! ----------
  escena('punta', {
    setup() { lab();
      const pts = []; for (let i = 0; i <= 160; i++) { const th = i / 160 * Math.PI * 8; pts.push([-.4 + .18 * th / (Math.PI * 2) + .1 * Math.sin(th), -.3 * Math.cos(th), Math.sin(th) > 0 ? .03 : -.03]); }
      this.g = group([.12, 1.4, .4]); this.g.scale.setScalar(1.8);
      this.co = PM.serieLuces([0, 0, 0], { pts, paso: .1 }, this.g);
      const e = pts[pts.length - 1], q = [[e[0], e[1], 0], [e[0] + .08, e[1] - .06, .03], [.5, -.24, .04], [.53, -.08, .05], [.47, .03, .06]];
      for (let x = .42; x >= -.5; x -= .035) q.push([x, .03 + Math.sin(x * 14) * .025, Math.floor((x + .7) / .09) % 2 ? .09 : -.09]);
      this.pu = PM.serieLuces([0, 0, 0], { pts: q, paso: .1, enchufe: true }, this.g);
      this.nu = group([-.4, .03, .12], this.g); PM.pz(F.estrella(9, .17, .09), 0xffd23d, [0, 0, 0], this.nu, { tinta: .012, papel: .03 }); PM.pz(F.circ(.065), 0x1e5a22, [0, 0, .01], this.nu, { tinta: .012, papel: .02 }); this.nu.scale.setScalar(.001);
      this.f = flecha([0, 0, .9], .55);
      this.p = PM.chibi([-1.17, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .55 }); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('sacudida,') - .1, tp = c.w('punta') - .1, tc = c.w('cuela') - .1, tv = c.w('vueltas') - .1, ta = c.w('amarra.') - .1;
      A.parpadea(this.p, t + .9, 2.0); respira(this.p, t);
      // sacudida: todo el rollo tiembla
      const sh = (t > ts && t < ts + .55) || (t > ta && t < ta + .3) ? 1 : 0;
      this.g.position.x = .12 + Math.sin(t * 40) * .05 * sh; this.g.rotation.z = Math.sin(t * 33) * .04 * sh;
      // la punta (con su clavija) avanza tejiéndose entre las vueltas
      const kr = lerp(.18, 1, ease(cl((t - tc) / (ta - tc)))); this.pu.revela(kr);
      this.co.update(t); this.pu.update(t);
      this.nu.scale.setScalar(pop(t, ta, .3));
      // flechita amarilla encima de la clavija
      const e = this.pu.en(kr), wx = this.g.position.x + e[0] * 1.8, wy = 1.4 + e[1] * 1.8;
      this.f.position.set(wx, wy + .52 + Math.abs(Math.sin(t * 6)) * .06, .9); this.f.scale.setScalar(.55 * pop(t, tp, .3) * (t < ta ? 1 : Math.max(.001, 1 - cl((t - ta) / .2))));
      this.p.boca(t < ta ? 'abierta' : 'apretada'); A.preocupa(this.p, ease(cl((t - ta) / .2))); if (t < ta) habla(this.p, t);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.3 * eout(cl((t - tp) / .3)) + Math.sin(t * 4) * .05;
      c.ev('whoosh', .05, .4); if (t > ts) c.ev('zap', ts, .5); if (t > tp) c.ev('pop', tp, .5); if (t > tc) c.ev('whoosh', tc, .5); if (t > ta) c.ev('impact', ta, .8);
      cam([0, 1.25, 10.4], [0, 1.2, 0], 34);
      if (t > tp && t < ta) etiqueta(t < tc ? '¡LA PUNTA!' : 'SE CUELA…', [0, 2.6, .9], lt - (t < tc ? tp : tc), 46, '#ffffff', true);
      if (t > ta) etiqueta('¡NUDO!', [0, 2.55, .9], lt - ta, 64, '#ffd640', true);
      rotulo('La punta se cuela', 'y se amarra sola', lt - .05, RY);
    }
  });

  // ---------- 5 · remate: truco del cartón… y llega el amigo con su bola de luces ----------
  escena('remate', {
    setup() { sala();
      this.pi = pino([1.15, .02, -.9], 1.05);
      this.p = PM.chibi([-.85, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .8 });
      this.ca = PM.serieLuces([.02, .92, .55], { modo: 'carton', w: .8, h: .56, vueltas: 5, paso: .12 }); this.ca.revela(0);
      this.ok = PM.marca([.48, 1.36, .7], true, .7); this.ok.scale.setScalar(.001);
      this.a = amigo([2.5, .02, .35], { escala: .76, mira: -1, boca: 'abierta' });
      this.bo = PM.serieLuces([2.5, .62, .5], { modo: 'bola', r: .27, fase: 2.1, enchufe: true }); },
    update(lt, c) {
      const t = tw(lt), te = c.w('enróllalas') - .1, tct = c.w('cartón'), tam = c.w('amarra') - .1, tpu = c.w('puntas.') - .1, tma = c.w('Mándaselo') - .1, tde = c.w('desenreda') - .1;
      A.parpadea(this.p, t + 2.0, 1.6); A.parpadea(this.a, t + .6, .4); respira(this.p, t); respira(this.a, t, .02, 1.1);
      // se enrolla en el cartón, se amarran las puntas y palomita
      this.ca.revela(lerp(0, 1, cl((t - te) / (tam - te)))); this.ca.amarra(pop(t, tam, .3)); this.ca.update(t);
      this.ok.scale.setScalar(.7 * pop(t, tpu, .35));
      // el chibi sostiene el cartón y luego se lo ofrece al amigo
      const ko = ease(cl((t - tde) / .5)); this.ca.position.x = lerp(.02, .14, ko);
      for (const [i, b] of this.p.brazos.entries()) b.rotation.z = b.r0 + (i ? 1 : -1) * (1.2 + (i ? .25 : 0) * ko) + Math.sin(t * 4 + i) * .04;
      if (t < tma) habla(this.p, t); this.p.boca(t > tde ? 'feliz' : 'abierta');
      // entra el amigo peleándose con su bola de luces
      const ke = ease(cl((t - tma) / .7)), xa = lerp(2.5, .95, ke), sac = Math.sin(t * 16) * .04;
      this.a.position.x = xa; this.a.position.y = .02 + (ke < 1 && ke > 0 ? Math.abs(Math.sin(t * 10)) * .05 : 0);
      this.bo.position.set(xa - .05 + sac, .62 + Math.abs(sac), .5); this.bo.rotation.z = sac * 3; this.bo.update(t);
      for (const [i, b] of this.a.brazos.entries()) b.rotation.z = b.r0 + (i ? 1 : -1) * (.75 + sac * 5);
      A.preocupa(this.a, 1); this.a.boca(t > tde + .6 ? 'feliz' : 'apretada'); this.a.head.rotation.z = this.a.head.r0 + Math.sin(t * 8) * .06;
      c.ev('whoosh', .05, .4); if (t > te) c.ev('whoosh', te, .5); if (t > tam) c.ev('pop', tam, .5); if (t > tpu) c.ev('ding', tpu, .6); if (t > tma) c.ev('whoosh', tma, .5); if (t > tde) c.ev('pop', tde, .5);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 6))], [0, 1.15, 0], 34);
      if (t < tam) etiqueta('¡TRUCO!', [0, 2.55, .9], lt, 60, '#ffd640', true);
      else if (t < tma) etiqueta('¡AMARRA LAS PUNTAS!', [0, 2.55, .9], lt - tam, 42, '#ffffff', true);
      else etiqueta('¡CADA DICIEMBRE!', [0, 2.55, .9], lt - tma, 46, '#ffd640', true);
      rotulo(t < tma ? 'Truco: enróllalas' : 'Mándaselo al que las', t < tma ? 'en un cartón' : 'desenreda cada diciembre', lt - .05, RY);
    }
  });
  P.cierre();
}
