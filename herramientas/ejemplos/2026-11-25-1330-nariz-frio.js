// Short 25-nov 13:30 · CARTULINA CHIBI: ¿por qué con el frío SIEMPRE te escurre la nariz?
// La nariz calienta y humedece el aire antes de los pulmones; con aire frío y seco las glándulas sueltan más líquido,
// y el vapor del aliento calientito se condensa en la punta fría de la nariz. Truco: bufanda sobre nariz y boca.
// Fuentes: Smithsonian (Ask Smithsonian), NPR, Ohio State Wexner Medical Center.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-25-1330-nariz-frio.json OUT ../ejemplos/2026-11-25-1330-nariz-frio.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, AZUL = 0x3d9bff, NARANJA = 0xff8a3d;
  const amb = c => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const calle = () => { amb(0xbfe3f5); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  // acercamiento: fondo liso azul frío con burbujitas
  const zoom = () => { amb(0xdff1ff); PM.pz(F.rect(30, 30, 0), 0xdff1ff, [0, 8, -4], null, { tinta: false, papel: false });
    for (const [x, y, r] of [[-1.1, 2.6, .4], [1.15, 2.2, .35], [1.0, -.2, .25]]) PM.det(F.circ(r), 0xcbe6fb, [x, y, -3.9]);
    luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const abrigado = (p, bufa = 0xff6b5b, gorro = 0xff6b5b) => { p.bufa = PM.bufanda(p, bufa); PM.gorro([0, 0, .05], gorro, {}, p.head); p.vaho = PM.aliento([.3, -.27, .05], p.head); return p; };
  const amigo = (pos, o = {}) => PM.chibi(pos, { ropa: 0xff8a3d, pantalon: 0x2b2f4a, tenis: 0xffc83d, colPelo: 0x1d1410, lentes: 0x2b2f4a, boca: 'feliz', ...o });
  const mano = (p, i) => p.brazos[i].children.find(c => Math.abs(c.position.y + .5) < 1e-6 && Math.abs(c.position.x) < 1e-6);
  // diagrama de la nariz en corte + chibi chiquito que explica
  const diagrama = (self) => { zoom();
    self.n = PM.narizCorte([-.4, 1.235, .3]); self.n.scale.setScalar(.74);
    self.p = PM.chibi([1.05, .27, .45], { logo: true, boca: 'abierta', mira: -1, escala: .45 }); };

  // ---------- 1 · gancho: hace frío y la gotita le cuelga de la nariz ----------
  escena('gancho', {
    setup() { calle();
      this.p = abrigado(PM.chibi([0, .02, .3], { logo: true, boca: 'abierta', mira: 0, escala: .9 }), 0x2ec4a6, 0x2ec4a6);
      this.g = PM.gotaNariz(this.p);
      this.cp = PM.copos({ n: 12, x0: -1.4, x1: 1.4, y0: .2, y1: 3.0 }); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('SIEMPRE') - .1, te = c.w('escurre') - .1, tn = c.w('nariz?') - .05;
      A.parpadea(this.p, t + 1.3, .3); respira(this.p, t); this.p.bufa.mece(t); this.p.vaho.update(t, 1, 1, .7, .7); this.cp.update(t, 1);
      // la gotita crece y al final cae en cámara lenta
      this.g.update(t, .3 + .7 * ease(cl((t - .2) / (te - .2))), ease(cl((t - tn - .15) / .9)));
      this.p.boca(t < tn ? 'abierta' : 'apretada'); A.preocupa(this.p, ease(cl((t - te) / .4))); habla(this.p, t);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + .25 + Math.sin(t * 3) * .05; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 - .25 - Math.sin(t * 3) * .05;
      this.p.rotation.z = Math.sin(t * 30) * .012;   // tiembla de frío
      c.ev('whoosh', .02, .4); if (t > ts) c.ev('pop', ts, .4); if (t > tn) c.ev('ding', tn + .2, .5);
      cam([0, 1.55, lerp(8.2, 7.2, ease(lt / 2.8))], [0, 1.45, 0], 34);
      if (t > te) etiqueta('¡SNIF!', [.62, 1.95, .9], lt - te, 56, '#ffd640', true);
      rotulo('¿Por qué con el frío', 'te escurre la nariz?', lt - .05, RY);
    }
  });

  // ---------- 2 · calefactor: el aire entra azul y llega naranja a los pulmones ----------
  escena('calefactor', {
    setup() { diagrama(this); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('calienta') - .1, th = c.w('humedece') - .1, tp = c.w('pulmones.') - .1;
      A.parpadea(this.p, t + .4, 1.1); respira(this.p, t, .27); habla(this.p, t);
      this.n.aire(t, ease(cl(t / .4)), 1, true); this.n.glandulas(t, .35 * ease(cl((t - th) / .5)));
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + .3; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.3 * eout(cl((t - .3) / .3)) + Math.sin(t * 4) * .05;
      this.p.boca(t > tp ? 'feliz' : 'abierta');
      c.ev('whoosh', .05, .5); if (t > tc) c.ev('pop', tc, .4); if (t > th) c.ev('pop', th, .4); if (t > tp) c.ev('ding', tp, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      etiqueta(t < th ? '¡CALEFACTOR!' : t < tp ? 'CALIENTA Y HUMEDECE' : '¡LLEGA TIBIO!', [0, 2.55, .9], lt - (t < th ? .1 : t < tp ? th : tp), t < th ? 52 : 42, t < tp ? '#ffffff' : '#ffd640', true);
      etiqueta('FRÍO', [.5, 1.32, .9], lt - .3, 34, '#3d9bff', true);
      if (t > tp - .6) etiqueta('TIBIO', [.05, -.1, .9], lt - tp + .6, 34, '#ff8a3d', true);
      rotulo('Tu nariz calienta', 'y humedece el aire', lt - .05, RY);
    }
  });

  // ---------- 3 · gotitas: con aire seco suelta más agua y el aliento se vuelve gotitas en la punta ----------
  escena('gotitas', {
    setup() { diagrama(this); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('seco') - .1, tag = c.w('agua,') - .1, tal = c.w('aliento') - .15, tg = c.w('gotitas') - .1;
      A.parpadea(this.p, t + 2.1, .6); respira(this.p, t, .27); habla(this.p, t);
      const sale = t > tal;
      this.n.aire(t, sale ? ease(cl((t - tal) / .3)) : 1 - ease(cl((t - tal + .3) / .3)) * 0, sale ? -1 : 1, true);
      this.n.glandulas(t, ease(cl((t - ts) / .4)) * (sale ? .5 : 1));
      this.n.gotea(t - tg, ease(cl((t - tg + .3) / .4)));
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + .3; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.3 + Math.sin(t * 4) * .05;
      this.p.boca(t > tg ? 'apretada' : 'abierta'); A.preocupa(this.p, ease(cl((t - tg) / .4)));
      c.ev('whoosh', .05, .4); if (t > tag) c.ev('pop', tag, .5); if (t > tal) c.ev('whoosh', tal, .5); if (t > tg) c.ev('ding', tg + .3, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      const lab = t < tag ? ['FRÍO Y SECO', 0, '#ffffff', 46] : t < tal ? ['¡SUELTA MÁS AGUA!', tag, '#ffd640', 42] : t < tg ? ['ALIENTO CALIENTITO', tal, '#ffffff', 40] : ['¡GOTITAS!', tg, '#ffd640', 54];
      etiqueta(lab[0], [0, 2.55, .9], lt - lab[1], lab[3], lab[2], true);
      rotulo(t < tal ? 'Con frío seco suelta' : 'Tu aliento se vuelve', t < tal ? 'más agua' : 'gotitas en la punta', lt - (t < tal ? .05 : tal), RY);
    }
  });

  // ---------- 4 · truco: se sube la bufanda y el aire le llega tibio ----------
  escena('truco', {
    setup() { calle();
      this.p = abrigado(PM.chibi([-.25, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .9 }), 0x2ec4a6, 0x2ec4a6);
      this.g = PM.gotaNariz(this.p); this.bn = PM.bufandaNariz(this.p, 0x2ec4a6);
      this.fl = [0, 1, 2, 3].map(i => { const f = PM.flechaAire([0, 0, .9], null, 1.1); f.rotation.z = Math.PI; f.f = i / 4; return f; });
      this.cp = PM.copos({ n: 10, x0: -1.4, x1: 1.4, y0: .2, y1: 3.0 }); },
    update(lt, c) {
      const t = tw(lt), tt = c.w('tápala') - .15, tb = c.w('bufanda') - .1, tti = c.w('tibio.') - .1;
      A.parpadea(this.p, t + .8, 1.8); respira(this.p, t); this.p.bufa.mece(t); this.cp.update(t, 1);
      const ks = ease(cl((t - tt) / .5)); this.bn.sube(ks);
      this.p.vaho.update(t, 1 - ks, 1, .7, .7); this.g.update(t, 1 - ks, 0);
      // los dos brazos suben a jalar la bufanda y bajan
      const ka = Math.sin(Math.PI * cl((t - tt + .2) / .9));
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + .2 + 2.3 * ka; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 - .2 - 2.3 * ka;
      this.p.boca(t > tti ? 'feliz' : 'abierta'); if (ks < .5) habla(this.p, t);
      this.p.head.rotation.z = this.p.head.r0 + (ks > .5 ? Math.sin(t * 3) * .04 : 0);
      // flechitas de aire que llegan a la cara: azules; con la bufanda se vuelven naranjas al cruzarla
      const yN = 1.5;
      this.fl.forEach(f => { const q = (t * .55 + f.f) % 1, x = lerp(1.35, .18, q); f.position.set(x, yN + Math.sin(q * 6 + f.f * 9) * .05, .9);
        f.scale.setScalar(Math.max(.001, 1.1 * Math.min(1, q * 6, (1 - q) * 6)));
        f.color(ks > .5 ? PM_mez(AZUL, NARANJA, cl((.7 - x) / .35)) : AZUL); });
      c.ev('whoosh', .05, .4); if (t > tt) c.ev('whoosh', tt, .5); if (t > tb) c.ev('pop', tb + .2, .5); if (t > tti) c.ev('ding', tti, .6);
      cam([0, 1.3, 9.0], [0, 1.25, 0], 34);
      if (t > tb) etiqueta(t < tti ? '¡BUFANDA ARRIBA!' : '¡AIRE MÁS TIBIO!', [0, 2.55, .9], lt - (t < tti ? tb : tti), 44, '#ffd640', true);
      rotulo('Truco: tápala con', 'la bufanda', lt - .05, RY);
    }
  });

  // ---------- 5 · remate: el amigo que siempre anda con el pañuelo ----------
  escena('remate', {
    setup() { calle();
      this.p = abrigado(PM.chibi([-.85, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .72 }), 0x2ec4a6, 0x2ec4a6);
      this.a = abrigado(amigo([.5, .02, .3], { escala: .78, mira: -1, boca: 'apretada' }), 0xff6b5b, 0x7b5cff);
      this.ga = PM.gotaNariz(this.a);
      const h = mano(this.a, 0); this.pa = group([0, -.05, .06], h);
      PM.pz(F.rect(.3, .3, .05), 0xffffff, [0, -.05, 0], this.pa, { tinta: .012, papel: .03 }); PM.det(F.rect(.3, .04, .01), 0x8fd3ff, [0, -.12, .016], this.pa);
      this.pa.rotation.z = .3; },
    update(lt, c) {
      const t = tw(lt), ts = c.w('siempre') - .1, tpa = c.w('pañuelo') - .1;
      A.parpadea(this.p, t + 1.6, .5); A.parpadea(this.a, t + .3, 1.4); respira(this.p, t); respira(this.a, t, .02, 1.1);
      this.p.bufa.mece(t); this.a.bufa.mece(t + 1); this.p.vaho.update(t, 1, 1, .6, .6); this.a.vaho.update(t + .4, 1, -1, .6, .6);
      // el amigo se limpia la nariz con el pañuelo una y otra vez
      const lim = Math.max(0, Math.sin((t - .3) * 4.2)); const arriba = t > .3 ? lim : 0;
      this.a.brazos[0].rotation.z = this.a.brazos[0].r0 + .5 + 2.0 * arriba; this.a.brazos[1].rotation.z = this.a.brazos[1].r0 + .15;
      this.ga.update(t, (1 - arriba) * (.6 + .4 * ((t * .6) % 1)), 0);
      this.a.boca('apretada'); A.preocupa(this.a, 1); this.a.head.rotation.z = this.a.head.r0 + arriba * .08;
      // el protagonista se ríe y lo señala
      this.p.boca(t > ts ? 'abierta' : 'feliz'); habla(this.p, t);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.25 * eout(cl((t - ts) / .3)) + Math.sin(t * 9) * .06 * (t > ts ? 1 : 0);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .2 - Math.sin(t * 9) * .05;
      c.ev('whoosh', .05, .4); if (t > ts) c.ev('pop', ts, .4); if (t > tpa) c.ev('ding', tpa, .6);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.4))], [0, 1.15, 0], 34);
      if (t > ts) etiqueta('¡SNIF, SNIF!', [.45, 2.45, .9], lt - ts, 46, '#ffd640', true);
      rotulo('Mándaselo al del', 'pañuelo en la mano', lt - .05, RY);
    }
  });
  P.cierre();
  function PM_mez(a, b, k) { return new THREE.Color(a).lerp(new THREE.Color(b), k).getHex(); }
}
