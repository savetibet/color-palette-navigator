export const labToRgb = (l: number, a: number, b: number): [number, number, number] => {
  // Convert LAB to XYZ
  let y = (l + 16) / 116;
  let x = a / 500 + y;
  let z = y - b / 200;

  // Apply inverse transformation
  x = x > 0.206897 ? x * x * x : (x - 16/116) / 7.787;
  y = y > 0.206897 ? y * y * y : (y - 16/116) / 7.787;
  z = z > 0.206897 ? z * z * z : (z - 16/116) / 7.787;

  // Reference white D65
  x *= 95.047;
  y *= 100.000;
  z *= 108.883;

  // Convert XYZ to RGB
  x /= 100;
  y /= 100;
  z /= 100;

  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let bVal = x * 0.0557 + y * -0.2040 + z * 1.0570;

  // Apply gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1/2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1/2.4) - 0.055 : 12.92 * g;
  bVal = bVal > 0.0031308 ? 1.055 * Math.pow(bVal, 1/2.4) - 0.055 : 12.92 * bVal;

  // Clamp to 0-255
  r = Math.max(0, Math.min(255, Math.round(r * 255)));
  g = Math.max(0, Math.min(255, Math.round(g * 255)));
  bVal = Math.max(0, Math.min(255, Math.round(bVal * 255)));

  return [r, g, bVal];
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const hexToRgb = (hex: string): number[] => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) {
    throw new Error('Invalid hex color format');
  }
  const num = parseInt(cleanHex, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
};

export const rgbToLab = (r: number, g: number, b: number): number[] => {
  // Convert RGB to LAB color space
  let x, y, z;

  r = r / 255;
  g = g / 255;
  b = b / 255;

  if (r > 0.04045) {
    r = Math.pow((r + 0.055) / 1.055, 2.4);
  } else {
    r = r / 12.92;
  }

  if (g > 0.04045) {
    g = Math.pow((g + 0.055) / 1.055, 2.4);
  } else {
    g = g / 12.92;
  }

  if (b > 0.04045) {
    b = Math.pow((b + 0.055) / 1.055, 2.4);
  } else {
    b = b / 12.92;
  }

  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

  if (x > 0.008856) {
    x = Math.pow(x, 1/3);
  } else {
    x = (7.787 * x) + (16/116);
  }

  if (y > 0.008856) {
    y = Math.pow(y, 1/3);
  } else {
    y = (7.787 * y) + (16/116);
  }

  if (z > 0.008856) {
    z = Math.pow(z, 1/3);
  } else {
    z = (7.787 * z) + (16/116);
  }

  return [
    (116 * y) - 16,
    500 * (x - y),
    200 * (y - z)
  ];
};

export const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
      default: h = 0;
    }
    h /= 6;
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

export const getChroma = (rgb: number[]): number => {
  const [r, g, b] = rgb.map(val => val / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return Math.round((max - min) * 100);
};

export const getLightness = (rgb: number[]): number => {
  const [r, g, b] = rgb.map(val => val / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return Math.round(((max + min) / 2) * 100);
};

export const detectColorFormat = (input: string): 'hex' | 'rgb' | 'unknown' => {
  const trimmedInput = input.trim();
  
  // Check for hex format
  if (trimmedInput.match(/^#?[0-9A-Fa-f]{6}$/)) {
    return 'hex';
  }
  
  // Check for rgb format
  if (trimmedInput.match(/^rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/)) {
    return 'rgb';
  }
  
  return 'unknown';
};

export const parseRgbString = (rgbString: string): number[] => {
  const match = rgbString.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (!match) {
    throw new Error('Invalid RGB format');
  }
  return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
};

export const findSimilarColors = (targetRgb: number[], allColors: any[], limit: number = 10): any[] => {
  const targetLab = rgbToLab(targetRgb[0], targetRgb[1], targetRgb[2]);
  
  const colorsWithDistance = allColors.map(color => {
    const colorLab = color.lab || rgbToLab(color.rgb[0], color.rgb[1], color.rgb[2]);
    
    // Calculate Delta E (CIE76) - simplified LAB distance
    const deltaE = Math.sqrt(
      Math.pow(targetLab[0] - colorLab[0], 2) +
      Math.pow(targetLab[1] - colorLab[1], 2) +
      Math.pow(targetLab[2] - colorLab[2], 2)
    );
    
    return { ...color, distance: deltaE };
  });
  
  return colorsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
};

export const getColorFamily = (rgb: [number, number, number]): string => {
  const [r, g, b] = rgb;
  
  // Convert to HSL for better color family detection
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const diff = max - min;
  const sum = max + min;
  
  const lightness = sum / 2;
  
  // Check for grayscale first
  if (diff < 0.1) {
    if (lightness < 0.2) return 'black';
    if (lightness > 0.8) return 'white';
    return 'gray';
  }
  
  // Calculate hue
  let hue = 0;
  if (max === r / 255) {
    hue = ((g / 255 - b / 255) / diff) % 6;
  } else if (max === g / 255) {
    hue = (b / 255 - r / 255) / diff + 2;
  } else {
    hue = (r / 255 - g / 255) / diff + 4;
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;
  
  // Determine color family based on hue
  if (hue < 15 || hue >= 345) return 'red';
  if (hue < 45) return 'orange';
  if (hue < 75) return 'yellow';
  if (hue < 165) return 'green';
  if (hue < 195) return 'teal';
  if (hue < 255) return 'blue';
  if (hue < 285) return 'purple';
  if (hue < 315) return 'pink';
  return 'brown';
};
