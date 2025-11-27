'use client';

import { useState } from 'react';
import { Product } from '@/types';

interface ProductTabsProps {
  product: Product;
}

export function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState('description');

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'details', label: 'Details' },
    { id: 'reviews', label: 'Reviews' },
  ];

  return (
    <div className="mt-12">
      {/* Tab Headers */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'description' && (
          <div className="prose max-w-none">
            {product.description ? (
              <div dangerouslySetInnerHTML={{ __html: product.description }} />
            ) : (
              <p className="text-gray-500">No description available.</p>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-4">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.brand && (
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-gray-600">Brand</dt>
                  <dd className="font-medium">{product.brand}</dd>
                </div>
              )}
              {product.sku && (
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-gray-600">SKU</dt>
                  <dd className="font-medium font-mono">{product.sku}</dd>
                </div>
              )}
              {product.category && (
                <div className="flex justify-between py-2 border-b">
                  <dt className="text-gray-600">Category</dt>
                  <dd className="font-medium">{product.category.name}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {product.reviewCount && product.reviewCount > 0 ? (
              <p className="text-gray-600">
                {product.reviewCount} review{product.reviewCount > 1 ? 's' : ''} for this product
              </p>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No reviews yet.</p>
                <p className="text-sm text-gray-400">
                  Be the first to review this product!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
