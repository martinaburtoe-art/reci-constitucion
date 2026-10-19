export async function vapidKeys(){
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const existing=await supabaseAdmin.from('push_keys').select('*').eq('id','vapid').maybeSingle();
 if(existing.error)throw new Error('No pudimos preparar las notificaciones.');
 if(existing.data)return existing.data;
 const pair=await crypto.subtle.generateKey({name:'ECDSA',namedCurve:'P-256'},true,['sign','verify']);
 const privateKey=await crypto.subtle.exportKey('jwk',pair.privateKey);const bytes=new Uint8Array(await crypto.subtle.exportKey('raw',pair.publicKey));
 const publicKey=btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');
 await supabaseAdmin.from('push_keys').upsert({id:'vapid',public_key:publicKey,private_key:JSON.parse(JSON.stringify(privateKey))},{onConflict:'id',ignoreDuplicates:true});
 const final=await supabaseAdmin.from('push_keys').select('*').eq('id','vapid').single();if(final.error)throw new Error('No pudimos preparar las notificaciones.');return final.data;
}
export function allowedPushEndpoint(endpoint:string){try{const u=new URL(endpoint);return u.protocol==='https:'&&u.port===''&&u.username===''&&u.password===''&&['fcm.googleapis.com','updates.push.services.mozilla.com','web.push.apple.com'].includes(u.hostname)}catch{return false}}
