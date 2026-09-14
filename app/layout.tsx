import type { Metadata } from 'next';
import { Geist, Geist_Mono, Lora, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
});

const lora = Lora({
  variable: '--font-lora',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Raghav Express | Courier & Cargo Services',
  description: 'Fast, safe and reliable courier and cargo services across India.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} ${lora.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
