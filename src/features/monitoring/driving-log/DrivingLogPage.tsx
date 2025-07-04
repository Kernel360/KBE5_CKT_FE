import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchDrivingLogs } from '../api/drivinglog-api';
import { formatDateTime } from '@/utils/date';

import SearchIcon from '@/assets/icons/ic-search.svg?react';
import {
  DashboardContainer,
  FilterContainer,
  FilterWrap,
  FilterContent,
  TableContainer,
  TableTitle,
  TitleContainer,
} from '@/components/layout/DashboardLayout.styles';
import { TextInput } from '@/components/ui/input/input/TextInput';
import { DateInput } from '@/components/ui/input/date/DateInput';
import { BasicTable } from '@/components/ui/table/table/BasicTable';
import { DRIVINGLOG_TABLE_HEADERS } from './types';
import type { DrivingLogListRequest, DrivingLogSummary } from './types';
import { Pagination } from '@/components/ui/table/pagination/Pagination';
import { formatCommas } from '@/utils/common';
import { Text } from '@/components/ui/text/Text';

const DrivingLogPage: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });

  const [vehicleRegistrationNumber, setVehicleRegistrationNumber] = useState<string>('');
  const [drivingLogs, setDrivingLogs] = useState<DrivingLogSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(0);

  // 운행 일지 목록 가져오기
  const fetchDrivingLogsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const params: DrivingLogListRequest = {
        vehicleNumber: vehicleRegistrationNumber || undefined,
        startDate: formatDateTime(dateRange.startDate, 'yyyyMMddHHmmss'),
        endDate: formatDateTime(dateRange.endDate, 'yyyyMMddHHmmss'),
        page: page - 1,
        size: 10,
      };

      const data = await fetchDrivingLogs(params);
      const parsedData: DrivingLogSummary[] = data.list.map((item: DrivingLogSummary) => {
        return {
          ...item,
          totalDistance: (formatCommas(item.totalDistance) ?? '0') + ' km',
          startAtFormatted: formatDateTime(new Date(item.startAt)),
          endAtFormatted: formatDateTime(new Date(item.endAt)),
        };
      });
      setDrivingLogs(parsedData);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message || '데이터를 가져오는 중 오류 발생');
    } finally {
      setIsLoading(false);
    }
  }, [page, vehicleRegistrationNumber, dateRange]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page: number) => {
    setPage(page);
  }, []);

  // TextInput 변경 핸들러
  const handleVehicleNumberChange = (value: string) => {
    setVehicleRegistrationNumber(value);
    setPage(1);
  };

  const handleDateChange = (value: { startDate: Date | null; endDate: Date | null }) => {
    setDateRange(value);
  };

  const handleRowClick = (rowData: DrivingLogSummary) => {
    navigate(`/driving-log/${rowData.id}`);
  };

  useEffect(() => {
    fetchDrivingLogsData();
  }, [fetchDrivingLogsData]);

  return (
    <DashboardContainer>
      <TitleContainer>
        <Text type="heading">운행 일지</Text>
      </TitleContainer>
      <FilterContainer>
        <FilterWrap>
          <FilterContent>
            <TextInput
              width="300px"
              type="text"
              id="vehiclenumber-input"
              label="차량번호"
              icon={<SearchIcon />}
              value={vehicleRegistrationNumber}
              onChange={handleVehicleNumberChange}
              placeholder="차량번호 입력"
            />

            <DateInput
              id="my-date-input"
              label="기간 설정"
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateChange={handleDateChange}
              width="300px"
            />
          </FilterContent>
        </FilterWrap>
      </FilterContainer>

      <TableContainer>
        <TableTitle>운행 일지</TableTitle>
        <BasicTable<DrivingLogSummary>
          tableHeaders={DRIVINGLOG_TABLE_HEADERS}
          data={drivingLogs}
          onRowClick={handleRowClick}
          message={isLoading ? '로딩 중입니다...' : error || '데이터가 없습니다.'}
        ></BasicTable>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} pageBlockSize={10} />
      </TableContainer>
    </DashboardContainer>
  );
};

export default DrivingLogPage;
