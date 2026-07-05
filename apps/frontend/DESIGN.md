# Sistema de diseño — **Sinapsis**

Fuente de verdad de UX/UI del frontend de Ataraxia. Originalmente derivado de
`plantilla-estilo-sinapsis-tailwind.html` (referencia histórica); la identidad
vigente es la propuesta de marca del equipo (violeta #5B4CF0, Manrope, isotipo
mariposa). Los **tokens** viven en
[`tailwind.config.js`](./tailwind.config.js); las **clases de componente** en
[`src/app/styles/global.css`](./src/app/styles/global.css); las **primitivas React** en
[`src/shared/ui/index.tsx`](./src/shared/ui/index.tsx).

> Regla: al crear UI nueva, **reutiliza estas clases y primitivas**. No introduzcas colores,
> tipografías ni radios fuera de estos tokens.

## Tipografías

| Uso | Fuente | Clase |
|-----|--------|-------|
| Toda la interfaz | **Manrope** (400–800) | `font-display` = `font-body` (por defecto en `body`) |

Se carga en `index.html` vía Google Fonts. Todos los `h1–h5` usan `font-display` automáticamente.
Escala base (ajustable con utilidades): `h1` 3rem/800, `h2` 2.25rem/700, `h3` 1.5rem/700,
cuerpo 1rem con interlineado 1.7.

## Paleta (Tailwind)

| Token | Hex | Uso |
|-------|-----|-----|
| `primary` / `-light` / `-dark` | `#5B4CF0` / `#8D7FFF` / `#4033C8` | Color de acción de la marca (botones, foco, estados activos) |
| `navy` / `navy-2` | `#1D2340` / `#272E52` | Texto de marca y superficies oscuras (velos, aside del login) |
| `bg` | `#F7F5FC` | Fondo de página |
| `lavender` | `#E9E5FD` | Chips de marca, estados activos suaves |
| `ink` | `#1D2340` | Texto principal |
| `muted` | `#6B7280` | Texto secundario |
| `hairline` | `#E9E7F6` | Bordes |
| `green` / `green-bg` / `green-text` | `#A7D7B5` / `#EAF6EE` / `#1F7A50` | Éxito (pastel = relleno; `-text` para texto AA) |
| `blue` / `blue-bg` / `blue-text` | `#A9C8FF` / `#EAF1FF` / `#2E5AAC` | Info / secundario |
| `pink` / `pink-bg` / `pink-text` | `#F28B82` / `#FDECEA` / `#B4453C` | Peligro, crisis (pastel = relleno; `-text` para texto AA) |
| `warning` / `warning-bg` / `warning-text` | `#F7D27A` / `#FDF4DE` / `#8A6116` | Advertencias (reservado) |

> Regla de accesibilidad: los pasteles de feedback (`green`, `pink`, `warning`) se usan como
> relleno/insignia; para texto o iconos informativos usa siempre su par `-text`.
> Gradiente de marca: `bg-brand` (`135deg, #8D7FFF → #5B4CF0`), para el botón primario,
> burbujas del usuario y tiles activos.

## Radios, sombras y fondos

- Radios: `rounded-lg2` (28px, tarjetas), `rounded-md2` (20px, campos/sub-bloques),
  `rounded-sm2` (12px), `rounded-2xl` (16px, botones), `rounded-full` (chips/controles circulares).
- Sombras (tinte violeta de marca): `shadow-soft` (`0 10px 30px` primario al 10 %),
  `shadow-card` (`0 15px 40px` primario al 15 %).
- Fondo de página: `bg-bg bg-aurora bg-no-repeat` (degradado radial lavanda superior).
- Modo voz: `bg-orb` (esfera radial blanco→lavanda→violeta→navy) y `bg-voice-glow`
  (resplandor violeta del velo, detrás del orbe).
- Animaciones ambientales: `animate-ping-soft` (halo rosa; ícono de crisis),
  `animate-ping-green` (pulso de presencia del avatar, 3 s), `animate-typing`
  (puntos de escritura), `animate-caret` (cursor del streaming), `animate-breathe`,
  `animate-float` y `animate-orb-spin` (orbe de voz).
- Animaciones de entrada (una sola vez al montar, 250–400 ms `ease-out`):
  `animate-fade-in` (velos), `animate-rise-in` (cambio de paso del flujo),
  `animate-scale-in` (contenido del modo voz), `animate-message-in-left/right`
  (burbujas del chat según remitente), `animate-fill-x` (segmentos de la barra
  de progreso) y `animate-send-fly` (despegue del icono de enviar, disparada por envío).
- Regla: solo `transform`/`opacity`; nada de animar layout.
- Se respeta `prefers-reduced-motion` (desactiva animaciones/transiciones; el
  orbe de voz además congela sus escalas por CSS y solo la opacidad del halo
  sigue a la voz).

## Clases de componente (en `global.css`)

| Clase | Qué es |
|-------|--------|
| `.card` | Superficie blanca, borde `hairline`, `rounded-lg2`, `shadow-card`, padding responsivo (6/8). |
| `.btn--primary` / `.btn--ghost` / `.btn--light` | Botones de radio 16px con *hover-lift* y anillo `focus-visible`. Gradiente de marca / violeta suave / blanco con borde. |
| `.chip-brand` / `-outline` / `-green` / `-blue` / `-pink` | Badges pill de color. |
| `.field` | Campo de formulario (label + input/textarea + foco navy con ring + error rosa). |
| `.select-card` | Tarjeta seleccionable (modo, modalidad). Añade `.is-active` para el estado activo. |
| `.icon-tile` | Cuadro de 44px con icono centrado; combínalo con `bg-*`/`text-*` de la paleta. |
| `.form-error` | Mensaje de error inline (rosa, `role="alert"`). |
| `.typing-dot` | Punto del indicador "escribiendo…" del chat (usa `animate-typing`). |
| `.voice-overlay` | Overlay del modo voz sobre la card del chat (`absolute`, velo claro `bg` al 90 % + `bg-voice-glow` + blur). |
| `.voice-orb` + `__core/__sheen/__halo/__ring/__breath` | Orbe de voz por capas (núcleo con sombras internas, destello giratorio, halo y anillos violeta); la intensidad llega por la variable `--voice-level` (0..1) escrita vía rAF. Variantes `--connecting/--listening/--speaking/--demo/--error`. |
| `.btn-voice` / `.btn-voice--danger` / `.is-muted` | Controles circulares del modo voz sobre el velo claro (blanco con borde / rojo pastel para colgar / navy al silenciar), con etiqueta debajo. |
| `.app-loading` | Pantalla de carga centrada. |

## Primitivas React (`@/shared/ui`)

```tsx
import { Button, Input, Card, Chip, BrandLogo, BrandMark } from '@/shared/ui';

<Button variant="primary|ghost|light" loading={bool} />   // pill, hover-lift, spinner al cargar
<Input label="…" error="…" name="…" />                    // usa .field
<Card>…</Card>                                             // usa .card
<Chip variant="brand|outline|green|blue|pink">…</Chip>
<BrandLogo tone="navy|white" />                            // isotipo mariposa + wordmark
<BrandMark className="h-4 w-4" gradient />                 // solo la mariposa (gradient=false → currentColor, para fondos oscuros)
```

### Iconos

Set propio de iconos de línea (24px, trazo 2, `currentColor`), exportado desde `@/shared/ui`.
**No usar emojis en la interfaz.**

`IconChat` · `IconMic` · `IconMicOff` · `IconShield` · `IconLock` · `IconHeart` ·
`IconPhone` · `IconCheck` · `IconArrowRight` · `IconSend` · `IconUser` · `IconUsers`

Para "colgar" se usa `IconPhone` con `rotate-[135deg]` (teléfono hacia abajo).

```tsx
<IconChat className="h-5 w-5" />
<span className="icon-tile bg-green-bg text-green-text"><IconChat /></span>
```

## Patrones UX

- **Shell del flujo**: header con `BrandLogo` + chip "Espacio confidencial", indicador de
  progreso por pasos (barras con gradiente de marca) y footer con aviso de alcance del servicio.
- **Pantallas del flujo**: centradas, ancho `max-w-2xl` (o `max-w-3xl` en chat), sobre
  `bg-bg bg-aurora`. Cada paso es una `.card`.
- **Botones**: siempre pill (`rounded-full`), con micro-elevación al pasar el cursor y anillo
  de foco visible (`focus-visible:ring-4`).
- **Jerarquía**: eyebrow (`Chip`) → `h1` display → párrafo `text-muted`.
- **Chat**: avatar del asistente con `BrandMark`, burbujas navy (usuario) / blancas (asistente),
  indicador de escritura con `.typing-dot`, envío con botón circular `IconSend` y botón de
  micrófono (`IconMic`) que abre el modo voz.
- **Modo voz**: overlay `absolute` sobre la card del chat (no `fixed`; la voz es una modalidad
  de la conversación) con **velo claro** (`bg` #F7F5FC al 90 % + resplandor violeta), a diferencia
  del velo oscuro reservado para crisis. `role="dialog"` modal con el resto del chat `inert`.
  Sin cierre por clic en el fondo (colgar es deliberado); Escape cuelga. Orbe decorativo
  (`aria-hidden`) + leyenda de estado navy con `aria-live`. Con `VITE_ELEVENLABS_AGENT_ID`
  conversa vía ElevenLabs; sin él, modo demostración con micrófono local.
- **Crisis**: overlay bloqueante (`bg-navy/70` + blur, `fixed z-50` — siempre por encima del
  modo voz), acento rosa, no descartable.
- **Responsive**: móvil primero; grids colapsan a 1 columna con `sm:`/`md:`. En teléfonos:
  CTAs principales a ancho completo (`self-stretch sm:self-start`), inputs de escritura a
  16px (`text-base sm:text-[15px]`, evita el zoom automático de iOS), tarjetas con `p-5`,
  barra de progreso con etiqueta "Paso X de N" (`sm:hidden`) y chat con altura mínima reducida.
