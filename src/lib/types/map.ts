import type { Style } from 'ol/style';
import type { FeatureLike } from 'ol/Feature';
import type { StyleLike } from 'ol/style/Style';

export type LegendPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export type ColorScaleType = 'sequential' | 'diverging' | 'categorical';

export interface ColorScale {
    type: ColorScaleType;
    colors: string[];
}

export interface ColorScaleOptions {
    /**
     * Type of color scale
     */
    type: ColorScaleType;

    /**
     * Array of colors to use for the scale
     */
    colors: string[];

    /**
     * Number of classes/steps in the scale
     */
    steps?: number;

    /**
     * Method to classify data
     */
    classification?: 'equalInterval' | 'quantile' | 'jenks';

    /**
     * Domain for the scale [min, max]
     */
    domain?: [number, number];
}

export interface GeoJSONFeature {
    type: string;
    id?: string;
    properties: Record<string, any>;
    geometry: {
        type: string;
        coordinates: any[];
    };
}

export interface GeoJSONFeatureCollection {
    type: string;
    features: GeoJSONFeature[];
}

export interface OverlayOptions {
    /**
     * Custom render function for the overlay content
     */
    render?: (feature: FeatureLike) => React.ReactNode;

    /**
     * Positioning of the overlay relative to the feature
     */
    positioning?: 'bottom-center' | 'top-center' | 'center-center' | 'center-left' | 'center-right' | 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

    /**
     * Offset in pixels from the positioning
     */
    offset?: [number, number];

    /**
     * Whether to auto pan the map to show the overlay when it's displayed
     */
    autoPan?: boolean;

    /**
     * Animation duration for auto pan in milliseconds
     */
    autoPanDuration?: number;
}

export interface ChoroplethMapProps {
    /** GeoJSON data or array of OpenLayers features to display on the map */
    data: FeatureLike[] | GeoJSONFeatureCollection;
    /** Property name in the GeoJSON features to use for coloring */
    valueProperty: string;
    /** Configuration for the color scale */
    colorScale: ColorScale;
    /** Custom style function for features */
    style?: Style | StyleLike;
    /** Initial center coordinates [longitude, latitude] */
    center?: [number, number];
    /** Initial zoom level */
    zoom?: number;
    /** Base map layer type */
    baseMap?: 'osm' | 'none';
    /** Whether to show the legend */
    showLegend?: boolean;
    /** Position of the legend */
    legendPosition?: LegendPosition;
    /** Options for the feature overlay */
    overlayOptions?: OverlayOptions | false;
    /** Whether to zoom to a feature when clicked */
    zoomToFeature?: boolean;
    /** Border color for selected features */
    selectedFeatureBorderColor?: string;
    /** Callback when a feature is clicked */
    onFeatureClick?: (feature: FeatureLike | null, coordinate?: [number, number]) => void;
    /** Callback when hovering over a feature */
    onFeatureHover?: (feature: FeatureLike | null) => void;
} 