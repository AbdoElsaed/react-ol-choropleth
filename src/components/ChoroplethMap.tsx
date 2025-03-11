import { useEffect, useRef, useState, useMemo } from "react";
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
}: ChoroplethMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<Map | null>(null);
  const vectorSourceRef = useRef<VectorSource<Feature<Geometry>> | null>(null);
  const [features, setFeatures] = useState<Feature<Geometry>[]>([]);
  const initialFitRef = useRef<boolean>(false);

  // Create vector source only when data changes
  const vectorSource = useMemo(() => {
    console.log("Data received:", data);
    const source = new VectorSource<Feature<Geometry>>({
      features: new GeoJSON().readFeatures(data, {
        featureProjection: "EPSG:3857",
        dataProjection: "EPSG:4326",
      }) as Feature<Geometry>[],
    });
    const loadedFeatures = source.getFeatures();
    console.log(
      "Loaded features:",
      loadedFeatures.map((f) => ({
        properties: f.getProperties(),
        [valueProperty]: f.get(valueProperty),
      }))
    );
    vectorSourceRef.current = source;
    setFeatures(loadedFeatures);
    return source;
  }, [data, valueProperty]);

  const getColor = useColorScale({ data: features, valueProperty, colorScale });

  // Create style function
  const defaultStyle = useMemo(() => {
    return (feature: FeatureLike) => {
      const value = feature.get(valueProperty);
      const color = getColor(Number(value));

      // Convert hex to rgba
      const rgb = color === "#cccccc" ? [204, 204, 204] : chroma(color).rgb();

      return new Style({
        fill: new Fill({
          color: [...rgb, 0.8], // Add alpha channel
        }),
        stroke: new Stroke({
          color: [61, 61, 61, 1],
          width: 1,
        }),
      });
    };
  }, [getColor, valueProperty]);

  // Effect for initial map setup
  useEffect(() => {
    if (!mapRef.current || !vectorSource) return;

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: style || defaultStyle,
    });

    const layers = [
      ...(baseMap === "osm" ? [new TileLayer({ source: new OSM() })] : []),
      vectorLayer,
    ];

    const view = new View({
      zoom,
      center: [-10997148, 4569099], // Roughly centers on the US
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
        duration: 0, // Disable animation for initial fit
      });
      initialFitRef.current = true;
    }

    mapInstanceRef.current = map;

    if (onFeatureClick) {
      map.on("click", (event) => {
        const feature = map.forEachFeatureAtPixel(
          event.pixel,
          (feature) => feature
        );
        if (feature) {
          onFeatureClick(feature);
        }
      });
    }

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
      map.dispose();
      initialFitRef.current = false;
    };
  }, [
    vectorSource,
    style,
    defaultStyle,
    baseMap,
    onFeatureClick,
    onFeatureHover,
    zoom,
  ]);

  // Separate effect for handling zoom changes
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

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
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

export default ChoroplethMap;
