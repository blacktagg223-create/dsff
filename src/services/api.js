// API service for SuperMarket ERP
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper function to create headers
const createHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Authentication API
export const authApi = {
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Products API
export const productsApi = {
  getProducts: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    const response = await fetch(`${API_URL}/api/products?${searchParams}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getProduct: async (id) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  createProduct: async (product) => {
    const response = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(product),
    });
    return handleResponse(response);
  },

  updateProduct: async (id, updates) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  deleteProduct: async (id) => {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Stock API
export const stockApi = {
  getStock: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    const response = await fetch(`${API_URL}/api/stock?${searchParams}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  adjustStock: async (adjustment) => {
    const response = await fetch(`${API_URL}/api/stock/adjust`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(adjustment),
    });
    return handleResponse(response);
  },

  transferStock: async (transfer) => {
    const response = await fetch(`${API_URL}/api/stock/transfer`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(transfer),
    });
    return handleResponse(response);
  },
};

// Suppliers API
export const suppliersApi = {
  getSuppliers: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    const response = await fetch(`${API_URL}/api/suppliers?${searchParams}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getSupplier: async (id) => {
    const response = await fetch(`${API_URL}/api/suppliers/${id}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  createSupplier: async (supplier) => {
    const response = await fetch(`${API_URL}/api/suppliers`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(supplier),
    });
    return handleResponse(response);
  },

  updateSupplier: async (id, updates) => {
    const response = await fetch(`${API_URL}/api/suppliers/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  deleteSupplier: async (id) => {
    const response = await fetch(`${API_URL}/api/suppliers/${id}`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Sales API
export const salesApi = {
  getSales: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    const response = await fetch(`${API_URL}/api/sales?${searchParams}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getSale: async (id) => {
    const response = await fetch(`${API_URL}/api/sales/${id}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  createSale: async (sale) => {
    const response = await fetch(`${API_URL}/api/sales`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(sale),
    });
    return handleResponse(response);
  },

  processRefund: async (id, refundData) => {
    const response = await fetch(`${API_URL}/api/sales/${id}`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(refundData),
    });
    return handleResponse(response);
  },
};

// Reports API
export const reportsApi = {
  getSalesReport: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    const response = await fetch(`${API_URL}/api/reports/sales?${searchParams}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getStockReport: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    
    const response = await fetch(`${API_URL}/api/reports/stock?${searchParams}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Dashboard API
export const dashboardApi = {
  getSummary: async () => {
    const response = await fetch(`${API_URL}/api/dashboard/summary`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

// Legacy exports for backward compatibility
export default {
  getProducts: () => productsApi.getProducts(),
  getProduct: (id) => productsApi.getProduct(id),
  createProduct: (product) => productsApi.createProduct(product),
  updateProduct: (id, updates) => productsApi.updateProduct(id, updates),
  deleteProduct: (id) => productsApi.deleteProduct(id),
  getSuppliers: () => suppliersApi.getSuppliers(),
  getSalesData: (period) => reportsApi.getSalesReport({ period }),
  getDashboardStats: () => dashboardApi.getSummary(),
};