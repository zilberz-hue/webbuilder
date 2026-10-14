# Web Builder — Tizon Health

כלי אפיון אתרים + יצירת אתר אוטומטית עם Claude.

1. ממלאים אפיון בשלבים (תצוגה מקדימה חיה, ייצוא Markdown / JSON / PDF).
2. לוחצים **✨ בנה אתר**: Claude בונה אתר שלם (קובץ HTML אחד, כל העמודים), מציגים אותו בתצוגה חיה, ומבקשים שינויים בצ'אט.

## פריסה ב-Netlify
Add new site → Import from Git → הריפו הזה. אין build; `public/` הוא האתר ו-`netlify/functions/` הפונקציות.

משתני סביבה (Site settings → Environment variables):

| משתנה | חובה | תיאור |
|---|---|---|
| `ANTHROPIC_API_KEY` | כן | מפתח API של Anthropic |
| `SITE_BUILDER_KEY` | מומלץ | קוד גישה; בלעדיו כל מי שמכיר את הכתובת משתמש במפתח שלכם. מקלידים אותו ב"הגדרות שרת" בכלי |
| `SITE_BUILDER_MODEL` | לא | ברירת מחדל `claude-opus-5-5` |

הבנייה רצה ב-background function (עד 15 דקות) והתוצאה נשמרת ב-Netlify Blobs.

אחרי שינוי בקבצי `public/`: `python3 scripts/build-standalone.py` מעדכן את `public/spec-builder-standalone.html` (קובץ עצמאי).
