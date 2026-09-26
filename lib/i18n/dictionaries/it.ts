import type { Dictionary } from "./de.ts";

export const it: Dictionary = {
  meta: {
    title: "Heidi — capire lo svizzero tedesco",
    description:
      "Capire quello che si dice davvero attorno a voi. Heidi decifra i messaggi reali, spiega le parole che ancora non conoscete e controlla ogni risposta secondo forme dialettali vere. Si comincia dallo zurighese.",
  },

  language: {
    notYet: "Questo testo non esiste ancora in italiano. Lo sta leggendo in",
    byDesign:
      "Questo testo è solo in tedesco e in inglese: si rivolge a chi vive qui. Lo sta leggendo in",
  },

  nav: {
    home: "Inizio",
    chat: "Chat",
    organisations: "Per le organizzazioni",
    speaking: "Parlare",
    practice: "Esercizi",
    listen: "Ascoltare",
    grammar: "Grammatica",
    dialect: "Dialetti",
    essays: "Blog",
    paper: "White paper",
    roadmap: "Tabella di marcia",
    changelog: "Registro delle modifiche",
    vocabulary: "Lessico",
    situations: "Situazioni",
    method: "Metodo",
    technology: "Tecnologia",
    contribute: "Partecipare",
    about: "Chi siamo",
    portal: "Il mio spazio",
    settings: "Impostazioni",
    privacy: "Protezione dei dati",
    impressum: "Note legali",
    investors: "Investitori",
    groupUse: "Usare",
    groupLearn: "Imparare",
    groupPractise: "Esercitarsi",
    groupAbout: "Su Heidi",
    skipToContent: "Vai al contenuto",
    sections: {
      how: "Come funziona",
      record: "Che cosa diciamo",
      who: "Chi c\u2019è dietro",
    },
    contents: "Indice",
    menu: "Menu",
    language: "Scegliere la lingua",
    langNational: "Lingue nazionali",
    langDialect: "Dialetto",
    langOther: "Altre lingue",
  },

  footer: {
    tagline: "Capire lo zurighese, e poi partecipare.",
    place: "Canton Zurigo, Svizzera",
    varietyName: "Zurighese",
    builtOn: "Fatto a Zurigo.",
    sections: "Pagine",
    projectTitle: "Progetto",
    languageTitle: "Lingua",
    openSource: "Costruito allo scoperto",
    openSourceNote: "Scriviamo quello che impariamo — anche ciò che non ha funzionato.",
    rights: "Heidi, Zurigo.",
  },

  home: {
    headline: "Capire lo svizzero tedesco. E poi scrivere come chi è di qui.",
    sub: "Per chi sa già il tedesco e a tavola continua a non capire nulla.",
    dialectTitle: "Cominciamo da Zurigo",
    dialectBody:
      "Lo svizzero tedesco non è una lingua ma una famiglia. Oggi Heidi conosce davvero bene lo zurighese, e preferisce dirvelo piuttosto che fingere di coprire tutto. È anche esattamente il motivo per cui la verifica rifiuta le forme bernesi: non perché il bernese sia sbagliato, ma perché in questo momento insegniamo Zurigo. Seguiranno altri dialetti — ciascuno con le proprie voci e la propria verifica.",
    dialectPlanned: "Previsto",
    dialectOthers: "Altri dialetti",
    trustTitle: "Ogni riga è verificata prima che la vediate",
    trustBody:
      "Un modello linguistico a cui si chiede lo svizzero tedesco vi darà volentieri del bernese, senza che possiate accorgervene. Da Heidi non è quindi il modello a decidere che cosa sia zurighese: lo fa un controllo a regole fisse, che potete eseguire voi stessi.",
    trustLink: "Provare la verifica",
    correspondencesTitle: "Una dozzina di regole apre centinaia di parole",
    pillarsTitle: "Come lavora Heidi",
    methodLink: "Tutto il metodo",
    researchLink: "Che cosa dice la ricerca",
    contributeTitle: "Cerchiamo voci zurighesi",
    contributeBody:
      "Ogni secondo di dialetto che sentirete su Heidi viene da una persona reale di Zurigo. Se ci lasciate registrare la vostra voce, scriveteci.",
    contributeCta: "Partecipare",
  },

  chat: {
    learn: {
      title: "Imparare da qui",
      breakdownLabel: "Parola per parola",
      breakdown: "Spiegami «{text}» parola per parola.",
      similarLabel: "Simile e contrario",
      similar: "Quali parole zurighesi hanno un senso simile a «{word}» — e qual è il contrario?",
      storyLabel: "Breve testo con",
      story: "Scrivimi un breve testo in zurighese con «{word}», con traduzione.",
      otherWaysLabel: "Detto altrimenti",
      otherWays: "Come si può dire altrimenti «{text}» in zurighese?",
      examplesLabel: "In altre frasi",
      examples: "Dammi altre tre frasi in zurighese con «{word}», ciascuna con traduzione.",
      aiNote: "Queste risposte le scrive il modello linguistico nella chat, controllate per le forme zurighesi.",
    },
    dock: {
      open: "Chiedi a Heidi",
      close: "Chiudi",
      title: "Heidi",
      lead: "Chieda di ciò che sta leggendo — o incolli un messaggio che ha ricevuto.",
      prompts: [
        "Come dico in zurighese che arrivo più tardi?",
        "Che differenza c'è tra il dialetto e il tedesco scritto?",
        "Mi dica tre parole che sentirò qui ogni giorno.",
      ],
    },
    emptyTitle: "Chieda a Heidi",
    placeholder: "Incollate quello che avete ricevuto — o scrivete quello che volete dire.",
    composer: "Messaggio a Heidi",
    saveWord: "Tenere questa parola",
    savedWord: "Tenuta",
    send: "Invia",
    thinking: "Heidi sta leggendo …",
    you: "Voi",
    exampleUnderstand: "Che cosa significa?",
    exampleCompose: "Scrivilo per me",
    examples: [
      { kind: "dialect", text: "Im Kauz scho, hät mer nöd so gfalle. Du au?" },
      { kind: "compose", text: "Di' loro che arrivo dieci minuti più tardi — gentilmente." },
      { kind: "dialect", text: "Häsch du am Samschtig scho öppis vor?" },
    ],
    glossTitle: "Parole da tenere",
    suggestionsTitle: "Da provare",
    sendThis: "Potete mandare questo",
    /**
     * The badge on a sendable line that is the WRITTEN standard rather than
     * dialect. The pair is the point: one to send a landlord, one to send a
     * friend, and no way to tell them apart without this.
     */
    writtenStandard: "tedesco scritto",
    copy: "Copia",
    copied: "Copiato",
    flagged: "Non è zurighese:",
    checkedNote: "Nessuna forma dialettale estranea trovata",
    mic: "Dettare",
    micStop: "Ferma la registrazione",
    micListening: "Sto ascoltando …",
    micTranscribing: "Sto trascrivendo …",
    micProblem: {
      mic: "Nessun accesso al microfono. Potete comunque scrivere.",
      silence: "Non ho sentito nulla. Premete di nuovo il microfono e parlate subito.",
      unavailable: "La dettatura non funziona in questo browser. Potete comunque scrivere.",
    },
    newChat: "Nuova conversazione",
    explanationsIn: "Spiegazioni in italiano",
    notConfigured: "Il modello linguistico non è ancora configurato su questa installazione.",
    unreachable: "Heidi non è raggiungibile. Controllate la connessione e riprovate.",
    stop: "Ferma",
    stopped: "Fermato. La risposta a metà è stata scartata — non era ancora stata controllata per le forme zurighesi.",
    failed: "Heidi non è riuscita a rispondere in questo momento. Riprovate tra poco.",
    cannotSeePicture:
      "Heidi non riesce a leggere immagini in questo momento. Mandate il testo, oppure collegate un vostro modello che legge le immagini.",
    retry: "Di nuovo",
    /**
     * The full-screen chat. Its own object so the homepage box — which shares
     * every other string in here — does not have to carry strings it never
     * renders.
     */
    full: {
      expand: "Schermo intero",
      title: "Chat",
      yourChats: "Le vostre conversazioni",
      noChats: "Ancora nessuna conversazione.",
      untitled: "Senza titolo",
      rename: "Rinomina",
      save: "Salva",
      cancel: "Annulla",
      delete: "Elimina",
      deleteAsk: "Eliminare questa conversazione?",
      deleteYes: "Elimina definitivamente",
      onThisDevice: "Questa conversazione esiste solo in questo browser.",
      signInToKeep: "Accedete per conservarla",
      adoptTitle: "Conservare questa conversazione?",
      adoptBody: "Avete scritto prima di accedere. Heidi può salvare la conversazione nel vostro account, oppure lasciarla qui nel browser.",
      adoptKeep: "Sì, salva",
      adoptDiscard: "Lasciala qui",
      menuOpen: "Conversazioni",
      menuClose: "Chiudi",
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
      title: "E adesso?",
      reply: { label: "Scrivere una risposta", say: "Come rispondo a questo?" },
      grammar: { label: "La grammatica dietro", say: "Spiegatemi la grammatica che c'è dietro." },
      shorter: { label: "Più breve", say: "Ditelo più brevemente." },
      warmer: { label: "Più caloroso", say: "Ditelo in modo un po' più caloroso." },
      firmer: { label: "Più deciso", say: "Ditelo in modo più deciso — ho già chiesto due volte." },
      formal: { label: "Più formale", say: "Scrivetelo in modo più formale, per un messaggio ufficiale." },
      casual: { label: "Più informale", say: "Ditelo in modo più informale, tra amici." },
      simpler: { label: "Più semplice", say: "Ditelo con parole più semplici." },
      decline: { label: "Rifiutare gentilmente", say: "Scriva questo come un rifiuto gentile." },
      apologise: { label: "Scusarsi", say: "Scriva questo come una scusa." },
      thank: { label: "Ringraziare", say: "Scriva questo come un ringraziamento." },
      ask: { label: "Chiedere chiarimenti", say: "Formuli una domanda di ritorno — non ho capito bene." },
      swiss: { label: "In tedesco scritto", say: "Scrivetelo in tedesco standard svizzero, non in dialetto." },
    },
  },

  model: {
    attach: "Allegare un'immagine",
    attachNeedsKey: "Il modello collegato non sa leggere le immagini",
    remove: "Rimuovere",
    connectTitle: "Collegare il vostro modello",
    connectLead:
      "Heidi legge gli screenshot gratuitamente. Con una vostra chiave API le risposte diventano più precise — soprattutto su un'immagine fitta — e le chiamate passano dal vostro fornitore invece che dal nostro.",
    whyTitle: "Perché non è semplicemente incluso?",
    whyBody:
      "Perché leggere un'immagine costa, per ogni immagine. Pagarlo per tutti vorrebbe dire far pagare Heidi. Così tutto il resto resta gratuito, e chi vuole di più porta la propria chiave.",
    safetyTitle: "Dove va la vostra chiave",
    safetyBody:
      "Resta in questo browser. A ogni messaggio ci viene inviata su una connessione cifrata, usata una volta presso il fornitore e poi scartata. Non la conserviamo, non la scriviamo in alcun registro e non la restituiamo mai.",
    providerLabel: "Fornitore",
    keyLabel: "Chiave API",
    keyPlaceholder: "sk-…",
    modelLabel: "Modello",
    getKey: "Ottenere una chiave",
    test: "Usare questo modello",
    testing: "Verifica in corso …",
    connected: "Collegato",
    connectedWith: "Collegato con",
    failed: "Non ha funzionato",
    pasteHint: "Incolli una chiave — Heidi la verifica subito e mostra quali modelli permette.",
    strongest: "il più potente",
    vendorSaid: "Il fornitore segnala:",
    unreachable: "Il fornitore non era raggiungibile. La sua chiave può essere corretta — riprovi tra un momento.",
    disconnect: "Rimuovere la chiave",
    open: "Il vostro modello",
    imageTooBig: "Questa immagine non può essere usata.",
    imagesLabel: "Allegato",
  },

  pillars: [
    {
      title: "Capire viene prima",
      body: "Ascoltare prima di parlare. In Svizzera, capire il dialetto e rispondere in tedesco standard è un modo completo e rispettato di appartenere. Ed è anche l'unico modo per non perdere l'esposizione: appena si vede che fate fatica, si passa all'alto tedesco.",
    },
    {
      title: "La vita reale è il programma",
      body: "Nessun esercizio inventato. Il messaggio arrivato stamattina, la frase sentita a pranzo, il rifiuto che dovete scrivere — questo è il materiale. Heidi aiuta subito e intanto registra ciò che non sapevate.",
    },
    {
      title: "Misurato, non gamificato",
      body: "Niente punti, niente percentuali inventate. Il numero che vogliamo mostrarvi è quanto capite di una voce zurighese sconosciuta — prima e dopo.",
    },
  ],

  method: {
    contents: "In questa pagina",
    title: "Il metodo",
    lead: "Heidi è costruita su ciò che la ricerca mostra davvero, non su ciò che si vende bene come corso di lingua. Questo porta ad alcune decisioni che a prima vista sorprendono.",
    sections: [
      {
        title: "La trappola da cui Heidi vi tira fuori",
        body: "Imparate il tedesco, vi trasferite a Zurigo e scoprite che non basta. A tavola si parla dialetto, non ne capite quasi nulla, e siccome si vede, tutti passano gentilmente all'alto tedesco o all'inglese. Proprio l'esposizione che vi farebbe migliorare vi viene tolta perché ne avreste bisogno. Heidi è una fonte di dialetto che non si sottrae.",
      },
      {
        title: "L'esposizione batte le regole",
        body: "Nel più ampio studio su come si capiscono le lingue affini, la pura quantità di esposizione contava più di qualsiasi misura di distanza linguistica. Non decide la grammatica, decide quanto avete sentito. Heidi non è quindi una serie di lezioni ma un luogo dove arriva continuamente dialetto vero.",
      },
      {
        title: "Le regole stanno dentro la pratica, non prima",
        body: "Chind, Huus, isch, guet — le regole fonetiche sono reali e utili. Ma l'unico test pulito di una lezione preliminare non ha mostrato alcun effetto misurabile. Ciò che invece funziona in modo dimostrabile: dire a qualcuno che cosa ascoltare, subito prima che lo riascolti. Heidi mostra quindi una regola alla volta, sempre accanto a una parola concreta.",
      },
      {
        title: "La prova è sempre una voce nuova",
        body: "Abituarsi a una sola persona è facile e non dimostra nulla. Conta se quanto appreso passa a una voce mai sentita. Heidi si allena quindi con molte voci e verifica sempre con una sconosciuta.",
      },
      {
        title: "Parlare viene per ultimo, e non è una mancanza",
        body: "Gli adulti raggiungono raramente una pronuncia nativa in un secondo dialetto, e in Svizzera questo pesa meno che quasi ovunque: capire il dialetto e rispondere in tedesco standard è normale e rispettato. Heidi non vi vende quindi l'ascolto come rimedio alla pronuncia — le prove sono deboli.",
      },
    ],
    loopTitle: "Il ciclo",
    loopSteps: [
      "Ricevete qualcosa che non capite.",
      "Heidi lo spiega subito — per intero, non come un indovinello.",
      "Una o due parole restano, perché sono state spiegate quando servivano.",
      "Le stesse parole tornano più tardi, in un'altra frase.",
      "Prima o poi le incontrate fuori, e Heidi non c'è.",
    ],
    loopNote:
      "L'ultimo punto è l'obiettivo. La maggior parte dei programmi vuole che torniate. Un prodotto per imparare dovrebbe volere che vi serva sempre meno.",
  },

  research: {
    title: "Che cosa dice la ricerca",
    lead: "I prodotti per l'apprendimento linguistico accumulano pseudoscienza perché «esiste uno studio» diventa molto in fretta «è dimostrato» e poi un prodotto intero. Teniamo separate tre cose: ciò che è accertato, ciò che supponiamo e ciò che è semplicemente una decisione.",
    factTitle: "Accertato",
    factNote: "Su questo ci basiamo.",
    hypothesisTitle: "Ipotesi",
    hypothesisNote: "Plausibile, non verificata — e Heidi è lo strumento di misura.",
    decisionTitle: "Decisione",
    decisionNote: "Scelte di prodotto che restano giuste anche se l'ipotesi non regge.",
    facts: [
      {
        claim: "L'esposizione batte la distanza linguistica.",
        detail:
          "Su 1833 ascoltatori e 70 coppie di lingue, l'esposizione alla lingua testata contava più della distanza lessicale, fonologica od ortografica.",
        source: ["gooskens-2018"],
      },
      {
        claim: "Allenarsi con molte voci è ciò che si trasferisce alle voci sconosciute.",
        detail:
          "Esercitarsi con una sola voce può rendere di più su quella voce e non si trasferisce. Confermato specificamente per i dialetti regionali.",
        source: ["lively-1993", "clopper-2004"],
      },
      {
        claim: "Dire che cosa ascoltare è un principio attivo, non un ornamento.",
        detail: "Stesso materiale, stesso riscontro: ha imparato solo il gruppo avvertito del contrasto rilevante.",
        source: ["pederson-2010"],
      },
      {
        claim: "Richiamare alla memoria con riscontro batte il rileggere.",
        detail: "222 studi, 48 478 studenti; g ≈ 0,50, e 0,54 con riscontro contro 0,37 senza.",
        source: ["yang-2021"],
      },
      {
        claim: "La pratica distribuita batte quella concentrata, e il vantaggio cresce nel tempo.",
        detail: "g ≈ 0,76 subito, g ≈ 1,15 dopo un intervallo, su 48 esperimenti e 3411 persone.",
        source: ["kim-webb-2022"],
      },
      {
        claim: "I sottotitoli aiutano — dopo il tentativo di ascolto, non durante.",
        detail:
          "Effetto ampio sul lessico (g ≈ 0,87), apparentemente perché il testo aiuta a tagliare il flusso sonoro in parole. Un testo sempre visibile diventa una stampella.",
        source: ["montero-perez-2013"],
      },
      {
        claim: "L'allenamento all'ascolto migliora solo debolmente la vostra pronuncia.",
        detail: "d ≈ 0,92 per la percezione, d ≈ 0,54 per la produzione, senza correlazione fra le due.",
        source: ["sakai-moorman-2018"],
      },
      {
        claim: "Scrivere in dialetto è digitalmente normale in Svizzera, non è gergo.",
        detail: "Per questo «scrivere come chi è di qui» è una competenza vera e non un gioco.",
        source: ["whatsup-uzh"],
      },
    ],
    hypotheses: [
      {
        claim: "Le regole consonantiche potrebbero predire l'intelligibilità meglio di quelle vocaliche.",
        detail:
          "È accertato che la distanza fonetica predice l'intelligibilità meglio di quella lessicale. Le cifre precise con cui questa pagina contrapponeva consonanti e vocali non le abbiamo potute verificare in nessuna fonte accessibile: l'affermazione sta quindi qui e non sotto «Accertato». Due delle nostre quattro regole in home page sono vocaliche, quindi la scommessa più debole.",
        source: ["gooskens-2007"],
      },
      {
        claim: "Le regole fonetiche funzionano come indizio dentro la pratica anche se falliscono come lezione.",
        detail:
          "L'unico test pulito della forma «lezione» — 50 minuti di olandese-frisone — non ha mostrato effetti significativi, e gli autori stessi mettono in guardia dal generalizzare. L'intera tradizione europea dell'intercomprensione è, a detta dei ricercatori di riferimento, praticamente non valutata. La nostra variante è quindi quella non testata. Perciò la misuriamo.",
        source: ["bergsma-2014"],
      },
      {
        claim: "Un breve adattamento migliora in modo misurabile la comprensione di una voce sconosciuta.",
        detail:
          "Ciò che è accertato dopo circa un minuto è una maggiore velocità di elaborazione — non più parole capite. Non sosteniamo quindi che un minuto vi faccia capire di più.",
        source: ["clarke-garrett-2004"],
      },
    ],
    decisions: [
      "Ascoltare prima di scrivere prima di parlare — giustificato dalla situazione linguistica, non solo dalle prove.",
      "Misurato anziché gamificato. Niente punti, niente numeri inventati.",
      "La voce di prova è sempre una che non avete sentito.",
      "Registrazioni zurighesi vere, perché ogni corpus zurighese disponibile è licenziato solo per la ricerca.",
      "Il modello non giudica mai il proprio dialetto.",
    ],
    honestyTitle: "Dove ci siamo corretti",
    honestyBody:
      "Questo sito ha scritto una volta che la forma «lezione» delle regole fonetiche era stata «testata e non aveva funzionato». Un solo studio di 50 minuti non regge quel peso, e faceva sembrare provata la nostra variante, che è invece quella non testata. Diceva anche che non esisteva una sintesi vocale svizzero-tedesca acquistabile; oggi non è più vero.",
  },

  check: {
    title: "Verifica del dialetto",
    intro: "Un elenco fisso di regole — non un modello linguistico. Controlla ogni riga che Heidi le mostra. Qui può farlo girare lei stessa.",
    placeholder: "Ig ha gseit, wosch es Miuch?",
    button: "Verifica",
    failed: "La verifica non era raggiungibile. Riprovi.",
    ok: "Nessuna forma estranea trovata. Può passare per zurighese.",
    okShort: "Pulito",
    failShort: "Trovato",
    suggests: "meglio",
    whyTitle: "Perché non è un dettaglio",
    whyBody:
      "Le forme bernesi, basilesi e della Svizzera orientale sono parole perfettamente corrette — solo non qui. Chi impara lo zurighese non può, per definizione, sentire la differenza. Ed è esattamente per questo che quella decisione non deve spettare a un modello linguistico.",
    noteTitle: "Sull'ortografia",
    noteBody:
      "Lo zurighese non ha un'ortografia ufficiale. Questa verifica non vi dirà mai che la vostra grafia è sbagliata — solo che una forma viene da un'altra regione.",
  },

  technology: {
    title: "Che cosa sa fare un computer con lo svizzero tedesco",
    lead: "E che cosa non sa fare. Questa pagina raccoglie ciò che è stato davvero misurato in questo campo — con i numeri e le fonti, così che possa verificare le nostre affermazioni.",
    hardTitle: "Perché è difficile",
    hardBody: [
      "Non esiste un'ortografia ufficiale. Esistono raccomandazioni del 1938 usate in dialettologia — ma persino i trascrittori formati le applicano in modo diverso, e quasi nessuno scrive così a un'amica.",
      "Si parla il dialetto, si scrive il tedesco standard. Mettere per iscritto ciò che è stato detto non è quindi una trascrizione ma una traduzione — ed è così che è costruito quasi tutto ciò che esiste.",
      "Ed è una lingua piccola nel senso che conta per i dati: le raccolte pubbliche maggiori sono di poche centinaia di ore, e quasi tutte hanno licenza solo per la ricerca.",
    ],
    corporaTitle: "Da dove vengono i dati",
    corporaLead: "Le raccolte pubbliche su cui poggia questo campo. La colonna «direzione» è quella da leggere: quasi tutto ascolta dialetto e scrive standard.",
    asrTitle: "Capire",
    asrLead: "Tasso di errore sulle parole, sullo stesso insieme di test, così i numeri sono confrontabili. Tutti questi sistemi producono tedesco standard — la cifra dice quanto bene hanno tradotto, non quanto bene hanno scritto in dialetto.",
    speakingTitle: "Parlare",
    speakingLead: "Qui il mercato inganna. Ciò che viene venduto come voce «svizzero tedesca» è di solito tedesco standard svizzero — la lingua scritta, letta ad alta voce. La vera sintesi dialettale esiste quasi solo nella ricerca.",
    modelsTitle: "Modelli linguistici",
    modelsLead: "Se un modello conosce davvero il dialetto, o se lo dice solo il comunicato stampa. «Valutato» significa che qualcuno l'ha misurato e pubblicato.",
    heidiTitle: "Che cosa significa per Heidi",
    heidiBody: [
      "La dettatura non scrive il dialetto. Scrive ciò che lei vuole dire, nella lingua che già possiede — esattamente ciò che la ricerca sa fare.",
      "Heidi legge ad alta voce, ma non pretende mai di parlare il dialetto. Un sintetizzatore a cui si chiede lo zurighese restituisce al massimo tedesco standard svizzero: la voce dice quindi che cosa è, e tace piuttosto che darle una voce inglese che legge il Züridütsch.",
      "Il controllo del dialetto funziona senza modello. È un elenco fisso di regole, non un modello linguistico — per questo non può mettersi a inventare.",
    ],
    engineTitle: "Quale modello le risponde",
    engineLead:
      "Letto dalla catena che prende davvero la richiesta, non da una frase scritta una volta. Per questo qui non può comparire un modello ritirato da mesi.",
    engineNotes: [
      "L\u2019ordine non è una classifica. La catena è ordinata per scarsità: chi ha meno capacità viene usato per ultimo. Il primo è quello che oggi ha spazio, non il migliore.",
      "Nessuno di questi modelli è l\u2019autorità sullo zurighese. Lo è il pack. Ogni riga generata passa un controllo a regole prima di essere mostrata — e quel controllo non è un modello.",
      "Senza chiave o senza quota la rotta risponde 503 e lo dice. Non finge di avere una risposta.",
    ],
    directionLabel: "Direzione",
    directions: {
      "speech-to-standard": "dialetto ascoltato → standard scritto",
      "speech-to-dialect": "dialetto ascoltato → dialetto scritto",
      "dialect-text": "dialetto, scritto",
      "text-to-speech": "testo → dialetto parlato",
    },
    hours: "ore",
    speakers: "parlanti",
    regions: "regioni",
    licence: "licenza",
    licences: { research: "solo ricerca", unpublished: "nessuna licenza pubblicata", textOnly: "testo; audio su richiesta" },
    wer: "tasso di errore sulle parole",
    zeroShot: "senza addestramento",
    fineTuned: "riaddestrato",
    speakingNames: {
      swissVendors: "Fornitori svizzeri che offrono il dialetto",
      commercial: "Voci commerciali «de-CH»",
      eth: "ETH Zurigo, Swiss Voice",
      vits: "T5 e VITS, pipeline di ricerca",
      voiceCloning: "Clonazione vocale da podcast",
    },
    weightsOpen: "pesi pubblicati",
    weightsClosed: "pesi non pubblicati",
    isDialect: "dialetto",
    isStandard: "tedesco standard svizzero",
    evaluated: "dialetto valutato",
    notEvaluated: "dialetto non valutato",
    statusResearch: "ricerca",
    statusService: "servizio",
    statusClosed: "cessato",
    evalTitle: "Che cosa misura Heidi quando parlate",
    evalLead:
      "L'esercizio di parlato vi registra e riporta ciò che si può davvero misurare — indicando in quale lingua. Nessun voto su cento, da nessuna parte.",
    evalNames: {
      delivery: "Erogazione",
      fluency: "Velocità e sequenze",
      words: "Parole e forme",
      grammar: "Grammatica",
      pronunciation: "Voto di pronuncia",
    },
    evalWhat: {
      delivery:
        "Dove c'era suono e dove no: pause, quanto è durata la più lunga, quanta parte della registrazione stavate davvero parlando. Non richiede alcuna trascrizione, e perciò funziona per un dialetto che nulla sa scrivere.",
      fluency:
        "Sillabe al secondo, e per quanto parlate prima di fermarvi. Fluenza nel senso della ricerca — come esce un pensiero, non quanto suona bene.",
      words:
        "Quali parole avete scelto, verificate con la stessa lista fissa di regole del controllo dialettale. Non l'opinione di un modello.",
      grammar:
        "Accordi, casi, forme verbali. Solo da una trascrizione nella lingua che avete davvero parlato — altrimenti la correzione riguarda parole inventate dalla macchina.",
      pronunciation:
        "Non viene prodotto. Un voto rispetto a un ideale nativo è un giudizio su una persona, e nessun miglioramento del riconoscimento lo renderebbe onesto.",
    },
    evalVerdicts: {
      target: "sul dialetto",
      bridge: "sul tedesco standard svizzero",
      none: "non ancora possibile",
      refused: "deliberatamente non offerto",
    },
    evalRefusedNote:
      "È proprio ciò che pubblicizza ogni concorrente. È la riga che lasciamo vuota di proposito.",
    evalFormLimit: "nessuna forma giudicata sopra",
    evalSource: "nel codice",
  },

  privacy: {
    title: "Che cosa succede alle sue parole",
    lead: "Heidi legge messaggi che le persone si sono scritte. È delicato, perciò questa pagina dice esattamente che cosa resta dove, e chi altro lo vede.",
    bindingNote: "Fa fede la versione tedesca.",
    flowsTitle: "Che cosa resta, e dove",
    flowsLead: "Ogni riga indica il luogo di memorizzazione, così può verificarlo da sé.",
    detail: {
      pictures: "ridimensionata nel browser; viene salvato solo un conteggio",
      speakingTranscription: "solo se sceglie il tedesco standard; l’audio non lo conserviamo, e la grammatica è controllata sul nostro server",
      speakingSuggestion: "solo la frase che lei ha confermato",
      account: "solo l\u2019identificativo — nessun nome e nessun indirizzo",
    },
    place: { device: "Solo sul suo dispositivo", server: "Sul nostro server", vendor: "Presso un fornitore" },
    col: { what: "Che cosa", where: "Dove", who: "Chi altro lo vede" },
    nobody: "nessun altro",
    flows: {
      draftConversation: "Conversazione senza account",
      savedConversation: "Conversazione con account",
      savedWords: "Parole tenute",
      practiceSeen: "Domande già poste",
      practiceModel: "Su che cosa state ancora lavorando",
      streak: "La sua serie e il suo obiettivo settimanale",
      roadmapFeedback: "I suoi voti, commenti e proposte sulla roadmap",
      syncSetting: "Se questo browser si sincronizza",
      syncOthers: "I suoi progressi da altri dispositivi",
      progressSync: "Progressi sincronizzati (solo se attivo)",
      certificates: "I suoi attestati",
      ownKey: "La sua chiave API",
      theme: "Aspetto chiaro o scuro",
      dictationVerdict: "Se la dettatura funziona in questo browser",
      dictation: "Dettatura",
      pictures: "Immagini",
      speakingTakes: "Registrazioni parlate",
      speakingTranscription: "Registrazione inviata per essere trascritta",
      speakingSuggestion: "Frase inviata per il controllo",
      account: "Account",
      groups: "Gruppi di studio",
      feedback: "Finestra di riscontro",
    },
    hostingTitle: "Dove si trova il server",
    hostingNote: "Non in Svizzera. Preferiamo dirlo noi che lasciarglielo scoprire.",
    vendorsTitle: "Chi risponde ai messaggi",
    vendorsNote: "Un messaggio viene inviato a una di queste aziende per essere elaborato. Non abbiamo un contratto di responsabile del trattamento con nessuna di esse. Heidi non è quindi adatta oggi a dati personali coperti da segreto professionale.",
    broughtKeyNote: "Con una chiave propria il messaggio va invece al fornitore che sceglie lei.",
    notDoneTitle: "Che cosa non facciamo",
    notDone: {
      analytics: "Nessuno strumento di analisi",
      advertising: "Nessuna pubblicità",
      profileSale: "Nessuna vendita di dati",
      trackingCookies: "Nessun cookie di tracciamento",
    },
    notDoneNote: "Verificabile: il codice è aperto e un test mantiene aggiornata questa affermazione.",
    rightsTitle: "Cancellare",
    rightsBody: "Ciò che è sul suo dispositivo lo rimuove lei stessa nelle impostazioni. Le conversazioni salvate si cancellano nella chat, e il testo sparisce davvero. Per il resto ci scriva.",
    contactTitle: "Contatto",
    updatedLabel: "Stato",
  },

  impressum: {
    title: "Note legali",
    operatorLabel: "Gestito da",
    contactLabel: "Contatto",
    sourceLabel: "Codice sorgente",
    statusLabel: "Forma giuridica",
    statusNote: "Heidi non è una società registrata. Il sito è gestito a titolo privato e il codice è aperto.",
    addressNote: "Indicheremo un indirizzo postale non appena ce ne sarà uno.",
  },

  contribute: {
    title: "Cerchiamo voci zurighesi",
    lead: "Ogni secondo di dialetto che sentirete su Heidi viene da una persona reale di Zurigo. È costoso e lento, e lo facciamo lo stesso.",
    whyTitle: "Perché non semplicemente voci sintetiche",
    whyBody:
      "La ragione onesta non è che non esista una sintesi vocale svizzero-tedesca — ormai esiste. La ragione è la licenza. Ogni corpus di parlato zurighese che abbiamo trovato è pubblicato per la ricerca e non per un prodotto. Chi ha bisogno di zurighese vero, con licenza pulita e consenso, deve registrarlo da sé. A questo si aggiunge ciò che le voci sintetiche fanno male comunque: il ritmo, le parole mangiate, l'esitazione, la differenza fra due persone dello stesso quartiere.",
    needTitle: "Che cosa ci serve",
    needList: [
      "Persone cresciute nel canton Zurigo, o che ci vivono da molto tempo.",
      "Frasi del tutto ordinarie — non letture di letteratura.",
      "Età, generi, quartieri e velocità di parlato diversi.",
      "Venti minuti del vostro tempo, da voi o da noi.",
    ],
    rolesTitle: "Quattro modi di partecipare",
    rolesLead:
      "In ordine di impegno, dal più piccolo — ed è il più piccolo che vale di più per noi. Ognuno dice che cosa esiste già nel prodotto oggi.",
    todayLabel: "Allo stato attuale",
    roleCta: "Ci scriva a questo proposito",
    roleSee: "Dare un\u2019occhiata",
    learnerTitle: "E se sta imparando",
    consentTitle: "Che cosa succede alla registrazione",
    consentBody:
      "Il controllo resta vostro. Vi diciamo in anticipo a che cosa servirà la registrazione, potete ritirarla, e il consenso per il prodotto non è quello per la ricerca. Diamo per scontato che il secondo non lo vogliate, finché non lo dite esplicitamente.",
    ctaTitle: "Scriveteci",
    ctaBody: "Basta un messaggio breve. Diteci da quale parte del cantone venite.",
    ctaButton: "Scrivere un'e-mail",
  },

  about: {
    title: "Chi è Heidi",
    lead: "Heidi è fatta a Zurigo, da persone che hanno avuto lo stesso problema. Costruiamo allo scoperto — comprese le parti che non hanno funzionato.",
    sections: [
      {
        title: "Perché esiste",
        body: "Perché moltissime persone qui fanno la stessa strada: imparare il tedesco, trasferirsi, e poi scoprire che la parte decisiva della lingua non è scritta da nessuna parte. Non è un problema di nicchia ma l'esperienza ordinaria di questa città.",
      },
      {
        title: "Come lavoriamo",
        body: "Prima abbiamo letto che cosa dice la ricerca, e solo dopo abbiamo costruito. Tre risultati hanno ribaltato il piano che altrimenti avremmo realizzato. Quello che abbiamo imparato è sulla pagina della ricerca — compresi i punti in cui abbiamo dovuto correggerci in pubblico.",
      },
      {
        title: "Che cosa manca ancora",
        body: "Oggi: capire e rispondere a testo vero, sentire una risposta letta ad alta voce, e un registro di dove il dialetto si parla davvero in onda. Poi: il laboratorio di ascolto, dove sentite una voce zurighese, vi ci abituate, e misuriamo quanto cogliete di un'altra. Servono registrazioni, e si stanno facendo.",
      },
    ],
    stateTitle: "A che punto siamo",
  },

  settings: {
    appearanceTitle: "Aspetto",
    appearanceBody: "Chiaro, scuro, o come è impostato il suo dispositivo. La scelta resta in questo browser.",
    theme: { label: "Aspetto", system: "Dispositivo", light: "Chiaro", dark: "Scuro" },
    title: "Impostazioni",
    lead: "Tutto quello che Heidi sa di voi, in un posto solo — e tutto si può togliere.",
    languageTitle: "Lingua del sito",
    languageBody: "In che lingua Heidi vi parla. Quello che imparate resta lo zurighese.",
    modelTitle: "Modello linguistico",
    modelBody: "Per impostazione predefinita Heidi usa modelli gratuiti, che sanno leggere le immagini. Una vostra chiave rende le risposte più precise.",
    modelNone: "Nessun modello vostro collegato",
    accountTitle: "Account",
    accountBody: "Per conservare le vostre parole e per i gruppi di studio. Tradurre non richiede un account.",
    dataTitle: "Che cosa resta su questo dispositivo",
    dataBody:
      "La sua conversazione resta in questo browser — anche dopo la chiusura della scheda — finché non preme Nuova conversazione. Con l’account viene invece salvata sul nostro server. Per essere elaborato, ogni messaggio va a un fornitore di modelli. La sua chiave e le parole tenute restano solo qui.",
    dataEmpty: "Questo browser non contiene nulla di vostro.",
    dataForget: "Elimina",
    dataExport: "Scarica tutto",
  },

  auth: {
    sections: {
      focus: "Dove vi bloccate",
      mastered: "Acquisito",
      review: "Ripassare",
      recent: "Conversazioni",
      patterns: "Regolarità",
      words: "Parole",
      groups: "Gruppi",
      onward: "Avanti",
    },
    menu: {
      portal: "Le sue parole e conversazioni",
      settings: "Lingua, modello, account",
    },
    signIn: "Accedi",
    signOut: "Esci",
    signInWith: "Accedi con OrangeCat",
    account: "Account",
    portalTitle: "Il mio spazio",
    portalLead:
      "Le vostre parole, quando è il momento di rivederle — e quello che vi ferma più spesso.",
    signedInAs: "Connesso come",
    notSignedIn: "Non avete effettuato l'accesso",
    notSignedInBody:
      "Accedete perché Heidi possa ricordare quello che ancora non sapevate. Tutto il resto continua a funzionare senza — la traduzione e la verifica del dialetto non richiedono un account.",
    whyTitle: "Perché OrangeCat",
    whyBody:
      "Heidi non tiene un proprio archivio di utenti. La vostra identità vive su OrangeCat, dove profili e pagamenti sono già di casa. Significa un solo account per più prodotti, nessuna password in più — e qui niente che possa essere rubato.",
    soonTitle: "Che cosa arriva dopo",
    soonList: [
      "Tutor — volontari, pagati, e mai obbligatori.",
    ],
    unavailable: "L'accesso non è ancora configurato su questa installazione.",
    errorTitle: "L'accesso non ha funzionato",
    errorBody: "Qualcosa è andato storto. Riprovate, oppure tornate all'inizio.",
    tryAgain: "Riprovare",
  },

  vision: {
    title: "Dove porta tutto questo",
    lead: "Lo svizzero tedesco è l'inizio, non la meta. Il metodo non è specifico della Svizzera.",
    points: [
      {
        title: "Di lingue così ce ne sono molte",
        body: "In tutto il mondo esistono lingue e dialetti troppo piccoli perché un grande editore di corsi se ne interessi — e che sono al tempo stesso esattamente ciò che serve per appartenere davvero. Si può padroneggiare perfettamente la lingua ufficiale e restare comunque fuori, a tavola.",
      },
      {
        title: "È proprio qui che i grandi falliscono",
        body: "I corsi di lingua seguono il mercato, e il mercato segue il numero di parlanti. Restano qualche dizionario, qualche corpus di ricerca che non si può usare commercialmente, e nessuna registrazione su cui esercitarsi. Heidi è costruita per questo vuoto.",
      },
      {
        title: "Il metodo si trasferisce",
        body: "Gli adulti che già padroneggiano una lingua affine non devono ricominciare da zero — devono reimparare ciò che già possiedono. Vale per il tedesco standard e lo zurighese come per molte altre coppie. Per questo in Heidi la lingua insegnata è configurazione sostituibile e non qualcosa scritto nel codice.",
      },
    ],
    closing:
      "Concretamente: prima altri dialetti svizzero-tedeschi, poi una lingua fuori dalla Svizzera — la stessa macchina, un altro pacchetto linguistico. La metà parlata viaggia con noi: ognuna di queste lingue si sente molto più di quanto si scriva, e per ognuna esistono media che nessuno ha diviso fra dialetto e lingua standard. Quello che impariamo per strada, lo scriviamo.",
  },

  voice: {
    speak: "Leggi ad alta voce",
    stop: "Ferma",
    unsupported: "Questo browser non può leggere nulla ad alta voce.",
    claim: {
      swissStandard: "Voce in tedesco standard svizzero — non in dialetto zurighese.",
      german: "Una voce dalla Germania. Il suo apparecchio non ne ha una svizzera.",
      none: "Questo apparecchio non ha alcuna voce tedesca. Heidi preferisce tacere piuttosto che leggere il tedesco con una bocca inglese.",
    },
    dialectCaveat:
      "Una macchina legge una grafia dialettale con una voce di tedesco standard. Utile per individuare la parola nella frase, mai per copiarne la pronuncia.",
    settingsTitle: "La voce di Heidi",
    settingsBody:
      "Non viene detto nulla finché non lo chiede lei. Nessun browser porta con sé una voce zurighese: il massimo che un apparecchio offre è il tedesco standard svizzero, e Heidi dice ogni volta che cosa sta sentendo.",
    speakAnswers: "Leggi le risposte ad alta voce",
    rate: "Velocità",
    correctionTitle: "Correzioni",
    correctionBody:
      "Quanto Heidi dice delle parole di un esercizio orale, dopo che lei ha scritto quello che ha detto. Mai della sua ortografia: lo zurighese non ha una grafia corretta, quindi non c'è nulla da sbagliare — e mai di quello che scrive in chat, perché un messaggio che le ha mandato qualcun altro sembra identico a uno suo.",
    correctionLevels: {
      off: "Non dire nulla",
      blocking: "Solo ciò che non è affatto svizzero tedesco",
      all: "Anche le forme di un altro dialetto",
    },
    correctionHelp: {
      off: "Heidi risponde e lascia stare le sue parole.",
      blocking: "L'impostazione consueta. Cose che nessuno svizzero scrive, come la ß.",
      all: "Aggiunge il bernese e altre regioni — parole vere, nel posto sbagliato.",
    },
    silence: {
      off: "Le correzioni sono disattivate.",
      spoken:
        "Heidi non corregge il parlato. Quello che restituisce il riconoscimento vocale è la sua grafia e non la sua — scrive tedesco standard qualunque cosa lei abbia detto. Segnalarlo significherebbe correggere la macchina e addebitarlo a lei.",
      clean: "Nulla da segnalare.",
    },
    cannotHear:
      "Se la sua pronuncia sia giusta, Heidi non può dirglielo. Oggi non può farlo nulla in modo affidabile. Quello che può fare è capirla e risponderle.",
  },

  listening: {
    title: "Dove sentirlo",
    lead: "La Svizzera produce moltissima radio, televisione e cinema in dialetto, in gran parte gratis. Solo che a chi impara nessuno dice che cosa sia davvero dialetto — perciò qui è la prima cosa indicata per ogni voce.",
    todayTitle: "Se ha venti minuti",
    todayBody:
      "Tre per cominciare, domani altri. Uno per genere, il più dolce per primo, e tutti si vedono anche fuori dalla Svizzera — un catalogo le dice che cosa esiste, che non è lo stesso che dirle che cosa fare adesso.",
    diglossiaTitle: "Metà dei media svizzeri non è in dialetto",
    diglossiaBody:
      "Il telegiornale della sera si legge in tedesco standard; la rubrica subito dopo è in dialetto. Un'ora passata sulla Tagesschau è un'ora nel tedesco che lei ha già.",
    basisNote:
      "Le etichette derivano dal formato di ogni trasmissione. Nessuno qui le ha ascoltate tutte annotando ciò che sentiva: sono quindi deduzioni prudenti e non misurazioni, e resterà scritto finché qualcuno non farà quel lavoro.",
    spoken: { dialect: "Dialetto", standard: "Tedesco standard svizzero", mixed: "Entrambi" },
    voices: { one: "Una voce", few: "Poche voci", many: "Molte insieme" },
    subtitles: {
      standard: "Sottotitoli in tedesco standard",
      auto: "Sottotitoli automatici",
      none: "Senza sottotitoli",
    },
    scripted: "Letto da un testo",
    spontaneous: "Parlato a braccio",
    reachCh: "Si vede solo in Svizzera",
    about: "Di che cosa si tratta",
    medium: {
      podcast: "Podcast",
      radio: "Radio",
      youtube: "YouTube",
      tv: "Televisione",
      series: "Serie",
      film: "Film",
    },
    filmsTitle: "Quale dialetto sentirà",
    filmsBody:
      "Il cinema svizzero non è un accento solo. Ogni voce dice da quale area dialettale viene, così può scegliere fra quello che si parla intorno a lei e quelli che incontrerà in treno. Berna è molto presente perché è lì che si fa gran parte della fiction svizzera — e i film zurighesi esistono, e sono qui.",
    commentary: {
      "der-bestatter":
        "Bernese, e la serie che qui hanno visto quasi tutti — il dialetto che uno svizzero imiterà se gli chiede di fare un accento.",
      "wilder":
        "Un poliziesco su più stagioni e più aree dialettali. Utile per sentire che lo svizzero tedesco non è una cosa sola.",
      "tschugger":
        "Vallesano, per cui gli altri svizzeri hanno bisogno dei sottotitoli. Una battuta fra svizzeri — e davvero non un inizio.",
      "neumatt":
        "Bernese, una famiglia di contadini. Il registro dei litigi in famiglia, non quello della televisione.",
      "die-schweizermacher":
        "Zurighese del 1978, e ancora il film su come si diventa svizzeri. L'accento nel frattempo si è spostato, il che vale la pena sentire.",
      "mein-name-ist-eugen":
        "Bernese, e in gran parte bambini che parlano — più lentamente e più nitidamente degli adulti.",
      "der-goalie-bin-ig":
        "Bernese fitto, da un romanzo scritto in quella lingua. Il titolo è una lezione di grammatica: il verbo è `bin` e il pronome viene per ultimo.",
      "achtung-fertig-charlie":
        "Commedia militare, e il riferimento condiviso da quasi ogni svizzero sotto i cinquanta.",
      "bon-schuur-ticino":
        "Una commedia la cui premessa è la questione linguistica stessa — che cosa succede se il paese deve sceglierne una.",
      "die-goettliche-ordnung":
        "Appenzello nel 1971, donne che lottano per il voto. Dialetto della Svizzera orientale, e un pezzo di storia su cui le faranno domande: Appenzello Interno ammise le donne alla sua Landsgemeinde solo nel 1990, molto dopo la fine del film.",
      "zwingli":
        "La Riforma zurighese, in zurighese. Uno dei pochi lungometraggi nella varietà che qui si insegna davvero.",
      "wolkenbruch":
        "Zurighese con accanto lo yiddish — una seconda lezione su quanto vicine possano stare due lingue restando due.",
      "platzspitzbaby":
        "Zurighese, gli anni dell'eroina in città visti da una bambina. Tema duro, pronuncia insolitamente chiara.",
      "heidi-2015":
        "Fatto per bambini, quindi parlato lentamente e con semplicità. Probabilmente il film più facile di questa lista — ambientato nei Grigioni senza parlarne il dialetto.",
      "seitentriebe":
        "Svizzero tedesco quotidiano fra coppie — le mezze frasi e le interruzioni che la lingua televisiva leviga.",
    },
  },

  errors: {
    notFoundTitle: "Questa pagina non esiste",
    notFoundBody: "Forse il link è vecchio, forse abbiamo spostato qualcosa.",
    backHome: "Torna all'inizio",
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
    keptTitle: "Parole tenute",
    keptNone: "Tocchi + per tenere una parola. Heidi gliela richiederà più tardi.",
    keptSome: "in ripasso",
    practise: "Ripassa ora",
    askLabel: "Mostrala in una frase",
    askSay: "Mi mostri «{word}» in due brevi frasi di tutti i giorni.",
    title: "Le parole più utili",
    lead: "Non le parole da turista, ma quelle su cui una frase si inceppa: le corte, le costanti, quelle che nessuna regola di corrispondenza recupera.",
    note: "Direzione: dialetto → tedesco. Qui si tratta di capire, non di scrivere — quello che dovreste scrivere voi si trova nella sezione dei dialetti.",
    groups: {
      function: "Parole piccole, grande effetto",
      verbs: "Verbi che tornano di continuo",
      everyday: "Vita quotidiana",
      greetings: "Saluti e cortesia",
      helvetisms: "Parole che pensa di conoscere già",
      slang: "Gergo, colloquiale e volgare",
    },
    register: { casual: "colloquiale", rude: "volgare" },
    mistakenForLabel: "Non: {assumed}",
    articleLabel: "Articolo",
    formsLabel: "Forme",
    exampleLabel: "In una frase",
    filterLabel: "Filtrare le parole",
    filterPlaceholder: "Scrivete in dialetto o in tedesco …",
    noMatches: "Nessuna parola corrisponde.",
    clearFilter: "Azzera",
    practiseGroup: "Esercitarsi su questo gruppo",
    jumpLabel: "Vai a",
    saidInTitle: "Detto in",
  },

  sync: {
    title: "I progressi su tutti i dispositivi",
    body: "Esercizi, serie e parole salvate vengono allineati tra i suoi dispositivi con accesso. Disattivato, tutto resta solo in questo browser.",
    signInFirst: "Acceda per avere i suoi progressi su tutti i dispositivi.",
    turnOn: "Attivare",
    turnOff: "Disattivare",
    on: "Attivo — questo browser si allinea con gli altri suoi dispositivi.",
    deleteAll: "Eliminare tutto ciò che è sincronizzato",
    deleted: "Eliminato. Sul server non resta nulla dei suoi progressi.",
    failed: "Non ha funzionato. Riprovi.",
  },
  certificate: {
    title: "Attestato",
    get: "Rilasciare l’attestato",
    getting: "Verifica in corso …",
    view: "Vedere l’attestato",
    syncFirst: "Acceda e attivi «I progressi su tutti i dispositivi» nelle impostazioni. L’attestato viene rilasciato sul server a partire dai suoi progressi sincronizzati, non da questo browser.",
    notYet: "Sul server per ora sono sicure {held} frasi su {total} — la sincronizzazione sta recuperando. Riprovi tra un minuto.",
    failed: "Non ha funzionato. Riprovi.",
    holder: "Chi detiene questo attestato",
    statement: "ha capito ripetutamente, nella situazione «{scene}», ciascuna delle {total} frasi su cui Heidi pone domande.",
    measured: "{held} frasi sicure su {total}, di cui {stuck} di nuovo dopo una pausa.",
    issued: "Rilasciato il {date}",
    idLabel: "N. attestato",
    method: "Come verifica Heidi",
    scope: "Un attestato di comprensione orale in una situazione — non un diploma di lingua.",
    nameLabel: "Nome per la stampa (non salvato)",
    print: "Stampare",
    notFound: "Questo attestato non esiste.",
  },
  team: {
    title: "Team",
    lead: "Scelga su che cosa lavora il suo team. I membri decidono da sé se mostrarle a che punto sono in queste situazioni — mai quali frasi, né che cosa hanno sbagliato.",
    focusLabel: "Tema",
    none: "Nessun team — un gruppo di studio",
    overviewEmpty: "Nessuno nel team le mostra ancora i propri progressi. Ogni membro può attivarlo nella pagina del gruppo.",
    private: "non condivide",
    noSync: "condivide, ma non ha attivato «I progressi su tutti i dispositivi» — ancora nulla da vedere",
    ready: "{n} situazioni sicure su {total}",
    certificates: "Attestati: {n}",
    new: "nuovo",
    met: "iniziato",
    steady: "quasi",
    sure: "sicuro",
    shareTitle: "I suoi progressi nel team",
    shareBody: "Mostra a {name} a che punto è nelle situazioni del team — mai quali frasi, né che cosa ha sbagliato. Nelle impostazioni dev’essere attivo «I progressi su tutti i dispositivi».",
    shareOn: "Condividere con {name}",
    shareOff: "Non condividere più",
    sharing: "Lei condivide i suoi progressi.",
    failed: "Non ha funzionato. Riprovi.",
  },
  streak: {
    title: "La sua serie",
    start: "Inizi oggi — bastano poche domande.",
    doneToday: "Oggi ha già fatto pratica.",
    weekReached: "Obiettivo settimanale raggiunto.",
    goalLabel: "Obiettivo settimanale",
    freezes: "Un giorno saltato viene colmato automaticamente ({n} rimasti).",
    practise: "Esercitarsi ora",
    days: {"one": "{n} giorno di fila", "few": "{n} giorni di fila", "many": "{n} giorni di fila", "other": "{n} giorni di fila"},
    best: {"one": "Record: {n} giorno", "few": "Record: {n} giorni", "many": "Record: {n} giorni", "other": "Record: {n} giorni"},
    goalDays: {"one": "{n} giorno a settimana", "few": "{n} giorni a settimana", "many": "{n} giorni a settimana", "other": "{n} giorni a settimana"},
    week: {"one": "Questa settimana: {n} di {goal} giorno", "few": "Questa settimana: {n} di {goal} giorni", "many": "Questa settimana: {n} di {goal} giorni", "other": "Questa settimana: {n} di {goal} giorni"},
  },
  practice: {
    title: "Esercizi",
    lead: "Una serie breve di domande, pochi minuti. Costruite sulle regole che Heidi stessa applica, sulle frasi che si dicono davvero — e sulle parole che avete tenuto.",
    note: "Quello che tenete resta nel vostro browser — a meno che non attiviate «I progressi su tutti i dispositivi» nelle impostazioni. Le domande tratte dal vocabolario non richiedono alcun account.",
    start: "Comincia",
    restart: "Ancora",
    progress: "Domanda {n} di {total}",
    secondTry: "Secondo tentativo",
    skip: "Salta",
    show: "Mostra",
    knew: "La sapevo",
    missed: "Da rivedere",
    next: "Avanti",
    explain: {
      show: "Spiegazione",
      ruleTitle: "La regola",
      watchTitle: "Dove ci si inceppa",
      contextTitle: "Nella conversazione",
      wordTitle: "La parola",
      saidInTitle: "Detto anche in",
      askTitle: "Continuare con Heidi",
      moreOnTopic: "Di più su questo tema",
      practiseTopic: "Esercitare proprio questo",
      openScene: "Tutta la situazione",
      practiseScene: "Esercitare questa situazione",
      practiseWord: "Esercitare questa parola",
      alsoInPack: "Nel pacchetto c'è anche: {words}",
    },
    right: "Giusto",
    wrong: "Non proprio",
    ask: {
      pairTarget: "Quale delle due è zurighese?",
      pairBridge: "Quale delle due scrivereste in Svizzera?",
      article: "Quale articolo vuole?",
      form: "Quale forma va bene?",
      cloze: "Quale parola manca?",
      recall: "Che cosa vuol dire?",
      match: "Che cosa va insieme?",
      gaptext: "Quali parole mancano?",
      pick: "Quale parola va qui?",
      translate: "Come si dice in zurighese?",
      card: "Se lo ricorda ancora?",
    },
    matchHint: "Toccate una parola, poi il suo significato.",
    gapHint: "Toccate una parola — entra nel buco successivo. Toccate un buco pieno per riprenderla.",
    check: "Verificare",
    typeLabel: "Scrivetelo voi — facoltativo",
    typePlaceholder: "Scrivete la vostra risposta …",
    youWrote: "Avete scritto",
    translateLabel: "Lo scriva in zurighese",
    packSays: "Il pack dice",
    spellingNote:
      "Lo zurighese non ha un’ortografia fissata. Scritto diversamente non vuol dire scritto male — confronti lei stesso e decida.",
    cardRecognise: "Dialetto → significato",
    cardProduce: "Significato → dialetto",
    cardTurn: "Girare",

    modeTitle: "Come vuole esercitarsi?",
    modeMixed: "Misto",
    modeMixedNote: "Un po’ di tutto, mescolato — la via normale.",
    modeTap: "Toccare",
    modeTapNote: "Solo scegliere. Niente tastiera, basta una mano.",
    modeWrite: "Scrivere",
    modeWriteNote: "Digitare frasi intere. Il confronto lo fa lei.",
    modeCard: "Carte",
    modeCardNote: "Parola davanti, significato dietro. Il più rapido.",

    flowTitle: "Esercizio o prova?",
    flowPractice: "Esercizio",
    flowPracticeNote: "Risposta e spiegazione subito dopo ogni domanda.",
    flowTest: "Prova",
    flowTestNote: "Prima tutte le domande, poi tutte le risposte con la spiegazione.",

    testLead:
      "{total} domande di seguito. Heidi non dice nulla per strada — risposte e spiegazioni arrivano tutte alla fine.",
    testOnlyObjective:
      "Una prova contiene solo domande che si possono correggere senza discussione. Scrittura e carte le valuta lei: si esercitano, non si misurano.",
    testStart: "Iniziare la prova",
    testProgress: "{n} di {total}",
    testAnswer: "Registrare",
    testTimerOff: "Senza tempo",
    testTimerSet: "{n} min",
    testTimerAdd: "+{n} min",
    testTimerLabel: "Mettere un tempo?",
    testTimerLeft: "Restano {time}",
    testTimeUp: "Il tempo è finito. Qui sotto c’è tutto quello che ha risposto.",
    testDone: "Finire",
    testResultsTitle: "Le sue risposte",
    testResultsCount: "{right} su {asked} giuste al primo colpo",
    testResultsLead: "Ogni domanda di nuovo, con quello che ha scelto e la strada verso la spiegazione.",
    testYourAnswer: "Ha scelto",
    testCorrectAnswer: "La risposta è",
    testUnanswered: "Senza risposta",
    testAgain: "Un’altra prova",
    focusTitle: "Dove vi bloccate",
    focusEmpty:
      "Ancora niente. Appena avrà risposto a qualche domanda, qui comparirà ciò che continua a coglierla in fallo — e un clic esercita proprio quello.",
    focusLead: "Questo vi torna sbagliato di continuo. Un tocco esercita solo quello.",
    scopedTo: "Solo: {what}",
    scopeAll: "Esercitarsi su tutto",
    scopeEmpty:
      "Su questo non ci sono ancora domande. Non vuol dire che l'argomento non conti — solo che il pack non ne ha ancora esempi.",
    origin: "L'altra è {origin}.",
    persons: {
      ich: "io",
      du: "tu",
      er: "lui / lei",
      mir: "noi",
      ihr: "voi",
      si: "loro",
      plural: "plurale",
      past: "passato",
    },
    grammarLink: "La grammatica dietro a questo",
    wordLink: "Questa parola nel vocabolario",
    ruleLink: "La regola dietro",
    situationLink: "La situazione da cui viene",
    doneTitle: "Per adesso basta così.",
    doneAsked: "domande",
    doneRight: "al primo colpo",
    doneAgain: "da rivedere",
    againTitle: "Da rivedere",
    whyTitle: "Perché gli esercizi sono fatti così",
    whyLead:
      "Ogni decisione qui si può verificare. Dove la ricerca dà una direzione e non un numero, il numero è indicato come nostra stima — non come un risultato.",
    why: [
      {
        claim: "Essere interrogati batte rileggere.",
        detail:
          "Per questo nessun esercizio rivela prima la risposta. Su 222 studi, il vantaggio del test sul ripasso è g ≈ 0,50.",
        source: ["yang-2021"],
      },
      {
        claim: "Più tardi è meglio di presto — e il vantaggio cresce nel tempo.",
        detail:
          "Per questo una parola tenuta torna dopo 1, 3, 7, 16 e 35 giorni invece che ogni giorno. Meta-analisi in seconda lingua: g ≈ 0,76 al test immediato, g ≈ 1,15 a quello differito.",
        source: ["kim-webb-2022"],
      },
      {
        claim: "Una risposta giusta non basta; due, distanziate, sono il punto.",
        detail:
          "Per questo una domanda sbagliata torna nella stessa seduta — tre domande dopo, non subito. L'intervallo di tre è una nostra stima: lo studio dà la direzione, non il numero.",
        source: ["rawson-dunlosky-2011"],
      },
      {
        claim: "Scegliere senza riscontro può fissare la forma sbagliata.",
        detail:
          "Per questo ogni domanda a scelta mostra subito la risposta giusta e ritorna più tardi. Il riscontro rafforza il beneficio e riduce proprio quel danno.",
        source: ["butler-roediger-2008"],
      },
      {
        claim: "Produrre da sé si ricorda meglio che leggere.",
        detail:
          "Per questo ci sono frasi da completare e domande aperte, non solo scelte. L'effetto è solido, ma più piccolo della sua fama.",
        source: ["bertsch-2007"],
      },
      {
        claim: "Alternare aiuta — ma non sempre, e lo diciamo.",
        detail:
          "Per questo due domande dello stesso tipo non si susseguono. La meta-analisi è chiara: il beneficio dipende da quanto è simile il materiale, e su materiale molto simile alternare può nuocere.",
        source: ["brunmair-richter-2019"],
      },
      {
        claim: "Niente punti, niente percentuali — e una serie senza rimproveri.",
        detail:
          "I punti misurano quanta Heidi avete consumato mentre sembrano misurare l'apprendimento. La serie conta solo i giorni in cui vi siete esercitati e non finisce mai con «persa». Qui ci sono numeri su ciò che avete fatto.",
        source: ["yang-2021"],
      },
    ],
    whyMore: "Tutto il metodo",
    savedHint: "Nella chat tenete una parola con +. Torna qui quando è il momento.",
  },

  essays: {
    title: "Blog",
    lead: "Perché la Svizzera tedesca parla come parla. Testi più lunghi, con le fonti — per le domande che non stanno su una cartina.",
    none: "Qui non c'è ancora nulla.",
    backToAll: "Tutti i testi",
    notTranslated: "Questo testo non esiste ancora in italiano. Lo state leggendo in",
    sourcesTitle: "Fonti",
  },
  dialect: {
    title: "Lo svizzero tedesco",
    lead: "Che cos'è, perché non lo capite pur sapendo il tedesco — e quale dialetto si parla dove.",
    spokenTitle: "Parlato, non scritto",
    spokenBody: "Lo svizzero tedesco è la lingua parlata di ogni giorno — e quella scritta fra persone che si conoscono: SMS, WhatsApp, appunti. Tutto ciò che è ufficiale si scrive in tedesco standard svizzero. Servono entrambi, e chi conosce solo l'uno finisce per mandare un messaggio in dialetto all'assicurazione.",
    noStandardTitle: "Nessuna ortografia ufficiale",
    noStandardBody: "Non esiste un'ortografia ufficiale. La stessa parola viene scritta in modo diverso da due persone, e hanno ragione entrambe. Per questo Heidi non dirà mai che la vostra grafia è sbagliata — solo come la scriviamo noi.",
    notOneTitle: "Non una lingua sola",
    notOneBody: "Lo svizzero tedesco non è un dialetto solo, ma molti. Le differenze saltano all'orecchio di un locale e sfuggono del tutto a chi impara. Heidi vi insegna lo zurighese e lo dice, invece di fare finta che ce ne sia uno solo.",
    areasTitle: "I dialetti",
    areasLead: "I confini dialettali non seguono quelli cantonali — per questo punti e non superfici. I cantoni sono indicati perché voi sapete in quale vi trovate.",
    cantons: "Cantoni",
    marksTitle: "Come si riconoscono",
    marksLead: "Forme che il controllo di Heidi distingue davvero. A sinistra la forma locale, a destra quella zurighese.",
    marksNone: "Heidi non sa ancora riconoscere questo dialetto da forme precise. Qui non c'è nulla, invece di qualcosa di plausibile.",
    taught: "È quello che imparate qui",
    sourcesTitle: "Fonti",
    groupsTitle: "I tre rami",
    groupsLead:
      "Le parlate alemanne si dividono in tre gruppi. I confini non sono cantonali: sono mutamenti fonetici fermatisi in punti diversi.",
    groups: {
      low: {
        name: "Basso alemanno",
        body: "Il nord — in Svizzera praticamente solo Basilea. Qui la k iniziale è rimasta k; ovunque altrove nella Svizzera tedesca è diventata ch. Si sente il primo giorno.",
      },
      high: {
        name: "Alto alemanno",
        body: "L'Altopiano e l'est: Zurigo, Berna, Argovia, Soletta, San Gallo. Il gruppo più esteso — quello a cui si pensa dicendo «svizzero tedesco».",
      },
      highest: {
        name: "Altissimo alemanno",
        body: "Le valli alpine: Vallese, Glarona, Uri e Untervaldo, gli insediamenti walser. Il più conservativo e il più arduo per chi viene da fuori, perché vi si conservano forme antiche scomparse da tempo sull'Altopiano.",
      },
    },
    groupLabel: "Ramo",
    groupSpansTitle: "Su entrambi i lati della linea",
    groupSpans:
      "Quest'area sta su entrambi i lati della linea e non appartiene a un ramo solo. Non ne indichiamo nessuno, invece di sceglierne uno che faccia ordine.",
    diagnosticTitle: "La linea che lo traccia",
    diagnosticInside: "In questo ramo",
    diagnosticOutside: "Accanto",
    diagnosticStandard: "Tedesco standard",
    hearTitle: "Come suona",
    hearLead: "Trasmissioni e film in cui si sente soprattutto questa parlata. Link verificati — registrazioni non ne facciamo.",
    hearNone:
      "Per questa parlata non c'è ancora nulla di verificato nel repertorio. Meglio niente che un link che nessuno ha ascoltato.",
    hearAll: "Tutte le fonti d'ascolto",
    reader: {
      title: "Da dove viene questo messaggio?",
      lead: "Incolli un messaggio che ha ricevuto — dal capo, da una vicina, dalla chat di classe. Heidi mostra da dove vengono le forme e che cosa significano le parole.",
      placeholder: "p. es. Dr Giel und ds Meitschi hei Miuch gno.",
      button: "Collocare",
      failed: "Non ha funzionato. Riprovi.",
      area: "Le forme rimandano a {area}.",
      outside: "Sembra tedesco standard della Germania, non della Svizzera.",
      consistent: "Niente qui si allontana da Zurigo — le parole qui sotto si dicono così a Zurigo.",
      unclear: "Troppo poco per collocarlo. Una o due frasi in più aiutano.",
      fromTitle: "Forme da altrove",
      knownTitle: "Che cosa significano le parole",
      zurich: "a Zurigo: {form}",
      outsideName: "Germania",
      note: "Heidi colloca solo le forme che conosce con certezza, e l’elenco cresce. Il suo testo non viene salvato.",
    },
    whyManyTitle: "Perché così tante?",
    whyManyBody:
      "La Svizzera ha conservato i suoi dialetti mentre la Germania ha in gran parte perso i propri. Non è un caso né una questione di montagne: dipende da come si è formato lo Stato, dalla scuola e dalla radio.",
    whyManyLink: "Tutta la storia",
    backToAll: "Tutti i dialetti",
    aroundTitle: "Dove si colloca",
    aroundLead:
      "Calcolato dalla branca, dai cantoni e dalla città di riferimento — nessuna nuova affermazione sul dialetto stesso.",
    nearestTitle: "I più vicini",
    siblingsTitle: "Stessa branca",
    kmAway: "{km} km",
    marksInstead: "Cominci piuttosto da {area}, a {km} km — lì Heidi conosce delle forme",
  },

  grammar: {
    practiseLabel: "Altri esempi",
    practiseSay: "Mi dia due frasi per esercitarmi con «{word}» — poi mi interroghi su una.",
    title: "Grammatica",
    lead: "Che cosa rende lo zurighese difficile da seguire per chi già legge il tedesco — prima ciò su cui una frase si blocca del tutto, poi ciò che capirete senza però dirlo mai voi stessi.",
    ruleLabel: "La regola",
    watchLabel: "Dove ci si blocca",
    bands: {
      blocks: {
        title: "Qui la frase non regge",
        lead: "Senza queste l'ascolto non parte nemmeno. Aspettate una forma che non arriva mai, o leggete una parola come tutt'altro — e il resto della frase è perso.",
      },
      marks: {
        title: "Le capite — ma non le direste mai",
        lead: "All'ascolto queste non danno problemi. Non usarle mai è ciò che fa suonare qualcuno come tedesco standard con dentro parole zurighesi.",
      },
    },
    allTopics: "Tutti gli argomenti",
    practiseTopic: "Esercitarsi su questo",
    whereTitle: "Dove capita davvero",
    whereLead: "La stessa struttura, in frasi che si dicono davvero.",
    prevLabel: "Precedente",
    nextLabel: "Successivo",
    topics: {
      "question-words": {
        title: "Le parole interrogative — e la trappola che nascondono",
        rule: "wänn, wo, was, wie, weer. Quasi tutte si riconoscono; una no.",
        watch: "«Wänn» suona come il tedesco «wenn». Sentite una condizione dove è stata fatta una domanda — e la vostra risposta finisce per riguardare ciò che nessuno ha chiesto.",
      },
      "indefinite-article": {
        title: "en, e, es — l'articolo indeterminativo",
        rule: "«en» al maschile, «e» al femminile, «es» al neutro.",
        watch: "«es» sembra il pronome «es». «Bruuched Sie es Säckli?» non vuol dire «le serve», ma «le serve un sacchetto».",
      },
      imperative: {
        title: "Ordine e richiesta: la forma di cortesia finisce in -ed",
        rule: "Con il tu, il tema nudo: «Chumm». Con il Lei si aggiunge -ed: «Chömed Sie».",
        watch: "Capirete entrambe. Chi dice «Chömen Sie» viene capito lo stesso — e riconosciuto subito come non di qui.",
      },
      "no-preterite": {
        title: "Niente preterito",
        rule: "Lo zurighese parlato non ha il passato semplice: tutto il passato si dice col perfetto.",
        watch: "Aspettate «ging», «war», «sagte» — e non arriva mai. Se sentite «bi», «hät» o «händ» più un participio, quello è il passato.",
      },
      articles: {
        title: "de, d, s — gli articoli sono tutti qui",
        rule: "Tre articoli e basta: «de» al maschile, «d» al femminile, «s» al neutro. «der», «die» e «das» non compaiono.",
        watch: "Sembrano articoli tedeschi mangiati, ma sono la forma intera, non una contrazione sbrigativa. E il genere non segue sempre quello tedesco: «s Rüebli» è neutro, mentre la carota tedesca è femminile.",
      },
      "wo-relative": {
        title: "«wo» al posto di der, die, das",
        rule: "Le relative cominciano quasi sempre con «wo», invariabile, qualunque sia il genere o il caso.",
        watch: "Leggete «wo» come «dove?» e perdete la frase. Qui vuol dire «che», «il quale» — mai un luogo.",
      },
      "unified-plural": {
        title: "Una sola forma verbale per tutto il plurale",
        rule: "Noi, voi e loro prendono la stessa forma del verbo: «mir händ», «ihr händ», «si händ».",
        watch: "Cercate la desinenza della seconda persona plurale e non c'è mai. «Chömed er?» vuol dire «venite?» — la desinenza non dice nulla sulla persona, lo fa solo il pronome davanti.",
      },
      "possessive-dative": {
        title: "Il possesso al contrario",
        rule: "Il genitivo non esiste: il possesso si costruisce col dativo più un possessivo, oppure con «vo».",
        watch: "«Em Peter sis Auto» non è un errore, è la forma normale. Prima la persona, poi la cosa.",
      },
      "diminutive-li": {
        title: "-li: il diminutivo — e parole che sono semplicemente così",
        rule: "-li si aggiunge al nome, la vocale prende l'umlaut quando può, e la parola è sempre neutra: s Huus → s Hüüsli, s Brot → s Brötli, d Chatz → s Chätzli. Il plurale non cambia: zwei Brötli. Significa «piccolo» o rende la cosa più familiare — come -chen in tedesco, ma molto più spesso.",
        watch: "Molte parole in -li non sono diminutivi, ma la parola normale: Rüebli (carota), Gipfeli (cornetto), Weggli (panino), Müesli, Zältli (caramella), Meitli (ragazza). Un Rüebli non è una carota piccola. E siccome -li è sempre neutro, si dice s Chätzli, anche se il gatto è d Chatz.",
      },
      "am-progressive": {
        title: "«am» più il verbo — sto facendo",
        rule: "Quello che sta succedendo ora si dice «bi/isch/sind am» più il verbo nudo: «Ich bi am schaffe».",
        watch: "Il tedesco non ha questa forma e ripiega su «gerade». La frase si capisce anche senza — ma non usarla mai è ciò che vi fa suonare come tedesco standard con dentro parole zurighesi.",
      },
      "go-cho-infinitive": {
        title: "«go» e «cho» davanti al secondo verbo",
        rule: "Andare da qualche parte a fare qualcosa mette davanti un «go»; venire mette un «cho»: «Ich gang go poschte».",
        watch: "In tedesco questa particella non esiste, quindi la si omette — e si viene capiti e insieme riconosciuti come forestieri. Non è un secondo «andare»: appartiene al verbo che segue.",
      },
      "modal-particles": {
        title: "«gäll», «halt», «äbe» — la posizione di chi parla",
        rule: "Queste paroline non cambiano alcun fatto, solo la posizione dietro: «gäll» cerca il suo consenso, «halt» significa che non c\u2019è niente da fare, «äbe» conferma esattamente il punto.",
        watch: "Il tedesco ha «eben», e «gell» è vivo nel sud — la novità è soprattutto la frequenza, e «dänk», che non ha equivalente tedesco. La frase la capirà anche senza. Semplicemente non sentirà se le stanno dando ragione o le stanno chiedendo qualcosa.",
      },
      subjunctive: {
        title: "hett, wär, chönnt — il congiuntivo è vivo",
        rule: "Desideri, richieste gentili e tutto ciò che è ipotetico vanno al congiuntivo: hett (avrebbe), wär (sarebbe), chönnt (potrebbe), sött (dovrebbe), wett (vorrebbe) — oppure würd più l'infinito. Spesso si sentono anche con -i: hetti, wäri.",
        watch: "Una vocale separa «avrebbe» da «ha»: «Er hett Ziit» è «avrebbe tempo», «er hät Ziit» è «ha tempo». E «Ich wett» non è una scommessa (Wette), ma «vorrei».",
      },
      "pronoun-clitics": {
        title: "en, em, ere — pronomi che sembrano articoli",
        rule: "I pronomi atoni si accorciano: ihn → en, ihm → em, ihr (dativo) → ere, es → s. Si appoggiano al verbo che li precede: «Ich han en gsee», «Säg em», «Wie gaht s ere?».",
        watch: "Qui «en» non è «einen» (un), ma «ihn» (lo), ed «em» non è «dem», ma «ihm» (gli). Chi aspetta un nome dopo, aspetta invano — il pronome è già tutto l'oggetto.",
      },
      participles: {
        title: "gsi, gha, cho — participi quasi senza ge-",
        rule: "ge- diventa g-: gmacht, gseit, gsi (gewesen, stato), gha (gehabt, avuto). Davanti a k/ch, p, t e g sparisce: cho (gekommen), chauft (gekauft), trunke (getrunken), gange (gegangen).",
        watch: "Senza passato semplice, ogni passato si regge su un participio come questi. «cho» e «gsi» non somigliano a nessuna parola tedesca — imparate i più frequenti come parole, non come regola.",
      },
      "clock-time": {
        title: "am vieri, halbi drüü — l'ora",
        rule: "«am» significa «alle», «ab» significa «e» (dopo): am viertel ab achti = alle otto e un quarto. L'ora piena prende di solito una -i: am vieri, am achti, am zwölfi. «Halbi drüü» sono le due e mezza, 2:30 — come in tedesco.",
        watch: "Tutte e tre le paroline significano altro in tedesco: «am» ricorda «am Montag» (lunedì), «ab» ricorda «ab acht Uhr» (dalle otto). Ma «viertel ab achti» sono le 8:15, non «dalle 7:45».",
      },
      "verb-order": {
        title: "chönne cho — i verbi finali al contrario",
        rule: "Quando più verbi si accumulano alla fine, l'ausiliare o il modale viene prima e il verbo che porta il significato per ultimo: «Ich ha nöd chönne cho», dove il tedesco dice «… kommen können». Lo stesso nella subordinata: «…, dass si hät müesse schaffe».",
        watch: "Capire è facile — le parole sono le stesse. Con l'ordine tedesco («cho chönne») vi capiranno, ma suonerete come tedesco standard con parole zurighesi.",
      },
      directions: {
        title: "ine, use, ufe, abe — senza hin e her",
        rule: "Le parole di direzione finiscono in -e: ine (dentro), use (fuori), ufe (su), abe (giù), ume (di là, intorno). Una parola per entrambe le direzioni.",
        watch: "Il tedesco distingue «hin» (via da me) e «her» (verso di me): hinein e herein. Lo zurighese no: «Chömed Sie ine» e «Gönd Sie ine» usano lo stesso ine. Non cercate la differenza — sta nel verbo, non nella parola di direzione.",
      },
      "names-article": {
        title: "de Peter, d Anna — l'articolo davanti al nome",
        rule: "I nomi di battesimo hanno quasi sempre l'articolo: de Peter, d Anna, em Luca (a Luca). È la forma normale e neutra.",
        watch: "Nel nord della Germania «die Anna» suona trascurato o sprezzante. Qui no — semmai si nota chi lo omette.",
      },
    },
  },

  saved: {
    title: "Le sue parole",
    lead: "Quello che ha cercato e voluto tenere. Resta tutto in questo browser, su questo dispositivo — non da noi.",
    empty: "Nessuna parola tenuta finora.",
    emptyHint: "Chieda una frase a Heidi. Accanto a ogni parola spiegata c'è un più per tenerla.",
    countLabel: "tenute",
    remove: "Togliere",
    clear: "Togliere tutto",
    clearConfirm: "Togliere davvero tutto?",
    exportLabel: "Salvare come file",
    onThisDevice: "Solo su questo dispositivo",
    savedOn: "Tenuta il",
    openChat: "Cercare qualcosa",
  },

  /**
   * The dashboard: spaced review, and what the learner's own list says about
   * them. No streak, no score, no percentage — HEIDI.md §8 names each of those
   * as the thing this must not become.
   */
  review: {
    title: "Da ripassare",
    lead: "Le parole che avete tenuto tornano qui — dopo un giorno, poi tre, poi una settimana. Chiedere più tardi funziona meglio che chiedere più spesso.",
    due: "da ripassare",
    none: "Oggi non c'è niente da ripassare.",
    noneHint: "Tornate domani — oppure cercate qualcosa di nuovo.",
    noneFree: "Il programma è in pari. Se vuole continuare adesso, da questa parte:",
    nonePractise: "Una seduta breve",
    noneCards: "Carte",
    noneAsk: "Incollare un messaggio",
    empty: "Ancora nessuna parola da ripassare.",
    emptyHint: "Tenete una parola durante una conversazione e Heidi ve la richiederà più tardi.",
    tomorrow: "domani",
    settled: "acquisite",
    prompt: "Che cosa vuol dire?",
    show: "Mostra",
    knew: "La sapevo",
    missed: "Non ancora",
    done: "Per oggi è tutto.",
    patternsTitle: "Quello che vi ferma più spesso",
    patternsLead: "Queste regolarità stanno nelle parole che avete tenuto. Non è un voto — è solo quello che c'è nella vostra lista.",
    patternsCount: "delle vostre parole",
    patternsEmpty:
      "Ancora niente da mostrare. Appena avrà tenuto qualche parola, qui compariranno le corrispondenze di suono che vi ritornano — per esempio che una k tedesca diventa ch. Letto dalla sua lista; su di lei non si misura nulla.",
    masteredTitle: "Che cosa sa fare adesso",
    masteredCount: "{n} cose tengono",
    masteredLead:
      "Non si conta quante volte è passato di qui, ma che cosa ora le riesce — chiesto almeno quattro volte e quasi sempre azzeccato.",
    masteredEmpty:
      "Ancora niente. Appena qualcosa le sarà stato chiesto quattro volte e l\u2019avrà quasi sempre azzeccato, comparirà qui. Si conta quello che sa, non quanto è venuto.",
    masteredTopics: "Grammatica",
    masteredWords: "Parole",
    masteredGroups: "Gruppi di parole",
    masteredScenes: "Situazioni",
    masteredNote:
      "Questo dice qualcosa di questo pack, non dello svizzero tedesco in generale. Queste cose tengono — non ne segue che una conversazione a Zurigo terrà.",
    recentTitle: "Riprendere",
    recentEmpty: "Ancora nessuna conversazione.",
  },
  groups: {
    title: "Gruppi di studio",
    lead: "Si eserciti con altri — Heidi c'è. Scriva il suo nome nella conversazione perché risponda.",
    empty: "Non è ancora in nessun gruppo.",
    createTitle: "Aprire un gruppo",
    createHint: "Gli dia un nome. Poi riceverà un link da condividere.",
    namePlaceholder: "p. es. Mercoledì sera",
    create: "Aprire",
    creating: "Apertura …",
    open: "Aprire",
    members: "Membri",
    inviteTitle: "Invitare",
    inviteHint: "Chi ha il link entra. Lo condivida solo se lo desidera.",
    copyLink: "Copiare il link",
    copied: "Copiato",
    rotate: "Creare un nuovo link",
    rotateHint: "Il vecchio link smette subito di funzionare.",
    joinTitle: "È stato invitato",
    joinBody: "Acceda per partecipare.",
    join: "Partecipare",
    joining: "Un momento …",
    joinFailed: "Questo link non funziona più.",
    full: "Questo gruppo è pieno.",
    signInFirst: "Acceda per usare i gruppi di studio.",
    composer: "Messaggio al gruppo",
    send: "Inviare",
    heidiHint: "Scriva «Heidi» perché risponda.",
    notConfigured: "I gruppi di studio non sono ancora configurati su questa installazione.",
    failed: "Non ha funzionato. Riprovi.",
    back: "Torna al mio spazio",
  },
  speaking: {
    title: "Parlare",
    lead: "Parli ad alta voce, da solo, adesso — e lasci misurare ciò che si può misurare. Più sotto: webinar e cerchi di conversazione su temi che propone lei.",
    signInFirst: "Accedete per proporre un tema e partecipare.",
    roundFull: "Questo incontro è al completo.",
    notConfigured: "I gruppi di parola non sono configurati su questa installazione.",
    failed: "Non ha funzionato. Riprovate.",

    roundsTitle: "Prossimi incontri",
    roundsEmpty: "Nessun incontro in programma. Aprite il primo.",
    webinar: "Webinar",
    circle: "Cerchio",
    webinarHint: "Una persona parla, le altre ascoltano.",
    circleHint: "Parlano tutti a turno. Al massimo otto persone.",
    once: "Una volta sola",
    weekly: "Ogni settimana",
    fortnightly: "Ogni due settimane",
    hostedBy: "di",
    attending: "iscritti",
    full: "Al completo",
    join: "Vengo",
    leave: "Non ce la faccio",
    live: "In corso",
    joinRoom: "Entra nella stanza",
    noRoom: "Il link alla stanza arriverà.",
    cancelRound: "Annulla l’incontro",
    cancelled: "Annullato",

    openTitle: "Aprire un incontro",
    openHint: "Siete voi a ospitarlo e siete il primo nome in lista.",
    roundTitleLabel: "Di cosa si tratta?",
    whenLabel: "Quando",
    durationLabel: "Durata",
    minutes: "minuti",
    formatLabel: "Forma",
    cadenceLabel: "Ripetizione",
    linkLabel: "Link alla stanza",
    linkHint: "Un link https alla vostra stanza. Heidi non trasmette video: organizza l’incontro e si esercita con voi prima e dopo.",
    open: "Apri",
    opening: "Apertura …",

    boardTitle: "Temi proposti",
    boardLead: "Di cosa volete parlare? I temi vengono dai partecipanti, non da noi.",
    boardEmpty: "Ancora nessuna proposta. Proponete qualcosa di cui volete davvero parlare.",
    proposeTitle: "Proporre un tema",
    topicTitleLabel: "Il tema",
    topicTitlePlaceholder: "p. es. Cosa si dice davvero in stazione",
    pitchLabel: "Perché vale un’ora?",
    pitchPlaceholder: "Basta una frase.",
    propose: "Proponi",
    proposing: "Un attimo …",
    wouldCome: "verrebbero",
    imIn: "Verrei",
    imOut: "Ho cambiato idea",
    scheduled: "In programma",
    scheduleIt: "Farne un incontro",

    practiceTitle: "Esercitarsi ad alta voce",
    practiceLead: "Si registri mentre parla di un tema. Basta un minuto.",
    record: "Registra",
    stop: "Fatto",
    recordingNow: "Registrazione",
    again: "Di nuovo",
    micDenied: "Serve l’accesso al microfono. Consentitelo dalla barra degli indirizzi del browser.",
    micUnsupported: "Questo browser non può registrare. Provate sul telefono o con un altro browser.",
    measured: "Misurato",
    varietyLabel: "In quale lingua si esercita?",
    varietyBridge: "Tedesco standard svizzero",
    varietyMeasuresOnly: "Heidi misura la registrazione sul suo dispositivo. La frase la scrive lei — nessun sistema trascrive il zurighese in modo affidabile.",
    varietyTranscribes: "Heidi trascrive e può parlare delle sue parole. Per questo la registrazione va una volta a un servizio, che non la conserva.",

    recordedFor: "registrazione",

    spokeFor: "di parlato",
    pauseLabel: "pause",
    longestLabel: "pausa più lunga",
    runLabel: "di fila",
    rateLabel: "sill./sec.",
    wordsLabel: "parole",
    seconds: "s",

    saidTitle: "Che cosa avete detto?",
    saidWhy: "Nessun sistema trascrive lo svizzero tedesco in modo affidabile. I migliori traducono il dialetto in tedesco standard e buttano via proprio quello che state imparando. Per questo la frase la scrivete voi — e scriverla è già metà dell’esercizio.",
    saidPlaceholder: "Scrivete la frase come l’avete detta.",
    saidCheck: "Fai controllare",
    checking: "Controllo …",

    heardTitle: "Questo è ciò che abbiamo sentito",
    heardWhy: "L’ha scritto una macchina, non lei. Corregga ciò che non va — si misura il testo di cui lei risponde.",
    heardPlaceholder: "Qui compare ciò che la macchina ha capito.",
    hearing: "Riascolto in corso …",
    heardFailed: "Il riascolto non ha funzionato. Scriva lei la frase — la misura qui sopra vale comunque.",
    grammarTitle: "Grammatica",
    grammarClean: "Niente che un ascoltatore noterebbe.",
    grammarNotChecked: "Questa volta la grammatica non è stata controllata.",
    grammarAlternatives: "Più possibilità — quale sia giusta dipende da che cosa voleva dire.",
    grammarMore: "Le prime {shown} di {total}.",
    grammarLimit: "Controlla accordi, casi e forme verbali. Non trova tutto — ad esempio la posizione del verbo dopo «weil».",
    hesitationTitle: "Dove ha cercato una parola",
    hesitationBefore: "{s} s prima di «{word}»",
    hesitationNote: "La parola dopo una lunga pausa è spesso quella che stava cercando.",

    feedbackTitle: "Il ritorno",
    suggestionTitle: "Come si direbbe qui",
    noSuggestion: "Heidi al momento non ha nulla da aggiungere. Le misure qui sopra restano valide.",
    flaggedSuggestion: "Attenzione: questo suggerimento contiene una forma che il nostro controllo segnala.",
    foreignForm: "«{form}» è {origin}. Qui si dice «{suggest}».",
    foreignFormPlain: "«{form}» viene da un altro dialetto ({origin}).",
    noScore: "Heidi non dà voti. Quello che vedete è misurato: quanto avete parlato e dove sono cadute le pause — e quali parole vengono da un altro dialetto. Sulla pronuncia non c’è nulla, perché nessuno può misurarla onestamente.",

    notes: {
      recordingTooShort: "Troppo breve per dire qualcosa. Registrate qualche frase.",
      recordingTooQuiet: "Non abbiamo quasi sentito nulla. Controllate il microfono e parlate un po’ più vicino.",
      recordingClipped: "Il segnale era in saturazione. Allontanatevi un po’ dal microfono — un problema di attrezzatura, non di parlato.",
      longestPause: "Il silenzio più lungo è durato {n} secondi. Per accorciarli: dite la frase con meno parole invece di cercare quella giusta.",
      noLongPauses: "Nessun silenzio lungo — siete arrivati in fondo senza bloccarvi.",
      fewerPausesThanBefore: "{n} pause in meno rispetto alla volta scorsa.",
      morePausesThanBefore: "{n} pause in più rispetto alla volta scorsa. Può dipendere dal tema.",
      longerRunsThanBefore: "Avete parlato {n} secondi in più di fila rispetto a prima.",
      nothingFlagged: "Nessuna forma di un altro dialetto trovata.",
      shareOfRecording: "Nel {n}% della registrazione c’era parlato. Il resto era silenzio — può essere riflessione, o un microfono che ha sentito troppo poco.",
      huntingForWords: "Quando parlava, parlava spedito — il tempo è andato nelle pause. È ricerca di parole, non lentezza: ripeta subito la stessa cosa e la ricerca sparisce.",
      cameStraightThrough: "È arrivato in fondo senza cercare le parole. La prossima volta prenda un tema che non ha mai detto ad alta voce.",
      filledPauses: "{n} pause piene («ehm»). Lo fanno di continuo anche i madrelingua — contate, non contestate.",
      spokeTargetInBridge: "C’erano parole di dialetto, benché si stesse esercitando in tedesco standard. A Zurigo succede in continuazione e non è un errore — è solo utile saperlo se allo sportello vuole parlare standard.",
    },

    historyTitle: "Le vostre registrazioni",
    historyUnwritten: "Senza testo — solo misurato.",
    deleteTake: "Elimina",
    progressDays: "giorni parlati",
    progressTakes: "registrazioni",
    progressSpoken: "di parlato",
    progressSeconds: "sec",
    progressMinutes: "min",
    progressNote: "Contato, non valutato. Questo numero non cala mai — due settimane di pausa non costano nulla.",
    privacy: "L’audio non lascia mai il vostro dispositivo. Restano solo le misure e il vostro testo — in questo browser, non da noi.",
    privacyTranscribed: "In questa lingua la registrazione va una volta a un servizio che la trasforma in testo, e lì non viene conservata. Da noi restano solo le misure e il testo — in questo browser.",
  },

  paper: {
    checkLabel: "Verifichi lei stesso",
    sourcesTitle: "Fonti",
  },

  changelog: {
    title: "Registro delle modifiche",
    lead: "Che cosa è cambiato, con la data — e nelle parole di chi lo usa.",
    note: "Non è un log di Git. Il repository è pubblico e chi vuole ogni commit li trova lì. Qui c\u2019è quello che una persona avrebbe notato — errori compresi, perché un registro senza righe imbarazzanti dimostra che la promessa «pubblichiamo anche ciò che non ha funzionato» è decorativa.",
    tags: {
      feature: "Nuovo",
      improvement: "Migliorato",
      fix: "Corretto",
      platform: "Base",
      breaking: "Rottura",
    },
  },

  organisations: {
    title: "Per le organizzazioni",
    lead: "Dove il dialetto non è un problema vostro ma delle vostre persone.",
    momentLabel: "Il momento",
    stakeLabel: "Quanto costa",
    offerLabel: "Cosa fa Heidi",
    unknownLabel: "Cosa dovremmo chiedervi",
    chooseSector: "Il suo settore",
    allSectors: "Tutti i settori",
    readMore: "Continua a leggere",
    startTitle: "Che cosa succede se ci scrive",
    teamsTitle: "Heidi per i team",
    teamsBody: "Crei un gruppo per il suo team e scelga il tema — per esempio le situazioni in una casa di cura. Le sue persone si esercitano sui propri dispositivi e decidono da sé se mostrarle in quali situazioni sono sicure. Chi padroneggia una situazione riceve un attestato, che lei può verificare tramite il suo link.",
    teamsCta: "Creare un team",
    talk: "Scriveteci",
  },

  situations: {
    title: "Dove serve davvero",
    lead: "Non ordinato per categoria grammaticale ma per momento: quello che si dice davvero in quella situazione, nell'ordine in cui arriva.",
    note: "La direzione è la stessa di tutto il resto qui: prima capire. La maggior parte di queste frasi le sentite; le poche che direste voi sono segnalate.",
    verified: "Ogni frase è verificata automaticamente sulle forme zurighesi: le forme di altri dialetti o della Germania non passano.",
    hear: "Questo lo sentite",
    say: "Questo lo dite voi",
    linesLabel: "frasi",
    heardLabel: "da capire",
    grammarLabel: "Quello che qui torna di continuo",
    practiseLabel: "Esercitarsi ora",
    backLabel: "Tutte le situazioni",
    strength: {
      title: "A che punto è qui",
      new: "Non ancora iniziato",
      met: "Iniziato",
      steady: "La maggior parte tiene",
      sure: "Segue questa situazione",
      claim: "Capisce il tedesco di Zurigo in questa situazione — verificato su tutte le {total} frasi che compaiono qui.",
      progress: "{held} frasi su {total} tengono",
      stuckNote: "Di queste, {stuck} sono tornate dopo una pausa e tenevano ancora.",
      remainingTitle: "Mancano ancora queste",
      drill: "Esercitarsi su questa situazione",
      drillAgain: "Continuare",
      noneYet: "Si eserciti su questa situazione: poi qui sarà scritto a che punto è.",
      localOnly: "Lo calcola il suo browser. Non esce da questo dispositivo.",
      boardTitle: "Dove è forte",
      boardLead: "Situazione per situazione. Si può essere sicuri in casa di cura e persi al ristorante — non è una contraddizione, è il punto.",
      weakest: "È qui che esercitarsi rende di più in questo momento",
    },
    domains: {
      everyday: {
        title: "La vita quotidiana a Zurigo",
        lead: "Il negozio, il tram, le scale, il telefono, la tavola di mezzogiorno. Situazioni in cui quasi tutti si trovano ogni settimana — e dove la stanza passa al tedesco standard appena si accorge che fate fatica.",
      },
      care: {
        title: "Case per anziani e case di cura",
        lead: "Una residente con demenza perde per prime le seconde lingue. Quello che resta è lo zurighese della sua infanzia — ed è la lingua in cui si svolge il turno.",
      },
    },
    scenes: {
      restaurant: {
        title: "Al ristorante",
        scene: "Quattro domande fisse e una che decide il conto. «Zäme oder separat» si chiede una volta sola, in fretta, e sbagliarla se ne accorge tutto il tavolo.",
      },
      "at-work": {
        title: "Al lavoro",
        scene: "La riunione si tiene in tedesco standard o in inglese. Il corridoio, la macchina del caffè e il momento in cui si decide davvero qualcosa, no.",
      },
      "school-parents": {
        title: "All'asilo",
        scene: "Nel canton Zurigo l'asilo si fa in dialetto — lo ha deciso il corpo elettorale nel 2011. Chi ha imparato il tedesco standard se ne accorge alla riunione dei genitori, davanti a tutti.",
      },
      shopping: {
        title: "Al negozio",
        scene: "Quattro domande, sempre le stesse, alla cassa con una fila dietro — cioè proprio dove chiedere di ripetere costa di più.",
      },
      tram: {
        title: "Sul tram",
        scene: "Annunci e sconosciuti, entrambi veloci. L'unica situazione in cui non capire costa il pomeriggio e non la frase.",
      },
      neighbours: {
        title: "Nelle scale",
        scene: "La lavanderia, la bici nel corridoio, i rifiuti. Qui un biglietto sulla porta non è una richiesta — chi lo legge così diventa il vicino difficile senza che nessuno glielo dica.",
      },
      appointment: {
        title: "Al telefono",
        scene: "Il canale più difficile in qualsiasi seconda lingua e quello che nessuno esercita: niente volto, niente contesto, e qualcuno che scorre una lista.",
      },
      "small-talk": {
        title: "A tavola a mezzogiorno",
        scene: "La scena per cui questo prodotto esiste. La tavola passa al tedesco standard appena si accorge che fate fatica — togliendovi esattamente ciò che vi aiuterebbe.",
      },
      handover: {
        title: "Le consegne",
        scene: "Tra colleghi, niente viene rallentato, nessuno passa al tedesco standard per voi. Il momento più veloce della giornata, e quello che decide tutto il turno.",
      },
      "morning-care": {
        title: "Al mattino",
        scene: "Frasi brevi, dette con entrambe le mani occupate. Qui il tedesco standard non è l'opzione neutra: cambiare lingua durante la cura significa cambiare persona.",
      },
      pain: {
        title: "Quando qualcosa fa male",
        scene: "Il dolore non parla una seconda lingua. Chi lo segnala non sta componendo una frase — e chi lo fraintende scambia il dolore per agitazione.",
      },
      meals: {
        title: "I pasti",
        scene: "La situazione che ricorre più spesso e per cui nessuno si prepara, perché sembra la più facile.",
      },
      "evening-unrest": {
        title: "L'inquietudine della sera",
        scene: "Qualcuno vuole andare a casa, in una casa che non esiste più da quarant'anni. Quello che aiuta è breve, al presente, e nella lingua in cui quella persona pensa.",
      },
      visitors: {
        title: "Le visite",
        scene: "All'improvviso l'istituto siete voi. La figlia che arriva una domenica pomeriggio giudica la casa da questo: se chi era alla porta è riuscito a seguirla.",
      },
      doctor: {
        title: "Dal medico",
        scene: "Il telefono le ha procurato un appuntamento; ora vengono la reception, la sala d'attesa e l'ambulatorio. Alla reception si chiede in fretta, in ambulatorio con precisione — e in entrambi i casi conta aver capito la domanda prima di rispondere.",
      },
      municipality: {
        title: "In Comune",
        scene: "Chi si trasferisce a Zurigo deve notificarsi — di solito nelle prime settimane, e di solito prima di riuscire a seguire una frase. Le domande sono sempre le stesse, e la persona dietro il vetro le pone cento volte al giorno, a quella velocità.",
      },
      "laundry-room": {
        title: "In lavanderia",
        scene: "Il piano appeso al muro è una legge che nessuno spiega. Chi non pulisce il filtro o lava nel giorno sbagliato lo verrà a sapere — raramente in faccia, di solito con un biglietto.",
      },
      apero: {
        title: "All'aperitivo",
        scene: "Un bicchiere in mano, nessuno è obbligato a restare, tutti parlano dialetto. È qui che nasce una conoscenza zurighese — e «Mer sött emal öppis zäme mache» è detto con calore, ma non è un invito.",
      },
      "indirect-no": {
        title: "Quando no non suona come no",
        scene: "A Zurigo si rifiuta di rado in modo diretto. «Das isch ächli schwierig» o «Mer chönnt sich das überlegge» spesso è già la risposta, confezionata con cortesia — chi la prende alla lettera aspetta qualcosa che è già stato detto.",
      },
    },
  },

};
