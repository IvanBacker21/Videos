// Short 21-nov 13:30 · CARTULINA CHIBI: ¿por qué el maíz de palomitas truena y el de los esquites no?
// Cada grano guarda un poquito de agua; al calentarse se vuelve vapor; la cáscara del maíz palomero es dura e impermeable, la presión sube
// hasta que revienta y el almidón se infla como espuma. Los que no truenan tienen la cáscara dañada y el vapor se fuga.
// Fuentes: Scientific American (Explore the pop in popcorn), ScienceAlert (Mystery solved: how popcorn pops; Virot y Ponomarenko, 2015).
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-21-1330-palomitas-truenan.json OUT ../ejemplos/2026-11-21-1330-palomitas-truenan.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw, blob, tubo } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, ROJO = 0xff4d5e, MAIZ = 0xffd34d;
  const amb = c => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const sala = () => { amb(0xcfe6d8); PM.cuarto({ sinVentana: true, pared: 0xcfe6d8 }); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const cocina = () => { amb(0xfbe6c8); PM.cocina(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = .02, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };
  const amigo = (pos, o = {}) => PM.chibi(pos, { ropa: 0xff8a3d, pantalon: 0x2b2f4a, tenis: 0xffc83d, colPelo: 0x1d1410, lentes: true, boca: 'feliz', ...o });

  // ---- piezas locales ----
  // mesita de madera (top en y = h)
  const mesita = (pos, w = .8, h = .72) => { const g = group(pos); PM.pz(F.rect(w, .1, .03), 0xc98f5e, [0, h - .05, 0], g, { tinta: .016, papel: .05 });
    for (const sx of [-1, 1]) PM.pz(F.rect(.08, h - .1, .02), 0xa8703f, [sx * (w / 2 - .1), (h - .1) / 2, -.02], g, { tinta: .014, papel: .04 }); return g; };
  // palomera de rayas rojas (fondo en y = 0); o.llena: copete de palomitas
  const palomera = (pos, o = {}, parent = null) => { const g = group(pos, parent), w = o.w ?? .62, h = w * 1.05;
    PM.pz(F.poly([[-w * .38, 0], [w * .38, 0], [w * .5, h], [-w * .5, h]]), 0xffffff, [0, 0, 0], g, { tinta: .016, papel: .05 });
    for (const k of [-.3, 0, .3]) PM.det(F.poly([[(k - .09) * w * .76, .02], [(k + .09) * w * .76, .02], [(k + .09) * w, h - .02], [(k - .09) * w, h - .02]]), ROJO, [0, 0, .014], g);
    PM.det(F.rect(w * .5, h * .22, .03), 0xffd640, [0, h * .55, .018], g);
    if (o.llena !== false) for (const [x, y, r] of [[-.3, .02, .17], [-.1, .1, .19], [.12, .08, .18], [.32, 0, .15], [0, .22, .16], [-.2, .2, .13], [.22, .22, .13]])
      PM.pz(F.circ(r * w * .75), 0xfffaf0, [x * w, h + y * w, -.01 - r * .01], g, { tinta: .012, papel: .04 });
    g.h = h; return g; };
  // vaso de esquites (fondo en y = 0)
  const esquites = (pos, w = .5) => { const g = group(pos), h = w * 1.05;
    PM.pz(F.poly([[-w * .38, 0], [w * .38, 0], [w * .5, h], [-w * .5, h]]), 0xf4f1ea, [0, 0, 0], g, { tinta: .016, papel: .05 });
    PM.det(F.rect(w * .9, h * .12, .01), 0x2ec4a6, [0, h * .7, .014], g);
    PM.pz(blob([[-w * .5, h], [-w * .42, h + w * .2], [-w * .1, h + w * .32], [w * .25, h + w * .28], [w * .5, h]]), MAIZ, [0, 0, -.01], g, { tinta: .014, papel: .05 });
    for (let i = 0; i < 9; i++) PM.det(F.elipse(.035, .028), i % 3 ? 0xffe680 : 0xf2b630, [(i / 8 - .5) * w * .8, h + .05 + ((i * 37) % 5) * .025, .006], g);
    PM.det(tubo([[-w * .35, h + .1], [-w * .1, h + .18], [w * .1, h + .12], [w * .3, h + .17]], .025, .025), 0xffffff, [0, 0, .012], g);   // mayonesa
    for (const [x, y] of [[-.2, .14], [.05, .2], [.22, .1]]) PM.det(F.circ(.018), 0xe0452a, [x * w, h + y, .016], g);                     // chile
    const cu = PM.pz(F.rect(.05, w * .7, .02), 0xffffff, [w * .25, h + w * .3, -.02], g, { tinta: .01, papel: .03 }); cu.rotation.z = -.35;
    return g; };
  // manómetro (aguja de 0 = izquierda a 1 = derecha, zona roja al final)
  const manometro = (pos, r = .3) => { const g = group(pos);
    PM.pz(F.circ(r), 0xffffff, [0, 0, 0], g, { tinta: .018, papel: .06 });
    [[0x2ec4a6, Math.PI * .62, Math.PI], [0xffc83d, Math.PI * .32, Math.PI * .62], [ROJO, 0, Math.PI * .32]].forEach(([c, a0, a1]) => PM.det(F.arco(r * .72, r * .18, a0, a1), c, [0, -.02, .016], g));
    g.ag = group([0, -.02, .03], g); PM.pz(F.poly([[-.025, 0], [.025, 0], [0, r * .78]]), 0x2b2f4a, [0, 0, 0], g.ag, { tinta: false, papel: false });
    PM.pz(F.circ(.045), 0x2b2f4a, [0, -.02, .04], g, { tinta: false, papel: false });
    PM.pz(F.rect(.12, .16, .02), 0x9aa3b5, [0, -r - .06, -.02], g, { tinta: .012, papel: .03 });
    g.nivel = (k, t = 0) => { g.ag.rotation.z = Math.PI / 2 - Math.PI * cl(k) * .97 + Math.sin(t * 40) * .04 * (k > .7 ? 1 : 0); };
    g.nivel(0); return g; };
  // candado dorado
  const candado = (pos, s = 1, parent = null) => { const g = group(pos, parent); g.scale.setScalar(s);
    PM.pz(F.arco(.12, .05, 0, Math.PI), 0x9aa3b5, [0, .08, -.01], g, { tinta: .012, papel: .04 });
    PM.pz(F.rect(.32, .26, .04), 0xffc83d, [0, -.02, 0], g, { tinta: .014, papel: .05 }); PM.det(F.circ(.035), 0x5a3418, [0, .0, .016], g); PM.det(F.rect(.025, .07, .01), 0x5a3418, [0, -.05, .016], g); return g; };
  // tele con pantalla de "la peli va a empezar"
  const tele = pos => { const g = group(pos);
    PM.pz(F.rect(1.3, .82, .05), 0x2b2f4a, [0, 0, 0], g, { tinta: .016, papel: .05 }); PM.pz(F.rect(1.16, .68, .03), 0x3d6bff, [0, .0, .016], g, { tinta: false, papel: false });
    PM.det(F.poly([[-.1, -.13], [-.1, .13], [.14, 0]]), 0xffffff, [0, 0, .03], g); PM.det(F.rect(.9, .03, .01), 0x8fd3ff, [0, -.26, .03], g);
    PM.pz(F.rect(.5, .08, .02), 0x2b2f4a, [0, -.48, -.02], g, { tinta: .012, papel: .03 }); return g; };

  // ---------- 1 · gancho: vaso de esquites vs. palomera; los granos saltan de la palomera; ¿por qué? ----------
  escena('gancho', {
    setup() { sala();
      this.m1 = mesita([-.98, 0, .45], .8, .85); this.m2 = mesita([.98, 0, .45], .8, .85);
      this.es = esquites([-.98, .85, .55], .62); this.pa = palomera([.98, .85, .55], { w: .7 });
      this.sal = [0, 1, 2].map(i => PM.palomita([.92 + i * .1, 1.75, .7], .11, null, {}));
      this.p = PM.chibi([0, .02, .3], { logo: true, boca: 'abierta', escala: .78 });
      this.q = PM.pregunta([.4, 1.85, .6], .9); },
    update(lt, c) {
      const t = tw(lt), tp = c.w('palomitas') - .1, tr = c.w('truena') - .05, te = c.w('esquites') - .1, tn = c.w('no?') - .05;
      A.parpadea(this.p, t + 1.1, .4); respira(this.p, t); habla(this.p, t);
      this.es.scale.setScalar(1); this.pa.scale.setScalar(1); if (t > tp) this.pa.scale.y = 1 + .08 * Math.sin((t - tp) * 14) * (1 - cl((t - tp) / .8));
      // granos que brincan de la palomera, uno tras otro
      this.sal.forEach((g, i) => { const t0 = tr + i * .45, k = cl((t - t0) / .9); g.visible = t > t0 && k < 1; g.revienta(cl((t - t0) / .5));
        g.position.set(.98 + (i - 1) * .22 + k * (i - 1) * .25, 1.75 + Math.sin(k * Math.PI) * .5, .7); g.rotation.z = k * 4 * (i % 2 ? 1 : -1); });
      // voltea a ver la palomera y luego los esquites
      const mira = t < te ? lerp(0, 1, ease(cl((t - tp) / .3))) : lerp(1, -1, ease(cl((t - te) / .3)));
      A.ladea(this.p, .35 * Math.abs(mira), Math.sign(mira) || 1);
      this.p.brazos[1].rotation.z = this.p.brazos[1].r0 + (t > tp && t < te ? lerp(0, .9, eout(cl((t - tp) / .25))) : 0);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 - (t > te ? lerp(0, .9, eout(cl((t - te) / .25))) : 0);
      this.q.scale.setScalar(pop(t, tn, .35)); this.q.rotation.z = Math.sin(t * 5) * .1;
      if (t > tp) c.ev('pop', tp, .5); if (t > tr) c.ev('pop', tr, .6); if (t > tr + .45) c.ev('pop', tr + .45, .5); if (t > te) c.ev('whoosh', te, .4); if (t > tn) c.ev('ding', tn, .5);
      cam([0, 1.2, lerp(10.8, 10.4, ease(lt / 3))], [0, 1.15, 0], 34);
      if (t > tn) etiqueta('¿Y LOS ESQUITES NO?', [0, 2.5, .9], lt - tn, 44, '#ffd640', true);
      rotulo('¿Por qué las palomitas', 'truenan?', lt - .05, RY);
    }
  });

  // ---------- 2 · gotita: grano gigante en corte sobre el comal; la gotita se vuelve vapor ----------
  escena('gotita', {
    setup() { cocina();
      this.me = mesita([.48, 0, .2], 1.7, .62); this.co = PM.comal([.48, .62, .35], { w: 1.3, k: 0 });
      this.g = PM.palomita([.48, .62 + .41 + .53, .45], .62, null, { cara: 'feliz' });
      this.va = PM.vapor(this.g.corte, { r: .32, n: 13 }); this.va.scale.setScalar(.6); this.va.position.y = .06 * .99;
      this.oc = PM.ondasCalor([.48, 2.12, .5], null, { largo: .3, sep: .2 });
      this.p = PM.chibi([-.92, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .8 }); },
    update(lt, c) {
      const t = tw(lt), tg = c.w('granito') - .1, tgo = c.w('gotita') - .1, tc = c.w('calentarse') - .1, tv = c.w('vapor') - .1;
      A.parpadea(this.p, t + .3, 1.3); respira(this.p, t); habla(this.p, t); this.g.parpadea(t, 2.1);
      this.g.scale.setScalar(pop(t, tg, .4)); this.g.verCorte(ease(cl((t - tgo + .25) / .35)));
      this.g.cara.visible = t < tgo - .2;
      const kv = 1 - ease(cl((t - tv + .1) / .5)); this.va.update(t, kv);
      this.co.fuego(ease(cl((t - tc) / .4)), t); this.oc.update(t, ease(cl((t - tc - .3) / .4))); this.g.tiembla(t, t > tv ? .25 : 0);
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.9, eout(cl((t - tg) / .3))) + Math.sin(t * 4) * .05;   // señala el grano
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04;
      this.p.boca(t > tv ? 'feliz' : 'abierta');
      c.ev('whoosh', .05, .4); if (t > tg) c.ev('pop', tg, .4); if (t > tgo) c.ev('ding', tgo, .5); if (t > tc) c.ev('whoosh', tc, .5); if (t > tv) c.ev('whoosh', tv, .5);
      cam([0, 1.3, 10.4], [0, 1.25, 0], 34);
      if (t > tgo && t < tv) etiqueta('¡UNA GOTITA DE AGUA!', [0, 2.62, .9], lt - tgo, 40, '#8fd3ff', true);
      if (t > tv) etiqueta('¡SE VUELVE VAPOR!', [0, 2.62, .9], lt - tv, 44, '#ffd640', true);
      rotulo('Cada grano guarda', 'una gotita de agua', lt - .05, RY);
    }
  });

  // ---------- 3 · presión: cáscara con candado, el manómetro sube a rojo y ¡PUM! ----------
  escena('presion', {
    setup() { cocina();
      this.me = mesita([.3, 0, .2], 1.7, .62); this.co = PM.comal([.3, .62, .35], { w: 1.3 });
      this.g = PM.palomita([.3, .62 + .41 + .53, .45], .62, null, { cara: 'asustada' });
      this.ca = candado([.16, -.1, .06], .9, this.g.grano);
      this.ma = manometro([1.12, 2.1, .6], .26);
      this.p = PM.chibi([-1.0, .02, .3], { logo: true, boca: 'abierta', mira: 1, escala: .78 }); },
    update(lt, c) {
      const t = tw(lt), tca = c.w('cáscara') - .1, td = c.w('dura') - .1, tv = c.w('vapor') - .1, tr = c.w('revienta') - .05;
      A.parpadea(this.p, t + 2.4, .7); this.g.parpadea(t, .9); this.co.fuego(1, t);
      this.ca.scale.setScalar(.9 * pop(t, tca, .35));
      const kp = t < tr ? lerp(.15, .95, ease(cl((t - tv) / (tr - tv)))) : lerp(.95, .05, ease(cl((t - tr) / .5)));
      this.ma.nivel(kp, t); this.g.tiembla(t, t < tr ? cl((kp - .15) / .8) : 0);
      this.g.grano.scale.set(1 + .06 * cl((kp - .3) / .6), 1 + .04 * cl((kp - .3) / .6), 1);
      if (t > tr) this.g.revienta(cl((t - tr) / .7)); if (t > tr + .1) this.g.ponCara('feliz');
      // el chibi se tapa los oídos y luego brinca
      const ko = ease(cl((t - tv - .6) / .3)), sal = t > tr ? Math.abs(Math.sin((t - tr) * 9)) * .12 * (1 - cl((t - tr) / .9)) : 0;
      this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -2.75, ko); this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.75, ko);
      A.preocupa(this.p, t < tr ? ko : 0); this.p.boca(t < tv ? 'abierta' : t < tr ? 'apretada' : 'abierta'); this.p.position.y = .02 + sal + (t < tr ? Math.abs(Math.sin(t * 2.6)) * .02 : 0);
      if (t < tv) habla(this.p, t);
      c.ev('whoosh', .05, .4); if (t > tca) c.ev('pop', tca, .4); if (t > td) c.ev('ding', td, .4); if (t > tr) c.ev('impact', tr, .8);
      cam([0, 1.3, 10.4], [0, 1.25, 0], 34);
      if (t > td && t < tr) etiqueta('¡CÁSCARA DURA!', [-.15, 2.62, .9], lt - td, 46, '#ffffff', true);
      if (t > tr) etiqueta('¡PUM!', [0, 2.62, .9], lt - tr, 70, '#ffd640', true);
      rotulo('La cáscara no deja', 'escapar el vapor', lt - .05, RY);
    }
  });

  // ---------- 4 · espuma: el almidón se infla; el grano con la cáscara rota se desinfla sin tronar ----------
  escena('espuma', {
    setup() { cocina(); this.me = mesita([0, 0, .2], 3.0, .62);
      this.a = PM.palomita([-.6, .62 + .5, .35], .62, null, { cara: 'feliz' }); this.a.verCorte(1);
      this.b = PM.palomita([.8, .62 + .42, .35], .52, null, { cara: 'triste', grieta: true });
      this.fu = PM.aliento([.04, .3, .05], this.b, { n: 4, color: 0xd6ecff });
      this.x = PM.marca([1.15, 1.85, .6], false, .7); },
    update(lt, c) {
      const t = tw(lt), ti = c.w('infla') - .1, tes = c.w('espuma') - .1, tn = c.w('truenan') - .25, tca = c.w('cáscara') - .1;
      this.a.parpadea(t, .5); this.b.parpadea(t, 1.9);
      this.a.revienta(cl((t - ti) / 1.0)); this.a.scale.setScalar(t > tes ? 1 + .08 * Math.sin((t - tes) * 6) * (1 - cl((t - tes) / 1.5)) : 1);
      this.a.position.y = .62 + .5 - (t > ti ? .27 * ease(cl((t - ti) / .5)) : 0);
      this.b.scale.setScalar(pop(t, tn, .35)); this.b.tiembla(t, t > tn ? .35 : 0); this.fu.update(t, t > tn + .3 ? 1 : 0, 1, .55, .55);
      this.x.scale.setScalar(.7 * pop(t, tca, .3));
      c.ev('whoosh', .05, .4); if (t > ti) c.ev('pop', ti, .7); if (t > tn) c.ev('whoosh', tn, .5); if (t > tca) c.ev('ding', tca, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tes - .1 && t < tn) etiqueta('¡COMO ESPUMA!', [-.3, 2.55, .9], lt - tes + .1, 48, '#ffd640', true);
      if (t > tca) etiqueta('¡CÁSCARA ROTA!', [0, 2.55, .9], lt - tca, 48, '#ffffff', true);
      rotulo(t < tn ? 'El almidón se infla' : 'Cáscara rota: el vapor', t < tn ? 'como espuma' : 'se escapa y no truena', lt - .05, RY);
    }
  });

  // ---------- 5 · remate: el amigo con la palomera vacía y la peli ni empieza; avioncito ----------
  escena('remate', {
    setup() { sala(); this.tv = tele([0, 2.0, -2.4]); this.tv.scale.setScalar(.8);
      this.a = amigo([-.8, .02, .3], { escala: .8, mira: 1 });
      this.pa = palomera([0, -.68, .12], { w: .5, llena: false }, this.a.brazos[1]);
      this.mi = PM.tierrita([0, .4, .05], 0xfffaf0, 8, this.pa);
      this.p = PM.chibi([.8, .02, .3], { logo: true, boca: 'abierta', mira: -1, escala: .8 });
      this.av = PM.avion([.8, 1.3, .9], .45); },
    update(lt, c) {
      const t = tw(lt), tma = c.w('Mándaselo') - .1, tac = c.w('acaba') - .1, tem = c.w('empiece') - .1;
      A.parpadea(this.a, t + .6, .4); A.parpadea(this.p, t + 2.0, 1.6); respira(this.a, t, .02, 1); respira(this.p, t);
      // el amigo voltea la palomera: ¡vacía! y se relame
      const kv = eout(cl((t - tac) / .35)), br = this.a.brazos[1];
      br.rotation.z = lerp(br.r0 + .7, br.r0 + 2.0, kv); this.pa.rotation.z = -br.rotation.z + lerp(0, -2.6, kv);
      this.mi.update(t, t > tac + .2 && t < tac + 1.6 ? 1 : 0, 1, .2, .35);
      this.a.boca(t > tac + .3 ? 'lengua' : 'feliz'); this.a.head.rotation.z = this.a.head.r0 + Math.sin(t * 4) * .05;
      this.a.brazos[0].rotation.z = this.a.brazos[0].r0 - .1 + Math.sin(t * 3) * .04;
      this.p.boca(t > tem ? 'apretada' : 'abierta'); A.preocupa(this.p, ease(cl((t - tem) / .3)) * .6); if (t < tem) habla(this.p, t);
      this.p.brazos[0].rotation.z = this.p.brazos[0].r0 + Math.sin(t * 3) * .04;
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 2.3, eout(cl((t - tma) / .3))) - lerp(0, 1.2, ease(cl((t - tma - .4) / .3)));   // lanza el avioncito
      const ka = cl((t - tma - .45) / 1.4); this.av.visible = t > tma + .45 && ka < 1; this.av.position.set(lerp(.8, 1.75, ease(ka)), 1.35 + Math.sin(ka * Math.PI) * .9 + ka * .4, .9); this.av.rotation.z = .5 - ka * .3;
      c.ev('whoosh', .05, .4); if (t > tma + .45) c.ev('whoosh', tma + .45, .5); if (t > tac) c.ev('pop', tac, .4); if (t > tem) c.ev('ding', tem, .5);
      cam([0, 1.2, lerp(10.4, 10.0, ease(lt / 3.5))], [0, 1.15, 0], 34);
      if (t > tem) etiqueta('¡Y NI EMPEZÓ LA PELI!', [0, 2.5, .9], lt - tem, 42, '#ffd640', true);
      rotulo('Mándaselo a quien se', 'acaba las palomitas', lt - .05, RY);
    }
  });
  P.cierre();
}
