"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { api } from "@/../convex/_generated/api";

function UserInfo() {
  const user = useQuery(api.users.getCurrentUser);
  return <p>Welcome, {user?.name}</p>;
}

export function AuthButton() {
  const { signIn, signOut } = useAuthActions();

  return (
    <div>
      <Unauthenticated>
        <button className="tracking-tight text-white bg-orange-500 hover:bg-orange-600 transition-colors duration-200 cursor-pointer py-2 px-5 rounded-full" onClick={() => signIn("google")}>
          Sign in with Google
        </button>
      </Unauthenticated>
      <Authenticated>
        <div>
          <UserInfo />
          <Button onClick={() => signOut()}>Sign out</Button>
        </div>
      </Authenticated>
    </div>
  );
}
