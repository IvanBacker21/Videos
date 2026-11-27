// Short 27-nov 13:30 · CARTULINA CHIBI: ¿por qué SIEMPRE te piden el modo avión al volar?
// Mito: el celular no tumba el avión. Allá arriba busca señal a toda potencia y con muchas antenas a la vez (por eso la FCC lo
// restringió en 1991) y muchos celulares juntos pueden meter un zumbido en los audífonos de los pilotos. La regla es precaución.
// Fuentes: Popular Science, Lonely Planet, CBS News, Britannica.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-27-1330-modo-avion.json OUT ../ejemplos/2026-11-27-1330-modo-avion.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600;
  const cabina = (o = {}) => { ambiente({ top: 0xeef0f5, bottom: 0xeef0f5, fog: 0xeef0f5, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    const c = PM.avionCabina(o); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); return c; };
  const cielo = () => { ambiente({ top: 0xbfe3f5, bottom: 0xbfe3f5, fog: 0xbfe3f5, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const sinSombra = g => { g.traverse(m => { if (m.isMesh) m.castShadow = false; }); return g; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const piloto = (pos, o = {}) => PM.chibi(pos, { ropa: 0xf4f4f4, pantalon: 0x2a3f7a, tenis: 0x2b2f4a, colPelo: 0x2a1c14, boca: 'feliz', escala: .66, ...o });
  // casita de pueblo (pared, techo de dos aguas, puerta y ventanita)
  const casita = (pos, col, s = 1) => { const g = group(pos); g.scale.setScalar(s);
    PM.pz(F.rect(.5, .42, .03), col, [0, .21, 0], g, { tinta: .012, papel: .04 }); PM.pz(F.poly([[-.32, .4], [.32, .4], [0, .66]]), 0xd9534a, [0, 0, .01], g, { tinta: .012, papel: .04 });
    PM.det(F.rect(.1, .18, .02), 0x8a5a3a, [-.1, .09, .016], g); PM.det(F.rect(.11, .1, .02), 0x8fd3ff, [.11, .25, .016], g); return g; };
  // pulsos de señal que viajan del celular a un punto (bolitas amarillas en fila). g.update(t, k)
  const rayo = (a, b, n = 6) => { const g = group([0, 0, 0]), bs = [];
    for (let i = 0; i < n; i++) bs.push(PM.pz(F.circ(.035), 0xffd640, [0, 0, 0], g, { tinta: .008, papel: .02 }));
    g.update = (t, k) => bs.forEach((q, i) => { const u = ((t * 1.3 + i / n) % 1); q.visible = k > .02 && u < k + .001;
      q.position.set(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u)); q.scale.setScalar(Math.max(.001, k * (1 - u * .35))); });
    g.update(0, 0); return g; };

  // ---------- 1 · gancho: en el avión, la sobrecargo señala el letrero de MODO AVIÓN ----------
  escena('gancho', {
    setup() { this.c = cabina({ ventanas: [-1.25, .25, 1.75] });
      this.a = this.c.asiento(-.55); this.p = this.a.sienta(PM.chibi([0, 0, 0], { logo: true, boca: 'abierta', mira: 1, escala: .7 }));
      this.cel = PM.celular([0, -.62, .12], { h: .55, pct: 80 }, this.p.brazos[1]);
      this.s = PM.chibi([.8, .02, .45], { ropa: 0x2a3f7a, falda: 0x2a3f7a, pantalon: 0x2a3f7a, tenis: 0x2b2f4a, pelo: 'chongo', colPelo: 0x5a3420, boca: 'feliz', mira: -1, escala: .72, aretes: 0xffd640 });
      PM.pz(F.poly([[-.16, 1.12], [.16, 1.12], [0, .98]]), 0xff5b5b, [0, 0, .05], this.s, { tinta: .008, papel: false });          // pañoleta
      this.l = PM.letrero([.2, 2.28, .6], 'MODO AVIÓN', { w: 1.3, h: .42, color: 0xffffff, borde: 0x3d6bff, tinta: '#2b5fd6' });
    },
    update(lt, c) {
      const t = tw(lt), tav = c.w('avión') - .15;
      this.c.update(t); A.parpadea(this.p, t + 1.3, .4); A.parpadea(this.s, t + .4, 1.7); respira(this.s, t, .02, .8);
      this.p.position.y = .18 + Math.abs(Math.sin(t * 2.6)) * .015;
      // el protagonista ve su cel y luego voltea al letrero, sorprendido
      const br = this.p.brazos[1], kv = ease(cl((t - tav + .3) / .4));
      br.rotation.z = br.r0 + 1.35 + Math.sin(t * 3) * .04; this.cel.rotation.z = -br.rotation.z; this.cel.position.y = -.62;
      A.ladea(this.p, lerp(-.25, .3, kv), 1); this.p.boca(t > tav ? 'abierta' : 'feliz'); habla(this.p, t);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .15;
      // la sobrecargo señala el letrero y luego el cel
      const sb = this.s.brazos[0], ks = ease(cl((t - .15) / .35));
      sb.rotation.z = sb.r0 - lerp(.2, 2.5, ks) + Math.sin(t * 6) * .06; this.s.brazos[1].rotation.z = this.s.brazos[1].r0 + .15;
      A.ladea(this.s, .25 * ks, -1); this.s.boca(t > .3 && t < tav + .6 ? 'abierta' : 'feliz'); habla(this.s, t, 1);
      this.l.scale.setScalar(pop(t, .1, .4)); this.l.columpia(t, .05);
      c.ev('pop', .1, .5); if (t > tav) c.ev('ding', tav, .6);
      cam([0, 1.2, lerp(10.8, 10.3, ease(cl(lt / 3)))], [0, 1.15, 0], 34);
      rotulo('¿Por qué SIEMPRE piden', 'el modo avión?', lt - .05, RY);
    }
  });

  // ---------- 2 · mito: el cel le manda ondas al avión… y el avión ni se inmuta ----------
  escena('mito', {
    setup() { cielo();
      this.av = PM.estelaAvion([0, 1.95, .2], { escala: .8, color: 0x3d6bff });
      this.cel = sinSombra(PM.celular([-.82, .75, .6], { h: .85, pct: 80, cara: 'feliz' }));
      this.o = sinSombra(PM.ondas([-.55, 1.05, .62], 1, 0xffd640)); this.o.rotation.z = .75;
      this.ic = group([.72, .85, .7]); const mini = PM.estelaAvion([0, 0, 0], { escala: .62, color: 0xff6b5b }); this.ic.add(mini); mini.position.set(0, 0, 0); mini.rotation.z = -.65; this.mini = mini;
      [[-.42, .38], [-.52, .24], [-.36, .5]].forEach(([x, y]) => PM.pz(F.rect(.26, .035, .017), 0xffffff, [x, y, -.02], this.ic, { tinta: .008, papel: false, rot: -.6 }));
      this.x = PM.marca([.3, -.22, .16], false, .7, this.ic); sinSombra(this.ic); },
    update(lt, c) {
      const t = tw(lt), tt = c.w('tumbar') - .15;
      this.av.position.x = lerp(-.45, .45, t / 3); this.av.position.y = 1.95 + Math.sin(t * 2.2) * .02; this.av.update(t, cl(t / 3.2) * .55 + .1, 1, 0);
      A.parpadea(this.av, t + .6, 1.1); A.parpadea(this.mini, t + .2, .7); A.parpadea(this.cel, t + 1.4, .3);
      this.cel.rotation.z = Math.sin(t * 30) * .03; this.cel.position.y = .75 + Math.sin(t * 3) * .02;
      this.o.update(t, 1);
      // a "tumbar": el avioncito cayendo aparece… y lo tacha una X
      this.ic.scale.setScalar(pop(t, tt, .4)); this.x.scale.setScalar(.7 * pop(t, tt + .35, .35)); this.ic.rotation.z = Math.sin(t * 5) * .04;
      c.ev('whoosh', .05, .6); if (t > tt) c.ev('pop', tt, .5); if (t > tt + .35) c.ev('crack', tt + .35, .6);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      etiqueta('¡MITO!', [0, 2.62, .9], lt - .05, 64, '#ff5b5b', true);
      rotulo('Tu cel NO tumba', 'el avión', lt - .05, RY);
    }
  });

  // ---------- 3 · antenas: allá arriba el cel grita buscando señal… y le contestan muchas torres a la vez ----------
  escena('antenas', {
    setup() { cielo();
      this.casas = [[-.78, -1.1, 0xffc83d], [.05, -1.25, 0xff8a5b], [.8, -1.1, 0x9b6bff], [-1.45, -1.3, 0x2ec4a6], [1.5, -1.3, 0xff6b9b]].map(([x, z, col]) => casita([x, .03, z], col, .75));
      this.tor = [-1.15, -.4, .42, 1.18].map((x, i) => PM.torreCel([x, .03, -.6 + (i & 1) * .1], { escala: .46 }));
      this.av = PM.estelaAvion([0, 2.0, .1], { escala: .72, color: 0x3d6bff });
      this.cel = PM.celular([.02, 1.5, .7], { h: .46, pct: 80, cara: 'feliz' });
      this.z = PM.zumbido([.02, 1.5, .72], { r: .2, alto: .26, color: 0xffd640 });
      this.r = this.tor.map(tw_ => { const tp = [tw_.position.x, tw_.position.y + (1.5 + .1) * .46, tw_.position.z]; return rayo([.02, 1.3, .68], tp, 6); }); },
    update(lt, c) {
      const t = tw(lt), tb = c.w('busca') - .15, tm = c.w('muchas') - .15;
      this.av.position.x = lerp(-.25, .25, t / 4.4); this.av.position.y = 2.0 + Math.sin(t * 2.2) * .02; this.av.update(t, 0);
      this.cel.position.x = this.av.position.x * .4 + .02; A.parpadea(this.av, t + .3, .8); A.parpadea(this.cel, t + 1.1, .5);
      // a "busca": el cel tiembla a todo lo que da; a "muchas": señal a TODAS las torres a la vez
      const kb = ease(cl((t - tb) / .3)), km = ease(cl((t - tm) / .5));
      this.cel.rotation.z = Math.sin(t * 38) * .05 * kb; this.cel.cara(kb > .5 ? 'triste' : 'feliz'); this.cel.scale.setScalar(1 + .08 * kb);
      this.z.position.x = this.cel.position.x; this.z.update(t, kb);
      this.r.forEach((r, i) => r.update(t + i * .17, i === 1 ? Math.max(kb * .9, km) : km));
      this.tor.forEach((q, i) => q.update(t + i * .4, i === 1 ? Math.max(kb, km) : km));
      c.ev('whoosh', .05, .5); if (t > tb) c.ev('zap', tb, .5); if (t > tm) c.ev('ding', tm, .6);
      cam([0, 1.2, lerp(10.5, 10.2, ease(cl(lt / 4.4)))], [0, 1.15, 0], 34);
      etiqueta(t < tm ? '¡SEÑAL A TODO LO QUE DA!' : '¡MUCHAS ANTENAS A LA VEZ!', [0, 2.62, .9], lt - (t < tm ? Math.max(0, tb) : tm), 38, t < tm ? '#ffd640' : '#2ec4a6', true);
      rotulo('Allá arriba busca señal', 'a todo lo que da', lt - .05, RY);
    }
  });

  // ---------- 4 · zumbido: los pilotos oyen BZZZ en sus audífonos · como la bocina junto al cel ----------
  escena('zumbido', {
    setup() { ambiente({ top: 0x4a5068, bottom: 0x4a5068, fog: 0x4a5068, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
      PM.pz(F.rect(30, 30, 0), 0x50566e, [0, 15, -3], null, { tinta: false, papel: false }); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
      // parabrisas de la cabina de mando con cielo y nubes que pasan
      this.nb = [];
      for (const sx of [-1, 1]) { const v = group([sx * .78, 2.05, -2.6]);
        PM.pz(F.poly([[-.66, -.55], [.66, -.55], [.56, .5], [-.5, .5]].map(([x, y]) => [x * sx, y])), 0x2b2f4a, [0, 0, 0], v, { tinta: .016, papel: .05 });
        PM.pz(F.poly([[-.58, -.48], [.58, -.48], [.5, .43], [-.44, .43]].map(([x, y]) => [x * sx, y])), 0x8fd3ff, [0, 0, .016], v, { tinta: .01, papel: false });
        for (let i = 0; i < 2; i++) { const n = PM.det(F.nube(.16), 0xffffff, [0, -.15 + i * .3, .03], v); n.f = i * .5 + sx * .2; this.nb.push(n); } }
      // tablero con pantallitas y botones (va DELANTE de los pilotos)
      const tb = PM.pz(F.rect(3.8, .85, .14), 0x3a3f55, [0, .22, .7], null, { tinta: .016, papel: .06 });
      [[-1.2, .15], [-.35, .2], [.35, .2], [1.2, .15]].forEach(([x, y]) => { PM.pz(F.rect(.42, .3, .05), 0x1d2233, [x, y, .016], tb, { tinta: false, papel: false }); PM.det(F.rect(.34, .22, .04), 0x2ec4a6, [x, y, .03], tb); });
      this.bt = [-1.5, -.8, -.6, .0, .6, .8, 1.5].map((x, i) => PM.det(F.circ(.04), [0xff5b5b, 0xffd640, 0x7dff8a][i % 3], [x, -.25, .02], tb));
      this.ps = [piloto([-.62, .3, .3], { mira: 1, escala: .74 }), piloto([.62, .3, .3], { escala: .74, mira: -1, pelo: 'cola', colPelo: 0x6b4a2e })];
      this.au = this.ps.map(p => PM.audifonos(p));
      // B: tarjeta de "como cuando…": bocina con el cel al lado
      this.B = group([0, 1.35, 1.4]);
      PM.pz(F.rect(2.3, 1.45, .12), 0xfff6e0, [0, 0, 0], this.B, { tinta: .018, papel: .07 });
      const bo = this.bo = group([-.38, -.08, .03], this.B); PM.pz(F.rect(.62, .95, .1), 0x2b2f4a, [0, 0, 0], bo, { tinta: .014, papel: .04 });
      for (const [y, r] of [[.2, .2], [-.24, .14]]) { PM.pz(F.circ(r), 0x4a5068, [0, y, .016], bo, { tinta: .01, papel: false }); PM.det(F.circ(r * .45), 0x1d2233, [0, y, .03], bo); }
      this.bz = PM.zumbido([-.38, -.08, .05], { r: .5, alto: .5, color: 0xff5b5b }, this.B);
      this.cel = PM.celular([.5, -.08, .06], { h: .62, pct: 80, cara: 'feliz' }, this.B); },
    update(lt, c) {
      const t = tw(lt), tz = c.w('zumbido') - .15, tc = c.w('como') - .1;
      this.nb.forEach(n => { const u = ((t * .25 + n.f) % 1 + 1) % 1; n.position.x = (u - .5) * .7; n.scale.setScalar(Math.max(.001, Math.min(1, (.38 - Math.abs(n.position.x)) / .12))); });
      this.bt.forEach((b, i) => b.visible = Math.sin(t * (5 + i) + i) > -.4);
      // a "zumbido": BZZZ en los audífonos; los dos pilotos hacen mueca y se tapan las orejas
      const kz = ease(cl((t - tz) / .3));
      this.ps.forEach((p, i) => { A.parpadea(p, t + i * 1.3, .5 + i); p.position.y = .3 + Math.abs(Math.sin(t * 2.6 + i)) * .015;
        const s = i ? -1 : 1; this.au[i].update(t + i, kz);
        p.brazos[0].rotation.z = p.brazos[0].r0 - lerp(.15, 2.75, kz) + Math.sin(t * 9 + i) * .05 * kz; p.brazos[1].rotation.z = p.brazos[1].r0 + lerp(.15, 2.75, kz) - Math.sin(t * 9 + i) * .05 * kz;
        A.preocupa(p, kz); p.boca(kz > .5 ? 'apretada' : (t > 1 ? 'abierta' : 'feliz')); p.position.x = s * -.62 + Math.sin(t * 30 + i) * .012 * kz; if (kz < .5) habla(p, t, i); else p.head.rotation.z = p.head.r0 + Math.sin(t * 24 + i) * .04; });
      // B: aparece la tarjeta; el cel se acerca a la bocina y suena el BZZ-BZZ
      const kB = pop(t, tc, .45); this.B.visible = t > tc; this.B.scale.setScalar(kB); this.B.rotation.z = Math.sin(t * 2.5) * .02;
      const kc = ease(cl((t - tc - .35) / .5)); this.cel.position.x = lerp(.62, .2, kc); this.cel.rotation.z = -.15 * kc;
      this.bz.update(t, cl((t - tc - .7) / .15)); this.bo.position.x = -.38 + Math.sin(t * 50) * .01 * cl((t - tc - .7) / .15); this.cel.cara(kc > .8 ? 'triste' : 'feliz'); A.parpadea(this.cel, t + .7, .9);
      c.ev('whoosh', .05, .4); if (t > tz) c.ev('zap', tz, .6); if (t > tc) c.ev('pop', tc, .5); if (t > tc + .7) c.ev('zap', tc + .7, .5);
      cam([0, 1.45, lerp(9.0, 8.6, ease(cl(lt / 5.9)))], [0, 1.4, 0], 34);
      if (t < tc) etiqueta(t < tz ? 'SI MUCHOS LO HACEN…' : '¡BZZZZZ!', [0, 2.62, .9], lt - (t < tz ? .1 : tz), t < tz ? 40 : 60, t < tz ? '#ffffff' : '#ff5b5b', true);
      else etiqueta('¡BZZ-BZZ!', [0, 2.62, .9], lt - tc - .7, 52, '#ff5b5b', true);
      rotulo(t < tc ? 'Los pilotos oyen' : 'Como la bocina', t < tc ? 'un zumbido' : 'cerca del cel', lt - (t < tc ? .05 : tc), RY);
    }
  });

  // ---------- 5 · remate A o B: ¿sí lo pones en modo avión o se te olvida? ----------
  escena('remate', {
    setup() { this.c = cabina({ ventanas: [-1.3, 1.3] });
      this.a = this.c.asiento(0); this.p = this.a.sienta(PM.chibi([0, 0, 0], { logo: true, boca: 'feliz', mira: 0, escala: .7 }));
      this.ls = [[0, 'SÍ, MODO AVIÓN', 0x3d6bff, '#2b5fd6'], [1, 'SE ME OLVIDA', 0xff6b5b, '#e0453a']].map(([i, tx, b, ti]) => { const br = this.p.brazos[i];
        const h = group([0, -.5, .08], br); PM.pz(F.rect(.06, 1.0, .02), 0xc8a06a, [0, .5, -.01], h, { tinta: .008, papel: false });
        const L = PM.letrero([0, 1.2, .02], tx, { w: 1.8, h: .7, hilos: false, color: 0xffffff, borde: b, tinta: ti }, h); h.L = L; return h; }); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('avión') - .2, to = c.w('olvida') - .2;
      this.c.update(t); A.parpadea(this.p, t + 1.1, .4); this.p.position.y = .18 + Math.abs(Math.sin(t * 2.6)) * .015;
      const th = [ta, to]; this.ls.forEach((h, i) => { const br = this.p.brazos[i], s = i ? 1 : -1, k = ease(cl((t - th[i] + .15) / .3));
        br.rotation.z = br.r0 + s * lerp(.15, 1.9, k) + Math.sin(t * 5 + i) * .04 * k; h.rotation.z = -br.rotation.z - s * .5 * k; h.visible = k > .02; h.L.scale.setScalar(pop(t, th[i], .35)); h.L.rotation.z = s * .5 * k + Math.sin(t * 3 + i * 2) * .04; });
      const lado = t < to ? -1 : 1; A.ladea(this.p, t > ta ? .35 + .1 * Math.sin(t * 3) : 0, lado); A.preocupa(this.p, t > ta ? .6 : 0);
      this.p.boca(t > to + .4 ? 'apretada' : 'abierta'); if (t < ta) habla(this.p, t);
      if (t > ta) c.ev('pop', ta, .6); if (t > to) c.ev('pop', to, .6);
      cam([0, 1.2, lerp(10.4, 10.0, ease(cl(lt / 3.6)))], [0, 1.15, 0], 34);
      rotulo('¿Modo avión', 'o se te olvida?', lt - .05, RY);
    }
  });
  P.cierre();
}
