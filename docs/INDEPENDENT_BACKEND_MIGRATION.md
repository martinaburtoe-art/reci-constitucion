# ReciConti: salida de Lovable Cloud y despliegue independiente

## Objetivo

Que el código, autenticación, base de datos, almacenamiento, funciones programadas y despliegue de ReciConti se puedan operar sin depender de Lovable. El repositorio ya contiene integración directa con Supabase JS, esquema TypeScript y migraciones Drizzle; el runtime actual todavía importa `@lovable.dev/vite-tanstack-config` y por eso **aún no es independiente de Lovable**.

## Estado y límites comprobados

- Proyecto Supabase que figura en `supabase/config.toml`: `mgjyogkbgynbiexccict`. La integración conectada no permite acceder a ese proyecto; no se debe sustituir por el proyecto Nüva One.
- El cliente espera `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` para navegador y `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` para SSR.
- El login de correo/contraseña utiliza Supabase Auth directamente. Google OAuth necesita activarse y configurarse en el backend nuevo, o mantenerse desactivado.
- La configuración de Vite aún usa `@lovable.dev/vite-tanstack-config`; hay que reemplazarla por plugins oficiales compatibles y validar build/test antes de quitar la dependencia.
- Migraciones de aplicación están en `drizzle/migrations/`; antes de crear un backend nuevo se deben revisar todas, aplicar en orden y auditar políticas RLS, funciones, triggers, buckets, secretos y tareas programadas.
- No hay evidencia suficiente de una exportación completa del backend antiguo ni de una restauración probada. No declarar migración completa hasta validar el inventario y la restauración.

## Arquitectura de destino

- Código: GitHub como fuente única.
- Web/SSR: Vercel vinculado al repositorio, o un host Node compatible con TanStack Start.
- Auth, PostgreSQL, Storage y RLS: proyecto Supabase controlado por el propietario.
- Tareas recurrentes: GitHub Actions o cron del proveedor, autenticadas con un secreto guardado como variable de entorno.
- Secretos: solo variables de entorno del servidor / GitHub Actions; nunca prefijo `VITE_` salvo valores públicos.
- OAuth Google: opcional. No es requisito para habilitar correo/contraseña.

## Secuencia de migración segura

1. Crear un proyecto Supabase nuevo en la organización elegida y conservar intacto el backend antiguo hasta completar pruebas.
2. Exportar esquema y datos del backend original con un mecanismo autorizado. Si no se puede acceder al origen, reconstruir desde migraciones versionadas y datos semilla verificados; los datos privados y las cuentas de Auth no se pueden inventar ni recuperar desde el repositorio.
3. Comparar el esquema vivo con `drizzle/migrations/`, aplicar migraciones en orden y portar SQL adicional de funciones, triggers, políticas RLS, buckets y configuración de Storage.
4. Configurar variables de entorno del proyecto nuevo en Vercel. Nunca pegar valores secretos en GitHub, issues o chats.
5. Reemplazar `@lovable.dev/vite-tanstack-config` en `vite.config.ts` por configuración estándar compatible con las versiones fijadas en `package.json`; ejecutar instalación limpia, build, lint y tests. Eliminar dependencias de Lovable solo cuando no quede ningún import ni configuración que las requiera.
6. Configurar URL del sitio y URLs de redirección en Auth. Activar Google solo si se dispone de credenciales OAuth propias; en caso contrario, deshabilitar el botón de Google y probar email/contraseña.
7. Revisar RLS para cada tabla y bucket; verificar roles `super_admin` y `admin_punto`, RPCs, registro atómico de reciclaje, denuncias privadas y límites de acceso anónimo.
8. Ejecutar pruebas de humo con usuario nuevo y usuario existente, recuperación/confirmación de correo, registro de reciclaje, mapa, denuncias, administración, Storage y funciones programadas.
9. Promover producción solo después de que CI, pruebas de seguridad y pruebas de humo pasen. Mantener el backend anterior en modo recuperación hasta validar la migración.

## Criterios de aceptación (no marcar PASS sin evidencia)

- [ ] Build limpio sin paquete ni servicio de Lovable.
- [ ] Migraciones aplicadas y diferencias de esquema documentadas.
- [ ] RLS revisado y pruebas negativas de acceso aprobadas.
- [ ] Variables del backend propio configuradas sin exponer valores.
- [ ] Email/contraseña, confirmación y recuperación probados.
- [ ] Flujos principales y Storage verificados.
- [ ] Cron/recordatorios probados en entorno desplegado.
- [ ] Restauración de respaldo probada.
- [ ] Dominio y despliegue de producción verificados.

## Seguridad

No usar claves del proyecto Nüva One. No desactivar RLS para facilitar la migración. No añadir claves `service_role` al cliente. No borrar ni sobrescribir el backend original antes de verificar una restauración. No afirmar que los usuarios/cuentas se migraron hasta probar un procedimiento compatible con Auth.
