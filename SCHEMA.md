# Así suena el inglés — formato de contenido (concept JSON)

Un fichero JSON por concepto en `content/<carpeta-del-bloque>/<ID>-<slug>.json` (ej. `content/3-Consonantes/C-02-flap-t.json`).
El temario completo (qué cubre cada mapa y qué NO) está en `CURRICULUM.md`. Los bloques están en `tools/blocks.json`.

El motor (`tools/engine.js`) lo convierte en un PDF A4 apaisado:

1. **Mapa mental** (1 página): título, óvalo central, 6 cajas + «Error común», QR de audio y «Mini ejercicio» de 5 huecos.
2. **Explicación** (varias páginas): bloques bilingües 🇪🇸/🇺🇸 que el paginador reparte en 2 columnas.
3. **Ejercicios** (varias páginas): numerados automáticamente.
4. **Repaso**: checklist «Lo sé decir» + estrellas.
5. **Solucionario**: se genera solo a partir de las respuestas.

**El ejemplo de referencia es `content/3-Consonantes/C-02-flap-t.json`. Léelo entero antes de escribir** y mira sus PNG (`output/png/C-02-*.png`) si existen.

## Comandos

```bash
node tools/validate.mjs content/2-Vocales/V-01-schwa.json    # ERROR = obligatorio arreglar; warn = arreglar también
node tools/build.mjs content/2-Vocales/V-01-schwa.json --png # PDF en pdf/<bloque>/ y PNG por página en output/png/<ID>-NN.png
```
`build` imprime avisos (`MAP TOO FULL`, `MINI EXERCISE TOO LONG`, `MAP TITLE TOO LONG`, `SQUEEZED block`, `MISSING EMOJI`, `RULE ORDER`). Todos deben quedar a cero, y `validate` sin errores ni warnings.

---

## 1. La pronunciación figurada (`say` y `<code>…</code>`)

Es el corazón de la colección: cómo leería un español la palabra para que suene americana. Se escribe en el campo `say` de los bloques y, dentro de cualquier texto, entre `<code>…</code>` (sale en letra manuscrita roja, p. ej. `<code>wárer</code>`).

**Reglas (obligatorias, el validador comprueba muchas):**

| Sonido (IPA) | Se escribe | Ejemplo |
|---|---|---|
| sílaba fuerte | **tilde siempre** en palabras de 2+ sílabas, aunque en español no la llevaría | water → `wárer`, banana → `bənǽnə` |
| /iː/ larga | `ii` | beach → `biich`, sheep → `shiip` |
| /ɪ/ corta | `i` (es una i relajada, casi e) | ship → `ship`, city → `síri` |
| /i/ final débil | `i` | happy → `jǽpi` |
| /uː/ larga · /ʊ/ corta | `uu` · `u` | food → `fuud` · good → `gud` |
| /ə/ schwa | `ə` | about → `əbáut`, the → `də` |
| /æ/ | `æ` (`ǽ` si es la sílaba fuerte) | cat → `kæt`, happy → `jǽpi` |
| /ʌ/ y /ɑ/ | `a` | cup → `kap`, hot → `jat`, coffee → `káfi` |
| /ɔ/ | `o` | talk → `tok` (muchos americanos: `tak`) |
| /ɛ/ | `e` | bed → `bed` |
| /ɝ/ /ɚ/ | `er` | bird → `berd`, teacher → `tíicher` |
| /eɪ/ /aɪ/ /ɔɪ/ /aʊ/ /oʊ/ | `ei` `ai` `oi` `au` `ou` | day → `dei`, my → `mai`, boy → `boi`, now → `nau`, go → `gou` |
| /h/ | `j` (suave, como vaho) | hello → `jəlóu` |
| /k/ | `k` siempre (nunca c ni qu) | cake → `keik` |
| /g/ | `g` (`gu` delante de e/i) | get → `guet`, give → `guiv` |
| /θ/ | `z` (la z castellana de «zapato») | think → `zink` |
| /ð/ | `d` (la d suave de «nada») | the → `də`, mother → `máder` |
| /s/ · /z/ | `s`; cuando la diferencia importa, la s que zumba se subraya: `<u>s</u>` | ice → `ais`, eyes → `ai<u>s</u>` |
| /ʃ/ · /tʃ/ | `sh` · `ch` | she → `shii`, cheese → `chiis` |
| /dʒ/ · /ʒ/ | `y` (una y fuerte, «yo» enfático). Al final de palabra también `y`, explicando que es un zumbido y no la i de «rey» | job → `yab`, vision → `víyən`, age → `eiy` |
| /j/ | `i` | yes → `iés`, you → `iu` |
| /w/ | `w` | we → `wii`, water → `wárer` |
| /v/ | `v` (¡de verdad, con los dientes en el labio!) | very → `véri` |
| /ŋ/ | `ng` (n de «tengo», sin pronunciar la g). Si detrás viene vocal, guion: `ng-` (sin g); si sí suena la g (/ŋɡ/), `ngu`/`ng` | sing → `sing`, singer → `síng-er`, finger → `fínguer` |
| /r/ americana y flap /ɾ/ | `r` (una sola; **nunca `rr`**) | red → `red`, water → `wárer` |
| T glotal /ʔ/ | `'` | button → `bá'n` |
| letras mudas | no se escriben | knife → `naif` |

- Solo minúsculas, letras españolas, `á é í ó ú ü ñ ə æ ǽ` y el apóstrofo `'`. Nada de c, q, x, ni h suelta (solo en sh/ch).
- **Frases**: se escribe como suena, pegando lo que se pega: Let it go → `lérigóu`, a lot of water → `əlárə wárer`. Pon tilde en las palabras fuertes.
- Después de R, el flap suena casi d: party → `párdi`, forty → `fórdi`.
- Sé coherente: la misma palabra siempre con la misma figurada en todo el fichero (mapa, explicación, ejercicios y solucionario).

## 2. IPA (campo `ipa`)

Inglés **americano** (General American). Escríbelo **sin barras** (el motor las añade): `"ipa": "ˈwɑɾɚ"`.

- Vocales: `iː ɪ eɪ ɛ æ ɑ ɔ oʊ ʊ uː ʌ ə ɝ ɚ aɪ aʊ ɔɪ` (largas con ː solo `iː` y `uː`). Nada de `əʊ`, `ɒ`, `eə`, `ɪə` (británicos).
- Consonantes: `p b t d k ɡ f v θ ð s z ʃ ʒ tʃ dʒ h m n ŋ l r j w`, flap `ɾ`, T glotal `ʔ`, L/N silábicas con `əl`, `ən` o `n̩`.
- Acento: `ˈ` delante de la sílaba fuerte, `ˌ` secundario.
- En los textos puedes escribir IPA entre barras normales: «el sonido /θ/», «/ˈsɪɾi/» — sale automáticamente con la fuente fonética.

## 3. Las anclas españolas (el truco de la colección)

Un **ancla** es una palabra o frase española que ya sabes decir y que contiene el sonido inglés: `train` = **trein**ta, `how` = **jau**la, `toy` = es**toy**, `city` = **Siri**, `think` = **zinc**, `got it` = **garit**o.
- En `anchor` se escribe la palabra española con el trozo útil en `<b>…</b>`: `"<b>trein</b>ta"`, `"es<b>toy</b>"`. Puedes añadir un emoji.
- **Comprueba cada ancla en voz alta**: el trozo en negrita, dicho en castellano, debe sonar como la palabra inglesa (o como su parte clave), y la sílaba fuerte debe coincidir. Si un ancla solo vale a medias, dilo en `tip` («casi: alarga la i»). Mejor sin ancla que con un ancla falsa.
- Anclas válidas: palabras comunes, nombres conocidos (Siri, Kiri, Frozen), marcas, sonidos («¡shhh!» para mandar callar, el vaho en un cristal). Evita regionalismos raros.
- Usa también **anclas de aviso**: lo que NO hay que decir (water con T española → «váter» 🚽).
- **Las anclas tienen que ser tuyas.** Inventa las tuyas propias; no copies listas de canales de YouTube ni de libros.

## 4. Marcado dentro de los textos (HTML mínimo)

| Marca | Uso |
|---|---|
| `<b>…</b>` | palabra clave (azul) |
| `<em>…</em>` | énfasis fuerte (rojo) |
| `<mark>…</mark>` | idea principal (subrayador amarillo) |
| `<s>…</s>` | forma incorrecta (tachada) |
| `<i>…</i>` | aclaración secundaria (gris) |
| `<code>…</code>` | **pronunciación figurada** (manuscrita roja) |
| `<small>`, `<u>`, `<br>`, `<span>` | |

Solo esas etiquetas. Los emojis se convierten en dibujos (Twemoji): úsalos con generosidad en `icon`. Banderas: solo 🇪🇸 🇺🇸 🇬🇧.

En preguntas de ejercicios: `___` (3) = hueco normal · `____` (4) = medio · `_____` (5+) = largo. `[a|b|c]` = opciones para rodear.

## 5. Raíz del JSON

```json
{
  "id": "V-01",                    // LETRA-NN, la letra del bloque (B V C T H R P)
  "block": "V",
  "title": "LA SCHWA /ə/",         // GRANDE, en MAYÚSCULAS, ≤ 24 caracteres visibles. Conectores en minúscula con <em>: "U LARGA <em>y</em> U CORTA"
  "file_title": "La schwa",        // nombre legible sin HTML
  "subtitle": "The lazy vowel · la e perezosa",   // en inglés + · aclaración corta
  "icon": "😴",
  "map": { … },
  "explain": [ … ],                // 14-20 bloques
  "exercises": [ … ],              // 13-16 ejercicios, ≥ 8 tipos, ≥ 100 ítems
  "checklist": [ { "es": "Sé decir…", "en": "I can say…" } ]   // 5-7 frases
}
```

## 6. `map` (la página estrella — tiene que quedar holgada, letra ≥ 13 px)

```json
"map": {
  "center": "La <b>schwa</b> es la vocal más frecuente del inglés: una <b>e</b> relajada y cortita, <code>ə</code>.",  // ≤ 120 caracteres
  "listen": "banana",              // palabra o frase para el QR «Escúchalo» (YouGlish)
  "nodes": [ 6 nodos: 1 arriba-izq, 2 arriba-der, 3 medio-izq, 4 medio-der, 5 abajo-izq, 6 abajo-der ],
  "error": { "title": "Error común", "bad": ["<code>banána</code> (tres a)"], "good": ["<code>bənǽnə</code>"], "note": "…" },
  "mini": { "es": "Escribe cómo suena:", "en": "Write how it sounds.", "items": [ exactamente 5 × { "q": "🍌 banana → ____", "a": "bənǽnə" } ] }
}
```
Nodo: `{ "title": "¿Cómo se pone la boca?", "icon": "👄", "color": "green", "items": ["…"], "rows": [["water", "<code>wárer</code>"]], "chips": ["a","the"], "html": "texto", "after": "texto final", "art": "🍌" }`
- `items` (2-4 viñetas cortas) y/o `rows` (palabra → `<code>figurada</code>`) y/o `chips`. Máx. ~170 caracteres por nodo.
- `art` = emoji grande decorativo (opcional, 1-2 nodos).
- Colores por defecto: green, blue, purple, orange, pink, yellow.
- Nodos típicos: ¿Qué es? / Así se pone la boca / Suena como… (rows) / Dónde aparece / ¡Ojo! / Ancla española / Truco rápido.
- Mini ejercicio: frases ≤ 45 caracteres.

## 7. `explain` — bloques

Todos aceptan `"wide": true` (ocupa las 2 columnas) y `"color"` (green, blue, purple, orange, red, teal, pink, yellow).

| t | Campos | Para qué |
|---|---|---|
| `intro` | `es`, `en`, `formula?`, `title?`, `title_en?`, `icon?` | primer bloque: ¿Qué es? (es ≤ 550 caracteres) |
| `mouth` | `title?`, `items` [{`part`, `es`, `en`}] — part: `lips` `tongue` `teeth` `jaw` `air` `voice` `nose` `ear` | 👄 Así se pone la boca (3-5 partes) |
| `rule` | `num`, `title` ("1 · …"), `title_en`, `icon`, `es`, `en`, `formula?`, `examples?` [{en, say, es, icon}] | cada regla numerada; 3 ó 6 ejemplos (salen en fichas de 3) |
| `anchors` | `title?`, `items` [{`en`, `ipa`, `say`, `es`, `icon`, `anchor`, `tip`}] | ⚓ **imprescindible**: 10-16 palabras con su ancla española. Ancho completo |
| `listen` | `items` [{`q`, `es`}] (4-6) | 🎧 QR a YouGlish (vídeos reales). Ponlo **justo después de `anchors`** |
| `pairs` | `title?`, `items` [{`a`: {en, ipa, say, es, icon}, `b`: {…}, `tip`}] | 👂 parejas mínimas (ship vs sheep) |
| `spoken` | `title?`, `items` [{`written`, `spoken`, `say`, `es`, `yg?`}] | ✍️→🗣️ cómo se escribe vs cómo se dice («Nodda-dall») |
| `stress` | `title?`, `es?`, `en?`, `items` [{`syl`: ["pho","to"], `s`: 0, `say?`, `es?`, `icon?`}], `cols?` | 🥁 sílaba fuerte con ● y • |
| `table` | `title`, `title_en`, `icon`, `head` [..], `rows` [[..]], `note?`, `note_en?` | resúmenes, «cuándo sí / cuándo no» (wide si ≥ 4 columnas) |
| `examples` | `title?`, `title_en?`, `items` [{en, say, es, icon}] | 10-14 frases para leer en voz alta, con su figurada |
| `errors` | `title?`, `title_en?`, `items` [{bad, good, why, why_en}] | 🚫 «¡Así no se dice!»: 5-8 errores típicos de hispanohablantes |
| `vocab` | `title`, `title_en`, `icon`, `items` [{en, es, icon}], `cols?` | lista de palabras con el sonido |
| `dialogue` | `title`, `title_en`, `lines` [{who, en, say, es}] | mini diálogo (6-8 líneas) con figurada |
| `steps` | `title`, `title_en`, `items` [{es, en}] | cómo entrenarlo, paso a paso |
| `compare` | `title`, `title_en`, `es?`, `en?`, `cols` [{head, color, items:[..]}] | X frente a Y (2-3 columnas) |
| `twister` | `items` [{en, say, es}] (2-4) | 🌀 trabalenguas (propios o tradicionales de dominio público) |
| `tip` | `title?`, `title_en?`, `es`, `en` | truco final para recordar |

`formula`: lista de líneas; trozos separados por ` + `; un trozo entre `*asteriscos*` sale destacado: `["wa + *T* + er → wá*r*er"]`.

**Orden recomendado** (el paginador rellena huecos solo): intro → mouth → reglas numeradas (1·, 2·, 3·…) → anchors → listen → table → stress / pairs / compare → spoken → examples → errors → dialogue → steps → twister → tip.

## 8. `exercises` — tipos

Campos comunes: `t`, `title` (ES), `title_en`, `icon`, `es` (instrucción), `en`, `bank?`, `wide?`, `color?`.

| t | Ítems | Solucionario |
|---|---|---|
| `fill` | [{q con `___`, a, hint?}] — ideal: «🍌 banana → ____» y `a` = figurada | `a` |
| `choose` | [{q con `[x\|y]`, a}] — `a` debe ser EXACTAMENTE una opción. Muy útil: «¿Qué sonido? sheep → [/iː/\|/ɪ/]», «¿Igual o diferente?», «¿Cuál suena distinto? [cat\|hat\|cut]» | `a` |
| `rewrite` | [{q, a}] — p. ej. escribir la frase como suena | `a` |
| `error` | [{q (figurada con un fallo, en `<code>`), a (corregida)}] | `a` |
| `translate` | [{q (español), a (inglés + figurada entre paréntesis)}] | `a` |
| `order` | [{q: "go / Let / it", a: "Let it go"}] — las palabras de `a` = fichas | `a` |
| `spell` | [{q: "🐑 oveja", a: "sheep"}] — solo letras | `a` |
| `truefalse` | [{q, a: true/false, why?}] | ✓/✗ + why |
| `reading` | `text_title`, `text` ["párrafo"…], `items` [{q, a} o {q, tf: true, a: true/false, why?}] | `a` |
| `write` | [{q (consigna), lines: 2, a?: "Ej.: …"}] (≥ 2 ítems) | modelo o «Respuesta libre» |
| `readaloud` | [{q (palabra/frase en inglés), say (figurada)}] — 3 casillas para marcar cada lectura | `say` |
| `stressmark` | [{syl: ["ba","na","na"], s: 1, es?}] — rodear la sílaba fuerte | sílaba en MAYÚSCULAS |
| `match` | `pairs` [[izq, der], …] 4-8 pares (palabra ↔ figurada, palabra ↔ IPA, escrito ↔ hablado) | automático |
| `classify` | `cats` [{name, words:[…]}] 2-4 categorías (por sonido) | automático |
| `tablefill` | `head`, `rows` con celdas `"?respuesta"` | tabla rellena |
| `wordsearch` | `words` (6-10, ≤ 11 letras), `clues?` ["sheep · oveja", …] | sopa resuelta |

Recomendado: 13-16 ejercicios, 6-10 ítems cada uno, de fácil a difícil: reconocer (choose, classify, match) → completar (fill, tablefill, stressmark) → transformar (rewrite, error) → producir (translate, readaloud, reading, write). **Siempre** al menos un `readaloud`.

## 9. Estilo del contenido

- **Público**: cualquier hispanohablante, desde un niño de 8-10 años (Mario) hasta adultos. Español de España, cercano y claro (tú), con humor. Frases de ejemplo cotidianas: familia, cole, trabajo, viajes, comida, series, deporte, mascotas. Personajes: Mario, su hermana Lucía, amigos americanos (Jenny, Mike, Ashley, Tyler), Rocky el perro.
- Explicación principal en **español** (`es`) + versión **inglesa** breve (`en`). Todo ejemplo inglés lleva traducción y, casi siempre, su figurada.
- Inglés **americano**: ortografía (color, favorite, mom, center) y pronunciación de EE. UU. Si mencionas el británico, como contraste.
- Ataca los **errores típicos de hispanohablantes** (leer como se escribe, «Espain», b/v iguales, jota fuerte, vocales enteras, acento en la sílaba equivocada, consonantes finales perdidas…).
- Palabrotas: solo cuando sirvan de aviso, **siempre censuradas** con asterisco (b\*tch, sh\*t) y sin explicar su significado más allá de «palabrota». Nunca las pongas en `anchors`, `pairs`, `spoken`, `twister`, `listen` ni `readaloud`: esos bloques convierten la palabra en un enlace de YouGlish.
- **Comprueba dos veces cada IPA, cada figurada y cada respuesta.** Un error de pronunciación en un libro de pronunciación es grave. Ante la duda, elige la pronunciación más común de EE. UU. y, si hay variantes, menciónalas («muchos americanos dicen también…»).
