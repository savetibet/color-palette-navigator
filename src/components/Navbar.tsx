
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  Trash2, 
  Plus, 
  Search, 
  Share2, 
  Sun, 
  Moon,
  Palette
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ColorLibraryData } from "@/types/colors";
import { COLOR_FAMILIES } from "@/types/colors";

interface NavbarProps {
  colorLibraries: ColorLibraryData[];
  activeLibrary: number | null;
  setActiveLibrary: (index: number | null) => void;
  openImportModal: () => void;
  onExport: (id: number) => void;
  onDeleteLibrary: (id: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  colorFamily: string | null;
  setColorFamily: (family: string | null) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

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
  const [searchOpen, setSearchOpen] = useState(false);
  
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* App Title */}
          <div className="flex items-center gap-2">
            <Palette className="h-6 w-6 text-blue-500" />
            <span className="font-medium text-xl">Color Library</span>
          </div>
          
          {/* Library Selector */}
          <div className="hidden md:flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[150px]">
                  {activeLibrary !== null && colorLibraries[activeLibrary]
                    ? colorLibraries[activeLibrary].name
                    : "Select Library"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Color Libraries</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {colorLibraries.length > 0 ? (
                  colorLibraries.map((lib, index) => (
                    <DropdownMenuItem
                      key={lib.id}
                      onClick={() => setActiveLibrary(index)}
                      className="flex justify-between"
                    >
                      <span>{lib.name}</span>
                      <span className="text-gray-500 text-xs">{lib.colors.length}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem disabled>No libraries</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={openImportModal} className="text-blue-500">
                  <Plus className="mr-2 h-4 w-4" /> Import New
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Export Button */}
            {activeLibrary !== null && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onExport(colorLibraries[activeLibrary].id)
                }
              >
                <Share2 className="mr-1 h-4 w-4" /> Export
              </Button>
            )}

            {/* Delete Library */}
            {activeLibrary !== null && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onDeleteLibrary(colorLibraries[activeLibrary].id)
                }
              >
                <Trash2 className="mr-1 h-4 w-4" /> Delete
              </Button>
            )}

            {/* Color Family Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {colorFamily || "All Families"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setColorFamily(null)}>
                  All Families
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {Object.values(COLOR_FAMILIES).map((family) => (
                  <DropdownMenuItem
                    key={family}
                    onClick={() => setColorFamily(family)}
                  >
                    {family}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Search and Theme Toggle */}
          <div className="flex items-center">
            {searchOpen ? (
              <div className="relative w-64">
                <Input
                  type="text"
                  placeholder="Search colors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-8"
                />
                <button
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchOpen(false);
                  }}
                >
                  ×
                </button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
