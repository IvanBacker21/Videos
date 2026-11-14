// Short 13-nov 21:30 · CARTULINA CHIBI: ¿Viernes 13 y todo te sale mal? (en México era el martes 13)
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-13-2130-viernes-13.json OUT ../ejemplos/2026-11-13-2130-viernes-13.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw, blob } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xa9dcf5;
  const set = (cielo = CIELO) => { ambiente({ top: cielo, bottom: cielo, fog: cielo, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, fase = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + fase) * .05; };
  const mueve = (p, t, f = 0) => { p.brazos[0].rotation.z = p.brazos[0].r0 + Math.sin(t * 3 + f) * .04; p.brazos[1].rotation.z = p.brazos[1].r0 - Math.sin(t * 3 + f) * .04; };
  // nubecita gris de "mala suerte" con lluvia (reutiliza piezas del kit)
  const nubeMala = (pos, s = 1, padre = null) => { const g = group(pos, padre); g.scale.setScalar(s);
    PM.pz(blob([[-.5, -.12], [-.52, .05], [-.32, .2], [-.12, .3], [.12, .27], [.32, .22], [.52, .05], [.5, -.12]]), 0x8a8fa3, [0, 0, 0], g, { tinta: .016, papel: .05 });
    g.gotas = [-.3, -.05, .2, .38].map((x, i) => { const d = PM.pz(F.gota(.08), 0x6cc4ff, [x, -.3, .02], g, { tinta: .008, papel: false }); d.x0 = x; d.i = i; return d; });
    g.llueve = t => g.gotas.forEach(d => { const k = (t * 1.3 + d.i * .27) % 1; d.position.set(d.x0, -.22 - k * .5, .02); d.scale.setScalar(1 - k * .4); });
    return g; };
  // gira una cartulina sin espejo y cambia lo impreso a la mitad
  const voltea = (g, k, es, alCambiar) => { g.scale.x = es * Math.max(.02, Math.abs(Math.cos(k * Math.PI))); if (k >= .5 && !g.cambiado) { g.cambiado = true; alCambiar(); } };

  // ---------- 1 · gancho: viernes 13 y todo sale mal ----------
  escena('gancho', {
    setup() { set();
      this.p = PM.chibi([-.55, .02, .3], { logo: true, boca: 'apretada', mira: 1 });
      this.cal = PM.calendario([.95, 1.25, .35], 'VIERNES', 13, { w: 1.0, h: 1.15 });
      this.nu = nubeMala([-.55, 2.55, .5], .75);
      this.cono = group([0, -.66, .12], this.p.brazos[1]); PM.pz(F.poly([[-.12, .1], [.12, .1], [0, -.28]]), 0xd9a066, [0, 0, 0], this.cono, { tinta: .014, papel: .04 });
      this.bola = PM.pz(F.circ(.15), 0xff8fb1, [0, .2, .01], this.cono, { tinta: .014, papel: .04 });
      this.he = PM.pz(blob([[-.15, -.3], [.15, -.3], [.2, .25], [0, .32], [-.2, .25]]), 0xfff1d6, [0, 0, 0], null, { tinta: .015, papel: .04 });  // helado que se cae
      this.co = PM.pz(F.circ(.15), 0xff8fb1, [0, 0, .02], null, { tinta: .015, papel: .04 }); },
    update(lt, c) {
      const t = tw(lt), tm = c.w('mal?') - .3;
      A.parpadea(this.p, t, .6); A.preocupa(this.p, 1); A.tiembla(this.p, t, .35, -.55); this.p.boca('apretada');
      this.p.head.rotation.z = this.p.head.r0 - .05 + Math.sin(t * 4) * .04; mueve(this.p, t);
      this.cal.scale.setScalar(pop(t, -.3, .35)); this.cal.columpia(t);
      this.nu.visible = true; this.nu.scale.setScalar(.75 * pop(t, .25, .4)); this.nu.position.x = -.55 + Math.sin(t * 1.5) * .06; this.nu.llueve(t);
      // la bola de helado se cae al piso
      this.bola.visible = t < tm; const v = new THREE.Vector3(); this.cono.getWorldPosition(v); const kc = ease(cl((t - tm) / .45)); this.co.position.set(v.x + kc * .2, lerp(v.y + .2, .12, kc), .7); this.co.rotation.z = kc * 2; this.co.visible = t >= tm; this.co.scale.set(1, t > tm + .45 ? .6 : .75, 1);
      this.he.visible = false;
      c.ev('pop', .0, .4); if (t > .25) c.ev('whoosh', .25, .4); if (t > tm + .45) c.ev('pop', tm + .45, .4);
      cam([.15, 1.2, lerp(10.8, 10.3, ease(lt / 3.2))], [.15, 1.15, 0], 34);
      if (t > tm + .45) etiqueta('¡NOOO!', [.25, .5, .7], lt - tm - .45, 54, '#ffd640', true);
      rotulo('¿Viernes 13 y todo', 'te sale mal?', lt - .1, RY);
    }
  });

  // ---------- 2 · en México el de mala suerte es el MARTES 13 ----------
  escena('martes', {
    setup() { set();
      this.p = PM.chibi([-.8, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .9 });
      this.cal = PM.calendario([.75, 1.65, .35], 'VIERNES', 13, { w: 1.05, h: 1.2 }); this.cal.cambiado = false;
      this.m1 = PM.marca([.25, .55, .6], false, .75); this.m2 = PM.marca([.25, -.05, .6], false, .75); },
    update(lt, c) {
      const t = tw(lt), tx = c.w('México,') - .2, tma = c.w('martes') - .3, tc = c.w('cases') - .2, te = c.w('embarques.') - .2;
      A.parpadea(this.p, t, 1.3); habla(this.p, t); this.p.boca('abierta'); A.preocupa(this.p, 0);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.15, eout(cl((t - tma + .2) / .4))) + Math.sin(t * 4) * .04; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      this.cal.position.y = 1.65; this.cal.columpia(t);
      const kv = cl((t - tma) / .5); voltea(this.cal, kv, 1, () => this.cal.texto('MARTES', 13));
      this.m1.scale.setScalar(.75 * pop(t, tc, .3)); this.m2.scale.setScalar(.75 * pop(t, te, .3));
      if (t > tma) c.ev('whoosh', tma, .5); if (t > tc) c.ev('pop', tc, .4); if (t > te) c.ev('pop', te, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tx && t < tc) etiqueta('EN MÉXICO', [-.8, 2.45, .7], lt - tx, 44, '#ffffff', true);
      if (t > tc) etiqueta('NI TE CASES', [.95, .55, .7], lt - tc, 38, '#ffffff', true);
      if (t > te) etiqueta('NI TE EMBARQUES', [.95, -.05, .7], lt - te, 38, '#ffffff', true);
      if (t < tma) rotulo('En México, el de', 'mala suerte es…', lt - .1, RY); else rotulo('¡El MARTES 13!', '', lt - tma, RY);
    }
  });

  // ---------- 3 · el viernes 13 llegó con las películas de terror ----------
  escena('cine', {
    setup() { set(0x3a3560);
      const pa = group([0, 2.0, -.2]); this.pa = pa;
      PM.pz(F.rect(2.3, 1.25, .06), 0x2b2740, [0, 0, 0], pa, { tinta: .02, papel: .07 });
      PM.det(F.rect(2.12, 1.07, .04), 0x161427, [0, 0, .02], pa);
      this.luna = PM.pz(F.circ(.26), 0xfff2b8, [.78, .2, .04], pa, { tinta: false, papel: false });
      for (const [x, h] of [[-.8, .5], [-.55, .32], [-.3, .6], [.0, .38], [.3, .52], [.55, .3], [.8, .46]]) PM.det(F.rect(.22, h, .01), 0x0b0a14, [x, -.52 + h / 2 * .6, .05], pa);
      this.ti = PM.letrero([-.15, .28, .07], 'VIERNES 13', { w: 1.3, h: .34, color: 0x161427, borde: 0x161427, tinta: '#ff4d5e', hilos: false }, pa);
      this.p = PM.chibi([-.68, .02, .5], { logo: true, boca: 'apretada', mira: 1, escala: .76 });
      this.a = PM.chibi([.7, .02, .5], { pelo: 'cola', ropa: 0xffc83d, pantalon: 0x7b5cff, colPelo: 0x2a1a12, boca: 'apretada', mira: -1, escala: .74 });
      // cubeta de palomitas en la mano de la amiga
      const cu = group([0, -.66, .12], this.a.brazos[0]); this.cu = cu;
      PM.pz(F.poly([[-.17, .2], [.17, .2], [.12, -.18], [-.12, -.18]]), 0xffffff, [0, 0, 0], cu, { tinta: .014, papel: .04 });
      for (const x of [-.09, 0, .09]) PM.det(F.rect(.04, .34, .01), 0xff5b5b, [x, .0, .02], cu);
      for (const [x, y] of [[-.12, .24], [-.03, .28], [.07, .25], [.14, .22], [.02, .2]]) PM.pz(F.circ(.065), 0xfff1c2, [x, y, .01], cu, { tinta: .008, papel: false }); },
    update(lt, c) {
      const t = tw(lt), tt = c.w('terror') - .25, tu = c.w('Estados') - .2;
      A.parpadea(this.p, t, .4); A.parpadea(this.a, t, 1.7); habla(this.p, t);
      const miedo = t > tt; A.preocupa(this.p, miedo ? 1 : .3); A.preocupa(this.a, miedo ? 1 : .3);
      this.p.boca(miedo ? 'abierta' : 'apretada'); this.a.boca(miedo ? 'abierta' : 'apretada');
      A.tiembla(this.p, t, miedo ? 1 : .2, -.68); A.tiembla(this.a, t, miedo ? 1 : .2, .7); mueve(this.p, t); this.a.brazos[1].rotation.z = this.a.brazos[1].r0 - Math.sin(t * 3) * .04;
      this.a.brazos[0].rotation.z = this.a.brazos[0].r0 + (miedo ? .25 : 0) + Math.sin(t * 3) * .03; this.cu.rotation.z = -this.a.brazos[0].rotation.z;
      this.pa.scale.setScalar(pop(t, -.3, .4));
      const rel = t > tt && ((t - tt) % 1.1) < .12; this.luna.material = this.luna.material; this.ti.scale.setScalar(1 + (rel ? .08 : 0));
      this.ti.position.x = -.15 + (rel ? Math.sin(t * 60) * .03 : 0); if (0) this.ti.position.x = rel ? Math.sin(t * 60) * .03 : 0;
      c.ev('pop', .0, .4); if (t > tt) c.ev('whoosh', tt, .6);
      cam([.0, 1.25, 10.6], [.0, 1.2, 0], 34);
      if (t > tt) etiqueta('¡PELÍCULAS DE TERROR!', [.0, .4, 1.0], lt - tt, 40, '#ffd640', true);
      if (t > tu) etiqueta('HECHO EN ESTADOS UNIDOS', [.0, -.25, 1.0], lt - tu, 34, '#ffffff', true);
      rotulo('Se hizo famoso', 'por el cine de terror', lt - .1, RY);
    }
  });

  // ---------- 4 · Países Bajos: menos choques que un viernes normal ----------
  escena('estudio', {
    setup() { set();
      this.p = PM.chibi([-1.0, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .82 });
      // banderita de Países Bajos
      const fl = group([-1.0, 2.55, .3]); this.fl = fl;
      PM.pz(F.rect(.62, .42, .03), 0xffffff, [0, 0, 0], fl, { tinta: .014, papel: .04 });
      PM.det(F.rect(.6, .135, .0), 0xe0414f, [0, .135, .02], fl); PM.det(F.rect(.6, .135, .0), 0x2f5bd3, [0, -.135, .02], fl);
      // dos barras: viernes normal (alta) vs viernes 13 (más baja)
      const barra = (x, h, col, txt) => { const b = group([x, .05, .3]); const r = group([0, 0, 0], b);
        PM.pz(F.rect(.55, h, .04), col, [0, h / 2, 0], r, { tinta: .016, papel: .05 }); b.r = r; b.h = h;
        b.cal = PM.calendario([0, -.0, .2], txt, 13, { w: .62, h: .5, color: col }, null); return b; };
      this.b1 = barra(.1, 1.7, 0xff6b5b, 'NORMAL'); this.b2 = barra(1.12, 1.15, 0x2ec4a6, 'VIERNES');
      this.b1.cal.visible = false; this.b2.cal.visible = false;
      this.mk = PM.marca([1.12, 1.55, .6], true, .7); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('Países') - .3, tm = c.w('menos') - .3, tch = c.w('choques') - .2;
      A.parpadea(this.p, t, 2.2); habla(this.p, t); this.p.boca('abierta'); A.preocupa(this.p, 0);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.05, eout(cl((t - tm) / .4))) + Math.sin(t * 4) * .04; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      this.fl.scale.setScalar(pop(t, tp, .35)); this.fl.rotation.z = Math.sin(t * 3) * .06;
      this.b1.r.scale.y = Math.max(.001, eout(cl((t - .1) / .6))); this.b2.r.scale.y = Math.max(.001, eout(cl((t - tm) / .6)));
      this.mk.scale.setScalar(.7 * pop(t, tch + .2, .3));
      if (t > .1) c.ev('pop', .1, .4); if (t > tp) c.ev('pop', tp, .4); if (t > tm) c.ev('whoosh', tm, .5); if (t > tch + .2) c.ev('ding', tch + .2, .5);
      cam([.1, 1.2, 10.6], [.1, 1.15, 0], 34);
      if (t > .3) etiqueta('NORMAL', [.1, -.3, .7], lt - .3, 30, '#ffffff', true);
      if (t > tm) etiqueta('VIERNES 13', [1.12, -.3, .7], lt - tm, 30, '#ffd640', true);
      if (t > tch) etiqueta('MENOS CHOQUES', [.65, 2.25, .7], lt - tch, 40, '#ffd640', true);
      if (t > tp) etiqueta('PAÍSES BAJOS', [-1.0, -.3, .7], lt - tp, 30, '#ffffff', true);
      rotulo('Viernes 13:', 'hubo MENOS choques', lt - .1, RY);
    }
  });

  // ---------- 5 · es tu cerebro + mándaselo ----------
  escena('remate', {
    setup() { set();
      this.p = PM.chibi([-.6, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .92 });
      this.lu = PM.lupa([.75, 1.75, .4], .6, { fondo: 0xdff1fb }); this.nu = nubeMala([0, .1, .02], .55, this.lu.dentro);
      this.a = PM.chibi([.82, .02, .3], { pelo: 'cola', ropa: 0xffc83d, pantalon: 0x7b5cff, colPelo: 0x2a1a12, boca: 'apretada', mira: -1, escala: .86 });
      this.nu2 = nubeMala([.82, 2.4, .5], .55); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('cerebro:') - .2, te = c.w('esperas') - .2, tv = c.w('ves.') - .2, tm = c.w('Mándaselo') - .2;
      A.parpadea(this.p, t, .3); habla(this.p, t); mueve(this.p, t);
      const ami = t > tm - .1;
      this.p.boca(ami ? 'feliz' : 'abierta');
      this.p.brazos[1].rotation.z = ami ? lerp(this.p.brazos[1].r0, 1.0, eout(cl((t - tm) / .4))) + Math.sin(t * 4) * .04 : this.p.brazos[1].r0 + Math.sin(t * 3) * .04;
      this.lu.visible = !ami; this.lu.scale.setScalar(pop(t, te - .2, .35)); this.lu.rotation.z = Math.sin(t * 1.8) * .03;
      this.nu.scale.setScalar(.55 * (t > tv ? 1 + .25 * eout(cl((t - tv) / .4)) : 1)); this.nu.llueve(t);
      // la amiga supersticiosa con su calendario de viernes 13
      this.a.visible = ami; this.nu2.visible = ami; this.nu2.llueve(t); this.nu2.position.x = .82 + Math.sin(t * 1.5) * .05; this.a.scale.set(.86, .86 * pop(t, tm - .1, .35), .172); this.nu2.scale.setScalar(.55 * pop(t, tm, .35));
      A.parpadea(this.a, t, 1.5); A.preocupa(this.a, 1); A.tiembla(this.a, t, .5, .82); mueve(this.a, t, 1);
      if (t > te) c.ev('pop', te - .2, .4); if (t > tv) c.ev('pop', tv, .4); if (ami) c.ev('whoosh', tm - .1, .5);
      cam([.1, 1.2, 10.5], [.1, 1.15, 0], 34);
      if (t > tc && !ami) etiqueta('ES TU CEREBRO', [-.6, 2.4, .7], lt - tc, 42, '#ffffff', true);
      if (t > tv && !ami) etiqueta('SOLO VES LO MALO', [.6, .6, .7], lt - tv, 38, '#ffd640', true);
      if (ami) etiqueta('MÁNDASELO', [.1, -.25, .7], lt - tm, 56, '#ffd640', true);
      if (!ami) rotulo('Si esperas lo malo,', 'solo ves lo malo', lt - .1, RY); else rotulo('Mándaselo', 'a tu amigo supersticioso', lt - tm, RY);
    }
  });
  P.cierre();
}
