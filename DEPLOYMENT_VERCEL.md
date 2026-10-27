# Despliegue independiente en Vercel

ReciConti se compila con Vite + TanStack Start + Nitro. Lovable no es necesario para construir ni alojar la aplicación; Supabase sigue siendo el backend y debe continuar accesible desde el proyecto.

## Conectar GitHub
1. En Vercel, importa `martinaburtoe-art/reci-constitucion`.
2. Usa la raíz del repositorio como Root Directory.
3. Framework: TanStack Start (la detección se define en `vercel.json`).
4. Deja que Vercel detecte el comando de instalación y compilación.
5. En Supabase → Authentication → URL Configuration, define la URL de producción de Vercel como Site URL y agrega las URL de producción y preview necesarias a Redirect URLs.

## Variables de entorno
Configura en Vercel, para Production, Preview y Development según corresponda:
- `VITE_SUPABASE_URL`: URL pública del proyecto Supabase.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: clave publicable de Supabase.
- `SUPABASE_URL`: URL del proyecto, para los handlers del servidor.
- `SUPABASE_PUBLISHABLE_KEY`: clave publicable, para autenticación del servidor.
- `SUPABASE_SERVICE_ROLE_KEY`: clave de servicio, solo en servidor; nunca usar prefijo `VITE_`.
- `OPENAI_API_KEY`: clave del proveedor de IA para la cámara; es opcional para el resto de la app, pero necesaria para clasificación con IA.

No copiar valores reales a GitHub ni al chat. La clave de servicio debe mantenerse como variable sensible y nunca aparecer en código del cliente.

## Google OAuth (backend independiente)

Este proyecto usa el proveedor OAuth de **su propio proyecto Supabase**; no usa el broker de autenticación de Lovable.

1. En Supabase → Authentication → URL Configuration, configura como **Site URL** `https://reci-constitucion.vercel.app`.
2. En **Redirect URLs**, agrega `https://reci-constitucion.vercel.app/**`. Para probar despliegues de preview, agrega el dominio de preview exacto que entrega Vercel o una regla wildcard de preview compatible con la configuración de Supabase.
3. En Google Cloud Console, crea o usa un OAuth Client de tipo **Web application** y registra esta URI en **Authorized redirect URIs**:
   `https://qajygywlobkdhdatixtg.supabase.co/auth/v1/callback`
4. En Supabase → Authentication → Sign In / Providers → Google, habilita Google y pega el **Client ID** y el **Client Secret** de Google Cloud. No guardes el secreto en GitHub ni en variables `VITE_*`.
5. Guarda la configuración y prueba desde la URL de producción. El navegador debe salir hacia el endpoint `/auth/v1/authorize` de este proyecto Supabase y volver a la URL de ReciConti, no a un dominio de Lovable.

Si Google no está habilitado o faltan sus credenciales, el código de la app muestra un mensaje de fallback; eso no sustituye la configuración del proveedor en Supabase.

## Primera cuenta administradora

La primera cuenta con rol `super_admin` se debe habilitar una sola vez desde el SQL Editor de Supabase, después de registrar esa cuenta en la app. Reemplaza el correo por el correo de inicio de sesión real y revisa el usuario antes de ejecutar:

```sql
insert into public.user_roles (user_id, role)
select u.id, 'super_admin'
from auth.users u
where u.email = 'REEMPLAZA_POR_TU_CORREO'
  and not exists (
    select 1 from public.user_roles r
    where r.user_id = u.id and r.role = 'super_admin'
  );
```

No publiques el correo ni ejecutes el SQL con el texto de ejemplo. Después, la sección `/admin` permite gestionar roles con protección para no eliminar al último superadministrador.

## Recordatorios programados sin Lovable

El plan Hobby de Vercel limita sus Cron Jobs a una ejecución diaria; por eso el recordatorio cada 30 minutos se programa mediante GitHub Actions, no con `vercel.json`. Configura estos secretos en GitHub → Settings → Secrets and variables → Actions:
- `RECICONTI_APP_URL`: URL base de la app desplegada en Vercel, sin barra final.
- `CRON_SECRET`: mismo valor aleatorio de al menos 32 caracteres que debes guardar como variable de entorno de servidor `CRON_SECRET` en Vercel. No lo publiques ni lo envíes por chat.

El workflow `.github/workflows/reminders.yml` ejecuta `GET /api/public/reminders` cada 30 minutos y también permite una ejecución manual. Debe estar en `main` para que GitHub active el calendario; GitHub Actions puede retrasar ejecuciones programadas, así que comprueba su historial tras publicar.

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
