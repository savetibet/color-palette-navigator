
import React from "react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { GroupIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import ColorPicker from "@/components/ColorPicker";

type ColorLibraryHeaderProps = {
  libraryName: string;
  colorsCount: number;
  filteredColorsCount: number;
  familiesCount: number;
  showFamilyGuide: boolean;
  setShowFamilyGuide: (show: boolean) => void;
  groupingMode: "none" | "family";
  setGroupingMode: (mode: "none" | "family") => void;
  onAddColor: (color: any) => void;
};

const ColorLibraryHeader = ({
  libraryName,
  colorsCount,
  filteredColorsCount,
  familiesCount,
  showFamilyGuide,
  setShowFamilyGuide,
  groupingMode,
  setGroupingMode,
  onAddColor
}: ColorLibraryHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          {libraryName}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {colorsCount} colors in library • 
          {filteredColorsCount} colors displayed • 
          {familiesCount} color families
        </p>
      </div>
      
      <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
        <Toggle 
          pressed={showFamilyGuide}
          onPressedChange={setShowFamilyGuide}
          aria-label="Show color family guide"
        >
          Color Families
        </Toggle>
        
        <Toggle 
          pressed={groupingMode === "family"}
          onPressedChange={() => setGroupingMode(groupingMode === "family" ? "none" : "family")}
          aria-label="Group by family"
          className={cn(
            "px-3",
            groupingMode === "family" && "bg-blue-100 dark:bg-blue-900"
          )}
        >
          <GroupIcon className="h-4 w-4 mr-1" />
          Group by Family
        </Toggle>
        
        <ColorPicker onAddColor={onAddColor} />
      </div>
    </div>
  );
};

export default ColorLibraryHeader;
