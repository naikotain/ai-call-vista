// TIPO ESPECÍFICO para este cliente con sus 14 campos exactos
export interface OSDOPClientData {
  id: string;
  created_at: string;
  call_id: string | null;
  client_id: string;
  
  // CAMPOS EXACTOS del CSV
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
  
  // Información de la llamada (si existe)
  call_data?: {
    customer_phone: string;
    started_at: string;
    duration: string;
    status: string;
    agent_name?: string;
  };
  
  data_source: 'call' | 'historical' | 'manual';
}

// Tipo genérico para otros clientes
export interface GenericClientData {
  id: string;
  created_at: string;
  call_id: string | null;
  client_id: string;
  custom_fields: Record<string, any>;
  data_source: string;
}

export type AdditionalClientData = OSDOPClientData | GenericClientData;

export interface AdditionalDataFilters {
  estado_tramite?: string;
  tipo_tramite?: string;
  canal_contacto?: string;
  localidad?: string;
  data_source?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}