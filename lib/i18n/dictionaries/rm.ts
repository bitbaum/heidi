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

  nav: {
    home: "Cumenzament",
    chat: "Chat",
    speaking: "Rundas da discurs",
    practice: "Exercitar",
    listen: "Tadlar",
    grammar: "Grammatica",
    dialect: "Idioms",
    vocabulary: "Vocabulari",
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
    groupReference: "Consultar",
    groupWhy: "Pertge uschia",
    groupProject: "Project",
    skipToContent: "Al cuntegn",
    menu: "Menu",
    language: "Tscherner la lingua",
    langNational: "Linguas naziunalas",
    langDialect: "Dialect",
    langOther: "Autras linguas",
  },

  footer: {
    tagline: "Chapir il tudestg da Turitg, e lura far part.",
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
    failed: "Heidi n'ha betg pudì respunder en quest mument. Empruvai danovamain en in mument.",
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
    attachNeedsKey: "Leger ina maletg dumonda Voss agen model",
    remove: "Allontanar",
    connectTitle: "Colliar Voss agen model",
    connectLead:
      "Heidi è gratuita, ed ils models gratuits na san betg leger maletgs. Cun ina atgna clav API chapescha Heidi ina fotografia dal visur — e responda en general meglier.",
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
      "Heidi na discurra betg. Ina vusch che pronunziass fallà il turitgais na pudessias Vus betg controllar, e quai è il sulet sbagl che quest product na dastga betg far.",
      "La controlla dal dialect funcziuna senza model. Ella è ina glista fixa da reglas, betg in model da lingua — perquai na po ella betg cumenzar ad inventar.",
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
  },

  privacy: {
    title: "Tge che capita cun Voss pleds",
    lead: "Heidi legia messadis che persunas èn s'inviadas. Quai è sensibel, perquai di questa pagina exactamain tge che resta nua, e tgi auter che al vesa.",
    bindingNote: "Decisiva è la versiun tudestga.",
    flowsTitle: "Tge che resta, e nua",
    flowsLead: "Mintga lingia numna il lieu da memorisaziun, per che Vus al pudais controllar sezs.",
    place: { device: "Mo sin Voss apparat", server: "Sin noss server", vendor: "Tar in purschider" },
    col: { what: "Tge", where: "Nua", who: "Tgi auter al vesa" },
    nobody: "nagin auter",
    flows: {
      draftConversation: "Conversaziun senza conto",
      savedConversation: "Conversaziun cun conto",
      savedWords: "Pleds tegnids",
      ownKey: "Vossa atgna clav API",
      theme: "Apparientscha clera u stgira",
      dictation: "Dictar",
      pictures: "Maletgs",
      speakingTakes: "Registraziuns da discurs",
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
    modelBody: "Da standard dovra Heidi models gratuits. Ina atgna clav avra maletgs e meglierescha las respostas.",
    modelNone: "Nagin agen model collià",
    accountTitle: "Conto",
    accountBody: "Per tegnair Voss pleds e per gruppas da studi. Per translatar na dovrais Vus nagin conto.",
    dataTitle: "Tge che resta sin quest apparat",
    dataBody:
      "Vossa conversaziun resta en quest navigatur — era suenter avair serrà il tab — fin che Vus smatgais Nova conversaziun. Cun conto vegn ella memorisada sin noss server. Per vegnir respundì va mintga messadi ad in purschider da models. Vossa clav ed ils pleds tegnids restan mo qua.",
  },

  auth: {
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
      "Quant che Heidi di davart quai che Vus avais scrit. Mai davart Vossa ortografia: il turitgais n'ha nagina scrittira gista, uschia n'i è nagut da far fallà.",
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
    bernTitle: "Ils films enconuschents èn bernais",
    bernBody:
      "Il film e las serias svizras vegnan per gronda part da Berna: chi che las lavura tras trenescha l'ureglia sin in dialect dus uras davent da Turitg. Bun da savair avant che Vus As dumandais pertge che nagut na tuna sco Voss vischins.",
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
    },
    articleLabel: "Artitgel",
    formsLabel: "Formas",
    exampleLabel: "En ina frasa",
  },

  practice: {
    title: "Exercitar",
    lead: "Otg dumondas, dus minutas. Or da las reglas che Heidi applitgescha sezza — ed or dals pleds che Vus avais tegnì.",
    note: "Quai che Vus tegnis resta en Voss navigatur. Las dumondas or dal vocabulari na dovran nagin conto.",
    start: "Cumenzar",
    restart: "Anc otg",
    progress: "Dumonda {n} da {total}",
    skip: "Sursiglir",
    show: "Mussar",
    knew: "Al saveva",
    missed: "Anc ina giada",
    next: "Vinavant",
    right: "Gist",
    wrong: "Betg dal tut",
    ask: {
      pairTarget: "Tge da quai è tudestg da Turitg?",
      pairBridge: "Tge da quai scrivessas Vus en Svizra?",
      article: "Tge artitgel va cun quel?",
      form: "Tge forma va bain?",
      cloze: "Tge pled manca?",
      recall: "Tge vul quai dir?",
    },
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
    doneTitle: "Quai basta per ussa.",
    doneAsked: "dumondas",
    doneRight: "la emprima giada",
    doneAgain: "vegnan puspè",
    savedHint: "En il chat tegnis Vus in pled cun +. El returna qua cur ch'igl è ura.",
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
    backToAll: "Tut ils idioms",
  },

  grammar: {
    practiseLabel: "Exercitar quai",
    practiseSay: "Dai mai duas frasas per exercitar «{word}» — lura ma dumandai davart ina.",
    title: "Grammatica",
    lead: "Quatter chaussas che rendan il turitgais difficil da suandar per insatgi che legia gia tudestg. Naginas lecziuns — mo quai che Vus vegnis a udir, e nua ch'igl impedescha.",
    ruleLabel: "La regla",
    watchLabel: "Nua ch'igl impedescha",
    topics: {
      "no-preterite": {
        title: "Nagin preterit",
        rule: "Il turitgais discurrì n'ha nagin passà simpel: tut il passà vegn dit cun il perfect.",
        watch: "Vus spetgais «ging», «war», «sagte» — e quai na vegn mai. Sche Vus udis «bi», «hät» u «händ» plus in particip, è quai il passà.",
      },
      "wo-relative": {
        title: "«wo» empè da der, die, das",
        rule: "Las relativas cumenzan bunamain adina cun «wo», nunvariabel, tge schlattaina u cas ch'i saja.",
        watch: "Vus legiais «wo» sco «nua?» e perdais la frasa. Qua vul quai dir «che», «il qual» — mai in lieu.",
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
    title: "Rundas da discurs",
    lead: "Webinars e rundas da conversaziun davart temas che vus proponis. E tranter quai: exercitar ad auta vusch, sulet, e laschar mesirar quai che sa mesirar onestamain.",
    signInFirst: "S’annunziai per proponer in tema ed esser dabot.",
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
    practiceLead: "Registrai Vus sezs discurrind dal tema. La registraziun resta sin Voss apparat.",
    record: "Registrar",
    stop: "Finì",
    recordingNow: "Registrescha",
    again: "Anc ina giada",
    micDenied: "Quai dovra l’access al microfon. Permettai el en la trav d’adressa da Voss navigatur.",
    micUnsupported: "Quest navigatur na po betg registrar. Empruvai sin il telefon u en in auter navigatur.",
    measured: "Mesirà",

    spokeFor: "discurrì",
    pauseLabel: "pausas",
    longestLabel: "pausa la pli lunga",
    runLabel: "en ina tratga",
    seconds: "s",

    saidTitle: "Tge avais Vus ditg?",
    saidWhy: "Nagin sistem na scriva si il tudestg svizzer fidadamain. Ils meglers translateschan il dialect en tudestg standard e bittan davent precis quai che Vus emprendais. Perquai scrivais Vus sezs Vossa frasa — e la scriver è gia la mesadad da l’exercizi.",
    saidPlaceholder: "Scrivai Vossa frasa uschia sco Vus l’avais ditg.",
    saidCheck: "Laschar controllar",
    checking: "Vegn controllà …",

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
      pauseCount: "{n} pausas tranter las tratgas da discurs.",
      meanRun: "En media avais Vus discurrì {n} secundas en ina tratga.",
      fewerPausesThanBefore: "{n} pausas damain che l’ultima giada.",
      morePausesThanBefore: "{n} pausas dapli che l’ultima giada. Quai po depender dal tema.",
      longerRunsThanBefore: "Vus avais discurrì {n} secundas pli ditg en ina tratga che avant.",
      nothingFlagged: "Naginas furmas d’in auter dialect chattadas.",
    },

    historyTitle: "Vossas registraziuns",
    historyEmpty: "Anc nagut registrà.",
    deleteTake: "Stizzar",
    privacy: "Il tun na bandunescha mai Voss apparat. Vegnan tegnidas mo las mesiraziuns e Voss agen text — en quest navigatur, betg tar nus.",
  },
};
