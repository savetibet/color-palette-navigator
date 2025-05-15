
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ColorData } from "@/types/colors";
import { hexToRgb, detectColorFormat } from "@/utils/colorUtils";
import * as XLSX from "xlsx";

type ImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (name: string, colors: ColorData[]) => void;
};

const ImportModal = ({ isOpen, onClose, onImport }: ImportModalProps) => {
  const [libraryName, setLibraryName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };
  
  const processFile = async () => {
    if (!file) {
      toast.error("Please select a file to import");
      return;
    }
    
    if (!libraryName) {
      toast.error("Please enter a library name");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const data = await readExcelFile(file);
      
      if (!data || data.length === 0) {
        toast.error("No data found in the file");
        setIsLoading(false);
        return;
      }
      
      const colorData = parseColorData(data);
      
      if (colorData.length === 0) {
        toast.error("No valid color data found in the file");
        setIsLoading(false);
        return;
      }
      
      onImport(libraryName, colorData);
      resetForm();
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file. Please check the format.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };
  
  const parseColorData = (data: any[]): ColorData[] => {
    return data.map((row, index) => {
      // Try to find color values in various formats
      const colorValue = row.Color || row.HEX || row.RGB || row.color || row.hex || row.rgb || "";
      const colorName = row.Name || row.NAME || row.name || `Color ${index + 1}`;
      
      // Detect and process color format
      const format = detectColorFormat(colorValue);
      let rgb: number[] = [0, 0, 0];
      let hex = "#000000";
      
      if (format === "hex") {
        hex = colorValue;
        rgb = hexToRgb(colorValue);
      } else if (format === "rgb") {
        // Extract RGB values from format like "rgb(255, 0, 0)"
        const match = colorValue.match(/\d+/g);
        if (match && match.length >= 3) {
          rgb = [
            parseInt(match[0]),
            parseInt(match[1]),
            parseInt(match[2])
          ];
          // Convert RGB to HEX
          hex = `#${rgb.map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
          }).join("")}`;
        }
      }
      
      return {
        id: Date.now() + index + "",
        name: colorName,
        hex,
        rgb,
        // LAB values will be calculated later
        lab: null,
        family: null
      };
    }).filter(color => color.hex !== "#000000"); // Filter out invalid colors
  };
  
  const resetForm = () => {
    setLibraryName("");
    setFile(null);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Color Library</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="library-name">Library Name</Label>
            <Input
              id="library-name"
              placeholder="Enter library name"
              value={libraryName}
              onChange={(e) => setLibraryName(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="file">Excel or CSV File</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              File should contain columns for color values (HEX or RGB) and color names
            </p>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={processFile} 
              disabled={isLoading || !file || !libraryName}
              className="w-full"
            >
              {isLoading ? "Processing..." : "Import Colors"}
            </Button>
            <Button 
              variant="outline" 
              onClick={resetForm}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;
