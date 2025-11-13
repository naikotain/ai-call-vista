export const CLIENT_CONFIGS = {
  'cliente1': {
    name: 'Cliente 1',
    supabaseUrl: 'https://bfahlnyfrurjenjwinoc.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmYWhsbnlmcnVyamVuandpbm9jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyODI2NjUsImV4cCI6MjA3Nzg1ODY2NX0.hbYWAAAar4WpDs_wA8B8hl2s88_MAlAAG2WXx-lsFDg',
    tables: {
      calls: 'calls',
      agents: 'agents',
      additional_data: 'additional_client_data'
    }
  },
  'cliente2': {
    name: 'Cliente 2',
    supabaseUrl: 'https://lwdgzocpgunadfuyeluz.supabase.co',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3ZGd6b2NwZ3VuYWRmdXllbHV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NTgwOTgsImV4cCI6MjA3MjMzNDA5OH0.jhXPpzri5GJFp7V1w7smmP00teqGjlwlnrplsJeVR90',
    tables: {
      calls: 'calls',
      agents: 'agents',
      additional_data: 'additional_client_data' // ← AÑADIR ESTO
    }
  },
  'cliente3': {
    name: 'Cliente 3',
    supabaseUrl: 'https://jpsupabase.desinginar.es',
    supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.kL8M-uodamXeHE7LIoJ0GnEiR4R1YlBiTnbuO4QudLY',
    tables: {
      calls: 'calls',
      agents: 'agents',
      additional_data: 'additional_client_data'
    }
  }
};


export const DEFAULT_CLIENT = 'cliente1';