
import React from "react";
import { COLOR_FAMILIES, COLOR_SHADES } from "@/types/colors";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const ColorFamilyGuide = () => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4">Color Family Guide</h2>
      <Accordion type="multiple" className="w-full">
        {Object.keys(COLOR_SHADES).map((family) => (
          <AccordionItem key={family} value={family}>
            <AccordionTrigger className="text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ 
                    backgroundColor: getRepresentativeColor(family)
                  }}
                ></div>
                <span>{family}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({COLOR_SHADES[family].length} shades)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-wrap gap-1 mt-2">
                {COLOR_SHADES[family].map((shade) => (
                  <span 
                    key={shade} 
                    className="shade-tag"
                  >
                    {shade}
                  </span>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

// Helper function to get a representative color for a family
const getRepresentativeColor = (family: string): string => {
  switch (family) {
    case COLOR_FAMILIES.RED:
      return "#e74c3c";
    case COLOR_FAMILIES.ORANGE:
      return "#e67e22";
    case COLOR_FAMILIES.YELLOW:
      return "#f1c40f";
    case COLOR_FAMILIES.GREEN:
      return "#2ecc71";
    case COLOR_FAMILIES.BLUE:
      return "#3498db";
    case COLOR_FAMILIES.PURPLE:
      return "#9b59b6";
    case COLOR_FAMILIES.BROWN:
      return "#a0522d";
    case COLOR_FAMILIES.GRAY:
      return "#7f8c8d";
    case COLOR_FAMILIES.BLACK:
      return "#34495e";
    case COLOR_FAMILIES.WHITE:
      return "#ffffff";
    case COLOR_FAMILIES.TEAL:
      return "#00bcd4";
    default:
      return "#95a5a6";
  }
};

export default ColorFamilyGuide;
