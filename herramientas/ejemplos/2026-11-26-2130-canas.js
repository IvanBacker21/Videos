// Short 26-nov 21:30 (LARGO ~38 s) · CARTULINA CHIBI: ¿un susto te deja el pelo blanco de la noche a la mañana?
// Mito: el pelo ya formado no cambia de color; las canas crecen blancas desde la raíz. En la raíz hay células que dan color y se
// agotan con los años. Harvard 2020 (Nature, Ya-Chieh Hsu): en ratones, el estrés activa nervios que liberan noradrenalina y agotan
// de golpe esas células (para siempre) → canas. Otro mito: arrancar una no saca siete (un folículo = un pelo); arrancarla lastima la raíz.
// Fuentes: NIH (salud.nih.gov), Harvard/Nature 2020, Expansión, La Nación, Semana.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-26-2130-canas.json OUT ../ejemplos/2026-11-26-2130-canas.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, PARED = 0xf6d7b8;
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  // sala de cartulina con espejo ovalado (marco de madera) y macetita
  const sala = (o = {}) => { ambiente({ top: PARED, bottom: PARED, fog: PARED, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.cuarto({ sinVentana: true, pared: PARED, cuadro: o.cuadro ?? [-1.25, 1.85, -2.6] });
    const ex = o.espejo ?? .85, es = group([ex, 1.55, -2.4]);
    PM.pz(F.elipse(.56, .78), 0xc8693a, [0, 0, 0], es, { tinta: .016, papel: .06 }); PM.pz(F.elipse(.46, .67), 0xcfeefc, [0, 0, .02], es, { tinta: .01, papel: false });
    PM.det(F.rect(.06, .5, .0), 0xffffff, [-.18, .12, .045], es, -.5); PM.det(F.rect(.035, .28, .0), 0xffffff, [-.05, .22, .045], es, -.5);
    const ma = group([o.maceta ?? -1.0, 0, -1.6]); PM.pz(F.poly([[-.2, 0], [.2, 0], [.25, .32], [-.25, .32]]), 0xc8693a, [0, 0, 0], ma, { tinta: .012, papel: .04 });
    for (const [x, r] of [[-.12, .5], [0, 0], [.12, -.5]]) { const h = group([x, .3, -.02], ma); h.rotation.z = r; PM.pz(F.elipse(.09, .28), 0x2ec4a6, [0, .26, 0], h, { tinta: .01, papel: false }); }
    luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); return { es }; };
  // fondo liso para los acercamientos (corte de la piel)
  const fondoLiso = (col = 0xffe6d8) => { ambiente({ top: col, bottom: col, fog: col, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    PM.pz(F.rect(30, 30, 0), col, [0, 15, -3], null, { tinta: false, papel: false });
    for (let i = -10; i <= 10; i++) PM.det(F.circ(.05), 0xffd2bd, [i * .7, 2.9 - (i & 1) * .5, -2.98]);
    luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const prota = (pos, o = {}) => { const p = PM.chibi(pos, { logo: true, boca: 'feliz', escala: .72, colPelo: 0x3a2416, ...o }); return p; };
  // cana suelta (pelito blanco) para la cabeza o la mano
  const cana = (pos, parent, s = 1, w = .035) => { const g = group(pos, parent); g.scale.setScalar(s);
    PM.pz(P.tubo([[0, 0], [.03, .14], [-.02, .28], [.03, .4]], w, w * .65), 0xf7f7fb, [0, 0, 0], g, { tinta: .008, papel: false }); return g; };

  // ---------- 1 · gancho: susto frente al espejo y el copete se pone BLANCO de golpe ----------
  escena('gancho', {
    setup() { this.s = sala(); this.p = prota([-.35, .02, .35], { boca: 'feliz', mira: 1 });
      this.cb = PM.copeteBlanco(this.p); this.r = P.rayitas([-.35, 2.05, .6], 3, 0x2b2f4a); this.r.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('susto'), tb = c.w('blanco') - .1, tm = c.w('mañana') - .2;
      A.parpadea(this.p, t + .4, .4); habla(this.p, t);
      const sus = t > ts; const brinco = sus ? Math.max(0, Math.sin(cl((t - ts) / .35) * Math.PI)) * .18 : 0;
      respira(this.p, t); this.p.position.y += brinco;
      A.preocupa(this.p, sus ? 1 : 0); this.p.boca(sus ? 'abierta' : 'feliz');
      this.p.head.ojos.forEach(e => e.scale.x = sus ? 1.3 : 1); if (sus && ((t + .4) % 3.2) >= .1) this.p.head.ojos.forEach(e => e.scale.y = 1.3);
      // manos a la cara del susto
      const km = ease(cl((t - ts) / .25)); this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - 2.3 * km + Math.sin(t * 20) * .05 * km; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 2.3 * km - Math.sin(t * 20) * .05 * km;
      if (sus) A.tiembla(this.p, t, .6, -.35);
      this.r.scale.setScalar(.9 * pop(t, ts, .3)); this.r.position.y = 2.05 + Math.sin(t * 12) * .03;
      this.cb.aparece(ease(cl((t - tb) / .35)));
      c.ev('whoosh', .05, .4); if (t > ts) c.ev('pop', ts, .6); if (t > tb) c.ev('ding', tb, .6);
      cam([0, 1.2, lerp(10.4, 9.6, ease(cl(lt / 3.7)))], [0, 1.15, 0], 34);
      if (t > tm) etiqueta('¿DE LA NOCHE A LA MAÑANA?', [0, 2.6, .9], lt - tm, 38, '#ffd640', true);
      rotulo('¿Un susto te deja', 'el pelo blanco?', lt - .05, RY);
    }
  });

  // ---------- 2 · mito: el copete blanco se ROMPE como papel; lupa: las canas crecen blancas desde la raíz ----------
  escena('mito', {
    setup() { this.s = sala(); this.p = prota([-.35, .02, .35], { boca: 'abierta', mira: 1 });
      this.cb = PM.copeteBlanco(this.p); this.cb.aparece(1);
      this.M = PM.letrero([-.35, 2.3, .5], 'MITO', { w: .95, h: .36, hilos: false, color: 0xffffff, borde: 0xff5b5b, tinta: '#e0453a' }); this.M.traverse(m => m.castShadow = false);
      this.lu = PM.lupa([.62, 1.35, .7], .66, { fondo: 0xffe6d8 }); this.rz = PM.raizPelo([0, .12, 0], { largo: 2.0, n: 3 }, this.lu.dentro); this.rz.scale.setScalar(.34); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('canas') - .2, tr = c.w('raíz') - .1;
      A.parpadea(this.p, t + 1.5, .4); respira(this.p, t); habla(this.p, t);
      this.cb.rompe(ease(cl((t - .1) / .7))); this.cb.visible = t < .85;
      const km = this.M.scale.setScalar(pop(t, .15, .3)); void km; this.M.columpia(t, .04); this.M.visible = t < tc + .1;
      // primero se ve aliviado; luego se mueve a la izquierda y señala la lupa
      const kx = ease(cl((t - tc + .3) / .5)); this.p.position.x = lerp(-.35, -.8, kx);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + lerp(0, 1.4, kx) + Math.sin(t * 7) * .05 * kx;
      this.p.boca(t < .8 ? 'abierta' : 'feliz'); A.preocupa(this.p, t < .8 ? .6 : 0);
      this.lu.scale.setScalar(pop(t, tc, .35)); this.lu.rotation.z = Math.sin(t * 2) * .04;
      this.rz.canas(.08 + .4 * ease(cl((t - tc - .2) / 1.8))); this.rz.update(t);
      c.ev('pop', .12, .6); if (t > tc) c.ev('pop', tc, .5); if (t > tr) c.ev('ding', tr, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tc + .2) etiqueta('BLANCAS DESDE LA RAÍZ', [0, 2.6, .9], lt - tc - .2, 38, '#ffffff', true);
      else if (t > .9) etiqueta('NO CAMBIA DE COLOR', [0, 2.6, .9], lt - .9, 38, '#8fd3ff', true);
      rotulo('Mito: el pelo', 'no cambia de color', lt - .05, RY);
    }
  });

  // ---------- 3 · raíz: las "pintoras" le ponen color al pelo… y con los años se van una por una ----------
  escena('raiz', {
    setup() { fondoLiso(); this.rz = PM.raizPelo([0, 1.15, 0], { largo: 2.0, n: 3 }); this.rz.scale.setScalar(1.05); },
    update(lt, c) {
      const t = tw(lt), tcel = c.w('células') - .1, tco = c.w('color') - .1, ta = c.w('años') - .1;
      const sal = [0, 1, 2].map(i => ease(cl((t - ta - .2 - i * .65) / .55)));
      this.rz.update(t, sal); this.rz.canas(.5 * ease(cl((t - ta - .5) / 2.2)));
      // las pintoras "brillan" al nombrarlas
      this.rz.pintoras.forEach((p, i) => { if (sal[i] < .02) p.scale.setScalar(1 + (t > tcel && t < tcel + .6 ? .15 * Math.sin((t - tcel) * 10) : 0)); });
      if (t > tcel) c.ev('pop', tcel, .5); [0, 1, 2].forEach(i => { const t0 = ta + .2 + i * .65; if (t > t0) c.ev('whoosh', t0, .35); });
      cam([0, 1.2, lerp(10.4, 9.8, ease(cl(lt / 5.4)))], [0, 1.1, 0], 34);
      if (t > ta) etiqueta('CON LOS AÑOS SE VAN…', [0, 2.6, .9], lt - ta, 38, '#ffd640', true);
      else if (t > tco) etiqueta('¡LE PONEN COLOR!', [0, 2.6, .9], lt - tco, 40, '#8fd3ff', true);
      rotulo('En la raíz hay', 'células que dan color', lt - .05, RY);
    }
  });

  // ---------- 4 · ratones: un susto fuerte y el pelaje gris se vuelve blanco ----------
  escena('estres', {
    setup() { fondoLiso(0xdff3ea);
      const piso = group([0, 0, 0]); PM.pz(F.rect(30, 6, 0), 0xc9e3f0, [0, -3, -1.7], piso, { tinta: false, papel: false }); piso.traverse(m => m.receiveShadow = false);
      this.L = PM.letrero([0, 2.25, -.6], 'EN RATONES', { w: 1.5, h: .4, hilos: false, color: 0xffffff, borde: 0x7b5cff, tinta: '#5a3fd6' }); this.L.traverse(m => m.castShadow = false);
      this.m = PM.raton([.15, 0, .3], { escala: 1.05 }); this.b = P.bam([.95, 1.45, .6]); this.b.scale.setScalar(.001);
      this.r = P.rayitas([.75, 1.3, .62], 3, 0x2b2f4a); this.r.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), tr = c.w('ratones') - .15, ts = c.w('susto') - .1, tc = c.w('canas') - .25;
      this.L.scale.setScalar(pop(t, Math.max(.05, tr), .35)); this.L.columpia(t, .04);
      const sus = t > ts; this.m.update(t, 0); this.m.susto(sus ? 1 : 0);
      this.m.position.x = .15 + (sus ? Math.sin(t * 55) * .02 : 0); this.m.position.y = sus ? Math.max(0, Math.sin(cl((t - ts) / .3) * Math.PI)) * .15 : 0;
      this.b.scale.setScalar(.55 * pop(t, ts, .3) * (t > ts + .9 ? Math.max(.001, 1 - (t - ts - .9) / .3) : 1)); this.b.rotation.z = .2 + Math.sin(t * 8) * .1;
      this.r.scale.setScalar(.8 * pop(t, ts + .1, .3)); this.r.rotation.z = -.5;
      this.m.blanco(ease(cl((t - tc) / .9)));
      if (t > tr) c.ev('pop', Math.max(.05, tr), .5); if (t > ts) c.ev('pop', ts, .7); if (t > tc) c.ev('ding', tc, .6);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tc) etiqueta('¡LE SALIERON CANAS!', [0, 2.6, .9], lt - tc, 40, '#ffffff', true);
      else if (t > ts) etiqueta('¡UN SUSTO FUERTE!', [0, 2.6, .9], lt - ts, 40, '#ff8a5b', true);
      rotulo('En ratones, un susto', 'sí sacó canas', lt - .05, RY);
    }
  });

  // ---------- 5 · nervios: el estrés activa un nervio que chispea y TODAS las pintoras se van de golpe… para siempre ----------
  escena('nervios', {
    setup() { fondoLiso(); this.rz = PM.raizPelo([0, 1.15, 0], { largo: 2.0, n: 5, nervio: true }); this.rz.scale.setScalar(1.05);
      this.x = PM.marca([.85, 1.85, .6], false, 1); this.x.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), tn = c.w('nervios') - .15, tg = c.w('golpe') - .15, tr = c.w('regresan') - .2;
      this.rz.zap(t, t > tn ? 1 : 0);
      const q = ease(cl((t - tg) / .5)); this.rz.update(t, [0, 1, 2, 3, 4].map(i => cl(q * 1.15 - i * .03)));
      this.rz.canas(.9 * ease(cl((t - tg - .3) / 1.4)));
      this.x.scale.setScalar(pop(t, tr, .35)); this.x.rotation.z = Math.sin(t * 3) * .08;
      if (t > tn) c.ev('whoosh', tn, .5); if (t > tg) c.ev('pop', tg, .7); if (t > tr) c.ev('ding', tr, .5);
      cam([0, 1.2, 10.4], [0, 1.1, 0], 34);
      if (t > tr) etiqueta('¡Y YA NO REGRESAN!', [0, 2.6, .9], lt - tr, 40, '#ff8a5b', true);
      else if (t > tg) etiqueta('¡TODAS DE GOLPE!', [0, 2.6, .9], lt - tg, 40, '#ffd640', true);
      else if (t > tn) etiqueta('EL ESTRÉS ACTIVA NERVIOS', [0, 2.6, .9], lt - tn, 36, '#8fd3ff', true);
      rotulo('El estrés gasta', 'esas células de golpe', lt - .05, RY);
    }
  });

  // ---------- 6 · siete: se arranca una cana con pinzas, aparecen "siete" de mentira y se tachan; una raíz = un pelo ----------
  escena('siete', {
    setup() { this.s = sala({ espejo: -.95, maceta: 1.05, cuadro: [1.2, 1.9, -2.6] }); this.p = prota([0, .02, .35], { boca: 'feliz', mira: 0 });
      this.c0 = cana([.26, .6, .05], this.p.head); this.c0.rotation.z = -.3;
      const b = this.p.brazos[1]; this.pin = group([0, -.55, .07], b);
      for (const sx of [-1, 1]) PM.pz(F.poly([[0, 0], [.025 * sx, 0], [.012 * sx, -.32], [.004 * sx, -.32]]), 0xc9ced8, [0, 0, 0], this.pin, { tinta: .008, papel: false });
      this.c1 = cana([0, -.42, .02], this.pin, .9); this.c1.rotation.z = Math.PI;
      this.fake = Array.from({ length: 7 }, (_, i) => { const a = Math.PI * (.1 + .8 * i / 6), g = cana([Math.cos(a) * .82, 1.3 + Math.sin(a) * .85, .7], null, 1.2, .075); g.rotation.z = a - Math.PI / 2; g.scale.setScalar(.001); return g; });
      this.x = PM.marca([0, 2.05, .9], false, 1.3); this.x.scale.setScalar(.001);
      this.lu = PM.lupa([.9, .7, .9], .45, { fondo: 0xffe6d8 }); this.rz = PM.raizPelo([0, .1, 0], { largo: 2.0, n: 2 }, this.lu.dentro); this.rz.scale.setScalar(.23); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('arrancas') - .35, ts = c.w('salen') - .1, tk = c.w('raíz') - .2;
      A.parpadea(this.p, t + 2.0, .4); respira(this.p, t); habla(this.p, t);
      // sube la mano con pinzas, jala y la baja con la cana
      const sube = ease(cl((t + .3 - ta) / .4)), baja = ease(cl((t - ta - .35) / .4)), kz = sube * (1 - .55 * baja);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 2.7 * kz + (t > ta && t < ta + .35 ? Math.sin(t * 40) * .06 : 0);
      this.pin.visible = sube > .05; const jalo = t > ta + .3; this.c0.visible = !jalo; this.c1.visible = jalo;
      this.p.boca(t > ta + .25 && t < ts ? 'apretada' : t > ts ? 'abierta' : 'feliz'); A.preocupa(this.p, t > ta + .25 && t < ts ? .8 : 0);
      // las siete de mentira: pop en abanico y luego se encogen al tacharlas
      const tx = c.w('siete') + .05; this.fake.forEach((g, i) => { const k = pop(t, ts + i * .05, .3) * (t > tx + .3 ? Math.max(.001, 1 - (t - tx - .3) / .3) : 1); g.scale.setScalar(1.2 * k); });
      this.x.scale.setScalar(1.3 * pop(t, tx, .3) * (t > tk + .2 ? Math.max(.001, 1 - (t - tk - .2) / .3) : 1));
      this.lu.scale.setScalar(pop(t, tk, .35)); this.rz.canas(.6); this.rz.update(t);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - (t > tk ? 1.2 * ease(cl((t - tk) / .3)) : 0) + Math.sin(t * 6) * .04;
      if (t > ta + .3) c.ev('pop', ta + .3, .5); if (t > ts) c.ev('whoosh', ts, .5); if (t > tx) c.ev('pop', tx, .7); if (t > tk) c.ev('ding', tk, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tk) etiqueta('UNA RAÍZ = UN PELO', [0, 2.6, .9], lt - tk, 40, '#ffffff', true);
      else if (t > ts) etiqueta('¿SIETE? ¡NO!', [0, 2.6, .9], lt - ts, 42, '#ff8a5b', true);
      rotulo('Otro mito:', 'no te salen siete', lt - .05, RY);
    }
  });

  // ---------- 7 · truco: arrancarla lastima la raíz (se pone roja y el pelo se cae); mejor tijeritas: snip ----------
  escena('truco', {
    setup() { this.s = sala(); this.p = prota([-.55, .02, .35], { boca: 'feliz', mira: 1 });
      this.c0 = cana([.26, .6, .05], this.p.head); this.c0.rotation.z = -.3;
      this.lu = PM.lupa([.72, 1.45, .7], .62, { fondo: 0xffe6d8 }); this.rz = PM.raizPelo([0, .12, 0], { largo: 2.0, n: 2 }, this.lu.dentro); this.rz.scale.setScalar(.33);
      this.rojo = PM.det(F.elipse(.36, .3), 0xff3b4a, [0, -1.12, .23], this.rz); this.rojo.scale.setScalar(.001);
      this.x = PM.marca([1.2, 2.0, .9], false, .7); this.x.scale.setScalar(.001);
      this.tj = PM.tijeras([.0, 1.62, .8], .75); this.tj.scale.x = -.75; this.tj.visible = false;
      this.cae = cana([0, 0, .75], null, .72); this.cae.visible = false;
      this.ok = PM.marca([.75, 2.05, .9], true, 1); this.ok.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), tl = c.w('lastima') - .1, td = c.w('dejar') - .1, tc = c.w('córtala') - .25, tt = c.w('tijera') - .1;
      A.parpadea(this.p, t + .7, .4); respira(this.p, t); habla(this.p, t);
      const duele = t > tl && t < tc; this.p.boca(duele ? 'apretada' : 'feliz'); A.preocupa(this.p, duele ? .9 : 0);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - (duele ? .3 : 0); this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + (t < tc ? .9 + Math.sin(t * 7) * .05 : .2);
      // lupa: la raíz se pone roja (lastimada) y el pelo se "cae" (deja de salir)
      const vis = t < tc + .2; this.lu.visible = vis; this.lu.scale.setScalar(pop(t, .05, .35) * (t > tc ? Math.max(.001, 1 - (t - tc) / .2) : 1));
      this.rojo.scale.setScalar(t > tl ? (1 + .12 * Math.sin(t * 12)) : .001); this.rz.update(t);
      this.rz.canas(.7); this.rz.pelo.scale.y = Math.max(.12, 1 - .88 * ease(cl((t - td) / .9)));
      this.x.scale.setScalar(.7 * pop(t, tl + .15, .3) * (t > tc ? .001 : 1));
      // tijeritas: aparecen junto a la cabeza y hacen snip
      const hx = -.55 + .26 * .72, hy = .02 + (1.66 + .7) * .72; this.tj.visible = t > tc; this.tj.position.set(hx + .62, hy + .02, .8);
      this.tj.scale.set(-.75 * pop(t, tc, .3), .75 * pop(t, tc, .3), .75); this.tj.corta(t > tt ? 1 : .5 + .5 * Math.sin(t * 14));
      const kc = cl((t - tt - .05) / .8); this.c0.visible = t < tt + .05; this.cae.visible = t > tt + .05 && kc < 1;
      this.cae.position.set(hx + .15 + kc * .3, hy + .2 - kc * 1.4, .75); this.cae.rotation.z = kc * 3;
      this.ok.scale.setScalar(pop(t, tt + .25, .35));
      if (t > tl) c.ev('pop', tl, .5); if (t > tc) c.ev('whoosh', tc, .5); if (t > tt) c.ev('pop', tt, .7); if (t > tt + .25) c.ev('ding', tt + .25, .6);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tc) etiqueta('¡MEJOR CÓRTALA!', [0, 2.6, .9], lt - tc, 42, '#7ff0c8', true);
      else if (t > tl) etiqueta('LASTIMA LA RAÍZ', [0, 2.6, .9], lt - tl, 40, '#ff8a5b', true);
      rotulo('Truco: no la arranques,', 'córtala con tijera', lt - .05, RY);
    }
  });

  // ---------- 8 · remate A o B: dos letreros con pop (TU FAMILIA / TU TRABAJO) y gesto de duda ----------
  escena('remate', {
    setup() { this.s = sala({ espejo: 1.05 }); this.p = prota([0, .02, .35], { boca: 'feliz', mira: 0 });
      this.ls = [[0, 'TU FAMILIA', 0xff6b5b, '#e0453a'], [1, 'TU TRABAJO', 0x3d9bff, '#2b5fd6']].map(([i, tx, b, ti]) => { const br = this.p.brazos[i];
        const h = group([0, -.5, .08], br); PM.pz(F.rect(.06, 1.2, .02), 0xc8a06a, [0, .6, -.01], h, { tinta: .008, papel: false });
        const L = PM.letrero([0, 1.45, .02], tx, { w: 1.2, h: .48, hilos: false, color: 0xffffff, borde: b, tinta: ti }, h); h.L = L; return h; }); },
    update(lt, c) {
      const t = tw(lt), tf = c.w('familia') - .2, tb = c.w('trabajo') - .2;
      A.parpadea(this.p, t + 1.1, .4); respira(this.p, t);
      const th = [tf, tb]; this.ls.forEach((h, i) => { const br = this.p.brazos[i], s = i ? 1 : -1, k = ease(cl((t - th[i] + .15) / .3));
        br.rotation.z = br.r0 + s * lerp(.15, 1.9, k) + Math.sin(t * 5 + i) * .04 * k; h.rotation.z = -br.rotation.z; h.visible = k > .02; h.L.scale.setScalar(pop(t, th[i], .35)); h.L.rotation.z = Math.sin(t * 3 + i * 2) * .05; });
      // duda: ladea la cabeza hacia uno y otro letrero
      const lado = t < tb ? -1 : 1; A.ladea(this.p, t > tf ? .35 + .1 * Math.sin(t * 3) : 0, lado); A.preocupa(this.p, t > tf ? .6 : 0);
      this.p.boca(t > tb + .4 ? 'apretada' : 'abierta'); if (t < tf) habla(this.p, t);
      if (t > tf) c.ev('pop', tf, .6); if (t > tb) c.ev('pop', tb, .6);
      cam([0, 1.2, lerp(10.4, 10.0, ease(cl(lt / 3.6)))], [0, 1.15, 0], 34);
      rotulo('¿Quién te saca', 'más canas?', lt - .05, RY);
    }
  });
  P.cierre();
}
