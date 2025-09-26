'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { signOut } from '@/app/auth/actions';
import Link from 'next/link';
import Image from 'next/image';
import type { User } from '@supabase/supabase-js';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Not logged in</h1>
          <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
            Please log in to view your profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center hover:scale-105 transition-transform duration-200">
              <Image 
                src='/MyPlace2.png' 
                alt='MyPlace Logo' 
                width={500}
                height={300}
                className='w-32 h-auto object-contain'
              />
            </Link>
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-12">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {user.user_metadata.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {user.user_metadata.full_name || 'User Profile'}
                </h1>
                <p className="text-orange-100 text-lg">
                  Welcome to your MyPlace profile
                </p>
              </div>
            </div>
          </div>

          {/* Profile Information */}
          <div className="px-8 py-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Account Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Full Name
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {user.user_metadata.full_name || 'Not provided'}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Email Address
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {user.email}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Account Created
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Last Sign In
                </h3>
                <p className="text-lg font-semibold text-gray-900">
                  {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Not available'}
                </p>
              </div>

              {user.user_metadata.avatar_url && (
                <div className="bg-gray-50 rounded-lg p-6 md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Profile Picture
                  </h3>
                  <div className="mt-2">
                    <Image
                      src={user.user_metadata.avatar_url}
                      alt="Profile Picture"
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Additional Metadata */}
            {Object.keys(user.user_metadata).length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                    {JSON.stringify(user.user_metadata, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <form action={signOut} className="flex-1">
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
                  >
                    Sign Out
                  </button>
                </form>
                
                <Link
                  href="/"
                  className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 text-center"
                >
                  Continue to MyPlace
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
