import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:3000'
  : 'http://localhost:3000';

let _token = null;

export const setToken = (token) => {
  _token = token;
};

export const clearToken = () => {
  _token = null;
};

async function request(method, path, body) {
  const headers = {
    'Content-Type': 'application/json',
    ...(_token && { Authorization: `Bearer ${_token}` }),
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new Error('Request failed');
      }
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Request failed');
  }

  return data;
}

export const register = (data) => request('POST', '/api/users', data);

export const login = (data) => request('POST', '/api/tokens', data);

export const fetchRestaurants = () => request('GET', '/api/restaurants');

export const fetchRestaurantById = (id) => request('GET', `/api/restaurants/${id}`);

export const fetchProducts = (restaurantId) =>
  request('GET', `/api/restaurants/${restaurantId}/products`);

export const searchRestaurants = (query) =>
  request('GET', `/api/search/${encodeURIComponent(query)}`);

export const fetchOrders = () => request('GET', '/api/orders');

export const fetchOrderById = (id) => request('GET', `/api/orders/${id}`);

export const createOrder = (data) => request('POST', '/api/orders', data);

export const fetchUserProfile = (userId) => request('GET', `/api/users/${userId}`);

export const fetchCurrentUser = () => request('GET', '/api/users/me');

export const updateProfile = (data) => request('PUT', '/api/users/me', data);

export const fetchMyRestaurants = () => request('GET', '/api/restaurants/my');

export const createRestaurant = (data) => request('POST', '/api/restaurants', data);

export const updateRestaurant = (id, data) =>
  request('PATCH', `/api/restaurants/${id}`, data);

export const deleteRestaurant = (id) =>
  request('DELETE', `/api/restaurants/${id}`);
