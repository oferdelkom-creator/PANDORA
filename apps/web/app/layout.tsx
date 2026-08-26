import type { Metadata } from 'next';
import { Assistant } from 'next/font/google';
import './globals.css';

const assistant = Assistant({
  subsets: ['hebrew', 'latin'],
  variable: '--font-assistant',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'דין ודברים',
  description:
    'בדיקה חינמית: האם עוד אפשר לבטל פסק דין או להתנגד בהוצאה לפועל, וכמה זמן נותר.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={assistant.variable}>
      <body className="min-h-dvh bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
