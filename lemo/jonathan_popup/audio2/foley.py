# Paper foley synced to the pop-up picture (replaces the old Remotion SFX)
import numpy as np
from scipy import signal
from scipy.io import wavfile
SR = 48000; DUR = 90.8; N = int(SR * DUR); rng = np.random.default_rng(11)
out = np.zeros((N, 2))
def add(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); n = min(len(x), N - i)
    if n <= 0: return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    out[i:i + n, 0] += x[:n] * g * l; out[i:i + n, 1] += x[:n] * g * r
def bp(x, lo, hi): b, a = signal.butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def lp(x, fc): b, a = signal.butter(2, fc / (SR / 2)); return signal.lfilter(b, a, x)
def T(d): return np.arange(int(d * SR)) / SR
def crinkle(d=.25, dens=900, lo=2000, hi=9000):
    n = int(d * SR); x = np.zeros(n); k = rng.integers(0, n, int(dens * d)); x[k] = rng.uniform(-1, 1, len(k)) * rng.uniform(.2, 1, len(k))
    x = bp(x, lo, hi); t = T(d)[:n]; return x * np.exp(-t * 6) / (np.abs(x).max() + 1e-9)
def snap(f0=500, f1=1800, d=.09):  # pop-up snap: short sine sweep + crinkle
    t = T(d); f = f0 * (f1 / f0) ** (t / d); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40)
    c = crinkle(.12, 1500); y = np.zeros(max(len(s), len(c))); y[:len(s)] += s * .7; y[:len(c)] += c * .5; return y
def thump(f=90, d=.25, g=1.0):  # cardboard thump
    t = T(d); x = np.sin(2 * np.pi * f * t * (1 - .3 * t / d)) * np.exp(-t * 22) + lp(rng.standard_normal(len(t)), 900) * np.exp(-t * 40) * .4
    return x * g / np.abs(x).max()
def swish(d=1.2):  # page turn
    t = T(d); n = rng.standard_normal(len(t)); env = np.sin(np.pi * np.clip(t / d, 0, 1)) ** 1.5
    y = np.zeros(len(t)); seg = 30
    for b in range(seg):
        a, z = b * len(t) // seg, (b + 1) * len(t) // seg; fc = 900 + 3500 * np.sin(np.pi * b / seg)
        y[a:z] = bp(n[max(0, a - 2000):z], fc * .6, min(20000, fc * 1.5))[-(z - a):]
    y = y * env + crinkle(d, 300, 2500, 8000)[:len(t)] * .25 * env
    return y / np.abs(y).max()
def tink(f=2400):  # string tink
    t = T(.35); return (np.sin(2 * np.pi * f * t) + .4 * np.sin(2 * np.pi * f * 2.7 * t)) * np.exp(-t * 18)
def twang(f=330):  # string spring
    t = T(.6); fm = f * (1 + .15 * np.exp(-t * 8) * np.sin(2 * np.pi * 9 * t)); return np.sin(2 * np.pi * np.cumsum(fm) / SR) * np.exp(-t * 7)
def blip(f): t = T(.045); return np.sign(np.sin(2 * np.pi * f * t)) * .4 * np.exp(-t * 60)
def creak(d=.7):
    t = T(d); pulses = np.zeros(len(t)); rate = 40 + 30 * np.sin(np.pi * t / d); ph = np.cumsum(rate) / SR; idx = np.where(np.diff(np.floor(ph)) > 0)[0]
    pulses[idx] = rng.uniform(.5, 1, len(idx)); y = bp(signal.lfilter([1], [1, -.97], pulses), 300, 2500); return y / (np.abs(y).max() + 1e-9) * np.sin(np.pi * t / d)
# --- events from main.js ---
add(creak(.9), 0.0, .35); add(swish(.9), 0.05, .4); add(thump(70, .3), 0.85, .5)           # book opens
add(snap(400, 1400), 0.85, .5, -.1)                                                          # tortoise pops
for t0, p in [(2.5, -.3), (3.4, .3)]: add(tink(2600), t0, .25, p); add(thump(140, .18), t0 + .3, .35, p)   # phone/bulb drop on strings
for t0, p in [(2.95, -.3), (3.85, .3)]: add(crinkle(.18, 2500, 1500, 7000), t0, .5, p); add(thump(180, .12), t0 + .05, .3, p)  # red X slaps
SIGNS = [[5.95, 9.45], [10.4, 15.3], [17.2, 21.4], [25.3, 28.2], [29.4, 33.0], [44.4, 46.9], [47.2, 49.8], [52.6, 55.5], [60.4, 63.4], [67.2, 72.8], [79.6, 84.0], [84.4, 86.5]]
for t0, t1 in SIGNS:
    add(tink(2200), t0, .18, -.2); add(tink(2350), t0 + .03, .15, .2); add(thump(110, .22), t0 + .45, .45); add(creak(.5), t0 + .5, .12)
    add(swish(.45), t1, .25)
POPS = [7.45, 12.9, 13.95, 16.75, 16.9, 19.7, 23.7, 25.25, 32.3, 34.1, 47.0, 59.65, 65.8, 73.1]
for i, t0 in enumerate(POPS): add(snap(380 + 40 * (i % 4), 1500 + 150 * (i % 3)), t0, .45, .25 * np.sin(i))
add(crinkle(.3, 2500, 1800, 8000), 32.9, .45, -.2)                                           # red X over syringe
for i in range(5): add(snap(600, 2200, .07), 37.7 + i * .12, .3, -.4 + .2 * i)               # bacteria pop
for t0 in [15.55, 24.1, 28.3, 38.85, 66.9]: add(swish(1.3), t0, .6); add(thump(80, .25), t0 + 1.25, .35)   # page turns
add(creak(.6), 17.0, .15); add(swish(7.0) * .4, 17.0, .25, -.2)                              # boat slides on its string
for i in range(26): add(snap(700, 2400, .05), 39.65 + i * .03, .12, -.5 + i / 26)            # helix rungs unfold
for vi in range(9): add(snap(900, 2600, .05), 40.05 + vi * .18, .22, .3)                     # variant rungs flip amber
for k in range(14): add(blip(1800 + 60 * (k % 5)), 40.0 + k * .115, .35)                     # 287 counter rolls
for i in range(22): add(tink(3000 + 40 * (i % 6)), 52.7 + i * .03, .05, -.5 + i / 22)       # marks drop on threads
for i in range(6): add(twang(260 + 40 * i), 55.6 + i * .05, .12, -.5 + .2 * i)               # marks scatter (springs)
for i in range(9): add(tink(2800), 60.3 + i * .05, .07, -.4 + .1 * i)                        # marks line up
ACT = [4.65, 23.65, 27.55, 36.75, 55.65, 64.75]
for t0 in ACT: add(snap(300, 2000, .12), t0, .55); add(crinkle(.35, 1800, 1500, 9000), t0 + .02, .35)
for t0, t1, txt in [(21.8, 23.5, 'Un regalo para el gobernador'), (75.6, 78.9, '«Quizá Jonathan es muy bueno siendo viejo»')]:   # typed bubbles
    add(snap(500, 1500, .07), t0, .3)
    for k in range(0, len(txt), 2):
        tt = t0 + .1 + k / 32
        if tt < t1: add(blip(900 + 120 * ((k // 2) % 5)), tt, .12)
add(creak(1.0), 86.55, .35); add(swish(1.0), 86.6, .4); add(thump(60, .5, 1.0), 87.5, .8)   # book closes
# room tone + a quiet clock
t = np.arange(N) / SR; room = lp(rng.standard_normal(N), 400) * .02
out += room[:, None]
for k in range(int(DUR)): add(lp(rng.standard_normal(int(.01 * SR)), 3000) * np.exp(-np.arange(int(.01 * SR)) / SR * 400), k + .5, .03, .6)
out = out / np.abs(out).max() * .89
wavfile.write('foley.wav', SR, (out * 32767).astype(np.int16)); print('ok')
