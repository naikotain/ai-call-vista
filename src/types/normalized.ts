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

// Tipo para datos adicionales del cliente
export interface AdditionalClientData {
  id: string;
  created_at: string;
  call_id?: string; // FK a calls (legacy)
  call_id_retell?: string; // ✅ NUEVO CAMPO PARA RELACIÓN
  client_id: string;
  
  // Campos fijos para OSDOP
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
  
  // Campos flexibles para otros clientes
  custom_fields?: Record<string, any>;
  data_source?: string;
  is_visible?: boolean;
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