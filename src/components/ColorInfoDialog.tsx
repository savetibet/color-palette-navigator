
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ColorData } from "@/types/colors";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

type ColorInfoDialogProps = {
  color: ColorData | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

const ColorInfoDialog = ({ color, isOpen, setIsOpen }: ColorInfoDialogProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  if (!color) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`Copied ${type} to clipboard`);
    setTimeout(() => setCopied(null), 2000);
  };

  const { name, hex, rgb, lab, family } = color;

  // Format the RGB and LAB values for display
  const rgbStr = Array.isArray(rgb) ? `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` : '';
  const labStr = Array.isArray(lab) ? `lab(${lab[0].toFixed(2)}, ${lab[1].toFixed(2)}, ${lab[2].toFixed(2)})` : '';

  // Helper function to generate CSS for text contrast
  const getContrastColor = () => {
    if (!rgb) return 'text-black';
    const [r, g, b] = rgb;
    // Calculate luminance using the formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'text-black' : 'text-white';
  };

  const getFamilyLabel = () => {
    if (typeof family === 'string') {
      return family;
    } else if (family && typeof family === 'object') {
      return `${family.main}${family.sub ? ` → ${family.sub}` : ''}`;
    }
    return 'Unknown';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{name}</DialogTitle>
        </DialogHeader>
        
        {/* Large color preview */}
        <div className="relative overflow-hidden rounded-md h-40 mb-4" style={{ backgroundColor: hex }}>
          <div className={`absolute bottom-0 left-0 w-full py-2 px-3 bg-black/30 ${getContrastColor()}`}>
            <div className="font-bold">{name}</div>
            <div className="text-sm opacity-90">{getFamilyLabel()}</div>
          </div>
        </div>
        
        <div className="space-y-3">
          {/* HEX */}
          <div className="flex items-center justify-between">
            <span className="font-semibold">HEX:</span>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-secondary text-secondary-foreground rounded font-mono">{hex}</code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(hex, 'hex')}
              >
                {copied === 'hex' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* RGB */}
          <div className="flex items-center justify-between">
            <span className="font-semibold">RGB:</span>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-secondary text-secondary-foreground rounded font-mono">{rgbStr}</code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(rgbStr, 'rgb')}
              >
                {copied === 'rgb' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* LAB */}
          <div className="flex items-center justify-between">
            <span className="font-semibold">LAB:</span>
            <div className="flex items-center gap-2">
              <code className="px-2 py-1 bg-secondary text-secondary-foreground rounded font-mono">{labStr}</code>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(labStr, 'lab')}
              >
                {copied === 'lab' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-2 pt-2 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">Alt + Click</kbd> on any color to quickly copy its HEX value.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ColorInfoDialog;
