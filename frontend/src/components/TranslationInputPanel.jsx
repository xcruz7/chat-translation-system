import { Languages, Mic, MicOff, Sparkles, Trash2 } from "lucide-react";
import LanguageSelect from "./LanguageSelect";

const TranslationInputPanel = ({
  languages,
  sourceLanguage,
  onSourceLanguageChange,
  inputText,
  onInputTextChange,
  onClear,
  onStartListening,
  onStopListening,
  isListening,
  speechSupported,
  interimTranscript,
  voiceLanguageHint
}) => (
  <section className="glass-panel flex h-full flex-col gap-5 p-6 lg:p-7">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          Input
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold">Speak, type, or paste</h2>
      </div>
      <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-200">
        Auto-detect ready
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <LanguageSelect
        id="source-language"
        value={sourceLanguage}
        onChange={onSourceLanguageChange}
        languages={languages}
        allowAuto
      />
      <div className="action-button justify-center">
        <Languages size={16} />
        Source
      </div>
    </div>

    <label htmlFor="translation-input" className="sr-only">
      Translation input
    </label>
    <textarea
      id="translation-input"
      value={inputText}
      onChange={(event) => onInputTextChange(event.target.value)}
      placeholder="Type something meaningful. Lingua Flow will translate while you pause, and speech input can jump straight into translation."
      className="min-h-[280px] w-full resize-none rounded-[28px] border border-white/40 bg-white/70 p-5 text-base leading-7 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-300 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-50 dark:placeholder:text-slate-500"
    />

    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={isListening ? onStopListening : onStartListening}
        disabled={!speechSupported}
        className="action-button bg-gradient-to-r from-amber-500 to-orange-500 text-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-0 dark:bg-gradient-to-r dark:from-amber-500 dark:to-orange-500 dark:text-white"
      >
        {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        {isListening ? "Stop mic" : "Voice input"}
      </button>
      <button type="button" onClick={onClear} className="action-button">
        <Trash2 size={16} />
        Clear
      </button>
      <div className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/50 px-4 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300">
        <Sparkles size={16} />
        {isListening
          ? `Listening with ${voiceLanguageHint}`
          : speechSupported
            ? "Browser speech recognition enabled"
            : "Speech recognition not supported in this browser"}
      </div>
    </div>

    {interimTranscript ? (
      <div className="rounded-2xl border border-dashed border-amber-300/70 bg-amber-50/70 px-4 py-3 text-sm text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-100">
        Live transcript: {interimTranscript}
      </div>
    ) : null}
  </section>
);

export default TranslationInputPanel;
