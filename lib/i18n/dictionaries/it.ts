import type { Dictionary } from "./de.ts";

export const it: Dictionary = {
  meta: {
    title: "Heidi — capire lo svizzero tedesco",
    description:
      "Capire quello che si dice davvero attorno a voi. Heidi decifra i messaggi reali, spiega le parole che ancora non conoscete e controlla ogni risposta secondo forme dialettali vere. Si comincia dallo zurighese.",
  },

  nav: {
    home: "Inizio",
    chat: "Chat",
    grammar: "Grammatica",
    method: "Metodo",
    contribute: "Partecipare",
    about: "Chi siamo",
    portal: "Il mio spazio",
    settings: "Impostazioni",
    groupUse: "Usare",
    groupWhy: "Perché così",
    groupProject: "Progetto",
    skipToContent: "Vai al contenuto",
    menu: "Menu",
    language: "Scegliere la lingua",
    langNational: "Lingue nazionali",
    langDialect: "Dialetto",
    langOther: "Altre lingue",
  },

  footer: {
    tagline: "Capire lo zurighese, e poi partecipare.",
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
    checkedNote: "Verificato secondo le forme zurighesi",
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
    failed: "Heidi non è riuscita a rispondere in questo momento. Riprovate tra poco.",
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
      swiss: { label: "In tedesco scritto", say: "Scrivetelo in tedesco standard svizzero, non in dialetto." },
    },
  },

  model: {
    attach: "Allegare un'immagine",
    attachNeedsKey: "Leggere un'immagine richiede un vostro modello",
    remove: "Rimuovere",
    connectTitle: "Collegare il vostro modello",
    connectLead:
      "Heidi è gratuita, e i modelli gratuiti non sanno leggere le immagini. Con una vostra chiave API Heidi capisce uno screenshot — e risponde meglio in generale.",
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
    test: "Collegare e provare",
    testing: "Verifica in corso …",
    connected: "Collegato",
    connectedWith: "Collegato con",
    failed: "Non ha funzionato",
    disconnect: "Rimuovere la chiave",
    canSee: "Può leggere le immagini",
    textOnly: "Solo testo",
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
      body: "Niente serie, niente punti, niente percentuali inventate. Il numero che vogliamo mostrarvi è quanto capite di una voce zurighese sconosciuta — prima e dopo.",
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
      "Misurato anziché gamificato. Niente serie, niente punti.",
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
    placeholder: "Das isch nid güet, gäu",
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
        body: "Oggi: capire e rispondere a testo vero. Poi: il laboratorio di ascolto, dove sentite una voce zurighese, vi ci abituate, e misuriamo quanto cogliete di un'altra. Servono registrazioni, e si stanno facendo.",
      },
    ],
    stateTitle: "A che punto siamo",
  },

  settings: {
    title: "Impostazioni",
    lead: "Tutto quello che Heidi sa di voi, in un posto solo — e tutto si può togliere.",
    languageTitle: "Lingua del sito",
    languageBody: "In che lingua Heidi vi parla. Quello che imparate resta lo zurighese.",
    modelTitle: "Modello linguistico",
    modelBody: "Per impostazione predefinita Heidi usa modelli gratuiti. Una vostra chiave sblocca le immagini e migliora le risposte.",
    modelNone: "Nessun modello vostro collegato",
    accountTitle: "Account",
    accountBody: "Per conservare le vostre parole e per i gruppi di studio. Tradurre non richiede un account.",
    dataTitle: "Che cosa resta su questo dispositivo",
    dataBody:
      "La conversazione resta in questa scheda e sparisce quando la chiudete. Una vostra chiave vive nella memoria di questo browser finché non la togliete. Niente di tutto ciò sta sui nostri server. Anche le parole che tiene restano qui, finché non le toglie.",
  },

  auth: {
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
      "Concretamente: prima altri dialetti svizzero-tedeschi, poi una lingua fuori dalla Svizzera — la stessa macchina, un altro pacchetto linguistico. Quello che impariamo per strada, lo scriviamo.",
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
  grammar: {
    title: "Grammatica",
    lead: "Quattro cose che rendono lo zurighese difficile da seguire per chi già legge il tedesco. Niente lezioni — solo quello che sentirete, e dove ci si blocca.",
    ruleLabel: "La regola",
    watchLabel: "Dove ci si blocca",
    topics: {
      "no-preterite": {
        title: "Niente preterito",
        rule: "Lo zurighese parlato non ha il passato semplice: tutto il passato si dice col perfetto.",
        watch: "Aspettate «ging», «war», «sagte» — e non arriva mai. Se sentite «bi», «hät» o «händ» più un participio, quello è il passato.",
      },
      "wo-relative": {
        title: "«wo» al posto di der, die, das",
        rule: "Le relative cominciano quasi sempre con «wo», invariabile, qualunque sia il genere o il caso.",
        watch: "Leggete «wo» come «dove?» e perdete la frase. Qui vuol dire «che», «il quale» — mai un luogo.",
      },
      "possessive-dative": {
        title: "Il possesso al contrario",
        rule: "Il genitivo non esiste: il possesso si costruisce col dativo più un possessivo, oppure con «vo».",
        watch: "«Em Peter sis Auto» non è un errore, è la forma normale. Prima la persona, poi la cosa.",
      },
      "diminutive-li": {
        title: "Il -li su tutto",
        rule: "Il diminutivo in -li è molto produttivo e spesso non indica nulla di piccolo.",
        watch: "«Es Bierli» non è una birra piccola, è una birra detta con simpatia. Non prendete il -li alla lettera.",
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
};
