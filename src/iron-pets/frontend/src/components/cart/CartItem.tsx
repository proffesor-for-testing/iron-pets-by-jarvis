import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface CartItemProps {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  maxQuantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItem({
  id,
  name,
  price,
  quantity,
  image,
  maxQuantity,
  onUpdateQuantity,
  onRemove,
}: CartItemProps) {
  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      onUpdateQuantity(id, quantity + 1);
    }
  };

  const itemTotal = price * quantity;

  return (
    <div className="flex gap-4 rounded-lg border bg-white p-4">
      {/* Product Image */}
      <Link href={`/products/${id}`} className="flex-shrink-0">
        <div className="relative h-24 w-24 overflow-hidden rounded-lg bg-gray-100">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <Link href={`/products/${id}`}>
            <h3 className="text-sm font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2">
              {name}
            </h3>
          </Link>
          <button
            onClick={() => onRemove(id)}
            className="ml-2 text-gray-400 hover:text-red-600 transition-colors"
            aria-label={`Remove ${name} from cart`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-1 text-sm font-semibold text-gray-900">
          ${price.toFixed(2)}
        </p>

        {/* Quantity Controls */}
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecrease}
              disabled={quantity <= 1}
              className="h-8 w-8 p-0"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium" aria-label={`Quantity: ${quantity}`}>
              {quantity}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleIncrease}
              disabled={quantity >= maxQuantity}
              className="h-8 w-8 p-0"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <p className="text-sm font-bold text-gray-900">
            ${itemTotal.toFixed(2)}
          </p>
        </div>

        {quantity >= maxQuantity && (
          <p className="mt-1 text-xs text-amber-600">
            Maximum quantity reached
          </p>
        )}
      </div>
    </div>
  );
}
