import { useMemo } from 'react';
import chroma from 'chroma-js';
import type { ColorScale } from '../types/map';
import type { FeatureLike } from 'ol/Feature';

interface UseColorScaleOptions {
  data: FeatureLike[];
  valueProperty: string;
  colorScale: ColorScale;
}

const createColorScale = (colors: string[]) => {
  try {
    // Validate all colors are valid
    const validColors = colors.map(color => chroma(color).hex());
    return chroma.scale(validColors);
  } catch (e) {
    console.error('Invalid color in scale:', e);
    return chroma.scale(['#f7fbff', '#4292c6']); // Default blue scale
  }
};

export const useColorScale = ({ data, valueProperty, colorScale }: UseColorScaleOptions) => {
  return useMemo(() => {
    if (!colorScale || !data.length) {
      console.log('No color scale or data:', { colorScale, dataLength: data.length });
      return () => '#cccccc';
    }

    // Extract values from features
    const values = data
      .map(feature => {
        const value = Number(feature.get(valueProperty));
        return value;
      })
      .filter(value => !isNaN(value))
      .sort((a, b) => a - b);

    if (!values.length) {
      console.log('No valid values found');
      return () => '#cccccc';
    }

    const min = values[0];
    const max = values[values.length - 1];
    console.log('Values range:', min, 'to', max);

    const { type, colors } = colorScale;
    const scale = createColorScale(colors);

    switch (type) {
      case 'sequential': {
        // Create quantile breaks
        const numBreaks = colors.length;
        const breaks = Array.from({ length: numBreaks + 1 }, (_, i) => {
          const idx = Math.floor((i * (values.length - 1)) / numBreaks);
          return values[idx];
        });
        
        return (value: number) => {
          if (isNaN(value)) return '#cccccc';
          
          // Find which break interval the value falls into
          const breakIndex = breaks.findIndex((b, i) => 
            value >= breaks[i] && (i === breaks.length - 1 || value < breaks[i + 1])
          );
          
          if (breakIndex === -1) return colors[0];
          if (breakIndex === breaks.length - 1) return colors[colors.length - 1];
          
          // Calculate position within the break interval
          const start = breaks[breakIndex];
          const end = breaks[breakIndex + 1];
          const normalizedWithinBreak = (value - start) / (end - start);
          
          return scale(breakIndex / (numBreaks - 1) + (normalizedWithinBreak / numBreaks)).hex();
        };
      }

      case 'diverging': {
        const midpoint = values[Math.floor(values.length / 2)];
        
        return (value: number) => {
          if (isNaN(value)) return '#cccccc';
          
          let normalized;
          if (value <= midpoint) {
            normalized = (value - min) / (midpoint - min) * 0.5;
          } else {
            normalized = 0.5 + (value - midpoint) / (max - midpoint) * 0.5;
          }
          
          return scale(normalized).hex();
        };
      }

      case 'categorical': {
        const uniqueValues = Array.from(new Set(values));
        const numCategories = Math.min(uniqueValues.length, colors.length);
        
        return (value: number) => {
          if (isNaN(value)) return '#cccccc';
          const index = uniqueValues.indexOf(value);
          if (index === -1) return '#cccccc';
          return colors[index % colors.length];
        };
      }

      default:
        return () => '#cccccc';
    }
  }, [data, valueProperty, colorScale]);
};

export default useColorScale; 