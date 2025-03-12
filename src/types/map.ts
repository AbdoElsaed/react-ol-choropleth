import type { Style } from 'ol/style';
import type { FeatureLike } from 'ol/Feature';
import type { Feature } from 'ol';
import type { Geometry } from 'ol/geom';
import GeoJSONFormat from 'ol/format/GeoJSON';

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
    data: {
        type: string;
        features: Array<{
            type: string;
            properties: Record<string, any>;
            geometry: {
                type: string;
                coordinates: number[][][] | number[][][][];
            };
        }>;
    };
    valueProperty: string;
    colorScale: ColorScale;
    style?: (feature: FeatureLike) => Style;
    zoom?: number;
    showLegend?: boolean;
    legendPosition?: LegendPosition;
    baseMap?: 'osm' | 'none';
    onFeatureClick?: (feature: FeatureLike | null, coordinate: [number, number]) => void;
    onFeatureHover?: (feature: FeatureLike | null) => void;
    /**
     * Options for the feature overlay
     */
    overlayOptions?: OverlayOptions | false;
    /**
     * Whether to zoom to a feature when clicked
     */
    zoomToFeature?: boolean;
    /**
     * Color of the border when a feature is selected
     * @default '#0099ff' (light blue)
     */
    selectedFeatureBorderColor?: string;
} 