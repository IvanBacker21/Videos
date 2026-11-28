// Short 27-nov 21:30 (LARGO ~38 s) · CARTULINA CHIBI: ¿por qué el café te despierta si no te da energía?
// La cafeína se parece a la adenosina (la sustancia que se junta mientras estás despierto y da sueño) y le gana el lugar en sus
// receptores: el cansancio sigue ahí, pero el cerebro no lo nota; al pasar el efecto llega el bajón. Vida media ≈ cinco horas.
// Mito: en cantidades normales el café no deshidrata (estudio 2014). Truco: siesta de café (tomarlo y dormir unos veinte minutos).
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-27-2130-cafe-despierta.json OUT ../ejemplos/2026-11-27-2130-cafe-despierta.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, PARED = 0xf6d7b8, ADE = 0x8f5cff, CAF = 0x9a6038;
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const prota = (pos, o = {}) => PM.chibi(pos, { logo: true, boca: 'feliz', escala: .72, colPelo: 0x3a2416, ...o });
  // cocina mexicana con la olla de café de olla humeando sobre la barra
  const cocina = (o = {}) => { ambiente({ top: 0xfbe6c8, bottom: 0xfbe6c8, fog: 0xfbe6c8, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    const co = PM.cocina(); const olla = PM.ollaCafe([o.ollaX ?? .95, co.topY, -1.05], { w: .8 });
    luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); return { co, olla }; };
  // "dentro de la cabeza": fondo rosita liso con puntitos
  const fondoLiso = (col = 0xfde3ee, pt = 0xf9cfe0) => { ambiente({ top: col, bottom: col, fog: col, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    PM.pz(F.rect(30, 30, 0), col, [0, 15, -3], null, { tinta: false, papel: false });
    for (let i = -10; i <= 10; i++) PM.det(F.circ(.05), pt, [i * .7, 2.9 - (i & 1) * .5, -2.98]);
    const piso = group([0, 0, 0]); PM.pz(F.rect(30, 6, 0), col, [0, -3, -1.7], piso, { tinta: false, papel: false }); piso.traverse(m => m.receiveShadow = false);
    luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  // sala con sillón morado
  const sala = () => { ambiente({ top: PARED, bottom: PARED, fog: PARED, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    PM.cuarto({ sinVentana: true, pared: PARED, cuadro: [-1.15, 2.05, -2.6] }); const s = P.sillon([0, 0, -.75], { w: 2.5, color: 0x7b5cff });
    luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); return s; };
  // pivote en la cadera para "derrumbarse" acostado en el sillón: piv.cae(k 0..1, x)
  const pivote = (p, x0, x1, es = .6) => { const piv = group([x0, .02 + .55 * es, .35]); piv.add(p); p.position.set(0, -.55 * es, 0);
    piv.cae = k => { piv.rotation.z = 1.42 * k; piv.position.x = lerp(x0, x1, k); piv.position.y = lerp(.02 + .55 * es, 1.0, k); }; piv.cae(0); return piv; };
  const taza = (p, o = {}) => { const tz = PM.taza([0, -.6, .12], p.brazos[1], { liquido: 0x6b3a1e, ...o }); tz.scale.setScalar(1.3); return tz; };
  // brazo derecho con la taza: k 0 = al pecho, 1 = a la boca (sorbo)
  const sorbo = (p, tz, t, k) => { const br = p.brazos[1]; br.rotation.z = lerp(1.0, 2.0, k) + Math.sin(t * 3) * .03; tz.rotation.z = -br.rotation.z + k * .35; };

  // ---------- 1 · gancho: ojeroso con su café; rayito de energía TACHADO ----------
  escena('gancho', {
    setup() { this.s = cocina(); this.p = prota([-.3, .02, .35], { boca: 'feliz', mira: 1 }); this.oj = PM.ojeras(this.p); this.tz = taza(this.p);
      this.ry = PM.pz(F.rayo(.9), 0xffe14d, [.72, 1.75, .8], null, { tinta: .016, papel: .06 }); this.ry.scale.setScalar(.001);
      this.x = PM.marca([.72, 1.75, 1.0], false, 1.1); this.x.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('café') - .1, tn = c.w('nada') - .15, te = c.w('energía') - .2;
      A.parpadea(this.p, t + .4, .4); respira(this.p, t); habla(this.p, t); this.oj(1);
      PM.ojos(this.p, t > .3 && t < tc ? .5 : 1); this.p.boca(t > .3 && t < tc ? 'apretada' : 'abierta');
      const ks = t < tc ? 0 : Math.max(0, Math.sin(cl((t - tc) / .9) * Math.PI)); sorbo(this.p, this.tz, t, ks); this.tz.humea(t, 1);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04;
      this.s.olla.humea(t, 1);
      this.ry.scale.setScalar(pop(t, tn, .3)); this.ry.rotation.z = Math.sin(t * 4) * .08;
      this.x.scale.setScalar(1.1 * pop(t, te, .3));
      A.preocupa(this.p, t > te ? .7 : 0);
      c.ev('whoosh', .05, .4); if (t > tn) c.ev('pop', tn, .5); if (t > te) c.ev('pop', te, .7);
      cam([0, 1.2, lerp(10.4, 9.8, ease(cl(lt / 3.5)))], [0, 1.15, 0], 34);
      if (t > te) etiqueta('¿CERO ENERGÍA?', [0, 2.6, .9], lt - te, 42, '#ffd640', true);
      rotulo('¿Por qué el café', 'te despierta?', lt - .05, RY);
    }
  });

  // ---------- 2 · adenosina: el cerebro suelta bolitas moradas que llenan el medidor de SUEÑO ----------
  escena('adenosina', {
    setup() { fondoLiso(); this.cb = PM.cerebro([-.7, 1.5, 0], .55);
      this.m = PM.medidorSueno([.65, .05, .2], { w: .72, h: 1.35 });
      this.bs = Array.from({ length: 7 }, (_, i) => { const b = PM.molecula([0, 0, .6], .15, ADE); b.scale.setScalar(.001); b.i = i; return b; }); },
    update(lt, c) {
      const t = tw(lt), tj = c.w('junta') - .3, ta = c.w('adenosina') - .1, tk = c.w('cansancio') - .15;
      const head = this.cb.head; A.parpadea(this.cb, t + .3, .4); head.rotation.z = Math.sin(t * 2.4) * .05; this.cb.position.y = 1.5 + Math.sin(t * 2.2) * .03;
      let lleno = 0;
      this.bs.forEach((b, i) => { const t0 = tj + i * .34, k = cl((t - t0) / .7);
        if (t < t0) { b.scale.setScalar(.001); return; }
        if (k >= 1) { b.scale.setScalar(.001); lleno++; return; }
        const x = lerp(-.3, .65, k), y = lerp(1.55, 1.25, k) + Math.sin(k * Math.PI) * .55; b.position.set(x, y, .6);
        b.scale.setScalar(k < .85 ? Math.min(1, k * 6) : Math.max(.001, (1 - k) / .15)); b.update(t, i); });
      this.m.nivel(.08 + .85 * lleno / 7);
      // el cerebro se va poniendo con sueño conforme se llena
      const s = lleno / 7; PM.ojos(this.cb, lerp(1, .45, s)); this.cb.cara(s > .6 ? 'duda' : 'feliz');
      if (t > tj) c.ev('pop', tj, .4); for (let i = 0; i < 7; i++) { const t1 = tj + i * .34 + .7; if (t > t1) c.ev('pop', t1, .25); } if (t > tk) c.ev('ding', tk, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tk) etiqueta('= CANSANCIO', [0, 2.6, .9], lt - tk, 42, '#ffffff', true);
      else if (t > ta) etiqueta('ADENOSINA', [0, 2.6, .9], lt - ta, 44, '#c9a8ff', true);
      rotulo('Tu cerebro junta', 'adenosina', lt - .05, RY);
    }
  });

  // ---------- 3 · bloqueo: cafeínas disfrazadas se sientan en las sillitas; las moradas se quedan paradas; cobija al medidor ----------
  escena('bloqueo', {
    setup() { fondoLiso(); this.sx = [-.4, .25, .9];
      this.si = this.sx.map(x => PM.sillaReceptor([x, .15, 0], { color: 0x2ec4a6 }));
      this.m = PM.medidorSueno([-1.02, 1.3, -.2], { w: .5, h: .85 }); this.m.nivel(.9);
      this.cf = this.sx.map((x, i) => PM.molecula([2, .8, .4], .16, CAF, { antifaz: ADE }));
      this.ad = [-1.2, -.85, -.5].map(x => PM.molecula([x, -.02, .7], .15, ADE));
      this.q = PM.pregunta([-.85, .55, .8], .5); this.q.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('cafeína') - .1, tl = c.w('lugar') - .5, tk = c.w('cansancio') - .15, tn = c.w('nota') - .6;
      // cafeínas entran saltando desde la derecha y se sientan
      this.cf.forEach((b, i) => { const k = eout(cl((t - tc - i * .2) / (tl - tc + .2))), x = lerp(1.9 + i * .3, this.sx[i], k);
        const y = lerp(.4, .15 + .46 + .16, k) + Math.abs(Math.sin(k * Math.PI * 3)) * .25 * (1 - k); b.position.set(x, y, .35); b.update(t, i, k < 1 ? 1 : .2); b.cara(k < 1 ? 'feliz' : 'feliz'); });
      // adenosinas llegan desde la izquierda… y se quedan sin lugar
      this.ad.forEach((b, i) => { const k = eout(cl((t - .2 - i * .15) / 1.6)); b.position.x = lerp(-2.1 - i * .3, [-1.2, -.85, -.5][i], k); b.update(t, i + 2, k < 1 ? 1 : .15);
        b.cara(t > tl + .4 ? 'duda' : 'feliz'); A.parpadea(b.cuerpo, t + i, .5); });
      this.q.scale.setScalar(.45 * pop(t, tl + .4, .3)); this.q.rotation.z = Math.sin(t * 3) * .1;
      this.m.tapa(eout(cl((t - tn) / .4))); this.m.rotation.z = t > tn ? Math.sin(t * 3) * .02 : 0;
      if (t > tc) c.ev('whoosh', tc, .5); if (t > tl + .3) c.ev('pop', tl + .3, .6); if (t > tl + .4) c.ev('pop', tl + .4, .4); if (t > tn) c.ev('whoosh', tn, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tn) etiqueta('¡TU CEREBRO NO LO NOTA!', [0, 2.6, .9], lt - tn, 38, '#ffffff', true);
      else if (t > tk) etiqueta('EL CANSANCIO SIGUE AHÍ', [0, 2.6, .9], lt - tk, 38, '#c9a8ff', true);
      else if (t > tl) etiqueta('¡LE GANA EL LUGAR!', [0, 2.6, .9], lt - tl, 40, '#ffd640', true);
      else if (t > tc) etiqueta('CAFEÍNA', [0, 2.6, .9], lt - tc, 44, '#e8b48c', true);
      rotulo('La cafeína se parece', 'y le gana el lugar', lt - .05, RY);
    }
  });

  // ---------- 4 · bajón: las cafeínas se van, las moradas se sientan de golpe y él se derrumba en el sillón ----------
  escena('bajon', {
    setup() { this.s = sala(); this.p = prota([0, 0, 0], { boca: 'feliz', mira: 1, escala: .6 }); this.piv = pivote(this.p, -.4, .2, .6);
      this.tz = taza(this.p); this.z = P.zzz([-.75, 1.4, .9]); this.z.scale.setScalar(.001);
      this.lu = PM.lupa([.78, 1.95, .9], .52, { fondo: 0xfde3ee });
      this.si = [-.28, 0, .28].map(x => PM.sillaReceptor([x, -.32, 0], { s: .32 }, this.lu.dentro));
      this.cf = [-.28, 0, .28].map(x => PM.molecula([x, .0, .1], .07, CAF, { antifaz: ADE }, this.lu.dentro));
      this.ad = [-.28, 0, .28].map(x => PM.molecula([x, -.36, .12], .065, ADE, {}, this.lu.dentro)); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('acaba') - .15, tg = c.w('cae') - .2, tb = c.w('bajón') - .15;
      A.parpadea(this.p, t + 1.2, .4);
      const kc = eout(cl((t - tg) / .4)); this.piv.cae(kc); if (kc > .99) this.piv.position.y = 1.0 + Math.sin(t * 2) * .01;
      if (t < tg) { habla(this.p, t); this.piv.position.y += Math.abs(Math.sin(t * 2.6)) * .015; }
      PM.ojos(this.p, t > tg + .2 ? .1 : t > ta + .5 ? .55 : 1); this.p.boca(t > tg ? 'apretada' : 'feliz'); A.preocupa(this.p, t > ta + .5 && t < tg ? .7 : 0);
      sorbo(this.p, this.tz, t, 0); this.tz.visible = t < tg; this.tz.humea(t, .5);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + (t > tg ? -.6 : 0) + Math.sin(t * 3) * .04;
      this.z.scale.setScalar(.75 * pop(t, tb, .4)); this.z.update(t, 1);
      // en la lupa: cafeínas se van saltando; las moradas suben de golpe a las sillas
      this.cf.forEach((b, i) => { const k = cl((t - ta - i * .12) / .7); b.position.set(lerp([-.28, 0, .28][i], .7 + i * .1, k), .0 + Math.sin(k * Math.PI) * .2, .1);
        b.scale.setScalar(Math.max(.001, 1 - Math.max(0, k - .6) / .4)); b.update(t, i, 1); });
      this.ad.forEach((b, i) => { const k = eout(cl((t - tg - i * .05) / .25)); b.position.y = lerp(-.36, .0, k) + (k < 1 ? Math.sin(k * Math.PI) * .12 : 0); b.update(t, i + 3, k < 1 ? 1 : .2); b.cara('feliz'); });
      this.lu.rotation.z = Math.sin(t * 2) * .04;
      if (t > ta) c.ev('whoosh', ta, .5); if (t > tg) c.ev('pop', tg, .8); if (t > tb) c.ev('ding', tb, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tb) etiqueta('¡EL BAJÓN!', [0, 2.6, .9], lt - tb, 46, '#ff8a5b', true);
      else if (t > tg) etiqueta('¡TODO DE GOLPE!', [0, 2.6, .9], lt - tg, 42, '#c9a8ff', true);
      else if (t > ta) etiqueta('SE ACABA EL EFECTO', [0, 2.6, .9], lt - ta, 38, '#ffffff', true);
      rotulo('Al pasar el efecto', 'llega el bajón', lt - .05, RY);
    }
  });

  // ---------- 5 · dura: reloj que avanza cinco horas; de seis cafeínas alrededor de su cabeza, se van tres ----------
  escena('dura', {
    setup() { this.s = cocina({ ollaX: 1.05 }); this.p = prota([.3, .02, .35], { boca: 'feliz', mira: -1 }); this.tz = taza(this.p);
      this.rj = P.relojPapel([-.82, 1.7, .4], { r: .5 }); this.rj.hora(3);
      this.cf = Array.from({ length: 6 }, (_, i) => { const b = PM.molecula([0, 0, .8], .11, CAF, { antifaz: ADE }); b.f = i / 6 * Math.PI * 2; return b; }); },
    update(lt, c) {
      const t = tw(lt), th = c.w('cinco') - .2, tm = c.w('mitad') - .2;
      A.parpadea(this.p, t + 2.1, .4); respira(this.p, t); habla(this.p, t); sorbo(this.p, this.tz, t, 0); this.tz.humea(t, .7); this.s.olla.humea(t, 1);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - (t > th ? .9 * ease(cl((t - th) / .3)) : 0) + Math.sin(t * 3) * .04;
      this.rj.hora(3 + 5 * ease(cl((t - th) / 1.3))); this.rj.rotation.z = t > th && t < th + 1.3 ? Math.sin(t * 30) * .03 : 0;
      this.p.boca(t > tm ? 'abierta' : 'feliz'); A.preocupa(this.p, t > tm ? .6 : 0);
      const hx = .3, hy = 1.95;
      this.cf.forEach((b, i) => { const a = b.f + t * 1.6, se = i % 2 === 1, k = se ? eout(cl((t - tm - i * .06) / .6)) : 0;
        const R = .62 + k * 1.6; b.position.set(hx + Math.cos(a) * R, hy + Math.sin(a) * .3 + k * .9, .8); b.scale.setScalar(Math.max(.001, 1 - k)); b.update(t, i); });
      if (t > th) c.ev('whoosh', th, .5); if (t > tm) c.ev('pop', tm, .6); if (t > tm + .3) c.ev('ding', tm + .3, .4);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tm) etiqueta('¡LA MITAD SIGUE!', [0, 2.6, .9], lt - tm, 42, '#ffd640', true);
      else if (t > th) etiqueta('CINCO HORAS DESPUÉS…', [0, 2.6, .9], lt - th, 38, '#ffffff', true);
      rotulo('Y dura bastante', 'en tu cuerpo', lt - .05, RY);
    }
  });

  // ---------- 6 · mito: balanza agua vs café; primero se carga… y luego queda casi pareja ----------
  escena('mito', {
    setup() { fondoLiso(0xdff3ff, 0xc6e6fb); this.p = prota([-1.05, .02, .45], { boca: 'feliz', mira: 1, escala: .58 });
      this.b = PM.balanza([.38, .02, .2], { w: 1.45 });
      this.g = PM.pz(F.gota(.42), 0x3d9bff, [0, .24, .08], this.b.platos[0], { tinta: .014, papel: .05 }); PM.det(F.elipse(.04, .07), 0xffffff, [-.06, .3, .1], this.b.platos[0], .4);
      this.tz = PM.taza([0, .17, .08], this.b.platos[1], { liquido: 0x6b3a1e }); this.tz.scale.setScalar(1.25);
      this.M = PM.letrero([-.05, 2.25, .5], 'MITO', { w: .95, h: .36, hilos: false, color: 0xffffff, borde: 0xff5b5b, tinta: '#e0453a' }); this.M.traverse(m => m.castShadow = false);
      this.ok = PM.marca([1.0, 1.95, .9], true, .9); this.ok.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), tm = c.w('mito') - .2, td = c.w('deshidrata') - .2, th = c.w('hidrata', 1) - .15;
      A.parpadea(this.p, t + .9, .4); respira(this.p, t); habla(this.p, t); this.tz.humea(t, .8);
      this.M.scale.setScalar(pop(t, tm, .3)); this.M.columpia(t, .04); this.M.visible = t < th;
      // se carga hacia el agua (izq. abajo) y al decir "hidrata" se empareja con rebote
      const a1 = -.32 * ease(cl((t - td) / .45)), kh = cl((t - th) / .8), a = t < th ? a1 : lerp(-.32, -.04, spring(kh, 1.4, 7));
      this.b.inclina(a + Math.sin(t * 3) * .01);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + (t > td ? 1.3 : .2) + Math.sin(t * 6) * .04; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04;
      this.p.boca(t > th ? 'feliz' : t > td ? 'abierta' : 'feliz'); A.preocupa(this.p, t > td && t < th ? .6 : 0);
      this.ok.scale.setScalar(.9 * pop(t, th + .2, .35));
      if (t > tm) c.ev('pop', tm, .5); if (t > td) c.ev('whoosh', td, .5); if (t > th) c.ev('ding', th + .2, .6);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > th) etiqueta('HIDRATA CASI COMO EL AGUA', [0, 2.6, .9], lt - th, 34, '#ffffff', true);
      else if (t > td) etiqueta('¿DESHIDRATA?', [.3, 2.6, .9], lt - td, 42, '#8fd3ff', true);
      rotulo('Mito: el café', 'te deshidrata', lt - .05, RY);
    }
  });

  // ---------- 7 · truco: sorbo, siesta en el sillón, reloj de veinte minutos y ¡despierta como resorte! ----------
  escena('truco', {
    setup() { this.s = sala(); this.p = prota([0, 0, 0], { boca: 'feliz', mira: 1, escala: .6 }); this.piv = pivote(this.p, -.35, .2, .6);
      this.tz = taza(this.p); this.tp = PM.taza([-1.08, .18, .7], null, { liquido: 0x6b3a1e }); this.tp.scale.setScalar(1.1); this.tp.visible = false;
      this.d = PM.despertador([.95, 1.95, .7], .36); this.d.hora(3); this.d.scale.setScalar(.001);
      this.z = P.zzz([-.72, 1.4, .9]); this.r = P.rayitas([-.35, 1.85, .7], 3, 0x2b2f4a); this.r.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), tt = c.w('tómate') - .1, td = c.w('duerme') - .15, tv = c.w('veinte') - .2, ts = c.w('despiertas') - .2, te = c.w('efecto') - .2;
      A.parpadea(this.p, t + .6, .4);
      const ks = t < tt ? 0 : Math.max(0, Math.sin(cl((t - tt) / .8) * Math.PI)); sorbo(this.p, this.tz, t, ks); this.tz.visible = t < td; this.tz.humea(t, .8);
      this.tp.visible = t > td; this.tp.humea(t, .4);
      // se acuesta y luego brinca de pie
      const kc = eout(cl((t - td) / .35)) * (1 - eout(cl((t - ts) / .3)));
      this.piv.cae(kc); const brinco = t > ts ? Math.max(0, Math.sin(cl((t - ts - .15) / .45) * Math.PI)) * .3 : 0; this.piv.position.y += brinco;
      if (t < td || t > ts + .5) habla(this.p, t);
      const dormido = t > td + .2 && t < ts; PM.ojos(this.p, dormido ? .1 : 1); if (t > ts) this.p.head.ojos.forEach(e => e.scale.x = 1.2);
      this.p.boca(dormido ? 'apretada' : t > ts ? 'abierta' : 'feliz');
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - (t > ts ? 2.2 * Math.max(0, Math.sin(cl((t - ts) / .7) * Math.PI)) : 0) + Math.sin(t * 3) * .04;
      if (t > td) { const br = this.p.brazos[1]; br.rotation.z = br.r0 + (t > ts ? 2.2 * Math.max(0, Math.sin(cl((t - ts) / .7) * Math.PI)) : .1); }
      this.z.scale.setScalar(dormido ? .7 * pop(t, td + .25, .3) : .001); this.z.update(t, 1);
      // despertador: aparece con la siesta, corre veinte minutos y suena al despertar
      this.d.scale.setScalar(pop(t, td, .3)); this.d.hora(3 + (20 / 60) * ease(cl((t - tv) / (ts - tv)))); this.d.suena(t, t > ts && t < ts + 1.2 ? 1 : 0);
      this.r.scale.setScalar(t > ts ? .8 * pop(t, ts + .1, .3) : .001); this.r.position.set(-.35 + .05, 1.85 + brinco, .7);
      if (t > tt) c.ev('pop', tt + .3, .3); if (t > td) c.ev('whoosh', td, .5); if (t > ts) c.ev('ding', ts, .8); if (t > te) c.ev('pop', te, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > te) etiqueta('¡JUSTO HACE EFECTO!', [0, 2.6, .9], lt - te, 40, '#7ff0c8', true);
      else if (t > tv) etiqueta('VEINTE MINUTOS', [0, 2.6, .9], lt - tv, 42, '#ffd640', true);
      else if (t > tt) etiqueta('CAFÉ + SIESTA', [0, 2.6, .9], lt - tt, 42, '#ffffff', true);
      rotulo('Truco: la siesta', 'de café', lt - .05, RY);
    }
  });

  // ---------- 8 · remate A o B: dos letreros con pop y gesto de duda ----------
  escena('remate', {
    setup() { this.s = cocina({ ollaX: 1.1 }); this.p = prota([0, .02, .35], { boca: 'feliz', mira: 0 });
      this.ls = [[0, 'SÍ ME DESVELA', 0x7b5cff, '#5a3fd6'], [1, 'NI ME HACE', 0xff6b5b, '#e0453a']].map(([i, tx, b, ti]) => { const br = this.p.brazos[i];
        const h = group([0, -.5, .08], br); PM.pz(F.rect(.06, 1.2, .02), 0xc8a06a, [0, .6, -.01], h, { tinta: .008, papel: false });
        const L = PM.letrero([0, 1.45, .02], tx, { w: 1.25, h: .48, hilos: false, color: 0xffffff, borde: b, tinta: ti }, h); h.L = L; return h; }); },
    update(lt, c) {
      const t = tw(lt), tq = c.w('quita') - .2, tn = c.w('ni') - .15;
      A.parpadea(this.p, t + 1.1, .4); respira(this.p, t); this.s.olla.humea(t, 1);
      const th = [tq, tn]; this.ls.forEach((h, i) => { const br = this.p.brazos[i], s = i ? 1 : -1, k = ease(cl((t - th[i] + .15) / .3));
        br.rotation.z = br.r0 + s * lerp(.15, 1.9, k) + Math.sin(t * 5 + i) * .04 * k; h.rotation.z = -br.rotation.z; h.visible = k > .02; h.L.scale.setScalar(pop(t, th[i], .35)); h.L.rotation.z = Math.sin(t * 3 + i * 2) * .05; });
      const lado = t < tn ? -1 : 1; A.ladea(this.p, t > tq ? .35 + .1 * Math.sin(t * 3) : 0, lado); A.preocupa(this.p, t > tq ? .6 : 0);
      this.p.boca(t > tn + .4 ? 'apretada' : 'abierta'); if (t < tq) habla(this.p, t);
      if (t > tq) c.ev('pop', tq, .6); if (t > tn) c.ev('pop', tn, .6);
      cam([0, 1.2, lerp(10.4, 10.0, ease(cl(lt / 3.1)))], [0, 1.15, 0], 34);
      rotulo('¿Te quita el sueño', 'o ni te hace?', lt - .05, RY);
    }
  });
  P.cierre();
}
