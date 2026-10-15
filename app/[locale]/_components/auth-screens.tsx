"use client";

import Link from "next/link";
import {
  AccountPanel,
  SignInForm,
  SignUpForm,
  type AuthClasses,
  type AuthLabels,
} from "@bitbaum/accountkit/auth/react";
import type { SignInMethods } from "@bitbaum/accountkit/auth";
import { authClient } from "@/lib/auth/client";

/**
 * The fleet's account screens (@bitbaum/accountkit/auth/react) in Heidi's
 * look. The words come from lib/i18n/auth-labels.ts; the logic is the
 * package's, the same in every product.
 */
const CLASSES: Partial<AuthClasses> = {
  stack: "flex flex-col gap-4",
  field: "flex flex-col gap-1.5",
  label: "text-sm font-medium text-fg-primary",
  hint: "text-sm leading-relaxed text-fg-secondary",
  input:
    "min-h-11 w-full rounded-control border border-border-strong bg-surface-page px-3 text-base text-fg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  button:
    "inline-flex min-h-11 items-center justify-center rounded-control bg-accent px-5 text-sm font-semibold text-on-accent transition-opacity hover:opacity-90 disabled:opacity-50",
  buttonQuiet:
    "inline-flex min-h-11 items-center justify-center rounded-control border border-border-strong px-5 text-sm font-medium text-fg-primary transition-colors hover:bg-surface-sunk disabled:opacity-50",
  notice: "rounded-control border border-border-subtle px-4 py-3 text-sm leading-relaxed text-fg-secondary",
  error: "text-sm text-status-negative",
  divider:
    "flex items-center gap-3 font-mono text-caption uppercase tracking-caps text-fg-muted before:h-px before:flex-1 before:bg-border-subtle after:h-px after:flex-1 after:bg-border-subtle",
  section: "flex flex-col gap-4 border-t border-border-subtle pt-8",
  sectionTitle: "font-heading text-lg font-semibold text-fg-primary",
  link: "break-all text-link underline underline-offset-4",
  check: "flex min-h-11 items-center gap-3 text-sm text-fg-secondary",
};

const textLink = "text-link underline underline-offset-4 hover:text-accent";

export function HeidiSignIn(props: {
  labels: AuthLabels;
  methods: SignInMethods;
  next: string;
  signInPath: string;
  signUpPath: string;
  initialError: boolean;
}) {
  return (
    <SignInForm
      client={authClient}
      classes={CLASSES}
      labels={props.labels}
      methods={props.methods}
      next={props.next}
      signInPath={props.signInPath}
      initialError={props.initialError}
      signUpLink={
        <Link prefetch={false} href={props.signUpPath} className={textLink}>
          {props.labels.createAccount}
        </Link>
      }
    />
  );
}

export function HeidiSignUp(props: {
  labels: AuthLabels;
  methods: SignInMethods;
  next: string;
  signUpPath: string;
  signInPath: string;
}) {
  return (
    <SignUpForm
      client={authClient}
      classes={CLASSES}
      labels={props.labels}
      methods={props.methods}
      next={props.next}
      signUpPath={props.signUpPath}
      signInLink={
        <Link prefetch={false} href={props.signInPath} className={textLink}>
          {props.labels.signIn}
        </Link>
      }
    />
  );
}

export function HeidiAccount(props: {
  labels: AuthLabels;
  methods: SignInMethods;
  user: { name: string; email: string | null; emailVerified: boolean; role: string; twoFactorEnabled: boolean };
  linked: string[];
  accountPath: string;
  homePath: string;
}) {
  return <AccountPanel client={authClient} classes={CLASSES} {...props} />;
}
