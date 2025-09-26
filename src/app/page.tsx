"use client";

import Component from '@/components/ui/hero-scroll-animation';
import { AuthButton } from '@/components/AuthButton';
import { UserProfile } from '@/components/UserProfile';
import { AuthDebug } from '@/components/AuthDebug';
import { Authenticated, Unauthenticated } from "convex/react";

export default function Home() {
  return (
    <div>
      <div className="fixed top-4 right-4 z-50">
        <AuthButton />
      </div>
      <AuthDebug />
      <Component />
    </div>
  );
}
