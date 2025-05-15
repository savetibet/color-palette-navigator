
export interface ColorData {
  id: string;
  name: string;
  hex: string;
  rgb: number[]; // [r, g, b]
  lab: number[] | null; // [L, a, b]
  family: string | null; // Color family classification
}

export interface ColorLibraryData {
  id: number;
  name: string;
  colors: ColorData[];
  createdAt: string;
}
