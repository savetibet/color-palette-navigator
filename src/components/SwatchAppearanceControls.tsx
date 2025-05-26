
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import SwatchSizeController from "./SwatchSizeController";
import { Grid2X2, List } from "lucide-react";

type SwatchAppearanceControlsProps = {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  swatchSize: number;
  setSwatchSize: (size: number) => void;
};

const SwatchAppearanceControls = ({
  viewMode,
  setViewMode,
  swatchSize,
  setSwatchSize
}: SwatchAppearanceControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center mb-4">
      <div className="flex">
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "grid" | "list")}>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <Grid2X2 className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      
      <div className="flex-1">
        <SwatchSizeController swatchSize={swatchSize} setSwatchSize={setSwatchSize} />
      </div>
    </div>
  );
};

export default SwatchAppearanceControls;
