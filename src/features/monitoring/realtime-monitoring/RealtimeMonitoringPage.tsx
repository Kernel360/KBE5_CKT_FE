import React, { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_LAT = 37.5665;
const DEFAULT_LON = 126.978;
const DEFAULT_ZOOM_LEVEL = 12;
const OVERLAY_X_ANCHOR = 0.5;
const OVERLAY_Y_ANCHOR = 1.5;
const OVERLAY_Z_INDEX = 100;
const FOCUSED_ZOOM_LEVEL = 3;
const GPS_COORDINATE_SCALE = 1_000_000;

import SearchIcon from '@/assets/icons/ic-search.svg?react';

import { DashboardContainer, TitleContainer } from '@/components/layout/DashboardLayout.styles';
import { StatCard } from '@/components/ui/card/StatCard';
import { TextInput } from '@/components/ui/input/input/TextInput';

import {
  ContentContainer,
  ContentWrap,
  FilterWrap,
  HeaderContainer,
  MapWrap,
  VehicleList,
} from './RealtimeMonitoringPage.styles';
import { Text } from '@/components/ui/text/Text';
import VehicleCard from './VehicleCard';
import api from '@/libs/axios';

import { useSse } from './useSse';

interface Vehicle {
  vehicleId: number;
  registrationNumber: string;
  manufacturer: string;
  modelName: string;
  customerName: string;
  lat: string | null;
  lon: string | null;
  ang: string | null;
  stolen: boolean;
}

const VEHICLE_REFRESH_INTERVAL = Number(import.meta.env.VITE_VEHICLE_REFRESH_INTERVAL || 60000);

const RealtimeMonitoringPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState({ total: 0, running: 0, stolen: 0, stopped: 0 });
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const kakaoMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);

  const handleGpsUpdate = useCallback(data => {
    const kakao = (window as any).kakao;
    if (!kakao || !kakao.maps || !data?.mdn || !data?.lat || !data?.lon) return;

    const lat = Number(data.lat) / GPS_COORDINATE_SCALE;
    const lon = Number(data.lon) / GPS_COORDINATE_SCALE;

    // 차량 번호(mdn) 기준으로 기존 마커 찾기
    const existingMarker = markersRef.current.find(marker => marker.getTitle?.() === data.mdn);
    if (existingMarker) {
      existingMarker.setPosition(new kakao.maps.LatLng(lat, lon));
    } else {
      const newMarker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(lat, lon),
        title: data.mdn,
        image: new kakao.maps.MarkerImage('/icon/marker.svg', new kakao.maps.Size(32, 32), {
          offset: new kakao.maps.Point(16, 32),
        }),
        map: kakaoMapRef.current,
      });
      markersRef.current.push(newMarker);
    }
  }, []);

  // useSse 훅을 사용하여 SSE 연결 관리
  useSse('gps-update', handleGpsUpdate);

  const filterVehicles = useCallback(
    (value: string) => {
      if (value.length === 0) {
        return vehicles;
      }
      return vehicles.filter(vehicle => vehicle.registrationNumber.toLowerCase().includes(value.toLowerCase()));
    },
    [vehicles]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      setFilteredVehicles(filterVehicles(value));
    },
    [vehicles, filterVehicles]
  );

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/tracking/vehicles/location');
      if (response.data.code === '000' && Array.isArray(response.data.data)) {
        setVehicles(response.data.data);
        setFilteredVehicles(response.data.data);

        const runningCount = (response.data.data ?? []).length;
        setStatus({
          total: status.total,
          running: runningCount,
          stolen: status.stolen,
          stopped: status.total - runningCount - status.stolen,
        });
      } else {
        setVehicles([]);
      }
    } catch (error) {
      console.error('차량 정보 조회 실패:', error);
      setVehicles([]);
    }
  }, []);

  // 차량 정보 주기적 업데이트
  useEffect(() => {
    fetchVehicles();
    const interval = setInterval(fetchVehicles, VEHICLE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchVehicles]);

  // 차량 상태 주기적 업데이트
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get('/api/v1/tracking/status');
        if (response.data.code === '000' && response.data.data) {
          setStatus(response.data.data);
        }
      } catch (error) {
        setStatus({ total: 0, running: 0, stolen: 0, stopped: 0 });
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, VEHICLE_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // 카카오맵 로드 및 마커 표시
  useEffect(() => {
    const checkKakaoAndLoad = () => {
      const kakao = (window as any).kakao;
      if (kakao && kakao.maps && kakao.maps.load) {
        kakao.maps.load(() => {
          initMap();
        });
      } else {
        setTimeout(checkKakaoAndLoad, 100);
      }
    };
    checkKakaoAndLoad();
  }, [filteredVehicles]);

  const initMap = () => {
    if (!mapRef.current) return;
    // 기존 마커 제거
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    if (infoWindowRef.current) {
      if (typeof infoWindowRef.current.close === 'function') {
        infoWindowRef.current.close();
      } else if (typeof infoWindowRef.current.setMap === 'function') {
        infoWindowRef.current.setMap(null);
      }
      infoWindowRef.current = null;
    }
    const kakao = (window as any).kakao;
    if (!kakao || !kakao.maps) return;
    // 지도 생성
    if (!kakaoMapRef.current) {
      kakaoMapRef.current = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(DEFAULT_LAT, DEFAULT_LON),
        level: DEFAULT_ZOOM_LEVEL,
      });
    }
    const map = kakaoMapRef.current;
    // 클러스터러 생성(최초 1회만)
    if (!clustererRef.current) {
      clustererRef.current = new kakao.maps.MarkerClusterer({
        map: map,
        averageCenter: true,
        minLevel: 10,
      });
    }
    const clusterer = clustererRef.current;
    clusterer.clear(); // 기존 클러스터링 마커 제거
    // 마커 생성 및 클러스터러에 추가
    const markers = filteredVehicles
      .filter(vehicle => vehicle.lat && vehicle.lon)
      .map(vehicle => {
        const lat = Number(vehicle.lat);
        const lon = Number(vehicle.lon);
        const vehicleData = vehicles.find(v => v.vehicleId === vehicle.vehicleId);
        const isStolen = vehicleData?.stolen ?? false;

        const markerImagePath = isStolen ? '/icon/stolenCar.svg' : '/icon/marker.svg';
        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(lat, lon),
          image: new kakao.maps.MarkerImage(markerImagePath, new kakao.maps.Size(32, 32), {
            offset: new kakao.maps.Point(16, 32),
          }),
        });
        // 커스텀 오버레이 (인포윈도우 대체)
        const contentHTML = `
          <div style="
            font-family: 'sans-serif';
            min-width: 150px;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            padding: 12px 16px;
            color: #222;
            font-size: 14px;
          ">
            <div style="font-weight:700;display:flex;align-items:center;gap:6px;">
              <img src='/icon/marker.svg' width='14' height='14' alt='icon'/>
              <span>${vehicle.registrationNumber}</span>
            </div>
            <div style="margin-top:8px;font-size:12px;color:#6b7280;">
              <div style="display:flex;justify-content:space-between;">
                <span>차량 모델</span>
                <span style="color:#111;">${vehicle.manufacturer} ${vehicle.modelName}</span>
              </div>
              ${
                vehicle.customerName
                  ? `
                <div style="display:flex;justify-content:space-between;">
                  <span>고객명</span>
                  <span style="color:#111;">${vehicle.customerName}</span>
                </div>`
                  : ''
              }
            </div>
          </div>
        `;
        const overlay = new kakao.maps.CustomOverlay({
          content: contentHTML,
          position: new kakao.maps.LatLng(lat, lon),
          xAnchor: OVERLAY_X_ANCHOR,
          yAnchor: OVERLAY_Y_ANCHOR,
          zIndex: OVERLAY_Z_INDEX,
        });
        kakao.maps.event.addListener(marker, 'click', function () {
          if (infoWindowRef.current) {
            infoWindowRef.current.setMap(null);
          }
          map.setLevel(FOCUSED_ZOOM_LEVEL);
          map.setCenter(new kakao.maps.LatLng(lat, lon));
          overlay.setMap(map);
          infoWindowRef.current = overlay;
          setSelectedVehicle(vehicle);
        });
        return marker;
      });

    clusterer.addMarkers(markers);

    markersRef.current = markers;
  };

  const handleVehicleClick = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    if (vehicle.lat && vehicle.lon && kakaoMapRef.current) {
      const kakao = (window as any).kakao;
      if (kakao && kakao.maps) {
        const lat = Number(vehicle.lat);
        const lon = Number(vehicle.lon);
        kakaoMapRef.current.setCenter(new kakao.maps.LatLng(lat, lon));
        kakaoMapRef.current.setLevel(3);
      }
    }
  }, []);

  return (
    <DashboardContainer>
      <TitleContainer>
        <Text type="heading">실시간 관제</Text>
      </TitleContainer>

      <HeaderContainer>
        <StatCard label="전체 차량" count={status.total} unit="대" unitColor="blue" />
        <StatCard label="운행중 차량" count={status.running} unit="대" unitColor="green" />
        <StatCard label="미예약 차량" count={status.stolen} unit="대" unitColor="red" />
        <StatCard label="미운행 차량" count={status.stopped} unit="대" unitColor="yellow" />
      </HeaderContainer>

      <ContentContainer>
        <ContentWrap>
          <FilterWrap>
            <TextInput
              type="text"
              id="search-vehicle"
              placeholder="차량번호 검색 (예: 12가 3456)"
              icon={<SearchIcon />}
              value={search}
              onChange={handleSearchChange}
            />
            <Text type="subheading2">운행 중인 차량 목록</Text>
            <VehicleList>
              {filteredVehicles.map((vehicle, idx) => (
                <VehicleCard
                  key={`${vehicle.vehicleId}-${idx}`}
                  id={vehicle.vehicleId}
                  licensePlate={vehicle.registrationNumber}
                  carInfo={`${vehicle.manufacturer} ${vehicle.modelName}${vehicle.customerName ? ' | ' + vehicle.customerName : ''}`}
                  onClick={() => handleVehicleClick(vehicle)}
                  isSelected={selectedVehicle?.vehicleId === vehicle.vehicleId}
                />
              ))}
            </VehicleList>
          </FilterWrap>
          <MapWrap>
            <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
          </MapWrap>
        </ContentWrap>
      </ContentContainer>
    </DashboardContainer>
  );
};

export default RealtimeMonitoringPage;
