// Short 16-nov 21:30 · CARTULINA CHIBI: ¿Por qué con el frío te sale "humo" de la boca? (vaho = vapor que se vuelve gotitas)
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-16-2130-vaho-frio.json OUT ../ejemplos/2026-11-16-2130-vaho-frio.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw, blob } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xbfe3f5;
  const set = () => { ambiente({ top: CIELO, bottom: CIELO, fog: CIELO, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, fase = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + fase) * .05; };
  const vaho = (p, n = 5) => PM.aliento([.3, -.27, .05], p.head, { n });
  // nubecita con carita (silueta de nube hecha con blob para que la sombra y la cara queden dentro)
  const nubeCara = (pos, r) => { const pts = []; for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, k = 1 + .13 * Math.cos(a * 5); pts.push([Math.cos(a) * r * 1.3 * k, Math.sin(a) * r * .82 * k]); }
    return PM.astro(pos, r, 0xffffff, { forma: blob(pts), sombra: 0xdbe9f5 }); };

  // ---------- 1 · gancho: hace frío y le sale "humo" de la boca ----------
  escena('gancho', {
    setup() { set(); this.cp = PM.copos({ n: 16, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.p = PM.chibi([-.55, .02, .3], { logo: true, boca: 'abierta', mira: 1 }); this.bu = PM.bufanda(this.p, 0xff6b5b); this.va = vaho(this.p, 6);
      this.q = PM.pregunta([.95, 2.0, .5], .9, 0xffc83d); },
    update(lt, c) {
      const t = tw(lt), th = c.w('humo') - .15; this.cp.update(t);
      A.parpadea(this.p, t + 1.3, .6); A.tiembla(this.p, t, .5, -.55); this.bu.mece(t); habla(this.p, t);
      this.p.brazos[0].rotation.z = .35 + Math.sin(t * 40) * .02; this.p.brazos[1].rotation.z = -.35 - Math.sin(t * 40) * .02;   // se abraza de frío
      this.va.update(t + .5, 1, 1, t > th ? 1.25 : .95, t > th ? 1.5 : 1.1);
      this.q.scale.setScalar(pop(t, th, .35) * .9); this.q.rotation.z = Math.sin(t * 3) * .12;
      if (t > th) c.ev('pop', th, .5); c.ev('whoosh', .05, .4);
      cam([.1, 1.2, lerp(10.9, 10.4, ease(lt / 3))], [.1, 1.15, 0], 34);
      etiqueta('BRRR…', [-.55, -.2, .7], lt - .1, 56, '#ffffff', true);
      if (t > th) etiqueta('¿HUMO?', [.85, .7, .7], lt - th, 60, '#ffd640', true);
      rotulo('¿Por qué con frío', 'te sale humo de la boca?', lt - .05, RY);
    }
  });

  // ---------- 2 · no es humo: aliento calientito con vapor invisible ----------
  escena('aliento', {
    setup() { set(); this.cp = PM.copos({ n: 10, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.p = PM.chibi([-.85, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .85 }); this.bu = PM.bufanda(this.p, 0xff6b5b); this.va = vaho(this.p);
      this.lu = PM.lupa([.6, 1.45, .4], .66, { fondo: 0xffd9c2 }); this.vp = PM.vapor(this.lu.dentro);
      this.x = PM.marca([-.85, 2.45, .6], false, .8); },
    update(lt, c) {
      const t = tw(lt), tn = c.w('humo:') - .2, tc = c.w('calientito') - .2, tv = c.w('vapor') - .2, ti = c.w('invisible.') - .2; this.cp.update(t);
      A.parpadea(this.p, t, 1.4); habla(this.p, t); this.bu.mece(t);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.05, eout(cl((t - tv + .2) / .4))) + Math.sin(t * 4) * .04;   // señala la lupa
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      this.va.update(t, 1, 1, .8, .9);
      this.x.scale.setScalar(t < tc ? pop(t, tn, .3) * .8 : Math.max(.001, .8 * (1 - cl((t - tc) / .25))));
      this.lu.scale.setScalar(pop(t, tc - .1, .35)); this.lu.rotation.z = Math.sin(t * 1.8) * .03;
      this.vp.update(t, 0); this.vp.visible = t > tc - .1; this.vp.scale.setScalar(pop(t, tc, .3));
      c.ev('pop', tn, .4); if (t > tc) c.ev('pop', tc - .1, .5); if (t > tv) c.ev('ding', tv, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tn && t < tc) etiqueta('NO ES HUMO', [-.4, -.2, .7], lt - tn, 50, '#ffd640', true);
      if (t > tc) etiqueta('CALIENTITO', [.6, .45, .7], lt - tc, 46, '#ffffff', true);
      if (t > ti) etiqueta('VAPOR INVISIBLE', [-.3, -.25, .7], lt - ti, 44, '#ffd640', true);
      if (t < tc) rotulo('No es humo', 'es tu aliento', lt - .1, RY); else rotulo('Aliento calientito', 'con vapor de agua', lt - tc, RY);
    }
  });

  // ---------- 3 · choca con el aire frío: gotitas → ¡mini nube! ----------
  escena('nube', {
    setup() { set(); this.cp = PM.copos({ n: 14, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.p = PM.chibi([-.85, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .85 }); this.bu = PM.bufanda(this.p, 0xff6b5b); this.va = vaho(this.p, 6);
      this.lu = PM.lupa([.6, 1.45, .4], .66, { fondo: 0xd6ecff }); this.vp = PM.vapor(this.lu.dentro);
      this.nb = nubeCara([.55, 1.5, .5], .45); this.nb.cara('abierta'); },
    update(lt, c) {
      const t = tw(lt), tf = c.w('frío,') - .2, te = c.w('enfría') - .2, tg = c.w('gotitas') - .2, tm = c.w('mini') - .25; this.cp.update(t);
      A.parpadea(this.p, t, .9); this.bu.mece(t); A.tiembla(this.p, t, t > tf && t < tm ? .5 : 0, -.85);
      if (t < tm) habla(this.p, t); else this.p.head.rotation.z = this.p.head.r0 - .08 + Math.sin(t * 4) * .03;
      this.p.boca(t > tm ? 'feliz' : 'abierta'); A.preocupa(this.p, t > tf && t < tm ? .6 : 0);
      this.p.brazos[0].rotation.z = t > tm ? lerp(.22, 2.3, eout(cl((t - tm) / .35))) * -1 + Math.sin(t * 6) * .05 : this.p.brazos[0].r0 + Math.sin(t * 3) * .03;   // festeja
      this.p.brazos[1].rotation.z = t > tm ? lerp(.22, 2.3, eout(cl((t - tm) / .35))) - Math.sin(t * 6) * .05 : this.p.brazos[1].r0 - Math.sin(t * 3) * .03;
      this.va.update(t, 1, 1, t > tm ? 1.0 : .85, t > tm ? 1.3 : 1);
      // lupa: el vapor se frena y se junta en gotitas; con "mini nube" la lupa se va y aparece la nubecita
      const kv = cl((t - te) / (tg + .3 - te)); this.vp.update(t, ease(kv));
      const kl = t < tm ? pop(t, -.2, .35) : Math.max(.001, 1 - cl((t - tm) / .2)); this.lu.scale.setScalar(kl); this.lu.visible = kl > .01; this.lu.rotation.z = Math.sin(t * 1.8) * .03;
      this.nb.visible = t > tm; this.nb.scale.setScalar(pop(t, tm, .4)); this.nb.position.y = 1.5 + Math.sin(t * 2) * .06; this.nb.rotation.z = Math.sin(t * 1.5) * .05; A.parpadea(this.nb, t, .3);
      if (t > tf) c.ev('whoosh', tf, .4); if (t > tg) c.ev('pop', tg, .4); if (t > tm) c.ev('ding', tm, .6);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tf && t < tg) etiqueta('AIRE FRÍO', [-.85, -.2, .7], lt - tf, 50, '#ffffff', true);
      if (t > tg && t < tm) etiqueta('GOTITAS', [.6, .45, .7], lt - tg, 50, '#ffd640', true);
      if (t > tm) etiqueta('¡MINI NUBE!', [.55, .6, .7], lt - tm, 58, '#ffd640', true);
      if (t < tg) rotulo('El aire frío', 'enfría el vapor', lt - .1, RY); else rotulo('Gotitas diminutas', '= una mini nube', lt - tg, RY);
    }
  });

  // ---------- 4 · lo mismo que el humito del atole ----------
  escena('atole', {
    setup() { set(); this.cp = PM.copos({ n: 10, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.p = PM.chibi([-.78, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .9 }); this.bu = PM.bufanda(this.p, 0xff6b5b); this.va = vaho(this.p, 4);
      this.tz = PM.taza([0, -.62, .12], this.p.brazos[1]); this.tz.scale.setScalar(1.35);
      this.ab = PM.chibi([1.0, .02, .3], { pelo: 'chongo', colPelo: 0xc9c9d4, ropa: 0x7b5cff, falda: 0x2ec4a6, lentes: true, boca: 'feliz', mira: -1, escala: .85 });
      this.ta = PM.taza([0, -.62, .12], this.ab.brazos[0], { color: 0x2ec4a6 }); this.ta.scale.set(-1.3, 1.3, 1.3); this.vb = PM.aliento([-.42, -.3, .05], this.ab.head, { n: 4 }); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('atole:') - .25, tv = c.w('vapor') - .2, tg = c.w('gotitas.') - .2; this.cp.update(t);
      A.parpadea(this.p, t, .5); A.parpadea(this.ab, t, 1.7); habla(this.p, t); this.bu.mece(t);
      this.ab.head.rotation.z = this.ab.head.r0 + Math.sin(t * 2.2) * .05;
      // levanta el atole a la altura del pecho; la taza se contrarrota para quedar derecha
      const kb = eout(cl((t + .2) / .4)), br = this.p.brazos[1]; br.rotation.z = lerp(br.r0, 1.0, kb) + Math.sin(t * 3) * .03; this.tz.rotation.z = -br.rotation.z;
      const bb = this.ab.brazos[0]; bb.rotation.z = -.62 - Math.sin(t * 3 + 1) * .03; this.ta.rotation.z = -bb.rotation.z;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03; this.ab.brazos[1].rotation.z = this.ab.brazos[1].r0 + Math.sin(t * 2.5) * .03;
      const kh = t > ta ? 1 : .55; this.tz.humea(t, kh); this.ta.humea(t + .4, kh);
      this.va.update(t, 1, 1, .45, .8); this.vb.update(t + .3, 1, -1, .4, .75);
      if (t > ta) c.ev('pop', ta, .4); if (t > tg) c.ev('ding', tg, .5);
      cam([.1, 1.2, 10.9], [.1, 1.15, 0], 34);
      if (t > ta) etiqueta('ATOLE', [-.25, .3, .7], lt - ta, 46, '#ffffff', true);
      if (t > tg) etiqueta('¡MISMAS GOTITAS!', [.1, -.25, .7], lt - tg, 46, '#ffd640', true);
      rotulo('Igual que el humito', 'del atole', lt - .1, RY);
    }
  });

  // ---------- 5 · remate: el que jugaba a ser dragón ----------
  escena('remate', {
    setup() { set(); this.cp = PM.copos({ n: 12, x0: -1.6, x1: 1.6, y0: .0, y1: 2.9 });
      this.p = PM.chibi([-.6, .02, .3], { logo: true, boca: 'abierta', mira: 1 }); this.bu = PM.bufanda(this.p, 0xff6b5b); this.va = vaho(this.p, 7); this.va.rotation.z = .55;
      this.cu = [-1, 1].map(sx => PM.pz(F.poly([[-.07, 0], [.07, 0], [sx * .05, .2]]), 0x2ec4a6, [sx * .24, .42, -.01], this.p.head, { tinta: .012, papel: .04 }));
      this.a = PM.chibi([.88, .02, .3], { pelo: 'cola', ropa: 0xffc83d, pantalon: 0x7b5cff, colPelo: 0x2a1a12, boca: 'feliz', mira: -1, escala: .85 }); },
    update(lt, c) {
      const t = tw(lt), tn = c.w('niño') - .3, td = c.w('dragón') - .25; this.cp.update(t);
      A.parpadea(this.p, t, .2); A.parpadea(this.a, t, 1.4); this.bu.mece(t);
      const kd = eout(cl((t - tn) / .35));   // pose de dragón: brazos arriba como garras
      this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -2.2, kd) + Math.sin(t * 8) * .06 * kd; this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.2, kd) - Math.sin(t * 8) * .06 * kd;
      this.p.head.rotation.z = this.p.head.r0 - .06 * kd + Math.sin(t * 6) * .04;
      this.cu.forEach(k => k.scale.setScalar(pop(t, tn, .3)));
      this.va.update(t, 1, 1, lerp(.8, 1.15, kd), lerp(1, 1.6, kd));
      // la amiga se ríe
      this.a.head.rotation.z = this.a.head.r0 + Math.sin(t * 9) * .07 * (t > td ? 1 : .4); this.a.position.y = .02 + (t > td ? Math.abs(Math.sin(t * 9)) * .05 : 0);
      this.a.brazos[0].rotation.z = this.a.brazos[0].r0 + Math.sin(t * 3) * .04; this.a.brazos[1].rotation.z = this.a.brazos[1].r0 - .5 - Math.sin(t * 9) * .1;
      if (t > tn) c.ev('whoosh', tn, .5); if (t > td) c.ev('pop', td, .5);
      cam([.1, 1.2, 10.4], [.1, 1.15, 0], 34);
      if (t > td) etiqueta('¡SOY DRAGÓN!', [-.6, -.2, .7], lt - td, 50, '#ffffff', true);
      etiqueta('MÁNDASELO', [.85, -.2, .7], lt - .1, 52, '#ffd640', true);
      rotulo('Mándaselo', 'al que jugaba a ser dragón', lt - .05, RY);
    }
  });
  P.cierre();
}
