// Short 13-nov 18:00 · CARTULINA CHIBI: ¿Por qué con el frío siempre se te parten los labios?
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-13-1800-labios-frio.json OUT ../ejemplos/2026-11-13-1800-labios-frio.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xbfe3f5, AGUA = 0x6cc4ff, GRASA = 0xffd86b;
  const set = () => { ambiente({ top: CIELO, bottom: CIELO, fog: CIELO, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, fase = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + fase) * .05; };
  const gota = (color, r = .1, padre = null) => PM.pz(F.gota(r), color, [0, 0, .05], padre, { tinta: .008, papel: false });
  // rayitas de viento frío que cruzan de derecha a izquierda
  const viento = (n, y0, y1) => { const vs = []; for (let i = 0; i < n; i++) { const v = PM.det(P.tubo([[0, 0], [.25, .05], [.5, 0], [.7, -.04]], .025, .015), 0xffffff, [0, 0, .8], null); v.i = i; v.y = lerp(y0, y1, (i + .5) / n); vs.push(v); }
    return { update(t, on = 1) { vs.forEach(v => { const k = (t * .7 + v.i * .37) % 1; v.visible = on > 0; v.position.set(lerp(1.9, -2.4, k), v.y + Math.sin(t * 3 + v.i) * .05, .8); }); } }; };
  const corazones = () => [0, 1, 2].map(i => { const c = PM.pz(F.corazon(.4), 0xff5d8f, [0, 0, .6], null, { tinta: .015, papel: .04 }); c.visible = false; c.i = i; return c; });
  const animaCorazones = (cs, t, x0, y0, sep = .3, sube = .4) => cs.forEach(c => { const k = ((t * .9 + c.i / 3) % 1); c.visible = true; c.position.set(x0 + (c.i - 1) * sep + Math.sin(k * 6 + c.i * 2) * .06, y0 + k * sube, .6); c.scale.setScalar(Math.sin(k * Math.PI) * .7 + .05); });

  // ---------- 1 · gancho: hace frío y los labios se parten ----------
  escena('gancho', {
    setup() { set(); this.cp = PM.copos({ n: 16, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.p = PM.chibi([-.62, .02, .3], { logo: true, boca: 'apretada', mira: 1 }); this.bu = PM.bufanda(this.p, 0xff6b5b);
      this.lu = PM.lupa([.72, 1.55, .4], .62); this.lab = PM.labios([0, .02, 0], .95, this.lu.dentro, { seca: .2 }); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('parten') - .15; this.cp.update(t);
      A.parpadea(this.p, t, .6); A.preocupa(this.p, 1); A.tiembla(this.p, t, 1, -.62); this.bu.mece(t);
      this.p.boca(t > tp + .2 ? 'abierta' : 'apretada'); this.p.head.rotation.z = this.p.head.r0 - .06 + Math.sin(t * 5) * .04;
      this.p.brazos[0].rotation.z = .35 + Math.sin(t * 40) * .03; this.p.brazos[1].rotation.z = -.35 - Math.sin(t * 40) * .03;   // se abraza de frío
      this.lu.scale.setScalar(pop(t, -.4, .35)); this.lu.rotation.z = Math.sin(t * 1.8) * .03;
      this.lab.seca(lerp(.2, 1, eout(cl((t - tp) / .5)))); this.lab.position.x = t > tp && t < tp + .4 ? Math.sin(t * 60) * .02 : 0;
      c.ev('pop', .1, .5); if (t > tp) c.ev('pop', tp, .6);
      cam([.05, 1.2, lerp(10.9, 10.4, ease(lt / 3.2))], [.05, 1.15, 0], 34);
      etiqueta('BRRR…', [-.62, -.2, .7], lt - .2, 56, '#ffffff', true);
      if (t > tp) etiqueta('¡AUCH!', [.72, .6, .7], lt - tp, 56, '#ffd640', true);
      rotulo('¿Por qué con frío', 'se te parten los labios?', lt - .1, RY);
    }
  });

  // ---------- 2 · la piel tiene grasita; los labios casi no ----------
  escena('grasa', {
    setup() { set();
      this.p = PM.chibi([-.88, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .85 });
      this.l1 = PM.lupa([.62, 1.95, .4], .5); const d1 = this.l1.dentro;
      for (const [x, y] of [[-.25, .2], [.15, .28], [.3, -.1], [-.1, -.25], [.05, .02], [-.3, -.05]]) PM.det(F.circ(.025), 0xd9967a, [x, y, 0], d1);   // poros
      this.gr = [[-.18, .1], [.2, .14], [.05, -.2], [-.22, -.18], [.26, -.12]].map(([x, y], i) => { const g = gota(GRASA, .07, d1); g.x0 = x; g.y0 = y; g.i = i; return g; });
      this.l2 = PM.lupa([.62, .62, .4], .5, { mango: 0xff6b5b }); this.lab = PM.labios([0, .03, 0], .75, this.l2.dentro, { seca: .35 }); },
    update(lt, c) {
      const t = tw(lt), tg = c.w('grasita') - .2, tl = c.w('labios') - .2, tn = c.w('tienen') - .2;
      A.parpadea(this.p, t, 1.4); habla(this.p, t); A.preocupa(this.p, t > tn ? .8 : 0); this.p.boca(t > tn ? 'apretada' : 'abierta');
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.1, eout(cl((t - .1) / .4))) + Math.sin(t * 4) * .05;   // señala las lupas
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      this.l1.scale.setScalar(pop(t, -.2, .35)); this.l1.rotation.z = Math.sin(t * 1.6) * .03;
      this.gr.forEach(g => { g.scale.setScalar(pop(t, tg + g.i * .08, .3)); g.position.set(g.x0 + Math.sin(t * 2 + g.i) * .02, g.y0 + Math.sin(t * 2.4 + g.i * 2) * .03, .05); });
      this.l2.scale.setScalar(pop(t, tl - .3, .35)); this.l2.rotation.z = -Math.sin(t * 1.6) * .03;
      this.lab.seca(lerp(.35, .7, cl((t - tn) / .6)));
      c.ev('pop', -.1, .4); if (t > tg) c.ev('pop', tg, .4); if (t > tl - .3) c.ev('pop', tl - .3, .5); if (t > tn) c.ev('ding', tn, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tg) etiqueta('PIEL: GRASITA ✓', [.42, 1.35, .7], lt - tg, 40, '#ffffff', true);
      if (t > tn) etiqueta('LABIOS: CASI NADA', [.3, .0, .7], lt - tn, 40, '#ffd640', true);
      rotulo('Tus labios casi no tienen', 'grasita que los proteja', lt - .1, RY);
    }
  });

  // ---------- 3 · el aire frío es seco y les roba el agua ----------
  escena('aire', {
    setup() { set(); this.cp = PM.copos({ n: 10, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 }); this.vi = viento(6, .3, 2.4);
      this.p = PM.chibi([-.85, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .85 }); this.bu = PM.bufanda(this.p, 0xff6b5b);
      this.lu = PM.lupa([.55, 1.5, .4], .66); this.lab = PM.labios([0, .02, 0], .95, this.lu.dentro, { seca: .3 });
      this.ag = [0, 1, 2, 3, 4].map(i => { const g = gota(AGUA, .08, this.lu.dentro); g.i = i; g.x0 = [-.3, -.1, .15, .3, 0][i]; g.y0 = [.1, -.12, .12, -.08, .04][i]; return g; }); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('aire') - .2, ts = c.w('seco') - .2, tr = c.w('roba') - .2; this.cp.update(t); this.vi.update(t, t > ta ? 1 : 0);
      A.parpadea(this.p, t, .9); A.preocupa(this.p, t > tr ? 1 : .3); A.tiembla(this.p, t, .7, -.85); this.bu.mece(t); this.p.boca(t > tr ? 'apretada' : 'abierta');
      this.p.brazos[0].rotation.z = .3; this.p.brazos[1].rotation.z = -.3 + Math.sin(t * 40) * .03;
      this.lu.scale.setScalar(pop(t, -.2, .35)); this.lu.rotation.z = Math.sin(t * 1.8) * .03;
      // gotitas de agua: primero sobre los labios; con "roba" el viento se las lleva a la izquierda
      this.ag.forEach(g => { const u = cl((t - tr - g.i * .15) / .9); g.visible = u < 1; const e = ease(u);
        g.position.set(g.x0 - e * .9, g.y0 + Math.sin(u * Math.PI) * .25, .05); g.scale.setScalar((1 - .6 * e) * (1 + Math.sin(t * 5 + g.i) * .05)); g.rotation.z = e * 1.5; });
      this.lab.seca(lerp(.3, 1, eout(cl((t - tr) / 1.4))));
      if (t > ta) c.ev('whoosh', ta, .6); if (t > tr) c.ev('whoosh', tr, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > ts) etiqueta('AIRE SECO', [-.85, 2.35, .7], lt - ts, 46, '#ffffff', true);
      if (t > tr) etiqueta('¡SE LLEVA EL AGUA!', [.4, .55, .7], lt - tr, 44, '#ffd640', true);
      rotulo('El aire frío es seco', 'y les roba el agua', lt - .1, RY);
    }
  });

  // ---------- 4 · el error: chuparte los labios ----------
  escena('error', {
    setup() { set(); this.cp = PM.copos({ n: 10, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.p = PM.chibi([-.85, .02, .3], { logo: true, boca: 'lengua', mira: 1, escala: .85 });
      this.lu = PM.lupa([.55, 1.5, .4], .66); this.lab = PM.labios([0, .02, 0], .95, this.lu.dentro, { seca: .8 });
      this.sa = [0, 1, 2, 3].map(i => { const g = gota(0xbfe8ff, .075, this.lu.dentro); g.i = i; g.x0 = [-.28, -.05, .2, .32][i]; g.y0 = [.05, -.14, .1, -.06][i]; return g; });
      this.va = [0, 1, 2].map(i => { const v = PM.det(P.tubo([[0, 0], [.04, .08], [-.03, .16], [.02, .24]], .022, .022), 0xffffff, [0, 0, .06], this.lu.dentro); v.i = i; return v; });
      this.x = PM.pz(F.poly([[-.2, .26], [0, .06], [.2, .26], [.26, .2], [.06, 0], [.26, -.2], [.2, -.26], [0, -.06], [-.2, -.26], [-.26, -.2], [-.06, 0], [-.26, .2]]), 0xe0414f, [1.05, 2.2, .6], null, { tinta: .016, papel: .05 }); },
    update(lt, c) {
      const t = tw(lt), te = c.w('error') - .2, tc = c.w('chuparte') - .1, tsa = c.w('saliva') - .2, tse = c.w('seca') - .2, tm = c.w('agua') - .2; this.cp.update(t);
      A.parpadea(this.p, t, 2.1); habla(this.p, t, 1);
      const lame = t > tc && t < tsa; this.p.boca(lame ? 'lengua' : t > tse ? 'apretada' : 'abierta'); A.preocupa(this.p, t > tse ? 1 : 0);
      if (lame) this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 9) * .08;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 - Math.sin(t * 3) * .03;
      this.lu.scale.setScalar(pop(t, -.2, .35)); this.lu.rotation.z = Math.sin(t * 1.8) * .03;
      // la saliva moja (brillo) y luego se evapora llevándose más agua
      const moja = t > tc + .3 && t < tse + .2; this.lab.brillo.visible = moja;
      this.sa.forEach(g => { const u = cl((t - tse - g.i * .12) / .8); g.visible = t > tc + .3 && u < 1; g.position.set(g.x0, g.y0 + ease(u) * .35, .05); g.scale.setScalar((1 - u) * pop(t, tc + .3 + g.i * .06, .25)); });
      this.va.forEach(v => { const k = ((t - tse) * .8 + v.i / 3) % 1; v.visible = t > tse; v.position.set(-.25 + v.i * .25, .15 + k * .35, .06); v.scale.setScalar(Math.sin(k * Math.PI) * .9 + .05); });
      this.lab.seca(t < tse ? (moja ? .55 : .8) : lerp(.55, 1, eout(cl((t - tse) / 1.2))));
      this.x.scale.setScalar(pop(t, te, .35) * .9); this.x.rotation.z = Math.sin(t * 3) * .08;
      c.ev('pop', te, .5); if (t > tc) c.ev('pop', tc, .4); if (t > tse) c.ev('whoosh', tse, .4); if (t > tm) c.ev('ding', tm, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      etiqueta('¡ERROR!', [-.85, 2.35, .7], lt - te, 56, '#ffd640', true);
      if (t > tse) etiqueta('SE SECA MÁS', [.45, .55, .7], lt - tse, 46, '#ffffff', true);
      if (t < tsa) rotulo('El error', 'chuparte los labios', lt - .1, RY); else rotulo('La saliva se seca', 'y se lleva más agua', lt - tsa, RY);
    }
  });

  // ---------- 5 · truco + remate: bálsamo y no chuparlos; mándaselo ----------
  escena('remate', {
    setup() { set(); this.cp = PM.copos({ n: 12, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.p = PM.chibi([-.55, .02, .3], { logo: true, boca: 'abierta', mira: 1 }); this.bu = PM.bufanda(this.p, 0xff6b5b);
      this.b = PM.balsamo([0, -.68, .12], this.p.brazos[1]);
      this.lu = PM.lupa([.72, 1.85, .4], .55); this.lab = PM.labios([0, .02, 0], .82, this.lu.dentro, { seca: 1 }); this.bl = PM.balsamo([.5, .05, .1], this.lu.dentro); this.bl.rotation.z = Math.PI / 2; this.bl.tapa.visible = false;
      this.a = PM.chibi([.85, .02, .3], { pelo: 'cola', ropa: 0xffc83d, pantalon: 0x7b5cff, colPelo: 0x2a1a12, boca: 'lengua', mira: -1, escala: .88 });
      this.cs = corazones(); },
    update(lt, c) {
      const t = tw(lt), tb = c.w('bálsamo') - .2, tch = c.w('chupes') - .2, tm = c.w('mándaselo') - .2; this.cp.update(t);
      A.parpadea(this.p, t, .2); habla(this.p, t); this.bu.mece(t); this.p.boca('abierta');
      const kb = eout(cl((t - tb + .3) / .4)), br = this.p.brazos[1]; br.rotation.z = lerp(br.r0, 1.15, kb) + Math.sin(t * 5) * .04 * kb; this.b.rotation.z = -br.rotation.z; this.b.scale.setScalar(pop(t, tb - .3, .3));
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      // en la lupa: el bálsamo pasa por los labios y quedan brillosos
      const lu = t < tm; this.lu.visible = lu; this.lu.scale.setScalar(pop(t, tb - .1, .35)); this.lu.rotation.z = Math.sin(t * 1.8) * .03;
      const kp = cl((t - tb) / .9); this.bl.visible = kp > 0 && kp < 1; this.bl.position.set(lerp(.5, -.5, ease(kp)), .02 + Math.sin(kp * Math.PI * 3) * .06, .1);
      this.lab.seca(lerp(1, 0, ease(kp))); this.lab.brillo.visible = kp > .5;
      if (kp >= 1 && t < tm) animaCorazones(this.cs, t, -.55, 2.4, .45, .25); else this.cs.forEach(h => h.visible = false);
      // la amiga que siempre anda chupándose los labios
      this.a.visible = t > tm - .1; this.a.scale.set(.88, .88 * pop(t, tm - .1, .35), .176); A.parpadea(this.a, t, 1.4);
      this.a.head.rotation.z = this.a.head.r0 + Math.sin(t * 8) * .07; this.a.brazos[0].rotation.z = this.a.brazos[0].r0 + Math.sin(t * 3) * .04; this.a.brazos[1].rotation.z = this.a.brazos[1].r0 - Math.sin(t * 3) * .04;
      if (t > tb) c.ev('pop', tb - .1, .5); if (t > tb + .9) c.ev('ding', tb + .9, .5); if (t > tm) c.ev('whoosh', tm - .1, .5);
      cam([.1, 1.2, 10.4], [.1, 1.15, 0], 34);
      if (t > tb && t < tm) etiqueta('BÁLSAMO', [.72, 1.0, .7], lt - tb, 50, '#ffffff', true);
      if (t > tch && t < tm) etiqueta('¡NO LOS CHUPES!', [-.4, -.2, .7], lt - tch, 46, '#ffd640', true);
      if (t > tm) etiqueta('MÁNDASELO', [.15, -.2, .7], lt - tm, 56, '#ffd640', true);
      if (t < tm) rotulo('Truco', 'bálsamo y no los chupes', lt - .1, RY); else rotulo('Mándaselo', 'a quien siempre se chupa los labios', lt - tm, RY);
    }
  });
  P.cierre();
}
