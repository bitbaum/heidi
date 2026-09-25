/**
 * A study group: a thread with more than one human in it.
 *
 * "Self-organised" is the product requirement and it is also the security
 * model. Nobody is assigned to a group; someone makes one and hands out a
 * link. That means the link IS the credential, which is why the token is
 * unguessable, separate from the id, and rotatable.
 */

/** Heidi's fixed actor id, re-exported so group code never hardcodes it. */
export { HEIDI_ID } from "../chat/types.ts";

export type StudyGroup = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  /** Only ever sent to someone who may invite. Never to a plain member. */
  inviteToken?: string;
  /** A team's situation domain; null for a study group. See `teams/overview.ts`. */
  focus?: string | null;
};

export type GroupMember = {
  actorId: string;
  displayName: string;
  joinedAt: string;
  leftAt?: string | null;
};

export type GroupMessage = {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
  /** Heidi's structured answer, when Heidi wrote it. */
  answer?: unknown;
};

/**
 * How many people one group holds.
 *
 * Not a licensing limit — a conversational one. threadkit makes the assistant
 * wait to be addressed above two participants, and a thread of thirty people
 * is a channel, which is a different product with different moderation needs.
 * A study group that outgrows this should become two groups.
 */
export const MAX_MEMBERS = 12;

/** Group names are shown to strangers who follow a link. Keep them short. */
export const MAX_NAME_LENGTH = 60;

/** One message. Long enough for a pasted chat, short enough to not be a file. */
export const MAX_BODY_LENGTH = 2000;
