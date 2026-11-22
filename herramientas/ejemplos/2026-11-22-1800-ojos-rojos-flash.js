// Short 22-nov 18:00 · CARTULINA CHIBI: ¿por qué con flash SIEMPRE sales con ojos rojos?
// De noche la pupila está dilatada; el flash es tan rápido que no alcanza a cerrarse; la luz rebota en el fondo del ojo (coroides/retina,
// llena de vasos sanguíneos) y regresa roja a la cámara. Truco: más luz en el cuarto o modo antiojos rojos (preflash) que contrae la pupila.
// Fuentes: West Texas A&M (Science Questions with Surprising Answers), All About Vision, American Academy of Ophthalmology.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-22-1800-ojos-rojos-flash.json OUT ../ejemplos/2026-11-22-1800-ojos-rojos-flash.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600;
  const amb = c => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const amigo = (pos, o = {}) => PM.chibi(pos, { ropa: 0xff8a3d, pantalon: 0x2b2f4a, tenis: 0xffc83d, colPelo: 0x1d1410, lentes: false, boca: 'feliz', ...o });

  // ---- piezas locales ----
  // sala de fiesta de noche: pared lila, ventana con Luna, papel picado
  const sala = () => { amb(0x4a4680); PM.cuarto({ pared: 0x9d8fd6, piso: 0xa8724c, ventana: [-1.05, 2.15], noche: true, vw: .85, vh: .75, abierta: 1, cuadro: [1.3, 1.75, -2.6] });
    luces({ pos: [-3, 5, 8], hemi: 1.6, sol: 1.4, radio: 6 }); const pp = P.papelPicado(3.05, { w: 4.2, n: 7 }); return pp; };
  // velo delante de la cámara: blanco = flashazo, azul noche = cuarto con poca luz
  const velo = (col, z = 6) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
    m.renderOrder = 999; const g = group([0, 1.2, z]); g.add(m); g.op = k => { m.material.opacity = cl(k); m.visible = k > .003; }; g.op(0); return g; };
  // celular en la mano derecha de un chibi (pantalla al frente) con su lucecita de flash
  const cel = p => { const c = PM.celular([0, -.6, .08], { h: .4, pct: 80 }, p.brazos[1]); c.luz = group([0, .14, .06], c);
    PM.pz(F.estrella(8, .16, .06), 0xffffff, [0, 0, 0], c.luz, { tinta: .01, papel: false }); c.luz.scale.setScalar(.001); return c; };
  const sostiene = (p, c, rot) => { p.brazos[1].rotation.z = rot; c.rotation.z = -rot; };
  // foto impresa con el retrato (solo la cabeza) de un chibi
  const foto = (pos, W, H, o = {}) => { const g = group(pos); PM.pz(F.rect(W, H, .03), 0xffffff, [0, 0, 0], g, { tinta: .016, papel: .05 });
    PM.det(F.rect(W * .86, H * .78, .02), 0x3b3566, [0, H * .06, .016], g); PM.det(F.circ(.05), 0xfff2a8, [W * .3, H * .32, .02], g);
    const es = o.es ?? .8, ch = o.amigo ? amigo([0, 0, 0], { escala: es }) : PM.chibi([0, 0, 0], { escala: es, boca: 'feliz' }); g.add(ch);
    ch.position.set(0, H * .02 - 1.66 * es, .05); ch.children.forEach(k => { if (k !== ch.head) k.visible = false; });
    g.rojos = PM.ojosRojos(ch); g.ch = ch; return g; };
  // apagador de pared
  const apagador = pos => { const g = group(pos); PM.pz(F.rect(.2, .3, .04), 0xf4f1ea, [0, 0, 0], g, { tinta: .014, papel: .04 });
    g.pal = PM.pz(F.rect(.07, .12, .02), 0xd9d3c4, [0, -.04, .02], g, { tinta: .01, papel: false }); g.prende = k => { g.pal.position.y = k > .5 ? .04 : -.04; }; return g; };

  // ---------- 1 · gancho: selfie con flash… ¡y sale con ojos rojos! ----------
  escena('gancho', {
    setup() { this.pp = sala();
      this.p = PM.chibi([-.6, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .85 }); this.c = cel(this.p);
      this.f = foto([.78, 1.5, .6], .98, 1.12); this.f.scale.setScalar(.001);
      this.v = velo(0xffffff); },
    update(lt, c) {
      const t = tw(lt), tf = c.w('flash') - .05, to = c.w('ojos') - .25, tr = c.w('rojos?') - .05;
      A.parpadea(this.p, t + 1.1, .4); A.parpadea(this.f.ch, t + 2.2, .9); respira(this.p, t); this.pp.update(t);
      // pose de selfie; al flashazo cierra los ojitos un instante
      sostiene(this.p, this.c, 2.45 + Math.sin(t * 3) * .04);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .35 - Math.sin(t * 3) * .05;
      const kf = t > tf ? Math.max(0, 1 - (t - tf) / .45) : 0; this.v.op(kf * .95);
      this.c.luz.scale.setScalar(t > tf && t < tf + .4 ? 1.2 - (t - tf) : .001);
      const sorpresa = ease(cl((t - tr) / .25));
      this.p.boca(t < tr ? 'feliz' : 'abierta'); A.preocupa(this.p, sorpresa);
      if (t < tr) habla(this.p, t); else this.p.head.rotation.z = this.p.head.r0 - .1 * sorpresa;
      this.f.scale.setScalar(pop(t, to, .4)); this.f.rotation.z = -.06 + Math.sin(t * 2) * .02;
      this.f.rojos(ease(cl((t - tr) / .2)));
      if (t > tf) { c.ev('click', tf, .6); c.ev('zap', tf + .02, .5); } if (t > to) c.ev('pop', to, .5); if (t > tr) c.ev('impact', tr, .6);
      cam([0, 1.2, lerp(10.8, 10.4, ease(lt / 3))], [0, 1.15, 0], 34);
      if (t > tf && t < to) etiqueta('¡FLASH!', [0, 2.5, .9], lt - tf, 60, '#ffd640', true);
      if (t > tr) etiqueta('¡OJOS ROJOS!', [.2, 2.5, .9], lt - tr, 56, '#ff5b5b', true);
      rotulo('¿Por qué sales con', 'ojos rojos en fotos?', lt - .05, RY);
    }
  });

  // ---------- 2 · pupila: de noche está bien abierta y el flash le gana ----------
  escena('pupila', {
    setup() { this.pp = sala();
      this.o = PM.ojoCorte([.5, 1.45, .5], { vista: 'frente', r: .62 }); this.o.scale.setScalar(.001);
      this.p = PM.chibi([-.95, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .72 }); this.c = cel(this.p);
      this.r = PM.pz(F.rayo(.9), 0xffd640, [0, 0, 0], group([-.6, 1.35, .7]), { tinta: .016, papel: .05 }); this.r.parent.scale.setScalar(.001);
      this.v = velo(0xffffff); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('pupila') - .1, tab = c.w('abierta') - .1, tf = c.w('flash') - .05, tno = c.w('alcanza') - .2, tce = c.w('cerrarse.');
      A.parpadea(this.p, t + .3, 1.3); respira(this.p, t); this.pp.update(t);
      if (t < tf || t > tf + .5) habla(this.p, t);
      // el ojo aparece; la pupila se abre grandota
      this.o.scale.setScalar(pop(t, .05, .45));
      const kAb = .45 + .55 * ease(cl((t - tp) / (tab + .3 - tp)));
      const kCi = t > tf + .25 ? .35 * ease(cl((t - tf - .25) / 2.4)) : 0;          // intenta cerrarse… demasiado tarde y muy lento
      this.o.update(t, { pupila: kAb - kCi, rojo: t > tf && t < tf + .6 ? 1 - (t - tf) / .6 : 0 });
      this.o.rotation.z = Math.sin(t * 1.5) * .03;
      // el rayo del flash va del celular al ojo en un instante
      const kr = cl((t - tf) / .18), rg = this.r.parent; rg.scale.setScalar(t > tf && t < tf + .55 ? .9 : .001);
      rg.position.x = lerp(-.55, .2, ease(kr)); rg.rotation.z = -.35;
      this.v.op(t > tf ? Math.max(0, 1 - (t - tf) / .4) * .85 : 0); this.c.luz.scale.setScalar(t > tf && t < tf + .35 ? 1.2 - (t - tf) : .001);
      sostiene(this.p, this.c, lerp(this.p.brazos[1].r0, 1.75, eout(cl((t - tab) / .3))) + Math.sin(t * 4) * .03);
      this.p.boca(t > tf && t < tf + .6 ? 'apretada' : 'abierta'); A.preocupa(this.p, t > tno ? ease(cl((t - tno) / .3)) * .6 : 0);
      if (t > tp) c.ev('pop', tp, .5); if (t > tab) c.ev('whoosh', tab, .5); if (t > tf) { c.ev('click', tf, .6); c.ev('zap', tf + .02, .6); } if (t > tno) c.ev('ding', tno, .5);
      cam([0, 1.25, 10.4], [0, 1.2, 0], 34);
      if (t > tab && t < tf) etiqueta('¡PUPILA ABIERTA!', [.5, 2.5, .9], lt - tab, 46, '#ffd640', true);
      if (t > tf && t < tno) etiqueta('¡ZAS!', [.5, 2.5, .9], lt - tf, 64, '#ffffff', true);
      if (t > tno) etiqueta('¡NO ALCANZA A CERRARSE!', [.2, 2.5, .9], lt - tno, 38, '#ff5b5b', true);
      rotulo('De noche la pupila', 'está bien abierta', lt - .05, RY);
    }
  });

  // ---------- 3 · rebote: la luz entra, rebota en el fondo lleno de venitas y regresa roja ----------
  escena('rebote', {
    setup() { amb(0x37326a);
      for (const [x, y, r] of [[-1.2, 2.6, .05], [1.25, 2.45, .04], [-.9, .3, .035], [1.1, .15, .05], [.1, 2.75, .03]]) PM.det(F.estrella(5, r, r * .45), 0xfff2a8, [x, y, -2.9]);
      luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
      this.o = PM.ojoCorte([.55, 1.3, .4], { r: .72, largo: .78 }); this.o.scale.setScalar(.001);
      this.c = PM.celular([-1.12, 1.3, .5], { h: .5, pct: 80 }); this.c.rotation.y = .25; },
    update(lt, c) {
      const t = tw(lt), trb = c.w('rebota') - .05, tfo = c.w('fondo') - .1, tve = c.w('venitas,') - .15, tsa = c.w('sale') - .1, tro = c.w('roja.') - .05;
      this.o.scale.setScalar(pop(t, 0, .35)); this.o.position.y = 1.3 + Math.sin(t * 1.6) * .02;
      this.c.position.y = 1.3 + Math.sin(t * 2.2 + 1) * .03;
      this.o.update(t, { pupila: 1, entra: eout(cl((t - .1) / (trb - .1))), sale: eout(cl((t - tsa) / .5)), venas: t > tve ? 1 : 0 });
      if (t > .1) c.ev('whoosh', .1, .5); if (t > trb) c.ev('pop', trb, .5); if (t > tve) c.ev('ding', tve, .5); if (t > tsa) c.ev('zap', tsa, .6);
      cam([0, 1.2, lerp(10.6, 10.2, ease(lt / 3.8))], [0, 1.2, 0], 34);
      if (t > trb && t < tfo) etiqueta('¡REBOTA!', [.7, 2.45, .9], lt - trb, 52, '#ffd640', true);
      if (t > tfo && t < tve) etiqueta('FONDO DEL OJO', [.9, 2.45, .9], lt - tfo, 42, '#ffffff', true);
      if (t > tve && t < tsa) etiqueta('¡LLENO DE VENITAS!', [.4, 2.45, .9], lt - tve, 42, '#ff8a96', true);
      if (t > tsa) etiqueta('¡Y SALE ROJA!', [.2, 2.45, .9], lt - tsa, 52, '#ff5b5b', true);
      rotulo('La luz rebota en el', 'fondo del ojo', lt - .05, RY);
    }
  });

  // ---------- 4 · truco: prende la luz o usa el doble flash → la pupila se cierra antes ----------
  escena('truco', {
    setup() { this.pp = sala();
      this.ap = apagador([-1.12, 1.25, .15]);
      this.fo = PM.foco([1.02, 2.42, -.4], .18); PM.pz(F.rect(.025, .6, 0), 0x2b2f4a, [1.02, 2.95, -.45], null, { tinta: false, papel: false });
      this.p = PM.chibi([-.5, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .8 }); this.c = cel(this.p);
      this.o = PM.ojoCorte([.88, 1.55, .5], { vista: 'frente', r: .4 }); this.o.scale.setScalar(.001);
      this.ok = PM.marca([.88, .82, .6], true, .6); this.ok.scale.setScalar(.001);
      this.osc = velo(0x14123a, 5.9); this.v = velo(0xffffff); },
    update(lt, c) {
      const t = tw(lt), tpr = c.w('prende') - .1, tlu = c.w('luz') - .1, tdo = c.w('doble') - .05, tfl = c.w('flash;'), tpu = c.w('pupila') - .25, tci = c.w('cierra') - .1, tan = c.w('antes.') - .05;
      A.parpadea(this.p, t + 2.4, .7); respira(this.p, t); this.pp.update(t); habla(this.p, t);
      // la mano izquierda prende el apagador
      const kb = eout(cl((t - tpr) / .3)) * (1 - ease(cl((t - tlu - .5) / .3)));
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - 1.35 * kb;
      const on = t > tlu ? 1 : 0; this.ap.prende(on); this.fo.prende(on, t);
      this.osc.op(.3 * (1 - on));
      // doble flash con el celular
      const kc = eout(cl((t - tdo + .4) / .3)); sostiene(this.p, this.c, lerp(this.p.brazos[1].r0, 2.4, kc) + Math.sin(t * 3) * .03);
      const fl = [tdo, tfl].reduce((a, t0) => a + (t > t0 ? Math.max(0, 1 - (t - t0) / .22) : 0), 0);
      this.v.op(fl * .6); this.c.luz.scale.setScalar(fl > .05 ? 1 : .001);
      // el ojito: la pupila se hace chiquita antes de la foto
      this.o.scale.setScalar(pop(t, tpu, .4)); this.o.update(t, { pupila: 1 - ease(cl((t - tci) / .45)) });
      this.ok.scale.setScalar(.6 * pop(t, tan, .35));
      this.p.boca(t > tan ? 'feliz' : 'abierta');
      if (t > tlu) c.ev('click', tlu, .6); if (t > tdo) c.ev('zap', tdo, .45); if (t > tfl) c.ev('zap', tfl, .45); if (t > tpu) c.ev('pop', tpu, .5); if (t > tan) c.ev('ding', tan, .6);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t < tlu) etiqueta('¡TRUCO!', [0, 2.5, .9], lt - .1, 60, '#ffd640', true);
      if (t > tlu && t < tdo) etiqueta('¡PRENDE LA LUZ!', [0, 2.5, .9], lt - tlu, 46, '#ffffff', true);
      if (t > tdo && t < tci) etiqueta('¡DOBLE FLASH!', [0, 2.5, .9], lt - tdo, 50, '#ffd640', true);
      if (t > tci) etiqueta('¡SE CIERRA ANTES!', [.2, 2.5, .9], lt - tci, 44, '#7dff9a', true);
      rotulo('Truco: prende la luz', 'o usa el doble flash', lt - .05, RY);
    }
  });

  // ---------- 5 · remate: la foto del amigo que SIEMPRE sale con ojos rojos ----------
  escena('remate', {
    setup() { this.pp = sala();
      this.p = PM.chibi([-.85, .02, .3], { logo: true, boca: 'feliz', mira: 1, escala: .8 });
      this.a = amigo([.85, .02, .35], { escala: .78, mira: -1 });
      this.f = foto([0, 1.95, .7], .78, .9, { amigo: true, es: .62 }); this.f.scale.setScalar(.001);
      this.cf = PM.confeti({ n: 18 }); },
    update(lt, c) {
      const t = tw(lt), tsi = c.w('siempre') - .1, to = c.w('ojos') - .1;
      A.parpadea(this.p, t + 2.0, 1.6); A.parpadea(this.a, t + .6, .4); A.parpadea(this.f.ch, t + 1.4, 1.1); respira(this.p, t); respira(this.a, t, .02, 1); this.pp.update(t);
      this.f.scale.setScalar(pop(t, .15, .4)); this.f.rotation.z = Math.sin(t * 2.2) * .05; this.f.rojos(1);
      // el chibi señala al amigo y se ríe; el amigo, apenado
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.45 * eout(cl((t - tsi) / .3)) + Math.sin(t * 5) * .04;
      this.p.boca(t > tsi ? 'lengua' : 'feliz'); habla(this.p, t);
      this.a.boca(t > to ? 'apretada' : 'feliz'); A.preocupa(this.a, ease(cl((t - to) / .3)));
      this.a.brazos[0].rotation.z = this.a.brazos[0].r0 - 2.6 * eout(cl((t - to) / .3)) + Math.sin(t * 6) * .04 * (t > to ? 1 : 0);
      this.a.head.rotation.z = this.a.head.r0 + Math.sin(t * 3) * .04;
      this.cf.lluvia(t, ease(cl((t - to) / .4)));
      c.ev('whoosh', .05, .4); if (t > .15) c.ev('pop', .15, .5); if (t > tsi) c.ev('ding', tsi, .5); if (t > to) c.ev('impact', to, .5);
      cam([0, 1.2, lerp(10.4, 10.1, ease(lt / 3))], [0, 1.15, 0], 34);
      if (t > to) etiqueta('¡SIEMPRE ÉL!', [0, -.25, .9], lt - to, 50, '#ff5b5b', true);
      rotulo('Mándaselo a quien', 'sale con ojos rojos', lt - .05, RY);
    }
  });
  P.cierre();
}
