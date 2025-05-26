
import { useState, useMemo } from 'react';
import { ColorClassifier } from '@/utils/ColorClassifier';
import { ColorFamily } from '@/types/colors';

/**
 * A hook to classify colors and get detailed analysis
 */
export default function useColorClassifier() {
  const [testColor, setTestColor] = useState<string>('#FF0000');
  
  // Memoize color analysis to prevent unnecessary recalculations
  const colorAnalysis = useMemo(() => {
    if (!testColor) return null;
    try {
      return ColorClassifier.analyzeHex(testColor);
    } catch (e) {
      console.error('Error analyzing color:', e);
      return null;
    }
  }, [testColor]);
  
  // Batch classify multiple colors at once
  const batchClassify = (hexColors: string[]): Array<{ hex: string; family: ColorFamily }> => {
    return ColorClassifier.batchAnalyze(hexColors);
  };
  
  return {
    testColor,
    setTestColor,
    colorAnalysis,
    batchClassify
  };
}
