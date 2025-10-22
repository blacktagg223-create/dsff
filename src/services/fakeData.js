const STORAGE_KEYS = {
  PRODUCTS: 'erp_products',
  SALES: 'erp_sales',
  STOCK: 'erp_stock',
  LAST_UPDATED: 'erp_last_updated'
};

const NETWORK_DELAY = { min: 200, max: 600 };

const simulateDelay = () => {
  const delay = Math.random() * (NETWORK_DELAY.max - NETWORK_DELAY.min) + NETWORK_DELAY.min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

const initialProducts = [
  {
    id: 1,
    sku: 'PRD001',
    name: 'Bananes Bio',
    category: 'Fruits & Légumes',
    price: 2500,
    cost: 1500,
    barcode: '1234567890123',
    image: 'https://images.pexels.com/photos/2238309/pexels-photo-2238309.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 2,
    sku: 'PRD002',
    name: 'Lait Entier 1L',
    category: 'Produits Laitiers',
    price: 1890,
    cost: 1200,
    barcode: '1234567890124',
    image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 3,
    sku: 'PRD003',
    name: 'Pain de Mie',
    category: 'Boulangerie',
    price: 3490,
    cost: 2000,
    barcode: '1234567890125',
    image: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 4,
    sku: 'PRD004',
    name: 'Tomates Fraîches',
    category: 'Fruits & Légumes',
    price: 3200,
    cost: 2100,
    barcode: '1234567890126',
    image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 5,
    sku: 'PRD005',
    name: 'Yaourt Nature x4',
    category: 'Produits Laitiers',
    price: 2350,
    cost: 1400,
    barcode: '1234567890127',
    image: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 6,
    sku: 'PRD006',
    name: 'Baguette Tradition',
    category: 'Boulangerie',
    price: 1200,
    cost: 700,
    barcode: '1234567890128',
    image: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 7,
    sku: 'PRD007',
    name: 'Pommes Golden',
    category: 'Fruits & Légumes',
    price: 2800,
    cost: 1800,
    barcode: '1234567890129',
    image: 'https://images.pexels.com/photos/672101/pexels-photo-672101.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 8,
    sku: 'PRD008',
    name: 'Fromage Emmental',
    category: 'Produits Laitiers',
    price: 4500,
    cost: 3000,
    barcode: '1234567890130',
    image: 'https://images.pexels.com/photos/821365/pexels-photo-821365.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 9,
    sku: 'PRD009',
    name: 'Croissants x6',
    category: 'Boulangerie',
    price: 5400,
    cost: 3200,
    barcode: '1234567890131',
    image: 'https://images.pexels.com/photos/2135677/pexels-photo-2135677.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 10,
    sku: 'PRD010',
    name: 'Carottes Bio',
    category: 'Fruits & Légumes',
    price: 2100,
    cost: 1300,
    barcode: '1234567890132',
    image: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 11,
    sku: 'PRD011',
    name: 'Eau Minérale 6x1.5L',
    category: 'Boissons',
    price: 3900,
    cost: 2500,
    barcode: '1234567890133',
    image: 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: 12,
    sku: 'PRD012',
    name: 'Jus d\'Orange 1L',
    category: 'Boissons',
    price: 2700,
    cost: 1700,
    barcode: '1234567890134',
    image: 'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

const initialStock = [
  { product_id: 1, current_stock: 45, min_stock: 20, max_stock: 100 },
  { product_id: 2, current_stock: 12, min_stock: 30, max_stock: 80 },
  { product_id: 3, current_stock: 25, min_stock: 15, max_stock: 60 },
  { product_id: 4, current_stock: 38, min_stock: 25, max_stock: 80 },
  { product_id: 5, current_stock: 22, min_stock: 20, max_stock: 70 },
  { product_id: 6, current_stock: 8, min_stock: 10, max_stock: 50 },
  { product_id: 7, current_stock: 55, min_stock: 30, max_stock: 100 },
  { product_id: 8, current_stock: 18, min_stock: 15, max_stock: 50 },
  { product_id: 9, current_stock: 14, min_stock: 12, max_stock: 40 },
  { product_id: 10, current_stock: 32, min_stock: 20, max_stock: 70 },
  { product_id: 11, current_stock: 5, min_stock: 15, max_stock: 60 },
  { product_id: 12, current_stock: 28, min_stock: 20, max_stock: 80 }
];

const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(initialProducts));
  }

  if (!localStorage.getItem(STORAGE_KEYS.STOCK)) {
    localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(initialStock));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
    const initialSales = generateInitialSales();
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(initialSales));
  }

  updateLastUpdatedTime();
};

const generateInitialSales = () => {
  const sales = [];
  const products = initialProducts;

  for (let i = 0; i < 45; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));

    const numItems = Math.floor(Math.random() * 5) + 1;
    const items = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const totalPrice = product.price * quantity;

      items.push({
        productId: product.id,
        sku: product.sku,
        name: product.name,
        quantity,
        unitPrice: product.price,
        totalPrice
      });

      subtotal += totalPrice;
    }

    const tax = Math.round(subtotal * 0.2);
    const total = subtotal + tax;

    sales.push({
      id: 1000 + i,
      transactionId: `TXN-${date.getTime()}-${i}`,
      date: date.toISOString(),
      items,
      subtotal,
      tax,
      total,
      paymentMethod: Math.random() > 0.5 ? 'cash' : 'card',
      cashier: ['Alice Dubois', 'Bob Martin', 'Claire Durand'][Math.floor(Math.random() * 3)],
      customerId: null,
      status: 'completed'
    });
  }

  return sales.sort((a, b) => new Date(b.date) - new Date(a.date));
};

const updateLastUpdatedTime = () => {
  localStorage.setItem(STORAGE_KEYS.LAST_UPDATED, new Date().toISOString());
};

export const getLastUpdated = () => {
  return localStorage.getItem(STORAGE_KEYS.LAST_UPDATED) || new Date().toISOString();
};

export const getFakeProducts = async () => {
  await simulateDelay();
  initializeData();

  const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  const stock = JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK) || '[]');

  const productsWithStock = products.map(product => {
    const stockItem = stock.find(s => s.product_id === product.id);
    return {
      ...product,
      stock: stockItem?.current_stock || 0
    };
  });

  return {
    data: {
      products: productsWithStock
    }
  };
};

export const getFakeStock = async () => {
  await simulateDelay();
  initializeData();

  const stockItems = JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK) || '[]');

  return {
    data: {
      stockItems
    }
  };
};

export const getFakeSales = async (filters = {}) => {
  await simulateDelay();
  initializeData();

  let sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES) || '[]');

  if (filters.startDate) {
    const startDate = new Date(filters.startDate);
    sales = sales.filter(sale => new Date(sale.date) >= startDate);
  }

  if (filters.endDate) {
    const endDate = new Date(filters.endDate);
    sales = sales.filter(sale => new Date(sale.date) <= endDate);
  }

  if (filters.limit) {
    sales = sales.slice(0, filters.limit);
  }

  return {
    data: {
      sales
    }
  };
};

export const addFakeSale = async (saleData) => {
  await simulateDelay();
  initializeData();

  const sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES) || '[]');

  const newSale = {
    ...saleData,
    id: Date.now(),
    transactionId: `TXN-${Date.now()}`,
    date: new Date().toISOString(),
    status: 'completed'
  };

  sales.unshift(newSale);
  localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(sales));

  await updateStockAfterSale(saleData.items);
  updateLastUpdatedTime();

  return {
    data: {
      sale: newSale
    }
  };
};

export const updateStockAfterSale = async (items) => {
  const stock = JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK) || '[]');

  items.forEach(item => {
    const stockItem = stock.find(s => s.product_id === item.productId);
    if (stockItem) {
      stockItem.current_stock = Math.max(0, stockItem.current_stock - item.quantity);
    }
  });

  localStorage.setItem(STORAGE_KEYS.STOCK, JSON.stringify(stock));
  updateLastUpdatedTime();
};

export const getDashboardStats = async () => {
  await simulateDelay();
  initializeData();

  const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');
  const stock = JSON.parse(localStorage.getItem(STORAGE_KEYS.STOCK) || '[]');
  const sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES) || '[]');

  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const recentSales = sales.filter(sale => new Date(sale.date) >= last30Days);

  const totalSales = recentSales.reduce((sum, sale) => sum + sale.total, 0);
  const totalTransactions = recentSales.length;
  const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  const totalStockValue = stock.reduce((sum, item) => {
    const product = products.find(p => p.id === item.product_id);
    return sum + (item.current_stock * (product?.cost || 0));
  }, 0);

  const lowStockCount = stock.filter(item => item.current_stock <= item.min_stock).length;
  const outOfStockCount = stock.filter(item => item.current_stock === 0).length;

  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const salesLast7Days = sales.filter(sale => new Date(sale.date) >= last7Days);

  const salesByDay = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const daySales = salesLast7Days.filter(sale =>
      sale.date.split('T')[0] === dateStr
    );

    const dayTotal = daySales.reduce((sum, sale) => sum + sale.total, 0);
    const dayTransactions = daySales.length;

    salesByDay.push({
      date: dateStr,
      sales: dayTotal,
      transactions: dayTransactions
    });
  }

  return {
    data: {
      stats: {
        totalSales,
        totalRevenue: totalSales,
        totalTransactions,
        averageTicket,
        totalStockValue,
        lowStockCount,
        outOfStockCount,
        totalProducts: products.length
      },
      salesByDay,
      lastUpdated: getLastUpdated()
    }
  };
};

export const getSalesReportData = async (period = '30d') => {
  await simulateDelay();
  initializeData();

  const sales = JSON.parse(localStorage.getItem(STORAGE_KEYS.SALES) || '[]');
  const products = JSON.parse(localStorage.getItem(STORAGE_KEYS.PRODUCTS) || '[]');

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const filteredSales = sales.filter(sale => new Date(sale.date) >= startDate);

  const salesByDay = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const daySales = filteredSales.filter(sale =>
      sale.date.split('T')[0] === dateStr
    );

    const dayTotal = daySales.reduce((sum, sale) => sum + sale.total, 0);
    const dayTransactions = daySales.length;

    salesByDay.push({
      date: dateStr,
      sales: dayTotal,
      transactions: dayTransactions
    });
  }

  const productSales = {};
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          productId: item.productId,
          name: item.name,
          quantity: 0,
          revenue: 0
        };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.totalPrice;
    });
  });

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const categorySales = {};
  filteredSales.forEach(sale => {
    sale.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      const category = product?.category || 'Autre';

      if (!categorySales[category]) {
        categorySales[category] = { category, revenue: 0, quantity: 0 };
      }
      categorySales[category].revenue += item.totalPrice;
      categorySales[category].quantity += item.quantity;
    });
  });

  return {
    data: {
      salesByDay,
      topProducts,
      categorySales: Object.values(categorySales),
      totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.total, 0),
      totalTransactions: filteredSales.length
    }
  };
};

export const resetFakeData = () => {
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.SALES);
  localStorage.removeItem(STORAGE_KEYS.STOCK);
  localStorage.removeItem(STORAGE_KEYS.LAST_UPDATED);
  initializeData();
};

initializeData();
