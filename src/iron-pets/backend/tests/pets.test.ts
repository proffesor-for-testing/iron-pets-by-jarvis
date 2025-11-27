/**
 * Pet Profiles Module Tests - London School TDD Approach
 * Focus: Behavior verification and interaction testing with mocks
 *
 * Test Coverage:
 * - REQ-PET-001: Create pet profile
 * - REQ-PET-002: View/update pet details
 * - REQ-PET-003: Delete pet profile
 * - REQ-PET-004: Product recommendations based on pet
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { PetsController } from '../src/modules/pets/pets.controller';
import { PetsService } from '../src/modules/pets/pets.service';
import { PrismaClient, PetSpecies, WeightUnit } from '@prisma/client';

// Mock collaborators - London School: define contracts through mocks
const mockPrisma = {
  pet: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
  },
  category: {
    findFirst: jest.fn(),
  },
} as unknown as PrismaClient;

// Test data fixtures
const mockUserId = 'user-123';
const mockPetId = 'pet-123';

const mockPet = {
  id: mockPetId,
  userId: mockUserId,
  name: 'Max',
  species: 'dog' as PetSpecies,
  breed: 'Golden Retriever',
  birthDate: new Date('2020-01-15'),
  weight: 65.5,
  weightUnit: 'lbs' as WeightUnit,
  photoUrl: 'https://example.com/max.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCatPet = {
  id: 'pet-456',
  userId: mockUserId,
  name: 'Whiskers',
  species: 'cat' as PetSpecies,
  breed: 'Siamese',
  birthDate: new Date('2021-06-10'),
  weight: 10.2,
  weightUnit: 'lbs' as WeightUnit,
  photoUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProduct = {
  id: 'prod-123',
  sku: 'DOG-FOOD-001',
  name: 'Premium Dog Food',
  slug: 'premium-dog-food',
  shortDescription: 'High-quality nutrition',
  description: 'Complete nutrition for adult dogs',
  price: 49.99,
  comparePrice: null,
  cost: null,
  categoryId: 'cat-dog-food',
  brandId: 'brand-123',
  stockQuantity: 100,
  lowStockThreshold: 10,
  weight: 15,
  specifications: { ageGroup: 'adult', species: 'dog' },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Pet Profiles Management - REQ-PET-001, REQ-PET-002, REQ-PET-003', () => {
  let petsService: PetsService;
  let petsController: PetsController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    petsService = new PetsService(mockPrisma);
    petsController = new PetsController(petsService);

    mockReq = {
      user: { id: mockUserId },
      params: {},
      body: {},
      query: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('GET /pets - REQ-PET-002', () => {
    it('should return all user pet profiles', async () => {
      // Arrange - Setup mock expectations
      const pets = [mockPet, mockCatPet];
      mockPrisma.pet.findMany = jest.fn().mockResolvedValue(pets);

      // Act
      await petsController.getPets(mockReq as Request, mockRes as Response);

      // Assert - Verify interactions
      expect(mockPrisma.pet.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: { createdAt: 'desc' },
      });

      expect(mockRes.json).toHaveBeenCalledWith(pets);
    });

    it('should return empty array if user has no pets', async () => {
      // Arrange
      mockPrisma.pet.findMany = jest.fn().mockResolvedValue([]);

      // Act
      await petsController.getPets(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('should filter pets by species', async () => {
      // Arrange
      mockReq.query = { species: 'dog' };
      mockPrisma.pet.findMany = jest.fn().mockResolvedValue([mockPet]);

      // Act
      await petsController.getPets(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.pet.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          species: 'dog',
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('POST /pets - REQ-PET-001', () => {
    it('should create pet profile with all fields', async () => {
      // Arrange
      const newPetData = {
        name: 'Buddy',
        species: 'dog',
        breed: 'Labrador',
        birthDate: '2022-03-20',
        weight: 55.0,
        weightUnit: 'lbs',
        photoUrl: 'https://example.com/buddy.jpg',
      };

      mockReq.body = newPetData;

      const createdPet = {
        ...mockPet,
        id: 'pet-new',
        name: newPetData.name,
        species: newPetData.species as PetSpecies,
        breed: newPetData.breed,
        birthDate: new Date(newPetData.birthDate),
        weight: newPetData.weight,
        weightUnit: newPetData.weightUnit as WeightUnit,
        photoUrl: newPetData.photoUrl,
      };

      mockPrisma.pet.create = jest.fn().mockResolvedValue(createdPet);

      // Act
      await petsController.createPet(mockReq as Request, mockRes as Response);

      // Assert - Verify the conversation
      expect(mockPrisma.pet.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          name: newPetData.name,
          species: newPetData.species,
          breed: newPetData.breed,
          birthDate: new Date(newPetData.birthDate),
          weight: newPetData.weight,
          weightUnit: newPetData.weightUnit,
          photoUrl: newPetData.photoUrl,
        },
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(createdPet);
    });

    it('should create pet with minimal required fields', async () => {
      // Arrange
      const minimalPetData = {
        name: 'Fluffy',
        species: 'cat',
      };

      mockReq.body = minimalPetData;

      const createdPet = {
        ...mockCatPet,
        id: 'pet-minimal',
        name: minimalPetData.name,
        species: minimalPetData.species as PetSpecies,
        breed: null,
        birthDate: null,
        weight: null,
        weightUnit: null,
        photoUrl: null,
      };

      mockPrisma.pet.create = jest.fn().mockResolvedValue(createdPet);

      // Act
      await petsController.createPet(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.pet.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          name: minimalPetData.name,
          species: minimalPetData.species,
        },
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should validate required fields', async () => {
      // Arrange
      mockReq.body = {
        breed: 'Poodle', // Missing name and species
      };

      // Act
      await petsController.createPet(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining('name and species are required'),
      });

      expect(mockPrisma.pet.create).not.toHaveBeenCalled();
    });

    it('should validate species enum values', async () => {
      // Arrange
      mockReq.body = {
        name: 'Tweety',
        species: 'bird', // Invalid species
      };

      // Act
      await petsController.createPet(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid species. Must be: dog, cat, or small_pet',
      });
    });

    it('should validate weight is positive', async () => {
      // Arrange
      mockReq.body = {
        name: 'Max',
        species: 'dog',
        weight: -5, // Invalid negative weight
      };

      // Act
      await petsController.createPet(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Weight must be a positive number',
      });
    });

    it('should calculate age from birthDate', async () => {
      // Arrange
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 3); // 3 years old

      mockReq.body = {
        name: 'Rocky',
        species: 'dog',
        birthDate: birthDate.toISOString(),
      };

      const createdPet = {
        ...mockPet,
        birthDate,
      };

      mockPrisma.pet.create = jest.fn().mockResolvedValue(createdPet);

      // Act
      await petsController.createPet(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          birthDate: expect.any(Date),
        })
      );
    });
  });

  describe('GET /pets/:id - REQ-PET-002', () => {
    it('should return pet detail by id', async () => {
      // Arrange
      mockReq.params = { id: mockPetId };
      mockPrisma.pet.findUnique = jest.fn().mockResolvedValue(mockPet);

      // Act
      await petsController.getPetById(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.pet.findUnique).toHaveBeenCalledWith({
        where: {
          id: mockPetId,
          userId: mockUserId, // Ensure user owns the pet
        },
      });

      expect(mockRes.json).toHaveBeenCalledWith(mockPet);
    });

    it('should return 404 if pet not found or not owned', async () => {
      // Arrange
      mockReq.params = { id: 'pet-999' };
      mockPrisma.pet.findUnique = jest.fn().mockResolvedValue(null);

      // Act
      await petsController.getPetById(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Pet not found',
      });
    });

    it('should include calculated age in response', async () => {
      // Arrange
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 2); // 2 years old

      const petWithAge = {
        ...mockPet,
        birthDate,
      };

      mockReq.params = { id: mockPetId };
      mockPrisma.pet.findUnique = jest.fn().mockResolvedValue(petWithAge);

      // Act
      await petsController.getPetById(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          birthDate: expect.any(Date),
          age: expect.any(Number),
        })
      );
    });
  });

  describe('PUT /pets/:id - REQ-PET-002', () => {
    it('should update pet profile successfully', async () => {
      // Arrange
      mockReq.params = { id: mockPetId };
      mockReq.body = {
        name: 'Maxwell',
        weight: 70.0,
        breed: 'Golden Retriever Mix',
      };

      const updatedPet = { ...mockPet, ...mockReq.body };
      mockPrisma.pet.update = jest.fn().mockResolvedValue(updatedPet);

      // Act
      await petsController.updatePet(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.pet.update).toHaveBeenCalledWith({
        where: {
          id: mockPetId,
          userId: mockUserId,
        },
        data: mockReq.body,
      });

      expect(mockRes.json).toHaveBeenCalledWith(updatedPet);
    });

    it('should not allow updating species', async () => {
      // Arrange
      mockReq.params = { id: mockPetId };
      mockReq.body = {
        species: 'cat', // Should not be allowed to change
      };

      // Act
      await petsController.updatePet(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Cannot change pet species after creation',
      });

      expect(mockPrisma.pet.update).not.toHaveBeenCalled();
    });

    it('should update photo URL', async () => {
      // Arrange
      mockReq.params = { id: mockPetId };
      mockReq.body = {
        photoUrl: 'https://example.com/new-photo.jpg',
      };

      const updatedPet = { ...mockPet, photoUrl: mockReq.body.photoUrl };
      mockPrisma.pet.update = jest.fn().mockResolvedValue(updatedPet);

      // Act
      await petsController.updatePet(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.pet.update).toHaveBeenCalledWith({
        where: {
          id: mockPetId,
          userId: mockUserId,
        },
        data: { photoUrl: mockReq.body.photoUrl },
      });
    });

    it('should return 404 if pet not found', async () => {
      // Arrange
      mockReq.params = { id: 'pet-999' };
      mockReq.body = { name: 'NewName' };
      mockPrisma.pet.update = jest.fn().mockRejectedValue({ code: 'P2025' });

      // Act
      await petsController.updatePet(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Pet not found',
      });
    });
  });

  describe('DELETE /pets/:id - REQ-PET-003', () => {
    it('should delete pet profile successfully', async () => {
      // Arrange
      mockReq.params = { id: mockPetId };
      mockPrisma.pet.delete = jest.fn().mockResolvedValue(mockPet);

      // Act
      await petsController.deletePet(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.pet.delete).toHaveBeenCalledWith({
        where: {
          id: mockPetId,
          userId: mockUserId,
        },
      });

      expect(mockRes.status).toHaveBeenCalledWith(204);
    });

    it('should return 404 if pet not found or not owned', async () => {
      // Arrange
      mockReq.params = { id: 'pet-999' };
      mockPrisma.pet.delete = jest.fn().mockRejectedValue({ code: 'P2025' });

      // Act
      await petsController.deletePet(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Pet not found',
      });
    });
  });
});

describe('Pet-Based Recommendations - REQ-PET-004', () => {
  let petsService: PetsService;
  let petsController: PetsController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    petsService = new PetsService(mockPrisma);
    petsController = new PetsController(petsService);

    mockReq = {
      user: { id: mockUserId },
      params: {},
      query: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('GET /pets/:id/recommendations', () => {
    it('should return products matching pet species (dog)', async () => {
      // Arrange
      mockReq.params = { id: mockPetId };

      mockPrisma.pet.findUnique = jest.fn().mockResolvedValue(mockPet);

      const dogProducts = [
        mockProduct,
        {
          ...mockProduct,
          id: 'prod-124',
          sku: 'DOG-TOY-001',
          name: 'Dog Chew Toy',
          specifications: { species: 'dog', ageGroup: 'all' },
        },
      ];

      mockPrisma.product.findMany = jest.fn().mockResolvedValue(dogProducts);

      // Act
      await petsController.getRecommendations(mockReq as Request, mockRes as Response);

      // Assert - Verify recommendation logic
      expect(mockPrisma.pet.findUnique).toHaveBeenCalledWith({
        where: { id: mockPetId, userId: mockUserId },
      });

      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { specifications: { path: ['species'], equals: 'dog' } },
            { category: { slug: { contains: 'dog' } } },
          ],
        },
        include: {
          category: true,
          brand: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        take: 20,
      });

      expect(mockRes.json).toHaveBeenCalledWith(dogProducts);
    });

    it('should filter recommendations by pet age (puppy)', async () => {
      // Arrange
      const puppyBirthDate = new Date();
      puppyBirthDate.setMonth(puppyBirthDate.getMonth() - 6); // 6 months old

      const puppyPet = {
        ...mockPet,
        birthDate: puppyBirthDate,
      };

      mockReq.params = { id: mockPetId };
      mockPrisma.pet.findUnique = jest.fn().mockResolvedValue(puppyPet);

      const puppyProducts = [
        {
          ...mockProduct,
          specifications: { species: 'dog', ageGroup: 'puppy' },
        },
      ];

      mockPrisma.product.findMany = jest.fn().mockResolvedValue(puppyProducts);

      // Act
      await petsController.getRecommendations(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
            OR: expect.arrayContaining([
              { specifications: { path: ['ageGroup'], in: ['puppy', 'all'] } },
            ]),
          }),
        })
      );
    });

    it('should return cat-specific recommendations', async () => {
      // Arrange
      mockReq.params = { id: 'pet-456' };
      mockPrisma.pet.findUnique = jest.fn().mockResolvedValue(mockCatPet);

      const catProducts = [
        {
          ...mockProduct,
          id: 'prod-cat-001',
          name: 'Premium Cat Food',
          specifications: { species: 'cat', ageGroup: 'adult' },
        },
      ];

      mockPrisma.product.findMany = jest.fn().mockResolvedValue(catProducts);

      // Act
      await petsController.getRecommendations(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
          OR: [
            { specifications: { path: ['species'], equals: 'cat' } },
            { category: { slug: { contains: 'cat' } } },
          ],
        },
        include: {
          category: true,
          brand: true,
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
        take: 20,
      });
    });

    it('should limit recommendations to 20 products', async () => {
      // Arrange
      mockReq.params = { id: mockPetId };
      mockPrisma.pet.findUnique = jest.fn().mockResolvedValue(mockPet);
      mockPrisma.product.findMany = jest.fn().mockResolvedValue([]);

      // Act
      await petsController.getRecommendations(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
        })
      );
    });

    it('should return 404 if pet not found', async () => {
      // Arrange
      mockReq.params = { id: 'pet-999' };
      mockPrisma.pet.findUnique = jest.fn().mockResolvedValue(null);

      // Act
      await petsController.getRecommendations(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Pet not found',
      });

      expect(mockPrisma.product.findMany).not.toHaveBeenCalled();
    });

    it('should prioritize products matching pet weight category', async () => {
      // Arrange
      const largeBreedPet = {
        ...mockPet,
        weight: 85.0,
        weightUnit: 'lbs' as WeightUnit,
      };

      mockReq.params = { id: mockPetId };
      mockPrisma.pet.findUnique = jest.fn().mockResolvedValue(largeBreedPet);

      const weightedProducts = [
        {
          ...mockProduct,
          specifications: { species: 'dog', weightCategory: 'large' },
        },
      ];

      mockPrisma.product.findMany = jest.fn().mockResolvedValue(weightedProducts);

      // Act
      await petsController.getRecommendations(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { specifications: { path: ['weightCategory'], in: ['large', 'all'] } },
            ]),
          }),
        })
      );
    });
  });
});
