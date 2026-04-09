import { Clock3, Star, Trash2 } from "lucide-react";

const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

const HistoryPanel = ({ history, onSelect, onToggleFavorite, onClearHistory }) => (
  <section className="glass-panel p-6 lg:p-7">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          History
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold">Recent and starred</h2>
      </div>
      <button type="button" onClick={onClearHistory} className="icon-button" aria-label="Clear history">
        <Trash2 size={18} />
      </button>
    </div>

    <div className="mt-6 space-y-3">
      {history.length ? (
        history.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(entry)}
            className="w-full rounded-3xl border border-white/40 bg-white/55 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-950/70 dark:hover:bg-slate-950"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {entry.sourceText}
                </p>
                <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">
                  {entry.translatedText}
                </p>
              </div>
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  onToggleFavorite(entry.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onToggleFavorite(entry.id);
                  }
                }}
                className={`icon-button h-10 w-10 shrink-0 ${
                  entry.favorite
                    ? "border-amber-300 bg-amber-50 text-amber-600 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200"
                    : ""
                }`}
                aria-label="Toggle favorite"
              >
                <Star size={16} fill={entry.favorite ? "currentColor" : "none"} />
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Clock3 size={12} />
                {formatDate(entry.createdAt)}
              </span>
              <span>
                {entry.detectedLanguageLabel} to {entry.targetLanguageLabel}
              </span>
            </div>
          </button>
        ))
      ) : (
        <div className="rounded-3xl border border-dashed border-white/50 bg-white/30 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
          Your recent translations and favorites will appear here.
        </div>
      )}
    </div>
  </section>
);

export default HistoryPanel;
