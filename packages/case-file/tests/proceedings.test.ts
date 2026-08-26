import { describe, it, expect } from 'vitest';
import { detectProceedingType, detectCourtLevel } from '../src/proceedings';

describe('detectProceedingType', () => {
  it('מזהה מהכותרת האמיתית של נט המשפט', () => {
    const t = detectProceedingType('ת"א 62302-06-19: ש.פ. חברה לנאמנות ניהול ואחזק...');
    expect(t?.he).toBe('תביעה אזרחית');
    expect(t?.tracks).toContain('default_judgment');
  });

  it('עמיד לצורות הגרשיים שמסמכים סרוקים מייצרים', () => {
    for (const v of ['ת"א 123-01-20', 'ת״א 123-01-20', 'תא 123-01-20', "ת'א 123-01-20"]) {
      expect(detectProceedingType(v)?.he, v).toBe('תביעה אזרחית');
    }
  });

  it('אינו מבלבל סדר דין מהיר עם תביעה אזרחית רגילה', () => {
    expect(detectProceedingType('תא"מ 500-02-21')?.he).toBe('תביעה אזרחית בסדר דין מהיר');
    expect(detectProceedingType('חדל"פ 10610-02-22')?.he).toBe('חדלות פירעון');
  });

  it('מחזיר undefined כשאין התאמה', () => {
    expect(detectProceedingType('מסמך כלשהו בלי סוג')).toBeUndefined();
  });
});

describe('detectCourtLevel', () => {
  it('מזהה ערכאות מכותרות', () => {
    expect(detectCourtLevel('בית משפט השלום בחיפה')).toBe('magistrate');
    expect(detectCourtLevel('בבית המשפט המחוזי בחיפה')).toBe('district');
    expect(detectCourtLevel('בית המשפט העליון')).toBe('supreme');
    expect(detectCourtLevel('לשכת ההוצאה לפועל')).toBe('execution');
  });

  it('הספציפי גובר על המחוז שבתוכו הוא יושב', () => {
    expect(detectCourtLevel('בית המשפט לענייני משפחה במחוז חיפה')).toBe('family');
  });
});
