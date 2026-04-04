import { useEffect } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import Nav from './components/Nav';
import WaButton from './components/WaButton';
import ExitIntent from './components/ExitIntent';
import CustomCursor from './components/CustomCursor';
import Home from './pages/Home';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import AdminPanel from './pages/AdminPanel';
import AdminLogin from './pages/AdminLogin';
import MaintenancePage from './pages/MaintenancePage';
import { SettingsProvider, useSiteSettings } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ToastHost from './components/ToastHost';
import { ADMIN_PORTAL_PATH } from './api';

function Layout() {
  const { settings, loading } = useSiteSettings();

  if (loading) {
    return (
      <div className="app-loading" aria-busy="true">
        <div className="app-loading-inner">Loading…</div>
      </div>
    );
  }

  if (settings.maintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <>
      <Nav />
      <Outlet />
      <WaButton />
      <ExitIntent />
      <CustomCursor />
    </>
  );
}

function AdminGate() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <AdminLogin />;
  }
  return <AdminPanel />;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
        </Route>

        <Route path={ADMIN_PORTAL_PATH} element={<AdminGate />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
            <ToastHost />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
              
