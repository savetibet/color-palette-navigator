
import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EyeIcon } from "lucide-react";

type ColorFormatSelectorProps = {
  displayFormat: "hex" | "rgb" | "lab" | "all";
  setDisplayFormat: (format: "hex" | "rgb" | "lab" | "all") => void;
};

const ColorFormatSelector = ({ displayFormat, setDisplayFormat }: ColorFormatSelectorProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start mb-4">
      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
        <EyeIcon className="h-4 w-4 mr-1" /> Display Format:
      </span>
      <ToggleGroup type="single" value={displayFormat} onValueChange={(value) => value && setDisplayFormat(value as "hex" | "rgb" | "lab" | "all")}>
        <ToggleGroupItem value="hex" aria-label="Show HEX values">
          HEX
        </ToggleGroupItem>
        <ToggleGroupItem value="rgb" aria-label="Show RGB values">
          RGB
        </ToggleGroupItem>
        <ToggleGroupItem value="lab" aria-label="Show LAB values">
          LAB
        </ToggleGroupItem>
        <ToggleGroupItem value="all" aria-label="Show all values">
          ALL
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default ColorFormatSelector;
