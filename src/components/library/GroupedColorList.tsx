
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ColorData } from "@/types/colors";
import { cn } from "@/lib/utils";
import ColorCard from "@/components/ColorCard";
import { getChroma, getLightness } from "@/utils/colorUtils";

type GroupedColorListProps = {
  groupedColors: Record<string, ColorData[]>;
  sortedFamilies: string[];
  displayFormat: "hex" | "rgb" | "lab" | "all";
  viewMode: "grid" | "list";
  sortMode: "name" | "family" | "hue" | "date" | "chroma" | "lightness";
  onColorClick: (color: ColorData) => void;
  onColorCopy: (color: ColorData, event: React.MouseEvent) => void;
  onDeleteColor: (id: string) => void;
};

const GroupedColorList = ({
  groupedColors,
  sortedFamilies,
  displayFormat,
  viewMode,
  sortMode,
  onColorClick,
  onColorCopy,
  onDeleteColor
}: GroupedColorListProps) => {
  // Function to further sort colors within each family
  const sortColorsWithinFamily = (colors: ColorData[]) => {
    return [...colors].sort((a, b) => {
      // First sort by sub-family if available
      const aSubFamily = typeof a.family === 'object' && a.family?.sub ? a.family.sub : '';
      const bSubFamily = typeof b.family === 'object' && b.family?.sub ? b.family.sub : '';
      
      if (aSubFamily && bSubFamily) {
        const subCompare = aSubFamily.localeCompare(bSubFamily);
        if (subCompare !== 0) return subCompare;
      }
      
      // Then sort by the selected sort mode
      switch (sortMode) {
        case "chroma":
          return getChroma(b.rgb) - getChroma(a.rgb);
        case "lightness":
          return getLightness(b.rgb) - getLightness(a.rgb);
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return parseInt(a.id) - parseInt(b.id);
      }
    });
  };

  // Get a representative color for a family for visual display
  const getFamilyRepresentativeColor = (familyColors: ColorData[]): string => {
    // Sort by chroma (saturation) to get a vivid representative color
    const sortedByChroma = [...familyColors].sort(
      (a, b) => getChroma(b.rgb) - getChroma(a.rgb)
    );
    
    return sortedByChroma[0].hex;
  };

  // Count shades within each family
  const getFamilyShadeCount = (familyColors: ColorData[]): number => {
    // Get unique sub-families
    return new Set(
      familyColors
        .map(color => typeof color.family === 'object' ? color.family.sub : null)
        .filter(Boolean)
    ).size;
  };

  return (
    <Accordion type="multiple" className="w-full space-y-4" defaultValue={sortedFamilies}>
      {sortedFamilies.map((family) => (
        <AccordionItem 
          key={family} 
          value={family}
          className="border rounded-md overflow-hidden bg-white dark:bg-gray-800"
        >
          <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-gray-50 dark:hover:bg-gray-700">
            <div className="flex items-center">
              <div 
                className="w-6 h-6 rounded-full mr-3 border border-gray-200" 
                style={{ backgroundColor: getFamilyRepresentativeColor(groupedColors[family]) }}
              />
              <span className="font-medium">{family} Family</span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                ({groupedColors[family].length} colors • {getFamilyShadeCount(groupedColors[family])} shades)
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="p-3 pb-4 border-t border-gray-100 dark:border-gray-700">
              <div className="flex flex-wrap gap-1 mb-3">
                {Array.from(new Set(groupedColors[family]
                  .map(color => typeof color.family === 'object' ? color.family.sub : null)
                  .filter(Boolean)))
                  .sort()
                  .map((subFamily) => (
                    <div 
                      key={subFamily} 
                      className="shade-tag"
                    >
                      {subFamily}
                    </div>
                ))}
              </div>
              <div className={cn(
                viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" 
                  : "flex flex-col gap-2"
              )}>
                {sortColorsWithinFamily(groupedColors[family]).map((color) => (
                  <ColorCard
                    key={color.id}
                    color={color}
                    displayFormat={displayFormat}
                    viewMode={viewMode}
                    onDelete={() => onDeleteColor(color.id)}
                    onClick={() => onColorClick(color)}
                    onCopy={(e) => onColorCopy(color, e)}
                  />
                ))}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default GroupedColorList;
