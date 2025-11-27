'use client';

import { useState } from 'react';
import { Pet, PetSpecies } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface PetProfileFormProps {
  pet?: Pet;
  onSubmit: (data: Partial<Pet>) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
}

export function PetProfileForm({ pet, onSubmit, onCancel, isLoading, isSubmitting }: PetProfileFormProps) {
  const loading = isLoading || isSubmitting;
  const [formData, setFormData] = useState({
    name: pet?.name || '',
    species: pet?.species || 'DOG' as PetSpecies,
    breed: pet?.breed || '',
    birthDate: pet?.birthDate ? pet.birthDate.split('T')[0] : '',
    weight: pet?.weight?.toString() || '',
    allergies: pet?.allergies?.join(', ') || '',
    dietaryRestrictions: pet?.dietaryRestrictions?.join(', ') || '',
    notes: pet?.notes || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      weight: parseFloat(formData.weight) || 0,
      allergies: formData.allergies.split(',').map(a => a.trim()).filter(Boolean),
      dietaryRestrictions: formData.dietaryRestrictions.split(',').map(d => d.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Pet Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., Max"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Species
          </label>
          <select
            name="species"
            value={formData.species}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="DOG">Dog</option>
            <option value="CAT">Cat</option>
            <option value="BIRD">Bird</option>
            <option value="FISH">Fish</option>
            <option value="REPTILE">Reptile</option>
            <option value="SMALL_ANIMAL">Small Animal</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <Input
          label="Breed"
          name="breed"
          value={formData.breed}
          onChange={handleChange}
          placeholder="e.g., Golden Retriever"
        />

        <Input
          label="Birth Date"
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
        />

        <Input
          label="Weight (lbs)"
          name="weight"
          type="number"
          step="0.1"
          value={formData.weight}
          onChange={handleChange}
          placeholder="e.g., 25.5"
        />
      </div>

      <Input
        label="Allergies (comma-separated)"
        name="allergies"
        value={formData.allergies}
        onChange={handleChange}
        placeholder="e.g., chicken, grain"
      />

      <Input
        label="Dietary Restrictions (comma-separated)"
        name="dietaryRestrictions"
        value={formData.dietaryRestrictions}
        onChange={handleChange}
        placeholder="e.g., grain-free, limited ingredient"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Any additional notes about your pet..."
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? 'Saving...' : pet ? 'Update Pet' : 'Add Pet'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
