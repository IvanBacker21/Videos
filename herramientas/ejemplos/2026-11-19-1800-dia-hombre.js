// Short 19-nov 18:00 · CARTULINA CHIBI: Día Internacional del Hombre (pedido de Iván). Lo impulsó en 1999 un profesor de
// Trinidad y Tobago por el cumpleaños de su papá; su meta es la salud: en México los hombres viven unos seis años menos (INEGI).
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-19-1800-dia-hombre.json OUT ../ejemplos/2026-11-19-1800-dia-hombre.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xbfe3f5;
  const set = () => { ambiente({ top: CIELO, bottom: CIELO, fog: CIELO, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
    const pp = P.papelPicado(3.15, { n: 7, w: 4.2, z: -1.6 }); return pp; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = 0, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  // celular de cartulina con pantalla azul y avioncito de "enviar"
  const celEnviar = (pos, par) => { const g = group(pos, par); PM.pz(F.rect(.3, .54, .05), 0x2b2f4a, [0, 0, 0], g, { tinta: .012, papel: .04 });
    PM.det(F.rect(.25, .44, .01), 0x8fd3ff, [0, -.01, .02], g); const av = PM.avion([0, -.01, .03], .2, g); av.rotation.z = .35; g.av = av; return g; };

  // ---------- 1 · gancho: cae la hoja del calendario "19 NOV" y el protagonista saluda; confeti ----------
  escena('gancho', {
    setup() { this.pp = set();
      this.p = PM.chibi([-.55, 0, .2], { logo: true, boca: 'abierta', mira: 1 });
      this.cal = PM.calendario([.75, 1.25, .3], 'NOVIEMBRE', 19, { w: 1.0, h: 1.15 });
      this.cf = PM.confeti({ n: 28 }); },
    update(lt, c) {
      const t = tw(lt), tn = c.w('noviembre,') - .1, th = c.w('Hombre.') - .1;
      A.parpadea(this.p, t + 1.2, .3); habla(this.p, t); respira(this.p, t, 0);
      A.saluda(this.p, t); this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .05;
      this.p.boca(t > th ? 'feliz' : 'abierta');
      // la hoja cae desde arriba con rebote
      const kc = cl((t - .05) / .45); this.cal.scale.setScalar(pop(t, .05, .4)); this.cal.position.y = lerp(1.9, 1.25, eout(kc)) + (kc >= 1 ? Math.abs(Math.sin((t - .5) * 9)) * .05 * Math.max(0, 1 - (t - .5) * 2) : 0);
      this.cal.columpia(t, .05);
      this.pp.update(t); this.cf.estalla(t, th, [.75, 1.6]);
      c.ev('whoosh', .05, .4); if (t > .5) c.ev('pop', .5, .4); if (t > th) c.ev('ding', th, .5);
      cam([0, 1.2, lerp(10.9, 10.4, ease(lt / 3))], [0, 1.15, 0], 34);
      if (t > th) etiqueta('¡DÍA DEL HOMBRE!', [0, 2.45, .9], lt - th, 50, '#ffd640', true);
      rotulo('Hoy, 19 de noviembre,', 'es el Día del Hombre', lt - .05, RY);
    }
  });

  // ---------- 2 · origen: un profesor abraza a su papá frente al pastel de cumpleaños ----------
  escena('origen', {
    setup() { this.pp = set();
      this.pr = PM.chibi([-1.02, 0, .28], { ropa: 0x7b5cff, lentes: 0x1f1b2e, colPelo: 0x2a1a10, boca: 'abierta', mira: 1, escala: .92 });
      this.pa = PM.chibi([.16, 0, .12], { ropa: 0x2ec4a6, colPelo: 0xd9d6cf, pantalon: 0x5a4636, boca: 'feliz', mira: -1, escala: .92 });
      this.pas = PM.pastel([.98, 0, .45], { w: .74 });
      this.gl = PM.pz(F.circ(.12), 0xff6b5b, [1.0, 1.55, .5], null, { tinta: .012, papel: .04 });   // globo
      PM.det(P.tubo([[0, -.12], [.03, -.4], [-.02, -.7], [0, -.95]], .01, .01), 0x1f1b2e, [0, 0, -.02], this.gl); },
    update(lt, c) {
      const t = tw(lt), tt = c.w('Trinidad') - .1, tf = c.w('fecha') - .1, tc = c.w('cumpleaños') - .1;
      A.parpadea(this.pr, t + .4, .2); A.parpadea(this.pa, t + 2.0, 1.6);
      habla(this.pr, t); respira(this.pr, t, 0); respira(this.pa, t, 0, 1);
      this.pa.head.rotation.z = this.pa.head.r0 - .06 + Math.sin(t * 2) * .03;
      // abrazo: se acercan al decir "fecha"
      const ka = ease(cl((t - tf) / .6));
      this.pr.position.x = lerp(-1.02, -.97, ka); this.pa.position.x = lerp(.16, .12, ka);
      this.pr.rotation.z = -.07 * ka; this.pa.rotation.z = .03 * ka;
      this.pr.brazos[1].rotation.z = lerp(this.pr.brazos[1].r0 + Math.sin(t * 3) * .06, 1.8, ka); this.pr.brazos[0].rotation.z = this.pr.brazos[0].r0 + Math.sin(t * 2.5) * .05;
      this.pa.brazos[0].rotation.z = lerp(this.pa.brazos[0].r0 - Math.sin(t * 3) * .06, -1.5, ka); this.pa.brazos[1].rotation.z = this.pa.brazos[1].r0 - Math.sin(t * 2.2) * .05;
      this.pr.boca(t > tc + .5 ? 'feliz' : 'abierta');
      this.pas.update(t, 0); this.pas.scale.setScalar(pop(t, .1, .4));
      this.gl.position.x = 1.0; this.gl.position.y = 1.55 + Math.sin(t * 1.8) * .05; this.gl.rotation.z = Math.sin(t * 1.5) * .08;
      this.pp.update(t);
      c.ev('whoosh', .05, .4); if (t > tt) c.ev('pop', tt, .4); if (t > tc) c.ev('ding', tc, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tt && t < tc) etiqueta('TRINIDAD Y TOBAGO', [0, 2.45, .9], lt - tt, 44, '#ffffff', true);
      if (t > tc) etiqueta('¡FELIZ CUMPLE, PAPÁ!', [0, 2.45, .9], lt - tc, 44, '#ffd640', true);
      rotulo('Lo impulsó un profesor', 'por el cumple de su papá', lt - .1, RY);
    }
  });

  // ---------- 3 · salud: barras de esperanza de vida (mujeres vs hombres); el protagonista se sorprende ----------
  escena('salud', {
    setup() { set();
      this.p = PM.chibi([-.85, 0, .2], { logo: true, boca: 'abierta', mira: 1, escala: .85 });
      this.est = PM.det(F.rect(1.5, .03, .01), 0x8a6a4a, [.55, .32, .3]);
      const barra = (x, col, h) => { const g = group([x, .33, .35]); const b = PM.pz(F.rect(.48, h, .05), col, [0, h / 2, 0], g, { tinta: .016, papel: .05 });
        PM.det(F.rect(.1, h - .1, .01), 0xffffff, [-.14, h / 2, .03], g); g.b = b; return g; };
      this.bm = barra(.22, 0xff8fc0, 1.75); this.bh = barra(.88, 0x3d6bff, 1.16);
      this.lm = PM.letrero([.22, .1, .5], 'MUJERES', { w: .62, h: .22, hilos: false, borde: 0xff8fc0 });
      this.lh = PM.letrero([.88, .1, .5], 'HOMBRES', { w: .62, h: .22, hilos: false, borde: 0x3d6bff });
      this.fl = PM.pz(F.poly([[0, .16], [.13, 0], [.05, 0], [.05, -.16], [-.05, -.16], [-.05, 0], [-.13, 0]]), 0xff5b5b, [.88, 1.8, .5], null, { tinta: .012, papel: .04 }); this.fl.rotation.z = Math.PI; },
    update(lt, c) {
      const t = tw(lt), tsa = c.w('salud:') - .1, tm = c.w('México') - .1, ts = c.w('seis') - .1;
      A.parpadea(this.p, t + .9, 1.1); habla(this.p, t); respira(this.p, t, 0);
      const kb = ease(cl((t - tm) / 1.2));
      this.bm.scale.set(1, Math.max(.001, kb), 1); this.bh.scale.set(1, Math.max(.001, kb), 1);
      this.bm.rotation.z = Math.sin(t * 2) * .01; this.bh.rotation.z = Math.sin(t * 2 + 1) * .01;
      this.lm.scale.setScalar(pop(t, tm - .2, .3)); this.lh.scale.setScalar(pop(t, tm - .1, .3));
      const ks = eout(cl((t - ts) / .3)); A.preocupa(this.p, ks * .9);
      this.p.boca(t < tsa ? 'feliz' : 'abierta');
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.25, eout(cl((t - tm) / .4))) + Math.sin(t * 4) * .04;   // señala las barras
      this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -2.8, ks) + Math.sin(t * 6) * .05 * ks;                  // mano a la cabeza
      this.fl.scale.setScalar(pop(t, ts, .3)); this.fl.position.y = 1.8 + Math.sin(t * 6) * .04;
      c.ev('whoosh', .05, .4); if (t > tm) c.ev('whoosh', tm, .4); if (t > ts) c.ev('ding', ts, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tsa && t < ts) etiqueta('SALUD', [0, 2.45, .9], lt - tsa, 58, '#ffffff', true);
      if (t > ts) etiqueta('¡UNOS 6 AÑOS MENOS!', [.1, 2.45, .9], lt - ts, 44, '#ffd640', true);
      rotulo('En México viven', 'unos 6 años menos', lt - tm, RY);
    }
  });

  // ---------- 4 · felicidades: protagonista con su amigo y su abuelo; confeti; corazón con palomita del chequeo ----------
  escena('felicidades', {
    setup() { this.pp = set();
      this.l = PM.letrero([-.4, 2.3, .5], '¡FELICIDADES!', { w: 1.5, h: .4, borde: 0xffc83d });
      this.am = PM.chibi([-.95, 0, .1], { ropa: 0xff6b5b, gorra: 0x2ec4a6, boca: 'feliz', mira: 1, escala: .78 });
      this.p = PM.chibi([0, 0, .25], { logo: true, boca: 'feliz', escala: .85 });
      this.ab = PM.chibi([.95, 0, .1], { ropa: 0xffc83d, lentes: 0x1f1b2e, colPelo: 0xe6e3dc, pantalon: 0x5a4636, boca: 'feliz', mira: -1, escala: .78 });
      this.co = PM.pz(F.corazon(.55), 0xff5b6b, [.95, 1.95, .7], null, { tinta: .014, papel: .05 }); this.ok = PM.marca([1.12, 1.82, .78], true, .4);
      this.cf = PM.confeti({ n: 26 }); },
    update(lt, c) {
      const t = tw(lt), tq = c.w('chequeo') - .1;
      [this.am, this.p, this.ab].forEach((q, i) => { A.parpadea(q, t + i * 1.1, i * .7); q.position.y = Math.abs(Math.sin(t * 5 + i * 1.2)) * .06;
        q.brazos[0].rotation.z = -2.3 + Math.sin(t * 8 + i) * .2; q.brazos[1].rotation.z = 2.3 - Math.sin(t * 8 + i + 1) * .2; });   // celebran con los brazos arriba
      habla(this.p, t); this.p.boca(t < 1.7 ? 'abierta' : 'feliz'); this.am.boca('abierta'); this.ab.boca(Math.sin(t * 5) > 0 ? 'abierta' : 'feliz');
      const kq = pop(t, tq, .35); this.co.scale.setScalar(kq); this.ok.scale.setScalar(pop(t, tq + .25, .3) * .4); this.co.rotation.z = Math.sin(t * 5) * .08;
      if (t > tq) { this.p.brazos[1].rotation.z = lerp(2.3, 1.1, eout(cl((t - tq) / .3))); }   // señala el corazón
      this.l.columpia(t, .05); this.pp.update(t); this.cf.lluvia(t, 1);
      c.ev('whoosh', .05, .4); c.ev('ding', .1, .5); if (t > tq) c.ev('pop', tq, .4);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tq) etiqueta('¡CHEQUEO!', [.95, 2.5, .9], lt - tq, 40, '#ffffff', true);
      rotulo('¡Felicidades!', 'y regálate un chequeo', lt - .05, RY);
    }
  });

  // ---------- 5 · remate: el protagonista con su celular manda el video (sale un avioncito hacia cámara) ----------
  escena('remate', {
    setup() { this.pp = set();
      this.p = PM.chibi([-.25, 0, .3], { logo: true, boca: 'feliz', mira: 1 });
      this.cel = celEnviar([.45, 1.3, .55]);
      this.av = PM.avion([.45, 1.3, .9], .45); this.cf = PM.confeti({ n: 22 }); },
    update(lt, c) {
      const t = tw(lt), tv = c.w('video') - .1, tfe = c.w('feliciten') - .1, tg = c.w('gran') - .1;
      A.parpadea(this.p, t + 1.5, .8); habla(this.p, t); respira(this.p, t, 0);
      this.p.boca(t < tfe ? 'abierta' : (t < tg ? 'feliz' : 'abierta'));
      this.p.brazos[1].rotation.z = 1.35 + Math.sin(t * 3) * .04;                 // sostiene el cel
      this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -.9, eout(cl((t - tg) / .3))) + Math.sin(t * 4) * .04;
      this.cel.position.y = 1.3 + Math.sin(t * 3) * .02; this.cel.rotation.z = -.08 + Math.sin(t * 2) * .03;
      this.cel.av.scale.setScalar(.2 * (1 + .12 * Math.abs(Math.sin(t * 6))));
      // avioncito sale volando hacia arriba a la derecha al decir "video"
      const ka = cl((t - tv) / 1.3); this.av.visible = t > tv && ka < 1; this.av.position.set(lerp(.45, 1.7, ease(ka)), 1.3 + Math.sin(ka * Math.PI) * .9 + ka * .4, .9); this.av.rotation.z = .5 - ka * .3;
      this.pp.update(t); this.cf.estalla(t, tg, [-.25, 2.2]);
      c.ev('whoosh', .05, .4); if (t > tv) c.ev('whoosh', tv, .5); if (t > tg) c.ev('ding', tg, .5);
      cam([.1, 1.2, lerp(10.4, 10.0, ease(lt / 3.8))], [.1, 1.15, 0], 34);
      if (t > .1 && t < tg) etiqueta('¡MÁNDALO!', [.1, 2.45, .9], lt - .1, 52, '#ffd640', true);
      if (t > tg) etiqueta('¡GRAN HOMBRE!', [.1, 2.45, .9], lt - tg, 52, '#ffd640', true);
      rotulo('Manda este video', 'y que te feliciten', lt - .05, RY);
    }
  });
  P.cierre();
}
