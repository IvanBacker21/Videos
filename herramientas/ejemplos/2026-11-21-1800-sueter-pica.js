// Short 21-nov 18:00 · CARTULINA CHIBI: ¿por qué el suéter de lana te pica?
// Casi nunca es alergia (la lana no se considera alérgeno: Zallmann et al., Acta Derm Venereol 2017); la comezón la causan las fibras
// gruesas (más de ~30 micras) cuyas puntas no se doblan y presionan la piel activando los nervios. Truco: merino (fibra fina) o playera debajo.
// Fuentes: PubMed (Debunking the Myth of Wool Allergy), Woolmark (Are you allergic to wool?).
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-21-1800-sueter-pica.json OUT ../ejemplos/2026-11-21-1800-sueter-pica.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw, tubo } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, LANA = 0xd9534f, MERINO = 0x2ec4a6, PIEL = 0xe8b48c, ROJO = 0xff5b5b;
  const amb = c => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const sala = (o = {}) => { amb(0xd6e4f0); const s = PM.cuarto({ pared: 0xd6e4f0, cortina: 0x7b5cff, ...o }); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); return s; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const abuelita = (pos, es = .8) => PM.chibi(pos, { pelo: 'chongo', colPelo: 0xc9c9d4, ropa: 0x7b5cff, falda: 0xff8a3d, lentes: true, boca: 'feliz', mira: 1, escala: es });
  // rascarse: brazo derecho detrás de la oreja, el izquierdo frota la cadera, el cuerpo se retuerce
  const rasca = (p, t, k = 1) => { const [bi, bd] = p.brazos;
    bd.rotation.z = lerp(bd.r0, 2.55 + Math.sin(t * 22) * .22, k); bi.rotation.z = lerp(bi.r0, -.35 + Math.sin(t * 19) * .18, k);
    p.rotation.z = Math.sin(t * 9) * .04 * k; };

  // ---- piezas locales ----
  // fibra de lana gruesa y ondulada (para la lupa)
  const fibraGruesa = (pts, parent, col = 0xf08a7e, w = .075) => { const g = group([0, 0, 0], parent);
    PM.pz(tubo(pts, w, w * .8), col, [0, 0, 0], g, { tinta: .012, papel: false });
    const [x, y] = pts[pts.length - 1]; PM.det(F.circ(w * .32), 0x8a2b2b, [x, y, .012], g); return g; };
  // fibra recta (grosor w, largo L, punta abajo en y = -L); rígida
  const aguja = (pos, L, w, col, parent = null) => { const g = group(pos, parent);
    PM.pz(tubo([[0, 0], [.01, -L * .5], [0, -L]], w, w * .7), col, [0, 0, 0], g, { tinta: .014, papel: .04 }); return g; };
  // fibra fina en 3 tramos que se dobla con g.dobla(k)
  const fibraFina = (pos, L, col, parent = null) => { const g = group(pos, parent), n = 3, l = L / n; let pa = g; const ts = [];
    for (let i = 0; i < n; i++) { const s = group(i ? [0, -l, 0] : [0, 0, 0], pa); PM.pz(tubo([[0, .01], [0, -l]], .04, .036), col, [0, 0, 0], s, { tinta: .01, papel: .03 }); ts.push(s); pa = s; }
    g.dobla = k => ts.forEach((s, i) => s.rotation.z = i ? k * .75 : 0); return g; };
  // chispitas de nervio (estrellitas amarillas)
  const chispas = (pos, parent = null) => { const g = group(pos, parent);
    g.es = [[-.16, .06], [.17, .1], [0, .2], [-.1, -.08], [.12, -.06]].map(([x, y]) => { const e = group([x, y, .05], g); PM.pz(F.estrella(4, .07, .025), 0xffd640, [0, 0, 0], e, { tinta: .008, papel: false }); return e; });
    g.update = (t, on) => g.es.forEach((e, i) => { const f = (Math.sin(t * 25 + i * 2) + 1) / 2; e.scale.setScalar(Math.max(.001, on * (.5 + .7 * f))); e.rotation.z = t * 4 + i; }); g.update(0, 0); return g; };
  // estambre y agujas de tejer (en la mano de la abuelita)
  const tejido = (parent) => { const g = group([0, -.5, .08], parent);
    PM.pz(F.rect(.26, .2, .02), LANA, [0, -.12, 0], g, { tinta: .012, papel: .04 });
    for (const y of [-.06, -.14]) for (const x of [-.07, 0, .07]) PM.det(tubo([[x - .02, y + .015], [x, y - .01], [x + .02, y + .015]], .01, .01), 0xa83a37, [0, 0, .014], g);
    g.ag = [-1, 1].map(sx => { const a = group([sx * .05, 0, .03], g); PM.pz(tubo([[0, -.05], [0, .3]], .025, .025), 0xc9ced8, [0, 0, 0], a, { tinta: .008, papel: false });
      PM.pz(F.circ(.035), 0xffc83d, [0, .31, .004], a, { tinta: .008, papel: false }); a.rotation.z = -sx * .45; return a; });
    g.teje = t => g.ag.forEach((a, i) => a.rotation.z = (i ? -1 : 1) * (.45 + Math.sin(t * 14 + i * Math.PI) * .2)); return g; };
  // bolita de estambre en el piso
  const bola = (pos) => { const g = group(pos); PM.pz(F.circ(.17), LANA, [0, 0, 0], g, { tinta: .014, papel: .05 });
    for (const a of [.3, 1.2, 2.2]) PM.det(F.arco(.12, .018, a, a + 1.6), 0xa83a37, [0, 0, .014], g); return g; };

  // ---------- 1 · gancho: chibi con suéter de lana de la abuela, rascándose; ¿por qué pica? ----------
  escena('gancho', {
    setup() { this.s = sala();
      this.p = PM.chibi([0, .02, .3], { logo: true, boca: 'apretada', escala: .86 });
      this.su = PM.sueter(this.p, LANA);
      this.z = PM.zumbido([0, .85, .1], { color: ROJO, r: .5, alto: .4 }, this.p);
      this.q = PM.pregunta([.85, 1.95, .6], .85); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('suéter') - .1, tl = c.w('lana') - .05, tp = c.w('pica') - .05, tt = c.w('tanto') - .05;
      A.parpadea(this.p, t + .2, .9); this.s.update(t);
      const kr = ease(cl((t - .15) / .3)); rasca(this.p, t, kr); this.p.position.y = .02 + Math.abs(Math.sin(t * 9)) * .03 * kr;
      this.su.pelusa(t, t > tl ? ease(cl((t - tl) / .3)) : .45); this.z.update(t, t > tp ? 1 : 0);
      A.preocupa(this.p, kr); this.p.boca(t > tp && t < tp + .5 ? 'abierta' : 'apretada');
      this.q.scale.setScalar(pop(t, tt, .35) * .85); this.q.rotation.z = Math.sin(t * 5) * .1;
      c.ev('whoosh', .05, .4); if (t > tl) c.ev('pop', tl, .4); if (t > tp) c.ev('ding', tp, .4); if (t > tt) c.ev('pop', tt, .4);
      cam([0, 1.2, lerp(10.8, 10.3, ease(lt / 2.8))], [0, 1.15, 0], 34);
      if (t > tp) etiqueta('¡PICA, PICA!', [0, 2.5, .9], lt - tp, 50, '#ffd640', true);
      rotulo('¿Por qué el suéter de', 'lana te pica tanto?', lt - .05, RY);
    }
  });

  // ---------- 2 · mito: letrero ALERGIA tachado; la lupa muestra pelitos gruesos ----------
  escena('mito', {
    setup() { this.s = sala({ cuadro: [6, 1.7, -2.6] });
      this.p = PM.chibi([-.88, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .78 });
      this.su = PM.sueter(this.p, LANA);
      this.le = PM.letrero([.52, 1.98, .5], 'ALERGIA', { w: 1.3, h: .42, borde: 0x7b5cff });
      this.ta = group([.52, 1.98, .62]); PM.pz(tubo([[-.6, -.16], [.6, .16]], .07, .07), ROJO, [0, 0, 0], this.ta, { tinta: .012, papel: .04 });
      this.x = PM.marca([1.15, 2.2, .7], false, .62);
      this.lu = PM.lupa([.5, .82, .55], .6, { fondo: 0xfff1e0 });
      this.fi = [[[-.5, .22], [-.2, .32], [.1, .18], [.46, .3]], [[-.52, -.05], [-.2, .06], [.15, -.08], [.52, .04]], [[-.44, -.3], [-.1, -.22], [.2, -.34], [.42, -.26]]]
        .map((pts, i) => fibraGruesa(pts, this.lu.dentro, i === 1 ? 0xe0675f : 0xf08a7e)); },
    update(lt, c) {
      const t = tw(lt), tn = c.w('nunca') - .1, ta = c.w('alergia') - .05, tc = c.w('culpables') - .1, tpe = c.w('pelitos') - .1, tg = c.w('gruesos') - .05;
      A.parpadea(this.p, t + 1.4, .3); respira(this.p, t); this.s.update(t);
      this.su.pelusa(t, 1); this.le.columpia(t, .04);
      this.le.scale.setScalar(pop(t, .05, .35)); this.ta.scale.set(Math.max(.001, ease(cl((t - ta) / .25))), 1, 1); this.ta.rotation.z = this.le.rotation.z;
      this.x.scale.setScalar(.62 * pop(t, ta + .1, .3));
      this.lu.scale.setScalar(pop(t, tpe, .4)); this.fi.forEach((f, i) => { f.position.y = Math.sin(t * 3 + i * 2) * .02; f.scale.y = 1 + .06 * Math.sin(t * 5 + i); });
      const bd = this.p.brazos[1]; bd.rotation.z = t < tc ? lerp(bd.r0, 2.2, eout(cl((t - tn) / .3))) + Math.sin(t * 4) * .05 : lerp(2.2, 1.35, eout(cl((t - tc) / .3))) + Math.sin(t * 4) * .05;
      const bi = this.p.brazos[0]; bi.rotation.z = bi.r0 - .25 + Math.sin(t * 17) * .15;   // se rasca la cadera
      if (t < tpe) habla(this.p, t); else A.ladea(this.p, .35 * ease(cl((t - tpe) / .3)), 1);
      this.p.boca(t > tg ? 'feliz' : 'abierta');
      c.ev('whoosh', .05, .4); if (t > ta) c.ev('impact', ta, .5); if (t > tpe) c.ev('pop', tpe, .5); if (t > tg) c.ev('ding', tg, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > ta && t < tpe) etiqueta('¡NO ES ALERGIA!', [0, 2.55, .9], lt - ta, 46, '#ffffff', true);
      if (t > tg) etiqueta('¡PELITOS GRUESOS!', [0, 2.55, .9], lt - tg, 44, '#ffd640', true);
      rotulo('Casi nunca es alergia:', 'son pelitos gruesos', lt - .05, RY);
    }
  });

  // ---------- 3 · agujitas: acercamiento a la piel; la fibra gruesa no se dobla y picotea; la fina se dobla ----------
  escena('agujitas', {
    setup() { amb(0xfde3d2); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
      PM.pz(F.rect(30, 30, 0), 0xfde3d2, [0, 15, -3], null, { tinta: false, papel: false });
      this.piel = group([0, 0, 0]);
      PM.pz(F.rect(3.4, .9, .06), 0xf3c9b4, [0, .25, 0], this.piel, { tinta: .014, papel: .05 });             // capa de adentro
      PM.pz(F.rect(3.4, .32, .06), PIEL, [0, .86, .02], this.piel, { tinta: .014, papel: .05 });               // piel (arriba en y = 1.02)
      PM.det(F.rect(3.2, .025, .01), 0xd99e7a, [0, .8, .055], this.piel);
      this.ner = PM.pz(tubo([[-1.6, .3], [-1.0, .4], [-.45, .58], [0, .35], [.55, .55], [1.1, .38], [1.6, .45]], .05, .05), 0xffd640, [0, 0, .04], this.piel, { tinta: .01, papel: false });
      for (const x of [-.45, .55]) PM.det(F.circ(.07), 0xffb22e, [x, .58 - (x > 0 ? .03 : 0), .05], this.piel);
      // carita de la piel
      this.cara = group([.05, .52, .08]); this.ojos = [-1, 1].map(sx => { const e = group([sx * .12, .04, 0], this.cara); PM.det(F.elipse(.04, .07), 0x1f1b2e, [0, 0, 0], e); PM.det(F.circ(.014), 0xffffff, [.01, .025, .004], e); return e; });
      this.bF = group([0, -.08, 0], this.cara); PM.det(F.arco(.05, .018, Math.PI * 1.15, Math.PI * 1.85), 0x7a1f30, [0, .04, 0], this.bF);
      this.bA = group([0, -.08, 0], this.cara); PM.det(tubo([[-.07, 0], [-.035, .02], [0, 0], [.035, .02], [.07, 0]], .018, .018), 0x7a1f30, [0, 0, 0], this.bA);
      for (const sx of [-1, 1]) PM.det(F.elipse(.06, .03), 0xff8a9a, [sx * .22, -.04, 0], this.cara);
      this.g = aguja([-.45, 2.3, .3], 1.15, .15, 0xc94a44);
      this.f = fibraFina([.55, 2.3, .3], 1.15, 0xf6a59c);
      this.ch = chispas([-.45, 1.02, .2]);
      this.lg = PM.letrero([-.98, 1.85, .4], 'GRUESA', { w: .74, h: .26, borde: 0xc94a44, hilos: false });
      this.lf = PM.letrero([1.05, 1.85, .4], 'FINA', { w: .6, h: .26, borde: 0xf6a59c, hilos: false }); },
    update(lt, c) {
      const t = tw(lt), tpu = c.w('puntitas') - .15, td = c.w('doblan') - .1, tpi = c.w('picotean') - .1, tag = c.w('agujitas') - .1;
      // bajan las dos fibras hasta tocar la piel (punta en y = 1.02 cuando y0 = 2.17)
      const kb = ease(cl((t - .1) / .6)), yT = lerp(2.6, 2.17, kb);
      const pic = t > tpi ? Math.max(0, Math.sin((t - tpi) * 14)) * .1 : 0;                                   // picotea
      this.g.position.y = yT - (t > td - .3 ? .05 : 0) - pic;
      const kf = ease(cl((t - td + .3) / .5)); this.f.position.y = yT - .12 * kf; this.f.dobla(kf);
      this.g.rotation.z = Math.sin(t * 30) * .01 * (t > tpi ? 1 : 0);
      const pinchazo = t > tpi ? (pic > .04 ? 1 : .35) : (t > td - .3 ? .4 : 0); this.ch.update(t, pinchazo);
      this.ner.children[0] && (this.ner.scale.y = 1 + .15 * pinchazo * Math.sin(t * 30));
      const ay = t > tpi; this.bF.visible = !ay; this.bA.visible = ay; this.ojos.forEach(e => e.scale.y = ay ? (pic > .04 ? .25 : .55) : (((t + .7) % 3.2) < .1 ? .12 : 1));
      this.cara.position.x = .05 + (ay ? Math.sin(t * 40) * .012 : 0);
      this.lg.scale.setScalar(pop(t, tpu, .3)); this.lf.scale.setScalar(pop(t, tpu + .2, .3)); this.lg.rotation.z = Math.sin(t * 2.6) * .03; this.lf.rotation.z = Math.sin(t * 2.6 + 1) * .03;
      c.ev('whoosh', .05, .4); if (t > td) c.ev('ding', td, .4); [0, 1, 2, 3].forEach(i => { const ti = tpi + .11 + i * (2 * Math.PI / 14); if (t > ti) c.ev('pop', ti, .3); }); if (t > tag) c.ev('ding', tag, .5);
      cam([0, 1.2, lerp(10.6, 10.3, ease(lt / 4))], [0, 1.15, 0], 34);
      if (t > td && t < tag) etiqueta('¡NO SE DOBLA!', [-.2, 2.55, .9], lt - td, 46, '#ffffff', true);
      if (t > tag) etiqueta('¡COMO AGUJITAS!', [0, 2.55, .9], lt - tag, 46, '#ffd640', true);
      rotulo('No se doblan:', 'te picotean la piel', lt - .05, RY);
    }
  });

  // ---------- 4 · truco: suéter de lana merino (liso, sin pelusa) y playera debajo ----------
  escena('truco', {
    setup() { this.s = sala({ cuadro: [6, 1.7, -2.6] });
      this.p = PM.chibi([-.62, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .8 });
      this.su = PM.sueter(this.p, MERINO, { fino: true, boton: 0xffc83d });
      this.l1 = PM.letrero([.72, 2.0, .5], 'LANA MERINO', { w: 1.28, h: .36, borde: MERINO });
      this.l2 = PM.letrero([.72, 1.22, .5], 'PLAYERA DEBAJO', { w: 1.28, h: .36, borde: 0x3d6bff });
      this.m1 = PM.marca([.16, 2.2, .7], true, .5); this.m2 = PM.marca([.16, 1.42, .7], true, .5); },
    update(lt, c) {
      const t = tw(lt), tm = c.w('merino') - .1, tf = c.w('fino') - .1, tpl = c.w('playera') - .1;
      A.parpadea(this.p, t + 2.0, .6); respira(this.p, t); this.s.update(t); habla(this.p, t);
      this.l1.scale.setScalar(pop(t, tm, .35)); this.m1.scale.setScalar(.5 * pop(t, tf, .3)); this.l1.columpia(t, .04);
      this.l2.scale.setScalar(pop(t, tpl, .35)); this.m2.scale.setScalar(.5 * pop(t, tpl + .35, .3)); this.l2.columpia(t + 1, .04);
      const bd = this.p.brazos[1]; bd.rotation.z = lerp(bd.r0, t < tpl ? 2.0 : 1.5, eout(cl((t - tm + .2) / .3))) + Math.sin(t * 4) * .05;
      const bi = this.p.brazos[0]; bi.rotation.z = bi.r0 + Math.sin(t * 3) * .05;
      this.p.boca(t > tf && t < tpl ? 'abierta' : 'feliz');
      c.ev('whoosh', .05, .4); if (t > tm) c.ev('pop', tm, .4); if (t > tf) c.ev('ding', tf, .4); if (t > tpl) c.ev('pop', tpl, .4); if (t > tpl + .35) c.ev('ding', tpl + .35, .4);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tf && t < tpl) etiqueta('¡HILO MÁS FINO!', [.1, 2.55, .9], lt - tf, 42, '#ffd640', true);
      if (t > tpl) etiqueta('¡ADIÓS COMEZÓN!', [.1, 2.55, .9], lt - tpl, 42, '#ffffff', true);
      rotulo('Truco: lana merino', 'o una playera debajo', lt - .05, RY);
    }
  });

  // ---------- 5 · remate: la abuelita teje y se va; el nieto se quita el suéter ----------
  escena('remate', {
    setup() { this.s = sala({ sinVentana: true, cuadro: [6, 1.7, -2.6] });
      this.ab = abuelita([-.75, .02, .3], .8); this.tj = tejido(this.ab.brazos[1]); this.bo = bola([-.2, .17, .5]);
      this.p = PM.chibi([.72, .02, .3], { logo: true, boca: 'apretada', mira: -1, escala: .8 });
      this.su = PM.sueter(this.p, LANA);
      this.z = PM.zumbido([0, .85, .1], { color: ROJO, r: .5, alto: .4 }, this.p);
      this.av = PM.avion([1.0, 1.6, .9], .75); },
    update(lt, c) {
      const t = tw(lt), tma = c.w('Mándaselo') - .1, tq = c.w('quita') - .1, tab = c.w('abuela') - .1, tcu = c.w('cuanto') - .1, tv = c.w('va.') - .1;
      A.parpadea(this.ab, t + .6, .4); A.parpadea(this.p, t + 2.0, 1.6); this.s.update(t);
      // abuelita teje y, desde "abuela", se va caminando a la izquierda
      const kv = cl((t - tab) / 1.1);
      if (t < tab) { respira(this.ab, t, .02, 1); this.tj.teje(t); const b = this.ab.brazos[1]; b.rotation.z = b.r0 - .55 + Math.sin(t * 14) * .05; this.ab.brazos[0].rotation.z = this.ab.brazos[0].r0 - .1; this.ab.head.rotation.z = this.ab.head.r0 + Math.sin(t * 3) * .04; }
      else { A.anda(this.ab, t, 1); this.tj.teje(t * .3); this.ab.brazos[1].rotation.z = this.ab.brazos[1].r0 - .55; }
      this.ab.position.x = lerp(-.75, -2.4, kv); this.ab.scale.x = t < tab ? .8 : -.8; this.ab.visible = kv < 1;
      // el nieto se rasca, se aguanta mientras ella está, y se lo quita
      const kq = ease(cl((t - tcu) / .45)), fuera = cl((t - tcu - .1) / .7);
      if (t < tcu) { if (t > tma + 1.1) rasca(this.p, t, ease(cl((t - tma - 1.1) / .3))); else { const bd = this.p.brazos[1]; bd.rotation.z = lerp(bd.r0, 2.3, eout(cl((t - tma) / .3))) - lerp(0, 1.2, ease(cl((t - tma - .4) / .3))); this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04; } }
      else { this.p.rotation.z = 0; this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -2.7, kq * (1 - ease(cl((t - tcu - .55) / .3)))); this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.7, kq * (1 - ease(cl((t - tcu - .55) / .3)))); }
      this.su.quita(fuera); this.su.pelusa(t, 1); this.z.update(t, t > tma + 1.1 && t < tcu ? 1 : 0);
      const alivio = t > tcu + .5; this.p.boca(alivio ? 'feliz' : t < tma + 1.1 ? 'abierta' : 'apretada'); A.preocupa(this.p, alivio ? 0 : t > tma + 1.1 ? .8 : 0);
      this.p.position.y = .02 + (alivio ? Math.abs(Math.sin((t - tcu) * 9)) * .08 * (1 - cl((t - tcu - .5) / .9)) : 0);
      const ka = cl((t - tma - .45) / 1.3); this.av.visible = t > tma + .45 && ka < 1; this.av.position.set(lerp(1.0, 1.9, ease(ka)), 1.6 + Math.sin(ka * Math.PI) * .8 + ka * .4, .9); this.av.rotation.z = .5 - ka * .3;
      c.ev('whoosh', .05, .4); if (t > tma + .45) c.ev('whoosh', tma + .45, .5); if (t > tab) c.ev('pop', tab, .3); if (t > tcu) c.ev('whoosh', tcu, .5); if (t > tcu + .5) c.ev('ding', tcu + .5, .5);
      cam([0, 1.2, lerp(10.4, 10.1, ease(lt / 4))], [0, 1.15, 0], 34);
      if (t > tcu + .3) etiqueta('¡POR FIN!', [.3, 2.55, .9], lt - tcu - .3, 56, '#ffd640', true);
      rotulo('Mándaselo a quien se', 'quita el suéter de la abuela', lt - .05, RY);
    }
  });
  P.cierre();
}
