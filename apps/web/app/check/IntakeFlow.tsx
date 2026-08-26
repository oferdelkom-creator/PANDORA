'use client';

import { useState } from 'react';
import {
  defaultJudgmentTrack,
  executionObjectionTrack,
  pareatiTrack,
  appealExtensionTrack,
  type GateResult,
  type ServiceStatus,
  type TrackId,
} from '@din/deadline-gate';
import { SITUATIONS } from './situations';
import { ChoiceField, DateField, PrimaryButton, Question } from './fields';
import Report from './Report';

/**
 * זרימת השאלות.
 *
 * הכול רץ בדפדפן. שום תאריך ושום פרט אינם נשלחים לשרת, ואין כאן מסד
 * נתונים — לא כאילוץ טכני אלא כהחלטה: לפי סעיף 10 בתוכנית, מידע משפטי
 * של אדם פרטי הוא מידע רגיש, והדרך הבטוחה ביותר לאחסן אותו היא לא
 * לאסוף אותו. אחסון ייכנס רק כשיהיה בו צורך אמיתי (העלאת מסמכים,
 * סקירת עו"ד) ועם הסכמה מפורשת.
 */

const SERVICE_OPTIONS: readonly { value: ServiceStatus; label: string; hint?: string }[] = [
  {
    value: 'properly_served',
    label: 'כן, קיבלתי אותו לידיים',
    hint: 'בדואר רשום, במסירה אישית, או בדרך אחרת שאני זוכר',
  },
  {
    value: 'defect_suspected',
    label: 'הגיע, אבל משהו לא תקין',
    hint: 'נשלח לכתובת ישנה, מישהו אחר חתם, או שלא הגיע אליי בפועל',
  },
  {
    value: 'never_served',
    label: 'לא, מעולם לא קיבלתי',
    hint: 'גיליתי בדרך אחרת — עיקול, בירור, שיחה',
  },
  { value: 'unknown', label: 'אני לא יודע' },
];

const today = () => new Date().toISOString().slice(0, 10);

export default function IntakeFlow() {
  const [track, setTrack] = useState<TrackId | ''>('');
  const [result, setResult] = useState<GateResult | null>(null);

  // שדות משותפים לכל המסלולים.
  const [learnedDate, setLearnedDate] = useState('');
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | ''>('');
  const [serviceDate, setServiceDate] = useState('');
  const [judgmentDate, setJudgmentDate] = useState('');
  const [claimsDebtPaid, setClaimsDebtPaid] = useState<'yes' | 'no' | ''>('');
  const [hasEvidence, setHasEvidence] = useState<'yes' | 'no' | ''>('');
  const [missedDeadline, setMissedDeadline] = useState('');
  const [wasRepresented, setWasRepresented] = useState<'yes' | 'no' | ''>('');

  function restart() {
    setTrack('');
    setResult(null);
    setLearnedDate('');
    setServiceStatus('');
    setServiceDate('');
    setJudgmentDate('');
    setClaimsDebtPaid('');
    setHasEvidence('');
    setMissedDeadline('');
    setWasRepresented('');
  }

  function run() {
    const t = today();
    switch (track) {
      case 'default_judgment':
        return setResult(
          defaultJudgmentTrack.evaluate({
            today: t,
            judgmentDate,
            serviceDate: serviceDate || null,
            learnedDate,
            serviceStatus: serviceStatus as ServiceStatus,
          }),
        );
      case 'execution_objection':
        return setResult(
          executionObjectionTrack.evaluate({
            today: t,
            warningServiceDate: serviceDate || null,
            learnedDate,
            serviceStatus: serviceStatus as ServiceStatus,
            claimsDebtPaid: claimsDebtPaid === 'yes',
          }),
        );
      case 'pareati':
        return setResult(
          pareatiTrack.evaluate({ today: t, hasPaymentEvidence: hasEvidence === 'yes' }),
        );
      case 'appeal_extension':
        return setResult(
          appealExtensionTrack.evaluate({
            today: t,
            missedDeadline,
            wasRepresented: wasRepresented === 'yes',
          }),
        );
    }
  }

  if (result) return <Report result={result} onRestart={restart} />;

  if (!track) {
    return (
      <div className="mt-8">
        <h1 className="text-3xl font-bold">מה קרה לך?</h1>
        <p className="mt-3 leading-relaxed text-ink-soft">
          בחר את המשפט שהכי מתאר את מצבך. אם כמה מתאימים, בחר את מה שקרה
          קודם.
        </p>
        <div className="mt-6 space-y-2">
          {SITUATIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setTrack(s.id)}
              className="block w-full rounded-lg border border-line bg-surface px-5 py-4 text-right transition-colors hover:border-brand"
            >
              <span className="text-lg font-semibold">{s.he}</span>
              <span className="mt-1 block leading-relaxed text-ink-soft">{s.example}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const needsService = track === 'default_judgment' || track === 'execution_objection';
  const isJudgment = track === 'default_judgment';
  const documentHe = isJudgment ? 'פסק הדין' : 'האזהרה מההוצאה לפועל';

  const ready = (() => {
    switch (track) {
      case 'default_judgment':
        return !!judgmentDate && !!learnedDate && !!serviceStatus;
      case 'execution_objection':
        return !!learnedDate && !!serviceStatus && !!claimsDebtPaid;
      case 'pareati':
        return !!hasEvidence;
      case 'appeal_extension':
        return !!missedDeadline && !!wasRepresented;
      default:
        return false;
    }
  })();

  return (
    <div className="mt-8 space-y-8">
      <button
        type="button"
        onClick={() => setTrack('')}
        className="text-sm text-brand hover:underline"
      >
        ← בחירת מצב אחר
      </button>

      {isJudgment && (
        <Question label="מתי ניתן פסק הדין?" hint="התאריך מופיע בראש המסמך או בסופו.">
          <DateField value={judgmentDate} onChange={setJudgmentDate} />
        </Question>
      )}

      {needsService && (
        <>
          <Question
            label={`האם ${documentHe} הומצא לך כדין?`}
            hint="זו השאלה החשובה ביותר כאן — הרבה יותר מהתאריכים. אם המסמך לא הגיע אליך כמו שצריך, זו טענה משפטית נפרדת בפני עצמה."
          >
            <ChoiceField
              value={serviceStatus}
              onChange={setServiceStatus}
              options={SERVICE_OPTIONS}
            />
          </Question>

          {serviceStatus === 'properly_served' && (
            <Question
              label="מתי קיבלת אותו?"
              hint="אם אינך זוכר במדויק, השאר ריק — נחשב מיום הידיעה."
            >
              <DateField value={serviceDate} onChange={setServiceDate} />
            </Question>
          )}

          <Question
            label={`מתי נודע לך לראשונה על ${isJudgment ? 'פסק הדין' : 'תיק ההוצאה לפועל'}?`}
            hint="גם אם נודע לך בדרך עקיפה — עיקול משכורת, שיחה מהבנק, מכתב מהזוכה. התאריך הזה קובע את המועד."
          >
            <DateField value={learnedDate} onChange={setLearnedDate} />
          </Question>
        </>
      )}

      {track === 'execution_objection' && (
        <Question label="האם שילמת את החוב, כולו או חלקו?">
          <ChoiceField
            value={claimsDebtPaid}
            onChange={setClaimsDebtPaid}
            options={[
              { value: 'yes', label: 'כן, שילמתי' },
              { value: 'no', label: 'לא' },
            ]}
          />
        </Question>
      )}

      {track === 'pareati' && (
        <Question
          label="יש בידך אסמכתאות על התשלום?"
          hint="קבלות, אישורי העברה, דפי בנק, התכתבות עם הזוכה."
        >
          <ChoiceField
            value={hasEvidence}
            onChange={setHasEvidence}
            options={[
              { value: 'yes', label: 'כן, יש לי' },
              { value: 'no', label: 'לא, אין לי' },
            ]}
          />
        </Question>
      )}

      {track === 'appeal_extension' && (
        <>
          <Question label="מה היה המועד האחרון שהוחמץ?">
            <DateField value={missedDeadline} onChange={setMissedDeadline} />
          </Question>
          <Question label="היית מיוצג על ידי עורך דין כשהמועד חלף?">
            <ChoiceField
              value={wasRepresented}
              onChange={setWasRepresented}
              options={[
                { value: 'yes', label: 'כן' },
                { value: 'no', label: 'לא' },
              ]}
            />
          </Question>
        </>
      )}

      <PrimaryButton disabled={!ready} onClick={run}>
        בדוק את המועד
      </PrimaryButton>
    </div>
  );
}
