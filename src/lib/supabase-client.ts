// src/lib/supabase-client.ts - VERSIÓN SEGURA
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
import { CLIENT_CONFIGS, DEFAULT_CLIENT } from '@/config/clients';

// Cache para reutilizar instancias
const clientCache = new Map();

/**
 * Obtiene el cliente Supabase DINÁMICO basado en el cliente actual
 * ✅ MANTIENE compatibilidad con código existente
 */
export const getSupabaseClient = (clientId?: string) => {
  const actualClientId = clientId || getCurrentClientId();
  const config = CLIENT_CONFIGS[actualClientId as keyof typeof CLIENT_CONFIGS];
  
  if (!config) {
    console.warn(`❌ Configuración no encontrada para cliente: ${actualClientId}, usando default`);
    return getSupabaseClient(DEFAULT_CLIENT); // ✅ FALLBACK SEGURO
  }

  // ✅ REUTILIZAR INSTANCIA SI EXISTE
  const cacheKey = `${config.supabaseUrl}-${actualClientId}`;
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey);
  }

  console.log(`🔗 [MULTI-TENANT] Conectando a: ${actualClientId}`);

  const client = createClient<Database>(config.supabaseUrl, config.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  // ✅ GUARDAR EN CACHE
  clientCache.set(cacheKey, client);
  
  return client;
};

/**
 * Obtiene el clientId actual desde la URL (COMPATIBILIDAD TOTAL)
 */
export const getCurrentClientId = (): string => {
  if (typeof window === 'undefined') return DEFAULT_CLIENT;
  
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('client') || DEFAULT_CLIENT;
  
  return clientId;
};

// ✅ MANTENER EXACTAMENTE IGUAL para no romper componentes React
export const useSupabase = () => {
  return getSupabaseClient(); // Sin parámetro - COMPATIBILIDAD
};

// ✅ MANTENER para compatibilidad con código legacy
export const supabase = getSupabaseClient();