
import React from "react";
import ColorFormatSelector from "@/components/ColorFormatSelector";
import SwatchAppearanceControls from "@/components/SwatchAppearanceControls";

type ColorSortControlsProps = {
  displayFormat: "hex" | "rgb" | "lab" | "all";
  setDisplayFormat: (format: "hex" | "rgb" | "lab" | "all") => void;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  swatchSize: number;
  setSwatchSize: (size: number) => void;
};

const ColorSortControls = ({
  displayFormat,
  setDisplayFormat,
  viewMode,
  setViewMode,
  swatchSize,
  setSwatchSize
}: ColorSortControlsProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
      <ColorFormatSelector 
        displayFormat={displayFormat} 
        setDisplayFormat={setDisplayFormat} 
      />
      
      <SwatchAppearanceControls
        viewMode={viewMode}
        setViewMode={setViewMode}
        swatchSize={swatchSize}
        setSwatchSize={setSwatchSize}
      />
    </div>
  );
};

export default ColorSortControls;
