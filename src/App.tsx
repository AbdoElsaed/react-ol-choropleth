import { useState, useEffect } from "react";
import "./App.css";
import ChoroplethMap from "./components/ChoroplethMap";
import { ColorScale, ColorScaleType, LegendPosition } from "./types/map";
import usStatesData from "./data/us-states.json";

type ColorScheme = string[];

type ColorSchemes = {
  sequential: {
    Blues: ColorScheme;
    Reds: ColorScheme;
    Greens: ColorScheme;
  };
  diverging: {
    RdBu: ColorScheme;
    PiYG: ColorScheme;
    BrBG: ColorScheme;
  };
  categorical: {
    Set1: ColorScheme;
    Set2: ColorScheme;
    Set3: ColorScheme;
  };
};

const schemes: ColorSchemes = {
  sequential: {
    Blues: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6"],
    Reds: ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26"],
    Greens: ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#31a354"],
  },
  diverging: {
    RdBu: ["#ef8a62", "#fddbc7", "#ffffff", "#d1e5f0", "#67a9cf", "#2166ac"],
    PiYG: ["#d01c8b", "#f1b6da", "#f7f7f7", "#b8e186", "#4dac26", "#006837"],
    BrBG: ["#d8b365", "#f6e8c3", "#f5f5f5", "#c7eae5", "#5ab4ac", "#01665e"],
  },
  categorical: {
    Set1: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33"],
    Set2: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f"],
    Set3: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462"],
  },
} as const;

function App() {
  const [zoom, setZoom] = useState(4);
  const [showLegend, setShowLegend] = useState(true);
  const [legendPosition, setLegendPosition] =
    useState<LegendPosition>("top-right");
  const [baseMap, setBaseMap] = useState<"osm" | "none">("osm");
  const [steps, setSteps] = useState(6);
  const [scaleType, setScaleType] = useState<ColorScaleType>("sequential");
  const [colorScheme, setColorScheme] = useState("Blues");
  const [colorScale, setColorScale] = useState<ColorScale>({
    type: "sequential",
    colors: schemes.sequential.Blues,
  });

  const handleScaleTypeChange = (type: ColorScaleType) => {
    setScaleType(type);
    // Reset to first color scheme of the new type
    const firstScheme = Object.keys(schemes[type])[0];
    setColorScheme(firstScheme);
    setColorScale({
      type,
      colors: schemes[type][firstScheme as keyof (typeof schemes)[typeof type]],
    });
  };

  const handleColorSchemeChange = (scheme: string) => {
    setColorScheme(scheme);
    setColorScale({
      type: scaleType,
      colors:
        schemes[scaleType][scheme as keyof (typeof schemes)[typeof scaleType]],
    });
  };

  // Update colors when steps change
  useEffect(() => {
    const currentColors = schemes[scaleType][colorScheme as keyof typeof schemes[typeof scaleType]] as string[];
    const newColors = currentColors.slice(0, steps);
    
    setColorScale((prev) => ({
      ...prev,
      type: scaleType,
      colors: newColors,
      steps: steps,
    }));
  }, [steps, scaleType, colorScheme]);

  const handleFeatureClick = (feature: any) => {
    const properties = feature.getProperties();
    console.log('Clicked feature:', properties);
  };

  return (
    <div className="app-container">
      <h1 className="app-title">React OpenLayers Choropleth Map</h1>

      <div className="sidebar">
        <div className="controls-panel">
          <div className="control-row">
            <div className="control-item">
              <label>Color Scale Type:</label>
              <select
                value={scaleType}
                onChange={(e) =>
                  handleScaleTypeChange(e.target.value as ColorScaleType)
                }
              >
                <option value="sequential">Sequential</option>
                <option value="diverging">Diverging</option>
                <option value="categorical">Categorical</option>
              </select>
            </div>
          </div>

          <div className="control-row">
            <div className="control-item">
              <label>Color Scheme:</label>
              <select
                value={colorScheme}
                onChange={(e) => handleColorSchemeChange(e.target.value)}
              >
                {Object.keys(schemes[scaleType]).map((scheme) => (
                  <option key={scheme} value={scheme}>
                    {scheme}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="control-row">
            <div className="control-item">
              <label>Steps:</label>
              <select
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
              >
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
              </select>
            </div>
          </div>

          <div className="control-row">
            <div className="control-item">
              <label>Current Color Scheme:</label>
              <div className="color-preview">
                {colorScale.colors.map((color, index) => (
                  <div
                    key={index}
                    className="color-box"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="control-row">
            <div className="control-item">
              <label>Zoom Level:</label>
              <select
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              >
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
              </select>
            </div>
          </div>

          <div className="control-row">
            <div className="control-item">
              <input
                type="checkbox"
                id="showLegend"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
              />
              <label htmlFor="showLegend">Show Legend</label>
            </div>
          </div>

          <div className="control-row">
            <div className="control-item">
              <label>Legend Position:</label>
              <select
                value={legendPosition}
                onChange={(e) =>
                  setLegendPosition(e.target.value as LegendPosition)
                }
                disabled={!showLegend}
              >
                <option value="top-right">Top Right</option>
                <option value="top-left">Top Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          </div>

          <div className="control-row">
            <div className="control-item">
              <label>Base Map:</label>
              <select
                value={baseMap}
                onChange={(e) => setBaseMap(e.target.value as "osm" | "none")}
              >
                <option value="osm">OpenStreetMap</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="map-wrapper">
        <ChoroplethMap
          data={usStatesData}
          zoom={zoom}
          colorScale={colorScale}
          valueProperty="density"
          showLegend={showLegend}
          legendPosition={legendPosition}
          baseMap={baseMap}
          onFeatureClick={handleFeatureClick}
        />
      </div>
    </div>
  );
}

export default App;
