'use client';

import { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { initializeAmplitude, trackPageView } from '@/lib/analytics/amplitude';

/**
 * Inner component that uses useSearchParams (must be wrapped in Suspense)
 */
function AmplitudeTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track page views on route change
  useEffect(() => {
    if (pathname) {
      const url = searchParams?.toString() ? `${pathname}?${searchParams.toString()}` : pathname;
      trackPageView(pathname, {
        url,
        pathname,
        search: searchParams?.toString() || '',
      });
    }
  }, [pathname, searchParams]);

  return null;
}

/**
 * AmplitudeProvider component that initializes Amplitude and tracks page views
 * This component should be placed in the root layout to track all pages
 */
export function AmplitudeProvider({ children }: { children: React.ReactNode }) {
  // Initialize Amplitude on mount
  useEffect(() => {
    initializeAmplitude();
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <AmplitudeTracking />
      </Suspense>
      {children}
    </>
  );
}

