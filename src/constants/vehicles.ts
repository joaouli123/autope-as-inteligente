// Vehicle registration data lists
export const ENGINE_OPTIONS = ['1.0', '1.3', '1.4', '1.5', '1.6', '1.8', '2.0', '2.2', '2.4', '2.5', '3.0', '4.0+'];
export const VALVE_OPTIONS = ['8v', '12v', '16v', '20v', '24v'];
export const FUEL_OPTIONS = ['Flex', 'Gasolina', 'Etanol', 'Diesel', 'Híbrido', 'Elétrico'];
export const TRANSMISSION_OPTIONS = ['Manual', 'Automático', 'CVT', 'Automatizado (Robô)'];

// Part position options (6 standard positions)
export const PART_POSITION_OPTIONS = [
  'Dianteiro Direito',
  'Dianteiro Esquerdo',
  'Traseiro Direito',
  'Traseiro Esquerdo',
  'Central',
  'Universal',
] as const;

export type PartPosition = typeof PART_POSITION_OPTIONS[number];
