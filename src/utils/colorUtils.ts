
// Function to convert HEX to RGB
export const hexToRgb = (hex: string): number[] => {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse as hex values
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  
  // Return as array
  return [r, g, b];
};

// Function to convert RGB to LAB
export const rgbToLab = (rInput: number, gInput: number, bInput: number): number[] => {
  // Convert RGB to XYZ - use let instead of const since we need to modify these values
  let r = rInput / 255;
  let g = gInput / 255;
  let b = bInput / 255;
  
  r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
  g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
  b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
  
  r *= 100;
  g *= 100;
  b *= 100;
  
  const x = r * 0.4124 + g * 0.3576 + b * 0.1805;
  const y = r * 0.2126 + g * 0.7152 + b * 0.0722;
  const z = r * 0.0193 + g * 0.1192 + b * 0.9505;
  
  // Convert XYZ to LAB
  const xn = 95.047;
  const yn = 100.0;
  const zn = 108.883;
  
  const xr = x / xn;
  const yr = y / yn;
  const zr = z / zn;
  
  const fx = xr > 0.008856 ? Math.pow(xr, 1/3) : (7.787 * xr) + (16/116);
  const fy = yr > 0.008856 ? Math.pow(yr, 1/3) : (7.787 * yr) + (16/116);
  const fz = zr > 0.008856 ? Math.pow(zr, 1/3) : (7.787 * zr) + (16/116);
  
  const L = (116 * fy) - 16;
  const a = 500 * (fx - fy);
  const bValue = 200 * (fy - fz);
  
  return [L, a, bValue];
};

// Function to calculate Delta E (color difference) - CIE76 formula
export const deltaE = (lab1: number[], lab2: number[]): number => {
  const [L1, a1, b1] = lab1;
  const [L2, a2, b2] = lab2;
  
  return Math.sqrt(
    Math.pow(L2 - L1, 2) +
    Math.pow(a2 - a1, 2) +
    Math.pow(b2 - b1, 2)
  );
};

// Function to detect color format
export const detectColorFormat = (colorStr: string): "hex" | "rgb" | "unknown" => {
  if (!colorStr) return "unknown";
  
  // Clean the string first
  const cleanedStr = colorStr.trim().toLowerCase();
  
  // More flexible hex detection
  if (cleanedStr.startsWith('#')) {
    // Check for valid hex format after the #
    const hexPart = cleanedStr.substring(1);
    if (/^[0-9a-f]{3}$|^[0-9a-f]{6}$/i.test(hexPart)) {
      return "hex";
    }
  } else if (/^[0-9a-f]{6}$/i.test(cleanedStr)) {
    // Hex without # prefix
    return "hex";
  }
  
  // RGB detection
  if (cleanedStr.startsWith('rgb')) {
    const rgbRegex = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i;
    if (rgbRegex.test(cleanedStr)) {
      return "rgb";
    }
  }
  
  return "unknown";
};

// Convert RGB to HSL
export const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    if (max === r) {
      h = (g - b) / d + (g < b ? 6 : 0);
    } else if (max === g) {
      h = (b - r) / d + 2;
    } else {
      h = (r - g) / d + 4;
    }
    
    h /= 6;
  }
  
  // Convert to degrees and standard ranges
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lValue = Math.round(l * 100);
  
  return [h, s, lValue];
};

// Get chroma (saturation) value of a color
export const getChroma = (rgb: number[]): number => {
  const [r, g, b] = rgb;
  const [_, s, _l] = rgbToHsl(r, g, b);
  return s; // 0-100
};

// Get lightness value of a color
export const getLightness = (rgb: number[]): number => {
  const [r, g, b] = rgb;
  const [_, _s, l] = rgbToHsl(r, g, b);
  return l; // 0-100
};

// Improved function to determine color family with sub-categories
export const getColorFamily = (rgb: number[]): { main: string; sub: string | null } => {
  const [r, g, b] = rgb;
  const [hue, saturation, lightness] = rgbToHsl(r, g, b);
  
  // Check for black, white, and gray first (neutrals)
  if (lightness <= 10) return { main: "Black", sub: null };
  if (lightness >= 90 && saturation <= 10) return { main: "White", sub: null };
  if (saturation <= 10) return { main: "Gray", sub: getLightnessTone(lightness) };
  
  // Determine main color family based on HSL hue
  let mainFamily: string;
  let subCategory: string | null = null;
  
  // Use more accurate hue ranges for color families
  if ((hue >= 0 && hue < 20) || (hue >= 340 && hue <= 360)) {
    mainFamily = "Red";
    subCategory = getRedSubcategory(hue, saturation, lightness);
  } else if (hue >= 20 && hue < 50) {
    mainFamily = "Orange";
    subCategory = getOrangeSubcategory(hue, saturation, lightness);
  } else if (hue >= 50 && hue < 70) {
    mainFamily = "Yellow";
    subCategory = getYellowSubcategory(hue, saturation, lightness);
  } else if (hue >= 70 && hue < 160) {
    mainFamily = "Green";
    subCategory = getGreenSubcategory(hue, saturation, lightness);
  } else if (hue >= 160 && hue < 250) {
    mainFamily = "Blue";
    subCategory = getBlueSubcategory(hue, saturation, lightness);
  } else if (hue >= 250 && hue < 340) {
    mainFamily = "Purple";
    subCategory = getPurpleSubcategory(hue, saturation, lightness);
  } else {
    mainFamily = "Unknown";
  }
  
  return { main: mainFamily, sub: subCategory };
};

// Helper functions to determine subcategories
const getRedSubcategory = (hue: number, saturation: number, lightness: number): string => {
  if (hue >= 340 || hue <= 10) {
    if (lightness < 30) return "Maroon";
    if (lightness > 60) return "Pink";
    if (saturation > 80) return "Scarlet";
    return "Pure Red";
  }
  if (hue > 10 && hue < 20) {
    return "Crimson";
  }
  return "Red";
};

const getOrangeSubcategory = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 30) return "Vermilion";
  if (hue > 40) return "Amber";
  if (lightness < 50) return "Burnt Orange";
  if (lightness > 70) return "Light Orange";
  return "Pure Orange";
};

const getYellowSubcategory = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 55) return "Golden Yellow";
  if (hue > 65) return "Chartreuse";
  if (lightness < 50) return "Mustard";
  if (lightness > 80) return "Pastel Yellow";
  return "Pure Yellow";
};

const getGreenSubcategory = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 90) return "Lime";
  if (hue > 140) return "Teal";
  if (hue > 120) return "Forest Green";
  if (lightness < 30) return "Dark Green";
  if (lightness > 70) return "Mint";
  return "Pure Green";
};

const getBlueSubcategory = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 190) return "Turquoise";
  if (hue > 220) return "Indigo";
  if (lightness < 30) return "Navy";
  if (lightness > 70) return "Sky Blue";
  return "Pure Blue";
};

const getPurpleSubcategory = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 280) return "Violet";
  if (hue > 320) return "Magenta";
  if (lightness < 30) return "Deep Purple";
  if (lightness > 70) return "Lavender";
  return "Pure Purple";
};

const getLightnessTone = (lightness: number): string => {
  if (lightness < 20) return "Dark Gray";
  if (lightness > 80) return "Light Gray";
  if (lightness > 50) return "Medium Light Gray";
  if (lightness < 50) return "Medium Dark Gray";
  return "Medium Gray";
};
