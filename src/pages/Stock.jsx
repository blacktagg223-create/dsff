import { useState } from 'react';
import { Package, TriangleAlert as AlertTriangle, TrendingUp, TrendingDown, CreditCard as Edit2 } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';
import { useForm } from 'react-hook-form';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';

const Stock = () => {
  const { products, updateStock } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { register, handleSubmit, reset, watch } = useForm();

  const adjustmentType = watch('adjustmentType', 'add');
  const quantity = watch('quantity', 0);

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);
  const outOfStockProducts = products.filter(p => p.stock === 0);
  const totalProducts = products.length;
  const totalStockValue = products.reduce((total, product) => total + (product.stock * product.cost), 0);

  const openStockModal = (product) => {
    setSelectedProduct(product);
    reset({ adjustmentType: 'add', quantity: 1, reason: '' });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    reset({});
  };

  const onSubmit = (data) => {
    const adjustment = data.adjustmentType === 'add' 
      ? parseInt(data.quantity) 
      : -parseInt(data.quantity);
    
    updateStock(selectedProduct.id, adjustment);
    
    const actionText = data.adjustmentType === 'add' ? 'ajouté' : 'retiré';
    toast.success(`Stock ${actionText} avec succès`);
    closeModal();
  };

  const getStockStatus = (product) => {
    if (product.stock === 0) {
      return { status: 'Rupture', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' };
    } else if (product.stock <= product.minStock) {
      return { status: 'Stock faible', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' };
    }
    return { status: 'En stock', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestion du Stock</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Surveillez et ajustez vos niveaux de stock
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <Card.Content className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Produits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalProducts}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valeur du Stock</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {totalStockValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Stock Faible</p>
              <p className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ruptures</p>
              <p className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Stock Table */}
      <Card>
        <Card.Header>
          <Card.Title>État du Stock</Card.Title>
          <Card.Description>
            Gérez les niveaux de stock de vos produits
          </Card.Description>
        </Card.Header>
        <Card.Content className="p-0">
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>Produit</Table.Head>
                <Table.Head>SKU</Table.Head>
                <Table.Head>Stock Actuel</Table.Head>
                <Table.Head>Stock Min</Table.Head>
                <Table.Head>Valeur Stock</Table.Head>
                <Table.Head>Statut</Table.Head>
                <Table.Head>Actions</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {products.map((product) => {
                const { status, color } = getStockStatus(product);
                const stockValue = product.stock * product.cost;

                return (
                  <Table.Row key={product.id}>
                    <Table.Cell>
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
                          <p className="text-sm text-gray-500 dark:text-gray-400">{product.category}</p>
                        </div>
                      </div>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {product.sku}
                      </span>
                    </Table.Cell>
                    <Table.Cell className="font-medium text-lg">
                      {product.stock}
                    </Table.Cell>
                    <Table.Cell className="text-gray-600 dark:text-gray-400">
                      {product.minStock}
                    </Table.Cell>
                    <Table.Cell className="font-medium">
                      {stockValue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </Table.Cell>
                    <Table.Cell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
                        {status}
                      </span>
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openStockModal(product)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </Card.Content>
      </Card>

      {/* Stock Adjustment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={`Ajuster le stock - ${selectedProduct?.name}`}
      >
        {selectedProduct && (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Stock actuel:</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {selectedProduct.stock} unités
              </p>
            </div>

            <FormField
              label="Type d'ajustement"
              type="select"
              {...register('adjustmentType')}
            >
              <option value="add">Ajouter au stock</option>
              <option value="remove">Retirer du stock</option>
            </FormField>

            <FormField
              label="Quantité"
              type="number"
              min="1"
              {...register('quantity', { required: true, min: 1 })}
            />

            <FormField
              label="Raison (optionnel)"
              type="textarea"
              rows={3}
              placeholder="Ex: Réception marchandise, correction d'inventaire..."
              {...register('reason')}
            />

            {quantity > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Nouveau stock après ajustement:
                </p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                  {adjustmentType === 'add' 
                    ? selectedProduct.stock + parseInt(quantity || 0)
                    : Math.max(0, selectedProduct.stock - parseInt(quantity || 0))
                  } unités
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Annuler
              </Button>
              <Button type="submit">
                Appliquer l'ajustement
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Stock;