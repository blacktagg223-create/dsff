import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, Warehouse, Users, ShoppingCart, ChartBar as BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import useStore from '../../store/useStore';

const Sidebar = () => {
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar } = useStore();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Produits' },
    { path: '/stock', icon: Warehouse, label: 'Stock' },
    { path: '/suppliers', icon: Users, label: 'Fournisseurs' },
    { path: '/sales', icon: ShoppingCart, label: 'Ventes (POS)' },
    { path: '/reports', icon: BarChart3, label: 'Rapports' }
  ];

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex flex-col h-full`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!sidebarCollapsed && (
          <h1 className="text-xl font-bold text-blue-400">SuperMarket ERP</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'hover:bg-gray-800 text-gray-300 hover:text-white'
              }`}
              title={sidebarCollapsed ? item.label : ''}
            >
              <Icon className={`w-5 h-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'}`} />
              {!sidebarCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;