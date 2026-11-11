// Short de PRUEBA en estilo PAPEL RECORTADO: ¿Por qué duele TANTO pegarte en el dedo chiquito del pie?
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-11-papel-dedo.json OUT ../ejemplos/2026-11-11-papel-dedo.js
import { kitPapel } from '../motor3d/papel.js';
export async function build(E) {
  const { group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, pieza, fondo, luces, tw, persona, caminar, bam, rayitas } = P;
  const sinNiebla = (c) => ambiente({ top: c, bottom: c, fog: c, near: 80, far: 160, sunInt: .01, hemiInt: .01 });
  const RY = 1590;                                         // rótulos abajo (los pies quedan libres)
  const PIEL = 0xf0b98e;

  // cuarto de papel: pared, ventana con luna, piso, cama con su pata
  function cuarto(o = {}) {
    sinNiebla(0x9fc3e8); fondo(o.pared ?? 0x9fc3e8, -2.2); luces({ pos: [-2.5, 4, 7] });
    for (let k = 0; k < 6; k++) pieza(F.rect(.06, 6, 0), 0x8fb3dc, [-2.6 + k * 1.05, 2.4, -2.15], null, { sombra: false });   // rayas del tapiz
    const v = group([-1.15, 3.0, -2.05]); pieza(F.rect(1.1, 1.0, .04), 0x22306a, [0, 0, 0], v, { borde: .07, colorBorde: 0xffffff }); pieza(F.circ(.17), 0xffe9a8, [.22, .2, .03], v);
    pieza(F.rect(.06, 1.0, 0), 0xffffff, [0, 0, .03], v); pieza(F.rect(1.1, .06, 0), 0xffffff, [0, 0, .03], v);
    pieza(F.rect(9, 3, 0), 0xc98a55, [0, -1.5, -.6], null, { sombra: false });                                   // piso (de frente)
    for (let k = 0; k < 9; k++) pieza(F.rect(.03, 3, 0), 0xb57a48, [-4 + k, -1.5, -.58], null, { sombra: false });
    const cama = group([1.85, 0, -1.2]);
    pieza(F.rect(2.6, .5, .08), 0xffffff, [0, .85, 0], cama, { borde: .02 });                                     // colchón
    pieza(F.rect(2.7, .32, .1), 0x4fa3e0, [-.05, 1.12, .05], cama, { borde: .02 });                                // cobija
    pieza(F.rect(.7, .32, .14), 0xfff4d0, [-.85, 1.25, .1], cama, { borde: .02 });                                 // almohada
    pieza(F.rect(2.7, .28, .05), 0x8a5a33, [0, .52, .02], cama, { borde: .02 });                                   // base
    const pata = pieza(F.rect(.22, .62, .04), 0x6b4226, [-1.15, .3, .9], cama, { borde: .025 });                   // la pata culpable (al frente)
    return { cama, pata };
  }

  // ---------- 1 · gancho: caminas a oscuras… ¡PUM! con la pata de la cama ----------
  escena('gancho', {
    setup() { this.c = cuarto(); this.p = persona([-2.2, 0, 0], { ropa: 0xff7a59, pantalon: 0x2f3e66 }); this.b = bam([.75, .2, .5]); this.b.visible = false;
      this.r = rayitas([-.1, 1.0, .4], 3, 0xe0453a); this.r.visible = false; },
    update(lt, c) {
      const t = tw(lt), th = .95, w = ease(t / th);
      if (t < th) { this.p.position.x = lerp(-2.2, .35, w); caminar(this.p, t, 1); this.p.cara('feliz'); this.p.mira(1, 0); }
      else { const k = t - th; this.p.position.x = .35 - Math.min(k, .3) * .4; this.p.position.y = Math.abs(Math.sin(k * 12)) * .25;  // brinca en un pie
        this.p.legR.rotation.z = 1.2; this.p.armR.rotation.z = 1.0; this.p.armL.rotation.z = -2.3; this.p.legL.rotation.z = 0; this.p.rotation.z = Math.sin(k * 12) * .08;
        this.p.cara('grito', .35); this.p.mira(0, .6);
        this.b.visible = k < 1.3; this.b.scale.setScalar(Math.max(.01, spring(k / .3)) * (1 + Math.sin(k * 30) * .04)); this.r.visible = true; c.ev('impact', th, .9); }
      cam([lerp(.3, .6, ease(lt / 3.4)), 1.25, lerp(9.2, 8.2, ease(lt / 3.4))], [lerp(-.2, .3, ease(lt / 3.4)), 1.2, 0], 34);
      if (t > th) etiqueta('¡¿POR QUÉ DUELE TANTO?!', [.2, 3.0, 0], lt - c.w('duele') + .1, 52, '#ffffff', true);
      rotulo('El dedito chiquito', 'del pie', lt - .1, RY); c.ev('pop', .1);
    }
  });

  // ---------- 2 · fuerza: una pesa de "3 veces tu peso" cae sobre un dedito ----------
  function pie(pos, parent, s = 1) {               // pie visto desde arriba (dedos hacia arriba)
    const g = group(pos, parent); g.scale.setScalar(s);
    pieza(F.elipse(.62, 1.05), PIEL, [0, -.35, 0], g, { borde: .04 });
    g.dedos = [[-.42, .72, .2], [-.12, .82, .16], [.14, .8, .15], [.36, .7, .14], [.55, .52, .12]].map(([x, y, r], i) => {
      const d = group([x, y, .04], g); pieza(F.elipse(r, r * 1.2), PIEL, [0, 0, 0], d, { borde: .03 }); pieza(F.elipse(r * .55, r * .5), 0xffe2d2, [0, r * .35, .025], d, { sombra: false }); d.i = i; return d; });
    return g;
  }
  escena('fuerza', {
    setup() { sinNiebla(0xffe7c2); fondo(0xffe7c2, -2); luces({ pos: [-2, 4, 6] });
      for (let k = 0; k < 12; k++) pieza(F.circ(.08 + (k % 3) * .04), 0xffd49a, [(k % 4 - 1.5) * 1.3, (Math.floor(k / 4) - 1) * 2.2 + 1, -1.9], null, { sombra: false });
      this.pie = pie([0, -.3, 0], null, 1.45);
      this.pesa = group([.8, 6, .3]); pieza(F.poly([[-.55, -.4], [.55, -.4], [.4, .45], [-.4, .45]]), 0x3a3f4a, [0, 0, 0], this.pesa, { borde: .04 });
      pieza(F.arco(.22, .1, 0, Math.PI), 0x3a3f4a, [0, .45, 0], this.pesa, { borde: .02 });
      this.b = bam([.8, 1.0, .5]); this.b.visible = false; this.r = rayitas([.8, 2.0, .4], 3); this.r.visible = false; },
    update(lt, c) {
      const t = tw(lt), tg = c.w('dedito') - .25, cae = cl((t - (c.w('tres') - .2)) / (tg - c.w('tres') + .2));
      this.pesa.position.y = lerp(5.2, 1.45, cae * cae); this.r.visible = cae > 0 && cae < 1;
      const d = this.pie.dedos[4];
      if (t > tg) { const k = t - tg; d.scale.set(1.35, .45, 1); d.children[0].papel.material = P.M(0xe0605a); this.b.visible = k < 1.5; this.b.scale.setScalar(Math.max(.01, spring(k / .25)));
        this.pesa.position.y = 1.45 + Math.abs(Math.sin(k * 9)) * .08 * Math.max(0, 1 - k); c.ev('impact', tg, .9); }
      const sh = t > tg && t < tg + .35 ? Math.sin(t * 80) * .06 : 0;
      cam([sh, .9, 8.6], [0, .9, 0], 34);
      etiqueta('3 × TU PESO', [.8, 2.35, .4], lt - c.w('tres'), 60, '#ffd640', true); etiqueta('KG', [this.pesa.position.x, this.pesa.position.y - .05, .5], lt - c.w('tres'), 54, '#ffffff');
      rotulo('Hasta 3 veces tu peso', 'en un solo dedito', lt - c.w('fuerza'), RY);
    }
  });

  // ---------- 3 · sin cojín: el dedo por dentro (piel delgadita, hueso y nervios) ----------
  escena('cojin', {
    setup() { sinNiebla(0x2f4a7a); fondo(0x2f4a7a, -2); luces({ pos: [-2, 3, 6], suelo: 0x223355 });
      const d = group([0, 1.0, 0]); this.d = d;
      pieza(F.rect(2.2, 3.4, .95), 0xf0b98e, [0, 0, 0], d, { borde: .05 });                                   // piel
      pieza(F.rect(1.98, 3.18, .85), 0xffe08a, [0, 0, .03], d);                                                 // grasa (capa delgadita)
      pieza(F.rect(1.86, 3.06, .8), 0xf7c9b0, [0, 0, .05], d);                                                  // carne
      pieza(F.rect(.9, 2.4, .42), 0xfffaf0, [0, -.1, .08], d, { borde: .025, colorBorde: 0xd9cbb4 });           // hueso
      pieza(F.rect(1.2, .5, .22), 0xffd9e0, [0, 1.45, .1], d, { borde: .02 });                                  // uña
      this.nervios = [-.62, .62, -.3].map((x, i) => { const pts = []; for (let k = 0; k <= 10; k++) pts.push([x + (k % 2 ? .07 : -.07), -1.3 + k * .26]); const sh = new THREE_SHAPE(pts); return pieza(sh, 0xffd640, [0, 0, .12], d, { sombra: false }); });
      this.pata = pieza(F.rect(.9, 1.6, .06), 0x6b4226, [4, 1.2, .3], null, { borde: .03 });
      this.b = bam([1.25, 1.0, .5]); this.b.visible = false; },
    update(lt, c) {
      const t = tw(lt), tg = c.w('golpe') - .1, k = t - tg;
      this.pata.position.x = k < 0 ? lerp(4, 1.65, ease(t / tg)) : 1.65 + Math.min(k, .4) * .6;
      const on = k > 0 && Math.floor(k * 8) % 2 === 0;                                                          // nervios parpadean
      this.nervios.forEach(n => { n.papel.material = P.M(on ? 0xfff6a0 : 0xffd640); n.scale.x = on ? 1.4 : 1; });
      if (k > 0) { this.b.visible = k < 1.2; this.b.scale.setScalar(Math.max(.01, spring(k / .25)) * .7); this.d.rotation.z = Math.sin(k * 40) * .03 * Math.max(0, 1 - k); c.ev('zap', tg, .8); }
      cam([0, .9, 11.2], [0, .85, 0], 34);
      etiqueta('CASI SIN GRASA', [-.45, 2.55, .3], lt - c.w('grasa'), 46, '#ffe08a', true);
      if (k > 0) etiqueta('¡NERVIOS!', [0, -.95, .3], k - .2, 58, '#ffd640', true);
      rotulo('Sin cojín', 'el golpe va directo a los nervios', lt - c.w('amortigüe'), RY);
    }
  });
  function THREE_SHAPE(pts) { const s = new E.THREE.Shape(); const w = .045; s.moveTo(pts[0][0] - w, pts[0][1]); pts.forEach(([a, b]) => s.lineTo(a - w, b)); for (let i = pts.length - 1; i >= 0; i--) s.lineTo(pts[i][0] + w, pts[i][1]); return s; }

  // ---------- 4 · dos dolores: el rayo sube rapidísimo… y el ardor, lento ----------
  escena('olas', {
    setup() { sinNiebla(0xfff1dc); fondo(0xfff1dc, -2.2); luces({ pos: [-2, 4, 6] });
      this.p = persona([0, -1.45, -1.2], { ropa: 0xd9e6f2, pantalon: 0xc6d4e4, piel: 0xf3d9c4, pelo: 0xd8c2ae, escala: 1.62 }); this.p.cara('o', .3);
      this.cer = group([0, 2.15, .2]); pieza(F.nube(.62), 0xff9ab8, [0, 0, 0], this.cer, { borde: .03 }); for (let k = 0; k < 3; k++) pieza(F.arco(.12, .035, 0, Math.PI), 0xe0608a, [-.22 + k * .22, .02, .03], this.cer, { sombra: false });
      this.ray = pieza(F.rayo(.5), 0xffd640, [.21, -1.3, .4], null, { borde: .03 });
      this.ard = pieza(F.circ(.18), 0xe0453a, [.21, -1.3, .38], null, { borde: .03 }); this.ard.visible = false; },
    update(lt, c) {
      const t = tw(lt), tr = c.w('rayo') - .2, ta = c.w('ardor') - .25;
      const ur = cl((t - tr) / .35); this.ray.position.y = lerp(-1.3, 1.9, eout(ur)); this.ray.visible = t > tr && ur < 1;   // rápido
      if (ur >= 1 && t < ta) { this.cer.scale.setScalar(1 + Math.sin(t * 30) * .06); }
      if (t > tr) c.ev('zap', tr, .7);
      this.ard.visible = t > ta; const ua = cl((t - ta) / 2.2); this.ard.position.y = lerp(-1.3, 1.9, ua); this.ard.scale.setScalar(1 + Math.sin(t * 8) * .15);   // lento
      if (t > ta) c.ev('heartbeat', ta, .6);
      cam([0, .7, 10.4], [0, .6, 0], 36);
      if (t > tr) etiqueta('1 · ¡RAYO!', [.95, 1.5, .4], lt - tr, 52, '#e0a800', true);
      if (t > ta) etiqueta('2 · ARDOR…', [-.9, .2, .4], lt - ta, 52, '#e0453a', true);
      rotulo('Duele dos veces', 'primero el rayo y luego el ardor', lt - .1, RY);
    }
  });

  // ---------- 5 · remate: uno brinca de dolor, el otro se ríe con el celular ----------
  escena('remate', {
    setup() { cuarto(); this.a = persona([-.75, 0, 0], { ropa: 0x4a8bff, peinado: 'chino', pelo: 0x2a1a12 }); this.b = persona([.95, 0, -.2], { ropa: 0xffc94d, peinado: 'largo', pelo: 0x5a3220 });
      this.tel = group([0, -.62, .06], this.b.armL); pieza(F.rect(.2, .34, .04), 0x1d1f26, [0, 0, 0], this.tel, { borde: .02 }); pieza(F.rect(.15, .26, .03), 0x25d366, [0, 0, .025], this.tel, { sombra: false });
      this.r = rayitas([-1.35, 1.0, .4], 3, 0xe0453a); },
    update(lt, c) {
      const t = tw(lt);
      this.a.position.y = Math.abs(Math.sin(t * 10)) * .22; this.a.legR.rotation.z = 1.1; this.a.armR.rotation.z = .9; this.a.armL.rotation.z = -2.0 + Math.sin(t * 10) * .3; this.a.cara('grito', .4); this.a.rotation.z = Math.sin(t * 10) * .07;
      this.b.armL.rotation.z = -.9 + Math.sin(t * 3) * .05; this.b.armR.rotation.z = .5 + Math.sin(t * 14) * .25; this.b.cara(t > .6 ? 'risa' : 'feliz', -.15); this.b.mira(-1, 0); this.b.head.rotation.z = Math.sin(t * 14) * .08;
      cam([.15, 1.3, 8.6], [.1, 1.2, 0], 34);
      etiqueta('JAJAJA', [.95, 2.85, .3], lt - .7, 48, '#ffffff', true);
      rotulo('Mándaselo', 'al que siempre se pega con la cama', lt - .05, RY); c.ev('pop', .05);
    }
  });
  P.cierre();
}
