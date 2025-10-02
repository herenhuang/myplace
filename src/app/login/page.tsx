'use client';

import { useState } from 'react';
import { login } from './actions';
import { oAuthSignIn } from '../auth/actions';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-full max-w-md p-8 space-y-6">
        <h1 className="text-2xl font-bold text-center text-black tracking-tight mb-8"> Welcome Back! </h1>


        <form action={oAuthSignIn}>
          <input type="hidden" name="provider" value="google" />
          <button
            type="submit"
            className="w-full flex justify-center items-center px-4 py-2.5 border border-gray-300 rounded-lg cursor-pointer shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Image src="/google.svg" alt="Google" width={16} height={16} className="mr-2" />
            <span className="text-sm font-medium tracking-tight text-gray-700"> Continue with Google </span>
          </button>
        </form>


        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500"> OR </span>
          </div>
        </div>


        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 tracking-tight text-black font-medium focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 tracking-tight text-black font-medium focus:outline-none focus:ring-orange-500 focus:border-orange-500"
         />
          </div>
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 cursor-pointer text-base font-semibold tracking-[-0.02em] text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Log In
            </button>
          </div>
          {error && <p className="text-sm text-center text-red-500">{error}</p>}
        </form>


        <div className="mt-4 text-center text-sm text-black tracking-[-0.02em]">
          Don&apos;t have an account yet?{' '}
          <Link href="/signup" className="font-medium text-orange-500 hover:text-orange-600">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
