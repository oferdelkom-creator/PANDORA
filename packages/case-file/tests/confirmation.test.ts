import { describe, it, expect } from 'vitest';
import { defaultJudgmentTrack } from '@pandora/deadline-gate';
import { extracted, fromUser, confirm, correct, readConfirmed } from '../src/types';
import { pendingConfirmation, inconsistencies, type CaseFile } from '../src/case-file';
import { toDefaultJudgmentFacts } from '../src/to-gate';
import { parseCaseNumber } from '../src/case-number';

const TODAY = '2026-08-26';

describe('אישור המשתמש', () => {
  it('ערך שחולץ אינו נקרא לפני אישור', () => {
    const f = extracted('2026-01-05', 0.9);
    expect(readConfirmed(f)).toBeUndefined();
    expect(readConfirmed(confirm(f))).toBe('2026-01-05');
  });

  it('ערך שהמשתמש הקליד מאושר מעצם ההקלדה', () => {
    expect(readConfirmed(fromUser('2026-01-05'))).toBe('2026-01-05');
  });

  it('תיקון של המשתמש הופך את המקור ומאפס את הביטחון', () => {
    const c = correct(extracted('2026-01-05', 0.4, 'ה.1.2026'), '2026-01-06');
    expect(c).toMatchObject({ value: '2026-01-06', source: 'user', confirmed: true });
    expect(c.confidence).toBeUndefined();
    // הטקסט הגולמי נשמר כדי שאפשר יהיה להציג למשתמש מה הוא תיקן.
    expect(c.rawText).toBe('ה.1.2026');
  });

  it('מסך האישור מציג רק את מה שטרם אושר', () => {
    const file: CaseFile = {
      judgmentDate: extracted('2026-01-05', 0.9),
      judge: confirm(extracted('ס. מצא', 0.8)),
    };
    const pending = pendingConfirmation(file);
    expect(pending).toHaveLength(1);
    expect(pending[0]).toMatchObject({ key: 'judgmentDate', he: 'מועד מתן פסק הדין' });
  });

  it('מציג מספר תיק בצורתו הקנונית, לא כאובייקט', () => {
    const file: CaseFile = {
      caseNumber: extracted(parseCaseNumber('62302-06-19', 2026)!, 0.95),
    };
    expect(pendingConfirmation(file)[0]!.displayValue).toBe('62302-06-19');
  });
});

describe('הגשר לשער המועדים', () => {
  const base: CaseFile = { judgmentDate: extracted('2026-01-05', 0.95) };

  it('תיק שלא אושר מגיע לשער כחסר פרטים — לא קורס ולא מנחש', () => {
    const facts = toDefaultJudgmentFacts(base, { serviceStatus: 'unknown' }, TODAY);
    expect(facts.judgmentDate).toBe('');
    expect(defaultJudgmentTrack.evaluate(facts).status).toBe('insufficient_facts');
  });

  it('אחרי אישור, אותו תיק עובר לשער ומקבל הכרעה', () => {
    const file: CaseFile = { judgmentDate: confirm(base.judgmentDate!) };
    const facts = toDefaultJudgmentFacts(
      file,
      { serviceStatus: 'never_served', learnedDate: '2026-08-01' },
      TODAY,
    );
    expect(facts.judgmentDate).toBe('2026-01-05');
    // פגם בהמצאה — לעולם לא "סגור".
    expect(defaultJudgmentTrack.evaluate(facts).status).toBe('requires_human_review');
  });

  it('מצב ההמצאה מגיע מהמשתמש ולא מהתיק — אין לו מקור בנט המשפט', () => {
    const file: CaseFile = { judgmentDate: confirm(base.judgmentDate!) };
    const facts = toDefaultJudgmentFacts(
      file,
      { serviceStatus: 'properly_served', learnedDate: '2026-01-06' },
      TODAY,
    );
    expect(facts.serviceStatus).toBe('properly_served');
  });
});

describe('סתירות פנימיות', () => {
  it('תופס המצאה שקודמת לפסק הדין', () => {
    const file: CaseFile = {
      judgmentDate: extracted('2026-01-05', 0.9),
      serviceDate: extracted('2025-12-01', 0.7),
    };
    expect(inconsistencies(file).join(' ')).toContain('מוקדם ממועד מתן פסק הדין');
  });

  it('תופס פסק דין שקודם לפתיחת התיק לפי מספרו', () => {
    const file: CaseFile = {
      caseNumber: extracted(parseCaseNumber('62302-06-19', 2026)!, 0.95),
      judgmentDate: extracted('2015-03-01', 0.6),
    };
    expect(inconsistencies(file).join(' ')).toContain('2019');
  });

  it('שותק כשהתיק עקבי', () => {
    const file: CaseFile = {
      caseNumber: extracted(parseCaseNumber('62302-06-19', 2026)!, 0.95),
      judgmentDate: extracted('2022-06-14', 0.9),
      serviceDate: extracted('2022-06-20', 0.8),
    };
    expect(inconsistencies(file)).toEqual([]);
  });
});
