// Short 12-nov 13:30 · CARTULINA CHIBI: ¿Por qué tu perro ladea la cabeza cuando le hablas?
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-12-1330-perro-cabeza.json OUT ../ejemplos/2026-11-12-1330-perro-cabeza.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw, rayitas } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600;
  const set = () => { ambiente({ top: 0xa9dcf5, bottom: 0xa9dcf5, fog: 0xa9dcf5, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const corazones = () => [0, 1, 2].map(i => { const c = PM.pz(F.corazon(.45), 0xff5d8f, [0, 0, .5], null, { tinta: .015, papel: .04 }); c.visible = false; c.i = i; return c; });
  const animaCorazones = (cs, t, x0, y0) => cs.forEach(c => { const k = ((t * .9 + c.i / 3) % 1); c.visible = true; c.position.set(x0 + Math.sin(k * 6 + c.i * 2) * .2 + (c.i - 1) * .3, y0 + k * .7, .5); c.scale.setScalar(Math.sin(k * Math.PI) * .9 + .05); });
  // ladeo con rebote de cartulina: entra en .25 s y se queda; "sale" si se pide
  const kLadeo = (t, t0, t1 = 99) => t < t0 ? 0 : t < t1 ? spring(cl((t - t0) / .35), 1.3, 7) : 1 - eout(cl((t - t1) / .25));
  const habla = (p, t, fase = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + fase) * .05; p.brazos[0].rotation.z = p.brazos[0].r0 - .25 - Math.sin(t * 5) * .15; };

  // ---------- 1 · gancho: le hablas y ladea la cabeza ----------
  escena('gancho', {
    setup() { set(); this.p = PM.chibi([-.75, .02, .3], { logo: true, boca: 'abierta', mira: 1 }); this.d = PM.perroPM([.55, .02, .4], { pose: 'frente', escala: 1.0 });
      this.o = PM.ondas([-.25, 1.45, .6], 1); this.q = PM.pregunta([1.0, 2.2, .6], .9); this.q.visible = false; },
    update(lt, c) {
      const t = tw(lt), tl = c.w('ladea') - .2;
      habla(this.p, t); A.parpadea(this.p, t, .4); this.o.update(t, t < 2.6 ? 1 : 0);
      A.ladea(this.d, kLadeo(t, tl), 1); A.cola(this.d, t, 10, .2, 0); A.parpadea(this.d, t, 1.3);
      A.orejas(this.d, -.35 * cl((t - tl) / .3));
      this.q.visible = t > tl + .2; if (this.q.visible) { const s = spring(cl((t - tl - .2) / .4), 1.4, 7) * .9; this.q.scale.setScalar(Math.max(.01, s)); this.q.rotation.z = Math.sin(t * 4) * .12; }
      if (t > tl) c.ev('pop', tl);
      cam([-.05, 1.25, lerp(11.0, 10.5, ease(lt / 3))], [-.05, 1.15, 0], 34);
      rotulo('¿Por qué ladea', 'la cabeza?', lt - .1, RY);
    }
  });

  // ---------- 2 · ubica tu voz y ve tu cara por encima del hocico ----------
  escena('oido', {
    setup() { set(); this.d = PM.perroPM([.3, .02, .4], { pose: 'frente', escala: 1.1 }); this.p = PM.chibi([-1.2, .02, .1], { logo: true, boca: 'abierta', mira: 1, escala: .8 });
      this.o = PM.ondas([-.8, 1.25, .6], 1);
      this.vista = [0, 1, 2, 3, 4].map(i => { const m = PM.pz(F.rect(.13, .045, .01), 0xffc83d, [0, 0, .7], null, { tinta: .01, papel: .03 }); m.visible = false; m.i = i; return m; }); },
    update(lt, c) {
      const t = tw(lt), tv = c.w('voz') - .4, tc = c.w('cara') - .25;
      habla(this.p, t, 1); A.parpadea(this.p, t, 2.1); this.o.update(t, t < tc ? 1 : 0);
      // oye: orejas paradas y ladea hacia la voz; luego al otro lado para ver por encima del hocico
      const k1 = kLadeo(t, .5, tc), k2 = kLadeo(t, tc);
      A.ladea(this.d, k1 - k2 * 1.0, -1); A.orejas(this.d, -.4 * k1); A.parpadea(this.d, t, .8); A.cola(this.d, t, 9, .18, 0);
      // línea de mirada (sobre el hocico hacia la cara del protagonista)
      this.vista.forEach(m => { m.visible = t > tc + .15; const u = m.i / 4; m.position.set(lerp(.0, -1.0, u), lerp(1.6, 1.75, u), .7); m.rotation.z = -.1; });
      cam([-.27, 1.25, 10.6], [-.27, 1.15, 0], 34);
      if (t > tv) { etiqueta('UBICA TU VOZ', [-.25, .15, .7], lt - tv, 56, '#ffffff', true); c.ev('ding', tv, .6); }
      if (t > tc) { etiqueta('VE TU CARA', [-.4, 2.4, .7], lt - tc, 56, '#ffd640', true); c.ev('pop', tc); }
      rotulo('Ubica tu voz', 'y ve por encima del hocico', lt - .3, RY);
    }
  });

  // ---------- 3 · la ladea más con palabras que conoce: "¡PELOTA!" ----------
  escena('palabra', {
    setup() { set(); this.p = PM.chibi([-.8, .02, .3], { logo: true, boca: 'abierta', mira: 1 }); this.d = PM.perroPM([.6, .02, .4], { pose: 'frente', escala: 1.0 });
      this.b = PM.pelota([0, -.62, .1], .2, 0xff6b5b, this.p.brazos[1]);
      this.qs = [PM.pregunta([1.1, 2.15, .6], .7, 0xffc83d), PM.pregunta([1.3, 1.45, .6], .55, 0x7fc8ff)]; this.qs.forEach(q => q.visible = false);
      this.r = rayitas([.6, 2.4, .6], 3, 0xffc83d); this.r.visible = false; },
    update(lt, c) {
      const t = tw(lt), tl = c.w('ladean') - .2, tp = c.w('palabra') - .2, tj = c.w('juguete') - .25;
      A.parpadea(this.p, t, 1.2); this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 6) * .04;
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.75, eout(cl((t - tp + .3) / .35))) + Math.sin(t * 9) * .06 * (t > tp ? 1 : 0); this.b.rota(t);
      const lado = t < tj ? 1 : -1, k = t < tj ? kLadeo(t, tl) : kLadeo(t, tj);
      A.ladea(this.d, Math.min(1.25, k * (t > tp ? 1.2 : .8)), lado); A.orejas(this.d, -.45 * cl((t - tp) / .3)); A.parpadea(this.d, t, 2.0); A.cola(this.d, t, t > tj ? 16 : 8, .3, 0);
      this.qs[0].visible = t > tl + .15; this.qs[1].visible = t > tj + .1; this.qs.forEach((q, i) => q.rotation.z = Math.sin(t * 4 + i) * .15);
      this.r.visible = t > tj; if (t > tj) c.ev('ding', tj, .6);
      if (t > tl) c.ev('pop', tl);
      cam([-.05, 1.2, 10.6], [-.05, 1.1, 0], 34);
      if (t > tp) etiqueta('“¡PELOTA!”', [-.55, 2.45, .7], lt - tp, 58, '#ffffff', true);
      if (t > tj) etiqueta('PALABRA QUE CONOCE', [.0, -.35, .7], lt - tj, 50, '#ffd640', true);
      rotulo('La ladea más', 'con palabras que conoce', lt - c.w('estudio') + .1, RY);
    }
  });

  // ---------- 4 · tú lo premias ("¡ay, qué bonito!") y aprende a repetirlo ----------
  escena('premio', {
    setup() { set(); this.p = PM.chibi([-.8, .02, .3], { logo: true, boca: 'abierta', mira: 1, inclina: .1 }); this.d = PM.perroPM([.6, .02, .4], { pose: 'frente', escala: 1.0 }); this.cs = corazones(); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('¡ay') - .2, tr = c.w('aprende') - .2;
      A.parpadea(this.p, t, .7);
      const ab = eout(cl((t - ta + .1) / .3)); this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -1.0, ab); this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.0, ab);   // manos juntas de ternura
      this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 5) * .06 * (t > ta ? 1 : .4);
      // ladea, lo premias, y lo repite (izq-der-izq)
      const ciclo = t < tr ? kLadeo(t, .3) : Math.sin((t - tr) * 4.2);
      A.ladea(this.d, t < tr ? ciclo : Math.abs(ciclo), t < tr ? 1 : (Math.floor((t - tr) * 4.2 / Math.PI) % 2 ? -1 : 1)); A.parpadea(this.d, t, 1.6);
      A.cola(this.d, t, t > ta ? 20 : 10, t > ta ? .38 : .2, 0); this.d.position.y = .02 + (t > ta ? Math.abs(Math.sin(t * 9)) * .05 : 0);
      if (t > ta) { animaCorazones(this.cs, t, .0, 1.75); c.ev('pop', ta); }
      cam([-.05, 1.25, 10.6], [-.05, 1.15, 0], 34);
      if (t > ta) etiqueta('“¡AY, QUÉ BONITO!”', [-.3, 2.45, .7], lt - ta, 54, '#ffffff', true);
      if (t > tr) { etiqueta('¡LO REPITE!', [.5, -.3, .7], lt - tr, 60, '#ffd640', true); c.ev('ding', tr, .6); }
      rotulo('Tú lo premias', 'y aprende a repetirlo', lt - .2, RY);
    }
  });

  // ---------- 5 · remate: dile "paseo"; el perro ladea y brinca; la gata mira ----------
  escena('remate', {
    setup() { set(); this.p = PM.chibi([-1.1, .02, .3], { logo: true, boca: 'abierta', mira: 1 }); this.d = PM.perroPM([.25, .02, .45], { pose: 'frente', escala: .85 });
      this.g = PM.gatoPM([1.25, .02, .35], { pose: 'frente', escala: .7 }); this.o = PM.ondas([-.55, 1.5, .6], 1); this.cs = corazones(); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('paseo') - .2, tm = c.w('mándaselo') - .2;
      A.parpadea(this.p, t, .2); this.o.update(t, t > tp && t < tm ? 1 : 0);
      if (t < tm) habla(this.p, t); else { this.p.brazos[1].rotation.z = 2.3 + Math.sin(t * 6) * .12; this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 3) * .04; }   // señala a cámara / saluda
      const sal = t > tp + .9 ? Math.abs(Math.sin((t - tp - .9) * 7)) * .35 : 0;
      A.ladea(this.d, t > tp + .9 ? .2 : kLadeo(t, tp), 1); this.d.position.y = .02 + sal; A.cola(this.d, t, t > tp ? 22 : 8, t > tp ? .4 : .2, 0); A.parpadea(this.d, t, 1.0);
      if (t > tp + .9) { animaCorazones(this.cs, t, .25, 1.6); c.ev('pop', tp + .9); }
      A.parpadea(this.g, t, 2.6); A.cola(this.g, t, 3, .12, 0); this.g.head.rotation.z = this.g.head.r0 + Math.sin(t * 2.2) * .06 + (t > tp ? -.2 : 0);
      cam([.0, 1.3, 12.0], [.0, 1.2, 0], 34);
      if (t > tp) etiqueta('“¿PASEO?”', [-.75, 2.55, .7], lt - tp, 58, '#ffffff', true);
      if (t > tm) etiqueta('¿Y EL TUYO?', [.2, -.35, .7], lt - tm, 60, '#ffd640', true);
      rotulo('Pruébalo hoy', 'y mándaselo a quien le habla como a bebé', lt - .05, RY);
    }
  });
  P.cierre();
}
