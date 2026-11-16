# «Lo que ignoramos» — kit de producción de Shorts

Canal de divulgación en español (España) de Rubén: YouTube @loqueignoramoses (UCJtNzOk9QpT6nn2UV1Vgjgw) e Instagram loqueignoramoses.
Este repo contiene todo lo necesario para que una sesión nueva produzca Shorts con el mismo estilo. **Habla siempre con Rubén en español.**

## Flujo diario (dos Shorts al día, con aprobación)

1. **08:00 — Guiones.** Elegir 2 temas nuevos y verificables (noticias científicas recientes de la última semana o curiosidades sólidas) que NO estén ya en el canal (consultar `vidiq_channel_videos` con el canal de arriba, formato short). Variar áreas (espacio, biología, historia/arqueología, física, psicología, tecnología). Evitar temas que YouTube/Instagram puedan restringir (drogas, violencia explícita, sexo, salud polémica) salvo que se traten con enfoque divulgativo y portada neutra.
2. Verificar cada dato con búsqueda web antes de escribir. Si el gancho propuesto es exagerado o falso, ajustarlo y decirlo. Nada engañoso.
3. Entregar por cada tema (con `SendUserMessage`, son para leer):
   - **Guion para ElevenLabs**: 220–260 palabras (≈ 85–100 s), números escritos con letras, frases cortas, gancho fuerte en la primera frase, cierre con una pregunta al espectador.
   - Pregunta en pantalla · 3 títulos · texto de portada (máx. 4 palabras) · descripción SEO de YouTube con hashtags · **debajo** la descripción para Instagram · fuentes (enlaces).
4. Rubén genera los audios con su voz clonada y los envía (mp3). Montar cada Short (sección «Montaje») y enviar con `SendUserFile` el MP4 + la portada PNG, más la hora prevista de publicación.
5. Cuando Rubén responda «ok» (aprobación explícita), subir y programar (sección «Publicación»). Sin «ok», no publicar nunca.

**Horas de publicación** (Europa/Madrid): entre semana **14:30** y **20:30**; sábados y domingos **11:00** y **19:00**. Si un día ya pasó la primera hora, usar la siguiente franja libre.

## Montaje (≈ 50 min por Short en render)

```bash
cd /home/claude && git clone --depth 1 https://github.com/Campos0430/claude kit && ./kit/setup.sh
./kit/new_short.sh short36 <DURACIÓN>        # DURACIÓN = duración del mp3 + ~3.5 s para el logo final
cd short36 && cp <mp3> voz.mp3 && python3 /home/claude/transcribe.py voz.mp3 wh.json
# guardar el guion exacto en guion.txt y alinear:
python3 /home/claude/align.py guion.txt wh.json words.json && cp words.json web/
```

Después escribir `web/objects.js` y `web/scenes.js` siguiendo los ejemplos de `examples/short33..35` (mono infinito, magnetismo, tumba de Siberia):
- Motor: Three.js r149 + canvas 2D encima (`ctx`). Escena 3D `world` con luces y bokeh (brainbase.js). Si no se usa el cerebro: `brain.visible = false`.
- **Cerebro 3D** (si el tema lo pide): usar el de brainbase.js tal cual, con los dos hemisferios juntos y solo una raya divisoria. No experimentar con otros modelos.
- `SC` = lista de escenas `{a, b, f(t)}` sincronizadas con `words.json`; `CUTS` = tiempos de corte. Helpers: `pop`, `chip`, `stamp`, `kicker`, `panel`, `text`, `ctaPill`, `orbitCam`, `look`, `proj`, `prog`, `eIO`, `eOut`, `back`, `C.{cyan,amber,white,night}`.
- Zonas: texto superior y ≈ 250–480; subtítulos en y ≈ 1410 (no tapar); texto inferior y ≈ 1150–1320. Última escena: pregunta + logo «LO QUE / IGNORAMOS».
- `web/overlay.js`: cambiar la regex `HOT` (palabras resaltadas) y los dos tiempos del final (fin de subtítulos = fin del habla, logo ≈ +0.15 s).
- Paleta: noche #0B1426, cian #3FD0E8, ámbar #F5A623, blanco #F4F1EA. Estilo 3D estilizado + motion graphics, nada de imágenes reales de personas.

Revisión obligatoria antes de renderizar: `node render3d.js stills t1 t2 …` y `./sheet.sh chk/a.jpg t1 t2 …` (4 por fila); mirar las hojas con Read y corregir solapes, objetos fuera de cuadro, textos ilegibles. Render: `./queue.sh` en segundo plano (timeout 7200000).

**Sonido**: `sound.py` (música procedural + SFX). Editar `DUR`, `CUTS`, `SECT` (acordes por sección), el fin `while tcur <` (= hora del logo) y el fade final, y el bloque de SFX. **Los efectos son los de Remotion** (`rsfx/n_*.wav`: whoosh en cortes, whip en sellos, ding en datos clave, switch en chips, mouse-click en contadores/tarjetas, page-turn en cronologías, shutter-old/modern en fotos/análisis). Ver `examples/short35/sound.py`.
Mezcla a −14 LUFS:
```bash
ffmpeg -v error -y -i voz.mp3 -i music.wav -i sfx.wav -filter_complex "[0]aresample=48000,apad=whole_dur=DUR,acompressor=threshold=-18dB:ratio=3:attack=5:release=120,asplit[v][sc];[1]volume=0.13[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];[2]volume=0.5[s];[v][md][s]amix=inputs=3:normalize=0[o]" -map "[o]" -t DUR mix_pre.wav
ffmpeg -v error -y -i mix_pre.wav -af "volume=5.9dB,alimiter=limit=0.72,aresample=192000,alimiter=limit=0.86,aresample=48000" mix.wav   # ajustar el volumen hasta I = -14.0
```
Montaje final: concat de `parts/q_*.mp4` + mix.wav, `libx264 -crf 20 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 256k -t DUR -movflags +faststart`. Comprobar blackdetect/freezedetect, LUFS y una hoja de 16 fotogramas.

**Portada** (siempre, sin fallos visuales, con gancho): `cover/bg.js` renderiza un fondo 3D, `cover/cover.html` compone texto tipo pegatina (2 bloques, blanco y ámbar, MontBlack) + un elemento central llamativo; `node cover/shot.js` → PNG 1080×1920. Ver ejemplos.

## Publicación (solo tras el «ok» de Rubén)

1. Subir el MP4 a la rama `videos` de este repo y usar la URL raw pública:
   `https://raw.githubusercontent.com/Campos0430/claude/videos/<archivo>.mp4` → `vidiq_video_upload` (url) → uploadId.
   La portada con `vidiq_upload_image` si hace falta (la miniatura personalizada solo funciona en canales verificados).
2. `vidiq_social_post_draft_create` con dos destinos: YOUTUBE (UCJtNzOk9QpT6nn2UV1Vgjgw, título elegido, descripción SEO como `text`, `privacyStatus: public`, `publishAt` a la hora acordada, categoría 27 Educación) e INSTAGRAM (29701781146124881, descripción de Instagram como `text`, mismo `publishAt`).
3. Enseñar el borrador a Rubén si cambia algo; con su «ok», `vidiq_social_post_publish`. Después borrar el MP4 de la rama `videos`.

Si GitHub rechaza el push, pedir a Rubén que suba el MP4 con `vidiq_file_upload` (selector de archivos) y seguir igual.
