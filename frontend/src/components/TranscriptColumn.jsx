import { useEffect, useRef } from "react";

const formatTime = (timestamp) =>
  new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(timestamp));

const TranscriptColumn = ({
  title,
  description,
  entries,
  liveText,
  emptyState,
  tone = "emerald"
}) => {
  const scrollRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth"
    });
  }, [entries, liveText]);

  const toneStyles =
    tone === "indigo"
      ? "border-indigo-200/80 bg-indigo-50/70 dark:border-indigo-400/25 dark:bg-indigo-500/10"
      : "border-emerald-200/80 bg-emerald-50/70 dark:border-emerald-400/25 dark:bg-emerald-500/10";

  return (
    <section className="glass-panel flex min-h-[420px] flex-col p-5 sm:p-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          {title}
        </p>
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
      </div>

      <div
        ref={scrollRef}
        className="mt-5 flex-1 space-y-3 overflow-y-auto rounded-[28px] border border-white/40 bg-white/45 p-4 dark:border-slate-700 dark:bg-slate-950/60"
      >
        {entries.length ? (
          entries.map((entry) => (
            <article
              key={entry.id}
              className={`rounded-3xl border p-4 ${toneStyles}`}
            >
              <p className="text-sm leading-6 text-slate-900 dark:text-slate-50">
                {entry.text}
              </p>
              {entry.helperText ? (
                <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  {entry.helperText}
                </p>
              ) : null}
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {formatTime(entry.timestamp)}
              </p>
            </article>
          ))
        ) : (
          <div className="flex min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-white/50 bg-white/25 px-6 text-center text-sm leading-6 text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
            {emptyState}
          </div>
        )}

        {liveText ? (
          <article className="rounded-3xl border border-dashed border-amber-300 bg-amber-50/80 p-4 dark:border-amber-400/35 dark:bg-amber-500/10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-200">
              Live transcript
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-900 dark:text-slate-50">{liveText}</p>
          </article>
        ) : null}
      </div>
    </section>
  );
};

export default TranscriptColumn;
