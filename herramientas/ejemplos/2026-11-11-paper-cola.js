// Short de PRUEBA en estilo CARTULINA CHIBI (tipo papel "Paper Mario", personajes propios): ¿Tu perro mueve la cola porque está feliz?
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-11-paper-cola.json OUT ../ejemplos/2026-11-11-paper-cola.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw, rayitas } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600;
  const set = () => { ambiente({ top: 0xa9dcf5, bottom: 0xa9dcf5, fog: 0xa9dcf5, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const corazones = (par) => [0, 1, 2].map(i => { const c = PM.pz(F.corazon(.5), 0xff5d8f, [0, 0, .5], par, { tinta: .015, papel: .04 }); c.visible = false; c.i = i; return c; });
  const animaCorazones = (cs, t, x0, y0) => cs.forEach(c => { const k = ((t * .9 + c.i / 3) % 1); c.visible = true; c.position.set(x0 + Math.sin(k * 6 + c.i * 2) * .25 + (c.i - 1) * .35, y0 + k * .75, .5); c.scale.setScalar(Math.sin(k * Math.PI) * .9 + .05); });

  // ---------- 1 · gancho: el perro llega moviendo la cola; el protagonista saluda ----------
  escena('gancho', {
    setup() { set(); this.p = PM.chibi([-1.05, .02, .3], { logo: true, boca: 'abierta', mira: 1 }); this.d = PM.perroPM([3.6, .02, .4], { pose: 'perfil', escala: .85 }); this.d.scale.x = -.85; },
    update(lt, c) {
      const t = tw(lt), ll = 1.4, u = cl(t / ll);
      this.d.position.x = lerp(3.6, .62, eout(u)); A.anda(this.d, t, u < 1 ? 1 : 0); A.cola(this.d, t, 16, .4, .1); A.parpadea(this.d, t, 1.1);
      A.saluda(this.p, t); A.parpadea(this.p, t); this.p.head.rotation.z = .04 + Math.sin(t * 3) * .03;
      const ts = c.w('siempre') - .25;
      if (t > ts) { this.d.head.rotation.z = this.d.head.r0 - .22 * eout(cl((t - ts) / .3)); etiqueta('¿FELIZ?', [.25, 1.95, .5], lt - c.w('feliz'), 58, '#ffffff', true); etiqueta('NO SIEMPRE', [0, -.15, .6], lt - ts, 68, '#ffd640', true); c.ev('pop', ts); }
      else etiqueta('¿FELIZ?', [.25, 1.95, .5], lt - c.w('feliz'), 58, '#ffffff', true);
      cam([.0, 1.35, lerp(11.4, 10.8, ease(lt / 3))], [.0, 1.25, 0], 34);
      rotulo('¿Mueve la cola', 'porque está feliz?', lt - .1, RY);
    }
  });

  // ---------- 2 · a SU derecha (la izquierda de la pantalla): contento, corazones ----------
  escena('derecha', {
    setup() { set(); this.d = PM.perroPM([.1, .02, .4], { pose: 'frente', escala: 1.1, inclina: .08 }); this.d.scale.x = -1.1; this.cs = corazones(null); },
    update(lt, c) {
      const t = tw(lt), td = c.w('derecha') - .3;
      A.cola(this.d, t, 18, t > td ? .42 : .3, t > td ? -.38 : -.2); A.parpadea(this.d, t, .6);
      this.d.position.y = .02 + Math.abs(Math.sin(t * 9)) * .06; this.d.head.rotation.z = -(.08 + Math.sin(t * 4.5) * .06);
      if (t > c.w('contento') - .2) animaCorazones(this.cs, t, .95, 1.2);
      cam([0, 1.2, 9.6], [0, 1.1, 0], 34);
      if (t > td) { etiqueta('← SU DERECHA', [-.35, -.35, .6], lt - td, 56, '#ffffff', true); c.ev('ding', td, .6); }
      if (t > c.w('reconoce') - .2) etiqueta('¡TE RECONOCE!', [.1, 2.3, .6], lt - c.w('reconoce') + .2, 60, '#ffd640', true);
      rotulo('Cola hacia SU derecha', 'está contento', lt - c.w('derecha') + .2, RY);
    }
  });

  // ---------- 3 · a SU izquierda: nervioso (llega un desconocido, orejas atrás) ----------
  escena('izquierda', {
    setup() { set(); this.d = PM.perroPM([-.75, .02, .4], { pose: 'frente', escala: 1.0 }); this.x = PM.chibi([3.4, .02, .2], { ropa: 0xffa53a, pantalon: 0x4a3b2a, tenis: 0x8a5a3a, piel: 0xc98b62, gorra: 0x3f8f6a, colPelo: 0x23160e, boca: 'feliz', mira: -1 }); this.x.scale.x = -1;
      this.r = rayitas([-1.3, 1.75, .5], 3, 0x3a6fd6); this.r.visible = false;
      const h = this.d.head; this.pre = [PM.det(P.F.elipse(.075, .07), 0xfaf6ec, [0, -.29, .036], h), PM.det(P.F.rect(.11, .02, .006), P.INK, [0, -.25, .042], h),
        ...[-1, 1].map(sx => PM.det(P.F.rect(.13, .034, .01), 0x5d6472, [sx * .19, .23, .04], h, -sx * .45)), PM.det(P.F.elipse(.035, .055), 0x8fd3ff, [.4, .22, .045], h)];
      this.pre.forEach(m => m.visible = false); },
    update(lt, c) {
      const t = tw(lt), ti = c.w('izquierda') - .3, tn = c.w('nervioso') - .3;
      const u = cl(t / 1.6); this.x.position.x = lerp(3.4, 1.05, eout(u)); A.anda(this.x, t, u < 1 ? 1 : 0); A.parpadea(this.x, t, 2);
      const nerv = cl((t - .5) / .5);
      A.orejas(this.d, nerv); this.pre.forEach(m => m.visible = nerv > .5); if (this.pre[4]) this.pre[4].position.y = .22 - ((t * .6) % .3); A.cola(this.d, t, 9, .16, -.45 * nerv); A.parpadea(this.d, t, 1.7);
      this.d.head.rotation.z = this.d.head.r0 - .12 * nerv; (this.d.head.ojos ?? []).forEach(e => e.position.x += 0);
      this.d.position.x = -.75 + (t > tn ? Math.sin(t * 40) * .015 : 0);
      this.r.visible = t > tn; if (t > tn) c.ev('zap', tn, .5);
      cam([.15, 1.25, 10.6], [.15, 1.15, 0], 34);
      if (t > ti) { etiqueta('SU IZQUIERDA →', [-.35, -.35, .6], lt - ti, 54, '#ffffff', true); c.ev('pop', ti); }
      if (t > tn) etiqueta('¡NERVIOSO!', [-.75, 2.25, .6], lt - tn, 60, '#7fc8ff', true);
      rotulo('Cola hacia SU izquierda', 'algo lo pone nervioso', lt - ti + .1, RY);
    }
  });

  // ---------- 4 · gato: llega de perfil, se voltea como cartulina y azota la cola ----------
  escena('gato', {
    setup() { set(); this.gp = PM.gatoPM([-3.2, .02, .4], { pose: 'perfil', escala: 1.15 }); this.gf = PM.gatoPM([-.15, .02, .4], { pose: 'frente', escala: 1.1, collar: true }); this.gf.visible = false;
      this.r = rayitas([-.95, 1.85, .5], 3, 0xe0453a); this.r.visible = false;
      this.ceno = (this.gf.head.ojos ?? []).map((e, i) => PM.det(P.F.rect(.3, .12, .02), 0x2b2833, [0, .1, .012], e, i === 0 ? -.5 : .5)); this.ceno.forEach(m => m.visible = false); },
    update(lt, c) {
      const t = tw(lt), tv = c.w('revés') - .35, ta = c.w('azota') - .25;
      const u = cl(t / 1.5); this.gp.position.x = lerp(-3.4, -.1, eout(u)); A.anda(this.gp, t, u < 1 ? 1 : 0); A.cola(this.gp, t, 5, .12, 0); A.parpadea(this.gp, t, .4);
      const kv = cl((t - tv) / .5);                                          // vuelta de cartulina: perfil → frente
      if (kv < .5) { this.gp.visible = true; this.gf.visible = false; A.voltea(this.gp, kv, 1); }
      else { this.gp.visible = false; this.gf.visible = true; A.voltea(this.gf, kv, -1); }
      if (kv > 0 && kv < 1) c.ev('whoosh', tv, .5);
      const eno = cl((t - ta) / .3);
      A.cola(this.gf, t, eno > 0 ? 26 : 4, eno > 0 ? .42 : .1, eno > 0 ? -.4 : -.1); A.orejas(this.gf, eno); A.parpadea(this.gf, t, 2.4);
      (this.gf.head.ojos ?? []).forEach(e => e.scale.y = Math.min(e.scale.y, 1 - .15 * eno)); this.ceno.forEach(m => m.visible = eno > .3);
      this.r.visible = eno > 0; if (eno > 0) c.ev('impact', ta, .5);
      cam([0, 1.15, 9.6], [0, 1.05, 0], 34);
      if (t > tv) etiqueta('GATOS: AL REVÉS', [-.15, 2.2, .6], lt - tv, 58, '#ffffff', true);
      if (eno > 0) etiqueta('¡MOLESTO!', [-.15, -.3, .6], lt - ta, 62, '#ff6b5b', true);
      rotulo('Cola que azota rápido', 'gato molesto', lt - c.w('azota') + .3, RY);
    }
  });

  // ---------- 5 · remate: los tres juntos; el perro feliz a su derecha ----------
  escena('remate', {
    setup() { set(); this.p = PM.chibi([.3, .02, .3], { logo: true, boca: 'abierta', mira: -1 }); this.d = PM.perroPM([-1.25, .02, .45], { pose: 'perfil', escala: .72 });
      this.g = PM.gatoPM([1.45, .02, .45], { pose: 'frente', escala: .72 }); this.cs = corazones(null); },
    update(lt, c) {
      const t = tw(lt);
      A.cola(this.d, t, 18, .4, .2); A.parpadea(this.d, t, .3); this.d.position.y = .02 + Math.abs(Math.sin(t * 9)) * .04;
      A.cola(this.g, t, 3, .12, 0); A.parpadea(this.g, t, 1.5); this.g.head.rotation.z = this.g.head.r0 + Math.sin(t * 2.2) * .06;
      A.parpadea(this.p, t, .9); this.p.brazos[0].rotation.z = -2.4 + Math.sin(t * 6) * .12; this.p.head.rotation.z = .05 + Math.sin(t * 3) * .03;
      animaCorazones(this.cs, t, -.75, 1.35);
      cam([.05, 1.35, 12.6], [.05, 1.25, 0], 34);
      etiqueta('¿HACIA DÓNDE LA MUEVE?', [.05, -.4, .6], lt - .2, 52, '#ffd640', true); c.ev('pop', .2);
      rotulo('Fíjate hoy', 'y mándaselo a quien tenga perro', lt - .05, RY);
    }
  });
  P.cierre();
}
