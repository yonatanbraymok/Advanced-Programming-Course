import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PrivateRoute } from './contexts/PrivateRoute';
import { RegisterPage } from './components/RegisterPage';
import { LoginPage } from './components/LoginPage'; // Import the real LoginPage component

// Temporary placeholder components for remaining application views
const HomePlaceholder = () => (
  <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
    <h2>Home Page (Protected Screen) 🏠</h2>
    <nav>
      <Link to="/orders">View Orders</Link> | <Link to="/restaurant/123">View Restaurant 123</Link>
    </nav>
  </div>
);

const RestaurantPlaceholder = () => (
  <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
    <h2>Restaurant Detail Page (Protected Screen) 🍔</h2>
    <Link to="/">Back to Home</Link>
  </div>
);

const OrdersPlaceholder = () => (
  <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
    <h2>Order History Page (Protected Screen) 📦</h2>
    <Link to="/">Back to Home</Link>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} /> {/* Connected the real LoginPage */}
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application Routes fenced by PrivateRoute */}
            <Route path="/" element={
              <PrivateRoute>
                <HomePlaceholder />
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