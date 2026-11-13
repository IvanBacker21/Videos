// Short 13-nov 13:30 · CARTULINA CHIBI: ¿Por qué en el Buen Fin todo termina en 99? (efecto del dígito izquierdo)
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-13-1330-precios-99.json OUT ../ejemplos/2026-11-13-1330-precios-99.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, E.THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xa9dcf5, AMA = 0xffe27a, BLANCO = 0xfff6e0, VERDE = 0x2ec4a6;
  const set = () => { ambiente({ top: CIELO, bottom: CIELO, fog: CIELO, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, fase = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + fase) * .05; };
  const flota = (g, t, y0, f = 0, a = .05) => g.position.y = y0 + Math.sin(t * 2.2 + f) * a;
  const corazones = () => [0, 1, 2].map(i => { const c = PM.pz(F.corazon(.34), 0xff5d8f, [0, 0, .6], null, { tinta: .015, papel: .04 }); c.visible = false; c.i = i; return c; });
  const animaCorazones = (cs, t, x0, y0, sep = .3, sube = .45) => cs.forEach(c => { const k = ((t * .9 + c.i / 3) % 1); c.visible = true; c.position.set(x0 + (c.i - 1) * sep + Math.sin(k * 6 + c.i * 2) * .06, y0 + k * sube, .6); c.scale.setScalar(Math.sin(k * Math.PI) * .8 + .05); });
  // dígito suelto de cartulina (para leer el precio número por número)
  const digito = (pos, d, color = AMA) => PM.letrero(pos, d, { w: .46, h: .74, color, borde: 0xff6b5b, hilos: false });

  // ---------- 1 · gancho: Buen Fin, todo termina en 99 ----------
  escena('gancho', {
    setup() { set();
      this.bf = PM.letrero([-.6, 2.3, .5], 'BUEN FIN', { w: 1.3, h: .38, borde: 0xff6b5b, color: 0xffc83d, hilos: false });
      this.p = PM.chibi([-.62, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .88 });
      this.c = PM.carrito([.62, .02, .45], { escala: .85 }); this.c.scale.x = -.85;
      PM.caja([-.2, .2, 0], .34, .3, 0x7b5cff, this.c.carga); PM.caja([.18, .16, .02], .3, .26, VERDE, this.c.carga);
      this.tags = [['$999', .42, 2.0, AMA], ['$499', .82, 1.42, BLANCO]].map(([s, x, y, col], i) => { const g = PM.precio([x, y, .7], s, { w: .9, h: .42, color: col }); g.y0 = y; g.i = i; return g; });
      this.q = PM.pregunta([-1.08, 1.75, .8], .45); },
    update(lt, c) {
      const t = tw(lt), tn = c.w('noventa') - .15;
      A.parpadea(this.p, t, 1.1); this.p.boca(t > tn ? 'abierta' : 'feliz'); A.preocupa(this.p, t > tn ? .5 : 0);
      this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 4) * .05 - (t > tn ? .08 : 0);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .1 + Math.sin(t * 3) * .05; this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, .9, eout(cl(t / .4))) + Math.sin(t * 6) * .05;
      this.bf.scale.setScalar(pop(t, -.5)); this.bf.columpia(t, .03);
      this.c.position.x = .62 + Math.sin(t * 2) * .03; this.c.rueda(t, .2);
      this.tags.forEach(g => { g.scale.setScalar(pop(t, -.45 + g.i * .3, .35) * (t > tn ? 1 + Math.sin(t * 12 + g.i) * .05 : 1)); flota(g, t, g.y0, g.i * 2); g.columpia(t + g.i, .06); });
      this.q.scale.setScalar(pop(t, tn + .1) * .55); this.q.rotation.z = Math.sin(t * 4) * .15;
      c.ev('pop', .05, .5); if (t > tn) c.ev('ding', tn + .1, .5);
      cam([.05, 1.2, lerp(10.6, 10.1, ease(lt / 3.2))], [.05, 1.15, 0], 34);
      if (t > tn) etiqueta('¿SIEMPRE 99?', [0, -.25, .8], lt - tn, 54, '#ffd640', true);
      rotulo('¿Por qué en el Buen Fin', 'TODO termina en 99?', lt - .1, RY);
    }
  });

  // ---------- 2 · el cerebro lee de izquierda a derecha y se queda con el primero ----------
  escena('izquierda', {
    setup() { set();
      this.p = PM.chibi([-1.0, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .74 });
      this.d = ['$', '9', '9', '9'].map((s, i) => { const g = digito([-.2 + i * .5, 1.6, .5], s, i === 0 ? BLANCO : AMA); g.i = i; return g; });
      this.ojo = group([-.95, 1.05, .9]);
      this.fl = PM.pz(F.poly([[-.5, .06], [.32, .06], [.32, .16], [.55, 0], [.32, -.16], [.32, -.06], [-.5, -.06]]), 0x3d6bff, [0, .82, .7], null, { tinta: .014, papel: .05 }); },
    update(lt, c) {
      const t = tw(lt), ti = c.w('izquierda') - .2, td = c.w('derecha…') + .1, tp = c.w('primer') - .25;
      A.parpadea(this.p, t, .7); habla(this.p, t); A.preocupa(this.p, 0); this.p.boca(t > tp ? 'feliz' : 'abierta');
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04; this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.05, eout(cl((t - .1) / .4))) + Math.sin(t * 5) * .04;
      // flecha que barre de izquierda a derecha
      const kb = ease(cl((t - ti) / (td - ti)));
      this.fl.visible = t > ti - .1 && t < tp + .2; this.fl.scale.set(pop(t, ti - .1, .3), pop(t, ti - .1, .3), 1); this.fl.position.x = lerp(-.25, 1.15, kb);
      const kf = eout(cl((t - tp) / .4));
      this.d.forEach(g => { const lee = t > ti && this.fl.position.x > g.position.x - .2 && t < tp; const base = pop(t, -.45 + g.i * .12, .3);
        let s = base * (lee ? 1.08 : 1); if (g.i === 1) s *= 1 + .45 * kf; else if (g.i > 1) s *= 1 - .35 * kf;
        g.scale.setScalar(s); g.position.y = 1.6 + (g.i === 1 ? .12 * kf : -.18 * kf) + Math.sin(t * 2.4 + g.i) * .03; g.rotation.z = g.i === 1 ? Math.sin(t * 6) * .05 * kf : 0;
        g.position.x = -.2 + g.i * .5 + (g.i > 1 ? .08 * kf : 0); });
      if (t > ti) c.ev('whoosh', ti, .5); if (t > tp) c.ev('ding', tp, .5);
      cam([.05, 1.2, 11], [.05, 1.15, 0], 34);
      if (t > ti && t < tp) etiqueta('IZQUIERDA → DERECHA', [.45, .45, .8], lt - ti, 44, '#ffffff', true);
      if (t > tp) etiqueta('¡SOLO VE EL PRIMERO!', [.3, .45, .8], lt - tp, 48, '#ffd640', true);
      rotulo('Lees de izquierda', 'a derecha… y te quedas con el primer número', lt - .1, RY);
    }
  });

  // ---------- 3 · con nueves se siente mucho más barato, aunque sea solo un peso ----------
  escena('barato', {
    setup() { set();
      this.a = PM.precio([-.68, 2.12, .6], '$999', { w: 1.15, h: .5, color: AMA });
      this.b = PM.precio([.72, 2.12, .6], '$1,000', { w: 1.15, h: .5, color: BLANCO, borde: 0x7b5cff });
      this.p = PM.chibi([0, .02, .3], { logo: true, boca: 'feliz', mira: -1, escala: .82 });
      this.cs = corazones(); },
    update(lt, c) {
      const t = tw(lt), tb = c.w('barato…') - .25, tn = c.w('nueves') - .2, ta = c.w('aunque') - .15;
      A.parpadea(this.p, t, 2.3); habla(this.p, t, .5);
      const sor = t > ta; this.p.boca(sor ? 'abierta' : 'feliz'); A.preocupa(this.p, sor ? .45 : 0);
      this.p.head.rotation.z = this.p.head.r0 + (t > tb && !sor ? .12 : 0) + Math.sin(t * 5) * .04;
      this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -1.0, eout(cl((t - tn) / .4))) + Math.sin(t * 5) * .04;   // señala el de nueves
      this.p.brazos[1].rotation.z = sor ? lerp(this.p.brazos[1].r0, .7, eout(cl((t - ta) / .3))) : this.p.brazos[1].r0 + Math.sin(t * 3) * .04;
      // la de 999 "se siente" más chica y barata; la de 1,000 crece
      const kb = eout(cl((t - tb) / .5)), ka = eout(cl((t - ta) / .5));
      this.a.scale.setScalar(pop(t, -.4) * (1 - .18 * kb + .18 * ka)); this.b.scale.setScalar(pop(t, -.25) * (1 + .12 * kb - .12 * ka));
      this.a.columpia(t, .05); this.b.columpia(t + 1, .04);
      if (t > tb && !sor) animaCorazones(this.cs, t, -.68, 1.25, .35, .3); else this.cs.forEach(h => h.visible = false);
      if (t > tb) c.ev('pop', tb, .5); if (t > ta) c.ev('ding', ta, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tb && !sor) { etiqueta('¡BARATO!', [-.98, 1.6, .8], lt - tb, 48, '#7dffb0', true); etiqueta('¡CARO!', [.98, 1.6, .8], lt - tb, 48, '#ffffff', true); }
      if (sor) etiqueta('¡SOLO $1 MENOS!', [0, -.25, .8], lt - ta, 54, '#ffd640', true);
      rotulo('Un precio con nueves', 'se siente mucho más barato', lt - .1, RY);
    }
  });

  // ---------- 4 · experimento: el vestido terminado en 9 se vendió más que uno más barato ----------
  escena('vestido', {
    setup() { set();
      this.p = PM.chibi([-.98, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .78 });
      this.rack = group([.42, 2.05, .2]);
      PM.pz(F.rect(1.75, .06, .03), 0x8a6a4a, [0, 0, 0], this.rack, { tinta: .014, papel: .04 });
      for (const x of [-.85, .85]) PM.pz(F.rect(.06, 2.05, .02), 0x8a6a4a, [x, -1.0, -.05], this.rack, { tinta: .014, papel: .04 });
      this.v = [[-.42, 0xff6b5b, '$34'], [.42, 0x7b5cff, '$39']].map(([x, col, s], i) => { const g = PM.vestido([x, -.02, .1], col, this.rack); g.tag = PM.precio([x + .22, -.62, .35], s, { w: .66, h: .3, color: i ? AMA : BLANCO, hilo: false }, this.rack); g.i = i; return g; });
      this.ok = [0, 1, 2].map(i => { const g = PM.marca([.84 - .0, -.1 + i * .0, .9], true, .55); g.i = i; return g; });
      this.ok1 = PM.marca([0, -.1, .9], true, .55);
      this.lab = PM.letrero([.42, 2.52, .1], 'EXPERIMENTO', { w: 1.3, h: .32, borde: 0x3d6bff, color: 0xfff6e0, hilos: false }); },
    update(lt, c) {
      const t = tw(lt), tv = c.w('vestido') - .2, ts = c.w('vendió') - .2, tm = c.w('barato!') - .45;
      A.parpadea(this.p, t, .4); habla(this.p, t, 2); const sor = t > tm; this.p.boca(sor ? 'abierta' : 'feliz'); A.preocupa(this.p, sor ? .4 : 0);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04; this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, sor ? 1.25 : .9, eout(cl((t - tv) / .4))) + Math.sin(t * 5) * .04;
      this.lab.scale.setScalar(pop(t, -.4)); this.lab.columpia(t, .03);
      this.v.forEach(g => { g.scale.setScalar(pop(t, -.3 + g.i * .15)); g.mece(t, g.i * 2); g.tag.columpia(t + g.i, .06);
        if (g.i === 1 && t > ts) g.scale.setScalar(1 + Math.sin(t * 10) * .03); });
      // ventas: tres palomitas para el de 39, una para el de 34
      this.ok.forEach(g => { const t0 = ts + g.i * .3; g.visible = t > t0; g.scale.setScalar(pop(t, t0, .3) * .55); g.position.set(.84 + (g.i - 1) * .3, -.08, .9); });
      this.ok1.visible = t > ts + .15; this.ok1.scale.setScalar(pop(t, ts + .15, .3) * .55); this.ok1.position.set(.0, -.08, .9);
      if (t > ts) c.ev('pop', ts, .4); if (t > ts + .3) c.ev('pop', ts + .3, .4); if (t > ts + .6) c.ev('pop', ts + .6, .4); if (t > tm) c.ev('ding', tm, .5);
      cam([.05, 1.2, 10.4], [.05, 1.15, 0], 34);
      if (t > ts && !sor) etiqueta('¡SE VENDIÓ MÁS!', [.84, .35, .8], lt - ts, 44, '#7dffb0', true);
      if (sor) etiqueta('¡Y ERA MÁS CARO!', [.4, .35, .8], lt - tm, 48, '#ffd640', true);
      rotulo('En un experimento', 'el terminado en 9 se vendió más', lt - .1, RY);
    }
  });

  // ---------- 5 · truco (redondea) + mándaselo a quien ya llenó su carrito ----------
  escena('remate', {
    setup() { set();
      this.p = PM.chibi([-.85, .02, .3], { logo: true, boca: 'feliz', mira: 1 });
      this.tag = PM.precio([.35, 1.75, .6], '$999', { w: 1.2, h: .52, color: AMA }); this.cambio = false;
      this.a = PM.chibi([1.0, .02, .2], { pelo: 'cola', ropa: 0xffc83d, pantalon: 0x7b5cff, colPelo: 0x2a1a12, boca: 'feliz', mira: -1, escala: .86 });
      this.c = PM.carrito([.28, .02, .5], { escala: .8 }); this.c.scale.x = -.8;
      const L = this.c.carga; PM.caja([-.32, .2, 0], .34, .36, 0x7b5cff, L); PM.caja([.05, .26, .02], .38, .48, 0xff6b5b, L); PM.caja([.38, .17, .01], .28, .3, VERDE, L);
      PM.caja([-.12, .6, .03], .42, .32, 0x3d6bff, L, { color2: 0xffc83d }); PM.caja([.25, .66, .04], .26, .28, 0xffc83d, L, { color2: 0xff6b5b }); PM.caja([.04, .93, .05], .3, .22, 0xff5d8f, L);
      this.cs = corazones(); },
    update(lt, c) {
      const t = tw(lt), tr = c.w('redondea') - .2, tm = c.w('mándaselo') - .2, tc = c.w('carrito') - .3;
      A.parpadea(this.p, t, 1.7); habla(this.p, t, .2); this.p.boca(t > tr ? 'abierta' : 'feliz');
      // etiqueta que se voltea: 999 → 1,000
      const kv = cl((t - tr) / .35); if (kv > .5 && !this.cambio) { this.tag.texto('$1,000'); this.cambio = true; } if (kv <= .5 && this.cambio) { this.tag.texto('$999'); this.cambio = false; }
            const km = eout(cl((t - tm) / .4)); const es = pop(t, -.4) * (1 - .3 * km); this.tag.position.set(lerp(.35, -.25, km), lerp(1.75, 2.32, km), .6);
      this.tag.scale.set(es * Math.max(.04, Math.abs(Math.cos(kv * Math.PI))), es, es); this.tag.columpia(t, .04);
      if (t > tr + .5 && t < tm) animaCorazones(this.cs, t, .35, 2.15, .35, .25); else this.cs.forEach(h => h.visible = false);
      this.p.brazos[1].rotation.z = t < tm ? lerp(this.p.brazos[1].r0, 1.0, eout(cl((t - tr + .3) / .4))) + Math.sin(t * 5) * .04 : lerp(1.0, .75, eout(cl((t - tm) / .3))) + Math.sin(t * 6) * .05;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04;
      // la amiga con el carrito lleno
      const ka = t > tm - .1; this.a.visible = ka; this.c.visible = ka;
      this.a.scale.set(.86, .86 * pop(t, tm - .1, .35), .17); this.c.scale.set(-.8 * pop(t, tm - .05, .35), .8 * pop(t, tm - .05, .35), .8);
      A.parpadea(this.a, t, .9); this.a.boca(t > tc ? 'abierta' : 'feliz'); this.a.head.rotation.z = this.a.head.r0 + Math.sin(t * 6) * .06;
      this.a.brazos[0].rotation.z = this.a.brazos[0].r0 - .55 + Math.sin(t * 4) * .05; this.a.brazos[1].rotation.z = this.a.brazos[1].r0 + Math.sin(t * 3) * .04;
      this.c.rueda(t, .3); this.c.position.x = .28 + Math.sin(t * 2.5) * .03;
      if (t > tr) c.ev('whoosh', tr, .4); if (t > tr + .25) c.ev('ding', tr + .3, .5); if (t > tm) c.ev('pop', tm - .1, .5);
      cam([.1, 1.2, 10.6], [.1, 1.15, 0], 34);
      if (t > tr && t < tm) etiqueta('REDONDEA ↑', [.35, .85, .8], lt - tr, 52, '#ffd640', true);
      if (t > tm) etiqueta('MÁNDASELO', [.1, -.25, .8], lt - tm, 56, '#ffd640', true);
      if (t < tm) rotulo('Truco', 'redondea antes de pagar', lt - .1, RY); else rotulo('Mándaselo', 'a quien ya llenó su carrito', lt - tm, RY);
    }
  });
  P.cierre();
}
