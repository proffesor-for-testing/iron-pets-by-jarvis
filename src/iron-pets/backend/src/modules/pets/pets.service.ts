/**
 * Pets Service - Business Logic Layer
 * Implements REQ-PET-001 to REQ-PET-004
 */

import { PrismaClient, Pet, PetSpecies, WeightUnit, Product } from '@prisma/client';

export interface CreatePetData {
  name: string;
  species: PetSpecies;
  breed?: string;
  birthDate?: Date;
  weight?: number;
  weightUnit?: WeightUnit;
  photoUrl?: string;
}

export interface UpdatePetData {
  name?: string;
  breed?: string;
  birthDate?: Date;
  weight?: number;
  weightUnit?: WeightUnit;
  photoUrl?: string;
}

export interface PetWithAge extends Pet {
  age?: number;
}

export class PetsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Calculate pet age from birth date
   */
  private calculateAge(birthDate: Date | null): number | undefined {
    if (!birthDate) return undefined;

    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  }

  /**
   * Determine age category for product recommendations
   */
  private getAgeCategory(ageInYears: number | undefined, species: PetSpecies): string[] {
    if (ageInYears === undefined) return ['all'];

    const categories: string[] = ['all'];

    if (species === 'dog') {
      if (ageInYears < 1) categories.push('puppy');
      else if (ageInYears >= 7) categories.push('senior');
      else categories.push('adult');
    } else if (species === 'cat') {
      if (ageInYears < 1) categories.push('kitten');
      else if (ageInYears >= 7) categories.push('senior');
      else categories.push('adult');
    }

    return categories;
  }

  /**
   * Determine weight category for product recommendations
   */
  private getWeightCategory(weight: number | null, species: PetSpecies): string[] {
    if (!weight) return ['all'];

    const categories: string[] = ['all'];

    if (species === 'dog') {
      if (weight < 25) categories.push('small');
      else if (weight < 60) categories.push('medium');
      else categories.push('large');
    }

    return categories;
  }

  /**
   * REQ-PET-002: Get all user's pets
   */
  async getPets(userId: string, species?: PetSpecies): Promise<PetWithAge[]> {
    const where: any = { userId };
    if (species) {
      where.species = species;
    }

    const pets = await this.prisma.pet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return pets.map((pet) => ({
      ...pet,
      age: this.calculateAge(pet.birthDate),
    }));
  }

  /**
   * REQ-PET-001: Create new pet profile
   */
  async createPet(userId: string, data: CreatePetData): Promise<PetWithAge> {
    const pet = await this.prisma.pet.create({
      data: {
        userId,
        ...data,
      },
    });

    return {
      ...pet,
      age: this.calculateAge(pet.birthDate),
    };
  }

  /**
   * REQ-PET-002: Get pet by ID
   */
  async getPetById(userId: string, petId: string): Promise<PetWithAge | null> {
    const pet = await this.prisma.pet.findUnique({
      where: {
        id: petId,
        userId, // Ensure user owns the pet
      },
    });

    if (!pet) return null;

    return {
      ...pet,
      age: this.calculateAge(pet.birthDate),
    };
  }

  /**
   * REQ-PET-002: Update pet profile
   */
  async updatePet(userId: string, petId: string, data: UpdatePetData): Promise<PetWithAge> {
    const pet = await this.prisma.pet.update({
      where: {
        id: petId,
        userId,
      },
      data,
    });

    return {
      ...pet,
      age: this.calculateAge(pet.birthDate),
    };
  }

  /**
   * REQ-PET-003: Delete pet profile
   */
  async deletePet(userId: string, petId: string): Promise<void> {
    await this.prisma.pet.delete({
      where: {
        id: petId,
        userId,
      },
    });
  }

  /**
   * REQ-PET-004: Get product recommendations based on pet
   */
  async getRecommendationsForPet(userId: string, petId: string): Promise<Product[]> {
    // Get pet details
    const pet = await this.prisma.pet.findUnique({
      where: {
        id: petId,
        userId,
      },
    });

    if (!pet) {
      throw new Error('Pet not found');
    }

    // Calculate age and determine categories
    const age = this.calculateAge(pet.birthDate);
    const ageCategories = this.getAgeCategory(age, pet.species);
    const weightCategories = this.getWeightCategory(
      pet.weight ? Number(pet.weight) : null,
      pet.species
    );

    // Build product query with filters
    const where: any = {
      isActive: true,
      OR: [
        // Match by species in specifications
        {
          specifications: {
            path: ['species'],
            equals: pet.species,
          },
        },
        // Match by category slug containing species name
        {
          category: {
            slug: {
              contains: pet.species,
            },
          },
        },
      ],
    };

    // Add age category filter if available
    if (ageCategories.length > 1) {
      where.OR.push({
        specifications: {
          path: ['ageGroup'],
          in: ageCategories,
        },
      });
    }

    // Add weight category filter if available
    if (weightCategories.length > 1) {
      where.OR.push({
        specifications: {
          path: ['weightCategory'],
          in: weightCategories,
        },
      });
    }

    // Query products with recommendations
    const products = await this.prisma.product.findMany({
      where,
      include: {
        category: true,
        brand: true,
        images: {
          where: { isPrimary: true },
          take: 1,
        },
      },
      take: 20, // Limit to 20 recommendations
      orderBy: [
        { stockQuantity: 'desc' }, // Prioritize in-stock items
        { createdAt: 'desc' }, // Show newer products first
      ],
    });

    return products;
  }
}
