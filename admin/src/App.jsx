import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Suppliers from './pages/Suppliers';
import Disputes from './pages/Disputes';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import Emergencies from './pages/Emergencies';
import Withdrawals from './pages/Withdrawals';
import PromoCodes from './pages/PromoCodes';
import Banners from './pages/Banners';
import Vehicles from './pages/Vehicles';
import Reports from './pages/Reports';
import Safety from './pages/Safety';
import Products from './pages/Products';
import SupplierStocks from './pages/SupplierStocks';
import Branding from './pages/Branding';
import Brands from './pages/Brands';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    const urlUser = params.get('user');

    if (urlToken && urlUser) {
      try {
        const decodedUser = JSON.parse(decodeURIComponent(urlUser));
        if (decodedUser) {
          localStorage.setItem('token', urlToken);
          localStorage.setItem('user', JSON.stringify(decodedUser));
          setUser(decodedUser);
        }
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error('Erreur décodage utilisateur portail', e);
      }
    } else {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (stored && token) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          localStorage.clear();
        }
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, tokens) => {
    localStorage.setItem('token', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Toaster position="top-right" />
        <Login onLogin={handleLogin} />
      </>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/products" element={<Products />} />
          <Route path="/disputes" element={<Disputes />} />
          <Route path="/emergencies" element={<Emergencies />} />
          <Route path="/withdrawals" element={<Withdrawals />} />
          <Route path="/promo-codes" element={<PromoCodes />} />
          <Route path="/banners" element={<Banners />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/supplier-hub" element={<SupplierStocks />} />
          <Route path="/branding" element={<Branding />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
