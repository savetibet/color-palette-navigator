
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Upload, Download, Copy } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface LabeledColor {
  label: string;
  color: string;
  cellReference: string;
}

const ColorLabeler = () => {
  const [file, setFile] = useState<File | null>(null);
  const [labeledColors, setLabeledColors] = useState<LabeledColor[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [labelPrefix, setLabelPrefix] = useState("M24");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setLabeledColors([]);
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
      const labeled = labelColors(data);
      setLabeledColors(labeled);
      toast.success(`Successfully labeled ${labeled.length} colors`);
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file. Please check the format.");
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
          
          // Get the range of the worksheet
          const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
          const rawData: any[][] = [];
          
          // Read row by row, column by column
          for (let row = range.s.r; row <= range.e.r; row++) {
            const rowData: any[] = [];
            for (let col = range.s.c; col <= range.e.c; col++) {
              const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
              const cell = worksheet[cellAddress];
              rowData.push(cell ? cell.v : null);
            }
            rawData.push(rowData);
          }
          
          resolve(rawData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsBinaryString(file);
    });
  };

  const isColorValue = (value: any): boolean => {
    if (!value || typeof value !== 'string') return false;
    
    const stringValue = value.toString().trim();
    
    // Check for hex colors (with or without #)
    if (stringValue.match(/^#?[0-9a-f]{6}$/i)) return true;
    
    // Check for RGB format
    if (stringValue.match(/^rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/i)) return true;
    
    // Check for color names (basic set)
    const colorNames = [
      'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
      'black', 'white', 'gray', 'grey', 'cyan', 'magenta', 'lime', 'navy',
      'maroon', 'olive', 'teal', 'silver', 'gold', 'indigo', 'violet', 'crimson',
      'coral', 'salmon', 'khaki', 'plum', 'orchid', 'turquoise', 'tan', 'beige'
    ];
    
    return colorNames.includes(stringValue.toLowerCase());
  };

  const labelColors = (data: any[][]): LabeledColor[] => {
    const labeled: LabeledColor[] = [];
    let colorCounter = 1;

    // Process row by row, column by column
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        
        if (cell && isColorValue(cell)) {
          const cellReference = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
          labeled.push({
            label: `${labelPrefix}/${colorCounter}`,
            color: cell.toString().trim(),
            cellReference
          });
          colorCounter++;
        }
      }
    }

    return labeled;
  };

  const copyToClipboard = () => {
    const text = labeledColors.map(item => `${item.label} - ${item.color}`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadResults = () => {
    const text = labeledColors.map(item => `${item.label} - ${item.color}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${labelPrefix}-labeled-colors.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("File downloaded!");
  };

  const resultsText = labeledColors.map(item => `${item.label} - ${item.color}`).join('\n');

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Color Labeler Tool</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Upload an Excel file to automatically label colors in sequence from left to right, top to bottom.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="label-prefix">Label Prefix</Label>
              <Input
                id="label-prefix"
                placeholder="e.g., M24"
                value={labelPrefix}
                onChange={(e) => setLabelPrefix(e.target.value)}
                className="max-w-xs"
              />
            </div>
            
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
                    XLSX or XLS files containing color data
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
            
            <Button 
              onClick={processFile} 
              disabled={isProcessing || !file}
              className="w-full max-w-xs"
            >
              {isProcessing ? "Processing..." : "Label Colors"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {labeledColors.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Labeled Colors ({labeledColors.length} total)</CardTitle>
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
              value={resultsText}
              readOnly
              className="min-h-64 font-mono text-sm"
              placeholder="Labeled colors will appear here..."
            />
            
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
              <h4 className="font-medium mb-2">Sample Output:</h4>
              <div className="grid gap-1 text-sm font-mono">
                {labeledColors.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="font-medium">{item.label}</span>
                    <span>-</span>
                    <span className="flex items-center gap-2">
                      {item.color}
                      <div 
                        className="w-4 h-4 rounded border border-gray-300"
                        style={{ 
                          backgroundColor: item.color.startsWith('#') ? item.color : 
                                         item.color.startsWith('rgb') ? item.color : item.color
                        }}
                      />
                    </span>
                    <span className="text-xs text-gray-500">({item.cellReference})</span>
                  </div>
                ))}
                {labeledColors.length > 5 && (
                  <div className="text-gray-500">... and {labeledColors.length - 5} more</div>
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
