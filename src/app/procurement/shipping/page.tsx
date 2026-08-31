'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ShippingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/procurement/logistics?tab=shipping');
  }, [router]);

  return (
    <div className="p-12 text-center text-xs text-slate-400">
      Navigating to Logistics Hub (Shipping Handover)...
    </div>
  );
}
