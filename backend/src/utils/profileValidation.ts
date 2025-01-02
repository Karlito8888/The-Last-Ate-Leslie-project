import { UAE_CONSTANTS, UAE_PHONE_CONSTANTS } from '../config/constants';

interface UAEAddress {
  unit?: string;
  buildingName?: string;
  street?: string;
  dependentLocality?: string;
  poBox?: string;
  city?: string;
  emirate?: string;
}

export const isValidDate = (date: Date | string): boolean => {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return !isNaN(parsedDate.getTime());
};

export const isValidAddress = (address: UAEAddress): boolean => {
  // Si l'adresse est vide, c'est valide (champ optionnel)
  if (!address) return true;
  
  // Validation des longueurs maximales si les champs sont fournis
  if (address.unit && address.unit.length > 50) return false;
  if (address.buildingName && address.buildingName.length > 100) return false;
  if (address.street && address.street.length > 100) return false;
  if (address.dependentLocality && address.dependentLocality.length > 100) return false;
  if (address.city && address.city.length > 50) return false;
  
  // Validation du format PO Box si fourni (numérique uniquement)
  if (address.poBox && !/^[0-9]{1,10}$/.test(address.poBox)) return false;
  
  // Validation de l'émirat si fourni
  if (address.emirate && !Object.keys(UAE_CONSTANTS.EMIRATES).includes(address.emirate)) return false;
  
  return true;
};

export const isValidMobilePhone = (phone: string): boolean => {
  return !phone || UAE_PHONE_CONSTANTS.MOBILE_REGEX.test(phone);
};

export const isValidLandline = (phone: string): boolean => {
  return !phone || UAE_PHONE_CONSTANTS.LANDLINE_REGEX.test(phone);
}; 