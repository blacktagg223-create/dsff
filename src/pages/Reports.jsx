import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChartBar as BarChart3, TrendingUp, Calendar, Download, ListFilter as Filter } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import mockApi from '../services/api';
import useStore from '../store/useStore';

const Reports = () => {
  const { products } = useStore();
  const [period, setPeriod] = useState('30d');

  const { data: salesData, isLoading } = useQuery({
    queryKey: ['sales-data', period],
    queryFn: () => mockApi.getSalesData(period)
  });

  // Generate category data
  const categoryData = products.reduce((acc, product) => {
    const existing = acc.find(item => item.category === product.category);
    if (existing) {
      existing.value += product.stock * product.price;
      existing.products += 1;
    } else {
      acc.push({
        category: product.category,
        value: product.stock * product.price,
        products: 1
      });
    }
    return acc;
  }, []);

  // Generate top products data
  const topProducts = products
    .sort((a, b) => (b.stock * b.price) - (a.stock * a.price))
    .slice(0, 5)
    .map(product => ({
      name: product.name,
      value: product.stock * product.price,
      stock: product.stock
    }));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const periodOptions = [
    { value: '7d', label: '7 derniers jours' },
    { value: '30d', label: '30 derniers jours' },
    { value: '90d', label: '3 derniers mois' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rapports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Analyse des performances de votre magasin
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <Card.Content className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ventes totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {salesData?.reduce((sum, day) => sum + day.sales, 0)?.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) || '€0'}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {salesData?.reduce((sum, day) => sum + day.transactions, 0) || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ticket moyen</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {salesData && salesData.length > 0 ?
                  (salesData.reduce((sum, day) => sum + day.sales, 0) / salesData.reduce((sum, day) => sum + day.transactions, 0)).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                  : '€0'
                }
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Catégories</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {categoryData.length}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <Filter className="w-6 h-6 text-purple-600" />
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Evolution */}
        <Card>
          <Card.Header>
            <Card.Title>Évolution des ventes</Card.Title>
            <Card.Description>
              Ventes quotidiennes sur {periodOptions.find(p => p.value === period)?.label.toLowerCase()}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
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

        {/* Transactions */}
        <Card>
          <Card.Header>
            <Card.Title>Nombre de transactions</Card.Title>
            <Card.Description>
              Transactions quotidiennes
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <Card.Header>
            <Card.Title>Répartition par catégorie</Card.Title>
            <Card.Description>
              Valeur du stock par catégorie
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`€${value.toLocaleString()}`, 'Valeur']} />
              </PieChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>

        {/* Top Products */}
        <Card>
          <Card.Header>
            <Card.Title>Top produits par valeur stock</Card.Title>
            <Card.Description>
              Produits avec la plus haute valeur en stock
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip 
                  formatter={(value) => [`€${value.toLocaleString()}`, 'Valeur stock']}
                />
                <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Reports;