"use client";

import { useEffect, useState } from "react";
import type { Dictionary } from "@/lib/i18n";
import { fill } from "@/lib/i18n/fill";
import type { MemberRow } from "@/lib/domain/teams/overview";
import type { Standing } from "@/lib/domain/practice/situation-strength";

type Overview = { focus: string | null; scenes?: string[]; members: MemberRow[] };

/**
 * The organiser's side of a team: pick what the team works on, then see how
 * far the members who chose to share are in each of those situations.
 *
 * Standings only, as `lib/domain/teams/overview.ts` explains — this panel has
 * no way to show which lines or answers, because the server never sends them.
 */
export function TeamPanel({
  groupId,
  t,
  domains,
  scenes,
}: {
  groupId: string;
  t: Dictionary["team"];
  /** `[id, localised title]` for every situation domain. */
  domains: readonly (readonly [string, string])[];
  /** Localised scene titles by id. */
  scenes: Record<string, string>;
}) {
  const [data, setData] = useState<Overview | null>(null);
  const [failed, setFailed] = useState(false);

  const [version, setVersion] = useState(0);

  useEffect(() => {
    let live = true;
    fetch(`/api/groups/${groupId}/team`)
      .then((res) => (res.ok ? (res.json() as Promise<Overview>) : Promise.reject(new Error(String(res.status)))))
      .then((next) => {
        if (!live) return;
        setData(next);
        setFailed(false);
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [groupId, version]);

  const choose = async (focus: string) => {
    await fetch(`/api/groups/${groupId}/team`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ focus: focus || null }),
    });
    setVersion((v) => v + 1);
  };

  const label: Record<Standing, string> = { new: t.new, met: t.met, steady: t.steady, sure: t.sure };

  return (
    <div>
      <p className="max-w-measure text-base leading-relaxed text-fg-secondary">{t.lead}</p>
      <label className="mt-4 inline-flex flex-wrap items-center gap-3 text-sm text-fg-secondary">
        {t.focusLabel}
        <select
          value={data?.focus ?? ""}
          onChange={(e) => void choose(e.target.value)}
          className="min-h-11 rounded-control border border-border-strong bg-surface-page px-2 text-base text-fg-primary"
        >
          <option value="">{t.none}</option>
          {domains.map(([id, title]) => (
            <option key={id} value={id}>
              {title}
            </option>
          ))}
        </select>
      </label>

      {failed && (
        <p role="alert" className="mt-4 text-sm text-fg-secondary">
          {t.failed}
        </p>
      )}

      {data?.focus && data.members.every((m) => m.state !== "shared") && (
        <p className="mt-6 max-w-measure text-sm leading-relaxed text-fg-muted">{t.overviewEmpty}</p>
      )}

      {data?.focus && data.members.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {data.members.map((m) => (
            <li key={m.actorId} className="min-w-0 rounded-control border border-border-subtle p-4">
              <p className="font-medium text-fg-primary">{m.displayName}</p>
              {m.state === "private" && <p className="mt-1 text-sm text-fg-muted">{t.private}</p>}
              {m.state === "no-sync" && <p className="mt-1 text-sm text-fg-muted">{t.noSync}</p>}
              {m.state === "shared" && (
                <>
                  <p className="mt-1 font-mono text-caption uppercase tracking-caps text-fg-muted">
                    {fill(t.ready, { n: String(m.ready), total: String(m.scenes.length) })} ·{" "}
                    {fill(t.certificates, { n: String(m.certificates) })}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {m.scenes.map((s) => (
                      <li
                        key={s.scene}
                        className={`rounded-control border px-2 py-1 text-sm ${
                          s.standing === "sure" ? "border-border-strong text-fg-primary" : "border-border-subtle text-fg-secondary"
                        }`}
                      >
                        {scenes[s.scene] ?? s.scene}: {label[s.standing]}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
