import { useState, useMemo } from "react";
import { ChoroplethMap } from "react-ol-choropleth";
import type { ColorScaleType, LegendPosition } from "./types/map";
import Controls from "./components/Controls";
import { ModalProvider } from "./contexts/ModalContext";
import usStates from "./data/us-states.json";
import "ol/ol.css";
import "./styles/demo.css";
import "./styles/sidebar.css";
import "./styles/modal.css";

type ColorSchemes = {
  sequential: Record<string, string[]>;
  diverging: Record<string, string[]>;
  categorical: Record<string, string[]>;
};

// Color schemes for different scale types
const schemes: ColorSchemes = {
  sequential: {
    Blues: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6"],
    Reds: ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d"],
    Greens: ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45"],
    Purples: ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"],
    Oranges: ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603", "#7f2704"],
  },
  diverging: {
    RdBu: ["#b2182b", "#ef8a62", "#fddbc7", "#d1e5f0", "#67a9cf", "#2166ac"],
    PiYG: ["#c51b7d", "#e9a3c9", "#fde0ef", "#e6f5d0", "#a1d76a", "#4d9221"],
    BrBG: ["#8c510a", "#d8b365", "#f6e8c3", "#c7eae5", "#5ab4ac", "#01665e"],
  },
  categorical: {
    Set1: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33"],
    Set2: ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f"],
    Set3: ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462"],
  },
};

function App() {
  const [scaleType, setScaleType] = useState<ColorScaleType>("sequential");
  const [colorScheme, setColorScheme] = useState("Blues");
  const [steps, setSteps] = useState(6);
  const [zoom, setZoom] = useState(4);
  const [showLegend, setShowLegend] = useState(true);
  const [legendPosition, setLegendPosition] =
    useState<LegendPosition>("top-right");
  const [baseMap, setBaseMap] = useState<"osm" | "none">("osm");
  const [zoomToFeature, setZoomToFeature] = useState(true);
  const [selectedFeatureBorderColor, setSelectedFeatureBorderColor] =
    useState("#0099ff");
  const [valueProperty, setValueProperty] = useState("density");
  const [customGeoJSON, setCustomGeoJSON] = useState("");

  const currentData = useMemo(() => {
    try {
      return customGeoJSON ? JSON.parse(customGeoJSON) : usStates;
    } catch {
      return usStates;
    }
  }, [customGeoJSON]);

  const availableProperties = useMemo(() => {
    if (!currentData?.features?.[0]?.properties) return ["density"];
    return Object.keys(currentData.features[0].properties);
  }, [currentData]);

  const handleGeoJSONInput = (value: string) => {
    setCustomGeoJSON(value);
  };

  const resetToDefaultData = () => {
    setCustomGeoJSON("");
    setValueProperty("density");
  };

  const generateCodeSnippet = () => {
    return `import { ChoroplethMap } from 'react-ol-choropleth';

const YourComponent = () => {
  return (
    <ChoroplethMap
      data={${customGeoJSON ? "yourGeoJSONData" : "usStatesData"}}
      valueProperty="${valueProperty}"
      colorScale={{
        type: "${scaleType}",
        colors: ${JSON.stringify(
          schemes[scaleType][colorScheme].slice(0, steps)
        )}
      }}
      zoom={${zoom}}
      center={[-98.5795, 39.8283]}
      showLegend={${showLegend}}
      legendPosition="${legendPosition}"
      baseMap="${baseMap}"
      zoomToFeature={${zoomToFeature}}
      selectedFeatureBorderColor="${selectedFeatureBorderColor}"
    />
  );
};`;
  };

  return (
    <ModalProvider>
      <div className="app">
        <Controls
          zoom={zoom}
          setZoom={setZoom}
          showLegend={showLegend}
          setShowLegend={setShowLegend}
          legendPosition={legendPosition}
          setLegendPosition={setLegendPosition}
          baseMap={baseMap}
          setBaseMap={setBaseMap}
          steps={steps}
          setSteps={setSteps}
          scaleType={scaleType}
          setScaleType={setScaleType}
          colorScheme={colorScheme}
          setColorScheme={setColorScheme}
          colorScale={{
            type: scaleType,
            colors: schemes[scaleType][colorScheme].slice(0, steps),
          }}
          customGeoJSON={customGeoJSON}
          handleGeoJSONInput={handleGeoJSONInput}
          resetToDefaultData={resetToDefaultData}
          generateCodeSnippet={generateCodeSnippet}
          schemes={schemes}
          zoomToFeature={zoomToFeature}
          setZoomToFeature={setZoomToFeature}
          selectedFeatureBorderColor={selectedFeatureBorderColor}
          setSelectedFeatureBorderColor={setSelectedFeatureBorderColor}
          valueProperty={valueProperty}
          setValueProperty={setValueProperty}
          availableProperties={availableProperties}
          currentData={currentData}
        />

        <div className="map-container">
          <ChoroplethMap
            data={currentData}
            valueProperty={valueProperty}
            colorScale={{
              type: scaleType,
              colors: schemes[scaleType][colorScheme].slice(0, steps),
            }}
            zoom={zoom}
            showLegend={showLegend}
            legendPosition={legendPosition}
            baseMap={baseMap}
            zoomToFeature={zoomToFeature}
            selectedFeatureBorderColor={selectedFeatureBorderColor}
            className="demo-choropleth"
          />
        </div>
      </div>
    </ModalProvider>
  );
}

export default App;
