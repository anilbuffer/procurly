import { Metadata } from 'next';
import { FinanceShell } from '@/components/finance/layout/FinanceShell';

export const metadata: Metadata = {
  title: 'Finance Portal | PROCURly Financial Control Centre',
  description: 'Commercial automotive finance, payment settlements, trade credit facilities, refund authorization, revenue intelligence and order clearance command centre.',
};

export default function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FinanceShell>{children}</FinanceShell>;
}
