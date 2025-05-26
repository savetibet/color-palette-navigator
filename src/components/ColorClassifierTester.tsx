
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useColorClassifier from '@/hooks/useColorClassifier';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { detectColorFormat } from '@/utils/colorUtils';

const SAMPLE_COLORS = [
  '#FF0000', // Pure Red
  '#FF6347', // Tomato (reddish orange)
  '#FFA07A', // Light Salmon (peachy)
  '#FF69B4', // Hot Pink
  '#8B0000', // Dark Red
  '#FF8C00', // Dark Orange
  '#FFA500', // Orange
  '#FFD700', // Gold
  '#FFFF00', // Yellow
  '#BDB76B', // Dark Khaki (mustardy)
  '#808000', // Olive (greenish yellow)
  '#008000', // Green
  '#00FF00', // Lime Green
  '#006400', // Dark Green
  '#008080', // Teal (greenish blue)
  '#00FFFF', // Cyan
  '#0000FF', // Blue
  '#000080', // Navy Blue
  '#4B0082', // Indigo
  '#800080', // Purple
  '#9370DB', // Medium Purple
  '#EE82EE', // Violet
  '#FF00FF', // Magenta
  '#DDA0DD', // Plum (light purple)
  '#A0522D', // Sienna (brown)
  '#8B4513', // Saddle Brown
  '#D2B48C', // Tan (light brown)
  '#696969', // Dim Gray
  '#808080', // Gray
  '#D3D3D3', // Light Gray
  '#000000', // Black
  '#FFFFFF', // White
];

const ColorClassifierTester = () => {
  const { testColor, setTestColor, colorAnalysis, batchClassify } = useColorClassifier();
  const [inputColor, setInputColor] = useState('#FF0000');
  const [batchResults, setBatchResults] = useState<Array<{ hex: string; family: { main: string; sub: string | null } }>>([]);
  const [showBatchTest, setShowBatchTest] = useState(false);
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputColor(e.target.value);
  };
  
  const handleColorTest = () => {
    if (!inputColor) return;
    
    const format = detectColorFormat(inputColor);
    if (format === 'unknown') {
      alert('Invalid color format. Please use HEX format (#RRGGBB)');
      return;
    }
    
    setTestColor(inputColor);
  };
  
  const runBatchTest = () => {
    const results = batchClassify(SAMPLE_COLORS);
    setBatchResults(results);
    setShowBatchTest(true);
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Color Classification Tester</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Input 
                value={inputColor} 
                onChange={handleColorChange} 
                placeholder="Enter a color (e.g. #FF0000)" 
                className="max-w-xs"
              />
              <Button onClick={handleColorTest}>Analyze</Button>
              <Button variant="outline" onClick={runBatchTest}>Test Sample Colors</Button>
            </div>
            
            {colorAnalysis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-16 h-16 rounded-md border" 
                      style={{ backgroundColor: colorAnalysis.hex }}
                    ></div>
                    <div>
                      <p className="font-bold">{colorAnalysis.hex}</p>
                      <p className="text-sm text-gray-500">
                        RGB: {colorAnalysis.rgb.join(', ')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Hue:</span>
                      <span>{colorAnalysis.hsl[0]}°</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Saturation:</span>
                      <span>{colorAnalysis.hsl[1]}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Lightness:</span>
                      <span>{colorAnalysis.hsl[2]}%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-lg">Classification</h3>
                    <p className="text-2xl font-bold">{colorAnalysis.family.main}</p>
                    {colorAnalysis.family.sub && (
                      <p className="text-gray-500">Shade: {colorAnalysis.family.sub}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${colorAnalysis.isGrayish ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {colorAnalysis.isGrayish ? 'Grayish' : 'Not Grayish'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${colorAnalysis.isDark ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'}`}>
                        {colorAnalysis.isDark ? 'Dark' : 'Light'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${colorAnalysis.isVibrant ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {colorAnalysis.isVibrant ? 'Vibrant' : 'Muted'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {showBatchTest && batchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Sample Colors Classification</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {batchResults.map((result, index) => (
                <div 
                  key={index}
                  className="flex items-center p-2 rounded-md border gap-2"
                >
                  <div 
                    className="w-8 h-8 rounded-md border" 
                    style={{ backgroundColor: result.hex }}
                  ></div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{result.family.main}</p>
                    <p className="text-xs text-gray-500">{result.family.sub || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ColorClassifierTester;
