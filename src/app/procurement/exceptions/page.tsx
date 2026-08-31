'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ExceptionsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/procurement/logistics?tab=exceptions');
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-slate-400">
      Navigating to Logistics Hub (Logistics Exceptions)...
    </div>
  );
}
