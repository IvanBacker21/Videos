// Short 19-nov 21:30 · CARTULINA CHIBI: ¿por qué se cae el wifi cuando alguien usa el microondas? El horno y el wifi de 2.4 GHz usan casi
// la misma frecuencia; la rejilla encierra casi toda la energía, pero se fuga un poquito que mete ruido en la señal. Truco: red de 5 GHz.
// Fuentes: Gizmodo (Why does your microwave oven mess with the Wi-Fi connection?), ScienceABC (Do microwaves interfere with WiFi signals?)
// Render: cd herramientas/motor3d && PR=1.5 node render3d.js ../ejemplos/2026-11-19-2130-microondas-wifi.json OUT ../ejemplos/2026-11-19-2130-microondas-wifi.js
import { kitPapel } from '../motor3d/papel.js';
import { kitPM } from '../motor3d/papel_pm.js';
export async function build(E) {
  const { THREE, group, cam, ambiente, rotulo, etiqueta, escena, ease, eout, spring, lerp, cl } = E;
  const P = kitPapel(E), { F, luces, tw } = P;
  const PM = kitPM(P, THREE, group), { A } = PM;
  const RY = 1600, CIELO = 0xbfe3f5, NAR = 0xff8a3d, VER = 0x2ec4a6;
  const fuera = () => { ambiente({ top: CIELO, bottom: CIELO, fog: CIELO, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); PM.diorama(); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); };
  const adentro = () => { ambiente({ top: CIELO, bottom: CIELO, fog: CIELO, near: 80, far: 160, sunInt: .01, hemiInt: .01 }); const k = PM.cocina({ ventana: false }); luces({ pos: [-3, 5, 8], hemi: 1.75, sol: 1.5, radio: 6 }); return k; };
  const pop = (t, t0, d = .35) => t < t0 ? .001 : Math.max(.001, spring(cl((t - t0) / d), 1.4, 7));
  const habla = (p, t, f = 0) => { p.head.rotation.z = p.head.r0 + Math.sin(t * 7 + f) * .05; };
  const respira = (p, t, y0 = 0, f = 0) => { p.position.y = y0 + Math.abs(Math.sin(t * 2.6 + f)) * .02; };

  // onda de cartulina (seno) a lo largo de +x local; g.set(fase, k 0..1 largo visible, ruido 0..1) la redibuja
  const onda = (pos, L, color, o = {}, par = null) => { const g = group(pos, par), amp = o.amp ?? .1, lam = o.lam ?? .36, gr = o.grosor ?? .045; let m = null;
    g.set = (fase, k = 1, ruido = 0, t = 0) => { if (m) { g.remove(m); m.traverse(q => q.geometry?.dispose()); }
      const n = Math.max(2, Math.round(60 * k)), pts = [];
      for (let i = 0; i <= n; i++) { const x = L * k * i / n; const r = ruido * (Math.sin(x * 37 + t * 23) * .7 + Math.sin(x * 61 - t * 31) * .5) * amp * 1.3;
        pts.push([x, Math.sin(x / lam * Math.PI * 2 - fase) * amp + r]); }
      m = PM.pz(P.tubo(pts, gr, gr), color, [0, 0, 0], g, { tinta: .012, papel: .035 }); };
    g.set(0, .02); return g; };

  // celular con pantalla dibujada: modos 'video' (corre), 'carga' (ruedita), 'redes' (lista 2.4 / 5 GHz)
  const celVideo = (pos, h = .8, par = null) => { const g = group(pos, par), W = h * .52;
    PM.pz(F.rect(W, h, W * .16), 0x2b2f4a, [0, 0, 0], g, { tinta: .016, papel: .05 }); PM.det(F.rect(W * .28, .025, .012), 0x101322, [0, h * .44, .02], g);
    const cv = document.createElement('canvas'); cv.width = 256; cv.height = Math.round(256 * (h * .82) / (W * .84)); const x = cv.getContext('2d');
    const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
    const scr = new THREE.Mesh(new THREE.PlaneGeometry(W * .84, h * .82), new THREE.MeshStandardMaterial({ map: tx, roughness: 1, metalness: 0, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: .35 }));
    scr.position.set(0, -h * .02, .03); g.add(scr);
    const F9 = s => `900 ${s}px Poppins, "Arial Black", sans-serif`;
    g.dibuja = (modo, t, sel = 0) => { const w = cv.width, hh = cv.height;
      // "video": cielo, cerro, sol y un gatito que brinca
      const gr = x.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, '#8fd3ff'); gr.addColorStop(1, '#d6f0ff'); x.fillStyle = gr; x.fillRect(0, 0, w, hh);
      x.fillStyle = '#ffc83d'; x.beginPath(); x.arc(w * .75, hh * .22, w * .1, 0, 7); x.fill();
      x.fillStyle = '#2ec4a6'; x.beginPath(); x.ellipse(w * .3, hh * .78, w * .6, hh * .25, 0, 0, 7); x.fill(); x.fillStyle = '#25a88e'; x.beginPath(); x.ellipse(w * .95, hh * .82, w * .5, hh * .2, 0, 0, 7); x.fill();
      const by = modo === 'carga' ? 0 : Math.abs(Math.sin(t * 5)) * hh * .1; x.fillStyle = '#ff8a3d'; x.beginPath(); x.ellipse(w * .45, hh * .55 - by, w * .12, w * .1, 0, 0, 7); x.fill();
      x.beginPath(); x.moveTo(w * .35, hh * .52 - by); x.lineTo(w * .38, hh * .44 - by); x.lineTo(w * .42, hh * .5 - by); x.fill(); x.beginPath(); x.moveTo(w * .55, hh * .52 - by); x.lineTo(w * .52, hh * .44 - by); x.lineTo(w * .48, hh * .5 - by); x.fill();
      x.fillStyle = '#1f1b2e'; x.beginPath(); x.arc(w * .41, hh * .55 - by, w * .018, 0, 7); x.arc(w * .49, hh * .55 - by, w * .018, 0, 7); x.fill();
      // barra de avance
      x.fillStyle = 'rgba(31,27,46,.35)'; x.fillRect(w * .08, hh * .92, w * .84, hh * .025); x.fillStyle = '#ff5b5b'; x.fillRect(w * .08, hh * .92, w * .84 * (modo === 'carga' ? .35 : (.35 + (t * .05) % .6)), hh * .025);
      if (modo === 'carga') { x.fillStyle = 'rgba(13,15,26,.6)'; x.fillRect(0, 0, w, hh);
        for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.floor(t * 10) * Math.PI / 4; x.fillStyle = `rgba(255,255,255,${.25 + .75 * (i / 7)})`;
          x.beginPath(); x.arc(w / 2 + Math.cos(a) * w * .17, hh * .45 + Math.sin(a) * w * .17, w * .035, 0, 7); x.fill(); } }
      if (modo === 'redes') { x.fillStyle = 'rgba(255,253,246,.96)'; x.fillRect(0, 0, w, hh); x.fillStyle = '#1f1b2e'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = F9(w * .14); x.fillText('WIFI', w / 2, hh * .14);
        [['2.4 GHz', 0], ['5 GHz', 1]].forEach(([s, i]) => { const y = hh * (.36 + i * .26), on = sel === i;
          x.fillStyle = on ? '#2ec4a6' : '#e8e2d4'; x.beginPath(); x.roundRect(w * .08, y - hh * .09, w * .84, hh * .18, w * .05); x.fill();
          x.fillStyle = on ? '#ffffff' : '#1f1b2e'; x.font = F9(w * .15); x.fillText(s, w / 2, y); }); }
      tx.needsUpdate = true; };
    g.dibuja('video', 0); return g; };

  // ---------- 1 · gancho: el amigo calienta comida, bip, y el video del protagonista se queda con la ruedita ----------
  escena('gancho', {
    setup() { const k = adentro();
      this.mo = PM.microondas([.3, k.topY, k.z], { w: 1.0 });
      this.am = PM.chibi([1.08, 0, .05], { ropa: 0xff6b5b, colPelo: 0x2a1a10, boca: 'feliz', mira: -1, escala: .8 });
      this.p = PM.chibi([-1.0, 0, .3], { logo: true, boca: 'feliz', mira: 1, escala: .9 });
      this.cel = celVideo([-.38, 1.2, .6], .78); },
    update(lt, c) {
      const t = tw(lt), tb = .45, tc = 1.0, tca = c.w('calienta') - .1;
      A.parpadea(this.p, t + 1.2, .3); A.parpadea(this.am, t + 2.1, 1.7); respira(this.p, t, 0); respira(this.am, t, 0, 1);
      const on = t > tb ? 1 : 0; this.mo.update(t, on);
      // el amigo picó el botón y mira el plato girar
      this.am.brazos[0].rotation.z = lerp(-1.5, this.am.brazos[0].r0, ease(cl((t - tb) / .4))) - Math.sin(t * 3) * .05; this.am.brazos[1].rotation.z = this.am.brazos[1].r0 + Math.sin(t * 2.4) * .05;
      this.am.head.rotation.z = this.am.head.r0 + .05 + Math.sin(t * 2) * .03;
      const trab = t > tc; this.cel.dibuja(trab ? 'carga' : 'video', t);
      this.p.brazos[1].rotation.z = 1.3 + Math.sin(t * 3) * .03 + (trab ? Math.sin(t * 22) * .05 : 0);
      this.cel.position.y = 1.2 + Math.sin(t * 3) * .015 + (trab ? Math.sin(t * 22) * .012 : 0);
      const kp = eout(cl((t - tc) / .3)); A.preocupa(this.p, kp);
      this.p.boca(trab ? (t > tca ? 'grito' : 'abierta') : 'feliz'); if (trab) habla(this.p, t);
      this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -2.7, eout(cl((t - tca) / .3))) + Math.sin(t * 6) * .05 * (t > tca ? 1 : 0);   // mano a la cabeza
      if (t > tb) c.ev('pop', tb, .5); if (t > tc) c.ev('click', tc, .6); if (t > tca) c.ev('impact', tca, .5);
      cam([0, 1.2, lerp(10.9, 10.4, ease(lt / 3))], [0, 1.15, 0], 34);
      if (t > tc) etiqueta('¡SE TRABÓ!', [0, 2.45, .9], lt - tc, 56, '#ffd640', true);
      rotulo('¿Por qué se cae el wifi', 'con el microondas?', lt - .05, RY);
    }
  });

  // ---------- 2 · onda: del microondas sale una onda naranja y del módem una verde, casi idénticas; signo "=" ----------
  escena('onda', {
    setup() { fuera();
      this.mo = PM.microondas([-.92, 0, .2], { w: .9 });
      this.md = PM.modem([.98, 0, .2], { w: .68 });
      this.p = PM.chibi([.02, 0, .35], { logo: true, boca: 'abierta', mira: 0, escala: .72 });
      this.oa = onda([-1.3, 1.95, .6], 1.12, NAR); this.ov = onda([1.3, 1.95, .6], 1.12, VER); this.ov.scale.x = -1;
      this.ig = group([0, 1.95, .62]); for (const y of [.05, -.05]) PM.pz(F.rect(.16, .045, .02), 0x1f1b2e, [0, y, 0], this.ig, { tinta: false, papel: .03 });
      this.lm = PM.letrero([-.92, -.22, .5], 'MICROONDAS', { w: .82, h: .2, hilos: false, borde: NAR });
      this.lw = PM.letrero([.98, -.22, .5], 'WIFI', { w: .6, h: .2, hilos: false, borde: VER }); },
    update(lt, c) {
      const t = tw(lt), tm = c.w('microondas') - .1, tw2 = c.w('wifi') - .1, tmi = c.w('misma') - .1, ti = c.w('invisible.') - .1;
      A.parpadea(this.p, t + .7, .5); habla(this.p, t); respira(this.p, t, 0);
      this.mo.update(t, 1); this.md.update(t, 0);
      this.oa.set(t * 5, ease(cl((t - tm) / .7)), 0, t); this.ov.set(t * 5, ease(cl((t - tw2) / .7)), 0, t);
      this.lm.scale.setScalar(pop(t, tm, .3)); this.lw.scale.setScalar(pop(t, tw2, .3));
      this.ig.scale.setScalar(pop(t, tmi, .3));
      this.p.head.rotation.y = 0; this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -1.3, eout(cl((t - tm) / .3))) + Math.sin(t * 4) * .04;
      this.p.brazos[1].rotation.z = lerp(this.p.brazos[1].r0, 1.3, eout(cl((t - tw2) / .3))) + Math.sin(t * 4 + 1) * .04;
      this.p.boca(t > ti ? 'o' : 'abierta');
      c.ev('whoosh', .05, .4); if (t > tm) c.ev('whoosh', tm, .4); if (t > tw2) c.ev('whoosh', tw2, .4); if (t > tmi) c.ev('ding', tmi, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tmi) etiqueta('¡CASI IGUALES!', [0, 2.45, .9], lt - tmi, 50, '#ffd640', true);
      rotulo('Usan casi la misma', 'onda invisible', lt - .1, RY);
    }
  });

  // ---------- 3 · rejilla: acercamiento a la puerta; la onda rebota adentro y un hilito se escapa por la orilla ----------
  escena('rejilla', {
    setup() { fuera();
      this.mo = PM.microondas([-.32, .05, .2], { w: 1.95 });
      const [vx, vy] = this.mo.vent; this.vw = this.mo.ventW; this.vh = this.mo.ventH;
      this.oi = onda([-this.vw * .42, .08, .06], this.vw * .84, NAR, { amp: .13, lam: .3 }, this.mo.puerta);
      this.hi = onda([vx + this.vw / 2 + .05, vy + this.vh / 2 + .02, .3], .9, NAR, { amp: .045, lam: .16, grosor: .028 }, this.mo); this.hi.rotation.z = .55;
      this.p = PM.chibi([1.08, 0, .35], { logo: true, boca: 'feliz', mira: -1, escala: .62 });
      this.fl = PM.pz(F.poly([[0, .16], [.13, 0], [.05, 0], [.05, -.16], [-.05, -.16], [-.05, 0], [-.13, 0]]), 0x1f1b2e, [-.32 + vx, .05 + vy - this.vh / 2 - .2, .7], null, { tinta: .012, papel: .04 }); },
    update(lt, c) {
      const t = tw(lt), tr = c.w('rejilla') - .1, te = c.w('encierra,') - .1, tes = c.w('escapa') - .1;
      A.parpadea(this.p, t + 2.3, 1.4); habla(this.p, t); respira(this.p, t, 0);
      this.mo.update(t, 1);
      // la onda rebota adentro (va y viene)
      this.oi.position.x = -this.vw * .42 + Math.sin(t * 4) * .04; this.oi.set(t * 7, 1, 0, t);
      this.mo.puerta.scale.setScalar(1 + .025 * Math.max(0, Math.sin((t - te) * 12)) * (t > te && t < te + .6 ? 1 : 0));
      this.fl.scale.setScalar(t > tr && t < tes ? pop(t, tr, .3) : .001); this.fl.position.y = .05 + this.mo.vent[1] - this.vh / 2 - .22 + Math.sin(t * 6) * .03;
      const kh = ease(cl((t - tes) / .8)); this.hi.visible = t > tes; this.hi.set(t * 8, Math.max(.03, kh), 0, t);
      A.preocupa(this.p, eout(cl((t - tes) / .3))); this.p.boca(t > tes ? 'o' : 'feliz');
      this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -1.2, eout(cl((t - tes) / .3))) + Math.sin(t * 4) * .04;
      c.ev('whoosh', .05, .4); if (t > tr) c.ev('pop', tr, .4); if (t > tes) c.ev('zap', tes, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tr && t < tes) etiqueta('REJILLA', [-.32, 2.45, .9], lt - tr, 58, '#ffffff', true);
      if (t > tes) etiqueta('¡SE ESCAPA UN POQUITO!', [0, 2.45, .9], lt - tes, 40, '#ffd640', true);
      rotulo('La rejilla la encierra,', 'pero se escapa un poquito', lt - .1, RY);
    }
  });

  // ---------- 4 · traba: el hilito choca con la onda del wifi, la revuelve y el video se traba ----------
  escena('traba', {
    setup() { fuera();
      this.mo = PM.microondas([.78, 0, .1], { w: .9 });
      this.rep = PM.pz(F.rect(.8, .08, .03), 0x8a5a3a, [1.0, 1.3, .1], null, { tinta: .014, papel: .05 });
      this.md = PM.modem([1.0, 1.34, .15], { w: .58 });
      this.p = PM.chibi([-.95, 0, .3], { logo: true, boca: 'feliz', mira: 1, escala: .85 });
      this.cel = celVideo([-.32, 1.2, .6], .72);
      // onda del wifi: del módem al cel
      this.ow = onda([.72, 1.62, .55], 1.0, VER, { amp: .07, lam: .22, grosor: .04 }); this.ow.scale.x = -1; this.ow.rotation.z = -.32;
      // hilito del microondas que sube
      this.hi = onda([.5, .62, .58], .85, NAR, { amp: .06, lam: .16, grosor: .03 }); this.hi.rotation.z = 1.75; },
    update(lt, c) {
      const t = tw(lt), tp = c.w('poquito') - .1, tr = c.w('ruido') - .1, ts = c.w('señal:') - .1, ttr = c.w('traba.') - .2;
      A.parpadea(this.p, t + .3, 2.0); respira(this.p, t, 0); habla(this.p, t);
      this.mo.update(t, 1);
      const rv = ease(cl((t - tr) / .6));
      this.md.update(t, rv); this.md.senal(t > ttr ? (Math.sin(t * 9) > 0 ? 1 : 0) : 3);
      this.ow.set(t * 6, ease(cl(t / .6)), rv, t);
      this.hi.set(t * 8, Math.max(.03, ease(cl((t - tp) / .7))), 0, t); this.hi.visible = t > tp;
      const trab = t > ttr; this.cel.dibuja(trab ? 'carga' : 'video', t);
      this.p.brazos[1].rotation.z = 1.3 + Math.sin(t * 3) * .03;
      A.preocupa(this.p, eout(cl((t - ts) / .4))); this.p.boca(trab ? 'grito' : (t > ts ? 'abierta' : 'feliz'));
      this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -2.7, eout(cl((t - ttr) / .3))) + Math.sin(t * 6) * .05 * (trab ? 1 : 0);
      c.ev('whoosh', .05, .4); if (t > tr) c.ev('crack', tr, .6); if (t > ttr) c.ev('impact', ttr, .5);
      cam([0, 1.2, 10.4], [0, 1.15, 0], 34);
      if (t > tr && t < ttr) etiqueta('¡RUIDO!', [.1, 2.45, .9], lt - tr, 56, '#ffffff', true);
      if (t > ttr) etiqueta('¡SE TRABA!', [.1, 2.45, .9], lt - ttr, 56, '#ffd640', true);
      rotulo('Ese poquito hace ruido', 'y tu video se traba', lt - .1, RY);
    }
  });

  // ---------- 5 · remate: cambia a la red de 5 GHz, el video corre (palomita) y lo manda a un amigo ----------
  escena('remate', {
    setup() { const k = adentro();
      this.mo = PM.microondas([1.0, k.topY, k.z], { w: .85 });
      this.p = PM.chibi([-.55, 0, .3], { logo: true, boca: 'abierta', mira: 1 });
      this.cel = celVideo([.2, 1.25, .6], .9);
      this.ok = PM.marca([.5, 1.75, .8], true, .5);
      this.av = PM.avion([.2, 1.3, .9], .45); },
    update(lt, c) {
      const t = tw(lt), tu = c.w('usa') - .1, tg = c.w('gigas.') - .1, tma = c.w('Mándaselo') - .1;
      A.parpadea(this.p, t + 1.5, .8); habla(this.p, t); respira(this.p, t, 0);
      this.mo.update(t, 1);
      const modo = t < tu ? 'carga' : (t < tg ? 'redes' : 'video'); this.cel.dibuja(modo, t, t > (tu + tg) / 2 ? 1 : 0);
      this.p.boca(t < tg ? 'abierta' : (t < tma ? 'feliz' : 'abierta'));
      this.p.brazos[1].rotation.z = 1.35 + Math.sin(t * 3) * .04;
      this.p.brazos[0].rotation.z = lerp(this.p.brazos[0].r0, -.9, eout(cl((t - tg) / .3))) + Math.sin(t * 4) * .04;
      this.cel.position.y = 1.25 + Math.sin(t * 3) * .02; this.cel.rotation.z = -.06 + Math.sin(t * 2) * .03;
      this.ok.scale.setScalar(t < tma + .4 ? pop(t, tg, .3) * .5 : .001);
      const ka = cl((t - tma) / 1.3); this.av.visible = t > tma && ka < 1; this.av.position.set(lerp(.2, 1.7, ease(ka)), 1.3 + Math.sin(ka * Math.PI) * .9 + ka * .4, .9); this.av.rotation.z = .5 - ka * .3;
      c.ev('whoosh', .05, .4); if (t > tu) c.ev('click', tu, .6); if (t > tg) c.ev('ding', tg, .5); if (t > tma) c.ev('whoosh', tma, .5);
      cam([.0, 1.2, lerp(10.4, 10.0, ease(lt / 4))], [0, 1.15, 0], 34);
      if (t > tu && t < tma) etiqueta('TRUCO: RED DE 5 GHz', [0, 2.45, .9], lt - tu, 42, '#ffd640', true);
      if (t > tma) etiqueta('¡MÁNDASELO!', [0, 2.45, .9], lt - tma, 52, '#ffd640', true);
      rotulo('Truco: usa la red', 'de 5 GHz', lt - .05, RY);
    }
  });
  P.cierre();
}
