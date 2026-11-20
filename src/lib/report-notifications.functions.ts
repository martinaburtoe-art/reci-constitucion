import { createServerFn } from '@tanstack/react-start';
import { getRequest } from '@tanstack/react-start/server';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

const input = z.object({
  reportId: z.string().uuid(),
  status: z.enum(['recibido', 'en_revision', 'resuelto', 'rechazado']),
});

export const notifyReportStatus = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((value) => input.parse(value))
  .handler(async ({ data, context }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc('is_admin', { _user_id: context.userId });
    if (roleError || !allowed) throw new Error('Sin permiso para notificar denuncias.');

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { allowedPushEndpoint, vapidKeys } = await import('@/lib/push.server');
    const { buildPushPayload } = await import('@block65/webcrypto-web-push');

    const { data: report, error: reportError } = await supabaseAdmin
      .from('reports')
      .select('id,codigo,user_id,estado,updated_at')
      .eq('id', data.reportId)
      .single();
    if (reportError || !report) throw new Error('No encontramos la denuncia para notificar.');
    if (report.estado !== data.status) throw new Error('El estado cambió antes de enviar la notificación.');
    if (!report.user_id) return { sent: 0 };

    const { data: subscriptions, error: subscriptionError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id,endpoint,subscription')
      .eq('user_id', report.user_id);
    if (subscriptionError) throw new Error('No pudimos consultar los dispositivos registrados.');

    const keys = await vapidKeys();
    const privateKey = keys.private_key as { d?: string };
    if (!privateKey.d) throw new Error('Las notificaciones push no están configuradas.');
    const labels = { recibido: 'recibida', en_revision: 'en revisión', resuelto: 'resuelta', rechazado: 'cerrada sin resolución' } as const;
    const request = getRequest();
    if (!request?.url) throw new Error('No pudimos identificar el origen para notificaciones.');
    const subject = new URL(request.url).origin;
    let sent = 0;

    for (const sub of subscriptions ?? []) {
      if (!allowedPushEndpoint(sub.endpoint)) continue;
      const eventKey = `report-status:${report.id}:${report.updated_at}:${data.status}`;
      const claim = await supabaseAdmin.from('push_deliveries').insert({ subscription_id: sub.id, event_key: eventKey });
      if (claim.error) continue;
      try {
        const subscription = sub.subscription as unknown as import('@block65/webcrypto-web-push').PushSubscription;
        const payload = await buildPushPayload({
          data: JSON.stringify({
            title: 'Actualización de tu denuncia · ReciConti',
            body: `Tu denuncia ${report.codigo} está ${labels[data.status]}.`,
            url: `/denunciar?codigo=${encodeURIComponent(report.codigo)}`,
          }),
          options: { ttl: 3600 },
        }, subscription, {
          subject,
          publicKey: keys.public_key,
          privateKey: privateKey.d,
        });
        const response = await fetch(sub.endpoint, { ...payload, redirect: 'error' });
        if (response.status === 404 || response.status === 410) {
          await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
        } else if (response.ok) sent++;
      } catch {
        // Un fallo de dispositivo no debe impedir notificar a los demás.
      }
    }
    return { sent };
  });
