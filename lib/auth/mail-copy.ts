import type { RenderedAuthMail } from "@bitbaum/accountkit/auth/mail";
import type { AuthMailExtra, AuthMailKind } from "@bitbaum/accountkit/auth/server";
import { spacedCode } from "@bitbaum/accountkit/auth/mail";
import { DEFAULT_LOCALE, type Locale } from "../i18n/locales.ts";
import { renderMail, type MailBrand } from "@bitbaum/mail-kit";
import { ASSISTANT_NAME, SITE_URL } from "../config/site.ts";
import { localeIn } from "./paths.ts";

/**
 * Account mail in the language the person was reading.
 *
 * The shared template is English only, so someone who signed up on
 * `/de/sign-up` got "Confirm your email for Heidi" — the one message that
 * decides whether an account is finished arrived in a language the page had
 * never used. accountkit's `render` slot exists for exactly this ("the
 * product's own template (its languages …)"); the transport, the origin check
 * and the undeliverable-address rule stay the package's.
 *
 * WHICH LANGUAGE. The mailer is not told one, but every link it is handed
 * carries the page the person will land on — `callbackURL=/fr/settings` — and
 * that page's locale is the language they were reading. Nothing is stored and
 * nothing is guessed from the address.
 *
 * Swiss German mail is written in Standard German, like the account screens
 * (`auth-labels.ts`): a form is where a learner expects the written standard.
 */
type Copy = {
  subject: Record<AuthMailKind, string>;
  /** Shown above the link. */
  lead: Record<AuthMailKind, string>;
  /** The magic-link code line; `{code}` is the spaced code. */
  code: string;
  expires: string;
  ignore: string;
  /** The page's heading, the button that does the thing, and why this mail arrived. */
  heading: Record<AuthMailKind, string>;
  button: Record<AuthMailKind, string>;
  reason: Record<AuthMailKind, string>;
};

/** A site language without its own mail falls back to the default (German). */
const COPY: Partial<Record<Locale, Copy>> = {
  de: {
    subject: {
      verify: "Bestätigen Sie Ihre E-Mail-Adresse für {site}",
      magicLink: "Ihr Anmeldelink für {site}",
      reset: "{site}: Passwort zurücksetzen",
    },
    lead: {
      verify: "Ihr Konto funktioniert schon. Öffnen Sie diesen Link, um die Adresse zu bestätigen — dann erreicht Sie {site}, wenn Sie einmal Ihr Passwort vergessen:",
      magicLink: "Öffnen Sie diesen Link, um sich bei {site} anzumelden:",
      reset: "Öffnen Sie diesen Link, um ein neues Passwort festzulegen:",
    },
    code: "Auf einem anderen Gerät? Geben Sie dort diesen Code ein: {code}",
    expires: "Der Link gilt 10 Minuten.",
    ignore: "Wenn Sie das nicht angefordert haben, können Sie diese E-Mail ignorieren.",
    heading: { verify: "Bestätigen Sie Ihre Adresse", magicLink: "Ihr Link zum Anmelden", reset: "Neues Passwort festlegen" },
    button: { verify: "Adresse bestätigen", magicLink: "Bei {site} anmelden", reset: "Passwort festlegen" },
    reason: { verify: "Sie haben gerade ein Konto bei {site} erstellt.", magicLink: "Sie haben diesen Link gerade angefordert.", reset: "Sie haben gerade ein neues Passwort angefordert." },
  },
  fr: {
    subject: {
      verify: "Confirmez votre adresse e-mail pour {site}",
      magicLink: "Votre lien de connexion à {site}",
      reset: "{site} : réinitialiser le mot de passe",
    },
    lead: {
      verify: "Votre compte fonctionne déjà. Ouvrez ce lien pour confirmer votre adresse — ainsi {site} peut vous joindre si vous oubliez votre mot de passe :",
      magicLink: "Ouvrez ce lien pour vous connecter à {site} :",
      reset: "Ouvrez ce lien pour choisir un nouveau mot de passe :",
    },
    code: "Sur un autre appareil ? Saisissez-y ce code : {code}",
    expires: "Le lien est valable 10 minutes.",
    ignore: "Si vous n'avez rien demandé, vous pouvez ignorer cet e-mail.",
    heading: { verify: "Confirmez votre adresse", magicLink: "Votre lien de connexion", reset: "Choisissez un nouveau mot de passe" },
    button: { verify: "Confirmer l’adresse", magicLink: "Se connecter à {site}", reset: "Choisir un mot de passe" },
    reason: { verify: "Vous venez de créer un compte {site}.", magicLink: "Vous venez de demander ce lien.", reset: "Vous venez de demander un nouveau mot de passe." },
  },
  it: {
    subject: {
      verify: "Conferma il tuo indirizzo e-mail per {site}",
      magicLink: "Il tuo link di accesso a {site}",
      reset: "{site}: reimposta password",
    },
    lead: {
      verify: "Il tuo account funziona già. Apri questo link per confermare l'indirizzo — così {site} ti raggiunge se dimentichi la password:",
      magicLink: "Apri questo link per accedere a {site}:",
      reset: "Apri questo link per scegliere una nuova password:",
    },
    code: "Su un altro dispositivo? Inserisci lì questo codice: {code}",
    expires: "Il link vale 10 minuti.",
    ignore: "Se non l'hai richiesto tu, puoi ignorare questa e-mail.",
    heading: { verify: "Conferma il tuo indirizzo", magicLink: "Il tuo link di accesso", reset: "Scegli una nuova password" },
    button: { verify: "Conferma l’indirizzo", magicLink: "Accedi a {site}", reset: "Scegli una password" },
    reason: { verify: "Hai appena creato un account {site}.", magicLink: "Hai appena richiesto questo link.", reset: "Hai appena richiesto una nuova password." },
  },
  rm: {
    subject: {
      verify: "Confermai Vossa adressa d'e-mail per {site}",
      magicLink: "Vossa colliaziun d'annunzia per {site}",
      reset: "{site}: Redefinir il pled-clav",
    },
    lead: {
      verify: "Voss conto funcziuna gia. Avri questa colliaziun per confermar l'adressa — uschia As cuntanscha {site}, sche Vus emblidais Voss pled-clav:",
      magicLink: "Avri questa colliaziun per s'annunziar tar {site}:",
      reset: "Avri questa colliaziun per redefinir il pled-clav:",
    },
    code: "Sin in auter apparat? Endatai là quest code: {code}",
    expires: "La colliaziun vala 10 minutas.",
    ignore: "Sche Vus n'avais betg dumandà quai, pudais Vus ignorar quest e-mail.",
    heading: { verify: "Confermai Vossa adressa", magicLink: "Vossa colliaziun per s’annunziar", reset: "Tscherner in nov pled-clav" },
    button: { verify: "Confermar l’adressa", magicLink: "S’annunziar tar {site}", reset: "Tscherner in pled-clav" },
    reason: { verify: "Vus avais gist creà in conto {site}.", magicLink: "Vus avais gist dumandà questa colliaziun.", reset: "Vus avais gist dumandà in nov pled-clav." },
  },
  en: {
    subject: {
      verify: "Confirm your email for {site}",
      magicLink: "Sign in to {site}",
      reset: "Reset your {site} password",
    },
    lead: {
      verify: "Your account already works. Open this link to confirm your address — then {site} can reach you if you ever forget your password:",
      magicLink: "Open this link to sign in to {site}:",
      reset: "Open this link to choose a new password:",
    },
    code: "On another device? Type this code there: {code}",
    expires: "The link works for 10 minutes.",
    ignore: "If you did not request this, you can ignore this email.",
    heading: { verify: "Confirm your address", magicLink: "Your sign-in link", reset: "Choose a new password" },
    button: { verify: "Confirm address", magicLink: "Sign in to {site}", reset: "Choose a password" },
    reason: { verify: "You just created a {site} account.", magicLink: "You just asked for this link.", reset: "You just asked for a new password." },
  },
  ru: {
    subject: {
      verify: "Подтвердите адрес e-mail для {site}",
      magicLink: "Ссылка для входа в {site}",
      reset: "{site}: сброс пароля",
    },
    lead: {
      verify: "Ваш аккаунт уже работает. Откройте эту ссылку, чтобы подтвердить адрес, — тогда {site} сможет связаться с вами, если вы забудете пароль:",
      magicLink: "Откройте эту ссылку, чтобы войти в {site}:",
      reset: "Откройте эту ссылку, чтобы задать новый пароль:",
    },
    code: "На другом устройстве? Введите там этот код: {code}",
    expires: "Ссылка действует 10 минут.",
    ignore: "Если вы этого не запрашивали, просто проигнорируйте письмо.",
    heading: { verify: "Подтвердите адрес", magicLink: "Ваша ссылка для входа", reset: "Задайте новый пароль" },
    button: { verify: "Подтвердить адрес", magicLink: "Войти в {site}", reset: "Задать пароль" },
    reason: { verify: "Вы только что создали аккаунт {site}.", magicLink: "Вы только что запросили эту ссылку.", reset: "Вы только что запросили новый пароль." },
  },
};

/** The locale of the page the link lands on, if it has mail of its own; else the default. */
export function mailLocale(url: string): Locale {
  let callback: string | null = null;
  try {
    callback = new URL(url).searchParams.get("callbackURL");
  } catch {
    // not a URL: fall through to the default
  }
  const locale = callback ? localeIn(callback) : DEFAULT_LOCALE;
  return COPY[locale] ? locale : DEFAULT_LOCALE;
}

function fallback(): Copy {
  const copy = COPY[DEFAULT_LOCALE];
  if (!copy) throw new Error("account mail has no copy in the default locale");
  return copy;
}

/** Heidi's own look: the site's red, the cow mark as a PNG (SVG does not render in Gmail or Outlook). */
export const MAIL_BRAND: MailBrand = {
  name: ASSISTANT_NAME,
  url: SITE_URL,
  accent: "#d8232a",
  onAccent: "#ffffff",
  accentDark: "#ff5a5f",
  logoUrl: `${SITE_URL}/app-icons/icon-192.png`,
};

export function renderAuthMail(kind: AuthMailKind, url: string, extra: AuthMailExtra): RenderedAuthMail {
  const locale = mailLocale(url);
  const copy = COPY[locale] ?? fallback();
  const notes: string[] = [];
  if (kind === "magicLink" && extra.code) notes.push(copy.code.replace("{code}", spacedCode(extra.code)));
  // Only the sign-in link is known to expire in ten minutes; the others keep
  // better-auth's own lifetimes, so the mail does not promise a number for them.
  if (kind === "magicLink") notes.push(copy.expires);
  const lines = [copy.lead[kind], "", url, "", ...notes, ...(notes.length ? [""] : []), copy.ignore];
  const named = (text: string) => text.replaceAll("{site}", ASSISTANT_NAME);

  // The same words, laid out: a heading, one button, the code to type on
  // another device, and a footer that says why this arrived. `lead` ends in a
  // colon because the link follows it in the text version.
  const lead = copy.lead[kind].replace(/\s*:$/, ".");
  const { html } = renderMail(MAIL_BRAND, {
    lang: locale,
    preheader: named(copy.reason[kind]),
    heading: named(copy.heading[kind]),
    blocks: [
      { type: "paragraph", text: named(lead) },
      { type: "button", label: named(copy.button[kind]), url },
      ...(kind === "magicLink" && extra.code
        ? [{ type: "code" as const, label: copy.code.split("{code}")[0]?.trim(), code: spacedCode(extra.code) }]
        : []),
      ...(kind === "magicLink" ? [{ type: "note" as const, text: copy.expires }] : []),
      { type: "note", text: copy.ignore },
    ],
    // Mail the person asked for this minute: there is nothing to unsubscribe from.
    footer: { reason: named(copy.reason[kind]), unsubscribe: null },
  });
  return { subject: named(copy.subject[kind]), text: named(lines.join("\n")), html };
}
