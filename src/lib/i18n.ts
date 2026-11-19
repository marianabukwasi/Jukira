export type SupportedLang = "en" | "fr" | "de" | "es" | "lg";

export const LANGUAGE_LABELS: Record<SupportedLang, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  lg: "Luganda",
};

export interface Dictionary {
  navHowItWorks: string;
  navPricing: string;
  navGarden: string;
  navFamilies: string;
  navFuneralHomes: string;
  navSignIn: string;
  navGetStarted: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  pricingEyebrow: string;
  pricingTitle: string;
  gardenEyebrow: string;
  gardenTitle: string;
}

export const DICTIONARIES: Record<SupportedLang, Dictionary> = {
  en: {
    navHowItWorks: "How It Works",
    navPricing: "Pricing",
    navGarden: "Memorial Garden",
    navFamilies: "For Families",
    navFuneralHomes: "For Funeral Homes",
    navSignIn: "Sign In",
    navGetStarted: "Get Started",
    heroTitle: "A lifetime of memories. A legacy worth preserving.",
    heroSubtitle:
      "Bring together photographs and videos from family and friends, and turn them into a beautiful film celebrating the life of someone you love.",
    heroCtaPrimary: "Create a Legacy Film",
    heroCtaSecondary: "See How It Works",
    pricingEyebrow: "Transparent Pricing",
    pricingTitle: "Simple packages by format and location.",
    gardenEyebrow: "Jukira Memorial Gardens",
    gardenTitle: "Take a peaceful walk to their resting place.",
  },
  fr: {
    navHowItWorks: "Comment ça marche",
    navPricing: "Tarifs",
    navGarden: "Jardin du Souvenir",
    navFamilies: "Pour les Familles",
    navFuneralHomes: "Pompes Funèbres",
    navSignIn: "Connexion",
    navGetStarted: "Commencer",
    heroTitle: "Une vie de souvenirs. Un héritage à préserver.",
    heroSubtitle:
      "Rassemblez les photos et vidéos de la famille et des amis pour créer un film commémoratif célébrant la vie d'un être cher.",
    heroCtaPrimary: "Créer un Film",
    heroCtaSecondary: "Découvrir le processus",
    pricingEyebrow: "Tarifs Transparents",
    pricingTitle: "Des formules simples selon votre région.",
    gardenEyebrow: "Jardins du Souvenir Jukira",
    gardenTitle: "Promenez-vous paisiblement jusqu'à leur lieu de repos.",
  },
  de: {
    navHowItWorks: "So funktioniert's",
    navPricing: "Preise",
    navGarden: "Gedenkgarten",
    navFamilies: "Für Familien",
    navFuneralHomes: "Für Bestatter",
    navSignIn: "Anmelden",
    navGetStarted: "Jetzt starten",
    heroTitle: "Ein Leben voller Erinnerungen. Ein Vermächtnis für immer.",
    heroSubtitle:
      "Sammeln Sie Fotos und Videos von Familie und Freunden und verwandeln Sie sie in einen würdevollen Erinnerungsfilm.",
    heroCtaPrimary: "Erinnerungsfilm erstellen",
    heroCtaSecondary: "So funktioniert's",
    pricingEyebrow: "Transparente Preise",
    pricingTitle: "Klare Pakete nach Region und Umfang.",
    gardenEyebrow: "Jukira Gedenkgärten",
    gardenTitle: "Ein ruhiger Spaziergang zur Ruhestätte.",
  },
  es: {
    navHowItWorks: "Cómo funciona",
    navPricing: "Precios",
    navGarden: "Jardín Conmemorativo",
    navFamilies: "Para Familias",
    navFuneralHomes: "Funerarias",
    navSignIn: "Iniciar sesión",
    navGetStarted: "Comenzar",
    heroTitle: "Toda una vida de recuerdos. Un legado que merece preservarse.",
    heroSubtitle:
      "Reúne fotografías y videos de familiares y amigos y conviértelos en una película conmemorativa que celebre su vida.",
    heroCtaPrimary: "Crear una Película",
    heroCtaSecondary: "Ver cómo funciona",
    pricingEyebrow: "Precios Transparentes",
    pricingTitle: "Paquetes claros según tu ubicación.",
    gardenEyebrow: "Jardines Conmemorativos Jukira",
    gardenTitle: "Da un paseo tranquilo hasta su lugar de descanso.",
  },
  lg: {
    navHowItWorks: "Bwe Kikola",
    navPricing: "Emiwendo",
    navGarden: "Ennimiro y'Okujjukira",
    navFamilies: "Eri Ab'enju",
    navFuneralHomes: "Abategeka Okuziika",
    navSignIn: "Yingira",
    navGetStarted: "Tandika",
    heroTitle: "Ebiseera by'obulamu bwonna. Omusika ogw'okukuuma.",
    heroSubtitle:
      "Kuŋŋaanya ebifaananyi ne vidiyo okuva eri ab'enju n'emikwano obifuule firimu ejjukira obulamu bw'omwagalwa wo.",
    heroCtaPrimary: "Kola Firimu y'Okujjukira",
    heroCtaSecondary: "Laba Bwe Kikola",
    pricingEyebrow: "Emiwendo Emitegeerekeka",
    pricingTitle: "Emiwendo egya buli kitundu.",
    gardenEyebrow: "Ennimiro za Jukira",
    gardenTitle: "Tambula mpola okutuuka ku kifo kyabwe eky'okuwummuliramu.",
  },
};

export function detectBrowserLanguage(): SupportedLang {
  if (typeof window === "undefined") return "en";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const lang = (navigator.language || "en").toLowerCase();
    if (tz.includes("Kampala") || lang.startsWith("lg")) return "lg";
    if (lang.startsWith("fr")) return "fr";
    if (lang.startsWith("de")) return "de";
    if (lang.startsWith("es")) return "es";
  } catch {
    // default
  }
  return "en";
}
