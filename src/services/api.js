import * as fakeDataService from './fakeData';

const API_URL = import.meta.env.VITE_API_URL;
const USE_FAKE_API = !API_URL || API_URL === 'undefined';

const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

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
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: createHeaders(false),
      body: JSON.stringify(credentials),
    });
    return handleResponse(response);
  },

  logout: async () => {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

export const productsApi = {
  getProducts: async (params = {}) => {
    if (USE_FAKE_API) {
      return fakeDataService.getFakeProducts();
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });

    const response = await fetch(`${API_URL}/products?${searchParams}/`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getProduct: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}/`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  createProduct: async (product) => {
    const response = await fetch(`${API_URL}/products/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(product),
    });
    return handleResponse(response);
  },

  updateProduct: async (id, updates) => {
    const response = await fetch(`${API_URL}/products/${id}/`, {
      method: 'PATCH',
      headers: createHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  deleteProduct: async (id) => {
    const response = await fetch(`${API_URL}/products/${id}/`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

export const stockApi = {
  getStock: async (params = {}) => {
    if (USE_FAKE_API) {
      return fakeDataService.getFakeStock();
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });

    const response = await fetch(`${API_URL}/stock?${searchParams}/`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  adjustStock: async (adjustment) => {
    const response = await fetch(`${API_URL}/stock/adjust/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(adjustment),
    });
    return handleResponse(response);
  },

  transferStock: async (transfer) => {
    const response = await fetch(`${API_URL}/stock/transfer/`, {
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
    
    const response = await fetch(`${API_URL}/suppliers?/${searchParams}/`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getSupplier: async (id) => {
    const response = await fetch(`${API_URL}/suppliers/${id}/`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  createSupplier: async (supplier) => {
    const response = await fetch(`${API_URL}/suppliers/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(supplier),
    });
    return handleResponse(response);
  },

  updateSupplier: async (id, updates) => {
    const response = await fetch(`${API_URL}/suppliers/${id}/`, {
      method: 'PUT',
      headers: createHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(response);
  },

  deleteSupplier: async (id) => {
    const response = await fetch(`${API_URL}/suppliers/${id}/`, {
      method: 'DELETE',
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

export const salesApi = {
  getSales: async (params = {}) => {
    if (USE_FAKE_API) {
      return fakeDataService.getFakeSales(params);
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });

    const response = await fetch(`${API_URL}/sales?${searchParams}/`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  getSale: async (id) => {
    if (USE_FAKE_API) {
      const allSales = await fakeDataService.getFakeSales();
      const sale = allSales.data.sales.find(s => s.id === id);
      return { data: { sale } };
    }

    const response = await fetch(`${API_URL}/sales/${id}/`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },

  createSale: async (sale) => {
    if (USE_FAKE_API) {
      return fakeDataService.addFakeSale(sale);
    }

    const response = await fetch(`${API_URL}/sales/`, {
      method: 'POST',
      headers: createHeaders(),
      body: JSON.stringify(sale),
    });
    return handleResponse(response);
  },

  processRefund: async (id, refundData) => {
    const response = await fetch(`${API_URL}/sales/${id}/`, {
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
    
    const response = await fetch(`${API_URL}/reports/sales?${searchParams}/`, {
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
    
    const response = await fetch(`${API_URL}/reports/stock?${searchParams}/`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

export const dashboardApi = {
  getSummary: async () => {
    if (USE_FAKE_API) {
      return fakeDataService.getDashboardStats();
    }

    const response = await fetch(`${API_URL}/dashboard/summary/`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  },
};

export const reportsDataApi = {
  getSalesReport: async (period = '30d') => {
    if (USE_FAKE_API) {
      return fakeDataService.getSalesReportData(period);
    }

    const response = await fetch(`${API_URL}/reports/sales?period=${period}`, {
      headers: createHeaders(),
    });
    return handleResponse(response);
  }
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