// Tipos base - SOLO DEFINIRLOS UNA VEZ
export type InternalStatus = 'successful' | 'failed' | 'voicemail' | 'transferred' | 'ongoing';
export type CallType = 'inbound' | 'outbound';
export type Sentiment = 'positive' | 'negative' | 'neutral';

// Tipo principal unificado
export interface NormalizedCall {
  // Campos principales
  id: string;
  status: InternalStatus;
  call_type: CallType;
  sentiment?: Sentiment;
  duration: number;
  cost: number;
  retell_cost?: number;
  customer_phone: string;
  country_code?: string;
  country_name?: string;
  started_at: string;
  ended_at?: string;
  disconnect_reason?: string;
  transcription?: string;
  resumen_llamada?: string;
  agent_id?: string;
  channel?: string;
  objetivo_de_la_llamada?: string;
  call_id?: string;
  numero_agente?: string;
  latency?: number;
  
  // NUEVO CAMPO PARA RELACIÓN
  call_id_retell?: string;
  
  // Campos legacy (para compatibilidad)
  call_status?: string;
  call_successful?: boolean | string;
  timestamp?: string;
  call_objective?: string;
  call_summary?: string;
  agent_number?: string;
  
  // Metadata para debug
  _raw?: any;
  _client?: string;
}

// Tipo para datos adicionales del cliente - VERSIÓN COMPLETA CORREGIDA
export interface AdditionalClientData {
  id: string;
  created_at: string;
  call_id?: string;
  call_id_retell?: string;
  client_id: string;
  
  // Campos OSDOP específicos
  nombre?: string;
  segundo_nombre?: string;
  telefono?: string;
  numero_afiliado?: string;
  motivo_consulta?: string;
  tipo_tramite?: string;
  localidad?: string;
  fecha?: string;
  especialidad?: string;
  nombre_prestador?: string;
  estado_tramite?: string;
  horario_actual?: string;
  canal_contacto?: string;
  detalle_reclamo?: string;
  
  // Campos flexibles para todos los clientes
  custom_fields?: Record<string, any>;
  data_source?: string;
  is_visible?: boolean;
  
  // ✅ CAMPOS ADICIONALES PARA COMPATIBILIDAD TOTAL:
  // Campos de llamada que pueden estar en datos adicionales
  customer_phone?: string;
  duration?: string | number;
  started_at?: string;
  status?: string;
  agent_name?: string;
  
  // Campos de ubicación
  country_code?: string;
  country_name?: string;
  
  // Campos de transcripción
  transcription?: string;
  resumen_llamada?: string;
  
  // Campos de agente
  agent_id?: string;
  numero_agente?: string;
  
  // Campos de costo
  cost?: number;
  
  // Campos técnicos
  channel?: string;
  objetivo_de_la_llamada?: string;
  latency?: number;
  sentiment?: string;
  
  // ✅ CAMPOS ESPECÍFICOS DE TU SCHEMA ORIGINAL:
  api?: string; // agent_id
  tipo_de_llamada?: string;
  ended_at?: string;
  date?: string;
  disconnect_reason?: string;
  
  // ✅ CUALQUIER OTRO CAMPO QUE PUEDA APARECER
  [key: string]: any; // Para campos dinámicos
}

// Tipos para datos relacionados
export interface CallWithAdditionalData extends NormalizedCall {
  additional_data: AdditionalClientData | null;
}

export interface AdditionalDataWithCall extends AdditionalClientData {
  call_data: NormalizedCall | null;
}

// Tipo guard para verificar datos normalizados
export const isNormalizedCall = (data: any): data is NormalizedCall => {
  return data && 
         typeof data.status === 'string' && 
         typeof data.call_type === 'string' &&
         typeof data.duration === 'number';
};

// Tipo guard para datos adicionales
export const isAdditionalClientData = (data: any): data is AdditionalClientData => {
  return data && 
         typeof data.id === 'string' && 
         typeof data.client_id === 'string';
};

// ✅ NUEVO: Tipo para respuesta de Supabase con datos adicionales
export interface SupabaseAdditionalDataResponse {
  data: AdditionalClientData[] | null;
  error: any;
}

// ✅ NUEVO: Tipo para respuesta de Supabase con llamadas
export interface SupabaseCallsResponse {
  data: any[] | null;
  error: any;
}

// ✅ NUEVO: Tipo para estadísticas de relación
export interface RelationshipStats {
  totalCalls: number;
  totalAdditional: number;
  callsWithRetellId: number;
  additionalWithRetellId: number;
  matchedRelations: number;
  matchRate: number;
}

// ✅ AGREGAR AL FINAL:
export interface OSDOPClientData extends AdditionalClientData {
  // Compatibilidad con código existente
}

export interface GenericClientData extends AdditionalClientData {
  // Para otros clientes
}

export interface AdditionalDataFilters {
  estado_tramite?: string;
  tipo_tramite?: string;
  canal_contacto?: string;
  localidad?: string;
  data_source?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}