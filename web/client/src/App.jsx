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
import { OwnerRestaurantList } from './components/OwnerRestaurantList';
import { RestaurantEditor } from './components/RestaurantEditor';
import { CartProvider } from './contexts/CartContext';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <BrowserRouter>
            <Navbar />
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route path="/" element={<HomePage />} />
              
              <Route path="/restaurant/:id" element={<RestaurantDetailPage />} />
              
              <Route path="/orders" element={
                <PrivateRoute>
                  <OrdersPage />
                </PrivateRoute>
              } />

              <Route path="/owner/restaurants" element={
                <PrivateRoute>
                  <OwnerRestaurantList />
                </PrivateRoute>
              } />

              <Route path="/owner/restaurants/edit/:id?" element={
                <PrivateRoute>
                  <RestaurantEditor />
                </PrivateRoute>
              } />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;