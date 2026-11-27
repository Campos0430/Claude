# words.json -> subs.json: clauses split at punctuation, long clauses split into balanced lines (<= MAXC chars)
import json, sys, math
W = json.load(open(sys.argv[1])); MAXC = int(sys.argv[3]) if len(sys.argv) > 3 else 30
REP = json.loads(sys.argv[4]) if len(sys.argv) > 4 else {}
# merge multiword replacements ("ciento cincuenta" -> "150")
i = 0; M = []
while i < len(W):
    hit = False
    for k, v in REP.items():
        ks = k.split(); n = len(ks)
        if [w['w'].strip('.,:?!;¿').lower() for w in W[i:i+n]] == [x.lower() for x in ks]:
            last = W[i+n-1]['w']; tail = ''.join(ch for ch in last if ch in '.,:?!;'); head = '¿' if W[i]['w'].startswith('¿') else ''
            M.append({'w': head + v + tail, 's': W[i]['s'], 'e': W[i+n-1]['e']}); i += n; hit = True; break
    if not hit: M.append(W[i]); i += 1
cl = []; cur = []
for w in M:
    if cur and w['s'] - cur[-1]['e'] > .45: cl.append(cur); cur = []
    cur.append(w)
    if w['w'][-1] in '.,:?!;': cl.append(cur); cur = []
if cur: cl.append(cur)
# glue very short clauses (<12 chars) to the next one when the pause is short
G = []
for c in cl:
    if G and len(' '.join(x['w'] for x in G[-1])) < 12 and c[0]['s'] - G[-1][-1]['e'] < .5 and len(' '.join(x['w'] for x in G[-1] + c)) <= MAXC: G[-1] = G[-1] + c
    else: G.append(c)
out = []
for c in G:
    txt = ' '.join(x['w'] for x in c); n = math.ceil(len(txt) / MAXC); per = len(txt) / n
    start = 0; acc = 0; parts = []; buf = []
    for w in c:
        buf.append(w); acc += len(w['w']) + 1
        if len(parts) < n - 1 and acc >= per * (len(parts) + 1): parts.append(buf); buf = []
    if buf: parts.append(buf)
    for p in parts: out.append({'t0': p[0]['s'], 't1': p[-1]['e'], 'text': ' '.join(x['w'] for x in p)})
json.dump(out, open(sys.argv[2], 'w'), ensure_ascii=False)
for c in out: print(f"{c['t0']:6.2f} {c['t1']:6.2f} {c['text']}")
