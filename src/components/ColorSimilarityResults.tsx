
import { useEffect, useState } from 'react';
import { ColorData } from '@/types/colors';
import { X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import ColorCard from '@/components/ColorCard';
import LoadingSpinner from './LoadingSpinner';

interface ColorSimilarityResultsProps {
  results: ColorData[];
  onClose: () => void;
  displayFormat?: "hex" | "rgb" | "lab" | "all";
}

const ColorSimilarityResults = ({ 
  results, 
  onClose, 
  displayFormat = "all" 
}: ColorSimilarityResultsProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate a small delay to show loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [results]);

  return (
    <Sheet open={results.length > 0} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" className="w-full md:max-w-md lg:max-w-lg">
        <SheetHeader className="flex flex-row justify-between items-center mb-4">
          <SheetTitle>Similar Colors</SheetTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-[calc(100vh-120px)]">
            {results.map((color, index) => (
              <ColorCard
                key={`${color.id}-${index}`}
                color={color}
                displayFormat={displayFormat}
                viewMode="grid"
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default ColorSimilarityResults;
