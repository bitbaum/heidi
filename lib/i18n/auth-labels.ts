import { authLabelsFor, type AuthLabels } from "@bitbaum/accountkit/auth";
import type { Locale } from "./locales.ts";

/**
 * The words of the account screens (sign in, create an account, your account)
 * come from @bitbaum/accountkit, the same in every fleet product. Heidi only
 * says what its roles are called: a customer here is a learner.
 *
 * Swiss German falls back to Standard German (the package does that): these
 * are forms, and a form is the one place a learner expects the written
 * standard.
 */
const ROLES: Partial<Record<Locale, AuthLabels["account"]["roles"]>> = {
  de: {
    customer: "Lernende",
    helper: "Helfende",
    professional: "Fachperson",
    staff: "Team",
    admin: "Administration",
  },
  fr: {
    customer: "Apprenant·e",
    helper: "Aide",
    professional: "Professionnel·le",
    staff: "Équipe",
    admin: "Administration",
  },
  it: {
    customer: "Chi impara",
    helper: "Aiuto",
    professional: "Professionista",
    staff: "Team",
    admin: "Amministrazione",
  },
  rm: {
    customer: "Emprendist",
    helper: "Agid",
    professional: "Persuna spezialisada",
    staff: "Team",
    admin: "Administraziun",
  },
  ru: {
    customer: "Учащийся",
    helper: "Помощник",
    professional: "Специалист",
    staff: "Команда",
    admin: "Администратор",
  },
};
ROLES.gsw = ROLES.de;

export function authLabels(locale: Locale): AuthLabels {
  const labels = authLabelsFor(locale);
  const roles = ROLES[locale];
  return roles ? { ...labels, account: { ...labels.account, roles } } : labels;
}
