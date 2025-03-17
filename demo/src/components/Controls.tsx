import { memo } from "react";
import { ColorScaleType, LegendPosition } from "../types/map";
import { useModal } from "../contexts/ModalContext";

interface ControlsProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  showLegend: boolean;
  setShowLegend: (show: boolean) => void;
  legendPosition: LegendPosition;
  setLegendPosition: (position: LegendPosition) => void;
  baseMap: "osm" | "satellite" | "none";
  setBaseMap: (baseMap: "osm" | "satellite" | "none") => void;
  steps: number;
  setSteps: (steps: number) => void;
  scaleType: ColorScaleType;
  setScaleType: (type: ColorScaleType) => void;
  colorScheme: string;
  setColorScheme: (scheme: string) => void;
  customGeoJSON: string;
  handleGeoJSONInput: (value: string) => void;
  resetToDefaultData: () => void;
  generateCodeSnippet: () => string;
  schemes: Record<ColorScaleType, Record<string, string[]>>;
  zoomToFeature: boolean;
  setZoomToFeature: (zoom: boolean) => void;
  selectedFeatureBorderColor: string;
  setSelectedFeatureBorderColor: (color: string) => void;
  valueProperty: string;
  setValueProperty: (property: string) => void;
  availableProperties: string[];
  currentData: any;
  canZoomOutBoundaries: boolean;
  setCanZoomOutBoundaries: (can: boolean) => void;
  overlayTrigger: "click" | "hover";
  setOverlayTrigger: (trigger: "click" | "hover") => void;
}

const Controls = memo(
  ({
    zoom,
    setZoom,
    showLegend,
    setShowLegend,
    legendPosition,
    setLegendPosition,
    baseMap,
    setBaseMap,
    steps,
    setSteps,
    scaleType,
    setScaleType,
    colorScheme,
    setColorScheme,
    customGeoJSON,
    handleGeoJSONInput,
    resetToDefaultData,
    generateCodeSnippet,
    schemes,
    zoomToFeature,
    setZoomToFeature,
    selectedFeatureBorderColor,
    setSelectedFeatureBorderColor,
    valueProperty,
    setValueProperty,
    availableProperties,
    currentData,
    canZoomOutBoundaries,
    setCanZoomOutBoundaries,
    overlayTrigger,
    setOverlayTrigger,
  }: ControlsProps) => {
    const { openCodeModal } = useModal();

    const handleScaleTypeChange = (type: ColorScaleType) => {
      setScaleType(type);
      // Reset to first color scheme of the new type
      const firstScheme = Object.keys(schemes[type])[0];
      setColorScheme(firstScheme);
    };

    return (
      <div className="sidebar">
        <div className="github-link">
          <a
            href="https://github.com/AbdoElsaed/react-ol-choropleth"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              height="32"
              aria-hidden="true"
              viewBox="0 0 16 16"
              version="1.1"
              width="32"
            >
              <path
                fill="white"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
              ></path>
            </svg>
          </a>
        </div>
        <div className="controls-panel">
          <div className="control-row actions-row">
            <button
              className="show-code-button"
              onClick={() => openCodeModal(generateCodeSnippet())}
            >
              Show Code
            </button>
            <button
              className="show-code-button"
              onClick={() =>
                openCodeModal(JSON.stringify(currentData, null, 2))
              }
            >
              Show GeoJSON
            </button>
          </div>

          <div className="control-row">
            <div className="control-item">
              <label>Custom GeoJSON Data:</label>
              <div className="geojson-input-container">
                <textarea
                  value={customGeoJSON}
                  onChange={(e) => handleGeoJSONInput(e.target.value)}
                  placeholder="Paste your GeoJSON data here..."
                  rows={8}
                />
                <button onClick={resetToDefaultData}>
                  Reset to Default Data
                </button>
              </div>
            </div>
          </div>

          <div className="control-row">
            <div className="control-item">
              <label>Value Property:</label>
              <select
                value={valueProperty}
                onChange={(e) => setValueProperty(e.target.value)}
              >
                {availableProperties.map((prop) => (
                  <option key={prop} value={prop}>
                    {prop}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
                onChange={(e) => setColorScheme(e.target.value)}
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
              <label>Selected Feature Border Color:</label>
              <input
                type="color"
                value={selectedFeatureBorderColor}
                onChange={(e) => setSelectedFeatureBorderColor(e.target.value)}
                style={{ width: "100%", height: "40px" }}
              />
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
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="showLegend"
                  checked={showLegend}
                  onChange={(e) => setShowLegend(e.target.checked)}
                />
                <label htmlFor="showLegend">Show Legend</label>
              </div>
            </div>
          </div>

          <div className="control-row">
            <div className="control-item">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="zoomToFeature"
                  checked={zoomToFeature}
                  onChange={(e) => setZoomToFeature(e.target.checked)}
                />
                <label htmlFor="zoomToFeature">Zoom to Feature on Click</label>
              </div>
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
                onChange={(e) =>
                  setBaseMap(e.target.value as "osm" | "satellite" | "none")
                }
              >
                <option value="osm">OpenStreetMap</option>
                <option value="satellite">Satellite</option>
                <option value="none">None</option>
              </select>
            </div>
          </div>

          <div className="control-row">
            <div className="control-item">
              <label>Overlay Trigger:</label>
              <select
                value={overlayTrigger}
                onChange={(e) =>
                  setOverlayTrigger(e.target.value as "click" | "hover")
                }
              >
                <option value="click">Click</option>
                <option value="hover">Hover</option>
              </select>
            </div>
          </div>

          <div className="control-row">
            <div className="control-item">
              <div className="checkbox-group">
                <input
                  type="checkbox"
                  id="canZoomOutBoundaries"
                  checked={canZoomOutBoundaries}
                  onChange={(e) => setCanZoomOutBoundaries(e.target.checked)}
                />
                <label htmlFor="canZoomOutBoundaries">
                  Allow Zooming Beyond Boundaries
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

Controls.displayName = "Controls";

export default Controls;
