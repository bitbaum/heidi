import type { Dictionary } from "./de.ts";

export const fr: Dictionary = {
  meta: {
    title: "Heidi — comprendre le suisse allemand",
    description:
      "Comprendre ce qui se dit vraiment autour de vous. Heidi déchiffre les vrais messages, explique les mots que vous ne connaissez pas encore et vérifie chaque réponse selon de vraies formes dialectales. En commençant par le zurichois.",
  },

  nav: {
    home: "Accueil",
    chat: "Chat",
    grammar: "Grammaire",
    dialect: "Dialectes",
    vocabulary: "Vocabulaire",
    method: "Méthode",
    technology: "Technique",
    contribute: "Participer",
    about: "À propos",
    portal: "Mon espace",
    settings: "Réglages",
    groupUse: "Utiliser",
    groupReference: "Références",
    groupWhy: "Pourquoi ainsi",
    groupProject: "Projet",
    skipToContent: "Aller au contenu",
    menu: "Menu",
    language: "Choisir la langue",
    langNational: "Langues nationales",
    langDialect: "Dialecte",
    langOther: "Autres langues",
  },

  footer: {
    tagline: "Comprendre le zurichois, puis participer.",
    builtOn: "Fait à Zurich.",
    sections: "Pages",
    projectTitle: "Projet",
    languageTitle: "Langue",
    openSource: "Construit à découvert",
    openSourceNote: "Nous publions ce que nous apprenons — y compris ce qui n'a pas marché.",
    rights: "Heidi, Zurich.",
  },

  home: {
    headline: "Comprendre le suisse allemand. Puis écrire comme quelqu'un d'ici.",
    sub: "Pour celles et ceux qui parlent déjà allemand et ne comprennent toujours rien à table.",
    dialectTitle: "Nous commençons par Zurich",
    dialectBody:
      "Le suisse allemand n'est pas une langue mais une famille. Aujourd'hui Heidi maîtrise vraiment bien le zurichois, et préfère vous le dire plutôt que de faire semblant de tout couvrir. C'est aussi exactement pourquoi la vérification rejette les formes bernoises : non parce que le bernois serait faux, mais parce que c'est Zurich que nous enseignons pour l'instant. D'autres dialectes suivront — chacun avec ses propres voix et sa propre vérification.",
    dialectPlanned: "Prévu",
    dialectOthers: "Autres dialectes",
    trustTitle: "Chaque ligne est vérifiée avant de vous parvenir",
    trustBody:
      "Un modèle de langue à qui l'on demande du suisse allemand vous donnera volontiers du bernois, sans que vous puissiez le remarquer. Chez Heidi, ce n'est donc pas le modèle qui décide de ce qui est zurichois : c'est une vérification par règles fixes, que vous pouvez lancer vous-même.",
    trustLink: "Essayer la vérification",
    correspondencesTitle: "Une douzaine de règles ouvrent des centaines de mots",
    pillarsTitle: "Comment Heidi travaille",
    methodLink: "Toute la méthode",
    researchLink: "Ce que dit la recherche",
    contributeTitle: "Nous cherchons des voix zurichoises",
    contributeBody:
      "Chaque seconde de dialecte que vous entendrez chez Heidi vient d'une personne réelle de Zurich. Si vous acceptez que nous vous enregistrions, écrivez-nous.",
    contributeCta: "Participer",
  },

  chat: {
    dock: {
      open: "Demander à Heidi",
      close: "Fermer",
      title: "Heidi",
      lead: "Posez une question sur ce que vous lisez — ou collez un message que vous avez reçu.",
      prompts: [
        "Comment dire en zurichois que je vais arriver en retard ?",
        "Quelle est la différence entre le dialecte et l'allemand écrit ?",
        "Donnez-moi trois mots que j'entendrai ici tous les jours.",
      ],
    },
    emptyTitle: "Demandez à Heidi",
    placeholder: "Collez ce que vous avez reçu — ou écrivez ce que vous voulez dire.",
    composer: "Message à Heidi",
    saveWord: "Garder ce mot",
    savedWord: "Gardé",
    send: "Envoyer",
    thinking: "Heidi lit …",
    you: "Vous",
    exampleUnderstand: "Ça veut dire quoi ?",
    exampleCompose: "L'écrire pour moi",
    examples: [
      { kind: "dialect", text: "Im Kauz scho, hät mer nöd so gfalle. Du au?" },
      { kind: "compose", text: "Dis-leur que j'arrive dix minutes en retard — gentiment." },
      { kind: "dialect", text: "Häsch du am Samschtig scho öppis vor?" },
    ],
    glossTitle: "Mots à retenir",
    suggestionsTitle: "À essayer",
    sendThis: "Vous pouvez envoyer ceci",
    /**
     * The badge on a sendable line that is the WRITTEN standard rather than
     * dialect. The pair is the point: one to send a landlord, one to send a
     * friend, and no way to tell them apart without this.
     */
    writtenStandard: "allemand écrit",
    copy: "Copier",
    copied: "Copié",
    flagged: "Pas du zurichois :",
    checkedNote: "Vérifié selon les formes zurichoises",
    mic: "Dicter",
    micStop: "Arrêter l'enregistrement",
    micListening: "J'écoute …",
    micTranscribing: "Transcription …",
    micProblem: {
      mic: "Pas d'accès au micro. Vous pouvez toujours taper.",
      silence: "Rien entendu. Appuyez à nouveau sur le micro et parlez tout de suite.",
      unavailable: "La dictée ne fonctionne pas dans ce navigateur. Vous pouvez toujours taper.",
    },
    newChat: "Nouvelle conversation",
    explanationsIn: "Explications en français",
    notConfigured: "Le modèle de langue n'est pas encore configuré sur cette installation.",
    unreachable: "Heidi est injoignable. Vérifiez votre connexion et réessayez.",
    failed: "Heidi n'a pas pu répondre à l'instant. Réessayez dans un moment.",
    retry: "Réessayer",
    /**
     * The full-screen chat. Its own object so the homepage box — which shares
     * every other string in here — does not have to carry strings it never
     * renders.
     */
    full: {
      expand: "Plein écran",
      title: "Chat",
      yourChats: "Vos conversations",
      noChats: "Aucune conversation pour l'instant.",
      untitled: "Sans titre",
      rename: "Renommer",
      save: "Enregistrer",
      cancel: "Annuler",
      delete: "Supprimer",
      deleteAsk: "Supprimer cette conversation ?",
      deleteYes: "Supprimer définitivement",
      onThisDevice: "Cette conversation n'existe que dans ce navigateur.",
      signInToKeep: "Connectez-vous pour la conserver",
      adoptTitle: "Conserver cette conversation ?",
      adoptBody: "Vous écriviez avant de vous connecter. Heidi peut enregistrer cette conversation dans votre compte, ou la laisser ici dans le navigateur.",
      adoptKeep: "Oui, enregistrer",
      adoptDiscard: "La laisser ici",
      menuOpen: "Conversations",
      menuClose: "Fermer",
    },
    /**
     * The one-tap follow-ups. `label` is what the chip says; `say` is the
     * message it sends, which lands in the transcript as an ordinary turn —
     * a follow-up you cannot see is a conversation you cannot re-read.
     *
     * The ids come from `lib/domain/chat/moves.ts` and are a CLOSED set. The
     * model chooses which to offer; it never writes these words, because a
     * label the model invented arrives in whatever language it felt like and
     * can promise something pressing it does not do.
     */
    moves: {
      title: "Et maintenant ?",
      reply: { label: "Écrire une réponse", say: "Comment est-ce que je réponds à ça ?" },
      grammar: { label: "La grammaire derrière", say: "Expliquez-moi la grammaire derrière ça." },
      shorter: { label: "Plus court", say: "Dites-le plus brièvement." },
      warmer: { label: "Plus chaleureux", say: "Dites-le un peu plus chaleureusement." },
      firmer: { label: "Plus ferme", say: "Dites-le plus fermement — j'ai déjà demandé deux fois." },
      formal: { label: "Plus formel", say: "Écrivez-le plus formellement, pour un message officiel." },
      casual: { label: "Plus détendu", say: "Dites-le plus simplement, entre amis." },
      simpler: { label: "Plus simple", say: "Dites-le avec des mots plus simples." },
      decline: { label: "Refuser poliment", say: "Écrivez cela comme un refus poli." },
      apologise: { label: "S'excuser", say: "Écrivez cela comme des excuses." },
      thank: { label: "Remercier", say: "Écrivez cela comme un remerciement." },
      ask: { label: "Demander une précision", say: "Formulez une question en retour — je n'ai pas bien compris." },
      swiss: { label: "En allemand écrit", say: "Écrivez-le en allemand standard suisse, pas en dialecte." },
    },
  },

  model: {
    attach: "Joindre une image",
    attachNeedsKey: "Lire une image demande votre propre modèle",
    remove: "Retirer",
    connectTitle: "Connecter votre propre modèle",
    connectLead:
      "Heidi est gratuit, et les modèles gratuits ne savent pas lire les images. Avec votre propre clé API, Heidi comprend une capture d'écran — et répond mieux en général.",
    whyTitle: "Pourquoi ce n'est pas simplement inclus ?",
    whyBody:
      "Parce que lire une image coûte de l'argent, par image. Le payer pour tout le monde signifierait rendre Heidi payant. Ainsi tout le reste demeure gratuit, et qui veut plus apporte sa propre clé.",
    safetyTitle: "Où va votre clé",
    safetyBody:
      "Elle reste dans ce navigateur. À chaque message elle nous est envoyée par une connexion chiffrée, utilisée une fois chez le fournisseur, puis abandonnée. Nous ne la stockons pas, ne l'écrivons dans aucun journal et ne la renvoyons jamais.",
    providerLabel: "Fournisseur",
    keyLabel: "Clé API",
    keyPlaceholder: "sk-…",
    modelLabel: "Modèle",
    getKey: "Obtenir une clé",
    test: "Connecter et tester",
    testing: "Vérification …",
    connected: "Connecté",
    connectedWith: "Connecté avec",
    failed: "Cela n'a pas fonctionné",
    disconnect: "Retirer la clé",
    canSee: "Peut lire les images",
    textOnly: "Texte seulement",
    open: "Votre propre modèle",
    imageTooBig: "Cette image ne peut pas être utilisée.",
    imagesLabel: "Joint",
  },

  pillars: [
    {
      title: "Comprendre vient d'abord",
      body: "Écouter avant de parler. En Suisse, comprendre le dialecte et répondre en allemand standard est une manière complète et respectée d'appartenir. C'est aussi le seul moyen de ne pas perdre l'exposition : dès qu'on voit que vous peinez, on passe au Hochdeutsch.",
    },
    {
      title: "La vraie vie est le programme",
      body: "Pas d'exercices inventés. Le message arrivé ce matin, la phrase entendue à midi, le refus que vous devez écrire — voilà le matériau. Heidi aide tout de suite et retient ce que vous ne saviez pas.",
    },
    {
      title: "Mesuré, pas gamifié",
      body: "Pas de séries, pas de points, pas de pourcentages inventés. Le chiffre que nous voulons vous montrer, c'est la part que vous comprenez d'une voix zurichoise inconnue — avant et après.",
    },
  ],

  method: {
    contents: "Sur cette page",
    title: "La méthode",
    lead: "Heidi est construit sur ce que la recherche montre réellement, et non sur ce qui se vend bien comme cours de langue. Cela conduit à quelques décisions qui surprennent d'abord.",
    sections: [
      {
        title: "Le piège dont Heidi vous sort",
        body: "Vous apprenez l'allemand, vous vous installez à Zurich, et vous découvrez que cela ne suffit pas. À table on parle dialecte, vous n'en comprenez presque rien, et comme cela se voit, tout le monde passe poliment au Hochdeutsch ou à l'anglais. L'exposition même qui vous ferait progresser vous est retirée parce que vous en auriez besoin. Heidi est une source de dialecte qui ne se dérobe pas.",
      },
      {
        title: "L'exposition l'emporte sur les règles",
        body: "Dans la plus vaste étude sur la compréhension des langues proches, la simple quantité d'exposition comptait davantage que toute mesure de distance linguistique. Ce n'est pas la grammaire qui décide, c'est ce que vous avez entendu. Heidi n'est donc pas une suite de leçons mais un lieu où du vrai dialecte arrive sans cesse.",
      },
      {
        title: "Les règles appartiennent à la pratique, pas à ce qui la précède",
        body: "Chind, Huus, isch, guet — les règles sonores sont réelles et utiles. Mais le seul test propre d'une leçon préalable n'a montré aucun effet mesurable. Ce qui marche en revanche : dire à quelqu'un ce qu'il doit écouter, juste avant qu'il ne le réentende. Heidi montre donc une règle à la fois, toujours à côté d'un mot concret.",
      },
      {
        title: "Le test est toujours une nouvelle voix",
        body: "S'habituer à une seule personne est facile et ne prouve rien. Ce qui compte, c'est que cela se transfère à une voix jamais entendue. Heidi entraîne donc avec de nombreuses voix et teste toujours avec une inconnue.",
      },
      {
        title: "Parler vient en dernier, et ce n'est pas une lacune",
        body: "Les adultes atteignent rarement une prononciation native dans un second dialecte, et en Suisse cela pèse moins qu'ailleurs : comprendre le dialecte et répondre en allemand standard est normal et respecté. Heidi ne vous vend donc pas l'écoute comme remède à votre prononciation — les preuves sont faibles.",
      },
    ],
    loopTitle: "La boucle",
    loopSteps: [
      "Vous recevez quelque chose que vous ne comprenez pas.",
      "Heidi l'explique immédiatement — entièrement, pas comme une devinette.",
      "Un ou deux mots restent, parce qu'ils ont été expliqués au moment utile.",
      "Les mêmes mots reviennent plus tard, dans une autre phrase.",
      "Un jour vous les croisez dehors, et Heidi n'est pas là.",
    ],
    loopNote:
      "Le dernier point est le but. La plupart des programmes veulent que vous reveniez. Un produit d'apprentissage devrait vouloir que vous en ayez de moins en moins besoin.",
  },

  research: {
    title: "Ce que dit la recherche",
    lead: "Les produits d'apprentissage accumulent de la pseudoscience parce que « il existe une étude » devient très vite « c'est prouvé », puis un produit entier. Nous séparons trois choses : ce qui est établi, ce que nous supposons, et ce qui n'est qu'une décision.",
    factTitle: "Établi",
    factNote: "Nous nous appuyons dessus.",
    hypothesisTitle: "Hypothèse",
    hypothesisNote: "Plausible, non testé — et Heidi est l'instrument de mesure.",
    decisionTitle: "Décision",
    decisionNote: "Des choix de produit qui restent justes même si l'hypothèse ne se confirme pas.",
    facts: [
      {
        claim: "L'exposition l'emporte sur la distance linguistique.",
        detail:
          "Sur 1833 auditeurs et 70 paires de langues, l'exposition à la langue testée comptait plus que la distance lexicale, phonologique ou orthographique.",
        source: ["gooskens-2018"],
      },
      {
        claim: "S'entraîner avec de nombreuses voix est ce qui se transfère aux voix inconnues.",
        detail:
          "S'exercer avec une seule voix peut mieux réussir sur cette voix-là et ne se transfère pas. Confirmé spécifiquement pour les dialectes régionaux.",
        source: ["lively-1993", "clopper-2004"],
      },
      {
        claim: "Dire quoi écouter est un principe actif, pas un ornement.",
        detail: "Même matériel, même retour : seul le groupe averti du contraste pertinent a appris.",
        source: ["pederson-2010"],
      },
      {
        claim: "Se rappeler avec retour l'emporte sur la relecture.",
        detail: "222 études, 48 478 apprenants ; g ≈ 0,50, et 0,54 avec retour contre 0,37 sans.",
        source: ["yang-2021"],
      },
      {
        claim: "La pratique espacée l'emporte sur la pratique massée, et l'avance grandit avec le temps.",
        detail: "g ≈ 0,76 immédiatement, g ≈ 1,15 après un délai, sur 48 expériences et 3411 personnes.",
        source: ["kim-webb-2022"],
      },
      {
        claim: "Les sous-titres aident — après la tentative d'écoute, pas pendant.",
        detail:
          "Effet important sur le vocabulaire (g ≈ 0,87), apparemment parce que le texte aide à découper le flux sonore en mots. Un texte affiché en permanence devient une béquille.",
        source: ["montero-perez-2013"],
      },
      {
        claim: "L'entraînement à l'écoute n'améliore que faiblement votre propre prononciation.",
        detail: "d ≈ 0,92 pour la perception, d ≈ 0,54 pour la production, sans corrélation entre les deux.",
        source: ["sakai-moorman-2018"],
      },
      {
        claim: "Écrire en dialecte est numériquement normal en Suisse, ce n'est pas de l'argot.",
        detail: "C'est pourquoi « écrire comme quelqu'un d'ici » est une vraie compétence et non un gadget.",
        source: ["whatsup-uzh"],
      },
    ],
    hypotheses: [
      {
        claim: "Les règles consonantiques prédisent peut-être mieux l'intelligibilité que les règles vocaliques.",
        detail:
          "Ce qui est établi, c'est que la distance phonétique prédit mieux l'intelligibilité que la distance lexicale. Les chiffres précis que cette page opposait autrefois — consonnes contre voyelles — nous n'avons pu les vérifier dans aucune source accessible : l'affirmation figure donc ici et non sous « Établi ». Deux de nos quatre règles en page d'accueil sont vocaliques, donc le pari le plus faible.",
        source: ["gooskens-2007"],
      },
      {
        claim: "Les règles sonores fonctionnent comme indice dans la pratique même si elles échouent comme leçon.",
        detail:
          "Le seul test propre de la forme « leçon » — 50 minutes de néerlandais-frison — n'a montré aucun effet significatif, et les auteurs eux-mêmes mettent en garde contre toute généralisation. Toute la tradition européenne d'intercompréhension est, selon les chercheurs de référence, pratiquement non évaluée. Notre variante est donc celle qui n'a pas été testée. Nous la mesurons.",
        source: ["bergsma-2014"],
      },
      {
        claim: "Une courte mise en oreille améliore de façon mesurable la compréhension d'une voix inconnue.",
        detail:
          "Ce qui est établi après environ une minute, c'est une vitesse de traitement accrue — pas davantage de mots compris. Nous n'affirmons donc pas qu'une minute vous fait comprendre plus.",
        source: ["clarke-garrett-2004"],
      },
    ],
    decisions: [
      "Écouter avant d'écrire avant de parler — justifié par la situation linguistique, pas seulement par les preuves.",
      "Mesuré plutôt que gamifié. Pas de séries, pas de points.",
      "La voix de test est toujours une voix que vous n'avez pas entendue.",
      "De vrais enregistrements zurichois, car tout corpus zurichois disponible n'est licencié que pour la recherche.",
      "Le modèle ne juge jamais son propre dialecte.",
    ],
    honestyTitle: "Là où nous nous sommes corrigés",
    honestyBody:
      "Ce site a dit un jour que la forme « leçon » des règles sonores avait été « testée et n'avait pas fonctionné ». Une seule étude de 50 minutes ne porte pas ce poids, et cela faisait passer notre propre variante pour prouvée alors qu'elle est la non testée. Il disait aussi qu'aucune synthèse vocale suisse allemande n'était achetable ; ce n'est plus vrai.",
  },

  check: {
    title: "Vérification du dialecte",
    intro: "Une liste de règles fixe — pas un modèle de langue. Elle vérifie chaque ligne que Heidi vous montre. Vous pouvez la faire tourner vous-même ici.",
    placeholder: "Das isch nid güet, gäu",
    button: "Vérifier",
    failed: "La vérification n'était pas joignable. Réessayez.",
    ok: "Aucune forme étrangère trouvée. Cela peut passer pour du zurichois.",
    okShort: "Propre",
    failShort: "Trouvé",
    suggests: "mieux",
    whyTitle: "Pourquoi ce n'est pas un détail",
    whyBody:
      "Les formes bernoises, bâloises et de Suisse orientale sont des mots parfaitement corrects — simplement pas ici. Qui apprend le zurichois ne peut, par définition, pas entendre la différence. C'est précisément pourquoi cette décision ne doit pas revenir à un modèle de langue.",
    noteTitle: "À propos de l'orthographe",
    noteBody:
      "Le zurichois n'a pas d'orthographe officielle. Cette vérification ne vous dira jamais que votre graphie est fausse — seulement qu'une forme vient d'une autre région.",
  },

  technology: {
    title: "Ce qu'un ordinateur sait faire du suisse allemand",
    lead: "Et ce qu'il ne sait pas faire. Cette page rassemble ce qui a réellement été mesuré dans ce domaine — avec les chiffres et les sources, pour que vous puissiez y confronter nos affirmations.",
    hardTitle: "Pourquoi c'est difficile",
    hardBody: [
      "Il n'existe pas d'orthographe officielle. Il existe des recommandations de 1938 qu'utilise la dialectologie — mais même des transcripteurs formés les appliquent différemment, et presque personne n'écrit ainsi à une amie.",
      "On parle le dialecte, on écrit l'allemand standard. Écrire ce qui a été dit n'est donc pas ici une transcription mais une traduction — et c'est ainsi qu'est construit presque tout ce qui existe.",
      "Et c'est une petite langue au sens des données : les plus grandes collections publiques font quelques centaines d'heures, et presque toutes ne sont concédées que pour la recherche.",
    ],
    corporaTitle: "D'où viennent les données",
    corporaLead: "Les collections publiques sur lesquelles repose ce domaine. La colonne « sens » est la plus parlante : presque tout entend du dialecte et écrit du standard.",
    asrTitle: "Comprendre",
    asrLead: "Taux d'erreur de mots sur le même jeu de test, pour que les chiffres soient comparables. Tous ces systèmes produisent de l'allemand standard — le chiffre dit la qualité de la traduction, pas celle de l'écriture en dialecte.",
    speakingTitle: "Parler",
    speakingLead: "Ici le marché induit en erreur. Ce qui est vendu comme une voix « suisse allemande » est le plus souvent de l'allemand standard suisse — la langue écrite, lue à voix haute. La vraie synthèse dialectale n'existe presque qu'en recherche.",
    modelsTitle: "Modèles de langue",
    modelsLead: "Si un modèle maîtrise vraiment le dialecte, ou si cela ne figure que dans le communiqué de presse. « Évalué » signifie que quelqu'un l'a mesuré et publié.",
    heidiTitle: "Ce que cela signifie pour Heidi",
    heidiBody: [
      "La dictée n'écrit pas le dialecte. Elle écrit ce que vous voulez dire, dans la langue que vous avez déjà — précisément ce que la recherche sait faire.",
      "Heidi ne parle pas. Une voix qui prononcerait mal le zurichois, vous ne pourriez pas le vérifier, et c'est la seule erreur que ce produit ne doit pas commettre.",
      "Le contrôle dialectal fonctionne sans modèle. C'est une liste de règles fixe, pas un modèle de langue — c'est pourquoi il ne peut rien inventer.",
    ],
    directionLabel: "Sens",
    directions: {
      "speech-to-standard": "dialecte entendu → standard écrit",
      "speech-to-dialect": "dialecte entendu → dialecte écrit",
      "dialect-text": "dialecte, écrit",
      "text-to-speech": "texte → dialecte parlé",
    },
    hours: "heures",
    speakers: "locuteurs",
    regions: "régions",
    licence: "licence",
    licences: { research: "recherche uniquement", unpublished: "aucune licence publiée", textOnly: "texte ; audio sur demande" },
    wer: "taux d'erreur de mots",
    zeroShot: "sans entraînement",
    fineTuned: "réentraîné",
    speakingNames: {
      commercial: "Voix commerciales « de-CH »",
      eth: "ETH Zurich, Swiss Voice",
      vits: "T5 et VITS, pipeline de recherche",
      voiceCloning: "Clonage de voix à partir de podcasts",
    },
    weightsOpen: "poids publiés",
    weightsClosed: "poids non publiés",
    isDialect: "dialecte",
    isStandard: "allemand standard suisse",
    evaluated: "dialecte évalué",
    notEvaluated: "dialecte non évalué",
    statusResearch: "recherche",
    statusService: "service",
    statusClosed: "cessé",
  },

  contribute: {
    title: "Nous cherchons des voix zurichoises",
    lead: "Chaque seconde de dialecte que vous entendrez chez Heidi vient d'une personne réelle de Zurich. C'est cher et lent, et nous le faisons quand même.",
    whyTitle: "Pourquoi pas simplement des voix synthétiques",
    whyBody:
      "La raison honnête n'est pas qu'il n'existe pas de synthèse vocale suisse allemande — il en existe désormais. La raison est la licence. Chaque corpus de parole zurichoise que nous avons trouvé est publié pour la recherche et non pour un produit. Qui a besoin de vrai zurichois, proprement licencié et consenti, doit l'enregistrer lui-même. S'ajoute ce que les voix synthétiques font mal de toute façon : le rythme, les mots avalés, l'hésitation, la différence entre deux personnes du même quartier.",
    needTitle: "Ce dont nous avons besoin",
    needList: [
      "Des personnes ayant grandi dans le canton de Zurich, ou y vivant depuis longtemps.",
      "Des phrases tout à fait ordinaires — pas de lecture de littérature.",
      "Des âges, des genres, des quartiers et des débits différents.",
      "Vingt minutes de votre temps, chez vous ou chez nous.",
    ],
    consentTitle: "Ce qu'il advient de l'enregistrement",
    consentBody:
      "Vous gardez la main. Nous vous disons à l'avance à quoi servira l'enregistrement, vous pouvez le retirer, et le consentement pour le produit n'est pas celui pour la recherche. Nous supposons que vous ne voulez pas du second tant que vous ne le dites pas explicitement.",
    ctaTitle: "Écrivez-nous",
    ctaBody: "Un court message suffit. Dites-nous de quelle partie du canton vous venez.",
    ctaButton: "Envoyer un e-mail",
  },

  about: {
    title: "À propos de Heidi",
    lead: "Heidi est fait à Zurich, par des gens qui ont eu le même problème. Nous construisons à découvert — y compris les parties qui n'ont pas marché.",
    sections: [
      {
        title: "Pourquoi cela existe",
        body: "Parce que beaucoup de gens ici suivent le même chemin : apprendre l'allemand, s'installer, puis découvrir que la partie décisive de la langue ne s'écrit nulle part. Ce n'est pas un problème de niche mais l'expérience ordinaire de cette ville.",
      },
      {
        title: "Comment nous travaillons",
        body: "Nous avons d'abord lu ce que dit la recherche, et seulement ensuite construit. Trois résultats ont renversé le plan que nous aurions autrement livré. Ce que nous avons appris figure sur la page Recherche — y compris les endroits où nous avons dû nous corriger publiquement.",
      },
      {
        title: "Ce qui manque encore",
        body: "Aujourd'hui : comprendre et répondre à du vrai texte. Ensuite : le laboratoire d'écoute, où vous entendez une voix zurichoise, vous vous y faites, et nous mesurons ce que vous saisissez d'une autre. Cela demande des enregistrements, et ils se font.",
      },
    ],
    stateTitle: "Où nous en sommes",
  },

  settings: {
    appearanceTitle: "Apparence",
    appearanceBody: "Clair, sombre, ou selon le réglage de votre appareil. Le choix reste dans ce navigateur.",
    theme: { label: "Apparence", system: "Appareil", light: "Clair", dark: "Sombre" },
    title: "Réglages",
    lead: "Tout ce que Heidi sait de vous, au même endroit — et tout est effaçable.",
    languageTitle: "Langue du site",
    languageBody: "La langue dans laquelle Heidi vous parle. Ce que vous apprenez reste le zurichois.",
    modelTitle: "Modèle de langue",
    modelBody: "Par défaut Heidi utilise des modèles gratuits. Votre propre clé débloque les images et améliore les réponses.",
    modelNone: "Aucun modèle personnel connecté",
    accountTitle: "Compte",
    accountBody: "Pour garder vos mots et pour les groupes d'étude. Traduire ne demande aucun compte.",
    dataTitle: "Ce qui est gardé sur cet appareil",
    dataBody:
      "Votre conversation reste dans cet onglet et disparaît quand vous le fermez. Votre clé vit dans le stockage de ce navigateur jusqu'à ce que vous la retiriez. Rien de tout cela n'est sur nos serveurs. Les mots que vous gardez y restent aussi, jusqu'à ce que vous les retiriez.",
  },

  auth: {
    menu: {
      portal: "Vos mots et vos conversations",
      settings: "Langue, modèle, compte",
    },
    signIn: "Se connecter",
    signOut: "Se déconnecter",
    signInWith: "Se connecter avec OrangeCat",
    account: "Compte",
    portalTitle: "Mon espace",
    portalLead:
      "Vos mots, au moment de les revoir — et ce qui vous arrête le plus souvent.",
    signedInAs: "Connecté en tant que",
    notSignedIn: "Vous n'êtes pas connecté",
    notSignedInBody:
      "Connectez-vous pour que Heidi puisse retenir ce que vous ne saviez pas encore. Tout le reste continue de fonctionner sans cela — la traduction et la vérification du dialecte ne demandent aucun compte.",
    whyTitle: "Pourquoi OrangeCat",
    whyBody:
      "Heidi ne tient aucune base d'utilisateurs. Votre identité vit chez OrangeCat, où les profils et les paiements sont déjà chez eux. Cela veut dire un seul compte pour plusieurs produits, pas de mot de passe supplémentaire — et rien ici qui puisse être volé.",
    soonTitle: "Ce qui vient ensuite",
    soonList: [
      "Des tuteurs — bénévoles, payés, et jamais obligatoires.",
    ],
    unavailable: "La connexion n'est pas encore configurée sur cette installation.",
    errorTitle: "La connexion n'a pas fonctionné",
    errorBody: "Quelque chose s'est mal passé. Réessayez, ou revenez à l'accueil.",
    tryAgain: "Réessayer",
  },

  vision: {
    title: "Où cela mène",
    lead: "Le suisse allemand est le début, pas la destination. La méthode n'est pas propre à la Suisse.",
    points: [
      {
        title: "Il existe beaucoup de langues de ce type",
        body: "Partout dans le monde il y a des langues et des dialectes trop petits pour intéresser un grand éditeur de cours — et qui sont en même temps exactement ce qu'il faut maîtriser pour appartenir vraiment. On peut posséder parfaitement la langue officielle et rester à l'écart à table.",
      },
      {
        title: "C'est précisément là que les grands acteurs échouent",
        body: "Les cours de langue suivent le marché, et le marché suit le nombre de locuteurs. Il reste quelques dictionnaires, quelques corpus de recherche qu'on n'a pas le droit d'exploiter commercialement, et aucun enregistrement pour s'exercer. Heidi est construit pour ce vide.",
      },
      {
        title: "La méthode se transfère",
        body: "Les adultes qui maîtrisent déjà une langue proche n'ont pas à repartir de zéro — ils doivent réapprendre ce qu'ils possèdent déjà. Cela vaut pour l'allemand standard et le zurichois comme pour bien d'autres paires. C'est pourquoi, chez Heidi, la langue enseignée est une configuration interchangeable et non quelque chose d'inscrit dans le code.",
      },
    ],
    closing:
      "Concrètement : d'abord d'autres dialectes alémaniques, ensuite une langue hors de Suisse — la même machine, un autre jeu linguistique. Ce que nous apprenons en chemin, nous l'écrivons.",
  },

  errors: {
    notFoundTitle: "Cette page n'existe pas",
    notFoundBody: "Le lien est peut-être ancien, ou nous avons déplacé quelque chose.",
    backHome: "Retour à l'accueil",
  },
  /**
   * The grammar area. The FORMS live in the variety pack — `Ich bi gange` is
   * Zurich German whoever is reading — and the words that explain them live
   * here, keyed by the pack's topic id, because an explanation has to be
   * translated and a pack is English-source.
   *
   * A topic is small on purpose: one sentence of rule and the thing that
   * actually trips somebody who already reads German. The evidence this repo
   * cites is that these work as cues beside something you are about to meet
   * again, and fail as a lecture you sit through first.
   */
  /**
   * The dialect section. The INDEX explains what Swiss German is, which is
   * worth writing properly and is one page.
   *
   * The AREA pages carry no prose at all — an endonym, the cantons, a town,
   * the forms the gate knows and a source, all of it data. Eleven areas of
   * translated description would be seventy-seven blocks nobody can check, and
   * machine-translated linguistic claims are exactly how a reference page ends
   * up confidently wrong. Forms need no translation; the frame around them is
   * what is written here.
   */
  /**
   * The vocabulary page. The WORDS are in the variety pack — a form and its
   * German equivalent are not in any language — and only the frame is here:
   * a title, the note about which direction the page runs in, and a label per
   * group.
   */
  vocabulary: {
    keptTitle: "Mots gardés",
    keptNone: "Touchez + pour garder un mot. Heidi vous le redemandera plus tard.",
    keptSome: "en révision",
    practise: "Réviser maintenant",
    askLabel: "Voir dans une phrase",
    askSay: "Montrez-moi « {word} » dans deux courtes phrases du quotidien.",
    title: "Les mots les plus utiles",
    lead: "Pas les mots pour touristes, mais ceux sur lesquels une phrase se bloque : les petits, les constants, ceux qu'aucune règle de correspondance ne rattrape.",
    note: "Sens : dialecte → allemand. Il s'agit ici de comprendre, pas d'écrire — ce que vous devriez écrire vous-même se trouve du côté des dialectes.",
    groups: {
      function: "Petits mots, grand effet",
      verbs: "Les verbes qui reviennent sans cesse",
      everyday: "Le quotidien",
      greetings: "Salutations et politesse",
    },
  },

  dialect: {
    title: "Le suisse allemand",
    lead: "Ce que c'est, pourquoi vous ne le comprenez pas alors que vous savez l'allemand — et quel dialecte se parle où.",
    spokenTitle: "Parlé, pas écrit",
    spokenBody: "Le suisse allemand est la langue parlée du quotidien — et la langue écrite entre gens qui se connaissent : SMS, WhatsApp, notes. Tout ce qui est officiel s'écrit en allemand standard suisse. Les deux en font partie, et qui ne maîtrise qu'un seul finit par envoyer un message en dialecte à son assurance.",
    noStandardTitle: "Pas d'orthographe officielle",
    noStandardBody: "Il n'existe pas d'orthographe officielle. Le même mot s'écrit différemment selon les personnes, et les deux ont raison. C'est pourquoi Heidi ne dira jamais que votre graphie est fausse — seulement comment nous l'écrivons.",
    notOneTitle: "Pas une seule langue",
    notOneBody: "Le suisse allemand n'est pas un dialecte unique, mais plusieurs. Les différences sautent aux oreilles d'un local et échappent totalement à un apprenant. Heidi vous enseigne le zurichois et le dit, plutôt que de faire comme s'il n'y en avait qu'un.",
    areasTitle: "Les dialectes",
    areasLead: "Les frontières dialectales ne suivent pas les frontières cantonales — d'où des points et non des surfaces. Les cantons sont indiqués parce que vous savez dans lequel vous êtes.",
    cantons: "Cantons",
    marksTitle: "Comment les reconnaître",
    marksLead: "Des formes que le contrôle de Heidi distingue réellement. À gauche la forme locale, à droite celle de Zurich.",
    marksNone: "Heidi ne sait pas encore reconnaître ce dialecte à des formes précises. Rien ici, plutôt que quelque chose de plausible.",
    taught: "C'est ce que vous apprenez ici",
    sourcesTitle: "Sources",
    backToAll: "Tous les dialectes",
  },

  grammar: {
    practiseLabel: "S'exercer",
    practiseSay: "Donnez-moi deux phrases pour m'exercer à « {word} » — puis interrogez-moi sur l'une d'elles.",
    title: "Grammaire",
    lead: "Quatre choses qui rendent le zurichois difficile à suivre pour quelqu'un qui lit déjà l'allemand. Pas de leçons — seulement ce que vous allez entendre, et où ça coince.",
    ruleLabel: "La règle",
    watchLabel: "Où ça coince",
    topics: {
      "no-preterite": {
        title: "Pas de prétérit",
        rule: "Le zurichois parlé n'a pas de passé simple : tout le passé se dit au parfait.",
        watch: "Vous attendez « ging », « war », « sagte » — et cela ne vient jamais. Si vous entendez « bi », « hät » ou « händ » suivi d'un participe, c'est le passé.",
      },
      "wo-relative": {
        title: "« wo » à la place de der, die, das",
        rule: "Les relatives commencent presque toujours par « wo », invariable, quel que soit le genre ou le cas.",
        watch: "Vous lisez « wo » comme « où ? » et vous perdez la phrase. Ici, cela veut dire « qui », « que » — jamais un lieu.",
      },
      "possessive-dative": {
        title: "La possession à l'envers",
        rule: "Le génitif n'existe pas : la possession se construit avec le datif et un possessif, ou avec « vo ».",
        watch: "« Em Peter sis Auto » n'est pas une faute, c'est la forme normale. La personne d'abord, la chose ensuite.",
      },
      "diminutive-li": {
        title: "Le -li sur tout",
        rule: "Le diminutif en -li est très productif et n'indique souvent rien de petit.",
        watch: "« Es Bierli » n'est pas une petite bière, c'est une bière dite gentiment. Ne prenez pas le -li au pied de la lettre.",
      },
    },
  },

  saved: {
    title: "Vos mots",
    lead: "Ce que vous avez cherché et voulu garder. Tout reste dans ce navigateur, sur cet appareil — pas chez nous.",
    empty: "Aucun mot gardé pour l'instant.",
    emptyHint: "Demandez une phrase à Heidi. À côté de chaque mot expliqué, un plus vous permet de le garder.",
    countLabel: "gardés",
    remove: "Retirer",
    clear: "Tout retirer",
    clearConfirm: "Vraiment tout retirer ?",
    exportLabel: "Enregistrer dans un fichier",
    onThisDevice: "Uniquement sur cet appareil",
    savedOn: "Gardé le",
    openChat: "Chercher quelque chose",
  },

  /**
   * The dashboard: spaced review, and what the learner's own list says about
   * them. No streak, no score, no percentage — HEIDI.md §8 names each of those
   * as the thing this must not become.
   */
  review: {
    title: "À réviser",
    lead: "Les mots que vous avez gardés reviennent ici — après un jour, puis trois, puis une semaine. Demander plus tard marche mieux que demander plus souvent.",
    due: "à réviser",
    none: "Rien à réviser aujourd'hui.",
    noneHint: "Revenez demain — ou cherchez quelque chose de nouveau.",
    empty: "Aucun mot à réviser pour l'instant.",
    emptyHint: "Gardez un mot pendant une conversation, et Heidi vous le redemandera plus tard.",
    tomorrow: "demain",
    settled: "acquis",
    prompt: "Ça veut dire quoi ?",
    show: "Révéler",
    knew: "Je savais",
    missed: "Pas encore",
    done: "Terminé pour aujourd'hui.",
    patternsTitle: "Ce qui vous arrête le plus souvent",
    patternsLead: "Ces régularités se trouvent dans les mots que vous avez gardés. Pas une note — seulement ce qui est dans votre propre liste.",
    patternsCount: "de vos mots",
    recentTitle: "Reprendre",
    recentEmpty: "Aucune conversation pour l'instant.",
  },
  groups: {
    title: "Groupes d'étude",
    lead: "Pratiquez avec d'autres — Heidi en fait partie. Écrivez son nom dans la conversation pour qu'elle réponde.",
    empty: "Vous n'êtes encore dans aucun groupe.",
    createTitle: "Ouvrir un groupe",
    createHint: "Donnez-lui un nom. Vous recevrez ensuite un lien à partager.",
    namePlaceholder: "p. ex. Mercredi soir",
    create: "Ouvrir",
    creating: "Ouverture …",
    open: "Ouvrir",
    members: "Membres",
    inviteTitle: "Inviter",
    inviteHint: "Qui a le lien entre. Ne le partagez que si vous le souhaitez.",
    copyLink: "Copier le lien",
    copied: "Copié",
    rotate: "Créer un nouveau lien",
    rotateHint: "L'ancien lien cesse aussitôt de fonctionner.",
    joinTitle: "Vous êtes invité",
    joinBody: "Connectez-vous pour participer.",
    join: "Participer",
    joining: "Un instant …",
    joinFailed: "Ce lien ne fonctionne plus.",
    full: "Ce groupe est complet.",
    signInFirst: "Connectez-vous pour utiliser les groupes d'étude.",
    composer: "Message au groupe",
    send: "Envoyer",
    heidiHint: "Écrivez « Heidi » pour qu'elle réponde.",
    notConfigured: "Les groupes d'étude ne sont pas encore configurés sur cette installation.",
    failed: "Cela n'a pas fonctionné. Réessayez.",
    back: "Retour à mon espace",
  },
};
