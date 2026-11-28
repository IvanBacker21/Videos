// Short 28-nov 13:30 · CARTULINA CHIBI (pedido de un seguidor): ¿por qué graniza (aunque haga calor)?
// En la parte alta de las nubes de tormenta (cumulonimbos) hace muchísimo frío, bajo cero, aunque abajo haga calor. Las corrientes
// de aire que suben llevan gotitas hasta allá, se congelan, caen y el viento las vuelve a subir; en cada vuelta se les pega otra capa
// de hielo (por eso un granizo partido tiene capas como cebolla) hasta que pesa más de lo que el viento aguanta y cae.
// Fuentes: NASA GPM (How does hail form?), NOAA (How does hail form), Met Office (Hail), N+ (¿Qué es el granizo y cómo se forma?).
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-28-1330-granizo.json OUT ../ejemplos/2026-11-28-1330-granizo.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600;
  const dia = () => { ambiente({ top: 0xbfe3f5, bottom: 0xbfe3f5, fog: 0xbfe3f5, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  // interior de la nube de tormenta: fondo gris azulado con bolas de nube alrededor y copitos de frío arriba
  const dentroNube = () => { ambiente({ top: 0x8696bf, bottom: 0x8696bf, fog: 0x8696bf, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    PM.pz(F.rect(30, 30, 0), 0x8a9ac2, [0, 10, -3], null, { tinta: false, papel: false });
    PM.pz(F.rect(30, 1.6, 0), 0xa3b3d8, [0, 2.9, -2.9], null, { tinta: false, papel: false });                                      // franja fría de arriba
    [[-1.7, 3.4, 1.3], [0, 3.6, 1.5], [1.7, 3.3, 1.2], [-1.9, 1.4, 1.1], [1.9, 1.2, 1.1], [-1.6, -.5, 1.4], [0, -.9, 1.6], [1.6, -.6, 1.3]].forEach(([x, y, s], i) =>
      sinSombra(PM.pz(F.nube(s), i < 3 ? 0xeef3fb : 0xd5ddee, [x, y, -1.4 - i * .02], null, { tinta: .02, papel: .08 })));
    const cs = [[-1.0, 2.75], [-.4, 2.95], [.35, 2.8], [1.0, 2.95], [-1.25, 2.3], [1.25, 2.35]].map(([x, y], i) => { const c = PM.pz(F.estrella(6, .08, .035), 0xffffff, [x, y, -.6], null, { tinta: .01, papel: false }); c.f = i; return c; });
    luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
    return { update(t) { cs.forEach(c => { c.rotation.z = t * .8 + c.f; c.scale.setScalar(.85 + .15 * Math.sin(t * 3 + c.f)); }); } }; };
  const sol = pos => { const g = group(pos); const r = PM.pz(F.estrella(12, .36, .26), 0xffa53d, [0, 0, 0], g, { tinta: .012, papel: .04 }); PM.pz(F.circ(.24), 0xffd640, [0, 0, .02], g, { tinta: .012, papel: false }); g.rayos = r; return g; };
  const sinSombra = g => { g.traverse(m => { if (m.isMesh) m.castShadow = false; }); return g; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  // flechas de viento que suben en una columna. g.update(t, k)
  const viento = (x, y0, y1, n = 4, s = 1.4) => { const g = group([0, 0, .2]); const fs = Array.from({ length: n }, (_, i) => { const f = PM.flechaAire([x, 0, 0], g, s); f.rotation.z = Math.PI / 2; f.color(0xe8f6ff); f.f = i / n; return f; });
    sinSombra(g); g.update = (t, k = 1) => fs.forEach(f => { const u = (t * .7 + f.f) % 1; f.position.y = lerp(y0, y1, u); f.scale.setScalar(Math.max(.001, s * k * Math.sin(u * Math.PI))); f.position.x = x + Math.sin(t * 3 + f.f * 6) * .04; }); return g; };
  // media cebolla morada con sus capas (para comparar)
  const cebolla = pos => { const g = group(pos);
    [[.42, 0xa8417f], [.35, 0xf6e3ef], [.29, 0xc0579a], [.22, 0xf6e3ef], [.15, 0xc0579a], [.08, 0xf6e3ef]].forEach(([r, c], i) => PM.pz(F.elipse(r, r * 1.08), c, [0, 0, .012 * i], g, { tinta: i ? false : .014, papel: i ? false : .05 }));
    PM.pz(F.poly([[-.05, .42], [.05, .42], [0, .62]]), 0x7fb24a, [0, 0, -.01], g, { tinta: .01, papel: .03 }); return g; };

  // ---------- 1 · gancho: día de calor… ¡y cae granizo! ----------
  escena('gancho', {
    setup() { dia(); this.sol = sol([1.05, 2.2, -.6]);
      this.p = PM.chibi([-.25, .02, .35], { logo: true, boca: 'feliz', mira: 1, escala: .8 });
      this.oc = PM.ondasCalor([-1.05, .55, .3], null, { color: 0xff8a3d });
      this.g = PM.granizo({ n: 22, piso: .06, top: 3.4, r: .075 }); },
    update(lt, c) {
      const t = tw(lt), th = c.w('hielo') - .2, tc = c.w('calor?') - .2;
      this.sol.rayos.rotation.z = t * .5; this.oc.update(t, 1 - .6 * cl((t - th) / 1));
      this.g.update(t - th, ease(cl((t - th) / .8)), cl((t - th - .6) / 2));
      A.parpadea(this.p, t + 1.3, .3); respira(this.p, t);
      // mira al cielo sorprendido y pone la mano para ver si de verdad es hielo
      const kh = ease(cl((t - th) / .35)); A.ladea(this.p, .35 * kh, -1); this.p.boca(kh > .5 ? 'abierta' : 'feliz'); habla(this.p, t);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + lerp(.2, 1.35, kh) + Math.sin(t * 8) * .05 * kh; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - lerp(.2, .9, kh) - Math.sin(t * 8) * .05 * kh;
      A.preocupa(this.p, kh * .5); this.p.position.x = -.25 + Math.sin(t * 20) * .01 * kh;
      if (t > th) c.ev('crack', th, .5); if (t > tc) c.ev('pop', tc, .5);
      cam([0, 1.2, lerp(10.8, 10.3, ease(cl(lt / 2.8)))], [0, 1.15, 0], 34);
      if (t > th) etiqueta('¡HIELO CON CALOR!', [0, 2.6, .9], lt - th, 44, '#8fd3ff', true);
      rotulo('¿Por qué cae hielo', 'aunque haga calor?', lt - .05, RY);
    }
  });

  // ---------- 2 · frío allá arriba: la nube de tormenta está bajo cero aunque abajo haga calor ----------
  escena('frio', {
    setup() { dia(); this.sol = sol([1.25, 2.85, -1.2]);
      this.n = PM.nubeCobija([.15, 1.95, .3], { s: 1.45, color: 0xb9c3da, expr: 'feliz' }); this.n.cobija.visible = false;
      this.ta = PM.termometro([1.12, 1.5, .55], { h: .8 });
      this.cop = [[-.7, 2.45], [.85, 2.5], [-.85, 1.75], [1.0, 2.05], [.0, 2.65]].map(([x, y]) => PM.pz(F.estrella(6, .09, .04), 0xffffff, [x, y, .5], null, { tinta: .01, papel: false }));
      this.p = PM.chibi([-.75, .02, .35], { logo: true, boca: 'abierta', mira: 1, escala: .62 });
      this.tr = PM.termometro([-.12, .08, .45], { h: .6, color: 0xff4d5e, copo: false }); this.tr.nivel(.88);
      this.oc = PM.ondasCalor([-1.25, .4, .3], null, { color: 0xff8a3d }); },
    update(lt, c) {
      const t = tw(lt), tn = c.w('nubes') - .15, tm = c.w('muchísimo') - .15, tb = c.w('bajo') - .15;
      this.sol.rayos.rotation.z = t * .5; this.oc.update(t, 1); this.n.update(t);
      A.parpadea(this.n, t + .5, .9); A.parpadea(this.p, t + 1.6, .4); respira(this.p, t);
      // el termómetro de la nube se desploma hasta bajo cero; salen copitos; la nube tirita
      const kf = ease(cl((t - tm) / Math.max(.5, tb - tm + .3))); this.ta.nivel(lerp(.6, .05, kf));
      this.n.cara(kf > .4 ? 'abierta' : 'feliz'); A.preocupa?.(this.n, kf); this.n.position.x = .15 + Math.sin(t * 40) * .015 * kf;
      this.cop.forEach((q, i) => { q.scale.setScalar(pop(t, tm + i * .12, .35)); q.rotation.z = t * 1.5 + i; });
      this.n.scale.setScalar(pop(t, .05, .45));
      // el protagonista, sudando abajo, señala la nube
      const kp = ease(cl((t - tn) / .35)); this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + lerp(.2, 2.3, kp) + Math.sin(t * 6) * .05; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .2;
      A.ladea(this.p, .3 * kp, -1); habla(this.p, t); this.p.boca(t > tb ? 'abierta' : 'feliz');
      c.ev('whoosh', .05, .5); if (t > tm) c.ev('ding', tm, .5); if (t > tb) c.ev('pop', tb, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      etiqueta(t < tb ? 'NUBE DE TORMENTA' : '¡BAJO CERO!', [0, -.25, .9], lt - (t < tb ? Math.max(0, tn) : tb), t < tb ? 40 : 52, t < tb ? '#ffffff' : '#8fd3ff', true);
      rotulo('Allá arriba hace', 'muchísimo frío', lt - .05, RY);
    }
  });

  // ---------- 3 · dentro de la nube: la gotita sube, se congela, cae… y el viento la vuelve a subir ----------
  escena('sube', {
    setup() { this.n = dentroNube();
      this.v1 = viento(-.55, -.1, 2.1, 4, 2.0); this.v2 = viento(.55, -.1, 1.6, 3, 1.4);
      this.g = PM.granizoCapas([0, 0, .5], { r: .5, N: 5 }); this.g.capas(1); this.g.scale.setScalar(2.3); sinSombra(this.g); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('sube') - .2, tg = c.w('congela') - .15, tca = c.w('cae…') - .1, tv = c.w('viento', 1) - .15;
      this.n.update(t);
      // recorrido: sube por la izquierda, se congela arriba, cae por la derecha y lo vuelve a subir el viento por la izquierda
      const top = 2.0; let x, y;
      if (t < tg) { const k = ease(cl((t - ts) / (tg - ts))); x = -.55; y = lerp(.35, top, k); }
      else if (t < tca) { x = -.55 + .5 * ease(cl((t - tg) / (tca - tg))); y = top + .05 * Math.sin(t * 9); }
      else if (t < tv + .1) { const k = cl((t - tca) / (tv + .1 - tca)); x = lerp(-.05, .55, k); y = lerp(top, .55, k * k); }
      else { const k = ease(cl((t - tv - .1) / 1.8)); x = lerp(.55, -.55, Math.sin(k * Math.PI / 2)); y = lerp(.55, top, k); }
      this.g.position.set(x, y + Math.sin(t * 4) * .03, .5);
      this.g.agua(1 - ease(cl((t - tg) / .35))); this.g.rotation.z = t > tg ? Math.sin(t * 3) * .2 : 0;
      this.g.cara(t > tca && t < tv + .4 ? 'abierta' : 'feliz'); A.parpadea(this.g, t + .8, .6);
      this.v1.update(t, ease(cl((t - ts + .3) / .4)) * (t > tg && t < tv ? .5 : 1) + (t > tv ? .25 * Math.sin(cl((t - tv) / .5) * Math.PI) : 0));
      this.v2.update(t + .4, .6);
      c.ev('whoosh', Math.max(.05, ts), .6); if (t > tg) c.ev('ding', tg, .5); if (t > tca) c.ev('whoosh', tca, .4); if (t > tv) c.ev('whoosh', tv, .6);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      const et = t < tg ? ['¡SUBE CON EL VIENTO!', '#e8f6ff', Math.max(0, ts)] : t < tca ? ['¡SE CONGELA!', '#8fd3ff', tg] : t < tv ? ['…Y CAE', '#ffffff', tca] : ['¡OTRA VEZ PARA ARRIBA!', '#ffd640', tv];
      etiqueta(et[0], [0, 2.62, .9], lt - et[2], 40, et[1], true);
      rotulo(t < tv ? 'Sube, se congela' : 'Y el viento la', t < tv ? 'y cae…' : 'vuelve a subir', lt - (t < tv ? .05 : tv), RY);
    }
  });

  // ---------- 4 · capas como cebolla, hasta que pesa demasiado y cae ----------
  escena('capas', {
    setup() { this.n = dentroNube();
      this.v = viento(-.0, -.4, 1.0, 4, 2.0);
      this.g = PM.granizoCapas([0, 1.35, .5], { r: .62, N: 5 }); this.g.capas(1);
      this.c = cebolla([.98, .7, .6]); },
    update(lt, c) {
      const t = tw(lt), tv = c.w('vuelta') - .15, th = c.w('hielo,') - .1, tc = c.w('cebolla,') - .15, tp = c.w('pesa') - .15, tca = c.w('cae.') - .1;
      this.n.update(t);
      // de 1 a 5 capas: cada vuelta (sube y baja) le pega otra
      const kc = cl((t - tv) / Math.max(.6, tc - tv)); this.g.capas(1 + 4 * kc);
      const kx = cl((t - tp) / .3), kf = cl((t - tca) / .5);
      const xc = lerp(0, -.45, ease(cl((t - tc) / .35)));
      this.g.position.set(xc, 1.35 + Math.sin(t * 5.5) * .22 * (1 - kx) - .25 * kx - 2.6 * kf * kf, .5); this.g.rotation.z = Math.sin(t * 2) * .1;
      this.g.cara(t > tp ? 'preocupa' : 'feliz'); A.parpadea(this.g, t + .3, 1.1);
      this.c.scale.setScalar(pop(t, tc, .4)); this.c.position.x = lerp(.98, .85, ease(cl((t - tc) / .35))); this.c.rotation.z = Math.sin(t * 3) * .05;
      this.v.position.x = xc; this.v.update(t, 1 - .8 * kx);
      if (t > tv) c.ev('pop', tv + .5, .4); if (t > th) c.ev('pop', th, .4); if (t > tc) c.ev('ding', tc, .5); if (t > tp) c.ev('impact', tp, .6); if (t > tca) c.ev('whoosh', tca, .6);
      cam([0, 1.2, lerp(10.4, 10.0, ease(cl(lt / 5.4)))], [0, 1.15, 0], 34);
      const et = t < tc ? ['CAPA TRAS CAPA', '#ffffff', Math.max(0, tv)] : t < tp ? ['¡COMO CEBOLLA!', '#ff8ad0', tc] : ['¡YA PESA DEMASIADO!', '#ffd640', tp];
      etiqueta(et[0], [0, 2.62, .9], lt - et[2], 42, et[1], true);
      rotulo(t < tp ? 'Capa tras capa' : 'Pesa tanto', t < tp ? 'como cebolla' : 'que cae', lt - (t < tp ? .05 : tp), RY);
    }
  });

  // ---------- 5 · remate A o B: ¿ya partiste un granizo para ver sus capas? ----------
  escena('remate', {
    setup() { dia();
      this.g = PM.granizo({ n: 8, piso: .06, top: 3.4, r: .075 });
      this.p = PM.chibi([0, .02, .35], { logo: true, boca: 'feliz', mira: 0, escala: .78 });
      this.ls = [[0, 'SÍ, YA LO HICE', 0x3d9bff, '#2b5fd6'], [1, 'NUNCA', 0xff6b5b, '#e0453a']].map(([i, tx, b, ti]) => { const br = this.p.brazos[i];
        const h = group([0, -.5, .08], br); PM.pz(F.rect(.06, 1.0, .02), 0xc8a06a, [0, .5, -.01], h, { tinta: .008, papel: false });
        const L = PM.letrero([0, 1.2, .02], tx, { w: 1.45, h: .6, hilos: false, color: 0xffffff, borde: b, tinta: ti }, h); h.L = L; return h; });
      this.mini = PM.granizoCapas([.95, .22, .6], { r: .18, N: 5, expr: 'feliz' }); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('granizo') - .2, tb = c.w('capas,') - .2, tsi = c.w('sí'), tno = c.w('no?');
      this.g.update(t, .35, 1); A.parpadea(this.p, t + 1.1, .4); respira(this.p, t); A.parpadea(this.mini, t + .5, .8);
      const th = [ta, tb]; this.ls.forEach((h, i) => { const br = this.p.brazos[i], s = i ? 1 : -1, k = ease(cl((t - th[i] + .15) / .3));
        br.rotation.z = br.r0 + s * lerp(.15, 1.9, k) + Math.sin(t * 5 + i) * .04 * k; h.rotation.z = -br.rotation.z - s * .36 * k; h.visible = k > .02; h.L.scale.setScalar(pop(t, th[i], .35) * (1 + .18 * Math.sin(cl((t - [tsi, tno][i]) / .3) * Math.PI))); h.L.rotation.z = s * .36 * k + Math.sin(t * 3 + i * 2) * .04; });
      const lado = t < tb ? -1 : 1; A.ladea(this.p, t > ta ? .35 + .1 * Math.sin(t * 3) : 0, lado); A.preocupa(this.p, t > ta ? .5 : 0);
      this.p.boca(t > tb + .4 ? 'feliz' : 'abierta'); if (t < ta) habla(this.p, t);
      this.mini.scale.setScalar(pop(t, .1, .4)); this.mini.rotation.z = Math.sin(t * 3) * .1;
      if (t > ta) c.ev('pop', ta, .6); if (t > tb) c.ev('pop', tb, .6); if (t > tsi) c.ev('ding', tsi, .4); if (t > tno) c.ev('ding', tno, .4);
      cam([0, 1.2, lerp(10.4, 10.0, ease(cl(lt / 3.6)))], [0, 1.15, 0], 34);
      rotulo('¿Ya partiste un granizo', 'para ver sus capas?', lt - .05, RY);
    }
  });
  P.cierre();
}
