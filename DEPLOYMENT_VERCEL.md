# Despliegue independiente en Vercel

ReciConti se compila con Vite + TanStack Start + Nitro. Lovable no es necesario para construir ni alojar la aplicación; Supabase sigue siendo el backend y debe continuar accesible desde el proyecto.

## Conectar GitHub
1. En Vercel, importa `martinaburtoe-art/reci-constitucion`.
2. Usa la raíz del repositorio como Root Directory.
3. Framework: TanStack Start (la detección se define en `vercel.json`).
4. Deja que Vercel detecte el comando de instalación y compilación.

## Variables de entorno
Configura en Vercel, para Production, Preview y Development según corresponda:
- `VITE_SUPABASE_URL`: URL pública del proyecto Supabase.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: clave publicable de Supabase.
- `SUPABASE_URL`: URL del proyecto, para los handlers del servidor.
- `SUPABASE_PUBLISHABLE_KEY`: clave publicable, para autenticación del servidor.
- `SUPABASE_SERVICE_ROLE_KEY`: clave de servicio, solo en servidor; nunca usar prefijo `VITE_`.
- `OPENAI_API_KEY`: clave del proveedor de IA para la cámara; es opcional para el resto de la app, pero necesaria para clasificación con IA.

No copiar valores reales a GitHub ni al chat. La clave de servicio debe mantenerse como variable sensible y nunca aparecer en código del cliente.

## Datos y migraciones
La app usa el proyecto Supabase existente. Antes de publicar, aplicar las migraciones pendientes en orden y confirmar que el proyecto de base de datos corresponde a ReciConti. La migración `0004_public_impact_metrics.sql` agrega una función que solo expone métricas agregadas y no devuelve datos personales. Ejecuta las migraciones mediante el flujo administrativo autorizado, no desde el navegador de producción.

## Verificación obligatoria
Después de configurar variables y conectar GitHub:
- Confirmar que el deployment queda en estado Ready.
- Probar inicio/cierre de sesión y permisos de /admin.
- Probar agregar y editar puntos, importación CSV/GeoJSON, foto y enlace WhatsApp.
- Probar registro offline, sincronización, denuncia y cambio de estado con push en un teléfono real.
- Probar /impacto con métricas disponibles.
- Probar cámara con `OPENAI_API_KEY` configurada.
