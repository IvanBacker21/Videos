// Short 22-nov 13:30 · CARTULINA CHIBI: ¿por qué el refresco agitado te explota al abrirlo?
// Al agitarlo, el gas forma burbujitas pegadas a las paredes; al abrir baja la presión, el gas disuelto se mete a esas burbujas, crecen de golpe
// y empujan el líquido afuera. Mito: darle golpecitos a la lata no sirve (Sopina et al., 2019, Universidad del Sur de Dinamarca). Truco: esperar.
// Fuentes: MIT Technology Review (2019), Modern Farmer (2019), arXiv 1912.01999.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-22-1330-refresco-agitado.json OUT ../ejemplos/2026-11-22-1330-refresco-agitado.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw, tubo } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, ESP = 0xfff3dc;
  const amb = c => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const cocina = () => { amb(0xfbe6c8); PM.cocina(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const amigo = (pos, o = {}) => PM.chibi(pos, { ropa: 0xff8a3d, pantalon: 0x2b2f4a, tenis: 0xffc83d, colPelo: 0x1d1410, lentes: true, boca: 'feliz', ...o });

  // ---- piezas locales ----
  const mesita = (pos, w = .8, h = .72) => { const g = group(pos); PM.pz(F.rect(w, .1, .03), 0xc98f5e, [0, h - .05, 0], g, { tinta: .016, papel: .05 });
    for (const sx of [-1, 1]) PM.pz(F.rect(.08, h - .1, .02), 0xa8703f, [sx * (w / 2 - .1), (h - .1) / 2, -.02], g, { tinta: .014, papel: .04 }); return g; };
  // flecha gruesa hacia abajo (presión que baja)
  const flecha = (pos, s = 1, col = 0x3d7bff) => { const g = group(pos); g.scale.setScalar(s);
    PM.pz(F.poly([[-.12, .35], [.12, .35], [.12, 0], [.26, 0], [0, -.32], [-.26, 0], [-.12, 0]]), col, [0, 0, 0], g, { tinta: .016, papel: .05 });
    PM.det(F.rect(.05, .26, .02), 0xffffff, [-.05, .16, .016], g); return g; };
  // banderita de Dinamarca en su palito
  const bandera = pos => { const g = group(pos);
    PM.pz(F.rect(.035, .62, .01), 0x8a5a3a, [-.3, -.18, -.02], g, { tinta: .012, papel: .03 });
    const b = group([0, 0, 0], g); g.tela = b; PM.pz(F.rect(.58, .4, .03), 0xd2102e, [0, 0, 0], b, { tinta: .014, papel: .05 });
    PM.det(F.rect(.075, .4, .01), 0xffffff, [-.08, 0, .016], b); PM.det(F.rect(.58, .075, .01), 0xffffff, [0, 0, .02], b); return g; };
  // signo de igual
  const igual = (pos, s = 1) => { const g = group(pos); g.scale.setScalar(s);
    for (const y of [.07, -.07]) PM.pz(F.rect(.34, .08, .03), 0xffd640, [0, y, 0], g, { tinta: .014, papel: .05 }); return g; };

  // ---------- 1 · gancho: abre el refresco y ¡le explota en la cara! ----------
  escena('gancho', {
    setup() { cocina();
      this.me = mesita([.55, 0, .3], .9, .72);
      this.b = PM.botellaRefresco([.55, .72, .45], { h: 1.0, alto: .75 });
      this.z = PM.zumbido([.55, 1.22, .5], { r: .32, alto: .4 });
      this.p = PM.chibi([-.45, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .82 });
      this.manchas = [[-.12, .08, .1], [.15, -.02, .08], [.02, .2, .07], [.18, .17, .05]].map(([x, y, r]) => { const m = PM.pz(F.circ(r), ESP, [x, y, .09], this.p.head, { tinta: .01, papel: false }); m.scale.setScalar(.001); return m; }); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('agitado') - .15, te = c.w('explota') - .12, tab = c.w('abrirlo?');
      A.parpadea(this.p, t + 1.1, .4); respira(this.p, t);
      const ag = t < te - .25 ? 1 : 0;
      const ko = ease(cl((t - te) / .12)), kc = eout(cl((t - te - .05) / .3)) * (1 - .25 * cl((t - tab - .3) / .6));
      this.b.update(t, { agita: ag * (t < .1 ? t / .1 : 1), abre: ko, chorro: kc, espuma: ko });
      this.z.update(t, ag);
      // la mano en la corcholata; al explotar, se echa para atrás
      const br = this.p.brazos[1]; br.rotation.z = br.r0 + lerp(1.25 + Math.sin(t * 21) * .15 * ag, .3, ease(cl((t - te) / .2)));
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - (t > te ? lerp(0, 1.9, eout(cl((t - te - .05) / .25))) : 0);
      this.p.boca(t < te ? 'feliz' : 'abierta'); A.preocupa(this.p, ease(cl((t - te) / .2)));
      this.p.position.x = -.45 - (t > te ? .12 * eout(cl((t - te) / .25)) : 0);
      if (t < te) habla(this.p, t); else this.p.head.rotation.z = this.p.head.r0 + .12 * eout(cl((t - te) / .2));
      this.manchas.forEach((m, i) => m.scale.setScalar(pop(t, te + .18 + i * .07, .3)));
      if (t < te) c.ev('whoosh', .05, .4); if (t > te) c.ev('impact', te, .8); if (t > te + .05) c.ev('whoosh', te + .05, .6); if (t > te + .2) c.ev('pop', te + .2, .5);
      cam([0, 1.2, lerp(10.8, 10.4, ease(lt / 3))], [0, 1.15, 0], 34);
      if (t > te) etiqueta('¡PSSSHHH!', [-.55, 2.5, .9], lt - te, 56, '#ffd640', true);
      rotulo('¿Por qué explota el', 'refresco agitado?', lt - .05, RY);
    }
  });

  // ---------- 2 · burbujas: al agitarlo aparecen burbujitas pegadas a las paredes ----------
  escena('burbujas', {
    setup() { cocina();
      this.me = mesita([.4, 0, .2], 1.1, .45);
      this.b = PM.botellaRefresco([.4, .45, .4], { h: 1.85, n: 18 });
      this.z = PM.zumbido([.4, 1.35, .5], { r: .5, alto: .55 });
      this.p = PM.chibi([-.95, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .72 }); },
    update(lt, c) {
      const t = tw(lt), tag = c.w('agitarlo,'), tg = c.w('gas') - .1, tb = c.w('burbujitas') - .15, tp = c.w('pegadas') - .1;
      A.parpadea(this.p, t + .3, 1.3); respira(this.p, t); habla(this.p, t);
      const ag = t < tb - .3 ? Math.min(1, t / .2) : 0;
      this.b.update(t, { agita: ag, burb: ease(cl((t - tg) / (tb + .6 - tg))) });
      this.z.update(t, ag);
      // primero agita los bracitos (como si sacudiera), luego señala la botella
      const ki = ease(cl((t - tb + .2) / .3));
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0 + 1.0 + Math.sin(t * 21) * .3 * ag, 1.9, ki) + Math.sin(t * 4) * .05 * ki;
      this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0 - 1.0 - Math.sin(t * 21) * .3 * ag, this.p.brazos[0].r0, ki);
      this.p.boca(t > tp ? 'feliz' : 'abierta');
      c.ev('whoosh', .05, .4); if (t > tb) c.ev('pop', tb, .5); if (t > tb + .3) c.ev('pop', tb + .3, .4); if (t > tp) c.ev('ding', tp, .5);
      cam([0, 1.25, 10.4], [0, 1.2, 0], 34);
      if (t > tb) etiqueta(t < tp ? '¡BURBUJITAS!' : '¡PEGADAS POR DENTRO!', [0, 2.55, .9], lt - (t < tp ? tb : tp), 44, '#ffd640', true);
      rotulo('Al agitarlo se forman', 'burbujitas por dentro', lt - .05, RY);
    }
  });

  // ---------- 3 · presión: se abre, baja la presión, las burbujas crecen y empujan el refresco afuera ----------
  escena('presion', {
    setup() { cocina();
      this.me = mesita([.4, 0, .2], 1.1, .45);
      this.b = PM.botellaRefresco([.4, .45, .4], { h: 1.5, n: 18, alto: .55 });
      this.f = flecha([-.35, 1.5, .6], .9); this.f.scale.setScalar(.001);
      this.p = PM.chibi([-1.05, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .72 }); },
    update(lt, c) {
      const t = tw(lt), tab = c.w('abrirlo') - .1, tba = c.w('baja') - .1, tcr = c.w('crecen') - .1, tgo = c.w('golpe') - .1, tem = c.w('empujan') - .1, taf = c.w('afuera.');
      A.parpadea(this.p, t + 2.4, .7); respira(this.p, t);
      const kc = ease(cl((t - tcr) / (tgo + .35 - tcr)));
      this.b.update(t, { burb: 1, abre: ease(cl((t - tab) / .45)), crece: kc, espuma: ease(cl((t - tgo) / (tem + .2 - tgo))), chorro: eout(cl((t - tem) / .5)) });
      // flecha que baja (presión) y se va al empezar a crecer
      const kf = t < tcr + .2 ? pop(t, tba, .35) : Math.max(.001, 1 - ease(cl((t - tcr - .2) / .3)));
      this.f.scale.setScalar(.9 * kf); this.f.position.y = 1.5 - ((t * 1.2) % 1) * .25;
      // el chibi explica y luego se asusta con el chorro
      const ks = ease(cl((t - tem) / .25));
      this.p.boca(t < tem ? 'abierta' : 'abierta'); A.preocupa(this.p, ks); if (t < tem) habla(this.p, t);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.7, eout(cl((t - tab) / .3))) * (1 - ks) + ks * 2.75 + Math.sin(t * 4) * .04;
      this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -2.75, ks);
      this.p.position.x = -1.05 - .1 * ks;
      c.ev('whoosh', .05, .4); if (t > tab) c.ev('pop', tab, .6); if (t > tba) c.ev('whoosh', tba, .5); if (t > tcr) c.ev('pop', tcr, .4); if (t > tgo) c.ev('pop', tgo, .5); if (t > tem) c.ev('impact', tem, .7);
      cam([0, 1.25, 10.4], [0, 1.2, 0], 34);
      if (t > tba && t < tcr) etiqueta('¡BAJA LA PRESIÓN!', [0, 2.55, .9], lt - tba, 44, '#ffffff', true);
      if (t > tcr && t < tem) etiqueta('¡CRECEN DE GOLPE!', [0, 2.55, .9], lt - tcr, 44, '#ffd640', true);
      rotulo('Baja la presión y las', 'burbujas crecen', lt - .05, RY);
    }
  });

  // ---------- 4 · mito: golpecitos a la lata; estudio de Dinamarca: ninguna diferencia ----------
  escena('mito', {
    setup() { cocina();
      this.me = mesita([.25, 0, .2], 2.4, .45);
      this.a = PM.botellaRefresco([-.32, .45, .4], { tipo: 'lata', h: .62, alto: .42 });
      this.b2 = PM.botellaRefresco([.85, .45, .4], { tipo: 'lata', h: .62, alto: .42 });
      this.ig = igual([.27, .78, .5], .8); this.ig.scale.setScalar(.001);
      this.x = PM.marca([-.32, 1.42, .6], false, .7); this.x.scale.setScalar(.001);
      this.fl = bandera([1.02, 2.0, .5]); this.fl.scale.setScalar(.001);
      this.p = PM.chibi([-1.0, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .9 }); },
    update(lt, c) {
      const t = tw(lt), tgo = c.w('golpecitos') - .1, tm = c.w('Mito:') - .1, td = c.w('Dinamarca') - .1, tno = c.w('no') - .1, tni = c.w('ninguna') - .1;
      A.parpadea(this.p, t + .9, 2.0); respira(this.p, t); if (t > tm) habla(this.p, t);
      // tic, tic, tic con el dedo sobre la lata
      const tap = t > tgo && t < tm ? 1 : 0, ph = Math.abs(Math.sin((t - tgo) * 11));
      const br = this.p.brazos[1]; br.rotation.z = lerp(br.r0, 1.35, eout(cl((t - tgo + .2) / .2))) * (t < tm + .2 ? 1 : 1 - ease(cl((t - tm - .2) / .3))) + .2 * ph * tap;
      this.a.position.y = .45 + (tap ? (1 - ph) * .015 : 0);
      this.p.boca(t < tm ? 'apretada' : 'abierta'); A.preocupa(this.p, t > tm && t < tno ? .5 : 0);
      this.x.scale.setScalar(.7 * pop(t, tm, .3) * (t < tno ? 1 : Math.max(.001, 1 - cl((t - tno) / .25))));
      this.fl.scale.setScalar(pop(t, td, .35)); this.fl.tela.rotation.y = Math.sin(t * 5) * .25;
      // las dos latas se abren igual: ¡ninguna diferencia!
      const kc = eout(cl((t - tno) / .45));
      this.a.update(t, { abre: ease(cl((t - tno) / .2)), chorro: kc }); this.b2.update(t, { abre: ease(cl((t - tno) / .2)), chorro: kc });
      this.ig.scale.setScalar(.8 * pop(t, tni, .35));
      if (tap) for (let k = 0; k < 4; k++) { const tk = tgo + .1 + k * .285; if (t > tk && tk < tm) c.ev('click', tk, .4); }
      if (t > tm) c.ev('zap', tm, .5); if (t > td) c.ev('pop', td, .5); if (t > tno) c.ev('impact', tno, .6); if (t > tni) c.ev('ding', tni, .6);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tgo && t < tm) etiqueta('TIC, TIC, TIC…', [-.3, 2.4, .9], lt - tgo, 40, '#ffffff', true);
      if (t > tm && t < td) etiqueta('¡MITO!', [0, 2.5, .9], lt - tm, 70, '#ff5b5b', true);
      if (t > td && t < tni) etiqueta('ESTUDIO EN DINAMARCA', [0, 2.55, .9], lt - td, 38, '#ffffff', true);
      if (t > tni) etiqueta('¡NINGUNA DIFERENCIA!', [0, 2.55, .9], lt - tni, 42, '#ffd640', true);
      rotulo('Golpecitos a la lata:', '¡es puro mito!', lt - .05, RY);
    }
  });

  // ---------- 5 · remate: espera unos minutos… y llega el bromista a agitarlo ----------
  escena('remate', {
    setup() { cocina();
      this.me = mesita([.2, 0, .3], 1.0, .72);
      this.b = PM.botellaRefresco([.2, .72, .45], { h: 1.0, n: 16 });
      this.z = PM.zumbido([.2, 1.22, .5], { r: .32, alto: .4 });
      this.r = P.relojPapel([-.2, 2.12, -.6]); this.r.scale.setScalar(.33);
      this.p = PM.chibi([-.85, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .8 });
      this.a = amigo([2.4, .02, .35], { escala: .76, mira: -1 }); },
    update(lt, c) {
      const t = tw(lt), tes = c.w('espera') - .1, tmi = c.w('minutos.') - .1, tma = c.w('Mándaselo') - .1, tag = c.w('agita') - .1;
      A.parpadea(this.p, t + 2.0, 1.6); A.parpadea(this.a, t + .6, .4); respira(this.p, t);
      // reloj que corre y burbujas que suben y se van
      this.r.hora(12 + Math.min(t, tma) * .9);
      const kr = ease(cl((t - tes) / (tma - tes)));
      // el amigo entra de puntitas y agita la botella
      const ke = ease(cl((t - tma) / .7)), ag = t > tag ? 1 : 0;
      this.a.position.x = lerp(2.4, .78, ke); this.a.position.y = .02 + (ke < 1 ? Math.abs(Math.sin(t * 10)) * .05 : 0);
      const ba = this.a.brazos[0]; ba.rotation.z = ba.r0 - lerp(0, 1.25, eout(cl((t - tag + .3) / .3))) + Math.sin(t * 21) * .15 * ag;
      this.a.boca(t > tag ? 'lengua' : 'feliz'); this.a.head.rotation.z = this.a.head.r0 + Math.sin(t * 4) * .05;
      this.b.update(t, { burb: 1 - kr + ag * ease(cl((t - tag) / .6)), crece: .35 * (1 - ag), agita: ag });
      this.z.update(t, ag);
      // el chibi espera tranquilo; al ver al bromista, se preocupa
      if (t < tag) habla(this.p, t);
      this.p.boca(t > tag ? 'abierta' : 'feliz'); A.preocupa(this.p, ease(cl((t - tag) / .3)));
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.4 * eout(cl((t - tes) / .3)) * (1 - ease(cl((t - tmi - .4) / .3))) + Math.sin(t * 4) * .04;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - (t > tag ? lerp(0, 2.7, eout(cl((t - tag) / .3))) : 0);
      c.ev('whoosh', .05, .4); if (t > tes) c.ev('ding', tes, .4); if (t > tma) c.ev('whoosh', tma, .5); if (t > tag) c.ev('zap', tag, .5);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.5))], [0, 1.15, 0], 34);
      if (t > tes && t < tma) etiqueta('¡ESPERA UNOS MINUTOS!', [0, 2.55, .9], lt - tes, 40, '#ffd640', true);
      if (t > tag) etiqueta('¡EL BROMISTA!', [0, 2.55, .9], lt - tag, 48, '#ffffff', true);
      rotulo(t < tma ? 'Truco: déjalo reposar' : 'Mándaselo al que te', t < tma ? 'unos minutos' : 'agita el refresco', lt - .05, RY);
    }
  });
  P.cierre();
}
