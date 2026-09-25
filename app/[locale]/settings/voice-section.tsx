"use client";

import type { Dictionary } from "@/lib/i18n";
import { RATE_RANGE } from "@/lib/voice/settings";
import type { CorrectionLevel } from "@/lib/voice/correction";
import { useVoiceSettings } from "../_components/use-voice-settings";
import { useSpeech } from "../_components/use-speech";

const LEVELS: readonly CorrectionLevel[] = ["off", "blocking", "all"];

/**
 * The spoken channel, and how much Heidi says about what you wrote.
 *
 * Both live here rather than in the chat, because both are decisions about how
 * you want to be treated rather than about this message — the same reason the
 * model and the theme ended up on this page instead of behind the control they
 * affect.
 *
 * WHAT THIS DEVICE CAN ACTUALLY SPEAK IS SHOWN, not promised. A settings page
 * that offers "read answers aloud" on a machine with no German voice has told
 * a lie that the learner discovers by pressing a button and hearing an English
 * accent read Züridütsch. The claim comes from the same function the audio
 * will come from, so the page cannot drift from the speaker.
 */
export function VoiceSection({ t }: { t: Dictionary["voice"] }) {
  const { settings, set } = useVoiceSettings();
  const speech = useSpeech(settings.rate);

  return (
    <div>
      <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.settingsBody}</p>

      {/* Before hydration this is the server's answer — unsupported — so the
          honest line is "we do not know yet" rather than "your browser cannot
          do this". Rendering nothing until it is known avoids saying either. */}
      {speech.supported ? (
        <p className="mt-3 max-w-measure font-mono text-caption leading-relaxed text-fg-muted">
          {t.claim[speech.claim]}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-5">
        <label className="flex min-h-11 max-w-measure items-center justify-between gap-4">
          <span className="text-base text-fg-primary">{t.speakAnswers}</span>
          <input
            type="checkbox"
            checked={settings.speak}
            onChange={(e) => set({ speak: e.target.checked })}
            className="h-5 w-5 shrink-0 accent-[var(--color-accent)]"
          />
        </label>

        <label className="flex max-w-measure flex-col gap-2">
          <span className="text-base text-fg-primary">{t.rate}</span>
          <input
            type="range"
            min={RATE_RANGE.min}
            max={RATE_RANGE.max}
            step={0.05}
            value={settings.rate}
            onChange={(e) => set({ rate: Number(e.target.value) })}
            /* `h-11`: a range input's own box is about sixteen pixels tall,
               and every one of those pixels is a place a thumb has to land
               precisely to start a drag. The track still draws at its natural
               height, centred — only the area you can grab it by grows. */
            className="h-11 w-full accent-[var(--color-accent)]"
          />
        </label>
      </div>

      <div className="mt-8 border-t border-border-subtle pt-6">
        <h3 className="font-heading text-lg font-semibold tracking-display text-fg-primary">{t.correctionTitle}</h3>
        <p className="mt-2 max-w-measure text-base leading-relaxed text-fg-secondary">{t.correctionBody}</p>

        <ul className="mt-4 flex flex-col gap-2">
          {LEVELS.map((level) => (
            <li key={level}>
              <label className="flex max-w-measure cursor-pointer items-start gap-3 border border-border-subtle p-3 transition-colors hover:border-border-strong">
                <input
                  type="radio"
                  name="correction"
                  checked={settings.correction === level}
                  onChange={() => set({ correction: level })}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-accent)]"
                />
                <span>
                  <span className="block text-base text-fg-primary">{t.correctionLevels[level]}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-fg-muted">
                    {t.correctionHelp[level]}
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>

        {/* The limit, stated where the setting is, rather than discovered.
            Somebody turning corrections up is exactly the person about to
            assume that the highest setting also judges their accent. */}
        <p className="mt-4 max-w-measure text-sm leading-relaxed text-fg-muted">{t.cannotHear}</p>
      </div>
    </div>
  );
}
