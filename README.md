# ReciConti

Aplicación en español de Chile para reciclaje en Constitución, Maule. React, TanStack Start, Tailwind, Leaflet y Lovable Cloud.

## Catastro oficial

Solo una cuenta con rol `super_admin` puede importar catastro desde Administración → Catastro. Los roles se gestionan por un operador autorizado; no se asignan desde el perfil ni desde metadatos de registro.

CSV UTF-8 con encabezados `nombre,lat,lng,fuente,direccion,horario`. Los cuatro primeros son obligatorios. Se admiten comas y valores entre comillas. GeoJSON requiere `FeatureCollection`, geometrías `Point` (longitud primero, latitud después), y propiedades `nombre`, `fuente`, `direccion` y `horario`. Máximo 1000 puntos por importación. Cada importación añade puntos; no actualiza ni deduplica catastro existente. Revisa el archivo antes de importar.

No inventar coordenadas. Adjuntar una fuente oficial o verificable. Los puntos importados quedan sin verificar; una propuesta GPS desde la ficha se aprueba por el administrador del punto o superadministrador. Las ubicaciones iniciales de ejemplo no son un catastro oficial: sustituirlas por registros documentados antes de un uso público. El calendario de ejemplo también es referencial.

## Funciones

- Mapa, búsqueda, materiales, clustering y GPS.
- Registros atómicos con puntos calculados en base de datos; identificador idempotente para sincronización.
- Denuncias privadas, fotos comprimidas y seguimiento por código.
- Calendario por sector, exportación ICS con alarma al calendario del dispositivo.
- Metas por material, gráfico mensual, rachas, insignias y PNG compartible.
- Ranking voluntario: alias, sector y kilos mensuales; no emails ni IDs de usuarios.
- Administración con importación, revisión de propuestas, denuncias, materiales, retiros y métricas.
- Cámara con IA autenticada; transmite respuesta, foto solo para análisis y cancelación. Puede consumir créditos.

## Sin conexión y recordatorios

Los registros se guardan en este dispositivo mientras la app está abierta sin señal. Se sincronizan al recuperar conexión con sesión válida, solo para el dueño. No borrar datos del navegador antes de sincronizar. Las fotos y denuncias requieren conexión. El service worker cachea recursos publicados y ofrece una página de respaldo: abrir por primera vez sin señal no proporciona el mapa ni un registro completo. No almacena respuestas privadas.

ICS entrega recordatorios al calendario que el usuario elija. No hay notificaciones push remotas ni tareas programadas de racha: Reci presenta los recordatorios al abrir el perfil. Para push real se requiere suscripción, consentimiento y entrega programada con Web Push; no se simula con temporizadores.

## Desarrollo

`bun install`, `bun run dev`, `bun run test`. Migraciones en `drizzle/migrations/`; no modificar archivos generados de la integración. Los secretos se leen solo dentro de handlers del servidor. Las páginas privadas usan el acceso autenticado compartido.
