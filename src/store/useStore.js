import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

      // User
      user: {
        id: 1,
        name: 'Admin User',
        email: 'admin@supermarket.com',
        role: 'admin'
      },

      // Products
      products: [
        {
          id: 1,
          sku: 'PRD001',
          name: 'Bananes Bio',
          category: 'Fruits & Légumes',
          price: 2.99,
          cost: 1.50,
          stock: 45,
          minStock: 20,
          supplier: 'Bio Market',
          barcode: '1234567890123',
          image: 'https://images.pexels.com/photos/2238309/pexels-photo-2238309.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          id: 2,
          sku: 'PRD002',
          name: 'Lait Entier 1L',
          category: 'Produits Laitiers',
          price: 1.89,
          cost: 1.20,
          stock: 12,
          minStock: 30,
          supplier: 'Laiterie Central',
          barcode: '1234567890124',
          image: 'https://images.pexels.com/photos/248412/pexels-photo-248412.jpeg?auto=compress&cs=tinysrgb&w=400'
        },
        {
          id: 3,
          sku: 'PRD003',
          name: 'Pain de Mie',
          category: 'Boulangerie',
          price: 3.49,
          cost: 2.00,
          stock: 25,
          minStock: 15,
          supplier: 'Boulangerie Moderne',
          barcode: '1234567890125',
          image: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=400'
        }
      ],

      // Suppliers
      suppliers: [
        {
          id: 1,
          name: 'Bio Market',
          contact: 'Jean Dupont',
          email: 'contact@biomarket.fr',
          phone: '01 23 45 67 89',
          address: '123 Rue de la Bio, 75001 Paris',
          category: 'Fruits & Légumes Bio'
        },
        {
          id: 2,
          name: 'Laiterie Central',
          contact: 'Marie Martin',
          email: 'info@laiterie-central.fr',
          phone: '01 23 45 67 90',
          address: '456 Avenue du Lait, 69000 Lyon',
          category: 'Produits Laitiers'
        }
      ],

      // Sales
      sales: [
        {
          id: 1,
          date: '2024-12-20',
          amount: 45.67,
          items: 8,
          cashier: 'Alice Dubois'
        },
        {
          id: 2,
          date: '2024-12-20',
          amount: 123.45,
          items: 15,
          cashier: 'Bob Martin'
        }
      ],

      // Cart (for POS)
      cart: [],
      addToCart: (product, quantity = 1) => {
        const { cart } = get();
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          set({
            cart: [...cart, { ...product, quantity }]
          });
        }
      },
      removeFromCart: (productId) => {
        set(state => ({
          cart: state.cart.filter(item => item.id !== productId)
        }));
      },
      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        set(state => ({
          cart: state.cart.map(item =>
            item.id === productId ? { ...item, quantity } : item
          )
        }));
      },
      clearCart: () => set({ cart: [] }),

      // Actions
      addProduct: (product) => set(state => ({
        products: [...state.products, { ...product, id: Date.now() }]
      })),
      updateProduct: (id, updates) => set(state => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      deleteProduct: (id) => set(state => ({
        products: state.products.filter(p => p.id !== id)
      })),
      updateStock: (id, quantity) => set(state => ({
        products: state.products.map(p => 
          p.id === id ? { ...p, stock: p.stock + quantity } : p
        )
      })),
      
      addSupplier: (supplier) => set(state => ({
        suppliers: [...state.suppliers, { ...supplier, id: Date.now() }]
      })),
      updateSupplier: (id, updates) => set(state => ({
        suppliers: state.suppliers.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteSupplier: (id) => set(state => ({
        suppliers: state.suppliers.filter(s => s.id !== id)
      }))
    }),
    {
      name: 'supermarket-erp-store'
    }
  )
);

export default useStore;