export const colors = {
    slate: '#334155',
    slateDark: '#1e293b',
    orange: '#ea580c',
    bg: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    text: '#0f172a',
    textMuted: '#64748b',
    green: '#16a34a',
    purple: '#7c3aed',
  } as const;
  
  export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
  
  export const radius = { sm: 6, md: 10, lg: 14, pill: 999 } as const;
  
  export const type = {
    title: { fontSize: 22, fontWeight: '800' },
    heading: { fontSize: 17, fontWeight: '700' },
    body: { fontSize: 15, fontWeight: '400' },
    small: { fontSize: 13, fontWeight: '400' },
    tiny: { fontSize: 11, fontWeight: '500' },
  } as const;
  