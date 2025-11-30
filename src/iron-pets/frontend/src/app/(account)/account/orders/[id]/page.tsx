'use client';

import { useParams, useRouter } from 'next/navigation';
import { useOrder } from '@/hooks/useOrders';
import { useCancelOrder, useReorderItems } from '@/hooks/useOrderActions';
import Link from 'next/link';
import { useState } from 'react';

export const dynamic = 'force-dynamic';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const { data: order, isLoading, error } = useOrder(orderId);
  const cancelOrder = useCancelOrder();
  const reorderItems = useReorderItems();
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelOrder = async () => {
    try {
      await cancelOrder.mutateAsync(orderId);
      setShowCancelModal(false);
    } catch (err) {
      // Error handled by mutation
    }
  };

  const handleReorder = async () => {
    try {
      await reorderItems.mutateAsync(orderId);
      router.push('/cart');
    } catch (err) {
      // Error handled by mutation
    }
  };

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
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
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-medium mb-2">Order not found</h3>
        <p className="text-gray-600 mb-6">
          The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
        </p>
        <Link
          href="/account/orders"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const canCancel = ['pending', 'processing'].includes(order.status);
  const canReorder = order.status === 'delivered' || order.status === 'cancelled';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/account/orders"
            className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 mb-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </Link>
          <h1 className="text-3xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-gray-600">
            Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            order.status === 'delivered'
              ? 'bg-green-100 text-green-800'
              : order.status === 'shipped'
              ? 'bg-blue-100 text-blue-800'
              : order.status === 'cancelled'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Order Items</h2>
            </div>
            <div className="divide-y">
              {order.items.map((item: any) => (
                <div key={item.id} className="p-6 flex gap-4">
                  <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product?.images?.[0]?.url || '/placeholder-product.jpg'}
                      alt={item.product?.name || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/products/${item.product?.slug || item.productId}`}
                      className="font-medium hover:text-primary transition"
                    >
                      {item.product?.name || 'Product'}
                    </Link>
                    {item.variant && (
                      <p className="text-sm text-gray-600 mt-1">{item.variant.name}</p>
                    )}
                    <p className="text-sm text-gray-600 mt-1">Qty: {item.quantity}</p>
                    <p className="text-sm text-gray-600">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tracking Information */}
          {order.status !== 'cancelled' && order.status !== 'pending' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Tracking Information</h2>
              </div>
              <div className="p-6">
                {order.trackingNumber ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Tracking Number:</span>
                      <span className="font-mono font-medium">{order.trackingNumber}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Carrier:</span>
                      <span className="font-medium">{order.carrier || 'Standard Shipping'}</span>
                    </div>
                    {order.estimatedDelivery && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Estimated Delivery:</span>
                        <span className="font-medium">
                          {new Date(order.estimatedDelivery).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    Tracking information will be available once your order ships.
                  </p>
                )}

                {/* Order Timeline */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-4">Order Timeline</h3>
                  <div className="space-y-4">
                    {[
                      { status: 'pending', label: 'Order Placed', date: order.createdAt },
                      { status: 'processing', label: 'Processing', date: order.processedAt },
                      { status: 'shipped', label: 'Shipped', date: order.shippedAt },
                      { status: 'delivered', label: 'Delivered', date: order.deliveredAt },
                    ].map((step, index) => {
                      const isComplete = getStatusIndex(order.status) >= index;
                      const isCurrent = getStatusIndex(order.status) === index;
                      return (
                        <div key={step.status} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                isComplete ? 'bg-primary' : 'bg-gray-300'
                              }`}
                            />
                            {index < 3 && (
                              <div
                                className={`w-0.5 h-8 ${
                                  isComplete && !isCurrent ? 'bg-primary' : 'bg-gray-300'
                                }`}
                              />
                            )}
                          </div>
                          <div className={isCurrent ? 'font-medium' : ''}>
                            <p className={isComplete ? 'text-gray-900' : 'text-gray-500'}>
                              {step.label}
                            </p>
                            {step.date && isComplete && (
                              <p className="text-sm text-gray-500">
                                {new Date(step.date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Order Summary</h2>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{order.shipping > 0 ? `$${order.shipping.toFixed(2)}` : 'FREE'}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span>${(order.tax || 0).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Shipping Address</h2>
            </div>
            <div className="p-6">
              {order.shippingAddress ? (
                <address className="not-italic text-gray-600">
                  <p className="font-medium text-gray-900">
                    {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                  </p>
                  <p>{order.shippingAddress.street}</p>
                  {order.shippingAddress.street2 && <p>{order.shippingAddress.street2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zip}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </address>
              ) : (
                <p className="text-gray-600">No shipping address on file</p>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-lg font-semibold">Payment Method</h2>
            </div>
            <div className="p-6">
              {order.paymentMethod ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-gray-200 rounded flex items-center justify-center text-xs font-medium">
                    {order.paymentMethod.brand?.toUpperCase() || 'CARD'}
                  </div>
                  <span>•••• {order.paymentMethod.last4 || '****'}</span>
                </div>
              ) : (
                <p className="text-gray-600">Payment information not available</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 space-y-3">
              {canReorder && (
                <button
                  onClick={handleReorder}
                  disabled={reorderItems.isPending}
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-50"
                >
                  {reorderItems.isPending ? 'Adding to Cart...' : 'Buy Again'}
                </button>
              )}
              {canCancel && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium"
                >
                  Cancel Order
                </button>
              )}
              <button className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
                Download Invoice
              </button>
              <Link
                href="/info/contact"
                className="block w-full py-3 text-center text-gray-600 hover:text-gray-900 transition"
              >
                Need Help?
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Cancel Order</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this order? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelOrder.isPending}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
              >
                {cancelOrder.isPending ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusIndex(status: string): number {
  const statuses = ['pending', 'processing', 'shipped', 'delivered'];
  return statuses.indexOf(status);
}

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-48" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6" />
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 mb-4">
                <div className="w-24 h-24 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
