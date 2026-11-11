// Short en PAPEL RECORTADO: ¿Por qué después de comer SIEMPRE te da el mal del puerco?
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-11-1800-mal-del-puerco.json OUT ../ejemplos/2026-11-11-1800-mal-del-puerco.js
import { kitPapel } from '../motor3d/papel.js';
export async function build(E) {
  const { group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, pieza, fondo, luces, tw, persona, protagonista, caminar, rayitas, papelPicado, mesa, plato, relojPapel, zzz, INK } = P;
  const sinNiebla = (c) => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const RY = 1590;

  // comedor mexicano de papel: pared, papel picado, ventana, cuadro, mesa con mantel
  function comedor(o = {}) {
    sinNiebla(0xffd9a8); fondo(o.pared ?? 0xffd9a8, -2.2); luces({ pos: [-2.5, 4, 7] });
    pieza(F.rect(12, 1.3, 0), 0xe9a86a, [0, .1, -2.15], null, { sombra: false });                          // lambrín
    for (let k = 0; k < 12; k++) pieza(F.rect(.03, 1.3, 0), 0xd99556, [-5.5 + k, .1, -2.13], null, { sombra: false });
    const v = group([-1.35, 2.75, -2.05]); pieza(F.rect(1.0, 1.1, .04), 0x8fd3ff, [0, 0, 0], v, { borde: .07, colorBorde: 0xffffff }); pieza(F.circ(.2), 0xffe27a, [.2, .22, .03], v, { sombra: false });
    pieza(F.rect(.06, 1.1, 0), 0xffffff, [0, 0, .03], v); pieza(F.rect(1.0, .06, 0), 0xffffff, [0, 0, .03], v);
    const cu = group([1.35, 2.8, -2.05]); pieza(F.rect(.8, .62, .02), 0xc98a55, [0, 0, 0], cu, { borde: .03 }); pieza(F.rect(.64, .46, .02), 0x2ec4a6, [0, 0, .02], cu, { sombra: false }); pieza(F.circ(.12), 0xffc83d, [.12, .06, .04], cu, { sombra: false });
    const pp = papelPicado(3.75, { w: 4.4, n: 7 });
    const m = mesa([0, 0, .55], { w: 3.6, top: 1.2 });
    return { pp, m };
  }

  // ---------- 1 · gancho: después de comer, el protagonista cabecea en la mesa ----------
  escena('gancho', {
    setup() { this.c = comedor(); this.p = protagonista([0, -.22, 0]);
      this.pl = [plato([-1.05, 1.24, .62], { comida: 'tortillas', r: .4 }), plato([.0, 1.24, .7], { comida: 'guisado', r: .46 }), plato([1.05, 1.24, .62], { comida: 'pan', r: .38 })];
      this.z = zzz([.55, 2.05, .4]); this.r = rayitas([0, 2.75, .3], 3); this.r.visible = false; },
    update(lt, c) {
      const t = tw(lt), tp = c.w('puerco') + .15; this.c.pp.update(t); this.p.respira(t);
      this.pl.forEach((q, i) => q.monton(i === 1 ? .55 : .8));
      if (t < tp) { const nod = (Math.sin(t * 3.2) + 1) / 2; this.p.sueno(.55 + nod * .45); this.p.head.rotation.z = .05 + nod * .28; this.p.head.position.y -= nod * .08; this.p.cara('seria', -.1); this.z.update(t, 1); }
      else { const k = t - tp; this.p.sueno(0); this.p.cara('o', .35); this.p.mira(0, .3); this.p.head.position.y += Math.max(0, .08 - k * .2); this.z.update(t, 0); this.r.visible = k < .9; c.ev('pop', tp, .8); }
      this.p.pose('L', 'normal'); this.p.armR.rotation.z = .25;
      cam([0, 1.75, lerp(9.0, 8.3, ease(lt / c.dur))], [0, 1.65, 0], 34);
      etiqueta('¡EL MAL DEL PUERCO!', [0, .75, .9], lt - c.w('mal') + .05, 54, '#ffffff', true);
      rotulo('Después de comer', '¿por qué SIEMPRE da sueño?', lt - .05, RY); c.ev('whoosh', .02, .5);
    }
  });

  // ---------- 2 · mito: "la sangre se va a la panza"… ¡FALSO! al cerebro le sigue llegando ----------
  escena('mito', {
    setup() { sinNiebla(0x2f4a7a); fondo(0x2f4a7a, -2.2); luces({ pos: [-2, 3, 6], suelo: 0x223355 });
      for (let k = 0; k < 14; k++) pieza(F.circ(.05 + (k % 3) * .03), 0x3d5d94, [((k * 37) % 9 - 4.5) * .9, ((k * 53) % 11 - 3) * .7, -2.1], null, { sombra: false });
      const s = 1.55, y0 = -1.65; this.p = protagonista([0, y0, 0], { escala: s });
      this.H = y0 + 2.38 * s; this.B = y0 + 1.36 * s; this.C = y0 + 1.72 * s;
      this.cer = group([0, this.H + .3, .32]); this.cerP = pieza(F.nube(.62), 0xff9ab8, [0, -.12, 0], this.cer, { borde: .03 });
      for (let k = 0; k < 3; k++) pieza(F.arco(.1, .03, 0, Math.PI), 0xe0608a, [-.2 + k * .2, -.02, .03], this.cer, { sombra: false });
      this.pan = pieza(F.elipse(.38, .3), 0xff8a7a, [.05, this.B, .32], null, { borde: .03 });
      this.cor = pieza(F.corazon(.9), 0xe0453a, [-.2, this.C, .34], null, { borde: .03 });
      this.gotas = []; for (let i = 0; i < 8; i++) { const g = pieza(F.gota(.22), 0xd8262f, [0, 0, .4], null, { borde: .02 }); g.i = i; this.gotas.push(g); }
      this.x = group([0, this.H - .2, .6]); for (const r of [.78, -.78]) pieza(F.rect(.22, 1.5, .1), 0xe0453a, [0, 0, 0], this.x, { rot: r, borde: .04 }); this.x.visible = false; },
    update(lt, c) {
      const t = tw(lt), tf = c.w('falso') - .05, mitoK = t < tf ? cl((t - c.w('sangre') + .2) / .6) : 0;
      this.p.respira(t); this.p.pose('R', t > tf ? 'pulgar' : 'normal');
      this.gotas.forEach(g => { const u = ((t * .9 + g.i / 8) % 1); const arriba = t > tf ? g.i % 2 === 0 : false;
        const y1 = arriba ? this.H + .2 : this.B; g.position.set(lerp(-.2, arriba ? 0 : .05, u) + Math.sin(u * 9 + g.i) * .06, lerp(this.C, y1, u), .4); g.rotation.z = arriba ? 0 : Math.PI; g.visible = t > c.w('sangre') - .2; });
      const gris = mitoK > 0 && t < tf; this.cerP.papel.material = P.M(gris ? 0x9b97a8 : 0xff9ab8); this.cer.scale.setScalar(gris ? lerp(1, .85, mitoK) : 1 + (t > tf ? Math.sin(t * 10) * .03 : 0));
      this.p.sueno(gris ? .8 * mitoK : 0); this.p.cara(t > tf ? 'feliz' : gris ? 'seria' : 'o', t > tf ? .1 : .2);
      this.x.visible = t > tf && t < tf + 1.1; if (this.x.visible) this.x.scale.setScalar(Math.max(.01, spring((t - tf) / .25))); if (t > tf) c.ev('impact', tf, .9);
      cam([0, .65, 10.6], [0, .65, 0], 36);
      if (t < tf) etiqueta('¿SANGRE A LA PANZA?', [0, -1.25, .5], lt - c.w('sangre'), 48, '#ffd640', true);
      if (t > tf) etiqueta('¡FALSO!', [0, -1.25, .5], lt - tf, 64, '#ff6b5b', true);
      if (t > c.w('sigue') - .1) etiqueta('AL CEREBRO LE LLEGA IGUAL', [0, -.6, .5], lt - c.w('sigue') + .1, 42, '#ffffff', true);
      rotulo('Mito', 'la sangre se va a la panza', lt - .05, RY);
    }
  });

  // ---------- 3 · reloj del cuerpo: bajón natural por la tarde… aunque no comas ----------
  escena('reloj', {
    setup() { sinNiebla(0xffc98a); fondo(0xffc98a, -2.2); luces({ pos: [-2.5, 4, 7] });
      this.sol = pieza(F.estrella(14, .75, .55), 0xffb03a, [1.5, 3.6, -2.0], null, { sombra: false }); pieza(F.circ(.5), 0xffe27a, [1.5, 3.6, -1.98], null, { sombra: false });
      pieza(F.rect(12, 3, 0), 0xe58f5a, [0, -1.5, -.6], null, { sombra: false });
      this.rel = relojPapel([-.75, 2.55, -.3], { r: .95 });
      this.p = protagonista([.75, -.2, 0], { escala: 1.05 });
      this.pila = group([-1.05, .75, .2]); pieza(F.rect(.62, 1.3, .08), INK, [0, 0, 0], this.pila, { borde: .03 }); pieza(F.rect(.26, .12, .03), INK, [0, .71, 0], this.pila);
      this.nivel = pieza(F.rect(.46, 1.12, .04), 0x2ec4a6, [0, 0, .03], this.pila, { sombra: false });
      this.pl = plato([-.95, -.05, .5], { comida: 'vacio', r: .42 }); this.pl.visible = false; },
    update(lt, c) {
      const t = tw(lt), u = cl(t / (c.dur - .3)), tn = c.w('aunque') - .1;
      this.rel.hora(12 + u * 3.5); this.sol.rotation.z = t * .3;
      const nv = lerp(1, .25, ease(cl((t - c.w('bajón') + .3) / 1.2))); this.nivel.scale.y = nv; this.nivel.position.y = -(1 - nv) * .56; this.nivel.papel.material = P.M(nv > .6 ? 0x2ec4a6 : nv > .4 ? 0xffc83d : 0xff6b5b);
      this.p.respira(t); const bost = t > tn ? cl((t - tn) / .3) : 0; this.p.sueno(lerp(.1, .7, 1 - nv) * (1 - bost * .3)); this.p.cara(bost > 0 ? 'grito' : 'seria', -.15);
      if (bost > 0) { this.p.head.rotation.z = -.15; this.p.pose('L', 'brazosArriba'); this.p.pose('R', 'brazosArriba'); }
      this.pl.visible = t > tn; if (t > tn) { this.pl.scale.setScalar(Math.max(.01, spring((t - tn) / .3))); this.pl.monton(0); c.ev('pop', tn, .6); }
      cam([0, 1.4, 10.2], [0, 1.4, 0], 36);
      etiqueta('BAJÓN DE LA TARDE', [-.2, -.55, .6], lt - c.w('bajón'), 46, '#ffffff', true);
      if (t > tn) etiqueta('¡SIN COMER!', [-1.0, .3, .7], lt - tn, 46, '#ffd640', true);
      rotulo('Tu reloj del cuerpo', 'baja la energía por la tarde', lt - .05, RY); c.ev('click', .1, .4);
    }
  });

  // ---------- 4 · comida grande lo empeora… TRUCO: sírvete menos y camina ----------
  escena('comida', {
    setup() { this.c = comedor(); this.p = protagonista([0, -.22, 0]); this.z = zzz([.6, 2.05, .4]);
      this.pl = [['tortillas', -1.25, .36], ['guisado', -.42, .42], ['pan', .42, .38], ['tortillas', 1.25, .36], ['guisado', 0, .44]].map(([cm, x, r], i) => plato([x, 1.24, .62 + (i === 4 ? .15 : 0)], { comida: cm, r }));
      // afuera: banqueta con sol (a la derecha, x = 9)
      const X = 9; pieza(F.rect(5.4, 9, 0), 0x9fe0ff, [X, 1.5, -2.15], null, { sombra: false }); pieza(F.circ(.55), 0xffe27a, [X + 1.2, 3.5, -2.1], null, { sombra: false });
      for (let k = 0; k < 3; k++) { const a = group([X - 1.7 + k * 1.7, 0, -1.6]); pieza(F.rect(.18, 1.6, .05), 0x8a5a33, [0, .8, 0], a, { borde: .02 }); pieza(F.circ(.7), 0x3fae5a, [0, 1.9, .02], a, { borde: .03 }); }
      pieza(F.rect(5.4, 1.4, 0), 0xc9c3b8, [X, -.55, -.5], null, { sombra: false }); pieza(F.rect(5.4, .1, 0), 0x8f897f, [X, .15, -.48], null, { sombra: false });
      this.p2 = protagonista([X, -.15, 0]); this.chico = plato([X - 1.15, .9, .5], { comida: 'guisado', r: .3 }); pieza(F.rect(.7, .08, .03), 0x8a5a33, [X - 1.15, .86, .45], null, { borde: .02 }); pieza(F.rect(.1, 1.1, .03), 0x8a5a33, [X - 1.15, .3, .42], null, { borde: .02 }); this.X = X; },
    update(lt, c) {
      const t = tw(lt), tt = c.w('truco') - .1; this.c.pp.update(t); this.p.respira(t);
      const comer = c.w('comida') - .25; this.pl.forEach((q, i) => { const k = cl((t - comer - i * .22) / .25); q.scale.setScalar(Math.max(.01, spring(k))); q.monton(1); });
      const pesa = cl((t - c.w('grasa')) / 1.0); this.p.sueno(.25 + .75 * pesa); this.p.head.rotation.z = .05 + pesa * .3; this.p.cara(pesa > .5 ? 'seria' : 'feliz', -.1); this.z.update(t, pesa);
      if (t > comer) c.ev('pop', comer, .5);
      const pan = einout(cl((t - tt) / .45)); if (t > tt) c.ev('whoosh', tt, .8);
      caminar(this.p2, t, 1); this.p2.position.y = -.15 + Math.abs(Math.sin(t * 9)) * .05; this.p2.cara('feliz', .1); this.p2.sueno(0);
      const ap = t > c.w('ratito') - .2; if (ap) { this.p2.pose('R', 'pulgar'); }
      this.chico.scale.setScalar(Math.max(.01, spring(cl((t - c.w('sírvete')) / .3))));
      cam([lerp(0, this.X, pan), 1.6, 8.6], [lerp(0, this.X, pan), 1.5, 0], 34);
      etiqueta('HARINA + GRASA', [0, .75, .9], lt - c.w('harina'), 50, '#ffffff', true);
      if (t > tt) { etiqueta('1 · PLATO CHICO', [this.X - .55, 1.35, .7], lt - c.w('sírvete'), 46, '#ffd640', true); etiqueta('2 · CAMINA UN RATITO', [this.X + .1, .5, .7], lt - c.w('camina'), 46, '#2ec4a6', true); }
      if (t < tt) rotulo('Comida grande', 'el bajón pega más fuerte', lt - c.w('comida'), RY);
      else rotulo('Truco', 'sírvete menos y camina', lt - tt, RY);
    }
  });

  // ---------- 5 · remate: el tío dormido en la sobremesa y el protagonista lo comparte ----------
  escena('remate', {
    setup() { this.c = comedor(); this.tio = persona([-.75, -.55, -.05], { ropa: 0xffc83d, pantalon: 0x5a4632, colPelo: 0xe8e4dc, piel: 0xc98e66 });
      this.p = protagonista([.85, -.55, .05]); this.z = zzz([-.35, 2.0, .4]);
      [plato([-.95, 1.24, .62], { comida: 'tortillas', r: .38 }), plato([.95, 1.24, .62], { comida: 'pan', r: .36 })].forEach(q => q.monton(.4));
      this.tel = group([0, -.42, .06], this.p.armR.ante); pieza(F.rect(.2, .34, .04), 0x1d1f26, [0, 0, 0], this.tel, { borde: .02 }); pieza(F.rect(.15, .26, .03), 0x25d366, [0, 0, .025], this.tel, { sombra: false }); },
    update(lt, c) {
      const t = tw(lt); this.c.pp.update(t); this.z.update(t, 1);
      this.tio.respira(t, .4); this.tio.sueno(1); this.tio.cara('o', .0); this.tio.head.rotation.z = -.45 + Math.sin(t * 1.6) * .05; this.tio.head.position.y -= .12;
      this.p.respira(t); this.p.cara(t > .5 ? 'risa' : 'feliz', -.15); this.p.mira(-1, -.2); this.p.pose('L', 'senala'); this.p.pose('R', 'normal'); this.p.armR.rotation.z = .35; this.p.armR.ante.rotation.z = 1.6; this.p.head.rotation.z = Math.sin(t * 12) * .06;
      cam([0, 1.75, 8.4], [0, 1.65, 0], 34);
      etiqueta('JAJAJA', [1.05, 2.55, .5], lt - .6, 46, '#ffffff', true);
      rotulo('Mándaselo', 'al que se duerme en la sobremesa', lt - .05, RY); c.ev('pop', .05);
    }
  });
  P.cierre();
}
