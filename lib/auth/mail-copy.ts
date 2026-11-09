import type { RenderedAuthMail } from "@bitbaum/accountkit/auth/mail";
import type { AuthMailExtra, AuthMailKind } from "@bitbaum/accountkit/auth/server";
import { spacedCode } from "@bitbaum/accountkit/auth/mail";
import { DEFAULT_LOCALE, type Locale } from "../i18n/locales.ts";
import { ASSISTANT_NAME } from "../config/site.ts";
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
      verify: "Öffnen Sie diesen Link, um die Adresse zu bestätigen und die Anmeldung abzuschliessen:",
      magicLink: "Öffnen Sie diesen Link, um sich bei {site} anzumelden:",
      reset: "Öffnen Sie diesen Link, um ein neues Passwort festzulegen:",
    },
    code: "Auf einem anderen Gerät? Geben Sie dort diesen Code ein: {code}",
    expires: "Der Link gilt 10 Minuten.",
    ignore: "Wenn Sie das nicht angefordert haben, können Sie diese E-Mail ignorieren.",
  },
  fr: {
    subject: {
      verify: "Confirmez votre adresse e-mail pour {site}",
      magicLink: "Votre lien de connexion à {site}",
      reset: "{site} : réinitialiser le mot de passe",
    },
    lead: {
      verify: "Ouvrez ce lien pour confirmer votre adresse et terminer la création du compte :",
      magicLink: "Ouvrez ce lien pour vous connecter à {site} :",
      reset: "Ouvrez ce lien pour choisir un nouveau mot de passe :",
    },
    code: "Sur un autre appareil ? Saisissez-y ce code : {code}",
    expires: "Le lien est valable 10 minutes.",
    ignore: "Si vous n'avez rien demandé, vous pouvez ignorer cet e-mail.",
  },
  it: {
    subject: {
      verify: "Conferma il tuo indirizzo e-mail per {site}",
      magicLink: "Il tuo link di accesso a {site}",
      reset: "{site}: reimposta password",
    },
    lead: {
      verify: "Apri questo link per confermare l'indirizzo e completare la creazione dell'account:",
      magicLink: "Apri questo link per accedere a {site}:",
      reset: "Apri questo link per scegliere una nuova password:",
    },
    code: "Su un altro dispositivo? Inserisci lì questo codice: {code}",
    expires: "Il link vale 10 minuti.",
    ignore: "Se non l'hai richiesto tu, puoi ignorare questa e-mail.",
  },
  rm: {
    subject: {
      verify: "Confermai Vossa adressa d'e-mail per {site}",
      magicLink: "Vossa colliaziun d'annunzia per {site}",
      reset: "{site}: Redefinir il pled-clav",
    },
    lead: {
      verify: "Avri questa colliaziun per confermar l'adressa e terminar il conto:",
      magicLink: "Avri questa colliaziun per s'annunziar tar {site}:",
      reset: "Avri questa colliaziun per redefinir il pled-clav:",
    },
    code: "Sin in auter apparat? Endatai là quest code: {code}",
    expires: "La colliaziun vala 10 minutas.",
    ignore: "Sche Vus n'avais betg dumandà quai, pudais Vus ignorar quest e-mail.",
  },
  en: {
    subject: {
      verify: "Confirm your email for {site}",
      magicLink: "Sign in to {site}",
      reset: "Reset your {site} password",
    },
    lead: {
      verify: "Open this link to confirm your address and finish creating your account:",
      magicLink: "Open this link to sign in to {site}:",
      reset: "Open this link to choose a new password:",
    },
    code: "On another device? Type this code there: {code}",
    expires: "The link works for 10 minutes.",
    ignore: "If you did not request this, you can ignore this email.",
  },
  ru: {
    subject: {
      verify: "Подтвердите адрес e-mail для {site}",
      magicLink: "Ссылка для входа в {site}",
      reset: "{site}: сброс пароля",
    },
    lead: {
      verify: "Откройте эту ссылку, чтобы подтвердить адрес и завершить создание аккаунта:",
      magicLink: "Откройте эту ссылку, чтобы войти в {site}:",
      reset: "Откройте эту ссылку, чтобы задать новый пароль:",
    },
    code: "На другом устройстве? Введите там этот код: {code}",
    expires: "Ссылка действует 10 минут.",
    ignore: "Если вы этого не запрашивали, просто проигнорируйте письмо.",
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

export function renderAuthMail(kind: AuthMailKind, url: string, extra: AuthMailExtra): RenderedAuthMail {
  const copy = COPY[mailLocale(url)] ?? fallback();
  const notes: string[] = [];
  if (kind === "magicLink" && extra.code) notes.push(copy.code.replace("{code}", spacedCode(extra.code)));
  // Only the sign-in link is known to expire in ten minutes; the others keep
  // better-auth's own lifetimes, so the mail does not promise a number for them.
  if (kind === "magicLink") notes.push(copy.expires);
  const lines = [copy.lead[kind], "", url, "", ...notes, ...(notes.length ? [""] : []), copy.ignore];
  const named = (text: string) => text.replaceAll("{site}", ASSISTANT_NAME);
  return { subject: named(copy.subject[kind]), text: named(lines.join("\n")) };
}
