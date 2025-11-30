'use client';

import { useState } from 'react';
import { useUser, useUpdateProfile, useChangePassword, useLogout } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useDeleteAccount } from '@/hooks/useAccountActions';

export const dynamic = 'force-dynamic';

export default function SettingsPage() {
  const { data: user, isLoading } = useUser();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const deleteAccount = useDeleteAccount();
  const logout = useLogout();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'preferences' | 'danger'>('profile');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Account Settings</h1>
        <p className="text-gray-600">Manage your account preferences and security</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Tabs */}
        <div className="border-b">
          <nav className="flex">
            {[
              { key: 'profile', label: 'Profile' },
              { key: 'password', label: 'Password' },
              { key: 'preferences', label: 'Preferences' },
              { key: 'danger', label: 'Danger Zone' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-6 py-4 font-medium transition border-b-2 ${
                  activeTab === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                } ${tab.key === 'danger' ? 'text-red-600 hover:text-red-700' : ''}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <ProfileSettings user={user} updateProfile={updateProfile} />
          )}
          {activeTab === 'password' && (
            <PasswordSettings changePassword={changePassword} />
          )}
          {activeTab === 'preferences' && (
            <PreferencesSettings user={user} updateProfile={updateProfile} />
          )}
          {activeTab === 'danger' && (
            <DangerZone onDelete={() => setShowDeleteModal(true)} />
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async (password) => {
            try {
              await deleteAccount.mutateAsync(password);
              await logout.mutateAsync();
              router.push('/');
            } catch (err) {
              // Error handled by mutation
            }
          }}
          isLoading={deleteAccount.isPending}
        />
      )}
    </div>
  );
}

function ProfileSettings({ user, updateProfile }: { user: any; updateProfile: any }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(formData);
      setSuccess(true);
    } catch (err) {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <h2 className="text-xl font-semibold">Profile Information</h2>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          Profile updated successfully!
        </div>
      )}

      {updateProfile.isError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          {updateProfile.error instanceof Error
            ? updateProfile.error.message
            : 'Failed to update profile'}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-2">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-2">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-2">
          Phone Number
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(555) 555-5555"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={updateProfile.isPending}
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-50"
      >
        {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

function PasswordSettings({ changePassword }: { changePassword: any }) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccess(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await changePassword.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setSuccess(true);
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <h2 className="text-xl font-semibold">Change Password</h2>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          Password changed successfully!
        </div>
      )}

      {(error || changePassword.isError) && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          {error ||
            (changePassword.error instanceof Error
              ? changePassword.error.message
              : 'Failed to change password')}
        </div>
      )}

      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
          Current Password
        </label>
        <input
          type="password"
          id="currentPassword"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <p className="text-sm text-gray-500 mt-1">Minimum 8 characters</p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
          Confirm New Password
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={changePassword.isPending}
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-50"
      >
        {changePassword.isPending ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  );
}

function PreferencesSettings({ user, updateProfile }: { user: any; updateProfile: any }) {
  const [preferences, setPreferences] = useState({
    emailMarketing: user?.preferences?.emailMarketing ?? true,
    smsNotifications: user?.preferences?.smsNotifications ?? false,
    orderUpdates: user?.preferences?.orderUpdates ?? true,
    petReminders: user?.preferences?.petReminders ?? true,
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({ preferences });
      setSuccess(true);
    } catch (err) {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      <h2 className="text-xl font-semibold">Communication Preferences</h2>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          Preferences updated successfully!
        </div>
      )}

      <div className="space-y-4">
        <PreferenceToggle
          label="Email Marketing"
          description="Receive promotional emails about sales and new products"
          checked={preferences.emailMarketing}
          onChange={() => handleChange('emailMarketing')}
        />

        <PreferenceToggle
          label="SMS Notifications"
          description="Receive text messages about your orders"
          checked={preferences.smsNotifications}
          onChange={() => handleChange('smsNotifications')}
        />

        <PreferenceToggle
          label="Order Updates"
          description="Receive email updates about your orders"
          checked={preferences.orderUpdates}
          onChange={() => handleChange('orderUpdates')}
        />

        <PreferenceToggle
          label="Pet Reminders"
          description="Receive reminders about pet food and supplies"
          checked={preferences.petReminders}
          onChange={() => handleChange('petReminders')}
        />
      </div>

      <button
        type="submit"
        disabled={updateProfile.isPending}
        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium disabled:opacity-50"
      >
        {updateProfile.isPending ? 'Saving...' : 'Save Preferences'}
      </button>
    </form>
  );
}

function PreferenceToggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition ${
          checked ? 'bg-primary' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : ''
          }`}
        />
      </button>
    </div>
  );
}

function DangerZone({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-xl font-semibold text-red-600">Danger Zone</h2>

      <div className="p-6 border-2 border-red-200 rounded-lg bg-red-50">
        <h3 className="font-semibold text-red-800 mb-2">Delete Account</h3>
        <p className="text-red-700 text-sm mb-4">
          Once you delete your account, there is no going back. This will permanently delete your
          account, orders, pet profiles, and all associated data.
        </p>
        <button
          onClick={onDelete}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
        >
          Delete My Account
        </button>
      </div>

      <div className="p-6 border border-gray-200 rounded-lg">
        <h3 className="font-semibold mb-2">Export Your Data</h3>
        <p className="text-gray-600 text-sm mb-4">
          Download a copy of all your data including orders, pet profiles, and account information.
        </p>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium">
          Request Data Export
        </button>
      </div>
    </div>
  );
}

function DeleteAccountModal({
  onClose,
  onConfirm,
  isLoading,
}: {
  onClose: () => void;
  onConfirm: (password: string) => void;
  isLoading: boolean;
}) {
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-red-600 mb-4">Delete Account</h3>

        <p className="text-gray-600 mb-4">
          This action is <strong>permanent</strong> and cannot be undone. All your data will be
          deleted including:
        </p>

        <ul className="list-disc list-inside text-sm text-gray-600 mb-4 space-y-1">
          <li>Order history</li>
          <li>Pet profiles</li>
          <li>Saved addresses</li>
          <li>Account settings</li>
        </ul>

        <div className="mb-4">
          <label htmlFor="deletePassword" className="block text-sm font-medium mb-2">
            Enter your password to confirm
          </label>
          <input
            type="password"
            id="deletePassword"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <label className="flex items-center gap-2 mb-6">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700">
            I understand this action is permanent
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(password)}
            disabled={!password || !confirmed || isLoading}
            className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 bg-gray-200 rounded w-64 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-96" />
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="border-b p-4">
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-24" />
            ))}
          </div>
        </div>
        <div className="p-6 space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
