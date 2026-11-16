import sys, json
from faster_whisper import WhisperModel
m=WhisperModel('/home/claude/whisper_small',device='cpu',compute_type='int8',cpu_threads=2)
import subprocess,numpy as np
raw=subprocess.run(['ffmpeg','-v','error','-i',sys.argv[1],'-ac','1','-ar','16000','-f','f32le','-'],capture_output=True).stdout
aud=np.frombuffer(raw,np.float32).copy()
segs,info=m.transcribe(aud,language='es',word_timestamps=True,beam_size=1,vad_filter=False)
W=[];T=[]
for s in segs:
    T.append(s.text)
    for w in s.words: W.append({'w':w.word.strip(),'s':round(w.start,3),'e':round(w.end,3)})
json.dump({'text':' '.join(T),'words':W},open(sys.argv[2],'w'),ensure_ascii=False)
print(' '.join(T))
