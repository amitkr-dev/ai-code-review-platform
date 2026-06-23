/**
 * ============================================
 * Profile Page — placeholder to satisfy route import
 * ============================================
 */

import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="page-container">
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900  dark:text-white mb-2">Profile</h1>
        {user ? (
          <div className="space-y-2">
            <p className="text-gray-600 dark:text-gray-300">Name: {user.name}</p>
            <p className="text-gray-600 dark:text-gray-300">Email: {user.email}</p>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No user information available.</p>
        )}
      </div>
    </div>
  );
}
