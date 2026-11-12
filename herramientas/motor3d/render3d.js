// Render de un short 3D. Uso (desde herramientas/motor3d):
//   node render3d.js ../ejemplos/X.json OUT ../ejemplos/X.js            → OUT/video.mp4 + OUT/events.json
//   node render3d.js ../ejemplos/X.json OUT ../ejemplos/X.js frames 1,5,9 → OUT/fr_*.png (revisión rápida)
// Luego: python3 ../audio.py OUT  y unir video + mix.wav con ffmpeg (ver GUIA.md).
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { chromium } = require('playwright');
const [guion, out, shortJs, mode, list] = process.argv.slice(2);
const ROOT = path.resolve(__dirname, '..');
const script = JSON.parse(fs.readFileSync(guion, 'utf8'));
const timings = JSON.parse(fs.readFileSync(path.join(out, 'timings.json'), 'utf8'));
const total = timings.reduce((a, t) => a + t.dur, 0);
const MIME = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.css': 'text/css' };
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/__data.json') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(JSON.stringify({ script, timings })); }
  const f = path.join(ROOT, u); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
  p.on('pageerror', e => console.error('[page error]', e.message));
  const shortUrl = '/' + path.relative(ROOT, path.resolve(shortJs)).split(path.sep).join('/');
  await p.goto(`http://localhost:${port}/motor3d/page.html?data=/__data.json&short=${shortUrl}&estilo=${process.env.ESTILO || ""}&pr=${process.env.PR || ""}`);
  await p.waitForFunction(() => window.__ready !== undefined); await p.evaluate(() => window.__ready);
  await p.evaluate(() => document.fonts.ready);
  const wrap = await p.$('#wrap');
  if (mode === 'frames') {
    for (const t of list.split(',').map(Number)) {
      await p.evaluate(t => window.setFrame(t), t);
      await wrap.screenshot({ path: path.join(out, `fr_${t.toFixed(process.env.FR3 ? 3 : 1).padStart(process.env.FR3 ? 7 : 5, '0')}.png`) });
    }
  } else {
    const n = Math.round(total * 30); const tmp = path.join(out, 'video.tmp.mp4');
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-c:v', 'mjpeg', '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', tmp]);
    const t0 = Date.now();
    for (let f = 0; f < n; f++) {
      await p.evaluate(t => window.setFrame(t), f / 30);
      const buf = await wrap.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (f % 150 === 0) console.log(`frame ${f}/${n} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    ff.stdin.end(); await new Promise((r, j) => ff.on('close', c => c === 0 ? r() : j(new Error('ffmpeg ' + c))));
    fs.renameSync(tmp, path.join(out, 'video.mp4'));
  }
  // eventos de sonido: los que declaran las escenas (se recogen al pasar por todos los fotogramas en modo completo)
  const ev = await p.evaluate(() => window.__events());
  if (mode !== 'frames') fs.writeFileSync(path.join(out, 'events.json'), JSON.stringify(ev));
  await b.close(); srv.close(); console.log('ok', total.toFixed(2));
})().catch(e => { console.error(e); process.exit(1); });
