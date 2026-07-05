# Sistema de diseño — **Sinapsis**

Fuente de verdad de UX/UI del frontend de Ataraxia. Derivado de
`plantilla-estilo-sinapsis-tailwind.html`. Los **tokens** viven en
[`tailwind.config.js`](./tailwind.config.js); las **clases de componente** en
[`src/app/styles/global.css`](./src/app/styles/global.css); las **primitivas React** en
[`src/shared/ui/index.tsx`](./src/shared/ui/index.tsx).

> Regla: al crear UI nueva, **reutiliza estas clases y primitivas**. No introduzcas colores,
> tipografías ni radios fuera de estos tokens.

## Tipografías

| Uso | Fuente | Clase |
|-----|--------|-------|
| Títulos / display | **Poppins** (600–800) | `font-display` |
| Cuerpo | **Inter** (400–600) | `font-body` (por defecto en `body`) |

Se cargan en `index.html` vía Google Fonts. Todos los `h1–h5` usan `font-display` automáticamente.

## Paleta (Tailwind)

| Token | Hex | Uso |
|-------|-----|-----|
| `navy` / `navy-2` | `#10123B` / `#171A4A` | Color primario, botones, texto de marca |
| `bg` | `#F3F2FB` | Fondo de página |
| `lavender` | `#E7E5FA` | Chips de marca, estados activos suaves |
| `ink` | `#14162C` | Texto principal |
| `muted` | `#62637A` | Texto secundario |
| `hairline` | `#E7E6F3` | Bordes |
| `green` / `green-bg` / `green-text` | `#33D686` / `#E4FBEF` / `#1B8A54` | Éxito / positivo |
| `blue` / `blue-bg` / `blue-text` | `#A9C8FF` / `#EAF1FF` / `#2E5AAC` | Info / secundario |
| `pink` / `pink-bg` | `#FF5C7A` / `#FFE9ED` | Alertas, crisis, errores |

## Radios, sombras y fondos

- Radios: `rounded-lg2` (24px, tarjetas), `rounded-md2` (16px, campos/sub-bloques), `rounded-full` (pills).
- Sombras: `shadow-soft` (sutil), `shadow-card` (elevación de tarjeta).
- Fondo de página: `bg-bg bg-aurora bg-no-repeat` (degradado radial lavanda superior).
- Animaciones: `animate-ping-soft` (halo pulsante rosa; ícono de crisis) y
  `animate-typing` (puntos del indicador de escritura; ver `.typing-dot`).
- Se respeta `prefers-reduced-motion` (desactiva animaciones/transiciones).

## Clases de componente (en `global.css`)

| Clase | Qué es |
|-------|--------|
| `.card` | Superficie blanca, borde `hairline`, `rounded-lg2`, `shadow-card`, padding responsivo (6/8). |
| `.btn--primary` / `.btn--ghost` / `.btn--light` | Botones pill con *hover-lift* y anillo `focus-visible`. Navy / azul suave / blanco con borde. |
| `.chip-brand` / `-outline` / `-green` / `-blue` / `-pink` | Badges pill de color. |
| `.field` | Campo de formulario (label + input/textarea + foco navy con ring + error rosa). |
| `.select-card` | Tarjeta seleccionable (modo, modalidad). Añade `.is-active` para el estado activo. |
| `.icon-tile` | Cuadro de 44px con icono centrado; combínalo con `bg-*`/`text-*` de la paleta. |
| `.form-error` | Mensaje de error inline (rosa, `role="alert"`). |
| `.typing-dot` | Punto del indicador "escribiendo…" del chat (usa `animate-typing`). |
| `.app-loading` | Pantalla de carga centrada. |

## Primitivas React (`@/shared/ui`)

```tsx
import { Button, Input, Card, Chip, BrandLogo, BrandMark } from '@/shared/ui';

<Button variant="primary|ghost|light" loading={bool} />   // pill, hover-lift, spinner al cargar
<Input label="…" error="…" name="…" />                    // usa .field
<Card>…</Card>                                             // usa .card
<Chip variant="brand|outline|green|blue|pink">…</Chip>
<BrandLogo tone="navy|white" />                            // logotipo completo
<BrandMark className="h-4 w-4" />                          // solo el símbolo (avatares)
```

### Iconos

Set propio de iconos de línea (24px, trazo 2, `currentColor`), exportado desde `@/shared/ui`.
**No usar emojis en la interfaz.**

`IconChat` · `IconMic` · `IconShield` · `IconLock` · `IconHeart` · `IconPhone` ·
`IconCheck` · `IconArrowRight` · `IconSend` · `IconUser` · `IconUsers`

```tsx
<IconChat className="h-5 w-5" />
<span className="icon-tile bg-green-bg text-green-text"><IconChat /></span>
```

## Patrones UX

- **Shell del flujo**: header con `BrandLogo` + chip "Espacio confidencial", indicador de
  progreso por pasos (barras navy) y footer con aviso de alcance del servicio.
- **Pantallas del flujo**: centradas, ancho `max-w-2xl` (o `max-w-3xl` en chat), sobre
  `bg-bg bg-aurora`. Cada paso es una `.card`.
- **Botones**: siempre pill (`rounded-full`), con micro-elevación al pasar el cursor y anillo
  de foco visible (`focus-visible:ring-4`).
- **Jerarquía**: eyebrow (`Chip`) → `h1` display → párrafo `text-muted`.
- **Chat**: avatar del asistente con `BrandMark`, burbujas navy (usuario) / blancas (asistente),
  indicador de escritura con `.typing-dot`, envío con botón circular `IconSend`.
- **Crisis**: overlay bloqueante (`bg-navy/70` + blur), acento rosa, no descartable.
- **Responsive**: móvil primero; grids colapsan a 1 columna con `sm:`/`md:`.
