
import { useMemo } from 'react';
import { ColorData } from '@/types/colors';

interface ColorCalculationHookResult {
  filteredColors: ColorData[];
  colorsByFamily: Record<string, ColorData[]>;
  familiesCount: number;
}

const useColorCalculations = (
  colors: ColorData[],
  searchQuery: string,
  colorFamily: string | null
): ColorCalculationHookResult => {
  // Memoized filtered colors
  const filteredColors = useMemo(() => {
    return colors.filter((color) => {
      const matchesSearch = searchQuery
        ? color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          color.hex.toLowerCase().includes(searchQuery.toLowerCase())
        : true;
        
      const matchesFamily = colorFamily
        ? color.family === colorFamily
        : true;
        
      return matchesSearch && matchesFamily;
    });
  }, [colors, searchQuery, colorFamily]);
  
  // Memoized colors grouped by family
  const colorsByFamily = useMemo(() => {
    return filteredColors.reduce<Record<string, ColorData[]>>((groups, color) => {
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
  }, [filteredColors]);

  // Count unique families
  const familiesCount = useMemo(() => {
    return Object.keys(colorsByFamily).length;
  }, [colorsByFamily]);

  return {
    filteredColors,
    colorsByFamily,
    familiesCount
  };
};

export default useColorCalculations;
