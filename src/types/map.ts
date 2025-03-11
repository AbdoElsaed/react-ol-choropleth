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
    onFeatureClick?: (feature: FeatureLike) => void;
    onFeatureHover?: (feature: FeatureLike | null) => void;
} 