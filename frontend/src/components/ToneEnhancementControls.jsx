import { LoaderCircle, Sparkles } from "lucide-react";

const toneOptions = [
  "Professional",
  "Polite",
  "Friendly",
  "Diplomatic",
  "Simple",
  "Confident",
  "Apologetic"
];

const ToneEnhancementControls = ({
  enabled,
  selectedTone,
  onEnabledChange,
  onToneChange,
  onSubmit,
  isSubmitting,
  disabled
}) => (
  <section className="glass-panel flex flex-col gap-4 p-5 lg:flex-row lg:items-end lg:justify-between">
    <div className="grid gap-4 lg:flex-1 lg:grid-cols-[auto_minmax(0,220px)]">
      <label className="flex items-center justify-between gap-4 rounded-3xl border border-white/40 bg-white/55 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/70">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Enable Tone Enhancement
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Use OpenAI to reshape tone before translating.
          </p>
        </div>
        <span
          className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
            enabled ? "bg-amber-500" : "bg-slate-300 dark:bg-slate-700"
          }`}
        >
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => onEnabledChange(event.target.checked)}
            className="peer sr-only"
          />
          <span
            className={`absolute left-1 h-5 w-5 rounded-full bg-white shadow-sm transition ${
              enabled ? "translate-x-5" : ""
            }`}
          />
        </span>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Tone
        </span>
        <select
          value={selectedTone}
          onChange={(event) => onToneChange(event.target.value)}
          disabled={!enabled}
          className="rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-amber-300 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-50"
        >
          {toneOptions.map((tone) => (
            <option key={tone} value={tone}>
              {tone}
            </option>
          ))}
        </select>
      </label>
    </div>

    <div className="flex flex-col items-stretch gap-3 lg:items-end">
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled || isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(245,158,11,0.28)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : <Sparkles size={16} />}
        {enabled ? "Enhance and Translate" : "Translate Now"}
      </button>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Existing live translation stays unchanged. This adds an optional manual pass.
      </p>
    </div>
  </section>
);

export default ToneEnhancementControls;
