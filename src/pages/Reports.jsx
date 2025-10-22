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
import { productsApi, stockApi } from '../services/api';

const Reports = () => {
  const [period, setPeriod] = useState('30d');

  // Fetch products for category analysis
  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getProducts(),
  });

  // Fetch stock data
  const { data: stockData, isLoading: stockLoading, error: stockError } = useQuery({
    queryKey: ['stock'],
    queryFn: stockApi.getStock
  });

  const products = productsData?.data?.products || [];
  const stockItems = stockData?.data?.stockItems || [];

  console.log('Reports - Products data:', products);
  console.log('Reports - Stock data:', stockItems);

  // Generate stock vs min stock comparison data
  const stockComparisonData = stockItems.map(item => {
    const product = products.find(p => p.id === item.product_id);
    return {
      name: product?.name?.substring(0, 15) + '...' || 'Produit',
      currentStock: item.current_stock,
      minStock: item.min_stock,
      stockValue: item.current_stock * (product?.cost || product?.price || 0)
    };
  }).slice(0, 10); // Limit to 10 items for readability

  // Generate category data
  const categoryData = products.reduce((acc, product) => {
    const stockItem = stockItems.find(item => item.product_id === product.id);
    const stockValue = (stockItem?.current_stock || 0) * (product.cost || product.price || 0);
    
    const existing = acc.find(item => item.category === product.category);
    if (existing) {
      existing.value += stockValue;
      existing.products += 1;
    } else {
      acc.push({
        category: product.category,
        value: stockValue,
        products: 1
      });
    }
    return acc;
  }, []);

  console.log('Reports - Category data:', categoryData);
  console.log('Reports - Stock comparison data:', stockComparisonData);

  // Generate top products by stock value
  const topProducts = stockItems
    .map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        name: product?.name || 'Produit inconnu',
        value: item.current_stock * (product?.cost || product?.price || 0),
        stock: item.current_stock
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map(item => ({
      ...item,
      name: item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name
    }));

  // Generate mock sales data for demonstration
  const generateMockSalesData = () => {
    const data = [];
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
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

  const mockSalesData = generateMockSalesData();

  // Calculate summary statistics
  const totalStockValue = stockItems.reduce((sum, item) => {
    const product = products.find(p => p.id === item.product_id);
    return sum + (item.current_stock * (product?.cost || product?.price || 0));
  }, 0);

  const totalProducts = products.length;
  const lowStockCount = stockItems.filter(item => item.current_stock <= item.min_stock).length;
  const outOfStockCount = stockItems.filter(item => item.current_stock === 0).length;

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Export functionality
  const handleExport = () => {
    try {
      // Determine what data to export based on available data
      let dataToExport = [];
      let filename = `rapport_${new Date().toISOString().split('T')[0]}`;

      // Priority: Stock comparison data (most detailed)
      if (stockComparisonData && stockComparisonData.length > 0) {
        dataToExport = stockComparisonData.map(item => ({
          'Produit': item.name,
          'Stock Actuel': item.currentStock,
          'Stock Minimum': item.minStock,
          'Valeur Stock (XOF)': item.stockValue.toLocaleString('fr-FR'),
          'Statut': item.currentStock <= item.minStock ? 'Stock faible' : 'Stock normal'
        }));
        filename = `rapport_stock_${new Date().toISOString().split('T')[0]}`;
      }
      // Fallback: Category data
      else if (categoryData && categoryData.length > 0) {
        dataToExport = categoryData.map(item => ({
          'Catégorie': item.category,
          'Nombre de Produits': item.products,
          'Valeur Stock (XOF)': item.value.toLocaleString('fr-FR')
        }));
        filename = `rapport_categories_${new Date().toISOString().split('T')[0]}`;
      }
      // Fallback: Top products
      else if (topProducts && topProducts.length > 0) {
        dataToExport = topProducts.map(item => ({
          'Produit': item.name,
          'Stock': item.stock,
          'Valeur (XOF)': item.value.toLocaleString('fr-FR')
        }));
        filename = `rapport_top_produits_${new Date().toISOString().split('T')[0]}`;
      }
      // Fallback: Mock sales data
      else if (mockSalesData && mockSalesData.length > 0) {
        dataToExport = mockSalesData.map(item => ({
          'Date': item.date,
          'Ventes (XOF)': item.sales.toLocaleString('fr-FR'),
          'Transactions': item.transactions
        }));
        filename = `rapport_ventes_${new Date().toISOString().split('T')[0]}`;
      }

      if (!dataToExport.length) {
        toast.error('Aucune donnée à exporter');
        return;
      }

      console.log('Reports - Exporting data:', dataToExport);

      // Convert to CSV
      const headers = Object.keys(dataToExport[0]);
      const csvRows = [
        headers.join(','), // header row
        ...dataToExport.map(row =>
          headers.map(header => {
            const value = row[header] ?? '';
            // Escape quotes and wrap in quotes if contains comma or quote
            const stringValue = value.toString().replace(/"/g, '""');
            return stringValue.includes(',') || stringValue.includes('"') 
              ? `"${stringValue}"` 
              : stringValue;
          }).join(',')
        )
      ];
      const csvString = csvRows.join('\n');

      // Create and trigger download
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(url);

      toast.success('Rapport exporté avec succès');
      console.log('Reports - Export completed:', filename);
    } catch (error) {
      console.error('Reports - Export error:', error);
      toast.error('Impossible d\'exporter le rapport');
    }
  };

  const periodOptions = [
    { value: '7d', label: '7 derniers jours' },
    { value: '30d', label: '30 derniers jours' },
    { value: '90d', label: '3 derniers mois' }
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
          <p className="text-red-600 dark:text-red-400">Erreur lors du chargement des rapports</p>
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
          <Button variant="outline" onClick={handleExport}>
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
                {totalStockValue.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
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
                {totalProducts}
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
                {lowStockCount}
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
            <Card.Title>Évolution des ventes (simulée)</Card.Title>
            <Card.Description>
              Données simulées sur {periodOptions.find(p => p.value === period)?.label.toLowerCase()}
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value.toLocaleString()} XOF`, 'Ventes']}
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
            <Card.Title>Stock vs Stock Minimum</Card.Title>
            <Card.Description>
              Comparaison des niveaux de stock actuels et minimums
            </Card.Description>
          </Card.Header>
          <Card.Content>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stockComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'currentStock' ? 'Stock actuel' : 'Stock minimum']}
                />
                <Legend />
                <Bar dataKey="currentStock" fill="#10B981" name="Stock actuel" radius={[2, 2, 0, 0]} />
                <Bar dataKey="minStock" fill="#F59E0B" name="Stock minimum" radius={[2, 2, 0, 0]} />
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
                <Tooltip formatter={(value) => [`${value.toLocaleString()} XOF`, 'Valeur']} />
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
                  formatter={(value) => [`${value.toLocaleString()} XOF`, 'Valeur stock']}
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