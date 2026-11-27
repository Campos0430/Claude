# Paper foley for "Un virus apagó un gen": every sound sits on an event of main.js
import numpy as np
from scipy import signal
from scipy.io import wavfile
SR = 48000; DUR = 55.8; N = int(SR * DUR); rng = np.random.default_rng(11)
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
# --- events from film47.js ---
def click(f=3200, g=1.0):  # paper light switch: two tiny clicks + card tap
    t = T(.06); x = (np.sin(2 * np.pi * f * t) * np.exp(-t * 300) + lp(rng.standard_normal(len(t)), 5000) * np.exp(-t * 200) * .6); return x * g
def gliss(f0, f1, d=.35):
    t = T(d); f = f0 * (f1 / f0) ** (t / d); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) ** .8
def snip():
    t = T(.08); return bp(rng.standard_normal(len(t)), 2500, 9000) * np.exp(-t * 60) + np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 90) * .3
# virus on its string comes down (0-2.85), the chimp's bulb goes out (2.88), the human's glows (6.3)
add(creak(.8), 0.0, .12, -.3); add(swish(2.6) * .5, 0.1, .18, -.3)
add(click(3000), 2.86, .7, -.35); add(click(2600), 2.9, .5, -.35); add(gliss(900, 300, .45), 2.92, .25, -.35)
add(click(3400), 6.28, .4, .35); add(gliss(500, 1500, .35), 6.3, .22, .35)
for t0, p in [(50.5, -.3), (50.55, .3)]: add(tink(2600), t0, .22, p); add(thump(150, .16), t0 + .3, .3, p)   # bulbs drop back in
add(tink(2300), 52.6, .18, -.1); add(creak(.7), 52.8, .1, -.1)                                                 # virus string back down for the loop
SIGNS_IN = [5.0, 8.5, 10.5, 15.9, 21.3, 25.4, 32.0, 37.6, 39.8, 43.0, 54.6]
SIGNS_OUT = [4.75, 7.0, 10.3, 13.6, 18.9, 23.5, 28.4, 34.4, 39.6, 42.7, 44.95]
for t0 in SIGNS_IN: add(tink(2200), t0, .16, -.2); add(tink(2350), t0 + .03, .13, .2); add(thump(110, .22), t0 + .45, .42); add(creak(.5), t0 + .5, .1)
for t1 in SIGNS_OUT: add(swish(.45), t1, .22)
for t0 in [7.2, 15.25, 20.65, 36.45, 45.05]: add(swish(1.2), t0, .6); add(thump(80, .25), t0 + 1.0, .35)        # page turns
POPS = [8.35, 37.35, 37.45, 44.5, 45.85, 46.5, 50.35, 50.5, 50.6, 28.75]
for i, t0 in enumerate(POPS): add(snap(380 + 40 * (i % 4), 1500 + 150 * (i % 3)), t0, .42, .25 * np.sin(i))
for i in range(24): add(snap(700, 2400, .05), 8.55 + i * .025, .1, -.5 + i / 24); add(snap(700, 2400, .05), 21.95 + i * .025, .1, -.5 + i / 24)   # helix unfolds
for ii in range(5): add(snap(900, 2600, .05), 11.85 + ii * .14, .25, .3); add(snap(900, 2600, .05), 24.5 + ii * .06, .22, -.1)   # virus rungs slot in
add(swish(.6) * .6, 11.72, .2, -.3)                                                                               # dashed arrow
add(gliss(1400, 500, .9) * .6, 23.6, .18, -.1); add(thump(120, .2), 24.45, .4)                                    # copy drops into the gene
add(click(2600), 24.5, .5, .3); add(gliss(900, 300, .4), 24.52, .2, .3)                                            # bulb out
add(swish(.55), 32.1, .35, .4)                                                                                     # scissors fly in
for k in range(4): add(snip(), 32.75 + k * .224, .55, .1)
for ii in range(5): add(crinkle(.12, 2000, 1500, 7000), 32.75 + ii * .12, .3, -.4 + .2 * ii); add(snap(800, 2400, .05), 34.4 + ii * .08, .18, .1)
add(swish(.5), 33.7, .25, .5)
add(click(3400), 35.08, .55, .3); add(gliss(500, 1600, .4), 35.1, .25, .3)                                       # bulb back on
for i in range(22): add(tink(2900 + 50 * (i % 6)), 16.85 + i * .045, .06, -.5 + i / 44)                          # 150 viruses drop on strings
add(thump(140, .18), 16.75, .4, -.4); add(thump(150, .18), 19.35, .4, .4)                                        # counter cards
for k in range(12): add(blip(1700 + 60 * (k % 5)), 16.84 + k * .09, .3, -.4)
for i in range(7): add(snap(600, 2200, .06), 40.85 + i * .09, .25, -.5 + i / 7)                                  # neurons pop
for i in range(6): add(twang(300 + 35 * i), 41.3 + i * .12, .12, -.5 + .2 * i)                                   # they connect
add(thump(100, .25), 45.45, .5); add(snap(300, 1800, .12), 45.45, .35); add(swish(.4), 50.2, .25)               # question card
ACT = [2.9, 6.4, 14.55, 20.05, 24.45, 30.95, 35.85, 44.55]
for t0 in ACT: add(snap(300, 2000, .12), t0, .5); add(crinkle(.35, 1800, 1500, 9000), t0 + .02, .3)
# room tone + a quiet clock
t = np.arange(N) / SR; room = lp(rng.standard_normal(N), 400) * .02
out += room[:, None]
for k in range(int(DUR)): add(lp(rng.standard_normal(int(.01 * SR)), 3000) * np.exp(-np.arange(int(.01 * SR)) / SR * 400), k + .5, .03, .6)
out = out / np.abs(out).max() * .89
wavfile.write('foley.wav', SR, (out * 32767).astype(np.int16)); print('ok')
