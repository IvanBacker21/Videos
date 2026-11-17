// Short 17-nov 13:30 · CARTULINA CHIBI: ¿Por qué la tortilla se infla en el comal? (agua de la masa → vapor atrapado entre las dos caras)
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-17-1330-tortilla-inflada.json OUT ../ejemplos/2026-11-17-1330-tortilla-inflada.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, PARED = 0xfbe6c8, MASA = 0xf3d98e;
  const luz = () => P.luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
  const cocina = (o) => { ambiente({ top: PARED, bottom: PARED, fog: PARED, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); const k = PM.cocina(o); luz(); return k; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 6 + f) * .05; };
  // comal con tortilla encima (la tortilla es hija del comal)
  const comalTortilla = (k, x, w, o = {}) => { const co = PM.comal([x, k.topY - .02, -1.0], { w, k: 1 }); const to = PM.tortilla([0, co.topY + .035, .02], { w: w * .82, ...o }, co); return { co, to }; };
  const abuelita = (pos, es = .85) => PM.chibi(pos, { pelo: 'chongo', colPelo: 0xc9c9d4, ropa: 0x7b5cff, falda: 0x2ec4a6, lentes: true, boca: 'feliz', mira: -1, escala: es });

  // ---------- 1 · gancho: la tortilla se infla en el comal ----------
  escena('gancho', {
    setup() { const k = cocina(); ({ co: this.co, to: this.to } = comalTortilla(k, .5, 1.4, { tostada: .6 }));
      this.p = PM.chibi([-.7, 0, .3], { logo: true, boca: 'abierta', mira: 1, escala: .85 });
      this.q = PM.pregunta([-.2, 2.25, .5], .75, 0xffc83d); },
    update(lt, c) {
      const t = tw(lt), ti = c.w('infla') - .1;
      A.parpadea(this.p, t + 1.3, .6); habla(this.p, t); this.co.fuego(1, t);
      this.to.infla(.08 + .92 * ease(cl((t - .35) / (ti + .5 - .35)))); this.to.tuesta(.6);
      this.p.position.y = t > ti ? Math.abs(Math.sin((t - ti) * 9)) * .04 * Math.max(0, 1 - (t - ti) * 1.5) : 0;   // brinquito de sorpresa
      this.p.brazos[0].rotation.z = -lerp(-this.p.brazos[0].r0, 1.2, eout(cl((t - ti) / .3))) + Math.sin(t * 5) * .04;
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.2, eout(cl((t - ti) / .3))) - Math.sin(t * 5) * .04;
      this.q.scale.setScalar(pop(t, .9, .35) * .75); this.q.rotation.z = Math.sin(t * 3) * .12;
      c.ev('whoosh', .05, .4); if (t > ti) c.ev('pop', ti, .5);
      cam([.1, 1.2, lerp(10.9, 10.3, ease(lt / 2.4))], [.1, 1.15, 0], 34);
      if (t > ti) etiqueta('¡SE INFLA!', [.5, -.2, .7], lt - ti, 58, '#ffd640', true);
      rotulo('¿Por qué la tortilla', 'se infla en el comal?', lt - .05, RY);
    }
  });

  // ---------- 2 · la masa tiene agua → con el calor se vuelve vapor ----------
  escena('masa', {
    setup() { const k = cocina(); ({ co: this.co, to: this.to } = comalTortilla(k, .55, 1.3, { tostada: 0 }));
      this.p = PM.chibi([-.85, 0, .3], { logo: true, boca: 'abierta', mira: 1, escala: .8 });
      this.lu = PM.lupa([.5, 2.0, .45], .56, { fondo: MASA }); this.vp = PM.vapor(this.lu.dentro, { r: .38 }); },
    update(lt, c) {
      const t = tw(lt), ta = c.w('agua') - .2, tc = c.w('calor') - .2, tv = c.w('vapor.') - .2;
      A.parpadea(this.p, t, 1.4); habla(this.p, t);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.15, eout(cl((t - ta + .3) / .4))) + Math.sin(t * 4) * .04;   // señala la lupa
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      const kf = cl((t - tc) / .4); this.co.fuego(Math.max(.001, .25 + .75 * kf), t);
      this.lu.scale.setScalar(pop(t, ta - .15, .35)); this.lu.rotation.z = Math.sin(t * 1.8) * .03;
      this.vp.update(t, 1 - ease(cl((t - tc - .2) / (tv + .2 - tc)))); this.vp.visible = t > ta - .15;
      this.to.infla(.15 * ease(cl((t - tv) / .6)));
      c.ev('pop', ta - .15, .4); if (t > tc) c.ev('whoosh', tc, .4); if (t > tv) c.ev('ding', tv, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > ta && t < tv) etiqueta('AGUA', [.5, -.2, .7], lt - ta, 54, '#ffffff', true);
      if (t > tv) etiqueta('¡VAPOR!', [.5, -.2, .7], lt - tv, 58, '#ffd640', true);
      if (t < tc) rotulo('La masa tiene', 'agua escondida', lt - .1, RY); else rotulo('El calor del comal', 'la vuelve vapor', lt - tc, RY);
    }
  });

  // ---------- 3 · corte: al voltearla, las dos caras se cuecen y atrapan el vapor ----------
  escena('capas', {
    setup() { const k = cocina({ ventana: false }); ({ co: this.co } = comalTortilla(k, .45, 1.2, { k: .3, tostada: .5 }));
      this.p = PM.chibi([-.95, 0, .3], { logo: true, boca: 'abierta', mira: 1, escala: .78 });
      this.lu = PM.lupa([.42, 1.5, .45], .86, { fondo: 0xfff1d6 });
      this.to = PM.tortilla([0, -.12, .03], { w: 1.5, alto: .46, grueso: .1, corte: true }, this.lu.dentro); },
    update(lt, c) {
      const t = tw(lt), tvo = c.w('voltearla,') - .25, tca = c.w('caras') - .2, tcu = c.w('cuecen') - .2, tat = c.w('atrapan') - .2;
      A.parpadea(this.p, t + .7, .9); habla(this.p, t); this.co.fuego(1, t);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.1, eout(cl((t - .2) / .4))) + Math.sin(t * 4) * .04;
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .03;
      this.lu.scale.setScalar(pop(t, -.1, .35)); this.lu.rotation.z = Math.sin(t * 1.8) * .025;
      // volteo de cartulina (vertical) + brinquito
      const kv = cl((t - tvo) / .5), cv = Math.cos(kv * Math.PI * 2); this.to.scale.y = Math.abs(cv) < .05 ? .05 * Math.sign(cv || 1) : cv; this.to.position.y = -.12 + Math.sin(kv * Math.PI) * .18;
      this.to.tuesta(ease(cl((t - tcu) / .4)));
      this.to.infla(.45 * ease(cl((t - tat) / .7))); this.to.vapor(t, cl((t - tat) / .3));
      if (t > tvo) c.ev('whoosh', tvo, .4); if (t > tcu) c.ev('pop', tcu, .4); if (t > tat) c.ev('ding', tat, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tca && t < tat) etiqueta('2 CARAS', [.42, .25, .7], lt - tca, 54, '#ffffff', true);
      if (t > tat) etiqueta('VAPOR ATRAPADO', [.25, .25, .7], lt - tat, 46, '#ffd640', true);
      rotulo('Al voltearla', 'se cuecen las dos caras', lt - .1, RY);
    }
  });

  // ---------- 4 · el vapor empuja: ¡globo! = bien cocida ----------
  escena('globo', {
    setup() { const k = cocina(); ({ co: this.co, to: this.to } = comalTortilla(k, .38, 1.5, { tostada: .8, alto: .5 }));
      this.p = PM.chibi([-.9, 0, .3], { logo: true, boca: 'abierta', mira: 1, escala: .8 });
      this.ok = PM.marca([.38, 2.35, .5], true, .7); },
    update(lt, c) {
      const t = tw(lt), te = c.w('empuja') - .2, tg = c.w('globo:') - .25, tb = c.w('bien') - .2;
      A.parpadea(this.p, t + 2, 1.1); this.co.fuego(1, t);
      this.to.infla(.15 + .85 * eout(cl((t - te) / (tg + .3 - te))) + (t > tg + .3 ? Math.sin((t - tg) * 6) * .02 : 0)); this.to.tuesta(.8);
      this.to.flechas(t, t > tb ? Math.max(0, 1 - (t - tb) * 3) : cl((t - te + .1) / .3));
      this.p.boca(t > tb ? 'feliz' : 'abierta'); if (t < tb) habla(this.p, t); else this.p.head.rotation.z = this.p.head.r0 - .06 + Math.sin(t * 4) * .03;
      const kf = eout(cl((t - tb) / .35));   // festeja
      this.p.brazos[0].rotation.z = -lerp(-this.p.brazos[0].r0, 2.3, kf) + Math.sin(t * 6) * .05; this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.3, kf) - Math.sin(t * 6) * .05;
      this.p.position.y = t > tb ? Math.abs(Math.sin((t - tb) * 8)) * .05 : 0;
      this.ok.scale.setScalar(pop(t, tb, .35) * .7);
      if (t > te) c.ev('whoosh', te, .4); if (t > tg) c.ev('pop', tg, .5); if (t > tb) c.ev('ding', tb, .6);
      cam([.0, 1.2, lerp(10.4, 9.9, ease(lt / 5))], [.0, 1.15, 0], 34);
      if (t > te && t < tg) etiqueta('¡EMPUJA!', [.38, -.2, .7], lt - te, 56, '#ffffff', true);
      if (t > tg && t < tb) etiqueta('¡COMO GLOBO!', [.38, -.2, .7], lt - tg, 54, '#ffffff', true);
      if (t > tb) etiqueta('¡BIEN COCIDA!', [.38, -.2, .7], lt - tb, 56, '#ffd640', true);
      if (t < tb) rotulo('El vapor empuja', 'y la infla como globo', lt - .1, RY); else rotulo('Señal de que', 'quedó bien cocida', lt - tb, RY);
    }
  });

  // ---------- 5 · remate: la abuelita la voltea con los dedos ----------
  escena('remate', {
    setup() { const k = cocina(); ({ co: this.co, to: this.to } = comalTortilla(k, .15, 1.2, { k: .6, tostada: .8 }));
      this.p = PM.chibi([-1.0, 0, .3], { logo: true, boca: 'feliz', mira: 1, escala: .8 });
      this.ab = abuelita([.93, 0, .5], .85); },
    update(lt, c) {
      const t = tw(lt), tv = c.w('voltea') - .1, tq = c.w('quemarse.') - .2;
      A.parpadea(this.p, t, .3); A.parpadea(this.ab, t, 1.9); habla(this.p, t); this.co.fuego(1, t);
      // la abuelita estira el brazo hacia el comal y la voltea con los dedos
      const kb = eout(cl((t - tv + .45) / .35)), kr = cl((t - tv - .55) / .35), bb = this.ab.brazos[0];
      bb.rotation.z = lerp(bb.r0, -1.25, kb * (1 - kr)) + Math.sin(t * 3) * .03; this.ab.brazos[1].rotation.z = this.ab.brazos[1].r0 + Math.sin(t * 2.5) * .03;
      const kv = cl((t - tv) / .5), cv = Math.cos(kv * Math.PI * 2); this.to.scale.y = Math.abs(cv) < .05 ? .05 * Math.sign(cv || 1) : cv;
      this.to.position.y = this.co.topY + .035 + Math.sin(kv * Math.PI) * .45; this.to.infla(.6 + Math.sin(t * 5) * .03); this.to.tuesta(.8);
      this.ab.head.rotation.z = this.ab.head.r0 + Math.sin(t * 2.2) * .05;
      if (t > tq) { const ojo = this.ab.head.ojos?.[1]; if (ojo && t < tq + .9) ojo.scale.y = .12; }   // ¡guiño!
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 - .1 + Math.sin(t * 3) * .04; this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3 + 1) * .03;
      if (t > tv) c.ev('whoosh', tv, .4); if (t > tq) c.ev('ding', tq, .5);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      etiqueta('MÁNDASELO', [-.95, -.2, .7], lt - .1, 50, '#ffd640', true);
      if (t > tq) etiqueta('¡SIN QUEMARSE!', [.55, -.2, .7], lt - tq, 46, '#ffffff', true);
      rotulo('Mándaselo a tu abuelita', 'que voltea sin quemarse', lt - .05, RY);
    }
  });
  P.cierre();
}
