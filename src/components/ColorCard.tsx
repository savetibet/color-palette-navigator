
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ColorData } from "@/types/colors";
import { Copy, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { rgbToLab, getChroma, getLightness } from "@/utils/colorUtils";

type ColorCardProps = {
  color: ColorData;
  displayFormat: "hex" | "rgb" | "lab" | "all";
  viewMode: "grid" | "list";
  onDelete: () => void;
};

const ColorCard = ({ color, displayFormat, viewMode, onDelete }: ColorCardProps) => {
  const [detailOpen, setDetailOpen] = useState(false);

  const textColor = isLightColor(color.rgb) ? "text-gray-900" : "text-white";

  // Get the main and sub family
  const mainFamily = typeof color.family === 'object' ? color.family.main : color.family;
  const subFamily = typeof color.family === 'object' ? color.family.sub : null;

  const copyToClipboard = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    toast.success(`Copied ${label} to clipboard`);
  };

  function isLightColor(rgb: number[]): boolean {
    // Simplified calculation to determine if a color is light or dark
    const [r, g, b] = rgb;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128;
  }

  // Generate LAB values from RGB if not already available
  const labValues = color.lab || rgbToLab(color.rgb[0], color.rgb[1], color.rgb[2]);
  
  // Get chroma and lightness values for display
  const chroma = getChroma(color.rgb);
  const lightness = getLightness(color.rgb);

  // Format the display string as requested: M24/1 - #261C1B - (38, 28, 27)
  const formatColorDisplay = () => {
    let display = `${color.name} - ${color.hex} - (${color.rgb.join(', ')})`;
    if (displayFormat === "all" && color.lab) {
      display += ` - L: ${color.lab[0].toFixed(2)}, a: ${color.lab[1].toFixed(2)}, b: ${color.lab[2].toFixed(2)}`;
    }
    return display;
  };
  
  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-shadow hover:shadow-md",
          viewMode === "list" ? "flex" : ""
        )}
        onClick={() => setDetailOpen(true)}
      >
        <div 
          className={cn(
            "cursor-pointer",
            viewMode === "grid" ? "h-32" : "w-16"
          )} 
          style={{ backgroundColor: color.hex }}
        />
        <div className="p-3 flex flex-col justify-between flex-grow">
          <div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">{color.name}</h3>
            <div className="flex flex-col text-xs">
              <span className="text-gray-500 dark:text-gray-400">{mainFamily}</span>
              {subFamily && (
                <span className="text-gray-400 dark:text-gray-500">{subFamily}</span>
              )}
            </div>
          </div>
          
          <div className="mt-2">
            {(displayFormat === "hex" || displayFormat === "all") && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-300">HEX:</span>
                <span className="text-xs font-mono">{color.hex}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5" 
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(color.hex, "HEX value");
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {(displayFormat === "rgb" || displayFormat === "all") && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-300">RGB:</span>
                <span className="text-xs font-mono">
                  {color.rgb.join(", ")}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5" 
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(`rgb(${color.rgb.join(", ")})`, "RGB value");
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            
            {(displayFormat === "lab" || displayFormat === "all") && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-300">LAB:</span>
                <span className="text-xs font-mono">
                  {labValues.map(v => Math.round(v * 100) / 100).join(", ")}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5" 
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(
                      `lab(${labValues.map(v => Math.round(v * 100) / 100).join(", ")})`,
                      "LAB value"
                    );
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Full format display */}
            <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-300">Full:</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5" 
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(formatColorDisplay(), "Full color string");
                  }}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              <p className="text-xs font-mono text-gray-700 dark:text-gray-300 mt-1">
                {formatColorDisplay()}
              </p>
            </div>
          </div>
        </div>
      </Card>
      
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{color.name}</DialogTitle>
          </DialogHeader>
          
          <div className="mt-4">
            <div 
              className="h-40 rounded-md mb-4" 
              style={{ backgroundColor: color.hex }}
            >
              <div className={cn("p-4 h-full flex items-start justify-end", textColor)}>
                <Button 
                  variant="outline" 
                  size="icon"
                  className="bg-white/10 backdrop-blur-sm hover:bg-white/20" 
                  onClick={() => onDelete()}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Display the formatted string prominently */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color String:</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(formatColorDisplay(), "Full color string")}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
              </div>
              <p className="text-sm font-mono mt-1 text-gray-900 dark:text-gray-100">
                {formatColorDisplay()}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color Information</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Family:</span>
                    <p className="text-sm">{mainFamily || "Uncategorized"}</p>
                  </div>
                  {subFamily && (
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Sub-category:</span>
                      <p className="text-sm">{subFamily}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Saturation:</span>
                    <p className="text-sm">{chroma}%</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Lightness:</span>
                    <p className="text-sm">{lightness}%</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">HEX:</span>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono">{color.hex}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5" 
                        onClick={() => copyToClipboard(color.hex, "HEX value")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color Values</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">RGB:</span>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono">{color.rgb.join(", ")}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5" 
                        onClick={() => copyToClipboard(`rgb(${color.rgb.join(", ")})`, "RGB value")}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">LAB:</span>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-mono">
                        {labValues.map(v => Math.round(v * 100) / 100).join(", ")}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5" 
                        onClick={() => copyToClipboard(
                          `lab(${labValues.map(v => Math.round(v * 100) / 100).join(", ")})`,
                          "LAB value"
                        )}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ColorCard;
