/**
 * מספרי תיקים בבתי המשפט בישראל.
 *
 * שני פורמטים חיים במקביל, ומסך נט המשפט מודה בכך במפורש: יש בו שדה
 * "מספר תיק" ולצדו שדה "תיק ישן".
 *
 *   חדש:  62302-06-19   סידורי-חודש-שנה (יוני 2019)
 *   ישן:  745/06        סידורי/שנה
 *
 * המרוץ אחרי הפורמט אינו קוסמטי: אדם שמחזיק מסמך ישן ומקליד 745/06
 * חייב לקבל תשובה ולא שגיאת ולידציה. האוכלוסייה של המיזם מחזיקה
 * בדיוק את המסמכים הישנים.
 */

export interface CaseNumber {
  /** כפי שהמשתמש הקליד, אחרי ניקוי רווחים בלבד. */
  raw: string;
  format: 'modern' | 'legacy';
  /** המספר הסידורי בתוך החודש (חדש) או בתוך השנה (ישן). */
  serial: number;
  /** חודש הפתיחה. קיים בפורמט החדש בלבד. */
  month?: number;
  /** שנת הפתיחה, ארבע ספרות. */
  year: number;
  /** נורמליזציה לתצוגה ולהשוואה. */
  canonical: string;
}

const MODERN = /^(\d{1,6})-(\d{1,2})-(\d{2}|\d{4})$/;
const LEGACY = /^(\d{1,6})\/(\d{2}|\d{4})$/;

/**
 * שנתיים ספרתיות לשנה מלאה.
 *
 * חלון של 30 שנה אחורה מספיק: תיקים ישנים מכך אינם רלוונטיים לאף
 * מסלול במיזם, וכל מספר גדול מהשנה הנוכחית הוא בהכרח מהמאה הקודמת.
 */
function expandYear(twoOrFour: string, currentYear: number): number {
  if (twoOrFour.length === 4) return Number(twoOrFour);
  const yy = Number(twoOrFour);
  const century = Math.floor(currentYear / 100) * 100;
  const candidate = century + yy;
  return candidate > currentYear ? candidate - 100 : candidate;
}

/**
 * מפרש מספר תיק. מחזיר null אם אינו מזוהה — לא זורק, כי הקלט מגיע
 * מהקלדה של אדם או מ-OCR ושניהם טועים.
 */
export function parseCaseNumber(input: string, currentYear: number): CaseNumber | null {
  const raw = input.trim().replace(/\s+/g, '');
  if (!raw) return null;

  const modern = MODERN.exec(raw);
  if (modern) {
    const [, serial, month, year] = modern as unknown as [string, string, string, string];
    const m = Number(month);
    if (m < 1 || m > 12) return null;
    const y = expandYear(year, currentYear);
    return {
      raw,
      format: 'modern',
      serial: Number(serial),
      month: m,
      year: y,
      canonical: `${Number(serial)}-${String(m).padStart(2, '0')}-${String(y).slice(-2)}`,
    };
  }

  const legacy = LEGACY.exec(raw);
  if (legacy) {
    const [, serial, year] = legacy as unknown as [string, string, string];
    const y = expandYear(year, currentYear);
    return {
      raw,
      format: 'legacy',
      serial: Number(serial),
      year: y,
      canonical: `${Number(serial)}/${String(y).slice(-2)}`,
    };
  }

  return null;
}

/**
 * מועד פתיחת התיק, כשניתן לגזור אותו מהמספר.
 *
 * שימושי כבדיקת שפיות בלבד: תאריך פסק דין שקודם לפתיחת התיק מעיד על
 * שגיאת חילוץ. אין להשתמש בזה כתאריך לחישוב מועדים.
 */
export function filedAround(caseNumber: CaseNumber): { year: number; month?: number } {
  return caseNumber.month
    ? { year: caseNumber.year, month: caseNumber.month }
    : { year: caseNumber.year };
}
