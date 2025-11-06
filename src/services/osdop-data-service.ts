import { OSDOPClientData, AdditionalDataFilters } from '../types/additional-data';
import { CLIENT_CONFIGS } from '../config/clients';
import { getSupabaseClient } from '../integrations/supabase/multi-client';

export class OSDOPDataService {
  static async getOSDOPData(
    clientId: string, 
    filters?: AdditionalDataFilters
  ): Promise<OSDOPClientData[]> {
    console.log('🔧 OSDOPDataService.getOSDOPData - clientId:', clientId);
    
    const clientConfig = CLIENT_CONFIGS[clientId];
    
    if (!clientConfig) {
      console.error(`❌ Cliente "${clientId}" no encontrado en CLIENT_CONFIGS`);
      return [];
    }

    const supabase = getSupabaseClient();
    
    console.log('🔧 Configuración del cliente:', clientConfig);
    console.log('🔧 Tabla a usar:', clientConfig.tables.additional_data);
    
    try {
      // ✅ QUERY SIMPLIFICADA - Sin JOIN problemático
      let query = supabase
        .from(clientConfig.tables.additional_data)
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      // Aplicar filtros específicos
      if (filters?.estado_tramite) {
        query = query.eq('estado_tramite', filters.estado_tramite);
      }
      if (filters?.tipo_tramite) {
        query = query.eq('tipo_tramite', filters.tipo_tramite);
      }
      if (filters?.canal_contacto) {
        query = query.eq('canal_contacto', filters.canal_contacto);
      }
      if (filters?.localidad) {
        query = query.eq('localidad', filters.localidad);
      }
      if (filters?.data_source) {
        query = query.eq('data_source', filters.data_source);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching OSDOP data:', error);
        return [];
      }

      console.log('✅ Datos obtenidos de Supabase:', data?.length || 0, 'registros');
      
      // ✅ Transformar datos sin información de llamadas
      return (data || []).map(item => ({
        ...item,
        call_data: undefined // No tenemos información de llamadas por ahora
      }));
    } catch (error) {
      console.error('❌ Error inesperado en getOSDOPData:', error);
      return [];
    }
  }

  static async getUniqueValues(clientId: string, field: string): Promise<string[]> {
    console.log('🔧 OSDOPDataService.getUniqueValues - clientId:', clientId, 'field:', field);
    
    const clientConfig = CLIENT_CONFIGS[clientId];
    
    if (!clientConfig) {
      console.error(`❌ Cliente "${clientId}" no encontrado en CLIENT_CONFIGS`);
      return [];
    }

    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from(clientConfig.tables.additional_data)
        .select(field)
        .eq('client_id', clientId)
        .not(field, 'is', null);

      if (error) {
        console.error(`❌ Error fetching unique ${field}:`, error);
        return [];
      }

      const uniqueValues = [...new Set(data?.map(item => item[field]))].filter(Boolean);
      console.log(`✅ Valores únicos para ${field}:`, uniqueValues);
      
      return uniqueValues as string[];
    } catch (error) {
      console.error('❌ Error inesperado en getUniqueValues:', error);
      return [];
    }
  }
}