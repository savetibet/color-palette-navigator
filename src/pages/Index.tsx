import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { ColorData, ColorLibraryData } from "@/types/colors";
import { cn } from "@/lib/utils";
import SampleTemplateButton from "@/components/SampleTemplateButton";
import ColorSearchInput from "@/components/ColorSearchInput";
import ColorSimilarityResults from "@/components/ColorSimilarityResults";
import LoadingSpinner from "@/components/LoadingSpinner";
import ColorAlbums from "@/components/ColorAlbums";
import { colorApiService } from "@/services/colorApi";
import { transformBackendColorToFrontend } from "@/utils/colorDataTransform";

// Lazy load heavy components
const ColorLibrary = lazy(() => import("@/components/ColorLibrary"));
const ImportModal = lazy(() => import("@/components/ImportModal"));

const Index = () => {
  const [colorLibraries, setColorLibraries] = useState<ColorLibraryData[]>([]);
  const [activeLibrary, setActiveLibrary] = useState<number | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [colorFamily, setColorFamily] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [similarityResults, setSimilarityResults] = useState<ColorData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAlbums, setShowAlbums] = useState(false);

  // Load colors from API on component mount
  useEffect(() => {
    const loadColorsFromAPI = async () => {
      setIsProcessing(true);
      try {
        const backendColors = await colorApiService.getAllColors();
        const transformedColors = backendColors.map(transformBackendColorToFrontend);
        
        // Create a default library with API colors
        const apiLibrary: ColorLibraryData = {
          id: 1,
          name: "API Color Library",
          colors: transformedColors,
          createdAt: new Date().toISOString()
        };
        
        setColorLibraries([apiLibrary]);
        setActiveLibrary(0);
        toast.success(`Loaded ${transformedColors.length} colors from API`);
      } catch (error) {
        console.error("Error loading colors from API:", error);
        toast.error("Failed to load colors from API");
        
        // Fallback to localStorage if API fails
        const savedLibraries = localStorage.getItem("colorLibraries");
        if (savedLibraries) {
          try {
            const parsed = JSON.parse(savedLibraries);
            setColorLibraries(parsed);
            if (parsed.length > 0) {
              setActiveLibrary(0);
            }
          } catch (parseError) {
            console.error("Error parsing saved libraries:", parseError);
          }
        }
      } finally {
        setIsProcessing(false);
      }
      
      // Check for saved theme preference
      const savedTheme = localStorage.getItem("darkMode");
      if (savedTheme === "true") {
        setDarkMode(true);
        document.documentElement.classList.add("dark");
      }
    };

    loadColorsFromAPI();
  }, []);

  // Save libraries to localStorage whenever they change
  useEffect(() => {
    // Use a debounced save to avoid excessive writes
    const saveTimeout = setTimeout(() => {
      localStorage.setItem("colorLibraries", JSON.stringify(colorLibraries));
    }, 500);
    
    return () => clearTimeout(saveTimeout);
  }, [colorLibraries]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", (!darkMode).toString());
  }, [darkMode]);

  // Get all colors from the active library
  const activeLibraryColors = activeLibrary !== null && colorLibraries[activeLibrary]
    ? colorLibraries[activeLibrary].colors
    : [];

  // Handle import
  const handleImport = useCallback((name: string, colors: ColorData[]) => {
    setIsProcessing(true);
    
    // Use setTimeout to prevent UI blocking during processing
    setTimeout(() => {
      // Process colors to add family classification
      const processedColors = colors.map(color => ({
        ...color,
        family: getColorFamily(color.rgb)
      }));
      
      const newLibrary: ColorLibraryData = {
        id: Date.now(),
        name,
        colors: processedColors,
        createdAt: new Date().toISOString()
      };
  
      setColorLibraries(prev => [...prev, newLibrary]);
      setActiveLibrary(prev => prev !== null ? prev : 0);
      setImportModalOpen(false);
      toast.success(`Imported ${processedColors.length} colors into "${name}"`);
      setIsProcessing(false);
    }, 0);
  }, []);

  // Handle delete library
  const handleDeleteLibrary = useCallback((id: number) => {
    if (confirm("Are you sure you want to delete this library? This action cannot be undone.")) {
      setColorLibraries(prev => {
        const updatedLibraries = prev.filter(lib => lib.id !== id);
        
        // Reset active library if the deleted one was active
        if (activeLibrary !== null && prev[activeLibrary]?.id === id) {
          setTimeout(() => {
            setActiveLibrary(updatedLibraries.length > 0 ? 0 : null);
          }, 0);
        }
        
        return updatedLibraries;
      });
      
      toast.success("Library deleted successfully");
    }
  }, [activeLibrary, colorLibraries]);

  // Handle color delete
  const handleColorDelete = useCallback(async (colorId: string) => {
    if (activeLibrary === null) return;
    
    setIsProcessing(true);
    
    try {
      // Delete from API
      await colorApiService.deleteColor(parseInt(colorId));
      
      // Update local state
      setColorLibraries(prev => {
        const updatedLibraries = [...prev];
        const libraryIndex = prev.findIndex(lib => lib.id === prev[activeLibrary].id);
        
        updatedLibraries[libraryIndex] = {
          ...updatedLibraries[libraryIndex],
          colors: updatedLibraries[libraryIndex].colors.filter(color => color.id !== colorId)
        };
        
        return updatedLibraries;
      });
      
      toast.success("Color removed successfully");
    } catch (error) {
      console.error("Error deleting color:", error);
      toast.error("Failed to delete color");
    } finally {
      setIsProcessing(false);
    }
  }, [activeLibrary]);

  // Handle add color
  const handleAddColor = useCallback((color: ColorData) => {
    if (activeLibrary === null) {
      toast.error("Please select or create a library first");
      return;
    }
    
    // Color is already added via API in AddColorModal
    // Just update the local state
    setColorLibraries(prev => {
      const updatedLibraries = [...prev];
      const libraryIndex = prev.findIndex(lib => lib.id === prev[activeLibrary].id);
      
      updatedLibraries[libraryIndex] = {
        ...updatedLibraries[libraryIndex],
        colors: [...updatedLibraries[libraryIndex].colors, color]
      };
      
      return updatedLibraries;
    });
  }, [activeLibrary]);

  // Handle export
  const handleExport = useCallback((libraryId: number) => {
    const library = colorLibraries.find(lib => lib.id === libraryId);
    if (!library) return;
    
    setIsProcessing(true);
    
    try {
      setTimeout(() => {
        // Create workbook
        const workbook = XLSX.utils.book_new();
        
        // Format colors for export
        const exportData = library.colors.map(color => ({
          Name: color.name,
          HEX: color.hex,
          RGB: `rgb(${color.rgb.join(", ")})`,
          Family: typeof color.family === 'string' 
            ? color.family 
            : `${color.family.main}${color.family.sub ? ` - ${color.family.sub}` : ''}`
        }));
        
        // Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, library.name);
        
        // Generate file and download
        XLSX.writeFile(workbook, `${library.name}-colors.xlsx`);
        
        toast.success(`Exported "${library.name}" library`);
        setIsProcessing(false);
      }, 0);
    } catch (error) {
      console.error("Error exporting library:", error);
      toast.error("Failed to export library");
      setIsProcessing(false);
    }
  }, [colorLibraries]);

  // Handle color search
  const handleColorSearch = useCallback((results: ColorData[]) => {
    setSimilarityResults(results);
  }, []);

  return (
    <div className={cn("min-h-screen bg-gray-50 transition-colors duration-300", 
                      darkMode && "dark bg-gray-900")}>
      <Navbar 
        colorLibraries={colorLibraries}
        activeLibrary={activeLibrary}
        setActiveLibrary={setActiveLibrary}
        openImportModal={() => setImportModalOpen(true)}
        onExport={() => {}} // Disable export for API mode
        onDeleteLibrary={() => {}} // Disable delete for API mode
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        colorFamily={colorFamily}
        setColorFamily={setColorFamily}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        isProcessing={isProcessing}
      />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setShowAlbums(false)}
            className={cn(
              "px-4 py-2 rounded-md transition",
              !showAlbums 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            )}
          >
            Color Library
          </button>
          <button
            onClick={() => setShowAlbums(true)}
            className={cn(
              "px-4 py-2 rounded-md transition",
              showAlbums 
                ? "bg-blue-500 text-white" 
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            )}
          >
            Color Albums
          </button>
        </div>

        {showAlbums ? (
          <ColorAlbums 
            onDeleteColor={handleColorDelete}
            onAddColor={handleAddColor}
          />
        ) : (
          <>
            {activeLibrary !== null && colorLibraries[activeLibrary] ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {colorLibraries[activeLibrary].name}
                  </h1>
                  <ColorSearchInput 
                    allColors={activeLibraryColors}
                    onSearchResults={handleColorSearch} 
                  />
                </div>
                
                <Suspense fallback={
                  <div className="flex justify-center items-center h-64">
                    <LoadingSpinner size="lg" />
                  </div>
                }>
                  <ColorLibrary 
                    library={colorLibraries[activeLibrary]}
                    searchQuery={searchQuery}
                    colorFamily={colorFamily}
                    onDeleteColor={handleColorDelete}
                    onAddColor={handleAddColor}
                    isProcessing={isProcessing}
                  />
                </Suspense>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">
                  No Color Library Selected
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                  Loading colors from API...
                </p>
                {isProcessing && <LoadingSpinner size="lg" />}
              </div>
            )}
          </>
        )}
      </main>

      <Suspense fallback={
        <div className="flex justify-center items-center h-32">
          <LoadingSpinner size="lg" />
        </div>
      }>
        <ImportModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImport={() => {}} // Disable import for API mode
        />
      </Suspense>
      
      {similarityResults.length > 0 && (
        <ColorSimilarityResults 
          results={similarityResults}
          onClose={() => setSimilarityResults([])}
          displayFormat="all"
        />
      )}
    </div>
  );
};

export default Index;
