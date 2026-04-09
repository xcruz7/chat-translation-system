import { useEffect, useState } from "react";
import { Clock3, Languages } from "lucide-react";
import HistoryPanel from "./HistoryPanel";
import { api } from "../services/api";
import { useLocalStorage } from "../hooks/useLocalStorage";

const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

const HistoryWorkspace = () => {
  const [history, setHistory] = useLocalStorage("lingua-flow-history", []);
  const [selectedEntry, setSelectedEntry] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const entries = await api.getHistory();
        setHistory(entries);
      } catch {
        return;
      }
    };

    loadHistory();
  }, [setHistory]);

  useEffect(() => {
    setSelectedEntry((currentSelection) => {
      if (!history.length) {
        return null;
      }

      if (!currentSelection) {
        return history[0];
      }

      return history.find((entry) => entry.id === currentSelection.id) ?? history[0];
    });
  }, [history]);

  const handleSelect = (entry) => {
    setSelectedEntry(entry);
  };

  const handleToggleFavorite = async (id) => {
    try {
      const updatedEntry = await api.toggleFavorite(id);
      setHistory((currentHistory) => {
        const nextHistory = currentHistory.map((entry) => (entry.id === id ? updatedEntry : entry));
        setSelectedEntry((currentSelection) =>
          currentSelection?.id === id ? updatedEntry : currentSelection
        );
        return nextHistory;
      });
    } catch {
      setHistory((currentHistory) =>
        currentHistory.map((entry) =>
          entry.id === id ? { ...entry, favorite: !entry.favorite } : entry
        )
      );
    }
  };

  const handleClearHistory = async () => {
    try {
      await api.clearHistory();
    } catch {
      return;
    }

    setHistory([]);
    setSelectedEntry(null);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="glass-panel overflow-hidden p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
              History
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-slate-50">
              Review recent translations and starred phrases
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
              This tab keeps the translation history accessible without changing the existing
              translator or voice room workflows.
            </p>
          </div>

          <div className="rounded-3xl border border-white/40 bg-white/55 px-5 py-4 text-sm dark:border-slate-700 dark:bg-slate-950/70">
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Entries</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-50">
              {history.length}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <HistoryPanel
          history={history}
          onSelect={handleSelect}
          onToggleFavorite={handleToggleFavorite}
          onClearHistory={handleClearHistory}
        />

        <section className="glass-panel p-6 lg:p-7">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
            Selected Entry
          </p>
          {selectedEntry ? (
            <div className="mt-5 space-y-5">
              <div className="rounded-3xl border border-white/40 bg-white/55 p-5 dark:border-slate-700 dark:bg-slate-950/70">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Original</p>
                <p className="mt-3 text-base leading-7 text-slate-900 dark:text-slate-50">
                  {selectedEntry.sourceText}
                </p>
              </div>

              <div className="rounded-3xl border border-white/40 bg-white/55 p-5 dark:border-slate-700 dark:bg-slate-950/70">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Translated</p>
                <p className="mt-3 text-base leading-7 text-slate-900 dark:text-slate-50">
                  {selectedEntry.translatedText}
                </p>
              </div>

              <div className="grid gap-3 rounded-3xl border border-white/40 bg-white/55 p-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300 sm:grid-cols-2">
                <div className="inline-flex items-center gap-2">
                  <Languages size={16} />
                  {selectedEntry.detectedLanguageLabel} to {selectedEntry.targetLanguageLabel}
                </div>
                <div className="inline-flex items-center gap-2">
                  <Clock3 size={16} />
                  {formatDate(selectedEntry.createdAt)}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-3xl border border-dashed border-white/50 bg-white/30 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
              Choose a history item to preview the full translation here.
            </div>
          )}
        </section>
      </section>
    </div>
  );
};

export default HistoryWorkspace;
