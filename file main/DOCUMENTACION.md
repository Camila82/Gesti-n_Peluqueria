# M&M Petshop — Boceto de sitio web

Boceto funcional (HTML + CSS + JS) para la peluquería canina y felina **M&M Petshop**, construido a partir de la estructura de páginas que compartiste (Inicio, Categoría/Servicios, Listado/Galería, Contacto) y de la paleta del logo, en tonos apagados.

## 1. Stack y software usado

| Capa | Herramienta | Motivo |
|---|---|---|
| Estructura | HTML5 semántico | Accesible, sin dependencias de build |
| Estilos | CSS3 puro (variables CSS, Grid/Flexbox) | Ligero, fácil de mantener, sin preprocesador obligatorio |
| Tipografía | Google Fonts: **Fredoka** (títulos, redondeada y amigable) + **Nunito Sans** (texto, muy legible) | Personalidad cercana sin perder formalidad |
| Interactividad | JavaScript vainilla (`main.js`) | Menú móvil, filtros de galería, validación de formulario, animaciones de aparición |
| Iconografía | Emoji + espacio reservado para set de iconos (Font Awesome / Lucide) | El boceto usa emoji como placeholder; en producción se recomienda un set SVG consistente |
| Mapa | Google Maps embed (iframe) | Igual que el `contact.html` original |
| Recomendado para producción | Bootstrap 5 *(opcional)* o un framework como Astro/Next si el sitio crecerá, más un gestor de formularios (Formspree, EmailJS) para el envío real de correos | El boceto no requiere backend, pero el formulario ya está listo para conectarse a uno |

**Estructura de carpetas entregada:**
```
mm-petshop/
├── index.html          → Inicio
├── servicios.html       → Catálogo de servicios (antes category.html)
├── galeria.html          → Galería con filtros (antes listing.html)
├── contacto.html         → Formulario + mapa (antes contact.html)
├── assets/
│   ├── css/style.css     → Sistema de diseño completo
│   ├── js/main.js        → Menú, filtros, validación, animaciones
│   └── images/            → Carpeta para tus fotos reales
└── DOCUMENTACION.md      → Este archivo
```

## 2. Paleta de color (apagada, a partir del logo)

| Uso | Color | Hex |
|---|---|---|
| Morado principal | Plum | `#5C4E82` |
| Morado oscuro (fondos, footer) | Plum dark | `#453A63` |
| Teal principal | Teal | `#3F8C89` |
| Teal oscuro | Teal dark | `#2E6A68` |
| Acento cálido (cinta del logo) | Coral | `#D98872` |
| Coral hover | Coral dark | `#C06E58` |
| Fondo general | Cream | `#F6F3F1` |
| Fondo alterno | Cream soft | `#EFEAE6` |
| Texto principal | Ink | `#2B2436` |

La idea: mantener el degradado morado→teal del logo como identidad (header, hero, franjas), pero desaturado para que funcione en bloques grandes de UI sin cansar la vista, con el coral como único acento "de acción" (botones, precios, etiquetas).

## 3. Wireframes (ASCII)

### 3.1 Inicio (`index.html`)
```
┌─────────────────────────────────────────────┐
│ LOGO   Inicio Servicios Galería Contacto  📞 │  ← header sticky
├─────────────────────────────────────────────┤
│  HERO (degradado morado→teal)                │
│  Título + texto        [Tarjeta con imagen]  │
│  [Agenda cita] [Ver servicios]   "Cupos hoy"  │
│  Stats: mascotas · rating · años              │
├─────────────────────────────────────────────┤
│  Servicios destacados (3 tarjetas)            │
├─────────────────────────────────────────────┤
│  Por qué elegirnos (franja de 4 puntos)       │
├─────────────────────────────────────────────┤
│  Testimonios (3 tarjetas con estrellas)       │
├─────────────────────────────────────────────┤
│  CTA final (banda degradada) → WhatsApp       │
├─────────────────────────────────────────────┤
│  FOOTER: marca · navegación · contacto        │
└─────────────────────────────────────────────┘
```

### 3.2 Servicios (`servicios.html`)
```
┌─────────────────────────────────────────────┐
│ Header                                       │
├─────────────────────────────────────────────┤
│  Cabecera de página (degradado) + breadcrumb  │
├─────────────────────────────────────────────┤
│  Grilla 3×3 de tarjetas de servicio           │
│  [ícono] Nombre / descripción / precio desde  │
├─────────────────────────────────────────────┤
│  CTA "¿No sabes qué servicio necesitas?"      │
├─────────────────────────────────────────────┤
│  Footer                                       │
└─────────────────────────────────────────────┘
```

### 3.3 Galería (`galeria.html`)
```
┌─────────────────────────────────────────────┐
│ Header                                       │
├─────────────────────────────────────────────┤
│  Cabecera de página + breadcrumb              │
├─────────────────────────────────────────────┤
│  Filtros: [Todos][Perros][Gatos][Spa]         │
│  Grilla 3 columnas de tarjetas con foto/tag   │
├─────────────────────────────────────────────┤
│  CTA "Agenda ahora"                           │
├─────────────────────────────────────────────┤
│  Footer                                       │
└─────────────────────────────────────────────┘
```

### 3.4 Contacto (`contacto.html`)
```
┌─────────────────────────────────────────────┐
│ Header                                       │
├─────────────────────────────────────────────┤
│  Cabecera de página + breadcrumb              │
├─────────────────────────────────────────────┤
│  [ Formulario de contacto ] │ [ Info + mapa ] │
│  Nombre/Tel · Correo · Mascota · Servicio     │
│  Mensaje · Enviar → mensaje de confirmación   │
├─────────────────────────────────────────────┤
│  Footer                                       │
└─────────────────────────────────────────────┘
```

En móvil, todas las secciones pasan a una sola columna y el menú se colapsa en un botón ☰.

## 4. Requisitos funcionales

1. El usuario puede navegar entre Inicio, Servicios, Galería y Contacto desde un menú persistente en todas las páginas.
2. El usuario puede iniciar una conversación de WhatsApp desde el botón flotante, el botón del header o el CTA final, en cualquier página.
3. El usuario puede ver el catálogo de servicios con nombre, descripción breve y precio desde.
4. El usuario puede filtrar la galería de trabajos por "Perros", "Gatos" o "Spa & extras" sin recargar la página.
5. El usuario puede enviar un formulario de contacto indicando nombre, teléfono, tipo de mascota, servicio de interés y mensaje.
6. El sistema valida en el navegador que nombre, teléfono, mensaje y al menos un tipo de mascota estén diligenciados antes de "enviar", y muestra un mensaje de error o confirmación en pantalla.
7. El usuario puede ver la ubicación del negocio en un mapa embebido dentro de la página de contacto.
8. El menú de navegación se colapsa en un botón de menú en pantallas angostas (móvil).
9. El año del footer se actualiza automáticamente.

## 5. Requisitos no funcionales

1. **Responsive:** el sitio debe verse correctamente desde 360px (móvil) hasta pantallas de escritorio anchas, usando CSS Grid/Flexbox con puntos de quiebre en 720px y 960px.
2. **Rendimiento:** sin frameworks pesados; CSS y JS propios sin dependencias externas más allá de Google Fonts, para tiempos de carga rápidos.
3. **Accesibilidad:** contraste adecuado texto/fondo, foco visible en campos de formulario, atributos `aria-label`/`aria-expanded` en el menú móvil, y respeto a `prefers-reduced-motion`.
4. **Mantenibilidad:** paleta y tipografía centralizadas en variables CSS (`:root`) para poder ajustar colores o fuentes desde un solo lugar.
5. **Compatibilidad:** HTML5/CSS3/ES5+ compatibles con los navegadores modernos más usados (Chrome, Safari, Edge, Firefox) en sus últimas dos versiones.
6. **Consistencia visual:** mismo header, footer y sistema de botones reutilizados en las 4 páginas para una identidad de marca coherente.
7. **Escalabilidad:** estructura de carpetas preparada para agregar imágenes reales (`assets/images/`) sin tocar el HTML, y para conectar el formulario a un servicio real de envío de correos (Formspree, EmailJS, o backend propio) sin rediseñar la interfaz.

## 6. Próximos pasos sugeridos

- Reemplazar los íconos/emoji y bloques de color por fotografías reales de la peluquería y de mascotas atendidas.
- Conectar el formulario de contacto a un servicio de envío real (por ejemplo Formspree o un backend propio).
- Reemplazar el logo emoji por el archivo del logo real en `assets/images/`.
- Si el catálogo de servicios crecerá o cambiará seguido, considerar mover los datos de servicios/galería a un pequeño archivo JSON y renderizarlos con JS, en lugar de HTML estático.

## 7. Cambios de la versión 2 (reglas de negocio)

Correcciones hechas tras la auditoría del diseño (documento técnico final). Las reglas están en un solo archivo nuevo, `reglas.js`, que usan todas las páginas.

- **Servicios faltantes:** se agregaron al catálogo "Baño y corte", "Baño medicado" y "Baño gato", que aparecían en citas pero no existían. Cada cita guarda ahora el `serviceId`, además del nombre.
- **Historial protegido:** los servicios y empleados ya no se borran, se **desactivan**. Dejan de ofrecerse en nuevas reservas, pero las citas pasadas conservan su servicio y su profesional. Un empleado con citas pendientes o confirmadas no se puede desactivar hasta reasignarlas o cancelarlas. Las citas completadas no se pueden eliminar.
- **Estados de la cita:** Pendiente → Confirmada o Cancelada; Confirmada → Completada o Cancelada. **Completada y Cancelada son finales**: una cita cancelada no se puede completar y una completada no se puede cancelar.
- **Hora de la cita:** las citas guardan `time` (HH:MM). El botón 📲 de cada reserva arma el mensaje de confirmación con la plantilla del negocio y reemplaza `{cliente}`, `{mascota}`, `{fecha}`, `{hora}` y `{empleado}`.
- **Choque de horario:** un peluquero no puede tener dos citas activas que se crucen, sea el mismo servicio u otro. Se usa la duración de cada servicio (por ejemplo, un baño de 60 min a las 10:00 ocupa hasta las 11:00).
- **Horario de atención:** lunes a sábado de 9:00 a 18:00, franjas de 30 minutos, al menos 1 hora de anticipación, y el servicio debe terminar antes del cierre.
- **Especie:** los servicios indican si aplican a perros, gatos o ambos (por ejemplo, "Baño gato" solo para gatos).
- **Migración automática:** si un navegador ya tenía datos guardados de la versión anterior, al abrir cualquier página se actualizan solos a la versión 2 sin perder nada.
