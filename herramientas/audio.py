"""Mix voice + generated music + sound effects. usage: audio.py outdir  (reads timings.json, events.json, v*.wav)"""
import json, sys, numpy as np, soundfile as sf
SR = 48000; out = sys.argv[1]
T = json.load(open(f"{out}/timings.json")); EV = json.load(open(f"{out}/events.json"))
total = sum(x["dur"] for x in T); N = int(total * SR) + SR
rng = np.random.default_rng(1)

def env(n, a=0.005, d=0.2):
    t = np.arange(n) / SR; return np.minimum(t / a, 1) * np.exp(-t / d)

def lp(x, c):  # one-pole lowpass, c in (0,1]; c may be array
    y = np.empty_like(x); s = 0.0; c = np.broadcast_to(c, x.shape)
    for i in range(len(x)): s += c[i] * (x[i] - s); y[i] = s
    return y

# ---------- voice ----------
voice = np.zeros(N); pos = 0
for i, sc in enumerate(T):
    v, _ = sf.read(f"{out}/v{i}.wav"); voice[pos:pos + len(v)] += v; pos += int(round(sc["dur"] * SR))

# ---------- music (110 bpm, A minor: Am F C G) ----------
bpm = 112; beat = 60 / bpm; music = np.zeros(N)
def add(buf, t, x, g=1.0):
    i = int(t * SR); j = min(len(buf), i + len(x))
    if i < len(buf): buf[i:j] += g * x[:j - i]
n_k = int(0.35 * SR); tk = np.arange(n_k) / SR
kick = np.sin(2 * np.pi * np.cumsum(45 + 90 * np.exp(-tk * 30)) / SR) * env(n_k, 0.002, 0.12)
hat = lp(rng.standard_normal(int(0.05 * SR)), 0.9) * env(int(0.05 * SR), 0.001, 0.012); hat -= lp(hat, 0.2)
clap = rng.standard_normal(int(0.15 * SR)) * env(int(0.15 * SR), 0.002, 0.04); clap = clap - lp(clap, 0.15)
roots = [57, 53, 48, 55]; chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]
f = lambda m: 440 * 2 ** ((m - 69) / 12)
def pluck(freq, dur, d=0.25):
    n = int(dur * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(4 * np.pi * freq * t) + 0.12 * np.sin(6 * np.pi * freq * t)) * env(n, 0.004, d)
nb = int(total / beat) + 2
for b in range(nb):
    t = b * beat; bar = b // 4; ch = (bar // 1) % 4
    add(music, t, kick, 0.9 if b % 4 in (0, 2) else 0.0)
    if b % 4 == 3: add(music, t + beat / 2, kick, 0.6)
    if b % 2 == 1: add(music, t, clap, 0.35)
    for h in (0, 0.5): add(music, t + h * beat, hat, 0.25 if h else 0.15)
    bn = int(beat * SR); tb = np.arange(bn) / SR
    bass = np.tanh(2 * np.sin(2 * np.pi * f(roots[ch] - 24) * tb)) * env(bn, 0.005, 0.22)
    add(music, t, bass, 0.45); add(music, t + beat / 2, bass, 0.25)
    for s in range(4):  # 16th arpeggio
        note = chords[ch][(b * 4 + s) % 3] + (12 if s == 3 else 0)
        add(music, t + s * beat / 4, pluck(f(note), 0.3, 0.12), 0.16)
music[: int(0.2 * SR)] *= np.linspace(0, 1, int(0.2 * SR))
music = np.tanh(music * 0.9)

# ---------- sfx ----------
sfx = np.zeros(N)
def whoosh(d=0.35, up=True):
    n = int(d * SR); x = rng.standard_normal(n); c = np.linspace(0.02, 0.5, n) if up else np.linspace(0.5, 0.02, n)
    y = lp(x, c); y -= lp(y, 0.02); return y * np.sin(np.linspace(0, np.pi, n)) ** 2 * 0.9
def pop():
    n = int(0.09 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * np.cumsum(1100 * np.exp(-t * 35) + 250) / SR) * env(n, 0.001, 0.03)
def impact():
    n = int(0.9 * SR); t = np.arange(n) / SR
    boom = np.sin(2 * np.pi * np.cumsum(30 + 110 * np.exp(-t * 18)) / SR) * env(n, 0.002, 0.3)
    nz = lp(rng.standard_normal(n), 0.3) * env(n, 0.001, 0.08)
    return np.tanh(1.6 * (boom + 0.8 * nz))
def ding():
    n = int(0.8 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 1318 * t) + 0.5 * np.sin(2 * np.pi * 2637 * t)) * env(n, 0.002, 0.25) * 0.6
def zap():
    n = int(0.4 * SR); t = np.arange(n) / SR
    return np.sign(np.sin(2 * np.pi * (300 + 900 * t) * t)) * lp(rng.standard_normal(n), 0.5) * env(n, 0.002, 0.15) * 0.35
def crack():
    n = int(0.3 * SR); x = rng.standard_normal(n) * (rng.random(n) > 0.97); return lp(x, 0.6) * env(n, 0.001, 0.1) * 1.5
def heartbeat():
    return np.concatenate([impact()[: int(0.25 * SR)] * 0.6, np.zeros(int(0.12 * SR)), impact()[: int(0.25 * SR)] * 0.45])
def click():
    n = int(0.03 * SR); return rng.standard_normal(n) * env(n, 0.0005, 0.005)
LIB = {"whoosh": (whoosh, 0.5), "pop": (pop, 0.45), "impact": (impact, 0.9), "ding": (ding, 0.45), "zap": (zap, 0.5),
       "crack": (crack, 0.6), "heartbeat": (heartbeat, 0.8), "click": (click, 0.6)}
for e in EV:
    fn, g = LIB[e["s"]]; add(sfx, max(0, e["t"]), fn(), g * e.get("g", 1))

# ---------- duck music under voice ----------
venv = np.abs(voice); k = int(0.05 * SR)
venv = np.convolve(venv, np.ones(k) / k, "same"); venv = np.maximum.accumulate(venv[::-1])[::-1] * 0 + venv  # keep simple
duck = 1 - 0.55 * np.clip(venv / 0.08, 0, 1); duck = np.convolve(duck, np.ones(int(0.12 * SR)) / int(0.12 * SR), "same")
mix = voice * 1.0 + music * 0.20 * duck + sfx * 0.55
end = int(total * SR); fo = int(0.6 * SR)
mix = mix[:end]; mix[-fo:] *= np.linspace(1, 0, fo)
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
sf.write(f"{out}/mix.wav", np.stack([mix, mix], 1).astype(np.float32), SR)
print("mix ok", round(total, 2))
