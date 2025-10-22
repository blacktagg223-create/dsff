import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, CreditCard as Edit2, Trash2, Package, Eye } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';
import { useForm } from 'react-hook-form';
import { productsApi } from '../services/api';
import toast from 'react-hot-toast';

const Products = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch products
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products', { search: searchTerm, category: selectedCategory }],
    queryFn: () => productsApi.getProducts({
      search: searchTerm || undefined,
      category: selectedCategory === 'all' ? undefined : selectedCategory,
    }),
  });

  // Mutations
  const createProductMutation = useMutation({
    mutationFn: productsApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Produit ajouté avec succès');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, updates }) => productsApi.updateProduct(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Produit mis à jour avec succès');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: productsApi.deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries(['products']);
      toast.success('Produit supprimé avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const products = productsData?.data?.products || [];
  const categories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const openModal = (product = null) => {
    setEditingProduct(product);
    if (product) {
      reset(product);
    } else {
      reset({});
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    reset({});
  };

  const onSubmit = (data) => {
    if (editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct.id,
        updates: {
          name: data.name,
          sku: data.sku,
          barcode: data.barcode,
          image: data.image || editingProduct.image,
          description: data.description,
          category: data.category,
          supplier: data.supplier,
          min_stock: parseInt(data.min_stock),
          price: parseFloat(data.price),
          cost: parseFloat(data.cost),
          stock: parseInt(data.stock),
        }
      });
    } else {
      createProductMutation.mutate({
        ...data,
        price: parseFloat(data.price),
        cost: parseFloat(data.cost),
        stock: parseInt(data.stock),
        min_stock: parseInt(data.min_stock),
        image: data.image || 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=400'
      });
    }
  };

  const handleDelete = (product) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Produits</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gérez votre catalogue de produits
            </p>
          </div>
          <Button onClick={() => openModal()}>
            <Plus className="w-4 h-4 mr-2" />
            Nouveau Produit
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <Card.Content>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  />
                </div>
              </div>
              <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="all">Toutes les catégories</option>
                {categories.filter(c => c !== 'all').map(category => (
                    <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </Card.Content>
        </Card>

        {/* Products Table */}
        <Card>
          <Card.Content className="p-0">
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Produit</Table.Head>
                  <Table.Head>SKU</Table.Head>
                  <Table.Head>Catégorie</Table.Head>
                  <Table.Head>Prix</Table.Head>
                  <Table.Head>Stock</Table.Head>
                  <Table.Head>Fournisseur</Table.Head>
                  <Table.Head>Actions</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredProducts.map((product) => (
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
                            <p className="text-sm text-gray-500 dark:text-gray-400">{product.barcode}</p>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                      {product.sku}
                    </span>
                      </Table.Cell>
                      <Table.Cell>{product.category}</Table.Cell>
                      <Table.Cell className="font-medium">
                        {product.price.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}
                      </Table.Cell>
                      <Table.Cell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.stock <= product.min_stock
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    }`}>
                      {product.stock}
                    </span>
                      </Table.Cell>
                      <Table.Cell>{product.supplier_name}</Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center space-x-2">
                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openModal(product)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product)}
                              className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </Card.Content>
        </Card>

        {/* Product Modal */}
        <Modal
            isOpen={isModalOpen}
            onClose={closeModal}
            title={editingProduct ? 'Modifier le produit' : 'Nouveau produit'}
            size="lg"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                  label="Nom du produit"
                  {...register('name', { required: 'Le nom est requis' })}
                  error={errors.name?.message}
                  required
              />
              <FormField
                  label="SKU"
                  {...register('sku', { required: 'Le SKU est requis' })}
                  error={errors.sku?.message}
                  required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                  label="Catégorie"
                  type="select"
                  {...register('category', { required: 'La catégorie est requise' })}
                  error={errors.category?.message}
                  required
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="Fruits & Légumes">Fruits & Légumes</option>
                <option value="Produits Laitiers">Produits Laitiers</option>
                <option value="Boulangerie">Boulangerie</option>
                <option value="Épicerie">Épicerie</option>
                <option value="Boissons">Boissons</option>
              </FormField>
              <FormField
                  label="Fournisseur"
                  {...register('supplier', { required: 'Le fournisseur est requis' })}
                  error={errors.supplier?.message}
                  required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                  label="Prix de vente (€)"
                  type="number"
                  step="0.01"
                  {...register('price', { required: 'Le prix est requis' })}
                  error={errors.price?.message}
                  required
              />
              <FormField
                  label="Prix d'achat (€)"
                  type="number"
                  step="0.01"
                  {...register('cost', { required: 'Le coût est requis' })}
                  error={errors.cost?.message}
                  required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                  label="Stock actuel"
                  type="number"
                  {...register('stock', { required: 'Le stock est requis' })}
                  error={errors.stock?.message}
                  required
              />
              <FormField
                  label="Stock minimum"
                  type="number"
                  {...register('min_stock', { required: 'Le stock minimum est requis' })}
                  error={errors.min_stock?.message}
                  required
              />
            </div>

            <FormField
                label="Code-barres"
                {...register('barcode')}
                error={errors.barcode?.message}
            />

            <FormField
                label="URL de l'image"
                {...register('image')}
                error={errors.image?.message}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={closeModal}>
                Annuler
              </Button>
              <Button
                  type="submit"
                  loading={createProductMutation.isLoading || updateProductMutation.isLoading}
              >
                {editingProduct ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
  );
};

export default Products;