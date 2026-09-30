import type { ChangelogEntry } from "bip-kit";
import type { SectorLocale } from "./sectors.ts";

// `CHANGELOG.md` at the repo root is the copy the fleet map
// (loki.orangecat.ch/api/fleet/map) reads: one `## YYYY-MM-DD` heading per
// day, bullets under it. An entry added here is added there in the same PR;
// `records.test.ts` fails when a date here has no heading there.

/**
 * What changed, dated, in the words of somebody using it.
 *
 * `ChangelogEntry` comes from `bip-kit`, whose own comment on the type says
 * what this page had to get right: "user-facing product changelog entry (NOT a
 * git log)". Ninety-three merges in twelve days is a git log; anybody who
 * wants that can read it, and the repository is public. A changelog is the
 * curation — which of those ninety-three a person would have noticed, said in
 * terms of what they can now do.
 *
 * THE RULES THAT KEEP IT FROM BECOMING MARKETING:
 *
 *   1. EVERY ENTRY POINTS AT SOMETHING A READER CAN OPEN. A line saying
 *      "improved the exercises" is a press release. "The practice pool went
 *      from 221 questions to 553, and typing is now its own mode" is a claim
 *      somebody can go and check in ninety seconds, which is the only kind
 *      worth publishing.
 *   2. FIXES ARE LISTED WITH THE SAME WEIGHT AS FEATURES, and they say what
 *      was wrong rather than that something was "improved". `/about` already
 *      promises we publish the parts that did not work; a changelog with no
 *      embarrassing rows in it is evidence that promise is decorative.
 *   3. NOTHING HERE IS ROUNDED UP. The numbers are the ones in the commits.
 *
 * GERMAN AND ENGLISH, not seven — the same call `sectors.ts`, `investors.ts`
 * and `roadmap.ts` make, for the same reason: this is writing about the
 * project rather than interface copy, and seven machine-checked translations
 * of it would be six liabilities.
 *
 * NEWEST FIRST, and a test asserts it: a changelog in the wrong order is read
 * as the wrong order rather than as an error, so nothing about it looks broken
 * while it tells everybody the opposite of the truth.
 */
export const CHANGELOG: Record<SectorLocale, readonly ChangelogEntry[]> = {
  de: [
    {
      date: "2026-09-30",
      tag: "feature",
      title: "Übungen bekommen einen eigenen Bildschirm, wie in einer App",
      summary:
        "Übungen, Test und Aufwärmen laufen nicht mehr als Kasten mitten auf einer Seite. «Losgehen» öffnet einen Bildschirm nur mit der Übung: oben Schliessen und ein Fortschrittsbalken, in der Mitte die Frage, unten die Antwortknöpfe, dort wo der Daumen ist. Kein Seitenkopf, keine Fusszeile und nichts über der Frage, das sie verschieben könnte.",
      items: [
        "Wer mittendrin schliesst, verliert nichts: Öffnen Sie dieselbe Übung innerhalb von 12 Stunden wieder, geht es dort weiter, wo Sie aufgehört haben. Der Knopf auf der Übungsseite sagt es («Weitermachen — Frage 4 von 8»). Gespeichert nur im Browser.",
        "Auf der Übungsseite wählen Sie jetzt, was Sie üben; die Seite zum Aufwärmen erklärt es und startet es. Links von Grammatik, Situationen und Wortgruppen öffnen dieselben Übungen wie bisher.",
        "Die Uhr des Tests steht oben in der Leiste. Auf dem Computer ist der Bildschirm derselbe, zentriert, mit den Knöpfen unten.",
        "Behoben: «Gewusst» auf einer Karte übersprang die nächste Frage. Die Karte meldete ihre Antwort doppelt, wurde doppelt gezählt, und die Übung sprang zwei Fragen weiter. Ein Tippen ist jetzt eine Antwort.",
      ],
    },
    {
      date: "2026-09-30",
      tag: "fix",
      title: "Auf dem Handy springt die Seite beim Antworten nicht mehr",
      summary:
        "Nach jeder Antwort rutschte die nächste Frage an eine andere Stelle, und man musste zurückscrollen. Über der Frage wuchsen die Serie und «Woran Sie arbeiten» mit jeder Antwort, und das iPhone schiebt dann die ganze Seite. Jetzt läuft eine Übung auf dem Handy im Vollbild, wie in einer App, und jede neue Frage beginnt oben.",
      items: [
        "Übungen, Test, Aufwärmen und der Chat auf der Startseite öffnen sich auf dem Handy über den ganzen Bildschirm. «Verkleinern» bringt sie zurück in die Seite, ohne dass Antworten oder Gespräch verloren gehen; «Im Vollbild weiter» öffnet sie wieder.",
        "Im Chat steht das Eingabefeld unten am Bildschirm. Ein gespeichertes Gespräch öffnet sich erst, wenn Sie schreiben, nicht schon beim Laden der Startseite.",
        "Auf dem Computer bleibt alles in der Seite. Beginnt eine neue Frage oberhalb des sichtbaren Bereichs, scrollt die Seite zu ihr.",
        "Die Sprachauswahl zeigt für Schwiizerdütsch «CH» statt «GSW». «GSW» ist der Sprachcode aus der Adresse und sah im Kopf der Seite wie ein Fehler aus.",
      ],
    },
    {
      date: "2026-09-30",
      tag: "feature",
      title: "Aufwärmen: Wie viel Züridütsch verstehen Sie schon?",
      summary:
        "Acht Zürcher Sätze in zwei Minuten, ohne Note und ohne Niveau. Danach sehen Sie, welche Situationen Sie schon verstehen und wo sich der Anfang lohnt.",
      items: [
        "Die Sätze werden schwieriger, solange Sie mithalten, und leichter nach einem Fehler. Nach jeder Antwort steht das Wort, an dem der Satz hängt.",
        "Die Antworten fliessen in Ihre Übungen ein: Die erste Übung beginnt dort, wo das Aufwärmen die Lücken gefunden hat.",
        "Wer auch die Sätze zwischen den Zeilen versteht, bekommt das Angebot, die Seite auf Schwiizerdütsch zu lesen. Ein Nein wird nicht wiederholt.",
        "Angeboten auf der Startseite, im eigenen Bereich (bis Sie es gemacht haben) und bei den Übungen. Gespeichert nur in Ihrem Browser.",
      ],
    },
    {
      date: "2026-09-30",
      tag: "fix",
      title: "Heidi antwortet auf das, was Sie zuletzt geschrieben haben",
      summary:
        "Nach drei Antworten zu «Le Bilan» fragte jemand «Pire» — und bekam einen vierten Satz über «Le Bilan», zweimal. Der Chat gab dem Modell das ganze Gespräch als eine Liste, ohne zu sagen, welche Nachricht die Frage ist. Jetzt steht die neue Nachricht für sich, und ein einzelnes Wort gilt als Frage nach genau diesem Wort.",
      items: [
        "Im Test mit dem echten Modell: vorher bekam «Pire» in 4 von 6 Läufen wieder einen «Le Bilan»-Satz, nachher in keinem.",
        "Heidi erinnert sich jetzt an den Satz, den sie geschrieben hat, nicht nur an ihre Erklärung dazu — «Kürzer» meint weiterhin die letzte Antwort.",
        "Das Modell sieht die letzten 20 Nachrichten, auch in gespeicherten Gesprächen; bisher bekam es dort das ganze Gespräch, egal wie lang.",
        "«Neues Gespräch» ist auf dem Handy direkt über dem Chat, nicht mehr nur im Seitenmenü, und im schwebenden Chat ein Symbol neben Vergrössern und Schliessen statt eines umbrechenden Links.",
        "Behoben: Mit offener Handy-Tastatur rutschte der Kopf des Chats — und «Neues Gespräch» darin — aus dem Bild. Der Chat passt sich jetzt dem sichtbaren Teil des Bildschirms an.",
        "Behoben: «Chat» im Menü zeigte angemeldet das Gespräch, das man gerade verlassen hatte, und die nächste Nachricht landete darin. Jetzt öffnet «Chat» ein leeres Gespräch.",
      ],
    },
    {
      date: "2026-09-30",
      tag: "improvement",
      title: "Schwiizerdütsch, durchgehend",
      summary:
        "Schwiizerdütsch steht jetzt zuoberst in der Sprachauswahl. Wer die Seite auf Schwiizerdütsch liest, bekommt Heidis Erklärungen auch in gespeicherten Gesprächen auf Züridütsch — bisher behielten sie die Sprache, in der sie begonnen hatten.",
      items: [
        "Sprachauswahl, Fusszeile und Einstellungen zeigen die Sprachen in derselben Reihenfolge: zuerst die Mundart, dann die vier Landessprachen, dann Englisch und Russisch.",
        "Ein Gespräch folgt der Sprache der Seite, von der aus Sie schreiben — nicht der, in der es begonnen hat.",
        "Die Beschriftungen der Vorschläge («Wärmer», «Chürzer») und der Ton kommen aus dem Wörterbuch, statt als Englisch des Modells zu erscheinen («warmer», «shorter», «bridge»).",
        "Die Übersetzung unter einem Vorschlag steht in Ihrer Sprache; wer Schwiizerdütsch liest, bekommt unter einer Mundartzeile keine. Im Test mit dem echten Modell: vorher englische Übersetzungen in 2 von 2 Antworten mit Übersetzung, nachher in keiner von 4.",
        "Angemeldet folgt Ihnen die gewählte Sprache auf jedes Gerät: Nach dem Anmelden öffnet sich die Seite in der Sprache, die Sie zuletzt gewählt haben. Deutsch bleibt der Standard für alle anderen.",
      ],
    },
    {
      date: "2026-09-26",
      tag: "feature",
      title: "Fünf neue Übungsarten — und nach jeder Antwort ein Warum",
      summary:
        "Die Übungen fragen jetzt auch, was jemand meint, welche Antwort passt, welcher Satz genau das Deutsche sagt, welche Uhrzeit oder welcher Preis gemeint ist, und was ein Wort im Satz heisst. Der Fragenpool ist von 1451 auf 1793 Fragen gewachsen, die eindeutig prüfbaren von 246 auf 588.",
      items: [
        "«Was passt als Antwort?» — 40 Fragen aus den Situationen: auf «Zäme oder separat?» eine der zwei Möglichkeiten, auf «Sit wenn …?» ein «sit», kein «für».",
        "«Was ist gemeint?» — 34 gehörte Sätze mit vier Lesarten, darunter die höflichen Absagen («Mer luegt dänn») und die Fallen «mag» und «hei».",
        "«Welcher Satz sagt genau das?» — 25 Fragen, bei denen jede falsche Antwort richtiges Züridütsch ist, das etwas anderes sagt: wir statt sie, gehen statt kommen, vorbei statt jetzt.",
        "Uhrzeiten und Preise — 30 Fragen: «halbi drüü», «Viertel ab achti», «drüü Franke zwänzg».",
        "«Was heisst das Wort hier?» — 213 Wörter im eigenen Satz; bei den falschen Freunden wie «schmöcke» oder «Eschtrich» steht die naheliegende falsche Bedeutung zur Auswahl.",
        "Nach jeder dieser Fragen: das Wort, auf das es ankam, und ein Satz, warum — in allen sieben Sprachen.",
        "Behoben: Eine gemischte Übung über alles zog die Fragetypen in alphabetischer Reihenfolge, und weil es mehr Typen als Plätze gab, kam «Auf Züridütsch schreiben» nie dran. Jetzt kommt zuerst, was am längsten nicht gefragt wurde.",
      ],
    },
    {
      date: "2026-09-26",
      tag: "improvement",
      title: "Eine Startseite, die man in einer Minute liest",
      summary:
        "Die Startseite sagt jetzt in zwei Spalten, worum es geht — mit einer Kuh vor den Alpen daneben — und führt in drei Schritten hinein: Situationen, Üben, Chat.",
      items: [
        "Fast halb so viel Text: rund 250 statt 440 Wörter.",
        "Das Beispiel klingt wie eine echte Nachricht vom Mittagstisch: «Geschter im Kauz gsi — mega geil! 😍 Chunnsch s nächscht Mal au?»",
        "Das Menü öffnet auf Klick, zeigt jede Seite mit einem Satz dazu und schliesst mit Escape oder einem Klick daneben.",
        "Auf dem Handy öffnet das Menü als ganze Seite, mit grossen Kacheln und dem Chat zuoberst.",
      ],
    },
    {
      date: "2026-09-26",
      tag: "improvement",
      title: "Mehr Grammatik, mehr Wörter — und eine echte Regel für das -li",
      summary:
        "Sieben neue Grammatikthemen, 62 neue Wörter, und das Thema zum -li sagt jetzt, wie die Form gebildet wird, statt dass sie «oft nichts Kleines bedeutet».",
      items: [
        "Neu: hett, wär, chönnt (der Konjunktiv) · en, em, ere (Pronomen, die wie Artikel aussehen) · gsi, gha, cho (Partizipien ohne ge-) · chönne cho (die Verben am Ende andersherum) · ine, use, ufe, abe · de Peter, d Anna (Artikel vor Namen) · am vieri, halbi drüü (die Uhrzeit).",
        "Das -li-Thema zeigt die Regel: Umlaut wo möglich, immer sächlich (d Chatz → s Chätzli), Mehrzahl unverändert — und dass Rüebli, Gipfeli, Weggli, Müesli und Meitli einfach die normalen Wörter sind.",
        "Der Wortschatz wächst von 164 auf 226 Einträge: vor allem kurze Wörter und Verben (ämel, worum, eso, dusse, lah, lauffe, aalege), dazu hebe und rüere, die im Deutschen etwas anderes heissen.",
        "Alle neuen Beispiele laufen durch dieselbe Zürich-Prüfung wie der Rest; die Übungen haben dadurch 1451 statt 1233 Fragen.",
      ],
    },
    {
      date: "2026-09-26",
      tag: "improvement",
      title: "Das stärkste Modell, das Ihr Schlüssel kann",
      summary:
        "Wer einen eigenen API-Schlüssel mitbringt, fügt ihn ein — Heidi prüft ihn sofort und zeigt die Modelle, die er erreicht, das stärkste vorausgewählt.",
      items: [
        "Zehn Anbieter statt fünf, neu auch Anthropic, Google Gemini, Mistral, xAI und Cerebras.",
        "Die Prüfung kostet nichts mehr: Heidi fragt den Anbieter, welche Modelle der Schlüssel kann, statt eine Probeanfrage zu bezahlen.",
        "Klappt es nicht, steht dort, was der Anbieter meldet — etwa ein leeres Guthaben. «Nicht erreichbar» heisst nicht «falscher Schlüssel».",
        "Der Schlüssel bleibt wie bisher nur in Ihrem Browser.",
      ],
    },
    {
      date: "2026-09-26",
      tag: "improvement",
      title: "Die Mundarten, aus der Fachliteratur belegt",
      summary:
        "Jede Mundartseite zeigt jetzt Formen, an denen man die Gegend erkennt — jede mit Quelle —, und verlinkt die Grammatiken und Wörterbücher der Region.",
      items: [
        "Neu erkannt: Wallis (appas, wier, wilt, Häärpfel, Aache), Innerschweiz (Gumel, Eiker), Glarus (schüü), Sensebezirk (gùgge), Graubünden (eswas), dazu mehr für Bern (geisch, geit, Hung).",
        "Belegt mit dem Sprachatlas der deutschen Schweiz — Band und Karte stehen bei jeder Form —, dem Dialäktatlas 2025 und den Bänden der Reihe «Grammatiken und Wörterbücher des Schweizerdeutschen».",
        "Korrigiert: «het», «nid», «goht» und «stoht» sind keine Merkmale anderer Gegenden; der Atlas belegt sie auch im Kanton Zürich. Heidi schreibt weiterhin hät, nöd, gaht, staht, stuft die anderen Formen aber nicht mehr als fremd ein.",
        "Die Übung «Welches ist Zürich?» fragt nur noch nach Formen, die sicher nicht zürcherisch sind.",
      ],
    },
    {
      date: "2026-09-25",
      tag: "improvement",
      title: "Mitsprache gehört zu Solon",
      summary:
        "Die offenen Stimmen und Kommentare auf Fahrplan und Änderungen sind wieder weg. Eine Stimme ist ein Recht, das jemand hat — sie kommt über Solon, mit Konto und einem Sitz in Heidis Organisation.",
      items: [
        "Fahrplan und Änderungen sind wieder zum Lesen da.",
        "Hinweise zu jeder Seite gehen weiterhin über das Rückmelde-Fenster.",
        "Was bisher abgegeben wurde, bleibt gespeichert und steht auf der Datenschutzseite.",
      ],
    },
    {
      date: "2026-09-25",
      tag: "feature",
      title: "Heidi für Teams",
      summary:
        "Eine Gruppe kann jetzt ein Team sein: Wer sie angelegt hat, wählt den Schwerpunkt — etwa die Situationen im Pflegeheim — und sieht, wer in welchen Situationen sicher ist.",
      items: [
        "Jedes Mitglied entscheidet selbst, ob es seinen Stand zeigt, und kann es jederzeit zurücknehmen. Ohne diese Entscheidung sieht die Leitung nur den Namen.",
        "Gezeigt wird der Stand pro Situation und die Zahl der Nachweise — nie, welche Sätze oder was jemand falsch gemacht hat.",
        "Wer teilt, aber den Abgleich zwischen Geräten nicht eingeschaltet hat, erscheint als «noch nichts zu sehen», nicht als «nicht angefangen».",
        "Auf der Seite für Organisationen steht, wie man ein Team anlegt.",
      ],
    },
    {
      date: "2026-09-25",
      tag: "feature",
      title: "Ihr Fortschritt auf allen Geräten, und ein Nachweis pro Situation",
      summary:
        "Angemeldet können Sie in den Einstellungen «Fortschritt auf allen Geräten» einschalten: Übungen, Serie und gemerkte Wörter sind dann auf Handy und Laptop dieselben. Wer eine Situation sicher versteht, kann dafür einen Nachweis ausstellen lassen.",
      items: [
        "Ausgeschaltet — so ist es, bis Sie es ändern — bleibt alles in Ihrem Browser.",
        "Jedes Gerät zählt nur, was auf ihm geübt wurde; angezeigt wird die Summe. So wird nie etwas doppelt gezählt.",
        "Ein gelöschtes gemerktes Wort bleibt gelöscht, auch auf den anderen Geräten.",
        "Der Nachweis wird auf dem Server aus Ihrem abgeglichenen Fortschritt ausgestellt, nach denselben Regeln wie die Anzeige auf der Situationsseite. Er hat eine eigene Seite, die jede Person mit dem Link prüfen kann — ohne Ihren Namen.",
        "Ausschalten entfernt die Kopie dieses Geräts vom Server; «Alles Abgeglichene löschen» entfernt alles.",
      ],
    },
    {
      date: "2026-09-25",
      tag: "feature",
      title: "Fünf neue Situationen, und jede tiefer",
      summary:
        "Beim Arzt, auf der Gemeinde, in der Waschküche, am Apéro — und wenn «Nein» nicht «Nein» heisst. Die bisherigen vierzehn Situationen haben je zehn Sätze mehr.",
      items: [
        "19 Situationen mit zusammen 390 Sätzen, vorher 14 mit 140.",
        "«Wenn Nein nicht Nein heisst»: «Mer chönnt sich das überlegge», «Das isch ächli schwierig» — und was man darauf sagt.",
        "Neue Sätze stehen hinten an; was Sie schon geübt haben, bleibt dort, wo es war.",
        "Jede Übersetzung wird jetzt auch auf Schweizer Hochdeutsch geprüft: «das Velo», nicht «das Fahrrad».",
      ],
    },
    {
      date: "2026-09-25",
      tag: "feature",
      title: "Mitreden beim Fahrplan und bei jeder Änderung",
      summary:
        "Bei jedem Punkt des Fahrplans können Sie sagen, ob Sie ihn brauchen, und darunter kommentieren. Was fehlt, schlagen Sie vor. Unter jeder Änderung hier können Sie etwas sagen. Ein Konto brauchen Sie dafür nicht.",
      items: [
        "Pro Browser zählt eine Stimme pro Punkt; ein zweiter Klick nimmt sie zurück.",
        "Ein Vorschlag, den es ähnlich schon gibt, wird Ihnen gezeigt, bevor Sie ihn senden — mit «Ich auch» statt einer zweiten Zeile.",
        "Gespeichert wird nur, was Sie schreiben, mit einem zufälligen Schlüssel Ihres Browsers — nicht, wer Sie sind. Die Datenschutzseite führt es auf.",
      ],
    },
    {
      date: "2026-09-25",
      tag: "feature",
      title: "Woher kommt diese Nachricht?",
      summary:
        "Auf der Mundart-Seite lässt sich eine Nachricht einfügen, die man bekommen hat. Heidi zeigt, welche Formen woher kommen, was sie in Zürich hiessen und was die Wörter bedeuten.",
      items: [
        "«Giel», «Meitschi», «Miuch» weisen nach Bern, «Drämmli» und «Kuchi» nach Basel; «Fahrrad» und «Sahne» klingen nach Deutschland.",
        "Jedes erkannte Zürcher Wort steht mit seiner Bedeutung da: «nöd = nicht», «isch = ist».",
        "Zu wenig Text heisst «zu wenig, um es einzuordnen» — Heidi rät nicht.",
        "«nid» galt bisher als Ostschweizer Form. Es ist Berndeutsch und Innerschweizerisch; die Ostschweiz sagt «nöd» wie Zürich. Korrigiert.",
      ],
    },
    {
      date: "2026-09-25",
      tag: "feature",
      title: "Serien und ein Wochenziel",
      summary:
        "Mein Bereich zeigt jetzt, wie viele Tage in Folge Sie geübt haben, Ihren Bestwert und ein Wochenziel, das Sie selbst wählen.",
      items: [
        "Ein verpasster Tag wird automatisch überbrückt; alle sieben Tage kommt eine Überbrückung dazu.",
        "Endet eine Serie, steht dort «Heute anfangen» neben dem Bestwert — kein «verloren».",
        "Das Wochenziel: 1 bis 7 Tage, Vorgabe 3. Über jeder Übung steht der Stand in einer Zeile.",
        "Alles bleibt in Ihrem Browser.",
      ],
    },
    {
      date: "2026-09-22",
      tag: "feature",
      title: "Üben ist jetzt etwas, das Sie wählen",
      summary:
        "Tippen war überall und Karten gab es nicht. Beides ist jetzt eine eigene Übungsart, und dazu kam ein Test, der erst am Schluss etwas sagt.",
      items: [
        "Vier Arten zu üben: Gemischt, Antippen, Schreiben, Karten. Die Wahl steht in der URL, ist also teilbar.",
        "Zwei neue Aufgabentypen: ganze Sätze auf Züridütsch schreiben, und echte Lernkarten über den ganzen Wortschatz.",
        "Der Fragenpool wuchs von 221 auf 553 Aufgaben.",
        "Ein Test: zwanzig Fragen am Stück, unterwegs sagt Heidi nichts, am Schluss alle Antworten mit Erklärung — die falschen zuerst. Zeit nehmen ist freiwillig und lässt sich verlängern.",
        "Das Tippfeld ist aus den Karten- und Lückenaufgaben verschwunden. Es tauchte vorher bei jeder zweiten oder dritten Frage auf.",
      ],
    },
    {
      date: "2026-09-22",
      tag: "fix",
      title: "Eine Konjugationsfrage übersetzte genau das, was sie lehrt",
      summary:
        "Auf Russisch stand «мы ___» über der Frage, welche Zürcher Verbform passt. Wer sie richtig beantwortete, hatte `mir chömed` nie gesehen — und das war die einzige Zeichenfolge, um die es ging.",
      items: [
        "Das Pronomen kommt jetzt aus dem Varietäten-Pack und steht in Mundart da; das Wort der Leserin rutscht in die Zeile darunter.",
        "Im Englischen hiess ein Menü «Practise» und sein erster Eintrag ebenfalls «Practise». Dasselbe in fünf von sieben Sprachen. Ein Test beendet diese Fehlerklasse.",
      ],
    },
    {
      date: "2026-09-22",
      tag: "fix",
      title: "Eine Aufnahme ohne Sprache bekam Wörter untergeschoben",
      summary:
        "Eine 1,5-Sekunden-Aufnahme — die das Produkt selbst als zu kurz für jede Aussage einstuft — ging an die Transkription und kam als «Bis zum nächsten Mal.» zurück. Vier Wörter, die niemand gesagt hatte.",
      items: [
        "Aufnahmen unterhalb der eigenen Schwelle verlassen das Gerät jetzt gar nicht mehr.",
        "Gefunden von einem neuen Prüfwerkzeug, das die Seite mit einem künstlichen Mikrofon durchspielt — nicht durch Lesen des Quelltexts.",
      ],
    },
    {
      date: "2026-09-21",
      tag: "feature",
      title: "Die Nachschlageseiten tun jetzt etwas",
      summary:
        "Grammatik, Wortschatz und Situationen waren zum Lesen da. Jetzt führt jede Seite in Übungen, die genau bei ihrem Thema bleiben.",
      items: [
        "Jedes Grammatikthema hat eine eigene Seite und einen Knopf, der nur dieses Thema übt.",
        "Heidi merkt sich, welche Themen und Wörter Ihnen Mühe machen, und zieht sie vor.",
        "Der Stoff wuchs deutlich: 11 Grammatikthemen, 83 Wörter, 14 Szenen.",
      ],
    },
    {
      date: "2026-09-20",
      tag: "feature",
      title: "Wo Sie es brauchen: sechs Szenen aus einer Schicht",
      summary:
        "Übergabe, Morgen, Schmerz, Essen, Abend, Besuch — Sätze, wie sie in der Pflege wirklich fallen, maschinell auf Zürcher Formen geprüft.",
      items: [
        "Jede Zeile nennt ihre Quelle und jede hat das Varietäten-Gate passiert.",
        "Die Seite schreibt selbst hin, dass noch keine Muttersprachlerin sie gegengelesen hat.",
      ],
    },
    {
      date: "2026-09-18",
      tag: "feature",
      title: "Ein Ort, um den Mund aufzumachen",
      summary:
        "Nehmen Sie sich auf und sehen Sie, was die Aufnahme tatsächlich zeigt: Sprechzeit, Pausen, und welche Wörter aus einer anderen Mundart stammen.",
      items: [
        "Keine Note für die Aussprache. Das kann heute niemand ehrlich messen, und eine Zahl wäre eine Behauptung über einen Menschen.",
        "Auf Züridütsch wird bewusst nicht transkribiert: kein System schreibt diese Mundart zuverlässig auf.",
      ],
    },
    {
      date: "2026-09-17",
      tag: "feature",
      title: "Was ein Computer mit Schweizerdeutsch kann — mit Zahlen",
      summary:
        "Korpora, Worterkennungsraten, Sprachsynthese und Sprachmodelle, jedes mit Quelle. Damit Sie unsere Behauptungen dagegen prüfen können.",
      items: [
        "Die beste nachprüfbare Wortfehlerrate liegt bei 12,1 % — und diese Gewichte sind nicht veröffentlicht.",
        "Fast jedes Zürcher Korpus ist forschungslizenziert oder hat eine strittige Lizenz.",
      ],
    },
    {
      date: "2026-09-15",
      tag: "feature",
      title: "Ein Nachschlagewerk, das auf Daten steht",
      summary:
        "Jedes Dialektgebiet der Deutschschweiz, eine Karte, die sagt, welche Behauptung sie macht, und Wörter, die einen Satz wirklich blockieren.",
      items: [
        "Behauptungen sind Daten, geprüft und mit Quelle — keine übersetzte Prosa, die niemand hier nachlesen kann.",
      ],
    },
    {
      date: "2026-09-10",
      tag: "platform",
      title: "Heidi fängt an",
      summary: "Ein Feld auf einer Seite: fügen Sie eine echte Nachricht ein und bekommen Sie sie erklärt.",
      items: [
        "Vier deterministische Wächter zwischen Modell und Lernender, weil genau diese Person die Arbeit nicht prüfen kann.",
        "Jede erzeugte Zeile geht durch das Varietäten-Gate, bevor sie jemand sieht.",
      ],
    },
  ],

  en: [
    {
      date: "2026-09-30",
      tag: "feature",
      title: "Exercises get their own screen, like an app",
      summary:
        "Practice, the test and the warm-up no longer run as a box in the middle of a page. \u201cLosgehen\u201d opens a screen with only the exercise: a close button and a progress bar on top, the question in the middle, and the answer buttons in a bar at the bottom where your thumb is. No header, no footer, and nothing above the question that could push it around.",
      items: [
        "Close it half way and your place is kept: opening the same sitting within 12 hours carries on where you stopped, and the button on the practice page says so. Stored only in the browser.",
        "The practice page is now where you choose what to practise; the warm-up page explains the warm-up and starts it. Links from grammar topics, situations and word groups open the same sittings as before.",
        "The test\u2019s clock sits in the top bar. On a computer the screen is the same, centred, with the buttons along the bottom.",
        "Fixed: \u201cGewusst\u201d on a card skipped the next question. The card reported its answer twice, so it was counted twice and the sitting jumped two places. One tap is one answer now.",
      ],
    },
    {
      date: "2026-09-30",
      tag: "fix",
      title: "On a phone, the page no longer jumps when you answer",
      summary:
        "After every answer the next question landed somewhere else on the screen, and you had to scroll back. Above the question, the streak and \u201cWhat to work on\u201d grew with each answer, and an iPhone then pushes the whole page. Now an exercise on a phone runs full screen, like an app, and every new question starts at the top.",
      items: [
        "Practice, the test, the warm-up and the chat on the home page open across the whole screen on a phone. \u201cMinimise\u201d puts them back into the page without losing answers or the conversation; \u201cContinue full screen\u201d opens them again.",
        "In the chat, the message box sits at the bottom of the screen. A saved conversation opens when you write, not as soon as the home page loads.",
        "On a computer everything stays in the page. When a new question starts above what is visible, the page scrolls to it.",
        "The language switcher shows \u201cCH\u201d for Swiss German instead of \u201cGSW\u201d. \u201cGSW\u201d is the language code from the address and looked like a mistake in the page header.",
      ],
    },
    {
      date: "2026-09-30",
      tag: "feature",
      title: "Warm-up: how much Zurich German do you already understand?",
      summary:
        "Eight Zurich lines in two minutes, with no grade and no level. Afterwards you see which situations you already follow and where starting pays off.",
      items: [
        "The lines get harder while you keep up and easier after a miss. After each answer you see the word the line turns on.",
        "Your answers feed your practice: the first session starts where the warm-up found the gaps.",
        "If you also get the between-the-lines questions, you are offered the site in Swiss German. A no is not asked again.",
        "Offered on the home page, on your dashboard (until you have done it) and on the practice page. Stored only in your browser.",
      ],
    },
    {
      date: "2026-09-30",
      tag: "fix",
      title: "Heidi answers what you wrote last",
      summary:
        "After three answers about «Le Bilan», someone asked «Pire» — and got a fourth sentence about «Le Bilan», twice. The chat handed the model the whole conversation as one list, without saying which message was the question. The new message now stands on its own, and a single word is taken as a question about that word.",
      items: [
        "Tested against the real model: before, «Pire» got another «Le Bilan» sentence in 4 of 6 runs; after, in none.",
        "Heidi now remembers the sentence she wrote, not only her explanation of it — «Shorter» still means the last answer.",
        "The model sees the last 20 messages, saved conversations included; there it used to get the whole conversation however long.",
        "«New conversation» sits right above the chat on a phone instead of only in the side menu, and in the floating chat it is an icon beside expand and close instead of a link that wrapped.",
        "Fixed: with the phone keyboard open, the top of the chat — and «New conversation» in it — slid off the screen. The chat now fits the part of the screen you can see.",
        "Fixed: signed in, «Chat» in the menu showed the conversation you had just left, and the next message went into it. «Chat» now opens an empty conversation.",
      ],
    },
    {
      date: "2026-09-30",
      tag: "improvement",
      title: "Swiss German, all the way through",
      summary:
        "Schwiizerdütsch now comes first in the language menu. Reading the site in Swiss German gets you Heidi's explanations in Züridütsch in saved conversations too. They used to keep the language they were started in.",
      items: [
        "The language menu, the footer and settings list languages in one order: the dialect first, then the four national languages, then English and Russian.",
        "A conversation follows the language of the page you write from, not the one it began in.",
        "Suggestion labels («Wärmer», «Chürzer») and the tone come from the dictionary instead of appearing as the model's English («warmer», «shorter», «bridge»).",
        "The translation under a suggestion is in your language, and a Swiss German reader gets none under a dialect line. Tested against the real model: English translations in 2 of 2 answers that carried translations before, in none of 4 after.",
        "Signed in, your chosen language follows you to every device: after signing in, the page opens in the language you last picked. German stays the default for everyone else.",
      ],
    },
    {
      date: "2026-09-26",
      tag: "feature",
      title: "Five new kinds of question — and a reason after every answer",
      summary:
        "Practice now also asks what somebody means, which reply fits, which sentence says exactly the German, what time or price was said, and what a word means in its sentence. The pool grew from 1,451 questions to 1,793, the objectively marked ones from 246 to 588.",
      items: [
        "\"Which reply fits?\" — 40 questions from the situations: «Zäme oder separat?» wants one of two words back, «Sit wenn …?» wants a «sit», not a «für».",
        "\"What is meant?\" — 34 heard lines with four readings, among them the polite refusals («Mer luegt dänn») and the traps «mag» and «hei».",
        "\"Which sentence says exactly this?\" — 25 questions where every wrong answer is correct Zurich German that says something else: we instead of they, going instead of coming, over instead of now.",
        "Times and prices — 30 questions: «halbi drüü», «Viertel ab achti», «drüü Franke zwänzg».",
        "\"What does the word mean here?\" — 213 words in their own sentence; for false friends like «schmöcke» or «Eschtrich», the tempting wrong meaning is one of the options.",
        "After each of these: the word the answer turned on, and one sentence on why — in all seven languages.",
        "Fixed: a mixed session over everything drew question types in alphabetical order, and with more types than seats, writing in Zurich German was never asked at all. Now the type asked least recently goes first.",
      ],
    },
    {
      date: "2026-09-26",
      tag: "improvement",
      title: "A home page you can read in a minute",
      summary:
        "The home page now says what Heidi is in two columns — with a cow in front of the Alps beside it — and leads in through three steps: situations, practice, chat.",
      items: [
        "Nearly half the text: about 250 words instead of 440.",
        "The example reads like a real message from the lunch table: «Geschter im Kauz gsi — mega geil! 😍 Chunnsch s nächscht Mal au?»",
        "The menu opens on a click, shows every page with one line about it, and closes with Escape or a click outside.",
        "On a phone the menu opens as a full page, with large tiles and the chat at the top.",
      ],
    },
    {
      date: "2026-09-26",
      tag: "improvement",
      title: "More grammar, more words — and a real rule for the -li",
      summary:
        "Seven new grammar topics, 62 new words, and the -li topic now says how the form is built instead of that it \"often means nothing small\".",
      items: [
        "New: hett, wär, chönnt (the subjunctive) · en, em, ere (pronouns that look like articles) · gsi, gha, cho (participles without ge-) · chönne cho (the final verbs the other way round) · ine, use, ufe, abe · de Peter, d Anna (the article before a name) · am vieri, halbi drüü (telling the time).",
        "The -li topic states the rule: umlaut where possible, always neuter (d Chatz → s Chätzli), plural unchanged — and that Rüebli, Gipfeli, Weggli, Müesli and Meitli are simply the ordinary words.",
        "The vocabulary grows from 164 to 226 entries, mostly short words and verbs (ämel, worum, eso, dusse, lah, lauffe, aalege), plus hebe and rüere, which mean something else in German.",
        "Every new example passes the same Zurich check as the rest; practice now has 1451 questions instead of 1233.",
      ],
    },
    {
      date: "2026-09-26",
      tag: "improvement",
      title: "The strongest model your key can use",
      summary:
        "Bring your own API key: paste it, Heidi checks it at once and lists the models it can reach, with the strongest preselected.",
      items: [
        "Ten providers instead of five, now including Anthropic, Google Gemini, Mistral, xAI and Cerebras.",
        "The check no longer costs anything: Heidi asks the provider which models the key can use instead of paying for a test request.",
        "When it fails, you see what the provider says — an empty balance, for instance. «Could not be reached» is not «wrong key».",
        "The key stays only in your browser, as before.",
      ],
    },
    {
      date: "2026-09-26",
      tag: "improvement",
      title: "The dialects, documented from the literature",
      summary:
        "Every dialect page now shows forms that identify the region — each with its source — and links the region’s grammars and dictionaries.",
      items: [
        "Newly recognised: Wallis (appas, wier, wilt, Häärpfel, Aache), Central Switzerland (Gumel, Eiker), Glarus (schüü), Sense (gùgge), Graubünden (eswas), and more for Bern (geisch, geit, Hung).",
        "Sourced from the Linguistic Atlas of German-speaking Switzerland — volume and map given for every form —, the 2025 Dialäktatlas, and the volumes of the series «Grammatiken und Wörterbücher des Schweizerdeutschen».",
        "Corrected: «het», «nid», «goht» and «stoht» are not markers of other regions; the atlas records them inside the canton of Zurich too. Heidi still writes hät, nöd, gaht, staht, but no longer calls the others foreign.",
        "The «Which one is Zurich?» exercise now only asks about forms that are certainly not Zurich German.",
      ],
    },
    {
      date: "2026-09-25",
      tag: "improvement",
      title: "A say belongs to Solon",
      summary:
        "The open votes and comments on the roadmap and changelog are gone again. A voice is a right someone holds — it comes through Solon, with an account and a seat in Heidi’s organisation.",
      items: [
        "The roadmap and the changelog are for reading again.",
        "Pointing at anything on any page still goes through the feedback widget.",
        "What was submitted so far stays stored and is listed on the privacy page.",
      ],
    },
    {
      date: "2026-09-25",
      tag: "feature",
      title: "Heidi for Teams",
      summary:
        "A group can now be a team: whoever created it chooses the focus — the situations in a care home, for example — and sees who is secure in which situations.",
      items: [
        "Every member decides for themselves whether to show their progress, and can take it back at any time. Until they do, the lead sees only their name.",
        "What is shown is the standing per situation and the number of certificates — never which lines, or what anyone got wrong.",
        "A member who shares but has not switched on sync between devices shows as «nothing to see yet», not as «not started».",
        "The page for organisations explains how to create a team.",
      ],
    },
    {
      date: "2026-09-25",
      tag: "feature",
      title: "Your progress on every device, and a certificate per situation",
      summary:
        "Signed in, you can switch on «Progress on every device» in settings: practice, streak and saved words are then the same on phone and laptop. Whoever understands a situation securely can have a certificate issued for it.",
      items: [
        "Switched off — as it is until you change it — everything stays in your browser.",
        "Each device counts only what was practised on it; what you see is the sum. Nothing is ever counted twice.",
        "A saved word you delete stays deleted, on your other devices too.",
        "The certificate is issued on the server from your synced progress, by the same rules as the situation page. It has its own page anyone with the link can check — without your name.",
        "Switching off removes this device’s copy from the server; «Delete everything synced» removes all of it.",
      ],
    },
    {
      date: "2026-09-25",
      tag: "feature",
      title: "Five new situations, and every one deeper",
      summary:
        "At the doctor's, at the municipal office, in the laundry room, at an apéro — and when «no» does not mean no. The fourteen existing situations each gained ten lines.",
      items: [
        "19 situations with 390 lines in all, up from 14 with 140.",
        "«When no doesn’t mean no»: «Mer chönnt sich das überlegge», «Das isch ächli schwierig» — and what to say back.",
        "New lines are added at the end; what you have already practised stays where it was.",
        "Every translation is now also checked for Swiss Standard German: «das Velo», not «das Fahrrad».",
      ],
    },
    {
      date: "2026-09-25",
      tag: "feature",
      title: "Have your say on the roadmap and on every change",
      summary:
        "You can mark every roadmap item as needed or not, and comment on it. Suggest what is missing. Under every change here you can reply. No account needed.",
      items: [
        "One vote per item per browser; clicking again takes it back.",
        "A suggestion that already exists in some form is shown to you before you send yours — with «Me too» instead of a second row.",
        "Only what you write is stored, with a random key your browser keeps — not who you are. The privacy page lists it.",
      ],
    },
    {
      date: "2026-09-25",
      tag: "feature",
      title: "Where is this message from?",
      summary:
        "On the dialect page you can paste a message you received. Heidi shows which forms come from where, what Zurich says instead, and what the words mean.",
      items: [
        "«Giel», «Meitschi», «Miuch» point to Bern, «Drämmli» and «Kuchi» to Basel; «Fahrrad» and «Sahne» read as Germany.",
        "Every Zurich word it recognises is shown with its meaning: «nöd = nicht», «isch = ist».",
        "Too little text says so — Heidi does not guess.",
        "«nid» was labelled an eastern Swiss form. It is Bernese and central Swiss; the east says «nöd» like Zurich. Corrected.",
      ],
    },
    {
      date: "2026-09-25",
      tag: "feature",
      title: "Streaks and a weekly goal",
      summary:
        "Your area now shows how many days in a row you have practised, your best run, and a weekly goal you choose.",
      items: [
        "One missed day is bridged automatically; you earn a bridge every seven days.",
        "When a run ends it says «start today» beside your best — never «lost».",
        "The weekly goal: 1 to 7 days, 3 by default. Above every practice session, one line shows where you stand.",
        "All of it stays in your browser.",
      ],
    },
    {
      date: "2026-09-22",
      tag: "feature",
      title: "Practice is now something you choose",
      summary:
        "Typing was everywhere and cards did not exist. Both are their own mode now, and there is a test that says nothing until the end.",
      items: [
        "Four ways to practise: mixed, tapping, writing, cards. The choice lives in the URL, so it is shareable.",
        "Two new question types: write whole sentences in Zurich German, and real flashcards over the whole vocabulary.",
        "The question pool grew from 221 to 553.",
        "A test: twenty questions in a row, silence as you go, every answer with its explanation at the end — the wrong ones first. The clock is optional and can be extended.",
        "The typing field is gone from the card and gap questions. It used to appear every second or third question.",
      ],
    },
    {
      date: "2026-09-22",
      tag: "fix",
      title: "A conjugation question was translating the thing it teaches",
      summary:
        "In Russian the prompt read «мы ___» above a question about which Zurich verb form fits. Answering it correctly left you having never seen `mir chömed` — the only string it was ever about.",
      items: [
        "The pronoun now comes from the variety pack and is printed in dialect; the reader's own word moves to the line underneath.",
        "In English a menu was called «Practise» and its first entry was also «Practise». The same in five of seven languages. A test ends that class of bug.",
      ],
    },
    {
      date: "2026-09-22",
      tag: "fix",
      title: "A recording with no speech in it was given words",
      summary:
        "A 1.5-second take — which the product itself calls too short to say anything about — was sent to be transcribed and came back as «Bis zum nächsten Mal.» Four words nobody had said.",
      items: [
        "Recordings below our own threshold no longer leave the device at all.",
        "Found by a new harness that drives the page with a fake microphone — not by reading the source.",
      ],
    },
    {
      date: "2026-09-21",
      tag: "feature",
      title: "The reference pages do something now",
      summary:
        "Grammar, vocabulary and situations were there to read. Each one now leads into practice that stays on its subject.",
      items: [
        "Every grammar topic has its own page and a button that drills only that topic.",
        "Heidi keeps track of which topics and words are giving you trouble, and brings them forward.",
        "The material grew considerably: 11 grammar topics, 83 words, 14 scenes.",
      ],
    },
    {
      date: "2026-09-20",
      tag: "feature",
      title: "Where you need it: six scenes from a shift",
      summary:
        "Handover, the morning, pain, meals, the evening, visitors — lines as they are actually said in care work, machine-checked for Zurich forms.",
      items: [
        "Every line names its source and every line passed the variety gate.",
        "The page says for itself that no native speaker has read them yet.",
      ],
    },
    {
      date: "2026-09-18",
      tag: "feature",
      title: "Somewhere to open your mouth",
      summary:
        "Record yourself and see what the recording actually shows: time spent speaking, where the pauses were, and which words came from another dialect.",
      items: [
        "No score for pronunciation. Nobody can measure that honestly today, and a number would be a claim about a person.",
        "In Zurich German nothing is transcribed, on purpose: no system writes this dialect down reliably.",
      ],
    },
    {
      date: "2026-09-17",
      tag: "feature",
      title: "What a computer can do with Swiss German — with the numbers",
      summary:
        "Corpora, word error rates, speech synthesis and language models, each with its source, so you can check our claims against the field.",
      items: [
        "The best verifiable word error rate is 12.1 % — and those weights are not published.",
        "Almost every Zurich corpus is research-licensed or has a contested licence.",
      ],
    },
    {
      date: "2026-09-15",
      tag: "feature",
      title: "A reference section built on data",
      summary:
        "Every German-speaking dialect area of Switzerland, a map that says which claim it is making, and the words that actually block a sentence.",
      items: ["A claim is data, gated and cited — not translated prose nobody here can check."],
    },
    {
      date: "2026-09-10",
      tag: "platform",
      title: "Heidi starts",
      summary: "One field on one page: paste a real message and have it explained.",
      items: [
        "Four deterministic guards between the model and the learner, because that learner is exactly the person who cannot check the work.",
        "Every generated line goes through the variety gate before anybody sees it.",
      ],
    },
  ],
};

/** The date of the most recent entry, for the page and for the roadmap eyebrow. */
export function lastChanged(locale: SectorLocale): string {
  return CHANGELOG[locale][0]?.date ?? "";
}
