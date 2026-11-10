/**
 * Who is paid, read from config and nowhere else.
 *
 * Learners pay Heidi in Bitcoin on OrangeCat, straight into the wallet behind
 * Heidi's own OrangeCat project. The payee is that project's ID: OrangeCat
 * resolves the wallet, and no wallet address is written in this repository or
 * copied by hand anywhere.
 *
 * The project is the one OrangeCat serves publicly at
 * https://orangecat.ch/projects/<id>. Another deployment, or a different
 * OrangeCat entity, sets the environment instead of editing a component:
 *
 *   ORANGECAT_PAY_ENTITY_ID     the OrangeCat entity that is paid
 *   ORANGECAT_PAY_ENTITY_TYPE   what kind it is; default `project`
 *   ORANGECAT_BASE_URL          default https://orangecat.ch
 */
const HEIDI_ORANGECAT_PROJECT = "01affb7e-b5f6-45d8-a9a4-20bff670d013";

type Env = Record<string, string | undefined>;

export type Payee = {
  entityId: string;
  entityType: string;
  baseUrl: string;
  /** The payee's public page on OrangeCat, where a payment is made. */
  url: string;
};

export function payee(env: Env = process.env): Payee {
  const configured = env.ORANGECAT_PAY_ENTITY_ID?.trim();
  const entityId = configured && /^[0-9a-f-]{36}$/i.test(configured) ? configured : HEIDI_ORANGECAT_PROJECT;
  const entityType = env.ORANGECAT_PAY_ENTITY_TYPE?.trim() || "project";
  const baseUrl = (env.ORANGECAT_BASE_URL?.trim() || "https://orangecat.ch").replace(/\/+$/, "");
  return { entityId, entityType, baseUrl, url: `${baseUrl}/${entityType}s/${entityId}` };
}
