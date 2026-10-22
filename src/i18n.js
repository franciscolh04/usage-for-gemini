(() => {
  if (window.__ufgI18n) return;

  const DATA = {
    af: ["Gebruikslimiete", "Huidige gebruik", "Weeklikse limiet", "Herstel om {time}", "Herstel op {date} om {time}", "{value} gebruik", "Gemini-gebruik: {value}"],
    sq: ["Kufijtë e përdorimit", "Përdorimi aktual", "Kufiri javor", "Rivendoset në {time}", "Rivendoset më {date} në {time}", "{value} e përdorur", "Përdorimi i Gemini: {value}"],
    am: ["የአጠቃቀም ገደቦች", "የአሁኑ አጠቃቀም", "ሳምንታዊ ገደብ", "ይታደሳል በ{time}", "ይታደሳል በ{date} {time}", "{value} ጥቅም ላይ ውሏል", "የGemini አጠቃቀም: {value}"],
    ar: ["حدود الاستخدام", "الاستخدام الحالي", "الحد الأسبوعي", "إعادة الضبط الساعة {time}", "إعادة الضبط في {date} الساعة {time}", "{value} مستخدم", "استخدام Gemini: {value}"],
    hy: ["Օգտագործման սահմանաչափեր", "Ընթացիկ օգտագործում", "Շաբաթական սահմանաչափ", "Վերականգնվում է {time}-ին", "Վերականգնվում է {date}-ին՝ {time}-ին", "{value} օգտագործված", "Gemini-ի օգտագործումը՝ {value}"],
    as: ["ব্যৱহাৰৰ সীমা", "বৰ্তমান ব্যৱহাৰ", "সাপ্তাহিক সীমা", "পুনৰায় সেট কৰা হ'ব {time}ত", "পুনৰায় সেট কৰা হ'ব {date}ত {time}ত", "{value} ব্যৱহৃত", "Geminiৰ ব্যৱহাৰ: {value}"],
    az: ["İstifadə limitləri", "Cari istifadə", "Həftəlik limit", "Yenilənir saat {time}", "Yenilənir {date} tarixində saat {time}", "{value} istifadə edilib", "Gemini istifadəsi: {value}"],
    eu: ["Erabilera-mugak", "Uneko erabilera", "Asteko muga", "Berrezarriko da {time}(e)an", "Berrezarriko da {date}(e)an {time}(e)an", "{value} erabilita", "Gemini erabilera: {value}"],
    be: ["Абмежаванні выкарыстання", "Бягучае выкарыстанне", "Тыднёвае абмежаванне", "Скід у {time}", "Скід {date} у {time}", "{value} выкарыстана", "Выкарыстанне Gemini: {value}"],
    bn: ["ব্যবহারের সীমা", "বর্তমান ব্যবহার", "সাপ্তাহিক সীমা", "রিসেট হবে {time}-এ", "রিসেট হবে {date}-এ {time}-এ", "{value} ব্যবহৃত", "Gemini ব্যবহার: {value}"],
    bs: ["Ograničenja korištenja", "Trenutno korištenje", "Sedmično ograničenje", "Ponovo se postavlja u {time}", "Ponovo se postavlja {date} u {time}", "{value} iskorišteno", "Korištenje Gemini: {value}"],
    bg: ["Ограничения за използване", "Текущо използване", "Седмично ограничение", "Нулира се в {time}", "Нулира се на {date} в {time}", "{value} използвани", "Използване на Gemini: {value}"],
    ca: ["Límits d'ús", "Ús actual", "Límit setmanal", "Es reinicia a les {time}", "Es reinicia el {date} a les {time}", "{value} utilitzat", "Ús de Gemini: {value}"],
    "zh-CN": ["使用上限", "当前用量", "每周上限", "重置于 {time}", "重置于 {date} {time}", "已使用 {value}", "更新于 {time}", "Gemini 使用情况：{value}"],
    "zh-TW": ["使用上限", "目前用量", "每週上限", "重設於 {time}", "重設於 {date} {time}", "已使用 {value}", "更新於 {time}", "Gemini 使用情況：{value}"],
    "zh-HK": ["使用上限", "目前用量", "每週上限", "重設於 {time}", "重設於 {date} {time}", "已使用 {value}", "更新於 {time}", "Gemini 使用情況：{value}"],
    hr: ["Ograničenja korištenja", "Trenutačno korištenje", "Tjedno ograničenje", "Ponovno se postavlja u {time}", "Ponovno se postavlja {date} u {time}", "{value} iskorišteno", "Korištenje Gemini: {value}"],
    cs: ["Limity využití", "Aktuální využití", "Týdenní limit", "Obnoví se v {time}", "Obnoví se {date} v {time}", "{value} využito", "Využití Gemini: {value}"],
    da: ["Forbrugsgrænser", "Aktuelt forbrug", "Ugentlig grænse", "Nulstilles kl. {time}", "Nulstilles {date} kl. {time}", "{value} brugt", "Gemini-forbrug: {value}"],
    nl: ["Gebruikslimieten", "Huidig gebruik", "Wekelijkse limiet", "Reset om {time}", "Reset op {date} om {time}", "{value} gebruikt", "Gemini-gebruik: {value}"],
    en: ["Usage limits", "Current usage", "Weekly limit", "Resets at {time}", "Resets on {date} at {time}", "{value} used", "Gemini usage: {value}"],
    et: ["Kasutuspiirangud", "Praegune kasutus", "Iganädalane piirang", "Lähtestatakse kell {time}", "Lähtestatakse {date} kell {time}", "{value} kasutatud", "Gemini kasutus: {value}"],
    fa: ["محدودیت‌های استفاده", "استفاده فعلی", "محدودیت هفتگی", "بازنشانی ساعت {time}", "بازنشانی در {date} ساعت {time}", "{value} استفاده شده", "استفاده از Gemini: {value}"],
    fil: ["Mga limitasyon sa paggamit", "Kasalukuyang paggamit", "Lingguhang limitasyon", "Magre-reset sa {time}", "Magre-reset sa {date} nang {time}", "{value} ang nagamit", "Paggamit ng Gemini: {value}"],
    fi: ["Käyttörajoitukset", "Nykyinen käyttö", "Viikoittainen raja", "Nollautuu klo {time}", "Nollautuu {date} klo {time}", "{value} käytetty", "Gemini-käyttö: {value}"],
    fr: ["Limites d'utilisation", "Utilisation actuelle", "Limite hebdomadaire", "Réinitialisation à {time}", "Réinitialisation le {date} à {time}", "{value} utilisé", "Utilisation de Gemini : {value}"],
    gl: ["Límites de uso", "Uso actual", "Límite semanal", "Restablécese ás {time}", "Restablécese o {date} ás {time}", "{value} usado", "Uso de Gemini: {value}"],
    ka: ["გამოყენების ლიმიტები", "მიმდინარე გამოყენება", "ყოველკვირეული ლიმიტი", "განახლდება {time}-ზე", "განახლდება {date} {time}-ზე", "{value} გამოყენებულია", "Gemini-ის გამოყენება: {value}"],
    de: ["Nutzungslimits", "Aktuelle Nutzung", "Wöchentliches Limit", "Zurückgesetzt um {time}", "Zurückgesetzt am {date} um {time}", "{value} verwendet", "Gemini-Nutzung: {value}"],
    el: ["Όρια χρήσης", "Τρέχουσα χρήση", "Εβδομαδιαίο όριο", "Επαναφέρεται στις {time}", "Επαναφέρεται στις {date}, ώρα {time}", "{value} σε χρήση", "Χρήση Gemini: {value}"],
    gu: ["વપરાશ મર્યાદાઓ", "વર્તમાન વપરાશ", "સાપ્તાહિક મર્યાદા", "ફરી સેટ થશે {time} વાગ્યે", "ફરી સેટ થશે {date} ના {time} વાગ્યે", "{value} વપરાયેલ", "Gemini વપરાશ: {value}"],
    he: ["מגבלות שימוש", "שימוש נוכחי", "מגבלה שבועית", "יתאפס בשעה {time}", "יתאפס ב-{date} בשעה {time}", "{value} בשימוש", "שימוש ב-Gemini: {value}"],
    hi: ["उपयोग सीमाएँ", "वर्तमान उपयोग", "साप्ताहिक सीमा", "रीसेट होगा {time} बजे", "रीसेट होगा {date} को {time} बजे", "{value} उपयोग किया गया", "Gemini उपयोग: {value}"],
    hu: ["Használati korlátok", "Jelenlegi használat", "Heti korlát", "Visszaállítás: {time}", "Visszaállítás: {date}, {time}", "{value} felhasználva", "Gemini-használat: {value}"],
    is: ["Notkunarmörk", "Núverandi notkun", "Vikuleg mörk", "Endurstillt kl. {time}", "Endurstillt {date} kl. {time}", "{value} notað", "Notkun Gemini: {value}"],
    id: ["Batas penggunaan", "Penggunaan saat ini", "Batas mingguan", "Direset pukul {time}", "Direset pada {date} pukul {time}", "{value} terpakai", "Penggunaan Gemini: {value}"],
    it: ["Limiti di utilizzo", "Utilizzo attuale", "Limite settimanale", "Reimpostazione alle {time}", "Reimpostazione il {date} alle {time}", "{value} utilizzato", "Utilizzo di Gemini: {value}"],
    ja: ["使用上限", "現在の使用量", "週間上限", "リセット: {time}", "リセット: {date} {time}", "{value} 使用済み", "Gemini の使用状況: {value}"],
    kn: ["ಬಳಕೆಯ ಮಿತಿಗಳು", "ಪ್ರಸ್ತುತ ಬಳಕೆ", "ಸಾಪ್ತಾಹಿಕ ಮಿತಿ", "ಮರುಹೊಂದಿಸಲಾಗುತ್ತದೆ {time}ಕ್ಕೆ", "ಮರುಹೊಂದಿಸಲಾಗುತ್ತದೆ {date} {time}ಕ್ಕೆ", "{value} ಬಳಸಲಾಗಿದೆ", "Gemini ಬಳಕೆ: {value}"],
    kk: ["Пайдалану шектеулері", "Ағымдағы пайдалану", "Апталық шектеу", "Қалпына келтіріледі: {time}", "Қалпына келтіріледі: {date}, {time}", "{value} пайдаланылды", "Gemini пайдалануы: {value}"],
    km: ["ដែនកំណត់ការប្រើប្រាស់", "ការប្រើប្រាស់បច្ចុប្បន្ន", "ដែនកំណត់ប្រចាំសប្ដាហ៍", "កំណត់ឡើងវិញនៅ {time}", "កំណត់ឡើងវិញនៅ {date} {time}", "{value} បានប្រើប្រាស់", "ការប្រើប្រាស់ Gemini៖ {value}"],
    ko: ["사용 한도", "현재 사용량", "주간 한도", "재설정: {time}", "재설정: {date} {time}", "{value} 사용됨", "Gemini 사용량: {value}"],
    lo: ["ຂີດຈຳກັດການນຳໃຊ້", "ການນຳໃຊ້ປັດຈຸບັນ", "ຂີດຈຳກັດປະຈຳອາທິດ", "ຣີເຊັດເວລາ {time}", "ຣີເຊັດວັນທີ {date} ເວລາ {time}", "{value} ຖືກນຳໃຊ້ແລ້ວ", "ການນຳໃຊ້ Gemini: {value}"],
    lv: ["Lietojuma ierobežojumi", "Pašreizējais lietojums", "Nedēļas ierobežojums", "Atiestatīs plkst. {time}", "Atiestatīs {date} plkst. {time}", "{value} izmantots", "Gemini lietojums: {value}"],
    lt: ["Naudojimo limitai", "Dabartinis naudojimas", "Savaitės limitas", "Bus atkurta {time}", "Bus atkurta {date} {time}", "{value} panaudota", "Gemini naudojimas: {value}"],
    mk: ["Ограничувања за користење", "Тековно користење", "Неделно ограничување", "Се ресетира во {time}", "Се ресетира на {date} во {time}", "{value} искористено", "Користење на Gemini: {value}"],
    ms: ["Had penggunaan", "Penggunaan semasa", "Had mingguan", "Ditetapkan semula pada {time}", "Ditetapkan semula pada {date}, {time}", "{value} digunakan", "Penggunaan Gemini: {value}"],
    ml: ["ഉപയോഗ പരിധികൾ", "നിലവിലെ ഉപയോഗം", "പ്രതിവാര പരിധി", "റീസെറ്റ്: {time}", "റീസെറ്റ്: {date}, {time}", "{value} ഉപയോഗിച്ചു", "Gemini ഉപയോഗം: {value}"],
    mr: ["वापर मर्यादा", "सध्याचा वापर", "साप्ताहिक मर्यादा", "रीसेट होईल {time} वाजता", "रीसेट होईल {date} रोजी {time} वाजता", "{value} वापरले", "Gemini वापर: {value}"],
    mn: ["Хэрэглээний хязгаар", "Одоогийн хэрэглээ", "Долоо хоногийн хязгаар", "Дахин тохируулагдана {time}", "Дахин тохируулагдана {date} {time}", "{value} ашигласан", "Gemini хэрэглээ: {value}"],
    ne: ["प्रयोग सीमाहरू", "हालको प्रयोग", "साप्ताहिक सीमा", "रिसेट हुनेछ {time} बजे", "रिसेट हुनेछ {date} मा {time} बजे", "{value} प्रयोग भयो", "Gemini प्रयोग: {value}"],
    no: ["Bruksgrenser", "Gjeldende bruk", "Ukentlig grense", "Tilbakestilles kl. {time}", "Tilbakestilles {date} kl. {time}", "{value} brukt", "Gemini-bruk: {value}"],
    or: ["ବ୍ୟବହାର ସୀମା", "ବର୍ତ୍ତମାନ ବ୍ୟବହାର", "ସାପ୍ତାହିକ ସୀମା", "ରିସେଟ୍ ହେବ {time}ରେ", "ରିସେଟ୍ ହେବ {date}ରେ {time}ରେ", "{value} ବ୍ୟବହୃତ", "Gemini ବ୍ୟବହାର: {value}"],
    pl: ["Limity użycia", "Bieżące użycie", "Tygodniowy limit", "Reset o {time}", "Reset {date} o {time}", "{value} wykorzystano", "Użycie Gemini: {value}"],
    pt: ["Limites de utilização", "Utilização atual", "Limite semanal", "É reposto à(s) {time}", "É reposto a {date} à(s) {time}", "{value} usado", "Utilização do Gemini: {value}"],
    "pt-BR": ["Limites de uso", "Uso atual", "Limite semanal", "É redefinido às {time}", "É redefinido em {date} às {time}", "{value} usado", "Atualizado {time}", "Uso do Gemini: {value}"],
    pa: ["ਵਰਤੋਂ ਦੀਆਂ ਸੀਮਾਵਾਂ", "ਮੌਜੂਦਾ ਵਰਤੋਂ", "ਹਫ਼ਤਾਵਾਰੀ ਸੀਮਾ", "ਰੀਸੈੱਟ ਹੋਵੇਗਾ {time} ਵਜੇ", "ਰੀਸੈੱਟ ਹੋਵੇਗਾ {date} ਨੂੰ {time} ਵਜੇ", "{value} ਵਰਤਿਆ", "Gemini ਵਰਤੋਂ: {value}"],
    ro: ["Limite de utilizare", "Utilizare actuală", "Limita săptămânală", "Se resetează la {time}", "Se resetează pe {date} la {time}", "{value} utilizat", "Utilizare Gemini: {value}"],
    ru: ["Лимиты использования", "Текущее использование", "Недельный лимит", "Сброс в {time}", "Сброс {date} в {time}", "{value} использовано", "Использование Gemini: {value}"],
    sr: ["Ограничења коришћења", "Тренутно коришћење", "Недељно ограничење", "Ресетује се у {time}", "Ресетује се {date} у {time}", "{value} искоришћено", "Коришћење Gemini-а: {value}"],
    "sr-Latn": ["Ograničenja korišćenja", "Trenutno korišćenje", "Nedeljno ograničenje", "Resetuje se u {time}", "Resetuje se {date} u {time}", "{value} iskorišćeno", "Ažurirano {time}", "Korišćenje Gemini-ja: {value}"],
    sk: ["Limity využitia", "Aktuálne využitie", "Týždenný limit", "Obnoví sa o {time}", "Obnoví sa {date} o {time}", "{value} využité", "Využitie Gemini: {value}"],
    sl: ["Omejitve uporabe", "Trenutna uporaba", "Tedenska omejitev", "Ponastavi se ob {time}", "Ponastavi se {date} ob {time}", "{value} porabljeno", "Uporaba Gemini: {value}"],
    es: ["Límites de uso", "Uso actual", "Límite semanal", "Se restablece a las {time}", "Se restablece el {date} a las {time}", "{value} usado", "Uso de Gemini: {value}"],
    sw: ["Vikomo vya matumizi", "Matumizi ya sasa", "Kikomo cha wiki", "Itawekwa upya saa {time}", "Itawekwa upya {date} saa {time}", "{value} imetumika", "Matumizi ya Gemini: {value}"],
    sv: ["Användningsgränser", "Aktuell användning", "Veckogräns", "Återställs kl. {time}", "Återställs {date} kl. {time}", "{value} använt", "Gemini-användning: {value}"],
    ta: ["பயன்பாட்டு வரம்புகள்", "தற்போதைய பயன்பாடு", "வாராந்திர வரம்பு", "மீட்டமைக்கப்படும் {time} மணிக்கு", "மீட்டமைக்கப்படும் {date} அன்று {time} மணிக்கு", "{value} பயன்படுத்தப்பட்டது", "Gemini பயன்பாடு: {value}"],
    te: ["వినియోగ పరిమితులు", "ప్రస్తుత వినియోగం", "వారపు పరిమితి", "రీసెట్ అవుతుంది {time}కి", "రీసెట్ అవుతుంది {date} {time}కి", "{value} ఉపయోగించబడింది", "Gemini వినియోగం: {value}"],
    th: ["ขีดจำกัดการใช้งาน", "การใช้งานปัจจุบัน", "ขีดจำกัดรายสัปดาห์", "รีเซ็ตเวลา {time}", "รีเซ็ตวันที่ {date} เวลา {time}", "ใช้ไป {value}", "การใช้งาน Gemini: {value}"],
    tr: ["Kullanım sınırları", "Mevcut kullanım", "Haftalık sınır", "Sıfırlanma: {time}", "Sıfırlanma: {date}, {time}", "{value} kullanıldı", "Gemini kullanımı: {value}"],
    uk: ["Ліміти використання", "Поточне використання", "Тижневий ліміт", "Скидання о {time}", "Скидання {date} о {time}", "{value} використано", "Використання Gemini: {value}"],
    ur: ["استعمال کی حدیں", "موجودہ استعمال", "ہفتہ وار حد", "ری سیٹ ہوگا {time} بجے", "ری سیٹ ہوگا {date} کو {time} بجے", "{value} استعمال شدہ", "Gemini استعمال: {value}"],
    uz: ["Foydalanish limitlari", "Joriy foydalanish", "Haftalik limit", "Qayta tiklanadi {time}", "Qayta tiklanadi {date} {time}", "{value} ishlatilgan", "Gemini foydalanishi: {value}"],
    vi: ["Giới hạn sử dụng", "Mức sử dụng hiện tại", "Giới hạn hàng tuần", "Đặt lại lúc {time}", "Đặt lại lúc {date} {time}", "Đã dùng {value}", "Mức sử dụng Gemini: {value}"],
    zu: ["Imingcele yokusetshenziswa", "Ukusetshenziswa kwamanje", "Umkhawulo wamasonto onke", "Kuzosethwa kabusha ngo-{time}", "Kuzosethwa kabusha ngo-{date} ngo-{time}", "{value} isisetshenziswe", "Ukusetshenziswa kwe-Gemini: {value}"],
  };

  const RTL = new Set(["ar", "he", "fa", "ur"]);
  const ALIASES = {
    nb: "no",
    nn: "no",
    tl: "fil",
    iw: "he",
    in: "id",
    fas: "fa",
    ces: "cs",
    zho: "zh-CN",
  };

  function normalize(tag) {
    return String(tag || "").trim().toLowerCase().replace(/_/g, "-");
  }

  function resolve(tag) {
    const value = normalize(tag);
    if (!value) return "en";
    if (DATA[value]) return value;
    if (value.startsWith("zh")) {
      if (value.includes("hk") || value.includes("mo")) return "zh-HK";
      if (value.includes("tw") || value.includes("hant")) return "zh-TW";
      return "zh-CN";
    }
    if (value.startsWith("sr")) return value.includes("latn") ? "sr-Latn" : "sr";
    if (value.startsWith("pt")) return value.includes("br") ? "pt-BR" : "pt";
    const base = value.split("-")[0];
    if (DATA[base]) return base;
    if (ALIASES[base]) return ALIASES[base];
    return "en";
  }

  function get(tag) {
    const locale = resolve(tag);
    const entry = DATA[locale] || DATA.en;
    return {
      locale,
      rtl: RTL.has(locale.split("-")[0]),
      usage: entry[0],
      session: entry[1],
      weekly: entry[2],
      resetAt: entry[3],
      resetOn: entry[4],
      used: entry[5],
      aria: entry[6],
    };
  }

  window.__ufgI18n = { resolve, get };
})();
