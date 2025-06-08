import type { NavItem } from './types';

export const DASHBOARD_NAV_ITEMS: NavItem[] = [
  { label: '실시간 관제', key: 'realtime-monitoring', path: '/' },
  { label: '관제 현황', key: 'monitoring-status', path: '/monitoring' },
  { label: '차량 관리', key: 'vehicle-management', path: '/vehicle' },
  { label: '사용자 관리', key: 'user-management', path: '/customer' },
  { label: '예약 관리', key: 'rental-management', path: '/rental' },
];
