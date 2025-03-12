import React from "react";
import type { ColorScaleOptions } from "../types/map";

interface LegendProps {
  colorScale: ColorScaleOptions;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  values: number[];
}

const Legend: React.FC<LegendProps> = ({ colorScale, position, values }) => {
  const { type, colors, steps = 5 } = colorScale;

  const getLabels = () => {
    if (type === "categorical") {
      return Array.from(new Set(values)).sort().map(String);
    }

    if (type === "diverging") {
      return [min.toFixed(1), "0", max.toFixed(1)];
    }

    return Array.from({ length: steps }, (_, i) => {
      const value = min + (i * (max - min)) / (steps - 1);
      return value.toFixed(1);
    });
  };

  const [min, max] = [Math.min(...values), Math.max(...values)];
  const labels = getLabels();
  const legendColors =
    type === "categorical" ? colors.slice(0, labels.length) : colors;

  return (
    <div
      className="legend-container"
      data-position={position}
      style={{
        backgroundColor: "rgba(45, 45, 45, 0.9)",
        padding: "10px",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        fontSize: "12px",
      }}
    >
      {legendColors.map((color, i) => (
        <div
          key={i}
          style={{ display: "flex", alignItems: "center", marginBottom: "4px" }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              backgroundColor: color,
              marginRight: "8px",
              border: "1px solid #4d4d4d",
              borderRadius: "2px",
            }}
          />
          <span style={{ color: "#e0e0e0" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
