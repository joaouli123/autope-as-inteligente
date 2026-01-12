// Validation utilities

// Fetch address from ViaCEP API
export const fetchAddressApi = async (cepValue: string) => {
  const cleanCep = cepValue.replace(/\D/g, '');
  if (cleanCep.length !== 8) return null;
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();
    if (!data.erro) return data;
    return null;
  } catch (error) { 
    return null; 
  }
};
