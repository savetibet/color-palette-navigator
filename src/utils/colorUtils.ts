import { ColorData, ColorFamily } from '@/types/colors';

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

// Function to convert RGB to HEX
export const rgbToHex = (r: number, g: number, b: number): string => {
  const componentToHex = (c: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, c))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
};

// Function to convert LAB to RGB
export const labToRgb = (l: number, a: number, b: number): number[] => {
  // Convert LAB to XYZ
  let fy = (l + 16) / 116;
  let fx = a / 500 + fy;
  let fz = fy - b / 200;
  
  const delta = 6 / 29;
  const deltaSquared = delta * delta;
  const deltaCubed = delta * delta * delta;
  
  let xr = fx > delta ? fx * fx * fx : 3 * deltaSquared * (fx - 4 / 29);
  let yr = fy > delta ? fy * fy * fy : 3 * deltaSquared * (fy - 4 / 29);
  let zr = fz > delta ? fz * fz * fz : 3 * deltaSquared * (fz - 4 / 29);
  
  // Observer = 2°, Illuminant = D65
  const xn = 95.047;
  const yn = 100.0;
  const zn = 108.883;
  
  const x = xr * xn;
  const y = yr * yn;
  const z = zr * zn;
  
  // Convert XYZ to RGB
  let r = x * 3.2406 + y * -1.5372 + z * -0.4986;
  let g = x * -0.9689 + y * 1.8758 + z * 0.0415;
  let bValue = x * 0.0557 + y * -0.2040 + z * 1.0570;
  
  // Apply gamma correction
  r = r > 0.0031308 ? 1.055 * Math.pow(r, 1 / 2.4) - 0.055 : 12.92 * r;
  g = g > 0.0031308 ? 1.055 * Math.pow(g, 1 / 2.4) - 0.055 : 12.92 * g;
  bValue = bValue > 0.0031308 ? 1.055 * Math.pow(bValue, 1 / 2.4) - 0.055 : 12.92 * bValue;
  
  // Convert to 0-255 range and clamp
  r = Math.max(0, Math.min(255, Math.round(r * 255)));
  g = Math.max(0, Math.min(255, Math.round(g * 255)));
  bValue = Math.max(0, Math.min(255, Math.round(bValue * 255)));
  
  return [r, g, bValue];
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

// Convert RGB to HSL - improved implementation
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

/**
 * Enhanced color family classification based on HSL values
 * This implementation uses more refined HSL boundaries with special cases for
 * edge cases like pinks, magentas, and desaturated colors
 */
export const getColorFamily = (rgb: number[]): ColorFamily => {
  const [r, g, b] = rgb;
  const [hue, saturation, lightness] = rgbToHsl(r, g, b);
  
  // Special case: Black, White, and Gray
  if (saturation <= 15) { // Increased threshold to catch more grays
    if (lightness <= 12) return { main: "Black/White", sub: "Black" };
    if (lightness >= 88) return { main: "Black/White", sub: "White" };
    return { main: "Gray", sub: getLightnessTone(lightness) };
  }

  // Special case: Very low saturation but not quite gray
  if (saturation <= 20 && (lightness < 25 || lightness > 85)) {
    // Very dark low-saturation colors should be black, very light ones white
    if (lightness <= 15) return { main: "Black/White", sub: "Black" };
    if (lightness >= 85) return { main: "Black/White", sub: "White" };
    return { main: "Gray", sub: getLightnessTone(lightness) };
  }
  
  // Special case: Brown detection (complex condition with multiple factors)
  // Browns are usually low-saturation, medium-low lightness in yellow-red hue range
  if (((hue >= 0 && hue <= 40) || (hue >= 355 && hue <= 360)) && 
      saturation > 15 && saturation < 50 && 
      lightness > 15 && lightness < 50) {
    return { main: "Brown", sub: getBrownShade(hue, saturation, lightness) };
  }
  
  // Main color family classification based on hue
  // For higher confidence, use narrower hue ranges for vibrant colors
  if (lightness < 15) return { main: "Black/White", sub: "Black" };
  if (lightness > 90) return { main: "Black/White", sub: "White" };
  
  // For very low saturation colors at medium lightness, favor gray
  if (saturation < 20 && lightness > 25 && lightness < 75) {
    return { main: "Gray", sub: getLightnessTone(lightness) };
  }
  
  // Pink/Magenta special case - often classified incorrectly
  if ((hue >= 330 || hue <= 10) && saturation > 30 && lightness > 65) {
    return { main: "Red", sub: "Pink" };
  }
  
  // Final classification by hue ranges
  // Reds wrap around the color wheel (both low and high hue values)
  if ((hue >= 345 || hue < 10)) {
    return { main: "Red", sub: getRedShade(hue, saturation, lightness) };
  } 
  // Orange
  else if (hue >= 10 && hue < 45) {
    return { main: "Orange", sub: getOrangeShade(hue, saturation, lightness) };
  } 
  // Yellow - narrowed from previous likely-too-wide range
  else if (hue >= 45 && hue < 70) {
    return { main: "Yellow", sub: getYellowShade(hue, saturation, lightness) };
  } 
  // Green - widened to include yellow-greens
  else if (hue >= 70 && hue < 170) {
    return { main: "Green", sub: getGreenShade(hue, saturation, lightness) };
  } 
  // Blue
  else if (hue >= 170 && hue < 270) {
    return { main: "Blue", sub: getBlueShade(hue, saturation, lightness) };
  } 
  // Purple
  else if (hue >= 270 && hue < 345) {
    return { main: "Purple", sub: getPurpleShade(hue, saturation, lightness) };
  }
  
  // Fallback - should rarely hit this
  return { main: "Unknown", sub: null };
};

// Helper functions for specific shade determination
const getRedShade = (hue: number, saturation: number, lightness: number): string => {
  if (lightness < 30) return "Maroon";
  if (lightness > 75) return "Pink";
  if (hue < 5 || hue > 350) {
    return "Scarlet";
  }
  return "Crimson";
};

const getOrangeShade = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 20) return "Vermilion";
  if (hue > 35) return "Amber";
  if (saturation < 60) return "Terracotta";
  if (lightness > 60) return "Peach";
  return "Tangerine";
};

const getYellowShade = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 50) return "Gold";
  if (saturation < 50) return "Mustard";
  if (lightness > 80) return "Lemon";
  return "Canary";
};

const getGreenShade = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 90) return "Chartreuse";
  if (hue > 150) return "Teal";
  if (lightness < 30) return "Forest";
  if (lightness > 70) return "Mint";
  if (saturation < 40) return "Olive";
  return "Emerald";
};

const getBlueShade = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 190) return "Turquoise";
  if (hue > 240) return "Indigo";
  if (lightness < 35) return "Navy";
  if (lightness > 70) return "Sky";
  return "Cobalt";
};

const getPurpleShade = (hue: number, saturation: number, lightness: number): string => {
  if (hue < 290) return "Violet";
  if (hue > 320) return "Magenta";
  if (lightness < 30) return "Eggplant";
  if (lightness > 75) return "Lavender";
  return "Amethyst";
};

const getBrownShade = (hue: number, saturation: number, lightness: number): string => {
  if (lightness < 25) return "Chocolate";
  if (hue > 30) return "Tan";
  if (saturation > 40) return "Sienna";
  return "Coffee";
};

const getLightnessTone = (lightness: number): string => {
  if (lightness < 20) return "Charcoal";
  if (lightness > 80) return "Silver";
  if (lightness > 50) return "Slate";
  return "Graphite";
};

// Function to parse RGB string into RGB array
export const parseRgbString = (rgbStr: string): number[] => {
  const matches = rgbStr.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (matches) {
    return [
      parseInt(matches[1], 10),
      parseInt(matches[2], 10),
      parseInt(matches[3], 10)
    ];
  }
  return [0, 0, 0]; // Default black if parsing fails
};

// Function to calculate Euclidean distance between two RGB colors
export const rgbDistance = (rgb1: number[], rgb2: number[]): number => {
  return Math.sqrt(
    Math.pow(rgb2[0] - rgb1[0], 2) +
    Math.pow(rgb2[1] - rgb1[1], 2) +
    Math.pow(rgb2[2] - rgb1[2], 2)
  );
};

// Function to find similar colors by RGB
export const findSimilarColors = (
  targetColor: number[], 
  colorLibrary: ColorData[], 
  limit: number = 10
): ColorData[] => {
  // Calculate distances
  const colorsWithDistance = colorLibrary.map(color => ({
    color,
    distance: rgbDistance(targetColor, color.rgb)
  }));
  
  // Sort by distance and return the closest matches
  return colorsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(item => item.color);
};

// Function to find similar colors by LAB (more perceptually accurate)
export const findSimilarColorsByLab = (
  targetLab: number[], 
  colorLibrary: ColorData[], 
  limit: number = 10
): ColorData[] => {
  // Calculate distances
  const colorsWithDistance = colorLibrary.map(color => {
    // Convert color to LAB if it doesn't have LAB values
    const lab = color.lab || rgbToLab(color.rgb[0], color.rgb[1], color.rgb[2]);
    return {
      color,
      distance: deltaE(targetLab, lab)
    };
  });
  
  // Sort by distance and return the closest matches
  return colorsWithDistance
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit)
    .map(item => item.color);
};

// K-means clustering to identify color families by RGB similarity
export const kMeansClusterColors = (colors: ColorData[], k: number = 9, iterations: number = 10): { [key: string]: ColorData[] } => {
  if (colors.length === 0) return {};
  if (colors.length <= k) {
    // If there are fewer colors than clusters, just put each color in its own cluster
    return colors.reduce((acc, color, index) => {
      acc[`Cluster ${index + 1}`] = [color];
      return acc;
    }, {} as { [key: string]: ColorData[] });
  }

  // Get random initial centroids
  const getRandomCentroids = () => {
    const centroids: number[][] = [];
    const indices = new Set<number>();
    
    while (indices.size < k) {
      const index = Math.floor(Math.random() * colors.length);
      if (!indices.has(index)) {
        indices.add(index);
        centroids.push([...colors[index].rgb]); // Clone RGB values
      }
    }
    
    return centroids;
  };
  
  let centroids = getRandomCentroids();
  let clusters: number[][] = Array(k).fill(0).map(() => []);
  
  // Run k-means algorithm
  for (let iter = 0; iter < iterations; iter++) {
    // Reset clusters
    clusters = Array(k).fill(0).map(() => []);
    
    // Assign colors to clusters based on nearest centroid
    colors.forEach((color, colorIndex) => {
      let minDistance = Infinity;
      let clusterIndex = 0;
      
      centroids.forEach((centroid, i) => {
        const distance = rgbDistance(color.rgb, centroid);
        if (distance < minDistance) {
          minDistance = distance;
          clusterIndex = i;
        }
      });
      
      clusters[clusterIndex].push(colorIndex);
    });
    
    // Recalculate centroids
    const newCentroids = centroids.map((_, i) => {
      const clusterColors = clusters[i].map(colorIndex => colors[colorIndex].rgb);
      
      if (clusterColors.length === 0) {
        // If cluster is empty, keep current centroid
        return centroids[i];
      }
      
      // Calculate average RGB values
      const sumRGB = clusterColors.reduce(
        (sum, rgb) => [sum[0] + rgb[0], sum[1] + rgb[1], sum[2] + rgb[2]],
        [0, 0, 0]
      );
      
      return [
        Math.round(sumRGB[0] / clusterColors.length),
        Math.round(sumRGB[1] / clusterColors.length),
        Math.round(sumRGB[2] / clusterColors.length)
      ];
    });
    
    // Check for convergence
    const centroidsChanged = newCentroids.some((centroid, i) => 
      rgbDistance(centroid, centroids[i]) > 1
    );
    
    centroids = newCentroids;
    
    if (!centroidsChanged) break;
  }
  
  // Map clusters to named color families
  const result: { [key: string]: ColorData[] } = {};
  
  centroids.forEach((centroid, i) => {
    // Determine color family for this centroid
    const family = getColorFamily(centroid).main;
    
    // Group colors by this family
    const clusterColors = clusters[i].map(colorIndex => colors[colorIndex]);
    
    if (!result[family]) {
      result[family] = [];
    }
    
    result[family].push(...clusterColors);
  });
  
  return result;
};

// Convert hex to CSS color string
export const hexToCssColor = (hex: string): string => {
  return hex.startsWith('#') ? hex : `#${hex}`;
};

// Convert RGB array to CSS color string
export const rgbToCssColor = (rgb: number[]): string => {
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
};

// Add a new function to validate and verify color classification
/**
 * Utility function to validate color classification
 * Useful for testing and debugging color classifications
 * 
 * @param rgb RGB color array [r, g, b]
 * @returns Object with color details including HSL values and classification
 */
export const validateColorClassification = (rgb: number[]): {
  rgb: number[];
  hsl: [number, number, number];
  family: ColorFamily;
} => {
  const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
  const family = getColorFamily(rgb);
  
  return {
    rgb,
    hsl,
    family
  };
};
