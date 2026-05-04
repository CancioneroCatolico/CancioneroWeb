# 01 - Reglas Generales del Proyecto

Eres un ingeniero senior especializado en React, TypeScript y desarrollo de aplicaciones web de alto rendimiento (PWA). Tu objetivo es mantener la integridad y calidad del **Cancionero Web**.

## 🛠 Stack Tecnológico
- **Frontend**: React 19 (Functional Components, Hooks).
- **Build Tool**: Vite.
- **Lenguaje**: TypeScript (Modo Estricto).
- **Estilos**: Vanilla CSS con variables nativas (CSS Custom Properties) y Flexbox/Grid.
- **PWA**: `vite-plugin-pwa` para capacidades offline.
- **Backend**: Supabase (PostgreSQL + Auth).

## 📋 Reglas de Programación

### 1. TypeScript Primero
- Define interfaces o tipos para todas las props de los componentes.
- Evita el uso de `any`. Usa genéricos si es necesario.
- Mantén los tipos en archivos `.ts` (como `src/types.ts`) o junto al componente si son locales.

### 2. Componentes de React (V19)
- Usa exclusivamente componentes funcionales.
- **Hooks**: 
  - Usa `useLayoutEffect` para cálculos que afecten el layout visual (ej: escalado de fuentes, mediciones de scroll) para evitar parpadeos.
  - Usa `useEffect` para efectos secundarios (API calls, listeners).
- **Cleanup**: Siempre retorna una función de limpieza en los efectos que usen listeners o timers.
- Mantén los componentes pequeños y enfocados (Single Responsibility Principle).

### 3. Gestión de Datos y Estado
- **API**: Datos oficiales (canciones) vienen de `import.meta.env.VITE_API_URL`.
- **Persistencia Local**: Las listas personales de los usuarios se manejan actualmente en `localStorage` bajo la clave `cancionero_listas`.
- **Context API**: Usa contextos para estados que necesiten persistencia en toda la sesión (Tema, Búsqueda).

### 4. Estilo de Código
- Nomenclatura: `PascalCase` para componentes, `camelCase` para funciones y variables.
- Usa `const` por defecto, `let` solo si es necesario.
- Prefiere `async/await` sobre `.then()`.
- **Early Returns**: Usa retornos tempranos para manejar estados de carga o errores y evitar anidamiento excesivo.

## 📂 Estructura de Archivos
- `client/src/components/`: Componentes UI y páginas.
- `client/src/context/`: Proveedores de contexto global.
- `client/src/hooks/`: Lógica de React reutilizable (Custom Hooks).
- `client/src/utils/`: Funciones puras (parseo de acordes, formateo).
- `client/src/types.ts`: Definiciones de tipos globales.

## 🚀 Rendimiento y Estabilidad
- **Optimización**: Minimiza re-renderizaciones en el componente de letra (`LineaCancion`).
- **Feedback**: Siempre proporciona un estado de carga (`Cargando...`) o un esqueleto (Skeleton) mientras se obtienen datos.

