import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, TileLayer, useMap } from "react-leaflet";

export type LatLngTuple = [number, number];

interface MapViewProps {
  initialCenter?: LatLngTuple;
  selectedCityCenter?: LatLngTuple;
  targetZoom?: number;
  recenterKey?: number;
  className?: string;
}

const FALLBACK_CENTER: LatLngTuple = [31.7683, 35.2137];

const MapSizeInvalidator = () => {
  const map = useMap();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      map.invalidateSize();
    }, 0);

    const onResize = () => {
      map.invalidateSize();
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);

  return null;
};

const MapCenterSync = ({
  center,
  zoom,
  recenterKey,
}: {
  center: LatLngTuple;
  zoom: number;
  recenterKey?: number;
}) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, recenterKey, map]);

  return null;
};

export const MapView = ({
  initialCenter,
  selectedCityCenter,
  targetZoom = 12,
  recenterKey,
  className,
}: MapViewProps) => {
  const center = selectedCityCenter ?? initialCenter ?? FALLBACK_CENTER;

  const selectedMarker = useMemo<LatLngTuple>(
    () => selectedCityCenter ?? center,
    [selectedCityCenter, center],
  );

  return (
    <div className={`relative h-full w-full ${className ?? ""}`}>
      <MapContainer
        center={center}
        zoom={targetZoom}
        zoomControl
        className="h-full w-full"
        style={{ background: "#e6e6e6" }}
      >
        <MapSizeInvalidator />
        <MapCenterSync
          center={center}
          zoom={targetZoom}
          recenterKey={recenterKey}
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution="&copy; OpenStreetMap contributors &copy; CARTO"
          maxZoom={20}
        />

        <CircleMarker
          center={selectedMarker}
          radius={9}
          pathOptions={{
            color: "#1e5c5a",
            fillColor: "#1e5c5a",
            fillOpacity: 0.9,
            weight: 2,
          }}
        />
      </MapContainer>
    </div>
  );
};
