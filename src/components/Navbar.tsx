
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Search, Moon, Sun, Plus, Download, Trash2 } from "lucide-react";
import { ColorLibraryData } from "@/types/colors";
import { cn } from "@/lib/utils";

type NavbarProps = {
  colorLibraries: ColorLibraryData[];
  activeLibrary: number | null;
  setActiveLibrary: (index: number) => void;
  openImportModal: () => void;
  onExport: (libraryId: number) => void;
  onDeleteLibrary: (libraryId: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  colorFamily: string | null;
  setColorFamily: (family: string | null) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
};

const COLOR_FAMILIES = [
  "Red", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink", "Brown", "Gray", "Black", "White"
];

const Navbar = ({
  colorLibraries,
  activeLibrary,
  setActiveLibrary,
  openImportModal,
  onExport,
  onDeleteLibrary,
  searchQuery,
  setSearchQuery,
  colorFamily,
  setColorFamily,
  darkMode,
  toggleDarkMode
}: NavbarProps) => {
  const [isLibraryMenuOpen, setIsLibraryMenuOpen] = useState(false);

  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm py-4">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white mr-4">
            TCM Digital Color Libraries
          </h1>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDarkMode}
            className="ml-2"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Popover open={isLibraryMenuOpen} onOpenChange={setIsLibraryMenuOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                {activeLibrary !== null && colorLibraries[activeLibrary]
                  ? colorLibraries[activeLibrary].name
                  : "Select Library"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <div className="py-2">
                {colorLibraries.length > 0 ? (
                  colorLibraries.map((library, index) => (
                    <div 
                      key={library.id} 
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        setActiveLibrary(index);
                        setIsLibraryMenuOpen(false);
                      }}
                    >
                      <span className={cn(
                        "text-sm",
                        activeLibrary === index ? "font-medium text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                      )}>
                        {library.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onExport(library.id);
                          }}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 text-red-500" 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteLibrary(library.id);
                            setIsLibraryMenuOpen(false);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                    No libraries available
                  </div>
                )}
                <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm px-4 py-2 h-auto font-normal"
                    onClick={() => {
                      openImportModal();
                      setIsLibraryMenuOpen(false);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-2" />
                    Import New Library
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search colors..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                {colorFamily || "All Families"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <div className="py-2">
                <div 
                  className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setColorFamily(null)}
                >
                  <span className={cn(
                    "text-sm",
                    colorFamily === null ? "font-medium text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                  )}>
                    All Colors
                  </span>
                </div>
                {COLOR_FAMILIES.map((family) => (
                  <div 
                    key={family} 
                    className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => setColorFamily(family)}
                  >
                    <span className={cn(
                      "text-sm",
                      colorFamily === family ? "font-medium text-blue-600 dark:text-blue-400" : "text-gray-700 dark:text-gray-300"
                    )}>
                      {family}
                    </span>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
