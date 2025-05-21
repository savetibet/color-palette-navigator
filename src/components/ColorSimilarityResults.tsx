
import { ColorData } from '@/types/colors';
import ColorCard from '@/components/ColorCard';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ColorSimilarityResultsProps {
  results: ColorData[];
  onClose: () => void;
  displayFormat: "hex" | "rgb" | "lab" | "all";
}

const ColorSimilarityResults = ({ results, onClose, displayFormat }: ColorSimilarityResultsProps) => {
  if (results.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-4xl w-full max-h-[85vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Similar Colors ({results.length})
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[70vh]">
          {results.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No similar colors found</p>
          ) : (
            <div className={cn(
              "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            )}>
              {results.map((color) => (
                <ColorCard
                  key={color.id}
                  color={color}
                  displayFormat={displayFormat}
                  viewMode="grid"
                  onDelete={() => {}} // Not allowing deletion in search results
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorSimilarityResults;
