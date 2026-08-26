import Link from 'next/link';

/*
 * דף הבית.
 *
 * מה שהוא לא עושה, במכוון: לא מבטיח תוצאה, לא מציג סיפורי הצלחה, ולא
 * כותב "נלחם עבורך". לפי סעיף 3.2 בתוכנית, רוב המשתמשים יקבלו כאן
 * תשובה שלילית — ודף בית שמבטיח ישועה הופך כל תשובה כזו לבגידה.
 */
export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 sm:py-24">
      <p className="text-sm font-medium tracking-wide text-brand">דין ודברים</p>

      <h1 className="mt-6 text-4xl leading-tight font-bold text-balance sm:text-5xl">
        קיבלת פסק דין או עיקול שלא ידעת עליו?
      </h1>

      <p className="mt-6 text-lg leading-relaxed text-ink-soft">
        יש מועדים בחוק שקובעים אם עוד אפשר לעשות משהו. רוב האנשים לא יודעים
        שהם קיימים, ומגלים מאוחר מדי. הבדיקה כאן אורכת שתי דקות ואומרת לך
        בדיוק מה מצבך — כולל כשהתשובה היא שלא נשאר מסלול.
      </p>

      <Link
        href="/check"
        className="mt-10 inline-block rounded-lg bg-brand px-7 py-4 text-lg font-semibold text-paper transition-opacity hover:opacity-90"
      >
        התחל בדיקה
      </Link>

      <p className="mt-4 text-sm text-ink-faint">
        בלי הרשמה, בלי תשלום. שום פרט שתמסור לא נשלח לשרת.
      </p>

      <hr className="my-14 border-line" />

      <section className="space-y-10">
        <div>
          <h2 className="text-xl font-semibold">מה זה נותן לך</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            אדם עם כסף מרים טלפון למכר עורך דין ותוך חמש דקות יודע שלושה
            דברים: שקיים סעד, איך ההליך עובד, ואם מנסים לעבוד עליו. אדם בלי
            כסף לא יודע אף אחד מהם. את הפער הזה אנחנו מנסים לסגור.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">התשובה תהיה כנה</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            אם המועד חלף, נגיד לך את זה — ונסביר למה ומה כן פתוח במקום. אתר
            שממציא טענות לכל מי שנכנס מוכר תקווה לאנשים שבורים, ואנחנו לא
            עושים את זה.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold">מה שזה לא</h2>
          <p className="mt-3 leading-relaxed text-ink-soft">
            זה לא ייעוץ משפטי, וזה לא מחליף עורך דין. אנחנו מסבירים איך החוק
            עובד ומראים לך מה השעון אומר. את הייצוג ואת המסמכים עושה עורך דין
            מורשה.
          </p>
        </div>
      </section>

      <footer className="mt-16 border-t border-line pt-8 text-sm leading-relaxed text-ink-faint">
        <p>
          מיזם ללא מטרות רווח לקידום שוויון בגישה לצדק. המידע באתר הוא כללי
          ואינו ייעוץ משפטי.
        </p>
        <p className="mt-3 font-medium text-ink-soft">
          גרסת פיתוח: המסלולים המשפטיים טרם אומתו על ידי עורך דין. אין
          להסתמך על התוצאות.
        </p>
      </footer>
    </main>
  );
}
