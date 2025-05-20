
import React from "react";
import { ColorData } from "@/types/colors";
import { cn } from "@/lib/utils";
import ColorCard from "@/components/ColorCard";

type UngroupedColorListProps = {
  colors: ColorData[];
  displayFormat: "hex" | "rgb" | "lab" | "all";
  viewMode: "grid" | "list";
  onColorClick: (color: ColorData) => void;
  onColorCopy: (color: ColorData, event: React.MouseEvent) => void;
  onDeleteColor: (id: string) => void;
};

const UngroupedColorList = ({
  colors,
  displayFormat,
  viewMode,
  onColorClick,
  onColorCopy,
  onDeleteColor
}: UngroupedColorListProps) => {
  return (
    <div className={cn(
      viewMode === "grid" 
        ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" 
        : "flex flex-col gap-2"
    )}>
      {colors.map((color) => (
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
  );
};

export default UngroupedColorList;
