
// Service to interact with FIPE API (using parallelum.com.br/fipe/api/v1)

export interface FipeItem {
  codigo: string;
  nome: string;
}

export interface FipeYear {
  codigo: string;
  nome: string;
}

export interface FipeVehicleDetail {
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

const BASE_URL = 'https://parallelum.com.br/fipe/api/v1';

export const getBrands = async (
  vehicleType: 'carros' | 'motos' | 'caminhoes',
  signal?: AbortSignal
): Promise<FipeItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/${vehicleType}/marcas`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching brands", error);
    return [];
  }
};

export const getModels = async (
  vehicleType: 'carros' | 'motos' | 'caminhoes',
  brandId: string,
  signal?: AbortSignal
): Promise<FipeItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/${vehicleType}/marcas/${brandId}/modelos`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.modelos || [];
  } catch (error) {
    console.error("Error fetching models", error);
    return [];
  }
};

export const getYears = async (
  vehicleType: 'carros' | 'motos' | 'caminhoes',
  brandId: string,
  modelId: string,
  signal?: AbortSignal
): Promise<FipeYear[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/${vehicleType}/marcas/${brandId}/modelos/${modelId}/anos`,
      { signal }
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching years", error);
    return [];
  }
};

export const getVehicleDetails = async (
  vehicleType: 'carros' | 'motos' | 'caminhoes',
  brandId: string,
  modelId: string,
  yearId: string,
  signal?: AbortSignal
): Promise<FipeVehicleDetail | null> => {
  try {
    const response = await fetch(
      `${BASE_URL}/${vehicleType}/marcas/${brandId}/modelos/${modelId}/anos/${yearId}`,
      { signal }
    );
    return await response.json();
  } catch (error) {
    console.error("Error fetching vehicle details", error);
    return null;
  }
};
