import { ReactNode } from 'react';

export default function SelectOrganizationLayout({
  children,
}: {
  children: ReactNode;
}) {
  // This layout bypasses the AppLayout to show a full-screen experience
  // without sidebar or navigation
  return children;
}