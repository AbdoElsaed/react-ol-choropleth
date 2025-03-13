import { useEffect, useRef, useState, useMemo, memo, useCallback } from "react";
import { createPortal } from "react-dom";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import XYZ from "ol/source/XYZ";
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
import ReactDOMServer from "react-dom/server";
import { ReactElement } from "react";

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
  const overlayRef = useRef<Overlay | null>(null);
  const overlayContainerRef = useRef<HTMLDivElement | null>(null);
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
  const selectedFeatureRef = useRef<FeatureLike | null>(null);
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

      selectedFeatureRef.current = clickedFeature || null;

      if (clickedFeature) {
        const geometry = clickedFeature.getGeometry();
        if (
          geometry instanceof Polygon &&
          overlayRef.current &&
          overlayContainerRef.current &&
          overlayOptions
        ) {
          try {
            // Set overlay content using React
            const content = overlayOptions.render
              ? overlayOptions.render(clickedFeature)
              : generateOverlayContent(clickedFeature);

            setOverlayContent(content);

            // Get the top center coordinate of the feature
            const extent = geometry.getExtent();
            const position = [(extent[0] + extent[2]) / 2, extent[3]];

            // Set position after content update
            requestAnimationFrame(() => {
              if (overlayRef.current) {
                overlayRef.current.setPosition(position);
              }
            });

            if (onFeatureClick) {
              onFeatureClick(clickedFeature, position as [number, number]);
            }

            if (zoomToFeature && mapInstanceRef.current) {
              const view = mapInstanceRef.current.getView();
              const resolution = view.getResolutionForExtent(
                extent,
                mapInstanceRef.current.getSize() || undefined
              );
              const zoom = view.getZoomForResolution(resolution || 1);

              view.animate({
                center: position,
                zoom: zoom ? Math.min(zoom + 0.5, 6) : 6,
                duration: 500,
              });
            }
          } catch (error) {
            console.error("Error updating overlay:", error);
            overlayRef.current.setPosition(undefined);
            setOverlayContent(null);
          }
        }
      } else {
        // Hide overlay when no feature is selected
        if (overlayRef.current) {
          overlayRef.current.setPosition(undefined);
          setOverlayContent(null);
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

    const view = new View({
      projection: "EPSG:3857",
    });

    const map = new Map({
      target: mapRef.current,
      layers,
      view,
    });

    // Fit view to the extent on initial load
    const extent = vectorSource.getExtent();
    view.fit(extent, {
      padding: [50, 50, 50, 50],
      maxZoom: zoom || undefined,
      duration: 0,
    });

    mapInstanceRef.current = map;

    // Set up overlay if enabled
    if (overlayOptions) {
      try {
        const container = document.createElement("div");
        container.className = "react-ol-choropleth__overlay-container";
        overlayContainerRef.current = container;

        const overlayInstance = new Overlay({
          element: container,
          positioning: "center-center",
          offset: [0, 0],
          stopEvent: false,
          className: "react-ol-choropleth__overlay-wrapper",
          autoPan: overlayOptions.autoPan !== false,
        });

        overlayRef.current = overlayInstance;
        map.addOverlay(overlayInstance);

        // Update overlay position on view change
        const updateOverlayPosition = () => {
          if (selectedFeatureRef.current) {
            const geometry = selectedFeatureRef.current.getGeometry();
            if (geometry instanceof Polygon) {
              const extent = geometry.getExtent();
              const position = [(extent[0] + extent[2]) / 2, extent[3]];
              requestAnimationFrame(() => {
                overlayInstance.setPosition(position);
              });
            }
          }
        };

        view.on("change:resolution", updateOverlayPosition);
        view.on("change:center", updateOverlayPosition);
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
        if (overlayRef.current) {
          map.removeOverlay(overlayRef.current);
        }
        overlayRef.current = null;
        overlayContainerRef.current = null;
        map.dispose();
      } catch (error) {
        console.error("Error cleaning up map:", error);
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
      {overlayContent &&
        overlayContainerRef.current &&
        createPortal(overlayContent, overlayContainerRef.current)}
    </div>
  );
};

export default memo(ChoroplethMap);
