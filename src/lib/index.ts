/**
 * React OpenLayers Choropleth Map
 * A React plugin for creating choropleth maps using OpenLayers
 * @module react-ol-choropleth
 */

// Components
export { default as ChoroplethMap } from './components/ChoroplethMap';
export { default as Legend } from './components/Legend';

// Hooks
export { default as useColorScale } from './hooks/useColorScale';

// Types
export type {
  ChoroplethMapProps,
  ColorScale,
  ColorScaleType,
  ColorScaleOptions,
  LegendPosition,
  OverlayOptions,
  GeoJSONFeatureCollection,
  GeoJSONFeature
} from './types/map';

// Re-export necessary OpenLayers types
export type { FeatureLike } from 'ol/Feature';
export type { Style } from 'ol/style';
export type { StyleLike } from 'ol/style/Style';

// Import styles
import './styles/choropleth.css'; 