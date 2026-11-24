// Short 24-nov 13:30 · CARTULINA CHIBI: ¿por qué con guantes tu celular no te hace caso?
// Las pantallas táctiles son capacitivas: detectan el cambio eléctrico que produce el dedo (la piel conduce), no la presión.
// La tela del guante es aislante y bloquea esa señal; los guantes táctiles llevan hilos conductores (plata/cobre) en las puntas.
// Fuentes: How-To Geek, Gear Patrol, ALLPCB.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-24-1330-guantes-celular.json OUT ../ejemplos/2026-11-24-1330-guantes-celular.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, MORADO = 0x7b5cff, NARANJA = 0xffa62b, V = new THREE.Vector3();
  const amb = c => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const calle = () => { amb(0xbfe3f5); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  // acercamiento: fondo liso y un celular gigante acostado (la franja de vidrio es de PM.chispasDedo)
  const zoom = () => { amb(0xdff1ff); PM.pz(F.rect(30, 30, 0), 0xdff1ff, [0, 8, -4], null, { tinta: false, papel: false });
    for (const [x, y, r] of [[-1.1, 2.3, .5], [1.2, 1.7, .35], [.9, 3.2, .25]]) PM.det(F.circ(r), 0xcbe6fb, [x, y, -3.9]);
    luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
    PM.pz(F.rect(3.6, .7, .14), 0x2b2f4a, [.3, -.1, .15], null, { tinta: .018, papel: .07 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const abrigado = (p, bufa = 0xff6b5b, gorro = 0xff6b5b) => { p.bufa = PM.bufanda(p, bufa); PM.gorro([0, 0, .05], gorro, {}, p.head); p.vaho = PM.aliento([.3, -.27, .05], p.head); return p; };
  const amigo = (pos, o = {}) => PM.chibi(pos, { ropa: 0xff8a3d, pantalon: 0x2b2f4a, tenis: 0xffc83d, colPelo: 0x1d1410, lentes: 0x2b2f4a, boca: 'feliz', ...o });
  // pantalla de chat encima del celular del kit (burbujas y "escribiendo…"); ov.ok(k) muestra palomita de "¡respondió!"
  const chat = (ce, H) => { const W = H * .52, ov = group([0, -H * .02, .06], ce);
    PM.det(F.rect(W * .84, H * .82, .02), 0xeaf6ff, [0, 0, 0], ov);
    PM.det(F.rect(W * .84, H * .12, .01), 0x2ec4a6, [0, H * .35, .004], ov);
    PM.det(F.rect(W * .56, H * .13, .04), 0xffffff, [-W * .1, H * .16, .004], ov);
    PM.det(F.rect(W * .5, H * .11, .04), 0xbff0c9, [W * .12, -H * .02, .004], ov);
    const pts = [-1, 0, 1].map(i => PM.det(F.circ(W * .045), 0x8a93a8, [-W * .12 + i * W * .12, -H * .22, .006], ov));
    const ok = PM.marca([0, -H * .2, .02], true, H * .5, ov); ok.scale.setScalar(.001);
    ov.update = (t, k = 0) => { pts.forEach((p, i) => { p.position.y = -H * .22 + Math.max(0, Math.sin(t * 8 - i)) * H * .025; p.visible = k < .5; }); ok.scale.setScalar(Math.max(.001, H * .5 * k)); };
    return ov; };
  // posición en el mundo de la mano i de un chibi (para poner encima su guante/mano "de adelante" del celular)
  const manoMundo = (p, i) => { p.updateMatrixWorld(true); return p.brazos[i].children.find(c => Math.abs(c.position.y + .5) < 1e-6).getWorldPosition(V); };
  const manoDedo = (pos, piel = 0xe8b48c) => { const g = group(pos); PM.pz(F.elipse(.1, .105), piel, [0, 0, 0], g, { tinta: .014, papel: .04 });
    PM.pz(F.rect(.075, .16, .037), piel, [.01, .11, -.01], g, { tinta: .012, papel: .03 }); return g; };
  const guanteAdelante = (pos, col) => { const g = PM.guanteSuelto(pos, col); g.children[0].rotation.z = 0; g.children[0].position.y = 0; return g; };

  // ---------- 1 · gancho: con guantes toca y toca el celular… y nada ----------
  escena('gancho', {
    setup() { calle();
      this.p = abrigado(PM.chibi([-.42, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .85 }));
      this.gs = PM.guantes(this.p, MORADO); this.gs[0].visible = false;
      this.ce = PM.celular([-.1, .74, .6], { h: .62, pct: 80 }); this.ov = chat(this.ce, .62);
      this.zu = PM.zumbido([0, 0, .02], { r: .26 }, this.ce);
      this.gd = guanteAdelante([0, 0, .8], MORADO); this.gd.scale.setScalar(.85);
      this.q = PM.pregunta([.55, 1.95, .6], .6); this.q.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), tg = c.w('guantes') - .1, tc = c.w('celular') - .1, tk = c.w('caso?') - .1;
      A.parpadea(this.p, t + 1.3, .3); respira(this.p, t); this.p.bufa.mece(t); this.p.vaho.update(t, 1, 1, .8, .8);
      // el celular vibra al inicio (llegó mensaje); él lo toca una y otra vez con el guante
      const vib = t < tg + .3 ? 1 : 0; this.zu.update(t, vib); this.ce.position.x = -.1 + Math.sin(t * 50) * .012 * vib; this.ov.update(t, 0);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + .62;
      const tap = t > tg ? Math.max(0, Math.sin((t - tg) * 10)) : 0;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + 1.55 - tap * .3;
      const m = manoMundo(this.p, 0); this.gd.position.set(Math.max(m.x, -.2), m.y + .02, .8);
      this.p.boca(t < tk ? 'abierta' : 'apretada'); A.preocupa(this.p, ease(cl((t - tc) / .5))); habla(this.p, t);
      this.q.scale.setScalar(.6 * pop(t, tk, .35)); this.q.rotation.z = Math.sin(t * 5) * .12;
      c.ev('whoosh', .02, .4); if (t > tg) c.ev('pop', tg, .4); if (t > tc) c.ev('pop', tc, .4); if (t > tk) c.ev('ding', tk, .5);
      cam([-.15, 1.15, lerp(9.0, 8.5, ease(lt / 3))], [-.15, 1.1, 0], 34);
      if (t > tc) etiqueta(t < tk ? '¡TOC, TOC!' : '¡NO RESPONDE!', [-.15, 2.25, .9], lt - (t < tk ? tc : tk), 50, '#ffd640', true);
      rotulo('¿Por qué con guantes el', 'celular no te hace caso?', lt - .05, RY);
    }
  });

  // ---------- 2 · electricidad: el dedo no aprieta, manda chispitas a la pantalla ----------
  escena('electricidad', {
    setup() { zoom();
      this.d = PM.chispasDedo([.4, .25, .3], { ancho: 3.6 });
      this.p = PM.chibi([-.95, .27, .45], { logo: true, boca: 'abierta', mira: 1, escala: .52 }); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('presión:') - .15, te = c.w('electricidad') - .1, tch = te - .55;
      A.parpadea(this.p, t + .4, 1.1); respira(this.p, t, .27); habla(this.p, t);
      // el dedo baja desde arriba y se queda flotando apenitas sobre el vidrio
      this.d.dedo.position.y = .17 + 1.6 * (1 - eout(cl(t / .6)));
      this.d.update(t, ease(cl((t - tch) / .4)), 'piel');
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.3 * eout(cl((t - .3) / .3)) + Math.sin(t * 4) * .05;
      this.p.boca(t > te + .6 ? 'feliz' : 'abierta');
      c.ev('whoosh', .05, .5); if (t > tp) c.ev('pop', tp, .4); if (t > tch) c.ev('zap', tch, .6); if (t > te) c.ev('ding', te + .3, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tp && t < te) etiqueta('¿PRESIÓN? ¡NO!', [0, 2.5, .9], lt - tp, 50, '#ffffff', true);
      if (t > te) etiqueta('¡ELECTRICIDAD!', [0, 2.5, .9], lt - te, 54, '#ffd640', true);
      rotulo('Siente la electricidad', 'de tu dedo, no la presión', lt - .05, RY);
    }
  });

  // ---------- 3 · aislante: baja el guante y las chispitas chocan con la tela ----------
  escena('aislante', {
    setup() { zoom();
      this.d = PM.chispasDedo([.4, .25, .3], { ancho: 3.6, color: MORADO });
      this.q = PM.pregunta([1.15, 1.0, .9], .6); this.q.scale.setScalar(.001);
      this.p = PM.chibi([-.95, .27, .45], { logo: true, boca: 'abierta', mira: 1, escala: .52 }); },
    update(lt, c) {
      const t = tw(lt), tt = c.w('tela') - .1, tc = c.w('corta') - .1, tcr = c.w('cree') - .1;
      A.parpadea(this.p, t + 2.1, .6); respira(this.p, t, .27); habla(this.p, t);
      const kg = ease(cl((t - tt) / .55)); this.d.guante(kg);
      this.d.update(t, 1, kg > .97 ? 'guante' : 'piel');
      this.q.scale.setScalar(.6 * pop(t, tcr, .35)); this.q.rotation.z = Math.sin(t * 5) * .12;
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.3 + Math.sin(t * 4) * .05;
      this.p.boca(t > tc ? 'apretada' : 'abierta'); A.preocupa(this.p, ease(cl((t - tc) / .4)));
      c.ev('whoosh', tt, .5); if (t > tc) c.ev('impact', tc, .6); if (t > tcr) c.ev('pop', tcr, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tc) etiqueta(t < tcr ? '¡LA TELA LA CORTA!' : '¿HAY ALGUIEN?', [0, 2.5, .9], lt - (t < tcr ? tc : tcr), 46, t < tcr ? '#ffd640' : '#ffffff', true);
      rotulo('La tela del guante', 'corta esa señal', lt - .05, RY);
    }
  });

  // ---------- 4 · hilos: el guante táctil trae hilitos de metal y las chispitas sí pasan ----------
  escena('hilos', {
    setup() { zoom();
      this.d = PM.chispasDedo([.4, .25, .3], { ancho: 3.6, color: NARANJA }); this.d.guante(1);
      this.ok = PM.marca([1.15, 1.05, .9], true, .7); this.ok.scale.setScalar(.001);
      this.p = PM.chibi([-.95, .27, .45], { logo: true, boca: 'abierta', mira: 1, escala: .52 }); },
    update(lt, c) {
      const t = tw(lt), th = c.w('hilitos') - .1, tm = c.w('metal') - .1, tpa = c.w('pasar.') - .1;
      A.parpadea(this.p, t + .8, 1.8); respira(this.p, t, .27); habla(this.p, t);
      this.d.hilos(pop(t, th, .4)); this.d.update(t, 1, t > tm ? 'hilos' : 'guante');
      this.ok.scale.setScalar(.7 * pop(t, tpa, .35));
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.3 * eout(cl((t - th) / .3)) + Math.sin(t * 4) * .05;
      this.p.boca(t > tm ? 'feliz' : 'abierta');
      c.ev('whoosh', .05, .4); if (t > th) c.ev('pop', th, .5); if (t > tm) c.ev('zap', tm, .5); if (t > tpa) c.ev('ding', tpa, .6);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      etiqueta(t < th ? 'GUANTE TÁCTIL' : t < tpa ? 'HILITOS DE METAL' : '¡SÍ PASA!', [0, 2.5, .9], lt - (t < th ? 0 : t < tpa ? th : tpa), t < tpa ? 44 : 56, t < tpa ? '#ffffff' : '#ffd640', true);
      rotulo('Guantes táctiles:', 'hilitos de metal', lt - .05, RY);
    }
  });

  // ---------- 5 · remate: el amigo se quita el guante con los dientes para contestar ----------
  escena('remate', {
    setup() { calle();
      this.p = abrigado(PM.chibi([-.95, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .72 }));
      this.gp = PM.guantes(this.p, MORADO);
      this.a = abrigado(amigo([.45, .02, .3], { escala: .78, mira: -1, boca: 'apretada' }), 0x2ec4a6, 0x2ec4a6);
      this.ga = PM.guantes(this.a, NARANJA); this.ga[0].visible = false;
      this.ce = PM.celular([.72, .72, .6], { h: .56, pct: 64 }); this.ov = chat(this.ce, .56);
      this.zu = PM.zumbido([0, 0, .02], { r: .24 }, this.ce);
      this.gd = guanteAdelante([0, 0, .8], NARANJA); this.gd.scale.setScalar(.78);
      this.md = manoDedo([0, 0, .8]); this.md.scale.setScalar(.78); this.md.visible = false;
      this.gb = PM.guanteSuelto([-.04, -.3, .07], NARANJA, this.a.head); this.gb.visible = false; },
    update(lt, c) {
      const t = tw(lt), tq = c.w('quita') - .1, tgu = c.w('guantes') - .05, tco = c.w('contestar') - .1, tme = c.w('mensajes.') - .1;
      A.parpadea(this.p, t + 1.6, .5); A.parpadea(this.a, t + .3, 1.4); respira(this.p, t); respira(this.a, t, .02, 1.1);
      this.p.bufa.mece(t); this.a.bufa.mece(t + 1); this.p.vaho.update(t, 1, 1, .6, .6); this.a.vaho.update(t + .4, t < tq ? 1 : 0, -1, .6, .6);
      // celular vibrando hasta que contesta
      const vib = t < tco + .2 ? 1 : 0; this.zu.update(t, vib); this.ce.position.x = .72 + Math.sin(t * 50) * .012 * vib; this.ov.update(t, ease(cl((t - tco - .2) / .3)));
      this.a.brazos[1].rotation.z = this.a.brazos[1].r0 + .62;
      // brazo izquierdo: sube a la boca, jala (el guante se queda en los dientes) y baja a tocar la pantalla
      const ku = eout(cl((t - tq + .35) / .35)), kj = ease(cl((t - tgu) / .35)), kt = ease(cl((t - tco + .25) / .3)), tap = t > tco ? Math.max(0, Math.sin((t - tco) * 9)) * .2 : 0;
      this.a.brazos[0].rotation.z = this.a.brazos[0].r0 + lerp(lerp(.3, 2.55, ku), lerp(1.0, 1.3, kt), kj) - tap;
      const m = manoMundo(this.a, 0), sinG = t > tgu;
      this.gd.visible = !sinG; this.md.visible = sinG; this.gb.visible = sinG; this.gb.rotation.z = -.45 + Math.sin(t * 6) * .2;
      (sinG ? this.md : this.gd).position.set(m.x, m.y + .02, .8);
      this.a.boca(t < tgu ? 'apretada' : t < tco ? 'apretada' : 'feliz'); A.preocupa(this.a, t < tco ? 1 : 0);
      this.a.head.rotation.z = this.a.head.r0 + (t > tgu && t < tgu + .35 ? Math.sin(t * 20) * .08 : 0);
      // el protagonista se ríe y lo señala
      this.p.boca(t > tq ? 'abierta' : 'feliz'); habla(this.p, t);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.25 * eout(cl((t - tq) / .3)) + Math.sin(t * 9) * .06 * (t > tq ? 1 : 0);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .2 - Math.sin(t * 9) * .05;
      c.ev('whoosh', .05, .4); if (t > tq) c.ev('pop', tq, .4); if (t > tgu) c.ev('pop', tgu, .5); if (t > tco) c.ev('ding', tco + .2, .6);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 4))], [0, 1.15, 0], 34);
      if (t > tq) etiqueta(t < tco ? '¡CON LOS DIENTES!' : '¡AHORA SÍ!', [0, 2.55, .9], lt - (t < tco ? tq : tco), 46, '#ffd640', true);
      rotulo('Mándaselo al que se quita', 'los guantes para contestar', lt - .05, RY);
    }
  });
  P.cierre();
}
