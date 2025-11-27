'use client';

import { useSearchParams } from 'next/navigation';
import { useOrder } from '@/hooks/useOrders';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { data: order, isLoading } = useOrder(orderId || '');

  if (isLoading) {
    return <ConfirmationSkeleton />;
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Link href="/" className="text-primary hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Thank you for your order!</h1>
          <p className="text-gray-600 text-lg mb-4">
            Your order has been successfully placed.
          </p>
          <p className="text-sm text-gray-600">
            Order #{order.orderNumber} • Confirmation sent to {order.customer.email}
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Shipping Address */}
            <div>
              <h2 className="font-bold mb-3">Shipping Address</h2>
              <div className="text-gray-600 text-sm space-y-1">
                <p>{order.shipping.name}</p>
                <p>{order.shipping.address1}</p>
                {order.shipping.address2 && <p>{order.shipping.address2}</p>}
                <p>
                  {order.shipping.city}, {order.shipping.state} {order.shipping.zipCode}
                </p>
                <p>{order.shipping.country}</p>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="font-bold mb-3">Payment Method</h2>
              <div className="text-gray-600 text-sm space-y-1">
                <p className="flex items-center gap-2">
                  <span className="font-medium">
                    {order.payment.type === 'card' ? 'Credit Card' : 'PayPal'}
                  </span>
                </p>
                {order.payment.last4 && (
                  <p>•••• •••• •••• {order.payment.last4}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="border-t pt-6">
            <h2 className="font-bold mb-4">Order Items</h2>
            <div className="space-y-4">
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
                    <p className="font-medium">{item.product.name}</p>
                    {item.variant && (
                      <p className="text-sm text-gray-600">{item.variant.name}</p>
                    )}
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t mt-6 pt-6">
            <div className="space-y-2 max-w-xs ml-auto">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>
                  {order.shippingCost > 0
                    ? `$${order.shippingCost.toFixed(2)}`
                    : 'FREE'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estimated Delivery */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <svg
              className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="font-bold mb-1">Estimated Delivery</h3>
              <p className="text-sm text-gray-700">
                Your order will be delivered between{' '}
                <span className="font-medium">
                  {new Date(order.estimatedDelivery.min).toLocaleDateString()} -{' '}
                  {new Date(order.estimatedDelivery.max).toLocaleDateString()}
                </span>
              </p>
              <p className="text-sm text-gray-600 mt-2">
                You&apos;ll receive a tracking number via email once your order ships.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/account/orders/${order.id}`}
            className="flex-1 py-3 px-6 bg-primary text-white text-center rounded-lg hover:bg-primary-dark transition font-medium"
          >
            Track Order
          </Link>
          <Link
            href="/products"
            className="flex-1 py-3 px-6 border border-gray-300 text-center rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

function ConfirmationSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12 animate-pulse">
          <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-6" />
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4" />
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto" />
        </div>
        <div className="bg-white rounded-lg shadow p-8 h-96 animate-pulse" />
      </div>
    </div>
  );
}
