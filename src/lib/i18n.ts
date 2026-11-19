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
  introTitle: string;
  introSubtitle: string;
  howEyebrow: string;
  howTitle: string;
  step1Title: string;
  step1Body: string;
  step2Title: string;
  step2Body: string;
  step3Title: string;
  step3Body: string;
  sampleTitle: string;
  sampleSubtitle: string;
  gardenEyebrow: string;
  gardenTitle: string;
  gardenSubtitle: string;
  familiesEyebrow: string;
  familiesTitle: string;
  familiesCta: string;
  petsEyebrow: string;
  petsTitle: string;
  petsBody: string;
  petsCta: string;
  partnersEyebrow: string;
  partnersTitle: string;
  partnersBody: string;
  partnersCta: string;
  pricingEyebrow: string;
  pricingTitle: string;
  finalTitle: string;
  finalSubtitle: string;
  finalSampleContrib: string;
  finalSampleWeb: string;
  footerTagline: string;
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
    introTitle: "Their story lives in more than one photograph.",
    introSubtitle:
      "Every person has a lifetime of moments. Some are captured in family albums, some on old phones, and others are held by friends and relatives around the world. Jukira brings those memories together so their story can be celebrated and preserved.",
    howEyebrow: "Simple by design",
    howTitle: "How Jukira works",
    step1Title: "Invite family and friends",
    step1Body:
      "Create a private collection and share its upload link with the people who knew the person. No app download or account required for contributors.",
    step2Title: "Bring the memories together",
    step2Body:
      "Everyone can contribute photographs and videos from different stages of the person's life, straight from their phone or computer.",
    step3Title: "Create their legacy film",
    step3Body:
      "Jukira organises the material with AI-assisted editing and human quality control to produce a film the family can watch, download and keep.",
    sampleTitle: "A life remembered, beautifully brought together.",
    sampleSubtitle:
      "See how scattered photographs and videos from childhood, friendships, marriage and family life are woven into one calm, coherent celebration of a life.",
    gardenEyebrow: "Jukira Memorial Gardens",
    gardenTitle: "Take a peaceful walk to their resting place.",
    gardenSubtitle:
      "Walk through landscaped cemetery grounds from anywhere in the world, visit their personalised headstone, leave digital flowers, and watch their life story.",
    familiesEyebrow: "For Families",
    familiesTitle: "For the people who want to keep their memories close.",
    familiesCta: "Create a Family Project",
    petsEyebrow: "Pet Memorials",
    petsTitle: "For beloved pets who were part of the family.",
    petsBody:
      "Dogs, cats, and lifelong companions leave just as many everyday moments across family phones. Gather everyone's favourite photos and videos into a tribute film or slideshow.",
    petsCta: "Create a Pet Memorial",
    partnersEyebrow: "For Funeral Homes",
    partnersTitle: "Give families another way to celebrate a life.",
    partnersBody:
      "Offer Jukira as a meaningful service to the families you support. You introduce the service, and Jukira manages the collection, production and delivery.",
    partnersCta: "Partner With Jukira",
    pricingEyebrow: "Transparent Pricing",
    pricingTitle: "Simple packages by format and location.",
    finalTitle: "Every life leaves a story. Let's preserve it.",
    finalSubtitle:
      "Start a private memorial collection today, or preview how a contributor shares a memory.",
    finalSampleContrib: "Try Sample Contributor Link",
    finalSampleWeb: "View Sample Memorial Website",
    footerTagline: "A lifetime of memories. A legacy worth preserving.",
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
    introTitle: "Leur histoire vit dans bien plus qu'une seule photo.",
    introSubtitle:
      "Chaque personne possède toute une vie de moments précieux, parfois dispersés dans des albums ou sur d'anciens téléphones. Jukira les réunit avec respect.",
    howEyebrow: "Simple par nature",
    howTitle: "Comment fonctionne Jukira",
    step1Title: "Invitez la famille et les amis",
    step1Body:
      "Créez une collection privée et partagez le lien de dépôt. Aucun compte ni application n'est requis pour les proches.",
    step2Title: "Rassemblez les souvenirs",
    step2Body:
      "Chacun peut envoyer des photos et vidéos de chaque étape de la vie directement depuis son téléphone.",
    step3Title: "Créez leur film commémoratif",
    step3Body:
      "Jukira organise les souvenirs avec montage assisté par IA et contrôle qualité humain.",
    sampleTitle: "Une vie remémorée, réunie avec délicatesse.",
    sampleSubtitle:
      "Découvrez comment les photos et vidéos de toute une vie deviennent un hommage serein et cohérent.",
    gardenEyebrow: "Jardins du Souvenir Jukira",
    gardenTitle: "Promenez-vous paisiblement jusqu'à leur lieu de repos.",
    gardenSubtitle:
      "Parcourez des jardins paysagers depuis n'importe où dans le monde, déposez des fleurs numériques et regardez leur histoire.",
    familiesEyebrow: "Pour les Familles",
    familiesTitle: "Pour ceux qui souhaitent garder leurs souvenirs proches.",
    familiesCta: "Créer un Projet Familial",
    petsEyebrow: "Mémoriaux pour Animaux",
    petsTitle: "Pour les animaux bien-aimés qui faisaient partie de la famille.",
    petsBody:
      "Chiens, chats et fidèles compagnons laissent autant de moments précieux. Réunissez leurs plus beaux souvenirs.",
    petsCta: "Créer un Mémorial Animal",
    partnersEyebrow: "Pompes Funèbres",
    partnersTitle: "Offrez aux familles une autre façon de célébrer une vie.",
    partnersBody:
      "Proposez Jukira aux familles que vous accompagnez. Nous gérons la collecte, la production et la livraison.",
    partnersCta: "Devenir Partenaire Jukira",
    pricingEyebrow: "Tarifs Transparents",
    pricingTitle: "Des formules simples selon votre région.",
    finalTitle: "Chaque vie laisse une histoire. Préservons-la.",
    finalSubtitle:
      "Démarrez une collection privée dès aujourd'hui ou testez l'espace contributeur.",
    finalSampleContrib: "Tester le lien contributeur",
    finalSampleWeb: "Voir un mémorial exemple",
    footerTagline: "Une vie de souvenirs. Un héritage à préserver.",
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
    introTitle: "Ihre Geschichte lebt in mehr als einem Foto.",
    introSubtitle:
      "Jeder Mensch hinterlässt ein ganzes Leben voller Momente. Jukira bringt diese Erinnerungen aus aller Welt zusammen.",
    howEyebrow: "Einfach gestaltet",
    howTitle: "Wie Jukira funktioniert",
    step1Title: "Familie und Freunde einladen",
    step1Body:
      "Erstellen Sie eine private Sammlung und teilen Sie den Upload-Link. Keine App oder Registrierung nötig.",
    step2Title: "Erinnerungen zusammenbringen",
    step2Body:
      "Alle können Fotos und Videos aus verschiedenen Lebensabschnitten direkt vom Smartphone hochladen.",
    step3Title: "Ihren Lebensfilm gestalten",
    step3Body:
      "Jukira ordnet das Material mit KI-Unterstützung und menschlicher Qualitätskontrolle.",
    sampleTitle: "Ein Leben in würdevoller Erinnerung.",
    sampleSubtitle:
      "Sehen Sie, wie verstreute Fotos und Videos zu einem ruhigen Lebensfilm zusammenfinden.",
    gardenEyebrow: "Jukira Gedenkgärten",
    gardenTitle: "Ein ruhiger Spaziergang zur Ruhestätte.",
    gardenSubtitle:
      "Spazieren Sie virtuell durch gepflegte Gärten, legen Sie digitale Blumen nieder und bewahren Sie Erinnerungen.",
    familiesEyebrow: "Für Familien",
    familiesTitle: "Für Menschen, die Erinnerungen nah bewahren möchten.",
    familiesCta: "Familienprojekt starten",
    petsEyebrow: "Tiergedenkstätten",
    petsTitle: "Für geliebte Haustiere, die zur Familie gehörten.",
    petsBody:
      "Auch treue Begleiter hinterlassen unzählige schöne Momente. Sammeln Sie diese in einem eigenen Gedenkfilm.",
    petsCta: "Tiergedenkstätte erstellen",
    partnersEyebrow: "Für Bestatter",
    partnersTitle: "Geben Sie Familien eine weitere Möglichkeit, ein Leben zu würdigen.",
    partnersBody:
      "Bieten Sie Jukira als Service an. Wir übernehmen Sammlung, Produktion und Auslieferung.",
    partnersCta: "Partner werden",
    pricingEyebrow: "Transparente Preise",
    pricingTitle: "Klare Pakete nach Region und Umfang.",
    finalTitle: "Jedes Leben hinterlässt eine Geschichte. Bewahren wir sie.",
    finalSubtitle:
      "Starten Sie heute eine private Sammlung oder testen Sie die Beitragsansicht.",
    finalSampleContrib: "Beitragslink testen",
    finalSampleWeb: "Beispiel-Gedenkseite ansehen",
    footerTagline: "Ein Leben voller Erinnerungen. Ein Vermächtnis für immer.",
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
    introTitle: "Su historia vive en más de una fotografía.",
    introSubtitle:
      "Cada persona tiene toda una vida de momentos guardados en álbumes y teléfonos de todo el mundo. Jukira los reúne con respeto.",
    howEyebrow: "Simple por diseño",
    howTitle: "Cómo funciona Jukira",
    step1Title: "Invita a familiares y amigos",
    step1Body:
      "Crea una colección privada y comparte el enlace. No requiere cuenta ni descargar aplicaciones.",
    step2Title: "Reúne los recuerdos",
    step2Body:
      "Todos pueden subir fotos y videos de cualquier etapa de la vida directamente desde su teléfono.",
    step3Title: "Crea su película conmemorativa",
    step3Body:
      "Jukira organiza el material con edición asistida por IA y revisión humana de calidad.",
    sampleTitle: "Una vida recordada, reunida con belleza.",
    sampleSubtitle:
      "Mira cómo fotografías y videos dispersos se unen en un homenaje sereno y coherente.",
    gardenEyebrow: "Jardines Conmemorativos Jukira",
    gardenTitle: "Da un paseo tranquilo hasta su lugar de descanso.",
    gardenSubtitle:
      "Recorre jardines desde cualquier parte del mundo, deja flores digitales y recuerda su historia.",
    familiesEyebrow: "Para Familias",
    familiesTitle: "Para quienes desean mantener sus recuerdos cerca.",
    familiesCta: "Crear Proyecto Familiar",
    petsEyebrow: "Memoriales de Mascotas",
    petsTitle: "Para mascotas queridas que fueron parte de la familia.",
    petsBody:
      "Reúne las fotos y videos favoritos de tu compañero fiel en un homenaje duradero.",
    petsCta: "Crear Memorial de Mascota",
    partnersEyebrow: "Para Funerarias",
    partnersTitle: "Ofrece a las familias otra forma de celebrar una vida.",
    partnersBody:
      "Presenta Jukira a las familias que acompañas y nosotros gestionamos todo el proceso.",
    partnersCta: "Asociarse con Jukira",
    pricingEyebrow: "Precios Transparentes",
    pricingTitle: "Paquetes claros según tu ubicación.",
    finalTitle: "Cada vida deja una historia. Preservémosla.",
    finalSubtitle:
      "Inicia una colección privada hoy o prueba cómo un familiar comparte un recuerdo.",
    finalSampleContrib: "Probar enlace de contribución",
    finalSampleWeb: "Ver sitio conmemorativo de ejemplo",
    footerTagline: "Toda una vida de recuerdos. Un legado que merece preservarse.",
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
    introTitle: "Ebyafaayo byabwe biri mu bifaananyi bingi.",
    introSubtitle:
      "Buli muntu alina ebiseera bingi eby'obulamu ebiri mu masimu ne mu bitabo eby'abantu ab'enjawulo. Jukira ebigatta wamu.",
    howEyebrow: "Kyangu nnyo",
    howTitle: "Jukira bwe ekola",
    step1Title: "Yita ab'enju n'emikwano",
    step1Body:
      "Kola ekifo eky'ekyama ogabane omukutu gw'okuweerezaako ebifaananyi. Tekyetaagisa kwewandiisa.",
    step2Title: "Kuŋŋaanya ebijjukizo",
    step2Body:
      "Buli omu asobola okuweereza ebifaananyi ne vidiyo okuva ku ssimu ye.",
    step3Title: "Kola firimu y'okujjukira",
    step3Body:
      "Jukira etegeka ebifaananyi ne vidiyo n'obwegendereza okukola firimu ennungi ey'okukuuma.",
    sampleTitle: "Obulamu obujjukirwa mu kitiibwa.",
    sampleSubtitle:
      "Laba engeri ebifaananyi ne vidiyo gye bigattibwamu okukola firimu emu ey'okujjukira.",
    gardenEyebrow: "Ennimiro za Jukira",
    gardenTitle: "Tambula mpola okutuuka ku kifo kyabwe eky'okuwummuliramu.",
    gardenSubtitle:
      "Tambula mu nnimiro ennungi okuva wonna mu nsi, teekawo ebimuli, era olabe ebyafaayo byabwe.",
    familiesEyebrow: "Eri Ab'enju",
    familiesTitle: "Eri abo abayagala okukuuma ebijjukizo byabwe kumpi.",
    familiesCta: "Tandika Pulojekiti y'Enju",
    petsEyebrow: "Okujjukira Ebisolo",
    petsTitle: "Eri ebisolo ebyagalwa ebyali eby'omu nju.",
    petsBody:
      "Kuŋŋaanya ebifaananyi ne vidiyo by'ekisolo kyo ekyagalwa okukola firimu y'okujjukira.",
    petsCta: "Kola Ekijjukizo ky'Ekisolo",
    partnersEyebrow: "Abategeka Okuziika",
    partnersTitle: "Wa ab'enju engeri endala ey'okukuuma omukwano gwabwe.",
    partnersBody:
      "Weereza Jukira eri ab'enju b'oyamba; ffe tukola ku kukuŋŋaanya n'okukola firimu.",
    partnersCta: "Kola naffe ku Jukira",
    pricingEyebrow: "Emiwendo Emitegeerekeka",
    pricingTitle: "Emiwendo egya buli kitundu.",
    finalTitle: "Buli bulamu buleka ebyafaayo. Tubikuume.",
    finalSubtitle:
      "Tandika okukuŋŋaanya leero oba gezaako omukutu gw'okuweereza ebifaananyi.",
    finalSampleContrib: "Gezaako omukutu gw'okuweereza",
    finalSampleWeb: "Laba ekijjukizo eky'okulabirako",
    footerTagline: "Ebiseera by'obulamu bwonna. Omusika ogw'okukuuma.",
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
