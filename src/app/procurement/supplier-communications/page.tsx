'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function SupplierCommunicationsRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supplierId = searchParams.get('supplierId');

  useEffect(() => {
    const targetUrl = supplierId
      ? `/procurement/suppliers?tab=communications&supplierId=${supplierId}`
      : `/procurement/suppliers?tab=communications`;
    router.replace(targetUrl);
  }, [router, supplierId]);

  return (
    <div className="p-12 text-center text-xs text-slate-400">
      Navigating to Supplier Hub (Communications Workspace)...
    </div>
  );
}

export default function SupplierCommunicationsRedirectPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Navigating to Supplier Hub...</div>}>
      <SupplierCommunicationsRedirectContent />
    </Suspense>
  );
}
