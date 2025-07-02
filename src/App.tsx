import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ThemeContextProvider, useTheme } from '@/context/ThemeContext';
import { LoadingProvider } from './context/LoadingContext';
import GlobalStyle from '@/styles/GlobalStyle';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css';

// 레이아웃
import DashboardLayout from '@/layouts/DashboardLayout';

// 페이지
import LoginPage from '@/features/auth/LoginPage';

// 대시보드 페이지
import RealtimeMonitoringPage from '@/features/monitoring/realtime-monitoring/RealtimeMonitoringPage';
import DrivingLogPage from '@/features/monitoring/driving-log/DrivingLogPage';
import DrivingHistoryPage from '@/features/monitoring/DrivingHistoryPage';
import CustomerListPage from '@/features/customer/CustomerListPage';
import VehicleListPage from '@/features/vehicle/VehicleListPage';
import RentalListPage from '@/features/rental/RentalListPage';
import CustomerDetailPage from './features/customer/CustomerDetailPage';

const StyledThemeProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTheme } = useTheme();

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      {children}
    </ThemeProvider>
  );
};

function App() {
  return (
    <ThemeContextProvider>
      <StyledThemeProviderWrapper>
        <LoadingProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<DashboardLayout title="차칸 관제시스템" />}>
                <Route path="/" element={<RealtimeMonitoringPage />} />

                <Route path="/driving-log">
                  <Route index element={<DrivingLogPage />} />
                </Route>
                <Route path="/driving-history">
                  <Route index element={<DrivingHistoryPage />} />
                </Route>

                <Route path="/vehicle">
                  <Route index element={<VehicleListPage />} />
                  <Route path="list" element={<VehicleListPage />} />
                </Route>

                <Route path="/customers">
                  <Route index element={<CustomerListPage />} />
                  <Route path="list" element={<CustomerListPage />} />
                  <Route path=":id" element={<CustomerDetailPage />} />
                </Route>

                <Route path="/rental">
                  <Route index element={<RentalListPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </LoadingProvider>

        <ToastContainer
          position="bottom-center"
          autoClose={3500}
          hideProgressBar={true}
          newestOnTop={false}
          draggable={false}
          closeOnClick
          rtl={false}
          limit={3}
        />
      </StyledThemeProviderWrapper>
    </ThemeContextProvider>
  );
}

export default App;
