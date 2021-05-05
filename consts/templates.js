
function template(strings, ...keys) {
    return (function(...values) {
      let dict = values[values.length - 1] || {};
      let result = [strings[0]];
      keys.forEach(function(key, i) {
        let value = Number.isInteger(key) ? values[key] : dict[key];
        result.push(value, strings[i + 1]);
      });
      return result.join('');
    });
  }
  

const addMessage = `
הוספת אירוע:
תאריך + שעה + נושא
30/11 15:00 שיחת עומק עם חביתוש

מחר + שעה + נושא
מחר 10:00 אולי נפליגה בספינות
היום + שעה + נושא
היום 17:00 מסיבת תה עם המלכה

יום בשבוע + שעה + נושא
חמישי 21:00 יש מכבי-ברצלונה`

const welcomMsg = (name) => {
  return `שלום ${name},
אני שרית המזכירה האישית שלך
אני יודעת לעדכן את היומן שלך דרך הווצאפ!
בכל אירוע אני אצלצל אליך אישית ואתזכר אותך
   
*איך מפעילים אותי?*
פשוט שולחים לי הודעות בווצאפ
   
*מה אפשר לעשות?*
אפשר לראות את רשימת האירועים השבועית,
להוסיף אירועים ולמחוק אותם.
הכל בהודעות קצרות ופשוטות
לדוגמה - רשום *פגישות* או *?* ותקבל את רשימת האירועים השבועית
רשום את המילה *עזרה* כדי לגלות מה עוד אפשר לעשות`
}

const helpMsg = `
בחר את המספר עליו ברצונך לקבל הסבר:
1. 📆  לקבוע *אירוע חדש* ביומן
2. ❗ למחוק אירוע מהיומן
3. 📞 רשימת האירועים השבועית
4. 🎸 השירים שלי
5. 📝 שינוי הגדרות`

const adminMenu = `
Type your wanted action:
"Whitelisted <number>" - Adds a number to white list`

const SettingsHelpMessage = `
לרשימת הגדרות:
הגדרות

לשינוי הגדרות:
שנה + מספר הגדרה + ערך
לדוגמה:
שנה 1 1`

const SongsHelpMessage = `
לשמיעת השיר היומי שלי:
רשום *שרית*`

const GetMeetingsHelpMessage = `
לקבלת רשימת הפגישות השבועית
רשום *פגישות* או *?*`


const DeleteMeetingsHelpMessage = `
למחיקת הודעה
יש לרשום *מחקי* ואת מספר ההודעה מרשימת הפגישות
לדוגמה:
*מחקי 1*`



module.exports = {
    addMessage,
    welcomMsg,
    helpMsg,
    adminMenu,
    SettingsHelpMessage,
    SongsHelpMessage,
    DeleteMeetingsHelpMessage,
    GetMeetingsHelpMessage
}