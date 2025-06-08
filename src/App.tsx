import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { ThemeContextProvider, useTheme } from '@/context/ThemeContext';
import { LoadingProvider } from './context/LoadingContext';
import GlobalStyle from '@/styles/GlobalStyle';
import DashboardLayout from '@/layouts/DashboardLayout';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-datepicker/dist/react-datepicker.css';

// 페이지
import LoginPage from '@/features/auth/LoginPage';

// 대시보드 페이지
import RealtimeMonitoringPage from '@/features/monitoring/RealtimeMonitoringPage';
import DrivingLogPage from '@/features/monitoring/DrivingLogPage';
import DrivingHistoryPage from '@/features/monitoring/DrivingHistoryPage';
import CustomerListPage from '@/features/customer/CustomerListPage';
import VehicleListPage from '@/features/vehicle/VehicleListPage';
import RentalListPage from '@/features/rental/RentalListPage';

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

                <Route path="/monitoring">
                  <Route index element={<DrivingLogPage />} />
                  <Route path="driving-log" element={<DrivingLogPage />} />
                  <Route path="driving-history" element={<DrivingHistoryPage />} />
                </Route>

                <Route path="/vehicle">
                  <Route index element={<VehicleListPage />} />
                  <Route path="list" element={<VehicleListPage />} />
                </Route>

                <Route path="/customer">
                  <Route index element={<CustomerListPage />} />
                  <Route path="list" element={<CustomerListPage />} />
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
