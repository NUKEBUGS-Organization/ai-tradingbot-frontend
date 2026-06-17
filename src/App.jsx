import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, isAdminUser } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SidebarProvider } from './context/SidebarContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import RiskManagement from './pages/RiskManagement';
import AISignals from './pages/AISignals';
import TelegramPanel from './pages/TelegramPanel';
import Subscriptions from './pages/Subscriptions';
import Checkout from './pages/Checkout';
import CheckoutPay from './pages/CheckoutPay';
import CheckoutSuccess from './pages/CheckoutSuccess';
import CheckoutCancel from './pages/CheckoutCancel';
import EnginePanel from './pages/EnginePanel';
import SignalHistory from './pages/SignalHistory';
import AnalysisDebug from './pages/AnalysisDebug';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import ReferralDashboard from './pages/ReferralDashboard';
import AdminReferrals from './pages/AdminReferrals';
import SubscriptionGate from './components/SubscriptionGate';
import RiskDisclosureGate from './components/RiskDisclosureGate';
import AppTour from './components/AppTour';

function LoadingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: '#d4af37',
        fontSize: '16px',
      }}
    >
      Loading...
    </div>
  );
}

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
}

function ClientOnlyRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAdminUser(user)) return <Navigate to="/admin" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
      <RiskDisclosureGate>
      <SidebarProvider>
      <Router>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <Register />
              </GuestRoute>
            }
          />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<ProtectedRoute><SubscriptionGate title="Dashboard"><Dashboard /></SubscriptionGate></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
          <Route path="/risk" element={<ProtectedRoute><SubscriptionGate title="Risk Management"><RiskManagement /></SubscriptionGate></ProtectedRoute>} />
          <Route path="/signals" element={<ProtectedRoute><SubscriptionGate title="AI Signals"><AISignals /></SubscriptionGate></ProtectedRoute>} />
          <Route path="/signals/history" element={<ProtectedRoute><SubscriptionGate title="Signal History"><SignalHistory /></SubscriptionGate></ProtectedRoute>} />
          <Route path="/telegram" element={<ProtectedRoute adminOnly><TelegramPanel /></ProtectedRoute>} />
          <Route path="/subscriptions" element={<ProtectedRoute><ClientOnlyRoute><Subscriptions /></ClientOnlyRoute></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><ClientOnlyRoute><Checkout /></ClientOnlyRoute></ProtectedRoute>} />
          <Route path="/checkout/pay" element={<ProtectedRoute><ClientOnlyRoute><CheckoutPay /></ClientOnlyRoute></ProtectedRoute>} />
          <Route path="/checkout/success" element={<ProtectedRoute><ClientOnlyRoute><CheckoutSuccess /></ClientOnlyRoute></ProtectedRoute>} />
          <Route path="/checkout/cancel" element={<ProtectedRoute><ClientOnlyRoute><CheckoutCancel /></ClientOnlyRoute></ProtectedRoute>} />
          <Route path="/engine" element={<ProtectedRoute><SubscriptionGate title="AI Engine"><EnginePanel /></SubscriptionGate></ProtectedRoute>} />
          <Route path="/analysis" element={<ProtectedRoute><AnalysisDebug /></ProtectedRoute>} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/referrals" element={<ProtectedRoute><ClientOnlyRoute><ReferralDashboard /></ClientOnlyRoute></ProtectedRoute>} />
          <Route path="/admin/referrals" element={<ProtectedRoute adminOnly><AdminReferrals /></ProtectedRoute>} />
          <Route path="/" element={<HomeRedirect />} />
        </Routes>
        <AppTour />
      </Router>
      </SidebarProvider>
      </RiskDisclosureGate>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
