'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SupplierPerformanceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/procurement/suppliers?tab=performance');
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-slate-400">
      Navigating to Supplier Hub (Performance & Intelligence)...
    </div>
  );
}
