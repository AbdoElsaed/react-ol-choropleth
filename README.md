# React OpenLayers Choropleth

[![npm version](https://badge.fury.io/js/react-ol-choropleth.svg)](https://badge.fury.io/js/react-ol-choropleth)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://badges.frapsoft.com/typescript/code/typescript.svg?v=101)](https://github.com/ellerbrock/typescript-badges/)

A powerful React component for creating interactive choropleth maps using OpenLayers. Perfect for visualizing geographic data with customizable color scales, interactive features, and responsive design.

![React OpenLayers Choropleth Demo](demo.gif)

## ✨ Features

- 🗺️ **Easy Integration** - Seamlessly works with OpenLayers and React
- 🎨 **Flexible Color Scales** - Sequential, diverging, and categorical color schemes
- 📊 **Dynamic Legend** - Customizable legend with automatic value ranges
- 🔍 **Rich Interactivity** - Hover tooltips, click events, and feature selection
- 🎯 **Smart Zooming** - Automatic zoom-to-feature and custom view controls
- 🎭 **Custom Styling** - Extensive style customization for features and overlays
- 📱 **Responsive Design** - Works across all device sizes
- 💻 **TypeScript Support** - Full type definitions included

## 📦 Installation

```bash
# Using npm
npm install react-ol-choropleth ol

# Using yarn
yarn add react-ol-choropleth ol

# Using pnpm
pnpm add react-ol-choropleth ol
```

## 🚀 Quick Start

```tsx
import { ChoroplethMap } from 'react-ol-choropleth';
import 'ol/ol.css';

function App() {
  return (
    <ChoroplethMap
      data={geoJSONData}
      valueProperty="population"
      colorScale={{
        type: "sequential",
        colors: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6"]
      }}
      zoom={4}
      center={[-98.5795, 39.8283]}
      showLegend={true}
      legendPosition="top-right"
      zoomToFeature={true}
    />
  );
}
```

## 📖 Documentation

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `GeoJSON \| Feature[]` | Required | GeoJSON data or array of OpenLayers features |
| `valueProperty` | `string` | Required | Property name to use for coloring features |
| `colorScale` | `ColorScale` | Required | Color scale configuration |
| `zoom` | `number` | `2` | Initial zoom level |
| `center` | `[number, number]` | - | Initial center coordinates [lon, lat] |
| `showLegend` | `boolean` | `true` | Whether to show the legend |
| `legendPosition` | `LegendPosition` | `"top-right"` | Legend position |
| `baseMap` | `"osm" \| "none"` | `"osm"` | Base map layer type |
| `zoomToFeature` | `boolean` | `false` | Auto-zoom on feature click |
| `selectedFeatureBorderColor` | `string` | `"#0099ff"` | Selected feature highlight color |

### Color Scales

Three types of color scales are supported:

#### Sequential
```tsx
colorScale={{
  type: "sequential",
  colors: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6"]
}}
```

#### Diverging
```tsx
colorScale={{
  type: "diverging",
  colors: ["#d73027", "#f46d43", "#fdae61", "#abd9e9", "#74add1", "#4575b4"]
}}
```

#### Categorical
```tsx
colorScale={{
  type: "categorical",
  colors: ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"]
}}
```

### Events

```tsx
<ChoroplethMap
  onFeatureClick={(feature, coordinate) => {
    console.log('Clicked:', feature?.get('name'), 'at', coordinate);
  }}
  onFeatureHover={(feature) => {
    console.log('Hovering:', feature?.get('name'));
  }}
/>
```

### Custom Overlays

```tsx
<ChoroplethMap
  overlayOptions={{
    render: (feature) => (
      <div className="custom-overlay">
        <h3>{feature.get('name')}</h3>
        <p>Value: {feature.get('value')}</p>
      </div>
    ),
    positioning: "bottom-center",
    offset: [0, -10]
  }}
/>
```

## 🎨 Styling

The component comes with default styles but can be customized using CSS:

```css
.legend-container {
  /* Customize legend appearance */
}

.feature-overlay {
  /* Customize feature overlay appearance */
}
```

## 🌍 Examples

Check out our [demo app](https://github.com/yourusername/react-ol-choropleth/tree/main/demo) for more examples:

- US States Population Density
- World Countries GDP
- Custom GeoJSON Data
- Different Color Schemes
- Custom Overlays

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/yourusername/react-ol-choropleth.git

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenLayers](https://openlayers.org/) for the amazing mapping library
- [chroma.js](https://gka.github.io/chroma.js/) for color manipulation
- [d3-scale](https://github.com/d3/d3-scale) for scaling utilities

## 📧 Support

If you have any questions or need help, please:

1. Check the [documentation](https://github.com/yourusername/react-ol-choropleth#documentation)
2. Look through [existing issues](https://github.com/yourusername/react-ol-choropleth/issues)
3. Open a new issue if needed

---

Made with ❤️ by [Your Name]
