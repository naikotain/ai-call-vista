import { AutoFieldDetector } from './auto-field-detector';

// Mapeo base CORREGIDO
export const BASE_FIELD_MAPPINGS = {
  // Campos principales
  id: 'id',
  status: 'status',
  call_type: 'tipo_de_llamada',
  sentiment: 'sentiment',
  duration: 'duration',
  
  // ✅ CORRECCIÓN: retell_cost y cost como campos SEPARADOS
  retell_cost: 'retell_cost', // ← NUEVO campo para el costo de Retell AI
  cost: 'cost', // ← Mantener para compatibilidad, pero será 0
  
  customer_phone: 'customer_phone',
  country_code: 'country_code',
  country_name: 'country_name',
  started_at: 'started_at',
  ended_at: 'ended_at',
  disconnect_reason: 'disconnect_reason',
  transcription: 'transcription',
  resumen_llamada: 'resumen_llamada',
  agent_id: 'api',
  channel: 'channel',
  objetivo_de_la_llamada: 'objetivo_de_la_llamada',
  call_id: 'call_id',
  numero_agente: 'numero_agente',
  latency: 'latency',
  
  // Campos legacy
  call_status: 'status',
  call_successful: 'status', 
  timestamp: 'started_at',
  call_objective: 'objetivo_de_la_llamada',
  call_summary: 'resumen_llamada',
  agent_number: 'numero_agente'
};

// Mapeos específicos por cliente (solo para casos especiales)
export const CUSTOM_FIELD_MAPPINGS: Record<string, any> = {
  'cliente1': BASE_FIELD_MAPPINGS,
  'cliente2': BASE_FIELD_MAPPINGS,
  'cliente3': BASE_FIELD_MAPPINGS
  // Para nuevos clientes, no necesitas agregar nada aquí - se detectarán automáticamente
};

// VALUE MAPPINGS inteligentes - funcionan para todos los clientes
export const SMART_VALUE_MAPPINGS = {
  status: {
    // Mapeo universal de status
    'successful': 'successful', 'exitoso': 'successful', 'completed': 'successful', 'ended': 'successful','Ended': 'successful',
    'failed': 'failed', 'fallido': 'failed', 'error': 'failed',
    'ongoing': 'ongoing', 'en_curso': 'ongoing', 'in_progress': 'ongoing', 'progress': 'ongoing',
    'voicemail': 'voicemail', 'buzon': 'voicemail', 'voice_mail': 'voicemail',
    'transferred': 'transferred', 'transferido': 'transferred', 'transfer': 'transferred'
  },
  call_type: {
    // Mapeo universal de call_type
    'inbound': 'inbound', 'entrante': 'inbound', 'incoming': 'inbound', 'entrada': 'inbound',
    'outbound': 'outbound', 'saliente': 'outbound', 'outgoing': 'outbound', 'salida': 'outbound'
  },
  sentiment: {
    // Mapeo universal de sentiment
    'positive': 'positive', 'positivo': 'positive', 'good': 'positive',
    'negative': 'negative', 'negativo': 'negative', 'bad': 'negative',
    'neutral': 'neutral', 'regular': 'neutral'
  }
};

// Helper mejorado con detección automática
export const getFieldMapping = (clientId: string, sampleData?: any[]) => {
  return AutoFieldDetector.getAutoFieldMapping(clientId, sampleData);
};

export const getValueMapping = (clientId: string) => {
  // Para todos los clientes, usar los mapeos inteligentes
  return SMART_VALUE_MAPPINGS;
};

// Exportar los mapeos legacy para compatibilidad
export const FIELD_MAPPINGS = CUSTOM_FIELD_MAPPINGS;
export const VALUE_MAPPINGS = { 
  'cliente1': SMART_VALUE_MAPPINGS,
  'cliente2': SMART_VALUE_MAPPINGS 
};