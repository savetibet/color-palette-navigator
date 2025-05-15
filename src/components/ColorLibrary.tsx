
import { useState } from "react";
import { ColorData, ColorLibraryData } from "@/types/colors";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ColorCard from "@/components/ColorCard";
import AddColorModal from "@/components/AddColorModal";
import { cn } from "@/lib/utils";

type ColorLibraryProps = {
  library: ColorLibraryData;
  searchQuery: string;
  colorFamily: string | null;
  onDeleteColor: (id: string) => void;
  onAddColor: (color: ColorData) => void;
};

type ViewMode = "grid" | "list";
type SortMode = "name" | "family" | "hue" | "date";
type DisplayFormat = "hex" | "rgb" | "lab" | "all";

const ColorLibrary = ({
  library,
  searchQuery,
  colorFamily,
  onDeleteColor,
  onAddColor
}: ColorLibraryProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("date");
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Filter colors based on search query and selected family
  const filteredColors = library.colors.filter((color) => {
    const matchesSearch = searchQuery
      ? color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        color.hex.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesFamily = colorFamily
      ? color.family === colorFamily
      : true;
      
    return matchesSearch && matchesFamily;
  });

  // Sort colors based on the current sort mode
  const sortedColors = [...filteredColors].sort((a, b) => {
    switch (sortMode) {
      case "name":
        return a.name.localeCompare(b.name);
      case "family":
        return (a.family || "").localeCompare(b.family || "");
      case "hue":
        // Simple hue comparison based on RGB (could be more sophisticated)
        const getHue = (color: ColorData) => {
          const r = color.rgb[0];
          const g = color.rgb[1];
          const b = color.rgb[2];
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          if (max === min) return 0;
          
          let hue = 0;
          if (max === r) {
            hue = (g - b) / (max - min);
          } else if (max === g) {
            hue = 2 + (b - r) / (max - min);
          } else {
            hue = 4 + (r - g) / (max - min);
          }
          
          hue *= 60;
          if (hue < 0) hue += 360;
          return hue;
        };
        return getHue(a) - getHue(b);
      case "date":
      default:
        // Using the id as a proxy for creation date order
        return parseInt(a.id) - parseInt(b.id);
    }
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {library.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {library.colors.length} colors in library • 
            {filteredColors.length} colors displayed
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <div className="flex border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
            <button
              className={cn("px-3 py-1 text-sm", 
                viewMode === "grid" 
                  ? "bg-blue-500 text-white" 
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              )}
              onClick={() => setViewMode("grid")}
            >
              Grid
            </button>
            <button
              className={cn("px-3 py-1 text-sm", 
                viewMode === "list" 
                  ? "bg-blue-500 text-white" 
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              )}
              onClick={() => setViewMode("list")}
            >
              List
            </button>
          </div>
          
          <select
            className="px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
          >
            <option value="date">Sort by Import Order</option>
            <option value="name">Sort by Name</option>
            <option value="family">Sort by Family</option>
            <option value="hue">Sort by Hue</option>
          </select>
          
          <select
            className="px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            value={displayFormat}
            onChange={(e) => setDisplayFormat(e.target.value as DisplayFormat)}
          >
            <option value="all">Show All Values</option>
            <option value="hex">Show HEX</option>
            <option value="rgb">Show RGB</option>
            <option value="lab">Show LAB</option>
          </select>
          
          <Button onClick={() => setIsAddModalOpen(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Color
          </Button>
        </div>
      </div>
      
      {sortedColors.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery || colorFamily ? "No colors match your filters" : "No colors in this library yet"}
          </p>
          <Button className="mt-4" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Color
          </Button>
        </div>
      ) : (
        <div className={cn(
          viewMode === "grid" 
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" 
            : "flex flex-col gap-2"
        )}>
          {sortedColors.map((color) => (
            <ColorCard
              key={color.id}
              color={color}
              displayFormat={displayFormat}
              viewMode={viewMode}
              onDelete={() => onDeleteColor(color.id)}
            />
          ))}
        </div>
      )}
      
      <AddColorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddColor}
      />
    </div>
  );
};

export default ColorLibrary;
