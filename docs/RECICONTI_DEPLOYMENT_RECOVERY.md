# Recuperación de despliegue y autenticación de ReciConti

Este documento registra las comprobaciones necesarias para recuperar el acceso sin cambiar la base de datos ni exponer credenciales.

## Estado verificado el 20-10-2026

- Repositorio: `martinaburtoe-art/reci-constitucion`.
- Rama de trabajo de recuperación: `fix/auth-errors-and-deployment-readiness-20261020`.
- El commit de referencia `981c1014` añadió un mensaje alternativo cuando Google OAuth no está configurado.
- El proyecto Vercel `reci-constitucion` existe y el último despliegue inspeccionado aparece como `READY`; esto no demuestra que el runtime o el login estén sanos.
- La consulta de variables de entorno de Vercel devolvió una lista vacía. Verificar el ámbito/equipo correcto antes de añadir o modificar variables.
- La integración Supabase disponible en la sesión solo muestra el proyecto Nüva One. **No conectar ReciConti a ese proyecto.**
- El cliente de la aplicación requiere `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` durante la compilación/ejecución del cliente; el servidor también contempla `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY`.
- La acción de Google utiliza Supabase Auth OAuth. El error `Unsupported provider: missing OAuth secret` debe corregirse en el backend de autenticación que realmente usa ReciConti; un cambio de interfaz no puede crear el secreto de Google.

## Variables de entorno

Configurar solo valores obtenidos del backend original de ReciConti:

| Variable | Uso | Tratamiento |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | URL pública del backend para el cliente | Pública |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave publicable del cliente | Pública, con RLS correctamente configurado |
| `SUPABASE_URL` | URL del backend en servidor | Entorno de servidor |
| `SUPABASE_PUBLISHABLE_KEY` | Clave publicable para llamadas de servidor | Entorno de servidor |
| `SUPABASE_SERVICE_ROLE_KEY` | Operaciones administrativas de servidor | Secreto; nunca usar prefijo `VITE_` ni enviar al navegador |
| `OPENAI_API_KEY` | Funciones de IA del servidor | Secreto |
| `CRON_SECRET` | Autorización del endpoint de recordatorios | Secreto |

No copiar valores desde Nüva One, no inventar claves y no incluir valores reales en este archivo, GitHub Issues, logs o mensajes.

## Configuración OAuth

1. Identificar el proyecto/backend exacto que sirve la URL de `VITE_SUPABASE_URL`.
2. En la configuración de Auth de ese backend, habilitar Google solo si se dispone del OAuth Client ID y Client Secret correctos.
3. Registrar las URLs de retorno exactas exigidas por el backend de Auth y las URLs de ReciConti (producción y vista previa según corresponda).
4. Comprobar que el origen solicitado por la app esté incluido en la lista de URLs permitidas.
5. Probar inicio de sesión, cierre de sesión, recarga de sesión y retorno a `/perfil` con una cuenta de prueba.
6. Si no se dispone del secreto, mantener el acceso por correo como alternativa y mostrar un mensaje comprensible; no simular que Google funciona.

## Validación previa a producción

- [ ] Variables del backend original identificadas y disponibles en los entornos correctos de Vercel.
- [ ] `npm run build` correcto.
- [ ] `npm run lint` correcto o advertencias revisadas.
- [ ] `npm test` correcto.
- [ ] Login y registro por correo verificados contra el backend real.
- [ ] OAuth Google probado de extremo a extremo o deshabilitado de forma explícita.
- [ ] Persistencia de registros y permisos verificados con una cuenta de prueba.
- [ ] Confirmado que el despliegue no está bloqueado por Deployment Protection/SSO para usuarios finales.
- [ ] Verificado el dominio de producción y la configuración de seguridad.
- [ ] Despliegue de producción promovido solo después de completar las comprobaciones anteriores.

## Cambios de esta recuperación

La ruta de autenticación captura fallos síncronos y asíncronos del cliente, evita errores sin gestionar, ofrece mensajes en español sin revelar detalles internos y deshabilita controles mientras una solicitud está en curso. Este cambio mejora el manejo de errores; **no sustituye la configuración real del backend, las variables ni las credenciales OAuth**.
