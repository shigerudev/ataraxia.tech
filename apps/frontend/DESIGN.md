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

## Radios y sombras

- Radios: `rounded-lg2` (24px, tarjetas), `rounded-md2` (16px, campos/sub-bloques), `rounded-full` (pills).
- Sombras: `shadow-soft` (sutil), `shadow-card` (elevación de tarjeta).
- Animación: `animate-ping-soft` (halo pulsante rosa; usado en el ícono de crisis).
- Se respeta `prefers-reduced-motion` (desactiva animaciones/transiciones).

## Clases de componente (en `global.css`)

| Clase | Qué es |
|-------|--------|
| `.card` | Superficie blanca, borde `hairline`, `rounded-lg2`, `shadow-card`, padding 8. |
| `.btn--primary` / `.btn--ghost` / `.btn--light` | Botones pill con *hover-lift*. Navy / azul suave / blanco con borde. |
| `.chip-brand` / `-outline` / `-green` / `-blue` / `-pink` | Badges pill de color. |
| `.field` | Campo de formulario (label + input/textarea + foco navy + error rosa). |
| `.select-card` | Tarjeta seleccionable (modo, modalidad). Añade `.is-active` para el estado activo. |
| `.app-loading` | Pantalla de carga centrada. |

## Primitivas React (`@/shared/ui`)

```tsx
import { Button, Input, Card, Chip } from '@/shared/ui';

<Button variant="primary|ghost|light" loading={bool} />   // pill, hover-lift
<Input label="…" error="…" name="…" />                    // usa .field
<Card>…</Card>                                             // usa .card
<Chip variant="brand|outline|green|blue|pink">…</Chip>
```

## Patrones UX

- **Pantallas del flujo**: centradas, ancho `max-w-2xl` (o `max-w-3xl` en chat), sobre fondo con
  degradado radial lavanda. Cada paso es una `.card`.
- **Botones**: siempre pill (`rounded-full`), con micro-elevación al pasar el cursor.
- **Jerarquía**: eyebrow (`Chip`) → `h1` display → párrafo `text-muted`.
- **Crisis**: overlay bloqueante (`bg-navy/70` + blur), acento rosa, no descartable.
- **Responsive**: móvil primero; grids colapsan a 1 columna con `sm:`/`md:`.
