
import React from "react";
import { Slider } from "@/components/ui/slider";

type SwatchSizeControllerProps = {
  swatchSize: number;
  setSwatchSize: (size: number) => void;
};

const SwatchSizeController = ({ swatchSize, setSwatchSize }: SwatchSizeControllerProps) => {
  return (
    <div className="flex items-center gap-3 w-full max-w-xs">
      <span className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">Swatch Size:</span>
      <Slider
        min={100}
        max={200}
        step={10}
        value={[swatchSize]}
        onValueChange={(values) => setSwatchSize(values[0])}
        aria-label="Adjust swatch size"
      />
      <span className="text-sm font-mono w-10 text-right">{swatchSize}</span>
    </div>
  );
};

export default SwatchSizeController;
