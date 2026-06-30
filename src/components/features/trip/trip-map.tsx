"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), {
  ssr: false,
  loading: () => <MapSkeleton />,
});
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((m) => m.Polyline), { ssr: false });

interface TripMapProps {
  origin: { lat: number; lng: number; label: string };
  destination?: { lat: number; lng: number; label: string } | null;
  className?: string;
}

function MapSkeleton() {
  return (
    <div className="h-full w-full animate-pulse bg-gray-100" aria-label="Загрузка карты" />
  );
}

async function makeDotIcon(color: string) {
  const L = (await import("leaflet")).default;
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export function TripMap({ origin, destination, className }: TripMapProps) {
  const originPos: LatLngTuple = [origin.lat, origin.lng];
  const destPos: LatLngTuple | null = destination
    ? [destination.lat, destination.lng]
    : null;
  const bounds = useMemo<[LatLngTuple, LatLngTuple] | undefined>(
    () => (destPos ? [originPos, destPos] : undefined),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [origin.lat, origin.lng, destination?.lat, destination?.lng],
  );
  const center: LatLngTuple = destination
    ? [(origin.lat + destination.lat) / 2, (origin.lng + destination.lng) / 2]
    : originPos;

  return (
    <div className={`isolate ${className ?? "h-64 w-full overflow-hidden rounded-2xl border border-ink-200"}`}>
      <MapContainer
        center={center}
        zoom={destination ? 7 : 12}
        bounds={bounds}
        boundsOptions={{ padding: [40, 40] }}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AsyncMarker position={originPos} color="#0D9488" label={origin.label} />
        {destination && destPos && (
          <AsyncMarker position={destPos} color="#F59E0B" label={destination.label} />
        )}
        {bounds && (
          <Polyline
            positions={[bounds[0], bounds[1]]}
            pathOptions={{ color: "#0D9488", weight: 3, dashArray: "6 6" }}
          />
        )}
      </MapContainer>
    </div>
  );
}

function AsyncMarker({
  position,
  color,
  label,
}: {
  position: LatLngTuple;
  color: string;
  label: string;
}) {
  const IconMarker = dynamic(
    async () => {
      const icon = await makeDotIcon(color);
      return function IconMarkerInner() {
        return (
          <Marker position={position} icon={icon}>
            <Popup>{label}</Popup>
          </Marker>
        );
      };
    },
    { ssr: false },
  );
  return <IconMarker />;
}
