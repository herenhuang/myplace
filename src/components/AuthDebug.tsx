"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { useState, useEffect } from "react";

export function AuthDebug() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.getCurrentUser);
  const { signIn } = useAuthActions();
  const [url, setUrl] = useState("SSR");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);


  console.log("Auth Debug:", { isLoading, isAuthenticated, user });

  const handleTestSignIn = async () => {
    try {
      console.log("Attempting sign in...");
      await signIn("google");
      console.log("Sign in call completed");
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 p-4 bg-black text-white text-xs rounded max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug Info:</h3>
      <div>isLoading: {isLoading.toString()}</div>
      <div>isAuthenticated: {isAuthenticated.toString()}</div>
      <div>user: {user ? JSON.stringify(user, null, 2) : 'null'}</div>
      <div className="mt-2">
        <button 
          onClick={handleTestSignIn}
          className="bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs"
        >
          Test Sign In
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-300">
        <div>Current URL: {url}</div>
        <div>Convex URL: {process.env.NEXT_PUBLIC_CONVEX_URL}</div>
      </div>
    </div>
  );
}
