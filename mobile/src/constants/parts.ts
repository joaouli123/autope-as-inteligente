// Part position options (4 standard positions)
// Must match database schema constraints
export const PART_POSITION_OPTIONS = [
  { value: 'Dianteiro Direito', label: 'Dianteiro Direito' },
  { value: 'Dianteiro Esquerdo', label: 'Dianteiro Esquerdo' },
  { value: 'Traseiro Direito', label: 'Traseiro Direito' },
  { value: 'Traseiro Esquerdo', label: 'Traseiro Esquerdo' },
] as const;

export type PartPosition = typeof PART_POSITION_OPTIONS[number]['value'];
