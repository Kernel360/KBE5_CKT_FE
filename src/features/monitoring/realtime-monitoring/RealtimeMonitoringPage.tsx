import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import SearchIcon from '@/assets/icons/ic-search.svg?react';

import { DashboardContainer } from '@/components/layout/DashboardLayout.styles';
import { StatCard } from '@/components/ui/card/StatCard';
import { BasicButton } from '@/components/ui/button/BasicButton';
import { TextInput } from '@/components/ui/input/input/TextInput';

import {
  ContentContainer,
  ContentWrap,
  FilterWrap,
  HeaderContainer,
  MapWrap,
  TitleWrap,
  VehicleList,
} from './RealtimeMonitoringPage.styles';
import { Text } from '@/components/ui/text/Text';
import VehicleCard from './VehicleCard';
import api from '@/libs/axios';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Vehicle {
  vehicleId: number;
  registrationNumber: string;
  manufacturer: string;
  modelName: string;
  customerName: string;
  lat: string | null;
  lon: string | null;
  ang: string | null;
  spd: string | null;
}

const VEHICLE_REFRESH_INTERVAL = Number(import.meta.env.VITE_VEHICLE_REFRESH_INTERVAL || 60000);

const RealtimeMonitoringPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState({ total: 0, running: 0, stopped: 0 });

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      setFilteredVehicles(filterVehicles(value));
    },
    [vehicles]
  );

  const filterVehicles = useCallback(
    (value: string) => {
      if (value.length === 0) {
        return vehicles;
      }
      return vehicles.filter(vehicle => vehicle.registrationNumber.toLowerCase().includes(value.toLowerCase()));
    },
    [vehicles]
  );

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/tracking/vehicles/location');
      if (response.data.code === '000' && Array.isArray(response.data.data)) {
        setVehicles(response.data.data);
        setFilteredVehicles(response.data.data);
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

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await api.get('/api/v1/tracking/status');
        if (response.data.code === '000' && response.data.data) {
          setStatus(response.data.data);
        }
      } catch (error) {
        setStatus({ total: 0, running: 0, stopped: 0 });
      }
    };
    fetchStatus();
  }, []);

  return (
    <DashboardContainer>
      <HeaderContainer>
        <StatCard label="전체 차량" count={status.total} unit="대" unitColor="blue" />
        <StatCard label="운행중 차량" count={status.running} unit="대" unitColor="green" />
        <StatCard label="미운행 차량" count={status.stopped} unit="대" unitColor="yellow" />
        <StatCard label="미관제 차량" count={12} unit="대" unitColor="red" />
      </HeaderContainer>

      <ContentContainer>
        <TitleWrap>
          <BasicButton onClick={() => {}}>경로 보기</BasicButton>
        </TitleWrap>

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
                  licensePlate={vehicle.registrationNumber}
                  carInfo={`${vehicle.manufacturer} ${vehicle.modelName} | ${vehicle.customerName}`}
                />
              ))}
            </VehicleList>
          </FilterWrap>
          <MapWrap>
            <MapContainer center={[37.5665, 126.978]} zoom={12} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {filteredVehicles.map(vehicle => {
                if (vehicle.lat && vehicle.lon) {
                  const lat = Number(vehicle.lat) / 1000000;
                  const lon = Number(vehicle.lon) / 1000000;
                  return (
                    <Marker key={vehicle.vehicleId} position={[lat, lon]}>
                      <Popup>
                        <div>
                          <p>차량번호: {vehicle.registrationNumber}</p>
                          <p>
                            모델: {vehicle.manufacturer} {vehicle.modelName}
                          </p>
                          <p>고객명: {vehicle.customerName}</p>
                          {vehicle.spd && <p>속도: {vehicle.spd} km/h</p>}
                        </div>
                      </Popup>
                    </Marker>
                  );
                }
                return null;
              })}
            </MapContainer>
          </MapWrap>
        </ContentWrap>
      </ContentContainer>
    </DashboardContainer>
  );
};

export default RealtimeMonitoringPage;
