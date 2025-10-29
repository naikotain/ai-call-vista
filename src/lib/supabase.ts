import { createClient } from '@supabase/supabase-js'

// Obtener las variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🔍 LOGS DE DEBUG - VERIFICAR CONEXIÓN
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔗 SUPABASE CONNECTION CHECK:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('URL:', supabaseUrl);
console.log('Key (primeros 30 chars):', supabaseAnonKey?.substring(0, 30) + '...');
console.log('Expected URL:', 'https://vbufiofpxvduoekqbsfu.supabase.co');
console.log('¿Es el correcto?:', supabaseUrl === 'https://vbufiofpxvduoekqbsfu.supabase.co' ? '✅ SÍ' : '❌ NO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Verificar que las variables existan
if (!supabaseUrl) {
  throw new Error('Missing environment variable: VITE_SUPABASE_URL');
}

if (!supabaseAnonKey) {
  throw new Error('Missing environment variable: VITE_SUPABASE_ANON_KEY');
}

// Crear y exportar el cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Log para verificación (opcional)
console.log('✅ Supabase configurado correctamente');