
import { useState, useEffect } from "react";
import { toast } from "sonner";
import ColorLibrary from "@/components/ColorLibrary";
import ImportModal from "@/components/ImportModal";
import Navbar from "@/components/Navbar";
import { ColorData, ColorLibraryData } from "@/types/colors";
import { getColorFamily } from "@/utils/colorUtils";
import { cn } from "@/lib/utils";
import SampleTemplateButton from "@/components/SampleTemplateButton";

const Index = () => {
  const [colorLibraries, setColorLibraries] = useState<ColorLibraryData[]>([]);
  const [activeLibrary, setActiveLibrary] = useState<number | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [colorFamily, setColorFamily] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Load saved libraries from localStorage on component mount
  useEffect(() => {
    const savedLibraries = localStorage.getItem("colorLibraries");
    if (savedLibraries) {
      try {
        const parsed = JSON.parse(savedLibraries);
        setColorLibraries(parsed);
        if (parsed.length > 0 && activeLibrary === null) {
          setActiveLibrary(0);
        }
      } catch (error) {
        console.error("Error parsing saved libraries:", error);
      }
    }
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Save libraries to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("colorLibraries", JSON.stringify(colorLibraries));
  }, [colorLibraries]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", (!darkMode).toString());
  };

  const handleImport = (name: string, colors: ColorData[]) => {
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

    setColorLibraries([...colorLibraries, newLibrary]);
    setActiveLibrary(colorLibraries.length);
    setImportModalOpen(false);
    toast.success(`Imported ${processedColors.length} colors into "${name}"`);
  };

  const handleDeleteLibrary = (id: number) => {
    if (confirm("Are you sure you want to delete this library? This action cannot be undone.")) {
      const updatedLibraries = colorLibraries.filter(lib => lib.id !== id);
      setColorLibraries(updatedLibraries);
      
      // Reset active library if the deleted one was active
      if (activeLibrary !== null && colorLibraries[activeLibrary].id === id) {
        setActiveLibrary(updatedLibraries.length > 0 ? 0 : null);
      }
      
      toast.success("Library deleted successfully");
    }
  };

  const handleColorDelete = (colorId: string) => {
    if (activeLibrary === null) return;
    
    const updatedLibraries = [...colorLibraries];
    const libraryIndex = colorLibraries.findIndex(lib => lib.id === colorLibraries[activeLibrary].id);
    
    updatedLibraries[libraryIndex] = {
      ...updatedLibraries[libraryIndex],
      colors: updatedLibraries[libraryIndex].colors.filter(color => color.id !== colorId)
    };
    
    setColorLibraries(updatedLibraries);
    toast.success("Color removed successfully");
  };

  const handleAddColor = (color: ColorData) => {
    if (activeLibrary === null) {
      toast.error("Please select or create a library first");
      return;
    }
    
    const updatedLibraries = [...colorLibraries];
    const libraryIndex = colorLibraries.findIndex(lib => lib.id === colorLibraries[activeLibrary].id);
    
    updatedLibraries[libraryIndex] = {
      ...updatedLibraries[libraryIndex],
      colors: [...updatedLibraries[libraryIndex].colors, {
        ...color,
        id: Date.now().toString(),
        family: getColorFamily(color.rgb)
      }]
    };
    
    setColorLibraries(updatedLibraries);
    toast.success("Color added successfully");
  };

  const handleExport = (libraryId: number) => {
    const library = colorLibraries.find(lib => lib.id === libraryId);
    if (!library) return;
    
    try {
      // Create workbook
      const workbook = XLSX.utils.book_new();
      
      // Format colors for export
      const exportData = library.colors.map(color => ({
        Name: color.name,
        HEX: color.hex,
        RGB: `rgb(${color.rgb.join(", ")})`,
        Family: color.family || "Unknown"
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, library.name);
      
      // Generate file and download
      XLSX.writeFile(workbook, `${library.name}-colors.xlsx`);
      
      toast.success(`Exported "${library.name}" library`);
    } catch (error) {
      console.error("Error exporting library:", error);
      toast.error("Failed to export library");
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 transition-colors duration-300", 
                      darkMode && "dark bg-gray-900")}>
      <Navbar 
        colorLibraries={colorLibraries}
        activeLibrary={activeLibrary}
        setActiveLibrary={setActiveLibrary}
        openImportModal={() => setImportModalOpen(true)}
        onExport={handleExport}
        onDeleteLibrary={handleDeleteLibrary}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        colorFamily={colorFamily}
        setColorFamily={setColorFamily}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      
      <main className="container mx-auto px-4 py-6">
        {activeLibrary !== null && colorLibraries[activeLibrary] ? (
          <ColorLibrary 
            library={colorLibraries[activeLibrary]}
            searchQuery={searchQuery}
            colorFamily={colorFamily}
            onDeleteColor={handleColorDelete}
            onAddColor={handleAddColor}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-4">
              No Color Library Selected
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md">
              Import a new color library or create one by adding colors manually.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setImportModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                Import Colors
              </button>
              <SampleTemplateButton />
            </div>
            <div className="mt-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <h3 className="text-lg font-medium mb-2">How to import colors:</h3>
              <ol className="list-decimal list-inside text-left text-gray-600 dark:text-gray-400 space-y-2">
                <li>Download the template file using the button above</li>
                <li>Fill in your color data (Name, HEX or RGB values)</li>
                <li>Save the file as Excel (.xlsx) or CSV (.csv)</li>
                <li>Click "Import Colors" and upload your file</li>
                <li>Verify the imported data and give your library a name</li>
              </ol>
            </div>
          </div>
        )}
      </main>

      <ImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
};

export default Index;
