import React, { useState, useEffect, useCallback } from 'react';

import {
  DashboardContainer,
  FilterContainer,
  FilterContent,
  FilterWrap,
  TableContainer,
  TitleContainer,
} from '@/components/layout/DashboardLayout.styles';

import { Text } from '@/components/ui/text/Text';
import { IconButton } from '@/components/ui/button/IconButton';
import { Dropdown } from '@/components/ui/input/dropdown/Dropdown';
import { TextInput } from '@/components/ui/input/input/TextInput';
import { BasicTable } from '@/components/ui/table/table/BasicTable';
import { Pagination } from '@/components/ui/table/pagination/Pagination';

import PlusIcon from '@/assets/icons/ic-plus.svg?react';
import SearchIcon from '@/assets/icons/ic-search.svg?react';
import api from '@/libs/axios';
import { CODE_SUCCESS } from '@/utils/response';

interface Customer {
  id: number;
  customerType: string;
  customerName: string;
  phoneNumber: string;
  licenseNumber: string;
  zipCode: string;
  address: string;
  detailAddress: string;
  birthday: string;
  status: string; // 예: 'ACTIVE' 등
  memo: string;
}

const headers = [
  { label: '번호', key: 'id', width: '8%', align: 'center' },
  { label: '이름', key: 'customerName', width: '8%', align: 'center' },
  { label: '생년월일', key: 'birthday', width: '8%', align: 'center' },
  { label: '연락처', key: 'phoneNumber', width: '15%', align: 'center' },
  { label: '운전면허번호', key: 'licenseNumber', width: '8%', align: 'center' },
  { label: '주소', key: 'address', width: '15%', align: 'center' },
  { label: '상태', key: 'status',type: 'badge',
    displayKey: 'statusName',
    valueToBadgeColorMap: {
      ACTIVE: 'green',
      WITHDRAWN: 'red',
      DORMANT: 'gray',
    }, width: '8%', align: 'center' },
  { label: '비고', key: 'memo', width: '30%', align: 'center' },
];

const RENTAL_STATUS_OPTIONS = [
  { label: '전체', value: '' },
  { label: 'ACTIVE', value: 'ACTIVE' },
  { label: 'INACTIVE', value: 'INACTIVE' },
];

const ITEMS_PER_PAGE = 10;

const CustomerManagementPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filterStatus, setFilterStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 서버에서 페이지네이션, 필터링 적용하여 데이터 요청
  const fetchCustomers = useCallback(async (page: number, status: string, keyword: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/v1/customers', {
        params: {
          page: page - 1, // 0-based page index
          size: ITEMS_PER_PAGE,
          status: status || undefined,
          keyword: keyword || undefined,
        },
      });

      if (response.data.code !== CODE_SUCCESS) {
        throw new Error(response.data.message);
      }

      const data = response.data.data;
      setCustomers(data.list);
      setTotalPages(data.totalPages);

    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers(currentPage, filterStatus, keyword);
  }, [currentPage, filterStatus, keyword, fetchCustomers]);

  // 필터 상태 선택 시 페이지 1로 초기화
  const handleStatusSelect = useCallback((value: string | number) => {
    setFilterStatus(String(value));
    setCurrentPage(1);
  }, []);

  // 검색어 변경 시 상태 업데이트
  const handleKeywordChange = useCallback((value: string) => {
    setKeyword(value);
  }, []);

  // 검색 버튼 클릭 시 페이지 1로 초기화
  const handleSearchClick = useCallback(() => {
    setCurrentPage(1);
  }, []);

  // 페이지 변경 핸들러
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return (
    <DashboardContainer>
      <TitleContainer>
        <Text type="heading">사용자 관리</Text>
        <IconButton icon={<PlusIcon />}>사용자 추가</IconButton>
      </TitleContainer>

      <FilterContainer>
        <Text type="subheading2">고객 검색</Text>
        <FilterWrap>
          <FilterContent>
            <Dropdown
              width="180px"
              id="rental-status"
              label="상태"
              options={RENTAL_STATUS_OPTIONS}
              value={filterStatus}
              onSelect={handleStatusSelect}
            />
            <TextInput
              width="300px"
              type="text"
              id="customer-search"
              label="검색어"
              placeholder="이름, 연락처, 메모 검색"
              icon={<SearchIcon />}
              value={keyword}
              onChange={handleKeywordChange}
              onEnter={handleSearchClick}
            />
          </FilterContent>
          <IconButton icon={<SearchIcon />} onClick={handleSearchClick}>
            검색
          </IconButton>
        </FilterWrap>
      </FilterContainer>

      <TableContainer>
        <Text type="subheading2">고객 목록</Text>

        {loading && <Text>로딩 중...</Text>}
        {error && <Text type="error">에러 발생: {error}</Text>}
        {!loading && !error && (
          <>
            <BasicTable<Customer>
              tableHeaders={headers}
              data={customers}
              onRowClick={(row) => console.log('선택된 고객:', row)}
              message={customers.length === 0 ? '검색 결과가 없습니다.' : ''}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              pageBlockSize={10}
            />
          </>
        )}
      </TableContainer>
    </DashboardContainer>
  );
};

export default CustomerManagementPage;