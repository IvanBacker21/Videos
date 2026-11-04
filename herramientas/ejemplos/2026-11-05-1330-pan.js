// Short 3D: ¿Por qué el pan con mantequilla siempre cae al revés?
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-05-1330-pan.json OUT ../ejemplos/2026-11-05-1330-pan.js
export async function build(E) {
  const { THREE, box, cyl, ball, plane, group, persona, mat, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl } = E;
  const TABLE_H = 0.75, EDGE = 0.6;
  const COC = { top: 0x30364f, bottom: 0xd59a63, fog: 0x3b3a4f, near: 6, far: 26, sunColor: 0xffe2bf, sunInt: 2.6, hemiInt: 1.0 };

  function cocina(tableH = TABLE_H) {
    // piso de mosaico
    for (let x = -6; x < 6; x++) for (let z = -6; z < 4; z++) box(.5, .02, .5, (x + z) % 2 ? 0xcfc6b8 : 0xb9ae9e, [x * .5 + .25, -.01, z * .5 + .25]);
    box(12, 4, .2, 0xe8dcc8, [0, 2, -3]);                       // pared
    box(1.6, 1.2, .05, 0x9fd0ff, [-1.2, 1.9, -2.88], null, { emissive: 0x9fd0ff, ei: .35 }); // ventana
    box(1.7, .08, .1, 0xffffff, [-1.2, 1.28, -2.85]); box(.06, 1.25, .08, 0xffffff, [-1.2, 1.9, -2.84]);
    box(3, .9, .6, 0x5b7c99, [1.8, .45, -2.6]); box(3.05, .05, .65, 0xe9e2d6, [1.8, .92, -2.6]); // alacena
    // mesa
    const t = group([0, 0, 0]);
    box(1.2, .05, .8, 0xb07a4a, [0, tableH, 0], t);
    const legs = [];
    for (const [x, z] of [[-.55, -.35], [.55, -.35], [-.55, .35], [.55, .35]]) legs.push(box(.06, tableH, .06, 0x8a5a33, [x, tableH / 2, z], t));
    box(.28, .02, .28, 0xf4f1ea, [.15, tableH + .035, .1], t);   // plato
    cyl(.05, .04, .1, 0xff6b5a, [-.3, tableH + .075, -.15], t, 12); // taza
    return { t, legs };
  }
  function setTableH(m, h) { m.t.children[0].position.y = h; m.legs.forEach(l => { l.scale.y = h / TABLE_H; l.position.y = h / 2; });
    m.t.children.slice(5).forEach(c => c.position.y = h + (c.geometry.type === 'CylinderGeometry' ? .075 : .035)); }

  function pan(parent) {
    const g = group([0, 0, 0], parent);
    box(.22, .026, .22, 0xb8743c, [0, 0, 0], g);               // corteza (pan un poco más grande que la vida real para que se lea)
    box(.195, .028, .195, 0xe6b875, [0, .001, 0], g);          // miga
    g.butter = box(.15, .01, .15, 0xffe066, [0, .019, 0], g, { rough: .4 });
    return g;
  }
  // Pan resbalando del borde: p 0..1 (caída), vueltas = medias vueltas totales al llegar al piso
  function caida(g, p, h, vueltas = 1, x0 = EDGE) {
    const fall = p * p;                                           // gravedad
    g.position.set(x0 + .05 + .38 * p, lerp(h + .05, .02, fall), .05);
    g.rotation.z = -Math.PI * vueltas * Math.pow(p, 1.2);
  }
  function aterrizado(g, x0 = EDGE, abajo = true) { g.position.set(x0 + .43, .02, .05); g.rotation.z = abajo ? -Math.PI : -2 * Math.PI; }

  // 1 · gancho
  escena('gancho', {
    setup() { ambiente(COC); this.m = cocina(); this.toast = pan(); this.toast.position.set(.35, TABLE_H + .04, .05); this.pers = persona({ pos: [-1.1, 0, .2], shirt: 0x6f9bd6 }); this.pers.rotation.y = .9; },
    update(lt, c) {
      const tf = 1.0, dur = 1.5;
      if (lt < tf) { const p = ease(lt / tf); this.toast.position.set(lerp(.35, EDGE + .02, p), TABLE_H + .04, .05); this.toast.rotation.z = -.15 * p; }
      else if (lt < tf + dur) caida(this.toast, (lt - tf) / dur, TABLE_H, 1);
      else { aterrizado(this.toast); const s = 1 + .25 * Math.exp(-(lt - tf - dur) * 8) * Math.sin((lt - tf - dur) * 40); this.toast.scale.set(s, 1 / s, s); }
      if (lt > tf + dur) { c.ev('impact', tf + dur, .7); this.pers.armL.rotation.z = lerp(0, 2.6, ease((lt - tf - dur) / .3)); this.pers.armR.rotation.z = -this.pers.armL.rotation.z; }
      cam([lerp(1.9, 1.5, ease(lt / 5)), lerp(1.15, .8, ease(lt / 5)), 1.9], [EDGE * .8, TABLE_H * .6, 0], 40);
      rotulo('No es mala suerte', 'es física', lt - c.f(1), 1330); if (lt > c.f(1)) c.ev('pop', c.f(1));
    }
  });
  // 2 · gira
  escena('gira', {
    setup() { ambiente(COC); this.m = cocina(); this.toast = pan();
      this.arrow = new THREE.Mesh(new THREE.TorusGeometry(.13, .008, 6, 32, Math.PI * 1.2), mat(0xf3c54d, { emissive: 0xf3c54d, ei: .4 }));
      this.arrow.position.set(EDGE + .14, TABLE_H - .02, .2); E.world.add(this.arrow); },
    update(lt, c) {
      const p = cl(lt / 3.2);
      if (p < .25) { this.toast.position.set(lerp(.4, EDGE + .02, p / .25), TABLE_H + .04, .05); this.toast.rotation.z = 0; }
      else caida(this.toast, (p - .25) / .75 * .55, TABLE_H, 1);
      this.arrow.rotation.z = -lt * 2.5; this.arrow.scale.setScalar(Math.max(.01, spring((lt - .9) / .6)));
      cam([EDGE + .25, TABLE_H + .1, 1.5], [EDGE + .15, TABLE_H - .12, 0], 34);
      rotulo('Empieza a girar', 'en cuanto se resbala', lt - c.w('girar'), 1330); if (lt > c.w('girar')) c.ev('whoosh', c.w('girar'), .5);
    }
  });
  // 3 · media vuelta
  escena('media', {
    setup() { ambiente(COC); this.m = cocina();
      this.ghosts = [0, .25, .5, .75, 1].map((q, k) => { const g = pan(); caida(g, q, TABLE_H, 1); g.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = .35 + .13 * k; } }); g.visible = false; return g; });
      for (let k = 0; k < 12; k++) box(.012, .035, .012, 0xffffff, [EDGE + .62, .03 + k * .062, .05], null, { emissive: 0xffffff, ei: .5 }); },
    update(lt, c) {
      this.ghosts.forEach((g, k) => { g.visible = lt > .25 + k * .35; });
      cam([EDGE + .7, .55, 2.5], [EDGE + .4, .4, 0], 38);
      etiqueta('75 cm', [EDGE + .8, .42, .05], lt - .3, 52, '#f3c54d');
      rotulo('Media vuelta', 'y ya llegó al piso', lt - c.w('media'), 1330); if (lt > c.w('media')) c.ev('pop', c.w('media'));
    }
  });
  // 4 · aterriza
  escena('aterriza', {
    setup() { ambiente(COC); this.m = cocina(); this.toast = pan();
      this.splat = cyl(.14, .14, .002, 0xffe066, [EDGE + .43, .002, .05], null, 16, { rough: .3 }); this.splat.scale.set(.01, 1, .01); },
    update(lt, c) {
      const ta = .55;
      if (lt < ta) caida(this.toast, .6 + .4 * (lt / ta), TABLE_H, 1); else aterrizado(this.toast);
      if (lt > ta) { c.ev('impact', ta, .9); const s = eout((lt - ta) / .25) * 1.15; this.splat.scale.set(s, 1, s * .8);
        const q = 1 + .3 * Math.exp(-(lt - ta) * 9) * Math.sin((lt - ta) * 45); this.toast.scale.set(q, 1 / q, q); }
      cam([EDGE + .85, .2, .7], [EDGE + .43, .03, .05], 40);
      rotulo('Mantequilla abajo', '¡plaf!', lt - ta - .1, 1330);
    }
  });
  // 5 · mesa de 3 m
  escena('mesa', {
    setup() { ambiente({ ...COC, far: 40 }); this.m = cocina(); this.toast = pan(); },
    update(lt, c) {
      const grow = einout(lt / 1.6); const h = lerp(TABLE_H, 3.0, grow); setTableH(this.m, h);
      const tf = 1.9, dur = 1.6;
      if (lt < tf) { this.toast.position.set(EDGE - .1, h + .04, .05); this.toast.rotation.z = 0; }
      else if (lt < tf + dur) caida(this.toast, (lt - tf) / dur, h, 2);
      else { aterrizado(this.toast, EDGE, false); }
      if (lt > tf + dur) c.ev('ding', tf + dur, .7);
      cam([2.6, lerp(1.2, 1.9, grow), 4.4], [EDGE, lerp(.6, 1.5, grow), 0], 40);
      etiqueta('3 m', [EDGE + .5, h / 2, .05], lt - .8, 64, '#f3c54d');
      rotulo('Mesa de 3 metros', 'así sí cae bien', lt - c.w('tres'), 1330); if (lt > c.w('tres')) c.ev('pop', c.w('tres'));
    }
  });
  // 6 · remate
  escena('remate', {
    setup() { ambiente(COC); this.m = cocina(); this.toast = pan(); aterrizado(this.toast);
      this.pers = persona({ pos: [1.25, 0, -.5], shirt: 0xff7a59 }); this.pers.rotation.y = -0.8; },
    update(lt, c) {
      const k = Math.sin(lt * 5) * .15; this.pers.head.rotation.x = .35 + k * .3; this.pers.armL.rotation.z = 2.4 + k; this.pers.armR.rotation.z = -2.4 - k;
      cam([lerp(2.4, 2.1, ease(lt / 2.7)), 1.8, lerp(5.2, 4.7, ease(lt / 2.7))], [.8, .8, -.2], 40);
      rotulo('Mándaselo', 'a quien siempre se le cae el pan', lt - c.w('mándaselo'), 1330); if (lt > c.w('mándaselo')) c.ev('pop', c.w('mándaselo'));
    }
  });
}
