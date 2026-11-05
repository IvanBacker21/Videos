// Short 3D: ¿Por qué sientes que te caes cuando te estás quedando dormido? (sacudida hípnica)
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-04-2130-caida.json OUT ../ejemplos/2026-11-04-2130-caida.js
// Usa los sets reutilizables del motor: setCuarto, setCielo, nubesCaida, cama/acostar (MEJORAS 0).
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, mat, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    AMB, setCuarto, setCielo, nubesCaida, acostar } = E;
  const BED = [0, .62, -1.25];             // centro aproximado del colchón

  // Durmiente en la cama: persona acostada + cobija encima. Devuelve {p, cob}
  function durmiente(r, shirt = 0x6f9bd6) {
    const p = persona({ shirt, pants: 0x34405e }); p.scale.setScalar(.8); acostar(p, [0, .7, -.42]);
    r.cama.cobija.position.set(0, .86, .5); r.cama.cobija.scale.set(1, 1.3, .8);   // cobija hasta la cintura: se ve la camisa y los brazos
    r.cama.almohada.position.y = .66;
    return p;
  }
  // brinco del durmiente: s = tiempo desde el brinco
  function brinco(p, cob, s) {
    if (s < 0) return; const k = Math.max(0, Math.sin(Math.min(s / .45, 1) * Math.PI)) * Math.exp(-s * 1.5);
    p.position.y = .7 + .45 * k; cob.position.y = .86 + .38 * k; cob.rotation.z = .12 * k;
    const arm = -1.4 * eout(s / .15) * Math.exp(-s * 1.2); p.armL.rotation.x = arm; p.armR.rotation.x = arm;
    p.armL.rotation.z = .15 + .9 * k; p.armR.rotation.z = -.15 - .9 * k;
  }

  // 1 · gancho: cuarto de noche, alguien se duerme... y brinca
  escena('gancho', {
    setup() { ambiente(AMB.cuartoNoche); this.r = setCuarto({ noche: true, cobija: 0x4f6fb3 }); this.p = durmiente(this.r); },
    update(lt, c) {
      const tc = c.w('caes'), tb = c.w('brincas');
      // antes del brinco: respiración lenta; en "caes" la cámara cae un poco (vértigo)
      this.p.torso.scale.y = 1 + .03 * Math.sin(lt * 3);
      const drop = lt > tc ? Math.sin(Math.min((lt - tc) / .5, 1) * Math.PI) * .35 : 0;
      brinco(this.p, this.r.cama.cobija, lt - tb);
      const sh = lt > tb ? .05 * Math.exp(-(lt - tb) * 4) * Math.sin(lt * 70) : 0;
      cam([lerp(1.9, 1.25, ease(lt / 5)) + sh, lerp(2.3, 1.7, ease(lt / 5)) - drop, lerp(1.0, .35, ease(lt / 5))], [0, .78 - drop * .6, -1.3], 44);
      if (lt > tc) c.ev('whoosh', tc, .8); if (lt > tb) c.ev('impact', tb, .9);
      if (lt < tb - .05) rotulo('¿Sientes que te caes?', 'justo cuando te duermes', lt - .15, 1330);
      else rotulo('¡Y brincas!', 'en la cama', lt - tb, 1330);
      etiqueta('Zzz', [.3, 1.3 + (lt % 1.6) * .35, -1.9], lt < tb ? .5 : -1, 64, '#cfd8ff');
    }
  });

  // 2 · nombre: diez personas en un escenario, siete brincan
  escena('nombre', {
    setup() {
      ambiente({ top: 0x1a1838, bottom: 0x4a2f6a, fog: 0x1a1838, near: 9, far: 30, sunColor: 0xffe2c0, sunInt: 2.3, hemiInt: 1.0 });
      const piso = cyl(4.2, 4.4, .2, 0x3b345e, [0, -.1, 0], null, 24); piso.receiveShadow = true;
      const aro = new THREE.Mesh(new THREE.TorusGeometry(4.25, .05, 6, 48), mat(0xf3c54d, { emissive: 0xf3c54d, ei: .5 })); aro.rotation.x = Math.PI / 2; aro.position.y = .02; E.world.add(aro);
      const cols = [0x6f9bd6, 0xff7a59, 0x8fbf8f, 0xb58bc0, 0xe8c27a];
      this.ps = []; for (let k = 0; k < 10; k++) { const row = k < 5 ? 0 : 1, x = (k % 5 - 2) * .95 + (row ? .45 : 0);
        const p = persona({ pos: [x, 0, row ? -1.2 : .4], shirt: cols[k % 5], hair: [0x3a2a20, 0x1f1a17, 0x7a4a2a][k % 3] }); p.scale.setScalar(.75); p.rotation.y = (Math.random() - .5) * .4; this.ps.push(p); }
      this.sel = [0, 2, 3, 4, 5, 7, 9];       // los siete que brincan
      this.gold = mat(0xf3c54d, { emissive: 0xf3c54d, ei: .35 });
    },
    update(lt, c) {
      const t7 = c.w('siete');
      this.sel.forEach((k, j) => { const s = lt - (t7 + j * .12), p = this.ps[k];
        if (s > 0) { p.position.y = .35 * Math.max(0, Math.sin(Math.min(s / .4, 1) * Math.PI)); p.armL.rotation.z = lerp(0, 2.6, eout(s / .2)); p.armR.rotation.z = -p.armL.rotation.z;
          if (!p.userData.g) { p.torso.material = this.gold; p.userData.g = 1; } } });
      if (lt > t7) c.ev('pop', t7, .8);
      cam([lerp(-1.2, 1.2, ease(lt / c.dur)), 3.1, 7.6], [0, .9, -.3], 40);
      rotulo('Sacudida hípnica', 'así se llama', lt - c.w('sacudida'), 1330);
      etiqueta('7 de cada 10', [0, 2.15, .9], lt - t7 - .2, 84, '#f3c54d');
    }
  });

  // 3 · relaja: plano cerrado, los brazos tensos caen de golpe
  escena('relaja', {
    setup() { ambiente(AMB.cuartoNoche); this.r = setCuarto({ noche: true, cobija: 0x4f6fb3 }); this.p = durmiente(this.r); },
    update(lt, c) {
      const tr = c.w('relajan'), s = cl((lt - tr) / .25);
      const arm = lerp(-1.25, 0, s * s); this.p.armL.rotation.x = arm; this.p.armR.rotation.x = arm;
      this.p.head.rotation.x = lerp(0, .25, ease((lt - tr) / .6));
      if (lt > tr + .25) c.ev('impact', tr + .25, .5);
      this.r.pantalla.material.emissiveIntensity = lerp(.9, .3, ease(lt / 3));
      cam([lerp(1.5, 1.2, ease(lt / c.dur)), lerp(2.9, 2.6, ease(lt / c.dur)), lerp(.3, 0, ease(lt / c.dur))], [0, .72, -1.45], 42);
      etiqueta('músculos', [.35, 1.05, -1.3], lt - c.w('músculos'), 56, '#ffffff');
      rotulo('Se relajan', 'de golpe', lt - tr, 1330);
    }
  });

  // 4 · confunde: el "sueño" de caer entre nubes... y brinco en la cama
  escena('confunde', {
    setup() {
      ambiente(AMB.cielo); this.amb = 'cielo';
      this.r = setCuarto({ noche: true, cobija: 0x4f6fb3 }); this.p = durmiente(this.r);
      this.sky = group([0, 100, 0]); this.nubes = setCielo({ n: 30 }); this.nubes.forEach(n => { n.position.y += 100; });
      this.f = persona({ pos: [0, 100, 0], shirt: 0x6f9bd6, pants: 0x34405e }); this.f.scale.setScalar(.8);
    },
    update(lt, c) {
      const tb = c.f(1);
      if (lt < tb) {
        nubesCaida(this.nubes, lt, 7, 86, 114);
        const f = this.f; f.rotation.set(-.25 + .1 * Math.sin(lt * 2), .45 * Math.sin(lt * .9), .2 * Math.sin(lt * 3));   // siempre de frente a cámara
        f.armL.rotation.z = 2.4 + .4 * Math.sin(lt * 9); f.armR.rotation.z = -2.4 - .4 * Math.sin(lt * 9 + 1); f.legL.rotation.x = .4 * Math.sin(lt * 7); f.legR.rotation.x = -.4 * Math.sin(lt * 7);
        f.position.y = 100 + .15 * Math.sin(lt * 4);
        cam([lerp(.6, -.4, ease(lt / tb)), 101.6, 4.2], [0, 100.6, 0], 46);
        rotulo('Cree que caes', 'aunque estás en la cama', lt - c.w('cree'), 1330);
        c.ev('whoosh', .05, .9);
      } else {
        if (this.amb !== 'cuarto') { ambiente(AMB.cuartoNoche); this.amb = 'cuarto'; }
        brinco(this.p, this.r.cama.cobija, lt - tb - .45);
        const s = lt - tb - .45, sh = s > 0 ? .06 * Math.exp(-s * 4) * Math.sin(lt * 70) : 0;
        cam([1.3 + sh, 1.7, .45], [0, .8, -1.3], 44);
        if (s > 0) c.ev('impact', tb + .45, 1);
        rotulo('¡Brinco!', 'falsa alarma del cerebro', s, 1330);
      }
    }
  });

  // 5 · causas: cansancio, estrés y café sobre la cama; luego "es normal"
  escena('causas', {
    setup() {
      ambiente(AMB.cuartoNoche); this.r = setCuarto({ noche: true, cobija: 0x4f6fb3 });
      // reloj despertador
      this.reloj = group([-.45, .9, -1.0]); cyl(.24, .24, .14, 0xe0533d, [0, 0, 0], this.reloj, 16).rotation.x = Math.PI / 2;
      cyl(.2, .2, .02, 0xfdf6e8, [0, 0, .08], this.reloj, 16).rotation.x = Math.PI / 2;
      box(.02, .14, .02, 0x222222, [0, .05, .1], this.reloj); box(.1, .02, .02, 0x222222, [.04, 0, .1], this.reloj);
      ball(.07, 0xe0533d, [-.17, .23, 0], this.reloj, 0); ball(.07, 0xe0533d, [.17, .23, 0], this.reloj, 0);
      // pila de papeles (estrés)
      this.pap = group([.1, .7, -1.25]); for (let k = 0; k < 7; k++) { const b = box(.42, .035, .32, k % 2 ? 0xf7f4ec : 0xe9e4d6, [0, k * .04, 0], this.pap); b.rotation.y = (k * 37 % 10 - 5) * .04; }
      // taza de café enorme
      this.taza = group([.55, .72, -.9]); cyl(.19, .16, .38, 0xf4efe6, [0, .19, 0], this.taza, 14);
      cyl(.17, .17, .02, 0x5a3420, [0, .37, 0], this.taza, 14);
      const asa = new THREE.Mesh(new THREE.TorusGeometry(.09, .03, 6, 14), mat(0xf4efe6)); asa.position.set(.2, .2, 0); asa.castShadow = true; this.taza.add(asa);
      this.vapor = [0, 1, 2].map(k => { const v = ball(.05, 0xffffff, [0, .5, 0], this.taza, 0, { opacity: .6 }); v.castShadow = false; return v; });
      [this.reloj, this.pap, this.taza].forEach(g => g.scale.setScalar(.01));
    },
    update(lt, c) {
      const ts = [c.w('cansado'), c.w('estresado'), c.w('café')], gs = [this.reloj, this.pap, this.taza];
      gs.forEach((g, k) => { g.scale.setScalar(Math.max(.01, spring((lt - ts[k] + .1) / .5))); if (lt > ts[k]) c.ev('pop', ts[k], .7); });
      this.reloj.rotation.z = lt > ts[0] ? .12 * Math.sin(lt * 40) * Math.exp(-(lt - ts[0]) * 1.5) : 0;
      this.pap.rotation.y = .1 * Math.sin(lt * 2);
      this.vapor.forEach((v, k) => { const q = ((lt * .6 + k / 3) % 1); v.position.set(.04 * Math.sin(q * 9 + k), .45 + q * .45, 0); v.material.opacity = .6 * (1 - q); });
      const tn = c.f(1);
      cam([lerp(.5, .1, ease(lt / tn)), lerp(1.9, 2.1, ease(lt / c.dur)), lerp(2.0, 2.4, ease(lt / c.dur))], [.05, .9, -1.1], 42);
      etiqueta('cansancio', [-.45, 1.3, -1.0], lt - ts[0], 52); etiqueta('estrés', [.1, 1.14, -1.25], lt - ts[1], 52); etiqueta('café', [.55, 1.38, -.9], lt - ts[2], 52);
      if (lt < tn) rotulo('Pasa más si…', 'cansancio · estrés · café', lt - .1, 1330);
      else { rotulo('Es normal', 'no es nada malo', lt - c.w('normal') + .2, 1330); c.ev('ding', c.w('normal'), .7); }
    }
  });

  // 6 · remate: de mañana, uno se rasca la cabeza y el amigo se ríe
  escena('remate', {
    setup() {
      ambiente(AMB.cuartoDia); this.r = setCuarto({ noche: false, cobija: 0x4f6fb3, pared: 0xe9dcc6 });
      this.a = persona({ pos: [.55, 0, .25], shirt: 0x6f9bd6, pants: 0x34405e }); this.a.rotation.y = -.35; this.a.scale.setScalar(.85);
      this.b = persona({ pos: [-1.0, 0, .55], shirt: 0xff7a59, hair: 0x1f1a17 }); this.b.rotation.y = .55; this.b.scale.setScalar(.85);
    },
    update(lt, c) {
      this.a.armR.rotation.z = -2.7; this.a.armR.rotation.x = -.3 + .15 * Math.sin(lt * 10); this.a.head.rotation.z = .15;
      const k = Math.sin(lt * 12) * .08; this.b.torso.rotation.x = .1 + k; this.b.head.rotation.x = -.25 + k * 2;
      this.b.armR.rotation.x = -1.5; this.b.armL.rotation.z = .6 + k * 2;
      cam([lerp(.4, -.1, ease(lt / c.dur)), 1.8, lerp(5.4, 4.9, ease(lt / c.dur))], [-.25, 1.1, -.4], 42);
      rotulo('Mándaselo', 'a quien siempre brinca al dormirse', lt - c.w('mándaselo'), 1330); if (lt > c.w('mándaselo')) c.ev('pop', c.w('mándaselo'));
    }
  });
}
