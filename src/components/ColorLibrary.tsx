
import { useState, useEffect } from "react";
import { ColorData, ColorLibraryData } from "@/types/colors";
import { toast } from "sonner";
import AddColorModal from "@/components/AddColorModal";
import ColorFilters from "@/components/ColorFilters";
import ColorFamilyGuide from "@/components/ColorFamilyGuide";
import ColorInfoDialog from "@/components/ColorInfoDialog";
import { useColorSorting } from "@/hooks/useColorSorting";

// Import refactored components
import ColorLibraryHeader from "@/components/library/ColorLibraryHeader";
import ColorSortControls from "@/components/library/ColorSortControls";
import EmptyLibraryState from "@/components/library/EmptyLibraryState";
import GroupedColorList from "@/components/library/GroupedColorList";
import UngroupedColorList from "@/components/library/UngroupedColorList";

type ColorLibraryProps = {
  library: ColorLibraryData;
  searchQuery: string;
  colorFamily: string | null;
  onDeleteColor: (id: string) => void;
  onAddColor: (color: ColorData) => void;
  setSearchQuery: (query: string) => void;
  setColorFamily: (family: string | null) => void;
};

type ViewMode = "grid" | "list";
type DisplayFormat = "hex" | "rgb" | "lab" | "all";
type GroupingMode = "none" | "family";

const ColorLibrary = ({
  library,
  searchQuery,
  colorFamily,
  setSearchQuery,
  setColorFamily,
  onDeleteColor,
  onAddColor
}: ColorLibraryProps) => {
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [displayFormat, setDisplayFormat] = useState<DisplayFormat>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [groupingMode, setGroupingMode] = useState<GroupingMode>("family");
  const [swatchSize, setSwatchSize] = useState(150);
  const [selectedColor, setSelectedColor] = useState<ColorData | null>(null);
  const [showColorInfo, setShowColorInfo] = useState(false);
  const [showFamilyGuide, setShowFamilyGuide] = useState(false);

  // Apply swatch size to CSS custom property
  useEffect(() => {
    document.documentElement.style.setProperty('--swatch-size', `${swatchSize}px`);
  }, [swatchSize]);
  
  // Use our custom hook for color filtering and sorting
  const {
    filteredColors,
    sortedColors,
    groupedColors,
    sortedFamilies,
    sortMode,
    setSortMode
  } = useColorSorting(library.colors, searchQuery, colorFamily);

  // Handle clicking on a color
  const handleColorClick = (color: ColorData) => {
    setSelectedColor(color);
    setShowColorInfo(true);
  };

  // Handle copying a color to clipboard
  const handleColorCopy = (color: ColorData, event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(color.hex);
    toast.success(`Copied ${color.hex} to clipboard`);
  };

  return (
    <div>
      <ColorLibraryHeader 
        libraryName={library.name}
        colorsCount={library.colors.length}
        filteredColorsCount={filteredColors.length}
        familiesCount={sortedFamilies.length}
        showFamilyGuide={showFamilyGuide}
        setShowFamilyGuide={setShowFamilyGuide}
        groupingMode={groupingMode}
        setGroupingMode={setGroupingMode}
        onAddColor={onAddColor}
      />
      
      {/* Color Family Guide */}
      {showFamilyGuide && <ColorFamilyGuide />}
      
      {/* Filters and Controls */}
      <ColorFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        colorFamily={colorFamily}
        setColorFamily={setColorFamily}
        sortMode={sortMode}
        setSortMode={setSortMode}
      />
      
      <ColorSortControls 
        displayFormat={displayFormat}
        setDisplayFormat={setDisplayFormat}
        viewMode={viewMode}
        setViewMode={setViewMode}
        swatchSize={swatchSize}
        setSwatchSize={setSwatchSize}
      />
      
      {sortedColors.length === 0 ? (
        <EmptyLibraryState 
          onAddClick={() => setIsAddModalOpen(true)} 
          hasFilters={!!searchQuery || colorFamily !== null}
        />
      ) : groupingMode === "family" ? (
        <GroupedColorList 
          groupedColors={groupedColors}
          sortedFamilies={sortedFamilies}
          displayFormat={displayFormat}
          viewMode={viewMode}
          sortMode={sortMode}
          onColorClick={handleColorClick}
          onColorCopy={handleColorCopy}
          onDeleteColor={onDeleteColor}
        />
      ) : (
        <UngroupedColorList 
          colors={sortedColors}
          displayFormat={displayFormat}
          viewMode={viewMode}
          onColorClick={handleColorClick}
          onColorCopy={handleColorCopy}
          onDeleteColor={onDeleteColor}
        />
      )}
      
      <AddColorModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={onAddColor}
      />
      
      <ColorInfoDialog 
        color={selectedColor} 
        isOpen={showColorInfo} 
        setIsOpen={setShowColorInfo} 
      />
    </div>
  );
};

export default ColorLibrary;
