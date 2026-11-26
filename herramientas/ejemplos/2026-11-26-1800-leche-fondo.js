// Short 26-nov 18:00 · CARTULINA CHIBI: ¿por qué la leche SIEMPRE está hasta el fondo del súper?
// Para que cruces la tienda y compres de más (compras por impulso); y otra razón: logística, los camiones descargan atrás
// directo a los refrigeradores y así la cadena de frío no se rompe. Truco para el Black Friday: lista y directo a lo que necesitas.
// Fuentes: NPR (Planet Money, 2014), Mental Floss, Tasting Table, WBEZ (Curious City).
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-26-1800-leche-fondo.json OUT ../ejemplos/2026-11-26-1800-leche-fondo.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, PARED = 0xdff3ea;
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const amigo = (pos, o = {}) => PM.chibi(pos, { ropa: 0xff8a3d, pantalon: 0x2b2f4a, tenis: 0xffc83d, colPelo: 0x1d1410, boca: 'feliz', ...o });
  // súper de cartulina: pared, piso de mosaico, fila de anaqueles y (opcional) refri de lácteos al fondo (derecha) con leches
  const superM = (o = {}) => { ambiente({ top: PARED, bottom: PARED, fog: PARED, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    PM.pz(F.rect(30, 30, 0), PARED, [0, 15, -3], null, { tinta: false, papel: false });
    for (let i = -12; i <= 12; i++) PM.det(F.rect(.5, .5, .08), 0xc9ead9, [i * 1.2, 2.75, -2.98]);
    const piso = group([0, 0, 0]); PM.pz(F.rect(30, 6, 0), 0xe7e2d6, [0, -3, -1.7], piso, { tinta: false, papel: false });
    for (let i = -14; i < 14; i++) PM.det(F.rect(.03, 6, 0), 0xcfc8b8, [i * .6, -3, -1.69], piso); piso.traverse(m => m.receiveShadow = false);
    const an = []; for (const x of (o.anaqueles ?? [-4.2, -2.5, -.8, .9])) an.push(PM.anaquel([x, 0, -1.2], { w: 1.6, h: 1.9, semilla: 3 + Math.round(x * 7 + 40) }));
    let r = null, lechesR = [];
    if (o.refri) { r = PM.refri([o.refri, 0, -1.15], { w: 1.15, h: 2.1 });
      for (const [x, y] of [[-.3, .5], [0, .5], [.3, .5], [-.3, 1.05], [0, 1.05], [.3, 1.05], [-.15, 1.6], [.15, 1.6]]) lechesR.push(PM.leche([x, y - .08, .02], .62, r.dentro));
      r.abre(1); }
    luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
    return { an, r, lechesR }; };
  // lista de compras de cartulina para la mano (renglones y palomitas)
  const lista = (parent) => { const g = group([0, -.62, .14], parent);
    PM.pz(F.rect(.34, .44, .02), 0xffffff, [0, 0, 0], g, { tinta: .012, papel: .03 });
    PM.det(F.rect(.34, .07, .0), 0xff6b5b, [0, .19, .016], g);
    for (const y of [.07, -.04, -.15]) { PM.det(F.rect(.16, .025, .0), 0x8a86a0, [.04, y, .017], g); PM.det(F.circ(.022), 0x2ec4a6, [-.1, y, .017], g); }
    return g; };

  // ---------- 1 · gancho: entras al súper y la leche está HASTA EL FONDO (caminata larga) ----------
  escena('gancho', {
    setup() { this.s = superM({ anaqueles: [-3.4, -1.7, 0, 1.7], refri: 3.35 });
      this.L = PM.letrero([3.35, 2.45, -.9], 'LECHE', { w: 1.0, h: .34, color: 0xffffff, borde: 0x3d9bff, tinta: '#3d6bff' });
      this.p = PM.chibi([-2.75, .02, .35], { logo: true, boca: 'abierta', mira: 1, escala: .72 }); },
    update(lt, c) {
      const t = tw(lt), tf = c.w('fondo'), k = ease(cl((t - .35) / Math.max(1, tf + .2 - .35)));
      A.parpadea(this.p, t + 1.2, .4); this.L.columpia(t, .04);
      // camina hasta el fondo; al llegar, se cansa (cejas preocupadas) y se rasca la cabeza
      const anda = k > .01 && k < .99 ? 1 : 0; this.p.position.x = lerp(-2.75, 2.1, k);
      if (anda) A.anda(this.p, t, 1); else { respira(this.p, t); this.p.piernas.forEach(q => q.rotation.z = q.r0); }
      if (k >= .99) { this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 2.7 + Math.sin(t * 14) * .12; this.p.brazos[0].rotation.z = this.p.brazos[0].r0; A.preocupa(this.p, .9); A.ladea(this.p, .3, -1); }
      else A.preocupa(this.p, .2 * k);
      habla(this.p, t); this.p.boca(k >= .99 ? 'apretada' : 'abierta');
      this.s.lechesR.forEach((l, i) => l.update(t, i));
      c.ev('whoosh', .3, .5); if (t > tf) c.ev('ding', tf, .6);
      const cx = lerp(-2.2, 2.55, k); cam([cx, 1.2, 10.4], [cx, 1.15, 0], 34);
      if (t > tf - .1) etiqueta('¿HASTA EL FONDO?', [cx, 2.62, .9], lt - tf + .1, 46, '#ffd640', true);
      rotulo('¿Por qué la leche está', 'hasta el fondo?', lt - .05, RY);
    }
  });

  // ---------- 2 · trampa: para llegar cruzas todo y el carrito se llena de cosas que no ibas a comprar ----------
  escena('trampa', {
    setup() { this.s = superM({ anaqueles: [-3.4, -1.7, 0, 1.7, 3.4] });
      this.p = PM.chibi([-2.6, .02, .35], { logo: true, boca: 'feliz', mira: 1, escala: .7 });
      this.c = PM.carrito([-1.75, 0, .5], { escala: .78 });
      const cols = [0xff6b5b, 0xffc83d, 0x9b6bff, 0x2ec4a6, 0xff5d8f];
      this.cj = [[-.32, .14, .3, .32], [-.02, .12, .26, .26], [.26, .16, .28, .34], [-.17, .36, .24, .24], [.12, .38, .26, .22]].map(([x, y, w, h], i) => { const b = PM.caja([x, y, .02], w, h, cols[i], this.c.carga); b.scale.setScalar(.001); return b; }); },
    update(lt, c) {
      const t = tw(lt), tg = c.w('agarres') - .1, tn = c.w('comprar') - .2, dur = c.dur ?? 4.8;
      const k = cl((t - .1) / 4.4), x = lerp(-2.6, 1.6, k);
      this.p.position.x = x; this.c.position.x = x + 1.05; A.anda(this.p, t, 1); this.c.rueda(t, 1.2);
      A.parpadea(this.p, t + .3, 1.6);
      // brazos empujando el carrito
      this.p.brazos.forEach(b => b.rotation.z = b.r0 + 1.25 + Math.sin(t * 11) * .04);
      // los productos "llaman" y van cayendo al carrito
      this.s.an.forEach((a, i) => a.brinca(t + i, t > tg - .6 ? 1 : .35));
      const tiempos = [tg, tg + .35, tg + .7, tn, tn + .3];
      this.cj.forEach((b, i) => b.scale.setScalar(pop(t, tiempos[i], .3)));
      const lleno = t > tn; this.p.boca(lleno ? 'abierta' : 'feliz'); A.preocupa(this.p, lleno ? .8 : 0); habla(this.p, t);
      c.ev('whoosh', .1, .5); tiempos.forEach((tt, i) => { if (t > tt) c.ev('pop', tt, .4); });
      const cx = x + .55; cam([cx, 1.2, 10.4], [cx, 1.15, 0], 34);
      etiqueta(t < tg ? '¡CRUZAS TODA LA TIENDA!' : '¡Y AGARRAS DE MÁS!', [cx, 2.62, .9], lt - (t < tg ? .1 : tg), 40, t < tg ? '#8fd3ff' : '#ff8a5b', true);
      rotulo('Para que cruces', 'toda la tienda', lt - .05, RY);
    }
  });

  // ---------- 3 · otra razón: el camión descarga ATRÁS, directo al refri (para que no se caliente) ----------
  escena('camion', {
    setup() { ambiente({ top: 0xa9dcf5, bottom: 0xa9dcf5, fog: 0xa9dcf5, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
      // patio trasero: pared de bodega a la izquierda, cielo y asfalto a la derecha
      PM.pz(F.rect(30, 30, 0), 0xa9dcf5, [0, 15, -3.2], null, { tinta: false, papel: false });
      PM.pz(F.rect(4.2, 3.2, .05), 0xf3e3c3, [-1.6, 1.6, -2.4], null, { tinta: .02, papel: .08 });
      PM.det(F.rect(1.2, 1.9, .05), 0x8a7a62, [-.15, 1.0, -2.36]);
      PM.letrero([-1.55, 2.7, -2.3], 'BODEGA', { w: 1.1, h: .32, hilos: false, color: 0xfff6e0, borde: 0x2ec4a6 });
      const piso = group([0, 0, 0]); PM.pz(F.rect(30, 6, 0), 0x8f93a0, [0, -3, -1.7], piso, { tinta: false, papel: false });
      for (let i = -8; i < 8; i++) PM.det(F.rect(.4, .05, 0), 0xfff6e0, [i * 1.1, -.5, -1.69], piso); piso.traverse(m => m.receiveShadow = false);
      luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
      this.r = PM.refri([-.85, 0, -.6], { w: .95, h: 1.9 }); this.r.abre(1);
      this.dentro = []; for (const [x, y] of [[-.22, .44], [0, .44], [.22, .44], [-.22, .94], [0, .94], [.22, .94]]) { const l = PM.leche([x, y, .02], .5, this.r.dentro); l.scale.setScalar(.001); this.dentro.push(l); }
      this.cm = PM.camion([3.6, 0, -.3], { escala: .55, texto: 'LECHE', color: 0x3d9bff });
      this.vuela = [0, 1, 2].map(() => { const l = PM.leche([0, 0, .6], .5); l.visible = false; return l; });
      this.p = PM.chibi([.0, .02, .35], { ropa: 0x2ec4a6, pantalon: 0x2b2f4a, tenis: 0xffffff, colPelo: 0x6b4a2e, boca: 'feliz', mira: -1, escala: .58 });
      },
    update(lt, c) {
      const t = tw(lt), ta = c.w('atrás') - .2, tr = c.w('refris') - .15, tc = c.w('caliente') - .2;
      // el camión llega en reversa y abre la puerta
      const kc = ease(cl((t - .05) / Math.max(.8, ta - .05))); this.cm.position.x = lerp(3.6, 1.4, kc); this.cm.update(t, kc < .99 ? -1 : 0);
      this.cm.abre(ease(cl((t - ta) / .4)));
      // las leches vuelan del camión al refri y se acomodan
      const x0 = 1.4 - 1.6 * .55 + .1, x1 = -.85;
      this.vuela.forEach((l, i) => { const t0 = ta + .45 + i * .55, q = cl((t - t0) / .55); l.visible = t > t0 && q < 1; l.position.set(lerp(x0, x1, q), .9 + Math.sin(q * Math.PI) * .9, .6); l.rotation.z = q * 6; });
      this.dentro.forEach((l, i) => l.scale.setScalar(.5 * pop(t, ta + 1.0 + i * .28, .3)));
      this.r.frio(t, t > tr ? 1 : 0);
      // repartidor: señala el camión y luego el refri
      A.parpadea(this.p, t + .6, 2.1); respira(this.p, t); habla(this.p, t);
      const lado = t < tr ? 1 : -1; A.voltea(this.p, cl((t - tr) / .3), -1);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - 1.7 + Math.sin(t * 7) * .06; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + .3;
      this.p.boca(t > tc ? 'abierta' : 'feliz');
      c.ev('whoosh', .05, .6); if (t > ta) c.ev('pop', ta, .5); if (t > tr) c.ev('ding', tr, .6);
      cam([.4, 1.2, 12.4], [.4, 1.15, 0], 34);
      const et = t < tr ? ['LA DESCARGAN ATRÁS', ta] : t < tc ? ['¡DIRECTO AL REFRI!', tr] : ['¡QUE NO SE CALIENTE!', tc];
      if (t > ta - .1) etiqueta(et[0], [.4, 2.9, .9], lt - et[1], 40, t < tr ? '#ffd640' : '#8fd3ff', true);
      rotulo('Otra razón:', 'la descargan atrás', lt - .05, RY);
      void lado;
    }
  });

  // ---------- 4 · truco: con tu lista, directo a lo que necesitas (las ofertas brincan y las ignoras) ----------
  escena('truco', {
    setup() { this.s = superM({ anaqueles: [-1.7, 0, 1.7, 3.4], refri: 5.1 });
      this.p = PM.chibi([-1.1, .02, .35], { logo: true, boca: 'feliz', mira: 1, escala: .72 });
      this.li = lista(this.p.brazos[1]);
      this.tx = [-.4, 1.2, 2.8].map(x => { const m = PM.marca([x, 1.5, -.4], false, .8); m.scale.setScalar(.001); m.x0 = x; return m; });
      this.ok = PM.marca([4.6, 2.3, .4], true, 1); this.ok.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), tl = c.w('lista') - .15, td = c.w('directo') - .1, tn = c.w('necesitas') - .1;
      A.parpadea(this.p, t + 2.2, .8); habla(this.p, t);
      // levanta la lista y camina derecho
      const kl = ease(cl((t - tl) / .35)); this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + lerp(.2, 1.45, kl) + Math.sin(t * 6) * .04;
      this.li.rotation.z = -lerp(.2, 1.45, kl) - .22; this.li.scale.setScalar(.9 + .25 * kl);
      const kw = cl((t - td + .2) / Math.max(1, tn + .6 - td)), x = lerp(-1.1, 4.1, ease(kw));
      this.p.position.x = x; if (kw > .001 && kw < .999) A.anda(this.p, t, 1); else respira(this.p, t);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .15 + (kw > 0 && kw < 1 ? Math.sin(t * 11) * .3 : 0);
      this.s.an.forEach((a, i) => a.brinca(t + i * .7, .8));
      this.tx.forEach((m, i) => { const t0 = td + .15 + i * .3; m.scale.setScalar(.8 * pop(t, t0, .3)); m.position.y = 1.5 + Math.sin(t * 4 + i) * .04; });
      this.ok.scale.setScalar(pop(t, tn + .35, .35)); this.s.lechesR.forEach((l, i) => l.update(t, i));
      this.p.boca(t > tn + .3 ? 'abierta' : 'feliz');
      c.ev('pop', Math.max(.05, tl), .4); this.tx.forEach((m, i) => { if (t > td + .15 + i * .3) c.ev('pop', td + .15 + i * .3, .3); }); if (t > tn + .35) c.ev('ding', tn + .35, .6);
      const cx = Math.max(-.6, x + .45); cam([cx, 1.2, 10.4], [cx, 1.15, 0], 34);
      etiqueta(t < td ? 'LLEVA TU LISTA' : '¡DIRECTO A LO QUE VAS!', [cx, 2.62, .9], lt - (t < td ? Math.max(0, tl) : td), 42, t < td ? '#ffd640' : '#7ff0c8', true);
      rotulo('Truco de Black Friday:', 'lleva tu lista', lt - .05, RY);
    }
  });

  // ---------- 5 · remate: el que va por leche y regresa con el carrito lleno ----------
  escena('remate', {
    setup() { this.s = superM({ anaqueles: [-1.7, 0, 1.7] });
      this.p = PM.chibi([-.88, .02, .35], { logo: true, boca: 'feliz', mira: 1, escala: .7 });
      this.a = amigo([.2, .02, .35], { escala: .7, mira: 1, boca: 'feliz' });
      this.c = PM.carrito([.98, 0, .5], { escala: .72 });
      const cols = [0xff6b5b, 0xffc83d, 0x9b6bff, 0x2ec4a6, 0xff5d8f, 0x3d9bff, 0xff8a3d];
      [[-.34, .14, .28, .3], [-.04, .14, .28, .3], [.26, .16, .3, .34], [-.2, .42, .26, .26], [.1, .44, .3, .28], [.36, .44, .2, .22], [-.04, .68, .32, .22]].forEach(([x, y, w, h], i) => PM.caja([x, y, .02], w, h, cols[i], this.c.carga));
      this.l = PM.leche([0, -.62, .14], .5, this.a.brazos[0]);
      this.q = PM.pregunta([-.2, 2.15, .5], .55); },
    update(lt, c) {
      const t = tw(lt), tm = c.w('Mándaselo'), tll = c.w('lleno') - .15, tv = c.w('leche') - .1;
      A.parpadea(this.p, t + .9, .3); A.parpadea(this.a, t + .2, 1.9); respira(this.p, t); respira(this.a, t, .02, 1.1);
      // el amigo presume su "solo leche" (la levanta) con el carrito lleno; el protagonista se ríe y lo señala
      const kv = ease(cl((t - tv) / .35)); this.a.brazos[0].rotation.z = this.a.brazos[0].r0 - lerp(.2, 2.3, kv) + Math.sin(t * 8) * .06; this.l.rotation.z = lerp(.2, 2.3, kv);
      this.a.brazos[1].rotation.z = this.a.brazos[1].r0 + 1.2; A.ladea(this.a, .25 * kv, 1); this.a.boca(t > tll ? 'apretada' : 'feliz'); A.preocupa(this.a, t > tll ? .7 : 0);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.3 * eout(cl((t - tm - .1) / .3)) + Math.sin(t * 9) * .05;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .2; habla(this.p, t); this.p.boca(t > tll ? 'abierta' : 'feliz');
      this.p.position.y += t > tll ? Math.abs(Math.sin(t * 14)) * .03 : 0;
      this.q.scale.setScalar(.55 * pop(t, tll, .35)); this.q.rotation.z = Math.sin(t * 4) * .15;
      c.ev('whoosh', .05, .4); if (t > tv) c.ev('pop', tv, .4); if (t > tll) c.ev('ding', tll, .5);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.6))], [0, 1.15, 0], 34);
      if (t > tll - .1) etiqueta('¿SOLO IBAS POR LECHE?', [0, 2.62, .9], lt - tll + .1, 42, '#ffd640', true);
      rotulo('Mándaselo a quien', 'solo iba por leche', lt - .05, RY);
    }
  });
  P.cierre();
}
