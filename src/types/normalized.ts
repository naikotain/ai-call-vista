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

// Tipo guard para verificar datos normalizados
export const isNormalizedCall = (data: any): data is NormalizedCall => {
  return data && 
         typeof data.status === 'string' && 
         typeof data.call_type === 'string' &&
         typeof data.duration === 'number';
};

// ❌ ELIMINAR ESTA LÍNEA - YA SE EXPORTARON ARRIBA
// export type { InternalStatus, CallType, Sentiment };