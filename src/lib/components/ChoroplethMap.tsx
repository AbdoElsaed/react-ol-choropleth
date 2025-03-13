import { useEffect, useRef, useState, useMemo, memo, useCallback } from "react";
import * as ReactDOM from "react-dom/client";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke } from "ol/style";
import type { StyleLike } from "ol/style/Style";
import type {
  ColorScale,
  GeoJSONFeatureCollection,
  OverlayOptions,
  LegendPosition,
} from "../types/map";
import type { FeatureLike } from "ol/Feature";
import useColorScale from "../hooks/useColorScale";
import Legend from "./Legend";
import { Geometry } from "ol/geom";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import chroma from "chroma-js";
import Overlay from "ol/Overlay";
import "../styles/choropleth.css";

const DefaultOverlay = memo(({ feature }: { feature: FeatureLike }) => {
  const properties = feature.getProperties();
  return (
    <div className="react-ol-choropleth__overlay">
      {Object.entries(properties)
        .filter(([key]) => key !== "geometry")
        .map(([key, value]) => (
          <div key={key} className="react-ol-choropleth__overlay-property">
            <strong>{key}:</strong> {String(value)}
          </div>
        ))}
    </div>
  );
});

DefaultOverlay.displayName = "DefaultOverlay";

type BaseChoroplethMapProps = {
  data: FeatureLike[] | GeoJSONFeatureCollection;
  valueProperty: string;
  colorScale: ColorScale;
  style?: Style | StyleLike;
  zoom?: number;
  baseMap?: "osm" | "none";
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
};

interface ExtendedChoroplethMapProps extends BaseChoroplethMapProps {
  className?: string;
  mapClassName?: string;
  legendClassName?: string;
}

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
  },
  zoomToFeature = false,
  selectedFeatureBorderColor = "#0099ff",
  className = "",
  mapClassName = "",
  legendClassName = "",
}: ExtendedChoroplethMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null);
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
  const initialFitRef = useRef<boolean>(false);
  const selectedFeatureRef = useRef<FeatureLike | null>(null);
  const vectorLayerRef = useRef<VectorLayer<
    VectorSource<Feature<Geometry>>
  > | null>(null);
  const overlayRef = useRef<{ instance: Overlay | null; root: any | null }>({
    instance: null,
    root: null,
  });

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
      const selectedColor = chroma(selectedFeatureBorderColor).rgb();

      return new Style({
        fill: new Fill({
          color: [...rgb, 0.8],
        }),
        stroke: new Stroke({
          color: isSelected ? [...selectedColor, 1] : [61, 61, 61, 1],
          width: isSelected ? 3 : 1,
        }),
      });
    },
    [getColor, valueProperty, selectedFeatureBorderColor]
  );

  // Handle feature click
  const handleFeatureClick = useCallback(
    (event: any, map: Map) => {
      const clickedFeature = map.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature
      );

      // Update selected feature
      selectedFeatureRef.current = clickedFeature || null;

      if (clickedFeature) {
        const geometry = clickedFeature.getGeometry();
        if (geometry instanceof Polygon) {
          const centroid = geometry.getInteriorPoint().getCoordinates();

          if (overlayRef.current.instance && overlayOptions) {
            try {
              const content = overlayOptions.render ? (
                overlayOptions.render(clickedFeature)
              ) : (
                <DefaultOverlay feature={clickedFeature} />
              );

              // Create or update overlay content
              if (!overlayRef.current.root) {
                const container = document.createElement("div");
                container.className = "react-ol-choropleth__overlay-container";
                overlayRef.current.root = ReactDOM.createRoot(container);
                overlayRef.current.instance.setElement(container);
              }

              // Render content
              overlayRef.current.root.render(content);
              overlayRef.current.instance.setPosition(centroid);
            } catch (error) {
              console.error("Error updating overlay:", error);
              // Hide overlay on error
              overlayRef.current.instance.setPosition(undefined);
            }
          }

          if (onFeatureClick) {
            onFeatureClick(clickedFeature, centroid as [number, number]);
          }

          if (zoomToFeature && mapInstanceRef.current) {
            const view = mapInstanceRef.current.getView();
            const extent = geometry.getExtent();
            const resolution = view.getResolutionForExtent(
              extent,
              mapInstanceRef.current.getSize() || undefined
            );
            const zoom = view.getZoomForResolution(resolution || 1);

            view.animate({
              center: centroid,
              zoom: zoom ? Math.min(zoom + 0.5, 6) : 6,
              duration: 500,
            });
          }
        }
      } else {
        // Hide overlay when no feature is selected
        if (overlayRef.current.instance) {
          overlayRef.current.instance.setPosition(undefined);
        }
        if (onFeatureClick) {
          onFeatureClick(null);
        }
      }

      // Force vector layer to refresh styles
      if (vectorLayerRef.current) {
        vectorLayerRef.current.changed();
      }
    },
    [onFeatureClick, zoomToFeature, overlayOptions]
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

    const layers = [
      ...(baseMap === "osm" ? [new TileLayer({ source: new OSM() })] : []),
      vectorLayer,
    ];

    const view = new View({
      zoom,
      center: [-10997148, 4569099],
      projection: "EPSG:3857",
    });

    const map = new Map({
      target: mapRef.current,
      layers,
      view,
    });

    // Only fit the view to the extent once on initial load
    if (!initialFitRef.current) {
      const extent = vectorSource.getExtent();
      view.fit(extent, {
        padding: [50, 50, 50, 50],
        duration: 0,
      });
      initialFitRef.current = true;
    }

    mapInstanceRef.current = map;

    // Set up overlay if enabled
    if (overlayOptions) {
      try {
        const container = document.createElement("div");
        container.className = "react-ol-choropleth__overlay-container";

        const overlayInstance = new Overlay({
          element: container,
          positioning: overlayOptions.positioning || "bottom-center",
          offset: overlayOptions.offset || [0, -10],
          stopEvent: false,
          className: "react-ol-choropleth__overlay-wrapper",
          autoPan: overlayOptions.autoPan !== false,
        });

        overlayRef.current.instance = overlayInstance;
        map.addOverlay(overlayInstance);
      } catch (error) {
        console.error("Error setting up overlay:", error);
      }
    }

    // Set up click handler
    const clickListener = (event: any) => handleFeatureClick(event, map);
    map.on("click", clickListener);

    if (onFeatureHover) {
      map.on("pointermove", (event) => {
        const feature = map.forEachFeatureAtPixel(
          event.pixel,
          (feature) => feature
        );
        onFeatureHover(feature || null);
      });
    }

    return () => {
      try {
        // Cleanup React root if it exists
        if (overlayRef.current.root) {
          overlayRef.current.root.unmount();
        }

        map.un("click", clickListener);
        if (onFeatureHover) {
          map.un("pointermove", (event) => {
            const feature = map.forEachFeatureAtPixel(
              event.pixel,
              (feature) => feature
            );
            onFeatureHover(feature || null);
          });
        }
        if (overlayRef.current.instance) {
          map.removeOverlay(overlayRef.current.instance);
        }
        map.dispose();
      } catch (error) {
        console.error("Error cleaning up map:", error);
      } finally {
        initialFitRef.current = false;
        selectedFeatureRef.current = null;
        vectorLayerRef.current = null;
        mapInstanceRef.current = null;
        overlayRef.current = { instance: null, root: null };
      }
    };
  }, [
    vectorSource,
    style,
    styleFunction,
    baseMap,
    handleFeatureClick,
    onFeatureHover,
    zoom,
    overlayOptions,
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
    </div>
  );
};

export default memo(ChoroplethMap);
