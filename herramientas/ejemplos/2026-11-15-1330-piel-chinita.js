// Short 15-nov 13:30 (hecho el 14-nov; el render no alcanzó las 21:30) · CARTULINA CHIBI: ¿Por qué con el frío siempre se te pone la piel chinita?
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-15-1330-piel-chinita.json OUT ../ejemplos/2026-11-15-1330-piel-chinita.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xbfe3f5, AIRE = 0xd6efff;
  const set = () => { ambiente({ top: CIELO, bottom: CIELO, fog: CIELO, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, fase = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + fase) * .05; };
  const mueve = (p, t, f = 0) => { p.brazos[0].rotation.z = p.brazos[0].r0 + Math.sin(t * 3 + f) * .04; p.brazos[1].rotation.z = p.brazos[1].r0 - Math.sin(t * 3 + f) * .04; };

  // ---------- 1 · gancho: hace frío y se pone la piel chinita ----------
  escena('gancho', {
    setup() { set(); this.cp = PM.copos({ n: 16, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.p = PM.chibi([-.62, .02, .3], { logo: true, boca: 'apretada', mira: 1 }); this.bu = PM.bufanda(this.p, 0xff6b5b);
      this.lu = PM.lupa([.72, 1.6, .4], .66, { fondo: AIRE }); this.pc = PM.pielChinita([0, .02, 0], .95, this.lu.dentro); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('chinita') - .15; this.cp.update(t);
      A.parpadea(this.p, t, .6); A.preocupa(this.p, 1); A.tiembla(this.p, t, 1, -.62); this.bu.mece(t);
      this.p.boca(t > tc + .1 ? 'abierta' : 'apretada'); this.p.head.rotation.z = this.p.head.r0 - .06 + Math.sin(t * 5) * .04;
      this.p.brazos[0].rotation.z = .35 + Math.sin(t * 40) * .03; this.p.brazos[1].rotation.z = -.35 - Math.sin(t * 40) * .03;   // se abraza de frío
      this.lu.scale.setScalar(pop(t, -.4, .35)); this.lu.rotation.z = Math.sin(t * 1.8) * .03;
      this.pc.eriza(eout(cl((t - tc) / .4)));
      c.ev('pop', .1, .5); if (t > tc) c.ev('pop', tc, .6);
      cam([.05, 1.2, lerp(10.9, 10.4, ease(lt / 3.2))], [.05, 1.15, 0], 34);
      etiqueta('BRRR…', [-.62, -.2, .7], lt - .2, 56, '#ffffff', true);
      if (t > tc) etiqueta('¡PIEL CHINITA!', [.6, .62, .7], lt - tc, 50, '#ffd640', true);
      rotulo('¿Por qué con frío', 'se te pone la piel chinita?', lt - .1, RY);
    }
  });

  // ---------- 2 · el musculito se encoge y para el pelito ----------
  escena('musculo', {
    setup() { set(); this.cp = PM.copos({ n: 8, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.p = PM.chibi([-.95, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .8 }); this.bu = PM.bufanda(this.p, 0xff6b5b);
      this.lu = PM.lupa([.42, 1.45, .4], .8, { fondo: AIRE }); this.pc = PM.pielChinita([0, .04, 0], 1.08, this.lu.dentro); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('pelito') - .2, tm = c.w('músculo') - .2, te = c.w('encoge') - .15, tb = c.w('bultito') - .2; this.cp.update(t);
      A.parpadea(this.p, t, 1.4); habla(this.p, t); this.bu.mece(t); this.p.boca(t > tb ? 'feliz' : 'abierta');
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.1, eout(cl((t - .1) / .4))) + Math.sin(t * 4) * .05;   // señala la lupa
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      this.lu.scale.setScalar(pop(t, -.2, .35)); this.lu.rotation.z = Math.sin(t * 1.6) * .02;
      // el músculo late cuando lo nombran y luego se encoge
      const late = t > tm && t < te ? 1 + .12 * Math.abs(Math.sin((t - tm) * 9)) : 1;
      this.pc.eriza(eout(cl((t - te) / .7))); this.pc.musculo.scale.x *= late; this.pc.musculo.scale.y *= late;
      this.pc.pelo.scale.setScalar(t > tp && t < tm ? 1 + .1 * Math.abs(Math.sin((t - tp) * 9)) : 1);
      c.ev('pop', -.1, .4); if (t > tm) c.ev('pop', tm, .4); if (t > te) c.ev('whoosh', te, .4); if (t > tb) c.ev('ding', tb, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tp) etiqueta('PELITO', [-.25, 2.2, .7], lt - tp, 44, '#ffffff', true);
      if (t > tm) etiqueta('MÚSCULO', [.42, .42, .7], lt - tm, 44, '#ffffff', true);
      if (t > tb) etiqueta('¡BULTITO!', [-.95, -.25, .7], lt - tb, 50, '#ffd640', true);
      if (t < te) rotulo('Junto a cada pelito', 'hay un músculo diminuto', lt - .1, RY); else rotulo('Con el frío se encoge', 'y para el pelito', lt - te, RY);
    }
  });

  // ---------- 3 · herencia de antepasados peludos: aire calientito como suéter ----------
  escena('peludo', {
    setup() { set(); this.cp = PM.copos({ n: 10, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.a = PM.chibi([-.5, .02, .3], { piel: 0xd9a07a, ropa: 0x8a5a3a, pantalon: 0x6b4430, tenis: 0x6b4430, colPelo: 0x5a3a26, boca: 'apretada', mira: 1, escala: .9 });
      this.f = PM.pelaje(this.a, 0x8a5a3a);
      this.p = PM.chibi([.85, .02, .3], { logo: true, boca: 'abierta', mira: -1, escala: .8 }); this.bu = PM.bufanda(this.p, 0xff6b5b); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('antepasados') - .2, tpa = c.w('parado') - .2, tai = c.w('aire') - .2, ts = c.w('suéter') - .2; this.cp.update(t);
      A.parpadea(this.a, t, .3); A.parpadea(this.p, t, 1.7); habla(this.p, t, 1); this.bu.mece(t); mueve(this.p, t, 1);
      const ke = eout(cl((t - tpa) / .5)); this.f.eriza(ke, t); this.f.calienta(cl((t - tai) / .8), t);
      this.a.boca(t > tai ? 'feliz' : 'apretada'); A.preocupa(this.a, t > tai ? 0 : .6); A.tiembla(this.a, t, t > tpa ? 0 : .6, -.5);
      this.a.head.rotation.z = this.a.head.r0 + Math.sin(t * 2.5) * .05; mueve(this.a, t);
      this.p.boca(t > ts ? 'feliz' : 'abierta');
      if (t > ta) c.ev('pop', ta, .4); if (t > tpa) c.ev('whoosh', tpa, .5); if (t > tai) c.ev('ding', tai, .4);
      cam([.15, 1.2, 10.4], [.15, 1.15, 0], 34);
      if (t > ta && t < tai) etiqueta('ANTEPASADO PELUDO', [-.2, -.25, .7], lt - ta, 42, '#ffffff', true);
      if (t > tai) etiqueta('AIRE CALIENTITO', [-.2, -.25, .7], lt - tai, 46, '#ffd640', true);
      if (t < tpa) rotulo('Herencia de', 'antepasados peludos', lt - .1, RY); else rotulo('El pelo parado atrapa aire', 'como un suéter', lt - tpa, RY);
    }
  });

  // ---------- 4 · ya casi no tenemos pelo… y pasa con una emoción fuerte ----------
  escena('emocion', {
    setup() { set(); this.cp = PM.copos({ n: 10, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 }); this.no = PM.notas({ n: 4, x: -.75, y: 2.2, ancho: 1.3, alto: .3 });
      this.p = PM.chibi([-.75, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .85 });
      this.lu = PM.lupa([.62, 1.5, .4], .7, { fondo: AIRE }); this.pc = PM.pielChinita([0, .03, 0], .95, this.lu.dentro, { k: 1 });
      this.x = PM.marca([1.22, 2.15, .6], false, .8); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('sirve') - .2, tem = c.w('también') - .15; this.cp.update(t, t < tem ? 1 : 0); this.no.update(t, t > tem ? 1 : 0);
      A.parpadea(this.p, t, 2.1);
      if (t < tem) { habla(this.p, t, 1); A.preocupa(this.p, t > ts ? .9 : .3); this.p.boca(t > ts ? 'apretada' : 'abierta'); A.tiembla(this.p, t, .6, -.75);
        const enc = eout(cl((t - ts) / .3)); this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -.9, enc) + Math.sin(t * 3) * .03; this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, .9, enc) - Math.sin(t * 3) * .03; }   // se encoge de hombros
      else { A.preocupa(this.p, 0); this.p.boca('feliz'); this.p.position.x = -.75; this.p.position.y = .02 + Math.abs(Math.sin(t * 6)) * .08; this.p.head.rotation.z = this.p.head.r0 + Math.sin(t * 4) * .1;
        this.p.brazos[0].rotation.z = -1.75 + Math.sin(t * 6) * .2; this.p.brazos[1].rotation.z = 1.75 - Math.sin(t * 6) * .2; }   // ¡emoción! brazos abiertos y saltito (manos visibles)
      this.lu.scale.setScalar(pop(t, -.2, .35)); this.lu.rotation.z = Math.sin(t * 1.6) * .03;
      this.pc.eriza(t < tem ? 1 : eout(cl((t - tem - .25) / .5)) * 1);
      if (t > tem && t < tem + .25) this.pc.eriza(lerp(1, 0, (t - tem) / .25));
      this.x.scale.setScalar(t < tem ? pop(t, ts, .35) * .8 : .001); this.x.rotation.z = Math.sin(t * 3) * .08;
      if (t > ts) c.ev('pop', ts, .4); if (t > tem) c.ev('ding', tem, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > ts && t < tem) etiqueta('YA NO CALIENTA', [.3, .5, .7], lt - ts, 44, '#ffffff', true);
      if (t > tem + .3) etiqueta('¡TAMBIÉN CON EMOCIÓN!', [.0, -.25, .7], lt - tem - .3, 42, '#ffd640', true);
      if (t < tem) rotulo('Ya casi no tenemos pelo', 'así que no sirve', lt - .1, RY); else rotulo('También pasa', 'con una emoción fuerte', lt - tem, RY);
    }
  });

  // ---------- 5 · remate: mándaselo al que se pone chinito con el himno ----------
  escena('remate', {
    setup() { set(); this.no = PM.notas({ n: 4, x: .1, y: 2.3, ancho: 1.8, alto: .3 });
      this.p = PM.chibi([-.65, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .9 });
      this.a = PM.chibi([.75, .02, .3], { pelo: 'cola', ropa: 0xff6b5b, pantalon: 0x2b2f4a, colPelo: 0x2a1a12, boca: 'feliz', mira: -1, escala: .9 });
      // banderita de cartulina en el piso, entre los dos
      this.b = group([.05, -.05, .5]); PM.pz(F.rect(.05, 1.2, .02), 0x8a6a4a, [0, .6, 0], this.b, { tinta: .012, papel: .03 });
      this.tela = group([.03, 1.05, .02], this.b); [0x1f8a4c, 0xffffff, 0xe0414f].forEach((col, i) => PM.pz(F.rect(.16, .3, .01), col, [.08 + i * .16, 0, i * .002], this.tela, { tinta: .01, papel: i === 1 ? .03 : false }));
      PM.det(F.circ(.045), 0x9a6a3a, [.24, 0, .02], this.tela); },
    update(lt, c) {
      const t = tw(lt), tm = c.w('mándaselo') - .2, th = c.w('himno') - .2; this.no.update(t, 1);
      A.parpadea(this.p, t, .4); A.parpadea(this.a, t, 1.6); habla(this.p, t); mueve(this.p, t);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.0, eout(cl((t - tm) / .4))) + Math.sin(t * 4) * .05;   // la señala
      this.a.brazos[1].rotation.z = 1.9 + Math.sin(t * 10) * .25; this.a.brazos[0].rotation.z = this.a.brazos[0].r0 + Math.sin(t * 3) * .04;
      A.tiembla(this.a, t, t > th ? .5 : 0, .75); this.a.head.rotation.z = this.a.head.r0 + Math.sin(t * 3) * .06;
      this.b.scale.setScalar(pop(t, -.2, .35)); this.tela.rotation.z = Math.sin(t * 3) * .06; this.tela.scale.y = 1 + Math.sin(t * 6) * .04;
      if (t > tm) c.ev('whoosh', tm, .5); if (t > th) c.ev('ding', th, .4);
      cam([.05, 1.2, 10.4], [.05, 1.15, 0], 34);
      if (t > tm) etiqueta('MÁNDASELO', [-.65, -.25, .7], lt - tm, 52, '#ffd640', true);
      if (t > th) etiqueta('¡CHINITO!', [.75, 2.25, .7], lt - th, 46, '#ffffff', true);
      rotulo('Mándaselo', 'al que se pone chinito con el himno', lt - .1, RY);
    }
  });
  P.cierre();
}
