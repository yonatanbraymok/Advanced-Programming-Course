import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PrivateRoute } from './contexts/PrivateRoute';
import { RegisterPage } from './components/RegisterPage';
import { LoginPage } from './components/LoginPage';
import { HomePage } from './components/HomePage';
import { RestaurantDetailPage } from './components/RestaurantDetailPage';
import { OrdersPage } from './components/OrdersPage';
import { Navbar } from './components/Navbar';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Navbar />
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
                <RestaurantDetailPage />
              </PrivateRoute>
            } />
            
            <Route path="/orders" element={
              <PrivateRoute>
                <OrdersPage /> {/* Connected the OrdersPage */}
              </PrivateRoute>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;