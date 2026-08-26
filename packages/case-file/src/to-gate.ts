/**
 * הגשר בין התיק שחולץ לבין שער המועדים.
 *
 * זו הנקודה שבה הכלל המבני נאכף: הגשר קורא אך ורק דרך
 * `readConfirmed`, ולכן ערך שהמשתמש לא אישר פשוט אינו קיים מבחינת
 * המנוע. התוצאה היא `insufficient_facts` — בדיוק ההתנהגות הרצויה,
 * ולא קריסה ולא ניחוש.
 *
 * מה שהגשר לא עושה, במכוון: הוא אינו מחלץ את מצב ההמצאה. אין קטגוריה
 * של אישור מסירה בנט המשפט (ראה documents.ts), וזהו השדה שמכריע את
 * המסלול המרכזי. שדה כזה חייב להישאל ישירות מהמשתמש.
 */
import type {
  DefaultJudgmentFacts,
  ExecutionObjectionFacts,
  ServiceStatus,
  IsoDate,
} from '@pandora/deadline-gate';
import type { CaseFile } from './case-file';
import { readConfirmed } from './types';

/** מה שהמשתמש חייב לענות בעצמו, כי אין לו מקור במסמך. */
export interface UserAnswers {
  serviceStatus: ServiceStatus;
  /** נדרש כשהמסמך לא נשא את התאריך או שהמשתמש לא אישר אותו. */
  learnedDate?: IsoDate;
}

/**
 * מרכיב עובדות למסלול ביטול פסק הדין.
 *
 * מחזיר גם שדות ריקים: שער המועדים יודע לומר "חסרים פרטים" בשפה
 * שהמשתמש מבין, וזו עבודה שלו ולא של הגשר.
 */
export function toDefaultJudgmentFacts(
  file: CaseFile,
  answers: UserAnswers,
  today: IsoDate,
): DefaultJudgmentFacts {
  return {
    today,
    judgmentDate: readConfirmed(file.judgmentDate) ?? '',
    serviceDate: readConfirmed(file.serviceDate) ?? null,
    learnedDate: answers.learnedDate ?? readConfirmed(file.learnedDate) ?? '',
    serviceStatus: answers.serviceStatus,
  };
}

export function toExecutionObjectionFacts(
  file: CaseFile,
  answers: UserAnswers & { claimsDebtPaid?: boolean },
  today: IsoDate,
): ExecutionObjectionFacts {
  return {
    today,
    warningServiceDate: readConfirmed(file.serviceDate) ?? null,
    learnedDate: answers.learnedDate ?? readConfirmed(file.learnedDate) ?? '',
    serviceStatus: answers.serviceStatus,
    claimsDebtPaid: answers.claimsDebtPaid ?? false,
  };
}
