import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Package, TriangleAlert as AlertTriangle, DollarSign, ShoppingCart, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import { dashboardApi, reportsApi, productsApi } from '../services/api';
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
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.getSummary
  });

  const { data: salesData, isLoading: salesLoading, error: salesError } = useQuery({
    queryKey: ['sales-data', '7d'],
    queryFn: () => reportsApi.getSalesReport({ from: getDateDaysAgo(7), to: getTodayDate(), groupBy: 'day' })
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getProducts()
  });

  // Helper functions for date formatting
  const getDateDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const products = productsData?.data?.products || [];
  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const salesChartData = salesData?.data?.dailyData || [];

  const statCards = [
    {
      title: 'Ventes du jour',
      value: stats?.data?.sales?.today?.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) || '€0',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      title: 'Ventes totales',
      value: stats?.data?.sales?.thisMonth?.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) || '€0',
      change: '+8.2%',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Produits',
      value: stats?.data?.products?.total || 0,
      change: '+3',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Stock faible',
      value: stats?.data?.products?.lowStock || 0,
      change: '-2',
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  if (statsLoading || salesLoading || productsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (statsError || salesError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Erreur lors du chargement des données</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {statsError?.message || salesError?.message}
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
            <Card.Title>Évolution des ventes</Card.Title>
            <Card.Description>Ventes des 7 derniers jours</Card.Description>
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
            <Card.Title>Transactions</Card.Title>
            <Card.Description>Nombre de transactions par jour</Card.Description>
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
      {lowStockProducts.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-800">
          <Card.Header className="bg-orange-50 dark:bg-orange-900/20">
            <Card.Title className="flex items-center text-orange-800 dark:text-orange-200">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Alerte Stock Faible
            </Card.Title>
            <Card.Description className="text-orange-700 dark:text-orange-300">
              {lowStockProducts.length} produit(s) nécessitent un réapprovisionnement
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {lowStockProducts.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      Stock: {product.stock}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Min: {product.minStock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;