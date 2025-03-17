import { useEffect, useRef, useState, useMemo, memo, useCallback } from "react";
import { createPortal } from "react-dom";

// OpenLayers imports optimization - using specific submodules
import Map from "ol/Map.js";
import View from "ol/View.js";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";
import OSM from "ol/source/OSM.js";
import XYZ from "ol/source/XYZ.js";
import GeoJSON from "ol/format/GeoJSON.js";
import { Fill, Stroke, Style } from "ol/style.js";
import type { StyleLike } from "ol/style/Style.js";
import type { FeatureLike } from "ol/Feature.js";
import Feature from "ol/Feature.js";
import { Geometry } from "ol/geom.js";
import Polygon from "ol/geom/Polygon.js";
import Overlay from "ol/Overlay.js";

import type {
  ColorScale,
  GeoJSONFeatureCollection,
  OverlayOptions,
  LegendPosition,
} from "../types/map";
import useColorScale from "../hooks/useColorScale";
import Legend from "./Legend";
import chroma from "chroma-js";
import "../styles/choropleth.css";

const generateOverlayContent = (feature: FeatureLike) => {
  const properties = feature.getProperties();
  const content = Object.entries(properties)
    .filter(([key]) => key !== "geometry")
    .map(([key, value]) => (
      <div key={key} className="react-ol-choropleth__overlay-property">
        <strong>{key}:</strong> {String(value)}
      </div>
    ));
  return <div className="react-ol-choropleth__overlay">{content}</div>;
};

type BaseChoroplethMapProps = {
  data: FeatureLike[] | GeoJSONFeatureCollection;
  valueProperty: string;
  colorScale: ColorScale;
  style?: Style | StyleLike;
  zoom?: number;
  baseMap?: "osm" | "satellite" | "none";
  showLegend?: boolean;
  legendPosition?: LegendPosition;
  onFeatureClick?: (
    feature: FeatureLike | null,
    coordinate?: [number, number]
  ) => void;
  onFeatureHover?: (feature: FeatureLike | null) => void;
  overlayOptions?: OverlayOptions | false;
  zoomToFeature?: boolean;
  selectedFeatureBorderColor?: string;
  canZoomOutBoundaries?: boolean;
};

interface ExtendedChoroplethMapProps extends BaseChoroplethMapProps {
  className?: string;
  mapClassName?: string;
  legendClassName?: string;
}

// Debounce helper with proper cleanup
const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  const debouncedFn = function (this: any, ...args: any[]) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), ms);
  };
  debouncedFn.cancel = () => clearTimeout(timeoutId);
  return debouncedFn;
};

const ChoroplethMap = ({
  data,
  valueProperty,
  colorScale,
  style,
  zoom = 2,
  baseMap = "osm",
  showLegend = true,
  legendPosition = "top-right",
  onFeatureClick,
  onFeatureHover,
  overlayOptions = {
    positioning: "bottom-center",
    offset: [0, -10],
    autoPan: true,
    trigger: "click",
  },
  zoomToFeature = false,
  selectedFeatureBorderColor = "#0099ff",
  canZoomOutBoundaries = true,
  className = "",
  mapClassName = "",
  legendClassName = "",
}: ExtendedChoroplethMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null);
  const overlayRef = useRef<Overlay | null>(null);
  const overlayContainerRef = useRef<HTMLDivElement | null>(null);
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
  const selectedFeatureRef = useRef<FeatureLike | null>(null);
  const hoveredFeatureRef = useRef<FeatureLike | null>(null);
  const vectorLayerRef = useRef<VectorLayer<
    VectorSource<Feature<Geometry>>
  > | null>(null);
  const [overlayContent, setOverlayContent] = useState<React.ReactNode | null>(
    null
  );

  // Create vector source only when data changes
  const vectorSource = useMemo(() => {
    const source = new VectorSource<Feature<Geometry>>();

    if (Array.isArray(data)) {
      source.addFeatures(data as Feature<Geometry>[]);
    } else {
      const geoJSON = new GeoJSON();
      const features = geoJSON.readFeatures(data, {
        featureProjection: "EPSG:3857",
        dataProjection: "EPSG:4326",
      }) as Feature<Geometry>[];
      source.addFeatures(features);
    }

    const loadedFeatures = source.getFeatures();
    vectorSourceRef.current = source;
    setFeatures(loadedFeatures);
    return source;
  }, [data]);

  const getColor = useColorScale({ data: features, valueProperty, colorScale });

  // Style function that uses the ref for selected feature
  const styleFunction = useCallback(
    (feature: FeatureLike) => {
      const value = feature.get(valueProperty);
      const color = getColor(Number(value));
      const rgb = color === "#cccccc" ? [204, 204, 204] : chroma(color).rgb();
      const isSelected = feature === selectedFeatureRef.current;
      const isHovered = feature === hoveredFeatureRef.current;
      const selectedColor = chroma(selectedFeatureBorderColor).rgb();

      return new Style({
        fill: new Fill({
          color: [...rgb, 0.8],
        }),
        stroke: new Stroke({
          color:
            isSelected || isHovered ? [...selectedColor, 1] : [61, 61, 61, 1],
          width: isSelected ? 3 : isHovered ? 2 : 1,
        }),
      });
    },
    [getColor, valueProperty, selectedFeatureBorderColor]
  );

  // Handle showing overlay
  const showOverlay = useCallback(
    (feature: FeatureLike | null, coordinate?: [number, number]) => {
      if (
        feature &&
        overlayRef.current &&
        overlayContainerRef.current &&
        overlayOptions
      ) {
        try {
          const content = overlayOptions.render
            ? overlayOptions.render(feature)
            : generateOverlayContent(feature);

          setOverlayContent(content);

          // Get the top center coordinate of the feature
          const geometry = feature.getGeometry();
          if (geometry instanceof Polygon) {
            const extent = geometry.getExtent();
            const position = coordinate || [
              (extent[0] + extent[2]) / 2,
              extent[3],
            ];

            // Set position after content update
            requestAnimationFrame(() => {
              if (overlayRef.current) {
                overlayRef.current.setPosition(position);
              }
            });
          }
        } catch (error) {
          console.error("Error updating overlay:", error);
          overlayRef.current.setPosition(undefined);
          setOverlayContent(null);
        }
      } else if (overlayRef.current) {
        overlayRef.current.setPosition(undefined);
        setOverlayContent(null);
      }
    },
    [overlayOptions]
  );

  // Handle feature click
  const handleFeatureClick = useCallback(
    (event: any, map: Map) => {
      const clickedFeature =
        map.forEachFeatureAtPixel(event.pixel, (feature) => feature) || null;

      selectedFeatureRef.current = clickedFeature;

      // Show overlay if trigger is click
      if (overlayOptions && overlayOptions.trigger === "click") {
        showOverlay(clickedFeature);
      }

      if (clickedFeature) {
        if (onFeatureClick) {
          const coordinate = map.getCoordinateFromPixel(event.pixel);
          onFeatureClick(clickedFeature, coordinate as [number, number]);
        }

        if (zoomToFeature && mapInstanceRef.current) {
          const geometry = clickedFeature.getGeometry();
          if (geometry instanceof Polygon) {
            const extent = geometry.getExtent();
            const view = mapInstanceRef.current.getView();
            const resolution = view.getResolutionForExtent(
              extent,
              mapInstanceRef.current.getSize() || undefined
            );
            const zoom = view.getZoomForResolution(resolution || 1);
            const position = [(extent[0] + extent[2]) / 2, extent[3]];

            view.animate({
              center: position,
              zoom: zoom ? Math.min(zoom + 0.5, 6) : 6,
              duration: 500,
            });
          }
        }
      } else if (onFeatureClick) {
        onFeatureClick(null);
      }

      // Force vector layer to refresh styles
      if (vectorLayerRef.current) {
        vectorLayerRef.current.changed();
      }
    },
    [onFeatureClick, zoomToFeature, overlayOptions, showOverlay]
  );

  // Handle feature hover
  const handleFeatureHover = useCallback(
    (event: any, map: Map) => {
      const hoveredFeature =
        event.type === "pointermove"
          ? map.forEachFeatureAtPixel(event.pixel, (feature) => feature) || null
          : null;

      hoveredFeatureRef.current = hoveredFeature;

      // Show overlay if trigger is hover
      if (overlayOptions && overlayOptions.trigger === "hover") {
        const coordinate = hoveredFeature
          ? map.getCoordinateFromPixel(event.pixel)
          : undefined;
        showOverlay(hoveredFeature, coordinate as [number, number]);
      }

      if (onFeatureHover) {
        onFeatureHover(hoveredFeature);
      }

      // Force vector layer to refresh styles
      if (vectorLayerRef.current) {
        vectorLayerRef.current.changed();
      }
    },
    [onFeatureHover, overlayOptions, showOverlay]
  );

  // Effect for initial map setup
  useEffect(() => {
    if (!mapRef.current || !vectorSource) return;

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: style || styleFunction,
      updateWhileAnimating: true,
      updateWhileInteracting: true,
    });
    vectorLayerRef.current = vectorLayer;

    // Configure base layers based on type
    const baseLayers = [];
    if (baseMap !== "none") {
      if (baseMap === "satellite") {
        baseLayers.push(
          new TileLayer({
            source: new XYZ({
              url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              maxZoom: 19,
            }),
          })
        );
      } else {
        baseLayers.push(new TileLayer({ source: new OSM() }));
      }
    }

    const layers = [...baseLayers, vectorLayer];
    const extent = vectorSource.getExtent();

    // Calculate the minimum zoom level that fits the data extent
    const size = mapRef.current.getBoundingClientRect();
    const minResolution = Math.max(
      (extent[2] - extent[0]) / size.width,
      (extent[3] - extent[1]) / size.height
    );
    const minZoom = Math.floor(
      Math.log2(156543.03392804097) - Math.log2(minResolution)
    );

    // Create view with zoom constraints when canZoomOutBoundaries is false
    const view = new View({
      projection: "EPSG:3857",
      ...(canZoomOutBoundaries
        ? {}
        : {
            extent,
            minZoom: Math.max(minZoom - 1, 0), // Subtract 1 to give a little extra room
            constrainOnlyCenter: false,
          }),
    });

    const map = new Map({
      target: mapRef.current,
      layers,
      view,
    });

    // Fit view to the extent on initial load
    view.fit(extent, {
      padding: [50, 50, 50, 50],
      maxZoom: zoom || undefined,
      duration: 0,
    });

    mapInstanceRef.current = map;

    // Set up overlay if enabled
    let updateOverlayPosition: ReturnType<typeof debounce> | null = null;

    if (overlayOptions) {
      try {
        const container = document.createElement("div");
        container.className = "react-ol-choropleth__overlay-container";
        overlayContainerRef.current = container;

        const overlayInstance = new Overlay({
          element: container,
          positioning: overlayOptions.positioning || "bottom-center",
          offset: overlayOptions.offset || [0, -10],
          stopEvent: false,
          className: "react-ol-choropleth__overlay-wrapper",
          autoPan: overlayOptions.autoPan !== false,
        });

        overlayRef.current = overlayInstance;
        map.addOverlay(overlayInstance);

        // Update overlay position on view change with optimized debounce
        updateOverlayPosition = debounce(() => {
          if (selectedFeatureRef.current && overlayRef.current) {
            const geometry = selectedFeatureRef.current.getGeometry();
            if (geometry instanceof Polygon) {
              const extent = geometry.getExtent();
              const position = [(extent[0] + extent[2]) / 2, extent[3]];
              overlayRef.current.setPosition(position);
            }
          }
        }, 150);

        // Only update during interaction end
        map.on("moveend", updateOverlayPosition);
      } catch (error) {
        console.error("Error setting up overlay:", error);
      }
    }

    // Set up click handler
    const clickListener = (event: any) => handleFeatureClick(event, map);
    map.on("click", clickListener);

    // Set up hover handler
    const hoverListener = (event: any) => handleFeatureHover(event, map);
    map.on("pointermove", hoverListener);

    return () => {
      // Clean up all event listeners and timeouts
      if (updateOverlayPosition) {
        updateOverlayPosition.cancel();
        map.un("moveend", updateOverlayPosition);
      }

      map.un("click", clickListener);
      map.un("pointermove", hoverListener);

      if (overlayRef.current) {
        map.removeOverlay(overlayRef.current);
        overlayRef.current = null;
      }
      if (overlayContainerRef.current) {
        overlayContainerRef.current.remove();
        overlayContainerRef.current = null;
      }

      map.dispose();
    };
  }, [
    vectorSource,
    style,
    styleFunction,
    baseMap,
    overlayOptions,
    handleFeatureClick,
    handleFeatureHover,
    zoom,
    canZoomOutBoundaries,
  ]);

  const values = useMemo(() => {
    return features
      .map((feature) => Number(feature.get(valueProperty)))
      .filter((value) => !isNaN(value));
  }, [features, valueProperty]);

  return (
    <div className={`react-ol-choropleth ${className}`.trim()}>
      <div
        ref={mapRef}
        className={`react-ol-choropleth__map ${mapClassName}`.trim()}
      />
      {showLegend && colorScale && values.length > 0 && (
        <Legend
          colorScale={colorScale}
          position={legendPosition}
          values={values}
          className={legendClassName}
        />
      )}
      {overlayContent &&
        overlayContainerRef.current &&
        createPortal(overlayContent, overlayContainerRef.current)}
    </div>
  );
};

export default memo(ChoroplethMap);
