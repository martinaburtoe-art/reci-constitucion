import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';

const input = z.object({
  userId: z.string().uuid(),
  role: z.enum(['none', 'admin_punto', 'super_admin']),
});

export const setAdminRole = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((value) => input.parse(value))
  .handler(async ({ data, context }) => {
    const { data: allowed, error: roleError } = await context.supabase.rpc('has_role', {
      _user_id: context.userId,
      _role: 'super_admin',
    });
    if (roleError || !allowed) throw new Error('Solo un superadministrador puede cambiar roles.');

    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: target, error: targetError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', data.userId)
      .maybeSingle();
    if (targetError || !target) throw new Error('No encontramos la cuenta seleccionada.');

    const { data: existing, error: existingError } = await supabaseAdmin
      .from('user_roles')
      .select('id,role')
      .eq('user_id', data.userId);
    if (existingError) throw new Error('No pudimos leer los permisos actuales.');

    const current = existing ?? [];
    const hasSuperRole = current.some((r) => r.role === 'super_admin');
    const removesSuperRole = hasSuperRole && data.role !== 'super_admin';

    if (removesSuperRole) {
      const { data: superAdmins, error: countError } = await supabaseAdmin
        .from('user_roles')
        .select('id')
        .eq('role', 'super_admin');
      if (countError) throw new Error('No pudimos comprobar los superadministradores.');
      if ((superAdmins ?? []).length <= 1) {
        throw new Error('No se puede quitar el último superadministrador del sistema.');
      }
    }

    const rolesToRemove = current
      .filter((r) => (r.role === 'admin_punto' || r.role === 'super_admin') && r.role !== data.role)
      .map((r) => r.id);
    if (rolesToRemove.length) {
      const { error } = await supabaseAdmin.from('user_roles').delete().in('id', rolesToRemove);
      if (error) throw new Error('No pudimos retirar los permisos anteriores.');
    }

    if (data.role !== 'none' && !current.some((r) => r.role === data.role)) {
      const { error } = await supabaseAdmin.from('user_roles').insert({ user_id: data.userId, role: data.role });
      if (error) throw new Error('No pudimos asignar el nuevo rol.');
    }

    return { success: true };
  });
