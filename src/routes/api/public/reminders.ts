import { createFileRoute } from '@tanstack/react-router';
import { authenticateCronRequest } from '@/integrations/supabase/cron-auth';
import { streak } from '@/lib/features';

async function handleReminders(request: Request): Promise<Response> {

 const failure=await authenticateCronRequest(request);if(failure)return failure;
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {allowedPushEndpoint,vapidKeys}=await import('@/lib/push.server');
 const {buildPushPayload}=await import('@block65/webcrypto-web-push');
 const keys=await vapidKeys();const privateKey=keys.private_key as {d?:string};if(!privateKey.d)return new Response('Notifications not configured',{status:503});
 const {data:subs,error}=await supabaseAdmin.from('push_subscriptions').select('*').limit(500);if(error)throw error;
 const now=new Date();const parts=Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now).map(p=>[p.type,p.value]));
 const date=`${parts['year']}-${parts['month']}-${parts['day']}`;const weekday=new Date(`${date}T12:00:00Z`).getUTCDay();const minute=Number(parts['hour'])*60+Number(parts['minute']);
 const {data:schedules}=await supabaseAdmin.from('schedules').select('*').eq('referencial',false);
 let sent=0;
 for(const sub of subs??[]){if(!allowedPushEndpoint(sub.endpoint))continue;
 const {data:profile}=await supabaseAdmin.from('profiles').select('sector').eq('id',sub.user_id).single();
 const {data:logs}=await supabaseAdmin.from('recycling_logs').select('created_at').eq('user_id',sub.user_id).order('created_at',{ascending:false}).limit(200);
 const messages:{key:string;text:string;url:string}[]=[];
 for(const event of schedules??[]){if(event.sector!=='Todos'&&event.sector!==profile?.sector)continue;if(event.fecha?event.fecha!==date:event.dia_semana!==weekday)continue;const [h,m]=(event.hora??'').split(':').map(Number);if(h===undefined||m===undefined)continue;const delta=h*60+m-minute;if(delta>0&&delta<=60)messages.push({key:`schedule:${event.id}:${date}`,text:`${event.titulo} · ${event.hora} · ${event.sector}`,url:'/calendario'})}
 if(Number(parts['hour'])===18&&logs?.length){const week=Math.floor(now.getTime()/(7*86400000));const dates=logs.map(l=>l.created_at);const n=streak(dates,now);const latest=logs[0];if(n>=3)messages.push({key:`streak:${week}`,text:`¡Llevas ${n} semanas seguidas reciclando! 🌱`,url:'/perfil'});else if(latest&&now.getTime()-new Date(latest.created_at).getTime()>=14*86400000)messages.push({key:`reminder:${week}`,text:'Hace dos semanas que no registras un reciclaje. ¿Vamos por uno?',url:'/registrar'})}
 for(const message of messages){const claim=await supabaseAdmin.from('push_deliveries').insert({subscription_id:sub.id,event_key:message.key});if(claim.error)continue;try{const subscription=sub.subscription as unknown as import('@block65/webcrypto-web-push').PushSubscription;const payload=await buildPushPayload({data:JSON.stringify({title:'ReciConti',body:message.text,url:message.url}),options:{ttl:3600}},subscription,{subject:new URL(request.url).origin,publicKey:keys.public_key,privateKey:privateKey.d});const result=await fetch(sub.endpoint,{...payload,redirect:'error'});if(result.status===404||result.status===410)await supabaseAdmin.from('push_subscriptions').delete().eq('id',sub.id);else if(result.ok)sent++;}catch{ /* one attempt per scheduled event, no retry storm */ }}
 }
 return Response.json({sent});

}

export const Route = createFileRoute('/api/public/reminders')({
  server: {
    handlers: {
      GET: ({ request }) => handleReminders(request),
      POST: ({ request }) => handleReminders(request),
    },
  },
});
