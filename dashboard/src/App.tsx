import React, { useEffect, useState, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import './App.css';

interface LocationMessage {
  latitude: number;
  longitude: number;
  timestamp: number;
}

// 마커 아이콘 기본값 문제 해결용 (leaflet 기본 아이콘 경로 지정)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// 지도 센터 이동 컴포넌트
function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [lat, lng, map]);
  return null;
}

export default function App() {
  const [positions, setPositions] = useState<[number, number][]>([]);

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("WebSocket connected");

        stompClient.subscribe("/topic/vehicle", (message) => {
          const locationList: LocationMessage[] = JSON.parse(message.body);
          console.log("📡 차량 위치 리스트 수신:", locationList);
          // 가장 최신 위치 하나만 가져온다고 가정
          if (locationList.length > 0) {
            const latest = locationList[locationList.length - 1];
            setPositions((prev) => [...prev, [latest.latitude, latest.longitude]]);
          }
        });
      },
      onStompError: (frame) => {
        console.error("STOMP error", frame);
      },
    });

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, []);

  // 초기 위치 (예: 서울)
  const defaultCenter: [number, number] = [37.5665, 126.978];

  const currentPos = positions.length > 0 ? positions[positions.length - 1] : defaultCenter;

  return (
    <>
      <div>🚗 차량 위치 WebSocket 테스트 중...</div>

      <MapContainer center={defaultCenter} zoom={13} style={{ height: "80vh", width: "100%" }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 이동 경로 */}
        <Polyline positions={positions} pathOptions={{ color: 'blue', className: "draw-line" }} />

        {/* 현재 위치 마커 */}
        <Marker position={currentPos} />

        {/* 마커 따라 지도 센터 이동 */}
        <Recenter lat={currentPos[0]} lng={currentPos[1]} />
      </MapContainer>
    </>
  );
}