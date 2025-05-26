
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Upload, Download, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

interface ColorEntry {
  matching: string;
  hex: string;
  rgb: number[];
  lab?: number[];
  cellReference: string;
}

const ColorLabeler = () => {
  const [file, setFile] = useState<File | null>(null);
  const [colorEntries, setColorEntries] = useState<ColorEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [includeLab, setIncludeLab] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setColorEntries([]);
    }
  };

  const processFile = async () => {
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }

    setIsProcessing(true);
    
    try {
      const data = await readExcelFile(file);
      const entries = processColorData(data);
      setColorEntries(entries);
      toast.success(`Successfully processed ${entries.length} color entries`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file. Please check the format and ensure it has the required columns (Matching, Hex, RGB, etc.).");
    } finally {
      setIsProcessing(false);
    }
  };

  const readExcelFile = (file: File): Promise<any[][]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: "binary" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          // Convert to JSON to work with headers
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          resolve(jsonData as any[][]);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const processColorData = (data: any[][]): ColorEntry[] => {
    if (data.length < 2) {
      throw new Error("File must contain at least a header row and one data row");
    }

    const headers = data[0].map((h: any) => h?.toString().toLowerCase().trim());
    const matchingIndex = headers.findIndex(h => h.includes('matching'));
    const hexIndex = headers.findIndex(h => h.includes('hex'));
    const rgbIndex = headers.findIndex(h => h.includes('rgb'));
    const lIndex = headers.findIndex(h => h === 'l');
    const aIndex = headers.findIndex(h => h === 'a');
    const bIndex = headers.findIndex(h => h === 'b');

    if (matchingIndex === -1) {
      throw new Error("Could not find 'Matching' column in the Excel file");
    }

    if (hexIndex === -1 && rgbIndex === -1) {
      throw new Error("Could not find 'Hex' or 'RGB' column in the Excel file");
    }

    const entries: ColorEntry[] = [];

    // Process each data row
    for (let rowIndex = 1; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      
      // Skip empty rows
      if (!row || row.every(cell => !cell)) continue;

      const matching = row[matchingIndex]?.toString().trim();
      if (!matching) continue;

      let hex = '';
      let rgb: number[] = [];

      // Try to get hex value
      if (hexIndex !== -1 && row[hexIndex]) {
        hex = row[hexIndex].toString().trim();
        if (!hex.startsWith('#')) {
          hex = '#' + hex;
        }
        // Convert hex to RGB
        rgb = hexToRgb(hex);
      }

      // Try to get RGB value if hex not available or conversion failed
      if ((!rgb.length || rgb.some(isNaN)) && rgbIndex !== -1 && row[rgbIndex]) {
        const rgbString = row[rgbIndex].toString().trim();
        rgb = parseRgbString(rgbString);
        if (rgb.length === 3 && !rgb.some(isNaN)) {
          hex = rgbToHex(rgb);
        }
      }

      // Skip if we couldn't get valid color data
      if (!hex || rgb.length !== 3 || rgb.some(isNaN)) {
        console.warn(`Skipping row ${rowIndex + 1}: Invalid color data`);
        continue;
      }

      // Get Lab values if available
      let lab: number[] | undefined;
      if (lIndex !== -1 && aIndex !== -1 && bIndex !== -1) {
        const l = parseFloat(row[lIndex]);
        const a = parseFloat(row[aIndex]);
        const b = parseFloat(row[bIndex]);
        
        if (!isNaN(l) && !isNaN(a) && !isNaN(b)) {
          lab = [l, a, b];
        }
      }

      entries.push({
        matching,
        hex,
        rgb,
        lab,
        cellReference: `Row ${rowIndex + 1}`
      });
    }

    return entries;
  };

  const hexToRgb = (hex: string): number[] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [];
  };

  const rgbToHex = (rgb: number[]): string => {
    return "#" + rgb.map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  };

  const parseRgbString = (rgbString: string): number[] => {
    // Handle different RGB formats: "rgb(r,g,b)", "(r,g,b)", "r,g,b", "r g b"
    const cleaned = rgbString.replace(/rgb\(|\)|\(/g, '').trim();
    const parts = cleaned.split(/[,\s]+/).map(p => parseInt(p.trim(), 10));
    
    if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
      return parts;
    }
    
    return [];
  };

  const copyToClipboard = () => {
    const text = formatOutput();
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadResults = () => {
    const text = formatOutput();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'color-entries.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("File downloaded!");
  };

  const formatOutput = (): string => {
    return colorEntries.map(entry => {
      let output = `${entry.matching} - ${entry.hex} - (${entry.rgb.join(', ')})`;
      
      if (includeLab && entry.lab) {
        output += ` - L: ${entry.lab[0].toFixed(2)}, a: ${entry.lab[1].toFixed(2)}, b: ${entry.lab[2].toFixed(2)}`;
      }
      
      return output;
    }).join('\n');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Color Dataset Processor</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload an Excel file with columns: Matching, Hex, RGB, L, a, b. The tool will use the Matching column values as labels.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="file">Excel File</Label>
              <div className="border-2 border-dashed rounded-md border-gray-300 dark:border-gray-700 p-6 text-center cursor-pointer hover:border-primary transition-colors" 
                   onClick={() => document.getElementById('file')?.click()}>
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {file ? file.name : "Click to upload Excel file"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Excel file with Matching, Hex, RGB columns (L, a, b optional)
                  </p>
                </div>
                <Input
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-lab" 
                checked={includeLab}
                onCheckedChange={(checked) => setIncludeLab(checked as boolean)}
              />
              <Label htmlFor="include-lab" className="text-sm">
                Include Lab* values in output
              </Label>
            </div>
            
            <Button 
              onClick={processFile} 
              disabled={isProcessing || !file}
              className="w-full max-w-xs"
            >
              {isProcessing ? "Processing..." : "Process Color Data"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {colorEntries.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Color Entries ({colorEntries.length} total)</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadResults}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formatOutput()}
              readOnly
              className="min-h-64 font-mono text-sm"
              placeholder="Processed color entries will appear here..."
            />
            
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h4 className="font-medium mb-2">Sample Output:</h4>
              <div className="grid gap-1 text-sm font-mono">
                {colorEntries.slice(0, 5).map((entry, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="font-medium">{entry.matching}</span>
                    <span>-</span>
                    <span className="flex items-center gap-2">
                      {entry.hex}
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ backgroundColor: entry.hex }}
                      />
                    </span>
                    <span>- ({entry.rgb.join(', ')})</span>
                    {includeLab && entry.lab && (
                      <span className="text-gray-600">
                        - L: {entry.lab[0].toFixed(2)}, a: {entry.lab[1].toFixed(2)}, b: {entry.lab[2].toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
                {colorEntries.length > 5 && (
                  <div className="text-gray-500">... and {colorEntries.length - 5} more</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ColorLabeler;
