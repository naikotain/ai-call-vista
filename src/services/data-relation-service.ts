import { supabase } from '../lib/supabase';
import { getSupabaseClient } from '../lib/supabase';

import { 
  NormalizedCall, 
  AdditionalClientData, 
  CallWithAdditionalData, 
  AdditionalDataWithCall,
  isNormalizedCall,
  isAdditionalClientData
} from '../types/normalized';

export class DataRelationService {
  
  /**
   * Obtiene llamadas con sus datos adicionales relacionados por call_id_retell
   */
  static async getCallsWithAdditionalData(clientId: string): Promise<CallWithAdditionalData[]> {
    const supabase = getSupabaseClient(clientId); // ✅ Usar cliente dinámico
    
    try {
      console.log(`🔗 [DataRelationService] Relacionando datos para cliente: ${clientId}`);
   
      
      // El resto del código se mantiene IGUAL...
      const [callsResponse, additionalDataResponse] = await Promise.all([
        supabase
          .from('calls')
          .select('*')
          .order('started_at', { ascending: false }),
        
        supabase
          .from('additional_client_data')
          .select('*')
          .eq('client_id', clientId)
          .eq('is_visible', true)
      ]);

      if (callsResponse.error) {
        console.error('❌ Error fetching calls:', callsResponse.error);
        throw new Error(`Error fetching calls: ${callsResponse.error.message}`);
      }
      
      if (additionalDataResponse.error) {
        console.error('❌ Error fetching additional data:', additionalDataResponse.error);
        throw new Error(`Error fetching additional data: ${additionalDataResponse.error.message}`);
      }

      const calls = callsResponse.data || [];
      const additionalData = additionalDataResponse.data || [];

      console.log(`📊 [DataRelationService] Calls: ${calls.length}, Additional: ${additionalData.length}`);

      // Normalizar llamadas y relacionar datos
      const normalizedCalls = calls.map(call => this.normalizeCallData(call, clientId));
      
      // Relacionar datos por call_id_retell
      const callsWithAdditionalData = normalizedCalls.map(call => {
        const relatedAdditional = additionalData.find(additional => {
          // Intentar relación por call_id_retell primero, luego por call_id (legacy)
          if (call.call_id_retell && additional.call_id_retell) {
            return additional.call_id_retell === call.call_id_retell;
          }
          // Fallback a relación por ID legacy
          return additional.call_id === call.id;
        });

        return {
          ...call,
          additional_data: relatedAdditional || null
        };
      });

      const relatedCount = callsWithAdditionalData.filter(c => c.additional_data).length;
      console.log(`✅ [DataRelationService] Relación completada: ${relatedCount}/${callsWithAdditionalData.length} llamadas tienen datos adicionales`);
      
      return callsWithAdditionalData;

    } catch (error) {
      console.error('❌ [DataRelationService] Error crítico:', error);
      throw error;
    }
  }

  /**
   * Obtiene datos adicionales con información de llamada relacionada
   */
  static async getAdditionalDataWithCalls(clientId: string): Promise<AdditionalDataWithCall[]> {
    const supabase = getSupabaseClient(clientId); // ✅ Usar cliente dinámico
    
    try {
      console.log(`🔗 [DataRelationService] Obteniendo datos para cliente: ${clientId}`);

      
      const [additionalResponse, callsResponse] = await Promise.all([
        supabase
          .from('additional_client_data')
          .select('*')
          .eq('client_id', clientId) // ✅ AGREGAR este filtro que falta
          .eq('is_visible', true)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('calls')
          .select('*')
      ]);

    console.log('📊 [DataRelationService] Respuesta additional:', additionalResponse);
    console.log('📊 [DataRelationService] Respuesta calls:', callsResponse);

    if (additionalResponse.error) {
      console.error('❌ Error en additional:', additionalResponse.error);
      throw additionalResponse.error;
    }
    if (callsResponse.error) {
      console.error('❌ Error en calls:', callsResponse.error);
      throw callsResponse.error;
    }

    const additionalData = additionalResponse.data || [];
    const calls = callsResponse.data || [];

    console.log(`📈 [DataRelationService] Datos encontrados:`, {
      additionalDataCount: additionalData.length,
      callsCount: calls.length,
      clientId: clientId
    });

    // Mostrar los call_id_retell que se están comparando
    console.log('🔍 Call IDs para relación:', {
      additionalRetellIds: additionalData.map(a => a.call_id_retell),
      callsRetellIds: calls.map(c => c.call_id_retell)
    });

    const result = additionalData.map(additional => {
      const relatedCall = calls.find(call => {
        const match = call.call_id_retell === additional.call_id_retell;
        if (match) {
          console.log(`✅ Match encontrado: ${additional.call_id_retell} -> ${call.customer_phone}`);
        }
        return match;
      });

      return {
        ...additional,
        call_data: relatedCall || null
      };
    });

    console.log(`🎯 [DataRelationService] Resultado final:`, {
      total: result.length,
      withCalls: result.filter(r => r.call_data).length,
      withoutCalls: result.filter(r => !r.call_data).length
    });

    return result;

  } catch (error) {
    console.error('❌ [DataRelationService] Error crítico:', error);
    throw error;
  }
}
  /**
   * Normaliza los datos de llamada desde Supabase al formato interno
   */
  private static normalizeCallData(call: any, clientId: string): NormalizedCall {
    // Calcular duración en segundos
    const duration = call.duration ? parseInt(call.duration) || 0 : 0;
    
    // Calcular costo basado en duración y país (simplificado)
    const cost = call.retell_cost || this.calculateCallCost(duration, call.country_code);
    
    // Normalizar status interno
    const status = this.normalizeInternalStatus(call.status, call.disconnect_reason);
    
    // Normalizar tipo de llamada
    const call_type = call.tipo_de_llamada === 'inbound' ? 'inbound' : 'outbound';

    return {
      id: call.id,
      status,
      call_type,
      sentiment: call.sentiment as any,
      duration,
      cost,
      customer_phone: call.customer_phone || '',
      country_code: call.country_code,
      country_name: call.country_name,
      started_at: call.started_at,
      ended_at: call.ended_at,
      disconnect_reason: call.disconnect_reason,
      transcription: call.transcription,
      resumen_llamada: call.resumen_llamada,
      agent_id: call.api, // FK a agents
      channel: call.channel,
      objetivo_de_la_llamada: call.objetivo_de_la_llamada,
      call_id: call.call_id,
      numero_agente: call.numero_agente,
      latency: call.latency,
      
      // ✅ NUEVO CAMPO PARA RELACIÓN
      call_id_retell: call.call_id_retell,
      
      // Campos legacy para compatibilidad
      call_status: call.status,
      call_successful: status === 'successful',
      timestamp: call.started_at,
      call_objective: call.objetivo_de_la_llamada,
      call_summary: call.resumen_llamada,
      agent_number: call.numero_agente,
      
      // Metadata
      _raw: call,
      _client: clientId
    };
  }

  /**
   * Normaliza el status interno basado en status y disconnect_reason
   */
  private static normalizeInternalStatus(status: string, disconnect_reason?: string): any {
    if (status === 'Ongoing') return 'ongoing';
    if (status === 'Ended' && disconnect_reason === 'Call ended by user') return 'successful';
    if (status === 'Ended' && disconnect_reason === 'Voicemail') return 'voicemail';
    if (status === 'Ended' && disconnect_reason?.includes('Transferred')) return 'transferred';
    if (status === 'Error' || status === 'Not Connected') return 'failed';
    return 'failed'; // default
  }

  /**
   * Calcula costo de llamada simplificado
   */
  private static calculateCallCost(duration: number, countryCode?: string): number {
    const costPerMinute = countryCode === 'US' ? 0.015 : 0.02; // USD
    return (duration / 60) * costPerMinute;
  }

  /**
   * Método de utilidad: Obtiene estadísticas de relación
   */
  static async getRelationshipStats(clientId: string) {
    try {
      const [calls, additionalData] = await Promise.all([
        supabase.from('calls').select('call_id_retell'),
        supabase.from('additional_client_data').select('call_id_retell').eq('client_id', clientId).eq('is_visible', true)
      ]);

      const callsWithRetellId = calls.data?.filter(call => call.call_id_retell) || [];
      const additionalWithRetellId = additionalData.data?.filter(additional => additional.call_id_retell) || [];

      // Encontrar matches
      const matchedIds = callsWithRetellId.filter(call => 
        additionalWithRetellId.some(additional => additional.call_id_retell === call.call_id_retell)
      );

      return {
        totalCalls: calls.data?.length || 0,
        totalAdditional: additionalData.data?.length || 0,
        callsWithRetellId: callsWithRetellId.length,
        additionalWithRetellId: additionalWithRetellId.length,
        matchedRelations: matchedIds.length,
        matchRate: callsWithRetellId.length > 0 ? (matchedIds.length / callsWithRetellId.length) * 100 : 0
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return null;
    }
  }
}