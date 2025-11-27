'use client';

import { useState } from 'react';
import { useOrders } from '@/hooks/useOrders';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function OrdersPage() {
  const [filter, setFilter] = useState<'all' | 'processing' | 'shipped' | 'delivered'>('all');
  const { data, isLoading } = useOrders({ status: filter === 'all' ? undefined : filter });

  const orders = data?.orders || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Order History</h1>
        <p className="text-gray-600">View and track your orders</p>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { key: 'all', label: 'All Orders' },
            { key: 'processing', label: 'Processing' },
            { key: 'shipped', label: 'Shipped' },
            { key: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`py-4 border-b-2 font-medium transition ${
                filter === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <OrdersSkeleton />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <h3 className="text-lg font-medium mb-2">No orders found</h3>
          <p className="text-gray-600 mb-6">
            {filter === 'all'
              ? "You haven&apos;t placed any orders yet"
              : `No ${filter} orders`}
          </p>
          <Link
            href="/products"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-xs text-gray-600">Order Number</p>
                    <p className="font-medium">#{order.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Date Placed</p>
                    <p className="font-medium">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Total</p>
                    <p className="font-medium">${order.total.toFixed(2)}</p>
                  </div>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    order.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'shipped'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4 mb-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0]?.url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-medium hover:text-primary transition"
                        >
                          {item.product.name}
                        </Link>
                        {item.variant && (
                          <p className="text-sm text-gray-600">{item.variant.name}</p>
                        )}
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                  >
                    View Details
                  </Link>

                  {order.status === 'shipped' && (
                    <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                      Track Package
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium">
                      Buy Again
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-2">
            {[...Array(data.totalPages)].map((_, i) => (
              <button
                key={i}
                className={`px-4 py-2 border rounded-lg ${
                  i + 1 === data.currentPage
                    ? 'bg-primary text-white border-primary'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow overflow-hidden animate-pulse">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex gap-8">
              {[1, 2, 3].map((j) => (
                <div key={j}>
                  <div className="h-3 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
              ))}
            </div>
          </div>
          <div className="p-6">
            <div className="h-20 bg-gray-200 rounded mb-4" />
            <div className="flex gap-3">
              <div className="h-10 bg-gray-200 rounded w-32" />
              <div className="h-10 bg-gray-200 rounded w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
