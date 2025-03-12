import React from "react";
import type { ColorScaleOptions } from "../types/map";

interface LegendProps {
  colorScale: ColorScaleOptions;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  values: number[];
  className?: string;
}

const Legend: React.FC<LegendProps> = ({ colorScale, position, values, className = '' }) => {
  const { type, colors } = colorScale;
  const [min, max] = [Math.min(...values), Math.max(...values)];

  const getLabels = () => {
    if (type === "categorical") {
      return Array.from(new Set(values)).sort().map(String);
    }

    if (type === "diverging") {
      const mid = (max + min) / 2;
      return [min.toFixed(1), mid.toFixed(1), max.toFixed(1)];
    }

    // For sequential scales, create evenly spaced labels
    return colors.map((_, i) => {
      const value = min + (i * (max - min)) / (colors.length - 1);
      return value.toFixed(1);
    });
  };

  const labels = getLabels();
  const legendColors =
    type === "categorical" ? colors.slice(0, labels.length) : colors;

  return (
    <div 
      className={`react-ol-choropleth__legend ${className}`.trim()}
      data-position={position}
    >
      {legendColors.map((color, i) => (
        <div key={i} className="react-ol-choropleth__legend-item">
          <div 
            className="react-ol-choropleth__legend-color" 
            style={{ backgroundColor: color }} 
          />
          <span className="react-ol-choropleth__legend-label">
            {labels[i]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
