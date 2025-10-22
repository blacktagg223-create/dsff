import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Package, TriangleAlert as AlertTriangle, DollarSign, ShoppingCart, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import { productsApi, stockApi } from '../services/api';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const Dashboard = () => {
  // Fetch products data
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getProducts()
  });

  // Fetch stock data
  const { data: stockData, isLoading: stockLoading, error: stockError } = useQuery({
    queryKey: ['stock'],
    queryFn: stockApi.getStock
  });

  const products = productsData?.data?.products || [];
  const stockItems = stockData?.data?.stockItems || [];

  console.log('Dashboard - Products data:', products);
  console.log('Dashboard - Stock data:', stockItems);

  // Compute dashboard metrics
  const totalProducts = products.length;
  const totalStockValue = stockItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.product_id);
    return sum + (item.current_stock * (product?.cost || product?.price || 0));
  }, 0);
  
  const lowStockItems = stockItems.filter(item => item.current_stock <= item.min_stock);
  const outOfStockItems = stockItems.filter(item => item.current_stock === 0);

  console.log('Dashboard - Computed metrics:', {
    totalProducts,
    totalStockValue,
    lowStockCount: lowStockItems.length,
    outOfStockCount: outOfStockItems.length
  });

  // Generate mock sales data for charts (last 7 days)
  const generateMockSalesData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 5000) + 2000,
        transactions: Math.floor(Math.random() * 50) + 20
      });
    }
    return data;
  };

  const salesChartData = generateMockSalesData();

  const statCards = [
    {
      title: 'Valeur du stock',
      value: totalStockValue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }),
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      title: 'Total produits',
      value: totalProducts,
      change: '+8.2%',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Stock faible',
      value: lowStockItems.length,
      change: '-2',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'Ruptures',
      value: outOfStockItems.length,
      change: '0',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  if (productsLoading || stockLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (productsError || stockError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Erreur lors du chargement des données</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {productsError?.message || stockError?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Aperçu de votre activité commerciale
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <Card.Content className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {stat.value}
                  </p>
                  <p className={`text-sm ${stat.color} mt-1`}>{stat.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </Card.Content>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <Card>
          <Card.Header>
            <Card.Title>Évolution des ventes (simulée)</Card.Title>
            <Card.Description>Données simulées des 7 derniers jours</Card.Description>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`€${value.toLocaleString()}`, 'Ventes']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>

        {/* Transactions Chart */}
        <Card>
          <Card.Header>
            <Card.Title>Transactions (simulées)</Card.Title>
            <Card.Description>Données simulées par jour</Card.Description>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [value, 'Transactions']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="transactions" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <Card.Header className="bg-orange-50 dark:bg-orange-900/20">
            <Card.Title className="flex items-center text-orange-800 dark:text-orange-200">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Alerte Stock Faible
            </Card.Title>
            <Card.Description className="text-orange-700 dark:text-orange-300">
              {lowStockItems.length} produit(s) nécessitent un réapprovisionnement
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {lowStockItems.slice(0, 5).map((item) => {
                const product = products.find(p => p.id === item.product_id);
                return (
                <div key={item.product_id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{product?.name || 'Produit inconnu'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {product?.sku || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      Stock: {item.current_stock}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Min: {item.min_stock}
                    </p>
                  </div>
                </div>
                );
              })}
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;