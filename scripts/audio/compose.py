#!/usr/bin/env python3
"""
Compose an original deadpan background score, synthesized from scratch, so
there are no samples, no licenses and no Content ID risk.

  .venv/bin/python scripts/audio/compose.py <out.wav> <seconds> [--seed N] [--bpm 92]

Style: sneaky/deadpan pizzicato + marimba over a pizzicato bass and soft
woodblock/shaker, D minor, i–VI–iv–V. The piece is laid out in 4-bar phrases and
always ends on a resolved D-minor chord at exactly <seconds>.
"""
import argparse

import numpy as np
import soundfile as sf
from scipy.signal import butter, lfilter

SR = 44100
rng = np.random.default_rng(7)


def midi_hz(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


def pluck(freq: float, dur: float, decay: float = 0.996, bright: float = 0.5) -> np.ndarray:
    """Karplus–Strong plucked string (pizzicato / bass)."""
    n = int(SR * dur)
    period = max(2, int(SR / freq))
    buf = rng.uniform(-1, 1, period) * bright + rng.uniform(-1, 1, period) * (1 - bright) * 0.3
    out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % period]
        buf[i % period] = decay * 0.5 * (buf[i % period] + buf[(i + 1) % period])
    env = np.exp(-np.linspace(0, dur * 5.5, n))
    return out * env


def marimba(freq: float, dur: float) -> np.ndarray:
    t = np.arange(int(SR * dur)) / SR
    tone = np.sin(2 * np.pi * freq * t) + 0.35 * np.sin(2 * np.pi * freq * 4.0 * t) * np.exp(-t * 30)
    return tone * np.exp(-t * 6.5) * (1 - np.exp(-t * 900))


def woodblock(dur: float = 0.08, freq: float = 1250) -> np.ndarray:
    t = np.arange(int(SR * dur)) / SR
    return np.sin(2 * np.pi * freq * t) * np.exp(-t * 70)


def shaker(dur: float = 0.06) -> np.ndarray:
    n = int(SR * dur)
    b, a = butter(2, [5000 / (SR / 2), 11000 / (SR / 2)], btype="band")
    return lfilter(b, a, rng.uniform(-1, 1, n)) * np.exp(-np.linspace(0, 9, n))


def add(track: np.ndarray, sig: np.ndarray, at: float, gain: float) -> None:
    i = int(at * SR)
    j = min(len(track), i + len(sig))
    if i < len(track):
        track[i:j] += sig[: j - i] * gain


# D minor: i (Dm) – VI (Bb) – iv (Gm) – V (A)
CHORDS = [
    (50, [62, 65, 69]),  # Dm
    (46, [62, 65, 70]),  # Bb
    (43, [62, 67, 70]),  # Gm
    (45, [61, 64, 69]),  # A
]
SCALE = [62, 64, 65, 67, 69, 70, 72, 74]  # D natural minor, upper octave


def compose(seconds: float, bpm: float, seed: int) -> np.ndarray:
    global rng
    rng = np.random.default_rng(seed)
    beat = 60.0 / bpm
    bar = 4 * beat
    total = np.zeros(int(SR * (seconds + 3)))
    n_bars = int(seconds // bar)
    end_bar = n_bars  # final resolved chord lands here

    melody_rng = np.random.default_rng(seed + 1)
    for b in range(end_bar):
        t0 = b * bar
        root, triad = CHORDS[b % 4]
        phrase = b // 4
        intro = phrase == 0
        # Bass: roots on beats 1 and 3, a passing note on the "and" of 4.
        add(total, pluck(midi_hz(root - 12), beat * 1.6, 0.997, 0.8), t0, 0.55)
        add(total, pluck(midi_hz(root - 12 + (7 if b % 2 else 0)), beat * 1.6, 0.997, 0.8), t0 + 2 * beat, 0.45)
        if b % 4 == 3:
            add(total, pluck(midi_hz(root - 12 + 2), beat * 0.6, 0.996, 0.8), t0 + 3.5 * beat, 0.35)
        # Pizzicato arpeggio on eighths (sneaky, staccato), lighter in the intro.
        pattern = [0, 1, 2, 1, 0, 2, 1, 2]
        for k, p in enumerate(pattern):
            if intro and k % 2:
                continue
            note = triad[p] + (12 if (k == 5 and phrase % 2) else 0)
            add(total, pluck(midi_hz(note), beat * 0.45, 0.993, 0.5), t0 + k * beat / 2, 0.22 if k % 2 else 0.3)
        # Marimba melody from phrase 1 on: sparse, off-beat, chord tones + scale steps.
        if not intro:
            for k in range(8):
                if melody_rng.random() < (0.45 if phrase % 2 else 0.3):
                    pool = triad + [n + 12 for n in triad[:1]] + SCALE[:5]
                    note = int(melody_rng.choice(pool)) + 12
                    add(total, marimba(midi_hz(note), beat * 0.9), t0 + k * beat / 2 + beat / 2 * (k % 2 == 0) * 0.0, 0.16)
        # Percussion: woodblock on 2 and 4, shaker on off-beats.
        if not intro:
            add(total, woodblock(), t0 + beat, 0.12)
            add(total, woodblock(freq=1050), t0 + 3 * beat, 0.12)
        for k in range(8):
            if k % 2:
                add(total, shaker(), t0 + k * beat / 2, 0.05)

    # Resolution: a held Dm chord on marimba + pizz + low D, at the very end.
    t_end = end_bar * bar
    for note in [50 - 12, 62, 65, 69, 74]:
        add(total, pluck(midi_hz(note), 2.5, 0.998, 0.6), t_end, 0.3)
        add(total, marimba(midi_hz(note + 12), 2.5), t_end, 0.12)

    # Gentle warmth: a little low-pass, plus a short slap reverb.
    b, a = butter(2, 9000 / (SR / 2))
    total = lfilter(b, a, total)
    rev = np.zeros_like(total)
    for d, g in [(0.071, 0.25), (0.113, 0.18), (0.197, 0.12), (0.293, 0.07)]:
        k = int(d * SR)
        rev[k:] += total[:-k] * g
    total = total + rev
    total = total[: int(SR * (t_end + 2.6))]
    # Fade the tail, normalize to −1 dBFS peak.
    fade = int(SR * 1.2)
    total[-fade:] *= np.linspace(1, 0, fade)
    total /= np.max(np.abs(total)) / 0.89
    return total.astype(np.float32)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("seconds", type=float, help="time where the final resolved chord should land")
    ap.add_argument("--seed", type=int, default=11)
    ap.add_argument("--bpm", type=float, default=92)
    a = ap.parse_args()
    audio = compose(a.seconds, a.bpm, a.seed)
    sf.write(a.out, np.stack([audio, audio], axis=1), SR, subtype="PCM_16")
    print(f"wrote {a.out} ({len(audio) / SR:.1f}s, {a.bpm} bpm, seed {a.seed})")
