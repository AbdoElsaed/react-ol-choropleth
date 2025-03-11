import React from "react";
import type { ColorScaleOptions } from "../types/map";

interface LegendProps {
  colorScale: ColorScaleOptions;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  values: number[];
}

const positionStyles = {
  "top-left": { top: 10, left: 10 },
  "top-right": { top: 10, right: 10 },
  "bottom-left": { bottom: 10, left: 10 },
  "bottom-right": { bottom: 10, right: 10 },
};

const Legend: React.FC<LegendProps> = ({ colorScale, position, values }) => {
  const { type, colors, steps = 5 } = colorScale;
  const [min, max] = [Math.min(...values), Math.max(...values)];

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

  const labels = getLabels();
  const legendColors =
    type === "categorical" ? colors.slice(0, labels.length) : colors;

  return (
    <div
      style={{
        position: "absolute",
        ...positionStyles[position],
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        padding: "10px",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
              border: "1px solid #ccc",
            }}
          />
          <span style={{ color: "#000" }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
};

export default Legend;
