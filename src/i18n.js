(() => {
  if (window.__ufgI18n) return;

  const DATA = {
    af: ["Gebruik", "Sessie", "Weekliks", "Herstel oor", "Gemini-gebruik: {value}"],
    sq: ["Përdorimi", "Sesioni", "Javor", "Rikthehet pas", "Përdorimi i Gemini: {value}"],
    am: ["አጠቃቀም", "ክፍለ ጊዜ", "ሳምንታዊ", "ይታደሳል በ", "የGemini አጠቃቀም: {value}"],
    ar: ["الاستخدام", "الجلسة", "الأسبوعي", "إعادة الضبط خلال", "استخدام Gemini: {value}"],
    hy: ["Օգտագործում", "Նստաշրջան", "Շաբաթական", "Վերականգնվում է", "Gemini-ի օգտագործումը՝ {value}"],
    as: ["ব্যৱহাৰ", "ছেশন", "সাপ্তাহিক", "পুনৰায় সেট কৰা হ'ব", "Geminiৰ ব্যৱহাৰ: {value}"],
    az: ["İstifadə", "Sessiya", "Həftəlik", "Yenilənir", "Gemini istifadəsi: {value}"],
    eu: ["Erabilera", "Saioa", "Astekoa", "Berrezarriko da", "Gemini erabilera: {value}"],
    be: ["Выкарыстанне", "Сеанс", "Штотыдзень", "Скід праз", "Выкарыстанне Gemini: {value}"],
    bn: ["ব্যবহার", "সেশন", "সাপ্তাহিক", "রিসেট হবে", "Gemini ব্যবহার: {value}"],
    bs: ["Korištenje", "Sesija", "Sedmično", "Ponovo se postavlja za", "Korištenje Gemini: {value}"],
    bg: ["Използване", "Сесия", "Седмично", "Нулира се след", "Използване на Gemini: {value}"],
    ca: ["Ús", "Sessió", "Setmanal", "Es reinicia d'aquí a", "Ús de Gemini: {value}"],
    "zh-CN": ["使用情况", "会话", "每周", "距离重置", "Gemini 使用情况：{value}"],
    "zh-TW": ["使用情況", "工作階段", "每週", "距離重設", "Gemini 使用情況：{value}"],
    "zh-HK": ["使用情況", "工作階段", "每週", "距離重設", "Gemini 使用情況：{value}"],
    hr: ["Korištenje", "Sesija", "Tjedno", "Ponovno postavljanje za", "Korištenje Gemini: {value}"],
    cs: ["Využití", "Relace", "Týdně", "Obnoví se za", "Využití Gemini: {value}"],
    da: ["Forbrug", "Session", "Ugentlig", "Nulstilles om", "Gemini-forbrug: {value}"],
    nl: ["Gebruik", "Sessie", "Wekelijks", "Reset over", "Gemini-gebruik: {value}"],
    en: ["Usage", "Session", "Weekly", "Resets in", "Gemini usage: {value}"],
    et: ["Kasutus", "Seanss", "Iganädalane", "Lähtestatakse pärast", "Gemini kasutus: {value}"],
    fa: ["میزان استفاده", "نشست", "هفتگی", "بازنشانی در", "استفاده از Gemini: {value}"],
    fil: ["Paggamit", "Session", "Lingguhan", "Magre-reset sa", "Paggamit ng Gemini: {value}"],
    fi: ["Käyttö", "Istunto", "Viikoittainen", "Nollautuu", "Gemini-käyttö: {value}"],
    fr: ["Utilisation", "Session", "Hebdomadaire", "Réinitialisation dans", "Utilisation de Gemini : {value}"],
    gl: ["Uso", "Sesión", "Semanal", "Restablécese en", "Uso de Gemini: {value}"],
    ka: ["გამოყენება", "სესია", "ყოველკვირეული", "გადატვირთვა", "Gemini-ის გამოყენება: {value}"],
    de: ["Nutzung", "Sitzung", "Wöchentlich", "Zurückgesetzt in", "Gemini-Nutzung: {value}"],
    el: ["Χρήση", "Συνεδρία", "Εβδομαδιαία", "Επαναφορά σε", "Χρήση Gemini: {value}"],
    gu: ["વપરાશ", "સત્ર", "સાપ્તાહિક", "ફરી સેટ થશે", "Gemini વપરાશ: {value}"],
    he: ["שימוש", "סשן", "שבועי", "יתאפס בעוד", "שימוש ב-Gemini: {value}"],
    hi: ["उपयोग", "सत्र", "साप्ताहिक", "रीसेट होगा", "Gemini उपयोग: {value}"],
    hu: ["Használat", "Munkamenet", "Heti", "Visszaállítás:", "Gemini-használat: {value}"],
    is: ["Notkun", "Lotu", "Vikulega", "Endurstillt eftir", "Notkun Gemini: {value}"],
    id: ["Penggunaan", "Sesi", "Mingguan", "Direset dalam", "Penggunaan Gemini: {value}"],
    it: ["Utilizzo", "Sessione", "Settimanale", "Reimpostazione tra", "Utilizzo di Gemini: {value}"],
    ja: ["使用状況", "セッション", "週間", "リセットまで", "Gemini の使用状況: {value}"],
    kn: ["ಬಳಕೆ", "ಸೆಷನ್", "ಸಾಪ್ತಾಹಿಕ", "ಮರುಹೊಂದಿಸಲಾಗುತ್ತದೆ", "Gemini ಬಳಕೆ: {value}"],
    kk: ["Пайдалану", "Сеанс", "Апталық", "Қалпына келтіріледі", "Gemini пайдалануы: {value}"],
    km: ["ការប្រើប្រាស់", "សម័យ", "ប្រចាំសប្ដាហ៍", "កំណត់ឡើងវិញក្នុង", "ការប្រើប្រាស់ Gemini៖ {value}"],
    ko: ["사용량", "세션", "주간", "재설정까지", "Gemini 사용량: {value}"],
    lo: ["ການນຳໃຊ້", "ເຊສຊັນ", "ປະຈຳອາທິດ", "ຣີເຊັດໃນ", "ການນຳໃຊ້ Gemini: {value}"],
    lv: ["Lietojums", "Sesija", "Iknedēļas", "Atiestatīs pēc", "Gemini lietojums: {value}"],
    lt: ["Naudojimas", "Sesija", "Kas savaitę", "Bus atkurta po", "Gemini naudojimas: {value}"],
    mk: ["Користење", "Сесија", "Неделно", "Се ресетира за", "Користење на Gemini: {value}"],
    ms: ["Penggunaan", "Sesi", "Mingguan", "Ditetapkan semula dalam", "Penggunaan Gemini: {value}"],
    ml: ["ഉപയോഗം", "സെഷൻ", "പ്രതിവാര", "റീസെറ്റ് ചെയ്യും", "Gemini ഉപയോഗം: {value}"],
    mr: ["वापर", "सत्र", "साप्ताहिक", "रीसेट होईल", "Gemini वापर: {value}"],
    mn: ["Хэрэглээ", "Сесс", "Долоо хоног тутмын", "Дахин тохируулагдана", "Gemini хэрэглээ: {value}"],
    ne: ["प्रयोग", "सत्र", "साप्ताहिक", "रिसेट हुनेछ", "Gemini प्रयोग: {value}"],
    no: ["Bruk", "Økt", "Ukentlig", "Tilbakestilles om", "Gemini-bruk: {value}"],
    or: ["ବ୍ୟବହାର", "ସେସନ୍", "ସାପ୍ତାହିକ", "ରିସେଟ୍ ହେବ", "Gemini ବ୍ୟବହାର: {value}"],
    pl: ["Użycie", "Sesja", "Tygodniowo", "Reset za", "Użycie Gemini: {value}"],
    pt: ["Utilização", "Sessão", "Semanal", "Renova em", "Utilização do Gemini: {value}"],
    "pt-BR": ["Uso", "Sessão", "Semanal", "Renova em", "Uso do Gemini: {value}"],
    pa: ["ਵਰਤੋਂ", "ਸੈਸ਼ਨ", "ਹਫ਼ਤਾਵਾਰੀ", "ਰੀਸੈੱਟ ਹੋਵੇਗਾ", "Gemini ਵਰਤੋਂ: {value}"],
    ro: ["Utilizare", "Sesiune", "Săptămânal", "Se resetează în", "Utilizare Gemini: {value}"],
    ru: ["Использование", "Сеанс", "Еженедельно", "Сброс через", "Использование Gemini: {value}"],
    sr: ["Коришћење", "Сесија", "Недељно", "Ресетује се за", "Коришћење Gemini-а: {value}"],
    "sr-Latn": ["Korišćenje", "Sesija", "Nedeljno", "Resetuje se za", "Korišćenje Gemini-ja: {value}"],
    sk: ["Využitie", "Relácia", "Týždenne", "Obnoví sa o", "Využitie Gemini: {value}"],
    sl: ["Uporaba", "Seja", "Tedensko", "Ponastavi se čez", "Uporaba Gemini: {value}"],
    es: ["Uso", "Sesión", "Semanal", "Se restablece en", "Uso de Gemini: {value}"],
    sw: ["Matumizi", "Kipindi", "Kila wiki", "Itawekwa upya baada ya", "Matumizi ya Gemini: {value}"],
    sv: ["Användning", "Session", "Veckovis", "Återställs om", "Gemini-användning: {value}"],
    ta: ["பயன்பாடு", "அமர்வு", "வாராந்திர", "மீட்டமைக்கப்படும்", "Gemini பயன்பாடு: {value}"],
    te: ["వినియోగం", "సెషన్", "వారపు", "రీసెట్ అవుతుంది", "Gemini వినియోగం: {value}"],
    th: ["การใช้งาน", "เซสชัน", "รายสัปดาห์", "รีเซ็ตใน", "การใช้งาน Gemini: {value}"],
    tr: ["Kullanım", "Oturum", "Haftalık", "Sıfırlanma:", "Gemini kullanımı: {value}"],
    uk: ["Використання", "Сеанс", "Щотижня", "Скидання через", "Використання Gemini: {value}"],
    ur: ["استعمال", "سیشن", "ہفتہ وار", "ری سیٹ ہوگا", "Gemini استعمال: {value}"],
    uz: ["Foydalanish", "Sessiya", "Haftalik", "Qayta tiklanadi", "Gemini foydalanishi: {value}"],
    vi: ["Mức sử dụng", "Phiên", "Hàng tuần", "Đặt lại sau", "Mức sử dụng Gemini: {value}"],
    zu: ["Ukusetshenziswa", "Iseshini", "Masonto onke", "Kuzosethwa kabusha emva kwe", "Ukusetshenziswa kwe-Gemini: {value}"],
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
      resets: entry[3],
      aria: entry[4],
    };
  }

  window.__ufgI18n = { resolve, get };
})();
