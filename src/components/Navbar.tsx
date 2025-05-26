import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlignLeft, Moon, Sun, Search, X, ImportIcon, Share2 } from "lucide-react";
import { ColorLibraryData } from "@/types/colors";
import SampleTemplateButton from "./SampleTemplateButton";
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { toast } from "sonner";

type NavbarProps = {
  colorLibraries: ColorLibraryData[];
  activeLibrary: number | null;
  setActiveLibrary: (index: number | null) => void;
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
  toggleDarkMode,
}: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLibrarySelect = (index: number) => {
    setActiveLibrary(index);
    setIsMenuOpen(false); // Close the menu after selecting a library
  };
  
  // Collect all colors from all libraries for quick search
  const allColors = colorLibraries.flatMap(library => 
    library.colors.map(color => ({
      ...color,
      libraryName: library.name,
      libraryId: library.id
    }))
  );

  const handleColorSelect = (colorId: string, libraryId: number) => {
    // Find the library index
    const libraryIndex = colorLibraries.findIndex(lib => lib.id === libraryId);
    if (libraryIndex !== -1) {
      setActiveLibrary(libraryIndex);
      
      // Set search query to find this specific color
      const color = colorLibraries[libraryIndex].colors.find(c => c.id === colorId);
      if (color) {
        setSearchQuery(color.name);
        toast.info(`Found "${color.name}" in "${colorLibraries[libraryIndex].name}" library`);
      }
    }
    setSearchOpen(false);
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <AlignLeft className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <SheetHeader>
                <SheetTitle>Color Libraries</SheetTitle>
                <SheetDescription>
                  Select a library to view its colors.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                {colorLibraries.map((library, index) => (
                  <Button
                    key={library.id}
                    variant={activeLibrary === index ? "default" : "ghost"}
                    className="w-full justify-start mb-2"
                    onClick={() => handleLibrarySelect(index)}
                  >
                    {library.name}
                  </Button>
                ))}
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      openImportModal();
                      setIsMenuOpen(false);
                    }}
                  >
                    <ImportIcon className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
            Color Palette
          </Link>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Quick Search Button */}
            <Button variant="ghost" size="sm" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4 mr-2" />
              Quick Search
            </Button>

            {/* Library Tabs */}
            <div className="hidden xl:flex space-x-1">
              {colorLibraries.map((library, index) => (
                <Button
                  key={library.id}
                  variant={activeLibrary === index ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveLibrary(index)}
                >
                  {library.name}
                </Button>
              ))}
            </div>

            <Button size="sm" onClick={openImportModal}>
              <ImportIcon className="h-4 w-4 mr-1" />
              Import
            </Button>
            
            <SampleTemplateButton />

            {activeLibrary !== null && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport(colorLibraries[activeLibrary].id)}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </>
            )}

            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Actions */}
          <div className="flex md:hidden items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </nav>

      {/* Command Dialog for Quick Search */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search all colors..." />
        <CommandList className="max-h-[400px]">
          <CommandEmpty>No colors found.</CommandEmpty>
          {colorLibraries.map((library) => (
            <CommandGroup key={library.id} heading={library.name}>
              {library.colors
                .filter(color => 
                  color.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  color.hex.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .slice(0, 10)
                .map(color => (
                  <CommandItem 
                    key={color.id}
                    onSelect={() => handleColorSelect(color.id, library.id)}
                    className="flex items-center"
                  >
                    <div 
                      className="w-4 h-4 rounded-full mr-2 border border-gray-200 dark:border-gray-600" 
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="flex-1 mr-2">{color.name}</span>
                    <span className="text-xs text-muted-foreground font-mono">{color.hex}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default Navbar;
