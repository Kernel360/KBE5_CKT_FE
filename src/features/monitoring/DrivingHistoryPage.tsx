import { toast } from 'react-toastify';
import React, { useState, useMemo } from 'react';
import styled from 'styled-components';

import SearchIcon from '@/assets/icons/ic-search.svg?react';
import {
  DashboardContainer,
  FilterContainer,
  FilterContent,
  FilterWrap,
  TableContainer,
  TableTitle,
  TitleContainer,
} from '@/components/layout/DashboardLayout.styles';
import { IconButton } from '@/components/ui/button/IconButton';
import { Dropdown } from '@/components/ui/input/dropdown/Dropdown';
import { BasicTable } from '@/components/ui/table/table/BasicTable';
import api from '@/libs/axios';
import { formatCommas } from '@/utils/common';
import { Text } from '@/components/ui/text/Text';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 타입 정의
interface MonthOption {
  label: string;
  value: string;
}
interface VehicleLog {
  id: string;
  vehicleNumber: string;
  drivingDays: number;
  totalDistance: string;
  averageDistance: string;
  averageDrivingTime: string;
  drivingRate: string;
}
interface WeeklyLog {
  id: string;
  period: string;
  startDate: string;
  endDate: string;
  totalDistance: string;
  totalTime: string;
  daysCount: number;
  registrationNumber: string;
}
interface DailyLog {
  id: string;
  date: string;
  dayOfWeek: string;
  totalDistance: string;
  totalTime: string;
}

const VEHICLE_LOG_TABLE_HEADERS = [
  { key: 'vehicleNumber', label: '차량번호', width: '20%' },
  { key: 'drivingDays', label: '운행일수', width: '15%' },
  { key: 'totalDistance', label: '총 주행거리', width: '15%' },
  { key: 'averageDistance', label: '평균 주행거리', width: '15%' },
  { key: 'averageDrivingTime', label: '평균 운행시간', width: '20%' },
  { key: 'drivingRate', label: '운행률', width: '15%' },
];

const WEEKLY_LOG_TABLE_HEADERS = [
  { key: 'period', label: '운행 기간', width: '40%' },
  { key: 'totalDistance', label: '총 운행거리', width: '20%' },
  { key: 'totalTime', label: '총 운행시간', width: '20%' },
  { key: 'daysCount', label: '운행 일수', width: '20%' },
];

const StyledAnalysisWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
  margin-top: 24px;
  align-items: stretch;
`;

const StyledWeeklySection = styled.div`
  flex: 1 1 300px;
  min-width: 0;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const StyledDailySection = styled.div`
  flex: 1 1 300px;
  min-width: 0;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;
const YEARS = [currentYear, currentYear - 1];
const MONTH_OPTIONS: MonthOption[] = YEARS.flatMap(year =>
  Array.from({ length: 12 }, (_, i) => {
    const month = 12 - i;
    const isFuture = year === currentYear && month > currentMonth;
    if (isFuture) return null;
    return {
      label: `${year}년 ${month}월`,
      value: `${year}-${String(month).padStart(2, '0')}`,
    };
  }).filter((v): v is MonthOption => v !== null)
);

const SummaryCard = ({ label, value, unit }: { label: string; value: any; unit: string }) => (
  <div style={{ flex: 1, background: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
    <div style={{ fontSize: '14px', color: '#6b7280' }}>{label}</div>
    <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '4px' }}>
      {value ?? 0} <span style={{ fontSize: '16px', color: '#9ca3af' }}>{unit}</span>
    </div>
  </div>
);

const DrivingHistoryPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTH_OPTIONS[0]?.value ?? '');
  const [vehicleLogData, setVehicleLogData] = useState<VehicleLog[]>([]);
  const [weeklyLogData, setWeeklyLogData] = useState<WeeklyLog[]>([]);
  const [dailyLogData, setDailyLogData] = useState<DailyLog[]>([]);
  const [selectedWeeklyData, setSelectedWeeklyData] = useState<WeeklyLog | null>(null);
  const [lastQueryParams, setLastQueryParams] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [summary, setSummary] = useState<{ totalDistance: string; totalTime: string; totalCount: number }>({
    totalDistance: '0',
    totalTime: '0',
    totalCount: 0,
  });
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleLog | null>(null);

  const calculateDrivingRate = (drivingDays: number, startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return ((drivingDays / totalDays) * 100).toFixed(1);
  };

  const fetchVehicleLogs = async () => {
    if (!selectedMonth) {
      toast.info('조회 월을 선택해주세요.');
      return;
    }
    setWeeklyLogData([]);
    setDailyLogData([]);
    setSelectedWeeklyData(null);
    setSelectedVehicle(null);
    try {
      setIsLoading(true);
      setError('');
      const [year, month] = selectedMonth.split('-');
      const from = new Date(Number(year), Number(month) - 1, 1);
      from.setHours(0, 0, 0, 0);
      const to = new Date(Number(year), Number(month), 0);
      to.setHours(23, 59, 59, 999);
      const params = { from: from.toISOString(), to: to.toISOString() };
      setLastQueryParams(params);
      const response = await api.get('/api/v1/logs/summary', { params });
      if (Array.isArray(response.data)) {
        const data: VehicleLog[] = response.data.map((item: any) => {
          const avgTime = item.averageDrivingTime ? item.averageDrivingTime.split('.')[0] : '00:00:00';
          return {
            id: `${item.registrationNumber}-${Math.random()}`,
            vehicleNumber: item.registrationNumber || '-',
            drivingDays: item.drivingDays || 0,
            totalDistance: (formatCommas(item.totalDistance || 0) ?? '0') + ' km',
            averageDistance: (formatCommas(item.averageDistance ? Math.round(item.averageDistance) : 0) ?? '0') + ' km',
            averageDrivingTime: avgTime,
            drivingRate: calculateDrivingRate(item.drivingDays || 0, from.toISOString(), to.toISOString()),
          };
        });
        setVehicleLogData(data);
        // Calculate summary
        const totalDistanceSum = data.reduce(
          (acc, cur) => acc + Number(cur.totalDistance.replace(' km', '').replace(/,/g, '')),
          0
        );
        const totalCountSum = data.reduce((acc, cur) => acc + (cur.drivingDays || 0), 0);
        let totalSeconds = 0;
        data.forEach(item => {
          const [h, m, s] = item.averageDrivingTime.split(':').map(Number);
          const seconds = (h * 3600 + m * 60 + s) * item.drivingDays;
          totalSeconds += seconds;
        });
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const totalTimeStr = `${hours}시간 ${minutes}분`;
        setSummary({
          totalDistance: formatCommas(totalDistanceSum) ?? '0',
          totalTime: totalTimeStr,
          totalCount: totalCountSum,
        });
      } else {
        setVehicleLogData([]);
        setSummary({ totalDistance: '0', totalTime: '0', totalCount: 0 });
      }
    } catch (error) {
      console.error('운행 내역 조회 실패:', error);
      setError('데이터를 가져오는 중 오류가 발생했습니다.');
      setVehicleLogData([]);
      setSummary({ totalDistance: '0', totalTime: '0', totalCount: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExcelDownload = async () => {
    if (!selectedMonth) {
      toast.info('조회 월을 선택해주세요.');
      return;
    }
    const [year, month] = selectedMonth.split('-');
    const from = new Date(Number(year), Number(month) - 1, 1);
    from.setHours(0, 0, 0, 0);
    const to = new Date(Number(year), Number(month), 0);
    to.setHours(23, 59, 59, 999);
    try {
      const response = await api.get('/api/v1/logs/summary/excel', {
        params: {
          from: from.toISOString(),
          to: to.toISOString(),
          ...(selectedVehicle?.vehicleNumber && { registrationNumber: selectedVehicle.vehicleNumber }),
        },
        responseType: 'blob',
      });
      const now = new Date();
      const timestamp = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);
      const fileName = `운행기록부_${selectedMonth}_${timestamp}.xlsx`;
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('엑셀 다운로드에 실패했습니다.');
      console.error(error);
    }
  };

  const handleWeeklySelect = (data: WeeklyLog) => {
    setSelectedWeeklyData(data);
    const weekStart = data.startDate;
    const weekEnd = data.endDate;
    if (weekStart && weekEnd) {
      fetchDailyLogs(weekStart, weekEnd);
    }
  };

  const fetchDailyLogs = async (weekStart: string, weekEnd: string) => {
    if (!selectedVehicle?.vehicleNumber) {
      return;
    }
    try {
      const response = await api.get('/api/v1/logs/summary/daily', {
        params: {
          weekStart,
          weekEnd,
          registrationNumber: selectedVehicle.vehicleNumber,
        },
      });
      if (response.data.code === '000' && Array.isArray(response.data.data)) {
        const dailyData: DailyLog[] = response.data.data
          .map((item: any) => {
            const dateStr = item.driveDate ?? item.drive_date;
            if (!dateStr || typeof dateStr !== 'string') return null;
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return null;
            let distanceRaw = item.totalDistance ?? item.total_distance;
            let distance = 0;
            if (typeof distanceRaw === 'number') {
              distance = distanceRaw;
            } else if (typeof distanceRaw === 'string' && !isNaN(Number(distanceRaw))) {
              distance = Number(distanceRaw);
            }
            if (!Number.isFinite(distance)) distance = 0;
            let durationRaw = item.totalDrivingTime ?? item.total_driving_time;
            let duration = '00:00:00';
            if (typeof durationRaw === 'string' && durationRaw.trim() !== '') {
              duration = durationRaw.split('.')[0];
            }
            const dayOfWeek = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
            return {
              id: dateStr,
              date: dateStr,
              dayOfWeek,
              totalDistance: (formatCommas(distance) ?? '0') + ' km',
              totalTime: duration,
            };
          })
          .filter((item): item is DailyLog => !!item);
        setDailyLogData(dailyData);
      } else {
        setDailyLogData([]);
      }
    } catch (error) {
      console.error('일별 운행 내역 조회 실패:', error);
      setDailyLogData([]);
    }
  };

  const handleVehicleSelect = async (data: VehicleLog) => {
    setSelectedVehicle(data);
    const [year, month] = selectedMonth.split('-');
    const from = new Date(Number(year), Number(month) - 1, 1);
    from.setHours(0, 0, 0, 0);
    const to = new Date(Number(year), Number(month), 0);
    to.setHours(23, 59, 59, 999);
    try {
      const weeklyRes = await api.get('/api/v1/logs/summary/weekly', {
        params: {
          from: from.toISOString(),
          to: to.toISOString(),
          registrationNumber: data.vehicleNumber,
        },
      });
      if (weeklyRes.data && Array.isArray(weeklyRes.data)) {
        const weeklyData: WeeklyLog[] = weeklyRes.data.map((item: any) => {
          const startRaw = item.weekStartDate;
          const endRaw = item.weekEndDate;
          const start = startRaw ? new Date(startRaw) : null;
          const end = endRaw ? new Date(endRaw) : null;
          const startDateStr = start ? start.toISOString() : '';
          const endDateStr = end ? end.toISOString() : '';
          return {
            id: item.weekNumber,
            period: `${startDateStr.split('T')[0]} ~ ${endDateStr.split('T')[0]}`,
            startDate: startDateStr,
            endDate: endDateStr,
            totalDistance: (formatCommas(item.totalDistance ?? 0) ?? '0') + ' km',
            totalTime: item.totalDrivingTime,
            daysCount: item.drivingDays,
            registrationNumber: data.vehicleNumber,
          };
        });
        setWeeklyLogData(weeklyData);
      }
      const avgTime = data.averageDrivingTime ? data.averageDrivingTime.split('.')[0] : '00:00:00';
      const [h, m, s] = avgTime.split(':').map(Number);
      const totalSeconds = (h * 3600 + m * 60 + s) * data.drivingDays;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const totalTimeStr = `${hours}시간 ${minutes}분`;
      setSummary({
        totalDistance: data.totalDistance.replace(' km', ''),
        totalTime: totalTimeStr,
        totalCount: data.drivingDays,
      });
    } catch (error) {
      console.error('선택 차량 주간 운행 내역 조회 실패:', error);
      setWeeklyLogData([]);
      setDailyLogData([]);
    }
  };

  // useMemo로 차트 데이터 생성
  const weeklyChartData = useMemo(() => {
    const weeklyLabels = ['1주차', '2주차', '3주차', '4주차', '5주차'];
    const weeklyDataMap = Object.fromEntries(weeklyLogData.map((_, idx) => [`${idx + 1}주차`, weeklyLogData[idx]]));
    const fullWeeklyData = weeklyLabels.map(label => {
      const entry = weeklyDataMap[label];
      return entry ? Number(entry.totalDistance.replace(' km', '').replace(/,/g, '')) : 0;
    });
    return {
      labels: weeklyLabels,
      datasets: [
        {
          label: '주간 총 운행거리(km)',
          data: fullWeeklyData,
          backgroundColor: '#10b981',
        },
      ],
    };
  }, [weeklyLogData]);

  const dailyChartData = useMemo(() => {
    const dailyLabels = ['월', '화', '수', '목', '금', '토', '일'];
    const dailyDataMap = Object.fromEntries(dailyLogData.map(d => [d.dayOfWeek, d]));
    const fullDailyData = dailyLabels.map(day => {
      const entry = dailyDataMap[day];
      if (!entry) return 0;
      const clean = entry.totalDistance?.replace?.(' km', '').replace?.(/,/g, '');
      return Number(clean);
    });
    return {
      labels: dailyLabels,
      datasets: [
        {
          label: '일별 운행거리(km)',
          data: fullDailyData,
          backgroundColor: '#3b82f6',
        },
      ],
    };
  }, [dailyLogData]);

  return (
    <DashboardContainer>
      <TitleContainer>
        <Text type="heading">월별 통계</Text>
      </TitleContainer>
      <FilterContainer>
        <FilterWrap>
          <FilterContent>
            <Dropdown
              width="300px"
              id="month-selector"
              label="조회 월"
              options={MONTH_OPTIONS}
              value={selectedMonth}
              onSelect={value => setSelectedMonth(String(value))}
            />
          </FilterContent>
          <IconButton icon={<SearchIcon />} onClick={fetchVehicleLogs}>
            조회
          </IconButton>
        </FilterWrap>
      </FilterContainer>
      <TableContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <TableTitle style={{ fontSize: '20px', fontWeight: 600 }}>차량별 운행 내역</TableTitle>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {selectedVehicle && (
              <span
                style={{
                  background: '#EFF6FF',
                  color: '#2563EB',
                  fontWeight: 600,
                  fontSize: '16px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                }}
              >
                {selectedVehicle.vehicleNumber}
              </span>
            )}
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                background: selectedVehicle ? '#22B14C' : '#E5E7EB',
                border: '1px solid white',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                color: selectedVehicle ? 'white' : '#9CA3AF',
                cursor: selectedVehicle ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s, color 0.2s',
              }}
              onClick={handleExcelDownload}
              disabled={!selectedVehicle}
            >
              엑셀 다운로드
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', justifyContent: 'flex-end' }}>
          <SummaryCard label="총 운행거리" value={summary.totalDistance} unit="km" />
          <SummaryCard label="총 운행시간" value={summary.totalTime} unit="" />
          <SummaryCard label="운행횟수" value={summary.totalCount} unit="회" />
        </div>
        {vehicleLogData.length > 0 ? (
          <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
            <BasicTable
              tableHeaders={VEHICLE_LOG_TABLE_HEADERS}
              data={vehicleLogData}
              message={
                isLoading
                  ? '로딩 중입니다...'
                  : error || (lastQueryParams ? '선택하신 월에는 운행 내역이 없습니다.' : '기간을 조회해주세요.')
              }
              onRowClick={handleVehicleSelect}
            />
          </div>
        ) : (
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#6b7280', fontSize: '15px' }}>
            {lastQueryParams ? '선택하신 월에는 운행 내역이 없습니다.' : '기간을 조회해주세요.'}
          </div>
        )}
        <StyledAnalysisWrapper style={{ alignItems: 'stretch' }}>
          <StyledWeeklySection>
            <div style={{ flex: 1, width: '100%', height: '400px' }}>
              <TableTitle style={{ marginBottom: '12px' }}>주간 운행 그래프</TableTitle>
              <div style={{ flex: 1, width: '100%', height: '400px' }}>
                <Bar
                  data={weeklyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                    onClick: (event, active) => {
                      if (!active || active.length === 0) return;
                      const idx = active[0].index;
                      const week = weeklyLogData[idx];
                      if (!week || !week.startDate || !week.endDate) {
                        return;
                      }
                      const weekStart = week.startDate.substring(0, 10);
                      const weekEnd = week.endDate.substring(0, 10);
                      setSelectedWeeklyData(week);
                      fetchDailyLogs(weekStart, weekEnd);
                    },
                  }}
                />
              </div>
            </div>
          </StyledWeeklySection>
          <StyledDailySection>
            <div style={{ flex: 1, width: '100%', height: '400px' }}>
              <TableTitle style={{ marginBottom: '12px' }}>일별 운행 그래프</TableTitle>
              <div style={{ flex: 1, width: '100%', height: '400px' }}>
                <Bar
                  data={dailyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
              </div>
            </div>
          </StyledDailySection>
        </StyledAnalysisWrapper>
      </TableContainer>
    </DashboardContainer>
  );
};

export default DrivingHistoryPage;
