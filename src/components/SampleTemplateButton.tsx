
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import * as XLSX from "xlsx";

const SampleTemplateButton = () => {
  const downloadTemplate = () => {
    // Create sample data
    const sampleData = [
      { Name: "Red", HEX: "#FF0000" },
      { Name: "Green", HEX: "#00FF00" },
      { Name: "Blue", HEX: "#0000FF" },
      { Name: "Yellow", HEX: "#FFFF00" },
      { Name: "RGB Example", RGB: "rgb(255, 99, 71)" },
    ];

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sample Colors");
    
    // Generate file and download
    XLSX.writeFile(workbook, "color-library-template.xlsx");
  };

  return (
    <Button 
      variant="outline" 
      onClick={downloadTemplate}
      className="flex items-center gap-2"
    >
      <FileDown className="h-4 w-4" />
      Download Template
    </Button>
  );
};

export default SampleTemplateButton;
