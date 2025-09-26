"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { api } from "@/../convex/_generated/api";
import { useState } from "react";

function UserInfo() {
  const user = useQuery(api.users.getCurrentUser);
  return <p>Welcome, {user?.name}</p>;
}

export function AuthButton() {
  const { signIn, signOut } = useAuthActions();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      console.log("Starting Google sign in...");
      
      // Use the standard Convex auth signIn method
      await signIn("google");
    } catch (error) {
      console.error("Sign in error:", error);
      // The "Connection lost" error is expected during OAuth redirect
      // Don't reset isSigningIn state as the page will redirect
      if (!(error instanceof Error && error.message.includes("Connection lost"))) {
        setIsSigningIn(false);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      console.log("Signing out...");
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div>
      <Unauthenticated>
        <button 
          className="tracking-tight text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-200 cursor-pointer py-2 px-5 rounded-full disabled:opacity-50" 
          onClick={handleSignIn}
          disabled={isSigningIn}
        >
          {isSigningIn ? "Signing in..." : "Sign in with Google"}
        </button>
      </Unauthenticated>
      <Authenticated>
        <div>
          <UserInfo />
          <Button onClick={handleSignOut}>Sign out</Button>
        </div>
      </Authenticated>
    </div>
  );
}
