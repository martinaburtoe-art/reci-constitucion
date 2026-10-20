import {useEffect,useState} from 'react';
import {useServerFn} from '@tanstack/react-start';
import {Bell,BellOff} from 'lucide-react';
import {getPushKey,subscribePush,unsubscribePush} from '@/lib/push.functions';
import {Button} from './ui/button';
import {toast} from 'sonner';
import {canRegisterWorker} from '@/lib/pwa';
export function Notifications(){
 const getKey=useServerFn(getPushKey);const save=useServerFn(subscribePush);const remove=useServerFn(unsubscribePush);
 const [supported,setSupported]=useState(false);const [active,setActive]=useState(false);const [busy,setBusy]=useState(false);
 useEffect(()=>{setSupported(canRegisterWorker()&&'PushManager' in window&&'Notification' in window);if(canRegisterWorker())navigator.serviceWorker.getRegistration().then(r=>r?.pushManager.getSubscription()).then(s=>setActive(!!s))},[]);
 async function toggle(){
  setBusy(true);
  try {
   const reg=await navigator.serviceWorker.getRegistration();if(!reg)throw new Error('Abre la app publicada para activar avisos.');
   const current=await reg.pushManager.getSubscription();
   if(active&&current){await remove({data:{endpoint:current.endpoint}});await current.unsubscribe();setActive(false);return;}
   if(await Notification.requestPermission()!=='granted')throw new Error('Autoriza las notificaciones en tu navegador.');
   const key=await getKey();const bytes=Uint8Array.from(atob(key.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
   const sub=current??await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:bytes});const json=sub.toJSON();
   if(!json.endpoint||!json.keys?.['p256dh']||!json.keys?.['auth'])throw new Error('No pudimos activar las notificaciones.');
   await save({data:{endpoint:json.endpoint,keys:{p256dh:json.keys['p256dh'],auth:json.keys['auth']},expirationTime:json.expirationTime??null}});
   setActive(true);toast.success('Recordatorios activados');
  }catch(e){toast.error(e instanceof Error?e.message:'No pudimos activar las notificaciones');}finally{setBusy(false);}
 }
 return <section className="border-t pt-4 space-y-3"><h2 className="text-xl font-bold">Recordatorios de Reci</h2><p className="text-sm text-muted-foreground">Retiros de tu sector y avisos de racha. En iPhone, agrega ReciConti a la pantalla de inicio.</p>{supported?<Button variant="outline" disabled={busy} className="w-full" onClick={toggle}>{active?<BellOff/>:<Bell/>}{active?'Desactivar avisos':'Activar avisos'}</Button>:<p className="text-sm text-muted-foreground">Los avisos se activan en la app publicada, con un navegador compatible.</p>}</section>;
}
