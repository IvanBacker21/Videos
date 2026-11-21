// Short 20-nov 21:30 (PRUEBA LARGO 40 s) · CARTULINA CHIBI: vibración fantasma. Sientes vibrar el celular y no hay nada:
// el cerebro, esperando mensajes, interpreta roces y brinquitos de músculo como vibración; prefiere una falsa alarma a perderse
// un mensaje. ~89 % de universitarios (Drouin, 2012) y 68 % del personal de un hospital (Rothberg, BMJ 2010); cambiar el celular
// de bolsillo o apagar la vibración se lo quitó a muchos.
// Fuentes: BMJ (Phantom vibration syndrome among medical staff, 2010), NPR (Phantom phone vibrations so common…, 2013).
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-20-2130-vibracion-fantasma.json OUT ../ejemplos/2026-11-20-2130-vibracion-fantasma.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw, tubo } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, PARED = 0xf6d7b8, ROJO = 0xff4d5e, AMARILLO = 0xffc83d, MORADO = 0x7b5cff, VERDE = 0x2ec4a6;
  const set = (ven = [-1.0, 2.05], cuadro = true) => { ambiente({ top: PARED, bottom: PARED, fog: PARED, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.cuarto({ ventana: ven, abierta: 1, cuadro: cuadro ? [1.35, 1.7, -2.6] : [9, 1.7, -2.6] }); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  // bolsillo del pantalón (lado derecho de la pantalla) de un chibi en x0 con escala e
  const bolsa = (x0, e) => [x0 + .2 * e, .62 * e + .02, .55];
  // celular en la mano derecha: el brazo sube con k (0→1) y el cel queda derecho
  const conCel = (p, o = {}) => { const b = p.brazos[1]; const ce = PM.celular([0, -.6, .1], { h: .5, pct: o.pct ?? 80, cara: o.cara ?? 'ninguna' }, b); ce.scale.setScalar(.001); return ce; };
  const sube = (p, ce, k, t, a = 2.0) => { const b = p.brazos[1]; b.rotation.z = lerp(b.r0, a, k) + Math.sin(t * 3) * .04 * k; ce.rotation.z = -b.rotation.z; ce.scale.setScalar(Math.max(.001, k)); };
  // sobrecito de mensaje de cartulina
  const sobre = (pos, s = 1, parent = null) => { const g = group(pos, parent); g.scale.setScalar(s); PM.pz(F.rect(.34, .24, .03), 0xffffff, [0, 0, 0], g, { tinta: .012, papel: .04 });
    PM.det(tubo([[-.15, .1], [0, -.02], [.15, .1]], .018, .018), 0x3d6bff, [0, 0, .016], g); return g; };
  // sirena roja de cartulina con destellos
  const sirena = (pos, parent = null) => { const g = group(pos, parent); PM.pz(F.rect(.32, .08, .03), 0x34313d, [0, -.04, 0], g, { tinta: .012, papel: .04 });
    const fo = PM.pz(F.elipse(.13, .15), ROJO, [0, .12, 0], g, { tinta: .012, papel: .04 }); PM.det(F.elipse(.04, .05), 0xffd0d0, [-.04, .17, .016], g);
    g.rayos = [-1, 0, 1].map(i => { const r = group([0, .12, -.01], g); r.rotation.z = i * .7; PM.det(F.rect(.05, .14, .01), AMARILLO, [0, .3, 0], r); return r; });
    g.update = (t, on) => { const k = on * (Math.sin(t * 14) > 0 ? 1 : 0); g.rayos.forEach(r => { r.visible = k > 0; }); fo.scale.setScalar(1 + .12 * k); }; return g; };

  // ---------- 1 · gancho: le vibra el bolsillo, saca el celular… y nada ----------
  escena('gancho', {
    setup() { set();
      this.p = PM.chibi([-.2, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .95 });
      this.z = PM.zumbido(bolsa(-.2, .95), { r: .22, alto: .26 });
      this.ce = conCel(this.p);
      this.l0 = PM.letrero([.78, 2.1, .55], '0 MENSAJES', { w: .95, h: .3, hilos: false, borde: ROJO });
      this.pr = PM.pregunta([-.95, 2.0, .5], .5); },
    update(lt, c) {
      const t = tw(lt), tvi = c.w('vibrar') - .1, tsa = c.w('sacas') - .15, tna = c.w('nada') - .1;
      A.parpadea(this.p, t + 1.1, .3); respira(this.p, t);
      this.z.update(t, t < tsa ? 1 : 0);
      if (t < tsa) this.p.position.x = -.2 + Math.sin(t * 45) * .012; else this.p.position.x = -.2;
      const kc = eout(cl((t - tsa) / .35)); sube(this.p, this.ce, kc, t);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 2) * .04;
      A.ladea(this.p, t > tsa ? .35 : 0, 1);
      A.preocupa(this.p, t > tna ? .7 : .15); this.p.boca(t > tna ? 'apretada' : 'abierta');
      this.l0.scale.setScalar(pop(t, tna, .35)); this.l0.columpia(t, .03);
      this.pr.scale.setScalar(pop(t, tna + .1, .35) * .5); this.pr.rotation.z = Math.sin(t * 3) * .1;
      c.ev('whoosh', .05, .4); if (t > tvi) c.ev('pop', tvi, .3); if (t > tsa) c.ev('whoosh', tsa, .4); if (t > tna) c.ev('ding', tna, .5);
      cam([0, 1.2, lerp(10.9, 10.3, ease(lt / 3.4))], [0, 1.15, 0], 34);
      if (t > tvi && t < tsa) etiqueta('¡BZZZ!', [.55, .95, .9], lt - tvi, 54, '#ffd640', true);
      if (t > tna) etiqueta('¿NADA?', [-.2, -.3, .9], lt - tna, 58, '#ffd640', true);
      rotulo('¿Te vibró el celular?', '…y no había nada', lt - .05, RY);
    }
  });

  // ---------- 2 · nombre: letrero VIBRACIÓN FANTASMA + 9 de cada 10 muñequitos se iluminan ----------
  escena('nombre', {
    setup() { set([-1.6, 2.05], false);
      this.p = PM.chibi([-.85, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .78 });
      this.ce = conCel(this.p);
      this.lt = PM.letrero([0, 2.3, .55], 'VIBRACIÓN FANTASMA', { w: 2.3, h: .36, hilos: false, borde: MORADO });
      this.gente = PM.personitas([.6, 1.0, .5], 10, { porFila: 5, sep: .3, s: 1.1, color: AMARILLO }); },
    update(lt, c) {
      const t = tw(lt), tlo = c.w('loco') - .1, tvi = c.w('vibración') - .1, tnu = c.w('nueve') - .1, tes = c.w('estudiantes') - .1;
      A.parpadea(this.p, t + 2.2, .9); respira(this.p, t);
      sube(this.p, this.ce, 1, t);
      // "no estás loco": niega con la cabeza al principio
      this.p.head.rotation.z = this.p.head.r0 + (t < tvi ? Math.sin(t * 9) * .12 : Math.sin(t * 2) * .03);
      this.p.boca(t > tvi ? 'feliz' : 'abierta');
      this.lt.scale.setScalar(pop(t, tvi, .4));
      this.gente.scale.setScalar(pop(t, tnu - .4, .35));
      const kn = t < tnu ? 0 : Math.min(9, Math.floor((t - tnu) / .09) + 1); this.gente.marca(kn, t);
      c.ev('whoosh', .05, .4); if (t > tlo) c.ev('pop', tlo, .3); if (t > tvi) c.ev('pop', tvi, .4); if (t > tnu) c.ev('ding', tnu + .8, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tnu) etiqueta('¡CASI 9 DE CADA 10!', [.4, -.3, .9], lt - tnu, 48, '#ffd640', true);
      rotulo('Se llama', 'vibración fantasma', lt - .1, RY);
    }
  });

  // ---------- 3 · alarma: cerebro con sirena rodeado de sobrecitos de mensaje ----------
  escena('alarma', {
    setup() { set([-1.6, 2.05], false);
      this.p = PM.chibi([-.9, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .76 });
      this.cb = PM.cerebro([.38, 1.35, .5], .5, { expr: 'feliz' });
      this.si = sirena([.38, 1.85, .45]);
      this.sb = [[-.35, 2.15], [1.0, 2.0], [1.05, .85], [-.25, .7]].map(([x, y], i) => sobre([x + .38, y, .7], .8));
      this.lt = PM.letrero([.38, .3, .6], 'MODO ALARMA', { w: 1.3, h: .32, hilos: false, borde: ROJO }); },
    update(lt, c) {
      const t = tw(lt), tce = c.w('cerebro') - .1, tme = c.w('mensajes') - .15, tal = c.w('alarma') - .1;
      A.parpadea(this.p, t + .7, 2.0); A.parpadea(this.cb, t + 1.6, .4); respira(this.p, t); habla(this.p, t);
      this.cb.scale.setScalar(pop(t, 0, .4)); this.cb.position.y = 1.35 + Math.sin(t * 2.4) * .03;
      this.cb.cara(t > tal ? 'abierta' : 'feliz'); A.preocupa(this.cb, t > tal ? .8 : 0);
      this.si.scale.setScalar(pop(t, tal - .3, .35)); this.si.update(t, t > tal ? 1 : 0);
      this.sb.forEach((s, i) => { s.scale.setScalar(pop(t, tme + i * .12, .3) * .8); s.position.y += Math.sin(t * 3 + i) * .002; s.rotation.z = Math.sin(t * 2.5 + i) * .15; });
      this.lt.scale.setScalar(pop(t, tal, .35));
      this.p.boca(t > tal ? 'apretada' : 'abierta'); A.preocupa(this.p, t > tal ? .5 : 0);
      c.ev('whoosh', .05, .4); if (t > tce) c.ev('pop', tce, .3); for (let i = 0; i < 4; i++) if (t > tme + i * .12) c.ev('pop', tme + i * .12, .2); if (t > tal) c.ev('impact', tal, .5);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 4.2))], [0, 1.15, 0], 34);
      rotulo('Tu cerebro vive', 'esperando mensajes', lt - .1, RY);
    }
  });

  // ---------- 4 · roce: camina, el pantalón roza y un musculito brinca → "¡te escribieron!" ----------
  escena('roce', {
    setup() { set(undefined, false);
      this.p = PM.chibi([-.35, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .9 });
      this.z = PM.zumbido(bolsa(-.35, .9), { r: .2, alto: .24 });
      this.nube = group([.75, 1.95, .55]); PM.pz(F.nube(.8), 0xffffff, [0, 0, 0], this.nube, { tinta: .016, papel: .05 });
      this.mini = PM.cerebro([0, 0, 0], .19, { expr: 'feliz' }); this.nube.add(this.mini); this.mini.position.set(-.08, .1, .04);
      this.sb = sobre([.32, .14, .1], .5, this.nube); },
    update(lt, c) {
      const t = tw(lt), tro = c.w('roce') - .1, tbr = c.w('brinca') - .1, ttr = c.w('traduce') - .1, tes = c.w('¡te') - .1;
      A.parpadea(this.p, t + 2.9, 1.2); A.parpadea(this.mini, t + .3, .2);
      const anda = t < tes ? 1 : 0; A.anda(this.p, t, anda * .7, .02); if (!anda) respira(this.p, t);
      const zz = (t > tro && t < tro + .5) || (t > tbr && t < tbr + .5) || t > tes ? 1 : 0; this.z.update(t, zz);
      this.nube.scale.setScalar(pop(t, ttr, .35)); this.mini.cara(t > tes ? 'abierta' : 'feliz');
      this.sb.scale.setScalar(t > tes ? pop(t, tes, .3) * .5 : .001);
      if (t > tes) { A.ladea(this.p, .45, 1); this.p.boca('abierta'); A.preocupa(this.p, .3); } else { A.ladea(this.p, 0, 1); this.p.boca('feliz'); A.preocupa(this.p, 0); }
      c.ev('whoosh', .05, .4); if (t > tro) c.ev('pop', tro, .3); if (t > tbr) c.ev('pop', tbr, .3); if (t > ttr) c.ev('whoosh', ttr, .4); if (t > tes) c.ev('ding', tes, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tro && t < tbr) etiqueta('ROCE', [.4, .55, .9], lt - tro, 46, '#ffffff', true);
      if (t > tbr && t < tes) etiqueta('¡BRINCO!', [.4, .55, .9], lt - tbr, 46, '#ffffff', true);
      if (t > tes) etiqueta('¡TE ESCRIBIERON!', [-.1, -.3, .9], lt - tes, 50, '#ffd640', true);
      rotulo('Un roce o un brinquito…', '¡y crees que vibró!', lt - .1, RY);
    }
  });

  // ---------- 5 · sorpresa: el cerebro elige "falsa alarma" antes que "perder mensaje" ----------
  escena('sorpresa', {
    setup() { set([-1.6, 2.05], false);
      this.cb = PM.cerebro([0, 1.95, .5], .42, { expr: 'feliz' });
      this.a = PM.letrero([-.7, 1.0, .55], 'FALSA ALARMA', { w: 1.12, h: .32, hilos: false, borde: VERDE });
      this.b = PM.letrero([.7, 1.0, .55], 'PERDER MENSAJE', { w: 1.12, h: .32, hilos: false, borde: ROJO });
      this.ok = PM.marca([-.7, .45, .6], true, .7); this.no = PM.marca([.7, .45, .6], false, .7);
      this.z = PM.zumbido([-.7, 1.0, .65], { r: .66, alto: .22 });
      this.sb = sobre([.7, .45, .5], .7); },
    update(lt, c) {
      const t = tw(lt), tso = c.w('sorprendente') - .1, tpr = c.w('propósito') - .1, tpf = c.w('Prefiere') - .1, tfa = c.w('falsa') - .1, tpe = c.w('perderse') - .1;
      A.parpadea(this.cb, t + .5, 1.1);
      this.cb.scale.setScalar(pop(t, 0, .4)); this.cb.position.y = 1.95 + Math.sin(t * 2.4) * .03;
      this.cb.cara(t > tpr && t < tpf ? 'abierta' : 'feliz');
      // se inclina hacia "falsa alarma"
      const ki = ease(cl((t - tpf) / .4)); this.cb.rotation.z = ki * .25 + Math.sin(t * 2) * .03; this.cb.position.x = -ki * .2;
      this.a.scale.setScalar(pop(t, tfa, .35)); this.b.scale.setScalar(pop(t, tpe, .35));
      this.ok.scale.setScalar(t > tfa + .3 ? pop(t, tfa + .3, .3) * .7 : .001);
      this.sb.scale.setScalar(t > tpe && t < tpe + .5 ? pop(t, tpe, .3) * .7 : .001); this.sb.position.y = .45 - ease(cl((t - tpe) / .5)) * .3;
      this.no.scale.setScalar(t > tpe + .5 ? pop(t, tpe + .5, .3) * .7 : .001);
      this.z.update(t, t > tfa + .3 ? 1 : 0);
      c.ev('whoosh', .05, .4); if (t > tpr) c.ev('ding', tpr, .5); if (t > tfa) c.ev('pop', tfa, .3); if (t > tfa + .3) c.ev('ding', tfa + .3, .4); if (t > tpe) c.ev('pop', tpe, .3); if (t > tpe + .5) c.ev('impact', tpe + .5, .4);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tpr && t < tfa) etiqueta('¡A PROPÓSITO!', [0, .6, .9], lt - tpr, 54, '#ffd640', true);
      rotulo('Mejor una falsa alarma', 'que perder un mensaje', lt - .1, RY);
    }
  });

  // ---------- 6 · médicos: en un hospital, 7 de cada 10 médicos también lo sentían ----------
  escena('medicos', {
    setup() { set([-1.6, 2.05], false);
      this.d = PM.chibi([-.82, .02, .3], { ropa: 0xf4f6fb, pantalon: VERDE, tenis: 0xffffff, colPelo: 0x2a1a12, lentes: true, boca: 'abierta', mira: 1, escala: .8 });
      // estetoscopio
      PM.det(tubo([[-.14, 1.32], [-.1, 1.0], [0, .9], [.1, 1.0], [.14, 1.32]], .025, .025), 0x34313d, [0, 0, .06], this.d); PM.pz(F.circ(.05), 0x9aa3b5, [0, .88, .07], this.d, { tinta: .01, papel: false });
      this.z = PM.zumbido(bolsa(-.82, .8), { r: .18, alto: .22 });
      this.h = group([.5, 2.25, .5]); PM.pz(F.rect(1.3, .42, .05), 0xffffff, [0, 0, 0], this.h, { tinta: .016, papel: .06 });
      PM.det(F.rect(.08, .26, .01), ROJO, [-.45, 0, .03], this.h); PM.det(F.rect(.26, .08, .01), ROJO, [-.45, 0, .03], this.h);
      this.hl = PM.letrero([.15, 0, .03], 'HOSPITAL', { w: .85, h: .3, hilos: false, borde: 0xffffff }, this.h);
      this.gente = PM.personitas([.55, 1.0, .5], 10, { porFila: 5, sep: .3, s: 1.1, color: 0x8fd3ff }); },
    update(lt, c) {
      const t = tw(lt), tch = c.w('chavos') - .1, tho = c.w('hospital') - .1, tsi = c.w('siete') - .1, tme = c.w('médicos') - .1, tpa = c.w('pasaba') - .1;
      A.parpadea(this.d, t + 1.4, .8); respira(this.d, t);
      this.h.scale.setScalar(pop(t, tho, .35));
      this.gente.scale.setScalar(pop(t, tsi - .4, .35));
      const kn = t < tsi ? 0 : Math.min(7, Math.floor((t - tsi) / .09) + 1); this.gente.marca(kn, t);
      const zz = t > tme ? 1 : 0; this.z.update(t, zz);
      if (zz) { A.ladea(this.d, .4, 1); this.d.boca('apretada'); A.preocupa(this.d, .5); this.d.position.x = -.82 + Math.sin(t * 45) * .01; }
      else { habla(this.d, t); this.d.boca('abierta'); A.preocupa(this.d, 0); }
      c.ev('whoosh', .05, .4); if (t > tho) c.ev('pop', tho, .4); if (t > tsi) c.ev('ding', tsi + .6, .5); if (t > tme) c.ev('pop', tme, .3);
      cam([0, 1.2, lerp(10.4, 10.1, ease(lt / 5.2))], [0, 1.15, 0], 34);
      if (t > tsi) etiqueta('¡7 DE CADA 10 MÉDICOS!', [0, -.3, .9], lt - tsi, 42, '#ffd640', true);
      rotulo('Hasta a los médicos', '¡también les pasaba!', lt - .1, RY);
    }
  });

  // ---------- 7 · truco: cambia de bolsillo o apaga la vibración → se quita ----------
  escena('truco', {
    setup() { set(undefined, false);
      this.p = PM.chibi([-.78, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .85 });
      this.ce = conCel(this.p, { cara: 'feliz' });
      this.z = PM.zumbido(bolsa(-.78, .85), { r: .2, alto: .24 });
      this.a = PM.letrero([.4, 1.85, .55], 'CAMBIA DE BOLSILLO', { w: 1.5, h: .32, hilos: false, borde: AMARILLO });
      this.b = PM.letrero([.4, 1.2, .55], 'VIBRACIÓN: OFF', { w: 1.5, h: .32, hilos: false, borde: MORADO });
      this.oka = PM.marca([1.25, 1.85, .7], true, .42); this.okb = PM.marca([1.25, 1.2, .7], true, .42); },
    update(lt, c) {
      const t = tw(lt), tca = c.w('cambia') - .1, tbo = c.w('bolsillo') - .1, tap = c.w('apaga') - .1, tvi = c.w('vibración') - .1, tqu = c.w('quita') - .1;
      A.parpadea(this.p, t + 3.0, .6); respira(this.p, t);
      // saca el cel del bolsillo al decir "apaga" y se queda sosteniéndolo
      const kc = eout(cl((t - tap) / .35)); sube(this.p, this.ce, kc, t, 1.15);
      this.z.update(t, t < tca ? 1 : 0);
      this.a.scale.setScalar(pop(t, tca, .35)); this.b.scale.setScalar(pop(t, tap, .35));
      this.oka.scale.setScalar(t > tbo ? pop(t, tbo, .3) * .42 : .001); this.okb.scale.setScalar(t > tvi + .2 ? pop(t, tvi + .2, .3) * .42 : .001);
      this.p.boca(t > tqu ? 'feliz' : 'abierta'); habla(this.p, t, 1);
      c.ev('whoosh', .05, .4); if (t > tca) c.ev('pop', tca, .3); if (t > tbo) c.ev('ding', tbo, .4); if (t > tap) c.ev('pop', tap, .3); if (t > tvi + .2) c.ev('ding', tvi + .2, .4); if (t > tqu) c.ev('ding', tqu, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tqu) etiqueta('¡ADIÓS FANTASMA!', [0, -.3, .9], lt - tqu, 50, '#ffd640', true);
      rotulo('Cambia de bolsillo', 'o apaga la vibración', lt - .1, RY);
    }
  });

  // ---------- 8 · remate: la amiga revisa el celular a cada rato; el protagonista manda el avioncito ----------
  escena('remate', {
    setup() { set([-1.6, 2.05]);
      this.h = PM.chibi([-.62, .02, .38], { ropa: 0xff6b5b, pantalon: 0x2b2f4a, tenis: AMARILLO, pelo: 'cola', colPelo: 0x2a1a12, aretes: true, boca: 'abierta', mira: 1, escala: .85 });
      this.ce = conCel(this.h, { cara: 'feliz' });
      this.p = PM.chibi([.72, .02, .3], { logo: true, boca: 'feliz', mira: -1, escala: .85 });
      this.av = PM.avion([.72, 1.3, .9], .45); },
    update(lt, c) {
      const t = tw(lt), tma = c.w('Mándaselo') - .1, tsa = c.w('saca') - .1;
      A.parpadea(this.h, t + .6, .4); A.parpadea(this.p, t + 2.0, 1.6); respira(this.h, t, .02, 1); respira(this.p, t);
      // la amiga saca y guarda el cel una y otra vez
      const ks = .5 + .5 * Math.sin(t * 4.5 - 1.2); sube(this.h, this.ce, ease(cl(ks * 1.3)), t);
      this.h.boca(ks > .6 ? 'abierta' : 'apretada');
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.3, eout(cl((t - tma) / .3))) - lerp(0, 1.2, ease(cl((t - tma - .4) / .3)));
      const kv = cl((t - tma - .45) / 1.4); this.av.visible = t > tma + .45 && kv < 1; this.av.position.set(lerp(.7, 1.75, ease(kv)), 1.35 + Math.sin(kv * Math.PI) * .9 + kv * .4, .9); this.av.rotation.z = .5 - kv * .3;
      c.ev('whoosh', .05, .4); if (t > tma + .45) c.ev('whoosh', tma + .45, .5); if (t > tsa) c.ev('ding', tsa, .5);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.4))], [0, 1.15, 0], 34);
      if (t > tsa) etiqueta('¡MÁNDASELO!', [0, 2.5, .9], lt - tsa, 50, '#ffd640', true);
      rotulo('Mándaselo a quien vive', 'pegado al celular', lt - .05, RY);
    }
  });
  P.cierre();
}
