# «Lo que ignoramos» — kit de producción de Shorts

Canal de divulgación en español (España) de Rubén: YouTube @loqueignoramoses (UCJtNzOk9QpT6nn2UV1Vgjgw) e Instagram loqueignoramoses.
Este repo contiene todo lo necesario para que una sesión nueva produzca Shorts con el mismo estilo. **Habla siempre con Rubén en español.**

## Flujo diario (dos Shorts al día, con aprobación)

1. **08:00 — Guiones.** Elegir 2 temas nuevos y verificables (noticias científicas recientes de la última semana o curiosidades sólidas) que NO estén ya en el canal: revisar SIEMPRE la sección «Temas ya publicados» de este README y, si hay créditos, también `vidiq_channel_videos` (canal de arriba, formato short). No repetir nunca un tema (petición de Rubén, 21-11-2026). Variar áreas (espacio, biología, historia/arqueología, física, psicología, tecnología). Evitar temas que YouTube/Instagram puedan restringir (drogas, violencia explícita, sexo, salud polémica) salvo que se traten con enfoque divulgativo y portada neutra.
2. Verificar cada dato con búsqueda web antes de escribir. Si el gancho propuesto es exagerado o falso, ajustarlo y decirlo. Nada engañoso.
3. Entregar por cada tema (con `SendUserMessage`, son para leer):
   - **Guion para ElevenLabs**: 220–260 palabras (≈ 85–100 s), números escritos con letras, frases cortas, gancho fuerte en la primera frase, cierre con una pregunta al espectador.
   - Pregunta en pantalla · 3 títulos · texto de portada (máx. 4 palabras) · descripción SEO de YouTube con hashtags · **debajo** la descripción para Instagram · fuentes (enlaces).
4. **Voz**: conector ElevenLabs → `creative_generate_speech` con `voice_id: alVwHikmUqVhndrBggwB` (voz clonada «Yo» de Rubén), `model_id: eleven_v4`, `generations_count: 1` (plan Creator, ~1 crédito por carácter; nunca repetir una generación para reintentar). Tras ~20 s, `creative_get_generations` da el `full_res_url`; descargarlo con curl. Si el dominio elevenlabsusercontent.com está bloqueado, pedir a Rubén que descargue el mp3 desde el flow y lo envíe. Montar cada Short con Lemo-Opuscar (sección «Montaje con Lemo-Opuscar») y enviar con `SendUserFile` el MP4 + la portada PNG, más la hora prevista de publicación.
5. Cuando Rubén responda «ok» (aprobación explícita), subir y programar (sección «Publicación»), sin vidIQ. Sin «ok», no publicar nunca.

**Horas de publicación** (Europa/Madrid): entre semana **14:30** y **20:30**; sábados y domingos **11:00** y **19:00**. Si un día ya pasó la primera hora, usar la siguiente franja libre.

## Montaje con Lemo-Opuscar (obligatorio desde el 23-11-2026)

Petición de Rubén: **todos los vídeos se hacen con las plantillas de vídeo de Lemo-Opuscar**, en un **estilo 3D que encaje con el tema**, **ignorando el estilo del canal** (paleta noche/cian/ámbar, cerebro, logo final, plantilla de `template/`) y con la **música de fondo que mejor le convenga** (compuesta según la paleta sonora del estilo). La sección «Montaje» de más abajo queda solo como referencia técnica (alineado de palabras, render por trozos, mezcla).

1. Clonar la biblioteca: `git clone --depth 1 https://github.com/lemomo-ai/lemo-opuscar /home/claude/ext/lemo-opuscar` (MIT). Leer `AGENTS.md`, `DIRECTOR.md`, `TECHNIQUE.md` y el `styles/<slug>/STYLE.md` elegido. El catálogo está en `styles/README.md`.
2. **Elegir un estilo 3D** (three.js) distinto según el tema y variar entre días. Probados: `colored-pencil` (lápiz de color, mundo 3D redibujado), `hologram-hud` (wireframe holográfico; espacio/tecnología), `paper-popup` (libro desplegable de papel). Otros 3D: `brick-toy`, `tilt-shift`, `lowpoly-island`, `glass-product`, `memphis-diorama`, `iso-picture-book`, `crayon-world`, `white-model`, `map-explainer`, `data-physical` (solo con datos reales exactos), `microscope`. Evitar los ✦ (necesitan generador de imágenes).
3. Escribir `TREATMENT.md` antes de abrir la demo; luego copiar el motor de `styles/<slug>/demo/` al proyecto (nunca editar la biblioteca) y adaptarlo. Código de los tres vídeos ya hechos en `lemo/` de este repo (jonathan = colored-pencil, supernovas = hologram-hud, jonathan_popup = paper-popup): reutilizar sus scripts de render (`render.mjs`/`render.js`, `queue.sh`), que funcionan sin GPU (SwiftShader, sin supersampling, ~1–4 s/fotograma con 2 núcleos).
4. Formato: 1080×1920, 30 fps. Voz: la de ElevenLabs de siempre (voz «Yo»), transcrita y alineada con `tools/transcribe.py` + `tools/align.py` para los subtítulos (en el formato que marque el `STYLE.md`, solo en español).
5. **Música**: componer una banda original con los instrumentos de la paleta sonora del estilo (`core/audio/sampler.py`, `pluck.py` o síntesis numpy; `sh tools/fetch.sh instruments <lib>` si hace falta) más los efectos del propio estilo (`core/audio/sfx.py` o síntesis propia, ver 5b). Voz ~10 dB por encima de la música, música atenuada bajo la voz, mezcla final a −14 LUFS (pico real ≤ −1 dB).
5b. **Efectos de sonido a medida del vídeo** (petición de Rubén, 23-11-2026): cada efecto tiene que estar sincronizado con algo que pasa en pantalla (sacar los tiempos del propio código: `window.EV`, giros, pop-ups, carteles, contadores…) y sonar al material del estilo (papel en `paper-popup`, lápiz en `colored-pencil`, relés/pitidos en `hologram-hud`…), según el §7 «Sound palette» del `STYLE.md`. **No reutilizar los whoosh/ding/clics de Remotion de `rsfx/` ni la lista de efectos del montaje antiguo.** Ejemplo completo: `lemo/jonathan_popup/audio2/foley.py` (foley de papel por eventos) y `score.py` (fondo de ukelele y caja de música).
6. Portada 1080×1920 en el mismo estilo, texto de ≤4 palabras. Sin créditos ni marca de LemoLab/Opus en el vídeo. Mapas: solo costas, sin fronteras (DIRECTOR.md §13).
7. Revisar con hojas de fotogramas antes y después de renderizar; reencodar a <95 MB (`-c:a copy`) si hay que subirlo a GitHub.

## Temas ya publicados (no repetir)

Actualizar esta lista cada vez que un Short se publique o programe (fecha · tema). Si vidIQ no tiene créditos, esta lista es la referencia. Es posible que falten Shorts antiguos: ante la duda, preguntar a Rubén antes de producir.

- Caer en un agujero negro
- Tardígrados
- Un día en Venus
- La medusa inmortal
- Amnesia infantil
- Krakatoa
- Árboles vs. estrellas
- El pulpo
- La señal Wow!
- El mito de las bacterias
- Los experimentos de Libet
- Teorema del mono infinito (short33)
- Altermagnetismo, el tercer tipo de magnetismo (short34)
- Cannabis en una tumba de Siberia, Tunnug 1 (short35)
- Estrella muerta / enana blanca que «late» cada 8 minutos (GPM J0715−1141)
- 21-11-2026 · El hombre de Rødhals, testigo de la llegada de la agricultura (short37)
- 21-11-2026 · Scaphokogia huachafo, la ballena con la cara más torcida (short38)
- 22-11-2026 · Supermontañas de Gondwana bajo la Antártida (short39)
- 23-11-2026 · Águilas que cazan babuinos en Ennedi, Chad (short40)
- 23-11-2026 · Jonathan, la tortuga de 194 años: su ADN y epigenoma (short41)
- 24-11-2026 · Supernovas fallidas: estrellas que mueren sin explotar, hueco de 12–16 masas solares (short42)
- 24-11-2026 · Acantilados de hielo en cráteres de Marte, Alba Mons (short43)
- 25-11-2026 · El contador del sueño: neuronas de presión de sueño en ratones (short44)
- 25-11-2026 · Yakamys, el roedor de 30 kg de Tailandia conocido por dos dientes (short45, brick-toy)
- 25-11-2026 · 21 idiomas, un mismo significado en el cerebro, MIT (short46, memphis-diorama)

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

**Sonido**: `sound.py` (música procedural + SFX). Editar `DUR`, `CUTS`, `SECT` (acordes por sección), el fin `while tcur <` (= hora del logo) y el fade final, y el bloque de SFX. **Los efectos son los de Remotion** (`rsfx/n_*.wav`: whoosh en cortes, whip en sellos, ding SOLO 1–2 veces por Short (petición de Rubén, 20-11-2026: demasiados «ding» suenan repetitivos; para datos clave usar sobre todo switch, mouse-click o shutter-modern, alternándolos), switch en chips, mouse-click en contadores/tarjetas, page-turn en cronologías, shutter-old/modern en fotos/análisis). Ver `examples/short35/sound.py`.
Mezcla a −14 LUFS:
```bash
ffmpeg -v error -y -i voz.mp3 -i music.wav -i sfx.wav -filter_complex "[0]aresample=48000,apad=whole_dur=DUR,acompressor=threshold=-18dB:ratio=3:attack=5:release=120,asplit[v][sc];[1]volume=0.13[m];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=350[md];[2]volume=0.5[s];[v][md][s]amix=inputs=3:normalize=0[o]" -map "[o]" -t DUR mix_pre.wav
ffmpeg -v error -y -i mix_pre.wav -af "volume=5.9dB,alimiter=limit=0.72,aresample=192000,alimiter=limit=0.86,aresample=48000" mix.wav   # ajustar el volumen hasta I = -14.0
```
Montaje final: concat de `parts/q_*.mp4` + mix.wav, `libx264 -crf 20 -preset veryfast -pix_fmt yuv420p -c:a aac -b:a 256k -t DUR -movflags +faststart`. Comprobar blackdetect/freezedetect, LUFS y una hoja de 16 fotogramas.

**Portada** (siempre, sin fallos visuales, con gancho): `cover/bg.js` renderiza un fondo 3D, `cover/cover.html` compone texto tipo pegatina (2 bloques, blanco y ámbar, MontBlack) + un elemento central llamativo; `node cover/shot.js` → PNG 1080×1920. Ver ejemplos.

## Publicación (solo tras el «ok» de Rubén)

> **No usar vidIQ para programar ni subir vídeos** (petición de Rubén, 23-11-2026). vidIQ solo para consultar (p. ej. `vidiq_channel_videos`). Para publicar: un conector de programación que Rubén tenga conectado (p. ej. Metricool o Zapier); si no hay ninguno, entregarle MP4, portada, título, descripciones y hora para que lo suba él desde YouTube Studio e Instagram. Los pasos de abajo con vidIQ quedan solo como referencia histórica.

1. Subir el MP4 a la rama `videos` de este repo y usar la URL raw pública:
   `https://raw.githubusercontent.com/Campos0430/claude/videos/<archivo>.mp4` → `vidiq_video_upload` (url) → uploadId.
   No hace falta subir la portada aquí: el `thumbnailImageId` del borrador NO se aplica (comprobado el 17-11-2026). La portada se pone en el paso 4.
2. `vidiq_social_post_draft_create` con dos destinos: YOUTUBE (UCJtNzOk9QpT6nn2UV1Vgjgw, título elegido, descripción SEO como `text`, `privacyStatus: public`, `publishAt` a la hora acordada, categoría 27 Educación) e INSTAGRAM (29701781146124881, descripción de Instagram como `text`, mismo `publishAt`).
3. Enseñar el borrador a Rubén si cambia algo; con su «ok», `vidiq_social_post_publish`. Comprobar con `vidiq_social_post_status` hasta que el destino YOUTUBE esté `completed` y anotar el videoId de su `postUrl`.
4. **Portada de YouTube (obligatorio):** convertir cada portada a JPG (`ffmpeg -i portada.png -q:v 2 pNN.jpg`, < 2 MB), subirla a la rama `videos` y llamar a `vidiq_update_video_thumbnail` (channelId UCJtNzOk9QpT6nn2UV1Vgjgw, videoId, `thumbnail` = URL raw del JPG; 5 créditos). Funciona aunque el vídeo esté programado y aún privado. En Instagram vidIQ no permite elegir la portada del Reel: avisar a Rubén de que la cambie desde la app si quiere.
5. Después vaciar la rama `videos` (borrar la rama falla por el proxy): repo nuevo en /tmp con solo un README, `git checkout -b videos`, commit y `git push -f origin videos`.

Subir el MP4: repo nuevo en /tmp, `git checkout -b videos`, copiar el MP4, commit y `git push -f origin videos` (probado el 16-11-2026: raw.githubusercontent.com lo sirve como application/octet-stream y vidiq_video_upload lo importa).

Si GitHub rechaza el push, pedir a Rubén que suba el MP4 con `vidiq_file_upload` (selector de archivos) y seguir igual.
