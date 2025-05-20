// Import the ColorData type from types/colors
import { ColorData } from "@/types/colors";

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
  
  // Enhanced thresholds for better detection using the user's requested categories
  // First check for neutrals: black, white, and grays with very low saturation
  if (saturation <= 15) {
    if (lightness <= 15) return { main: "Black", sub: "Black" };
    if (lightness >= 85) return { main: "White", sub: "White" };
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
  } else if (hue >= 160 && hue < 190) {
    return { main: "Aqua/Teal", sub: getTealShade(hue, saturation, lightness) };
  } else if (hue >= 190 && hue < 260) {
    return { main: "Blue", sub: getBlueShade(hue, saturation, lightness) };
  } else if (hue >= 260 && hue < 330) {
    return { main: "Purple", sub: getPurpleShade(hue, saturation, lightness) };
  } else if (hue >= 330 && hue < 355) {
    return { main: "Pink", sub: getPinkShade(hue, saturation, lightness) };
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

// Add the missing getPinkShade function
const getPinkShade = (hue: number, saturation: number, lightness: number): string => {
  if (lightness > 80) return "Light Pink";
  if (saturation > 80) return "Hot Pink";
  if (lightness < 50) return "Deep Pink";
  if (saturation < 60) return "Blush";
  if (hue > 345) return "Rose";
  if (hue < 335) return "Magenta";
  return "Fuchsia";
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

// New function for Teal/Aqua shades
const getTealShade = (hue: number, saturation: number, lightness: number): string => {
  if (lightness < 30) return "Deep Teal";
  if (lightness > 70) return "Light Aqua";
  if (saturation < 40) return "Muted Teal";
  return "Turquoise";
};

// CIELAB to RGB conversion
export const labToRgb = (l: number, a: number, bValue: number): number[] => {
  // LAB to XYZ
  const y = (l + 16) / 116;
  const x = a / 500 + y;
  const z = y - bValue / 200;

  const x3 = x * x * x;
  const y3 = y * y * y;
  const z3 = z * z * z;

  const xr = x3 > 0.008856 ? x3 : (x - 16 / 116) / 7.787;
  const yr = y3 > 0.008856 ? y3 : (y - 16 / 116) / 7.787;
  const zr = z3 > 0.008856 ? z3 : (z - 16 / 116) / 7.787;

  // XYZ to RGB
  const xn = 95.047 / 100;
  const yn = 100.0 / 100;
  const zn = 108.883 / 100;

  const x1 = xr * xn;
  const y1 = yr * yn;
  const z1 = zr * zn;

  let r = x1 * 3.2406 + y1 * -1.5372 + z1 * -0.4986;
  let g = x1 * -0.9689 + y1 * 1.8758 + z1 * 0.0415;
  let bColor = x1 * 0.0557 + y1 * -0.2040 + z1 * 1.0570;

  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  bColor = bColor > 0.0031308 ? 1.055 * Math.pow(bColor, 1 / 2.4) - 0.055 : 12.92 * bColor;

  // Clamp and convert to 0-255
  r = Math.max(0, Math.min(1, r)) * 255;
  g = Math.max(0, Math.min(1, g)) * 255;
  bColor = Math.max(0, Math.min(1, bColor)) * 255;

  return [Math.round(r), Math.round(g), Math.round(bColor)];
};

// CIELAB to HEX conversion
export const labToHex = (l: number, a: number, bValue: number): string => {
  const rgb = labToRgb(l, a, bValue);
  return `#${((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1).toUpperCase()}`;
};

// Convert CIELAB values to a color object
export const labToColorObject = (l: number, a: number, bValue: number, name: string = ""): ColorData => {
  const rgb = labToRgb(l, a, bValue);
  const hex = labToHex(l, a, bValue);
  const family = getColorFamily(rgb);
  
  return {
    id: Date.now().toString(),
    name: name || `Color L:${l.toFixed(1)} a:${a.toFixed(1)} b:${bValue.toFixed(1)}`,
    hex: hex,
    rgb: rgb,
    lab: [l, a, bValue],
    family: family
  };
};
