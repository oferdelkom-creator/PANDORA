/**
 * קטגוריות המסמכים בתיק, לפי לשוניות נט המשפט.
 *
 * הרשימה מועתקת מהמסך עצמו, וזו הסיבה שהיא שווה משהו: המשתמש יעלה
 * מסמך שהוא הוריד משם או קיבל בדואר, והשמות שעליו הם אלה.
 *
 * לכל קטגוריה מצוין איזה תאריך היא נושאת שרלוונטי לשער המועדים.
 * רוב הקטגוריות אינן נושאות אף אחד — וזה בסדר, הן עדיין עוזרות לזהות
 * שהמשתמש העלה את המסמך הלא נכון.
 */
import type { CaseFileDateField } from './types-dates';

export interface DocumentCategory {
  id: string;
  he: string;
  /** התאריך שהמסמך הזה קובע, אם הוא קובע אחד. */
  carries?: CaseFileDateField;
  /** מה לומר למשתמש שהעלה את זה כשחיפשנו משהו אחר. */
  note?: string;
}

export const DOCUMENT_CATEGORIES: readonly DocumentCategory[] = [
  { id: 'judgments', he: 'פסקי דין', carries: 'judgmentDate' },
  { id: 'decisions', he: 'החלטות בתיק', carries: 'decisionDate' },
  { id: 'protocols', he: 'פרוטוקולים', note: 'פרוטוקול מתעד דיון ואינו קובע מועד להגשה.' },
  { id: 'pleadings', he: 'כתבי טענות' },
  { id: 'motions', he: 'בקשות והוראות' },
  { id: 'interim_motions', he: 'בקשות לסעד זמני' },
  { id: 'post_closure_motions', he: 'בקשות אחרי סגירה' },
  { id: 'affidavits', he: 'תצהירים' },
  { id: 'expert_opinions', he: 'חוות דעת' },
  { id: 'hearings', he: 'מועדי דיון', carries: 'hearingDate' },
  { id: 'exhibits', he: 'מוצגים' },
  { id: 'summaries', he: 'סיכומים' },
  { id: 'parties', he: 'גורמים' },
  { id: 'related_cases', he: 'תיקים קשורים' },
  { id: 'registry', he: 'מזכירות' },
];

/**
 * הפער המרכזי בסכימה של נט המשפט, מנקודת המבט של המיזם.
 *
 * אין בה קטגוריה של **אישור מסירה**. מסמכי ההמצאה מפוזרים בין
 * "מזכירות", "בקשות והוראות" ותיק הנייר, ואינם נגישים כקטגוריה.
 *
 * זה קריטי כאן יותר מבכל מערכת אחרת: ההמצאה היא השדה שמכריע את
 * המסלול המרכזי (ראה default-judgment.ts). המסקנה למוצר היא שאי אפשר
 * להסתמך על חילוץ אוטומטי לשדה הזה — הוא חייב להישאר שאלה ישירה
 * למשתמש, וזה מה שנעשה בפועל בטופס.
 */
export const SERVICE_PROOF_IS_NOT_A_CATEGORY = true;

export function findCategory(he: string): DocumentCategory | undefined {
  const t = he.trim();
  return DOCUMENT_CATEGORIES.find((c) => c.he === t);
}
