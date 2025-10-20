// Mock API service
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simulate API responses
const mockApi = {
  // Products
  getProducts: async (filters = {}) => {
    await delay(300);
    // In a real app, this would be a fetch call
    return {
      data: JSON.parse(localStorage.getItem('supermarket-erp-store'))?.state?.products || [],
      total: 100,
      page: 1,
      limit: 10
    };
  },

  getProduct: async (id) => {
    await delay(200);
    const products = JSON.parse(localStorage.getItem('supermarket-erp-store'))?.state?.products || [];
    return products.find(p => p.id === id);
  },

  createProduct: async (product) => {
    await delay(500);
    return { ...product, id: Date.now() };
  },

  updateProduct: async (id, updates) => {
    await delay(400);
    return { id, ...updates };
  },

  deleteProduct: async (id) => {
    await delay(300);
    return { success: true };
  },

  // Suppliers
  getSuppliers: async () => {
    await delay(300);
    return JSON.parse(localStorage.getItem('supermarket-erp-store'))?.state?.suppliers || [];
  },

  // Sales
  getSalesData: async (period = '7d') => {
    await delay(400);
    
    // Generate mock sales data
    const data = [];
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 5000) + 1000,
        transactions: Math.floor(Math.random() * 100) + 20
      });
    }
    
    return data;
  },

  // Dashboard stats
  getDashboardStats: async () => {
    await delay(200);
    
    const products = JSON.parse(localStorage.getItem('supermarket-erp-store'))?.state?.products || [];
    const lowStockProducts = products.filter(p => p.stock <= p.minStock);
    
    return {
      totalSales: 156789.45,
      todaySales: 12345.67,
      totalProducts: products.length,
      lowStockCount: lowStockProducts.length,
      totalTransactions: 1547,
      averageTransaction: 45.67
    };
  }
};

export default mockApi;