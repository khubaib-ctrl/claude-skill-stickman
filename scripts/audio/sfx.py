#!/usr/bin/env python3
"""
Synthesize the channel's original sound-effect library: no samples, no
licenses.

  .venv/bin/python scripts/audio/sfx.py [out_dir]   (default public/audio/sfx)

Every effect is short, soft and cartoony, built to sit under the narration.
"""
import os
import sys

import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter

SR = 44100
rng = np.random.default_rng(3)


def t_(d):
    return np.arange(int(SR * d)) / SR


def env(d, attack=0.003, decay=8.0):
    t = t_(d)
    return (1 - np.exp(-t / max(attack, 1e-4))) * np.exp(-t * decay)


def tone(f, d, decay=8.0, kind="sine"):
    t = t_(d)
    ph = 2 * np.pi * (np.cumsum(np.full_like(t, f) if np.isscalar(f) else f) / SR)
    w = np.sin(ph) if kind == "sine" else np.sign(np.sin(ph)) * 0.6
    return w * env(d, decay=decay)


def sweep(f0, f1, d, decay=4.0, kind="sine"):
    t = t_(d)
    f = f0 * (f1 / f0) ** (t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    w = np.sin(ph) if kind == "sine" else np.sign(np.sin(ph)) * 0.5
    return w * env(d, decay=decay)


def noise(d, lo=None, hi=None, decay=8.0):
    x = rng.uniform(-1, 1, int(SR * d))
    if lo and hi:
        b, a = butter(2, [lo / (SR / 2), hi / (SR / 2)], btype="band")
    elif hi:
        b, a = butter(2, hi / (SR / 2))
    elif lo:
        b, a = butter(2, lo / (SR / 2), btype="high")
    else:
        b, a = [1], [1]
    return lfilter(b, a, x) * env(d, decay=decay)


def bell(f, d=1.2):
    t = t_(d)
    mod = np.sin(2 * np.pi * f * 1.4 * t) * 2.0 * np.exp(-t * 3)
    return np.sin(2 * np.pi * f * t + mod) * np.exp(-t * 3.5)


def seq(parts, gap):
    out = np.zeros(int(SR * (gap * len(parts) + 1.0)))
    for i, p in enumerate(parts):
        k = int(i * gap * SR)
        out[k : k + len(p)] += p
    return np.trim_zeros(out, "b")


def mix(*parts):
    n = max(len(p) for p in parts)
    out = np.zeros(n)
    for p in parts:
        out[: len(p)] += p
    return out


def footsteps(n=6, gap=0.38):
    return seq([noise(0.07, 120, 900, decay=40) + tone(90, 0.07, decay=45) * 0.6 for _ in range(n)], gap)


SFX = {
    "shop-bell": lambda: mix(bell(1568, 1.4), bell(2093, 1.2) * 0.6),
    "blip": lambda: tone(1320, 0.09, decay=30, kind="square") * 0.5,
    "power-down": lambda: seq([tone(f, 0.12, decay=18, kind="square") * 0.45 for f in (880, 740, 587, 440)], 0.16),
    "switch": lambda: mix(noise(0.03, 2000, 8000, decay=120), tone(2400, 0.02, decay=200) * 0.5),
    "title-thud": lambda: mix(sweep(140, 45, 0.5, decay=6), noise(0.15, 60, 400, decay=25) * 0.6),
    "crowd": lambda: noise(3.0, 300, 1800, decay=0.3) * 0.5 * (0.6 + 0.4 * np.sin(2 * np.pi * 1.7 * t_(3.0))),
    "camera-click": lambda: seq([mix(noise(0.04, 1500, 9000, decay=90), tone(3000, 0.015, decay=300) * 0.4)] * 3, 0.22),
    "typing": lambda: seq([noise(0.025, 1200, 7000, decay=150) * (0.6 + 0.4 * rng.random()) for _ in range(14)], 0.11),
    "ding": lambda: bell(1760, 1.0) * 0.7,
    "clatter": lambda: seq([mix(noise(0.06, 800, 6000, decay=50), tone(rng.uniform(900, 2200), 0.08, decay=45) * 0.5) for _ in range(7)], 0.07),
    "fire": lambda: mix(noise(4.0, 200, 3000, decay=0.2) * 0.35, seq([noise(0.02, 2000, 9000, decay=150) for _ in range(40)], 0.1) * 0.5),
    "wind": lambda: noise(5.0, 150, 900, decay=0.15) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.23 * t_(5.0))) * 0.6,
    "splash": lambda: mix(noise(0.9, 300, 6000, decay=4.5), sweep(400, 90, 0.4, decay=7) * 0.5),
    "door": lambda: mix(sweep(220, 330, 0.6, decay=2.5, kind="square") * 0.18, noise(0.12, 80, 500, decay=20)),
    "footsteps": lambda: footsteps(),
    "boop": lambda: sweep(900, 260, 0.35, decay=5) * 0.7,
    "handshake": lambda: mix(noise(0.05, 500, 4000, decay=70), tone(180, 0.06, decay=50) * 0.7),
    "sting": lambda: seq([bell(f, 0.6) * 0.5 for f in (784, 988, 1175)], 0.11),
    "bonk": lambda: sweep(520, 330, 0.18, decay=14) * 0.8,
    "wah": lambda: seq([sweep(f * 1.03, f * 0.97, 0.45, decay=3, kind="square") * 0.3 for f in (392, 370, 349, 330)], 0.38),
    "thump": lambda: mix(tone(70, 0.25, decay=14), noise(0.06, 80, 600, decay=40) * 0.6),
    "scribble": lambda: noise(1.0, 1500, 6000, decay=0.8) * (0.4 + 0.6 * np.abs(np.sin(2 * np.pi * 7 * t_(1.0)))) * 0.5,
    "ka-ching": lambda: mix(noise(0.08, 2000, 9000, decay=60), seq([bell(2093, 0.9), bell(2637, 0.9)], 0.07) * 0.7),
    "dun": lambda: mix(tone(55, 0.9, decay=3), tone(110, 0.6, decay=5) * 0.4),
    "hum": lambda: (tone(60, 4.0, decay=0.05) + tone(120, 4.0, decay=0.05) * 0.4) * 0.25,
    "power-up": lambda: sweep(200, 800, 0.8, decay=1.5) * 0.5,
    "whoosh": lambda: noise(0.5, 400, 3000, decay=5) * np.sin(np.linspace(0, np.pi, int(SR * 0.5))),
    "box-rattle": lambda: seq([mix(noise(0.04, 300, 2500, decay=60), tone(rng.uniform(180, 320), 0.05, decay=60) * 0.4) for _ in range(5)], 0.09),
    "door-close": lambda: mix(tone(80, 0.3, decay=12), noise(0.08, 100, 900, decay=35)),
}


if __name__ == "__main__":
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "public/audio/sfx"
    os.makedirs(out_dir, exist_ok=True)
    for name, fn in SFX.items():
        x = np.asarray(fn(), dtype=np.float64)
        # Short fade in/out to avoid clicks, normalize to −3 dBFS.
        f = min(len(x) // 4, int(0.004 * SR))
        x[:f] *= np.linspace(0, 1, f)
        x[-f:] *= np.linspace(1, 0, f)
        peak = np.max(np.abs(x)) or 1
        x = x / peak * 0.7
        sf.write(os.path.join(out_dir, f"{name}.wav"), x.astype(np.float32), SR, subtype="PCM_16")
    print(f"wrote {len(SFX)} effects to {out_dir}")
