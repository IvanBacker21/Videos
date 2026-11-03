"""Generate per-scene voice WAVs (48k mono) and word timings. usage: voice.py script.json outdir"""
import json, sys, os, re
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

SR = 48000; GAP = 0.10; TAIL = 0.25
d = json.load(open(sys.argv[1])); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
vz = d.get("voz", {})
k = Kokoro(os.path.expanduser("~/voices/kok/kokoro-v1.0.onnx"), os.path.expanduser("~/voices/kok/voices-v1.0.bin"))

def trim(x, thr=0.01):
    idx = np.where(np.abs(x) > thr)[0]
    return x[max(0, idx[0] - 240):idx[-1] + 480] if len(idx) else x

def resample(x, sr):
    n = int(len(x) * SR / sr); return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)

timings = []
for i, sc in enumerate(d["escenas"]):
    buf, words, t = [], [], 0.0
    for pi, ph in enumerate(sc["frases"]):
        s, sr = k.create(ph, voice=vz.get("modelo", "em_alex"), speed=vz.get("speed", 1.1), lang=vz.get("lang", "es-419"))
        a = resample(trim(np.asarray(s, dtype=np.float64)), sr); dur = len(a) / SR
        ws = ph.split(); lens = [len(re.sub(r"\W", "", w)) + 1.5 for w in ws]; tot = sum(lens); acc = 0
        for w, L in zip(ws, lens):
            words.append({"w": w, "t": round(t + acc / tot * dur * 0.97, 3), "frase": pi}); acc += L
        buf.append(a); buf.append(np.zeros(int(GAP * SR))); t += dur + GAP
    buf.append(np.zeros(int(TAIL * SR)))
    a = np.concatenate(buf); a = a / (np.abs(a).max() + 1e-9) * 0.89
    sf.write(f"{out}/v{i}.wav", a.astype(np.float32), SR)
    timings.append({"dur": len(a) / SR, "words": words})
    print(i, round(len(a) / SR, 2))
json.dump(timings, open(f"{out}/timings.json", "w"), ensure_ascii=False, indent=1)
print("total", round(sum(x["dur"] for x in timings), 2))
