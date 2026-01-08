import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { ActivitiesProvider } from '@/contexts/ActivitiesContext';

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-nunito',
  display: 'swap',
});

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
    <html lang="en" className={nunito.variable}>
      <body>
        <ActivitiesProvider>
          {children}
        </ActivitiesProvider>
      </body>
    </html>
  );
}
