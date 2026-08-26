import Link from 'next/link';
import IntakeFlow from './IntakeFlow';

export const metadata = { title: 'בדיקת מועדים · תיבת פנדורה' };

export default function CheckPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-12 sm:py-16">
      <Link href="/" className="text-sm text-brand hover:underline">
        ← תיבת פנדורה
      </Link>
      <IntakeFlow />
    </main>
  );
}
