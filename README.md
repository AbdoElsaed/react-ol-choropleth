# React OpenLayers Choropleth

A lightweight React component for creating interactive choropleth maps using OpenLayers. Create beautiful, responsive geographic visualizations with customizable color scales, interactive tooltips, and dynamic legends. Built with TypeScript and modern React practices.

## Installation

```bash
npm install react-ol-choropleth
```

## Basic Usage

```tsx
import { ChoroplethMap } from "react-ol-choropleth";
import "react-ol-choropleth/style.css";

function App() {
  const geoData = {
    type: "FeatureCollection",
    features: [
      // Your GeoJSON features with properties like id, name, value
    ],
  };

  return (
    <ChoroplethMap
      // Required props
      data={geoData}
      valueProperty="population" // Property name in your GeoJSON features
      // Color scale configuration
      colorScale={{
        type: "sequential", // 'sequential' | 'diverging' | 'categorical'
        colors: ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"],
      }}
      // Map configuration
      zoom={4}
      baseMap="osm" // 'osm' | 'none'
      // Legend configuration
      showLegend={true}
      legendPosition="top-right" // 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
      // Interaction options
      zoomToFeature={true}
      selectedFeatureBorderColor="#0099ff"
      // Custom overlay configuration
      overlayOptions={{
        render: (feature) => (
          <div
            style={{ background: "white", padding: "8px", borderRadius: "4px" }}
          >
            <h3>{feature.get("name")}</h3>
            <p>Population: {feature.get("population").toLocaleString()}</p>
          </div>
        ),
        positioning: "bottom-center",
        offset: [0, -10],
        autoPan: true,
      }}
      // Event handlers
      onFeatureClick={(feature, coordinate) => {
        if (feature) {
          console.log("Clicked:", {
            name: feature.get("name"),
            value: feature.get("population"),
            coordinate,
          });
        }
      }}
      onFeatureHover={(feature) => {
        if (feature) {
          console.log("Hovering:", feature.get("name"));
        }
      }}
    />
  );
}
```

## Props

| Prop                         | Type                                                                | Description                                  |
| ---------------------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| `data`                       | `GeoJSON \| Feature[]`                                              | GeoJSON data or array of OpenLayers features |
| `valueProperty`              | `string`                                                            | Property name to use for coloring features   |
| `colorScale`                 | `ColorScale`                                                        | Color scale configuration                    |
| `zoom`                       | `number`                                                            | Initial zoom level (default: 2)              |
| `showLegend`                 | `boolean`                                                           | Whether to show the legend (default: true)   |
| `legendPosition`             | `LegendPosition`                                                    | Legend position (default: "top-right")       |
| `baseMap`                    | `"osm" \| "none"`                                                   | Base map layer type (default: "osm")         |
| `zoomToFeature`              | `boolean`                                                           | Auto-zoom on feature click (default: false)  |
| `selectedFeatureBorderColor` | `string`                                                            | Selected feature highlight color             |
| `overlayOptions`             | `OverlayOptions \| false`                                           | Custom overlay configuration                 |
| `onFeatureClick`             | `(feature: Feature \| null, coordinate?: [number, number]) => void` | Click event handler                          |
| `onFeatureHover`             | `(feature: Feature \| null) => void`                                | Hover event handler                          |

## Demo

Check out the [live demo](https://abdoelsaed.github.io/react-ol-choropleth/) to see it in action.

## License

MIT © [Abdulrhman El-Saed](https://github.com/AbdoElsaed)
