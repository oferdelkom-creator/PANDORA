'use client';

import { formatHe, type GateResult, type GateStatus } from '@pandora/deadline-gate';

/**
 * הדוח.
 *
 * שני עקרונות מהתוכנית מיושמים כאן ויזואלית:
 *
 *   סעיף 3.1 — להסביר, לא רק להשיב. שרשרת ההנמקה מוצגת במלואה, לא
 *   מוסתרת מאחורי "הצג פרטים". המשתמש צריך לצאת מכאן יודע יותר.
 *
 *   סעיף 3.2 — "אין מסלול" אינו כישלון. לכן הסטטוס "סגור" מוצג באפור
 *   ולא באדום, וההסתעפויות תמיד מתחתיו, באותו משקל ויזואלי.
 */

const STATUS: Record<GateStatus, { he: string; tone: string; text: string }> = {
  open: { he: 'המועד עדיין פתוח', tone: 'bg-open-soft border-open/25', text: 'text-open' },
  closing_soon: {
    he: 'המועד עומד להיסגר',
    tone: 'bg-urgent-soft border-urgent/30',
    text: 'text-urgent',
  },
  closed: { he: 'המועד חלף', tone: 'bg-closed-soft border-line', text: 'text-closed' },
  no_statutory_deadline: {
    he: 'אין מועד קבוע בחוק',
    tone: 'bg-open-soft border-open/25',
    text: 'text-open',
  },
  insufficient_facts: {
    he: 'חסרים פרטים להכרעה',
    tone: 'bg-closed-soft border-line',
    text: 'text-closed',
  },
  requires_human_review: {
    he: 'נדרשת בדיקה של עורך דין',
    tone: 'bg-review-soft border-review/25',
    text: 'text-review',
  },
};

function Num({ children }: { children: React.ReactNode }) {
  return <span className="ltr-nums font-semibold">{children}</span>;
}

export default function Report({ result, onRestart }: { result: GateResult; onRestart: () => void }) {
  const s = STATUS[result.status];

  return (
    <div className="mt-8 space-y-10">
      <header className={`rounded-xl border p-6 ${s.tone}`}>
        <p className="text-sm font-medium text-ink-soft">{result.trackNameHe}</p>
        <h1 className={`mt-2 text-3xl font-bold ${s.text}`}>{s.he}</h1>

        {result.deadline && result.status !== 'insufficient_facts' && (
          <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-current/10 pt-5 text-sm">
            <div>
              <dt className="text-ink-soft">היום האחרון להגשה</dt>
              <dd className="mt-1 text-lg">
                <Num>{formatHe(result.deadline.lastDate)}</Num>
              </dd>
            </div>
            <div>
              <dt className="text-ink-soft">
                {result.deadline.daysRemaining >= 0 ? 'ימים שנותרו' : 'ימים שחלפו מאז'}
              </dt>
              <dd className="mt-1 text-lg">
                <Num>{Math.abs(result.deadline.daysRemaining)}</Num>
              </dd>
            </div>
          </dl>
        )}
      </header>

      <section>
        <h2 className="text-xl font-semibold">איך הגענו לזה</h2>
        <ol className="mt-4 space-y-4">
          {result.reasoning.map((step, i) => (
            <li key={i} className="border-r-2 border-line pr-4">
              <p className="leading-relaxed">{step.he}</p>
              {step.sources && step.sources.length > 0 && (
                <ul className="mt-2 space-y-0.5">
                  {step.sources.map((src, j) => (
                    <li key={j} className="text-sm text-ink-faint">
                      {src.law}
                      {src.section && ` · ${src.section}`}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </section>

      {result.missingFacts.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">מה שווה לברר</h2>
          <ul className="mt-4 space-y-3">
            {result.missingFacts.map((f, i) => (
              <li key={i} className="leading-relaxed text-ink-soft">
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.branches.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold">
            {result.status === 'closed' ? 'מה כן פתוח בפניך' : 'מסלולים נוספים'}
          </h2>
          <ul className="mt-4 space-y-4">
            {result.branches.map((b, i) => (
              <li key={i} className="rounded-lg border border-line bg-surface p-4">
                <p className="font-semibold">{b.he}</p>
                <p className="mt-1.5 leading-relaxed text-ink-soft">{b.why}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-lg border border-line bg-closed-soft p-5 text-sm leading-relaxed text-ink-soft">
        <p className="font-semibold text-ink">לפני שאתה פועל על סמך זה</p>
        <ul className="mt-3 space-y-2">
          {result.disclaimers.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
          {result.verification !== 'verified_by_counsel' && (
            <li className="font-medium text-ink">
              המסלול הזה טרם אומת על ידי עורך דין. זו גרסת פיתוח — אל תסתמך
              על התוצאה בלי בדיקה.
            </li>
          )}
        </ul>
      </section>

      <button
        type="button"
        onClick={onRestart}
        className="text-brand underline underline-offset-4"
      >
        התחל בדיקה חדשה
      </button>
    </div>
  );
}
