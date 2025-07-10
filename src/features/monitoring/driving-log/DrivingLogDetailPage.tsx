import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

import { getDrivingLogDetail } from '../api/drivinglog-api';
import type { DrivingLogDetailResponse } from './types';
import { getAddressFromCoord } from '@/utils/kakao';
import type { LatLng } from '@/utils/kakao';

import { formatLocalDateTime, getOnlyTime } from '@/utils/date';
import { Text } from '@/components/ui/text/Text';
import RouteMap from './components/RouteMap';
import { formatKm } from '@/utils/common';

const CoordinateToAddress: React.FC<LatLng> = ({ lat, lon }) => {
  const [address, setAddress] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const addr = await getAddressFromCoord(lat, lon);

        if (!addr) {
          setAddress('좌표에 해당하는 주소가 없습니다.');
        } else {
          setAddress(addr);
        }
      } catch (err) {
        console.error(err);
        setAddress('주소를 불러올 수 없습니다.');
      }
    };
    fetch();
  }, [lat, lon]);

  return <div>{address}</div>;
};

export const DrivingLogDetailPage: React.FC = () => {
  const { id } = useParams();
  const drivingLogId = Number(id);
  const [data, setData] = useState<DrivingLogDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!drivingLogId) return;
      setError(null);
      try {
        const result = await getDrivingLogDetail(drivingLogId);
        setData(result);
        console.log(result);
      } catch (err: any) {
        setError(err.message);
        setData(null);
        toast.error('오류가 발생했습니다. 다시 시도해주세요.');
      }
    };

    fetchData();
  }, [drivingLogId]);

  if (!data) return null;

  const { drivingLogResponse, routes } = data;

  // 운행 시간 계산 (출발~도착 시간 차이)
  const driveDuration = (() => {
    const start = new Date(drivingLogResponse.startAt);
    const end = new Date(drivingLogResponse.endAt);
    const diffMs = end.getTime() - start.getTime();
    const mins = Math.floor(diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${hours}시간 ${minutes}분`;
  })();

  return (
    <PageLayout>
      <LeftColumn>
        <Section>
          <Text type="subheading2">차량 번호</Text>
          <Row>
            <Text type="heading2">{drivingLogResponse.vehicleRegistrationNumber}</Text>
          </Row>
        </Section>

        <Section>
          <Text type="heading2">운행 정보</Text>
          <VerticalList>
            <ItemRow>
              <Label>시작 시간</Label>
              <Value>{formatLocalDateTime(drivingLogResponse.startAt)}</Value>
            </ItemRow>
            <ItemRow>
              <Label>종료 시간</Label>
              <Value>{formatLocalDateTime(drivingLogResponse.endAt)}</Value>
            </ItemRow>
            <ItemRow>
              <Label>운행 시간</Label>
              <Value>{driveDuration}</Value>
            </ItemRow>
            <ItemRow>
              <Label>출발 계기판</Label>
              <Value>{formatKm(Number(drivingLogResponse.startOdometer))}</Value>
            </ItemRow>
            <ItemRow>
              <Label>도착 계기판</Label>
              <Value>{formatKm(Number(drivingLogResponse.endOdometer))}</Value>
            </ItemRow>
            <ItemRow>
              <Label>총 주행 거리</Label>
              <Value>{formatKm(Number(drivingLogResponse.totalDistance))}</Value>
            </ItemRow>
            <ItemRow>
              <Label>운전자 이름</Label>
              <Value>{drivingLogResponse.customerName}</Value>
            </ItemRow>
          </VerticalList>
        </Section>

        <Section>
          <Text type="heading2">운행 상세 정보</Text>
          {routes.map((route, index) => (
            <RouteBox key={index}>
              <RouteTimeRow>
                <Text style={{ color: 'green' }}>시동 ON: {getOnlyTime(route.startAt)}</Text>
                <Text style={{ color: 'red', float: 'right' }}>시동 OFF: {getOnlyTime(route.endAt)}</Text>
              </RouteTimeRow>
              <LatLonRow>
                <Label>시작 위치</Label>
                <CoordinateToAddress lat={route.startLat} lon={route.startLon} />
              </LatLonRow>
              <LatLonRow>
                <Label>종료 위치</Label>
                <CoordinateToAddress lat={route.endLat} lon={route.endLon} />
              </LatLonRow>
            </RouteBox>
          ))}
        </Section>
      </LeftColumn>

      <RightColumn>
        <RouteMap traceLogs={routes.flatMap(r => r.traceLogs)} />
      </RightColumn>
    </PageLayout>
  );
};

export default DrivingLogDetailPage;

const PageLayout = styled.div`
  display: flex;
  height: 100vh;
`;

const LeftColumn = styled.div`
  flex: 0 0 500px;
  overflow-y: auto;
  padding: 2rem 1rem 2rem 2rem;
`;

const RightColumn = styled.div`
  flex: 1;
  padding: 1rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;
`;

const Row = styled.div`
  display: flex;
`;

const VerticalList = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const Label = styled.span`
  font-weight: 500;
`;

const Value = styled.span`
  font-weight: 600;
`;

const RouteBox = styled.div`
  padding: 10px 0;
  border-bottom: 1px solid #ddd;
`;

const RouteTimeRow = styled.div`
  display: flex;
  justify-content: space-between;
`;

const LatLonRow = styled(ItemRow)`
  margin-top: 4px;
`;
