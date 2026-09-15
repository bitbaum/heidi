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
    method: "Metoda",
    contribute: "Far part",
    about: "Davart nus",
    portal: "Mes intschess",
    settings: "Configuraziuns",
    groupUse: "Duvrar",
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
    copy: "Copiar",
    copied: "Copià",
    flagged: "Betg tudestg da Turitg:",
    checkedNote: "Controllà tenor las furmas turitgaisas",
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
        body: "Oz: chapir e respunder a text ver. Lura: il laboratori da tadlar, nua che Vus udis ina vusch turitgaisa, Vus Vus adattais, e nus mesirain quant che Vus chapis d'ina autra. Quai dumonda registraziuns, ed ellas vegnan fatgas.",
      },
    ],
    stateTitle: "Nua che nus essan",
  },

  settings: {
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
      "Vossa conversaziun resta en questa tabella e svanescha cur che Vus la serrais. Ina atgna clav viva en la memoria da quest navigatur fin che Vus l'allontanais. Nagut da quai sa chatta sin noss servers. Era ils pleds che Vus tegnis restan qua, enfin che Vus als allontanais.",
  },

  auth: {
    signIn: "S'annunziar",
    signOut: "Sa deconnectar",
    signInWith: "S'annunziar cun OrangeCat",
    account: "Conto",
    portalTitle: "Mes intschess",
    portalLead:
      "Qua nascha Vossa part da Heidi: ils pleds che Vus avais tschertgà, persunas per exercitar, e tutuors sche Vus als vulais.",
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
      "Concretamain: l'emprim ulteriurs dialects tudestg-svizzers, lura ina lingua ordaifer la Svizra — la medema maschina, in auter pachet linguistic. Quai che nus emprendain sin la via, quai scrivain nus.",
  },

  errors: {
    notFoundTitle: "Questa pagina n'exista betg",
    notFoundBody: "Forsa è il link vegl, forsa avain nus spustà insatge.",
    backHome: "Turnar al cumenzament",
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
};
