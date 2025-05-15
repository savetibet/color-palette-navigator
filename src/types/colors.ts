
export interface ColorFamily {
  main: string;
  sub: string | null;
}

export interface ColorData {
  id: string;
  name: string;
  hex: string;
  rgb: number[]; // [r, g, b]
  lab: number[] | null; // [L, a, b]
  family: string | ColorFamily; // Color family classification, can be string for backward compatibility
}

export interface ColorLibraryData {
  id: number;
  name: string;
  colors: ColorData[];
  createdAt: string;
}
