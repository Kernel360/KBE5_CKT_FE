import React, { useCallback } from 'react';

import PlusIcon from '@/assets/icons/ic-plus.svg?react';
import SearchIcon from '@/assets/icons/ic-search.svg?react';

import {
  DashboardContainer,
  FilterContainer,
  FilterContent,
  FilterWrap,
  TableContainer,
  TitleContainer,
} from '@/components/layout/DashboardLayout.styles';
import { IconButton } from '@/components/ui/button/IconButton';
import { Text } from '@/components/ui/text/Text';
import { Dropdown } from '@/components/ui/input/dropdown/Dropdown';
import { TextInput } from '@/components/ui/input/input/TextInput';
import { DateInput } from '@/components/ui/input/date/DateInput';
import { RENTAL_TABLE_HEADERS, STATUS_OPTIONS, type RentalSummary } from './types';
import { useRentalList } from './hooks/useRentalList';
import { BasicTable } from '@/components/ui/table/table/BasicTable';
import { Pagination } from '@/components/ui/table/pagination/Pagination';

const RentalListPage: React.FC = () => {
  // -----------------------------------------------------------------------
  // 🚀 데이터 로딩 및 필터 상태 관리 (useRentalList 훅 활용)
  // -----------------------------------------------------------------------
  const {
    isLoading,
    error,
    currentPage,
    filters,
    rentals,
    totalPages,
    itemsPerPage,
    setFilters, // 필터 상태를 업데이트하는 함수
    setCurrentPage, // 현재 페이지를 업데이트하는 함수
    refetch, // 데이터 다시 불러오는 함수
  } = useRentalList();

  // -----------------------------------------------------------------------
  // 핸들러 함수들
  // -----------------------------------------------------------------------

  /**
   * 상태(Status) 드롭다운 선택 시 필터 업데이트.
   * @param value 선택된 상태 값 (string 또는 number)
   */
  const handleStatusSelect = useCallback(
    (value: string | number) => {
      setFilters({ status: value.toString() });
    },
    [setFilters]
  );

  /**
   * 검색어(Keyword) 입력 필드 값 변경 시 필터 업데이트.
   * @param value 입력된 검색어 문자열
   */
  const handleKeywordChange = useCallback(
    (value: string) => {
      setFilters({ keyword: value });
    },
    [setFilters]
  );

  const handleDateChange = useCallback(
    (dates: { startDate: Date | null; endDate: Date | null }) => {
      setFilters({ startAt: dates.startDate, endAt: dates.endDate });
    },
    [setFilters]
  );

  /**
   * 검색 버튼 클릭 또는 검색어 입력 필드에서 Enter 키 입력 시 데이터 재조회.
   */
  const handleSearchClick = useCallback(() => {
    console.log('검색');
  }, []);

  /**
   * 페이지네이션 변경 시 데이터 재조회.
   * @param page 새로 선택된 페이지 번호
   */
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      refetch({ page }); // 해당 페이지의 데이터 재조회
    },
    [setCurrentPage, refetch]
  );

  /**
   * 테이블 로우 클릭 시 예약 상세 패널 열기.
   * @param rowData 클릭된 예약의 요약 정보 (RentalSummary)
   */
  const handleRowClick = useCallback((rowData: RentalSummary) => {
    console.log('선택된 row > ', rowData);
  }, []);

  const handleRegister = useCallback(() => {
    console.log('등록');
  }, []);

  // -----------------------------------------------------------------------
  // 렌더링
  // -----------------------------------------------------------------------
  return (
    <DashboardContainer>
      {/* 타이틀 및 예약 등록 버튼 섹션 */}
      <TitleContainer>
        <Text type="heading">예약 관리</Text>
        <IconButton icon={<PlusIcon />} onClick={handleRegister}>
          예약 등록
        </IconButton>
      </TitleContainer>

      {/* 검색 필터 섹션 */}
      <FilterContainer>
        <Text type="subheading2">예약 검색 필터</Text>
        <FilterWrap>
          <FilterContent>
            {/* 상태 드롭다운 필터 */}
            <Dropdown
              width="220px"
              id="status"
              label="상태"
              options={STATUS_OPTIONS}
              value={filters.status}
              onSelect={handleStatusSelect}
            />
            <DateInput
              width="220px"
              id="date"
              label="기간 설정"
              startDate={filters.startAt}
              endDate={filters.endAt}
              onDateChange={handleDateChange}
            />
            {/* 검색어 입력 필드 */}
            <TextInput
              width="300px"
              type="text"
              id="keyword-input"
              label="검색어"
              placeholder="차량번호 또는 고객명 입력"
              icon={<SearchIcon />}
              value={filters.keyword || ''}
              onChange={handleKeywordChange}
              onEnter={handleSearchClick}
            />
          </FilterContent>
          {/* 검색 버튼 */}
          <IconButton icon={<SearchIcon />} onClick={handleSearchClick}>
            검색
          </IconButton>
        </FilterWrap>
      </FilterContainer>

      {/* 테이블 섹션 */}
      <TableContainer>
        <Text type="subheading2">예약 목록</Text>
        {/* BasicTable 컴포넌트: 예약 목록 표시 */}
        <BasicTable<RentalSummary>
          tableHeaders={RENTAL_TABLE_HEADERS}
          data={rentals}
          onRowClick={handleRowClick}
          message={
            isLoading ? '데이터 로딩 중...' : error ? '데이터를 불러오는 데 실패했습니다.' : '데이터가 없습니다.'
          }
          // 로딩 및 에러 상태에 따른 테이블 메시지 동적 변경
        />

        {/* 페이지네이션 컴포넌트: 데이터가 있고 로딩 중이 아닐 때만 표시 */}
        {!isLoading && !error && rentals.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageBlockSize={itemsPerPage}
          />
        )}
      </TableContainer>
    </DashboardContainer>
  );
};

export default RentalListPage;
