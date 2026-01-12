
import { Product, Store, Vehicle } from '../types';

export const STORES: Store[] = [
  { id: 's1', name: 'Auto Peças Central', rating: 4.8, address: 'Av. Principal, 100', distance: '2.5 km' },
  { id: 's2', name: 'Mecânica do Zé', rating: 4.2, address: 'Rua das Oficinas, 45', distance: '5.0 km' },
  { id: 's3', name: 'Express Parts', rating: 4.9, address: 'Av. Industrial, 880', distance: '1.2 km' },
];

// Rich Data for testing complex filters
export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Pastilha de Freio Dianteira Cerâmica',
    description: 'Jogo de pastilhas cerâmicas de alta durabilidade, baixo ruído e menor poeira.',
    price: 145.90,
    category: 'Freios',
    imageUrl: 'https://images.unsplash.com/photo-1626245969248-0d1279268574?auto=format&fit=crop&w=300&q=80',
    storeId: 's1',
    compatibleModels: ['Onix', 'Prisma', 'Cobalt'],
    specifications: {
      component: 'Pastilha',
      position: 'Dianteira',
      material: 'Cerâmica',
      system: 'Teves',
      sensor: 'Sem Sensor'
    }
  },
  {
    id: 'p2',
    name: 'Óleo Sintético 5W30 API SP',
    description: 'Óleo motor 100% sintético para máxima performance e economia de combustível.',
    price: 49.90,
    category: 'Óleo',
    imageUrl: 'https://images.unsplash.com/photo-1628522379768-3e2849845353?auto=format&fit=crop&w=300&q=80',
    storeId: 's3',
    compatibleModels: ['Onix', 'HB20', 'Gol', 'Civic', 'Corolla'],
    specifications: {
      viscosity: '5W30',
      type: 'Sintético',
      api: 'SP'
    }
  },
  {
    id: 'p4',
    name: 'Amortecedor Traseiro Pressurizado (Par)',
    description: 'Par de amortecedores a gás (Turbo Gás), garantia de 2 anos.',
    price: 289.00,
    category: 'Suspensão',
    imageUrl: 'https://images.unsplash.com/photo-1552857865-0c7f8a7e3661?auto=format&fit=crop&w=300&q=80',
    storeId: 's1',
    compatibleModels: ['Gol', 'Saveiro', 'Voyage'],
    specifications: {
      component: 'Amortecedor',
      position: 'Traseira',
      type: 'Gás (Pressurizado)',
      side: 'Ambos',
      fixation: 'Olhal/Pino'
    }
  },
  {
    id: 'p5',
    name: 'Kit Correia Dentada + Tensor',
    description: 'Kit completo de distribuição. Ideal para motores 1.0 e 1.4 GM.',
    price: 199.50,
    category: 'Motor',
    imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ed5fa?auto=format&fit=crop&w=300&q=80',
    storeId: 's3',
    compatibleModels: ['Onix', 'Prisma', 'Celta'],
    specifications: {
      component: 'Correia',
      profile: 'Dentada',
      material: 'HNBR',
      teeth: '111'
    }
  },
  {
    id: 'p6',
    name: 'Bateria 60Ah Livre de Manutenção',
    description: 'Bateria com tecnologia de grade forjada. Polo Positivo Direito.',
    price: 450.00,
    category: 'Elétrica',
    imageUrl: 'https://images.unsplash.com/photo-1594539166943-1563f4622b7c?auto=format&fit=crop&w=300&q=80',
    storeId: 's2',
    compatibleModels: ['Civic', 'Corolla', 'HR-V'],
    specifications: {
      component: 'Bateria',
      amperage: '60Ah',
      voltage: '12V',
      pole: 'Direito',
      technology: 'Convencional'
    }
  },
  {
    id: 'p7',
    name: 'Jogo de Velas de Ignição Iridium',
    description: 'Velas de alta performance. Maior durabilidade e faísca mais potente.',
    price: 189.90,
    category: 'Motor',
    imageUrl: 'https://images.unsplash.com/photo-1504938367946-b2586689d0b6?auto=format&fit=crop&w=300&q=80',
    storeId: 's1',
    compatibleModels: ['Vectra', 'Astra', 'Zafira'],
    specifications: {
      component: 'Vela',
      electrode_type: 'Iridium',
      thread_size: '14mm',
      hex_size: '16mm'
    }
  },
  {
    id: 'p8',
    name: 'Lâmpada H7 Super Branca',
    description: 'Par de lâmpadas H7 efeito xênon 6000K.',
    price: 59.90,
    category: 'Elétrica',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=300&q=80',
    storeId: 's3',
    compatibleModels: ['Gol', 'Palio', 'Fiesta'],
    specifications: {
      component: 'Lâmpada',
      socket: 'H7',
      technology: 'Halógena',
      color_temp: '6000K',
      voltage: '12V'
    }
  },
  {
    id: 'p9',
    name: 'Kit Embreagem Completo',
    description: 'Platô, disco e rolamento. Alta durabilidade.',
    price: 450.00,
    category: 'Transmissão',
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=300&q=80',
    storeId: 's1',
    compatibleModels: ['Onix', 'Prisma'],
    specifications: {
      component: 'Embreagem',
      diameter: '200mm',
      splines: '14'
    }
  },
  {
    id: 'p10',
    name: 'Junta do Cabeçote Aço',
    description: 'Junta metálica MLS para motores de alta compressão.',
    price: 85.00,
    category: 'Motor',
    imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=300&q=80', // Placeholder
    storeId: 's2',
    compatibleModels: ['Golf', 'Audi A3'],
    specifications: {
      component: 'Junta',
      gasket_position: 'Cabeçote',
      material: 'Metal (MLS)'
    }
  },
  {
    id: 'p11',
    name: 'Kit Fusíveis Lâmina Mini',
    description: 'Kit com 10 fusíveis variados.',
    price: 15.00,
    category: 'Elétrica',
    imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=300&q=80', // Placeholder
    storeId: 's3',
    compatibleModels: ['Todos'],
    specifications: {
      component: 'Fusível',
      fuse_type: 'Lâmina Mini',
      amperage: 'Kit Variado'
    }
  }
];

export const POPULAR_VEHICLES: Vehicle[] = [
  { id: 'v1', make: 'Chevrolet', model: 'Onix', year: 2020, engine: '1.0', valves: '12v', fuel: 'Flex', transmission: 'Manual' },
  { id: 'v2', make: 'Hyundai', model: 'HB20', year: 2021, engine: '1.0', valves: '12v', fuel: 'Flex', transmission: 'Manual' },
  { id: 'v3', make: 'Volkswagen', model: 'Gol', year: 2018, engine: '1.6', valves: '8v', fuel: 'Flex', transmission: 'Manual' },
  { id: 'v4', make: 'Toyota', model: 'Corolla', year: 2019, engine: '2.0', valves: '16v', fuel: 'Flex', transmission: 'Automático' },
  { id: 'v5', make: 'Chevrolet', model: 'Vectra', year: 1995, engine: '2.0', valves: '8v', fuel: 'Gasolina', transmission: 'Manual' },
];
