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
