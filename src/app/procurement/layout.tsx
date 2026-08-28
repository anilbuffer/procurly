import { Metadata } from 'next';
import { ProcurementShell } from '@/components/procurement/layout/ProcurementShell';

export const metadata: Metadata = {
  title: 'Procurement Portal | PROCURly by Autohub',
  description: 'Automotive procurement, multi-supplier quotation comparison, sourcing, purchase orders, tracking and logistics exception command centre.',
};

export default function ProcurementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProcurementShell>{children}</ProcurementShell>;
}
