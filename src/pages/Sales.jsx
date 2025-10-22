import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart,
  Scan,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Search,
  X,
  Receipt
} from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import FormField from '../components/ui/FormField';
import Modal from '../components/ui/Modal';
import { productsApi, salesApi } from '../services/api';
import toast from 'react-hot-toast';

const Sales = () => {
  const queryClient = useQueryClient();
  const [cart, setCart] = useState([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const [skuInput, setSkuInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getProducts(),
  });

  const { data: recentSalesData } = useQuery({
    queryKey: ['recentSales'],
    queryFn: () => salesApi.getSales({ limit: 5 }),
  });

  const createSaleMutation = useMutation({
    mutationFn: salesApi.createSale,
    onSuccess: () => {
      queryClient.invalidateQueries(['recentSales']);
      queryClient.invalidateQueries(['dashboardStats']);
      queryClient.invalidateQueries(['stock']);
      queryClient.invalidateQueries(['products']);
      toast.success('Vente enregistrée avec succès !');
    },
    onError: (err) => {
      toast.error('Erreur lors de l\'enregistrement de la vente');
      console.error('Sale creation error:', err);
    },
  });

  const products = productsData?.data?.products || [];
  const recentSales = recentSalesData?.data?.sales || [];

  const addToCart = (product, quantity = 1) => {
    if (product.stock < quantity) {
      toast.error('Stock insuffisant');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        toast.error('Stock insuffisant');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock) {
      toast.error('Stock insuffisant');
      return;
    }
    setCart(cart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.2);
  const total = subtotal + tax;

  const handleScanSku = () => {
    const product = products.find(p => p.sku.toLowerCase() === skuInput.toLowerCase());
    if (product) {
      addToCart(product);
      setSkuInput('');
      toast.success(`${product.name} ajouté au panier`);
    } else {
      toast.error('Produit non trouvé');
    }
  };

  const handleAddProduct = (product) => {
    addToCart(product);
    toast.success(`${product.name} ajouté au panier`);
  };

  const handleProcessPayment = async () => {
    if (cart.length === 0) {
      toast.error('Le panier est vide');
      return;
    }

    setIsProcessingPayment(true);

    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.id,
          sku: item.sku,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        subtotal,
        tax,
        total,
        paymentMethod,
        cashier: 'Caissier Principal',
        customerId: null
      };

      await createSaleMutation.mutateAsync(saleData);

      setCart([]);
      setIsPaymentModalOpen(false);
      setPaymentMethod('cash');
    } catch (err) {
      console.error('Payment processing error:', err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">Erreur lors du chargement des produits</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Point de Vente</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Scannez ou recherchez des produits pour les ajouter au panier
            </p>
          </div>

          <Card>
            <Card.Header>
              <Card.Title className="flex items-center">
                <Scan className="w-5 h-5 mr-2" />
                Scanner SKU
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="flex space-x-2">
                <FormField
                  placeholder="Entrez ou scannez le SKU..."
                  value={skuInput}
                  onChange={(e) => setSkuInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleScanSku()}
                  className="flex-1"
                />
                <Button onClick={handleScanSku}>
                  <Scan className="w-4 h-4" />
                </Button>
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header className="flex flex-row items-center justify-between">
              <Card.Title>Recherche de Produits</Card.Title>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsProductModalOpen(true)}
              >
                Voir tous
              </Button>
            </Card.Header>
            <Card.Content>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {filteredProducts.slice(0, 8).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all"
                    onClick={() => handleAddProduct(product)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400';
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{product.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Stock: {product.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="sticky top-0">
            <Card.Header className="flex flex-row items-center justify-between">
              <Card.Title className="flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Panier ({cart.length})
              </Card.Title>
              {cart.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </Card.Header>

            <Card.Content>
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">Panier vide</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {item.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-600 ml-2"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sous-total:</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">TVA (20%):</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {tax.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-gray-100">Total:</span>
                      <span className="text-gray-900 dark:text-gray-100">
                        {total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    loading={isProcessingPayment}
                    onClick={() => setIsPaymentModalOpen(true)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Procéder au paiement
                  </Button>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>

      {recentSales.length > 0 && (
        <Card className="animate-fade-in">
          <Card.Header>
            <Card.Title className="flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              Dernières ventes
            </Card.Title>
            <Card.Description>Transactions récentes</Card.Description>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {sale.transactionId}
                          </p>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {sale.total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                          </p>
                        </div>
                        <div className="flex items-center mt-1 space-x-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>{sale.items.length} article(s)</span>
                          <span>•</span>
                          <span className="capitalize">{sale.paymentMethod === 'cash' ? 'Espèces' : 'Carte'}</span>
                          <span>•</span>
                          <span>{new Date(sale.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title="Tous les produits"
        size="xl"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  handleAddProduct(product);
                  setIsProductModalOpen(false);
                }}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400';
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.sku} • {product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Stock: {product.stock}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Paiement"
      >
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Résumé de la commande</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Articles ({cart.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span>{subtotal.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between">
                <span>TVA (20%)</span>
                <span>{tax.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200 dark:border-gray-600">
                <span>Total</span>
                <span>{total.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Mode de paiement</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <Banknote className="w-5 h-5 text-green-600" />
                <span className="font-medium">Espèces</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <CreditCard className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Carte bancaire</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsPaymentModalOpen(false)}
              disabled={isProcessingPayment}
            >
              Annuler
            </Button>
            <Button
              className="flex-1"
              loading={isProcessingPayment}
              onClick={handleProcessPayment}
            >
              Confirmer le paiement
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Sales;
