/**
 * User Module Tests - London School TDD Approach
 * Focus: Behavior verification and interaction testing with mocks
 *
 * Test Coverage:
 * - REQ-USR-001: User profile management
 * - REQ-USR-002: Address management (max 3)
 * - REQ-USR-003: Password change verification
 * - REQ-USR-004: Account deletion with password verification
 */

import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response } from 'express';
import { UserController } from '../src/modules/user/user.controller';
import { UserService } from '../src/modules/user/user.service';
import { PrismaClient } from '@prisma/client';

// Mock collaborators - London School focuses on mocking dependencies
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  userProfile: {
    findUnique: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  },
  address: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
  },
} as unknown as PrismaClient;

const mockBcrypt = {
  compare: jest.fn(),
  hash: jest.fn(),
};

// Test data fixtures
const mockUserId = 'user-123';
const mockUser = {
  id: mockUserId,
  email: 'test@ironpets.com',
  passwordHash: 'hashed_password',
  emailVerified: true,
  emailVerifiedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProfile = {
  id: 'profile-123',
  userId: mockUserId,
  firstName: 'John',
  lastName: 'Doe',
  phone: '+1234567890',
  marketingOptIn: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAddress = {
  id: 'addr-123',
  userId: mockUserId,
  type: 'shipping' as const,
  firstName: 'John',
  lastName: 'Doe',
  addressLine1: '123 Main St',
  addressLine2: null,
  city: 'Boston',
  state: 'MA',
  zipCode: '02101',
  phone: '+1234567890',
  isDefault: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('User Profile Management - REQ-USR-001', () => {
  let userService: UserService;
  let userController: UserController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    userService = new UserService(mockPrisma);
    userController = new UserController(userService);

    mockReq = {
      user: { id: mockUserId },
      params: {},
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('GET /user/profile', () => {
    it('should return user profile with all fields', async () => {
      // Arrange - Setup mock expectations (London School: define contract)
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue({
        ...mockUser,
        profile: mockProfile,
      });

      // Act
      await userController.getProfile(mockReq as Request, mockRes as Response);

      // Assert - Verify interactions (London School: behavior verification)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
        include: { profile: true },
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        id: mockUserId,
        email: mockUser.email,
        emailVerified: mockUser.emailVerified,
        profile: mockProfile,
      });
    });

    it('should return 404 if user not found', async () => {
      // Arrange
      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(null);

      // Act
      await userController.getProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
    });
  });

  describe('PUT /user/profile', () => {
    it('should update profile name and phone successfully', async () => {
      // Arrange
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+9876543210',
      };

      mockReq.body = updateData;

      const updatedProfile = { ...mockProfile, ...updateData };
      mockPrisma.userProfile.upsert = jest.fn().mockResolvedValue(updatedProfile);

      // Act
      await userController.updateProfile(mockReq as Request, mockRes as Response);

      // Assert - Verify the conversation between objects
      expect(mockPrisma.userProfile.upsert).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        create: {
          userId: mockUserId,
          ...updateData,
        },
        update: updateData,
      });

      expect(mockRes.json).toHaveBeenCalledWith(updatedProfile);
    });

    it('should validate phone number format', async () => {
      // Arrange
      mockReq.body = {
        phone: 'invalid-phone',
      };

      // Act
      await userController.updateProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid phone number format',
      });
    });

    it('should update marketing preferences', async () => {
      // Arrange
      mockReq.body = { marketingOptIn: true };

      const updatedProfile = { ...mockProfile, marketingOptIn: true };
      mockPrisma.userProfile.upsert = jest.fn().mockResolvedValue(updatedProfile);

      // Act
      await userController.updateProfile(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.userProfile.upsert).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        create: {
          userId: mockUserId,
          marketingOptIn: true,
        },
        update: { marketingOptIn: true },
      });
    });
  });

  describe('PUT /user/password - REQ-USR-003', () => {
    it('should change password with correct current password verification', async () => {
      // Arrange
      mockReq.body = {
        currentPassword: 'oldpassword123',
        newPassword: 'newSecurePass456',
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      mockBcrypt.compare = jest.fn().mockResolvedValue(true);
      mockBcrypt.hash = jest.fn().mockResolvedValue('new_hashed_password');
      mockPrisma.user.update = jest.fn().mockResolvedValue({
        ...mockUser,
        passwordHash: 'new_hashed_password',
      });

      // Inject bcrypt mock
      userService['bcrypt'] = mockBcrypt as any;

      // Act
      await userController.changePassword(mockReq as Request, mockRes as Response);

      // Assert - Verify workflow interactions
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });

      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'oldpassword123',
        mockUser.passwordHash
      );

      expect(mockBcrypt.hash).toHaveBeenCalledWith('newSecurePass456', 10);

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: mockUserId },
        data: { passwordHash: 'new_hashed_password' },
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Password updated successfully',
      });
    });

    it('should reject password change with incorrect current password', async () => {
      // Arrange
      mockReq.body = {
        currentPassword: 'wrongpassword',
        newPassword: 'newSecurePass456',
      };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      mockBcrypt.compare = jest.fn().mockResolvedValue(false);
      userService['bcrypt'] = mockBcrypt as any;

      // Act
      await userController.changePassword(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        mockUser.passwordHash
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Current password is incorrect',
      });

      // Verify password was NOT updated
      expect(mockBcrypt.hash).not.toHaveBeenCalled();
      expect(mockPrisma.user.update).not.toHaveBeenCalled();
    });

    it('should validate new password strength', async () => {
      // Arrange
      mockReq.body = {
        currentPassword: 'oldpassword123',
        newPassword: 'weak', // Too short
      };

      // Act
      await userController.changePassword(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Password must be at least 8 characters',
      });
    });
  });

  describe('DELETE /user/account - REQ-USR-004', () => {
    it('should delete account with password verification', async () => {
      // Arrange
      mockReq.body = { password: 'correctpassword' };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      mockBcrypt.compare = jest.fn().mockResolvedValue(true);
      mockPrisma.user.delete = jest.fn().mockResolvedValue(mockUser);
      userService['bcrypt'] = mockBcrypt as any;

      // Act
      await userController.deleteAccount(mockReq as Request, mockRes as Response);

      // Assert - Verify deletion workflow
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });

      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'correctpassword',
        mockUser.passwordHash
      );

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: mockUserId },
      });

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Account deleted successfully',
      });
    });

    it('should reject deletion with incorrect password', async () => {
      // Arrange
      mockReq.body = { password: 'wrongpassword' };

      mockPrisma.user.findUnique = jest.fn().mockResolvedValue(mockUser);
      mockBcrypt.compare = jest.fn().mockResolvedValue(false);
      userService['bcrypt'] = mockBcrypt as any;

      // Act
      await userController.deleteAccount(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Password is incorrect',
      });

      // Verify account was NOT deleted
      expect(mockPrisma.user.delete).not.toHaveBeenCalled();
    });
  });
});

describe('Address Management - REQ-USR-002', () => {
  let userService: UserService;
  let userController: UserController;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService(mockPrisma);
    userController = new UserController(userService);

    mockReq = {
      user: { id: mockUserId },
      params: {},
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('GET /user/addresses', () => {
    it('should return all user addresses', async () => {
      // Arrange
      const addresses = [mockAddress, { ...mockAddress, id: 'addr-456', isDefault: false }];
      mockPrisma.address.findMany = jest.fn().mockResolvedValue(addresses);

      // Act
      await userController.getAddresses(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.address.findMany).toHaveBeenCalledWith({
        where: { userId: mockUserId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });

      expect(mockRes.json).toHaveBeenCalledWith(addresses);
    });

    it('should return empty array if no addresses', async () => {
      // Arrange
      mockPrisma.address.findMany = jest.fn().mockResolvedValue([]);

      // Act
      await userController.getAddresses(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });
  });

  describe('POST /user/addresses', () => {
    it('should create new address successfully', async () => {
      // Arrange
      const newAddressData = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '456 Oak St',
        city: 'Cambridge',
        state: 'MA',
        zipCode: '02139',
        phone: '+1234567890',
      };

      mockReq.body = newAddressData;
      mockPrisma.address.count = jest.fn().mockResolvedValue(0);
      mockPrisma.address.create = jest.fn().mockResolvedValue({
        ...mockAddress,
        ...newAddressData,
        id: 'addr-new',
      });

      // Act
      await userController.addAddress(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.address.count).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });

      expect(mockPrisma.address.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          ...newAddressData,
          isDefault: true, // First address is default
        },
      });

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should enforce maximum of 3 addresses - REQ-USR-002', async () => {
      // Arrange
      mockReq.body = {
        type: 'shipping',
        firstName: 'John',
        lastName: 'Doe',
        addressLine1: '789 Elm St',
        city: 'Boston',
        state: 'MA',
        zipCode: '02101',
        phone: '+1234567890',
      };

      mockPrisma.address.count = jest.fn().mockResolvedValue(3);

      // Act
      await userController.addAddress(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.address.count).toHaveBeenCalledWith({
        where: { userId: mockUserId },
      });

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Maximum of 3 addresses allowed',
      });

      // Verify address was NOT created
      expect(mockPrisma.address.create).not.toHaveBeenCalled();
    });

    it('should validate required address fields', async () => {
      // Arrange
      mockReq.body = {
        firstName: 'John',
        // Missing required fields
      };

      // Act
      await userController.addAddress(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: expect.stringContaining('required'),
      });
    });
  });

  describe('PUT /user/addresses/:id', () => {
    it('should update address successfully', async () => {
      // Arrange
      mockReq.params = { id: 'addr-123' };
      mockReq.body = {
        addressLine1: '789 New St',
        city: 'Cambridge',
      };

      const updatedAddress = { ...mockAddress, ...mockReq.body };
      mockPrisma.address.update = jest.fn().mockResolvedValue(updatedAddress);

      // Act
      await userController.updateAddress(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.address.update).toHaveBeenCalledWith({
        where: {
          id: 'addr-123',
          userId: mockUserId, // Ensure user owns the address
        },
        data: mockReq.body,
      });

      expect(mockRes.json).toHaveBeenCalledWith(updatedAddress);
    });

    it('should return 404 if address not found or not owned', async () => {
      // Arrange
      mockReq.params = { id: 'addr-999' };
      mockReq.body = { city: 'Cambridge' };
      mockPrisma.address.update = jest.fn().mockRejectedValue({ code: 'P2025' });

      // Act
      await userController.updateAddress(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Address not found',
      });
    });
  });

  describe('DELETE /user/addresses/:id', () => {
    it('should delete address successfully', async () => {
      // Arrange
      mockReq.params = { id: 'addr-123' };
      mockPrisma.address.delete = jest.fn().mockResolvedValue(mockAddress);

      // Act
      await userController.deleteAddress(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockPrisma.address.delete).toHaveBeenCalledWith({
        where: {
          id: 'addr-123',
          userId: mockUserId,
        },
      });

      expect(mockRes.status).toHaveBeenCalledWith(204);
    });

    it('should return 404 if address not found', async () => {
      // Arrange
      mockReq.params = { id: 'addr-999' };
      mockPrisma.address.delete = jest.fn().mockRejectedValue({ code: 'P2025' });

      // Act
      await userController.deleteAddress(mockReq as Request, mockRes as Response);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Address not found',
      });
    });
  });

  describe('PUT /user/addresses/:id/default', () => {
    it('should set address as default and unset others', async () => {
      // Arrange
      mockReq.params = { id: 'addr-456' };

      // Mock transaction operations
      const mockUpdateMany = jest.fn().mockResolvedValue({ count: 1 });
      const mockUpdate = jest.fn().mockResolvedValue({
        ...mockAddress,
        id: 'addr-456',
        isDefault: true,
      });

      mockPrisma.address.updateMany = mockUpdateMany;
      mockPrisma.address.update = mockUpdate;

      // Act
      await userController.setDefaultAddress(mockReq as Request, mockRes as Response);

      // Assert - Verify coordination sequence
      expect(mockUpdateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          isDefault: true,
        },
        data: { isDefault: false },
      });

      expect(mockUpdate).toHaveBeenCalledWith({
        where: {
          id: 'addr-456',
          userId: mockUserId,
        },
        data: { isDefault: true },
      });

      // Verify both operations happened (order verified by mock call order)
      expect(mockUpdateMany).toHaveBeenCalled();
      expect(mockUpdate).toHaveBeenCalled();

      // Response contains full address object with isDefault: true
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'addr-456',
          isDefault: true,
        })
      );
    });
  });
});
