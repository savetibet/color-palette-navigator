
import { useState, useMemo } from "react";
import { ColorData, COLOR_FAMILIES } from "@/types/colors";
import { getChroma, getLightness } from "@/utils/colorUtils";

type SortMode = "name" | "family" | "hue" | "date" | "chroma" | "lightness";

export const useColorSorting = (
  colors: ColorData[],
  searchQuery: string,
  colorFamily: string | null,
  initialSortMode: SortMode = "family"
) => {
  const [sortMode, setSortMode] = useState<SortMode>(initialSortMode);

  // Filter colors based on search query and selected family
  const filteredColors = useMemo(() => {
    return colors.filter((color) => {
      const matchesSearch = searchQuery
        ? color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          color.hex.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
        
      const matchesFamily = colorFamily
        ? color.family === colorFamily || 
          (typeof color.family === 'object' && color.family?.main === colorFamily)
        : true;
        
      return matchesSearch && matchesFamily;
    });
  }, [colors, searchQuery, colorFamily]);

  // Sort colors based on the current sort mode
  const sortedColors = useMemo(() => {
    return [...filteredColors].sort((a, b) => {
      switch (sortMode) {
        case "name":
          return a.name.localeCompare(b.name);
        case "family":
          // Sort by main family first, then by sub-family
          const aFamily = typeof a.family === 'string' ? a.family : (a.family?.main || '');
          const bFamily = typeof b.family === 'string' ? b.family : (b.family?.main || '');
          return aFamily.localeCompare(bFamily);
        case "hue":
          // Sort by hue using RGB values
          const getHue = (color: ColorData) => {
            const r = color.rgb[0];
            const g = color.rgb[1];
            const b = color.rgb[2];
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            if (max === min) return 0;
            
            let hue = 0;
            if (max === r) {
              hue = (g - b) / (max - min);
            } else if (max === g) {
              hue = 2 + (b - r) / (max - min);
            } else {
              hue = 4 + (r - g) / (max - min);
            }
            
            hue *= 60;
            if (hue < 0) hue += 360;
            return hue;
          };
          return getHue(a) - getHue(b);
        case "chroma":
          // Sort by chroma (saturation)
          return getChroma(b.rgb) - getChroma(a.rgb);
        case "lightness":
          // Sort by lightness
          return getLightness(b.rgb) - getLightness(a.rgb);
        case "date":
        default:
          // Using the id as a proxy for creation date order
          return parseInt(a.id) - parseInt(b.id);
      }
    });
  }, [filteredColors, sortMode]);

  // Group colors by family in a standardized order of families
  const groupedColors = useMemo(() => {
    return sortedColors.reduce<Record<string, ColorData[]>>((groups, color) => {
      // Handle string or object family
      let familyName = "Unknown";
      if (typeof color.family === 'string') {
        familyName = color.family;
      } else if (color.family && typeof color.family === 'object') {
        familyName = color.family.main;
      }

      if (!groups[familyName]) {
        groups[familyName] = [];
      }
      groups[familyName].push(color);
      return groups;
    }, {});
  }, [sortedColors]);

  // Order families in a specific way
  const sortedFamilies = useMemo(() => {
    // Put main color families first
    const orderedFamilies = [
      COLOR_FAMILIES.RED,
      COLOR_FAMILIES.ORANGE, 
      COLOR_FAMILIES.YELLOW,
      COLOR_FAMILIES.GREEN,
      COLOR_FAMILIES.BLUE,
      COLOR_FAMILIES.PURPLE,
      COLOR_FAMILIES.PINK,
      COLOR_FAMILIES.BROWN,
      COLOR_FAMILIES.GRAY,
      COLOR_FAMILIES.BLACK,
      COLOR_FAMILIES.WHITE,
      COLOR_FAMILIES.TEAL,
      "Unknown"
    ];

    // Filter the families to only include ones we have colors for
    const families = orderedFamilies.filter(
      family => groupedColors[family] && groupedColors[family].length > 0
    );

    // Add any remaining families not in our predefined list
    Object.keys(groupedColors)
      .filter(family => !orderedFamilies.includes(family))
      .forEach(family => families.push(family));

    return families;
  }, [groupedColors]);
  
  return {
    filteredColors,
    sortedColors,
    groupedColors,
    sortedFamilies,
    sortMode,
    setSortMode
  };
};
