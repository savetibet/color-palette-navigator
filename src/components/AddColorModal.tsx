
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ColorData } from "@/types/colors";
import { labToRgb, rgbToHex } from "@/utils/colorUtils";
import { colorApiService } from "@/services/colorApi";
import { transformFrontendColorToBackend } from "@/utils/colorDataTransform";

type AddColorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (color: ColorData) => void;
};

const AddColorModal = ({ isOpen, onClose, onAdd }: AddColorModalProps) => {
  const [colorName, setColorName] = useState("");
  const [lightness, setLightness] = useState(50);
  const [aValue, setAValue] = useState(0);
  const [bValue, setBValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!colorName.trim()) {
      toast.error("Please enter a color name/matching number");
      return;
    }
    
    if (lightness < 0 || lightness > 100) {
      toast.error("Lightness must be between 0 and 100");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert LAB to RGB for preview
      const rgb = labToRgb(lightness, aValue, bValue);
      const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
      
      const colorData: ColorData = {
        id: Date.now().toString(),
        name: colorName,
        hex,
        rgb,
        lab: [lightness, aValue, bValue],
        family: null
      };
      
      // Transform and send to backend
      const backendData = transformFrontendColorToBackend(colorData, [lightness, aValue, bValue]);
      const createdColor = await colorApiService.createColor(backendData);
      
      // Transform back to frontend format
      const newColor: ColorData = {
        id: createdColor.color_id.toString(),
        name: createdColor.matching_no,
        hex: createdColor.hex,
        rgb: [createdColor.red, createdColor.green, createdColor.blue],
        lab: [createdColor.lightness, createdColor.a_value, createdColor.b_value],
        family: createdColor.family || 'Unknown'
      };
      
      onAdd(newColor);
      toast.success("Color added successfully");
      resetForm();
    } catch (error) {
      console.error("Error adding color:", error);
      toast.error("Failed to add color. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const resetForm = () => {
    setColorName("");
    setLightness(50);
    setAValue(0);
    setBValue(0);
    onClose();
  };
  
  // Generate preview color from LAB values
  const getPreviewColor = () => {
    try {
      const rgb = labToRgb(lightness, aValue, bValue);
      return rgbToHex(rgb[0], rgb[1], rgb[2]);
    } catch {
      return "#808080"; // Default gray if conversion fails
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Color</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="color-name">Color Name/Matching Number</Label>
            <Input
              id="color-name"
              placeholder="Enter matching number (e.g., M24/1)"
              value={colorName}
              onChange={(e) => setColorName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="lightness">Lightness (L*)</Label>
            <Input
              id="lightness"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="0-100"
              value={lightness}
              onChange={(e) => setLightness(parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="a-value">a* Value</Label>
            <Input
              id="a-value"
              type="number"
              min="-128"
              max="128"
              step="0.01"
              placeholder="-128 to 128"
              value={aValue}
              onChange={(e) => setAValue(parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="b-value">b* Value</Label>
            <Input
              id="b-value"
              type="number"
              min="-128"
              max="128"
              step="0.01"
              placeholder="-128 to 128"
              value={bValue}
              onChange={(e) => setBValue(parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div className="mt-2">
            <Label>Color Preview</Label>
            <div
              className="w-full h-20 rounded border"
              style={{ backgroundColor: getPreviewColor() }}
            ></div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Color"}
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
