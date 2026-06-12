import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

const userIcon = L.divIcon({
  className: "",
  html: `<div style="
    width: 22px; height: 22px;
    background: #f5c842;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
  "></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  popupAnchor: [0, -14],
});

const barberIcon = L.divIcon({
  className: "",
  html: `<div style="position:relative;width:36px;height:42px;">
    <div style="
      width: 36px; height: 36px;
      background: #1a1a2e;
      border: 3px solid #f5c842;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 3px 10px rgba(0,0,0,0.4);
    "></div>
    <span style="
      position:absolute; top:6px; left:0; width:36px;
      text-align:center; font-size:14px; transform:rotate(0deg);
    ">✂️</span>
  </div>`,
  iconSize: [36, 42],
  iconAnchor: [18, 42],
  popupAnchor: [0, -44],
});

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [map, positions]);
  return null;
}

function haversineDistance(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number]
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

type Barber = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
};

type Props = {
  userLocation: [number, number];
  barbers: Barber[];
};

export default function BarberMap({ userLocation, barbers }: Props) {
  const allPositions: [number, number][] = [
    userLocation,
    ...barbers.map((b): [number, number] => [b.latitude, b.longitude]),
  ];

  const barbersWithDistance = barbers
    .map((b) => ({
      ...b,
      distance: haversineDistance(userLocation, [b.latitude, b.longitude]),
    }))
    .sort((a, b) => a.distance - b.distance);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Peta OpenStreetMap */}
      <MapContainer
        center={userLocation}
        zoom={13}
        style={{ height: "480px", width: "100%", borderRadius: "12px" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
        />

        <FitBounds positions={allPositions} />

        <Marker position={userLocation} icon={userIcon}>
          <Popup>
            <strong>📍 Lokasi Anda</strong>
          </Popup>
        </Marker>

        {barbersWithDistance.map((barber) => (
          <Marker
            key={barber.id}
            position={[barber.latitude, barber.longitude]}
            icon={barberIcon}
          >
            <Popup>
              <div style={{ textAlign: "center", minWidth: "120px" }}>
                <strong>✂️ {barber.name}</strong>
                <br />
                <span style={{ fontSize: "0.8rem", color: "#666" }}>
                  {barber.distance.toFixed(1)} km dari lokasi Anda
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div>
        <h3 style={{
          fontSize: "1.1rem",
          fontWeight: 700,
          marginBottom: "0.75rem",
          color: "var(--text-primary, #1a1a2e)",
        }}>
          📌 Barber Terdekat
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          {barbersWithDistance.map((barber, idx) => (
            <div
              key={barber.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                background: idx === 0 ? "rgba(245,200,66,0.12)" : "#f9f9f9",
                border: idx === 0 ? "1.5px solid #f5c842" : "1.5px solid #eee",
                borderRadius: "12px",
                padding: "0.75rem 1rem",
              }}
            >
              <div style={{
                width: 38, height: 38,
                background: idx === 0 ? "#f5c842" : "#e0e0e0",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: idx === 0 ? "#fff" : "#666",
                flexShrink: 0,
              }}>
                {idx + 1}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: 2, fontSize: "0.95rem", color: "#1a1a2e" }}>
                  ✂️ {barber.name}
                </p>
                <p style={{ fontSize: "0.82rem", color: "#888", margin: 0 }}>
                  {barber.distance.toFixed(2)} km dari lokasi Anda
                </p>
              </div>
              {idx === 0 && (
                <span style={{
                  background: "#f5c842",
                  color: "#fff",
                  borderRadius: "20px",
                  padding: "2px 10px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  Terdekat
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}