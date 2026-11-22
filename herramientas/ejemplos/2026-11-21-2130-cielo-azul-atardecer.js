// Short 21-nov 21:30 (PRUEBA LARGO 40 s) · CARTULINA CHIBI: ¿por qué el cielo es azul y el atardecer naranja?
// No es el reflejo del mar: la luz del Sol trae todos los colores y las moléculas del aire desvían mucho más el azul (dispersión de
// Rayleigh); el violeta se desvía aún más, pero el Sol manda menos y el ojo es poco sensible a él; las nubes tienen gotitas grandes que
// desvían todos los colores por igual (blancas); al atardecer la luz cruza mucha más atmósfera, el azul se pierde y llegan naranjas y
// rojos; en Marte el polvo fino hace el cielo rojizo y los atardeceres azulados.
// Fuentes: NASA Space Place (Why is the sky blue?), Royal Museums Greenwich (Why is the sky blue?), NPR (A most peculiar sunset, Marte).
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-21-2130-cielo-azul-atardecer.json OUT ../ejemplos/2026-11-21-2130-cielo-azul-atardecer.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw, tubo } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, AMARILLO = 0xffc83d, MORADO = 0x7b5cff, ROJO = 0xff4d5e, AZUL = 0x3d7bff, VIOLETA = 0x9b5cff, VERDE = 0x2ec4a6;
  const CIELO = 0x8fd0f5, HOR = 0xc4e9fb, CIELO_T = 0xff9a5c, HOR_T = 0xffd36b, SOL = 0xffd640, SOL_T = 0xff8a3d;
  const mezc = (a, b, k) => new THREE.Color(a).lerp(new THREE.Color(b), cl(k)).getHex();
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  // material propio (para cambiar de color cuadro a cuadro sin pintar las demás piezas del mismo color)
  const clona = g => { g.traverse(o => { if (o.isMesh) o.material = o.material.clone(); }); return g; };
  const pinta = (g, c) => g.children[0].material.color.setHex(c);
  // ---------- azotea en México: cielo que cambia de color, edificios con tinacos y pretil ----------
  const set = () => {
    ambiente({ top: 0xbfe3f5, bottom: 0xbfe3f5, fog: 0xbfe3f5, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
    const cielo = clona(PM.det(F.rect(30, 30, 0), CIELO, [0, 8, -4.2])), hor = clona(PM.det(F.rect(30, 1.6, 0), HOR, [0, 1.15, -4.1]));
    const nubes = [[-1.2, 3.0, .7], [1.3, 2.75, .55]].map(([x, y, s]) => PM.pz(F.nube(s * 1.6), 0xffffff, [x, y, -3.6], null, { tinta: .02, papel: .08 }));
    let sm = 9; const rnd = () => (sm = (sm * 16807) % 2147483647) / 2147483647;
    const cols = [0xf3c08a, 0xe89a8a, 0xa9bde0, 0xf6dfa8, 0xc7a3d6, 0x9fd3c0];
    let x = -3.0, i = 0;
    while (x < 3.0) { const w = .5 + rnd() * .4, h = .55 + rnd() * .6, c = cols[i % cols.length];
      const ed = PM.pz(F.rect(w, h, .015), c, [x + w / 2, h / 2, -2.6 - (i % 2) * .06], null, { tinta: .016, papel: .05 });
      for (let k = 0; k < 2; k++) for (let r = 0; r < (h > .8 ? 2 : 1); r++) PM.det(F.rect(.1, .12, .01), 0xfff3d6, [(k - .5) * w * .45, h * .2 - r * .28, .016], ed);
      if (i % 2 === 0) { const tq = PM.pz(F.rect(.2, .22, .04), 0x2b2f4a, [(rnd() - .5) * w * .4, h / 2 + .12, .01], ed, { tinta: .012, papel: .03 });   // tinaco
        PM.det(F.rect(.2, .025, .01), 0x4a4f6a, [0, .03, .016], tq); PM.det(F.elipse(.1, .03), 0x4a4f6a, [0, .11, .016], tq); }
      x += w + .05; i++; }
    PM.pz(F.rect(30, 6, 0), 0xd9cbb5, [0, -2.95, -1.7], null, { tinta: false, papel: false });                       // piso de la azotea
    PM.pz(F.rect(30, .36, .0), 0xeadfcc, [0, .18, -1.85], null, { tinta: .016, papel: false });                      // pretil
    PM.det(F.rect(30, .05, 0), 0xc9b9a0, [0, .36, -1.83]);
    for (let k = -14; k < 14; k++) { PM.det(F.rect(.5, .02, .01), 0xc9b9a0, [k * .8, -.5, -1.68]); PM.det(F.rect(.02, .9, .01), 0xc9b9a0, [k * .8 + .4, -.9, -1.68]); }
    luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
    // azul → rosado → naranja (por RGB directo pasaría por gris)
    const dos = (a, m, b, k) => k < .5 ? mezc(a, m, k * 2) : mezc(m, b, (k - .5) * 2);
    return { atardece(k) { pinta(cielo, dos(CIELO, 0xf7b8c0, CIELO_T, k)); pinta(hor, dos(HOR, 0xffd9c8, HOR_T, k)); }, cielo, hor, nubes };
  };
  // Sol de cartulina con carita; s.color(k) lo pasa de amarillo a naranja
  const sol = (pos, r = .32) => { const s = PM.astro(pos, r, SOL, { rayos: true, expr: 'feliz' }); clona(s.cuerpo); clona(s.rayos);
    s.color = k => { pinta(s.cuerpo, mezc(SOL, SOL_T, k)); pinta(s.rayos.children[0], mezc(0xffa53d, 0xff5b3d, k)); }; return s; };
  // moléculas de aire: bolitas blancas que flotan
  const aire = (n, x0, x1, y0, y1, z = .2, seed = 3) => { const g = group([0, 0, 0]); let sm = seed; const rnd = () => (sm = (sm * 16807) % 2147483647) / 2147483647;
    g.m = []; for (let i = 0; i < n; i++) { const b = PM.pz(F.circ(.05), 0xffffff, [lerp(x0, x1, rnd()), lerp(y0, y1, rnd()), z], g, { tinta: .012, papel: .02 }); b.x0 = b.position.x; b.y0 = b.position.y; b.f = rnd() * 6; g.m.push(b); }
    g.update = (t, k) => g.m.forEach((b, i) => { b.position.x = b.x0 + Math.sin(t * 2 + b.f) * .04; b.position.y = b.y0 + Math.cos(t * 2.3 + b.f) * .04; b.scale.setScalar(pop(k, i * .02, .3)); }); return g; };
  const conCel = (p, o = {}) => { const b = p.brazos[1]; const ce = PM.celular([0, -.6, .1], { h: .5, pct: 80, cara: o.cara ?? 'ninguna' }, b); ce.scale.setScalar(.001); return ce; };
  const sube = (p, ce, k, t, a = 2.0) => { const b = p.brazos[1]; b.rotation.z = lerp(b.r0, a, k) + Math.sin(t * 3) * .04 * k; ce.rotation.z = -b.rotation.z; ce.scale.setScalar(Math.max(.001, k)); };
  // señala hacia arriba a la izquierda con el brazo izquierdo
  const senala = (p, k, t) => { const b = p.brazos[0]; b.rotation.z = lerp(b.r0, -2.3, k) + Math.sin(t * 3) * .04 * k; };

  // ---------- 1 · gancho: cielo azul que se pinta de naranja mientras baja el Sol ----------
  escena('gancho', {
    setup() { this.s = set();
      this.sol = sol([-.85, 2.3, -2.2]);
      this.p = PM.chibi([.45, .02, .3], { logo: true, boca: 'abierta', mira: -1, escala: .92 });
      this.pr = PM.pregunta([1.05, 2.1, .5], .5); },
    update(lt, c) {
      const t = tw(lt), tta = c.w('tarde') - .1, tna = c.w('naranja') - .1;
      A.parpadea(this.p, t + 1.1, .3); respira(this.p, t); habla(this.p, t);
      const k = ease(cl((t - tta) / 1.4));
      this.s.atardece(k); this.sol.color(k); this.sol.position.y = lerp(2.3, 1.15, k); this.sol.rayos.rotation.z = t * .4;
      A.parpadea(this.sol, t + 2.0, .9);
      senala(this.p, eout(cl((t - .3) / .4)), t);
      this.p.boca(t > tna ? 'abierta' : 'feliz'); A.preocupa(this.p, t > tna ? .4 : 0);
      if (t > tna) A.ladea(this.p, .35, -1);
      this.pr.scale.setScalar(pop(t, tna, .35) * .5); this.pr.rotation.z = Math.sin(t * 3) * .1;
      c.ev('whoosh', .05, .4); if (t > tta) c.ev('whoosh', tta, .6); if (t > tna) c.ev('ding', tna, .5);
      cam([0, 1.2, lerp(10.9, 10.3, ease(lt / 3.5))], [0, 1.15, 0], 34);
      rotulo('¿Por qué el cielo es azul', '…y el atardecer naranja?', lt - .05, RY);
    }
  });

  // ---------- 2 · mito: dibujo del mar tachado; aparece el aire y el rayo de luz ----------
  escena('mito', {
    setup() { this.s = set();
      this.p = PM.chibi([.82, .02, .3], { logo: true, boca: 'abierta', mira: -1, escala: .85 });
      this.cu = group([-.55, 1.55, .5]);
      PM.pz(F.rect(1.05, .78, .04), 0xffffff, [0, 0, 0], this.cu, { tinta: .016, papel: .05 });
      PM.det(F.rect(.95, .68, .03), CIELO, [0, 0, .016], this.cu); PM.det(F.ola(.95, .035, -.06, 5, -.34), 0x2f7fd6, [0, 0, .02], this.cu);
      PM.det(F.ola(.95, .025, -.16, 6, -.34), 0x5aa0ea, [0, 0, .024], this.cu);
      PM.det(tubo([[.2, -.12], [.28, .12], [.3, .26]], .03, .03), 0xffffff, [0, 0, .03], this.cu); PM.det(F.poly([[.22, .24], [.38, .22], [.31, .34]]), 0xffffff, [0, 0, .03], this.cu);
      this.lt = PM.letrero([-.55, .82, .55], 'REFLEJO DEL MAR', { w: 1.25, h: .3, hilos: false, borde: AZUL });
      this.no = PM.marca([-.05, 1.85, .7], false, .7);
      this.ai = aire(16, -1.3, 1.3, 1.0, 2.5, .25, 5);
      this.sol = sol([-1.05, 2.35, .1], .26);
      this.ra = PM.rayoLuz([-1.05, 2.35, .15], { largo: 2.2, bolitas: 1 }); this.ra.rotation.z = -.5; },
    update(lt, c) {
      const t = tw(lt), tno = c.w('no') - .05, tai = c.w('aire') - .1, tlu = c.w('luz') - .15;
      A.parpadea(this.p, t + 2.2, .9); respira(this.p, t);
      this.p.head.rotation.z = this.p.head.r0 + (t < tai ? Math.sin(t * 9) * .12 : Math.sin(t * 2) * .03);
      this.p.boca(t > tai ? 'feliz' : 'abierta');
      const kf = ease(cl((t - tai) / .4));
      this.cu.scale.setScalar(Math.max(.001, pop(t, 0, .35) * (1 - kf))); this.lt.scale.setScalar(Math.max(.001, pop(t, .15, .35) * (1 - kf)));
      this.no.scale.setScalar(t > tno ? pop(t, tno, .3) * .7 * (1 - kf) + .001 : .001);
      this.cu.rotation.z = Math.sin(t * 2.2) * .03;
      this.ai.update(t, t - tai);
      this.sol.scale.setScalar(pop(t, tai + .3, .35)); this.sol.rayos.rotation.z = t * .4; A.parpadea(this.sol, t, 1.3);
      this.ra.scale.set(Math.max(.001, ease(cl((t - tlu) / .5))), 1, 1); this.ra.update(t, 0);
      c.ev('whoosh', .05, .4); if (t > tno) c.ev('impact', tno, .4); if (t > tai) c.ev('pop', tai, .4); if (t > tlu) c.ev('whoosh', tlu, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tai) etiqueta('AIRE + LUZ', [.3, -.3, .9], lt - tai, 54, '#ffd640', true);
      rotulo('No es el reflejo del mar', 'es el aire y la luz', lt - .1, RY);
    }
  });

  // ---------- 3 · rebote: el rayo blanco se abre en colores y el aire avienta el azul por todos lados ----------
  escena('rebote', {
    setup() { this.s = set(); this.s.atardece(0); pinta(this.s.cielo, 0xe9f1f4); pinta(this.s.hor, 0xf3f7f8);
      this.sol = sol([-1.05, 2.35, .1], .28);
      this.ai = aire(18, -1.3, 1.35, .7, 2.5, .22, 11);
      this.ra = PM.rayoLuz([-1.05, 2.35, .15], { largo: 2.5, bolitas: 6, abreEn: .3, abanico: .55, ancho: .16 }); this.ra.rotation.z = -.62;
      this.p = PM.chibi([1.0, .02, .3], { logo: true, boca: 'feliz', mira: -1, escala: .7 }); },
    update(lt, c) {
      const t = tw(lt), tco = c.w('colores') - .2, tai = c.w('aire') - .1, tde = c.w('desvía') - .1, tla = c.w('lados') - .1;
      A.parpadea(this.p, t + .7, 2.0); respira(this.p, t); A.parpadea(this.sol, t, 2.4); this.sol.rayos.rotation.z = t * .4;
      const ka = eout(cl((t - tco) / .45)), kr = ease(cl((t - tde) / .5)), kc = ease(cl((t - tde) / 1.6));
      this.ra.update(t, ka, [4], kr);
      this.ai.update(t, t - tai + .4);
      pinta(this.s.cielo, mezc(0xe9f1f4, CIELO, kc)); pinta(this.s.hor, mezc(0xf3f7f8, HOR, kc));
      this.p.boca(t > tde ? 'abierta' : 'feliz'); A.ladea(this.p, t > tla ? .3 : 0, -1);
      c.ev('whoosh', .05, .4); if (t > tco) c.ev('ding', tco, .5); if (t > tde) c.ev('pop', tde, .3); if (t > tde + .3) c.ev('pop', tde + .3, .3); if (t > tla) c.ev('ding', tla, .4);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 5))], [0, 1.15, 0], 34);
      if (t > tco && t < tde) etiqueta('¡TODOS LOS COLORES!', [0, -.3, .9], lt - tco, 46, '#ffffff', true);
      if (t > tde) etiqueta('¡EL AZUL REBOTA!', [0, -.3, .9], lt - tde, 50, '#ffd640', true);
      rotulo('La luz del Sol trae', '¡todos los colores!', lt - .1, RY);
    }
  });

  // ---------- 4 · violeta: el Sol manda muchas azules y pocas violetas; el ojo casi no lo ve ----------
  escena('violeta', {
    setup() { this.s = set();
      this.sol = sol([-1.05, 2.35, .1], .26);
      this.vi = PM.astro([.15, 2.15, .5], .2, VIOLETA, { expr: 'feliz' });
      this.ba = [[-.95, AZUL, 1.05], [-.45, VIOLETA, .32]].map(([x, col, h]) => { const g = group([x, .06, .5]); const b = group([0, 0, 0], g);
        PM.pz(F.rect(.36, 1, .05), col, [0, .5, 0], b, { tinta: .016, papel: .05 }); b.scale.y = .001; g.b = b; g.h = h; g.bol = PM.pz(F.circ(.09), col, [0, 0, .05], g, { tinta: .012, papel: .03 }); return g; });
      this.p = PM.chibi([.82, .02, .3], { logo: true, boca: 'abierta', mira: -1, escala: .85 }); },
    update(lt, c) {
      const t = tw(lt), tvi = c.w('violeta') - .15, tma = c.w('manda') - .1, toj = c.w('ojos') - .1, tno = c.w('notan') - .1;
      A.parpadea(this.p, t + 1.6, .4); respira(this.p, t); A.parpadea(this.vi, t + .5, 1.1); A.parpadea(this.sol, t, 2.0); this.sol.rayos.rotation.z = t * .4;
      this.vi.scale.setScalar(pop(t, tvi, .35) * (t > tno ? lerp(1, .55, ease(cl((t - tno) / .4))) : 1)); this.vi.position.y = 2.15 + Math.sin(t * 2.6) * .04;
      this.vi.cara(t > tno ? 'triste' : 'feliz');
      this.ba.forEach((g, i) => { const k = eout(cl((t - tma - i * .25) / .5)); g.b.scale.y = Math.max(.001, k * g.h); g.bol.position.y = k * g.h + .14; g.bol.scale.setScalar(pop(t, tma + i * .25, .3)); });
      habla(this.p, t);
      if (t > toj) { PM.ojos(this.p, .3); A.preocupa(this.p, .6); this.p.boca('apretada'); } else this.p.boca('abierta');
      c.ev('whoosh', .05, .4); if (t > tvi) c.ev('pop', tvi, .4); if (t > tma) c.ev('pop', tma, .3); if (t > tma + .25) c.ev('pop', tma + .25, .3); if (t > tno) c.ev('ding', tno, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tma && t < toj) etiqueta('MUCHO AZUL · POCO VIOLETA', [0, -.3, .9], lt - tma, 36, '#ffffff', true);
      if (t > toj) etiqueta('¡CASI NO LO VEO!', [0, -.3, .9], lt - toj, 50, '#ffd640', true);
      rotulo('¿Y el violeta?', 'El Sol manda menos', lt - .1, RY);
    }
  });

  // ---------- 5 · nubes: gotitas grandes (lupa) que desvían todos los colores por igual → blancas ----------
  escena('nubes', {
    setup() { this.s = set();
      this.nu = group([.2, 1.95, .3]); PM.pz(F.nube(1.45), 0xffffff, [0, 0, 0], this.nu, { tinta: .018, papel: .06 });
      this.nu.cara = group([.05, .1, .03], this.nu); this.nu.head = { ojos: [-1, 1].map(sx => { const e = PM.det(F.elipse(.04, .065), 0x2a1f2e, [sx * .13, .04, 0], this.nu.cara); PM.det(F.circ(.015), 0xffffff, [.012, .02, .004], e); return e; }) };
      this.nu.boca = PM.det(F.arco(.06, .022, Math.PI * 1.15, Math.PI * 1.85), 0x7a1f30, [0, -.03, 0], this.nu.cara);
      this.sol = sol([-1.1, 2.4, .1], .24);
      this.lu = PM.lupa([.75, .75, .7], .48, { fondo: 0xdff3fc });
      this.go = [[-.18, .12, .15], [.16, .16, .12], [.0, -.17, .14]].map(([x, y, r]) => { const g = PM.pz(F.circ(r), 0x8fd3ff, [x, y, 0], this.lu.dentro, { tinta: .012, papel: .03 }); PM.det(F.elipse(r * .3, r * .2), 0xffffff, [-r * .35, r * .4, .016], g); return g; });
      this.ai = aire(6, .45, 1.05, .45, 1.05, .78, 21);
      this.ra = PM.rayoLuz([-1.1, 2.4, .45], { largo: 1.85, bolitas: 3, abreEn: .3, abanico: .4, ancho: .15 }); this.ra.rotation.z = -.32;
      this.p = PM.chibi([-.8, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .78 }); },
    update(lt, c) {
      const t = tw(lt), tnu = c.w('nubes') - .2, tgo = c.w('gotitas') - .1, tgr = c.w('grandes') - .1, tde = c.w('desvían') - .1, tig = c.w('igual') - .1, tbl = c.w('blancas') - .1;
      A.parpadea(this.p, t + 2.9, 1.2); respira(this.p, t); A.parpadea(this.nu, t, .6); A.parpadea(this.sol, t, 1.7); this.sol.rayos.rotation.z = t * .4;
      this.nu.scale.setScalar(pop(t, tnu, .4) * (t > tbl ? 1 + .05 * Math.sin((t - tbl) * 9) * Math.exp(-(t - tbl) * 2) : 1)); this.nu.position.x = .2 + Math.sin(t * 1.3) * .04;
      const kl = t < tde ? pop(t, tgo, .35) : Math.max(.001, 1 - ease(cl((t - tde) / .35)));
      this.lu.scale.setScalar(kl); this.ai.update(t, t < tde ? t - tgr : -1);
      this.go.forEach((g, i) => { g.scale.setScalar(t > tgr ? 1 + .12 * Math.sin((t - tgr) * 6 + i) : .8); });
      this.ra.scale.set(Math.max(.001, ease(cl((t - tde) / .35))), 1, 1);
      this.ra.update(t, eout(cl((t - tde - .2) / .4)), [0, 1, 2, 3, 4, 5], ease(cl((t - tig + .5) / .5)));
      this.p.boca(t > tbl ? 'feliz' : 'abierta'); habla(this.p, t);
      c.ev('whoosh', .05, .4); if (t > tgo) c.ev('pop', tgo, .4); if (t > tgr) c.ev('pop', tgr, .3); if (t > tde) c.ev('whoosh', tde, .5); if (t > tig) c.ev('ding', tig, .4); if (t > tbl) c.ev('ding', tbl, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tgr && t < tde) etiqueta('GOTITAS GRANDES', [0, -.3, .9], lt - tgr, 48, '#ffffff', true);
      if (t > tig && t < tbl) etiqueta('¡TODOS POR IGUAL!', [0, -.3, .9], lt - tig, 48, '#ffffff', true);
      if (t > tbl) etiqueta('¡BLANCAS!', [0, -.3, .9], lt - tbl, 58, '#ffd640', true);
      rotulo('¿Y las nubes?', 'gotitas mucho más grandes', lt - .1, RY);
    }
  });

  // ---------- 6 · atardecer: el Sol baja, la luz cruza mucho más aire, el azul se pierde y llegan naranja y rojo ----------
  escena('atardecer', {
    setup() { this.s = set();
      this.sol = sol([-.55, 2.35, .1], .28);
      this.r1 = PM.rayoLuz([-.55, 2.35, .15], { largo: 1.5, bolitas: 2, abreEn: .3, abanico: .3 }); this.r1.rotation.z = -1.15;
      this.r2 = PM.rayoLuz([-1.2, 1.0, .15], { largo: 2.05, bolitas: 3, abreEn: .2, abanico: .16, vel: .45 }); this.r2.rotation.z = .02;
      this.ai = aire(22, -1.0, .75, .55, 1.5, .22, 31);
      this.p = PM.chibi([1.02, .02, .3], { logo: true, boca: 'abierta', mira: -1, escala: .74 }); },
    update(lt, c) {
      const t = tw(lt), tcr = c.w('cruza') - .2, tmu = c.w('muchísimo') - .1, taz = c.w('azul') - .1, tpi = c.w('pierde') - .1, tna = c.w('naranjas') - .1;
      A.parpadea(this.p, t + 1.4, .8); respira(this.p, t); A.parpadea(this.sol, t, 2.2); this.sol.rayos.rotation.z = t * .4;
      const kb = ease(cl((t - tcr) / .9));
      this.sol.position.set(lerp(-.55, -1.2, kb), lerp(2.35, 1.0, kb), .1);
      this.r1.scale.setScalar(Math.max(.001, 1 - ease(cl((t - tcr) / .3)))); this.r1.update(t, 1);
      this.r2.scale.set(Math.max(.001, ease(cl((t - tcr - .6) / .5))), 1, 1);
      const kr = ease(cl((t - taz) / .8)), kc = ease(cl((t - tpi) / 2.0));
      this.r2.update(t, eout(cl((t - tcr - .8) / .4)), [3, 4, 5], kr);
      this.ai.update(t, t - tmu);
      this.s.atardece(kc * .95); this.sol.color(Math.max(kb * .5, kc));
      this.p.boca(t > tna ? 'feliz' : 'abierta'); habla(this.p, t);
      if (t > tna) A.ladea(this.p, .25, -1);
      c.ev('whoosh', .05, .4); if (t > tcr) c.ev('whoosh', tcr, .6); if (t > tmu) c.ev('pop', tmu, .3); if (t > taz) c.ev('pop', taz, .3); if (t > tna) c.ev('ding', tna, .5);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 6.9))], [0, 1.15, 0], 34);
      if (t < tcr) etiqueta('MEDIODÍA: POCO AIRE', [0, -.3, .9], lt, 40, '#ffffff', true);
      if (t > tmu && t < taz) etiqueta('¡MUCHO MÁS AIRE!', [0, -.3, .9], lt - tmu, 48, '#ffffff', true);
      if (t > taz && t < tna) etiqueta('EL AZUL SE PIERDE', [0, -.3, .9], lt - taz, 46, '#ffffff', true);
      if (t > tna) etiqueta('¡NARANJA Y ROJO!', [0, -.3, .9], lt - tna, 50, '#ffd640', true);
      rotulo('Al atardecer la luz', 'cruza muchísimo más aire', lt - .1, RY);
    }
  });

  // ---------- 7 · Marte: cielo rojizo, rover y atardecer azul ----------
  escena('marte', {
    setup() {
      ambiente({ top: 0xe0a46a, bottom: 0xe0a46a, fog: 0xe0a46a, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
      this.cielo = clona(PM.det(F.rect(30, 30, 0), 0xe0a46a, [0, 8, -4.2])); this.hor = clona(PM.det(F.rect(30, 1.6, 0), 0xf0c08a, [0, 1.15, -4.1]));
      this.sol = PM.astro([-.75, 2.2, -3.0], .14, 0xfff6e0, { cara: false });
      this.halo = clona(PM.det(F.circ(.55), 0x7fb2ff, [0, 0, -.2], this.sol)); this.halo2 = clona(PM.det(F.circ(.85), 0xa9c8ff, [0, 0, -.3], this.sol));
      for (const [x, w, h, z] of [[-2.2, 1.6, .9, -2.7], [.9, 1.3, .7, -2.75], [2.6, 1.8, 1.1, -2.7]]) PM.pz(F.poly([[-w, 0], [-w * .7, h], [w * .6, h], [w, 0]]), 0xb5583a, [x, .1, z], null, { tinta: .018, papel: .06 });
      PM.pz(F.rect(30, 6, 0), 0xc8643c, [0, -2.95, -1.7], null, { tinta: false, papel: false });
      for (const [x, y, s] of [[-1.1, -.15, .18], [1.15, -.35, .13], [-.3, -.55, .1], [.6, .02, .09]]) PM.pz(F.elipse(s * 1.3, s), 0x8f3f2a, [x, y, -1.6], null, { tinta: .014, papel: .04 });
      luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
      // rover de cartulina con carita en la cámara
      const r = this.rv = group([.35, .02, .3]);
      this.ru = [-.38, 0, .38].map(x => { const w = PM.pz(F.circ(.15), 0x34313d, [x, .16, .05], r, { tinta: .014, papel: .04 }); PM.det(F.circ(.06), 0x9aa3b5, [0, 0, .016], w); PM.det(F.rect(.03, .2, .01), 0x9aa3b5, [0, 0, .018], w); return w; });
      PM.pz(F.rect(1.05, .32, .05), 0xf4f6fb, [0, .5, 0], r, { tinta: .016, papel: .05 }); PM.det(F.rect(.9, .06, .02), 0xd0d6e2, [0, .44, .016], r);
      PM.pz(F.rect(1.2, .1, .02), 0x3d4a8a, [-.05, .72, -.02], r, { tinta: .014, papel: .04 });
      PM.pz(F.rect(.06, .55, .02), 0x9aa3b5, [.32, .95, -.01], r, { tinta: .012, papel: .03 });
      this.cam = group([.32, 1.3, .03], r); PM.pz(F.rect(.44, .28, .06), 0xf4f6fb, [0, 0, 0], this.cam, { tinta: .016, papel: .05 });
      this.cam.head = { ojos: [-1, 1].map(sx => { const e = PM.det(F.elipse(.045, .07), 0x2a1f2e, [sx * .1, .02, .016], this.cam); PM.det(F.circ(.016), 0xffffff, [.012, .025, .004], e); return e; }) };
      this.boca = PM.det(F.elipse(.03, .035), 0x7a1f30, [0, -.08, .016], this.cam); },
    update(lt, c) {
      const t = tw(lt), tre = c.w('revés') - .1, tro = c.w('rojizo') - .1, tat = c.w('atardeceres') - .1, taz = c.w('azules') - .1;
      A.parpadea(this.cam, t, .5);
      const kd = ease(cl((t - tat) / 1.0));
      this.rv.position.x = .35 + Math.sin(t * 1.2) * .06; this.ru.forEach(w => w.rotation.z = -Math.sin(t * 1.2) * .5);
      this.cam.rotation.z = (t > tat ? .25 : 0) + Math.sin(t * 2) * .04; this.boca.scale.setScalar(t > taz ? 1.5 : 1);
      this.sol.position.y = lerp(2.2, 1.0, kd);
      this.halo.scale.setScalar(Math.max(.001, lerp(.25, 1, kd))); this.halo2.scale.setScalar(Math.max(.001, lerp(.1, 1, kd)));
      pinta(this.cielo, mezc(0xe0a46a, 0x7a5148, kd)); pinta(this.hor, mezc(0xf0c08a, 0x8fa6c8, kd));
      c.ev('whoosh', .05, .5); if (t > tre) c.ev('impact', tre, .4); if (t > tat) c.ev('whoosh', tat, .5); if (t > taz) c.ev('ding', taz, .5);
      cam([0, 1.2, lerp(10.9, 10.3, ease(lt / 4.5))], [0, 1.15, 0], 34);
      if (t > tre && t < taz) etiqueta('¡AL REVÉS!', [0, 2.45, .9], lt - tre, 58, '#ffd640', true);
      if (t > taz) etiqueta('¡ATARDECER AZUL!', [0, 2.45, .9], lt - taz, 50, '#8fd3ff', true);
      rotulo('En Marte es al revés', '¡atardeceres azules!', lt - .1, RY);
    }
  });

  // ---------- 8 · remate: la amiga le toma foto al atardecer; el protagonista manda el avioncito ----------
  escena('remate', {
    setup() { this.s = set(); this.s.atardece(1);
      this.sol = sol([.1, 1.0, -2.2], .3); this.sol.color(1);
      this.h = PM.chibi([-.62, .02, .38], { ropa: 0xff6b5b, pantalon: 0x2b2f4a, tenis: AMARILLO, pelo: 'cola', colPelo: 0x2a1a12, aretes: true, boca: 'feliz', mira: 1, escala: .85 });
      this.ce = conCel(this.h, { cara: 'feliz' });
      this.fl = PM.pz(F.estrella(8, .18, .08), 0xffffff, [0, 0, .2], this.ce, { tinta: .012, papel: .03 }); this.fl.position.set(0, .3, .1);
      this.p = PM.chibi([.72, .02, .3], { logo: true, boca: 'feliz', mira: -1, escala: .85 });
      this.av = PM.avion([.72, 1.3, .9], .45); },
    update(lt, c) {
      const t = tw(lt), tma = c.w('Mándaselo') - .1, tfo = c.w('foto') - .1;
      A.parpadea(this.h, t + .6, .4); A.parpadea(this.p, t + 2.0, 1.6); respira(this.h, t, .02, 1); respira(this.p, t); A.parpadea(this.sol, t, 1.0); this.sol.rayos.rotation.z = t * .3;
      sube(this.h, this.ce, eout(cl((t - .1) / .35)), t, 1.6);
      const ff = t > tfo ? ((t - tfo) % .8) / .8 : 1; this.fl.scale.setScalar(ff < .3 ? Math.max(.001, Math.sin(ff / .3 * Math.PI)) * 1.2 : .001);
      this.h.boca(t > tfo ? 'abierta' : 'feliz');
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.3, eout(cl((t - tma) / .3))) - lerp(0, 1.2, ease(cl((t - tma - .4) / .3)));
      const kv = cl((t - tma - .45) / 1.4); this.av.visible = t > tma + .45 && kv < 1; this.av.position.set(lerp(.7, 1.75, ease(kv)), 1.35 + Math.sin(kv * Math.PI) * .9 + kv * .4, .9); this.av.rotation.z = .5 - kv * .3;
      c.ev('whoosh', .05, .4); if (t > tma + .45) c.ev('whoosh', tma + .45, .5); for (let i = 0; i < 3; i++) if (t > tfo + i * .8) c.ev('pop', tfo + i * .8, .25);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.6))], [0, 1.15, 0], 34);
      if (t > tfo) etiqueta('¡CLIC!', [-.55, 2.45, .9], lt - tfo, 50, '#ffffff', true);
      rotulo('Mándaselo a quien', 'le toma foto a cada atardecer', lt - .05, RY);
    }
  });
  P.cierre();
}
