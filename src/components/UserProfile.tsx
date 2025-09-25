"use client";

import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { api } from "@/../convex/_generated/api";

export function UserProfile() {
  const user = useQuery(api.users.getCurrentUser);
  const { signOut } = useAuthActions();

  if (!user) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-full">
        <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition-shadow">
      {user.image && (
        <img
          src={user.image}
          alt={`${user.name}'s avatar`}
          className="w-8 h-8 rounded-full"
        />
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-900">{user.name}</span>
        <span className="text-xs text-gray-500">{user.email}</span>
      </div>
      <Button
        onClick={() => signOut()}
        variant="outline"
        size="sm"
        className="ml-2 text-xs"
      >
        Sign out
      </Button>
    </div>
  );
}
