# Toy/acoustic score with chord stings for "Jonathan" pop-up book (replaces the old Remotion SFX)
import numpy as np
from scipy import signal
from scipy.io import wavfile
SR = 48000; DUR = 90.8; N = int(SR * DUR); rng = np.random.default_rng(7)
def note(m): return 440 * 2 ** ((m - 69) / 12)
def add(buf, x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); n = min(len(x), len(buf) - i)
    if n <= 0 or i < 0: return
    l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
    buf[i:i + n, 0] += x[:n] * g * l; buf[i:i + n, 1] += x[:n] * g * r
def ks(f, dur, decay=0.996, bright=0.5):
    n = int(dur * SR); P = max(2, int(round(SR / f)))
    exc = np.zeros(n); burst = rng.uniform(-1, 1, P); burst = signal.lfilter([bright, 1 - bright], [1], burst); exc[:P] = burst
    a = np.zeros(P + 2); a[0] = 1; a[P] = -decay / 2; a[P + 1] = -decay / 2
    y = signal.lfilter([1], a, exc); env = np.minimum(1, (dur - np.arange(n) / SR) / 0.05).clip(0, 1)
    return y * env
def bell(f, dur=2.5, g=1.0):
    t = np.arange(int(dur * SR)) / SR
    x = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t * d) for r, a, d in [(1, 1, 2.2), (2.76, .35, 4.5), (5.4, .15, 7), (8.9, .06, 10)])
    return x * np.minimum(1, t / 0.002) * g
def mbox(f, dur=1.4):
    t = np.arange(int(dur * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + .3 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 8)) * np.exp(-t * 3.5) * np.minimum(1, t / .003)
F_, C_, Dm, Bb, Am, Gm = [53, 57, 60, 65], [48, 55, 60, 64], [50, 57, 62, 65], [46, 53, 58, 62], [45, 52, 57, 60], [43, 50, 55, 58]
BPM = 96; BEAT = 60 / BPM; BAR = 4 * BEAT
# sections: (start, progression, level)
SECT = [(0.0, [F_, C_, Dm, Bb], .8), (15.55, [Bb, F_, C_, F_], .85), (24.1, [Dm, Bb, F_, C_], .8), (28.3, [Dm, Am, Bb, F_], .7),
        (38.85, [Dm, Bb, Gm, C_], .75), (49.9, [Gm, Dm, Bb, C_], .7), (55.65, [Am, Dm, Bb, C_], .7), (59.4, [F_, C_, Bb, F_], .8),
        (66.9, [F_, Am, Bb, C_], .65), (79.1, [Bb, C_, F_, F_], .8), (84.1, [Bb, C_], .8), (87.15, None, 0)]
def chord_at(t):
    for k in range(len(SECT) - 1):
        s0, pr, lv = SECT[k]; s1 = SECT[k + 1][0]
        if s0 <= t < s1: return pr[int((t - s0) // BAR) % len(pr)], lv
    return F_, .8
music = np.zeros((N, 2)); stings = np.zeros((N, 2))
# ukulele-like strums, pizz bass, music box arps
t = 0.6
while t < 87.0:
    ch, lv = chord_at(t); b = int(round((t - 0.6) / BEAT)) % 4
    for k, m in enumerate(sorted(ch)[1:] if b in (0, 2) else sorted(ch, reverse=True)[:3]):
        add(music, ks(note(m + 12), 1.6, .993, .6), t + k * 0.012, .28 * lv * (1 if b in (0, 2) else .6), -.3 + .2 * k)
    if b in (0, 2): add(music, ks(note(min(ch) - 12 if min(ch) > 40 else min(ch)), 1.0, .985, .3), t, .55 * lv, 0)
    for j, m in enumerate([sorted(ch)[i] for i in (1, 2, 3, 2)]):
        add(music, mbox(note(m + 24)), t + j * BEAT / 4 + BEAT / 8, .07 * lv, .5 * np.sin(t + j))
    t += BEAT
# final chord at the book closing
for k, m in enumerate([41, 53, 57, 60, 65, 69]):
    add(music, ks(note(m + (12 if m > 41 else 0)), 3.6, .997, .6), 87.15 + k * .02, .35, -.4 + .16 * k)
for m in [77, 81, 84]: add(music, bell(note(m), 3.0), 87.2, .25, .3)
# chord stings on picture events (pop-ups, signs, turns, action words)
SIGN_T = [5.95, 10.4, 17.2, 25.3, 29.4, 44.4, 47.2, 52.6, 60.4, 67.2, 79.6, 84.4]
POP_T = [0.85, 2.6, 3.5, 7.45, 12.9, 13.95, 16.75, 16.9, 19.7, 25.25, 32.3, 34.1, 37.7, 47.0, 59.65, 65.8, 73.1]
TURN_T = [15.55, 24.1, 28.3, 38.85, 66.9]
ACT_T = [4.65, 23.65, 27.55, 36.75, 55.65, 64.75]
def sting(t0, size):
    ch, _ = chord_at(t0); top = sorted(ch)[1:]
    for k, m in enumerate(top): add(stings, ks(note(m + 12), 1.8, .995, .7), t0 + k * .018, .30 * size, -.3 + .3 * k)
    for k, m in enumerate(top): add(stings, bell(note(m + 24), 1.8), t0 + .01 + k * .025, .10 * size, .4 - .3 * k)
    if size > 1.1: add(stings, ks(note(min(ch) - 12 if min(ch) > 40 else min(ch)), 1.2, .99, .3), t0, .5, 0)
for t0 in SIGN_T: sting(t0, 1.0)
for t0 in POP_T: sting(t0, .6)
for t0 in TURN_T: sting(t0, .9)
for t0 in ACT_T: sting(t0, 1.4)
def lp(x, fc): b, a = signal.butter(2, fc / (SR / 2)); return signal.lfilter(b, a, x, axis=0)
music = lp(music, 7000); stings = lp(stings, 9000)
fade = np.clip(np.arange(N) / SR / 0.4, 0, 1) * np.clip((90.7 - np.arange(N) / SR) / 2.5, 0, 1)
music *= fade[:, None]
def norm(x, p=.89): return x / np.abs(x).max() * p
wavfile.write('music.wav', SR, (norm(music) * 32767).astype(np.int16)); wavfile.write('stings.wav', SR, (norm(stings) * 32767).astype(np.int16)); print('ok')
