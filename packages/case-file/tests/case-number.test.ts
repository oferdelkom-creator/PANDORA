import { describe, it, expect } from 'vitest';
import { parseCaseNumber } from '../src/case-number';

const YEAR = 2026;

describe('parseCaseNumber', () => {
  it('מפרש את הפורמט החדש', () => {
    const r = parseCaseNumber('62302-06-19', YEAR)!;
    expect(r.format).toBe('modern');
    expect(r).toMatchObject({ serial: 62302, month: 6, year: 2019 });
    expect(r.canonical).toBe('62302-06-19');
  });

  it('מפרש את הפורמט הישן — המסמכים שהאוכלוסייה שלנו מחזיקה', () => {
    const r = parseCaseNumber('745/06', YEAR)!;
    expect(r.format).toBe('legacy');
    expect(r).toMatchObject({ serial: 745, year: 2006 });
    expect(r.canonical).toBe('745/06');
  });

  it('מנרמל רווחים ומאפסים מובילים', () => {
    expect(parseCaseNumber(' 2822-02-16 ', YEAR)!.canonical).toBe('2822-02-16');
    expect(parseCaseNumber('45973-12-20', YEAR)!.year).toBe(2020);
  });

  it('לא מפרש שנה עתידית כשנה עתידית', () => {
    // 99 אינו 2099 אלא 1999.
    expect(parseCaseNumber('100-01-99', YEAR)!.year).toBe(1999);
  });

  it('דוחה חודש לא תקין', () => {
    expect(parseCaseNumber('62302-13-19', YEAR)).toBeNull();
    expect(parseCaseNumber('62302-00-19', YEAR)).toBeNull();
  });

  it('מחזיר null במקום לזרוק על קלט משובש', () => {
    for (const bad of ['', 'לא מספר', '62302', '62302-06', 'abc-de-fg']) {
      expect(parseCaseNumber(bad, YEAR), bad).toBeNull();
    }
  });
});
