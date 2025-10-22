import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Calendar, Download, BarChart as BarChartIcon } from 'lucide-react';
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
import { productsApi, stockApi, reportsDataApi } from '../services/api';
import toast from 'react-hot-toast';

const Reports = () => {
  const [period, setPeriod] = useState('30d');
  const [reportType, setReportType] = useState('ventes');

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getProducts(),
  });

  const { data: stockData, isLoading: stockLoading } = useQuery({
    queryKey: ['stock'],
    queryFn: stockApi.getStock
  });

  const { data: salesReportData, isLoading: salesLoading } = useQuery({
    queryKey: ['salesReport', period],
    queryFn: () => reportsDataApi.getSalesReport(period),
  });

  const products = productsData?.data?.products || [];
  const stockItems = stockData?.data?.stockItems || [];
  const salesReport = salesReportData?.data || {};

  const salesByDay = salesReport.salesByDay || [];
  const topProducts = salesReport.topProducts || [];
  const categorySales = salesReport.categorySales || [];

  const stockComparisonData = stockItems.map(item => {
    const product = products.find(p => p.id === item.product_id);
    return {
      name: product?.name?.substring(0, 15) + '...' || 'Produit',
      currentStock: item.current_stock,
      minStock: item.min_stock,
      stockValue: item.current_stock * (product?.cost || product?.price || 0)
    };
  }).slice(0, 10);

  const totalRevenue = salesReport.totalRevenue || 0;
  const totalTransactions = salesReport.totalTransactions || 0;
  const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const totalStockValue = stockItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.product_id);
    return sum + (item.current_stock * (product?.cost || 0));
  }, 0);

  const lowStockCount = stockItems.filter(item => item.current_stock <= item.min_stock).length;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const handleExport = () => {
    try {
      let dataToExport = [];
      let filename = `rapport_${reportType}_${new Date().toISOString().split('T')[0]}`;

      if (reportType === 'ventes') {
        if (salesByDay.length > 0) {
          dataToExport = salesByDay.map(item => ({
            'Date': item.date,
            'Ventes (XOF)': item.sales,
            'Transactions': item.transactions
          }));
        }
      } else if (reportType === 'stocks') {
        if (stockComparisonData.length > 0) {
          dataToExport = stockComparisonData.map(item => ({
            'Produit': item.name,
            'Stock Actuel': item.currentStock,
            'Stock Minimum': item.minStock,
            'Valeur Stock (XOF)': item.stockValue.toFixed(0),
            'Statut': item.currentStock <= item.minStock ? 'Stock faible' : 'Stock normal'
          }));
        }
      } else if (reportType === 'revenus') {
        if (topProducts.length > 0) {
          dataToExport = topProducts.map(item => ({
            'Produit': item.name,
            'Quantité Vendue': item.quantity,
            'Revenu (XOF)': item.revenue
          }));
        }
      }

      if (!dataToExport.length) {
        toast.error('Aucune donnée à exporter');
        return;
      }

      const headers = Object.keys(dataToExport[0]);
      const csvRows = [
        headers.join(','),
        ...dataToExport.map(row =>
          headers.map(header => {
            const value = row[header] ?? '';
            const stringValue = value.toString().replace(/"/g, '""');
            return stringValue.includes(',') || stringValue.includes('"')
              ? `"${stringValue}"`
              : stringValue;
          }).join(',')
        )
      ];
      const csvString = csvRows.join('\n');

      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);

      toast.success('Rapport exporté avec succès');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erreur lors de l\'exportation');
    }
  };

  const periodOptions = [
    { value: '7d', label: '7 derniers jours' },
    { value: '30d', label: '30 derniers jours' },
    { value: '90d', label: '3 derniers mois' }
  ];

  const reportTypes = [
    { value: 'ventes', label: 'Ventes' },
    { value: 'stocks', label: 'Stocks' },
    { value: 'revenus', label: 'Revenus' }
  ];

  if (productsLoading || stockLoading || salesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Rapports</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Analyse des performances de votre magasin
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            {reportTypes.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            {periodOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="animate-fade-in">
          <Card.Content className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ventes totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Derniers {period === '7d' ? '7 jours' : period === '30d' ? '30 jours' : '90 jours'}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </Card.Content>
        </Card>

        <Card className="animate-fade-in">
          <Card.Content className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalTransactions}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Nombre total</p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <BarChartIcon className="w-6 h-6 text-emerald-600" />
            </div>
          </Card.Content>
        </Card>

        <Card className="animate-fade-in">
          <Card.Content className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ticket moyen</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {averageTicket.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Par transaction</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </Card.Content>
        </Card>

        <Card className="animate-fade-in">
          <Card.Content className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valeur stock</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalStockValue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{lowStockCount} alerte(s)</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <BarChartIcon className="w-6 h-6 text-blue-600" />
            </div>
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <Card.Header>
            <Card.Title>Évolution des ventes</Card.Title>
            <Card.Description>
              Chiffre d'affaires sur {periodOptions.find(p => p.value === period)?.label.toLowerCase()}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            {salesByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString('fr-FR')} XOF`, 'Ventes']}
                    labelFormatter={(label) => `Date: ${label}`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
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
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </Card.Content>
        </Card>

        <Card className="animate-fade-in">
          <Card.Header>
            <Card.Title>Stock vs Stock Minimum</Card.Title>
            <Card.Description>
              Comparaison des niveaux de stock (Top 10)
            </Card.Description>
          </Card.Header>
          <Card.Content>
            {stockComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stockComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    tick={{ fill: '#6B7280', fontSize: 10 }}
                  />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'currentStock' ? 'Stock actuel' : 'Stock minimum']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  />
                  <Legend />
                  <Bar dataKey="currentStock" fill="#10B981" name="Stock actuel" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="minStock" fill="#F59E0B" name="Stock minimum" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <Card.Header>
            <Card.Title>Répartition par catégorie</Card.Title>
            <Card.Description>
              Chiffre d'affaires par catégorie de produits
            </Card.Description>
          </Card.Header>
          <Card.Content>
            {categorySales.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categorySales}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {categorySales.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString('fr-FR')} XOF`, 'Revenu']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </Card.Content>
        </Card>

        <Card className="animate-fade-in">
          <Card.Header>
            <Card.Title>Top 10 produits</Card.Title>
            <Card.Description>
              Produits les plus vendus par revenu
            </Card.Description>
          </Card.Header>
          <Card.Content>
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topProducts.slice(0, 10)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                  <XAxis type="number" tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    tick={{ fill: '#6B7280', fontSize: 10 }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value.toLocaleString('fr-FR')} XOF`, 'Revenu']}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem' }}
                  />
                  <Bar dataKey="revenue" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-400">
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
