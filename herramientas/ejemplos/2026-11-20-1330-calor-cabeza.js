// Short 20-nov 13:30 · CARTULINA CHIBI (pedido): ¿de verdad se te va casi todo el calor por la cabeza? Mito que salió de un experimento
// del ejército de EE.UU. (años cincuenta) con soldados con trajes árticos y la cabeza descubierta. Pierdes calor por cualquier parte
// destapada; la cabeza es ~10 % de la piel. Cara y cabeza sienten mucho el frío: el gorro sí ayuda.
// Fuentes: Live Science (Do we really lose half our body heat from our heads?), NPR (Myth: you lose most body heat through your head), BMJ 2008.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-20-1330-calor-cabeza.json OUT ../ejemplos/2026-11-20-1330-calor-cabeza.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xcfdde8, GORRO = 0xff6b5b, ROJO = 0xff4d5e;
  const set = () => { ambiente({ top: CIELO, bottom: CIELO, fog: CIELO, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const mama = (pos, o = {}) => PM.chibi(pos, { pelo: 'cola', ropa: 0x7b5cff, pantalon: 0x2b2f4a, tenis: 0xff6b9b, colPelo: 0x2a1a12, aretes: true, boca: 'abierta', mira: 1, ...o });
  // cachetes rojos de frío (crecen con k)
  const cachetes = p => { const cs = [-1, 1].map(sx => { const c = PM.det(F.elipse(.11, .065), 0xff5a6e, [sx * .3, -.17, .034], p.head); return c; }); return k => cs.forEach(c => c.scale.setScalar(Math.max(.001, k))); };

  // ---------- 1 · gancho: la mamá persigue al protagonista con el gorro; de su cabeza salen ondas de calor exageradas ----------
  escena('gancho', {
    setup() { set(); this.cp = PM.copos({ n: 12, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.p = PM.chibi([.2, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .82 }); this.va = PM.aliento([.3, -.27, .05], this.p.head, { n: 4 });
      this.oc = PM.ondasCalor([0, .95, .02], this.p.head, { largo: .7, sep: .24, grosor: .075 });
      this.m = mama([-1.0, .02, .2], { escala: .82 });
      this.g = PM.gorro([0, -.66, .08], GORRO, {}, this.m.brazos[1]); this.g.scale.setScalar(.42); this.g.rotation.z = -1.3; },
    update(lt, c) {
      const t = tw(lt), tc = c.w('calor') - .1, tk = c.w('cabeza?') - .1;
      this.cp.update(t, 1); this.va.update(t, 1, 1, .7, .8);
      A.parpadea(this.p, t + 1.2, .3); A.parpadea(this.m, t + 2.2, 1.7);
      const xp = lerp(.2, .62, ease(cl(lt / 3.4))), xm = lerp(-1.0, -.62, ease(cl(lt / 3.4)));
      A.anda(this.p, t, 1, .02); A.anda(this.m, t + .4, 1, .02); this.p.position.x = xp; this.m.position.x = xm;
      this.p.head.rotation.y = 0; this.p.boca('abierta'); habla(this.p, t);
      this.m.brazos[1].rotation.z = 1.35 + Math.sin(t * 11) * .08; this.m.boca(Math.sin(t * 9) > 0 ? 'abierta' : 'feliz');
      this.oc.update(t, .6 + .4 * ease(cl((t - tc) / .4))); this.oc.scale.setScalar(1 + .35 * ease(cl((t - tc) / .4)));
      if (t > tc) c.ev('whoosh', tc, .4); if (t > tk) c.ev('pop', tk, .5);
      cam([0, 1.2, lerp(10.9, 10.4, ease(lt / 3))], [0, 1.15, 0], 34);
      if (t > tk) etiqueta('¿TODO POR LA CABEZA?', [0, 2.5, .9], lt - tk, 42, '#ffd640', true);
      rotulo('¿Se te va el calor', 'por la cabeza?', lt - .05, RY);
    }
  });

  // ---------- 2 · soldados: foto vieja sepia; soldaditos con trajes de nieve gigantes y la cabeza destapada; sello de MITO ----------
  escena('soldados', {
    setup() { set();
      this.ft = group([0, 1.2, .05]);
      PM.pz(F.rect(2.55, 2.3, .04), 0xfff8ea, [0, 0, 0], this.ft, { tinta: .016, papel: .06 });
      PM.pz(F.rect(2.3, 2.05, .02), 0xd8c29a, [0, .02, .016], this.ft, { tinta: .01, papel: false });
      PM.det(F.rect(2.3, .55, .01), 0xc4ab80, [0, -.73, .03], this.ft);                     // piso de nieve viejita
      this.ft.rotation.z = -.03;
      const sep = { piel: 0xd9b48c, ropa: 0xa88a5e, pantalon: 0x7e6648, tenis: 0x5e4a36, colPelo: 0x4a3626, boca: 'feliz', escala: .58 };
      this.s = [-.72, 0, .72].map((x, i) => { const s = PM.chibi([x, .3, .25 + i * .01], { ...sep, mira: [1, 0, -1][i] });
        s.ch = PM.chamarra(s, 0xcbb38a); s.bu = PM.bufanda(s, 0x9a7a52, 0xe8d8b8); s.oc = PM.ondasCalor([0, .85, .02], s.head, { largo: .42, sep: .18, color: 0xc8553d }); return s; });
      this.sello = PM.letrero([.62, 2.1, .7], 'MITO', { w: .9, h: .34, hilos: false, borde: ROJO, color: 0xfff1f1, tinta: '#e0283c' }); this.sello.rotation.z = .18; },
    update(lt, c) {
      const t = tw(lt), tm = c.w('mito:') - .1, ts = c.w('soldados') - .1, ta = c.w('abrigados…') - .1, tme = c.w('menos') - .1;
      this.s.forEach((s, i) => { A.parpadea(s, t + i * .9, i * .6); respira(s, t, .3, i);
        s.ch.scale.set(lerp(.001, 1.25, pop(t, ta + i * .08, .35)), lerp(.001, 1.15, pop(t, ta + i * .08, .35)), 1);
        s.bu.scale.setScalar(pop(t, ta + i * .08 + .1, .35)); s.bu.mece(t + i);
        s.oc.update(t + i * .3, ease(cl((t - tme) / .4))); s.boca(t > tme ? 'apretada' : 'feliz'); A.preocupa(s, eout(cl((t - tme) / .3)));
        s.head.rotation.z = s.head.r0 + Math.sin(t * 2 + i) * .03; });
      this.ft.scale.setScalar(pop(t, 0, .4)); this.s.forEach((s, i) => s.scale.set(.58 * pop(t, .15 + i * .12, .35), .58 * pop(t, .15 + i * .12, .35), .116));
      this.sello.scale.setScalar(t > tm ? lerp(1.8, 1, eout(cl((t - tm) / .25))) : .001);
      if (t > tm) c.ev('impact', tm, .5); if (t > ts) c.ev('pop', ts, .4); if (t > ta) c.ev('whoosh', ta, .4); if (t > tme) c.ev('ding', tme, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tme) etiqueta('¡SIN GORRO!', [-.35, 2.5, .9], lt - tme, 50, '#ffd640', true);
      rotulo('Salió de un experimento', 'con soldados', lt - .1, RY);
    }
  });

  // ---------- 3 · piel: el calor sale por brazos, piernas y cabeza igual; pastel con una rebanadita = la cabeza ----------
  escena('piel', {
    setup() { set();
      this.p = PM.chibi([-.68, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .82 });
      this.os = [PM.ondasCalor([0, .85, .02], this.p.head, { largo: .38, sep: .17 }),
        ...this.p.brazos.map((b, i) => { const o = PM.ondasCalor([[-1, 1][i] * .05, -.3, .05], b, { largo: .42, sep: .14, n: 2, grosor: .055 }); o.rotation.z = [1.45, -1.45][i]; return o; }),
        ...this.p.piernas.map((b, i) => { const o = PM.ondasCalor([[-1, 1][i] * .08, -.1, .05], b, { largo: .42, sep: .14, n: 2, grosor: .055 }); o.rotation.z = [1.5, -1.5][i]; return o; })];
      // pastel de la piel: rebanada chiquita (una décima) = cabeza
      this.pa = group([.72, 1.45, .4]); const R = .55, N = 40, a0 = Math.PI / 2, da = Math.PI * 2 / 10;
      const rest = [[0, 0]]; for (let i = 0; i <= N; i++) { const a = a0 + da + (Math.PI * 2 - da) * i / N; rest.push([Math.cos(a) * R, Math.sin(a) * R]); }
      PM.pz(F.poly(rest), 0xffd9b8, [0, 0, 0], this.pa, { tinta: .016, papel: .06 });
      const reb = [[0, 0]]; for (let i = 0; i <= 8; i++) { const a = a0 + da * i / 8; reb.push([Math.cos(a) * R, Math.sin(a) * R]); }
      this.rb = group([0, 0, .03], this.pa); PM.pz(F.poly(reb), ROJO, [0, 0, 0], this.rb, { tinta: .016, papel: .05 });
      this.lc = PM.letrero([.72, .45, .5], 'CABEZA', { w: .8, h: .22, hilos: false, borde: ROJO });
      this.fl = PM.pz(F.poly([[0, .13], [.1, 0], [.04, 0], [.04, -.13], [-.04, -.13], [-.04, 0], [-.1, 0]]), ROJO, [.6, 2.18, .5], null, { tinta: .012, papel: .04 }); this.fl.rotation.z = Math.PI; },
    update(lt, c) {
      const t = tw(lt), tq = c.w('cualquier') - .1, tk = c.w('cabeza') - .1, td = c.w('décima') - .1;
      A.parpadea(this.p, t + .5, 1.1); respira(this.p, t); habla(this.p, t);
      const ko = ease(cl((t - tq) / .4)); this.os.forEach((o, i) => o.update(t + i * .37, ko));
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .35 + Math.sin(t * 3) * .04; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + .35 - Math.sin(t * 3) * .04;
      this.p.boca(t > td ? 'feliz' : 'abierta');
      this.pa.scale.setScalar(pop(t, tk, .4)); this.lc.scale.setScalar(pop(t, tk + .2, .35));
      const kr = eout(cl((t - td) / .35)); this.rb.position.set(-.08 * kr, .1 * kr, .03); this.rb.scale.setScalar(1 + .12 * kr);
      this.fl.scale.setScalar(t > td ? pop(t, td, .3) * .9 : .001); this.fl.position.y = 2.18 + Math.sin(t * 6) * .03;
      c.ev('whoosh', .05, .4); if (t > tq) c.ev('whoosh', tq, .4); if (t > tk) c.ev('pop', tk, .4); if (t > td) c.ev('ding', td, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > td) etiqueta('¡SOLO UNA DÉCIMA!', [0, 2.5, .9], lt - td, 46, '#ffd640', true);
      rotulo('Pierdes calor por', 'cualquier parte destapada', lt - .1, RY);
    }
  });

  // ---------- 4 · gorro: cara roja y temblando; cae el gorro, sonríe y palomita ----------
  escena('gorro', {
    setup() { set(); this.cp = PM.copos({ n: 12, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.p = PM.chibi([-.1, .02, .3], { logo: true, boca: 'apretada', mira: 0, escala: .95 }); this.ca = cachetes(this.p);
      this.oc = PM.ondasCalor([0, .95, .02], this.p.head, { largo: .4, sep: .2 });
      this.g = PM.gorro([0, 0, .05], GORRO, {}, this.p.head);
      this.ok = PM.marca([.95, 2.0, .7], true, .6); },
    update(lt, c) {
      const t = tw(lt), tca = c.w('cara') - .1, tel = c.w('gorro') - .55, tg = c.w('gorro') - .05;
      this.cp.update(t, 1); A.parpadea(this.p, t + 1.9, .2);
      const puesto = t > tg, kfr = puesto ? 1 - ease(cl((t - tg) / .6)) : ease(cl((t - tca) / .4)) * .6 + .4;
      A.tiembla(this.p, t, kfr, -.1); respira(this.p, t); this.ca(.5 + .7 * kfr);
      A.preocupa(this.p, kfr); this.p.boca(puesto ? 'feliz' : 'apretada');
      this.oc.update(t, puesto ? 0 : 1);
      const kg = ease(cl((t - tel) / (tg - tel))); this.g.position.y = lerp(1.6, 0, kg); this.g.visible = t > tel;
      this.p.brazos[0].rotation.z = puesto ? lerp(this.p.brazos[0].r0, -2.6, eout(cl((t - tg) / .3))) + Math.sin(t * 8) * .06 : -.25 + Math.sin(t * 40) * .05;   // se abraza / festeja
      this.p.brazos[1].rotation.z = puesto ? this.p.brazos[1].r0 + Math.sin(t * 3) * .04 : .25 - Math.sin(t * 40) * .05;
      this.ok.scale.setScalar(pop(t, tg + .1, .3) * .6);
      c.ev('whoosh', .05, .4); if (t > tel) c.ev('whoosh', tel, .4); if (t > tg) c.ev('ding', tg, .5);
      cam([0, 1.2, lerp(10.4, 9.9, ease(lt / 3.5))], [0, 1.2, 0], 34);
      if (!puesto && t > tca) etiqueta('¡BRRR!', [-.1, 2.55, .9], lt - tca, 56, '#ffffff', true);
      if (puesto) etiqueta('¡EL GORRO SÍ AYUDA!', [0, 2.55, .9], lt - tg, 44, '#ffd640', true);
      rotulo('La cara siente el frío:', 'el gorro sí ayuda', lt - .1, RY);
    }
  });

  // ---------- 5 · remate: mamá triunfante con otro gorro; el protagonista con gorro lo manda en avioncito ----------
  escena('remate', {
    setup() { set(); this.cp = PM.copos({ n: 10, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.m = mama([-.7, .02, .25], { boca: 'feliz', escala: .88 });
      this.gm = PM.gorro([0, -.66, .08], 0x2ec4a6, {}, this.m.brazos[1]); this.gm.scale.setScalar(.55); this.gm.rotation.z = -2.6;
      this.p = PM.chibi([.62, .02, .3], { logo: true, boca: 'abierta', mira: -1, escala: .88 }); PM.gorro([0, 0, .05], GORRO, {}, this.p.head);
      this.av = PM.avion([.62, 1.3, .9], .45); },
    update(lt, c) {
      const t = tw(lt), tma = c.w('Mándaselo') - .1, tmm = c.w('mamá') - .1, tp = c.w('persigue') - .1;
      this.cp.update(t, 1); A.parpadea(this.m, t + .6, .4); A.parpadea(this.p, t + 2.0, 1.6); respira(this.m, t, .02, 1); respira(this.p, t); habla(this.p, t);
      this.m.brazos[1].rotation.z = lerp(this.m.brazos[1].r0, 2.6, eout(cl((t - tmm) / .35))) + Math.sin(t * 10) * .08 * (t > tmm ? 1 : 0);   // gorro en alto
      this.m.brazos[0].rotation.z = this.m.brazos[0].r0 - .15 + Math.sin(t * 3) * .04; this.m.head.rotation.z = this.m.head.r0 + Math.sin(t * 4) * .06;
      this.m.position.y = .02 + (t > tmm ? Math.abs(Math.sin(t * 7)) * .08 : 0);
      this.p.boca(t > tp ? 'feliz' : 'abierta'); this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04;
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.3, eout(cl((t - tma) / .3))) - lerp(0, 1.2, ease(cl((t - tma - .4) / .3)));   // lanza el avioncito
      const ka = cl((t - tma - .45) / 1.4); this.av.visible = t > tma + .45 && ka < 1; this.av.position.set(lerp(.75, 1.75, ease(ka)), 1.35 + Math.sin(ka * Math.PI) * .9 + ka * .4, .9); this.av.rotation.z = .5 - ka * .3;
      c.ev('whoosh', .05, .4); if (t > tma + .45) c.ev('whoosh', tma + .45, .5); if (t > tmm) c.ev('ding', tmm, .5);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.5))], [0, 1.15, 0], 34);
      if (t > tmm) etiqueta('¡MÁNDASELO A TU MAMÁ!', [0, 2.5, .9], lt - tmm, 40, '#ffd640', true);
      rotulo('Mándaselo a tu mamá', '(la del gorro)', lt - .05, RY);
    }
  });
  P.cierre();
}
