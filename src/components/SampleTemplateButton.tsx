
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

const SampleTemplateButton = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const generateSampleTemplate = () => {
    setIsGenerating(true);
    
    try {
      // Create sample data
      const data = [
        { Name: "Red", Color: "#FF0000", RGB: "rgb(255, 0, 0)" },
        { Name: "Green", Color: "#00FF00", RGB: "rgb(0, 255, 0)" },
        { Name: "Blue", Color: "#0000FF", RGB: "rgb(0, 0, 255)" },
        { Name: "Yellow", Color: "#FFFF00", RGB: "rgb(255, 255, 0)" },
        { Name: "Cyan", Color: "#00FFFF", RGB: "rgb(0, 255, 255)" },
      ];
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Colors");
      
      // Generate file and trigger download
      XLSX.writeFile(workbook, "color-template.xlsx");
    } catch (error) {
      console.error("Error generating template:", error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={generateSampleTemplate}
      disabled={isGenerating}
      className="flex items-center gap-1"
    >
      <Download className="h-4 w-4" />
      {isGenerating ? "Generating..." : "Download Template"}
    </Button>
  );
};

export default SampleTemplateButton;
