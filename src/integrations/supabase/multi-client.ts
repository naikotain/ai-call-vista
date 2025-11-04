import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { CLIENT_CONFIGS, DEFAULT_CLIENT } from '@/config/clients';

export const getSupabaseClient = () => {
  // Detectar cliente por parámetro URL o subdominio
  const urlParams = new URLSearchParams(window.location.search);
  const clientFromParam = urlParams.get('client');
  const clientId = clientFromParam || DEFAULT_CLIENT;

  console.log('🔗 MULTI-TENANT DEBUG:');
  console.log(' - Cliente seleccionado:', clientId);
  console.log(' - URL:', CLIENT_CONFIGS[clientId]?.supabaseUrl);
  
  const config = CLIENT_CONFIGS[clientId];
  
  if (!config) {
    console.warn(`Cliente "${clientId}" no encontrado, usando default`);
    return createClient<Database>(
      CLIENT_CONFIGS[DEFAULT_CLIENT].supabaseUrl, 
      CLIENT_CONFIGS[DEFAULT_CLIENT].supabaseKey,
      {
        auth: {
          storage: localStorage,
          persistSession: true,
          autoRefreshToken: true,
        }
      }
    );
  }
  
  console.log(`🔗 Conectando a Supabase de: ${clientId}`);
  
  return createClient<Database>(config.supabaseUrl, config.supabaseKey, {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  });
};

// Hook para React components
export const useSupabase = () => {
  return getSupabaseClient();
};