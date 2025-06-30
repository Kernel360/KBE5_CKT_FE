import React, { useState, useEffect, useCallback } from 'react';
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
} from '@/components/layout/DashboardLayout.styles';
import { TextInput } from '@/components/ui/input/input/TextInput';
import { DateInput } from '@/components/ui/input/date/DateInput';
import { Dropdown } from '@/components/ui/input/dropdown/Dropdown';
import { IconButton } from '@/components/ui/button/IconButton';
import { BasicTable } from '@/components/ui/table/table/BasicTable';
import { STATUS_OPTIONS, DRIVINGLOG_TABLE_HEADERS } from './types';
import type { DrivingLogListRequest, DrivingLogSummary } from './types';
import { DrivingLogDetailPanel } from './DrivingLogDetailPanel';
import { Pagination } from '@/components/ui/table/pagination/Pagination';
import { formatCommas } from '@/utils/common';

const DrivingLogPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ startDate: Date | null; endDate: Date | null }>({
    startDate: null,
    endDate: null,
  });

  const [VehicleRegistrationNumber, setVehicleRegistrationNumber] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [drivingLogs, setDrivingLogs] = useState<DrivingLogSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedDrivingLogId, setSelectedDrivingLogId] = useState<number | null>(null);

  // 운행 일지 목록 가져오기
  const fetchDrivingLogsData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const params: DrivingLogListRequest = {
        vehicleNumber: VehicleRegistrationNumber || undefined,
        userName: userName || undefined,
        startDate: formatDateTime(dateRange.startDate, 'yyyyMMddHHmmss'),
        endDate: formatDateTime(dateRange.endDate, 'yyyyMMddHHmmss'),
        type: status || undefined,
        page: page - 1,
        size: 10,
      };

      const data = await fetchDrivingLogs(params);
      const parsedData: DrivingLogSummary[] = data.list.map((item: DrivingLogSummary) => {
        return {
          ...item,
          startOdometer: (formatCommas(item.startOdometer) ?? '0') + ' km',
          endOdometer: (formatCommas(item.endOdometer) ?? '0') + ' km',
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
  }, [page, userName, VehicleRegistrationNumber, status, dateRange]);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page: number) => {
    setPage(page);
  }, []);

  // TextInput 변경 핸들러
  const handleVehicleNumberChange = (value: string) => {
    setVehicleRegistrationNumber(value);
    setPage(1);
  };

  const handleUserNameChange = (value: string) => {
    setUserName(value);
    setPage(1);
  };

  const handleDateChange = (value: { startDate: Date | null; endDate: Date | null }) => {
    setDateRange(value);
  };

  const handleStatusChange = (value: string | number) => {
    setStatus(value.toString());
  };

  const handleRowClick = (rowData: DrivingLogSummary) => {
    setSelectedDrivingLogId(rowData.id);
    setIsDetailPanelOpen(true);
  };

  const handleDetailPanelClose = () => {
    setIsDetailPanelOpen(false);
    setSelectedDrivingLogId(null);
  };

  useEffect(() => {
    fetchDrivingLogsData();
  }, [fetchDrivingLogsData]);

  return (
    <DashboardContainer>
      <FilterContainer>
        <FilterWrap>
          <FilterContent>
            <TextInput
              width="300px"
              type="text"
              id="vehiclenumber-input"
              label="차량번호"
              icon={<SearchIcon />}
              value={VehicleRegistrationNumber}
              onChange={handleVehicleNumberChange}
            />

            <TextInput
              width="300px"
              type="text"
              id="username-input"
              label="사용자"
              icon={<SearchIcon />}
              value={userName}
              onChange={handleUserNameChange}
            />

            <DateInput
              id="my-date-input"
              label="기간 설정"
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onDateChange={handleDateChange}
              width="320px"
            />

            <Dropdown width="300px" id="status" label="상태" options={STATUS_OPTIONS} onSelect={handleStatusChange} />
          </FilterContent>
          <IconButton icon={<SearchIcon />}>검색</IconButton>
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

      <DrivingLogDetailPanel
        drivingLogId={selectedDrivingLogId}
        isOpen={isDetailPanelOpen}
        onClose={handleDetailPanelClose}
      />
    </DashboardContainer>
  );
};

export default DrivingLogPage;
