const BASE_URL = 'https://parallelum.com.br/fipe/api/v1';

export type VehicleType = 'carros' | 'motos' | 'caminhoes';

export interface FipeBrand {
  codigo: string;
  nome: string;
}

export interface FipeModel {
  codigo: number;
  nome: string;
}

export interface FipeYear {
  codigo: string;
  nome: string;
}

export interface FipeVehicleDetails {
  Valor: string;
  Marca: string;
  Modelo: string;
  AnoModelo: number;
  Combustivel: string;
  CodigoFipe: string;
  MesReferencia: string;
  TipoVeiculo: number;
  SiglaCombustivel: string;
}

export const getBrands = async (type: VehicleType = 'carros'): Promise<FipeBrand[]> => {
  try {
    const response = await fetch(`${BASE_URL}/${type}/marcas`);
    return await response.json();
  } catch (error) {
    console.error('FIPE Brands Error:', error);
    return [];
  }
};

export const getModels = async (
  type: VehicleType = 'carros',
  brandCode: string
): Promise<FipeModel[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/${type}/marcas/${brandCode}/modelos`
    );
    const data = await response.json();
    return data.modelos || [];
  } catch (error) {
    console.error('FIPE Models Error:', error);
    return [];
  }
};

export const getYears = async (
  type: VehicleType = 'carros',
  brandCode: string,
  modelCode: string
): Promise<FipeYear[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/${type}/marcas/${brandCode}/modelos/${modelCode}/anos`
    );
    return await response.json();
  } catch (error) {
    console.error('FIPE Years Error:', error);
    return [];
  }
};

export const getVehicleDetails = async (
  type: VehicleType = 'carros',
  brandCode: string,
  modelCode: string,
  yearCode: string
): Promise<FipeVehicleDetails | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/${type}/marcas/${brandCode}/modelos/${modelCode}/anos/${yearCode}`
    );
    return await response.json();
  } catch (error) {
    console.error('FIPE Vehicle Details Error:', error);
    return null;
  }
};

/**
 * Extrai informação do motor do nome do modelo
 * Exemplos: "1.0", "1.4", "1.6", "2.0", etc.
 */
export const extractEngine = (modelName: string): string | null => {
  // Padrões comuns: 1.0, 1.4, 1.6, 2.0, etc.
  const engineMatch = modelName.match(/(\d+\.\d+)/);
  return engineMatch ? engineMatch[1] : null;
};

/**
 * Extrai informação de válvulas do nome do modelo
 * Exemplos: "8V", "12V", "16V", etc.
 */
export const extractValves = (modelName: string): string | null => {
  // Padrões comuns: 8V, 12V, 16V
  const valvesMatch = modelName.match(/(\d+V)/i);
  return valvesMatch ? valvesMatch[1].toUpperCase() : null;
};
