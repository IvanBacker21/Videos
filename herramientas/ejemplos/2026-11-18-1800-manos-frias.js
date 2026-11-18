// Short 18-nov 18:00 · CARTULINA CHIBI: ¿Por qué con el frío se te congelan primero las manos? (vasoconstricción: el cuerpo aprieta
// los tubitos de manos y pies para guardar la sangre caliente en corazón y cerebro; truco: abrigar pecho y cuello)
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-18-1800-manos-frias.json OUT ../ejemplos/2026-11-18-1800-manos-frias.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xbfe3f5, ROJO = 0xff4d5e, NAR = 0xff9a3d;
  const set = () => { ambiente({ top: CIELO, bottom: CIELO, fog: CIELO, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const vaho = (p, n = 5) => PM.aliento([.3, -.27, .05], p.head, { n });
  const copos = (n = 12) => PM.copos({ n, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
  // brazos: k 0 = abajo, 1 = levantados a los lados enseñando las manos
  const brazos = (p, t, k0, k1, a = 2.0) => { p.brazos[0].rotation.z = lerp(p.brazos[0].r0, -a, k0) + Math.sin(t * 4) * .04; p.brazos[1].rotation.z = lerp(p.brazos[1].r0, a, k1) + Math.sin(t * 3 + 1) * .04; };
  // bolitas sueltas (sangre / calor) que viajan entre dos puntos del mundo
  const bolitas = (n, color, r = .07) => Array.from({ length: n }, (_, i) => { const b = P.pieza(F.circ(r), color, [0, -5, .8], null, { borde: .025, sombra: false }); b.i = i; b.visible = false; return b; });
  const V = new THREE.Vector3(), mundo = (o) => { o.updateWorldMatrix(true, false); o.getWorldPosition(V); return [V.x, V.y]; };
  const viaja = (b, a, z, k, arco = .3) => { b.visible = k > 0 && k < 1; const kk = ease(cl(k)); b.position.set(lerp(a[0], z[0], kk), lerp(a[1], z[1], kk) + Math.sin(kk * Math.PI) * arco, .8); b.scale.setScalar(Math.max(.001, Math.sin(cl(k) * Math.PI) * .6 + .5)); };

  // ---------- 1 · gancho: manos heladas ----------
  escena('gancho', {
    setup() { set(); this.cp = copos(16);
      this.p = PM.chibi([-.35, .02, .3], { logo: true, boca: 'abierta', mira: 1 }); this.mf = PM.manosFrias(this.p); this.va = vaho(this.p, 6);
      this.q = PM.pregunta([.9, 2.15, .5], .8, 0xffc83d); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('congelan') - .1, tm = c.w('manos?') - .15; this.cp.update(t);
      A.parpadea(this.p, t + 1.3, .6); A.tiembla(this.p, t, .6, -.35); habla(this.p, t); A.preocupa(this.p, eout(cl((t - .3) / .5)));
      brazos(this.p, t, eout(cl((t - .05) / .4)), eout(cl((t - .15) / .4)), 1.75);
      this.mf.update(ease(cl((t - .2) / (tc + .3 - .2))));
      this.va.update(t + .5, 1, 1, .95, 1.1);
      this.q.scale.setScalar(pop(t, tc, .35) * .8); this.q.rotation.z = Math.sin(t * 3) * .12;
      c.ev('whoosh', .05, .4); if (t > tc) c.ev('pop', tc, .5); if (t > tm) c.ev('ding', tm, .4);
      cam([.1, 1.2, lerp(10.9, 10.4, ease(lt / 3))], [.1, 1.15, 0], 34);
      etiqueta('BRRR…', [-.35, -.2, .7], lt - .1, 56, '#ffffff', true);
      if (t > tm) etiqueta('¡HELADAS!', [.75, .55, .7], lt - tm, 56, '#ffd640', true);
      rotulo('¿Por qué se te congelan', 'primero las manos?', lt - .05, RY);
    }
  });

  // ---------- 2 · rayos X: el cuerpo aprieta los tubitos de la mano ----------
  escena('tubitos', {
    setup() { set(); this.cp = copos(8);
      this.p = PM.chibi([-.98, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .78 }); this.mf = PM.manosFrias(this.p);
      this.rx = PM.vasosRayosX([.42, 1.22, .2], .95); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('aprieta') - .1, ts = c.w('sangre') - .1, tm = c.w('manos') - .15, tp = c.w('pies.'); this.cp.update(t, .6);
      A.parpadea(this.p, t, 1.2); habla(this.p, t); A.tiembla(this.p, t, .3, -.98);
      brazos(this.p, t, 0, eout(cl((t - .1) / .4)) * .75, 2.0);
      this.rx.scale.setScalar(pop(t, 0, .35) * .95); this.rx.rotation.z = Math.sin(t * 1.6) * .02;
      const ka = ease(cl((t - ta) / (ts + .4 - ta)));
      this.rx.aprieta(ka); this.rx.flujo(t, 1 - ka * .6, 1);
      const kf = ease(cl((t - tm) / (tp - tm + .3))); this.rx.frio(kf); this.mf.update(.3 + .7 * kf);
      A.preocupa(this.p, kf);
      if (t > ta) c.ev('whoosh', ta, .4); if (t > tm) c.ev('pop', tm, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > ta) etiqueta('¡SE APRIETAN!', [.42, -.22, .7], lt - ta, 50, '#ffd640', true);
      rotulo('Tu cuerpo aprieta', 'los tubitos de sangre', lt - .1, RY);
    }
  });

  // ---------- 3 · la sangre calientita se queda en corazón y cerebro ----------
  escena('centro', {
    setup() { set(); this.cp = copos(8);
      this.p = PM.chibi([-.9, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .82 }); this.mf = PM.manosFrias(this.p); this.mf.update(1);
      this.co = PM.astro([.62, 1.0, .3], .42, 0xff5d6c, { forma: F.corazon(1.25), expr: 'feliz' });
      this.ce = PM.cerebro([.66, 2.08, .3], .36, { expr: 'feliz' });
      this.halos = [this.co, this.ce].map(o => { const h = P.pieza(F.circ(.62), 0xffd08a, [0, 0, -.45], o, { sombra: false }); return h; });
      this.go = bolitas(6, ROJO); },
    update(lt, c) {
      const t = tw(lt), tca = c.w('calientita') - .15, tco = c.w('corazón') - .15, tce = c.w('cerebro.') - .15; this.cp.update(t, .6);
      A.parpadea(this.p, t + .5, 1.5); habla(this.p, t); A.tiembla(this.p, t, .25, -.9);
      brazos(this.p, t, eout(cl((t - .1) / .4)) * .45, eout(cl((t - .1) / .4)) * .45, 2.0);
      this.co.scale.setScalar(pop(t, tca - .1, .35)); this.ce.scale.setScalar(pop(t, tce - .25, .35));
      this.co.rotation.z = Math.sin(t * 2.2) * .06; this.ce.rotation.z = Math.sin(t * 2.2 + 1.4) * .06;
      if (t > tco - .2) A.parpadea(this.co, t, .4); if (t > tce - .2) A.parpadea(this.ce, t + .9, .8);
      this.halos.forEach((h, i) => { const k = cl((t - [tca + .2, tce][i]) / .4); h.visible = k > 0; h.scale.setScalar(Math.max(.001, k * (1 + .08 * Math.sin(t * 8 + i)))); });
      // gotitas de sangre que salen de las manos y van al corazón y al cerebro
      const manos = this.mf.manos.map(mundo), dest = [[.62, 1.0], [.66, 2.08]];
      this.go.forEach(b => { const d = b.i < 3 ? 0 : 1, t0 = (d ? tce - .35 : tca + .15) + (b.i % 3) * .22; viaja(b, manos[b.i % 2], dest[d], (t - t0) / .7, .45); });
      if (t > tca) c.ev('pop', tca - .1, .4); if (t > tce) c.ev('pop', tce - .25, .4); if (t > tca) c.ev('whoosh', tca, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tce) etiqueta('¡CALIENTITOS!', [.5, -.22, .7], lt - tce, 50, '#ffd640', true);
      rotulo('Guarda la sangre', 'para corazón y cerebro', lt - .1, RY);
    }
  });

  // ---------- 4 · truco: abrigar pecho y cuello; el calor regresa a los dedos ----------
  escena('truco', {
    setup() { set(); this.cp = copos(10);
      this.p = PM.chibi([-.3, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .95 }); this.mf = PM.manosFrias(this.p);
      this.ch = PM.chamarra(this.p, 0x2ec4a6); this.bu = PM.bufanda(this.p, 0xff6b5b);
      this.ca = bolitas(6, NAR, .08); this.ok = PM.marca([.95, 2.1, .5], true, .7); },
    update(lt, c) {
      const t = tw(lt), tpe = c.w('pecho') - .15, tcu = c.w('cuello,') - .15, tca = c.w('calor') - .15, tre = c.w('regresa'), tde = c.w('dedos.'); this.cp.update(t, .6);
      A.parpadea(this.p, t + 2, .9); habla(this.p, t);
      this.ch.scale.setScalar(pop(t, tpe, .3)); this.bu.scale.setScalar(pop(t, tcu, .3)); this.bu.mece(t);
      const kd = ease(cl((t - tre) / (tde + .4 - tre)));
      this.mf.update(1 - kd); A.tiembla(this.p, t, (1 - cl((t - tpe) / .8)) * .5, -.3); A.preocupa(this.p, .8 * (1 - cl((t - tpe) / .6)));
      this.p.boca(t > tre ? 'feliz' : 'abierta');
      brazos(this.p, t, eout(cl((t - tca + .3) / .4)) * .6, eout(cl((t - tca + .3) / .4)) * .6, 2.0);
      // calorcito naranja del pecho a las manos
      const pecho = mundo(this.ch), manos = this.mf.manos.map(mundo);
      this.ca.forEach(b => { const t0 = tca + Math.floor(b.i / 2) * .3; viaja(b, pecho, manos[b.i % 2], (t - t0) / .6, .15); });
      this.ok.scale.setScalar(pop(t, tde, .35) * .7);
      if (t > tpe) c.ev('pop', tpe, .4); if (t > tcu) c.ev('pop', tcu, .4); if (t > tca) c.ev('whoosh', tca, .4); if (t > tde) c.ev('ding', tde, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tcu && t < tre) etiqueta('PECHO Y CUELLO', [-.3, -.22, .7], lt - tcu, 48, '#ffffff', true);
      if (t > tre) etiqueta('¡DEDOS CALIENTITOS!', [-.1, -.22, .7], lt - tre, 44, '#ffd640', true);
      if (t < tca) rotulo('Truco: abrígate', 'el pecho y el cuello', lt - .1, RY); else rotulo('Y el calor regresa', 'a tus dedos', lt - tca, RY);
    }
  });

  // ---------- 5 · remate: manos heladas en la espalda; mándaselo ----------
  escena('remate', {
    setup() { set(); this.cp = copos(8);
      this.p = PM.chibi([.62, .02, .3], { logo: true, boca: 'feliz', mira: -1, escala: .9 });
      this.ag = PM.chibi([-.8, .02, .5], { ropa: 0xff6b5b, pantalon: 0x3d3a5a, pelo: 'cola', colPelo: 0x4a2a18, boca: 'feliz', mira: 1, escala: .85 });
      this.mf = PM.manosFrias(this.ag); this.mf.update(1); },
    update(lt, c) {
      const t = tw(lt), tma = c.w('Mándaselo') - .1, tm = c.w('manos') - .2, te = c.w('espalda.') - .25; this.cp.update(t, .6);
      A.parpadea(this.p, t, .3); A.parpadea(this.ag, t, 1.9); this.ag.head.rotation.z = this.ag.head.r0 + Math.sin(t * 2.5) * .05;
      // la amiga estira el brazo con la mano helada hasta la espalda del protagonista
      const kx = ease(cl((t - tma - .2) / (tm - tma))); this.ag.position.x = lerp(-.8, -.28, kx); this.ag.position.y = .02 + Math.abs(Math.sin(t * 10)) * .04 * (kx > 0 && kx < 1 ? 1 : 0);   // se acerca de puntitas
      const kb = eout(cl((t - tm) / .5)); this.ag.brazos[1].rotation.z = lerp(this.ag.brazos[1].r0, 1.55, kb) + Math.sin(t * 5) * .03;
      this.ag.brazos[0].rotation.z = this.ag.brazos[0].r0 + Math.sin(t * 2.5) * .03;
      const kj = t > te ? Math.abs(Math.sin((t - te) * 9)) * Math.max(0, 1 - (t - te) * 1.1) : 0;
      this.p.position.y = .02 + kj * .35; this.p.boca(t > te ? 'abierta' : 'feliz'); A.preocupa(this.p, t > te ? 1 : 0);
      this.p.head.rotation.z = this.p.head.r0 + (t > te ? .2 : Math.sin(t * 2) * .04);
      this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -2.3, t > te ? eout(cl((t - te) / .2)) : 0); this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.3, t > te ? eout(cl((t - te) / .2)) : 0);
      this.ag.boca(t > te ? 'lengua' : 'feliz');
      if (t > tma) c.ev('pop', tma, .4); if (t > te) c.ev('pop', te, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t < te) etiqueta('MÁNDASELO', [-.3, -.22, .7], lt - tma, 50, '#ffd640', true);
      else etiqueta('¡AAAY!', [.75, 2.4, .7], lt - te, 60, '#ffffff', true);
      rotulo('Mándaselo a quien', 'te pone las manos heladas', lt - tma, RY);
    }
  });
  P.cierre();
}
