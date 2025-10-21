import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, CreditCard as Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import FormField from '../components/ui/FormField';
import { useForm } from 'react-hook-form';
import { suppliersApi } from '../services/api';
import toast from 'react-hot-toast';

const Suppliers = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Fetch suppliers
  const { data: suppliersData, isLoading, error } = useQuery({
    queryKey: ['suppliers', { search: searchTerm }],
    queryFn: () => suppliersApi.getSuppliers({
      search: searchTerm || undefined,
    }),
  });

  // Mutations
  const createSupplierMutation = useMutation({
    mutationFn: suppliersApi.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      toast.success('Fournisseur ajouté avec succès');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, updates }) => suppliersApi.updateSupplier(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      toast.success('Fournisseur mis à jour avec succès');
      closeModal();
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: suppliersApi.deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries(['suppliers']);
      toast.success('Fournisseur supprimé avec succès');
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  const suppliers = suppliersData?.data || [];

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (supplier = null) => {
    setEditingSupplier(supplier);
    if (supplier) {
      reset(supplier);
    } else {
      reset({});
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
    reset({});
  };

  const onSubmit = (data) => {
    if (editingSupplier) {
      updateSupplierMutation.mutate({
        id: editingSupplier.id,
        updates: data
      });
    } else {
      createSupplierMutation.mutate(data);
    }
  };

  const handleDelete = (supplier) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${supplier.name}" ?`)) {
      deleteSupplierMutation.mutate(supplier.id);
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
          <p className="text-red-600 dark:text-red-400">Erreur lors du chargement des fournisseurs</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Fournisseurs</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Gérez vos relations fournisseurs
          </p>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Fournisseur
        </Button>
      </div>

      {/* Search */}
      <Card>
        <Card.Content>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher un fournisseur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        </Card.Content>
      </Card>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <Card.Content className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {supplier.name}
                  </h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    {supplier.category}
                  </p>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openModal(supplier)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(supplier)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Phone className="w-4 h-4 mr-1" />
                  </div>
                  <span className="text-gray-900 dark:text-gray-100">{supplier.phone}</span>
                </div>

                <div className="flex items-center space-x-3 text-sm">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Mail className="w-4 h-4 mr-1" />
                  </div>
                  <span className="text-gray-900 dark:text-gray-100">{supplier.email}</span>
                </div>

                <div className="flex items-start space-x-3 text-sm">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 mt-0.5">
                    <MapPin className="w-4 h-4 mr-1" />
                  </div>
                  <span className="text-gray-900 dark:text-gray-100 leading-relaxed">
                    {supplier.address}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">Contact:</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">{supplier.contact}</p>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSupplier ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nom de l'entreprise"
              {...register('name', { required: 'Le nom est requis' })}
              error={errors.name?.message}
              required
            />
            <FormField
              label="Catégorie"
              type="select"
              {...register('category', { required: 'La catégorie est requise' })}
              error={errors.category?.message}
              required
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="Fruits & Légumes Bio">Fruits & Légumes Bio</option>
              <option value="Produits Laitiers">Produits Laitiers</option>
              <option value="Boulangerie">Boulangerie</option>
              <option value="Épicerie">Épicerie</option>
              <option value="Boissons">Boissons</option>
              <option value="Viandes & Charcuteries">Viandes & Charcuteries</option>
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Nom du contact"
              {...register('contact', { required: 'Le contact est requis' })}
              error={errors.contact?.message}
              required
            />
            <FormField
              label="Téléphone"
              type="tel"
              {...register('phone', { required: 'Le téléphone est requis' })}
              error={errors.phone?.message}
              required
            />
          </div>

          <FormField
            label="Email"
            type="email"
            {...register('email', { 
              required: 'L\'email est requis',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email invalide'
              }
            })}
            error={errors.email?.message}
            required
          />

          <FormField
            label="Adresse complète"
            type="textarea"
            rows={3}
            {...register('address', { required: 'L\'adresse est requise' })}
            error={errors.address?.message}
            required
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={closeModal}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              loading={createSupplierMutation.isLoading || updateSupplierMutation.isLoading}
            >
              {editingSupplier ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;