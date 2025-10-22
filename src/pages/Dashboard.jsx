import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Package, TriangleAlert as AlertTriangle, DollarSign, ShoppingCart, Users, Clock } from 'lucide-react';
import Card from '../components/ui/Card';
import { productsApi, stockApi, dashboardApi } from '../services/api';
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
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getProducts()
  });

  const { data: stockData, isLoading: stockLoading, error: stockError } = useQuery({
    queryKey: ['stock'],
    queryFn: stockApi.getStock
  });

  const { data: dashboardData, isLoading: dashboardLoading, error: dashboardError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardApi.getSummary
  });

  const products = productsData?.data?.products || [];
  const stockItems = stockData?.data?.stockItems || [];
  const stats = dashboardData?.data?.stats || {};
  const salesByDay = dashboardData?.data?.salesByDay || [];
  const lastUpdated = dashboardData?.data?.lastUpdated;

  const lowStockItems = stockItems.filter(item => item.current_stock <= item.min_stock);
  const outOfStockItems = stockItems.filter(item => item.current_stock === 0);

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return date.toLocaleDateString('fr-FR');
  };

  const statCards = [
    {
      title: 'Chiffre d\'affaires',
      value: (stats.totalRevenue || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }),
      change: `${stats.totalTransactions || 0} transactions`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      title: 'Ticket moyen',
      value: (stats.averageTicket || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }),
      change: 'Derniers 30 jours',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Stock faible',
      value: stats.lowStockCount || lowStockItems.length,
      change: `${stats.outOfStockCount || outOfStockItems.length} rupture(s)`,
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'Valeur du stock',
      value: (stats.totalStockValue || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }),
      change: `${stats.totalProducts || 0} produits`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    }
  ];

  if (productsLoading || stockLoading || dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (productsError || stockError || dashboardError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Erreur lors du chargement des données</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {productsError?.message || stockError?.message || dashboardError?.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Aperçu de votre activité commerciale
          </p>
        </div>
        {lastUpdated && (
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-1" />
            Mis à jour {formatLastUpdated(lastUpdated)}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-all duration-200 hover:-translate-y-1 animate-fade-in">
              <Card.Content className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.change}</p>
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
        <Card className="animate-fade-in">
          <Card.Header>
            <Card.Title>Évolution des ventes</Card.Title>
            <Card.Description>Chiffre d'affaires des 7 derniers jours</Card.Description>
          </Card.Header>
          <Card.Content>
            {salesByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6B7280' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fill: '#6B7280' }} />
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString('fr-FR')} XOF`, 'Ventes']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#3B82F6' }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>Aucune donnée de ventes disponible</p>
              </div>
            )}
          </Card.Content>
        </Card>

        <Card className="animate-fade-in">
          <Card.Header>
            <Card.Title>Volume de transactions</Card.Title>
            <Card.Description>Nombre de ventes par jour</Card.Description>
          </Card.Header>
          <Card.Content>
            {salesByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6B7280' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fill: '#6B7280' }} />
                  <Tooltip
                    formatter={(value) => [value, 'Transactions']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="transactions" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>Aucune donnée de transactions disponible</p>
              </div>
            )}
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