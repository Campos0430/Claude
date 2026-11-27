# New score for "Un virus apagó un gen" (replaces the ukulele + music-box bed): pizzicato strings, toy piano, glockenspiel,
# a breathy clarinet line and brushes. G mixolydian, 108 BPM, stings on picture events. Loops edge to edge (no fades).
import numpy as np
from scipy import signal
from scipy.io import wavfile
SR = 48000; DUR = 55.8; N = int(SR * DUR); rng = np.random.default_rng(23)
def T(d): return np.arange(int(d * SR)) / SR
def note(m): return 440 * 2 ** ((m - 69) / 12)
def add(buf, x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); n = min(len(x), len(buf) - i)
    if n <= 0 or i < 0: return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + n, 0] += x[:n] * g * l; buf[i:i + n, 1] += x[:n] * g * r
def lp(x, fc): b, a = signal.butter(2, fc / (SR / 2)); return signal.lfilter(b, a, x, axis=0)
def bp(x, lo, hi): b, a = signal.butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def pizz(f, d=.5):
    t = T(d); x = sum(a * np.sin(2 * np.pi * f * k * t) * np.exp(-t * (9 + 6 * k)) for k, a in [(1, 1), (2, .5), (3, .25), (4, .12)])
    return x * np.minimum(1, t / .003)
def toyp(f, d=.9):   # toy piano: metal tines, inharmonic
    t = T(d); x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * dd) for r, a, dd in [(1, 1, 5), (3.9, .35, 14), (9.2, .12, 30)])
    return x * np.minimum(1, t / .001)
def glock(f, d=1.4):
    t = T(d); return (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 8)) * np.exp(-t * 3.2) * np.minimum(1, t / .001)
def clar(f, d):     # odd harmonics + breath, soft attack
    t = T(d); vib = 1 + .004 * np.sin(2 * np.pi * 5 * t) * np.minimum(1, t / .4); ph = 2 * np.pi * f * np.cumsum(vib) / SR
    x = np.sin(ph) + .35 * np.sin(3 * ph) + .15 * np.sin(5 * ph) + .05 * bp(rng.standard_normal(len(t)), 1500, 4000)
    return x * np.minimum(1, t / .06) * np.minimum(1, (d - t) / .08)
def brush(d=.18, g=1.0):
    t = T(d); return bp(rng.standard_normal(len(t)), 2500, 9000) * np.exp(-t * 18) * g
G, C, D, Em, Am, F = [43, 55, 59, 62], [48, 55, 60, 64], [50, 57, 62, 66], [40, 55, 59, 64], [45, 57, 60, 64], [41, 57, 60, 65]
BPM = 108; BEAT = 60 / BPM; BAR = 4 * BEAT
SECT = [(0.0, [G, F, C, G]), (7.2, [Em, C, G, D]), (15.25, [G, F, C, D]), (20.65, [Am, F, C, G]), (36.45, [C, G, Am, F]), (45.05, [F, C, D, D]), (50.2, [G, F, C, G]), (99, None)]
def chord_at(t):
    for k in range(len(SECT) - 1):
        s0, pr = SECT[k]; s1 = SECT[k + 1][0]
        if s0 <= t < s1: return pr[int((t - s0) // BAR) % len(pr)]
    return G
mus = np.zeros((N, 2)); stg = np.zeros((N, 2))
b = 0; t = 0.0
while t < DUR:
    ch = chord_at(t); beat = b % 4
    add(mus, pizz(note(ch[0] if beat in (0, 2) else ch[0] + 7), .45), t, .5 if beat in (0, 2) else .32, -.1)    # pizz bass
    for k, m in enumerate(ch[1:]): add(mus, pizz(note(m + 12), .3), t + BEAT / 2, .13, -.4 + .4 * k)              # pizz chord offbeats
    add(mus, brush(.16, .5 if beat in (1, 3) else .25), t, 1, .3); add(mus, brush(.08, .15), t + BEAT / 2, 1, .35)
    m = ch[1 + (b * 2) % 3] + 24; add(mus, toyp(note(m), .7), t + BEAT * .25, .1, .45)                            # toy piano figure
    t += BEAT; b += 1
# a short clarinet tune, two phrases, returning for the loop
TUNE = [(0, 67, 1), (1, 71, 1), (2, 74, 2), (4, 72, 1), (5, 71, 1), (6, 69, 2), (8, 67, 1.5), (9.5, 69, .5), (10, 71, 2), (12, 74, 4)]
for start in [0.0, 15.25, 36.45, 50.2]:
    for st, m, d in TUNE:
        tt = start + st * BEAT
        if tt + d * BEAT < DUR: add(mus, clar(note(m - (5 if start in (15.25, 36.45) else 0)), d * BEAT * .95), tt, .09, .15)
SIGN_T = [5.0, 8.5, 10.5, 15.9, 21.3, 25.4, 32.0, 37.6, 39.8, 43.0, 54.6]
POP_T = [8.35, 16.75, 19.35, 37.35, 40.85, 44.5, 45.85, 50.35]
TURN_T = [7.2, 15.25, 20.65, 36.45, 45.05]
ACT_T = [2.9, 6.4, 14.55, 20.05, 24.45, 30.95, 35.85, 44.55]
def sting(t0, size):
    ch = chord_at(t0)
    for k, m in enumerate(ch[1:]): add(stg, glock(note(m + 24)), t0 + k * .03, .14 * size, -.3 + .3 * k)
    if size > 1.1: add(stg, pizz(note(ch[0] - 12 if ch[0] > 40 else ch[0]), .6), t0, .5)
for t0 in SIGN_T: sting(t0, 1.0)
for t0 in POP_T: sting(t0, .6)
for t0 in TURN_T: sting(t0, .9)
for t0 in ACT_T: sting(t0, 1.4)
def norm(x, p=.89): return x / np.abs(x).max() * p
wavfile.write('music.wav', SR, (norm(lp(mus, 7500)) * 32767).astype(np.int16)); wavfile.write('stings.wav', SR, (norm(lp(stg, 9000)) * 32767).astype(np.int16)); print('ok')
