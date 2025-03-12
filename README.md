# React OpenLayers Choropleth

A lightweight React component for creating interactive choropleth maps using OpenLayers. Perfect for visualizing geographic data with color-coded regions.

## Features

- 🎨 Dynamic color scales with customizable ranges
- 🗺️ Built on OpenLayers for robust map functionality
- 📱 Responsive and mobile-friendly
- 🎯 Interactive tooltips and click events
- 📊 Customizable legend
- 🔧 TypeScript support

## Installation

```bash
npm install react-ol-choropleth
```

## Basic Usage

```tsx
import { ChoroplethMap } from 'react-ol-choropleth';
import 'react-ol-choropleth/style.css';

function App() {
  const geoData = {
    type: 'FeatureCollection',
    features: [
      // Your GeoJSON features
    ]
  };

  const data = {
    'region-1': 75,
    'region-2': 45,
    // ... more data
  };

  return (
    <ChoroplethMap
      geoData={geoData}
      data={data}
      idProperty="id"
      valueProperty={id => data[id]}
      colorScale={{
        type: 'quantile',
        colors: ['#feedde', '#fdbe85', '#fd8d3c', '#e6550d', '#a63603']
      }}
    />
  );
}
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `geoData` | `GeoJSON` | GeoJSON data for map regions |
| `data` | `Record<string, number>` | Data values for each region |
| `idProperty` | `string` | Property in GeoJSON features to match with data keys |
| `valueProperty` | `string \| (id: string) => number` | Property or function to get values |
| `colorScale` | `ColorScaleConfig` | Configuration for color scale |
| `center` | `[number, number]` | Initial map center (optional) |
| `zoom` | `number` | Initial zoom level (optional) |
| `legend` | `LegendConfig` | Legend configuration (optional) |

## Demo

Check out the [live demo](https://abdoelsaed.github.io/react-ol-choropleth/) to see it in action.

## License

MIT © [Abdulrhman El-Saed](https://github.com/AbdoElsaed)
