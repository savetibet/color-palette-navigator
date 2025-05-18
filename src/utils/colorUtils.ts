
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

// Improved function to determine color family with specific shade names
export const getColorFamily = (rgb: number[]): { main: string; sub: string | null } => {
  const [r, g, b] = rgb;
  const [hue, saturation, lightness] = rgbToHsl(r, g, b);
  
  // Enhanced thresholds for better detection
  // First check for neutrals: black, white, and grays with very low saturation
  if (saturation <= 15) {
    if (lightness <= 15) return { main: "Black/White", sub: "Black" };
    if (lightness >= 85) return { main: "Black/White", sub: "White" };
    return { main: "Gray", sub: getLightnessTone(lightness) };
  }
  
  // Check for browns - these can be tricky as they span multiple hue regions
  // Browns generally have low to medium saturation and low to medium lightness
  if (saturation < 50 && lightness > 15 && lightness < 60) {
    if ((hue >= 0 && hue <= 40) || (hue >= 355)) {
      return { main: "Brown", sub: getBrownShade(hue, saturation, lightness) };
    }
  }
  
  // Determine main color family and specific shade based on HSL hue
  if ((hue >= 355 || hue < 10)) {
    return { main: "Red", sub: getRedShade(hue, saturation, lightness) };
  } else if (hue >= 10 && hue < 40) {
    return { main: "Orange", sub: getOrangeShade(hue, saturation, lightness) };
  } else if (hue >= 40 && hue < 65) {
    return { main: "Yellow", sub: getYellowShade(hue, saturation, lightness) };
  } else if (hue >= 65 && hue < 160) {
    return { main: "Green", sub: getGreenShade(hue, saturation, lightness) };
  } else if (hue >= 160 && hue < 260) {
    return { main: "Blue", sub: getBlueShade(hue, saturation, lightness) };
  } else if (hue >= 260 && hue < 330) {
    return { main: "Purple", sub: getPurpleShade(hue, saturation, lightness) };
  } else if (hue >= 330 && hue < 355) {
    return { main: "Red", sub: "Magenta" };
  }
  
  return { main: "Unknown", sub: null };
};

// Helper functions for specific shade determination
const getRedShade = (hue: number, saturation: number, lightness: number): string => {
  if (lightness < 30) return "Maroon";
  if (lightness < 45) return saturation > 75 ? "Ruby" : "Burgundy";
  if (hue < 5 || hue >= 355) {
    return lightness > 60 ? "Scarlet" : "Crimson";
  }
  if (lightness > 60) return "Cherry";
  return "Cardinal";
};

const getOrangeShade = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 20) return lightness < 50 ? "Vermilion" : "Coral";
  if (hue > 30) return "Amber";
  if (saturation < 60) return "Terracotta";
  if (lightness > 70) return "Peach";
  if (lightness > 60) return "Tangerine";
  return "Rust";
};

const getYellowShade = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 50) {
    if (lightness < 50) return "Ochre";
    return saturation > 80 ? "Gold" : "Honey";
  }
  if (saturation < 50) return "Mustard";
  if (lightness > 80) return "Lemon";
  return "Canary";
};

const getGreenShade = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 80) return "Chartreuse";
  if (hue > 140) return "Teal";
  if (hue > 100 && lightness < 40) return "Forest";
  if (lightness > 70) return saturation < 50 ? "Sage" : "Mint";
  if (saturation < 50) return "Olive";
  if (lightness < 40) return "Hunter";
  if (hue < 100) return "Lime";
  return "Emerald";
};

const getBlueShade = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 190) return "Turquoise";
  if (hue > 225) return lightness < 50 ? "Indigo" : "Ultramarine";
  if (lightness < 30) return "Navy";
  if (lightness > 70) return "Sky";
  if (lightness > 50 && saturation > 60) return "Azure";
  if (saturation > 70) return "Cobalt";
  return "Royal";
};

const getPurpleShade = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 280) {
    return lightness < 50 ? "Violet" : "Periwinkle";
  }
  if (hue > 300) return "Magenta";
  if (lightness < 30) return "Eggplant";
  if (lightness > 80) return "Lavender";
  if (lightness > 65) return "Lilac";
  if (saturation > 70) return "Amethyst";
  return "Mauve";
};

const getBrownShade = (hue: number, saturation: number, lightness: number): string => {
  if (lightness < 25) return "Chocolate";
  if (lightness > 45) {
    if (saturation < 30) return "Tan";
    return "Caramel";
  }
  if (hue > 25) return "Sienna";
  if (saturation > 40) return "Coffee";
  return "Mocha";
};

const getLightnessTone = (lightness: number): string => {
  if (lightness < 20) return "Charcoal";
  if (lightness > 80) return "Silver";
  if (lightness > 60) return "Ash";
  if (lightness > 40) return "Slate";
  return "Graphite";
};
