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

## 🧩 Componentes y Clases Útiles
Usa las clases predefinidas en `index.css`:
- `.card`: Contenedores con bordes y sombras.
- `.btn-primary`: Botones de acción principal.
- `.modal-overlay` y `.modal-content`: Para diálogos y selectores.

## 📂 Estados Vacíos y Errores
- **Empty States**: Cuando no haya resultados o listas, muestra un mensaje amigable y una invitación a la acción (ej: "No tienes listas aún. ¡Crea una!").
- **Errores**: Muestra estados de error claros si la API falla, permitiendo reintentar.

