/**
 * התיק כפי שהמערכת מבינה אותו אחרי החילוץ ולפני האישור.
 *
 * המבנה עוקב אחרי מסך נט המשפט, כולל השדות שנראים מיותרים: "תיק ישן"
 * קיים כאן מפני שהוא קיים שם, והמשתמשים של המיזם מחזיקים דווקא את
 * המסמכים הישנים.
 */
import type { IsoDate } from '@din/deadline-gate';
import type { Extracted } from './types';
import type { CaseNumber } from './case-number';
import type { CourtLevel, ProceedingType } from './proceedings';

/** מצב הייצוג. השדה שהתוכנית (סעיף 5, שלב ב') מונה במפורש. */
export type RepresentationStatus = 'represented' | 'self_represented' | 'unknown';

export interface CaseFile {
  caseNumber?: Extracted<CaseNumber>;
  /** מספר התיק הישן, כשקיים — שדה נפרד בנט המשפט. */
  legacyCaseNumber?: Extracted<CaseNumber>;
  court?: Extracted<CourtLevel>;
  /** שם הערכאה כפי שהודפס, למשל "בית משפט השלום בחיפה". */
  courtNameRaw?: Extracted<string>;
  proceedingType?: Extracted<ProceedingType>;
  judge?: Extracted<string>;
  parties?: Extracted<string[]>;
  representation?: Extracted<RepresentationStatus>;

  judgmentDate?: Extracted<IsoDate>;
  decisionDate?: Extracted<IsoDate>;
  hearingDate?: Extracted<IsoDate>;
  serviceDate?: Extracted<IsoDate>;
  learnedDate?: Extracted<IsoDate>;
}

/** שדה שממתין לאישור המשתמש, לצורך בניית מסך האישור. */
export interface PendingField {
  key: keyof CaseFile;
  he: string;
  displayValue: string;
  confidence?: number;
  rawText?: string;
}

const FIELD_HE: Record<keyof CaseFile, string> = {
  caseNumber: 'מספר התיק',
  legacyCaseNumber: 'מספר התיק הישן',
  court: 'הערכאה',
  courtNameRaw: 'שם בית המשפט',
  proceedingType: 'סוג ההליך',
  judge: 'השופט',
  parties: 'הצדדים',
  representation: 'מצב הייצוג',
  judgmentDate: 'מועד מתן פסק הדין',
  decisionDate: 'מועד ההחלטה',
  hearingDate: 'מועד הדיון',
  serviceDate: 'מועד ההמצאה',
  learnedDate: 'מועד הידיעה',
};

function display(key: keyof CaseFile, value: unknown): string {
  if (key === 'caseNumber' || key === 'legacyCaseNumber') {
    return (value as CaseNumber).canonical;
  }
  if (key === 'proceedingType') return (value as ProceedingType).he;
  if (Array.isArray(value)) return value.join(', ');
  return String(value);
}

/**
 * השדות שהמשתמש עוד לא אישר.
 *
 * זה מה שמזין את מסך "זה מה שהבנתי — נכון?". מסך שמציג רק את מה שלא
 * אושר, ולא את כל התיק, שומר על הרשימה קצרה ועל תשומת הלב במקום
 * שבו היא נחוצה.
 */
export function pendingConfirmation(file: CaseFile): PendingField[] {
  return (Object.keys(file) as (keyof CaseFile)[])
    .filter((key) => {
      const field = file[key] as Extracted<unknown> | undefined;
      return field !== undefined && !field.confirmed;
    })
    .map((key) => {
      const field = file[key] as Extracted<unknown>;
      return {
        key,
        he: FIELD_HE[key],
        displayValue: display(key, field.value),
        confidence: field.confidence,
        rawText: field.rawText,
      };
    });
}

/**
 * סתירות פנימיות בתיק.
 *
 * אלה אינן שגיאות ולידציה אלא סימנים לחילוץ שגוי, והן מוצגות למשתמש
 * כשאלה ולא כשגיאה. OCR על צילום טלפון מטושטש טועה בספרה אחת, ותאריך
 * עם ספרה שגויה נראה תקין לחלוטין עד שמשווים אותו לשאר התיק.
 */
export function inconsistencies(file: CaseFile): string[] {
  const problems: string[] = [];
  const judgment = file.judgmentDate?.value;
  const service = file.serviceDate?.value;
  const learned = file.learnedDate?.value;
  const caseNo = file.caseNumber?.value;

  if (judgment && service && service < judgment) {
    problems.push('מועד ההמצאה מוקדם ממועד מתן פסק הדין. אחד התאריכים כנראה שגוי.');
  }
  if (judgment && learned && learned < judgment) {
    problems.push('יום הידיעה מוקדם ממועד מתן פסק הדין. אחד התאריכים כנראה שגוי.');
  }
  if (judgment && caseNo && Number(judgment.slice(0, 4)) < caseNo.year) {
    problems.push(
      `לפי מספר התיק הוא נפתח בשנת ${caseNo.year}, אך פסק הדין נושא תאריך מוקדם יותר.`,
    );
  }
  return problems;
}
