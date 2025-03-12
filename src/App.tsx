import { useState, useEffect, useCallback, memo, useMemo } from "react";
import "./App.css";
import ChoroplethMap from "./components/ChoroplethMap";
import Controls from "./components/Controls";
import { ColorScale, ColorScaleType, LegendPosition } from "./types/map";
import usStatesData from "./data/sa.json";
import type { FeatureLike } from "ol/Feature";
import { ModalProvider } from "./contexts/ModalContext";

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

const MemoizedChoroplethMap = memo(ChoroplethMap);

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
  const [customGeoJSON, setCustomGeoJSON] = useState("");
  const [currentData, setCurrentData] = useState(usStatesData);
  const [valueProperty, setValueProperty] = useState("density");
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureLike | null>(
    null
  );
  const [zoomToFeature, setZoomToFeature] = useState(false);
  const [selectedFeatureBorderColor, setSelectedFeatureBorderColor] =
    useState("#0099ff");

  // Extract available properties from the data
  const availableProperties = useMemo(() => {
    if (!currentData.features || !currentData.features[0]) return [];
    const properties = currentData.features[0].properties || {};
    return Object.keys(properties).filter((prop) => {
      const value = properties[prop as keyof typeof properties];
      return typeof value === "number" || !isNaN(Number(value));
    });
  }, [currentData]);

  // Update valueProperty when data changes if current property is not available
  useEffect(() => {
    if (
      availableProperties.length > 0 &&
      !availableProperties.includes(valueProperty)
    ) {
      setValueProperty(availableProperties[0]);
    }
  }, [availableProperties, valueProperty]);

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
    const currentColors = schemes[scaleType][
      colorScheme as keyof (typeof schemes)[typeof scaleType]
    ] as string[];
    const newColors = currentColors.slice(0, steps);

    setColorScale((prev) => ({
      ...prev,
      type: scaleType,
      colors: newColors,
      steps: steps,
    }));
  }, [steps, scaleType, colorScheme]);

  const handleFeatureClick = useCallback(
    (feature: FeatureLike | null, coordinate: [number, number]) => {
      if (feature) {
        const properties = feature.getProperties();
        console.log("Clicked feature:", properties);
      }
    },
    []
  );

  const handleGeoJSONInput = useCallback((value: string) => {
    try {
      const parsedData = JSON.parse(value);
      if (
        parsedData.type === "FeatureCollection" &&
        Array.isArray(parsedData.features)
      ) {
        setCustomGeoJSON(value);
        setCurrentData(parsedData);
      } else {
        console.error("Invalid GeoJSON format");
      }
    } catch (e) {
      console.error("Invalid JSON:", e);
    }
  }, []);

  const resetToDefaultData = useCallback(() => {
    setCustomGeoJSON("");
    setCurrentData(usStatesData);
  }, []);

  const generateCodeSnippet = useCallback(() => {
    return `import { ChoroplethMap } from 'react-ol-choropleth';

const YourComponent = () => {
  return (
    <ChoroplethMap
      data={${customGeoJSON ? "yourGeoJSONData" : "usStatesData"}}
      zoom={${zoom}}
      colorScale={{
        type: "${scaleType}",
        colors: ${JSON.stringify(colorScale.colors, null, 6)}
      }}
      valueProperty="${valueProperty}"
      showLegend={${showLegend}}
      legendPosition="${legendPosition}"
      baseMap="${baseMap}"
      zoomToFeature={${zoomToFeature}}
      selectedFeatureBorderColor="${selectedFeatureBorderColor}"
      onFeatureClick={(feature, coordinate) => {
        console.log('Clicked feature:', feature?.getProperties());
      }}
      overlayOptions={{
        positioning: "bottom-center",
        offset: [0, -10],
        autoPan: true,
        autoPanDuration: 500,
        render: (feature) => (
          <div className="feature-overlay">
            <h3>Feature Properties</h3>
            <pre>{JSON.stringify(feature.getProperties(), null, 2)}</pre>
          </div>
        )
      }}
    />
  );
};`;
  }, [
    customGeoJSON,
    zoom,
    scaleType,
    colorScale.colors,
    valueProperty,
    showLegend,
    legendPosition,
    baseMap,
    zoomToFeature,
    selectedFeatureBorderColor,
  ]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(generateCodeSnippet());
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy code:", err);
    }
  };

  return (
    <ModalProvider>
      <div className="app-container">
        <header className="app-header">
          <h1 className="app-title">React OpenLayers Choropleth Map</h1>
          <a
            href="https://github.com/AbdoElsaed/react-ol-choropleth"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            title="View on GitHub"
          >
            <svg height="28" width="28" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a>
        </header>

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
          colorScale={colorScale}
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

        <div className="map-wrapper">
          <MemoizedChoroplethMap
            data={currentData}
            zoom={zoom}
            colorScale={colorScale}
            valueProperty={valueProperty}
            showLegend={showLegend}
            legendPosition={legendPosition}
            baseMap={baseMap}
            onFeatureClick={handleFeatureClick}
            zoomToFeature={zoomToFeature}
            selectedFeatureBorderColor={selectedFeatureBorderColor}
            overlayOptions={{
              positioning: "bottom-center",
              offset: [0, -10],
              autoPan: true,
              autoPanDuration: 500,
              render: (feature) => (
                <div className="feature-overlay">
                  <div className="feature-overlay-header">
                    <h3>Feature Properties</h3>
                  </div>
                  <div className="feature-overlay-content">
                    {Object.entries(feature.getProperties())
                      .filter(([key]) => key !== "geometry")
                      .map(([key, value]) => (
                        <div key={key} className="property-row">
                          <strong>{key}:</strong> {String(value)}
                        </div>
                      ))}
                  </div>
                </div>
              ),
            }}
          />
        </div>
      </div>
    </ModalProvider>
  );
}

export default App;
