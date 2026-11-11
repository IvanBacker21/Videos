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
    setup() { set(); this.p = PM.chibi([-.85, .02, .3], { logo: true, boca: 'abierta', mira: 1 }); this.d = PM.perroPM([3.2, .02, .4], { pose: 'perfil', escala: .9 }); this.d.scale.x = -.9; },
    update(lt, c) {
      const t = tw(lt), ll = 1.4, u = cl(t / ll);
      this.d.position.x = lerp(3.2, .95, eout(u)); A.anda(this.d, t, u < 1 ? 1 : 0); A.cola(this.d, t, 16, .4, .1); A.parpadea(this.d, t, 1.1);
      A.saluda(this.p, t); A.parpadea(this.p, t); this.p.head.rotation.z = .04 + Math.sin(t * 3) * .03;
      const ts = c.w('siempre') - .25;
      if (t > ts) { this.d.head.rotation.z = this.d.head.r0 - .22 * eout(cl((t - ts) / .3)); etiqueta('¿FELIZ?', [.95, 2.15, .5], lt - c.w('feliz'), 62, '#ffffff', true); etiqueta('NO SIEMPRE', [0, -.15, .6], lt - ts, 68, '#ffd640', true); c.ev('pop', ts); }
      else etiqueta('¿FELIZ?', [.95, 2.15, .5], lt - c.w('feliz'), 62, '#ffffff', true);
      cam([.05, 1.25, lerp(9.6, 8.8, ease(lt / 3))], [.05, 1.15, 0], 34);
      rotulo('¿Mueve la cola', 'porque está feliz?', lt - .1, RY);
    }
  });

  // ---------- 2 · a SU derecha (la izquierda de la pantalla): contento, corazones ----------
  escena('derecha', {
    setup() { set(); this.d = PM.perroPM([0, .02, .4], { pose: 'frente', escala: 1.25, inclina: .08 }); this.d.scale.x = -1.25; this.cs = corazones(null); },
    update(lt, c) {
      const t = tw(lt), td = c.w('derecha') - .3;
      A.cola(this.d, t, 18, .38, t > td ? .35 : 0); A.parpadea(this.d, t, .6);
      this.d.position.y = .02 + Math.abs(Math.sin(t * 9)) * .06; this.d.head.rotation.z = -(.08 + Math.sin(t * 4.5) * .06);
      if (t > c.w('contento') - .2) animaCorazones(this.cs, t, 0, 2.05);
      cam([0, 1.15, 8.0], [0, 1.05, 0], 34);
      if (t > td) { etiqueta('← SU DERECHA', [-.35, -.1, .6], lt - td, 56, '#ffffff', true); c.ev('ding', td, .6); }
      if (t > c.w('reconoce') - .2) etiqueta('¡TE RECONOCE!', [0, 2.55, .5], lt - c.w('reconoce') + .2, 60, '#ffd640', true);
      rotulo('Cola hacia SU derecha', 'está contento', lt - c.w('derecha') + .2, RY);
    }
  });

  // ---------- 3 · a SU izquierda: nervioso (llega un desconocido, orejas atrás) ----------
  escena('izquierda', {
    setup() { set(); this.d = PM.perroPM([-.45, .02, .4], { pose: 'frente', escala: 1.1 }); this.x = PM.chibi([3.4, .02, .2], { ropa: 0xffa53a, pantalon: 0x4a3b2a, tenis: 0x8a5a3a, piel: 0xc98b62, gorra: 0x3f8f6a, colPelo: 0x23160e, boca: 'feliz', mira: -1 }); this.x.scale.x = -1;
      this.r = rayitas([-.45, 2.45, .5], 3, 0x3a6fd6); this.r.visible = false; },
    update(lt, c) {
      const t = tw(lt), ti = c.w('izquierda') - .3, tn = c.w('nervioso') - .3;
      const u = cl(t / 1.6); this.x.position.x = lerp(3.4, 1.35, eout(u)); A.anda(this.x, t, u < 1 ? 1 : 0); A.parpadea(this.x, t, 2);
      const nerv = cl((t - .5) / .5);
      A.orejas(this.d, nerv); A.cola(this.d, t, 9, .16, -.45 * nerv); A.parpadea(this.d, t, 1.7);
      this.d.head.rotation.z = this.d.head.r0 - .12 * nerv; (this.d.head.ojos ?? []).forEach(e => e.position.x += 0);
      this.d.position.x = -.45 + (t > tn ? Math.sin(t * 40) * .015 : 0);
      this.r.visible = t > tn; if (t > tn) c.ev('zap', tn, .5);
      cam([.3, 1.15, 9.2], [.3, 1.05, 0], 34);
      if (t > ti) { etiqueta('SU IZQUIERDA →', [-.1, -.25, .6], lt - ti, 54, '#ffffff', true); c.ev('pop', ti); }
      if (t > tn) etiqueta('¡NERVIOSO!', [-.45, 2.45, .5], lt - tn, 60, '#7fc8ff', true);
      rotulo('Cola hacia SU izquierda', 'algo lo pone nervioso', lt - ti + .1, RY);
    }
  });

  // ---------- 4 · gato: llega de perfil, se voltea como cartulina y azota la cola ----------
  escena('gato', {
    setup() { set(); this.gp = PM.gatoPM([-3.2, .02, .4], { pose: 'perfil', escala: 1.15 }); this.gf = PM.gatoPM([0, .02, .4], { pose: 'frente', escala: 1.25, collar: true }); this.gf.visible = false;
      this.r = rayitas([.55, 2.5, .5], 3, 0xe0453a); this.r.visible = false; },
    update(lt, c) {
      const t = tw(lt), tv = c.w('revés') - .35, ta = c.w('azota') - .25;
      const u = cl(t / 1.5); this.gp.position.x = lerp(-3.2, .1, eout(u)); A.anda(this.gp, t, u < 1 ? 1 : 0); A.cola(this.gp, t, 5, .12, 0); A.parpadea(this.gp, t, .4);
      const kv = cl((t - tv) / .5);                                          // vuelta de cartulina: perfil → frente
      if (kv < .5) { this.gp.visible = true; this.gf.visible = false; A.voltea(this.gp, kv, 1); }
      else { this.gp.visible = false; this.gf.visible = true; A.voltea(this.gf, kv, -1); }
      if (kv > 0 && kv < 1) c.ev('whoosh', tv, .5);
      const eno = cl((t - ta) / .3);
      A.cola(this.gf, t, eno > 0 ? 26 : 4, eno > 0 ? .45 : .1, 0); A.orejas(this.gf, eno); A.parpadea(this.gf, t, 2.4);
      (this.gf.head.ojos ?? []).forEach(e => e.scale.y = Math.min(e.scale.y, 1 - .4 * eno));
      this.r.visible = eno > 0; if (eno > 0) c.ev('impact', ta, .5);
      cam([.05, 1.0, 8.4], [.05, .95, 0], 34);
      if (t > tv) etiqueta('GATOS: AL REVÉS', [0, 2.45, .5], lt - tv, 58, '#ffffff', true);
      if (eno > 0) etiqueta('¡MOLESTO!', [.95, 2.1, .6], lt - ta, 62, '#ff6b5b', true);
      rotulo('Cola que azota rápido', 'gato molesto', lt - c.w('azota') + .3, RY);
    }
  });

  // ---------- 5 · remate: los tres juntos; el perro feliz a su derecha ----------
  escena('remate', {
    setup() { set(); this.p = PM.chibi([-.25, .02, .3], { logo: true, boca: 'abierta', mira: -1 }); this.d = PM.perroPM([-1.45, .02, .45], { pose: 'perfil', escala: .8 });
      this.g = PM.gatoPM([1.3, .02, .45], { pose: 'frente', escala: .8 }); this.cs = corazones(null); },
    update(lt, c) {
      const t = tw(lt);
      A.cola(this.d, t, 18, .4, .2); A.parpadea(this.d, t, .3); this.d.position.y = .02 + Math.abs(Math.sin(t * 9)) * .04;
      A.cola(this.g, t, 3, .12, 0); A.parpadea(this.g, t, 1.5); this.g.head.rotation.z = this.g.head.r0 + Math.sin(t * 2.2) * .06;
      A.parpadea(this.p, t, .9); this.p.brazos[0].rotation.z = -2.4 + Math.sin(t * 6) * .12; this.p.head.rotation.z = .05 + Math.sin(t * 3) * .03;
      animaCorazones(this.cs, t, -1.4, 1.6);
      cam([0, 1.25, 10.2], [0, 1.15, 0], 34);
      etiqueta('¿HACIA DÓNDE LA MUEVE?', [0, -.5, .6], lt - .2, 52, '#ffd640', true); c.ev('pop', .2);
      rotulo('Fíjate hoy', 'y mándaselo a quien tenga perro', lt - .05, RY);
    }
  });
  P.cierre();
}
