import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PrivateRoute } from './contexts/PrivateRoute';
import { RegisterPage } from './components/RegisterPage';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { Navbar } from './components/Navbar';

// Temporary placeholder components for remaining application views
const RestaurantPlaceholder = () => (
  <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'var(--text-main)' }}>
    <h2>Restaurant Detail Page (Protected Screen) 🍔</h2>
    <Link to="/" style={{ color: '#009de0' }}>Back to Home</Link>
  </div>
);

const OrdersPlaceholder = () => (
  <div style={{ padding: '20px', fontFamily: 'sans-serif', color: 'var(--text-main)' }}>
    <h2>Order History Page (Protected Screen) 📦</h2>
    <Link to="/" style={{ color: '#009de0' }}>Back to Home</Link>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Navbar /> {/* Rendered globally across all public and protected routes */}
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application Routes fenced directly by PrivateRoute */}
            <Route path="/" element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            } />
            
            <Route path="/restaurant/:id" element={
              <PrivateRoute>
                <RestaurantPlaceholder />
              </PrivateRoute>
            } />
            
            <Route path="/orders" element={
              <PrivateRoute>
                <OrdersPlaceholder />
              </PrivateRoute>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;