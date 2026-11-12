// Short en PAPEL RECORTADO: ¿Por qué tu gato SIEMPRE te hace pancito encima?
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-11-2130-gato-pancito.json OUT ../ejemplos/2026-11-11-2130-gato-pancito.js
import { kitPapel } from '../motor3d/papel.js';
export async function build(E) {
  const { group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, pieza, fondo, luces, tw, persona, protagonista, gato, sillon, cobija, huella, bam, rayitas, INK } = P;
  const sinNiebla = (c) => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const RY = 1590;
  const pop = (o, k) => o.scale.setScalar(Math.max(.01, spring(cl(k))));

  // sala de papel: pared con rayas, ventana de noche, lámpara, cuadro, piso y sillón
  function sala(o = {}) {
    const pared = o.pared ?? 0xffe0b8; sinNiebla(pared); fondo(pared, -2.2); luces({ pos: [-2.5, 4, 7] });
    for (let k = 0; k < 10; k++) pieza(F.rect(.18, 9, 0), 0xffd29e, [-4.5 + k, 2, -2.15], null, { sombra: false });
    pieza(F.rect(12, 2.2, 0), 0xc98a55, [0, -1.1, -1.0], null, { sombra: false });
    const v = group([-1.25, 3.25, -2.05]); pieza(F.rect(.9, 1.0, .04), 0x2f3d7a, [0, 0, 0], v, { borde: .07, colorBorde: 0xffffff }); pieza(F.circ(.15), 0xfff3c4, [.18, .2, .03], v, { sombra: false });
    pieza(F.rect(.06, 1.0, 0), 0xffffff, [0, 0, .03], v); pieza(F.rect(.9, .06, 0), 0xffffff, [0, 0, .03], v);
    const cu = group([1.2, 3.3, -2.05]); pieza(F.rect(.7, .55, .02), 0xc98a55, [0, 0, 0], cu, { borde: .03 }); pieza(F.rect(.56, .41, .02), 0xff8fc0, [0, 0, .02], cu, { sombra: false }); P.huella([0, 0, .04], .5, 0xffffff, cu);
    const s = sillon([0, -.2, -.1], { w: 2.7, color: o.sillon ?? 0x2ec4a6 });
    return { s };
  }
  // protagonista sentado en el sillón (piernas tras el asiento) con gato en las piernas
  function sentado(c, o = {}) {
    const p = protagonista([o.x ?? 0, -.2 + .85 - 1.16 + .02, 0]); p.sentar(1);
    const g = gato([o.gx ?? 0, .55, .62], { escala: o.ge ?? .78 });
    return { p, g };
  }
  const corazones = (n, parent) => Array.from({ length: n }, (_, i) => { const h = pieza(F.corazon(.5), i % 2 ? 0xff6b5b : 0xff8fc0, [0, 0, .9], parent, { borde: .02 }); h.i = i; return h; });
  const subir = (hs, t, x0, y0, on = 1) => hs.forEach(h => { const u = (t * .55 + h.i / hs.length) % 1; h.visible = on > 0; h.position.set(x0 + (h.i % 2 ? 1 : -1) * (.85 + Math.sin(u * 6 + h.i * 2) * .15), y0 + u * 1.3 + (h.i % 3) * .2, .9); h.scale.setScalar(Math.max(.01, Math.sin(u * Math.PI) * on)); });

  // ---------- 1 · gancho: el gato le hace pancito encima al protagonista ----------
  escena('gancho', {
    setup() { this.c = sala(); Object.assign(this, sentado(this.c)); this.r = rayitas([0, 1.25, .95], 3, INK); this.hs = corazones(3); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('pancito') - .1;
      this.p.respira(t); this.p.mira(0, -1); this.p.cara(t > tp ? 'risa' : 'abierta', .3); this.p.pose('L', 'normal'); this.p.pose('R', 'normal');
      this.g.amasa(t, 1, t > tp ? 9 : 6); this.g.feliz(t > tp ? .8 : .3); this.g.cabeza.rotation.z = Math.sin(t * 2) * .06;
      this.r.visible = Math.floor(t * 6) % 2 === 0; subir(this.hs, t, 0, 1.5, t > tp ? 1 : 0);
      cam([0, 1.45, lerp(7.6, 6.4, ease(lt / c.dur))], [0, 1.35, 0], 34);
      etiqueta('¡PANCITO!', [0, .75, 1.0], lt - tp, 60, '#ffd640', true); if (t > tp) c.ev('pop', tp, .7);
      rotulo('¿Por qué tu gato', 'te hace PANCITO?', lt - .05, RY); c.ev('whoosh', .02, .5);
    }
  });

  // ---------- 2 · de bebé: los gatitos amasan la panza de su mamá para que salga más leche ----------
  escena('bebe', {
    setup() { sinNiebla(0xffc6d6); fondo(0xffc6d6, -2.2); luces({ pos: [-2, 3.5, 6] });
      for (let k = 0; k < 12; k++) huella([((k * 37) % 9 - 4.5) * .9, ((k * 53) % 11 - 3) * .7 + 1, -2.1], .45, 0xffb0c6);
      pieza(F.elipse(2.3, .55), 0xb36b3f, [0, -.15, -.4], null, { borde: .04, colorBorde: INK }); pieza(F.elipse(2.0, .38), 0xfff4e0, [0, -.02, -.35], null, { sombra: false });   // camita
      this.m = gato([-.2, -.5, -.2], { pose: 'camina', escala: 1.42, collar: false }); this.m.patas.forEach(q => q.visible = false); this.m.cola.rotation.z = .4;
      this.k = [-.65, 0, .65].map((x, i) => gato([x - .05, -.1, .3], { escala: .55, collar: false }));
      this.gotas = Array.from({ length: 6 }, (_, i) => { const g = pieza(F.gota(.3), 0xffffff, [0, 0, .6], null, { borde: .02, colorBorde: INK }); g.i = i; return g; }); },
    update(lt, c) {
      const t = tw(lt), tl = c.w('leche') - .3, ta = c.w('amasaba') - .1;
      this.k.forEach((g, i) => { g.amasa(t + i * .4, t > ta ? 1 : .2, 8); g.cabeza.rotation.z = Math.sin(t * 3 + i) * .08; g.feliz(t > tl ? .8 : 0); });
      this.m.cabeza.rotation.z = Math.sin(t * 1.5) * .05 + .1; this.m.cola.rotation.z = .4 + Math.sin(t * 2) * .12;
      this.gotas.forEach(g => { const u = ((t * .7 + g.i / 6) % 1); g.visible = t > tl - .3; g.position.set(((g.i % 3) - 1) * .75 + Math.sin(u * 5) * .1, .75 + u * 1.2, .6); g.rotation.z = Math.PI; g.scale.setScalar(Math.max(.01, Math.sin(u * Math.PI))); });
      cam([0, 1.0, lerp(8.8, 8.3, ease(lt / c.dur))], [0, .95, 0], 34);
      etiqueta('AMASA A MAMÁ', [0, -.3, .8], lt - ta, 50, '#ffffff', true);
      if (t > tl) { etiqueta('¡MÁS LECHE!', [-.45, 1.85, .9], lt - tl, 58, '#ffd640', true); c.ev('ding', tl, .7); }
      rotulo('De bebé', 'amasaba la panza de su mamá', lt - .05, RY); c.ev('whoosh', .02, .6);
    }
  });

  // ---------- 3 · de grande: lo hace cuando se siente seguro y feliz… como bebé otra vez ----------
  escena('feliz', {
    setup() { this.c = sala({ pared: 0xd9ecff, sillon: 0x7b5cff }); Object.assign(this, sentado(this.c, { ge: .85 })); this.hs = corazones(5);
      this.nube = group([-.72, 2.3, 1.0]); pieza(F.nube(.5), 0xffffff, [0, 0, 0], this.nube, { borde: .03, colorBorde: INK });
      for (const [x, y, r] of [[.38, -.32, .06], [.52, -.46, .04]]) pieza(F.circ(r), 0xffffff, [x, y, 0], this.nube, { borde: .02, colorBorde: INK });
      this.bb = gato([0, -.16, .05], { escala: .22, collar: false }, this.nube); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('seguro') - .1, tb = c.w('bebé') - .2;
      this.p.respira(t); this.p.cara('feliz', .1); this.p.mira(0, -1); this.p.pose('L', 'normal'); this.p.pose('R', 'normal'); this.p.armR.rotation.z = .55; this.p.armR.ante.rotation.z = 1.2 + Math.sin(t * 4) * .15;
      this.g.amasa(t, 1, 6); this.g.feliz(.85); this.g.cabeza.rotation.z = Math.sin(t * 1.4) * .08; subir(this.hs, t, 0, 1.4, t > ts ? 1 : .4);
      this.nube.visible = t > tb; if (t > tb) { pop(this.nube, (t - tb) / .35); this.bb.amasa(t, 1, 8); this.bb.feliz(.8); c.ev('pop', tb, .6); }
      cam([0, 1.45, 6.6], [0, 1.4, 0], 34);
      etiqueta('SEGURO Y FELIZ', [-.1, .7, 1.0], lt - ts, 50, '#ffffff', true);
      etiqueta('rrrr…', [.72, 2.45, 1.0], lt - .4, 40, '#ffd640', true);
      rotulo('De grande', 'lo hace cuando está a gusto', lt - .05, RY); c.ev('whoosh', .02, .5);
    }
  });

  // ---------- 4 · sus patitas sueltan su olor: te está marcando, eres SUYO ----------
  escena('marca', {
    setup() { sinNiebla(0xfff1a8); fondo(0xfff1a8, -2.2); luces({ pos: [-2.5, 4, 7] });
      for (let k = 0; k < 9; k++) pieza(F.circ(.08 + (k % 3) * .04), 0xffe27a, [((k * 37) % 9 - 4.5) * .9, ((k * 53) % 11 - 3) * .8 + 1.5, -2.1], null, { sombra: false });
      pieza(F.rect(12, 2, 0), 0xe9c46a, [0, -1.1, -1.0], null, { sombra: false });
      this.p = protagonista([.55, -.2, 0]);
      this.mueble = group([-.95, -.2, .3]); pieza(F.rect(1.1, 1.0, .06), 0xc98a55, [0, .5, 0], this.mueble, { borde: .04, colorBorde: INK }); pieza(F.rect(1.25, .14, .03), 0xa86c3e, [0, 1.02, .02], this.mueble, { borde: .03, colorBorde: INK });
      this.g = gato([-.95, .9, .45], { escala: .85 });
      this.olor = Array.from({ length: 6 }, (_, i) => { const n = pieza(F.nube(.22), 0xb9a3ff, [0, 0, .8], null, { borde: .02, colorBorde: INK }); n.i = i; return n; });
      this.hu = [[.38, 1.75], [.72, 1.55], [.45, 1.3], [.7, 1.98]].map(([x, y]) => huella([x, y - .2, .35], .42, 0xf2a7b8)); },
    update(lt, c) {
      const t = tw(lt), to = c.w('olor') - .4, tm = c.w('marcando') - .1, ts = c.w('suyo') - .1;
      this.p.respira(t); this.p.mira(-1, -.3); this.p.cara(t > ts ? 'risa' : t > tm ? 'o' : 'feliz', .25); this.p.pose('L', 'normal'); this.p.pose('R', t > ts ? 'pulgar' : 'normal');
      this.g.amasa(t, 1, 7); this.g.feliz(.6); this.g.cabeza.rotation.z = -.12;
      this.olor.forEach(n => { const u = ((t * .6 + n.i / 6) % 1); n.visible = t > to; n.position.set(lerp(-.95, .5, u) + Math.sin(u * 7 + n.i) * .12, lerp(1.1, 1.9, u) + Math.sin(u * 4 + n.i) * .15, .8); n.scale.setScalar(Math.max(.01, Math.sin(u * Math.PI) * 1.1)); });
      this.hu.forEach((h, i) => { const k = (t - tm - i * .18) / .25; h.visible = k > 0; if (k > 0) { pop(h, k); c.ev('pop', tm + i * .18, .5); } });
      cam([-.2, 1.3, 7.4], [-.2, 1.25, 0], 34);
      etiqueta('SU OLOR', [-.95, .35, 1.0], lt - to, 50, '#7b5cff', true);
      if (t > ts) { etiqueta('¡ERES SUYO!', [.1, 2.95, .8], lt - ts, 60, '#ffd640', true); c.ev('ding', ts, .8); }
      rotulo('Te está marcando', 'con el olor de sus patitas', lt - .05, RY); c.ev('whoosh', .02, .5);
    }
  });

  // ---------- 5 · truco (cobija) y remate para compartir ----------
  escena('remate', {
    setup() { this.c = sala({ pared: 0xffd0c2, sillon: 0x3d6bff }); Object.assign(this, sentado(this.c, { ge: .78 }));
      this.co = cobija([0, .55, .55], { w: 1.5, h: .55, color: 0xffc83d }); this.ay = bam([.5, 1.05, 1.0]); this.ay.scale.setScalar(.6); this.hs = corazones(3);
      this.tel = group([0, -.42, .06], this.p.armR.ante); pieza(F.rect(.2, .34, .04), 0x1d1f26, [0, 0, 0], this.tel, { borde: .02 }); pieza(F.rect(.15, .26, .03), 0x25d366, [0, 0, .025], this.tel, { sombra: false }); },
    update(lt, c) {
      const t = tw(lt), tu = c.w('uñas') - .3, tc = c.w('ponte') - .05, tm = c.w('mándaselo') - .1;
      const conCob = t > tc; this.co.visible = conCob; if (conCob) { pop(this.co, (t - tc) / .3); c.ev('whoosh', tc, .6); }
      this.g.position.y = conCob ? .62 : .55; this.g.amasa(t, 1, 8); this.g.feliz(.7);
      const ay = t > tu && !conCob; this.ay.visible = ay; if (ay) { this.ay.rotation.z = .2 + Math.sin(t * 20) * .1; c.ev('impact', tu, .7); }
      this.p.respira(t); this.p.cara(ay ? 'grito' : t > tm ? 'risa' : 'feliz', ay ? .45 : .1); this.p.pose('L', conCob && t < tm ? 'pulgar' : 'normal');
      this.tel.visible = t > tm; if (t > tm) { this.p.pose('R', 'normal'); this.p.armR.rotation.z = .35; this.p.armR.ante.rotation.z = 1.6; this.p.mira(1, .2); this.p.pose('L', 'senala'); } else { this.p.pose('R', 'normal'); this.p.mira(0, -1); }
      subir(this.hs, t, 0, 1.4, conCob ? 1 : 0);
      cam([0, 1.45, 6.9], [0, 1.4, 0], 34);
      if (t < tm) { etiqueta('TRUCO: UNA COBIJA', [0, .6, 1.1], lt - tc, 50, '#ffffff', true); rotulo('Truco', '¿te clava las uñas? ponte una cobija', lt - .05, RY); }
      else { etiqueta('¿TIENES UN GATO PANADERO?', [0, .6, 1.1], lt - tm, 44, '#ffd640', true); rotulo('Mándaselo', 'a quien tiene un gato panadero', lt - tm, RY); c.ev('pop', tm, .6); }
    }
  });
  P.cierre();
}
