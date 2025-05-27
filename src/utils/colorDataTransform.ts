
import { ColorData } from '@/types/colors';
import { BackendColorData } from '@/services/colorApi';

export function transformBackendColorToFrontend(backendColor: BackendColorData): ColorData {
  return {
    id: backendColor.color_id.toString(),
    name: backendColor.matching_no, // Use matching_no as the name
    hex: backendColor.hex,
    rgb: [backendColor.red, backendColor.green, backendColor.blue],
    lab: [backendColor.lightness, backendColor.a_value, backendColor.b_value],
    family: backendColor.family || 'Unknown'
  };
}

export function transformFrontendColorToBackend(frontendColor: ColorData, labValues: number[]): any {
  return {
    name: frontendColor.name,
    matching_no: frontendColor.name, // Use name as matching_no
    family: typeof frontendColor.family === 'string' ? frontendColor.family : frontendColor.family?.main,
    lightness: labValues[0],
    a_value: labValues[1],
    b_value: labValues[2],
    is_standard: false
  };
}
