import { BookOpenText } from "lucide-react";

const LearningModePanel = ({ learning }) => (
  <section className="glass-panel p-6 lg:p-7">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          Learning Mode
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold">Translate and study</h2>
      </div>
      <div className="icon-button">
        <BookOpenText size={18} />
      </div>
    </div>

    {learning ? (
      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-3xl border border-white/40 bg-white/50 p-5 dark:border-slate-700 dark:bg-slate-950/70">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Original sentence</p>
          <p className="mt-3 text-base leading-7 text-slate-900 dark:text-slate-50">
            {learning.originalSentence}
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.2em] text-slate-400">
            Translated sentence
          </p>
          <p className="mt-3 text-base leading-7 text-slate-900 dark:text-slate-50">
            {learning.translatedSentence}
          </p>
        </div>

        <div className="rounded-3xl border border-white/40 bg-white/50 p-5 dark:border-slate-700 dark:bg-slate-950/70">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Word-by-word hints</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {learning.wordMappings?.length ? (
              learning.wordMappings.map((word) => (
                <div
                  key={`${word.sourceWord}-${word.translatedWord}`}
                  className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm dark:border-amber-500/30 dark:bg-amber-500/10"
                >
                  <p className="font-semibold text-slate-800 dark:text-slate-100">
                    {word.sourceWord}
                  </p>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    {word.translatedWord}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No learning hints are available yet for this sentence.
              </p>
            )}
          </div>
          <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">{learning.note}</p>
        </div>
      </div>
    ) : (
      <div className="mt-6 rounded-3xl border border-dashed border-white/50 bg-white/30 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
        Translate a sentence to unlock the paired original text, translated sentence, and word-level hints.
      </div>
    )}
  </section>
);

export default LearningModePanel;
