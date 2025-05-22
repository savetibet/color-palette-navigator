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
import { AlignLeft, Moon, Sun } from "lucide-react";
import { ColorLibraryData } from "@/types/colors";
import SampleTemplateButton from "./SampleTemplateButton";

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
  isProcessing?: boolean;  // Add this property
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
  isProcessing,
}: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLibrarySelect = (index: number) => {
    setActiveLibrary(index);
    setIsMenuOpen(false); // Close the menu after selecting a library
  };

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4">
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
              <Button
                variant="outline"
                className="w-full justify-center"
                onClick={() => {
                  openImportModal();
                  setIsMenuOpen(false);
                }}
              >
                Import Colors
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">
          Color Palette
        </Link>

        {/* Search Input */}
        <Input
          type="search"
          placeholder="Search colors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm md:block hidden"
        />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <select
            className="px-2 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            value={colorFamily || ""}
            onChange={(e) => setColorFamily(e.target.value === "" ? null : e.target.value)}
          >
            <option value="">All Families</option>
            <option value="red">Red</option>
            <option value="orange">Orange</option>
            <option value="yellow">Yellow</option>
            <option value="green">Green</option>
            <option value="teal">Teal</option>
            <option value="blue">Blue</option>
            <option value="purple">Purple</option>
            <option value="pink">Pink</option>
            <option value="brown">Brown</option>
            <option value="gray">Gray</option>
          </select>

          {colorLibraries.map((library, index) => (
            <Button
              key={library.id}
              variant={activeLibrary === index ? "default" : "ghost"}
              onClick={() => setActiveLibrary(index)}
            >
              {library.name}
            </Button>
          ))}

          <Button onClick={openImportModal}>Import Colors</Button>
          <SampleTemplateButton />

          {activeLibrary !== null && (
            <>
              <Button
                variant="outline"
                onClick={() => onExport(colorLibraries[activeLibrary].id)}
              >
                Export
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDeleteLibrary(colorLibraries[activeLibrary].id)}
              >
                Delete
              </Button>
            </>
          )}

          <Button variant="ghost" size="sm" onClick={toggleDarkMode}>
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
