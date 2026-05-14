# 03 - Lógica de Dominio (Acordes y Canciones)

Esta sección cubre el núcleo funcional del proyecto: el procesamiento de música.

## 🎵 Sistema de Acordes
- **Formato**: Usamos cifrado americano (A, B, C, D, E, F, G).
- **Enarmonías**: Manejar siempre equivalencias enarmónicas (ej. C# = Db) usando mapeos predefinidos (`SHARP_TO_FLAT`). Evitar concatenaciones crudas (evitar "DO5 5"); procesar los nombres combinando limpiamente la `Raíz` y la `Calidad/Tipo`.
- **Variantes y Posiciones**: Un mismo acorde puede tener múltiples posiciones en el diapasón. La estructura de datos de un acorde incluye `variants` (o posiciones), y cada variante maneja cuerdas mudas (`-1`), trastes pisados, cejillas (`barres`) con rangos de cuerdas, y dedos específicos.
- **Parseo**: La lógica reside en `client/src/utils/chordParser.ts`.
- **Renderizado**:
  - Los acordes sobre el texto se renderizan en `LineaCancion.tsx`.
  - Los diagramas interactivos se renderizan en `ChordDiagram.tsx`.
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

