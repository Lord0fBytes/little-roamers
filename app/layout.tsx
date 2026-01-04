import type { Metadata } from 'next';
import './globals.css';
import { WalksProvider } from '@/contexts/WalksContext';

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
    <html lang="en">
      <body>
        <WalksProvider>
          {children}
        </WalksProvider>
      </body>
    </html>
  );
}
