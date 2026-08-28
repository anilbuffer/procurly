import { Metadata } from 'next';
import { OperationsShell } from '@/components/operations/layout/OperationsShell';

export const metadata: Metadata = {
  title: 'Operations Command Centre | PROCURly by Autohub',
  description: 'Internal procurement lifecycle management command centre for Autohub staff.',
};

export default function OperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OperationsShell>{children}</OperationsShell>;
}
