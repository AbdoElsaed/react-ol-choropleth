import { useEffect, useRef, useState, useMemo, memo, useCallback } from "react";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import OSM from "ol/source/OSM";
import GeoJSON from "ol/format/GeoJSON";
import { Style, Fill, Stroke } from "ol/style";
import type { ChoroplethMapProps } from "../types/map";
import type { FeatureLike } from "ol/Feature";
import useColorScale from "../hooks/useColorScale";
import Legend from "./Legend";
import { Geometry } from "ol/geom";
import Feature from "ol/Feature";
import chroma from "chroma-js";
import Overlay from "ol/Overlay";

const DefaultOverlay = memo(({ feature }: { feature: FeatureLike }) => {
  const properties = feature.getProperties();
  return (
    <div className="feature-overlay">
      <div className="feature-overlay-header">
        <h3>Feature Properties</h3>
      </div>
      <div className="feature-overlay-content">
        {Object.entries(properties)
          .filter(([key]) => key !== "geometry")
          .map(([key, value]) => (
            <div key={key} className="property-row">
              <strong>{key}:</strong> {String(value)}
            </div>
          ))}
      </div>
    </div>
  );
});

DefaultOverlay.displayName = "DefaultOverlay";

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
    autoPanDuration: 500,
  },
  zoomToFeature = false,
  selectedFeatureBorderColor = "#0099ff",
}: ChoroplethMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null);
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
  const initialFitRef = useRef<boolean>(false);
  const selectedFeatureRef = useRef<FeatureLike | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<FeatureLike | null>(
    null
  );
  const vectorLayerRef = useRef<VectorLayer<
    VectorSource<Feature<Geometry>>
  > | null>(null);

  // Create and manage overlay instance
  const overlay = useMemo(() => {
    if (!overlayOptions || !overlayRef.current) return null;

    return new Overlay({
      element: overlayRef.current,
      positioning: overlayOptions.positioning || "bottom-center",
      offset: overlayOptions.offset || [0, -10],
      stopEvent: true,
    });
  }, [overlayOptions]);

  // Create vector source only when data changes
  const vectorSource = useMemo(() => {
    const source = new VectorSource<Feature<Geometry>>({
      features: new GeoJSON().readFeatures(data, {
        featureProjection: "EPSG:3857",
        dataProjection: "EPSG:4326",
      }) as Feature<Geometry>[],
    });
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
          width: isSelected ? 4 : 1,
        }),
      });
    },
    [getColor, valueProperty, selectedFeatureBorderColor]
  );

  // Handle feature click
  const handleFeatureClick = useCallback(
    (event: any, map: Map) => {
      const feature = map.forEachFeatureAtPixel(
        event.pixel,
        (feature) => feature
      );

      if (feature && overlay) {
        const geometry = feature.getGeometry();
        if (geometry) {
          const extent = geometry.getExtent();
          const centerCoordinate: [number, number] = [
            (extent[0] + extent[2]) / 2,
            (extent[1] + extent[3]) / 2,
          ];

          overlay.setPosition(centerCoordinate);
          selectedFeatureRef.current = feature;
          setSelectedFeature(feature);

          // Force redraw of the vector layer to update styles
          if (vectorLayerRef.current) {
            vectorLayerRef.current.changed();
          }

          if (onFeatureClick) {
            onFeatureClick(feature, centerCoordinate);
          }

          // Only zoom/fit to feature if the flag is true
          if (zoomToFeature) {
            map.getView().fit(extent, {
              padding: [100, 100, 100, 100],
              duration: 1000,
              maxZoom: 8,
            });
          }
        }
      } else {
        if (overlay) {
          overlay.setPosition(undefined);
          selectedFeatureRef.current = null;
          setSelectedFeature(null);

          // Force redraw of the vector layer to update styles
          if (vectorLayerRef.current) {
            vectorLayerRef.current.changed();
          }
        }
        if (onFeatureClick) {
          onFeatureClick(null, [0, 0]);
        }
      }
    },
    [overlay, onFeatureClick, zoomToFeature]
  );

  // Effect for initial map setup
  useEffect(() => {
    if (!mapRef.current || !vectorSource) return;

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: style || styleFunction,
    });
    vectorLayerRef.current = vectorLayer;

    const layers = [
      ...(baseMap === "osm" ? [new TileLayer({ source: new OSM() })] : []),
      vectorLayer,
    ];

    const view = new View({
      zoom,
      center: [-10997148, 4569099],
    });

    const map = new Map({
      target: mapRef.current,
      layers,
      view,
      overlays: overlay ? [overlay] : undefined,
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
      map.un("click", clickListener);
      map.dispose();
      initialFitRef.current = false;
    };
  }, [
    vectorSource,
    style,
    styleFunction,
    baseMap,
    handleFeatureClick,
    onFeatureHover,
    zoom,
    overlay,
  ]);

  // Update zoom when it changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      const view = mapInstanceRef.current.getView();
      view.setZoom(zoom);
    }
  }, [zoom]);

  const values = useMemo(() => {
    return features
      .map((feature) => Number(feature.get(valueProperty)))
      .filter((value) => !isNaN(value));
  }, [features, valueProperty]);

  const overlayContent = useMemo(() => {
    if (!overlayOptions || !selectedFeature) return null;
    return overlayOptions.render ? (
      overlayOptions.render(selectedFeature)
    ) : (
      <DefaultOverlay feature={selectedFeature} />
    );
  }, [overlayOptions, selectedFeature]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      {overlayOptions && (
        <div ref={overlayRef} className="ol-overlay-container">
          {overlayContent}
        </div>
      )}
      {showLegend && colorScale && values.length > 0 && (
        <Legend
          colorScale={colorScale}
          position={legendPosition}
          values={values}
        />
      )}
    </div>
  );
};

export default memo(ChoroplethMap);
