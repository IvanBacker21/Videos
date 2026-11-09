// Short 3D: ¿Por qué te ruge la panza? (borborigmos: los músculos del estómago e intestinos aprietan y empujan aire y
// líquidos = gluglú; con la panza vacía suena más porque nada amortigua el ruido; tras unas dos horas sin comer pasa una
// ola de limpieza (complejo motor migratorio) = el gran rugido; truco: comer un bocado o tomar agua).
// Render: cd herramientas/motor3d && node render3d.js ../ejemplos/2026-11-08-2130-panza.json OUT ../ejemplos/2026-11-08-2130-panza.js
// Mejoras del motor en este short (MEJORAS 0u + 0v + nuevo): galleta(), sandia(), gomita(), loseta(), alfombra() y disco()
// pasan a engine.js; nuevo tuboDigestivo() (estómago + intestino translúcidos con ola que aprieta y burbujas).
export async function build(E) {
  const { THREE, box, cyl, ball, group, persona, mat, cam, ambiente, rotulo, etiqueta, escena, ease, eout, einout, spring, lerp, cl,
    gesto, pose, hablar, sentar, reloj, ondas, vaso, galleta, tuboDigestivo, disco } = E;
  function camRig(lt, dur, a, b, look, fov = 46) { const q = einout(cl(lt / dur)); cam([lerp(a[0], b[0], q), lerp(a[1], b[1], q), lerp(a[2], b[2], q)], look, fov); }
  const PIEL = 0xe0b08c;

  // ---------- set local: salón de clases (pupitres en filas mirando a +z; pizarrón detrás de la cámara no hace falta) ----------
  const SALON = { top: 0x5a6f8a, bottom: 0xf2d2a0, fog: 0xd8c8aa, near: 6, far: 20, sunColor: 0xfff0d8, sunInt: 2.4, hemiInt: 1.15, sunPos: [-4, 8, 6] };
  function salon() {
    for (let k = -8; k < 8; k++) box(.5, .03, 12, k % 2 ? 0x9a7050 : 0x8a6242, [k * .5 + .25, -.015, -2]);
    box(9, 3.4, .15, 0xe8dcc0, [0, 1.7, -4.2]); box(9, .8, .16, 0x5f8a6a, [0, .4, -4.15]);
    for (const x of [-2.6, 2.6]) { box(1.3, 1.2, .05, 0xbfe3ff, [x, 2.0, -4.1], null, { emissive: 0xbfe3ff, ei: .45 }); box(1.4, .07, .1, 0xf2efe8, [x, 1.38, -4.08]); }
    const r = reloj([0, 2.75, -4.08], .3);
    const pupitre = (x, z) => { const g = group([x, 0, z]); box(.7, .05, .5, 0xc89a62, [0, .98, .42], g); box(.05, .95, .05, 0x555555, [-.3, .48, .62], g); box(.05, .95, .05, 0x555555, [.3, .48, .62], g);
      box(.5, .05, .45, 0x3f6fa0, [0, .76, 0], g); box(.5, .5, .05, 0x3f6fa0, [0, 1.05, -.22], g); for (const sx of [-.2, .2]) for (const sz of [-.18, .18]) box(.04, .74, .04, 0x555555, [sx, .37, sz], g); return g; };
    const alumnos = [], cols = [0xe0573f, 0x4fa36a, 0x8a5fb0, 0xf0b040, 0x3f8fd0, 0xd06a9a];
    [[-1.3, -.2], [0, -.2], [1.3, -.2], [-1.3, -1.6], [1.3, -1.6], [0, -1.6]].forEach(([x, z], k) => { pupitre(x, z);
      const p = persona({ pos: [x, 0, z], shirt: cols[k], pants: 0x3d4a66, hair: [0x2a1c14, 0x5a3a20, 0x1a1210][k % 3], pelo: k % 2 ? 'largo' : undefined });
      sentar(p, 1); p.armL.rotation.x = p.armR.rotation.x = -.9; alumnos.push(p); });
    return { alumnos, reloj: r };
  }

  // ---------- 1. GANCHO: salón en silencio; a él le ruge la panza y todos voltean ----------
  escena('gancho', {
    setup(c) {
      ambiente(SALON); const S = salon(); this.A = S.alumnos; this.yo = this.A[1];
      this.on = ondas([0, 1.2, .25], { color: 0xffd36b, n: 4, vel: 1.4, alcance: .5, opacidad: .85 });
    },
    update(lt, c) {
      const tr = c.w('ruge') || .9, ts = c.w('silencio?') || 2.4, tf = c.f(1) || 3.6, yo = this.yo;
      this.on.update(lt - tr + .2, lt > tr - .2); if (lt > tr - .2) c.ev('heartbeat', tr - .2, .9);
      gesto(yo, lt > tr ? 'sorpresa' : 'neutral'); yo.armL.rotation.x = lt > tr ? lerp(-.9, -.45, ease((lt - tr) / .3)) : -.9;
      yo.armL.rotation.z = lt > tr ? .5 : 0; yo.head.rotation.x = lt > tr ? .2 : 0;
      this.A.forEach((p, k) => { if (p === yo) return; const x = p.position.x, z = p.position.z, voltea = ease((lt - tr - .3 - k * .12) / .35);
        p.head.rotation.y = voltea * Math.atan2(-x, z + .2) * .9; if (voltea > .5) gesto(p, k % 2 ? 'sorpresa' : 'feliz'); });
      camRig(lt, c.dur, [.3, 1.75, 4.9], [.1, 1.6, 4.2], [0, 1.05, -.6], 50);
      if (lt < tf) { rotulo('¡Grrr!', 'justo en pleno silencio', lt - ts); etiqueta('GRRR', [0, 1.75, .3], lt - tr, 64, '#ffd36b', true); }
      else { rotulo('¿Por qué?', 'al final: cómo callarla', lt - tf); c.ev('pop', tf, .5); }
    }
  });

  // ---------- 2. TUBO: la cámara entra a la panza; el torso se vuelve transparente y se ve el tubo que aprieta ----------
  escena('tubo', {
    setup(c) {
      ambiente({ top: 0x1e2440, bottom: 0x6a4a72, fog: 0x241e3a, near: 4, far: 16, sunColor: 0xfff0e0, sunInt: 2.2, hemiInt: 1.1, sunPos: [3, 8, 6] });
      box(8, .04, 8, 0x2e2848, [0, -.02, 0]);
      this.p = persona({ pos: [0, 0, 0], shirt: 0x4fa36a, pants: 0x3d4a66, hair: 0x5a3a20 }); gesto(this.p, 'feliz');
      this.tm = mat(0x4fa36a, { opacity: .9 }); this.p.torso.material = this.tm;
      this.t = tuboDigestivo({ pos: [0, .72, .02], s: .5, parent: this.p });
    },
    update(lt, c) {
      const tp = c.w('panza') || 1.4, ti = c.w('intestinos') || 2.0, tm = c.w('músculos') || 3.3;
      const tr = ease((lt - .9) / .8); this.tm.opacity = lerp(.95, .12, tr); this.tm.depthWrite = tr < .5;
      this.p.head.rotation.y = Math.sin(lt * .8) * .15; pose(this.p, 'manosJuntas', 0, lt); this.p.armL.rotation.z = -.25; this.p.armR.rotation.z = .25;
      this.t.update(lt, { ola: lt > tm - .3 ? ((lt - tm + .3) * .35) % 1 : -1, apriete: .55, ancho: .06 });
      camRig(lt, c.dur, [.3, 1.5, 4.2], [0, 1.3, 2.8], [0, 1.15, 0], 50);
      if (lt > 1) c.ev('whoosh', 1, .5); if (lt > tm) c.ev('pop', tm, .5);
      etiqueta('PANZA', this.t.mundo(.22).map((v, k) => v + [.32, .05, 0][k]), lt - tp, 46, '#ffd36b', true);
      etiqueta('INTESTINOS', this.t.mundo(.55).map((v, k) => v + [-.28, .05, 0][k]), lt - ti, 46, '#ffffff', true);
      if (lt < tm) rotulo('No es solo hambre', 'tu panza es un tubo', lt - .2);
      else rotulo('Músculos que aprietan', 'todo el día', lt - tm);
    }
  });

  // ---------- 3. BURBUJAS: macro dentro del tubo; la ola empuja aire y líquido y salen ondas de sonido ----------
  escena('burbujas', {
    setup(c) {
      ambiente({ top: 0x2a1022, bottom: 0x8a3a4a, fog: 0x3a1828, near: 3, far: 12, sunColor: 0xffe4e0, sunInt: 2.0, hemiInt: 1.2, sunPos: [2, 6, 6] });
      this.t = tuboDigestivo({ pos: [0, -.55, 0], s: 2.6, color: 0xf07a8a });
      this.on = ondas([0, 0, 0], { color: 0xbfe9ff, n: 4, vel: 1.8, alcance: 1.0, opacidad: .8 });
      this.liq = Array.from({ length: 10 }, (_, k) => { const b = ball(1, 0x7ac0ff, [0, 0, 0], null, 1, { opacity: .8, emissive: 0x2a7fe0, ei: .4 }); b.castShadow = false; return b; });
    },
    update(lt, c) {
      const ta = c.w('aire') || 1.3, tg = c.w('gluglú.') || 3.6, ola = .42 + lt * .1;
      this.t.update(lt, { ola, apriete: .6, ancho: .05, burbujas: cl((lt - ta + .4) / .6) });
      const p = this.t.mundo(ola + .03); this.on.position.set(p[0], p[1], p[2] + .1); this.on.update(lt, lt > tg - .5);
      this.liq.forEach((b, k) => { const q = this.t.mundo(ola + .02 + (k % 5) * .01); b.position.set(q[0] + Math.sin(k * 2 + lt * 4) * .06, q[1] - .08 + Math.cos(k + lt * 5) * .03, q[2] + .05);
        b.scale.setScalar(.035 + (k % 3) * .01); b.visible = lt > ta + .2; });
      const f = this.t.mundo(ola);
      cam([f[0] * .6 + .1, f[1] + .55, 2.6 - lt * .12], [f[0] * .8, f[1], 0], 50);
      if (lt > ta) c.ev('pop', ta, .5); if (lt > tg - .5) c.ev('heartbeat', tg - .5, .8);
      etiqueta('AIRE', [f[0] + .35, f[1] + .38, .1], lt - ta, 48, '#e8fbff', true);
      etiqueta('LÍQUIDO', [f[0] - .45, f[1] + .1, .1], lt - (c.w('líquidos,') || ta + .5), 48, '#7ac0ff', true);
      if (lt < tg - .6) rotulo('Empuja aire y líquido', 'al apretar', lt - .2);
      else rotulo('¡Gluglú!', 'eso es lo que oyes', lt - tg + .6);
    }
  });

  // ---------- 4. VACÍA: panza llena (ondas chicas) vs. panza vacía (ondas grandes) + tambor hueco ----------
  escena('vacia', {
    setup(c) {
      ambiente({ top: 0x22304a, bottom: 0xd8a070, fog: 0x3a3c4c, near: 4, far: 14, sunColor: 0xfff0d8, sunInt: 2.3, hemiInt: 1.1, sunPos: [2, 8, 6] });
      box(8, .04, 8, 0x3a3048, [0, -.02, 0]);
      for (const x of [-.7, .48]) cyl(.42, .48, .12, 0x6a5a78, [x, .06, 0], null, 12);
      this.llena = tuboDigestivo({ pos: [-.85, .1, 0], s: 1.05, soloPanza: true, comida: 16, color: 0xf08a8a });
      this.vacia = tuboDigestivo({ pos: [.32, .1, 0], s: 1.05, soloPanza: true, color: 0xf08a8a });
      this.o1 = ondas([0, 0, 0], { color: 0xbfe9ff, n: 3, vel: 1.2, alcance: .3, opacidad: .45 });
      this.o2 = ondas([0, 0, 0], { color: 0xffd36b, n: 4, vel: 1.6, alcance: .65, opacidad: .95, grosor: .045 });
      this.tambor = group([0, 0, .9]); cyl(.32, .32, .34, 0xc0402a, [0, .17, 0], this.tambor, 14); cyl(.33, .33, .03, 0xf4efe6, [0, .35, 0], this.tambor, 14);
      for (let k = 0; k < 7; k++) { const a = k / 7 * Math.PI * 2; box(.02, .34, .02, 0xd9a93a, [Math.cos(a) * .325, .17, Math.sin(a) * .325], this.tambor).rotation.z = .4; }
      this.tambor.scale.setScalar(.01);
    },
    update(lt, c) {
      const tv = c.w('vacía') || .7, tc = c.w('comida') || 2.6, tt = c.w('tambor') || 4.7;
      const ph = (lt * .45) % 1; this.llena.update(lt, { ola: ph, apriete: .3, ancho: .12 }); this.vacia.update(lt, { ola: ph, apriete: .55, ancho: .12, burbujas: 1 });
      const a = this.llena.mundo(.5), b = this.vacia.mundo(.5);
      this.o1.position.set(a[0], a[1], a[2] + .15); this.o1.update(lt, lt > .3); this.o2.position.set(b[0], b[1], b[2] + .15); this.o2.update(lt, lt > tv);
      const s = Math.max(.01, spring((lt - tt + .2) / .6)); this.tambor.scale.setScalar(s * 1.0); this.tambor.rotation.y = lt * .6;
      if (lt > tt) this.tambor.children[1].position.y = .35 - Math.abs(Math.sin(lt * 14)) * .02;
      camRig(lt, c.dur, [-.1, 1.5, 4.9], [0, 1.3, 4.5], [-.1, .7, 0], 50);
      if (lt > tv) c.ev('heartbeat', tv, .7); if (lt > tt) c.ev('impact', tt, .7);
      etiqueta('LLENA', [-.7, 1.55, 0], lt - .3, 48, '#ffffff', true);
      etiqueta('VACÍA', [.48, 1.55, 0], lt - tv, 52, '#ffd36b', true);
      if (lt > tc && lt < tt - .2) etiqueta('NADA APAGA EL RUIDO', [-.1, .35, .9], lt - tc, 40, '#ffffff', true);
      if (lt < tt - .2) rotulo('Vacía suena más', 'no hay comida que apague el ruido', lt - tv);
      else rotulo('Como un tambor', 'hueco', lt - tt + .2);
    }
  });

  // ---------- 5. LIMPIEZA: reloj de dos horas; una ola gigante recorre el tubo y barre lo que quedó → GRAN RUGIDO ----------
  escena('limpieza', {
    setup(c) {
      ambiente({ top: 0x101a30, bottom: 0x5a3a6a, fog: 0x1c1a34, near: 4, far: 14, sunColor: 0xfff0e0, sunInt: 2.2, hemiInt: 1.15, sunPos: [3, 8, 6] });
      box(8, .04, 8, 0x241e3a, [0, -.02, 0]);
      this.t = tuboDigestivo({ pos: [0, .35, 0], s: 1.25, color: 0xf07a8a });
      this.rest = Array.from({ length: 9 }, (_, k) => { const b = box(.06, .05, .06, [0xd9a35a, 0x7ab84a, 0xe0c060][k % 3], [0, 0, 0]); b.castShadow = false; b.t0 = .3 + k * .07; return b; });
      this.r = reloj([-.6, 1.8, -.3], .24); this.on = ondas([0, .9, .2], { color: 0xffd36b, n: 5, vel: 1.8, alcance: 1.2, opacidad: 1, grosor: .06 });
    },
    update(lt, c) {
      const th = c.w('horas') || 1.2, to = c.w('ola') || 2.6, tb = c.w('barre') || 3.2, tr = c.w('rugido!') || 5.0;
      this.r.min.rotation.z = -cl(lt / 2) * Math.PI * 4; this.r.hor.rotation.z = -cl(lt / 2) * Math.PI / 3; this.r.lookAt(E.camera.position);
      const ola = lt > to - .4 ? (lt - to + .4) * .32 : -1;
      this.t.update(lt, { ola, apriete: .7, ancho: .05, burbujas: lt > to ? 1 : 0 });
      this.rest.forEach(b => { const t = Math.max(b.t0, ola + .03); const p = this.t.mundo(Math.min(.99, t)); b.position.set(p[0], p[1] + .02, p[2] + .03); b.rotation.set(lt * 2 + b.t0 * 9, lt, 0); });
      this.on.update(lt - tr + .3, lt > tr - .3);
      const sh = lt > tr - .3 ? Math.sin(lt * 40) * .03 * Math.max(0, 1 - (lt - tr) * .8) : 0;
      camRig(lt, c.dur, [.2 + sh, 1.4, 3.9], [0, 1.15, 3.4], [0, 1.0 + sh, 0], 50);
      if (lt > th) c.ev('ding', th, .5); if (lt > to) c.ev('whoosh', to, .6); if (lt > tr - .3) c.ev('heartbeat', tr - .3, 1);
      etiqueta('2 HORAS SIN COMER', [-.45, 1.42, -.3], lt - th, 44, '#ffd36b', true);
      if (lt > tb) etiqueta('LIMPIEZA', this.t.mundo(Math.max(.05, Math.min(.95, ola))).map((v, k) => v + [0, .3, .1][k]), lt - tb, 46, '#ffffff', true);
      if (lt < to) rotulo('Dos horas sin comer', 'y llega una ola', lt - th);
      else if (lt < tr - .4) rotulo('La ola de limpieza', 'barre lo que quedó', lt - to);
      else rotulo('¡El gran rugido!', 'GRRRR', lt - tr + .4);
    }
  });

  // ---------- 6. REMATE: el truco (toma agua) y el compa que se ríe ----------
  escena('remate', {
    setup(c) {
      ambiente(SALON); const S = salon(); this.A = S.alumnos; this.yo = this.A[1];
      this.v = vaso([0, 0, 0], this.yo.armR, 1.3); this.v.position.set(0, -.86, .05);
      this.g = galleta([0, 0, 0], .07, this.yo.armL); this.g.position.set(0, -.84, .06); this.g.rotation.x = Math.PI / 2;
    },
    update(lt, c) {
      const yo = this.yo, tb = c.w('algo') || .9, ta = c.w('agua.') || 1.8, tm = c.w('Mándaselo') || 2.6;
      const comer = ease((lt - tb + .2) / .4) * (1 - ease((lt - ta + .3) / .3)), beber = ease((lt - ta + .1) / .4);
      yo.armL.rotation.set(lerp(-.9, -2.6, comer), 0, lerp(0, -.5, comer)); this.g.visible = lt < ta;
      yo.armR.rotation.set(lerp(-.9, -2.3, beber), 0, lerp(0, .3, beber)); yo.head.rotation.x = -beber * .3;
      if (lt > ta) this.v.agua.scale.y = Math.max(.15, 1 - (lt - ta) * .6);
      gesto(yo, lt > ta + .8 ? 'feliz' : 'neutral');
      const amigo = this.A[2]; amigo.head.rotation.y = -.9; gesto(amigo, 'feliz'); if (lt > tm) { pose(amigo, 'senalar', ease((lt - tm) / .3), lt); amigo.armR.rotation.y = -.6; hablar(amigo, lt, 1); }
      this.A.forEach((p, k) => { if (p !== yo && p !== amigo) { p.head.rotation.y = Math.atan2(-p.position.x, p.position.z + .2) * .8; if (lt > tm) gesto(p, 'feliz'); } });
      camRig(lt, c.dur, [.5, 1.8, 4.6], [.35, 1.7, 4.0], [.4, 1.15, -.5], 50);
      if (lt > tb) c.ev('pop', tb, .5); if (lt > ta) c.ev('ding', ta, .5);
      if (lt < tm) { rotulo('El truco', 'come algo o toma agua', lt - .2); etiqueta('SE CALMA', [0, 2.35, -.2], lt - ta - .3, 50, '#7dff6a', true); }
      else rotulo('Mándaselo', 'al que le ruge la panza en clase', lt - tm);
    }
  });
}
