/**
 * User Service - Business Logic Layer
 * Implements REQ-USR-001 to REQ-USR-004
 */

import { PrismaClient, User, UserProfile, Address } from '@prisma/client';
import bcrypt from 'bcryptjs';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  marketingOptIn?: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface CreateAddressData {
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export interface UpdateAddressData {
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
}

export class UserService {
  private bcrypt = bcrypt;

  constructor(private prisma: PrismaClient) {}

  /**
   * REQ-USR-001: Get user profile with all details
   */
  async getProfile(userId: string): Promise<(User & { profile: UserProfile | null }) | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
  }

  /**
   * REQ-USR-001: Update user profile information
   */
  async updateProfile(userId: string, data: UpdateProfileData): Promise<UserProfile> {
    return this.prisma.userProfile.upsert({
      where: { userId },
      create: {
        userId,
        ...data,
      },
      update: data,
    });
  }

  /**
   * REQ-USR-003: Change password with current password verification
   */
  async changePassword(userId: string, data: ChangePasswordData): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValidPassword = await this.bcrypt.compare(
      data.currentPassword,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await this.bcrypt.hash(data.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });
  }

  /**
   * REQ-USR-004: Delete user account with password verification
   */
  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify password before deletion
    const isValidPassword = await this.bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      throw new Error('Password is incorrect');
    }

    // Delete user (cascade will delete related data)
    await this.prisma.user.delete({
      where: { id: userId },
    });
  }

  /**
   * REQ-USR-002: Get all user addresses
   */
  async getAddresses(userId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  /**
   * REQ-USR-002: Add new address (max 3)
   */
  async addAddress(userId: string, data: CreateAddressData): Promise<Address> {
    // Check address count limit
    const addressCount = await this.prisma.address.count({
      where: { userId },
    });

    if (addressCount >= 3) {
      throw new Error('Maximum of 3 addresses allowed');
    }

    // If first address, set as default
    const isDefault = addressCount === 0;

    return this.prisma.address.create({
      data: {
        userId,
        ...data,
        isDefault,
      },
    });
  }

  /**
   * REQ-USR-002: Update existing address
   */
  async updateAddress(
    userId: string,
    addressId: string,
    data: UpdateAddressData
  ): Promise<Address> {
    return this.prisma.address.update({
      where: {
        id: addressId,
        userId, // Ensure user owns the address
      },
      data,
    });
  }

  /**
   * REQ-USR-002: Delete address
   */
  async deleteAddress(userId: string, addressId: string): Promise<void> {
    await this.prisma.address.delete({
      where: {
        id: addressId,
        userId,
      },
    });
  }

  /**
   * REQ-USR-002: Set default address
   */
  async setDefaultAddress(userId: string, addressId: string): Promise<Address> {
    // First, unset current default
    await this.prisma.address.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: { isDefault: false },
    });

    // Then set new default
    return this.prisma.address.update({
      where: {
        id: addressId,
        userId,
      },
      data: { isDefault: true },
    });
  }
}
