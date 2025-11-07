// src/lib/supabase.ts - VERSIÓN MULTI-CLIENTE
import { createClient } from '@supabase/supabase-js';
import { CLIENT_CONFIGS, DEFAULT_CLIENT } from '../config/clients';

/**
 * Obtiene el cliente Supabase DINÁMICO basado en el cliente actual
 */
export const getSupabaseClient = (clientId?: string) => {
  const actualClientId = clientId || getCurrentClientId();
  const config = CLIENT_CONFIGS[actualClientId as keyof typeof CLIENT_CONFIGS];
  
  if (!config) {
    throw new Error(`Configuración no encontrada para cliente: ${actualClientId}`);
  }

  console.log(`🔗 [getSupabaseClient] Conectando a ${actualClientId}: ${config.supabaseUrl}`);
  
  return createClient(config.supabaseUrl, config.supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
};

/**
 * Obtiene el clientId actual desde la URL
 */
export const getCurrentClientId = (): string => {
  if (typeof window === 'undefined') return DEFAULT_CLIENT;
  
  const urlParams = new URLSearchParams(window.location.search);
  const clientId = urlParams.get('client') || DEFAULT_CLIENT;
  
  console.log(`🎯 [getCurrentClientId] Cliente detectado: ${clientId}`);
  return clientId;
};

// Cliente por defecto para compatibilidad (usa DEFAULT_CLIENT)
export const supabase = getSupabaseClient();