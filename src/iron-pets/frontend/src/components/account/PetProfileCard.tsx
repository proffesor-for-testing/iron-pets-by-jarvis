'use client';

import { Pet } from '@/types';
import Image from 'next/image';

interface PetProfileCardProps {
  pet: Pet;
  onEdit: (pet: Pet) => void;
  onDelete: (id: string) => void;
}

export function PetProfileCard({ pet, onEdit, onDelete }: PetProfileCardProps) {
  const getAgeDisplay = (birthDate: string) => {
    const birth = new Date(birthDate);
    const now = new Date();
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();

    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} old`;
    }
    return `${months} month${months > 1 ? 's' : ''} old`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {pet.imageUrl ? (
            <Image
              src={pet.imageUrl}
              alt={pet.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl">
              {pet.species === 'DOG' ? '🐕' : pet.species === 'CAT' ? '🐱' : '🐾'}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{pet.name}</h3>
          <p className="text-sm text-gray-500">
            {pet.breed}{pet.birthDate && ` · ${getAgeDisplay(pet.birthDate)}`}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {pet.species}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {pet.weight} lbs
            </span>
          </div>
        </div>
      </div>

      {pet.allergies && pet.allergies.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 rounded-md">
          <p className="text-sm font-medium text-red-800">Allergies:</p>
          <p className="text-sm text-red-700">{pet.allergies.join(', ')}</p>
        </div>
      )}

      {pet.dietaryRestrictions && pet.dietaryRestrictions.length > 0 && (
        <div className="mt-2 p-3 bg-yellow-50 rounded-md">
          <p className="text-sm font-medium text-yellow-800">Dietary Restrictions:</p>
          <p className="text-sm text-yellow-700">{pet.dietaryRestrictions.join(', ')}</p>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onEdit(pet)}
          className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(pet.id)}
          className="flex-1 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
