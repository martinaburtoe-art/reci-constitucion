// En dominios independientes, la sesión de Supabase se almacena en el navegador.
// No se usa un broker de autenticación del editor de Lovable.
export function brokeredPreviewStorage() {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage;
}
