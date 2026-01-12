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

export const getBrands = async (type: VehicleType): Promise<FipeBrand[]> => {
  try {
    const response = await fetch(`${BASE_URL}/${type}/marcas`);
    return await response.json();
  } catch (error) {
    console.error('FIPE Brands Error:', error);
    return [];
  }
};

export const getModels = async (
  type: VehicleType,
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
