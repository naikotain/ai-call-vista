// Configuración específica para campos adicionales por cliente
export const ADDITIONAL_DATA_CONFIG = {
  // ✅ CONFIGURACIÓN PARA CLIENTE1 Y CLIENTE2 (OSDOP - Consultas médicas)
  'cliente1': {
    tableTitle: '📋 Datos de Consultas y Trámites - OSDOP',
    columns: [
      { key: 'fecha', displayName: 'Fecha Registro' },
      { key: 'nombre', displayName: 'Nombre' },
      { key: 'segundo_nombre', displayName: 'Segundo Nombre' },
      { key: 'telefono', displayName: 'Teléfono' },
      { key: 'numero_afiliado', displayName: 'N° Afiliado' },
      { key: 'motivo_consulta', displayName: 'Motivo Consulta' },
      { key: 'tipo_tramite', displayName: 'Tipo Trámite' },
      { key: 'localidad', displayName: 'Localidad' },
      { key: 'estado_tramite', displayName: 'Estado' }
    ]
  },
  
  'cliente2': {
    tableTitle: '📋 Datos de Consultas y Trámites - OSDOP',
    columns: [
      { key: 'fecha', displayName: 'Fecha Registro' },
      { key: 'nombre', displayName: 'Nombre' },
      { key: 'segundo_nombre', displayName: 'Segundo Nombre' },
      { key: 'telefono', displayName: 'Teléfono' },
      { key: 'numero_afiliado', displayName: 'N° Afiliado' },
      { key: 'motivo_consulta', displayName: 'Motivo Consulta' },
      { key: 'tipo_tramite', displayName: 'Tipo Trámite' },
      { key: 'localidad', displayName: 'Localidad' },
      { key: 'estado_tramite', displayName: 'Estado' }
    ]
  },
  
  // ✅ NUEVA CONFIGURACIÓN PARA CLIENTE3 (INMOBILIARIA)
  'cliente3': {
    tableTitle: '🏢 Propiedades Inmobiliarias',
    columns: [
      { key: 'fecha', displayName: 'Fecha Registro' },
      { key: 'tipo_tramite', displayName: 'Tipo Propiedad' },
      { key: 'motivo_consulta', displayName: 'Precio' },
      { key: 'localidad', displayName: 'Calle' },
      { key: 'nombre', displayName: 'Ciudad/Barrio' },
      { key: 'numero_afiliado', displayName: 'Habitaciones' },
      { key: 'telefono', displayName: 'Baños' },
      { key: 'segundo_nombre', displayName: 'Garaje' },
      { key: 'estado_tramite', displayName: 'Piscina' },
      { key: 'especialidad', displayName: 'Trastero' },
      { key: 'nombre_prestador', displayName: 'Asesor' },
      { key: 'horario_actual', displayName: 'Teléfono' }
    ],
    // 🔧 CONFIGURACIÓN ESPECÍFICA DE FORMATOS PARA INMOBILIARIA
    fieldConfig: {
      fecha: { type: 'date', format: 'DD/MM/YYYY' },
      'motivo_consulta': { 
        type: 'currency', 
        currency: 'EUR',
        style: 'currency'
      },
      'numero_afiliado': { type: 'number' },
      'telefono': { type: 'number' },
      'segundo_nombre': {
        type: 'badge',
        variants: {
          'SI': 'default',
          'NO': 'secondary'
        }
      },
      'estado_tramite': {
        type: 'badge', 
        variants: {
          'SI': 'default',
          'NO': 'secondary'
        }
      },
      'especialidad': {
        type: 'badge',
        variants: {
          'SI': 'default',
          'NO': 'secondary'
        }
      }
    }
  }
};

// Helper para obtener configuración del cliente
export const getAdditionalDataConfig = (clientId: string) => {
  return ADDITIONAL_DATA_CONFIG[clientId as keyof typeof ADDITIONAL_DATA_CONFIG] || 
         ADDITIONAL_DATA_CONFIG['cliente1']; // Fallback a cliente1
};