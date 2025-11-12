import { getFieldMapping, getValueMapping } from '../config/field-mappings';
import { NormalizedCall, InternalStatus, CallType, Sentiment } from '../types/normalized';

export class DataNormalizer {
  static normalizeCallData(rawData: any, clientId: string, allRawData?: any[]): NormalizedCall {

    // ✅ Obtener mapeo con detección automática si es necesario
    const fieldMap = getFieldMapping(clientId, allRawData);
    const valueMap = getValueMapping(clientId);


    
    // Obtener valores raw
    const rawStatus = rawData[fieldMap.status];
    const rawCallType = rawData[fieldMap.call_type];
    const rawSentiment = rawData[fieldMap.sentiment];
    
    // Normalizar valores con type safety
    const normalizedStatus = this.normalizeStatus(rawStatus, valueMap.status);
    const normalizedCallType = this.normalizeCallType(rawCallType, valueMap.call_type);
    const normalizedSentiment = this.normalizeSentiment(rawSentiment, valueMap.sentiment);

   // console.log('🔍 NORMALIZACIÓN STATUS:', {
   // rawStatus,
   // normalizedStatus: this.normalizeValue(rawStatus, valueMap.status, 'failed'),
   // valueMapping: valueMap.status
    // });

    
    return {
      // Campos principales con tipos específicos
      id: rawData[fieldMap.id] || '',
      status: normalizedStatus,
      call_type: normalizedCallType,
      sentiment: normalizedSentiment,
      duration: this.parseNumber(rawData[fieldMap.duration]),
      cost: this.parseNumber(rawData[fieldMap.cost]),
      customer_phone: rawData[fieldMap.customer_phone] || '',
      country_code: rawData[fieldMap.country_code],
      country_name: rawData[fieldMap.country_name],
      started_at: rawData[fieldMap.started_at] || rawData.created_at,
      ended_at: rawData[fieldMap.ended_at],
      disconnect_reason: rawData[fieldMap.disconnect_reason],
      transcription: rawData[fieldMap.transcription],
      resumen_llamada: rawData[fieldMap.resumen_llamada],
      agent_id: rawData[fieldMap.agent_id],
      channel: rawData[fieldMap.channel],
      objetivo_de_la_llamada: rawData[fieldMap.objetivo_de_la_llamada],
      call_id: rawData[fieldMap.call_id],
      numero_agente: rawData[fieldMap.numero_agente],
      latency: this.parseNumber(rawData[fieldMap.latency]),
      
      // Campos legacy (mantener por compatibilidad)
      call_status: rawData[fieldMap.call_status],
      call_successful: rawData[fieldMap.call_successful],
      timestamp: rawData[fieldMap.timestamp],
      call_objective: rawData[fieldMap.call_objective],
      call_summary: rawData[fieldMap.call_summary],
      agent_number: rawData[fieldMap.agent_number],
      
      // Metadata
      _raw: process.env.NODE_ENV === 'development' ? rawData : undefined,
      _client: clientId
    };


  }
  
  // Normalizar un array completo de llamadas
  static normalizeCallsData(rawCalls: any[], clientId: string): NormalizedCall[] {
    // ✅ Pasar todos los datos raw para detección automática
    return rawCalls.map(call => this.normalizeCallData(call, clientId, rawCalls));
  }
  
  // Normalizadores específicos con type safety
  private static normalizeStatus(value: any, valueMapping?: Record<string, string>): InternalStatus {

    const normalized = this.normalizeValue(value, valueMapping, 'failed');
    const validStatuses: InternalStatus[] = ['successful', 'failed', 'voicemail', 'transferred', 'ongoing'];
    return validStatuses.includes(normalized as InternalStatus) ? normalized as InternalStatus : 'failed';

    
  }
  
  private static normalizeCallType(value: any, valueMapping?: Record<string, string>): CallType {
    const normalized = this.normalizeValue(value, valueMapping, 'inbound');
    return (normalized === 'inbound' || normalized === 'outbound') ? normalized as CallType : 'inbound';
  }
  
  private static normalizeSentiment(value: any, valueMapping?: Record<string, string>): Sentiment | undefined {
    if (!value) return undefined;
    const normalized = this.normalizeValue(value, valueMapping);
    const validSentiments: Sentiment[] = ['positive', 'negative', 'neutral'];
    return validSentiments.includes(normalized as Sentiment) ? normalized as Sentiment : undefined;
  }
  
  private static normalizeValue(
    value: any, 
    valueMapping?: Record<string, string>,
    defaultValue: string = ''
  ): string {
    if (value === null || value === undefined) return defaultValue;
    
    const stringValue = String(value).trim();
    
    // Buscar mapeo exacto
    if (valueMapping && valueMapping[stringValue]) {
      return valueMapping[stringValue];
    }
    
    // Buscar mapeo case-insensitive
    if (valueMapping) {
      const lowerValue = stringValue.toLowerCase();
      for (const [key, mappedValue] of Object.entries(valueMapping)) {
        if (key.toLowerCase() === lowerValue) {
          return mappedValue;
        }
      }
    }
    
    // Si no hay mapeo, devolver el valor original
    return stringValue || defaultValue;
  }
  
  private static parseNumber(value: any): number {
  if (value === null || value === undefined) return 0;
  

  
  // Manejar formato "1m 30s"
  if (typeof value === 'string' && (value.includes('m') || value.includes('s'))) {
    const minutesMatch = value.match(/(\d+)m/);
    const secondsMatch = value.match(/(\d+)s/);
    
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
    const seconds = secondsMatch ? parseInt(secondsMatch[1]) : 0;
    
    const resultado = (minutes * 60) + seconds;

    return resultado;
  }
  
  // ✅ AGREGAR MANEJO DE FORMATO "MM:SS" (como "0:21")
  if (typeof value === 'string' && /^\d+:\d{1,2}$/.test(value)) {
    const [minutes, seconds] = value.split(':').map(Number);
    const resultado = (minutes * 60) + seconds;

    return resultado;
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : Number(value);
  const resultado = isNaN(num) ? 0 : num;

  return resultado;
}
  
// Método para debug - CORREGIDO
static inspectDataFields(rawData: any[], clientId: string): void {
  if (!rawData.length) return;
  
  const fieldMap = getFieldMapping(clientId);
  const sample = rawData[0];
  

  
  Object.entries(fieldMap).forEach(([internalField, externalField]) => {
    // ✅ AGREGAR VERIFICACIÓN DE TIPO
    const fieldName = externalField as string;
    const exists = sample.hasOwnProperty(fieldName);
    const value = sample[fieldName]; // ✅ Ahora TypeScript sabe que es string
    
    console.log(`${internalField} -> ${fieldName}: ${exists ? '✅' : '❌'} = ${value}`);
  });
  
  console.log('--- PRIMERA LLAMADA NORMALIZADA ---');
  const normalized = this.normalizeCallData(sample, clientId);
  console.log(normalized);
}





 
}