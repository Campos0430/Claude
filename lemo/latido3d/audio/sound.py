# «El último latido» (realistic 3D): new cinematic score (string-like pads, low drone, felt-piano motif, soft taiko),
# heartbeat lub-dub on every beat, and space foley synced to the picture (shells, flashes, ALMA wind + servos, reveals)
import numpy as np
from scipy import signal
from scipy.io import wavfile
SR = 48000; DUR = 59.3; N = int(SR * DUR); rng = np.random.default_rng(57)
def T(d): return np.arange(int(d * SR)) / SR
def lp(x, fc): b, a = signal.butter(2, fc / (SR / 2)); return signal.lfilter(b, a, x, axis=0)
def hp(x, fc): b, a = signal.butter(2, fc / (SR / 2), 'high'); return signal.lfilter(b, a, x, axis=0)
def bp(x, lo, hi): b, a = signal.butter(2, [lo / (SR / 2), hi / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def mk(): return np.zeros((N, 2))
def add(buf, x, t0, g=1.0, pan=0.0):
    i = int(round(t0 * SR))
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), N - i)
    if n <= 0: return
    l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    buf[i:i + n, 0] += x[:n] * g * l; buf[i:i + n, 1] += x[:n] * g * r
def note(m): return 440 * 2 ** ((m - 69) / 12)
P = DUR / 47; B0 = -0.35
STEADY = [B0 + k * P for k in range(-1, 49) if (B0 + k * P) < 6.1 or (B0 + k * P) >= 48.4]
PULSES = [18.0, 19.2, 20.5]
LAUNCH = [b for b in STEADY] + [21.0, 21.6, 22.2]
# ---------------- instruments
def strings(fs, d, bright=1400):   # ensemble: many detuned saws, slow attack, low-passed
    t = T(d); x = np.zeros(len(t))
    for f in fs:
        for k in range(5):
            dt = (k - 2) * 0.0035; ph = rng.uniform(0, 1); x += 2 * ((f * (1 + dt) * t + ph) % 1) - 1
    x = lp(x / (len(fs) * 5), bright) * (1 + 0.04 * np.sin(2 * np.pi * 5.1 * t))
    return x * np.minimum(1, t / 1.2) * np.minimum(1, (d - t) / 1.0)
def drone(f, d):
    t = T(d); x = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * 2 * f * t + 0.3) + 0.2 * np.sin(2 * np.pi * 3.01 * f * t)
    return x * np.minimum(1, t / 2) * np.minimum(1, (d - t) / 2)
def felt(f, d=3.0):   # felt piano: soft hammer, fast decay of partials
    t = T(d); x = sum(a * np.sin(2 * np.pi * f * k * t * (1 + 0.0004 * k * k)) * np.exp(-t * (1.2 + 1.8 * k)) for k, a in [(1, 1), (2, .45), (3, .2), (4, .1)])
    return lp(x * np.minimum(1, t / .006), 3500)
def taiko(g=1.0):
    t = T(.9); ph = 2 * np.pi * 52 * t * (1 - .25 * t); x = np.sin(ph) * np.exp(-t * 5) + lp(rng.standard_normal(len(t)), 500) * np.exp(-t * 25) * .5; return x * g / np.abs(x).max()
# harmony: D minor colour, one chord per two heartbeats
CH = [[50, 57, 62, 65], [46, 53, 58, 62], [48, 55, 60, 64], [45, 52, 57, 61]]
mus = mk(); k = -1
while True:
    t0 = B0 + k * 2 * P
    if t0 > DUR: break
    c = CH[((k % 4) + 4) % 4]
    add(mus, strings([note(m) for m in c[1:]], 2 * P + 1.0), t0, .55, 0)
    add(mus, strings([note(c[0] - 12)], 2 * P + 1.0, 600), t0, .5, 0)
    k += 1
add(mus, drone(note(38), DUR + 2), -1, .25)
MOTIF = [74, 77, 76, 72, 74]                            # a five-note felt-piano motif on the strong moments
for t0 in [0.15, 23.7, 35.8, 48.5]:
    for j, m in enumerate(MOTIF): add(mus, felt(note(m)), t0 + j * P / 2, .32, -.2 + .1 * j)
for b in [6.1, 10.2, 15.7, 26.0, 37.9, 43.65, 53.6]: add(mus, taiko(.8), b, .35)
# swell into the drop on "lanzan capas" and into the reveal
for a, d in [(20.0, 1.0), (34.6, 1.1)]:
    t = T(d); add(mus, lp(rng.standard_normal(len(t)), 5000) * (t / d) ** 2.5 * .4, a, 1)
add(mus, strings([note(m) for m in [62, 69, 74, 77]], 3.0, 2600), 21.0, .5)
mus[int(35.25 * SR):int(35.72 * SR)] *= np.linspace(1, 0, int(35.72 * SR) - int(35.25 * SR))[:, None] ** 3   # a breath of silence before the reveal
# ---------------- heartbeat
def lub(f=55, g=1.0):
    t = T(.35); ph = 2 * np.pi * f * t * (1 - .35 * t / .35); x = (np.sin(ph) + .5 * np.sin(2 * ph) + .2 * np.sin(3 * ph)) * np.exp(-t * 11) + lp(rng.standard_normal(len(t)), 1200) * np.exp(-t * 80) * .35
    return x * g / np.abs(x).max()
hb = mk()
for b in STEADY: add(hb, lub(55), b, 1); add(hb, lub(64, .7), b + .22, .7)
for b in PULSES: add(hb, lub(48), b, 1.3); add(hb, lub(58, .8), b + .22, 1.0)
# ---------------- foley
fo = mk()
def whoosh(d, f0=300, f1=2400):
    t = T(d); n = rng.standard_normal(len(t)); y = np.zeros(len(t)); S = 20
    for s in range(S):
        a, z = s * len(t) // S, (s + 1) * len(t) // S; fc = f0 + (f1 - f0) * np.sin(np.pi * (a + z) / 2 / len(t)); y[a:z] = bp(n[max(0, a - 1500):z], fc * .6, min(20000, fc * 1.5))[-(z - a):]
    return y * np.sin(np.pi * t / d) ** 1.2 / (np.abs(y).max() + 1e-9)
def rumble(d=2.0): t = T(d); x = lp(rng.standard_normal(len(t)), 120) * np.exp(-t * 1.6) * np.minimum(1, t / .03); return x / np.abs(x).max()
def shimmer(d=1.5): t = T(d); x = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) for f in rng.uniform(2500, 7000, 12)) * np.exp(-t * 2.2) * np.minimum(1, t / .05); return x / 12
def servo(d): t = T(d); f = 140 + 50 * np.sin(np.pi * t / d); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * .5 + bp(rng.standard_normal(len(t)), 400, 2000) * .25) * np.sin(np.pi * t / d) ** .5
for L in LAUNCH:
    if 0 <= L < DUR: add(fo, whoosh(1.6, 200, 1500), L + 0.05, .35, .2 * np.sin(L))
for b in PULSES: add(fo, rumble(1.8), b, .8); add(fo, shimmer(1.2), b + .02, .25)
for c in [6.1, 10.2, 15.7, 23.6, 26.0, 37.9, 43.65, 48.4, 53.6]: add(fo, whoosh(1.0, 400, 3500), c - .45, .4, -.2)
add(fo, whoosh(2.0, 150, 900), 12.8, .5); add(fo, rumble(2.5), 12.9, .35)                      # the star swells
add(fo, shimmer(1.6), 15.9, .3)                                                                  # cut open
t = T(2.45); add(fo, bp(rng.standard_normal(len(t)), 200, 1400) * (0.6 + 0.4 * np.sin(2 * np.pi * .7 * t)) * np.minimum(1, t / .3) * np.minimum(1, (2.45 - t) / .3) * .5, 23.6, 1)   # Atacama wind
add(fo, servo(1.2), 23.8, .45, -.3); add(fo, servo(1.2), 23.85, .35, .3)                           # antennas slew
add(fo, shimmer(1.8), 29.5, .35); add(fo, whoosh(1.4, 300, 2000), 29.5, .3)                     # the shell appears
add(fo, shimmer(2.0), 35.75, .4)                                                                 # «último pulso»
add(fo, whoosh(3.2, 200, 1800), 39.8, .4)                                                        # lobes open
add(fo, shimmer(1.5), 44.4, .25)
for c in [52.5, 52.6]: add(fo, shimmer(.5), c, .2)
# space room: very low air
fo += (lp(rng.standard_normal(N), 300) * .012)[:, None]
def norm(x, p=.89): return x / np.abs(x).max() * p
wavfile.write('music.wav', SR, (norm(lp(mus, 9000)) * 32767).astype(np.int16)); wavfile.write('foley.wav', SR, (norm(fo) * 32767).astype(np.int16)); wavfile.write('stings.wav', SR, (norm(hb) * 32767).astype(np.int16)); print('ok')
