
import { useState, useRef } from 'react';
import { ColorData } from '@/types/colors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { 
  hexToRgb, 
  rgbToLab, 
  detectColorFormat, 
  parseRgbString,
  findSimilarColors
} from '@/utils/colorUtils';
import useDebounce from '@/hooks/useDebounce';
import LoadingSpinner from './LoadingSpinner';

interface ColorSearchInputProps {
  allColors: ColorData[];
  onSearchResults: (results: ColorData[]) => void;
}

const ColorSearchInput = ({ allColors, onSearchResults }: ColorSearchInputProps) => {
  const [searchValue, setSearchValue] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedSearchValue = useDebounce(searchValue, 300);

  // Use effect for handling the debounced search
  useEffect(() => {
    if (debouncedSearchValue && debouncedSearchValue.trim()) {
      handleSearch();
    }
  }, [debouncedSearchValue]);

  const handleSearch = () => {
    if (!searchValue.trim()) {
      setSearchError('Please enter a valid color value');
      return;
    }

    try {
      setIsSearching(true);

      // Determine the format and extract RGB values
      const format = detectColorFormat(searchValue);
      let rgbValues: number[];

      if (format === 'hex') {
        // Clean the hex string
        const cleanHex = searchValue.startsWith('#') 
          ? searchValue 
          : `#${searchValue}`;
        rgbValues = hexToRgb(cleanHex);
      } else if (format === 'rgb') {
        rgbValues = parseRgbString(searchValue);
      } else {
        setSearchError('Please enter a valid HEX or RGB color value');
        setIsSearching(false);
        return;
      }

      // Find similar colors (use a setTimeout to prevent UI blocking)
      setTimeout(() => {
        const results = findSimilarColors(rgbValues, allColors, 10);
        onSearchResults(results);
        setSearchError(null);
        setIsSearching(false);
      }, 0);
    } catch (error) {
      console.error('Error searching for similar colors:', error);
      setSearchError('Invalid color format. Try #RRGGBB or rgb(r,g,b)');
      setIsSearching(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex gap-2">
        <div className="relative flex-grow">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search color (e.g., #FF5733 or rgb(255,87,51))"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pr-10"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
          />
        </div>
        <Button 
          onClick={handleSearch} 
          size="icon" 
          disabled={isSearching}
        >
          {isSearching ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
      {searchError && (
        <p className="text-xs text-red-500 mt-1">{searchError}</p>
      )}
      {searchValue && !searchError && (
        <div 
          className="absolute right-12 top-[10px] w-6 h-6 rounded-full border border-gray-200 dark:border-gray-700"
          style={{ 
            backgroundColor: searchValue.startsWith('#') || /^[0-9A-Fa-f]{6}$/.test(searchValue) 
              ? `#${searchValue.replace('#', '')}` 
              : searchValue
          }}
        />
      )}
    </div>
  );
};

export default ColorSearchInput;
