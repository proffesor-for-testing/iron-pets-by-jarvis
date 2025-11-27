'use client';

import { useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { useShippingRates, useConfirmOrder } from '@/hooks/useCheckout';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { PaymentForm } from '@/components/checkout/PaymentForm';
import { OrderReview } from '@/components/checkout/OrderReview';
import { useRouter } from 'next/navigation';

export const dynamic = 'force-dynamic';

type CheckoutStep = 'shipping' | 'payment' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shippingData, setShippingData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);

  const { data: cart, isLoading: cartLoading } = useCart();
  // Shipping rates hook - data available for future use
  useShippingRates(shippingData?.zipCode);
  const confirmOrder = useConfirmOrder();

  const handleShippingSubmit = (data: any) => {
    setShippingData(data);
    setStep('payment');
  };

  const handlePaymentSubmit = (data: any) => {
    setPaymentMethod(data);
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    try {
      const order = await confirmOrder.mutateAsync({
        shipping: shippingData,
        payment: paymentMethod,
      });

      router.push(`/checkout/confirmation?orderId=${order.id}`);
    } catch (error) {
      console.error('Order confirmation failed:', error);
    }
  };

  if (cartLoading) {
    return <CheckoutSkeleton />;
  }

  if (!cart || cart.items.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { key: 'shipping', label: 'Shipping', number: 1 },
              { key: 'payment', label: 'Payment', number: 2 },
              { key: 'review', label: 'Review', number: 3 },
            ].map((s, index) => (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      step === s.key
                        ? 'bg-primary text-white'
                        : index < ['shipping', 'payment', 'review'].indexOf(step)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {index < ['shipping', 'payment', 'review'].indexOf(step) ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      s.number
                    )}
                  </div>
                  <span className="text-sm mt-2 font-medium">{s.label}</span>
                </div>
                {index < 2 && (
                  <div
                    className={`h-1 flex-1 -mt-8 ${
                      index < ['shipping', 'payment', 'review'].indexOf(step)
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <ShippingForm
                onSubmit={handleShippingSubmit}
                initialData={shippingData}
              />
            )}

            {step === 'payment' && (
              <PaymentForm
                onSubmit={handlePaymentSubmit}
                onBack={() => setStep('shipping')}
                shippingData={shippingData}
              />
            )}

            {step === 'review' && (
              <OrderReview
                cart={cart}
                shipping={shippingData}
                payment={paymentMethod}
                onEdit={(editStep) => setStep(editStep)}
                onPlaceOrder={handlePlaceOrder}
                isProcessing={confirmOrder.isPending}
              />
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={item.product.images[0]?.url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-6 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${cart.subtotal.toFixed(2)}</span>
                </div>

                {shippingData && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {cart.shipping > 0 ? `$${cart.shipping.toFixed(2)}` : 'FREE'}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${cart.tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span>Total</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="h-20 bg-gray-200 rounded mb-12 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-6 h-96 animate-pulse" />
          <div className="bg-white rounded-lg shadow p-6 h-96 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
