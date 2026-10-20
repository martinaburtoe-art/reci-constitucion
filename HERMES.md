# Hermes Agent — ReciConti

## Objetivo
Trabajar directamente en este repositorio local y publicar cambios mediante GitHub para que Vercel pueda generar previews cuando el proyecto quede conectado.

## Repositorio y rama
- Repositorio: https://github.com/martinaburtoe-art/reci-constitucion
- Rama de trabajo inicial: `feat/admin-impact-notifications-share`
- No trabajar en `C:\Windows\System32`; la carpeta local del usuario es `C:\Users\marti\reci-constitucion`.
- Mantener `main` protegida: no hacer push directo a `main`, no force-push, no reescribir historial publicado.
- Para tareas nuevas, crear una rama descriptiva desde la rama base actualizada y abrir un Pull Request.

## Flujo obligatorio
1. Confirmar `Get-Location`, `git status --short --branch`, `git branch --show-current` y `git remote -v`.
2. Leer este archivo, `AGENTS.md`, `README.md` y los archivos pertinentes antes de editar.
3. Revisar cambios preexistentes; no descartarlos ni sobrescribirlos.
4. Realizar cambios pequeños, focalizados y reversibles.
5. Ejecutar, según corresponda: `bun run lint`, `bun run test` y `bun run build`.
6. Informar con evidencia qué comandos pasaron o fallaron; nunca declarar PASS si no se ejecutaron.
7. Confirmar diff, crear commit descriptivo y subir únicamente la rama de trabajo.
8. Abrir/actualizar un PR. No fusionarlo ni desplegar a producción sin autorización explícita.
9. Verificar el estado real de GitHub Actions y el despliegue de Vercel; un commit subido no prueba que esté desplegado.

## Instalación local
- Gestor: Bun. Versión comprobada por el usuario: 1.3.14.
- Scripts principales: `bun run dev`, `bun run lint`, `bun run test`, `bun run build`.
- Si `bun install` falla con ENOENT en scripts de ciclo de vida (por ejemplo esbuild), no asumir que la instalación está completa. Revisar el log y reparar con una reinstalación controlada antes de ejecutar build.
- No ejecutar comandos destructivos de limpieza ni reinstalaciones forzadas sin comprobar antes el estado del repositorio y explicar el impacto.

## Secretos y servicios externos
- Nunca mostrar, registrar, imprimir, subir o solicitar secretos en el chat.
- `.env` y todos los archivos `.env.*` son locales; la única excepción versionada es `.env.example`.
- No copiar credenciales de Nüva One a ReciConti.
- No aplicar migraciones ni tocar Auth, RLS, datos de producción o claves de servicio sin identificar primero el proyecto Supabase correcto y tener autorización explícita.
- `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `DATABASE_URL` y `CRON_SECRET` son exclusivamente secretos de servidor/entorno seguro.
- `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` son las únicas variables públicas previstas en el ejemplo; nunca colocar secretos con prefijo `VITE_`.

## Estado de infraestructura conocido
- Repositorio GitHub: existe.
- Rama `feat/admin-impact-notifications-share`: rama de trabajo actual.
- Proyecto Vercel ReciConti: todavía no se ha encontrado en la cuenta conectada; la creación vía integración devolvió falta de permisos. No afirmar que hay preview ni producción desplegada.
- Para habilitar despliegues, el propietario debe importar `martinaburtoe-art/reci-constitucion` en Vercel y conectar GitHub. Usar raíz del repo y configurar las variables de entorno en Vercel sin exponerlas.
- Supabase dedicado a ReciConti aún debe confirmarse. No usar el proyecto de Nüva One.

## Reporte de cada sesión
Entregar en español:
- objetivo y archivos cambiados;
- pruebas ejecutadas y resultados exactos;
- commit SHA y rama;
- PR y estado de CI;
- URL de preview/producción solo si se verificó;
- bloqueos externos, sin inventar progreso ni porcentajes.
