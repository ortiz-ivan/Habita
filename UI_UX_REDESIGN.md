# Habita — Guía Completa de Rediseño UI/UX
> **Análisis exhaustivo + especificaciones de implementación para transformar Habita de un diseño básico a una aplicación SaaS corporativa premium**

---

## Índice

1. [Diagnóstico del Estado Actual](#1-diagnóstico-del-estado-actual)
2. [Principios del Nuevo Diseño](#2-principios-del-nuevo-diseño)
3. [Sistema de Color Actualizado](#3-sistema-de-color-actualizado)
4. [Sistema Tipográfico](#4-sistema-tipográfico)
5. [Sistema de Elevación y Superficies](#5-sistema-de-elevación-y-superficies)
6. [Sidebar Rediseñado](#6-sidebar-rediseñado)
7. [Topbar Rediseñado](#7-topbar-rediseñado)
8. [Dashboard — Rediseño Completo](#8-dashboard--rediseño-completo)
9. [KPI Cards — Upgrade](#9-kpi-cards--upgrade)
10. [Tablas y Listas](#10-tablas-y-listas)
11. [Páginas de Gestión](#11-páginas-de-gestión)
12. [Formularios y Modales](#12-formularios-y-modales)
13. [Badges y Estados](#13-badges-y-estados)
14. [Animaciones y Motion](#14-animaciones-y-motion)
15. [Micro-interacciones](#15-micro-interacciones)
16. [Login Page](#16-login-page)
17. [Componentes Adicionales Recomendados](#17-componentes-adicionales-recomendados)
18. [Hoja de Ruta de Implementación](#18-hoja-de-ruta-de-implementación)

---

## 1. Diagnóstico del Estado Actual

### Qué funciona bien ✅
- Estructura de componentes sólida y reutilizable (16 componentes UI)
- Paleta de color coherente con variable CSS bien organizada
- Animaciones de entrada en páginas y modales
- Responsive con Tailwind
- Sidebar colapsable funcional

### Problemas críticos identificados ❌

| Área | Problema | Impacto |
|------|----------|---------|
| **Jerarquía tipográfica** | Mayoría del texto es 10–13px. Sin peso visual. No hay "display size" para valores importantes | Alto |
| **Profundidad de superficies** | Body `#0a0a0a` → Cards `#111111` → diferencia de solo 7% de luminosidad. Todo se ve plano | Alto |
| **Sidebar incongruente** | Fondo beige cálido (`#FAECE7`) contra body negro puro. Parecen dos apps distintas | Alto |
| **KPI Cards sin vida** | Iconos pequeños (36px), números simples, sin gradientes ni profundidad visual | Alto |
| **Botones apagados** | El botón "Cobrar" usa `color-mix()` con 13% de opacidad — casi invisible | Medio |
| **Sin gráficos reales** | El dashboard no tiene ningún gráfico de área/barras para tendencias | Medio |
| **Tablas genéricas** | Filas con `borderBottom` y hover de 1% de cambio. Sin zebra, sin acento | Medio |
| **Secciones sin peso** | Labels "Resumen" y "Actividad" son texto pequeño + línea. Cero jerarquía | Medio |
| **Paginación artesanal** | "← Ant." / "Sig. →" se ve DIY, no corporativo | Bajo |
| **Contraste insuficiente** | `#888884` sobre `#0a0a0a` = ratio ~3.2:1, por debajo del mínimo WCAG 4.5:1 | Alto |
| **Touch targets pequeños** | Botones de icono de 32px, por debajo del mínimo de 44px recomendado | Medio |
| **Sin empty states ilustrados** | Empty states con iconos SVG básicos sin personalidad | Bajo |

---

## 2. Principios del Nuevo Diseño

El objetivo es **Dark Corporate Premium**: profundidad real, jerarquía clara, color funcional y micro-interacciones que hacen la app sentirse viva.

### Los 5 pilares del rediseño

```
1. DEPTH OVER FLATNESS     — Capas de superficie con diferencia visible entre ellas
2. TYPE AS HIERARCHY       — Tamaños que comunican importancia antes de que leas el contenido
3. COLOR WITH PURPOSE      — Cada color tiene un rol semántico, no es decorativo
4. MOTION TELLS STORIES    — Las animaciones comunican estado, no solo se ven bonito
5. DENSITY WITH BREATHING  — Información densa pero con espacio estratégico para descansar
```

### Inspiración de referencia

Diseños de referencia para Habita 2.0:
- **Linear** — Sidebar oscuro premium, KPIs con glow sutil
- **Vercel Dashboard** — Tipografía de datos clara, tarjetas con borde sutil
- **Stripe Dashboard** — Tablas limpias, badges polished, paleta funcional
- **Notion** — Jerarquía tipográfica clara con tamaños expresivos
- **Retool** — Cards de métricas con gradientes funcionales

---

## 3. Sistema de Color Actualizado

### Principio fundamental

El sistema actual tiene **superficies demasiado cercanas en luminosidad**. El rediseño introduce 5 capas de superficie claramente diferenciadas y eleva el uso del color de marca.

### Paleta completa — `index.css`

```css
@theme {
  /* ── BRAND ─────────────────────────────────────────────── */
  --color-brand:              #E0613A;   /* Coral primario */
  --color-brand-hover:        #C9522E;   /* Coral oscuro (hover) */
  --color-brand-light:        #FAECE7;   /* Coral muy claro (sidebar) */
  --color-brand-glow:         rgba(224, 97, 58, 0.15);   /* Glow para KPIs */
  --color-brand-subtle:       rgba(224, 97, 58, 0.08);   /* Fondo sutil coral */

  /* ── SURFACE SYSTEM (5 capas) ──────────────────────────── */
  --color-bg:                 #080808;   /* ← antes #0a0a0a */
  --color-surface-0:          #0e0e0e;   /* Panel base, fondo secundario */
  --color-surface-1:          #141414;   /* Cards, sidebar oscuro */
  --color-surface-2:          #1c1c1c;   /* Cards hover, inputs */
  --color-surface-3:          #242424;   /* Activos, selected states */
  --color-surface-glass:      rgba(255, 255, 255, 0.04); /* Glass effect sutil */

  /* ── BORDERS ────────────────────────────────────────────── */
  --color-border:             #222222;   /* Borde base (más visible que #1f1f1f) */
  --color-border-subtle:      #1a1a1a;   /* Separadores internos */
  --color-border-strong:      #333333;   /* Bordes prominentes */
  --color-border-brand:       rgba(224, 97, 58, 0.30); /* Borde de foco */

  /* ── TEXT ───────────────────────────────────────────────── */
  --color-text-primary:       #F2F2F2;   /* Texto principal (↑ brillo) */
  --color-text-secondary:     #A0A09C;   /* Texto secundario — ratio 5.2:1 ✓ */
  --color-text-muted:         #6B6B67;   /* Texto apagado — ratio 4.6:1 ✓ */
  --color-text-disabled:      #4A4A47;   /* Disabled */

  /* ── STATUS COLORS ──────────────────────────────────────── */
  /* Success */
  --color-success-bg:         #0a1f00;
  --color-success-bg-soft:    rgba(125, 201, 71, 0.08);
  --color-success-text:       #7dc947;
  --color-success-border:     rgba(125, 201, 71, 0.20);

  /* Danger */
  --color-danger-bg:          #1f0000;
  --color-danger-bg-soft:     rgba(248, 113, 113, 0.08);
  --color-danger-text:        #f87171;
  --color-danger-border:      rgba(248, 113, 113, 0.20);

  /* Warning */
  --color-warning-bg:         #1c1500;
  --color-warning-bg-soft:    rgba(251, 191, 36, 0.08);
  --color-warning-text:       #fbbf24;
  --color-warning-border:     rgba(251, 191, 36, 0.20);

  /* Info */
  --color-info-bg:            #0d1f38;
  --color-info-bg-soft:       rgba(96, 165, 250, 0.08);
  --color-info-text:          #60a5fa;
  --color-info-border:        rgba(96, 165, 250, 0.20);

  /* Amber (reservada) */
  --color-amber-text:         #FAC775;
  --color-amber-bg:           #2a1400;
  --color-amber-bg-soft:      rgba(250, 199, 117, 0.08);
  --color-amber-border:       rgba(250, 199, 117, 0.20);

  /* ── SIDEBAR (dark variant — ver sección 6) ────────────── */
  --color-sidebar-bg:         #0e0e0e;
  --color-sidebar-border:     #1e1e1e;
  --color-sidebar-text:       #8a8a86;
  --color-sidebar-text-hover: #d0d0cc;
  --color-sidebar-active-bg:  rgba(224, 97, 58, 0.12);
  --color-sidebar-active-text:#E0613A;
  --color-sidebar-hover-bg:   rgba(255, 255, 255, 0.04);
  --color-sidebar-section:    #4a4a47;
  --color-sidebar-heading:    #F2F2F2;

  /* ── SPECIAL ────────────────────────────────────────────── */
  --color-brand-amber:        #FAC775;
  --color-brand-amber-light:  #2a1400;

  /* ── FONT ───────────────────────────────────────────────── */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-display: 'Inter', ui-sans-serif, system-ui, sans-serif;

  /* ── RADIUS ─────────────────────────────────────────────── */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-full: 9999px;

  /* ── SHADOWS ────────────────────────────────────────────── */
  --shadow-card:  0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);
  --shadow-card-hover: 0 8px 24px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3);
  --shadow-modal: 0 24px 64px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.4);
  --shadow-brand: 0 4px 16px rgba(224, 97, 58, 0.25);
  --shadow-glow-sm: 0 0 12px rgba(224, 97, 58, 0.15);
}
```

### Justificación del cambio de sidebar

El sidebar beige claro (`#FAECE7`) sobre body negro crea un **choque de contraste extremo** que hace la aplicación sentirse como dos productos distintos. El rediseño lo mueve a un dark sidebar consistente con el resto de la app, eliminando la incongruencia visual. Los logos y brandmarks de gestión inmobiliaria moderna (PropertyMatrix, AppFolio, Buildium) todos usan sidebars oscuros unificados.

---

## 4. Sistema Tipográfico

### Mantener Inter — Justificación

Inter es la fuente correcta para esta app. Está optimizada para pantallas, tiene excelente legibilidad en tamaños pequeños (labels, badges), y su versión numérica es ideal para métricas financieras. **No cambiar la fuente**, sino establecer una escala de tamaños más expresiva.

### Escala tipográfica nueva

```
Nivel          Tamaño   Peso    Uso
──────────────────────────────────────────────────────────────
display-xl     40px     800     Valores KPI principales
display-lg     32px     700     Valores KPI secundarios
display-md     24px     700     Valores KPI pequeños
heading-lg     20px     600     Títulos de sección prominentes
heading-md     17px     600     Títulos de card/panel
heading-sm     15px     600     Subtítulos, labels de grupo
body-lg        15px     400     Texto de contenido principal
body-md        14px     400     Texto general (← subir de 13px)
body-sm        13px     400     Texto secundario
label-lg       12px     500     Labels de campo, badge text
label-md       11px     500     Labels auxiliares, timestamps
label-sm       10px     500     Caps sections labels
──────────────────────────────────────────────────────────────
```

### Cambios clave respecto al diseño actual

| Elemento actual | Tamaño actual | Tamaño nuevo | Justificación |
|-----------------|--------------|-------------|---------------|
| KPI value | 26px bold | 40px extrabold | Es el dato más importante, debe dominar |
| Body text general | 13px | 14px | Mínimo legible en monitores (WCAG) |
| Table cells | 13px | 14px | Mejor legibilidad en datos densos |
| Section labels (caps) | 11px | 11px + letter-spacing wider | Mantener, mejorar con opacidad |
| Card titles | 13px medium | 15px semibold | Más jerarquía |
| Text muted (secondary) | `#888884` | `#A0A09C` | Pasar de ratio 3.2:1 a 5.2:1 |

### CSS global actualizado

```css
/* index.css — sección global */

body {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  background: var(--color-bg);
  color: var(--color-text-primary);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  font-size: 14px; /* ← subir de default 16px/Tailwind base */
}

/* Utility classes de tipografía */
.text-display-xl {
  font-size: 40px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
}

.text-display-lg {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.text-display-md {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 1.2;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.10em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
```

---

## 5. Sistema de Elevación y Superficies

### El problema de profundidad actual

```
Body (#0a0a0a)   →  Cards (#111111)  →  Hover (#1a1a1a)
     0% L              6.7% L              10.2% L
         ↑ Δ6.7%              ↑ Δ3.5%
Diferencias demasiado pequeñas = todo se ve plano
```

### Sistema de elevación nuevo

```
Capa 0: #080808  — Body/background principal          (L = 3.1%)
Capa 1: #0e0e0e  — Sidebar, panel base               (L = 5.5%) Δ+2.4%
Capa 2: #141414  — Cards, contenedores               (L = 7.8%) Δ+2.3%
Capa 3: #1c1c1c  — Input bg, hover de cards          (L = 10.9%) Δ+3.1%
Capa 4: #242424  — Activos, dropdowns, selected      (L = 14.1%) Δ+3.2%

Bordes:
  - Capa 2 card: border: 1px solid #222222
  - Capa 3 hover: border: 1px solid #2e2e2e
  - Brand accent: border: 1px solid rgba(224,97,58,0.25)
```

### Guía de uso de capas

```
Componente                    →  Superficie
─────────────────────────────────────────────────────
<body>                        →  Capa 0 (#080808)
Sidebar                       →  Capa 1 (#0e0e0e)
Topbar                        →  Capa 1 (#0e0e0e) + border capa 2
Cards, panels, tables         →  Capa 2 (#141414)
Input backgrounds             →  Capa 3 (#1c1c1c)
Card hover state              →  Capa 3 (#1c1c1c)
Dropdown, popover bg          →  Capa 3 (#1c1c1c)
Selected/active rows          →  Capa 4 (#242424)
Modal overlay bg              →  rgba(0,0,0,0.75)
Modal panel                   →  Capa 2 (#141414)
```

### Cards con profundidad real

```jsx
/* Antes: */
<div className="rounded px-4 py-4 bg-surface-1 border border-border">

/* Después — con elevación, borde visible, hover rico */
<div
  style={{
    background: 'var(--color-surface-1)',     /* #141414 */
    border: '1px solid var(--color-border)',   /* #222222 */
    borderRadius: 'var(--radius-lg)',          /* 12px */
    boxShadow: 'var(--shadow-card)',
    transition: 'all 200ms ease',
  }}
  onMouseEnter={e => {
    e.currentTarget.style.background = 'var(--color-surface-2)'
    e.currentTarget.style.borderColor = 'var(--color-border-strong)'
    e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)'
    e.currentTarget.style.transform = 'translateY(-1px)'
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = 'var(--color-surface-1)'
    e.currentTarget.style.borderColor = 'var(--color-border)'
    e.currentTarget.style.boxShadow = 'var(--shadow-card)'
    e.currentTarget.style.transform = 'translateY(0)'
  }}
>
```

---

## 6. Sidebar Rediseñado

### Decisión de diseño: Unificar al dark

Mover el sidebar de beige cálido a dark unificado es el cambio con **mayor impacto visual** del rediseño completo. Crea consistencia, profundidad y apariencia corporativa.

### Especificación completa del sidebar

```
Ancho expandido:   220px   (← antes 176px, más espacio para labels)
Ancho colapsado:   60px    (← antes 56px)
Altura header:     64px    (← antes 56px)
Padding lateral:   12px
```

### Logo/Brand área

```jsx
/* Nuevo brand block — más premium */
<div style={{
  height: '64px',
  borderBottom: '1px solid var(--color-sidebar-border)',
  display: 'flex',
  alignItems: 'center',
  padding: '0 16px',
  gap: '10px',
}}>
  {/* Logo con gradiente */}
  <div style={{
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, var(--color-brand) 0%, #C9522E 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '15px',
    fontWeight: '800',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(224,97,58,0.35)',
    flexShrink: 0,
    letterSpacing: '-0.02em',
  }}>
    H
  </div>
  {!collapsed && (
    <div>
      <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
        Habita
      </p>
      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '1px' }}>
        Gestión de alquileres
      </p>
    </div>
  )}
</div>
```

### Nav items — nuevo estilo

```jsx
/* Nav item activo — con acento coral izquierdo */
{/* Estado activo */}
style={{
  backgroundColor: 'rgba(224, 97, 58, 0.10)',
  borderLeft: '2px solid var(--color-brand)',
  paddingLeft: '10px',   /* compensar el border-left de 2px */
  borderRadius: '0 6px 6px 0',
  color: 'var(--color-brand)',
}}

{/* Estado hover */}
style={{
  backgroundColor: 'rgba(255,255,255,0.04)',
  borderLeft: '2px solid transparent',
  color: 'var(--color-text-primary)',
  borderRadius: '0 6px 6px 0',
}}

{/* Estado default */}
style={{
  borderLeft: '2px solid transparent',
  color: 'var(--color-sidebar-text)',   /* #8a8a86 */
  borderRadius: '0 6px 6px 0',
}}
```

### Section labels del sidebar

```jsx
/* Antes: "OPERACIONES" — texto gris pequeño */
/* Después: línea + texto con más separación */
<div style={{ padding: '16px 12px 6px' }}>
  <span style={{
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: 'var(--color-sidebar-section)',   /* #4a4a47 */
  }}>
    {section.label}
  </span>
</div>
```

### Usuario en footer del sidebar

```jsx
/* Nuevo — área de usuario más premium */
<div style={{
  padding: '12px',
  borderTop: '1px solid var(--color-sidebar-border)',
}}>
  <div style={{
    background: 'var(--color-surface-glass)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '10px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  }}>
    {/* Avatar con initial */}
    <div style={{
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--color-brand) 0%, #FAC775 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: '700',
      color: '#fff',
      flexShrink: 0,
    }}>
      {initials}
    </div>
    <div style={{ minWidth: 0, flex: 1 }}>
      <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text-primary)', truncate: true }}>
        {user?.username}
      </p>
      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
        {user?.rol}
      </p>
    </div>
  </div>

  {/* Logout separado, más elegante */}
  <button style={{
    marginTop: '6px',
    width: '100%',
    padding: '8px 12px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    transition: 'all 150ms ease',
  }}
  onMouseEnter={e => {
    e.currentTarget.style.background = 'rgba(248,113,113,0.08)'
    e.currentTarget.style.color = 'var(--color-danger-text)'
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = 'transparent'
    e.currentTarget.style.color = 'var(--color-text-muted)'
  }}>
    <IconLogout />
    Cerrar sesión
  </button>
</div>
```

---

## 7. Topbar Rediseñado

### Problemas actuales
- Altura 56px es mínima, sin respiro
- Solo muestra título de página, no da contexto
- El separador `w-px h-5` es visible pero genérico
- El botón "Registrar pago" es coral pero se pierde entre otros elementos

### Especificación nueva

```
Altura: 64px   (← antes 56px)
Fondo:  var(--color-surface-1) con blur backdrop sutil
Borde:  1px solid var(--color-border)
```

### Topbar JSX

```jsx
<header style={{
  height: '64px',
  backgroundColor: 'var(--color-surface-1)',
  borderBottom: '1px solid var(--color-border)',
  backdropFilter: 'blur(8px)',  /* efecto glass cuando scroll */
  position: 'sticky',
  top: 0,
  zIndex: 40,
}}>
  <div style={{
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 32px',  /* ← antes 40px, más natural */
    gap: '12px',
  }}>
    {/* Título con breadcrumb sutil */}
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <h1 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
          letterSpacing: '-0.01em',
        }}>
          {currentTitle}
        </h1>
        {/* Badge de fecha/contexto solo en dashboard */}
        {location.pathname === '/dashboard' && (
          <span style={{
            fontSize: '11px',
            fontWeight: '500',
            padding: '2px 8px',
            borderRadius: '999px',
            background: 'var(--color-surface-3)',
            color: 'var(--color-text-muted)',
            border: '1px solid var(--color-border)',
          }}>
            {monthLabel}
          </span>
        )}
      </div>
      {/* Status line — solo muestra algo si hay datos importantes */}
      {unreadCount > 0 && (
        <p style={{ fontSize: '12px', color: 'var(--color-danger-text)', marginTop: '2px' }}>
          {unreadCount} pago{unreadCount > 1 ? 's' : ''} vencido{unreadCount > 1 ? 's' : ''}
        </p>
      )}
    </div>

    <div style={{ flex: 1 }} />

    {/* Acciones topbar */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {/* Notificaciones con badge numérico */}
      <button
        style={{
          position: 'relative',
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          transition: 'all 150ms ease',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--color-surface-2)'
          e.currentTarget.style.color = 'var(--color-text-primary)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'var(--color-text-muted)'
        }}
      >
        <IconBell />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            minWidth: '16px',
            height: '16px',
            borderRadius: '999px',
            backgroundColor: 'var(--color-danger-text)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 3px',
            boxShadow: '0 0 0 2px var(--color-surface-1)',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Divider */}
      <div style={{ width: '1px', height: '24px', background: 'var(--color-border)', margin: '0 4px' }} />

      {/* Botón CTA principal — más prominente */}
      <button
        onClick={quickPago.open}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0 16px',
          height: '36px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, var(--color-brand) 0%, #C9522E 100%)',
          color: '#fff',
          fontSize: '13px',
          fontWeight: '600',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(224,97,58,0.30)',
          transition: 'all 150ms ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(224,97,58,0.45)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(224,97,58,0.30)'
          e.currentTarget.style.transform = 'translateY(0)'
        }}
      >
        <IconPlus />
        Registrar pago
      </button>
    </div>
  </div>
</header>
```

---

## 8. Dashboard — Rediseño Completo

### Sección Hero/Bienvenida

El saludo actual "Bienvenido, {nombre}" es texto plano sobre fondo negro. El rediseño lo convierte en un **banner de contexto funcional**.

```jsx
{/* Hero del dashboard — reemplaza el saludo básico */}
<div style={{
  background: 'linear-gradient(135deg, rgba(224,97,58,0.08) 0%, rgba(224,97,58,0.03) 60%, transparent 100%)',
  border: '1px solid rgba(224,97,58,0.12)',
  borderRadius: '12px',
  padding: '24px 28px',
  marginBottom: '32px',
  display: 'flex',
  alignItems: 'center',
  gap: '20px',
}}>
  {/* Icono decorativo */}
  <div style={{
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, var(--color-brand) 0%, #FAC775 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 16px rgba(224,97,58,0.30)',
  }}>
    <IconHome color="#fff" size={22} />
  </div>

  <div style={{ flex: 1 }}>
    <h2 style={{
      fontSize: '20px',
      fontWeight: '700',
      color: 'var(--color-text-primary)',
      letterSpacing: '-0.02em',
      marginBottom: '4px',
    }}>
      Bienvenido, {user?.first_name || user?.username}
    </h2>
    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
      {monthLabel} · {user?.rol}
    </p>
  </div>

  {/* Estado de pagos — derecha */}
  <div>
    <PaymentStatusBanner vencidos={vencidosCount} pendientes={pendientesCount} />
  </div>
</div>
```

### Sección labels — más peso visual

```jsx
/* Componente SectionLabel rediseñado */
function SectionLabel({ label, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      {/* Acento vertical coral */}
      <div style={{
        width: '3px',
        height: '16px',
        borderRadius: '2px',
        background: 'linear-gradient(180deg, var(--color-brand) 0%, var(--color-brand-hover) 100%)',
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--color-text-primary)',
        letterSpacing: '-0.01em',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
      {action && (
        <button style={{
          fontSize: '12px',
          color: 'var(--color-brand)',
          fontWeight: '500',
          cursor: 'pointer',
        }}>
          {action}
        </button>
      )}
    </div>
  )
}
```

---

## 9. KPI Cards — Upgrade

### Problema actual

Las KPI cards tienen:
- Icono 36px en cuadrado plano
- Valor 26px bold (muy pequeño para un KPI principal)
- Sin gradiente, sin profundidad
- El color del valor y del icono se ve repetitivo

### Nuevo diseño de MetricCard

```
┌─────────────────────────────────────────┐
│  [ICON]                     ▲ +12% MoM  │
│                                          │
│  Ingresos del mes                        │
│  ₲ 18.500.000                            │  ← 40px extrabold
│                                          │
│  ████████████░░░░░░  (progress bar)      │
└─────────────────────────────────────────┘
```

```jsx
/* MetricCard.jsx — versión premium */
export function MetricCard({ label, value, color = 'default', icon, progress, spark, delta }) {
  const cfg = {
    default: {
      iconGradient: 'linear-gradient(135deg, #2a2a2a 0%, #1c1c1c 100%)',
      iconColor: 'var(--color-text-secondary)',
      valueColor: 'var(--color-text-primary)',
      accentColor: 'var(--color-border-strong)',
      cardGlow: 'transparent',
    },
    brand: {
      iconGradient: 'linear-gradient(135deg, rgba(224,97,58,0.20) 0%, rgba(201,82,46,0.12) 100%)',
      iconColor: 'var(--color-brand)',
      valueColor: 'var(--color-brand)',
      accentColor: 'var(--color-brand)',
      cardGlow: 'rgba(224,97,58,0.06)',
    },
    success: {
      iconGradient: 'linear-gradient(135deg, rgba(125,201,71,0.20) 0%, rgba(125,201,71,0.10) 100%)',
      iconColor: 'var(--color-success-text)',
      valueColor: 'var(--color-success-text)',
      accentColor: 'var(--color-success-text)',
      cardGlow: 'rgba(125,201,71,0.05)',
    },
    warning: {
      iconGradient: 'linear-gradient(135deg, rgba(250,199,117,0.20) 0%, rgba(250,199,117,0.10) 100%)',
      iconColor: 'var(--color-amber-text)',
      valueColor: 'var(--color-amber-text)',
      accentColor: 'var(--color-amber-text)',
      cardGlow: 'rgba(250,199,117,0.05)',
    },
    danger: {
      iconGradient: 'linear-gradient(135deg, rgba(248,113,113,0.20) 0%, rgba(248,113,113,0.10) 100%)',
      iconColor: 'var(--color-danger-text)',
      valueColor: 'var(--color-danger-text)',
      accentColor: 'var(--color-danger-text)',
      cardGlow: 'rgba(248,113,113,0.05)',
    },
  }[color] ?? cfg.default

  return (
    <div
      style={{
        background: `linear-gradient(135deg, var(--color-surface-1) 0%, var(--color-surface-1) 100%)`,
        backgroundColor: 'var(--color-surface-1)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '20px 20px 16px',
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
        transition: 'all 220ms ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = cfg.accentColor + '50'
        e.currentTarget.style.boxShadow = `var(--shadow-card-hover), 0 0 20px ${cfg.cardGlow}`
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.boxShadow = 'var(--shadow-card)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Glow background sutil */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: cfg.cardGlow,
        filter: 'blur(24px)',
        pointerEvents: 'none',
      }} />

      {/* Top row: icon + delta */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: cfg.iconGradient,
          border: `1px solid ${cfg.accentColor}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: cfg.iconColor,
          flexShrink: 0,
        }}>
          {icon}
        </div>

        {delta && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '12px',
            fontWeight: '600',
            padding: '3px 8px',
            borderRadius: '999px',
            background: delta.up ? 'var(--color-success-bg-soft)' : 'var(--color-danger-bg-soft)',
            color: delta.up ? 'var(--color-success-text)' : 'var(--color-danger-text)',
          }}>
            <span style={{ transform: delta.up ? 'none' : 'rotate(180deg)', display: 'inline-flex' }}>
              <IconTrendUp />
            </span>
            {delta.value}
          </span>
        )}
      </div>

      {/* Label */}
      <p style={{
        fontSize: '12px',
        fontWeight: '500',
        color: 'var(--color-text-muted)',
        marginBottom: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label}
      </p>

      {/* Value — display size */}
      <p style={{
        fontSize: '32px',
        fontWeight: '800',
        letterSpacing: '-0.03em',
        lineHeight: 1,
        color: cfg.valueColor,
        marginBottom: 'auto',
      }}>
        {value ?? '—'}
      </p>

      {/* Progress o sparkline — bottom */}
      <div style={{ marginTop: '16px', height: '28px' }}>
        {hasSpark ? (
          <Sparkline data={spark} color={cfg.accentColor} />
        ) : hasProgress ? (
          <div>
            <div style={{
              height: '4px',
              borderRadius: '999px',
              background: 'var(--color-border-strong)',
              overflow: 'hidden',
              marginBottom: '6px',
            }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, progress)}%`,
                borderRadius: '999px',
                background: `linear-gradient(90deg, ${cfg.accentColor} 0%, ${cfg.accentColor}cc 100%)`,
                transition: 'width 700ms ease-out',
                boxShadow: `0 0 8px ${cfg.accentColor}66`,
              }} />
            </div>
            <p style={{ fontSize: '11px', textAlign: 'right', color: 'var(--color-text-muted)' }}>
              {progress}% ocupado
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
```

### Valores de KPI — tamaño display

Los valores más importantes del negocio (ingresos del mes, monto pendiente) merecen tamaño **32–40px**. En el diseño actual son 26px, lo que hace que no dominen la card.

```
Ingresos del mes   →  32px, weight 800
Pendiente cobro    →  32px, weight 800
Ocupación (%)      →  40px, weight 800   ← dato más corto, más espacio
Contratos activos  →  32px, weight 800
```

---

## 10. Tablas y Listas

### TenantRow (Dashboard) — Upgrade

El diseño actual tiene filas con hover de `#161616` — casi imperceptible. El rediseño hace la interacción evidente.

```jsx
/* TenantRow rediseñada */
function TenantRow({ pago, onCobrar }) {
  /* ... mismo lógico ... */

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        borderBottom: '1px solid var(--color-border-subtle)',
        transition: 'background-color 150ms ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      {/* Avatar con status ring */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: bg,
          color: text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: '700',
          border: `2px solid ${text}33`,
        }}>
          {initials}
        </div>
      </div>

      {/* Datos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {nombre || '—'}
        </p>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          Hab. {pago.contrato?.habitacion_numero} · {formatDate(pago.fecha_pago)}
        </p>
      </div>

      {/* Monto */}
      <span style={{
        fontSize: '14px',
        fontWeight: '700',
        color: 'var(--color-text-primary)',
        flexShrink: 0,
        letterSpacing: '-0.01em',
      }}>
        {formatGs(pago.monto)}
      </span>

      {/* Badge de estado */}
      <div style={{ width: '90px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
        <PaymentStatusBadge status={pago.estado} />
      </div>

      {/* Botón cobrar — más visible */}
      {pago.estado !== 'pagado' ? (
        <button
          onClick={(e) => { e.stopPropagation(); onCobrar?.(pago) }}
          style={{
            fontSize: '12px',
            fontWeight: '600',
            padding: '6px 14px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, var(--color-brand) 0%, #C9522E 100%)',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 150ms ease',
            boxShadow: '0 2px 6px rgba(224,97,58,0.25)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(224,97,58,0.40)'
            e.currentTarget.style.transform = 'translateY(-1px)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(224,97,58,0.25)'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Cobrar
        </button>
      ) : (
        <div style={{ width: '70px', flexShrink: 0 }} />
      )}
    </div>
  )
}
```

### Header de tabla — más estructura

```jsx
{/* Table header — añadir row de headers descriptivos */}
<div style={{
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '10px 20px',
  borderBottom: '1px solid var(--color-border)',
  background: 'var(--color-surface-0)',
}}>
  <div style={{ width: '36px', flexShrink: 0 }} />
  <span style={{ flex: 1, fontSize: '11px', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
    Inquilino
  </span>
  <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', width: '100px', textAlign: 'right' }}>
    Monto
  </span>
  <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', width: '90px', textAlign: 'right' }}>
    Estado
  </span>
  <div style={{ width: '70px', flexShrink: 0 }} />
</div>
```

### Grid de habitaciones — cards más ricas

```jsx
{/* Habitacion card en dashboard — más visual */}
<div
  key={h.id}
  style={{
    borderRadius: '8px',
    padding: '10px 12px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
    background: `linear-gradient(135deg, ${cfg.bg} 0%, ${cfg.bg}bb 100%)`,
    border: `1px solid ${cfg.dot}22`,
    borderLeft: `3px solid ${cfg.dot}`,
  }}
  onMouseEnter={e => {
    e.currentTarget.style.transform = 'translateY(-2px)'
    e.currentTarget.style.boxShadow = `0 4px 12px ${cfg.dot}20`
    e.currentTarget.style.borderColor = `${cfg.dot}44`
  }}
  onMouseLeave={e => {
    e.currentTarget.style.transform = 'translateY(0)'
    e.currentTarget.style.boxShadow = 'none'
    e.currentTarget.style.borderColor = `${cfg.dot}22`
  }}
>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
    <p style={{ fontSize: '14px', fontWeight: '700', color: cfg.text, letterSpacing: '-0.01em' }}>
      N°{h.numero}
    </p>
    <span style={{
      width: '7px',
      height: '7px',
      borderRadius: '50%',
      background: cfg.dot,
      boxShadow: `0 0 6px ${cfg.dot}`,
      flexShrink: 0,
      marginTop: '3px',
    }} />
  </div>
  <p style={{ fontSize: '11px', color: cfg.dot, opacity: 0.8, marginTop: '2px' }}>Piso {h.piso}</p>
  <p style={{ fontSize: '11px', fontWeight: '600', color: cfg.text, marginTop: '6px', textTransform: 'capitalize' }}>
    {cfg.label}
  </p>
</div>
```

---

## 11. Páginas de Gestión

### HabitacionCard — Upgrade

```
┌──────────────────────────────────────────┐
│ ████ (barra de color tope — 3px)         │
│                                           │
│  [101]                        [OCUPADA]   │
│  Piso 2 · Tipo Suite                     │
│                                           │
│  ₲ 2.800.000 /mes             2 👤        │
│                                           │
│  ─────────────────────────────────────── │
│  María García                  [●] Pagado │
│                                           │
│  [👁 Ver]          [✏ Editar]            │
└──────────────────────────────────────────┘
```

**Cambios clave:**
- Barra de color superior de 4px (no lateral)
- Número de habitación en `20px bold`
- Badge de estado con fondo coloreado + punto brillante
- Precio con estilo monetario `font-tabular-nums`
- Separador antes de info de inquilino
- Botones de acción como texto+icono (no solo icono)

### PageHeader de sección

Cada página necesita un header más expresivo que solo título:

```jsx
/* Ejemplo para HabitacionesPage */
<div style={{
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  marginBottom: '32px',
}}>
  <div>
    <h1 style={{
      fontSize: '24px',
      fontWeight: '800',
      color: 'var(--color-text-primary)',
      letterSpacing: '-0.02em',
      marginBottom: '4px',
    }}>
      Habitaciones
    </h1>
    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
      {total} habitaciones · {ocupadas} ocupadas · {disponibles} disponibles
    </p>
  </div>
  <div style={{ display: 'flex', gap: '8px' }}>
    <Button variant="ghost" size="sm">
      <IconSettings /> Tipos
    </Button>
    <Button variant="primary" size="sm">
      <IconPlus /> Nueva habitación
    </Button>
  </div>
</div>
```

### Mini KPI bar en páginas de gestión

En lugar de las 5 mini KPI cards actuales (muy pequeñas y sin personalidad), usar una barra horizontal con chips de datos:

```jsx
/* Stats bar — más limpio que cards independientes */
<div style={{
  display: 'flex',
  gap: '2px',
  marginBottom: '24px',
  padding: '4px',
  background: 'var(--color-surface-1)',
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
}}>
  {stats.map((stat, i) => (
    <div key={i} style={{
      flex: 1,
      padding: '12px 16px',
      borderRadius: '8px',
      background: i === activeFilter ? 'var(--color-surface-3)' : 'transparent',
      cursor: 'pointer',
      transition: 'background 150ms ease',
    }}>
      <p style={{ fontSize: '20px', fontWeight: '800', color: stat.color, letterSpacing: '-0.02em' }}>
        {stat.value}
      </p>
      <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '2px', fontWeight: '500' }}>
        {stat.label}
      </p>
    </div>
  ))}
</div>
```

---

## 12. Formularios y Modales

### Input styling — upgrade

```css
/* Inputs — más polished */
input, select, textarea {
  background: var(--color-surface-2);     /* #1c1c1c — visible sobre card */
  border: 1px solid var(--color-border);  /* #222222 */
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--color-text-primary);
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

input:hover, select:hover, textarea:hover {
  border-color: var(--color-border-strong);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--color-brand);
  box-shadow: 0 0 0 3px rgba(224, 97, 58, 0.12);
  background: var(--color-surface-3);
}
```

### Form labels

```jsx
/* Label con indicador de requerido */
<label style={{
  display: 'block',
  fontSize: '13px',
  fontWeight: '500',
  color: 'var(--color-text-secondary)',
  marginBottom: '6px',
  letterSpacing: '0.01em',
}}>
  Monto mensual
  {required && <span style={{ color: 'var(--color-danger-text)', marginLeft: '3px' }}>*</span>}
</label>
```

### Modal rediseñado

```jsx
/* Modal panel — glassmorphism sutil */
<div style={{
  background: 'var(--color-surface-1)',
  border: '1px solid var(--color-border)',
  borderRadius: '16px',
  boxShadow: 'var(--shadow-modal)',
  overflow: 'hidden',
}}>
  {/* Header del modal */}
  <div style={{
    padding: '20px 24px',
    borderBottom: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'linear-gradient(180deg, var(--color-surface-2) 0%, var(--color-surface-1) 100%)',
  }}>
    <h2 style={{
      fontSize: '17px',
      fontWeight: '700',
      color: 'var(--color-text-primary)',
      letterSpacing: '-0.01em',
    }}>
      {title}
    </h2>
    <button style={{
      width: '32px',
      height: '32px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-text-muted)',
      cursor: 'pointer',
      transition: 'all 150ms ease',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = 'var(--color-surface-3)'
      e.currentTarget.style.color = 'var(--color-text-primary)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent'
      e.currentTarget.style.color = 'var(--color-text-muted)'
    }}>
      <IconX />
    </button>
  </div>

  {/* Body del modal */}
  <div style={{ padding: '24px' }}>
    {children}
  </div>
</div>
```

### Form sections en modales

```jsx
/* Agrupar campos relacionados en modales largos */
<div style={{ marginBottom: '20px' }}>
  <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>
    Información del contrato
  </p>
  {/* campos... */}
</div>
```

---

## 13. Badges y Estados

### PaymentStatusBadge — Versión premium

```jsx
const statusConfig = {
  pagado: {
    label: 'Pagado',
    bg: 'var(--color-success-bg-soft)',
    text: 'var(--color-success-text)',
    border: 'var(--color-success-border)',
    dot: 'var(--color-success-text)',
  },
  pendiente: {
    label: 'Pendiente',
    bg: 'var(--color-warning-bg-soft)',
    text: 'var(--color-warning-text)',
    border: 'var(--color-warning-border)',
    dot: 'var(--color-warning-text)',
  },
  vencido: {
    label: 'Vencido',
    bg: 'var(--color-danger-bg-soft)',
    text: 'var(--color-danger-text)',
    border: 'var(--color-danger-border)',
    dot: 'var(--color-danger-text)',
  },
  por_vencer: {
    label: 'Por vencer',
    bg: 'var(--color-amber-bg-soft)',
    text: 'var(--color-amber-text)',
    border: 'var(--color-amber-border)',
    dot: 'var(--color-amber-text)',
  },
  parcial: {
    label: 'Parcial',
    bg: 'var(--color-info-bg-soft)',
    text: 'var(--color-info-text)',
    border: 'var(--color-info-border)',
    dot: 'var(--color-info-text)',
  },
  sin_contrato: {
    label: 'Sin contrato',
    bg: 'rgba(255,255,255,0.04)',
    text: 'var(--color-text-muted)',
    border: 'var(--color-border)',
    dot: 'var(--color-text-muted)',
  },
}

export function PaymentStatusBadge({ status }) {
  const cfg = statusConfig[status] ?? statusConfig.sin_contrato

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '3px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: '600',
      background: cfg.bg,
      color: cfg.text,
      border: `1px solid ${cfg.border}`,
      whiteSpace: 'nowrap',
      letterSpacing: '0.01em',
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: cfg.dot,
        flexShrink: 0,
        /* Pulse para "vencido" */
        ...(status === 'vencido' ? {
          animation: 'pulse-dot 2s ease-in-out infinite',
        } : {}),
      }} />
      {cfg.label}
    </span>
  )
}
```

### Animación pulse para vencidos

```css
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(0.8); }
}
```

---

## 14. Animaciones y Motion

### Principios

```
Micro (100–150ms): hover colors, border changes, opacity toggles
Small  (200–250ms): card hover lift, button press
Medium (300–350ms): modal open/close, page transitions
Large  (500–700ms): progress bars, counters de KPI
```

### Animaciones a agregar en `index.css`

```css
/* ── Animaciones adicionales ─────────────────────────── */

/* Slide up para cards */
@keyframes slide-up-fade {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Slide in desde derecha para notificaciones */
@keyframes slide-in-right {
  from { opacity: 0; transform: translateX(20px); }
  to   { opacity: 1; transform: translateX(0); }
}

/* Counter (usar con JS counter animation) */
@keyframes count-up {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Shimmer para skeleton */
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Pulse para badges vencidos */
@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(248,113,113,0.4); }
  50%       { opacity: 0.7; box-shadow: 0 0 0 4px rgba(248,113,113,0); }
}

/* Stagger para listas de cards */
.stagger-item:nth-child(1) { animation-delay: 0ms; }
.stagger-item:nth-child(2) { animation-delay: 40ms; }
.stagger-item:nth-child(3) { animation-delay: 80ms; }
.stagger-item:nth-child(4) { animation-delay: 120ms; }

/* Skeleton con shimmer */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--color-surface-2) 25%,
    var(--color-surface-3) 50%,
    var(--color-surface-2) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}
```

### Animación de KPI counter (JS)

```jsx
/* Hook para animar valores numéricos */
function useCountUp(target, duration = 1000, shouldAnimate = true) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!shouldAnimate || typeof target !== 'number') {
      setValue(target)
      return
    }
    const startTime = performance.now()
    const startValue = 0

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Easing: ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(startValue + (target - startValue) * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
  }, [target, duration, shouldAnimate])

  return value
}

/* Uso en MetricCard */
const animatedValue = useCountUp(numericValue, 800)
```

### Page transitions — stagger de cards

```jsx
/* En HabitacionesPage, ContratosPage — las cards entran escalonadas */
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {habitaciones.map((hab, index) => (
    <div
      key={hab.id}
      style={{
        animation: 'slide-up-fade 280ms ease both',
        animationDelay: `${index * 40}ms`,
      }}
    >
      <HabitacionCard habitacion={hab} />
    </div>
  ))}
</div>
```

---

## 15. Micro-interacciones

### Button component — upgrade completo

```jsx
/* Button.jsx rediseñado */
const variants = {
  primary: {
    background: 'linear-gradient(135deg, var(--color-brand) 0%, #C9522E 100%)',
    color: '#fff',
    border: 'none',
    hoverShadow: '0 4px 16px rgba(224,97,58,0.40)',
    activeShadow: '0 2px 8px rgba(224,97,58,0.30)',
    defaultShadow: '0 2px 8px rgba(224,97,58,0.25)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    hoverBg: 'var(--color-surface-2)',
    hoverColor: 'var(--color-text-primary)',
    hoverBorder: 'var(--color-border-strong)',
  },
  danger: {
    background: 'transparent',
    color: 'var(--color-danger-text)',
    border: '1px solid var(--color-danger-border)',
    hoverBg: 'var(--color-danger-bg-soft)',
  },
}

/* Press effect — feedback táctil */
<button
  style={{ transform: 'scale(1)', transition: 'all 150ms ease' }}
  onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)' }}
  onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
>
```

### FilterBar pills — upgrade

```jsx
/* FilterBar — pills con estilo más premium */
<div style={{
  display: 'flex',
  gap: '4px',
  padding: '4px',
  background: 'var(--color-surface-1)',
  border: '1px solid var(--color-border)',
  borderRadius: '10px',
}}>
  {filters.map((f) => (
    <button
      key={f.id}
      onClick={() => onChange(f.id)}
      style={{
        padding: '7px 16px',
        borderRadius: '7px',
        fontSize: '13px',
        fontWeight: active === f.id ? '600' : '400',
        transition: 'all 150ms ease',
        cursor: 'pointer',
        border: 'none',
        background: active === f.id
          ? 'var(--color-surface-3)'
          : 'transparent',
        color: active === f.id
          ? 'var(--color-text-primary)'
          : 'var(--color-text-muted)',
        boxShadow: active === f.id
          ? '0 1px 3px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
          : 'none',
      }}
    >
      {f.label}
      {f.count !== undefined && (
        <span style={{
          marginLeft: '6px',
          fontSize: '11px',
          fontWeight: '700',
          padding: '1px 6px',
          borderRadius: '999px',
          background: active === f.id ? 'var(--color-brand)' : 'var(--color-surface-3)',
          color: active === f.id ? '#fff' : 'var(--color-text-muted)',
        }}>
          {f.count}
        </span>
      )}
    </button>
  ))}
</div>
```

### Pagination — nuevo diseño

```jsx
/* Pagination corporativa */
<div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '12px 16px',
  borderTop: '1px solid var(--color-border)',
}}>
  <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
    Mostrando <strong style={{ color: 'var(--color-text-primary)' }}>{startItem}–{endItem}</strong> de {total}
  </p>

  <div style={{ display: 'flex', gap: '4px' }}>
    <button
      disabled={currentPage === 0}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--color-border)',
        background: 'var(--color-surface-1)',
        color: 'var(--color-text-secondary)',
        cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
        opacity: currentPage === 0 ? 0.4 : 1,
        transition: 'all 150ms ease',
      }}
    >
      ←
    </button>

    {/* Page numbers */}
    {pages.map(page => (
      <button
        key={page}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '6px',
          fontSize: '13px',
          fontWeight: page === currentPage ? '700' : '400',
          border: page === currentPage ? '1px solid var(--color-brand)' : '1px solid var(--color-border)',
          background: page === currentPage ? 'rgba(224,97,58,0.12)' : 'var(--color-surface-1)',
          color: page === currentPage ? 'var(--color-brand)' : 'var(--color-text-secondary)',
          cursor: 'pointer',
        }}
      >
        {page + 1}
      </button>
    ))}

    <button
      disabled={currentPage === totalPages - 1}
      style={{ /* mirror del prev */ }}
    >
      →
    </button>
  </div>
</div>
```

---

## 16. Login Page

### Rediseño del panel izquierdo

El panel izquierdo actual tiene texto de "100% Real-time, 0 papel, 24/7" en una lista. El rediseño lo convierte en algo más visual y corporativo.

```jsx
{/* Panel izquierdo — brand panel */}
<div style={{
  position: 'relative',
  background: 'linear-gradient(145deg, #1a0a04 0%, #0d0d0d 40%, #080808 100%)',
  padding: '48px',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}}>
  {/* Background decoration */}
  <div style={{
    position: 'absolute',
    top: '-60px',
    right: '-60px',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(224,97,58,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  }} />
  <div style={{
    position: 'absolute',
    bottom: '80px',
    left: '-40px',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(250,199,117,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
  }} />

  {/* Logo */}
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'auto' }}>
    <div style={{
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, var(--color-brand) 0%, #C9522E 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      fontWeight: '800',
      color: '#fff',
      boxShadow: '0 8px 24px rgba(224,97,58,0.40)',
    }}>
      H
    </div>
    <span style={{ fontSize: '20px', fontWeight: '800', color: '#F2F2F2', letterSpacing: '-0.02em' }}>
      Habita
    </span>
  </div>

  {/* Headline central */}
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
    <div>
      <p style={{
        fontSize: '11px',
        fontWeight: '600',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--color-brand)',
        marginBottom: '12px',
      }}>
        Gestión de alquileres
      </p>
      <h2 style={{
        fontSize: '36px',
        fontWeight: '800',
        color: '#F2F2F2',
        letterSpacing: '-0.03em',
        lineHeight: 1.1,
        marginBottom: '16px',
      }}>
        Todo bajo control, en un solo lugar
      </h2>
      <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)', lineHeight: 1.7, maxWidth: '380px' }}>
        Gestioná habitaciones, contratos y pagos de forma eficiente. Sin planillas, sin papel.
      </p>
    </div>

    {/* Features como chips */}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {['Cobros automatizados', 'Alertas de vencimiento', 'Reportes en tiempo real'].map(f => (
        <span key={f} style={{
          padding: '6px 14px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: '500',
          background: 'rgba(224,97,58,0.10)',
          color: 'var(--color-brand)',
          border: '1px solid rgba(224,97,58,0.20)',
        }}>
          {f}
        </span>
      ))}
    </div>
  </div>

  {/* Footer del panel */}
  <p style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
    © 2025 Habita
  </p>
</div>

{/* Panel derecho — formulario */}
<div style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '48px',
  background: 'var(--color-surface-1)',
}}>
  <div style={{ width: '100%', maxWidth: '360px' }}>
    <h1 style={{
      fontSize: '26px',
      fontWeight: '800',
      color: 'var(--color-text-primary)',
      letterSpacing: '-0.02em',
      marginBottom: '8px',
    }}>
      Bienvenido
    </h1>
    <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '32px' }}>
      Ingresá tus credenciales para continuar
    </p>

    {/* Form fields */}
    {/* ... */}

    {/* Submit button */}
    <button style={{
      width: '100%',
      height: '44px',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, var(--color-brand) 0%, #C9522E 100%)',
      color: '#fff',
      fontSize: '15px',
      fontWeight: '700',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(224,97,58,0.35)',
      transition: 'all 150ms ease',
    }}>
      Iniciar sesión
    </button>
  </div>
</div>
```

---

## 17. Componentes Adicionales Recomendados

### A. Toast/Notification system

Las operaciones CRUD actualmente solo muestran errores inline. Agregar un sistema de toasts para confirmaciones positivas (pago registrado, contrato creado, etc.):

```jsx
/* Toast component */
function Toast({ message, type = 'success', onClose }) {
  const cfg = {
    success: { bg: 'var(--color-success-bg-soft)', color: 'var(--color-success-text)', border: 'var(--color-success-border)', icon: '✓' },
    error:   { bg: 'var(--color-danger-bg-soft)',  color: 'var(--color-danger-text)',  border: 'var(--color-danger-border)',  icon: '✕' },
    info:    { bg: 'var(--color-info-bg-soft)',    color: 'var(--color-info-text)',    border: 'var(--color-info-border)',    icon: 'ℹ' },
  }[type]

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '10px',
      background: 'var(--color-surface-2)',
      border: `1px solid ${cfg.border}`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      animation: 'slide-in-right 250ms ease both',
      maxWidth: '380px',
    }}>
      <span style={{
        width: '24px',
        height: '24px',
        borderRadius: '50%',
        background: cfg.bg,
        color: cfg.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: '700',
        flexShrink: 0,
      }}>
        {cfg.icon}
      </span>
      <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', fontWeight: '500' }}>
        {message}
      </p>
      <button onClick={onClose} style={{ color: 'var(--color-text-muted)', marginLeft: 'auto', cursor: 'pointer' }}>
        <IconX />
      </button>
    </div>
  )
}
```

### B. Donut chart para ocupación en Dashboard

Reemplazar la progress bar de ocupación en el dashboard por un mini donut chart:

```jsx
/* Donut chart SVG — puro, sin dependencias */
function OccupancyDonut({ percentage, size = 80 }) {
  const r = 32
  const circumference = 2 * Math.PI * r
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        {/* Track */}
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--color-border-strong)" strokeWidth="6" />
        {/* Progress */}
        <circle
          cx="40" cy="40" r={r}
          fill="none"
          stroke="var(--color-brand)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 700ms ease-out' }}
        />
      </svg>
      {/* Label centrado */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}>
        <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--color-brand)', letterSpacing: '-0.02em' }}>
          {percentage}%
        </span>
      </div>
    </div>
  )
}
```

### C. Empty State mejorado

```jsx
/* EmptyState con ilustración SVG inline */
export function EmptyState({ title, description, action, onAction, icon }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 24px',
      gap: '16px',
    }}>
      {/* Icon container con glow */}
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '16px',
        background: 'var(--color-surface-2)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--color-text-muted)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      }}>
        {icon}
      </div>

      <div style={{ textAlign: 'center', maxWidth: '280px' }}>
        <p style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-text-primary)', marginBottom: '6px' }}>
          {title}
        </p>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
          {description}
        </p>
      </div>

      {action && (
        <button
          onClick={onAction}
          style={{
            padding: '8px 20px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '600',
            background: 'rgba(224,97,58,0.10)',
            color: 'var(--color-brand)',
            border: '1px solid rgba(224,97,58,0.20)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          {action}
        </button>
      )}
    </div>
  )
}
```

---

## 18. Hoja de Ruta de Implementación

### Prioridad y esfuerzo

| # | Cambio | Impacto Visual | Esfuerzo | Prioridad |
|---|--------|---------------|----------|-----------|
| 1 | **Sistema de color** — `index.css` nuevo | ★★★★★ | 1h | 🔴 Crítico |
| 2 | **Sidebar dark** — unificar colores | ★★★★★ | 3h | 🔴 Crítico |
| 3 | **KPI Cards** — tamaño display 32px, gradientes | ★★★★★ | 2h | 🔴 Crítico |
| 4 | **Topbar** — altura 64px, botón gradiente | ★★★★☆ | 1h | 🟠 Alto |
| 5 | **Dashboard hero** — banner de contexto | ★★★★☆ | 1h | 🟠 Alto |
| 6 | **TenantRow** — hover visible, botón sólido | ★★★★☆ | 1h | 🟠 Alto |
| 7 | **SectionLabel** — acento coral + peso | ★★★☆☆ | 30min | 🟠 Alto |
| 8 | **PaymentStatusBadge** — nuevo estilo | ★★★★☆ | 1h | 🟠 Alto |
| 9 | **Inputs/Forms** — fondo `surface-2`, focus | ★★★☆☆ | 1h | 🟡 Medio |
| 10 | **Modal** — header con gradiente | ★★★☆☆ | 1h | 🟡 Medio |
| 11 | **FilterBar** — pills con tab indicator | ★★★☆☆ | 1h | 🟡 Medio |
| 12 | **Pagination** — botones numerados | ★★☆☆☆ | 2h | 🟡 Medio |
| 13 | **Login page** — panel izquierdo redesigned | ★★★★☆ | 2h | 🟡 Medio |
| 14 | **HabitacionCard** — barra top, texto mayor | ★★★☆☆ | 2h | 🟡 Medio |
| 15 | **Animaciones stagger** — cards de entrada | ★★★☆☆ | 1h | 🟢 Bajo |
| 16 | **Toast notifications** | ★★★☆☆ | 3h | 🟢 Bajo |
| 17 | **Donut chart** — ocupación dashboard | ★★★☆☆ | 2h | 🟢 Bajo |
| 18 | **Counter animation** — KPI al cargar | ★★★☆☆ | 2h | 🟢 Bajo |
| 19 | **Empty states** — icon container polish | ★★☆☆☆ | 1h | 🟢 Bajo |
| 20 | **Pulse badge** — vencidos blinking dot | ★★☆☆☆ | 30min | 🟢 Bajo |

### Fase 1 — "El gran salto" (ítems 1–3, ~6h)

Solo los primeros 3 cambios transformarán radicalmente la percepción de la app. El sistema de color + sidebar dark + KPI cards a display size es suficiente para pasar de "app básica" a "herramienta corporativa".

**Resultado esperado**: La app pasa de parecer un proyecto personal a una herramienta SaaS profesional.

### Fase 2 — "Pulido corporativo" (ítems 4–10, ~8h)

Topbar, dashboard hero, tabla de pagos y badges actualizados le dan consistencia al diseño.

**Resultado esperado**: Cada pantalla respira con ritmo visual coherente.

### Fase 3 — "Experiencia premium" (ítems 11–20, ~12h)

Micro-interacciones, animaciones, toasts, gráficos y empty states elevan la experiencia de buena a memorable.

**Resultado esperado**: Usuarios dicen "esta app se siente rápida y bien hecha".

---

## Checklist de Accesibilidad

Antes de considerar el rediseño completo, verificar:

- [ ] Todo texto `var(--color-text-muted)` (#6B6B67) cumple ratio 4.6:1 ✓
- [ ] Todo texto `var(--color-text-secondary)` (#A0A09C) cumple ratio 5.2:1 ✓
- [ ] Botones de icono tienen mínimo 36x36px touch target
- [ ] Todos los botones de icono tienen `aria-label`
- [ ] Los badges de estado no usan solo color (también texto)
- [ ] `prefers-reduced-motion` respetado en todas las animaciones
- [ ] Foco visible en todos los elementos interactivos (keyboard nav)
- [ ] Modales tienen focus trap y retornan foco al cerrar
- [ ] Errores en formularios tienen `role="alert"`

---

*Documento generado: Junio 2025 | Stack: React 19 + Tailwind CSS v4 + Django | Proyecto: Habita*
