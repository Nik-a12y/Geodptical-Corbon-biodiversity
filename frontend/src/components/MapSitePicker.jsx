import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import * as turf from "@turf/turf";

import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

function geometryFeature(site) {
  const value = site.geometry || site.polygon || site.boundary;
  if (!value) return null;
  const geometry = typeof value === "string" ? JSON.parse(value) : value;
  if (geometry.type === "Feature") return geometry;
  if (["Polygon", "MultiPolygon"].includes(geometry.type)) {
    return { type: "Feature", properties: { siteId: site.id, name: site.name }, geometry };
  }
  return null;
}

export default function MapSitePicker({ sites = [], onPolygonChange }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const onChangeRef = useRef(onPolygonChange);
  useEffect(() => { onChangeRef.current = onPolygonChange; }, [onPolygonChange]);

  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token || !containerRef.current) return undefined;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({ container: containerRef.current, style: "mapbox://styles/mapbox/satellite-streets-v12", center: [78.9629, 20.5937], zoom: 4 });
    const draw = new MapboxDraw({ displayControlsDefault: false, controls: { polygon: true, trash: true } });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(draw, "top-left");
    const publishPolygon = () => {
      const polygon = draw.getAll().features.find((feature) => feature.geometry.type === "Polygon");
      if (!polygon) return onChangeRef.current(null);
      const areaHectares = turf.area(polygon) / 10000;
      const [longitude, latitude] = turf.centroid(polygon).geometry.coordinates;
      onChangeRef.current({ polygon, geometry: polygon.geometry, latitude, longitude, areaHectares });
    };
    map.on("draw.create", publishPolygon);
    map.on("draw.update", publishPolygon);
    map.on("draw.delete", publishPolygon);
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;
    const renderSites = () => {
      const features = [];
      sites.forEach((site) => {
        try {
          const shape = geometryFeature(site);
          if (shape) features.push({ ...shape, properties: { ...shape.properties, siteId: site.id, name: site.name, area: site.area_hectares } });
          else if (Number.isFinite(Number(site.longitude)) && Number.isFinite(Number(site.latitude))) {
            features.push({ type: "Feature", properties: { siteId: site.id, name: site.name, area: site.area_hectares }, geometry: { type: "Point", coordinates: [Number(site.longitude), Number(site.latitude)] } });
          }
        } catch { /* A malformed legacy geometry must not break the map. */ }
      });
      const collection = { type: "FeatureCollection", features };
      const source = map.getSource("sites");
      if (source) source.setData(collection);
      else {
        map.addSource("sites", { type: "geojson", data: collection });
        map.addLayer({ id: "site-polygons-fill", type: "fill", source: "sites", filter: ["==", "$type", "Polygon"], paint: { "fill-color": "#16a36a", "fill-opacity": 0.28 } });
        map.addLayer({ id: "site-polygons-line", type: "line", source: "sites", filter: ["==", "$type", "Polygon"], paint: { "line-color": "#d9ffe9", "line-width": 2 } });
        map.addLayer({ id: "site-points", type: "circle", source: "sites", filter: ["==", "$type", "Point"], paint: { "circle-radius": 7, "circle-color": "#16a36a", "circle-stroke-color": "#fff", "circle-stroke-width": 2 } });
        ["site-polygons-fill", "site-points"].forEach((layer) => map.on("click", layer, (event) => {
          const feature = event.features?.[0];
          if (!feature) return;
          const coordinates = feature.geometry.type === "Point" ? feature.geometry.coordinates : turf.centroid(feature).geometry.coordinates;
          new mapboxgl.Popup().setLngLat(coordinates).setHTML(`<strong>${feature.properties.name}</strong><br/>${feature.properties.area || "Boundary mapped"}`).addTo(map);
        }));
      }
      const bounds = new mapboxgl.LngLatBounds();
      features.forEach((feature) => turf.coordEach(feature, (coord) => bounds.extend(coord)));
      if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 55, maxZoom: 13, duration: 700 });
    };
    if (map.isStyleLoaded()) renderSites(); else map.once("load", renderSites);
    return undefined;
  }, [sites]);

  if (!import.meta.env.VITE_MAPBOX_TOKEN) return <div className="map-unavailable">Mapbox token missing. Add <code>VITE_MAPBOX_TOKEN</code> to <code>.env</code>.</div>;
  return <div ref={containerRef} className="site-map" />;
}
