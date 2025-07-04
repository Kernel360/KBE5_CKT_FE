import React, { useState, useCallback } from 'react';

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
import { Pagination } from '@/components/ui/table/pagination/Pagination';
import { IconButton } from '@/components/ui/button/IconButton';
import { Dropdown } from '@/components/ui/input/dropdown/Dropdown';
import { TextInput } from '@/components/ui/input/input/TextInput';
import { BasicTable } from '@/components/ui/table/table/BasicTable';
import { Text } from '@/components/ui/text/Text';

import { useVehicleList } from './hooks/useVehicleList';
import type { VehicleSummary } from './types';
import { STATUS_OPTIONS, VEHICLE_TABLE_HEADERS } from './types';
import { VehicleRegisterPopup } from './VehicleRegisterPopup';
import { VehicleDetailPanel } from './VehicleDetailPanel';

const VehicleListPage: React.FC = () => {
  // -----------------------------------------------------------------------
  // 🚀 데이터 로딩 및 필터 상태 관리 (useVehicleList 훅 활용)
  // -----------------------------------------------------------------------
  const {
    isLoading,
    error,
    currentPage,
    filters,
    vehicles,
    totalPages,
    itemsPerPage,
    setFilters, // 필터 상태를 업데이트하는 함수
    setCurrentPage, // 현재 페이지를 업데이트하는 함수
    refetch, // 데이터 다시 불러오는 함수
  } = useVehicleList();

  // -----------------------------------------------------------------------
  // 팝업 및 패널 UI 상태 관리
  // -----------------------------------------------------------------------
  // 차량 등록 팝업 제어
  const [isRegisterPopupOpen, setIsRegisterPopupOpen] = useState(false);

  // 차량 상세 패널 제어 (선택된 차량 ID에 따라 상세 정보 표시)
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);

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

  /**
   * 검색 버튼 클릭 또는 검색어 입력 필드에서 Enter 키 입력 시 데이터 재조회.
   */
  const handleSearchClick = useCallback(() => {
    setCurrentPage(1); // 검색 실행 시 1페이지로 리셋
    refetch({ page: 1 }); // 새 필터 기준으로 데이터 재조회
  }, [refetch, setCurrentPage]);

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
   * 테이블 로우 클릭 시 차량 상세 패널 열기.
   * @param rowData 클릭된 차량의 요약 정보 (VehicleSummary)
   */
  const handleRowClick = useCallback((rowData: VehicleSummary) => {
    setSelectedVehicleId(rowData.id); // 선택된 차량 ID 설정
    setIsDetailPanelOpen(true); // 상세 패널 열기
  }, []);

  /**
   * 차량 등록 팝업 열기 핸들러.
   */
  const handleRegister = useCallback(() => {
    setIsRegisterPopupOpen(true);
  }, []);

  /**
   * 차량 등록 팝업 닫기 핸들러. 등록 성공 시 차량 목록을 새로고침합니다.
   * @param success 등록 작업 성공 여부
   */
  const handleRegisterPopupClose = useCallback(
    (success?: boolean) => {
      setIsRegisterPopupOpen(false);
      if (success) {
        refetch(); // 등록 성공 시 데이터 새로고침
      }
    },
    [refetch]
  );

  /**
   * 차량 상세 패널 닫기 핸들러. 선택된 차량 ID를 초기화합니다.
   */
  const handleDetailPanelClose = useCallback(() => {
    setIsDetailPanelOpen(false);
    setSelectedVehicleId(null); // 선택된 차량 ID 초기화
  }, []);

  /**
   * 차량 상세 패널에서 저장 성공 시 차량 목록을 새로고침합니다.
   */
  const handleDetailPanelSaveSuccess = useCallback(() => {
    refetch(); // 상세 정보 저장 성공 시 데이터 새로고침
  }, [refetch]);

  // -----------------------------------------------------------------------
  // 초기 데이터 로딩 또는 필터 변경 시 자동 재조회 (필요 시)
  // 현재 useVehicleList 훅 내에서 처리되고 있을 가능성이 높으므로 여기서는 주석 처리
  // 이 부분은 useVehicleList 훅의 구현 방식에 따라 조정될 수 있습니다.
  // useEffect(() => {
  //   refetch(); // 컴포넌트 마운트 시 또는 필터 변경 시 데이터 로딩
  // }, [filters, currentPage, refetch]); // 필터나 페이지 변경 시 자동으로 데이터 로드
  // -----------------------------------------------------------------------

  // -----------------------------------------------------------------------
  // 렌더링
  // -----------------------------------------------------------------------
  return (
    <DashboardContainer>
      {/* 타이틀 및 차량 등록 버튼 섹션 */}
      <TitleContainer>
        <Text type="heading">차량 관리</Text>
        <IconButton icon={<PlusIcon />} onClick={handleRegister}>
          차량 등록
        </IconButton>
      </TitleContainer>

      {/* 검색 필터 섹션 */}
      <FilterContainer>
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
            {/* 검색어 입력 필드 */}
            <TextInput
              width="300px"
              type="text"
              id="keyword-input"
              label="검색어"
              placeholder="차량번호 또는 모델명 입력"
              icon={<SearchIcon />}
              value={filters.keyword || ''} // undefined 방지
              onChange={handleKeywordChange}
              onEnter={handleSearchClick} // Enter 키로 검색 실행
            />
          </FilterContent>
          {/* 검색 버튼 */}
        </FilterWrap>
      </FilterContainer>

      {/* 테이블 섹션 */}
      <TableContainer>
        <Text type="subheading2">차량 목록</Text>
        {/* BasicTable 컴포넌트: 차량 목록 표시 */}
        <BasicTable<VehicleSummary>
          tableHeaders={VEHICLE_TABLE_HEADERS}
          data={vehicles}
          onRowClick={handleRowClick}
          message={
            isLoading ? '데이터 로딩 중...' : error ? '데이터를 불러오는 데 실패했습니다.' : '데이터가 없습니다.'
          }
          // 로딩 및 에러 상태에 따른 테이블 메시지 동적 변경
        />

        {/* 페이지네이션 컴포넌트: 데이터가 있고 로딩 중이 아닐 때만 표시 */}
        {!isLoading && !error && vehicles.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            pageBlockSize={itemsPerPage}
          />
        )}
      </TableContainer>

      {/* 차량 등록 팝업 컴포넌트 */}
      <VehicleRegisterPopup isOpen={isRegisterPopupOpen} onClose={handleRegisterPopupClose} />

      {/* 차량 상세 슬라이드 패널 컴포넌트 */}
      <VehicleDetailPanel
        vehicleId={selectedVehicleId}
        isOpen={isDetailPanelOpen}
        onClose={handleDetailPanelClose}
        onSuccessSave={handleDetailPanelSaveSuccess}
      />
    </DashboardContainer>
  );
};

export default VehicleListPage;
