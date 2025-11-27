'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface ShippingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface ShippingFormProps {
  onSubmit: (address: ShippingAddress) => void;
  defaultValues?: Partial<ShippingAddress>;
  initialData?: Partial<ShippingAddress>;
  isLoading?: boolean;
}

export function ShippingForm({ onSubmit, defaultValues, initialData, isLoading }: ShippingFormProps) {
  const defaults = initialData || defaultValues;
  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: defaults?.firstName || '',
    lastName: defaults?.lastName || '',
    addressLine1: defaults?.addressLine1 || '',
    addressLine2: defaults?.addressLine2 || '',
    city: defaults?.city || '',
    state: defaults?.state || '',
    zipCode: defaults?.zipCode || '',
    country: defaults?.country || 'US',
    phone: defaults?.phone || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>

      <Input
        label="Address"
        name="addressLine1"
        value={formData.addressLine1}
        onChange={handleChange}
        required
        placeholder="Street address"
      />

      <Input
        label="Apartment, suite, etc. (optional)"
        name="addressLine2"
        value={formData.addressLine2}
        onChange={handleChange}
        placeholder="Apt, Suite, Unit, Building, Floor, etc."
      />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Input
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          required
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            State
          </label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select state</option>
            <option value="AL">Alabama</option>
            <option value="AK">Alaska</option>
            <option value="AZ">Arizona</option>
            <option value="CA">California</option>
            <option value="CO">Colorado</option>
            <option value="FL">Florida</option>
            <option value="GA">Georgia</option>
            <option value="NY">New York</option>
            <option value="TX">Texas</option>
            <option value="WA">Washington</option>
            {/* Add remaining states as needed */}
          </select>
        </div>
        <Input
          label="ZIP Code"
          name="zipCode"
          value={formData.zipCode}
          onChange={handleChange}
          required
          placeholder="12345"
        />
      </div>

      <Input
        label="Phone Number"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        required
        placeholder="(555) 123-4567"
      />

      <Button type="submit" disabled={isLoading} className="w-full mt-6">
        {isLoading ? 'Saving...' : 'Continue to Payment'}
      </Button>
    </form>
  );
}
