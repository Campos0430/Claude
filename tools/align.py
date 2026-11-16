# Usage: python3 align.py guion.txt wh.json words.json  -> aligns the script words to whisper timings
import json, re, sys, difflib, unicodedata
g = open(sys.argv[1]).read().split(); wh = json.load(open(sys.argv[2]))['words']
n = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
a = [n(w) for w in g]; b = [n(w['w']) for w in wh]
out = [None] * len(g)
for i, j, k in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
    for d in range(k): out[i + d] = (wh[j + d]['s'], wh[j + d]['e'])
i = 0
while i < len(g):
    if out[i] is None:
        j = i
        while j < len(g) and out[j] is None: j += 1
        t0 = out[i - 1][1] if i > 0 else 0; t1 = out[j][0] if j < len(g) else wh[-1]['e']
        for k in range(i, j): out[k] = (t0 + (t1 - t0) * (k - i) / (j - i), t0 + (t1 - t0) * (k - i + 1) / (j - i))
        i = j
    else: i += 1
W = [{'w': g[i], 's': round(out[i][0], 3), 'e': round(out[i][1], 3)} for i in range(len(g))]
json.dump(W, open(sys.argv[3], 'w'), ensure_ascii=False)
t = 0; line = []
for w in W:
    if w['s'] - t > 0.28 and line: print(round(line[0]['s'], 2), ' '.join(x['w'] for x in line)); line = []
    line.append(w); t = w['e']
print(round(line[0]['s'], 2), ' '.join(x['w'] for x in line), 'END', W[-1]['e'])
