import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
DUR = 88.5
N = int(SR * DUR)
rng = np.random.default_rng(3)
t_all = np.arange(N) / SR

def st(x):  # mono -> stereo
    return np.stack([x, x], 1)

def lp(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), 'low'); return signal.lfilter(b, a, x, axis=0)
def hp(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), 'high'); return signal.lfilter(b, a, x, axis=0)
def bp(x, lo, hi, order=2):
    b, a = signal.butter(order, [lo / (SR / 2), hi / (SR / 2)], 'band'); return signal.lfilter(b, a, x, axis=0)

def reverb_ir(sec=2.8, decay=3.2):
    n = int(sec * SR); tt = np.arange(n) / SR
    ir = np.zeros((n, 2))
    for c in range(2):
        ir[:, c] = rng.standard_normal(n) * np.exp(-decay * tt)
    ir[:, :] = lp(ir, 6000)
    ir /= np.sqrt((ir ** 2).sum(0))
    return ir
IR = reverb_ir()
def reverb(x, wet=0.35):
    y = np.stack([signal.fftconvolve(x[:, c], IR[:, c])[:len(x)] for c in range(2)], 1)
    return x * (1 - wet) + y * wet

def add(buf, x, t0, gain=1.0):
    i = int(t0 * SR)
    if i < 0: x = x[-i:]; i = 0
    n = min(len(x), len(buf) - i)
    if n > 0: buf[i:i + n] += x[:n] * gain

def pan(x, p):  # p -1..1
    l = np.cos((p + 1) * np.pi / 4); r = np.sin((p + 1) * np.pi / 4)
    return np.stack([x * l, x * r], 1)

def note(n):  # midi -> hz
    return 440 * 2 ** ((n - 69) / 12)




# ---------------- MUSIC BED (calm nocturnal ambient, D minor -> F major) ----------------
F32 = np.float32
CUTS = [9.0, 22.9, 37.6, 46.9, 63.9, 77.1, 82.6]
CHAP = []
D2,E2,F2,G2,A2,Bb2,C3,D3,E3,F3,G3,A3,Bb3,C4,D4,E4,F4,G4,A4 = 38,40,41,43,45,46,48,50,52,53,55,57,58,60,62,64,65,67,69
Dm9=[D3,A3,C4,E4,F4]; Bbmaj7=[Bb2,F3,A3,D4]; Fadd9=[F2,C4,G4,A4-12]; Cadd9=[C3,G3,D4,E4]; Gm9=[G2,D3,F3,Bb3,A4-12]
Am7=[A2,E3,G3,C4]; Ebmaj7=[51-12,58-12+12,62,55]; Dsus=[D3,G3,A3,E4]; Fmaj7=[F2,C4,E4,A3]
# (start, progression, chord length, brightness, arp level, mood)
SECT=[(0,[Dm9,Bbmaj7,Fadd9,Cadd9],2.25,1600,0.55),
      (9.0,[Fmaj7,Cadd9,Dm9,Bbmaj7],2.3,1700,0.6),
      (22.9,[Dm9,Bbmaj7,Gm9,Am7],2.45,1500,0.6),
      (37.6,[Gm9,Dm9,Ebmaj7,Am7],2.3,1200,0.45),
      (46.9,[Bbmaj7,Fadd9,Gm9,Dm9],2.1,1600,0.55),
      (63.9,[Fmaj7,Cadd9,Dm9,Bbmaj7],2.2,1700,0.6),
      (77.1,[Bbmaj7,Fadd9,Cadd9],1.85,1500,0.45),
      (85.1,[Fmaj7],3.4,1200,0.15),(88.5,None,0,0,0)]
chords=[]; bright=[]; arpl=[]
for k in range(len(SECT)-1):
    s0,prog,cl,br,al=SECT[k]; s1=SECT[k+1][0]; t=s0; i=0
    while t < s1-0.5:
        chords.append((t,prog[i%len(prog)],br)); t+=cl; i+=1
    bright.append((s0,br)); arpl.append((s0,al)); arpl.append((s1-0.01,al))
chords.append((676.0,[],0))
pad = np.zeros((N, 2), F32)
for k in range(len(chords) - 1):
    s0, notes, br = chords[k]; s1 = chords[k + 1][0]
    a0, a1 = max(0, s0 - 1.2), min(DUR, s1 + 2.0)
    n0, n1 = int(a0 * SR), int(a1 * SR); tt = np.arange(n1 - n0) / SR
    env = np.clip(np.minimum(1, tt / 2.0) * np.minimum(1, (a1 - a0 - tt) / 2.4), 0, 1) ** 1.5
    seg = np.zeros((n1 - n0, 2))
    for j, m in enumerate(notes):
        f = note(m)
        for det, pp in [(-0.07, -0.7), (0.0, 0.0), (0.07, 0.7)]:
            ff = f * 2 ** (det / 12); ph = rng.random() * 2 * np.pi
            w = signal.sawtooth(2 * np.pi * ff * (tt + a0) + ph) * 0.25 + np.sin(2 * np.pi * ff * (tt + a0) + ph) * 0.8
            seg += pan(w, pp * (0.3 + 0.1 * j)) / len(notes)
    seg = lp(seg, br, 2)
    pad[n0:n1] += (seg * env[:, None]).astype(F32)
pad *= (0.82 + 0.18 * np.sin(2 * np.pi * 0.05 * t_all))[:, None].astype(F32)
sub = np.zeros(N, F32)
for k in range(len(chords) - 1):
    s0, notes, br = chords[k]; s1 = chords[k + 1][0]
    root = min(notes); root = root - 12 if root >= 43 else root
    n0, n1 = int(s0 * SR), int(min(DUR, s1 + 0.6) * SR); tt = np.arange(n1 - n0) / SR
    e = np.minimum(1, tt / 1.2) * np.clip((s1 + 0.6 - s0 - tt) / 1.0, 0, 1); sub[n0:n1] += (np.sin(2 * np.pi * note(root) * tt) * e).astype(F32)
# soft music-box arpeggio, 8ths at 72 bpm
arp = np.zeros((N, 2), F32); step = 60 / 92 / 2; pl_len = int(1.4 * SR); ptt = np.arange(pl_len) / SR
tcur, idx = 2.0, 0
while tcur < 85.2:
    notes = [c for c in chords if c[0] <= tcur][-1][1]
    pattern = sorted(set([n for n in notes if n >= 50])) or [D4]
    m = pattern[[0, 2, 1, 3, 2, 1][idx % 6] % len(pattern)] + 12
    f = note(m)
    w = (np.sin(2 * np.pi * f * ptt) + 0.25 * np.sin(2 * np.pi * 2 * f * ptt) * np.exp(-ptt * 6)) * np.exp(-ptt * 4.5) * np.minimum(1, ptt / 0.004)
    add(arp, pan(w, 0.6 * np.sin(idx * 0.7)).astype(F32), tcur, 0.5 + 0.5 * (idx % 3 == 0)); tcur += step; idx += 1
arp = lp(arp, 3500).astype(F32); dl = int(step * 3 * SR); arpd = arp.copy()
for k in range(1, 4):
    sh = np.zeros_like(arp); sh[dl * k:] = arp[:-dl * k] * (0.38 ** k)
    if k % 2: sh = sh[:, ::-1]
    arpd += sh
del arp
ax=[a for a,_ in arpl]; ay=[b for _,b in arpl]
arp_env = np.interp(t_all, ax, ay).astype(F32)
arp_env = lp(arp_env, 0.4, 1).astype(F32)
music = pad * 0.55 + st(sub) * 0.28 + arpd * arp_env[:, None] * 0.25
del pad, arpd
drone = lp(rng.standard_normal((N, 2)).astype(F32), 160, 2).astype(F32) * 2.2; drone *= (0.7 + 0.3 * np.sin(2 * np.pi * 0.03 * t_all))[:, None].astype(F32)
music += drone * 0.16; del drone
def reverb32(x, wet):
    y = np.stack([signal.oaconvolve(x[:, c], IR[:, c].astype(F32))[:len(x)] for c in range(2)], 1).astype(F32)
    return x * (1 - wet) + y * wet
music = reverb32(music, 0.42)
# duck the bed at chapter cards a touch less; fade in/out + silence under alarm/microsleeps handled by sfx
fade = np.clip(t_all / 0.3, 0, 1) * np.clip((88.4 - t_all) / 2.0, 0, 1)
music *= fade[:, None].astype(F32)
print('music done', flush=True)

sfx = np.zeros((N, 2))


def whoosh(dur=0.9, lo=300, hi=5000, rev=False):
    n = int(dur * SR); tt = np.arange(n) / SR; x = rng.standard_normal(n)
    out = np.zeros(n); blocks = 40
    for b in range(blocks):
        a, z = b * n // blocks, (b + 1) * n // blocks
        f = lo * (hi / lo) ** (b / blocks)
        seg = bp(x[max(0, a - 2000):z], max(60, f * 0.6), min(20000, f * 1.6))[-(z - a):]
        out[a:z] = seg
    env = np.sin(np.pi * np.clip(tt / dur, 0, 1)) ** 2
    env = env * (tt / dur) ** 0.6
    out = out * env
    if rev: out = out[::-1]
    pp = np.linspace(-0.8, 0.8, n)
    return np.stack([out * np.cos((pp + 1) * np.pi / 4), out * np.sin((pp + 1) * np.pi / 4)], 1) / (np.abs(out).max() + 1e-9)
def impact(big=1.0):
    n = int(2.2 * SR); tt = np.arange(n) / SR
    f = 38 + 70 * np.exp(-tt * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 2.6)
    crack = lp(rng.standard_normal(n), 3000) * np.exp(-tt * 28) * 0.7
    shimmer = hp(rng.standard_normal(n), 6000) * np.exp(-tt * 6) * 0.15
    x = (boom * 1.0 + crack + shimmer) * big
    return st(x / np.abs(x).max())
def tick(f=3200, d=0.025):
    n = int(d * SR); tt = np.arange(n) / SR
    x = np.sin(2 * np.pi * f * tt) * np.exp(-tt * 260) + hp(rng.standard_normal(n), 4000) * np.exp(-tt * 400) * 0.3
    return st(x)
def blip(f=880):
    n = int(0.35 * SR); tt = np.arange(n) / SR
    x = (np.sin(2 * np.pi * f * tt) + 0.5 * np.sin(2 * np.pi * f * 1.5 * tt)) * np.exp(-tt * 14) * np.minimum(1, tt / 0.003)
    return st(x)
def bell(f=880):
    n = int(3.0 * SR); tt = np.arange(n) / SR
    parts = [(1, 1, 1.2), (2.76, 0.5, 2.5), (5.4, 0.25, 4), (8.93, 0.12, 6), (2.0, 0.35, 1.8)]
    x = sum(a * np.sin(2 * np.pi * f * r * tt) * np.exp(-tt * d) for r, a, d in parts) * np.minimum(1, tt / 0.002)
    return st(x / 2)
def riser(dur):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = 200 * (8 ** (tt / dur))
    tone = signal.sawtooth(2 * np.pi * np.cumsum(f) / SR) * 0.3
    noise = rng.standard_normal(n)
    nz = np.zeros(n); blocks = 30
    for b in range(blocks):
        a, z = b * n // blocks, (b + 1) * n // blocks; fc = 400 * (20 ** (b / blocks))
        nz[a:z] = bp(noise[max(0, a - 2000):z], fc * 0.7, min(20000, fc * 1.4))[-(z - a):]
    x = (lp(tone, 3000) + nz) * (tt / dur) ** 2.2
    return st(x / np.abs(x).max())
def wind(dur, strength=1.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    x = rng.standard_normal((n, 2))
    mod = 0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * tt + np.array([[0, 1.3]]).T).T
    y = np.zeros_like(x)
    for c in range(2): y[:, c] = bp(x[:, c], 250, 1400) * mod[:, c] + lp(x[:, c], 160) * 1.5
    env = np.minimum(1, tt / 0.6) * np.minimum(1, (dur - tt) / 0.6)
    y *= env[:, None] * strength
    return y / np.abs(y).max()

def shimmer(dur):
    n = int(dur * SR); tt = np.arange(n) / SR; x = np.zeros((n, 2))
    for k in range(int(dur * 45)):
        f = 2000 + rng.random() * 5000; t0 = rng.random() * dur; m = int(0.25 * SR); a = int(t0 * SR)
        g = np.sin(2 * np.pi * f * np.arange(m) / SR) * np.exp(-np.arange(m) / SR * 18)
        e = min(m, n - a); x[a:a + e] += pan(g[:e], rng.random() * 2 - 1) * (0.3 + 0.7 * t0 / dur)
    x += hp(rng.standard_normal((n, 2)), 5000) * 0.08 * (tt / dur)[:, None]
    env = np.minimum(1, tt / 0.3) * np.minimum(1, (dur - tt) / 0.4)
    return x * env[:, None] / (np.abs(x).max() + 1e-9)
def tone(f, d):
    n = int(d * SR); tt = np.arange(n) / SR; return st(np.sin(2 * np.pi * f * tt) * np.minimum(1, tt / 0.005) * np.minimum(1, (d - tt) / 0.01))

L = lambda d: np.arange(int(d * SR)) / SR
def envf(n, a=0.8): tt = np.arange(n) / SR; d = n / SR; return np.minimum(1, np.minimum(tt / a, (d - tt) / a))

L = lambda d: np.arange(int(d * SR)) / SR
def envf(n, a=0.8): tt = np.arange(n) / SR; d = n / SR; return np.minimum(1, np.minimum(tt / a, (d - tt) / a))






# ---------------- SFX ----------------
sfx = np.zeros((N, 2), F32)
for c in CUTS: add(sfx, whoosh(1.0, 180, 2600), c - 0.7, 0.16)
for c in CHAP: add(sfx, bell(660), c, 0.06); add(sfx, bell(990), c + 0.02, 0.03)
amb = lp(rng.standard_normal((N, 2)).astype(F32), 180).astype(F32); amb *= (0.7 + 0.3 * np.sin(2 * np.pi * 0.04 * t_all))[:, None].astype(F32); add(sfx, amb / np.abs(amb).max(), 0, 0.035); del amb
for tt in [7.8, 45.3, 62.9]: add(sfx, impact(), tt, 0.15)
def keys(t0, t1, rate, g=0.05):
    tt = t0; k = 0
    while tt < t1: add(sfx, tick(2200 + 900 * ((k * 7919) % 13) / 13, 0.03), tt + 0.03 * (((k * 31) % 7) / 7), g); tt += 1 / rate; k += 1
keys(0.3, 7.6, 6.5); keys(29.6, 33.8, 9, 0.035); keys(37.8, 46.6, 3.5, 0.04); keys(57.4, 58.1, 10, 0.06); keys(64.2, 74.5, 7.5, 0.04)
add(sfx, shimmer(1.8), 2.6, 0.1); add(sfx, bell(880), 4.9, 0.1)
add(sfx, shimmer(2.0), 10.6, 0.12); add(sfx, bell(780), 13.54, 0.08); add(sfx, bell(660), 18.04, 0.08); add(sfx, bell(780), 20.6, 0.08); add(sfx, bell(990), 21.6, 0.12)
add(sfx, bell(880), 24.0, 0.1); add(sfx, whoosh(0.9, 300, 3000), 27.3, 0.1); add(sfx, riser(1.6), 34.0, 0.05); add(sfx, shimmer(2.0), 35.6, 0.12)
add(sfx, riser(2.6), 41.7, 0.06)
add(sfx, bell(880), 47.36, 0.1); add(sfx, bell(990), 54.6, 0.1)
for k in range(10): add(sfx, blip(500 + k * 30), 58.9 + k * 0.2, 0.03)
add(sfx, tone(140, 0.35), 62.72, 0.12)
add(sfx, bell(780), 66.0, 0.08); add(sfx, bell(880), 71.42, 0.1)
add(sfx, whoosh(0.5, 400, 2500), 74.7, 0.1); add(sfx, whoosh(0.3, 3000, 300), 76.25, 0.14); add(sfx, impact(1.4), 76.5, 0.3)
for k in range(9): add(sfx, tick(1500 + k * 260, 0.04), 76.56 + k * 0.045, 0.1)
add(sfx, bell(990), 77.9, 0.1); add(sfx, shimmer(2.2), 79.6, 0.12)
add(sfx, riser(2.0), 83.1, 0.07)
add(sfx, impact(), 85.1, 0.18); add(sfx, bell(880), 85.1, 0.22); add(sfx, bell(1320), 85.12, 0.1)
add(sfx, whoosh(1.0, 150, 3000), -0.2, 0.12)
sfx = reverb32(sfx, 0.2)
def norm(x, peak=0.89): return x / np.abs(x).max() * peak
wavfile.write('music.wav', SR, (norm(music) * 32767).astype(np.int16))
wavfile.write('sfx.wav', SR, (norm(sfx) * 32767).astype(np.int16))
print('ok')
