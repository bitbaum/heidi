"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/domain/chat/types";
import { HEIDI_ID } from "@/lib/domain/chat/types";
import { useSpeech } from "../use-speech";
import { useVoiceSettings } from "../use-voice-settings";

/**
 * Read Heidi's answer out loud as it arrives, when the learner asked for that.
 *
 * SEEDED ON MOUNT, which is the entire subtlety. The obvious version speaks
 * whenever the last message is Heidi's — and then opening a saved conversation
 * reads the last thing she said three days ago at somebody who came back to
 * look something up. The ref starts holding whatever is already on screen, so
 * only a message that ARRIVES is spoken.
 *
 * ONE MESSAGE, NOT A BACKLOG. If several land at once — a reconnect, a page
 * restoring a thread — the newest is spoken and the rest are marked as seen.
 * Reading four answers in a row at somebody is not four times as useful.
 *
 * Only the answer's prose is spoken, never the dialect line under it. Hearing
 * a Standard German voice read Zurich German is a thing to ask for on the line
 * you care about — the speak button beside it, with the caveat attached — and
 * not something to receive automatically for every suggestion Heidi makes.
 */
export function useSpokenAnswers(messages: readonly ChatMessage[]) {
  const speakArrival = useSpeakArrival();

  const lastSeen = useRef<string | null>(null);
  const seeded = useRef(false);

  useEffect(() => {
    const newest = [...messages].reverse().find((m) => m.authorId === HEIDI_ID && m.answer && !m.error);

    if (!seeded.current) {
      seeded.current = true;
      lastSeen.current = newest?.id ?? null;
      return;
    }

    if (!newest || newest.id === lastSeen.current) return;
    lastSeen.current = newest.id;

    speakArrival(newest.answer?.text ?? "");
  }, [messages, speakArrival]);
}

/**
 * Speak one answer that has just ARRIVED — when the learner asked for that.
 *
 * The rule without the bookkeeping, for a surface that knows the moment an
 * answer lands (the full chat's transport resolves with it) and so has no
 * backlog to seed. Stable across renders: it reads the setting through a ref.
 */
export function useSpeakArrival(): (text: string) => void {
  const { settings } = useVoiceSettings();
  const speech = useSpeech(settings.rate);

  const latest = useRef({ speak: speech.speak, on: settings.speak });
  useEffect(() => {
    latest.current = { speak: speech.speak, on: settings.speak };
  }, [speech.speak, settings.speak]);

  return useCallback((text: string) => {
    const trimmed = text.trim();
    if (latest.current.on && trimmed) latest.current.speak(trimmed);
  }, []);
}
