// UI dictionaries. English is the default; Arabic is RTL.
// Listing content (titles, descriptions) is demo data in English and is not translated yet.
export const en = {
  "nav.buy": "Buy", "nav.rent": "Rent", "nav.projects": "Projects", "nav.agent": "AI Agent", "nav.map": "Map",
  "nav.investment": "Investment", "nav.forAgents": "For Agents", "nav.saved": "Saved", "nav.signIn": "Sign in",
  "nav.ask": "Ask AI Agent", "nav.home": "Home", "nav.explore": "Explore", "nav.profile": "Profile", "nav.neighborhoods": "Neighbourhoods",
  "hero.title": "Find your next property with an AI real estate agent.",
  "hero.sub": "Search Saudi Arabia's property market, compare opportunities, explore neighbourhoods, and get personalised recommendations from an AI-powered real estate agent.",
  "hero.cta": "Ask AI Agent", "hero.cta2": "Explore properties",
  "search.placeholder": "Search by city, neighbourhood, property type or ask AI…",
  "card.view": "View property", "card.compare": "Compare", "card.save": "Save", "card.saved": "Saved", "card.askAi": "Ask AI",
  "card.beds": "Beds", "card.baths": "Baths", "card.match": "AI match", "card.verified": "Licence shown",
  "agent.newChat": "New conversation", "agent.history": "Conversations", "agent.savedSearches": "Saved searches", "agent.recent": "Recently viewed",
  "agent.placeholder": "Describe the property you want — location, budget, bedrooms…", "agent.send": "Send",
  "agent.online": "Online · ready to search", "common.demo": "Demo data", "common.estimate": "AI estimate",
  "lang.switch": "العربية",
} as const;

export type DictKey = keyof typeof en;

export const ar: Record<DictKey, string> = {
  "nav.buy": "شراء", "nav.rent": "إيجار", "nav.projects": "المشاريع", "nav.agent": "الوكيل الذكي", "nav.map": "الخريطة",
  "nav.investment": "الاستثمار", "nav.forAgents": "للوسطاء", "nav.saved": "المحفوظات", "nav.signIn": "تسجيل الدخول",
  "nav.ask": "اسأل الوكيل الذكي", "nav.home": "الرئيسية", "nav.explore": "استكشف", "nav.profile": "حسابي", "nav.neighborhoods": "الأحياء",
  "hero.title": "اعثر على عقارك القادم مع وكيل عقاري ذكي.",
  "hero.sub": "ابحث في سوق العقار السعودي، وقارن الفرص، واستكشف الأحياء، واحصل على توصيات مخصصة من وكيل عقاري مدعوم بالذكاء الاصطناعي.",
  "hero.cta": "اسأل الوكيل الذكي", "hero.cta2": "استكشف العقارات",
  "search.placeholder": "ابحث بالمدينة أو الحي أو نوع العقار أو اسأل الذكاء الاصطناعي…",
  "card.view": "عرض العقار", "card.compare": "مقارنة", "card.save": "حفظ", "card.saved": "محفوظ", "card.askAi": "اسأل الوكيل",
  "card.beds": "غرف", "card.baths": "دورات مياه", "card.match": "تطابق ذكي", "card.verified": "الترخيص معروض",
  "agent.newChat": "محادثة جديدة", "agent.history": "المحادثات", "agent.savedSearches": "عمليات البحث المحفوظة", "agent.recent": "شوهدت مؤخرًا",
  "agent.placeholder": "صف العقار الذي تريده — الموقع والميزانية وعدد الغرف…", "agent.send": "إرسال",
  "agent.online": "متصل · جاهز للبحث", "common.demo": "بيانات تجريبية", "common.estimate": "تقدير ذكي",
  "lang.switch": "English",
};

export const dictionaries = { en, ar };
export type Lang = keyof typeof dictionaries;
