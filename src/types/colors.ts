
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

// Color family definitions for consistent organization
export const COLOR_FAMILIES = {
  RED: "Red",
  ORANGE: "Orange",
  YELLOW: "Yellow",
  GREEN: "Green", 
  BLUE: "Blue",
  PURPLE: "Purple",
  BROWN: "Brown",
  GRAY: "Gray",
  BLACK_WHITE: "Black/White"
};

// Detailed color shades by family
export const COLOR_SHADES = {
  [COLOR_FAMILIES.RED]: [
    "Crimson", "Scarlet", "Ruby", "Maroon", "Cherry", "Brick", "Burgundy", "Cardinal", "Wine", "Carmine"
  ],
  [COLOR_FAMILIES.ORANGE]: [
    "Amber", "Apricot", "Coral", "Peach", "Rust", "Tangerine", "Vermilion", "Burnt Orange", "Pumpkin", "Terracotta"
  ],
  [COLOR_FAMILIES.YELLOW]: [
    "Canary", "Gold", "Lemon", "Mustard", "Ochre", "Saffron", "Amber", "Chartreuse", "Flaxen", "Honey"
  ],
  [COLOR_FAMILIES.GREEN]: [
    "Emerald", "Jade", "Forest", "Lime", "Olive", "Mint", "Sage", "Teal", "Hunter", "Seafoam"
  ],
  [COLOR_FAMILIES.BLUE]: [
    "Azure", "Cobalt", "Cyan", "Indigo", "Navy", "Royal", "Sky", "Turquoise", "Ultramarine", "Sapphire"
  ],
  [COLOR_FAMILIES.PURPLE]: [
    "Amethyst", "Lavender", "Lilac", "Magenta", "Mauve", "Plum", "Violet", "Orchid", "Periwinkle", "Eggplant"
  ],
  [COLOR_FAMILIES.BROWN]: [
    "Chocolate", "Coffee", "Mocha", "Mahogany", "Caramel", "Sepia", "Sienna", "Tan", "Umber", "Walnut"
  ],
  [COLOR_FAMILIES.GRAY]: [
    "Ash", "Charcoal", "Pewter", "Silver", "Slate", "Smoke", "Steel", "Stone", "Iron", "Graphite"
  ],
  [COLOR_FAMILIES.BLACK_WHITE]: [
    "Ebony", "Jet", "Obsidian", "Onyx", "Raven", "Ivory", "Pearl", "Alabaster", "Chalk", "Snow"
  ]
};

// Custom types for color search functionality
export interface ColorSearchResult {
  color: ColorData;
  distance: number;
}
