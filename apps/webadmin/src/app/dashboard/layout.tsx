import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | eMediCard Admin',
  description: 'Manage and review health card applications, view statistics, and process applicant documents.',
  robots: 'noindex, nofollow', // Admin pages shouldn't be indexed
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
