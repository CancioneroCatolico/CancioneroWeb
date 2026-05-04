# 03 - Lógica de Dominio (Acordes y Canciones)

Esta sección cubre el núcleo funcional del proyecto: el procesamiento de música.

## 🎵 Sistema de Acordes
- **Formato**: Usamos cifrado americano (A, B, C, D, E, F, G).
- **Parseo**: La lógica reside en `client/src/utils/chordParser.ts`.
- **Renderizado**:
  - Los acordes se renderizan sobre la línea de texto (`LineaCancion.tsx`).
  - **Letras**: Soporte para **Negrita** usando sintaxis Markdown (`**texto**`). El renderizador debe separar los fragmentos y aplicar `<strong>`.

## 🔄 Transporte (Transposition)
- El transporte cambia la tonalidad de la canción sin cambiar la letra original.
- **Tono Elegido**: Cada canción en una lista puede tener un `tonoElegido` o transporte guardado.
- El valor se guarda como un offset numérico relativo al `tonoBase`.

## 📝 Estructura de Datos
- **Canción**: Objeto con `titulo`, `autor`, `letra` (array de strings), `tonoBase`.
- **Listas (Setlists)**: 
  - Estructura jerárquica: Lista -> Secciones -> Canciones.
  - **IDs**: Usa `crypto.randomUUID()` o `Date.now()` para generar `idUnicoEnLista`. Esto permite tener la misma canción varias veces en la misma lista con configuraciones distintas.

## 🔍 Búsqueda y Filtrado
- **Sincronización**: Usa `BusquedaContext` para que el Navbar y la página de Resultados estén siempre alineados.
- **Local vs Global**: La búsqueda principal consulta la API, pero el filtrado de listas personales debe ser local y fluido.

