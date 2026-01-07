import type { Metadata } from 'next';
import './globals.css';
import { ActivitiesProvider } from '@/contexts/ActivitiesContext';

export const metadata: Metadata = {
  title: 'Little Roamers - Growing Up Outdoors',
  description: 'Track meaningful time outside—because childhood happens outdoors',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body>
        <ActivitiesProvider>
          {children}
        </ActivitiesProvider>
      </body>
    </html>
  );
}
