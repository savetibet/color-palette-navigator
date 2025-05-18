
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { hexToRgb, rgbToLab, getColorFamily } from "@/utils/colorUtils";
import { toast } from "sonner";
import { ColorData } from "@/types/colors";

type ColorPickerProps = {
  onAddColor: (color: ColorData) => void;
};

const ColorPicker = ({ onAddColor }: ColorPickerProps) => {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState("#3B82F6");
  const [name, setName] = useState("");

  const handleAddColor = () => {
    if (!color) {
      toast.error("Please select a color");
      return;
    }

    const rgb = hexToRgb(color);
    const lab = rgbToLab(rgb[0], rgb[1], rgb[2]);
    const family = getColorFamily(rgb);

    const newColor: ColorData = {
      id: Date.now().toString(),
      name: name || `Color ${color}`,
      hex: color,
      rgb: rgb,
      lab: lab,
      family: family
    };

    onAddColor(newColor);
    toast.success("Color added successfully");
    setOpen(false);
    setName("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Add Color
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Color</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4">
            <div>
              <Input 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)} 
                className="w-16 h-16 p-1 cursor-pointer border-2"
              />
            </div>
            <div className="space-y-2 flex-1">
              <div>
                <Label htmlFor="colorHex">HEX</Label>
                <Input 
                  id="colorHex"
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                  className="font-mono uppercase"
                />
              </div>
              <div>
                <Label htmlFor="colorName">Name (Optional)</Label>
                <Input 
                  id="colorName"
                  placeholder="Enter color name"
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="h-24 rounded-md border" style={{ backgroundColor: color }}>
            <div className="h-full flex items-end">
              <div className="w-full bg-black/50 text-white text-center py-1 text-sm">
                {name || color}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAddColor}>Add Color</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColorPicker;
