'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/Button';

interface OrderReviewProps {
  cart: any;
  shipping: any;
  payment: any;
  onEdit: (step: 'shipping' | 'payment') => void;
  onPlaceOrder: () => void;
  isProcessing: boolean;
}

export function OrderReview({
  cart,
  shipping,
  payment,
  onEdit,
  onPlaceOrder,
  isProcessing,
}: OrderReviewProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Review Your Order</h2>

      {/* Shipping Address */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900">Shipping Address</h3>
          <button
            onClick={() => onEdit('shipping')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Edit
          </button>
        </div>
        {shipping && (
          <div className="text-sm text-gray-600">
            <p>{shipping.firstName} {shipping.lastName}</p>
            <p>{shipping.addressLine1}</p>
            {shipping.addressLine2 && <p>{shipping.addressLine2}</p>}
            <p>{shipping.city}, {shipping.state} {shipping.zipCode}</p>
            {shipping.phone && <p>{shipping.phone}</p>}
          </div>
        )}
      </div>

      {/* Payment Method */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-gray-900">Payment Method</h3>
          <button
            onClick={() => onEdit('payment')}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Edit
          </button>
        </div>
        {payment && (
          <div className="text-sm text-gray-600">
            <p>Card ending in {payment.cardNumber?.slice(-4) || '****'}</p>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-4">Order Items</h3>
        <div className="space-y-4">
          {cart?.items?.map((item: any) => (
            <div key={item.id} className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {item.product?.images?.[0] ? (
                  <Image
                    src={item.product.images[0].url || item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    🐾
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.product?.name}
                </p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Place Order Button */}
      <Button
        onClick={onPlaceOrder}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          `Place Order - $${cart?.total?.toFixed(2) || '0.00'}`
        )}
      </Button>
    </div>
  );
}
