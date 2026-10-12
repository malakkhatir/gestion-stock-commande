import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon, MapPinIcon, ChartBarIcon } from '@heroicons/react/24/solid';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            📦 Gestion de Stock
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Gérez efficacement votre inventaire avec notre plateforme moderne et intuitive.
            Suivez vos produits, villes et statistiques en temps réel.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
     
            <Link
              to="/villes"
              className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
            >
              📍 Gérer les Villes
            </Link>
          </div>
        </div>
      </section>

  
    

      {/* CTA Section */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Prêt à commencer ?</h2>
          <p className="text-xl mb-8 opacity-90">
            Commencez à gérer votre stock dès maintenant avec notre interface intuitive.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-100 transition-colors"
          >
            Accéder au Tableau de Bord
          </Link>
        </div>
      </section>
    </div>
  );
}
