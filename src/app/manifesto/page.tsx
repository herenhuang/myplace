'use client';

import { useEffect } from 'react';
import ManifestoV2 from '@/components/ManifestoV2';

export default function ManifestoPage() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Set the HTML background color to match $bg from ManifestoV2.module.scss
    document.documentElement.style.backgroundColor = '#f3fcff';
    document.body.style.backgroundColor = '#f3fcff';
    
    // Cleanup function to reset background when leaving the page
    return () => {
      document.documentElement.style.backgroundColor = '';
      document.body.style.backgroundColor = '';
    };
  }, []);

  return <ManifestoV2 />;
}