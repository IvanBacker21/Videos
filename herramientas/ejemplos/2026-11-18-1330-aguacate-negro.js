// Short 18-nov 13:30 · CARTULINA CHIBI: ¿Por qué el guacamole se pone negro? (células rotas + enzima + oxígeno del aire; el hueso solo protege lo que tapa; limón y plástico pegado)
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-18-1330-aguacate-negro.json OUT ../ejemplos/2026-11-18-1330-aguacate-negro.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, PARED = 0xfbe6c8;
  const luz = () => P.luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 });
  const cocina = (o) => { ambiente({ top: PARED, bottom: PARED, fog: PARED, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); const k = PM.cocina(o); luz(); return k; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 6 + f) * .05; };
  const brazos = (p, t, k1 = 0, k0 = 0) => { p.brazos[1].rotation.z = lerp(p.brazos[1].r0, 1.15, k1) + Math.sin(t * 4) * .04; p.brazos[0].rotation.z = -lerp(-p.brazos[0].r0, 1.15, k0) + Math.sin(t * 3 + 1) * .03; };
  // molcajete sobre la barra (las patitas tocan la cubierta)
  const molca = (k, x, w, o = {}) => PM.molcajete([x, k.topY + w * .38, -1.0], { w, ...o });

  // ---------- 1 · gancho: el guacamole se pone café ----------
  escena('gancho', {
    setup() { const k = cocina(); this.m = molca(k, .5, 1.35);
      this.p = PM.chibi([-.8, 0, .3], { logo: true, boca: 'abierta', mira: 1, escala: .85 });
      this.q = PM.pregunta([-.25, 2.3, .5], .75, 0xffc83d); this.q.traverse(m => m.castShadow = false); },
    update(lt, c) {
      const t = tw(lt), tn = c.w('negro?') - .1;
      A.parpadea(this.p, t + 1.3, .6); habla(this.p, t);
      this.m.oxida(ease(cl((t - .25) / (tn + .2 - .25))));
      A.preocupa(this.p, eout(cl((t - .6) / .4)));
      brazos(this.p, t, eout(cl((t - .4) / .35)) * .9, 0);
      this.p.position.y = t > tn ? Math.abs(Math.sin((t - tn) * 9)) * .04 * Math.max(0, 1 - (t - tn) * 1.5) : 0;
      this.q.scale.setScalar(pop(t, .9, .35) * .75); this.q.rotation.z = Math.sin(t * 3) * .12;
      c.ev('whoosh', .05, .4); if (t > tn) c.ev('pop', tn, .5);
      cam([.1, 1.2, lerp(10.9, 10.3, ease(lt / 2.6))], [.1, 1.15, 0], 34);
      if (t > tn) etiqueta('¡SE PONE NEGRO!', [.5, -.2, .7], lt - tn, 50, '#ffd640', true);
      rotulo('¿Por qué el guacamole', 'se pone negro?', lt - .05, RY);
    }
  });

  // ---------- 2 · al cortarlo se rompen las celulitas y reaccionan con el aire ----------
  escena('corte', {
    setup() { const k = cocina({ ventana: false }); const y = k.topY + .42;
      this.en = PM.aguacate([-.25, y, -.9], { r: .38, entero: true });
      this.a = PM.aguacate([-.25, y, -.9], { r: .38 });
      this.p = PM.chibi([-1.0, 0, .3], { logo: true, boca: 'abierta', mira: 1, escala: .78 });
      this.lu = PM.lupa([.62, 1.85, .45], .66, { fondo: 0xf1f3c4 });
      this.cel = []; for (const [x, y] of [[-.3, .3], [0, .34], [.3, .3], [-.36, 0], [0, 0], [.36, 0], [-.3, -.3], [0, -.34], [.3, -.3]]) {
        this.cel.push(group([x, y, 0], this.lu.dentro)); }
      // celulitas: pulpa verde-amarilla; algunas rotas (grieta) se ponen cafés al tocarlas el aire
      this.cel.forEach((ce, i) => { const rota = i % 2 === 0;
        PM.pz(P.F.circ(.14), 0xc9dc5a, [0, 0, 0], ce, { tinta: .012, papel: false }); PM.det(P.F.circ(.09), 0xe6ec8a, [0, 0, .014], ce);
        ce.cafe = PM.det(P.F.circ(.13), 0x8a6626, [0, 0, .02], ce); ce.cafe.scale.setScalar(.001);
        ce.grieta = PM.det(P.tubo([[-.08, .1], [-.02, .03], [-.06, -.02], [.04, -.1]], .018, .018), 0x5a4a1a, [0, 0, .026], ce); ce.grieta.visible = false; ce.rota = rota; });
      this.o2 = [0, 1, 2, 3, 4].map(i => { const b = PM.pz(P.F.circ(.055), 0x8fd3ff, [0, 0, .04], this.lu.dentro, { tinta: .01, papel: false }); b.i = i; return b; }); },
    update(lt, c) {
      const t = tw(lt), tc = c.w('cortar') - .05, tr = c.w('rompes') - .1, tce = c.w('celulitas,') - .2, tre = c.w('reacciona') - .15, tai = c.w('aire.') - .2;
      A.parpadea(this.p, t, 1.4); habla(this.p, t);
      brazos(this.p, t, eout(cl((t - tce + .3) / .4)), 0);
      // se parte: el entero se abre y aparece la mitad con pulpa
      const kc = cl((t - tc) / .25); this.en.visible = kc < .5; this.en.scale.x = Math.max(.001, 1 - kc * 2);
      this.a.visible = kc >= .5; this.a.scale.setScalar(kc >= .5 ? pop(t, tc + .12, .3) : .001); this.a.oxida(.75 * ease(cl((t - tai) / 1.0)));
      this.lu.scale.setScalar(pop(t, tce - .15, .35)); this.lu.rotation.z = Math.sin(t * 1.8) * .03;
      this.cel.forEach((ce, i) => { ce.grieta.visible = ce.rota && t > tr + .3 + i * .03; ce.rotation.z = Math.sin(t * 2 + i) * .06;
        ce.cafe.scale.setScalar(ce.rota ? Math.max(.001, ease(cl((t - tai - .1 - i * .06) / .5))) : .001); });
      const rot = [0, 2, 4, 6, 8];
      this.o2.forEach(b => { const d = this.cel[rot[b.i]].position, k = ease(cl((t - tre - b.i * .08) / .7)); b.visible = t > tre - .1;
        b.position.set(lerp(d.x * .4 + (b.i - 2) * .12, d.x + .06, k), lerp(.62, d.y + .1, k), .04); b.scale.setScalar(Math.max(.001, k < 1 ? 1 : 1 - cl((t - tai - .6) / .3))); });
      c.ev('whoosh', tc, .4); if (t > tc + .12) c.ev('pop', tc + .12, .4); c.ev('pop', tce - .15, .4); if (t > tai) c.ev('ding', tai, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tce && t < tre) etiqueta('CELULITAS ROTAS', [.45, -.2, .7], lt - tce, 44, '#ffffff', true);
      if (t > tre) etiqueta('+ AIRE = CAFÉ', [.45, -.2, .7], lt - tre, 50, '#ffd640', true);
      if (t < tre) rotulo('Al cortarlo rompes', 'sus celulitas', lt - .1, RY); else rotulo('Algo de adentro', 'reacciona con el aire', lt - tre, RY);
    }
  });

  // ---------- 3 · igual que la manzana mordida ----------
  escena('oxido', {
    setup() { const k = cocina(); const y = k.topY + .42;
      this.a = PM.aguacate([-.18, y + .08, -.9], { r: .48 }); this.mz = PM.manzana([.88, y - .02, -.9], .42);
      this.p = PM.chibi([-1.05, 0, .3], { logo: true, boca: 'abierta', mira: 1, escala: .76 }); },
    update(lt, c) {
      const t = tw(lt), tm = c.w('mismo') - .2, tca = c.w('café') - .2, tma = c.w('manzana') - .2;
      A.parpadea(this.p, t + .7, .9); habla(this.p, t);
      brazos(this.p, t, eout(cl((t - .1) / .4)) * .9, 0);
      const k = ease(cl((t - tca) / 1.3)); this.a.oxida(.2 + .8 * k); this.mz.oxida(k);
      this.a.rotation.z = Math.sin(t * 2.4) * .05; this.mz.rotation.z = Math.sin(t * 2.4 + 1.5) * .05;
      this.mz.scale.setScalar(pop(t, tm - .3, .35));
      c.ev('pop', tm - .3, .4); if (t > tca) c.ev('whoosh', tca, .4); if (t > tma + .4) c.ev('ding', tma + .4, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tm) etiqueta('=', [.36, 2.25, .7], lt - tm, 70, '#ffffff', true);
      if (t > tma) etiqueta('¡LO MISMO!', [.35, -.2, .7], lt - tma, 52, '#ffd640', true);
      rotulo('Igual que la', 'manzana mordida', lt - .1, RY);
    }
  });

  // ---------- 4 · mito del hueso: solo protege lo que tapa ----------
  escena('hueso', {
    setup() { const k = cocina(); this.m = molca(k, .4, 1.55, { hueso: true }); this.m.oxida(.9, 1.55 * .1);
      this.p = PM.chibi([-1.0, 0, .3], { logo: true, boca: 'abierta', mira: 1, escala: .78 });
      this.no = PM.letrero([.4, 2.35, .5], 'MITO', { w: 1.05, h: .4, borde: 0xff5b5b }); this.no.traverse(m => m.castShadow = false); },
    update(lt, c) {
      const t = tw(lt), tmi = c.w('Mito:') - .15, tp = c.w('protege') - .2;
      A.parpadea(this.p, t + 2, 1.1); habla(this.p, t);
      // quita el hueso: sube y se va a la derecha
      const kh = ease(cl((t - tmi - .1) / .5)), h = this.m.hueso; h.position.x = kh * .55; h.position.y = this.m.topY + .03 + Math.sin(kh * Math.PI) * .35 + kh * .12; h.rotation.z = -kh * 1.5;
      this.no.scale.setScalar(pop(t, tmi, .35)); this.no.columpia(t);
      this.p.boca(t > tmi ? 'apretada' : 'abierta'); A.preocupa(this.p, t > tmi ? 0 : .5);
      this.p.head.rotation.y = t > tmi && t < tmi + .9 ? Math.sin((t - tmi) * 14) * .25 : 0;   // dice que no con la cabeza
      brazos(this.p, t, eout(cl((t - tp) / .35)), 0);
      if (t > tmi) c.ev('pop', tmi, .5); if (t > tmi + .1) c.ev('whoosh', tmi + .1, .4); if (t > tp) c.ev('ding', tp, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > tp) etiqueta('SOLO LO QUE TAPA', [.4, -.2, .7], lt - tp, 44, '#ffd640', true);
      if (t < tmi) rotulo('¿Dejarle el hueso?', '', lt - .1, RY); else rotulo('Mito: solo protege', 'lo que tapa', lt - tmi, RY);
    }
  });

  // ---------- 5 · remate: limón + plástico pegadito; mándaselo ----------
  escena('remate', {
    setup() { const k = cocina(); this.m = molca(k, -.05, 1.15);
      this.li = PM.limon([-.05, 2.3, .4], .3); this.ok = PM.marca([-.05, 2.3, .5], true, .7); this.ok.traverse(m => m.castShadow = false); this.li.traverse(m => m.castShadow = false);
      this.p = PM.chibi([-1.05, 0, .3], { logo: true, boca: 'feliz', mira: 1, escala: .76 });
      this.ag = PM.chibi([.98, 0, .5], { ropa: 0xff6b5b, pantalon: 0x3d3a5a, pelo: 'cola', colPelo: 0x4a2a18, boca: 'feliz', mira: -1, escala: .78 });
      this.hu = PM.pz(P.F.elipse(.15, .13), 0x8a5a3a, [0, -.64, .12], this.ag.brazos[0], { tinta: .012, papel: .03 }); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('plástico') - .15, ts = c.w('sin') - .1, tsi = c.w('sirven.') - .2, tma = c.w('Mándaselo') - .1, th = c.w('hueso') - .3;
      A.parpadea(this.p, t, .3); A.parpadea(this.ag, t, 1.9); habla(this.p, t);
      const kl = pop(t, -.05, .3) * (1 - ease(cl((t - tp - .7) / .3))); this.li.scale.setScalar(Math.max(.001, kl)); this.li.exprime(t, cl(t / .2) * (1 - cl((t - tp - .5) / .3)));
      this.m.plastico(ease(cl((t - tp) / (ts + .2 - tp))));
      this.ok.scale.setScalar(pop(t, tsi, .35) * .7);
      brazos(this.p, t, t < tma ? eout(cl((t - .1) / .4)) * .8 : lerp(.8, 0, eout(cl((t - tma) / .4))), 0);
      // el amigo levanta el hueso: ¡él es!
      const kb = eout(cl((t - th) / .35)), bb = this.ag.brazos[0]; bb.rotation.z = lerp(bb.r0, -2.4, kb) + Math.sin(t * 5) * .04;
      this.ag.brazos[1].rotation.z = this.ag.brazos[1].r0 + Math.sin(t * 2.5) * .03; this.hu.visible = t > tma; this.hu.scale.setScalar(pop(t, tma, .3));
      this.ag.boca(t > th + .3 ? 'abierta' : 'feliz'); this.ag.head.rotation.z = this.ag.head.r0 + Math.sin(t * 2.2) * .05;
      if (t > tp) c.ev('whoosh', tp, .4); if (t > tsi) c.ev('ding', tsi, .5); if (t > tma) c.ev('pop', tma, .4);
      cam([.0, 1.2, 10.4], [.0, 1.15, 0], 34);
      if (t > ts && t < tma) etiqueta('¡SIN AIRE!', [-.05, -.2, .7], lt - ts, 52, '#ffd640', true);
      if (t > tma) etiqueta('MÁNDASELO', [-.95, -.2, .7], lt - tma, 50, '#ffd640', true);
      if (t < tma) rotulo('Limón y plástico pegado', 'sin aire: sí sirven', lt - .05, RY); else rotulo('Mándaselo a quien deja', 'el hueso al guacamole', lt - tma, RY);
    }
  });
  P.cierre();
}
