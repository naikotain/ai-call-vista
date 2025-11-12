export const DISCONNECT_CATEGORY_MAPPINGS = {
  // ✅ FINALIZACIONES NORMALES (éxito)
  SUCCESS: [
    'user_hangup',           // Cliente colgó (normal)
    'agent_hangup',          // Agente colgó (normal)
    'Call ended by customer', // Cliente terminó la llamada
    'Agent ended call',      // Agente terminó la llamada
    'voicemail_reached',     // Llegó al buzón de voz (éxito parcial)
    'max_duration_reached',  // Tiempo máximo completado

  ],
  
  // ⚠️ NO CONECTADAS (neutral)
  NOT_CONNECTED: [
    'dial_busy',             // Línea ocupada
    'dial_no_answer',        // Sin respuesta
    'dial_failed',           // Llamada fallida
    'user_declined',         // Usuario rechazó
    'inactivity',            // Inactividad
    'registered_call_timeout', // Timeout
  ],
  
  // ❌ ERRORES (fallo real)
  ERROR: [
    'invalid_destination',    // Destino inválido
    'telephony_provider_permission_denied',
    'telephony_provider_unavailable',
    'sip_routing_error',
    'error_llm_websocket_open',
    'error_llm_websocket_lost_connection',
    'error_llm_websocket_runtime',
    'error_llm_websocket_corrupt_payload',
    'error_no_audio_received',
    'error_asr',
    'error_retell',
    'error_unknown',
    'error_user_not_joined',
    'marked_as_spam',
    'scam_detected',
    'no_valid_payment',
    'concurrency_limit_reached'
  ]
};

// Función para categorizar razones de desconexión
export const categorizeDisconnectReason = (reason: string): 'ended' | 'not_connected' | 'error' => {
  if (DISCONNECT_CATEGORY_MAPPINGS.SUCCESS.includes(reason)) {
    return 'ended';
  }
  if (DISCONNECT_CATEGORY_MAPPINGS.NOT_CONNECTED.includes(reason)) {
    return 'not_connected';
  }
  if (DISCONNECT_CATEGORY_MAPPINGS.ERROR.includes(reason)) {
    return 'error';
  }
  
  // Fallback: si no está mapeado, considerar como error para revisar
  return 'error';
};

// Función para determinar si una llamada fue exitosa
export const isCallSuccessful = (status: string, disconnectReason: string): boolean => {
  // Si el status no es 'ended', no fue exitosa
  if (status !== 'ended') return false;
  
  // Si la razón de desconexión está en SUCCESS, fue exitosa
  return DISCONNECT_CATEGORY_MAPPINGS.SUCCESS.includes(disconnectReason);
};