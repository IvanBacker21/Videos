// Render REANUDABLE y en paralelo (16-nov-2026): si la sesión se reinicia, vuelve a correrlo y sigue donde iba.
//   PR=1.5 node render_partes.js ../ejemplos/X.json OUT ../ejemplos/X.js 0 2 & PR=1.5 node render_partes.js ... 1 2 &
//   → OUT/jpg/f_00000.jpg … + OUT/ev_*.json. Al terminar todos: node render_partes.js --unir OUT → OUT/video.mp4 + OUT/events.json
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { chromium } = require('playwright');
const [guion, out, shortJs, W = '0', NW = '1'] = process.argv.slice(2); const w = +W, nw = +NW;
const ROOT = path.resolve(__dirname, '..');
const UNIR = guion === '--unir';
const script = UNIR ? null : JSON.parse(fs.readFileSync(guion, 'utf8'));
const timings = UNIR ? [] : JSON.parse(fs.readFileSync(path.join(out, 'timings.json'), 'utf8'));
const total = timings.reduce((a, t) => a + t.dur, 0);
const MIME = { '.js': 'text/javascript', '.html': 'text/html', '.json': 'application/json', '.css': 'text/css' };
const srv = http.createServer((req, res) => {
  const u = decodeURIComponent(req.url.split('?')[0]);
  if (u === '/__data.json') { res.writeHead(200, { 'content-type': 'application/json' }); return res.end(JSON.stringify({ script, timings })); }
  const f = path.join(ROOT, u); if (!f.startsWith(ROOT) || !fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});

if (UNIR) { const o = process.argv[3]; const ev = new Map();
  for (const f of fs.readdirSync(o).filter(f => /^ev_.*\.json$/.test(f))) for (const e of JSON.parse(fs.readFileSync(path.join(o, f), 'utf8'))) ev.set(JSON.stringify(e), e);
  const evs = [...ev.values()].sort((a, b) => (a.t ?? 0) - (b.t ?? 0)); fs.writeFileSync(path.join(o, 'events.json'), JSON.stringify(evs));
  const r = require('child_process').spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-r', '30', '-i', path.join(o, 'jpg', 'f_%05d.jpg'), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', path.join(o, 'video.mp4')], { stdio: 'inherit' });
  console.log(r.status === 0 ? 'ok unir ' + evs.length + ' eventos' : 'error ffmpeg'); process.exit(r.status); }
if (!UNIR) (async () => {
  await new Promise(r => srv.listen(0, r)); const port = srv.address().port;
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.error('[page error]', e.message));
  const shortUrl = '/' + path.relative(ROOT, path.resolve(shortJs)).split(path.sep).join('/');
  await p.goto(`http://localhost:${port}/motor3d/page.html?data=/__data.json&short=${shortUrl}&estilo=${process.env.ESTILO || ""}&pr=${process.env.PR || ""}`);
  await p.waitForFunction(() => window.__ready !== undefined); await p.evaluate(() => window.__ready);
  await p.evaluate(() => document.fonts.ready);
  const wrap = await p.$('#wrap'); const dir = path.join(out, 'jpg'); fs.mkdirSync(dir, { recursive: true });
  const n = Math.round(total * 30), t0 = Date.now(), evf = path.join(out, `ev_${w}_${Date.now()}.json`); let hechos = 0;
  const guardaEv = async () => fs.writeFileSync(evf, JSON.stringify(await p.evaluate(() => window.__events())));
  for (let f = w; f < n; f += nw) { const fn = path.join(dir, `f_${String(f + 1).padStart(5, '0')}.jpg`);
    if (fs.existsSync(fn) && fs.statSync(fn).size > 1000) continue;
    await p.evaluate(t => window.setFrame(t), f / 30);
    const buf = await wrap.screenshot({ type: 'jpeg', quality: 92 }); fs.writeFileSync(fn + '.tmp', buf); fs.renameSync(fn + '.tmp', fn); hechos++;
    if (hechos % 30 === 0) { await guardaEv(); console.log(`w${w}: frame ${f}/${n} (${hechos} hechos, ${((Date.now() - t0) / 1000).toFixed(0)} s)`); } }
  await guardaEv(); await b.close(); srv.close(); console.log('ok', w, total.toFixed(2));
})().catch(e => { console.error(e); process.exit(1); });
