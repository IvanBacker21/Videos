// Short 14-nov-2026 13:30 (pedido de seguidor) · CARTULINA CHIBI: ¿Por qué los gatos usan arenero y los perros no?
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-14-1330-arenero.json OUT ../ejemplos/2026-11-14-1330-arenero.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600;
  const set = () => { ambiente({ top: 0xa9dcf5, bottom: 0xa9dcf5, fog: 0xa9dcf5, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const corazones = () => [0, 1, 2].map(i => { const c = PM.pz(F.corazon(.45), 0xff5d8f, [0, 0, .5], null, { tinta: .015, papel: .04 }); c.visible = false; c.i = i; return c; });
  const animaCorazones = (cs, t, x0, y0) => cs.forEach(c => { const k = ((t * .9 + c.i / 3) % 1); c.visible = true; c.position.set(x0 + Math.sin(k * 6 + c.i * 2) * .2 + (c.i - 1) * .3, y0 + k * .6, .5); c.scale.setScalar(Math.sin(k * Math.PI) * .85 + .05); });
  // cactus de cartulina (escenografía de desierto)
  const cactus = (x, z, s) => { const g = group([x, 0, z]); g.scale.setScalar(s);
    PM.pz(F.rect(.34, 1.5, .17), 0x5aa85a, [0, .75, 0], g, { tinta: .018, papel: .07 });
    PM.pz(F.rect(.2, .55, .1), 0x5aa85a, [-.32, .95, -.01], g, { tinta: .018, papel: .07 }); PM.pz(F.rect(.3, .16, .08), 0x5aa85a, [-.2, .72, -.01], g, { tinta: .018, papel: .07 });
    PM.pz(F.rect(.2, .45, .1), 0x5aa85a, [.32, 1.1, -.01], g, { tinta: .018, papel: .07 }); PM.pz(F.rect(.3, .16, .08), 0x5aa85a, [.2, .92, -.01], g, { tinta: .018, papel: .07 });
    for (const [a, b] of [[0, 1.2], [0, .5], [-.06, .85]]) PM.det(F.rect(.03, .2, .01), 0x3f8a46, [a, b, .016], g); return g; };

  // ---------- 1 · gancho: comentario de seguidor; el protagonista duda entre el gato en su arenero y el perro ----------
  escena('gancho', {
    setup() { set();
      this.c = PM.comentario([.05, 2.3, .5], '¿Por qué los gatos usan\narenero y los perros no?', { w: 2.4, h: .6 });
      this.p = PM.chibi([-1.15, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .9 });
      this.d = PM.perroPM([.1, .02, .45], { pose: 'frente', escala: .62 });
      this.ar = PM.arenero([1.2, .02, .4], { w: .95 });
      this.g = PM.gatoPM([1.2, .4, .3], { pose: 'frente', escala: .55 });
      this.q = PM.pregunta([-.45, 1.55, .6], .6); },
    update(lt, c) {
      const t = tw(lt), kc = eout(cl(t / .35));
      this.c.scale.setScalar(.2 + .8 * kc); this.c.rotation.z = Math.sin(t * 2.4) * .02;
      A.parpadea(this.p, t, 1.4); this.p.head.rotation.z = .1 + Math.sin(t * 2.6) * .05; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + .5 + Math.sin(t * 3) * .1;
      const tg = c.w('gatos') - .2, tp = c.w('perros') - .2;
      A.parpadea(this.g, t, .5); A.cola(this.g, t, 4, .12, 0); this.g.position.y = .4 + (t > tg && t < tg + .5 ? Math.abs(Math.sin((t - tg) * 12)) * .08 : 0);
      A.parpadea(this.d, t, 2.1); A.cola(this.d, t, 14, .3, .15); A.ladea(this.d, t > tp ? eout(cl((t - tp) / .3)) : 0, -1);
      this.q.visible = t > .3; this.q.rotation.z = Math.sin(t * 5) * .15; this.q.scale.setScalar(.6 * eout(cl((t - .3) / .25)));
      if (t > tg) etiqueta('ARENERO', [1.2, -.3, .6], lt - tg, 52, '#ffffff', true);
      if (t > tp) etiqueta('¿Y EL PERRO?', [-.05, -.75, .6], lt - tp, 52, '#ffd640', true);
      cam([.05, 1.15, lerp(12.6, 12.0, ease(lt / 4))], [.05, 1.05, 0], 34);
      rotulo('Nos preguntaron', '¿arenero sí y perro no?', lt - .1, RY);
    }
  });

  // ---------- 2 · gato del desierto: escarba y tapa con arena; las nubecitas de olor desaparecen ----------
  escena('gato', {
    setup() { set(); cactus(-1.9, -1.0, .8); cactus(1.95, -1.1, .65);
      this.ar = PM.arenero([0, .02, .3], { w: 2.0, color: 0xffa53a });
      this.g = PM.gatoPM([-.15, .5, .25], { pose: 'perfil', escala: .9 });
      this.ti = PM.tierrita([.05, .52, .1], 0xf1d59a, 12);
      this.ol = PM.olor([-.95, .5, .35], 0xc7e88a); },
    update(lt, c) {
      const t = tw(lt), td = c.w('desierto') - .2, tt = c.w('tapa') - .15, te = c.w('esconder') - .2;
      const u = cl(t / .9); this.g.position.x = lerp(-1.4, -.15, eout(u)); A.anda(this.g, t, u < 1 ? 1 : 0, .5);
      const esc = t > tt ? cl((t - tt) / .25) : 0;
      if (u >= 1) A.escarba(this.g, t, esc);
      A.parpadea(this.g, t, .7); A.cola(this.g, t, 5, .15, 0);
      this.ti.update(t, esc, -1, .55, 1.4);
      const tapado = t > te ? cl((t - te) / 1.0) : 0; this.ol.update(t, 1 - tapado, 0);
      if (esc > 0) c.ev('pop', tt, .4);
      if (t > td) etiqueta('GATO DEL DESIERTO', [0, 2.15, .6], lt - td, 54, '#ffd640', true);
      if (t > te) etiqueta('¡ESCONDE SU OLOR!', [0, -.3, .6], lt - te, 58, '#ffffff', true);
      cam([0, 1.05, 10.0], [0, .95, 0], 34);
      rotulo('Tapa con arena', 'para esconder su olor', lt - tt + .1, RY);
    }
  });

  // ---------- 3 · el perro viene del lobo: deja su olor en el árbol como "mensaje" ----------
  escena('perro', {
    setup() { set();
      this.p = PM.chibi([-1.25, .02, .2], { logo: true, boca: 'abierta', mira: 1, escala: .85 });
      this.tr = group([1.35, 0, .1]); PM.pz(F.rect(.3, 1.5, .06), 0x9a6a42, [0, .75, 0], this.tr, { tinta: .018, papel: .07 });
      const co = PM.pz(F.circ(.6), 0x4fae5a, [0, 1.75, .02], this.tr, { tinta: .02, papel: .08 }); PM.det(F.circ(.14), 0x7fd27a, [-.2, .2, .014], co);
      this.d = PM.perroPM([2.6, .02, .4], { pose: 'perfil', escala: .8 });
      this.ol = PM.olor([1.2, .25, .4], 0xc7e88a);
      this.carta = group([1.0, 1.25, .6]); PM.pz(F.rect(.5, .34, .03), 0xffffff, [0, 0, 0], this.carta, { tinta: .014, papel: .04 });
      PM.det(P.tubo([[-.23, .15], [0, -.02], [.23, .15]], .025, .025), 0xff6b5b, [0, 0, .016], this.carta); this.carta.visible = false; },
    update(lt, c) {
      const t = tw(lt), tl = c.w('lobo') - .2, tm = c.w('mensajes') - .2;
      const u = cl(t / 1.2); this.d.position.x = lerp(2.4, .05, eout(u)); A.anda(this.d, t, u < 1 ? 1 : 0);
      A.parpadea(this.d, t, .9); A.cola(this.d, t, 14, .3, .25);
      if (u >= 1) this.d.head.rotation.z = this.d.head.r0 - .18 + Math.sin(t * 9) * .05;                         // olfatea el árbol
      this.ol.update(t, u >= 1 ? 1 : 0, .2);
      A.parpadea(this.p, t, 2.3); this.p.head.rotation.z = .06 + Math.sin(t * 2.5) * .04;
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + (t > tl ? 1.2 : .2) + Math.sin(t * 4) * .06;
      const km = t > tm ? eout(cl((t - tm) / .35)) : 0; this.carta.visible = km > 0; this.carta.scale.setScalar(km); this.carta.position.y = 1.25 + Math.sin(t * 3) * .05;
      if (km > 0) c.ev('ding', tm, .5);
      if (t > tl) etiqueta('VIENE DEL LOBO', [-.2, -.3, .6], lt - tl, 56, '#ffffff', true);
      if (t > tm) etiqueta('¡MENSAJE DE OLOR!', [.3, 2.15, .6], lt - tm, 52, '#ffd640', true);
      cam([.1, 1.15, 11.0], [.1, 1.05, 0], 34);
      rotulo('No esconde su olor', 'lo usa para dejar mensajes', lt - c.w('esconde') + .2, RY);
    }
  });

  // ---------- 4 · el perro rasca con las patas de atrás: NO tapa, esparce su olor ----------
  escena('rasca', {
    setup() { set();
      this.d = PM.perroPM([.35, .02, .4], { pose: 'perfil', escala: 1.05 });
      this.ti = PM.tierrita([.0, .1, .45], 0x6ac25d, 10);
      this.ol = PM.olor([-.1, .15, .5], 0xc7e88a);
      this.no = PM.marca([-.85, 1.55, .6], false, .9); this.si = PM.marca([-.85, 1.55, .6], true, .9); },
    update(lt, c) {
      const t = tw(lt), tr = c.w('rasca') - .2, tn = c.w('tapa') - .55, te = c.w('esparce') - .2;
      const kr = t > tr ? cl((t - tr) / .2) : 0;
      A.rasca(this.d, t, kr); A.parpadea(this.d, t, 1.3); A.cola(this.d, t, 16, .3, .35);
      this.ti.update(t, kr, -1, .45, 1.0);
      this.ol.update(t, t > te ? cl((t - te) / .3) : 0, -.9);
      const kn = t > tn && t < te ? eout(cl((t - tn) / .25)) : 0, ks = t > te ? eout(cl((t - te) / .25)) : 0;
      this.no.visible = kn > 0; this.no.scale.setScalar(.9 * kn); this.si.visible = ks > 0; this.si.scale.setScalar(.9 * ks);
      if (kn > 0) c.ev('zap', tn, .5); if (ks > 0) c.ev('ding', te, .6);
      if (t > tn && t < te) etiqueta('NO TAPA', [.35, -.3, .6], lt - tn, 60, '#ff6b5b', true);
      if (t > te) etiqueta('¡ESPARCE SU OLOR!', [.2, -.3, .6], lt - te, 58, '#ffd640', true);
      cam([.2, 1.0, 9.4], [.2, .9, 0], 34);
      rotulo('Rasca con las patas', 'no tapa: esparce su olor', lt - tr + .1, RY);
    }
  });

  // ---------- 5 · truco y remate: premio al usar el tapete; perro y gato en casa ----------
  escena('remate', {
    setup() { set();
      this.tp = PM.tapete([-1.1, .02, .35], { w: 1.2 });
      this.d = PM.perroPM([-1.1, .1, .45], { pose: 'frente', escala: .66 });
      this.p = PM.chibi([.1, .02, .25], { logo: true, boca: 'feliz', mira: -1, escala: .9 });
      this.ga = PM.pz(F.circ(.11), 0xd39a52, [0, -.62, .12], this.p.brazos[0], { tinta: .012, papel: .03 });
      for (const [x, y] of [[-.04, .03], [.04, -.02], [.0, -.05]]) PM.det(F.circ(.018), 0x6b3f1e, [x, y, .016], this.ga);
      this.ar = PM.arenero([1.3, .02, .35], { w: .95 });
      this.g = PM.gatoPM([1.3, .4, .3], { pose: 'frente', escala: .55 });
      this.cs = corazones(); },
    update(lt, c) {
      const t = tw(lt), tpm = c.w('premios') - .2, tms = c.w('mándaselo') - .2;
      const kp = t > tpm ? eout(cl((t - tpm) / .4)) : 0;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .9 * kp + Math.sin(t * 5) * .06; A.parpadea(this.p, t, .8); this.p.head.rotation.z = -.06 + Math.sin(t * 3) * .04;
      if (t > tms) this.p.boca('abierta');
      A.parpadea(this.d, t, 1.9); A.cola(this.d, t, 18, .38, .2); this.d.position.y = .1 + (kp > 0 ? Math.abs(Math.sin(t * 9)) * .05 : 0);
      A.parpadea(this.g, t, .3); A.cola(this.g, t, 3, .12, 0); this.g.head.rotation.z = this.g.head.r0 + Math.sin(t * 2.2) * .06;
      if (kp > .5) animaCorazones(this.cs, t, -1.1, 1.45);
      if (kp > 0) c.ev('pop', tpm, .5);
      if (t > tpm) etiqueta('¡PREMIO!', [-.8, -.4, .6], lt - tpm, 54, '#ffd640', true);
      if (t > tms) etiqueta('PERRO + GATO', [.95, -.4, .6], lt - tms, 50, '#ffffff', true);
      cam([.1, 1.2, 12.6], [.1, 1.1, 0], 34);
      rotulo('Truco: dale premio', 'si tienes perro y gato', lt - .1, RY);
    }
  });
  P.cierre();
}
