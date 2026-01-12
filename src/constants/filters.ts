// Advanced filter configuration for auto parts

// 1. Base Filters per Category (The first level of filtering)
export const EXTENDED_FILTERS: Record<string, { key: string; label: string; options: string[] }[]> = {
  'Freios': [
    { key: 'component', label: 'Componente', options: ['Pastilha', 'Disco', 'Tambor', 'Sapata', 'Cilindro Mestre', 'Fluido', 'Sensor ABS'] },
    { key: 'position', label: 'Posição', options: ['Dianteira', 'Traseira', 'Ambos'] },
  ],
  'Suspensão': [
    { key: 'component', label: 'Componente', options: ['Amortecedor', 'Mola', 'Bieleta', 'Bucha', 'Bandeja', 'Coxim', 'Batente'] },
    { key: 'position', label: 'Posição', options: ['Dianteira', 'Traseira'] },
  ],
  'Motor': [
    { key: 'component', label: 'Componente', options: ['Vela', 'Cabo de Vela', 'Correia', 'Tensor', 'Bomba D\'água', 'Junta', 'Filtro', 'Pistão', 'Anéis', 'Válvula', 'Radiador'] },
  ],
  'Transmissão': [
    { key: 'component', label: 'Componente', options: ['Embreagem', 'Homocinética', 'Semieixo', 'Óleo Câmbio', 'Sincronizado', 'Tulipa', 'Trizeta'] },
  ],
  'Elétrica': [
    { key: 'component', label: 'Componente', options: ['Lâmpada', 'Bateria', 'Fusível', 'Alternador', 'Motor de Arranque', 'Sensor', 'Bobina', 'Chave de Seta'] },
  ],
  'Óleo': [
    { key: 'viscosity', label: 'Viscosidade', options: ['0W20', '5W30', '5W40', '10W40', '15W40', '20W50'] },
    { key: 'type', label: 'Base', options: ['Sintético', 'Semissintético', 'Mineral'] },
    { key: 'api', label: 'Norma API', options: ['SL', 'SM', 'SN', 'SP'] }
  ],
  'Pneus': [
    { key: 'rim', label: 'Aro', options: ['R13', 'R14', 'R15', 'R16', 'R17', 'R18', 'R19'] },
    { key: 'width', label: 'Largura', options: ['175', '185', '195', '205', '215', '225', '235'] },
    { key: 'profile', label: 'Perfil', options: ['40', '45', '50', '55', '60', '65', '70', '75', '80'] }
  ],
};

// 2. Component Dependent Filters (The "Smart" Level)
// These appear ONLY when a specific 'component' is selected in the category
export const COMPONENT_DEPENDENT_FILTERS: Record<string, { key: string; label: string; options: string[] }[]> = {
  // --- MOTOR COMPONENTS ---
  'Vela': [
    { key: 'electrode_type', label: 'Tipo Eletrodo', options: ['Níquel', 'Platina', 'Iridium', 'Rutênio'] },
    { key: 'thread_size', label: 'Rosca', options: ['10mm', '12mm', '14mm'] },
    { key: 'hex_size', label: 'Sextavado', options: ['14mm', '16mm', '21mm'] },
    { key: 'heat_range', label: 'Grau Térmico', options: ['Quente', 'Frio'] }
  ],
  'Correia': [
    { key: 'profile', label: 'Perfil', options: ['Dentada', 'Poly-V', 'V'] },
    { key: 'material', label: 'Material', options: ['HNBR', 'CR (Cloropreno)', 'EPDM'] },
  ],
  'Junta': [
    { key: 'gasket_position', label: 'Aplicação', options: ['Cabeçote', 'Tampa de Válvula', 'Carter', 'Coletor Adm.', 'Coletor Esc.'] },
    { key: 'material', label: 'Material', options: ['Fibra (Amianto)', 'Metal (MLS)', 'Cortiça', 'Borracha'] }
  ],
  'Bomba D\'água': [
    { key: 'impeller_material', label: 'Material Rotor', options: ['Plástico', 'Metal'] },
    { key: 'housing', label: 'Com Carcaça?', options: ['Sim', 'Não (Refil)'] }
  ],
  'Filtro': [
    { key: 'filter_specific_type', label: 'Aplicação', options: ['Óleo', 'Ar Motor', 'Combustível', 'Cabine'] },
    { key: 'structure', label: 'Estrutura', options: ['Blindado', 'Refil (Ecológico)'] }
  ],

  // --- ELÉTRICA COMPONENTS ---
  'Lâmpada': [
    { key: 'socket', label: 'Encaixe', options: ['H1', 'H3', 'H4', 'H7', 'H8', 'H11', 'H16', 'H27', 'HB3', 'HB4', 'T10 (Pingo)', '1 Polo', '2 Polos'] },
    { key: 'technology', label: 'Tecnologia', options: ['Halógena', 'LED', 'Xênon', 'Super Branca'] },
    { key: 'color_temp', label: 'Cor (Kelvin)', options: ['3000K (Amarela)', '4300K (Original)', '6000K (Branca)', '8000K (Azulada)'] },
    { key: 'voltage', label: 'Voltagem', options: ['12V', '24V'] }
  ],
  'Bateria': [
    { key: 'amperage', label: 'Amperagem', options: ['40Ah', '45Ah', '48Ah', '50Ah', '60Ah', '70Ah', '80Ah', '90Ah'] },
    { key: 'pole', label: 'Polo Positivo', options: ['Direito', 'Esquerdo'] },
    { key: 'technology', label: 'Tecnologia', options: ['Convencional (SLI)', 'EFB (Start-Stop)', 'AGM (Start-Stop Premium)'] },
    { key: 'size_std', label: 'Padrão Caixa', options: ['Caixa Alta', 'Caixa Baixa'] }
  ],
  'Fusível': [
    { key: 'fuse_type', label: 'Tamanho', options: ['Lâmina Mini', 'Lâmina Padrão', 'Lâmina Maxi', 'Vidro', 'Cartucho'] },
    { key: 'amperage', label: 'Amperagem', options: ['5A', '7.5A', '10A', '15A', '20A', '25A', '30A', '40A', '50A'] }
  ],
  'Alternador': [
    { key: 'amperage_output', label: 'Amperagem', options: ['70A', '90A', '120A', '150A'] },
    { key: 'pulley', label: 'Polia', options: ['Rígida', 'Roda Livre'] }
  ],

  // --- TRANSMISSÃO COMPONENTS ---
  'Embreagem': [
    { key: 'kit_content', label: 'Conteúdo', options: ['Completo (Platô+Disco+Atuador)', 'Básico (Platô+Disco)'] },
    { key: 'actuation', label: 'Acionamento', options: ['Cabo', 'Hidráulico'] },
  ],
  'Homocinética': [
    { key: 'joint_position', label: 'Posição', options: ['Roda (Fixa)', 'Câmbio (Deslizante)'] },
    { key: 'abs_ring', label: 'Anel ABS', options: ['Com ABS', 'Sem ABS'] }
  ],
  'Óleo Câmbio': [
    { key: 'transmission_type', label: 'Tipo Câmbio', options: ['Manual', 'Automático', 'CVT', 'Dupla Embreagem'] },
    { key: 'viscosity', label: 'Viscosidade', options: ['75W80', '75W90', '80W90', 'ATF Dexron III', 'ATF Dexron VI', 'CVT Fluid'] }
  ],

  // --- FREIOS & SUSPENSÃO ---
  'Pastilha': [
     { key: 'material', label: 'Material', options: ['Cerâmica', 'Semimetálica', 'Metálica', 'Orgânica'] },
     { key: 'sensor', label: 'Sensor', options: ['Com Sensor', 'Sem Sensor'] }
  ],
  'Disco': [
     { key: 'disc_type', label: 'Tipo', options: ['Ventilado', 'Sólido'] },
     { key: 'carbon_content', label: 'Liga', options: ['Convencional', 'High Carbon'] }
  ],
  'Amortecedor': [
      { key: 'type', label: 'Tecnologia', options: ['Gás (Pressurizado)', 'Óleo (Convencional)'] },
      { key: 'fixation', label: 'Fixação', options: ['Pino/Pino', 'Olhal/Olhal', 'Pino/Olhal'] }
  ]
};
