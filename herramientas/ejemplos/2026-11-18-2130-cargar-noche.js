// Short 18-nov 21:30 · CARTULINA CHIBI: ¿Cargar el celular toda la noche lo echa a perder? (casi siempre mito: al 100% el circuito
// deja de meter carga; lo que sí desgasta la batería es el calor; truco: no bajo la almohada ni con funda gruesa, y carga optimizada)
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-18-2130-cargar-noche.json OUT ../ejemplos/2026-11-18-2130-cargar-noche.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, NOCHE = 0xc9c3ec, CABLE = 0x3a3f5c;
  const amb = (c) => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const luz = () => luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
  const set = (o = {}) => { amb(NOCHE); const cu = PM.cuarto({ pared: NOCHE, piso: 0xa9784e, noche: true, ventana: o.ventana ?? [-1.0, 2.05], cuadro: o.cuadro ?? [1.35, 2.15, -2.6], cortina: 0x5a4fb8 }); cu.ventana?.abre(.35); luz(); return cu; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const buro = (pos) => { const b = group(pos); PM.pz(F.rect(.62, .7, .04), 0x8a5a3a, [0, .35, -.1], b, { tinta: .014, papel: .04 }); PM.det(F.rect(.5, .025, .01), 0x6a4430, [0, .4, -.08], b); PM.det(F.circ(.035), 0xffc83d, [0, .55, -.08], b); return b; };
  const cable = (pts, z = 0) => PM.det(P.tubo(pts, .035, .035), CABLE, [0, 0, z]);
  const enchufe = (pos) => { const g = group(pos); PM.pz(F.rect(.26, .36, .05), 0xffffff, [0, 0, 0], g, { tinta: .014, papel: .04 }); for (const sx of [-1, 1]) PM.det(F.rect(.035, .1, .01), 0x2b2f4a, [sx * .05, .03, .016], g); return g; };
  // punto a lo largo de una línea quebrada (k 0..1)
  const sobre = (pts, k) => { const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(d); tot += d; }
    let r = cl(k) * tot; for (let i = 0; i < L.length; i++) { if (r <= L[i] || i === L.length - 1) { const f = cl(r / L[i]); return [lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f)]; } r -= L[i]; } };
  const rayitos = (n, s = .2) => Array.from({ length: n }, (_, i) => { const r = PM.pz(F.rayo(s), 0xffe14d, [0, -5, .3], null, { tinta: .01, papel: .025 }); r.i = i; return r; });
  // capa roja transparente (calor) encima de algo plano
  const capaRoja = (w, h, par, z = .06) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0xff3b30, transparent: true, opacity: 0, depthWrite: false })); m.position.z = z; par.add(m); return m; };
  const almohada = (pos, w = .9, par = null) => PM.pz(P.blob([[-w * .45, -.13], [-w * .5, .06], [-w * .36, .2], [w * .36, .2], [w * .5, .06], [w * .45, -.13], [0, -.18]]), 0xfff6e0, pos, par, { tinta: .016, papel: .05 });

  // ---------- 1 · gancho: en la cama, mirando el celular que carga en el buró ----------
  escena('gancho', {
    setup() { this.cu = set();
      this.c = PM.cama([-.35, 0, 0], { color: 0x2ec4a6, w: 2.1 }); this.p = PM.chibi([0, 0, 0], { logo: true, boca: 'abierta', mira: 1, escala: .8 }); this.pv = PM.acuesta(this.p, this.c, .05); this.pv.sienta(1); this.c.cobija.position.x += .25;
      buro([1.12, 0, -.2]); this.ce = PM.celular([1.12, .98, .1], { h: .5, pct: 70, cara: 'feliz' }); this.ce.rotation.z = -.05;
      enchufe([1.38, .32, -.2]); cable([[1.12, .73], [1.12, .62], [1.3, .55], [1.38, .4]], .12);
      this.ry = PM.pz(F.rayo(.32), 0xffe14d, [.82, 1.36, .4], null, { tinta: .012, papel: .03 });
      this.q = PM.pregunta([.82, 1.85, .5], .6, 0xffc83d); },
    update(lt, c) {
      const t = tw(lt), tn = c.w('noche') - .1, tp = c.w('perder?') - .1;
      A.parpadea(this.p, t + 1.1, .4); A.parpadea(this.ce, t + 2.2, 1.3); habla(this.p, t); A.preocupa(this.p, eout(cl((t - tn) / .4)));
      this.p.boca(t > tp + .35 ? 'apretada' : 'abierta');
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .05; this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.1, eout(cl((t - .2) / .4))) + Math.sin(t * 4) * .05;   // señala el cel
      this.ce.pct(lerp(70, 84, cl(t / 2.8))); this.ce.position.y = .98 + Math.abs(Math.sin(t * 4)) * .015;
      this.ry.scale.setScalar(.85 + .2 * Math.abs(Math.sin(t * 6))); this.ry.rotation.z = Math.sin(t * 5) * .15;
      this.q.scale.setScalar(pop(t, tp, .35) * .6); this.q.rotation.z = Math.sin(t * 3) * .12;
      c.ev('whoosh', .05, .4); if (t > tn) c.ev('pop', tn, .4); if (t > tp) c.ev('ding', tp, .4);
      cam([.1, 1.2, lerp(10.9, 10.4, ease(lt / 3))], [.1, 1.15, 0], 34);
      if (t > tn) etiqueta('¿TODA LA NOCHE?', [-.2, 2.35, .7], lt - tn, 50, '#ffd640', true);
      rotulo('¿Cargarlo toda la noche', 'lo echa a perder?', lt - .05, RY);
    }
  });

  // ---------- 2 · mito: la pila llega al 100 y el apagador se apaga solito ----------
  escena('mito', {
    setup() { set({ ventana: [-.95, 2.1] });
      this.b = PM.bateria([.55, .72, .4], { s: 1.1, nivel: .62, cara: 'feliz' });
      enchufe([-1.2, .55, -.2]); this.ruta = [[-1.2, .45], [-1.2, .2], [-.3, .15], [.1, .3], [.2, .55]]; cable(this.ruta, .1);
      this.sw = group([-.55, .55, .35]); PM.pz(F.rect(.42, .5, .06), 0xfff4e4, [0, 0, 0], this.sw, { tinta: .016, papel: .05 });
      this.pal = group([0, 0, .03], this.sw); PM.pz(F.rect(.1, .26, .05), 0x2b2f4a, [0, .11, 0], this.pal, { tinta: .012, papel: false }); PM.pz(F.circ(.06), 0xff6b5b, [0, .24, .01], this.pal, { tinta: .012, papel: false });
      this.verde = PM.det(F.circ(.05), 0x2ec4a6, [.13, -.17, .04], this.sw); this.rojo = PM.det(F.circ(.05), 0xff5b5b, [.13, -.17, .045], this.sw);
      cable([[-.55, .3], [-.55, .18]], .1);
      this.rs = rayitos(4, .18); },
    update(lt, c) {
      const t = tw(lt), tm = c.w('mito:') - .1, tc = c.w('cien,') - .1, td = c.w('deja') - .05, ts = c.w('solito.') - .1;
      A.parpadea(this.b, t + .7, .5); A.preocupa(this.b, 0); habla(this.b, t);
      this.b.rotation.z = Math.sin(t * 2.4) * .04; this.b.position.y = .72 + Math.abs(Math.sin(t * 3)) * .02;
      const kn = ease(cl((t - .2) / (tc + .2 - .2))); this.b.nivel(lerp(.62, 1, kn));
      const cargando = t < td; this.b.carga(cargando, t);
      this.b.cara(t > tc ? 'abierta' : 'feliz'); if (t > ts) this.b.cara('feliz');
      this.b.brazos[0].rotation.z = this.b.brazos[0].r0 + Math.sin(t * 3) * .08;
      this.b.brazos[1].rotation.z = t > ts ? lerp(this.b.brazos[1].r0, 2.5, eout(cl((t - ts) / .3))) + Math.sin(t * 6) * .06 : this.b.brazos[1].r0 - Math.sin(t * 3) * .08;
      // apagador: ON (palanca arriba, foquito verde) → OFF solito
      const ko = eout(cl((t - td) / .25)); this.pal.rotation.z = lerp(0, Math.PI, ko); this.pal.position.y = 0; this.verde.visible = ko < .5; this.rojo.visible = ko >= .5;
      this.sw.rotation.z = Math.sin(t * 2 + 1) * .03;
      this.rs.forEach(r => { const k = ((t * .8 + r.i / 4) % 1); const [x, y] = sobre(this.ruta, k); r.position.set(x, y + .05, .32); r.visible = cargando && t > .1; r.rotation.z = Math.sin(t * 8 + r.i) * .2; });
      c.ev('whoosh', .05, .4); if (t > tm) c.ev('pop', tm, .4); if (t > tc) c.ev('ding', tc, .5); if (t > td) c.ev('pop', td, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tm && t < tc) etiqueta('¡MITO!', [-.5, 2.25, .7], lt - tm, 60, '#ffd640', true);
      if (t > tc && t < td + .2) etiqueta('¡100%!', [.55, 2.25, .7], lt - tc, 58, '#ffffff', true);
      if (t > td + .2) etiqueta('¡SE APAGA SOLITO!', [0, 2.25, .7], lt - td - .2, 46, '#ffd640', true);
      rotulo('Casi siempre es mito:', 'al 100% deja de cargar', lt - .1, RY);
    }
  });

  // ---------- 3 · lo que sí la desgasta: el calor ----------
  escena('calor', {
    setup() { set({ ventana: [-1.0, 2.15] });
      this.b = PM.bateria([.55, .72, .4], { s: 1.1, nivel: .95, cara: 'feliz' });
      this.ce = PM.celular([-.45, .17, .25], { h: .55, pct: 90 }); this.ce.rotation.z = Math.PI / 2; this.rojoCe = capaRoja(.29, .55, this.ce);
      this.al = almohada([-.85, .3, .45], .95);
      this.on = [-1, 0, 1].map(i => { const w = group([-.6 + i * .25, .6, .5]); PM.det(P.tubo(Array.from({ length: 13 }, (_, k) => [Math.sin(k / 12 * Math.PI * 2) * .035, k / 12 * .3]), .022, .022), 0xff8a3d, [0, 0, 0], w); w.i = i; return w; }); },
    update(lt, c) {
      const t = tw(lt), tdg = c.w('desgasta') - .15, tca = c.w('calor.') - .15;
      const kc = ease(cl((t - .1) / (tca + .2 - .1)));
      A.parpadea(this.b, t + 1.4, .9); habla(this.b, t); A.preocupa(this.b, cl(kc * 1.4));
      this.b.calor(kc, t); this.b.cara(t > tdg ? 'triste' : 'abierta'); this.b.nivel(lerp(.95, .7, ease(cl((t - tdg) / 1.4))));
      A.tiembla(this.b, t, kc * .5, .55); this.b.rotation.z = Math.sin(t * 3) * .03;
      this.b.brazos[0].rotation.z = this.b.brazos[0].r0 - .2 + Math.sin(t * 9) * .12 * kc; this.b.brazos[1].rotation.z = this.b.brazos[1].r0 + .2 - Math.sin(t * 9 + 1) * .12 * kc;   // se abanica
      this.rojoCe.material.opacity = .5 * kc; this.al.rotation.z = Math.sin(t * 2) * .03;
      this.on.forEach(w => { const f = ((t * .8 + (w.i + 1) / 3) % 1); w.visible = kc > .05; w.position.y = .55 + f * .3; w.scale.setScalar(Math.max(.001, kc * Math.sin(f * Math.PI))); w.rotation.z = Math.sin(t * 5 + w.i) * .12; });
      c.ev('whoosh', .05, .4); if (t > tdg) c.ev('pop', tdg, .4); if (t > tca) c.ev('ding', tca, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tca) etiqueta('¡EL CALOR!', [.0, 2.35, .7], lt - tca, 60, '#ffd640', true);
      rotulo('Lo que sí la desgasta', 'es el calor', lt - .1, RY);
    }
  });

  // ---------- 4 · truco: ni almohada, ni funda gruesa; carga optimizada ----------
  escena('truco', {
    setup() { set({ ventana: [-1.0, 2.2], cuadro: [1.3, 2.25, -2.6] });
      // 1) celular debajo de la almohada
      this.g1 = group([-.95, 1.0, .4]); this.c1 = PM.celular([.2, -.12, -.08], { h: .5, pct: 90 }, this.g1); this.c1.rotation.z = Math.PI / 2; this.r1 = capaRoja(.26, .5, this.c1); this.r1.material.opacity = .45; almohada([0, .08, .05], .78, this.g1);
      // 2) celular con funda gruesa
      this.g2 = group([0, 1.0, .4]); PM.pz(F.rect(.5, .86, .14), 0xff9a3d, [0, 0, -.04], this.g2, { tinta: .016, papel: .05 }); PM.det(F.rect(.42, .78, .1), 0xe0802a, [0, 0, -.02], this.g2);
      this.c2 = PM.celular([0, 0, .02], { h: .68, pct: 90, cara: 'triste' }, this.g2); this.r2 = capaRoja(.3, .6, this.c2); this.r2.material.opacity = .35;
      // 3) carga optimizada
      this.g3 = group([.95, 1.0, .4]); this.c3 = PM.celular([0, 0, 0], { h: .78, pct: 80, cara: 'feliz' }, this.g3);
      this.ry = PM.pz(F.rayo(.24), 0xffe14d, [-.24, .38, .08], this.g3, { tinta: .012, papel: .03 });
      this.x1 = PM.marca([-.62, 1.45, .6], false, .55); this.x2 = PM.marca([.3, 1.45, .6], false, .55); this.ok = PM.marca([1.18, 1.45, .6], true, .55); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('almohada') - .15, tf = c.w('funda') - .15, tg = c.w('gruesa,') - .1, tac = c.w('activa') - .15, to = c.w('optimizada.') - .1;
      this.g1.scale.setScalar(pop(t, .05, .35)); this.g2.scale.setScalar(pop(t, tf - .2, .35)); this.g3.scale.setScalar(pop(t, tac, .35));
      [this.g1, this.g2, this.g3].forEach((g, i) => { g.rotation.z = Math.sin(t * 2.2 + i * 1.7) * .04; g.position.y = 1.0 + Math.sin(t * 3 + i) * .02; });
      A.parpadea(this.c2, t + .4, .9); A.parpadea(this.c3, t + 1.8, .3);
      this.c3.pct(80); this.ry.scale.setScalar(.85 + .2 * Math.abs(Math.sin(t * 6)));
      this.x1.scale.setScalar(pop(t, ta + .2, .3) * .55); this.x2.scale.setScalar(pop(t, tg, .3) * .55); this.ok.scale.setScalar(pop(t, to, .3) * .55);
      this.r1.material.opacity = .3 + .2 * Math.abs(Math.sin(t * 4)); this.r2.material.opacity = .25 + .15 * Math.abs(Math.sin(t * 4 + 1));
      c.ev('whoosh', .05, .4); if (t > ta + .2) c.ev('pop', ta + .2, .4); if (t > tg) c.ev('pop', tg, .4); if (t > tac) c.ev('whoosh', tac, .4); if (t > to) c.ev('ding', to, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > ta + .2) etiqueta('ALMOHADA', [-.95, .3, .7], lt - ta - .2, 34, '#ffffff', true);
      if (t > tg) etiqueta('FUNDA GRUESA', [0, .3, .7], lt - tg, 34, '#ffffff', true);
      if (t > to) etiqueta('OPTIMIZADA', [.95, .3, .7], lt - to, 34, '#ffd640', true);
      if (t < tac) rotulo('Truco: ni en la almohada', 'ni con funda gruesa', lt - .1, RY); else rotulo('Y activa la', 'carga optimizada', lt - tac, RY);
    }
  });

  // ---------- 5 · remate: el amigo que se despierta a medianoche a desconectarlo ----------
  escena('remate', {
    setup() { set({ ventana: [-.95, 2.15] });
      this.cg = group([-.45, 0, 0]); this.c = PM.cama([0, 0, 0], { color: 0xffc83d, w: 2.2 }, this.cg); this.cg.scale.setScalar(.85); this.c.cobija.position.x += .22;
      this.a = PM.chibi([0, 0, 0], { ropa: 0x2ec4a6, colPelo: 0x1f1410, boca: 'apretada', mira: 1, escala: .8 }); this.pa = PM.acuesta(this.a, this.c, 0);
      this.a.head.ojos.forEach(e => PM.det(F.arco(.07, .022, Math.PI * 1.15, Math.PI * 1.85), 0x8a6ab8, [e.position.x, e.position.y - .1, e.position.z + .02], this.a.head));   // ojeras
      buro([.95, 0, -.2]); this.d = PM.despertador([.8, .93, .1], .19, { h: 12 });
      this.ce = PM.celular([1.12, .98, .1], { h: .48, pct: 100, cara: 'feliz' });
      enchufe([1.38, .32, -.2]); this.cab = group([0, 0, 0]); PM.det(P.tubo([[1.12, .74], [1.12, .62], [1.3, .55], [1.38, .4]], .035, .035), CABLE, [0, 0, .12], this.cab); },
    update(lt, c) {
      const t = tw(lt), tma = c.w('Mándaselo') - .1, tde = c.w('despierta') - .15, tmd = c.w('medianoche') - .1, tx = c.w('desconectarlo.') + .1;
      const ks = eout(cl((t - tde) / .45)); this.pa.sienta(ks);
      A.parpadea(this.a, t, .6); PM.ojos(this.a, t < tde ? .1 : .45); A.parpadea(this.ce, t + 1.5, 2.1);
      this.a.head.rotation.z = this.a.head.r0 + (t > tde ? -.1 + Math.sin(t * 2.2) * .07 : Math.sin(t * 2) * .03);
      A.preocupa(this.a, t > tde ? .7 : 0);
      const kb = eout(cl((t - tmd) / .5)); this.a.brazos[1].rotation.z = lerp(this.a.brazos[1].r0, 1.4, kb) + Math.sin(t * 5) * .04; this.a.brazos[0].rotation.z = this.a.brazos[0].r0 + Math.sin(t * 2.5) * .04;
      this.d.hora(12); this.d.suena(t, t > tde - .3 && t < tmd ? .6 : 0);
      // al final desconecta: el cable cae
      const kx = eout(cl((t - tx) / .3)); this.cab.position.set(0, -kx * .12, 0); this.cab.rotation.z = -kx * .05;
      this.ce.cara(t > tx ? 'feliz' : 'feliz'); this.ce.position.y = .98 + Math.abs(Math.sin(t * 3)) * .012;
      c.ev('whoosh', .05, .4); if (t > tde) c.ev('pop', tde, .4); if (t > tx) c.ev('pop', tx, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      etiqueta('MÁNDASELO', [-.35, 2.3, .7], lt - tma, 52, '#ffd640', true);
      if (t > tmd) etiqueta('12:00 AM', [.85, 1.55, .7], lt - tmd, 36, '#ffffff', true);
      rotulo('Mándaselo a quien', 'lo desconecta a medianoche', lt - tma, RY);
    }
  });
  P.cierre();
}
