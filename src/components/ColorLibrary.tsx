import { useState } from "react";
import { ColorData, ColorLibraryData, COLOR_FAMILIES } from "@/types/colors";
import { Button } from "@/components/ui/button";
import { Plus, List, Grid2X2, GroupIcon } from "lucide-react";
import ColorCard from "@/components/ColorCard";
import AddColorModal from "@/components/AddColorModal";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getChroma, getLightness } from "@/utils/colorUtils";

type ColorLibraryProps = {
  library: ColorLibraryData;
  searchQuery: string;
  colorFamily: string | null;
  onDeleteColor: (id: string) => void;
  onAddColor: (color: ColorData) => void;
};

type ViewMode = "grid" | "list";
type SortMode = "name" | "family" | "hue" | "date" | "chroma" | "lightness";
type DisplayFormat = "hex" | "rgb" | "lab" | "all";
type GroupingMode = "none" | "family";

const ColorLibrary = ({
  library,
  searchQuery,
  colorFamily,
  onDeleteColor,
  onAddColor
}: ColorLibraryProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortMode, setSortMode] = useState<SortMode>("family");
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [groupingMode, setGroupingMode] = useState<GroupingMode>("family");  // Default to grouped by family

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
        // Sort by main family first, then by sub-family
        const aFamily = typeof a.family === 'string' ? a.family : '';
        const bFamily = typeof b.family === 'string' ? b.family : '';
        return aFamily.localeCompare(bFamily);
      case "hue":
        // Sort by hue using RGB values
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
      case "chroma":
        // Sort by chroma (saturation)
        return getChroma(b.rgb) - getChroma(a.rgb);
      case "lightness":
        // Sort by lightness
        return getLightness(b.rgb) - getLightness(a.rgb);
      case "date":
      default:
        // Using the id as a proxy for creation date order
        return parseInt(a.id) - parseInt(b.id);
    }
  });

  // Group colors by family in a standardized order of families
  const groupedColors = sortedColors.reduce<Record<string, ColorData[]>>((groups, color) => {
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
  }, {});

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
    COLOR_FAMILIES.BLACK_WHITE,
    "Unknown"
  ];

  // Filter the families to only include ones we have colors for
  const sortedFamilies = orderedFamilies.filter(
    family => groupedColors[family] && groupedColors[family].length > 0
  );

  // Add any remaining families not in our predefined list
  Object.keys(groupedColors)
    .filter(family => !orderedFamilies.includes(family))
    .forEach(family => sortedFamilies.push(family));

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
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            {library.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {library.colors.length} colors in library • 
            {filteredColors.length} colors displayed • 
            {sortedFamilies.length} color families
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as ViewMode)}>
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <Grid2X2 className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          
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
          
          <select
            className="px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
          >
            <option value="family">Sort by Family</option>
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Import Order</option>
            <option value="hue">Sort by Hue</option>
            <option value="chroma">Sort by Saturation</option>
            <option value="lightness">Sort by Lightness</option>
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
      ) : groupingMode === "family" ? (
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
                          className="px-2 py-0.5 text-xs rounded-full bg-gray-100 
                                    dark:bg-gray-700 text-gray-800 dark:text-gray-200"
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
                      />
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
