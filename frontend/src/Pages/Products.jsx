import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, ArrowLeftIcon, ShoppingBagIcon } from '@heroicons/react/24/solid';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export default function Products() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Produit 1', price: 29.99, quantity: 100, category: 'Électronique' },
    { id: 2, name: 'Produit 2', price: 49.99, quantity: 50, category: 'Vêtements' },
    { id: 3, name: 'Produit 3', price: 19.99, quantity: 200, category: 'Accessoires' },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', price: '', quantity: '', category: '' });

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (formData.name && formData.price && formData.quantity) {
      const newProduct = {
        id: products.length + 1,
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity)
      };
      setProducts([...products, newProduct]);
      setFormData({ name: '', price: '', quantity: '', category: '' });
      setShowForm(false);
    }
  };

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              to="/"
              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">🛍️ Gestion des Produits</h1>
          </div>
          <p className="text-gray-600">Gérez tous vos produits et inventaire</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Action Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Liste des Produits</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            <PlusIcon className="w-5 h-5" />
            Ajouter un Produit
          </button>
        </div>

        {/* Add Product Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Ajouter un nouveau produit</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nom du produit"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="Prix"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="number"
                  placeholder="Quantité"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Catégorie"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  ✓ Ajouter
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors font-semibold"
                >
                  ✗ Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        {products.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 mb-2">Aucun produit</h3>
            <p className="text-gray-400">Commencez par ajouter votre premier produit</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Produit</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Catégorie</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Prix</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Quantité</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-gray-900 font-semibold">{product.price.toFixed(2)} €</td>
                      <td className="px-6 py-4 text-sm text-right">
                        <span className={`font-semibold ${product.quantity > 50 ? 'text-green-600' : product.quantity > 10 ? 'text-orange-600' : 'text-red-600'}`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right">
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900 font-semibold transition-colors"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        {products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Nombre de produits</p>
              <p className="text-3xl font-bold text-blue-600">{products.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Valeur totale</p>
              <p className="text-3xl font-bold text-green-600">
                {(products.reduce((sum, p) => sum + p.price * p.quantity, 0)).toFixed(2)} €
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-600 mb-2">Stock total</p>
              <p className="text-3xl font-bold text-purple-600">{products.reduce((sum, p) => sum + p.quantity, 0)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
