export function canRegisterWorker(){
 if(typeof window==='undefined'||!('serviceWorker' in navigator))return false;
 const h=window.location.hostname;
 return import.meta.env.PROD&&window.self===window.top&&!new URLSearchParams(window.location.search).has('sw')&&!h.startsWith('id-preview--')&&!h.startsWith('preview--')&&!['lovableproject.com','lovableproject-dev.com','beta.lovable.dev'].some(x=>h===x||h.endsWith('.'+x));
}
export async function registerWorker(){
 if(!('serviceWorker' in navigator))return;
 if(!canRegisterWorker()){for(const reg of await navigator.serviceWorker.getRegistrations()){if(new URL(reg.active?.scriptURL??reg.installing?.scriptURL??location.href).pathname==='/sw.js')await reg.unregister()}return;}
 await navigator.serviceWorker.register('/sw.js');
}
