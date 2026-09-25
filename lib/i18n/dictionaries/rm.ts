import type { Dictionary } from "./de.ts";

/**
 * Rumantsch Grischun — the standardised written form.
 *
 * STATUS: written with care and NOT yet reviewed by a native speaker. Romansh
 * has roughly 40,000 speakers, every one of whom would see a machine-shaped
 * sentence immediately, and the idioms (Sursilvan, Vallader, Puter, Surmiran,
 * Sutsilvan) differ enough that Grischun is itself a compromise some readers
 * dislike. Shipping it unreviewed is a deliberate, stated trade: a fourth
 * national language present and imperfect beats absent. It is on the list to
 * be read by someone who actually speaks it.
 *
 * The assistant deliberately answers Romansh readers in German — see
 * EXPLANATION_LANGUAGE in locales.ts. A model generating Romansh linguistic
 * explanations would be inventing, at exactly the audience least willing to
 * forgive it.
 */
export const rm: Dictionary = {
  meta: {
    title: "Heidi — chapir il tudestg svizzer",
    description:
      "Chapir quai che vegn discurrì propi enturn Vus. Heidi decifrescha messadis reals, declera ils pleds che Vus na enconuschais anc betg e controllescha mintga resposta tenor furmas dialectalas veras. Nus cumenzain cun il tudestg da Turitg.",
  },

  language: {
    notYet: "Quest text n\u2019exista anc betg per rumantsch. Vus al legiais en",
    byDesign:
      "Quest text exista mo per tudestg ed englais: el sa drizza a persunas che vivan qua. Vus al legiais en",
  },

  nav: {
    home: "Cumenzament",
    chat: "Chat",
    organisations: "Per organisaziuns",
    speaking: "Discurrer",
    practice: "Exercizis",
    listen: "Tadlar",
    grammar: "Grammatica",
    dialect: "Idioms",
    essays: "Blog",
    paper: "White paper",
    roadmap: "Plan da viadi",
    changelog: "Register da midadas",
    vocabulary: "Vocabulari",
    situations: "Situaziuns",
    method: "Metoda",
    technology: "Tecnica",
    contribute: "Far part",
    about: "Davart nus",
    portal: "Mes intschess",
    settings: "Configuraziuns",
    privacy: "Protecziun da datas",
    impressum: "Infurmaziuns legalas",
    investors: "Investiders",
    groupUse: "Duvrar",
    groupLearn: "Emprender",
    groupPractise: "Exercitar",
    groupAbout: "Davart Heidi",
    skipToContent: "Al cuntegn",
    sections: {
      how: "Co quai funcziunescha",
      record: "Tge che nus din",
      who: "Tgi che stat davos",
    },
    contents: "Cuntegn",
    menu: "Menu",
    language: "Tscherner la lingua",
    langNational: "Linguas naziunalas",
    langDialect: "Dialect",
    langOther: "Autras linguas",
  },

  footer: {
    tagline: "Chapir il tudestg da Turitg, e lura far part.",
    place: "Chantun Turitg, Svizra",
    varietyName: "Turitgais",
    builtOn: "Fatg a Turitg.",
    sections: "Paginas",
    projectTitle: "Project",
    languageTitle: "Lingua",
    openSource: "Construì a la vista",
    openSourceNote: "Nus scrivain quai che nus emprendain — er quai che n'ha betg funcziunà.",
    rights: "Heidi, Turitg.",
  },

  home: {
    headline: "Chapir il tudestg svizzer. E lura scriver sco insatgi da qua.",
    sub: "Per tut quels che san gia tudestg e na chapeschan tuttina nagut a maisa.",
    dialectTitle: "Nus cumenzain cun Turitg",
    dialectBody:
      "Il tudestg svizzer n'è betg ina lingua, mabain ina famiglia. Oz sa Heidi propi bain il tudestg da Turitg, ed ella Vus al di pli gugent che far la finta da savair tut. Quai è er precis la raschun pertge che la controlla refusa furmas bernaisas: betg perquai che il bernais fiss fallà, mabain perquai che nus instruin en quest mument Turitg. Ulteriurs dialects vegnan — mintgin cun sias atgnas vuschs e sia atgna controlla.",
    dialectPlanned: "Planisà",
    dialectOthers: "Auters idioms",
    trustTitle: "Mintga lingia vegn controllada avant che Vus la vesais",
    trustBody:
      "In model da lingua al qual ins dumonda tudestg svizzer dat gugent bernais, e Vus n'avessas nagina pussaivladad da l'annotar. Tar Heidi na decida pia betg il model tge che è tudestg da Turitg: quai fa ina controlla cun reglas fixas, che Vus pudais exequir svess.",
    trustLink: "Empruvar la controlla",
    correspondencesTitle: "Ina dozena da reglas avran tschientinas da pleds",
    pillarsTitle: "Co che Heidi lavura",
    methodLink: "Tut la metoda",
    researchLink: "Tge che di la perscrutaziun",
    contributeTitle: "Nus tschertgain vuschs turitgaisas",
    contributeBody:
      "Mintga secunda da dialect che Vus vegnis a udir tar Heidi vegn d'ina persuna reala da Turitg. Sche Vus ans laschais registrar Vossa vusch, scrivai a nus.",
    contributeCta: "Far part",
  },

  chat: {
    learn: {
      title: "Emprender da quai",
      breakdownLabel: "Pled per pled",
      breakdown: "Explitgescha a mai «{text}» pled per pled.",
      similarLabel: "Sumegliant e cuntrari",
      similar: "Tge pleds da Turitg han in senn sumegliant sco «{word}» — e tge è il cuntrari?",
      storyLabel: "Curt text cun quai",
      story: "Scriva a mai in curt text en tudestg da Turitg cun «{word}», cun translaziun.",
      otherWaysLabel: "Ditg autramain",
      otherWays: "Co pon ins dir autramain «{text}» en tudestg da Turitg?",
      examplesLabel: "En autras frasas",
      examples: "Dà a mai trais ulteriuras frasas en tudestg da Turitg cun «{word}», mintgina cun translaziun.",
      aiNote: "Questas respostas scriva il model linguistic en il chat, controlladas per las furmas da Turitg.",
    },
    dock: {
      open: "Dumandar Heidi",
      close: "Serrar",
      title: "Heidi",
      lead: "Dumandai davart quai che Vus legiais — u encollai in messadi che Vus avais retschavì.",
      prompts: [
        "Co di jau per turitgais ch'jau vegn pli tard?",
        "Tge differenza dat i tranter il dialect e il tudestg scrit?",
        "Numnai mai trais pleds ch'jau aud qua mintga di.",
      ],
    },
    emptyTitle: "Dumandai Heidi",
    placeholder: "Encollai quai che Vus avais retschavì — u scrivai quai che Vus vulais dir.",
    composer: "Messadi a Heidi",
    saveWord: "Tegnair quest pled",
    savedWord: "Tegnì",
    send: "Trametter",
    thinking: "Heidi legia …",
    you: "Vus",
    exampleUnderstand: "Tge vul quai dir?",
    exampleCompose: "Scriver quai per mai",
    examples: [
      { kind: "dialect", text: "Im Kauz scho, hät mer nöd so gfalle. Du au?" },
      { kind: "compose", text: "Di ad els che jau arriv diesch minutas pli tard — amiaivlamain." },
      { kind: "dialect", text: "Häsch du am Samschtig scho öppis vor?" },
    ],
    glossTitle: "Pleds da tegnair",
    suggestionsTitle: "Per empruvar",
    sendThis: "Quai pudais Vus trametter",
    /**
     * The badge on a sendable line that is the WRITTEN standard rather than
     * dialect. The pair is the point: one to send a landlord, one to send a
     * friend, and no way to tell them apart without this.
     */
    writtenStandard: "tudestg scrit",
    copy: "Copiar",
    copied: "Copià",
    flagged: "Betg tudestg da Turitg:",
    checkedNote: "Naginas furmas dialectalas estras chattadas",
    mic: "Dictar",
    micStop: "Finir la registraziun",
    micListening: "Jau taidel …",
    micTranscribing: "Vegn transcrit …",
    micProblem: {
      mic: "Nagin access al microfon. Vus pudais adina tippar.",
      silence: "Nagut udì. Smatgai anc ina giada sin il microfon e discurri immediatamain.",
      unavailable: "Il dictat na funcziuna betg en quest navigatur. Vus pudais adina tippar.",
    },
    newChat: "Nova conversaziun",
    explanationsIn: "Decleraziuns per tudestg",
    notConfigured: "Il model da lingua n'è anc betg configurà sin questa installaziun.",
    unreachable: "Heidi n'è betg cuntanschibla. Controllai la connexiun ed empruvai danovamain.",
    stop: "Fermar",
    stopped: "Fermà. La resposta mesa è vegnida refusada — ella n'era anc betg controllada per las furmas da Turitg.",
    failed: "Heidi n'ha betg pudì respunder en quest mument. Empruvai danovamain en in mument.",
    cannotSeePicture:
      "Heidi na po betg leger maletgs en quest mument. Trametti il text, u collià in agen model che legia maletgs.",
    retry: "Danovamain",
    /**
     * The full-screen chat. Its own object so the homepage box — which shares
     * every other string in here — does not have to carry strings it never
     * renders.
     */
    full: {
      expand: "Ecran entir",
      title: "Chat",
      yourChats: "Vossas conversaziuns",
      noChats: "Anc naginas conversaziuns.",
      untitled: "Senza titel",
      rename: "Renumnar",
      save: "Memorisar",
      cancel: "Interrumper",
      delete: "Stizzar",
      deleteAsk: "Stizzar questa conversaziun?",
      deleteYes: "Stizzar definitivamain",
      onThisDevice: "Questa conversaziun exista mo en quest navigatur.",
      signInToKeep: "S'annunziar per la mantegnair",
      adoptTitle: "Mantegnair questa conversaziun?",
      adoptBody: "Vus avais scrit avant che Vus As essas annunziads. Heidi po memorisar questa conversaziun en Voss conto u la laschar qua en il navigatur.",
      adoptKeep: "Gea, memorisar",
      adoptDiscard: "La laschar qua",
      menuOpen: "Conversaziuns",
      menuClose: "Serrar",
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
      title: "Ed ussa?",
      reply: { label: "Scriver ina resposta", say: "Co respund jau a quai?" },
      grammar: { label: "La grammatica davos", say: "Declerai a mai la grammatica davos quai." },
      shorter: { label: "Pli curt", say: "Diai quai pli curt." },
      warmer: { label: "Pli chaud", say: "Diai quai in pau pli chaudamain." },
      firmer: { label: "Pli decis", say: "Diai quai pli decis — jau hai gia dumandà duas giadas." },
      formal: { label: "Pli formal", say: "Scrivai quai pli formalmain, per in messadi official." },
      casual: { label: "Pli simpel", say: "Diai quai pli liber, tranter amis." },
      simpler: { label: "Pleds pli facils", say: "Diai quai cun pleds pli facils." },
      decline: { label: "Refusar cortaisamain", say: "Scrivai quai sco ina refusa cortaisa." },
      apologise: { label: "Sa scusar", say: "Scrivai quai sco ina scusa." },
      thank: { label: "Engraziar", say: "Scrivai quai sco in engraziament." },
      ask: { label: "Dumandar puspè", say: "Formulai ina dumonda enavos — jau n'hai betg chapì dal tut." },
      swiss: { label: "En tudestg scrit", say: "Scrivai quai en tudestg standard svizzer, betg en idiom." },
    },
  },

  model: {
    attach: "Agiuntar ina maletg",
    attachNeedsKey: "Il model collià na sa betg leger maletgs",
    remove: "Allontanar",
    connectTitle: "Colliar Voss agen model",
    connectLead:
      "Heidi legia gratuitamain fotografias dal visur. Cun ina atgna clav API vegnan las respostas pli precisas — surtut tar in maletg cun bler text — e las dumondas van tras Voss purschider e betg tras il nos.",
    whyTitle: "Pertge n'è quai betg simplamain include?",
    whyBody:
      "Perquai che leger ina maletg custa, per mintga maletg. Pajar quai per tuts vuless dir far pajar Heidi. Uschia resta tut il rest gratuit, e tgi che vul dapli porta sia atgna clav.",
    safetyTitle: "Nua che Vossa clav va",
    safetyBody:
      "Ella resta en quest navigatur. Cun mintga messadi vegn ella tramessa a nus sur ina connexiun criptada, duvrada ina giada tar il purschider e lura abandunada. Nus n'la memorisain betg, nus n'la scrivain en nagin protocol e nus n'la returnain mai.",
    providerLabel: "Purschider",
    keyLabel: "Clav API",
    keyPlaceholder: "sk-…",
    modelLabel: "Model",
    getKey: "Obtegnair ina clav",
    test: "Colliar ed empruvar",
    testing: "Vegn controllà …",
    connected: "Collià",
    connectedWith: "Collià cun",
    failed: "Quai n'ha betg funcziunà",
    disconnect: "Allontanar la clav",
    canSee: "Po leger maletgs",
    textOnly: "Mo text",
    open: "Voss agen model",
    imageTooBig: "Questa maletg na sa betg vegnir duvrada.",
    imagesLabel: "Agiuntà",
  },

  pillars: [
    {
      title: "Chapir vegn l'emprim",
      body: "Tadlar avant che discurrer. En Svizra è chapir il dialect e respunder per tudestg standard ina moda cumpletta e respectada d'appartegnair. Ed i è er l'unica moda da betg perder l'exposiziun: uschespert ch'ins vesa che Vus avais difficultads, ins mida al tudestg standard.",
    },
    {
      title: "La vita reala è il program",
      body: "Naginas exercitaziuns inventadas. Il messadi arrivà questa damaun, la frasa udida a mezdi, la refusa che Vus stuais scriver — quai è il material. Heidi gida immediatamain e sa endamain quai che Vus n'avais betg savì.",
    },
    {
      title: "Mesirà, betg gamificà",
      body: "Naginas seriras, nagins puncts, naginas pertschientualas inventadas. Il numer che nus vulain Vus mussar è quant ch'e Vus chapis d'ina vusch turitgaisa nunenconuschenta — avant e suenter.",
    },
  ],

  method: {
    contents: "Sin questa pagina",
    title: "La metoda",
    lead: "Heidi è construida sin quai che la perscrutaziun mussa propi, e betg sin quai che sa vender bain sco curs da lingua. Quai maina a intginas decisiuns che paran l'emprim curiusas.",
    sections: [
      {
        title: "La trapla ord la quala Heidi Vus tira",
        body: "Vus emprendais tudestg, Vus turnais a Turitg e Vus constatais che quai na gida betg. A maisa vegn discurrì dialect, Vus na chapis quasi nagut, e damai ch'ins al vesa, mida mintgin polittamain al tudestg standard u a l'englais. Gist l'exposiziun che Vus fiss meglier vegn prendida davent perquai che Vus l'avessas basegns. Heidi è ina funtauna da dialect che na mida betg.",
      },
      {
        title: "L'exposiziun surpassa las reglas",
        body: "En il pli grond studi davart co che las glieud chapescha linguas datiers, contava la pura quantitad d'exposiziun dapli che mintga mesira da distanza linguistica. I na decida betg la gramatica, mabain quant che Vus avais udì. Heidi n'è pia betg ina seria da lecziuns, mabain in lieu nua che arriva cuntinuadamain dialect ver.",
      },
      {
        title: "Las reglas tutgan en la pratica, betg avant",
        body: "Chind, Huus, isch, guet — las reglas da tun èn realas ed utilas. Ma l'unic test net d'ina lecziun avant n'ha mussà nagin effect mesirabel. Quai che funcziunescha percunter cumprovadamain: dir a insatgi sin tge el duai tadlar, gist avant ch'el l'auda danovamain. Heidi mussa pia mintgamai ina regla, adina sper in pled concret.",
      },
      {
        title: "Il test è adina ina nova vusch",
        body: "S'adattar ad ina suletta persuna è simpel e na cumprova nagut. Quai che conta è sche l'emprendì passa ad ina vusch mai udida. Heidi exercitescha pia cun bleras vuschs e controllescha adina cun ina nunenconuschenta.",
      },
      {
        title: "Discurrer vegn l'ultim, e quai n'è betg ina mancanza",
        body: "Creschids cuntanschan darar ina pronunzia sco quella dals indigens en in segund dialect, ed en Svizra pesa quai main che quasi dapertut: chapir il dialect e respunder per tudestg standard è normal e respectà. Heidi na Vus venda pia betg il tadlar sco remedi per Vossa pronunzia — las cumprovas èn flaivlas.",
      },
    ],
    loopTitle: "Il ciclus",
    loopSteps: [
      "Vus retschavais insatge che Vus na chapis betg.",
      "Heidi al declera immediatamain — cumplettamain, betg sco engiavinaditsch.",
      "In u dus pleds restan, perquai ch'els èn vegnids declerads cur ch'els fageva basegns.",
      "Ils medems pleds turnan pli tard, en in'autra frasa.",
      "Ina giada Vus als scuntrais ordadora, e Heidi n'è betg là.",
    ],
    loopNote:
      "L'ultim punct è la finamira. La gronda part dals programs vul che Vus turnais. In product per emprender duess vulair che Vus al avais adina main basegns.",
  },

  research: {
    title: "Tge che di la perscrutaziun",
    lead: "Products per emprender linguas rimnan pseudoscienza perquai che «i dat in studi» daventa fitg spert «quai è cumprovà» e lura in product entir. Nus tegnain separà trais chaussas: quai ch'è segir, quai che nus supponain, e quai ch'è simplamain ina decisiun.",
    factTitle: "Segir",
    factNote: "Sin quai ans basain nus.",
    hypothesisTitle: "Ipotesa",
    hypothesisNote: "Plausibel, betg testà — e Heidi è l'apparat da mesirar.",
    decisionTitle: "Decisiun",
    decisionNote: "Decisiuns da product che restan gistas era sche l'ipotesa na tegna betg.",
    facts: [
      {
        claim: "L'exposiziun surpassa la distanza linguistica.",
        detail:
          "Sur 1833 taidlunzas e 70 pèrs da linguas contava l'exposiziun a la lingua testada dapli che la distanza lexicala, fonologica u ortografica.",
        source: ["gooskens-2018"],
      },
      {
        claim: "Exercitar cun bleras vuschs è quai che passa a vuschs nunenconuschentas.",
        detail:
          "Exercitar cun ina suletta vusch po dar meglras resultats gist sin quella vusch e na passa betg. Confermà specificamain per dialects regiunals.",
        source: ["lively-1993", "clopper-2004"],
      },
      {
        claim: "Dir sin tge tadlar è in ingredient activ, betg in ornament.",
        detail: "Medem material, medem resun: mo il gruppa avisada dal contrast relevant ha emprendì.",
        source: ["pederson-2010"],
      },
      {
        claim: "Rechattar cun resun surpassa il relegier.",
        detail: "222 studis, 48 478 emprendents; g ≈ 0,50, e 0,54 cun resun cunter 0,37 senza.",
        source: ["yang-2021"],
      },
      {
        claim: "Pratica distribuida surpassa la concentrada, e l'avantatg crescha cun il temp.",
        detail: "g ≈ 0,76 immediatamain, g ≈ 1,15 suenter in intervall, sur 48 experiments e 3411 persunas.",
        source: ["kim-webb-2022"],
      },
      {
        claim: "Sutstitels gidan — suenter l'emprova da tadlar, betg durant.",
        detail:
          "Grond effect sin il vocabulari (g ≈ 0,87), apparentamain perquai che il text gida a taglier il flum da tuns en pleds. In text adina visibel daventa ina grutscha.",
        source: ["montero-perez-2013"],
      },
      {
        claim: "Exercizi da tadlar meglierescha mo flaivlamain Vossa atgna pronunzia.",
        detail: "d ≈ 0,92 per la perceptziun, d ≈ 0,54 per la producziun, senza correlaziun tranter las duas.",
        source: ["sakai-moorman-2018"],
      },
      {
        claim: "Scriver en dialect è digitalmain normal en Svizra, betg giargun.",
        detail: "Perquai è «scriver sco insatgi da qua» ina cumpetenza vaira e betg in gieu.",
        source: ["whatsup-uzh"],
      },
    ],
    hypotheses: [
      {
        claim: "Reglas da consonantas predisan forsa meglier l'intelligibilitad che reglas da vocals.",
        detail:
          "Quai ch'è cumprovà: la distanza fonetica predi l'intelligibilitad meglier che la distanza lexicala. Las cifras precisas cun las qualas questa pagina cumparegliava consonantas e vocals, na vain nus betg pudì verifitgar en ina funtauna accessibla — perquai stat l'asserziun qua e betg sut «Cumprovà». Duas da noss quatter reglas sin la pagina principala èn reglas da vocals, e perquai la scumessa pli flaivla.",
        source: ["gooskens-2007"],
      },
      {
        claim: "Reglas da tun funcziuneschan sco indizi en la pratica er sch'ellas fallan sco lecziun.",
        detail:
          "L'unic test net da la furma «lecziun» — 50 minutas ollandais-fris — n'ha mussà nagin effect significativ, ed ils auturs sezs avertan da generalisar. Tut la tradiziun europeica da l'intercomprensiun è, tenor ils perscrutaders decisivs, praticamain betg evaluada. Nossa variante è pia quella betg testada. Perquai la mesirain nus.",
        source: ["bergsma-2014"],
      },
      {
        claim: "Ina curta adattaziun meglierescha mesirablamain la comprensiun d'ina vusch nunenconuschenta.",
        detail:
          "Quai ch'è segir suenter var ina minuta è ina pli gronda spertadad da lavurar — betg dapli pleds chapids. Nus na pretendain pia betg ch'ina minuta Vus fa chapir dapli.",
        source: ["clarke-garrett-2004"],
      },
    ],
    decisions: [
      "Tadlar avant scriver avant discurrer — motivà da la situaziun linguistica, betg mo da las cumprovas.",
      "Mesirà enstagl da gamificà. Naginas seriras, nagins puncts.",
      "La vusch da test è adina ina che Vus n'avais betg udì.",
      "Registraziuns turitgaisas veras, perquai che mintga corpus turitgais disponibel è licenzià mo per la perscrutaziun.",
      "Il model na giuditgescha mai ses agen dialect.",
    ],
    honestyTitle: "Nua che nus ans avain curregì",
    honestyBody:
      "Questa pagina ha ina giada ditg che la furma «lecziun» da las reglas da tun saja vegnida «testada e n'haja betg funcziunà». In sulet studi da 50 minutas na porta betg quel pais, ed i fascheva parair nossa atgna variante cumprovada, cunquai ch'ella è quella betg testada. Ella ha er ditg ch'i na dettia nagina sintesa vocala tudestg-svizra da cumprar; quai n'è betg pli vair.",
  },

  check: {
    title: "Controlla dal dialect",
    intro: "Ina glista fixa da reglas — betg in model linguistic. Ella controllescha mintga lingia che Heidi As mussa. Qua pudais Vus la laschar currer sezs.",
    placeholder: "Das isch nid güet, gäu",
    button: "Controllar",
    failed: "La verificaziun n'era betg cuntanschibla. Empruvai anc ina giada.",
    ok: "Naginas furmas estras chattadas. Quai po passar sco tudestg da Turitg.",
    okShort: "Net",
    failShort: "Chattà",
    suggests: "meglier",
    whyTitle: "Pertge che quai n'è betg ina bagatella",
    whyBody:
      "Furmas bernaisas, basilaisas e da la Svizra orientala èn pleds perfetgamain correct — mo betg qua. Tgi che emprenda il tudestg da Turitg na po, per definiziun, betg udir la differenza. Gist perquai na dastga quella decisiun betg esser tar in model da lingua.",
    noteTitle: "Davart l'ortografia",
    noteBody:
      "Il tudestg da Turitg n'ha nagina ortografia uffiziala. Questa controlla na Vus di mai che Vossa scrittira saja fallida — mo ch'ina furma vegn d'ina autra regiun.",
  },

  technology: {
    title: "Tge ch'in computer sa far cun il tudestg svizzer",
    lead: "E tge ch'el na sa betg far. Questa pagina rimna quai ch'è vairamain vegnì mesirà en quest champ — cun las cifras e las funtaunas, per che Vus possias controllar nossas affirmaziuns.",
    hardTitle: "Pertge ch'i è grev",
    hardBody: [
      "I n'exista nagina ortografia uffiziala. I dat recumandaziuns dal 1938 che la dialectologia dovra — ma era transcriptuors scolads las applitgeschan differentamain, e quasi nagin na scriva uschè ad ina amia.",
      "Ins discurra il dialect, ins scriva il tudestg standard. Scriver giu quai ch'è vegnì ditg n'è perquai betg ina transcripziun, mabain ina translaziun — ed uschè è construì quasi tut quai ch'exista.",
      "Ed i è ina pitschna lingua en il senn da las datas: las pli grondas collecziuns publicas èn intgins tschient uras, e quasi tuttas èn mo licenziadas per la perscrutaziun.",
    ],
    corporaTitle: "Danunder che las datas vegnan",
    corporaLead: "Las collecziuns publicas sin las qualas quest champ sa basa. La colonna «direcziun» è la pli impurtanta: quasi tut auda dialect e scriva standard.",
    asrTitle: "Chapir",
    asrLead: "Quota d'errurs da pleds sin il medem set da test, per che las cifras sajan cumparegliablas. Tut quests sistems produceschan tudestg standard — la cifra di quant bain ch'i è vegnì translatà, betg quant bain ch'i è vegnì scrit en dialect.",
    speakingTitle: "Discurrer",
    speakingLead: "Qua engianna il martgà. Quai che vegn vendì sco vusch «tudestga svizra» è per il pli tudestg standard svizzer — la lingua scritta, legida ad auta vusch. Vaira sintesa dialectala exista quasi mo en la perscrutaziun.",
    modelsTitle: "Models da lingua",
    modelsLead: "Sch'in model domina propi il dialect, u sche quai stat mo en la communicaziun a la pressa. «Evaluà» vul dir ch'insatgi l'ha mesirà e publitgà.",
    heidiTitle: "Tge che quai munta per Heidi",
    heidiBody: [
      "Il dictar na scriva betg il dialect. El scriva quai che Vus vulais dir, en la lingua che Vus avais gia — precis quai che la perscrutaziun sa far.",
      "Heidi legia ad aut, ma na pretenda mai da discurrer il dialect. In sintetisader dumandà per turitgais dat al pli tudestg standard svizzer — uschè di la vusch tge ch'ella è, e tascha plitost che dar a Vus ina vusch englaisa che legia Züritüütsch.",
      "La controlla dal dialect funcziuna senza model. Ella è ina glista fixa da reglas, betg in model da lingua — perquai na po ella betg cumenzar ad inventar.",
    ],
    engineTitle: "Tge model che Vus respunda",
    engineLead:
      "Legì da la chadaina che prenda propi la dumonda, betg d\u2019ina frasa scritta ina giada. Perquai na po qua betg star in model ch\u2019è gia ditg ora d\u2019adiever.",
    engineNotes: [
      "L\u2019urden n\u2019è nagina classificaziun. La chadaina è ordinada tenor sparsadad: tgi che ha la pli pitschna capacitad vegn duvrà sco davos. Il emprim è quel che ha plaz oz, betg il meglier.",
      "Nagin da quests models è l\u2019autoritad per il turitgais. Quai è il pack. Mintga lingia generada passa ina controlla a reglas avant che insatgi la vesa — e quella controlla n\u2019è sezza nagin model.",
      "Senza clav u senza contingent responda la via 503 e di quai. Ella na fa betg sco sch\u2019ella avess ina resposta.",
    ],
    directionLabel: "Direcziun",
    directions: {
      "speech-to-standard": "dialect udì → standard scrit",
      "speech-to-dialect": "dialect udì → dialect scrit",
      "dialect-text": "dialect, scrit",
      "text-to-speech": "text → dialect discurrì",
    },
    hours: "uras",
    speakers: "pledaders",
    regions: "regiuns",
    licence: "licenza",
    licences: { research: "mo perscrutaziun", unpublished: "nagina licenza publitgada", textOnly: "text; audio sin dumonda" },
    wer: "quota d'errurs da pleds",
    zeroShot: "senza training",
    fineTuned: "reexercità",
    speakingNames: {
      swissVendors: "Purschiders svizzers cun purschida da dialect",
      commercial: "Vuschs commerzialas «de-CH»",
      eth: "ETH Turitg, Swiss Voice",
      vits: "T5 e VITS, pipeline da perscrutaziun",
      voiceCloning: "Clonaziun da vusch da podcasts",
    },
    weightsOpen: "pais publitgads",
    weightsClosed: "pais betg publitgads",
    isDialect: "dialect",
    isStandard: "tudestg standard svizzer",
    evaluated: "dialect evaluà",
    notEvaluated: "dialect betg evaluà",
    statusResearch: "perscrutaziun",
    statusService: "servetsch",
    statusClosed: "serrà",
    evalTitle: "Tge che Heidi mesira cura che Vus discurris",
    evalLead:
      "L'exercizi da discurrer Vus registrescha e rapporta quai che sa mesirar propi — ed di en tge lingua. Naginas notas sin tschient, nunenqualbop.",
    evalNames: {
      delivery: "Flum da discurrer",
      fluency: "Tempo e sequenzas",
      words: "Pleds e furmas",
      grammar: "Grammatica",
      pronunciation: "Nota da pronunzia",
    },
    evalWhat: {
      delivery:
        "Nua ch'i dava tun e nua betg: pausas, quant ditg ch'è stada la pli lunga, quanta part da la registraziun che Vus avais propi discurrì. Quai na dumonda nagina transcripziun ed funcziuna perquai er per in dialect che nagut sa scriver.",
      fluency:
        "Silbas per secunda, e quant ditg che Vus discurris avant che ferman. Fluenza en il senn da la perscrutaziun — co ch'in patratg vegn ora, betg quant bain ch'el suna.",
      words:
        "Tge pleds che Vus avais tschernì, controllads cun la medema glista fixa da reglas sco la controlla dal dialect. Betg l'opiniun d'in model.",
      grammar:
        "Concordanza, cas, furmas verbalas. Mo d'ina transcripziun en la lingua che Vus avais propi discurrì — uschiglio pertutga la correctura pleds ch'il computer ha inventà.",
      pronunciation:
        "Na vegn betg producida. Ina nota cunter in ideal da lingua materna è in giudicament davart ina persuna, e nagina meglierament da la renconuschientscha la fiss onesta.",
    },
    evalVerdicts: {
      target: "en il dialect",
      bridge: "en tudestg standard svizzer",
      none: "anc betg pussaivel",
      refused: "intenziunadamain betg offrì",
    },
    evalRefusedNote:
      "Exact cun quai fa reclama mintga concurrent. Quai è la lingia che nus laschain vida cun intenziun.",
    evalFormLimit: "naginas furmas giuditgadas sur",
    evalSource: "en il code",
  },

  privacy: {
    title: "Tge che capita cun Voss pleds",
    lead: "Heidi legia messadis che persunas èn s'inviadas. Quai è sensibel, perquai di questa pagina exactamain tge che resta nua, e tgi auter che al vesa.",
    bindingNote: "Decisiva è la versiun tudestga.",
    flowsTitle: "Tge che resta, e nua",
    flowsLead: "Mintga lingia numna il lieu da memorisaziun, per che Vus al pudais controllar sezs.",
    detail: {
      pictures: "rimpitschentada en il browser; mo in dumber vegn memorisà",
      speakingTranscription: "mo sche Vus tschernis il tudestg standard; l’audio na salvain nus betg, e la grammatica vegn controllada sin noss agen server",
      speakingSuggestion: "mo la frasa che Vus avais confermà",
      account: "mo l\u2019identificatur — nagin num e nagina adressa",
    },
    place: { device: "Mo sin Voss apparat", server: "Sin noss server", vendor: "Tar in purschider" },
    col: { what: "Tge", where: "Nua", who: "Tgi auter al vesa" },
    nobody: "nagin auter",
    flows: {
      draftConversation: "Conversaziun senza conto",
      savedConversation: "Conversaziun cun conto",
      savedWords: "Pleds tegnids",
      practiceSeen: "Dumondas gia ponidas",
      practiceModel: "Tge che vus exercitais anc",
      streak: "Vossa seria e Voss finamira da l'emna",
      roadmapFeedback: "Voss vuschs, commentaris e propostas davart il plan",
      syncSetting: "Sch’il navigatur sincronisescha",
      syncOthers: "Voss progress d’auters apparats",
      progressSync: "Progress sincronisà (mo sch’activà)",
      certificates: "Voss attestats",
      ownKey: "Vossa atgna clav API",
      theme: "Apparientscha clera u stgira",
      dictationVerdict: "Sche la dictaziun funcziunescha en quest browser",
      dictation: "Dictar",
      pictures: "Maletgs",
      speakingTakes: "Registraziuns da discurs",
      speakingTranscription: "Registraziun tramessa per vegnir transcritta",
      speakingSuggestion: "Frasa tramessa per controlla",
      account: "Conto",
      groups: "Gruppas d'emprender",
      feedback: "Fanestra da resposta",
    },
    hostingTitle: "Nua ch'il server stat",
    hostingNote: "Betg en Svizra. Nus al disain pli gugent sezs che Vus al chattais ora.",
    vendorsTitle: "Tgi che responda ils messadis",
    vendorsNote: "In messadi vegn tramess ad ina da questas interpresas per vegnir respundì. Nus n'avain nagin contract da tractament cun nagina d'ellas. Heidi n'è perquai oz betg adattada per datas persunalas d'ina professiun cun secret professiunal.",
    broughtKeyNote: "Cun ina atgna clav va il messadi al purschider che Vus tscherni.",
    notDoneTitle: "Tge che nus na faschain betg",
    notDone: {
      analytics: "Nagins utensils d'analisa",
      advertising: "Nagina reclama",
      profileSale: "Nagina vendita da datas",
      trackingCookies: "Nagins cookies da persecuziun",
    },
    notDoneNote: "Controllabel: il code è avert, ed in test tegna questa decleraziun actuala.",
    rightsTitle: "Stizzar",
    rightsBody: "Quai ch'è sin Voss apparat stizzais Vus sezs en las preferenzas. Conversaziuns memorisadas stizzais Vus en il chat, ed il text va propi davent. Per tut il rest scrivai a nus.",
    contactTitle: "Contact",
    updatedLabel: "Stadi",
  },

  impressum: {
    title: "Infurmaziuns legalas",
    operatorLabel: "Gestì da",
    contactLabel: "Contact",
    sourceLabel: "Code da funtauna",
    statusLabel: "Furma giuridica",
    statusNote: "Heidi n'è nagina interpresa registrada. La pagina vegn gestida privatamain ed il code è avert.",
    addressNote: "Nus numnain in'adressa postala uschespert ch'i dat ina.",
  },

  contribute: {
    title: "Nus tschertgain vuschs turitgaisas",
    lead: "Mintga secunda da dialect che Vus vegnis a udir tar Heidi vegn d'ina persuna reala da Turitg. Quai è char e plaun, e nus al fain tuttina.",
    whyTitle: "Pertge betg simplamain vuschs sinteticas",
    whyBody:
      "La raschun onesta n'è betg ch'i na dettia nagina sintesa vocala tudestg-svizra — ussa i dat. La raschun è la licenza. Mintga corpus da lingua turitgaisa che nus avain chattà è publitgà per la perscrutaziun e betg per in product. Tgi che ha basegns da ver tudestg da Turitg, licenzià net e cun consentiment, sto al registrar sez. Plinavant vegn quai che vuschs sinteticas fan mal tuttina: il ritmus, ils pleds mangiads, l'exitaziun, la differenza tranter duas persunas dal medem quartier.",
    needTitle: "Tge che nus avain basegns",
    needList: [
      "Persunas creschidas en il chantun Turitg, u che vivan qua dapi ditg.",
      "Frasas dal tuttafatg ordinarias — betg leger literatura.",
      "Differentas etads, geners, quartiers e spertadads da discurrer.",
      "Ventg minutas da Voss temp, tar Vus u tar nus.",
    ],
    rolesTitle: "Quatter modas da far part",
    rolesLead:
      "Ordinadas tenor engaschament, la pli pitschna l\u2019emprima — e quella è quella che vala il pli per nus. Mintgina di tge ch\u2019i dat gia oz en il product.",
    todayLabel: "Sco ch\u2019i stat",
    roleCta: "Scrivai a nus davart quai",
    roleSee: "Guardar",
    learnerTitle: "E sche Vus emprendais",
    consentTitle: "Tge che capita cun la registraziun",
    consentBody:
      "Il control resta tar Vus. Nus Vus din ordavant per tge che la registraziun vegn duvrada, Vus la pudais retrair, ed il consentiment per il product n'è betg quel per la perscrutaziun. Nus supponain che Vus na vulais betg il segund, uschè ditg che Vus nal dis betg explicitamain.",
    ctaTitle: "Scrivai a nus",
    ctaBody: "In curt messadi basta. Din a nus da tge part dal chantun che Vus vegnis.",
    ctaButton: "Scriver in e-mail",
  },

  about: {
    title: "Davart Heidi",
    lead: "Heidi vegn fatga a Turitg, da glieud ch'ha gì il medem problem. Nus construin a la vista — er las parts che n'han betg funcziunà.",
    sections: [
      {
        title: "Pertge ch'i dat quai",
        body: "Perquai che fitg bleras persunas qua fan il medem viadi: emprender tudestg, turnar qua, e lura constatar che la part decisiva da la lingua na vegn scritta nunloc. Quai n'è betg in problem da nischa, mabain l'experientscha ordinaria da questa citad.",
      },
      {
        title: "Co che nus lavurain",
        body: "Nus avain l'emprim legì tge che di la perscrutaziun, e mo lura construì. Trais resultats han ruinà il plan che nus avessan uschiglio realisà. Quai che nus avain emprendì sa chatta sin la pagina da perscrutaziun — cumpigliads ils lieus nua che nus ans avain stuì curreger publicamain.",
      },
      {
        title: "Tge che manca anc",
        body: "Oz: chapir e respunder a text ver, udir ina resposta legida ad auta vusch, ed in register da nua ch'il dialect vegn propi discurrì en radio e televisiun. Lura: il laboratori da tadlar, nua che Vus udis ina vusch turitgaisa, Vus Vus adattais, e nus mesirain quant che Vus chapis d'ina autra. Quai dumonda registraziuns, ed ellas vegnan fatgas.",
      },
    ],
    stateTitle: "Nua che nus essan",
  },

  settings: {
    appearanceTitle: "Apparientscha",
    appearanceBody: "Cler, stgir, u sco Voss apparat è endrizzà. La tscherna resta en quest navigatur.",
    theme: { label: "Apparientscha", system: "Apparat", light: "Cler", dark: "Stgir" },
    title: "Configuraziuns",
    lead: "Tut quai che Heidi sa da Vus, en in sulet lieu — e tut sa vegnir allontanà.",
    languageTitle: "Lingua da la pagina",
    languageBody: "En tge lingua che Heidi discurra cun Vus. Quai che Vus emprendais resta il tudestg da Turitg.",
    modelTitle: "Model da lingua",
    modelBody: "Da standard dovra Heidi models gratuits che san leger maletgs. Ina atgna clav renda las respostas pli precisas.",
    modelNone: "Nagin agen model collià",
    accountTitle: "Conto",
    accountBody: "Per tegnair Voss pleds e per gruppas da studi. Per translatar na dovrais Vus nagin conto.",
    dataTitle: "Tge che resta sin quest apparat",
    dataBody:
      "Vossa conversaziun resta en quest navigatur — era suenter avair serrà il tab — fin che Vus smatgais Nova conversaziun. Cun conto vegn ella memorisada sin noss server. Per vegnir respundì va mintga messadi ad in purschider da models. Vossa clav ed ils pleds tegnids restan mo qua.",
    dataEmpty: "Quest navigatur na cuntegna nagut da Vus.",
    dataForget: "Stizzar",
    dataExport: "Telechargiar tut",
  },

  auth: {
    sections: {
      focus: "Nua che vus restais tatgads",
      mastered: "Quai che tegna",
      review: "Repeter",
      recent: "Conversaziuns",
      patterns: "Structuras",
      words: "Pleds",
      groups: "Gruppas",
      onward: "Vinavant",
    },
    menu: {
      portal: "Voss pleds e Vossas conversaziuns",
      settings: "Lingua, model, conto",
    },
    signIn: "S'annunziar",
    signOut: "Sa deconnectar",
    signInWith: "S'annunziar cun OrangeCat",
    account: "Conto",
    portalTitle: "Mes intschess",
    portalLead:
      "Voss pleds, cura ch'igl è ura da revair els — e quai che As ferma il pli savens.",
    signedInAs: "Annunzià sco",
    notSignedIn: "Vus n'essas betg annunzià",
    notSignedInBody:
      "Annunziai Vus, uschè che Heidi po sa regurdar da quai che Vus n'avais anc betg savì. Tut il rest funcziunescha vinavant senza — la translaziun e la controlla dal dialect na dumondan nagin conto.",
    whyTitle: "Pertge OrangeCat",
    whyBody:
      "Heidi na tegna nagina atgna banca da datas d'utilisaders. Vossa identitad viva tar OrangeCat, nua che profils e pajaments èn gia a chasa. Quai vul dir in sulet conto per plirs products, nagin pled-clav supplementar — e qua nagut che pudess vegnir engulà.",
    soonTitle: "Tge che vegn suenter",
    soonList: [
      "Tutuors — voluntaris, pajads, e mai obligatoris.",
    ],
    unavailable: "L'annunzia n'è anc betg configurada sin questa installaziun.",
    errorTitle: "L'annunzia n'ha betg funcziunà",
    errorBody: "Insatge è ì mal. Empruvai danovamain, u turnai al cumenzament.",
    tryAgain: "Empruvar danovamain",
  },

  vision: {
    title: "Nua che quai maina",
    lead: "Il tudestg svizzer è il cumenzament, betg la finamira. La metoda n'è betg specifica per la Svizra.",
    points: [
      {
        title: "I dat bleras linguas da quest gener",
        body: "Dapertut sin il mund datti linguas e dialects memia pitschens per ch'in grond editur da curs s'interessia per els — e che èn al medem mument precis quai ch'ins sto savair per appartegnair propi. Ins po dominar perfetgamain la lingua uffiziala e restar tuttina ordadora, a maisa.",
      },
      {
        title: "Gist qua fallan ils gronds purschiders",
        body: "Curs da linguas suondan il martgà, ed il martgà suonda il dumber da persunas che discurran. Quai che resta èn intgins vocabularis, intgins corpora da perscrutaziun ch'ins na dastga betg duvrar commerzialmain, e naginas registraziuns per exercitar. Heidi è construida per quella largezza.",
      },
      {
        title: "La metoda sa transferir",
        body: "Creschids che dominan gia ina lingua parentada na ston betg cumenzar da nov — els ston reemprender quai ch'els han gia. Quai vala per il tudestg standard ed il tudestg da Turitg sco per bleras autras pèrs. Perquai è tar Heidi la lingua instruida ina configuraziun substituibla e betg insatge scrit en il code.",
      },
    ],
    closing:
      "Concretamain: l'emprim ulteriurs dialects tudestg-svizzers, lura ina lingua ordaifer la Svizra — la medema maschina, in auter pachet linguistic. La mesadad discurrida viagia cun nus: mintgina da questas linguas vegn udida bler pli savens che scritta, e per mintgina datti medias che nagin n'ha tschernì tranter dialect e lingua standard. Quai che nus emprendain sin la via, quai scrivain nus.",
  },

  voice: {
    speak: "Leger ad auta vusch",
    stop: "Fermar",
    unsupported: "Quest navigatur na po leger nagut ad auta vusch.",
    claim: {
      swissStandard: "Vusch en tudestg standard svizzer — betg en dialect turitgais.",
      german: "Ina vusch da la Germania. Voss apparat n'ha nagina svizra.",
      none: "Quest apparat n'ha nagina vusch tudestga. Heidi taschai plitost che leger tudestg cun ina bucca englaisa.",
    },
    dialectCaveat:
      "Ina maschina legia ina ortografia dialectala cun ina vusch da tudestg standard. Bun per chattar il pled en la frasa, mai per surpigliar la pronunzia.",
    settingsTitle: "La vusch da Heidi",
    settingsBody:
      "Nagut vegn ditg avant che Vus giavischais quai. Nagin navigatur porta ina vusch turitgaisa — il pli datiers ch'in apparat offra è il tudestg standard svizzer, e Heidi di mintga giada tge che Vus udis.",
    speakAnswers: "Leger las respostas ad auta vusch",
    rate: "Spertadad",
    correctionTitle: "Correcturas",
    correctionBody:
      "Quant che Heidi di davart ils pleds d'in exercizi da discurrer, suenter che Vus avais scrit quai che Vus avais ditg. Mai davart Vossa ortografia: il turitgais n'ha nagina scrittira gista, uschia n'i è nagut da far fallà — e mai davart quai che Vus tippais en il chat, perquai ch'ina messadi che insatgi auter As ha tramess para exact sco ina da Vus.",
    correctionLevels: {
      off: "Na dir nagut",
      blocking: "Mo quai che n'è betg tudestg svizzer",
      all: "Er formas d'in auter dialect",
    },
    correctionHelp: {
      off: "Heidi responda e lascha star Voss pleds.",
      blocking: "L'endrizzament usual. Chaussas che nagin Svizzer scriva, sco il ß.",
      all: "Agiunta il bernais ed autras regiuns — pleds vairs, al lieu fallà.",
    },
    silence: {
      off: "Las correcturas èn deactivadas.",
      spoken:
        "Heidi na curregia betg quai ch'è ditg a bucca. Quai che la renconuschientscha vocala dat enavos è sia scrittira e betg la Vossa — ella scriva tudestg standard, tge che Vus avais era ditg. Ella signalar vuless dir curreger la maschina e Vus la far pajar.",
      clean: "Nagut da signalar.",
    },
    cannotHear:
      "Sche Vossa pronunzia è gista na po Heidi betg dir. Oz na po quai nagut da maniera fidada. Quai ch'ella po: Vus chapir e respunder.",
  },

  listening: {
    title: "Nua udir quai",
    lead: "La Svizra fa fitg bler radio, televisiun e film en dialect, la gronda part gratuitamain. Mo nagin di ad in emprendider tge ch'è propi dialect — perquai è quai qua la emprima chaussa che mintga endataziun di.",
    todayTitle: "Sche Vus avais ventg minutas",
    todayBody:
      "Trais per cumenzar, damaun auters. In da mintga gener, il pli lom l'emprim, e tuts van era ordaifer la Svizra — in catalog di tge ch'i dat, e quai n'è betg il medem sco dir tge far uss.",
    diglossiaTitle: "La mesadad dals medias svizzers n'è betg dialect",
    diglossiaBody:
      "Las novitads da la saira vegnan legidas en tudestg standard; il magazin suenter va en dialect. In'ura cun la Tagesschau è in'ura en il tudestg che Vus avais gia.",
    basisNote:
      "Las etichettas derivan dal format da mintga emissiun. Nagin qua ha tadlà tut e notà tge ch'el ha udì — igl èn perquai conclusiuns attentas e betg mesiraziuns, e quai resta scrit enfin che insatgi fa quella lavur.",
    spoken: { dialect: "Dialect", standard: "Tudestg standard svizzer", mixed: "Omadus" },
    voices: { one: "Ina vusch", few: "Paucas vuschs", many: "Bleras ensemen" },
    subtitles: {
      standard: "Suttitels en tudestg standard",
      auto: "Suttitels automatics",
      none: "Nagins suttitels",
    },
    scripted: "Legì d'in text",
    spontaneous: "Discurrì liber",
    reachCh: "Va mo en Svizra",
    about: "Da tge ch'i sa tracta",
    medium: {
      podcast: "Podcasts",
      radio: "Radio",
      youtube: "YouTube",
      tv: "Televisiun",
      series: "Seria",
      film: "Films",
    },
    filmsTitle: "Tge dialect che Vus vegnis ad udir",
    filmsBody:
      "Il film svizzer n'è betg in singul accent. Mintga endataziun di da tge regiun dialectala ch'ella vegn, uschia pudais Vus tscherner tranter quai che vegn discurrì enturn Vus e quai che Vus inscuntrais en il tren. Berna è ferm represchentada perquai che la gronda part da la finziun svizra vegn fatga là — ed ils films turitgais existan, ed els èn qua.",
    commentary: {
      "der-bestatter":
        "Bernais, e la seria che qua han vis bunamain tuts — il dialect ch'in Svizzer imitescha sche Vus al dumandais d'imitar in accent.",
      "wilder":
        "In criminal sur pliras stagiuns e pliras regiuns dialectalas. Bun per udir che il tudestg svizzer n'è betg ina singula chaussa.",
      "tschugger":
        "Vallesan, per il qual auters Svizzers dovran suttitels. In spass tranter Svizzers — e propi betg in cumenzament.",
      "neumatt":
        "Bernais, ina famiglia da purs. Il tun da dispitas en famiglia, betg quel da la televisiun.",
      "die-schweizermacher":
        "Turitgais dal 1978, e adina anc il film davart il daventar Svizzer. L'accent sa ha midà dapi lura, quai ch'è sez da udir.",
      "mein-name-ist-eugen":
        "Bernais, e per gronda part uffants che discurran — pli plaun e pli cler ch'in dialog d'aduts.",
      "der-goalie-bin-ig":
        "Bernais dens, d'in roman scrit en quella lingua. Il titel è ina lecziun da grammatica: il verb è `bin` ed il pronom vegn a la fin.",
      "achtung-fertig-charlie":
        "Cumedia militara, e la referenza cuminaivla da bunamain mintga Svizzer sut tschuncanta.",
      "bon-schuur-ticino":
        "Ina cumedia che ha sco premissa la dumonda linguistica sezza — tge che capita sche il pajais sto tscherner ina.",
      "die-goettliche-ordnung":
        "Appenzell il 1971, dunnas che cumbattan per il dretg da votar. Dialect da la Svizra orientala, ed in toc istorgia che Vus vegnis dumandads: Appenzell Dadens ha laschà las dunnas a sia Landsgemeinde pir il 1990, ditg suenter la fin dal film.",
      "zwingli":
        "La refurma turitgaisa, en turitgais. In dals paucs films da lunghezza en la varietad che vegn propi instruida qua.",
      "wolkenbruch":
        "Turitgais cun jiddic dasperas — ina segunda lecziun davart quant datiers che duas linguas pon star e restar duas.",
      "platzspitzbaby":
        "Turitgais, ils onns da l'eroina en la citad vis d'in uffant. Tema dir, pronunzia nunusitadamain clera.",
      "heidi-2015":
        "Fatg per uffants, perquai discurrì plaun e simpel. Probablamain il film il pli simpel da questa glista — situà en il Grischun senza discurrer ses dialect.",
      "seitentriebe":
        "Tudestg svizzer da mintgadi tranter pèrs — las mesas frasas e las interrupziuns che la lingua da televisiun stira ora.",
    },
  },

  errors: {
    notFoundTitle: "Questa pagina n'exista betg",
    notFoundBody: "Forsa è il link vegl, forsa avain nus spustà insatge.",
    backHome: "Turnar al cumenzament",
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
    keptTitle: "Pleds tegnids",
    keptNone: "Tuccai + per tegnair in pled. Heidi Vus dumonda pli tard.",
    keptSome: "en repetiziun",
    practise: "Repeter ussa",
    askLabel: "Mussar en ina frasa",
    askSay: "Mussai mai «{word}» en duas frasas curtas dal mintgadi.",
    title: "Ils pleds ils pli utils",
    lead: "Betg ils pleds per turists, mabain quels vi dals quals ina frasa resta tacca: ils curts, ils constants, quels che nagina regla da correspundenza na tira ora.",
    note: "Direcziun: idiom → tudestg. Qua sa tracti da chapir, betg da scriver — quai che Vus duessas scriver sez stat tar ils idioms.",
    groups: {
      function: "Pleds pitschens, grond effect",
      verbs: "Verbs che returnan adina",
      everyday: "Mintgadi",
      greetings: "Salids e curtaschia",
      helvetisms: "Pleds che Vus crajais da enconuscher gia",
      slang: "Lingua populara e grossa",
    },
    register: { casual: "familiar", rude: "grond" },
    mistakenForLabel: "Betg: {assumed}",
    articleLabel: "Artitgel",
    formsLabel: "Formas",
    exampleLabel: "En ina frasa",
    filterLabel: "Filtrar ils pleds",
    filterPlaceholder: "Tippai en dialect u en tudestg …",
    noMatches: "Nagin pled na correspunda.",
    clearFilter: "Stizzar",
    practiseGroup: "Exercitar quest grupp",
    jumpLabel: "Ir a",
    saidInTitle: "Ditg en",
  },

  roadmapFeedback: {
    needed: "Jau dovr quai",
    notNeeded: "Betg per mai",
    tally: "{needed} dovran quai, {notNeeded} betg",
    comments: "Commentaris",
    commentPlaceholder: "Tge manegiais Vus?",
    send: "Trametter",
    noComments: "Anc nagins commentaris.",
    suggestTitle: "Manca insatge?",
    suggestPlaceholder: "Proponai ina funcziun",
    suggest: "Proponer",
    similarTitle: "Insatgi ha gia proponì insatge sumegliant:",
    support: "Jau era",
    supported: "Dumbrà",
    postAnyway: "Mia è autra — trametter tuttina",
    thanks: "Grazia — quai è sin la glista.",
    failed: "Quai n’ha betg funcziunà. Empruvai anc ina giada.",
    refused: "Scrivai ina frasa, cun maximalmain in link.",
    intro: "Mussai a nus, sche Vus duvrais mintga punct, e proponai tge che manca — senza conto.",
    changelogIntro: "Vus pudais commentar mintga midada — senza conto.",
  },
  sync: {
    title: "Il progress sin tut ils apparats",
    body: "Voss exercizis, vossa seria e voss pleds memorisads vegnan sincronisads tranter voss apparats annunziads. Deactivà resta tut mo en quest navigatur.",
    signInFirst: "S’annunziai per avair voss progress sin tut ils apparats.",
    turnOn: "Activar",
    turnOff: "Deactivar",
    on: "Activà — quest navigatur sincronisescha cun voss auters apparats.",
    deleteAll: "Stizzar tut quai ch’è sincronisà",
    deleted: "Stizzà. Sin il server na resta nagut pli da voss progress.",
    failed: "Quai n’ha betg funcziunà. Empruvai anc ina giada.",
  },
  certificate: {
    title: "Attestat",
    get: "Emetter l’attestat",
    getting: "Vegn controllà …",
    view: "Guardar l’attestat",
    syncFirst: "S’annunziai ed activai «Il progress sin tut ils apparats» en las configuraziuns. L’attestat vegn emess sin il server a basa da voss progress sincronisà, betg da quest navigatur.",
    notYet: "Sin il server èn per ussa {held} da {total} frasas segiras — la sincronisaziun suonda. Empruvai anc ina giada en ina minuta.",
    failed: "Quai n’ha betg funcziunà. Empruvai anc ina giada.",
    holder: "Tgi che posseda quest attestat",
    statement: "ha chapì repetidamain, en la situaziun «{scene}», mintga da las {total} frasas che Heidi dumonda.",
    measured: "{held} da {total} frasas segiras, {stuck} da quellas danovamain suenter ina pausa.",
    issued: "Emess ils {date}",
    idLabel: "Nr. da l’attestat",
    method: "Uschia controllescha Heidi",
    scope: "In attestat da chapientscha auditiva en ina situaziun — betg in diplom da lingua.",
    nameLabel: "Num per stampar (na vegn betg memorisà)",
    print: "Stampar",
    notFound: "Quest attestat n’exista betg.",
  },
  team: {
    title: "Team",
    lead: "Tscherni vid tge che voss team lavura. Ils commembers decidan sezs, sch’els As mussan, nua ch’els stattan en questas situaziuns — mai tge frasas u tge ch’els han fatg fallà.",
    focusLabel: "Tema",
    none: "Nagin team — ina gruppa d’emprender",
    overviewEmpty: "Anc nagin en il team na As mussa ses progress. Mintga commember po activar quai sin la pagina da la gruppa.",
    private: "na parta betg",
    noSync: "parta, ma n’ha betg activà «Il progress sin tut ils apparats» — anc nagut da vesair",
    ready: "{n} da {total} situaziuns segiras",
    certificates: "Attestats: {n}",
    new: "nov",
    met: "cumenzà",
    steady: "per gronda part",
    sure: "segir",
    shareTitle: "Voss progress en il team",
    shareBody: "Mussa a {name}, nua che Vus stattais en las situaziuns dal team — mai tge frasas u tge che Vus avais fatg fallà. «Il progress sin tut ils apparats» sto esser activà en las configuraziuns.",
    shareOn: "Parter cun {name}",
    shareOff: "Betg pli parter",
    sharing: "Vus partis voss progress.",
    failed: "Quai n’ha betg funcziunà. Empruvai anc ina giada.",
  },
  streak: {
    title: "Vossa seria",
    start: "Cumenzai oz — paucas dumondas bastan.",
    doneToday: "Oz gia exercità.",
    weekReached: "Finamira da l'emna cuntanschida.",
    goalLabel: "Finamira da l'emna",
    freezes: "In di manchentà vegn surpuntà automaticamain ({n} restan).",
    practise: "Exercitar ussa",
    days: {"one": "{n} di en seria", "few": "{n} dis en seria", "many": "{n} dis en seria", "other": "{n} dis en seria"},
    best: {"one": "Record: {n} di", "few": "Record: {n} dis", "many": "Record: {n} dis", "other": "Record: {n} dis"},
    goalDays: {"one": "{n} di per emna", "few": "{n} dis per emna", "many": "{n} dis per emna", "other": "{n} dis per emna"},
    week: {"one": "Quest'emna: {n} da {goal} di", "few": "Quest'emna: {n} da {goal} dis", "many": "Quest'emna: {n} da {goal} dis", "other": "Quest'emna: {n} da {goal} dis"},
  },
  practice: {
    title: "Exercizis",
    lead: "Ina curta seria da dumondas, paucas minutas. Or da las reglas che Heidi applitgescha sezza, or da las frasas che vegnan propi ditgas — ed or dals pleds che Vus avais tegnì.",
    note: "Quai che Vus tegnis resta en Voss navigatur — nun che Vus activais «Il progress sin tut ils apparats» en las configuraziuns. Las dumondas or dal vocabulari na dovran nagin conto.",
    start: "Cumenzar",
    restart: "Anc ina giada",
    progress: "Dumonda {n} da {total}",
    secondTry: "Segunda emprova",
    skip: "Sursiglir",
    show: "Mussar",
    knew: "Al saveva",
    missed: "Anc ina giada",
    next: "Vinavant",
    explain: {
      show: "Explicaziun",
      ruleTitle: "La regla",
      watchTitle: "Nua ch'i s'impedescha",
      contextTitle: "En il discurs",
      wordTitle: "Il pled",
      saidInTitle: "Ditg era en",
      askTitle: "Cuntinuar cun Heidi",
      moreOnTopic: "Dapli davart quest tema",
      practiseTopic: "Exercitar gist quai",
      openScene: "L'entira situaziun",
      practiseScene: "Exercitar questa situaziun",
      practiseWord: "Exercitar quest pled",
      alsoInPack: "Il pachet cuntegna era: {words}",
    },
    right: "Gist",
    wrong: "Betg dal tut",
    ask: {
      pairTarget: "Tge da quai è tudestg da Turitg?",
      pairBridge: "Tge da quai scrivessas Vus en Svizra?",
      article: "Tge artitgel va cun quel?",
      form: "Tge forma va bain?",
      cloze: "Tge pled manca?",
      recall: "Tge vul quai dir?",
      match: "Tge va ensemen?",
      gaptext: "Tge pleds mancan?",
      pick: "Tge pled va qua?",
      translate: "Co di’ins quai en turitgais?",
      card: "Savais Vus quai anc?",
    },
    matchHint: "Tutgai in pled, lura sia significaziun.",
    gapHint: "Tutgai in pled — el va en il proxim vid. Tutgai in vid emplenì per al reprender.",
    check: "Controllar",
    typeLabel: "Scrivai sez — facultativ",
    typePlaceholder: "Tippai Vossa resposta …",
    youWrote: "Vus avais scrit",
    translateLabel: "Scrivai quai en turitgais",
    packSays: "El pack di",
    spellingNote:
      "Il turitgais n’ha nagina ortografia fixa. Scrit auter n’è betg scrit fauss — confrontai Vus svess e decidi.",
    cardRecognise: "Dialect → senn",
    cardProduce: "Senn → dialect",
    cardTurn: "Voltar",

    modeTitle: "Co vulais Vus exercitar?",
    modeMixed: "Maschadà",
    modeMixedNote: "Da tut in pau, maschadà — la via normala.",
    modeTap: "Tutgar",
    modeTapNote: "Mo tscherner. Nagin clavazzin, ina maun basta.",
    modeWrite: "Scriver",
    modeWriteNote: "Tippar svess frasas entiras. Vus confrontais svess.",
    modeCard: "Cartas",
    modeCardNote: "Pled davant, senn davos. Il pli svelt.",

    flowTitle: "Exercitar u examinar?",
    flowPractice: "Exercitar",
    flowPracticeNote: "Resposta ed explicaziun immediat suenter mintga dumonda.",
    flowTest: "Test",
    flowTestNote: "Emprim tut las dumondas, lura tut las respostas cun explicaziun.",

    testLead:
      "{total} dumondas ina suenter l’autra. Heidi di nagut sin la via — las respostas e las explicaziuns vegnan tuttas a la fin.",
    testOnlyObjective:
      "In test dumonda mo quai che sa vegnir curregì senza discussiun. Il scriver e las cartas giuditgais Vus svess: quai sa vegnir exercità, betg mesirà.",
    testStart: "Cumenzar il test",
    testProgress: "{n} da {total}",
    testAnswer: "Registrar",
    testTimerOff: "Senza temp",
    testTimerSet: "{n} min",
    testTimerAdd: "+{n} min",
    testTimerLabel: "Metter in temp?",
    testTimerLeft: "Anc {time}",
    testTimeUp: "Il temp è ora. Tut quai che Vus avais respundì stat sutvart.",
    testDone: "Finir",
    testResultsTitle: "Vossas respostas",
    testResultsCount: "{right} da {asked} endrizzas la emprima giada",
    testResultsLead: "Mintga dumonda danovamain, cun quai che Vus avais tschernì e la via tar l’explicaziun.",
    testYourAnswer: "Vus avais tschernì",
    testCorrectAnswer: "La resposta è",
    testUnanswered: "Betg respundì",
    testAgain: "In auter test",
    focusTitle: "Nua che vus restais tatgads",
    focusEmpty:
      "Anc nagut. Uschespert che Vus avais respundì in pèr dumondas, cumpara qua quai che Vus tschiffa adina puspè — ed in clic exercitescha gist quai.",
    focusLead: "Quai turna adina puspè fallà tar vus. In clic exercitescha mo quai.",
    scopedTo: "Mo: {what}",
    scopeAll: "Exercitar tut",
    scopeEmpty:
      "Per quai n'i ha anc naginas dumondas. Quai na vul betg dir che il tema saja nunimportant — mo che il pack n'ha anc nagins exempels per el.",
    origin: "L'auter è {origin}.",
    persons: {
      ich: "jau",
      du: "ti",
      er: "el / ella",
      mir: "nus",
      ihr: "vus",
      si: "els / ellas",
      plural: "plural",
      past: "passà",
    },
    grammarLink: "La grammatica davos quai",
    wordLink: "Quest pled en il vocabulari",
    ruleLink: "La regla davos",
    situationLink: "La situaziun da la quala quai vegn",
    doneTitle: "Quai basta per ussa.",
    doneAsked: "dumondas",
    doneRight: "la emprima giada",
    doneAgain: "vegnan puspè",
    againTitle: "Da vesair anc ina giada",
    whyTitle: "Pertge ch'ils exercizis èn fatgs uschia",
    whyLead:
      "Mintga decisiun qua sa laschi controllar. Nua che la perscrutaziun dat ina direcziun e betg ina cifra, stat la cifra sco nossa valitaziun — betg sco resultat.",
    why: [
      {
        claim: "Vegnir dumandà batta leger danovamain.",
        detail:
          "Perquai na mussa nagin exercizi l'emprim la resposta. Sur 222 studis: il avantatg dal test cunter il repeter è g ≈ 0,50.",
        source: ["yang-2021"],
      },
      {
        claim: "Pli tard è meglier che baud — e l'avantatg crescha cun il temp.",
        detail:
          "Perquai turna in pled tegnì suenter 1, 3, 7, 16 e 35 dis enstagl mintga di. Meta-analisa en la segunda lingua: g ≈ 0,76 en il test immediat, g ≈ 1,15 en quel retardà.",
        source: ["kim-webb-2022"],
      },
      {
        claim: "Ina giada endretg na basta betg; duas giadas, cun distanza, è il punct.",
        detail:
          "Perquai turna ina dumonda manchentada en la medema sesida — trais dumondas pli tard, betg immediatamain. La distanza da trais è nossa valitaziun: il studi dat la direcziun, betg la cifra.",
        source: ["rawson-dunlosky-2011"],
      },
      {
        claim: "Tscherner senza resposta enavos po fixar la furma faussa.",
        detail:
          "Perquai mussa mintga dumonda da tscherna immediatamain la resposta gista e turna pli tard. La resposta enavos rinforza il niz e diminuescha gist quel donn.",
        source: ["butler-roediger-2008"],
      },
      {
        claim: "Producir sez sa tegna meglier che leger.",
        detail:
          "Perquai dat i frasas cun bocas e dumondas avertas, betg mo tschernas. L'effect è solid, ma pli pitschen che sia reputaziun.",
        source: ["bertsch-2007"],
      },
      {
        claim: "Maschadar gida — ma betg adina, e quai din nus.",
        detail:
          "Perquai na suondan betg duas dumondas dal medem tip. La meta-analisa è cleras: il niz dependa da quant simil ch'il material è, e cun material fitg simil po maschadar era donnegiar.",
        source: ["brunmair-richter-2019"],
      },
      {
        claim: "Nagins seris, nagins puncts, nagina percentuala.",
        detail:
          "In seri mesira quant Heidi che Vus avais consumà e para intant da mesirar l'emprender. Qua stattan cifras davart quai che Vus avais fatg.",
        source: ["yang-2021"],
      },
    ],
    whyMore: "L'entira metoda",
    savedHint: "En il chat tegnis Vus in pled cun +. El returna qua cur ch'igl è ura.",
  },

  essays: {
    title: "Blog",
    lead: "Pertge che la Svizra tudestga discurra sco ella discurra. Texts pli lungs cun lur funtaunas — per las dumondas che na van betg sin ina charta.",
    none: "Qua n'è anc nagut.",
    backToAll: "Tut ils texts",
    notTranslated: "Quest text n'exista anc betg en rumantsch. Vus al legias en",
    sourcesTitle: "Funtaunas",
  },
  dialect: {
    title: "Il tudestg svizzer",
    lead: "Tge ch'igl è, pertge che Vus n'al chapis betg malgrà che Vus savais tudestg — e tge idiom che vegn discurrì nua.",
    spokenTitle: "Discurrì, betg scrit",
    spokenBody: "Il tudestg svizzer è la lingua discurrida da mintgadi — e quella scritta tranter glieud che sa enconuschan: SMS, WhatsApp, notizias. Tut quai ch'è official vegn scrit en tudestg standard svizzer. Omadus tutgan tar quai, e tgi che sa mo l'in trametta ina giada in messadi en idiom a l'assicuranza.",
    noStandardTitle: "Nagina ortografia officiala",
    noStandardBody: "I n'exista nagina ortografia officiala. Il medem pled vegn scrit different da duas persunas, ed omaduas han raschun. Perquai na di Heidi mai che Vossa scrittira saja fauss — mo co che nus la scrivain.",
    notOneTitle: "Betg ina sula lingua",
    notOneBody: "Il tudestg svizzer n'è betg in sul idiom, mabain blers. Las differenzas èn evidentas per in indigen e passan totalmain sper in emprendider. Heidi As emprenda il turitgais e al di, empè da far sco sch'i dess mo in.",
    areasTitle: "Ils idioms",
    areasLead: "Las cunfinas dals idioms na suondan betg las cunfinas dals chantuns — perquai puncts e betg surfatschas. Ils chantuns èn inditgads perquai che Vus savais en tge chantun che Vus essas.",
    cantons: "Chantuns",
    marksTitle: "Co ch'ins als enconuscha",
    marksLead: "Furmas che la controlla da Heidi distingua propi. A sanestra la furma locala, a dretga quella turitgaisa.",
    marksNone: "Heidi na sa anc betg enconuscher quest idiom a basa da furmas concretas. Qua na stat nagut, empè da insatge plausibel.",
    taught: "Quai emprendais Vus qua",
    sourcesTitle: "Funtaunas",
    groupsTitle: "Ils trais roms",
    groupsLead:
      "Ils dialects alemannics sa partan en trais gruppas. Ils cunfins n'èn betg chantunals: els èn midadas fonicas che èn restadas en lieus differents.",
    groups: {
      low: {
        name: "Bass alemannic",
        body: "Il nord — en Svizra praticamain be Basilea. Qua è il k a l'entschatta restà k; dapertut auter en la Svizra tudestga è el daventà ch. Quai audan ins il emprim di.",
      },
      high: {
        name: "Aut alemannic",
        body: "L'Altipian e l'ost: Turitg, Berna, Argovia, Soloturn, Son Gagl. La gruppa la pli gronda — quella che ins pensa cun dir «tudestg svizzer».",
      },
      highest: {
        name: "Autissim alemannic",
        body: "Las vals alpinas: Vallais, Glaruna, Uri ed Untervalden, las colonias walser. Il pli conservativ ed il pli grev per forestiers, perquai che qua èn restadas furmas veglias ch'èn spariras dapi ditg sin l'Altipian.",
      },
    },
    groupLabel: "Rom",
    groupSpansTitle: "Sin omadus mauns da la lingia",
    groupSpans:
      "Questa regiun sa chatta sin omadus mauns da la lingia e n'appartegna a nagin rom sulet. Nus numnain perquai nagin, empè da tscherner in che para ordinà.",
    diagnosticTitle: "La lingia che la tira",
    diagnosticInside: "En quest rom",
    diagnosticOutside: "Sper",
    diagnosticStandard: "Tudestg standard",
    hearTitle: "Uschia sun ella",
    hearLead: "Emissiuns e films en ils quals ins auda surtut quest idiom. Colliaziuns controlladas — registraziuns faschain nus naginas.",
    hearNone:
      "Per quest idiom na datti anc nagut controllà en il register. Meglier nagut ch'ina colliaziun che nagin ha tadlà.",
    hearAll: "Tut las funtaunas d'udida",
    reader: {
      title: "Danunder vegn quest messadi?",
      lead: "Tschentai en in messadi che Vus avais survegnì — dal schef, d’ina vischina, dal chat da la classa. Heidi mussa danunder che las furmas vegnan e tge ch’ils pleds signifitgan.",
      placeholder: "p.ex. Dr Giel und ds Meitschi hei Miuch gno.",
      button: "Classifitgar",
      failed: "Quai n’ha betg funcziunà. Empruvai anc ina giada.",
      area: "Las furmas mussan vers {area}.",
      outside: "Quai para tudestg standard da la Germania, betg da la Svizra.",
      consistent: "Nagut qua na mussa davent da Turitg — ils pleds sutvart di ins uschia a Turitg.",
      unclear: "Memia pauc per classifitgar. Ina u duas frasas dapli gidan.",
      fromTitle: "Furmas d’auters lieus",
      knownTitle: "Tge ch’ils pleds signifitgan",
      zurich: "a Turitg: {form}",
      outsideName: "Germania",
      note: "Heidi classifitgescha mo furmas ch’ella enconuscha segir, e la glista crescha. Voss text na vegn betg memorisà.",
    },
    whyManyTitle: "Pertge uschè blers?",
    whyManyBody:
      "La Svizra ha mantegnì ses dialects, entant che la Germania ha per gronda part pers ils siter. Quai n'è betg in cas ni ina dumonda da muntognas: quai dependa da la furmaziun da l'stadi, da la scola e da la radio.",
    whyManyLink: "L'entira istorgia",
    backToAll: "Tut ils idioms",
    aroundTitle: "Nua che quai stat",
    aroundLead:
      "Quintà ora dal ram, dals chantuns e da la citad da referenza — naginas novas apposiziuns davart il dialect sez.",
    nearestTitle: "Ils pli datiers",
    siblingsTitle: "Medem ram",
    kmAway: "{km} km",
    marksInstead: "Cumenzai plitost cun {area}, {km} km davent — là enconuscha Heidi formas",
  },

  grammar: {
    practiseLabel: "Dapli exempels",
    practiseSay: "Dai mai duas frasas per exercitar «{word}» — lura ma dumandai davart ina.",
    title: "Grammatica",
    lead: "Quai che renda il turitgais difficil da suandar per insatgi che legia gia tudestg — l'emprim quai vi da quai ch'ina frasa faglia dal tut, lura quai che Vus chapis ma na dischessas mai sez.",
    ruleLabel: "La regla",
    watchLabel: "Nua ch'igl impedescha",
    bands: {
      blocks: {
        title: "Qua croda la frasa",
        lead: "Senza questas na cumenza l'ascultar gnanc. Vus spetgais ina furma che na vegn mai, u vus legiais in pled sco insatge dal tut auter — ed il rest da la frasa è ì.",
      },
      marks: {
        title: "Chapir gea — dir sez mai",
        lead: "Questas na fan nagins problems cun ascultar. Tgi che n'las dovra mai sez tuna permanentamain sco tudestg standard cun pleds turitgais dentra.",
      },
    },
    allTopics: "Tut ils temas",
    practiseTopic: "Exercitar quest tema",
    whereTitle: "Nua che quai capita propi",
    whereLead: "La medema structura, en frasas che vegnan propi ditgas.",
    prevLabel: "Enavos",
    nextLabel: "Enavant",
    topics: {
      "question-words": {
        title: "Ils pleds da dumonda — e la fallitscha tranter els",
        rule: "wänn, wo, was, wie, weer. Ils pli blers èn enconuschents; in betg.",
        watch: "«Wänn» suna sco il tudestg «wenn». Vus udis ina cundiziun nua ch'ina dumonda è vegnida ponida — e vossa resposta pertutga lura insatge che nagin n'ha dumandà.",
      },
      "indefinite-article": {
        title: "en, e, es — l'artitgel nundeterminà",
        rule: "«en» cun in pled masculin, «e» cun in feminin, «es» cun in neutral.",
        watch: "«es» para il pronom «es». «Bruuched Sie es Säckli?» na vul betg dir «avais Vus da basegn da quai», mabain «avais Vus da basegn d'in sachet».",
      },
      imperative: {
        title: "Cumond e dumonda: la furma da curtaschia finescha cun -ed",
        rule: "Cun il ti il tschep nud: «Chumm». Cun il Vus vegn -ed tar: «Chömed Sie».",
        watch: "Vus chapis omadus. Tgi che di «Chömen Sie» vegn era chapì — ed identifitgà sco betg da qua.",
      },
      "no-preterite": {
        title: "Nagin preterit",
        rule: "Il turitgais discurrì n'ha nagin passà simpel: tut il passà vegn dit cun il perfect.",
        watch: "Vus spetgais «ging», «war», «sagte» — e quai na vegn mai. Sche Vus udis «bi», «hät» u «händ» plus in particip, è quai il passà.",
      },
      articles: {
        title: "de, d, s — dapli artitgels na dat i betg",
        rule: "Trais artitgels e betg dapli: «de» tar il masculin, «d» tar il feminin, «s» tar il neuter. «der», «die» e «das» na cumparan betg.",
        watch: "Els paran artitgels tudestgs mangiads, ma els èn la furma entira, betg ina contracziun pigra. Ed il gener na siegia betg adina quel tudestg: «s Rüebli» è neuter, la carotta tudestga è feminina.",
      },
      "wo-relative": {
        title: "«wo» empè da der, die, das",
        rule: "Las relativas cumenzan bunamain adina cun «wo», nunvariabel, tge schlattaina u cas ch'i saja.",
        watch: "Vus legiais «wo» sco «nua?» e perdais la frasa. Qua vul quai dir «che», «il qual» — mai in lieu.",
      },
      "unified-plural": {
        title: "Ina suletta furma verbala per tut il plural",
        rule: "Nus, vus ed els prendan la medema furma dal verb: «mir händ», «ihr händ», «si händ».",
        watch: "Vus tschertgais la finiziun da la segunda persuna plural ed ella n'è mai qua. «Chömed er?» vul dir «vegnis Vus?» — la finiziun na di nagut davart la persuna, mo il pronom avant al fa.",
      },
      "possessive-dative": {
        title: "La posseziun a l'invers",
        rule: "Il genitiv n'exista betg: la posseziun vegn construida cun il dativ plus in possessiv, u cun «vo».",
        watch: "«Em Peter sis Auto» n'è nagin sbagl, quai è la furma normala. Emprim la persuna, lura la chaussa.",
      },
      "diminutive-li": {
        title: "Il -li sin tut",
        rule: "La furma diminutiva sin -li è fitg productiva e na signifitga savens nagut pitschen.",
        watch: "«Es Bierli» n'è betg ina biera pitschna, mabain ina biera ditga amiaivlamain. Na prendai betg il -li a la lettra.",
      },
      "am-progressive": {
        title: "«am» plus il verb — en il mument",
        rule: "Quai che capita gist ussa vegn ditg «bi/isch/sind am» plus il verb nud: «Ich bi am schaffe».",
        watch: "Il tudestg n'ha betg questa furma e sa gida cun «gerade». Vus chapis la frasa era senza — ma na la duvrar mai è quai che Vus fa suandar sco tudestg standard cun pleds turitgais leninnen.",
      },
      "go-cho-infinitive": {
        title: "«go» e «cho» avant il segund verb",
        rule: "Ir en insaquà per far insatge metta in «go» avant; vegnir metta in «cho»: «Ich gang go poschte».",
        watch: "En tudestg n'exista quest pled betg, uschia al lascha ins davent — e vegn chapì e reconuschì sco ester en il medem mument. Quai n'è betg in segund «ir»: el tutga tar il verb suenter.",
      },
      "modal-particles": {
        title: "«gäll», «halt», «äbe» — la posiziun da quel che discurra",
        rule: "Quests pleds pitschens na midan nagin fatg, mabain la posiziun davos: «gäll» tschertga Voss consentiment, «halt» vul dir ch\u2019i na va betg autra, «äbe» conferma gist quel punct.",
        watch: "Il tudestg ha «eben», e «gell» viva en il sid — nov è surtut quant savens ch\u2019els vegnan, e «dänk», che n\u2019ha nagin equivalent tudestg. La frasa chapis Vus era senza. Vus na tadlais mo betg sche ins As dat raschun u sche ins As dumonda insatge.",
      },
    },
  },

  saved: {
    title: "Voss pleds",
    lead: "Quai ch'Els han tschertgà e vulì tegnair. Tut resta en quest navigatur, sin quest apparat — betg tar nus.",
    empty: "Anc nagins pleds tegnids.",
    emptyHint: "Dumandai Heidi per ina frasa. Sper mintga pled declerà stat in plus per al tegnair.",
    countLabel: "tegnids",
    remove: "Allontanar",
    clear: "Allontanar tuts",
    clearConfirm: "Propi allontanar tuts?",
    exportLabel: "Memorisar sco datoteca",
    onThisDevice: "Mo sin quest apparat",
    savedOn: "Tegnì ils",
    openChat: "Tschertgar insatge",
  },

  /**
   * The dashboard: spaced review, and what the learner's own list says about
   * them. No streak, no score, no percentage — HEIDI.md §8 names each of those
   * as the thing this must not become.
   */
  review: {
    title: "Da repeter",
    lead: "Ils pleds che Vus avais mantegnì returnan qua — suenter in di, lura suenter trais, lura suenter ina emna. Dumandar pli tard funcziuna meglier che dumandar pli savens.",
    due: "da repeter",
    none: "Oz n'è nagut da repeter.",
    noneHint: "Vegni puspè damaun — u tschertgai insatge nov.",
    noneFree: "Il plan è actual. Sche Vus vulais cuntinuar ussa, qua tras:",
    nonePractise: "Ina curta sesida",
    noneCards: "Cartas",
    noneAsk: "Encollar in messadi",
    empty: "Anc nagins pleds da repeter.",
    emptyHint: "Mantegnai in pled durant ina conversaziun, lura As dumonda Heidi pli tard.",
    tomorrow: "damaun",
    settled: "segirs",
    prompt: "Tge vul quai dir?",
    show: "Mussar",
    knew: "Quai savevi",
    missed: "Anc betg",
    done: "Per oz è quai tut.",
    patternsTitle: "Quai che As ferma adina puspè",
    patternsLead: "Questas regularitads èn en ils pleds che Vus avais mantegnì. Nagina nota — mo quai ch'è en Vossa atgna glista.",
    patternsCount: "da Voss pleds",
    patternsEmpty:
      "Anc nagut da mussar. Uschespert che Vus avais tegnì in pèr pleds, cumparan qua las correspundenzas da tun che returnan en els — per exempel ch\u2019in k tudestg daventa ch. Legì da Vossa atgna glista; nagut na vegn mesirà davart Vus.",
    masteredTitle: "Tge che Vus savais uss",
    masteredCount: "{n} chaussas tegnan",
    masteredLead:
      "I na vegn betg quintà quant savens che Vus essas stà qua, mabain tge che Vus fais uss endrizza — dumandà almain quatter giadas e quasi adina gudagnà.",
    masteredEmpty:
      "Anc nagut. Uschespert ch\u2019insatge Vus vegn dumandà quatter giadas e Vus l\u2019avais quasi adina gì, cumpara quai qua. I vegn quintà tge che Vus savais, betg quant savens che Vus essas vegnì.",
    masteredTopics: "Grammatica",
    masteredWords: "Pleds",
    masteredGroups: "Gruppas da pleds",
    masteredScenes: "Situaziuns",
    masteredNote:
      "Quai di insatge davart quest pack, betg davart il tudestg svizzer en general. Quai tegna — da quai na resulta betg ch\u2019ina conversaziun a Turitg tegnia.",
    recentTitle: "Cuntinuar",
    recentEmpty: "Anc naginas conversaziuns.",
  },
  groups: {
    title: "Gruppas da studi",
    lead: "Exercitai cun auters — Heidi è dad tar. Scrivai ses num en la conversaziun, sch'ella duai rispunder.",
    empty: "Vus n'essas anc en nagina gruppa.",
    createTitle: "Avrir ina gruppa",
    createHint: "Dai a la gruppa in num. Lura survegnis Vus in link per spartir.",
    namePlaceholder: "p.ex. Mesemna saira",
    create: "Avrir",
    creating: "Vegn avert …",
    open: "Avrir",
    members: "Commembers",
    inviteTitle: "Envidar",
    inviteHint: "Tgi ch'ha il link vegn en. Spartii el mo sche Vus lu vulais.",
    copyLink: "Copiar il link",
    copied: "Copià",
    rotate: "Crear in nov link",
    rotateHint: "Il link vegl na funcziunescha immediatamain betg pli.",
    joinTitle: "Vus essas envidà",
    joinBody: "S'annunziai per far cun.",
    join: "Far cun",
    joining: "In mument …",
    joinFailed: "Quest link na funcziunescha betg pli.",
    full: "Questa gruppa è plaina.",
    signInFirst: "S'annunziai per duvrar gruppas da studi.",
    composer: "Messadi a la gruppa",
    send: "Trametter",
    heidiHint: "Scrivai «Heidi», sch'ella duai rispunder.",
    notConfigured: "Las gruppas da studi n'èn anc betg configuradas sin questa installaziun.",
    failed: "Quai n'ha betg funcziunà. Empruvai anc ina giada.",
    back: "Enavos a mes sectur",
  },
  speaking: {
    title: "Discurrer",
    lead: "Discurrì ad aut vusch, sulet, uss — e laschai mesirar quai che sa laschar mesirar. Pli sut: webinars e rundas da discurs davart temas che Vus proponis.",
    signInFirst: "S’annunziai per proponer in tema ed esser dabot.",
    roundFull: "Questa runda è plaina.",
    notConfigured: "Las rundas da discurs n’èn betg installadas sin questa installaziun.",
    failed: "Quai n’ha betg funcziunà. Empruvai anc ina giada.",

    roundsTitle: "Proximas rundas",
    roundsEmpty: "Anc nagina runda planisada. Avri la emprima.",
    webinar: "Webinar",
    circle: "Runda",
    webinarHint: "Ina persuna discurra, las autras ascultan.",
    circleHint: "Tuts vegnan a pled. Maximalmain otg persunas.",
    once: "Ina giada",
    weekly: "Mintga emna",
    fortnightly: "Mintga duas emnas",
    hostedBy: "da",
    attending: "annunziads",
    full: "Plain",
    join: "Jau vegn",
    leave: "Tuttina betg",
    live: "En curs",
    joinRoom: "Ir en la stanza",
    noRoom: "Il link a la stanza vegn anc.",
    cancelRound: "Annullar la runda",
    cancelled: "Annullada",

    openTitle: "Avrir ina runda",
    openHint: "Vus essas l’ospitant e l’emprim num sin la glista.",
    roundTitleLabel: "Da tge va ei?",
    whenLabel: "Cura",
    durationLabel: "Durada",
    minutes: "minutas",
    formatLabel: "Furma",
    cadenceLabel: "Repetiziun",
    linkLabel: "Link a la stanza",
    linkHint: "In link https a Vossa stanza. Heidi na transmetta nagin video — ella planisescha la runda ed exercitescha cun Vus avant e suenter.",
    open: "Avrir",
    opening: "Vegn avert …",

    boardTitle: "Temas proponids",
    boardLead: "Da tge vulais Vus discurrer? Ils temas vegnan dals participants, betg da nus.",
    boardEmpty: "Anc naginas propostas. Proponi insatge che Vus vulais propi discurrer.",
    proposeTitle: "Proponer in tema",
    topicTitleLabel: "Il tema",
    topicTitlePlaceholder: "p.ex. Tge che vegn propi ditg a la staziun",
    pitchLabel: "Pertge vala quai in’ura?",
    pitchPlaceholder: "Ina frasa basta.",
    propose: "Proponer",
    proposing: "In mument …",
    wouldCome: "vegnissan",
    imIn: "Jau vegniss",
    imOut: "Tuttina betg",
    scheduled: "Planisà",
    scheduleIt: "Far ina runda da quai",

    practiceTitle: "Exercitar ad auta vusch",
    practiceLead: "Registrai Vus sez cura che Vus discurris davart in tema. Ina minuta basta.",
    record: "Registrar",
    stop: "Finì",
    recordingNow: "Registrescha",
    again: "Anc ina giada",
    micDenied: "Quai dovra l’access al microfon. Permettai el en la trav d’adressa da Voss navigatur.",
    micUnsupported: "Quest navigatur na po betg registrar. Empruvai sin il telefon u en in auter navigatur.",
    measured: "Mesirà",
    varietyLabel: "En tge lingua exercitais Vus?",
    varietyBridge: "Tudestg standard svizzer",
    varietyMeasuresOnly: "Heidi mesira la registraziun sin Voss apparat. La frasa tippais Vus sez — nagin sistem scriva il tudestg da Turitg a moda fidada.",
    varietyTranscribes: "Heidi scriva cun e po discurrer davart Voss pleds. Per quai va la registraziun ina giada tar in servetsch, che na la tegna betg.",

    recordedFor: "registraziun",

    spokeFor: "discurrì",
    pauseLabel: "pausas",
    longestLabel: "pausa la pli lunga",
    runLabel: "en ina tratga",
    rateLabel: "sill./sec.",
    wordsLabel: "pleds",
    seconds: "s",

    saidTitle: "Tge avais Vus ditg?",
    saidWhy: "Nagin sistem na scriva si il tudestg svizzer fidadamain. Ils meglers translateschan il dialect en tudestg standard e bittan davent precis quai che Vus emprendais. Perquai scrivais Vus sezs Vossa frasa — e la scriver è gia la mesadad da l’exercizi.",
    saidPlaceholder: "Scrivai Vossa frasa uschia sco Vus l’avais ditg.",
    saidCheck: "Laschar controllar",
    checking: "Vegn controllà …",

    heardTitle: "Quai avain nus udì",
    heardWhy: "Quai ha scrit ina maschina, betg Vus. Curregiai quai che na va betg — mesirà vegn il text che Vus surpigliais.",
    heardPlaceholder: "Qua stat quai che la maschina ha chapì.",
    hearing: "Vegn tadlà …",
    heardFailed: "Il tadlar n’ha betg funcziunà. Scrivai Vossa frasa sez — la mesira survart vala uschè u uschè.",
    grammarTitle: "Grammatica",
    grammarClean: "Nagut che in auditur remartgass.",
    grammarNotChecked: "La grammatica n’è betg vegnida controllada questa giada.",
    grammarAlternatives: "Pliras pussaivladads — tge che va bain dependa da quai che Vus vulevas dir.",
    grammarMore: "Las emprimas {shown} da {total}.",
    grammarLimit: "Controllescha concordanza, cas e furmas verbalas. Betg tut vegn chattà — per exempel la posiziun dal verb suenter «weil».",
    hesitationTitle: "Nua che Vus avais tschertgà in pled",
    hesitationBefore: "{s} s avant «{word}»",
    hesitationNote: "Il pled suenter ina lunga pausa è savens quel che Vus avais tschertgà.",

    feedbackTitle: "Resposta",
    suggestionTitle: "Uschia vegniss quai ditg qua",
    noSuggestion: "Heidi n’ha actualmain nagut da dir. Las mesiraziuns survart valan tuttina.",
    flaggedSuggestion: "Attenziun: en questa proposta è ina furma che nossa atgna controlla remartga.",
    foreignForm: "«{form}» è {origin}. Qua din ins «{suggest}».",
    foreignFormPlain: "«{form}» vegn d’in auter dialect ({origin}).",
    noScore: "Heidi na dat nagina nota. Quai che Vus vesais è mesirà: quant ditg che Vus avais discurrì e nua che las pausas èn stadas — e tge pleds che vegnan d’in auter dialect. Nagut davart Vossa pronunzia, perquai che nagin na po mesirar quai onestamain.",

    notes: {
      recordingTooShort: "Memia curt per dir insatge. Registrai in per frasas.",
      recordingTooQuiet: "Nus avain udì strusch insatge. Controllai il microfon e discurri in zic pli datiers.",
      recordingClipped: "Il signal era surmesirà. Allontanai Vus in zic dal microfon — in problem d’apparat, betg da discurrer.",
      longestPause: "Vossa pausa la pli lunga ha durà {n} secundas. Per las scursanir: di la frasa cun main pleds enstagl da tschertgar il pled gist.",
      noLongPauses: "Naginas pausas lungas — Vus essas arrivads tras senza restar bloccads.",
      fewerPausesThanBefore: "{n} pausas damain che l’ultima giada.",
      morePausesThanBefore: "{n} pausas dapli che l’ultima giada. Quai po depender dal tema.",
      longerRunsThanBefore: "Vus avais discurrì {n} secundas pli ditg en ina tratga che avant.",
      nothingFlagged: "Naginas furmas d’in auter dialect chattadas.",
      shareOfRecording: "En {n} % da la registraziun era lingua. Il rest era quiet — quai po esser reflexiun, u in microfon ch’ha udì memia pauc.",
      huntingForWords: "Cura che Vus discurrivas, discurrivas Vus spert — il temp è ì en las pausas. Quai è tschertgar pleds, betg lentezza: ditg la medema chaussa subit anc ina giada, lura croda la tschertga davent.",
      cameStraightThrough: "Vus essas passà senza tschertgar pleds. La proxima giada prendai in tema che Vus n’avais mai ditg ad aut vusch.",
      filledPauses: "{n} pausas emplenidas («äh»). Quai fan er lingua materna cuntinuadamain — dumbrà, betg reproschà.",
      spokeTargetInBridge: "Igl èn stads pleds da dialect, malgrà che Vus exercitavas tudestg standard. A Turitg capita quai adina ed i n’è betg in sbagl — mo bun da savair, sche Vus vulais discurrer standard vi dal guitschet.",
    },

    historyTitle: "Vossas registraziuns",
    historyUnwritten: "Senza text — mo mesirà.",
    deleteTake: "Stizzar",
    progressDays: "dis discurrids",
    progressTakes: "registraziuns",
    progressSpoken: "discurrì",
    progressSeconds: "sec",
    progressMinutes: "min",
    progressNote: "Dumbrà, betg giuditgà. Quest dumber na sbassa mai — duas emnas da pausa na custan nagut.",
    privacy: "Il tun na bandunescha mai Voss apparat. Vegnan tegnidas mo las mesiraziuns e Voss agen text — en quest navigatur, betg tar nus.",
    privacyTranscribed: "En questa lingua va la registraziun ina giada tar in servetsch che la mida en text, e là na vegn ella betg tegnida. Tar nus restan mo las mesiras ed il text — en quest navigatur.",
  },

  paper: {
    checkLabel: "Controllai Vus svess",
    sourcesTitle: "Funtaunas",
  },

  changelog: {
    title: "Register da midadas",
    lead: "Tge ch\u2019è sa midà, cun data — ed en ils pleds da tgi che l\u2019dovra.",
    note: "Betg in log da Git. Il repositori è public e tgi che vul mintga commit al chatta là. Qua stat quai ch\u2019ina persuna avess remartgà — errurs inclus, perquai ch\u2019in register senza lingias malempernaivlas cumprova che la empermischun «nus publitgain era quai che n\u2019ha betg funcziunà» è mo decoraziun.",
    tags: {
      feature: "Nov",
      improvement: "Meglier",
      fix: "Curregì",
      platform: "Fundament",
      breaking: "Rut",
    },
  },

  organisations: {
    title: "Per organisaziuns",
    lead: "Nua ch’il dialect n’è betg Voss problem, mabain quel da Vossa glieud.",
    momentLabel: "Il mument",
    stakeLabel: "Tge ch’i custa",
    offerLabel: "Tge che Heidi fa",
    unknownLabel: "Tge che nus stuessan dumandar",
    chooseSector: "Voss sectur",
    allSectors: "Tut ils secturs",
    readMore: "Leger vinavant",
    startTitle: "Tge che capita sche Vus scrivais",
    teamsTitle: "Heidi per teams",
    teamsBody: "Creai ina gruppa per voss team e tscherni la tema — per exempel las situaziuns en ina chasa da tgira. Voss collavuraturs s’exercitan sin lur agens apparats e decidan sezs, sch’els As mussan en tge situaziuns ch’els èn segirs. Tgi che domina ina situaziun survegn in attestat, che Vus pudais controllar via ses link.",
    teamsCta: "Crear in team",
    talk: "Scrivai a nus",
  },

  situations: {
    title: "Nua che vus ils duvrais",
    lead: "Betg ordinà tenor categorias da pleds, mabain tenor il mument: quai che vegn ditg propi en quella situaziun, en l'urden ch'i arriva.",
    note: "La direcziun è la medema sco dapertut qua: emprim chapir. La gronda part da questas frasas udis vus; las paucas che vus dischessas sez èn marcadas.",
    verified: "Mintga frasa è controllada automaticamain tenor las furmas da Turitg: furmas d’auters dialects u da la Germania na passan betg.",
    hear: "Quai udis vus",
    say: "Quai dischais vus",
    linesLabel: "frasas",
    heardLabel: "per chapir",
    grammarLabel: "Quai che turna adina danovamain qua",
    practiseLabel: "Exercitar ussa",
    backLabel: "Tut las situaziuns",
    strength: {
      title: "Ingio che Vus essas qua",
      new: "Anc betg cumenzà",
      met: "Cumenzà",
      steady: "La gronda part tegna",
      sure: "Vus chapis questa situaziun",
      claim: "Vus chapis il tudestg da Turitg en questa situaziun — controllà cun tut las {total} frasas che cumparan qua.",
      progress: "{held} da {total} frasas tegnan",
      stuckNote: "{stuck} da quellas èn returnadas suenter ina pausa ed han anc adina tegnì.",
      remainingTitle: "Questas mancan anc",
      drill: "Exercitar questa situaziun",
      drillAgain: "Cuntinuar",
      noneYet: "Exercitai questa situaziun — lura sa mussa qua ingio che Vus essas.",
      localOnly: "Quai calculescha Voss navigatur. Quai na bandunescha betg quest apparat.",
      boardTitle: "Ingio che Vus essas ferm",
      boardLead: "Situaziun per situaziun. Ins po esser segir en la chasa d'attempads e pers en il restaurant — quai n'è betg ina contradicziun, quai è il punct.",
      weakest: "Qua paja l'exercizi il pli fitg en quest mument",
    },
    domains: {
      everyday: {
        title: "Il mintgadi a Turitg",
        lead: "La butia, il tram, la stgala, il telefon, la maisa da mezdi. Situaziuns en las qualas bunamain mintgin è mintga emna — e nua ch'il local mida en tudestg standard uschespert ch'el vesa che vus avais difficultads.",
      },
      care: {
        title: "Chasas d'attempads e da tgira",
        lead: "Ina abitanta cun demenza perda l'emprim sias segundas linguas. Quai che resta è il tudestg turitgais da sia uffanza — e quai è la lingua en la quala il servetsch decurra.",
      },
    },
    scenes: {
      restaurant: {
        title: "En il restaurant",
        scene: "Quatter dumondas fixas ed ina che decida davart il quint. «Zäme oder separat» vegn dumandà ina giada, spert, e sbagliar quai remartga l'entira maisa.",
      },
      "at-work": {
        title: "Al lavur",
        scene: "La sesida va en tudestg standard u en englais. Il corridor, la maschina da caffè ed il mument che insatge vegn propi decidì, betg.",
      },
      "school-parents": {
        title: "En la scolina",
        scene: "En il chantun Turitg va la scolina en dialect — quai han ils votants decidì il 2011. Ils geniturs ch'han emprendì il tudestg standard al chattan ora a la sairada da geniturs, davant tuts.",
      },
      shopping: {
        title: "En la butia",
        scene: "Quatter dumondas, mintga giada las medemas, a la cassa cun ina colonna davos vus — precis nua che far repeter custa il pli.",
      },
      tram: {
        title: "En il tram",
        scene: "Communicaziuns ed persunas nunenconuschentas, omadus spert. L'unica situaziun nua che betg chapir custa il suentermezdi e betg la frasa.",
      },
      neighbours: {
        title: "En la stgala",
        scene: "La lavandaria, la bicicletta en il corridor, la rumenta. In bigliet a la porta n'è qua betg ina dumonda — tgi ch'al legia uschia daventa il vischin difficil senza che insatgi al di.",
      },
      appointment: {
        title: "Al telefon",
        scene: "Il canal il pli difficil en mintga segunda lingua e quel che nagin n'exercitescha: nagina fatscha, nagin context, ed insatgi che lavura ina glista.",
      },
      "small-talk": {
        title: "A la maisa da mezdi",
        scene: "La scena perquai che quest product exista. La maisa mida en tudestg standard uschespert ch'ella vesa che vus fajais fadia — ed als prenda giu precis quai che gidass.",
      },
      handover: {
        title: "La surdada",
        scene: "Collega a collega, nagut na vegn rallentà, nagin na mida en tudestg standard per vus. Il mument il pli spert dal di — e quel che decida davart l'entir servetsch.",
      },
      "morning-care": {
        title: "La damaun",
        scene: "Frasas curtas, ditgas cun omadus mauns occupads. Qua n'è il tudestg standard betg l'opziun neutrala: midar lingua amez la tgira para in midar da persuna.",
      },
      pain: {
        title: "Cura ch'insatge fa mal",
        scene: "Il dolur na discurra betg ina segunda lingua. Tgi ch'al annunzia na componescha betg — e tgi ch'al chapescha mal tegna il dolur per inquietezza.",
      },
      meals: {
        title: "Mangiar e baiver",
        scene: "La situaziun che turna il pli savens e per la quala nagin na sa prepara, perquai ch'ella para facila.",
      },
      "evening-unrest": {
        title: "Inquietezza la saira",
        scene: "Insatgi vul ir a chasa, en ina chasa che n'exista betg pli dapi curant onns. Quai che gida è curt, en il present e en la lingua en la quala la persuna pensa.",
      },
      visitors: {
        title: "Visitas",
        scene: "D'in mument a l'auter essas vus l'instituziun. La figlia ch'arriva ina dumengia suentermezdi giuditgescha la chasa tenor quai: ha la persuna a la porta pudì la suandar.",
      },
      doctor: {
        title: "Tar il medi",
        scene: "Il telefon As ha procurà in termin; ussa vegnan la recepziun, la stanza da spetgar e la stanza da consultaziun. A la recepziun dumondan ins spert, tar il medi exact — ed en omadus cas quinta che Vus hajas chapì la dumonda avant che respunder.",
      },
      municipality: {
        title: "Sin la vischnanca",
        scene: "Tgi che sa translocha a Turitg sto s'annunziar — per ordinari las emprimas emnas, e per ordinari avant ch'el po suandar ina frasa. Las dumondas èn mintga giada las medemas, e la persuna davos il vaider las fa tschient giadas al di, cun quella sveltezza.",
      },
      "laundry-room": {
        title: "En la lavanderia",
        scene: "Il plan a la paraid è ina lescha che nagin n'explitgescha. Tgi che na nettegia betg il filter u lava il fals di vegn a savair — darar en fatscha, per il solit sin in cedel.",
      },
      apero: {
        title: "A l'aperitiv",
        scene: "In magiel en maun, nagin na sto restar, tuts discurran dialect. Qua cumenza ina enconuschientscha turitgaisa — e «Mer sött emal öppis zäme mache» è ditg cordialmain, ma i n'è nagina invitaziun.",
      },
      "indirect-no": {
        title: "Cura che na na tuna betg sco na",
        scene: "A Turitg refusan ins darar directamain. «Das isch ächli schwierig» u «Mer chönnt sich das überlegge» è savens gia la resposta, pachetada cun curtaschia — tgi che la prenda a la lettra spetga insatge ch'è gia vegnì ditg.",
      },
    },
  },

};
