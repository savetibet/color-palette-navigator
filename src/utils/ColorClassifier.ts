
import { ColorFamily } from '@/types/colors';
import { rgbToHsl, getColorFamily, hexToRgb } from './colorUtils';

/**
 * A utility class for classifying colors and analyzing their properties
 * This can be used for testing and visualization of color classifications
 */
export class ColorClassifier {
  /**
   * Convert a hex color to its corresponding color family
   * 
   * @param hex Hex color string (with or without #)
   * @returns Color family object with main and sub categories
   */
  static classifyHex(hex: string): ColorFamily {
    const rgb = hexToRgb(hex);
    return getColorFamily(rgb);
  }
  
  /**
   * Get detailed information about a color from hex
   * 
   * @param hex Hex color string (with or without #)
   * @returns Detailed color information object
   */
  static analyzeHex(hex: string): {
    hex: string,
    rgb: number[],
    hsl: [number, number, number],
    family: ColorFamily,
    isGrayish: boolean,
    isDark: boolean,
    isVibrant: boolean
  } {
    const rgb = hexToRgb(hex);
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    const family = getColorFamily(rgb);
    
    return {
      hex: hex.startsWith('#') ? hex : `#${hex}`,
      rgb,
      hsl,
      family,
      isGrayish: hsl[1] <= 15, // Low saturation indicates grayish
      isDark: hsl[2] <= 30,     // Low lightness indicates dark
      isVibrant: hsl[1] >= 70   // High saturation indicates vibrant
    };
  }
  
  /**
   * Validate classification algorithm with a batch of colors
   * 
   * @param hexColors Array of hex color strings
   * @returns Array of analysis results
   */
  static batchAnalyze(hexColors: string[]): Array<{
    hex: string,
    family: ColorFamily
  }> {
    return hexColors.map(hex => ({
      hex: hex.startsWith('#') ? hex : `#${hex}`,
      family: this.classifyHex(hex)
    }));
  }
}
