
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
        console.log("File loaded, preview data:", data.slice(0, 2));
        
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
      console.log("Processing file, sample data:", data.slice(0, 2));
      
      if (!data || data.length === 0) {
        toast.error("No data found in the file");
        setIsLoading(false);
        return;
      }
      
      const colorData = parseExcelData(data);
      console.log("Parsed color data:", colorData.slice(0, 2));
      
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
          if (!e.target || !e.target.result) {
            reject(new Error("Failed to read file"));
            return;
          }
          
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          console.log("Parsed Excel data:", json.slice(0, 2));
          resolve(json);
        } catch (error) {
          console.error("Error parsing Excel file:", error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(error);
      };
      
      // Changed from readAsBinaryString to readAsArrayBuffer for better compatibility
      reader.readAsArrayBuffer(file);
    });
  };
  
  const parseExcelData = (data: any[]) => {
    // Show a sample of what's in the data
    console.log("Sample data from Excel:", data.slice(0, 2));
    
    return data.map((row, index) => {
      // Debug: log each row to see what we're working with
      console.log(`Processing row ${index}:`, row);
      
      // Case-insensitive search through all properties
      let colorValue = "";
      let colorName = "";
      
      // Find color value by checking all properties with various names
      for (const key in row) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('color') || lowerKey.includes('hex') || lowerKey.includes('rgb') || lowerKey === 'value') {
          const value = String(row[key] || "").trim();
          if (value && (value.startsWith('#') || value.startsWith('rgb'))) {
            colorValue = value;
            break;
          } else if (value && value.match(/^[0-9a-f]{6}$/i)) {
            // If it's a hex without # prefix, add it
            colorValue = '#' + value;
            break;
          }
        }
      }
      
      // If no color value found, try to use any non-empty string field
      if (!colorValue) {
        for (const key in row) {
          const value = String(row[key] || "").trim();
          if (value) {
            // Try to detect if this string might be a color
            if (value.match(/^#?[0-9a-f]{6}$/i)) {
              colorValue = value.startsWith('#') ? value : '#' + value;
              break;
            } else if (value.toLowerCase().startsWith('rgb')) {
              colorValue = value;
              break;
            }
          }
        }
      }
      
      // Find name
      for (const key in row) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes('name') || lowerKey === 'title' || lowerKey === 'label') {
          colorName = row[key] || `Color ${index + 1}`;
          break;
        }
      }
      
      // If no name found, use default
      if (!colorName) {
        colorName = `Color ${index + 1}`;
      }
      
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
      } else {
        // Check if we have separate R, G, B columns
        let r = -1, g = -1, b = -1;
        for (const key in row) {
          const lowerKey = key.toLowerCase();
          if (lowerKey === 'r' || lowerKey === 'red') {
            r = parseInt(String(row[key] || "0"));
          } else if (lowerKey === 'g' || lowerKey === 'green') {
            g = parseInt(String(row[key] || "0"));
          } else if (lowerKey === 'b' || lowerKey === 'blue') {
            b = parseInt(String(row[key] || "0"));
          }
        }
        
        if (r >= 0 && g >= 0 && b >= 0 && r <= 255 && g <= 255 && b <= 255) {
          rgb = [r, g, b];
          hex = `#${rgb.map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? "0" + hex : hex;
          }).join("")}`;
        }
      }
      
      console.log(`Result for row ${index}:`, { name: colorName, hex, rgb });
      
      return {
        id: Date.now() + index + "",
        name: colorName,
        hex,
        rgb,
        // LAB values will be calculated later
        lab: null,
        family: null
      };
    }).filter(color => {
      // Keep colors that have valid hex values
      return color.hex !== "#000000" && 
             color.rgb.every(val => !isNaN(val) && val >= 0 && val <= 255);
    });
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
