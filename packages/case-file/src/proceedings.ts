/**
 * סוגי הליכים וערכאות, כפי שהם מופיעים בשדה "סוג תיק" בנט המשפט.
 *
 * לכל סוג הליך מצורף המסלול שהוא עשוי להוביל אליו במנוע. "עשוי" הוא
 * המילה: הסוג פותח מסלול, הוא אינו מכריע בו. ההכרעה נשארת בשער
 * המועדים.
 *
 * אזהרה: קידומות ההליכים והשיוך שלהן טעונים אימות, כמו כל קביעה
 * משפטית במיזם. ראה docs/legal-verification-backlog.md.
 */
import type { TrackId } from '@din/deadline-gate';

export type CourtLevel =
  | 'magistrate'   // שלום
  | 'district'     // מחוזי
  | 'supreme'      // עליון
  | 'family'       // לענייני משפחה
  | 'labour'       // לעבודה
  | 'execution'    // לשכת ההוצאה לפועל — לא בית משפט, אך המשתמש לא יבחין
  | 'other';

export const COURT_LEVEL_HE: Record<CourtLevel, string> = {
  magistrate: 'בית משפט השלום',
  district: 'בית המשפט המחוזי',
  supreme: 'בית המשפט העליון',
  family: 'בית המשפט לענייני משפחה',
  labour: 'בית הדין לעבודה',
  execution: 'לשכת ההוצאה לפועל',
  other: 'ערכאה אחרת',
};

export interface ProceedingType {
  /** הקידומת כפי שהיא מודפסת על המסמך. */
  prefix: string;
  he: string;
  /** מסלולים שהסוג הזה עשוי לפתוח. ריק = המנוע אינו מטפל בו. */
  tracks: readonly TrackId[];
}

export const PROCEEDING_TYPES: readonly ProceedingType[] = [
  { prefix: 'ת"א', he: 'תביעה אזרחית', tracks: ['default_judgment'] },
  { prefix: 'תא"מ', he: 'תביעה אזרחית בסדר דין מהיר', tracks: ['default_judgment'] },
  { prefix: 'תא"ק', he: 'תביעה אזרחית בסדר דין מקוצר', tracks: ['default_judgment'] },
  { prefix: 'ת"ק', he: 'תביעות קטנות', tracks: ['default_judgment'] },
  { prefix: 'ה"פ', he: 'המרצת פתיחה', tracks: [] },
  { prefix: 'חדל"פ', he: 'חדלות פירעון', tracks: [] },
  { prefix: 'ע"א', he: 'ערעור אזרחי', tracks: ['appeal_extension'] },
  { prefix: 'רע"א', he: 'בקשת רשות ערעור אזרחי', tracks: ['appeal_extension'] },
  { prefix: 'ע"ר', he: 'ערעור על החלטת רשם', tracks: ['appeal_extension'] },
  { prefix: 'תמ"ש', he: 'תיק משפחה', tracks: [] },
  { prefix: 'עת"מ', he: 'עתירה מנהלית', tracks: [] },
];

/**
 * מזהה סוג הליך מטקסט חופשי.
 *
 * הגרשיים הם המכשול: מסמכים סרוקים, מקלדות שונות ומנועי OCR מייצרים
 * ״ / " / '' / גרש כפול, ולעתים משמיטים אותם לגמרי. הנרמול מסיר את
 * כולם לפני ההשוואה, כך ש-ת"א, ת״א ו-תא מזוהים כאותו דבר.
 */
function normalize(text: string): string {
  return text.replace(/["'״׳`]/g, '').replace(/\s+/g, '');
}

export function detectProceedingType(text: string): ProceedingType | undefined {
  const haystack = normalize(text);
  // הארוכים קודם: "תא"מ" מכיל את "ת"א" אחרי נרמול, ובלי המיון הזה
  // תביעה בסדר דין מהיר הייתה מזוהה כתביעה אזרחית רגילה.
  const byLength = [...PROCEEDING_TYPES].sort(
    (a, b) => normalize(b.prefix).length - normalize(a.prefix).length,
  );
  return byLength.find((p) => haystack.includes(normalize(p.prefix)));
}

const COURT_PATTERNS: readonly { level: CourtLevel; test: RegExp }[] = [
  { level: 'family', test: /לענייני\s*משפחה/ },
  { level: 'labour', test: /לעבודה/ },
  { level: 'execution', test: /הוצאה\s*לפועל|הוצל/ },
  { level: 'supreme', test: /העליון/ },
  { level: 'district', test: /מחוזי/ },
  { level: 'magistrate', test: /השלום|שלום/ },
];

/** מזהה ערכאה מטקסט חופשי, למשל כותרת מסמך. */
export function detectCourtLevel(text: string): CourtLevel | undefined {
  // הסדר מכוון: בית משפט לענייני משפחה ולעבודה יושבים לעתים בתוך
  // מחוז, וכותרת המסמך מזכירה את שניהם. הספציפי גובר.
  return COURT_PATTERNS.find((c) => c.test.test(text))?.level;
}
