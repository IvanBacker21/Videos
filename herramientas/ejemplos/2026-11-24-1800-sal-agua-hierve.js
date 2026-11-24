// Short 24-nov 18:00 · CARTULINA CHIBI: ¿la sal hace que el agua hierva más rápido?
// Mito: la sal disuelta SUBE un poquito el punto de ebullición (aumento ebulloscópico); con la pizca de la cocina son fracciones de grado: ni se nota.
// Truco real: taparla reduce la pérdida de calor por evaporación y hierve antes.
// Fuentes: Live Science, University of Illinois Physics Van, Mental Floss.
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-24-1800-sal-agua-hierve.json OUT ../ejemplos/2026-11-24-1800-sal-agua-hierve.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, PARED = 0xfbe6c8, TOP = .6, ZO = -1.0, CZ = 10.4, CY = 1.15, V = new THREE.Vector3();
  const cocina = () => { ambiente({ top: PARED, bottom: PARED, fog: PARED, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); const k = PM.cocina({ topY: TOP }); P.luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); return k; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 6 + f) * .05; };
  const respira = (p, t, f = 0) => { p.position.y = Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const yo = (x, es = .8, mira = 1, boca = 'abierta') => PM.chibi([x, 0, .3], { logo: true, boca, mira, escala: es });
  const mama = (x, es = .9, o = {}) => PM.chibi([x, 0, .3], { pelo: 'cola', ropa: 0xff6b9b, pantalon: 0x2b2f4a, tenis: 0x7b5cff, colPelo: 0x2a1a12, aretes: true, boca: 'feliz', mira: 1, escala: es, ...o });
  const olla = (x, o = {}) => PM.ollaTapa([x, TOP + .25, ZO], { w: .9, ...o });
  const manoMundo = (p, i) => { p.updateMatrixWorld(true); return p.brazos[i].children.find(c => Math.abs(c.position.y + .5) < 1e-6).getWorldPosition(V).clone(); };
  // punto a profundidad z que se ve en el mismo lugar de pantalla que (x, y) a profundidad za (cámara en x = cx)
  const proy = (x, y, za, z, cx = 0) => { const s = (CZ - z) / (CZ - za); return [cx + (x - cx) * s, CY + (y - CY) * s]; };
  // salero de cartulina (boca hacia +y)
  const salero = (pos) => { const g = group(pos); PM.pz(F.rect(.15, .22, .05), 0xffffff, [0, 0, 0], g, { tinta: .012, papel: .05 });
    PM.det(F.rect(.1, .05, .01), 0x3d9bff, [0, -.01, .016], g); PM.pz(F.rect(.16, .07, .03), 0xb8c0cf, [0, .14, .005], g, { tinta: .01, papel: .03 });
    for (const x of [-.035, 0, .035]) PM.det(F.circ(.012), 0x34313d, [x, .14, .024], g); return g; };
  // granitos de sal que caen de a hasta b (mundo)
  const granos = (n = 9) => { const gs = Array.from({ length: n }, (_, i) => { const q = PM.pz(F.rect(.035, .035, .005), 0xffffff, [0, -9, .5], null, { tinta: .006, papel: false }); q.f = i / n; q.dx = ((i * .618) % 1 - .5) * .1; return q; });
    return (t, k, a, b) => gs.forEach(q => { const f = (t * 1.5 + q.f) % 1; q.visible = k > .02; q.position.set(lerp(a[0], b[0], f) + q.dx * f, lerp(a[1], b[1], f) - Math.sin(f * Math.PI) * -.08, .5); q.rotation.z = t * 6 + q.f * 9; q.scale.setScalar(Math.max(.001, k)); }); };
  // termómetro de cartulina: g.nivel(f 0..1) sube la columna roja; marcas a la altura fh (azul = sin sal) y fs (roja = con sal)
  const termo = (pos, H = 1.35, fh = .72, fs = .76) => { const g = group(pos); const c0 = -H / 2 + .06, L = H - .16;
    PM.pz(F.rect(.2, H, .1), 0xffffff, [0, 0, 0], g, { tinta: .016, papel: .05 }); PM.pz(F.circ(.15), 0xff5b5b, [0, -H / 2, .01], g, { tinta: .014, papel: .04 });
    PM.det(F.rect(.07, L, .03), 0xf1e6e6, [0, c0 + L / 2, .016], g);
    const col = group([0, c0, .02], g); PM.det(F.rect(.07, 1, .03), 0xff5b5b, [0, .5, 0], col);
    for (let i = 1; i < 9; i++) PM.det(F.rect(.05, .012, .005), 0x8a93a8, [-.07, c0 + L * i / 9, .016], g);
    g.mh = PM.det(F.rect(.3, .03, .01), 0x3d6bff, [0, c0 + L * fh, .03], g); g.ms = PM.det(F.rect(.3, .03, .01), 0xff2f5b, [0, c0 + L * fs, .032], g);
    g.nivel = f => col.scale.y = Math.max(.001, L * f); g.nivel(.2); g.yM = f => c0 + L * f; return g; };

  // ---------- 1 · gancho: mamá le echa sal a la olla "para que hierva rápido" ----------
  escena('gancho', {
    setup() { cocina(); this.o = olla(.2, { w: .82, tapa: 'no' });
      this.m = mama(-.62, .92); this.s = salero([0, 0, .45]); this.gr = granos();
      this.p = yo(1.08, .72, -1); this.q = PM.pregunta([.85, 2.1, .5], .55, 0xffc83d); this.q.scale.setScalar(.001); },
    update(lt, c) {
      const t = tw(lt), ts = c.w('sal') - .1, tr = c.w('rápido?') - .1;
      A.parpadea(this.m, t + .9, .3); A.parpadea(this.p, t + .3, 1.2); respira(this.m, t); respira(this.p, t, 1.3);
      this.o.fuego(1, t); this.o.hierve(t, .35); this.o.vapor(t, .35);
      // mamá sube el brazo y sacude el salero sobre la olla
      const ku = eout(cl((t - .05) / .35)), sac = Math.sin(t * 16) * .07 * (t > ts ? 1 : 0);
      this.m.brazos[1].rotation.z = this.m.brazos[1].r0 + lerp(.2, 2.3, ku) + sac; this.m.brazos[0].rotation.z = this.m.brazos[0].r0 - .35;
      const h = manoMundo(this.m, 1); this.s.position.set(h.x + .04, h.y + .12, .45); this.s.rotation.z = lerp(0, -2.0, ku) + sac * 1.5;
      const boca = [h.x + .2, h.y + .02], dst = proy(this.o.position.x, this.o.position.y + this.o.topAgua, ZO, .5);
      this.gr(t, t > ts ? 1 : 0, boca, [dst[0] + .05, dst[1] + .02]);
      this.m.boca(t > ts ? 'feliz' : 'abierta'); habla(this.m, t);
      this.p.boca('apretada'); A.preocupa(this.p, ease(cl((t - tr) / .4))); this.p.head.rotation.z = this.p.head.r0 + .12 * ease(cl((t - tr) / .4));
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - .2 + Math.sin(t * 3) * .04;
      this.q.scale.setScalar(.55 * pop(t, tr, .35)); this.q.rotation.z = Math.sin(t * 5) * .12;
      c.ev('whoosh', .02, .4); if (t > ts) c.ev('pop', ts, .4); if (t > tr) c.ev('ding', tr, .5);
      cam([0, 1.2, lerp(10.9, 10.4, ease(lt / 3))], [0, 1.15, 0], 34);
      if (t > ts) etiqueta('¿MÁS RÁPIDO?', [.1, 2.35, .9], lt - ts, 52, '#ffd640', true);
      rotulo('¿La sal hace hervir', 'el agua más rápido?', lt - .05, RY);
    }
  });

  // ---------- 2 · al revés: el termómetro marca que con sal hierve un pelito MÁS alto ----------
  escena('mito', {
    setup() { cocina(); this.o = olla(.45, { w: .95, tapa: 'no' }); this.o.hierve(0, 0);
      this.tm = termo([.62, TOP + .25 + .75, ZO - .02]);
      this.x = PM.marca([-.25, 2.05, .6], false, .001);
      this.p = yo(-.98, .8); },
    update(lt, c) {
      const t = tw(lt), trv = c.w('revés:') - .1, th = c.w('hierva') - .1, tp = c.w('poquito') - .1;
      A.parpadea(this.p, t + .5, .8); respira(this.p, t); habla(this.p, t);
      this.o.fuego(1, t); this.o.hierve(t, t > th + .5 ? 1 : .3); this.o.vapor(t, t > th + .5 ? .8 : .3);
      this.tm.nivel(lerp(.25, .72, ease(cl((t - th) / .6))) + .04 * ease(cl((t - tp) / .5)) + Math.sin(t * 5) * .003);
      this.tm.mh.visible = t > th; this.tm.ms.visible = t > tp;
      this.x.scale.setScalar(t > trv && t < th + .3 ? .9 * pop(t, trv, .35) : .001); this.x.rotation.z = Math.sin(t * 6) * .1;
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + lerp(.2, 1.35, eout(cl((t - th) / .35))) + Math.sin(t * 4) * .04;
      this.p.boca(t > tp ? 'abierta' : t > trv ? 'feliz' : 'abierta'); A.preocupa(this.p, t > trv && t < th ? .6 : 0);
      c.ev('whoosh', .05, .4); if (t > trv) c.ev('pop', trv, .4); if (t > th) c.ev('whoosh', th, .5); if (t > tp) c.ev('ding', tp + .2, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > trv && t < th) etiqueta('¡ES AL REVÉS!', [-.25, 2.5, .9], lt - trv, 52, '#ffd640', true);
      if (t > th && t < tp) etiqueta('HIERVE AQUÍ', [.1, 2.5, .9], lt - th, 44, '#ffffff', true);
      if (t > tp) etiqueta('¡UN POQUITO MÁS ALTO!', [.05, 2.5, .9], lt - tp, 40, '#ffd640', true);
      rotulo('La sal sube un poquito', 'la temperatura de hervor', lt - .05, RY);
    }
  });

  // ---------- 3 · una pizca: con lupa la diferencia es diminuta ----------
  escena('pizca', {
    setup() { cocina(); this.o = olla(.78, { w: .72, tapa: 'no' });
      this.p = yo(-1.0, .8); this.gr = granos(4);
      this.lu = PM.lupa([.05, 1.62, .5], .56, { fondo: 0xfff4dc });
      const d = this.lu.dentro; PM.det(F.rect(.3, 1.3, .02), 0xffffff, [0, 0, 0], d); PM.det(F.rect(.12, 1.3, .02), 0xf1e6e6, [0, 0, .005], d);
      this.colL = group([0, -.65, .01], d); PM.det(F.rect(.12, 1, .02), 0xff5b5b, [0, .5, 0], this.colL);
      PM.det(F.rect(.5, .04, .01), 0x3d6bff, [0, -.03, .02], d); PM.det(F.rect(.5, .04, .01), 0xff2f5b, [0, .03, .022], d);
      this.fl = group([.3, 0, .03], d); PM.det(F.rect(.025, .06, .01), 0x1f1b2e, [0, 0, 0], this.fl); PM.det(F.circ(.035), 0x1f1b2e, [0, .04, 0], this.fl); },
    update(lt, c) {
      const t = tw(lt), tz = c.w('pizca,') - .1, td = c.w('diferencia') - .1, tc = c.w('chiquita') - .1, tn = c.w('nota.') - .1;
      A.parpadea(this.p, t + 1.7, 1.0); respira(this.p, t); habla(this.p, t);
      this.o.fuego(1, t); this.o.hierve(t, .8); this.o.vapor(t, .6);
      // pellizca sal con los dedos sobre la olla
      const ka = eout(cl((t - (tz - .4)) / .35)), kb = ease(cl((t - td - .2) / .3));
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + lerp(.2, 1.9, ka) * (1 - kb) + Math.sin(t * 14) * .04 * ka * (1 - kb);
      const h = manoMundo(this.p, 1), dst = proy(this.o.position.x, this.o.position.y + this.o.topAgua, ZO, .5);
      this.gr(t, t > tz && t < td + .2 ? 1 : 0, [h.x + .05, h.y - .05], [dst[0] - .1, dst[1] + .02]);
      // la lupa aparece con la "diferencia"; en "ni se nota" se encoge de hombros
      this.lu.scale.setScalar(pop(t, td, .35)); this.lu.rotation.z = Math.sin(t * 1.8) * .03;
      this.colL.scale.y = 1 + Math.sin(t * 4) * .004 + .65 - .02; this.fl.scale.setScalar(Math.max(.001, pop(t, tc, .3)));
      const ks = ease(cl((t - tn) / .3));
      if (t > tn) { this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - 1.0 * ks; this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + 1.0 * ks; }
      else this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04;
      this.p.boca(t > tn ? 'feliz' : 'abierta');
      c.ev('whoosh', .05, .4); if (t > tz) c.ev('pop', tz, .4); if (t > td) c.ev('pop', td, .5); if (t > tn) c.ev('ding', tn, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tc && t < tn) etiqueta('UN PELITO', [.05, 2.5, .9], lt - tc, 48, '#ffffff', true);
      if (t > tn) etiqueta('¡NI SE NOTA!', [.05, 2.5, .9], lt - tn, 54, '#ffd640', true);
      rotulo('Con una pizca', 'la diferencia ni se nota', lt - .05, RY);
    }
  });

  // ---------- 4 · el truco: tapa la olla y el calor ya no se escapa ----------
  escena('tapa', {
    setup() { cocina(); this.o = olla(-.25, { w: 1.0 });
      this.p = yo(1.02, .82, -1); this.ok = PM.marca([.3, 2.0, .6], true, .001); },
    update(lt, c) {
      const t = tw(lt), tv = c.w('verdad:') - .1, tt = c.w('tapa') - .1, to = c.w('olla,') - .1, tca = c.w('calor') - .1, te = c.w('escapa.') - .1;
      A.parpadea(this.p, t + .3, 1.5); respira(this.p, t); habla(this.p, t, 1);
      // él levanta la tapa (brazo izquierdo) y la pone; la tapa sigue su mano hasta que baja
      const ku = eout(cl((t - .1) / .4)), kd = ease(cl((t - tt) / (to + .25 - tt))), kr = ease(cl((t - to - .3) / .35));
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - lerp(.2, 2.1, ku) * (1 - kr) + lerp(0, .5, kd) * (1 - kr) - .2 * kr;
      const h = manoMundo(this.p, 0), hp = proy(h.x, h.y + .12, .3, ZO), ox = this.o.position.x, oy = this.o.position.y;
      this.o.tapa(kd > .999 ? 1 : 0);
      if (kd < .999) { const tp = this.o.tapaG, e = kd, x0 = hp[0] - ox, y0 = hp[1] - oy; tp.position.set(lerp(x0, 0, e), lerp(y0, this.o.topAgua + .025, e) + Math.sin(e * Math.PI) * .15, .07); tp.rotation.z = lerp(.35, 0, e); }
      this.o.fuego(1, t); this.o.hierve(t, 1); this.o.vapor(t, 1); this.o.traquetea(t, ease(cl((t - tca) / .4)));
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + Math.sin(t * 3) * .05;
      this.p.boca(t > tca ? 'feliz' : 'abierta');
      this.ok.scale.setScalar(.8 * pop(t, te, .35));
      c.ev('whoosh', .05, .4); if (t > tv) c.ev('pop', tv, .4); if (t > to) c.ev('impact', to + .2, .5); if (t > te) c.ev('ding', te, .6);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tv && t < tca) etiqueta('EL TRUCO DE VERDAD', [0, 2.5, .9], lt - tv, 44, '#ffffff', true);
      if (t > tca) etiqueta('¡HIERVE ANTES!', [0, 2.5, .9], lt - tca, 52, '#ffd640', true);
      rotulo('Truco: ponle tapa', 'y el calor no se escapa', lt - .05, RY);
    }
  });

  // ---------- 5 · remate: le enseña el video a su mamá ----------
  escena('remate', {
    setup() { cocina(); this.o = olla(.05, { w: .8, tapa: 1 });
      this.m = mama(-.82, .9, { boca: 'apretada' }); this.p = yo(.85, .8, -1, 'feliz');
      this.ce = PM.celular([0, 0, .6], { h: .5, pct: 70 }); this.ce.rotation.z = .12; },
    update(lt, c) {
      const t = tw(lt), tma = c.w('mamá,') - .1, tj = c.w('jura') - .1, tac = c.w('acelera.') - .1;
      A.parpadea(this.m, t + .4, .4); A.parpadea(this.p, t + 1.1, 1.6); respira(this.m, t); respira(this.p, t, 1.2); habla(this.p, t);
      this.o.fuego(1, t); this.o.tapa(1); this.o.hierve(t, 1); this.o.vapor(t, 1); this.o.traquetea(t, 1);
      // él le muestra el celular con el brazo izquierdo
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - lerp(.2, 1.45, eout(cl((t - .05) / .35))) + Math.sin(t * 4) * .03;
      const h = manoMundo(this.p, 0); this.ce.position.set(h.x - .02, h.y + .2, .6);
      // mamá: brazos en jarra → manos abiertas de sorpresa ("¡ah, caray!")
      const ks = ease(cl((t - tj) / .35));
      this.m.brazos[0].rotation.z = this.m.brazos[0].r0 + lerp(.35, -1.35, ks) + Math.sin(t * 8) * .06 * ks; this.m.brazos[1].rotation.z = this.m.brazos[1].r0 + lerp(-.35, 1.35, ks) - Math.sin(t * 8 + 1) * .06 * ks;
      this.m.boca(t > tj ? 'abierta' : 'apretada'); A.preocupa(this.m, ks); this.m.head.rotation.z = this.m.head.r0 + Math.sin(t * 7) * .04 * ks;
      this.p.boca(t > tac ? 'feliz' : 'abierta');
      c.ev('whoosh', .05, .4); if (t > tma) c.ev('pop', tma, .4); if (t > tj) c.ev('ding', tj + .1, .5);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3))], [0, 1.15, 0], 34);
      if (t > tj) etiqueta('¡AH, CARAY!', [-.6, 2.5, .9], lt - tj, 52, '#ffd640', true);
      rotulo('Mándaselo a tu mamá,', 'la de la sal en el agua', lt - .05, RY);
    }
  });
  P.cierre();
}
