
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Download, Key, RefreshCw } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  const extractColorsFromContent = (html: string, markdown: string = ''): ColorData[] => {
    const colors: ColorData[] = [];
    console.log('Extracting colors from content, HTML length:', html.length);
    
    // Multiple extraction strategies
    const content = html + ' ' + markdown;
    
    // Strategy 1: Look for hex patterns with names
    const hexPatterns = [
      /#([0-9A-Fa-f]{6})/g,
      /([0-9A-Fa-f]{6})/g,
      /color[:\s]*#([0-9A-Fa-f]{6})/gi,
      /background[:\s]*#([0-9A-Fa-f]{6})/gi
    ];
    
    hexPatterns.forEach(pattern => {
      const matches = content.matchAll(pattern);
      for (const match of matches) {
        const hex = '#' + match[1].toUpperCase();
        if (!colors.find(c => c.hex === hex)) {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          
          colors.push({
            name: `Color ${hex}`,
            hex,
            r,
            g,
            b
          });
        }
      }
    });
    
    // Strategy 2: Parse HTML structure for color cards/items
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Look for common color card patterns
    const colorSelectors = [
      '.color-card',
      '.color-item',
      '.color-swatch',
      '[data-color]',
      '.hex-color',
      '.color-box',
      'div[style*="background"]',
      '.color-sample'
    ];
    
    colorSelectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(element => {
        const style = element.getAttribute('style') || '';
        const dataColor = element.getAttribute('data-color');
        const textContent = element.textContent?.trim() || '';
        
        // Extract hex from various sources
        let hex = '';
        const hexMatch = style.match(/#([0-9A-Fa-f]{6})/);
        if (hexMatch) {
          hex = hexMatch[0];
        } else if (dataColor && dataColor.match(/^#[0-9A-Fa-f]{6}$/)) {
          hex = dataColor;
        } else {
          const textHex = textContent.match(/#([0-9A-Fa-f]{6})/);
          if (textHex) hex = textHex[0];
        }
        
        if (hex) {
          // Try to find a color name
          let name = element.getAttribute('title') || 
                     element.getAttribute('data-name') ||
                     element.querySelector('.color-name')?.textContent?.trim() ||
                     textContent.replace(hex, '').trim() ||
                     `Color ${hex}`;
          
          name = name.replace(/[^\w\s-]/g, '').trim() || `Color ${hex}`;
          
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          
          if (!colors.find(c => c.hex === hex.toUpperCase())) {
            colors.push({
              name,
              hex: hex.toUpperCase(),
              r,
              g,
              b
            });
          }
        }
      });
    });
    
    // Strategy 3: Look for structured color data in text
    const colorLinePattern = /([A-Za-z\s]+)\s*[:\-]?\s*#([0-9A-Fa-f]{6})/g;
    const colorMatches = content.matchAll(colorLinePattern);
    
    for (const match of colorMatches) {
      const name = match[1].trim();
      const hex = '#' + match[2].toUpperCase();
      
      if (name && !colors.find(c => c.hex === hex)) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        colors.push({
          name: name.replace(/[^\w\s-]/g, '').trim() || `Color ${hex}`,
          hex,
          r,
          g,
          b
        });
      }
    }
    
    console.log('Extracted colors:', colors.length);
    return colors.filter((color, index, self) => 
      index === self.findIndex(c => c.hex === color.hex)
    );
  };

  const handleExtractColors = async () => {
    setIsLoading(true);
    setProgress(0);
    setExtractedColors([]);
    
    try {
      const url = 'https://htmlcolorcodes.com/colors/';
      console.log('Starting color extraction from:', url);
      
      setProgress(25);
      const result = await FirecrawlService.scrapeWebsite(url);
      setProgress(75);
      
      if (result.success && result.data) {
        console.log('Scrape result:', result.data);
        const html = result.data.html || '';
        const markdown = result.data.markdown || '';
        const colors = extractColorsFromContent(html, markdown);
        
        setProgress(90);
        setExtractedColors(colors);
        setProgress(100);
        
        toast({
          title: "Success",
          description: `Extracted ${colors.length} colors from the website`,
        });
      } else {
        console.error('Scrape failed:', result.error);
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
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Extracting Colors...
                </>
              ) : (
                "Extract All Colors"
              )}
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Color</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Hex</TableHead>
                      <TableHead>RGB</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extractedColors.map((color, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: color.hex }}
                          />
                        </TableCell>
                        <TableCell>{color.name}</TableCell>
                        <TableCell className="font-mono">{color.hex}</TableCell>
                        <TableCell>{color.r}, {color.g}, {color.b}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ColorExtractor;
