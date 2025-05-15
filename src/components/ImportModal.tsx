
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ColorData } from "@/types/colors";
import { hexToRgb, detectColorFormat } from "@/utils/colorUtils";
import * as XLSX from "xlsx";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Upload, FileText, AlertCircle } from "lucide-react";

type ImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onImport: (name: string, colors: ColorData[]) => void;
};

const ImportModal = ({ isOpen, onClose, onImport }: ImportModalProps) => {
  const [libraryName, setLibraryName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    setPreviewData([]);
    
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const fileExtension = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
      
      if (!validExtensions.includes(fileExtension)) {
        setErrorMessage("Invalid file format. Please select an Excel or CSV file.");
        return;
      }
      
      setFile(selectedFile);
      
      try {
        // Generate preview data
        const data = await readExcelFile(selectedFile);
        if (data && data.length > 0) {
          // Only show first 5 rows in preview
          setPreviewData(data.slice(0, 5));
          setSuccessMessage(`File loaded successfully. Found ${data.length} rows.`);
        } else {
          setErrorMessage("No data found in the file.");
        }
      } catch (error) {
        console.error("Error reading file for preview:", error);
        setErrorMessage("Error reading file. Please check the format.");
      }
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
    setErrorMessage(null);
    
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
      toast.success(`Successfully imported ${colorData.length} colors into "${libraryName}"`);
      resetForm();
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file. Please check the format.");
      setErrorMessage("Error processing file. Please ensure your file has color values (HEX or RGB) and optionally color names.");
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
    setPreviewData([]);
    setErrorMessage(null);
    setSuccessMessage(null);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Color Library</DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file containing color information.
          </DialogDescription>
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
            <div className="border-2 border-dashed rounded-md border-gray-300 dark:border-gray-700 p-6 text-center cursor-pointer hover:border-primary transition-colors" onClick={() => document.getElementById('file')?.click()}>
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {file ? file.name : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  XLSX, XLS, or CSV files with color data
                </p>
              </div>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {successMessage && (
              <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 p-2 rounded text-sm">
                {successMessage}
              </div>
            )}
            {errorMessage && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-2 rounded text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              File should contain columns for color values (HEX or RGB) and color names
            </p>
          </div>
          
          {previewData.length > 0 && (
            <div className="grid gap-2">
              <Label>Data Preview</Label>
              <div className="border rounded-md max-h-52 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(previewData[0]).map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, i) => (
                      <TableRow key={i}>
                        {Object.values(row).map((value, j) => (
                          <TableCell key={j}>{String(value)}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Showing first 5 rows (out of {previewData.length > 5 ? "many" : previewData.length})
              </p>
            </div>
          )}
          
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
