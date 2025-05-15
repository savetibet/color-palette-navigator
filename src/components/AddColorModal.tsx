
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ColorData } from "@/types/colors";
import { hexToRgb } from "@/utils/colorUtils";

type AddColorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (color: ColorData) => void;
};

const AddColorModal = ({ isOpen, onClose, onAdd }: AddColorModalProps) => {
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#000000");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!colorName.trim()) {
      toast.error("Please enter a color name");
      return;
    }
    
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!hexRegex.test(colorHex)) {
      toast.error("Please enter a valid HEX color (e.g., #FF0000)");
      return;
    }
    
    // Convert HEX to RGB
    const rgb = hexToRgb(colorHex);
    
    const colorData: ColorData = {
      id: Date.now().toString(),
      name: colorName,
      hex: colorHex,
      rgb,
      lab: null, // Will be calculated in parent component
      family: null // Will be determined in parent component
    };
    
    onAdd(colorData);
    resetForm();
  };
  
  const resetForm = () => {
    setColorName("");
    setColorHex("#000000");
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Color</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="color-name">Color Name</Label>
            <Input
              id="color-name"
              placeholder="Enter color name"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="color-hex">Color Value (HEX)</Label>
            <div className="flex gap-2">
              <Input
                id="color-hex"
                type="text"
                placeholder="#FF0000"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
              />
              <input
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="w-10 h-10 p-0 border-none rounded"
              />
            </div>
          </div>
          
          <div className="mt-2">
            <div
              className="w-full h-20 rounded"
              style={{ backgroundColor: colorHex }}
            ></div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full">
              Add Color
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={resetForm}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddColorModal;
