// src/lib/supabase.ts - VERSIÓN OPTIMIZADA
import { createClient } from '@supabase/supabase-js';
import { CLIENT_CONFIGS, DEFAULT_CLIENT } from '../config/clients';
import { log } from '@/utils/simple-logger';

// Cache para reutilizar instancias
const clientCache = new Map();

/**
 * Obtiene el cliente Supabase DINÁMICO basado en el cliente actual
 */
export const getSupabaseClient = (clientId?: string) => {
  const actualClientId = clientId || getCurrentClientId();
  const config = CLIENT_CONFIGS[actualClientId as keyof typeof CLIENT_CONFIGS];
  
  if (!config) {
    log.error(`Configuración no encontrada para cliente: ${actualClientId}`);
    throw new Error(`Configuración no encontrada para cliente: ${actualClientId}`);
  }

  // ✅ REUTILIZAR INSTANCIA SI EXISTE
  const cacheKey = config.supabaseUrl;
  if (clientCache.has(cacheKey)) {
    return clientCache.get(cacheKey);
  }


  
  const client = createClient(config.supabaseUrl, config.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false // ✅ EVITA MULTIPLES INSTANCIAS
    }
  });

  // ✅ GUARDAR EN CACHE
  clientCache.set(cacheKey, client);
  
  return client;
};

/**
 * Obtiene el clientId actual desde la URL
 */
export const getCurrentClientId = (): string => {
  if (typeof window === 'undefined') return DEFAULT_CLIENT;
  
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('client') || DEFAULT_CLIENT;
  
  log.dev(`Cliente detectado: ${clientId}`);
  return clientId;
};

// Cliente por defecto para compatibilidad
export const supabase = getSupabaseClient();