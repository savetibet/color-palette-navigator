import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ColorData, COLOR_FAMILIES } from "@/types/colors";
import { cn } from "@/lib/utils";

type ColorFamilyCardsProps = {
  colors: ColorData[];
  grouped: boolean;
}

const ColorFamilyCards = ({ colors, grouped }: ColorFamilyCardsProps) => {
  // Group colors by family if needed
  const groupedColors = grouped ? 
    colors.reduce<Record<string, ColorData[]>>((groups, color) => {
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
    }, {}) : 
    { "All Colors": colors };

  // Order families in a specific way (putting main color families first)
  const orderedFamilies = [
    COLOR_FAMILIES.RED,
    COLOR_FAMILIES.ORANGE, 
    COLOR_FAMILIES.YELLOW,
    COLOR_FAMILIES.GREEN,
    COLOR_FAMILIES.BLUE,
    COLOR_FAMILIES.PURPLE,
    COLOR_FAMILIES.BROWN,
    COLOR_FAMILIES.GRAY,
    COLOR_FAMILIES.BLACK,
    COLOR_FAMILIES.WHITE,
    "Unknown"
  ];

  // Filter the families to only include ones we have colors for
  const sortedFamilies = orderedFamilies.filter(
    family => grouped ? (groupedColors[family] && groupedColors[family].length > 0) : family === "All Colors"
  );

  // Add any remaining families not in our predefined list
  Object.keys(groupedColors)
    .filter(family => !orderedFamilies.includes(family))
    .forEach(family => sortedFamilies.push(family));

  return (
    <div className="space-y-6">
      {sortedFamilies.map(family => (
        <div key={family} className="space-y-3">
          {grouped && <h3 className="text-xl font-medium">{family}</h3>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {groupedColors[family]?.map(color => (
              <Card key={color.id} className="overflow-hidden">
                <div 
                  className="h-20 w-full" 
                  style={{ backgroundColor: color.hex }}
                />
                <div className="p-3">
                  <h4 className="font-medium text-sm">
                    {color.name || 'Unnamed Color'}
                  </h4>
                  <div className="mt-1 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Family:</span>
                      <span className="font-mono">
                        {typeof color.family === 'string' ? color.family : color.family?.main || 'Unknown'}
                        {typeof color.family === 'object' && color.family?.sub ? ` (${color.family.sub})` : ''}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">HEX:</span>
                      <span className="font-mono">{color.hex}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">LAB:</span>
                      <span className="font-mono">
                        {color.lab ? 
                          color.lab.map(v => Math.round(v * 100) / 100).join(", ") : 
                          "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">RGB:</span>
                      <span className="font-mono">{color.rgb.join(", ")}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ColorFamilyCards;
