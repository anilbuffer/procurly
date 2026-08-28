import React from 'react';
import { NewPartRequestWizard } from '@/components/forms/NewPartRequestWizard';
import { Layers } from 'lucide-react';

export default function NewRequestPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <NewPartRequestWizard />
    </div>
  );
}
