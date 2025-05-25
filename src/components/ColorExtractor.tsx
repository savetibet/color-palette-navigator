
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Download, Key } from 'lucide-react';

interface ColorData {
  name: string;
  hex: string;
  r: number;
  g: number;
  b: number;
}

const ColorExtractor = () => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState(FirecrawlService.getApiKey() || '');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedColors, setExtractedColors] = useState<ColorData[]>([]);
  const [showApiKeyInput, setShowApiKeyInput] = useState(!FirecrawlService.getApiKey());

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      });
      return;
    }
    
    FirecrawlService.saveApiKey(apiKey);
    setShowApiKeyInput(false);
    toast({
      title: "Success",
      description: "API key saved successfully",
    });
  };

  const extractColorsFromHTML = (html: string): ColorData[] => {
    const colors: ColorData[] = [];
    
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Look for color elements - this pattern may need adjustment based on the actual HTML structure
    const colorElements = doc.querySelectorAll('[data-color], .color-item, .color-swatch, [style*="background"], [style*="color"]');
    
    colorElements.forEach(element => {
      const style = element.getAttribute('style');
      const dataColor = element.getAttribute('data-color');
      const textContent = element.textContent?.trim();
      
      // Extract hex color from style attribute
      const hexMatch = style?.match(/#([0-9A-Fa-f]{6})/);
      let hex = hexMatch ? hexMatch[0] : dataColor;
      
      if (!hex && textContent) {
        const textHexMatch = textContent.match(/#([0-9A-Fa-f]{6})/);
        hex = textHexMatch ? textHexMatch[0] : '';
      }
      
      if (hex && hex.length === 7) {
        // Extract color name from nearby text or title attribute
        const name = element.getAttribute('title') || 
                    element.textContent?.replace(hex, '').trim() || 
                    element.closest('[title]')?.getAttribute('title') ||
                    `Color ${hex}`;
        
        // Convert hex to RGB
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        colors.push({
          name: name.replace(/[^\w\s]/g, '').trim() || `Color ${hex}`,
          hex: hex.toUpperCase(),
          r,
          g,
          b
        });
      }
    });
    
    // Also try to extract from markdown content if HTML parsing doesn't work well
    const markdownHexPattern = /#([0-9A-Fa-f]{6})/g;
    const hexMatches = html.match(markdownHexPattern) || [];
    
    hexMatches.forEach((hex, index) => {
      if (!colors.find(c => c.hex === hex.toUpperCase())) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        colors.push({
          name: `Color ${index + 1}`,
          hex: hex.toUpperCase(),
          r,
          g,
          b
        });
      }
    });
    
    // Remove duplicates based on hex value
    const uniqueColors = colors.filter((color, index, self) => 
      index === self.findIndex(c => c.hex === color.hex)
    );
    
    return uniqueColors;
  };

  const handleExtractColors = async () => {
    setIsLoading(true);
    setProgress(0);
    setExtractedColors([]);
    
    try {
      const url = 'https://htmlcolorcodes.com/colors/';
      
      setProgress(25);
      const result = await FirecrawlService.scrapeWebsite(url);
      setProgress(50);
      
      if (result.success && result.data) {
        const html = result.data.html || result.data.markdown || '';
        const colors = extractColorsFromHTML(html);
        
        setProgress(75);
        setExtractedColors(colors);
        setProgress(100);
        
        toast({
          title: "Success",
          description: `Extracted ${colors.length} colors from the website`,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to extract colors",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error extracting colors:', error);
      toast({
        title: "Error",
        description: "Failed to extract colors from website",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCSV = () => {
    if (extractedColors.length === 0) return;
    
    const csvContent = [
      'Color Name,Hex,R,G,B',
      ...extractedColors.map(color => 
        `"${color.name}",${color.hex},${color.r},${color.g},${color.b}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'html-colors.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "CSV file downloaded successfully",
    });
  };

  if (showApiKeyInput) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Firecrawl API Key Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            To extract colors from websites, you need a Firecrawl API key. 
            Get one from <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">firecrawl.dev</a>
          </p>
          <Input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Firecrawl API key"
          />
          <Button onClick={handleSaveApiKey} className="w-full">
            Save API Key
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>HTML Colors Extractor</CardTitle>
          <p className="text-sm text-gray-600">
            Extract all color swatches from htmlcolorcodes.com including those behind "Load More"
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button 
              onClick={handleExtractColors} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? "Extracting Colors..." : "Extract All Colors"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowApiKeyInput(true)}
            >
              <Key className="w-4 h-4 mr-2" />
              API Key
            </Button>
          </div>
          
          {isLoading && (
            <Progress value={progress} className="w-full" />
          )}
          
          {extractedColors.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Extracted Colors ({extractedColors.length})
                </h3>
                <Button onClick={downloadCSV} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV
                </Button>
              </div>
              
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Color</th>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Hex</th>
                      <th className="p-2 text-left">RGB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractedColors.map((color, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: color.hex }}
                          />
                        </td>
                        <td className="p-2">{color.name}</td>
                        <td className="p-2 font-mono">{color.hex}</td>
                        <td className="p-2">{color.r}, {color.g}, {color.b}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorExtractor;
