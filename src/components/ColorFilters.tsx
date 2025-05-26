
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Filter, X } from "lucide-react";
import { COLOR_FAMILIES } from "@/types/colors";

type ColorFiltersProps = {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  colorFamily: string | null;
  setColorFamily: (family: string | null) => void;
  sortMode: "name" | "family" | "hue" | "date" | "chroma" | "lightness";
  setSortMode: (mode: "name" | "family" | "hue" | "date" | "chroma" | "lightness") => void;
};

const ColorFilters = ({
  searchQuery,
  setSearchQuery,
  colorFamily,
  setColorFamily,
  sortMode,
  setSortMode
}: ColorFiltersProps) => {
  const handleReset = () => {
    setSearchQuery("");
    setColorFamily(null);
    setSortMode("family");
  };

  const hasFilters = searchQuery || colorFamily !== null || sortMode !== "family";

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-6 flex-wrap">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search colors by name or value..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>
      
      <div className="flex flex-wrap gap-3">
        <Select 
          value={colorFamily || "all"} 
          onValueChange={(value) => setColorFamily(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-[160px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Color Family" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Families</SelectItem>
            {Object.values(COLOR_FAMILIES).map((family) => (
              <SelectItem key={family} value={family}>{family}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select 
          value={sortMode} 
          onValueChange={(value) => setSortMode(value as any)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="family">Sort by Family</SelectItem>
            <SelectItem value="name">Sort by Name</SelectItem>
            <SelectItem value="date">Sort by Import Order</SelectItem>
            <SelectItem value="hue">Sort by Hue</SelectItem>
            <SelectItem value="chroma">Sort by Saturation</SelectItem>
            <SelectItem value="lightness">Sort by Lightness</SelectItem>
          </SelectContent>
        </Select>
        
        {hasFilters && (
          <Button variant="outline" onClick={handleReset} size="icon">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ColorFilters;
