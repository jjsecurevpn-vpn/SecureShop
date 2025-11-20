# 🎨 Sistema de Diseño - Estilos Reutilizables

## 📋 Índice
1. [Paleta de Colores](#paleta-de-colores)
2. [Tipografía](#tipografía)
3. [Componentes Visuales](#componentes-visuales)
4. [Estilos Recurrentes](#estilos-recurrentes)
5. [Animaciones](#animaciones)

---

## 🎨 Paleta de Colores

### Colores Primarios
```
Indigo: #6366f1
  - Botones CTA principales
  - Links
  - Elementos destacados
  - Hover: #4f46e5

Verde (Emergencias): #10b981
  - Badges descuentos
  - Highlights positivos
  - Acentos secundarios

Rosa (Donaciones): #ec4899 o #f43f5e
  - Botón Donar
  - Elementos de donación
```

### Colores Neutrales
```
Blanco: #ffffff
  - Fondos principales
  - Texto en fondos oscuros

Gris 900 (Muy Oscuro): #1a1a1a
  - Fondos dark
  - PromoHeader
  - Summary sidebar

Gris 900 (Oscuro): #111827
  - Texto principal
  - Títulos

Gris 600: #4b5563
  - Texto secundario
  - Descripciones

Gris 200: #e5e7eb
  - Bordes
  - Separadores
  - Fondos light
```

### Colores por Contexto
```
Indigo Light: #e0e7ff (bg-indigo-50)
  - Fondos de badges
  - Fondos alternos

Purple Light: #f3f4f6 (bg-purple-50/30)
  - Fondos gradientes
  - Secciones hero

Emerald Light: #ecfdf5 (bg-emerald-50)
  - Estados activos
  - Highlights verdes

Rose Light: #fff1f2 (bg-rose-50)
  - Donaciones
  - Alertas positivas
```

### Gradientes
```
// Hero Sections
Hero: linear-gradient(to bottom, from-purple-200/50 via-purple-50/30 to-white)
PromoHeader: linear-gradient(to bottom, #1a1a1a 0%, #f3f4f6 100%)

// Tarjetas (Nuevo - sin borde)
Card Default: bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80
  - Aplicación: AboutPage, DonationSuccessPage, SponsorsPage (regular cards), etc
  - Características: Sutil, minimalista, sin bordes, sin sombras

// Tarjetas Glassmorphism (Nuevo)
Card Glassmorphism: bg-gradient-to-br from-white/60 to-white/40
  - Aplicación: Testimonios, características destacadas, elementos sobre gradientes
  - Características: Efecto glass sutil, backdrop-blur-sm, shadow-lg pronunciada
  - Combinar con: backdrop-blur-sm para efecto completo

// Tarjetas Destacadas (Nuevo - para resaltar)
Card Featured: bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-slate-800/90
  - Aplicación: Sponsor featured cards, secciones importantes, promociones
  - Características: Oscuro, contraste alto, texto blanco

// Tarjetas Alternativas
Card Featured Light: bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-indigo-700/90
  - Aplicación: Cards con glassmorphism, overlays en backgrounds
  - Características: Colorido, con efecto glassmorphism, texto blanco
```

---

## 🔤 Tipografía

### Escala y Pesos
```
h1: text-5xl md:text-6xl, font-bold (700)
h2: text-3xl md:text-4xl, font-bold (700)
h3: text-xl md:text-2xl, font-semibold (600)
Subtítulo: text-lg md:text-xl, font-semibold (600)
Párrafo: text-base md:text-lg, font-normal (400)
Label: text-sm, font-semibold (600)
Badge: text-[11px], uppercase, tracking-[0.3em], font-semibold (600)
Small: text-xs, font-normal (400)
```

### Colores de Texto
```
Primario: text-neutral-900 o text-gray-900
Secundario: text-gray-600 o text-gray-700
Terciario: text-gray-500
En blanco/dark: text-white
Links: text-indigo-600, hover:text-indigo-700
```

---

## 🧩 Componentes Visuales

### Badge / Chip
```tsx
// General
<span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-indigo-700">
  Contenido
</span>

// Con icon
<div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase text-emerald-200">
  <Sparkles className="h-4 w-4" />
  <span>Resumen</span>
</div>

// Descuento (Verde)
<span style={{
  backgroundColor: '#10b981',
  color: 'white',
  padding: '4px 10px',
  borderRadius: '4px',
  fontSize: '16px',
  fontWeight: 'bold',
  whiteSpace: 'nowrap'
}}>
  {descuento}%
</span>
```

### Card / Container

#### Tarjetas Estándar (Gradiente Indigo/Purple)
```tsx
// Card Default - Sin borde, solo gradiente (aplicado en AboutPage, DonationSuccessPage, etc)
<article className="rounded-lg bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80 p-5">
  {/* Contenido */}
</article>

// Características:
// - Rounded: rounded-lg (consistente)
// - Fondo: Gradiente sutil indigo → purple → blue con 80% opacidad
// - Sin bordes
// - Sin sombras
// - Sin efectos hover
// - Padding: p-5 (cards pequeñas) o p-6 (cards medianas)
```

#### Tarjeta Destacada (Gradiente Negro)
```tsx
// Card Featured - Gradiente oscuro para resaltar elementos importantes
<article className="rounded-lg bg-gradient-to-br from-slate-900/90 via-gray-900/90 to-slate-800/90 p-6 text-white">
  <h3 className="text-lg font-semibold text-white">{title}</h3>
  <p className="mt-2 text-sm text-gray-200">{description}</p>
</article>

// Características:
// - Rounded: rounded-lg (consistente con otras tarjetas)
// - Fondo: Gradiente negro/gris oscuro con 90% opacidad
// - Sin bordes
// - Texto blanco para contraste
// - Ideal para: Sponsor cards featured, secciones importantes, promociones
```

#### Tarjeta Light (Antiguo - mantener compatibilidad)
```tsx
// Card Light (Principal)
<div className="rounded-3xl border border-gray-200 bg-white/80 p-6 md:p-8 shadow-sm shadow-gray-100">
  {/* Contenido */}
</div>

// Card Purple (Onboarding)
<div className="rounded-2xl border border-purple-100 bg-white/70 p-5 shadow-sm shadow-purple-50">
  {/* Contenido */}
</div>

// Card Dark (Sidebar/Summary)
<div className="rounded-3xl bg-gray-900 p-6 md:p-8 text-white">
  {/* Contenido */}
</div>

#### Tarjeta de Estadísticas Hero (Transparente)
```tsx
// Card Stats Hero - Transparente con sombra diagonal sutil
<div className="flex flex-col items-center justify-center rounded-2xl px-4 py-3 shadow-[2px_4px_8px_-3px_rgba(0,0,0,0.08),-2px_4px_8px_-3px_rgba(0,0,0,0.08)]">
  {/* Contenido centrado */}
</div>

// Características:
// - Rounded: rounded-2xl (consistente)
// - Fondo: Completamente transparente (sin background)
// - Sin bordes
// - Sombra diagonal sutil desde costados hacia abajo
// - Ideal para: Estadísticas en heroes, elementos flotantes sobre gradientes
// - Aplicación: HeroReventa stats cards
```

#### Tarjeta de Testimonios/Características (Glassmorphism)
```tsx
// Card Testimonials/Features - Glassmorphism sutil con gradiente blanco
<article className="rounded-lg bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm p-5 sm:p-6 lg:p-8 xl:p-10 shadow-lg">
  {/* Contenido */}
</article>

// Características:
// - Rounded: rounded-lg (consistente)
// - Fondo: Gradiente sutil blanco con efecto glassmorphism (60% → 40% opacidad)
// - Backdrop blur: backdrop-blur-sm para efecto glass
// - Sombra: shadow-lg pronunciada para elevación
// - Sin bordes
// - Padding responsivo: p-5 en móvil, p-6 en sm, p-8 en lg, p-10 en xl
// - Ideal para: Testimonios, características, contenido destacado sobre gradientes
// - Aplicación: TestimoniosSection, tarjetas de características en AboutPage
```

### Botones

#### CTA Principal (Indigo)
```tsx
<button className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-indigo-700 shadow-lg hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300">
  Ver planes
  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
</button>
```

#### CTA Secundario (Border)
```tsx
<button className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-indigo-600 bg-white px-8 py-3.5 text-base font-semibold text-indigo-600 transition hover:bg-indigo-50 shadow-lg hover:shadow-xl">
  Ser revendedor
  <Users className="h-4 w-4" />
</button>
```

#### Botón Small (Comprar Plan)
```tsx
<button className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300">
  Continuar al pago
</button>
```

#### Botón Outline
```tsx
<button className="w-full rounded-2xl border border-white/20 px-6 py-4 text-base font-semibold text-white transition hover:border-white/40">
  Ver demo en vivo
</button>
```

#### Toggle/Selector
```tsx
// Container
<div className="inline-flex items-center gap-2 bg-gray-100 rounded-full p-1">
  {/* Items */}
</div>

// Item Activo
<button className="px-6 py-2 rounded-full font-medium transition bg-white text-gray-900 shadow-sm">
  Activo
</button>

// Item Inactivo
<button className="px-6 py-2 rounded-full font-medium transition text-gray-600 hover:text-gray-900">
  Inactivo
</button>
```

#### Selector de Opciones (Días/Dispositivos)
```tsx
<button className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
  isActive
    ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm"
    : "border-gray-200 bg-white text-gray-900 hover:border-gray-300"
}`}>
  {label}
</button>
```

---

## 📐 Estilos Recurrentes

### Sombras
```
Card Light: shadow-sm shadow-gray-100
Card Principal: shadow-lg hover:shadow-xl
Botón: shadow-lg hover:shadow-xl
Sin sombra: shadow-sm o sin shadow
Sombra diagonal sutil: shadow-[2px_4px_8px_-3px_rgba(0,0,0,0.08),-2px_4px_8px_-3px_rgba(0,0,0,0.08)]
  - Aplicación: Tarjetas transparentes sobre gradientes, elementos flotantes
Sombra glassmorphism: shadow-lg
  - Aplicación: Tarjetas con efecto glass (from-white/60 to-white/40 + backdrop-blur-sm)
  - Características: Elevación pronunciada para contraste con fondos translúcidos
```

### Bordes
```
Estándar: border border-gray-200
Light: border border-gray-100
Oscuro: border border-gray-300
Color: border border-indigo-200, border border-purple-100
Grueso: border-2 (selectores)
```

### Border Radius
```
Full/Pill: rounded-full (botones, chips)
Grande: rounded-3xl (cards principales)
Medio: rounded-2xl (cards secundarias)
Pequeño: rounded-xl o rounded-lg (inputs)
```

### Espaciado
```
Gaps:
- gap-2 (pequeño)
- gap-4 (medio)
- gap-6 (grande)
- gap-8 (muy grande)

Padding:
- px-4 py-2 (botones pequeños)
- px-6 py-3 (botones medianos)
- px-8 py-3.5 (botones grandes)
- p-5 o p-6 (cards pequeñas)
- p-6 md:p-8 (cards grandes)

Margin:
- mt-4, mt-6, mt-8 (vertical spacing)
- mb-4, mb-6, mb-8 (vertical spacing)
```

### Opacidad
```
Backgrounds con opacidad:
- bg-white/70 (70% white)
- bg-white/80 (80% white)
- bg-white/10 (10% white)
- bg-indigo-50/80

Bordes con opacidad:
- border-white/10 (10% white)
- border-white/20 (20% white)
```

---

## ✨ Animaciones

### Transiciones Estándar
```tsx
// Hover suave
transition hover:bg-indigo-700

// Con duración específica
transition duration-150 ease-in-out
transition duration-200 ease-in-out

// Color change
text-gray-600 hover:text-gray-900 transition-colors duration-150
```

### Focus States
```tsx
focus-visible:outline focus-visible:outline-2 
focus-visible:outline-offset-2 
focus-visible:outline-emerald-500
```

### Slide Up Animation (PromoHeader Close)
```css
@keyframes slideUpOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-100%);
  }
}

.promo-banner-closing {
  animation: slideUpOut 0.3s ease-in-out forwards;
}
```

### Group Animations (CTA Buttons)
```tsx
<button className="group ...">
  Texto
  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
</button>
```

---

## 📱 Responsive Clases

```
Cambio de tamaño:
- text-base md:text-lg
- px-4 md:px-8
- p-5 md:p-8
- text-5xl md:text-6xl

Layout mobile-first:
- hidden md:block (oculto mobile, visible desktop)
- block md:hidden (visible mobile, oculto desktop)
- flex-col md:flex-row (stack mobile, row desktop)
- grid-cols-1 md:grid-cols-3 (1 col mobile, 3 desktop)

Grid especiales:
- lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] (70/30 split)
- md:sticky md:top-24 md:h-fit (sidebar sticky en desktop)
- md:ml-14 (margen para sidebar)
```

---

## 💡 Ejemplos Comunes

### Header Section
```tsx
<div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-purple-700 mb-6">
  <span>Planes VPN</span>
</div>
<h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
  Elige tu plan
</h1>
<p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
  Descripción aquí
</p>
```

### Info Section
```tsx
<div className="mb-6 flex flex-wrap items-center justify-between gap-4">
  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-500">Paso 1</p>
    <h3 className="text-xl font-semibold text-gray-900">Título</h3>
    <p className="text-sm text-gray-500">Descripción</p>
  </div>
  <span className="text-sm text-gray-500">Nota secundaria</span>
</div>
```

### Grid de Cards
```tsx
<div className="grid gap-4 md:grid-cols-3">
  {items.map((item) => (
    <div key={item.id} className="rounded-2xl border border-gray-200 bg-white/80 p-6">
      {/* Contenido */}
    </div>
  ))}
</div>
```

### Icon con Texto
```tsx
<div className="flex items-center gap-2">
  <Sparkles className="h-4 w-4 text-purple-500" />
  <span className="text-sm font-semibold">Texto</span>
</div>
```

---

## ✅ Checklist de Estilos para Componentes Nuevos

- [ ] Colores de paleta definida (indigo, verde, gris)
- [ ] Tipografía según escala (h1, p, label)
- [ ] Cards: usar gradiente sutil sin bordes (bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-blue-50/80), glassmorphism (from-white/60 to-white/40 + backdrop-blur-sm + shadow-lg) para elementos destacados, o transparente con sombra diagonal para elementos flotantes
- [ ] Botones CTA con indigo `#6366f1`
- [ ] Hover states definidos
- [ ] Focus visible para accesibilidad
- [ ] BorderRadius correcto (rounded-full, rounded-3xl, rounded-2xl)
- [ ] Spacing consistente (gap-4, px-6, py-3)
- [ ] Shadow solo donde sea necesario (shadow-lg para glassmorphism, sombras diagonales sutiles para elementos flotantes)
- [ ] Responsive mobile-first
- [ ] Animaciones smooth con transition
