'use client';

import { useState } from 'react';
import { usePets, useCreatePet, useUpdatePet, useDeletePet } from '@/hooks/usePets';
import { PetProfileCard } from '@/components/account/PetProfileCard';
import { PetProfileForm } from '@/components/account/PetProfileForm';

export const dynamic = 'force-dynamic';

export default function PetsPage() {
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [editingPet, setEditingPet] = useState<any>(null);

  const { data: pets, isLoading } = usePets();
  const createPet = useCreatePet();
  const updatePet = useUpdatePet();
  const deletePet = useDeletePet();

  const handleAddPet = async (data: any) => {
    try {
      await createPet.mutateAsync(data);
      setIsAddingPet(false);
    } catch (error) {
      console.error('Failed to add pet:', error);
    }
  };

  const handleUpdatePet = async (data: any) => {
    try {
      await updatePet.mutateAsync({ id: editingPet.id, data });
      setEditingPet(null);
    } catch (error) {
      console.error('Failed to update pet:', error);
    }
  };

  const handleDeletePet = async (id: string) => {
    if (confirm('Are you sure you want to delete this pet profile?')) {
      try {
        await deletePet.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete pet:', error);
      }
    }
  };

  if (isLoading) {
    return <PetsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Pets</h1>
          <p className="text-gray-600">Manage your pet profiles for personalized recommendations</p>
        </div>

        <button
          onClick={() => setIsAddingPet(true)}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
        >
          Add Pet
        </button>
      </div>

      {/* Pet Profiles Grid */}
      {pets && pets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet: any) => (
            <PetProfileCard
              key={pet.id}
              pet={pet}
              onEdit={() => setEditingPet(pet)}
              onDelete={() => handleDeletePet(pet.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="w-20 h-20 text-gray-400 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          <h3 className="text-xl font-bold mb-2">No pets added yet</h3>
          <p className="text-gray-600 mb-6">
            Add your pets to get personalized product recommendations
          </p>
          <button
            onClick={() => setIsAddingPet(true)}
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
          >
            Add Your First Pet
          </button>
        </div>
      )}

      {/* Add Pet Modal */}
      {isAddingPet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">Add Pet Profile</h2>
              <button
                onClick={() => setIsAddingPet(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <PetProfileForm
                onSubmit={handleAddPet}
                onCancel={() => setIsAddingPet(false)}
                isSubmitting={createPet.isPending}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Pet Modal */}
      {editingPet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">Edit Pet Profile</h2>
              <button
                onClick={() => setEditingPet(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <PetProfileForm
                pet={editingPet}
                onSubmit={handleUpdatePet}
                onCancel={() => setEditingPet(null)}
                isSubmitting={updatePet.isPending}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PetsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-96" />
        </div>
        <div className="h-12 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 h-64 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
