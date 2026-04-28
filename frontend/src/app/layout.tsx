import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';

export const metadata: Metadata = {
  title: 'InventoryPro | Management System',
  description: 'Efficient inventory management for modern shopkeepers.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
