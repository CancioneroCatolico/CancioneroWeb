# 04 - Backend y Base de Datos (MongoDB)

El backend de este proyecto utiliza una arquitectura basada en **Node.js** y **MongoDB** como base de datos principal, dejando atrás plataformas BaaS como Supabase.

## 🗄️ Base de Datos (MongoDB)
- **Documentos vs Relacional**: Adoptamos un diseño orientado a documentos. Los esquemas deben ser flexibles pero controlados (usando Mongoose u ODM similar si corresponde).
- **Tipos de TypeScript**: Asegúrate de tener las interfaces de TypeScript alineadas con los esquemas de la base de datos para mantener el tipado estricto (`Types.ObjectId`, documentos de canciones, listas, usuarios).

## 🚀 Peticiones y API
- La comunicación entre el frontend (React) y el backend se realiza vía endpoints de la API oficial definida en `import.meta.env.VITE_API_URL`.
- **Estructura**: Sigue patrones RESTful estándar.
- Las consultas a la base de datos deben estar optimizadas, utilizando índices cuando sea necesario para búsquedas rápidas (ej. búsquedas por título o autor de canción).

## 🔐 Autenticación
- El manejo de sesiones y JWT (o el método elegido) debe respetarse e integrarse limpiamente con los headers en las llamadas de Axios o Fetch en el frontend.
- Proteger rutas en el cliente si es necesario, validando primero si existe un token de sesión válido en almacenamiento.

## 🛠️ Buenas Prácticas
- No asumas la existencia de funcionalidades "mágicas" como Row Level Security (RLS) en el frontend. La validación de permisos de acceso debe estar asegurada por la lógica del Backend en cada endpoint (ej. un usuario solo puede editar sus propias listas).
