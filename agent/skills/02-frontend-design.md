# 02 - Diseño Frontend, UI y UX

El **Cancionero Web** no es solo una lista de canciones; es una herramienta para músicos en vivo. El diseño debe ser impecable, profesional y extremadamente funcional.

## 🎨 Estética Premium
- **Vibe**: Moderno, limpio y "Premium".
- **Glassmorphism**: Usa `backdrop-filter: blur(10px)` y `background-color: var(--nav-bg)` para elementos flotantes.
- **Transiciones**: Todas las interacciones deben tener transiciones suaves (`transition: all 0.2s ease`).
- **Sombras**: Usa sombras sutiles y profundas (`box-shadow: 0 4px 6px var(--card-shadow)`).
- **Animaciones**: 
  - Usa animaciones de entrada (`fadeIn`, `slideUp`) para modales y elementos dinámicos.
  - Implementa micro-interacciones (cambios sutiles de escala al hacer clic en botones).

## 📱 Sensación de Aplicación Nativa Premium (Mobile-First)
- **Deslizamiento (Touch & Scroll)**: 
  - Para listas horizontales (ej. selectores de notas/filtros), usa `display: flex`, `overflow-x: auto` y oculta la barra de desplazamiento (`::-webkit-scrollbar { display: none; }`).
  - Implementa `scroll-snap-type: x mandatory` y `scroll-snap-align: center` para un deslizamiento fluido y centrado con el dedo.
- **Responsividad Absoluta**: NUNCA utilices medidas fijas en píxeles rígidos (ej: `width: 300px`). Confía siempre en Flexbox, CSS Grid, porcentajes (`%`) y unidades relativas (`rem`, `vw`) para que la UI se adapte desde celulares hasta monitores ultra-anchos. En PC, los carruseles horizontales pueden convertirse en grids o `flex-wrap` para aprovechar el espacio.
- **Navegación Intuitiva (React Router)**: 
  - Cuando simules botones "Atrás" en la interfaz (`<Link>` o `navigate`), usa la propiedad `replace` o `replace: true` para ir hacia una vista superior (ej. de Guitarra a Biblioteca). Esto evita que el historial de navegación crezca infinitamente (apilando entradas) y respeta la acción del botón o gesto físico de "atrás" del teléfono.

## 🌙 Sistema de Temas (Dark Mode)
- El proyecto soporta modo claro y oscuro vía la clase `.dark` en el `body`.
- **SIEMPRE** usa las variables CSS definidas en `index.css`.
- **Nunca** hardcodees colores hexadecimales.

## 🎸 UX para Músicos
- **Legibilidad**: El modo "En Vivo" debe ser sagrado. Sin distracciones, contraste alto.
- **Interacciones Táctiles**: 
  - Botones de al menos 44x44px para evitar errores en el escenario.
  - Desactiva el `user-select` en la letra durante el modo en vivo para evitar selecciones accidentales.
- **Feedback Visual**: Implementa Toasts (como el componente `Toast` en `DetalleCancion`) para confirmar acciones (ej: "Añadida a lista").

## 🧩 Componentes, Iconos y Recursos Visuales
Usa las clases predefinidas en `index.css`:
- `.card`: Contenedores con bordes y sombras.
- `.btn-primary`: Botones de acción principal.
- `.modal-overlay` y `.modal-content`: Para diálogos y selectores.

**Iconos e Imágenes**:
- Para iconos simples de la UI, prefiere **SVGs en línea** (stroke-based) coloreados con `currentColor` para heredar estilos.
- Para ilustraciones elaboradas provistas por el usuario (PNGs o vectores exportados complejos), usa la etiqueta `<img>` y almacénalos en `client/public/icons/`. Intentar colorear SVGs exportados por software de trazado automático suele fallar si no tienen áreas sólidas separadas.

## 📂 Estados Vacíos y Errores
- **Empty States**: Cuando no haya resultados o listas, muestra un mensaje amigable y una invitación a la acción (ej: "No tienes listas aún. ¡Crea una!").
- **Errores**: Muestra estados de error claros si la API falla, permitiendo reintentar.

