
// Service to interact with FIPE API (using parallelum.com.br/fipe/api/v1)

export interface FipeItem {
  codigo: string;
  nome: string;
}

const BASE_URL = 'https://parallelum.com.br/fipe/api/v1';

export const getBrands = async (vehicleType: 'carros' | 'motos' | 'caminhoes'): Promise<FipeItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/${vehicleType}/marcas`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching brands", error);
    return [];
  }
};

export const getModels = async (vehicleType: 'carros' | 'motos' | 'caminhoes', brandId: string): Promise<FipeItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}/${vehicleType}/marcas/${brandId}/modelos`);
    const data = await response.json();
    return data.modelos || [];
  } catch (error) {
    console.error("Error fetching models", error);
    return [];
  }
};
