import { supabase } from '@/integrations/supabase/client';
export type Deposit = {client:string;user:string;point:string|null;items:{id:string;n:number;size:string}[]};
const key='reciconti-deposits-v1';
export function pending():Deposit[] { try { return JSON.parse(localStorage.getItem(key)||'[]'); } catch { return []; } }
export function enqueue(entry:Deposit) { const rows=pending(); rows.push(entry); localStorage.setItem(key,JSON.stringify(rows)); window.dispatchEvent(new Event('reci-queue')); }
export async function syncDeposits() { const {data}=await supabase.auth.getUser(); if(!data.user||!navigator.onLine) return 0; let count=0; for(const row of pending().filter(r=>r.user===data.user?.id)) { const {error}=await supabase.rpc('record_recycling',{_client:row.client,_point:row.point??undefined,_items:row.items}); if(error) throw new Error(error.message); localStorage.setItem(key,JSON.stringify(pending().filter(r=>r.client!==row.client))); count++; } window.dispatchEvent(new Event('reci-queue')); return count; }
