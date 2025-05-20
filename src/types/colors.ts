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
  PINK: "Pink",
  BROWN: "Brown",
  GRAY: "Gray",
  BLACK: "Black",
  WHITE: "White",
  TEAL: "Aqua/Teal"
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
    "Emerald", "Jade", "Forest", "Lime", "Olive", "Mint", "Sage", "Hunter", "Seafoam"
  ],
  [COLOR_FAMILIES.BLUE]: [
    "Azure", "Cobalt", "Cyan", "Indigo", "Navy", "Royal", "Sky", "Ultramarine", "Sapphire"
  ],
  [COLOR_FAMILIES.PURPLE]: [
    "Amethyst", "Lavender", "Lilac", "Mauve", "Plum", "Violet", "Orchid", "Periwinkle", "Eggplant"
  ],
  [COLOR_FAMILIES.PINK]: [
    "Rose", "Hot Pink", "Light Pink", "Deep Pink", "Salmon", "Magenta", "Fuchsia", "Blush", "Bubblegum"
  ],
  [COLOR_FAMILIES.BROWN]: [
    "Chocolate", "Coffee", "Mocha", "Mahogany", "Caramel", "Sepia", "Sienna", "Tan", "Umber", "Walnut"
  ],
  [COLOR_FAMILIES.GRAY]: [
    "Ash", "Charcoal", "Pewter", "Silver", "Slate", "Smoke", "Steel", "Stone", "Iron", "Graphite"
  ],
  [COLOR_FAMILIES.BLACK]: [
    "Ebony", "Jet", "Obsidian", "Onyx", "Raven"
  ],
  [COLOR_FAMILIES.WHITE]: [
    "Ivory", "Pearl", "Alabaster", "Chalk", "Snow"
  ],
  [COLOR_FAMILIES.TEAL]: [
    "Turquoise", "Deep Teal", "Light Aqua", "Muted Teal", "Cyan", "Seafoam", "Aquamarine", "Marine"
  ]
};
