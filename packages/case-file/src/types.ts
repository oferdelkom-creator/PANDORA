/**
 * מודל התיק — ממופה למבנה של נט המשפט.
 *
 * זהו שלב ב' בתוכנית (סעיף 5): מה שחולץ מהמסמך, לפני שער המועדים.
 *
 * העיקרון המבני היחיד כאן: **שום ערך שחולץ אינו נכנס לחישוב לפני
 * שהמשתמש אישר אותו.** התוכנית מנסחת זאת כשלב UI ("המערכת מציגה
 * למשתמש מה הבינה ומבקשת אישור"), אבל כלל שחי רק בממשק נשבר ברפקטור
 * הראשון. לכן הוא מקודד בטיפוסים: ערך שחולץ עטוף ב-`Extracted<T>`,
 * והגשר לשער המועדים מסרב לקרוא ערך שלא אושר.
 */

/** מאיפה הגיע הערך. */
export type FieldSource =
  /** זוהה על ידי המערכת מתוך המסמך. */
  | 'extracted'
  /** המשתמש הקליד או תיקן ידנית. */
  | 'user'
  /** נגזר משדה אחר בכללים דטרמיניסטיים. */
  | 'derived';

/**
 * ערך שחולץ ממסמך.
 *
 * `confirmed` אינו נתון על איכות החילוץ אלא על מה שהמשתמש עשה: האם
 * הוא ראה את הערך הזה ואישר אותו. ערך שהמשתמש הקליד בעצמו נחשב מאושר
 * מעצם ההקלדה.
 */
export interface Extracted<T> {
  value: T;
  source: FieldSource;
  /** ביטחון החילוץ, 0–1. רלוונטי רק ל-source 'extracted'. */
  confidence?: number;
  confirmed: boolean;
  /** הטקסט הגולמי שממנו נחלץ הערך, לצורך הצגה למשתמש לצד השדה. */
  rawText?: string;
}

export function extracted<T>(value: T, confidence: number, rawText?: string): Extracted<T> {
  return { value, source: 'extracted', confidence, confirmed: false, rawText };
}

/** ערך שהמשתמש מסר בעצמו — מאושר מעצם ההקלדה. */
export function fromUser<T>(value: T): Extracted<T> {
  return { value, source: 'user', confirmed: true };
}

export function confirm<T>(field: Extracted<T>): Extracted<T> {
  return { ...field, confirmed: true };
}

/** תיקון של המשתמש הופך את השדה למקור 'user' ומאפס את הביטחון. */
export function correct<T>(field: Extracted<T>, value: T): Extracted<T> {
  return { value, source: 'user', confirmed: true, rawText: field.rawText };
}

/**
 * קורא ערך רק אם אושר.
 *
 * זו הפונקציה היחידה שדרכה ערכים שחולצו נכנסים לחישוב. היא מחזירה
 * undefined לערך שלא אושר — ולא זורקת — כדי ששער המועדים יגיב
 * ב-`insufficient_facts` במקום לקרוס.
 */
export function readConfirmed<T>(field: Extracted<T> | undefined): T | undefined {
  return field?.confirmed ? field.value : undefined;
}
