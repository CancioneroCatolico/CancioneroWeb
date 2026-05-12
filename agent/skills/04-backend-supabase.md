# 04 - Backend y Supabase

El backend del proyecto utiliza Supabase para la base de datos, autenticación y almacenamiento.

## 🗄️ Base de Datos (PostgreSQL)
- **Migraciones**: Todos los cambios de esquema deben documentarse en migraciones SQL.
- **RLS (Row Level Security)**: **OBLIGATORIO**. Ninguna tabla debe estar expuesta sin una política de seguridad adecuada.
  - Los usuarios solo pueden ver/editar sus propias listas de canciones.
  - Las canciones públicas son legibles por todos.
- **Tipos**: Genera siempre los tipos de TypeScript para la base de datos (`supabase gen types typescript`).

## 🔐 Autenticación
- Usamos Supabase Auth (Email/Password, Google).
- Asegúrate de que el estado de autenticación se maneje correctamente en el frontend para proteger las rutas privadas.

## ⚡ Edge Functions (Deno)
- Usa funciones de borde para lógica compleja que no deba estar en el cliente (ej. integraciones externas, procesamiento pesado).
- Mantén las funciones pequeñas y con una sola responsabilidad.

## 📦 Storage
- Usa buckets de Supabase para almacenar imágenes de portadas o archivos adjuntos si es necesario.
- Configura correctamente los permisos de lectura pública/privada.

## 🛠️ Buenas Prácticas
- No expongas la `service_role_key` en el frontend.
- Usa `anon_key` para operaciones normales desde el cliente.
- Implementa validación de datos tanto en el cliente como en la base de datos (Constraints).
