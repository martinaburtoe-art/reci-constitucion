import {describe,it,expect,vi} from 'vitest';
vi.mock('@/integrations/supabase/client',()=>({supabase:{}}));
import {removeSynced,type Deposit} from '@/lib/offline';
describe('offline account isolation',()=>{it('preserves another owner with the same client key',()=>{const one:Deposit={client:'same',user:'owner-a',point:null,items:[]};const two:Deposit={...one,user:'owner-b'};expect(removeSynced([one,two],one)).toEqual([two])});});
