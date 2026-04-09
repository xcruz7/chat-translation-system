import {
  Copy,
  Download,
  LoaderCircle,
  Play,
  Square,
  Volume2
} from "lucide-react";
import LanguageSelect from "./LanguageSelect";

const TranslationOutputPanel = ({
  languages,
  targetLanguage,
  onTargetLanguageChange,
  translatedText,
  onCopy,
  onDownload,
  onSpeak,
  onStopSpeaking,
  isSpeaking,
  speechSupported,
  isTranslating,
  detectedLanguageLabel,
  providerLabel,
  rtl
}) => (
  <section className="glass-panel flex h-full flex-col gap-5 p-6 lg:p-7">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          Output
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold">Translation result</h2>
      </div>
      <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200">
        Voice playback
      </div>
    </div>

    <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
      <LanguageSelect
        id="target-language"
        value={targetLanguage}
        onChange={onTargetLanguageChange}
        languages={languages}
      />
      <div className="action-button justify-center">
        <Volume2 size={16} />
        Target
      </div>
    </div>

    <div
      dir={rtl ? "rtl" : "ltr"}
      className="min-h-[280px] rounded-[28px] border border-white/40 bg-white/70 p-5 text-base leading-7 text-slate-900 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-50"
    >
      {isTranslating ? (
        <div className="flex h-full min-h-[240px] items-center justify-center gap-3 text-slate-500 dark:text-slate-300">
          <LoaderCircle className="animate-spin" size={20} />
          Translating...
        </div>
      ) : translatedText ? (
        translatedText
      ) : (
        <div className="text-slate-400 dark:text-slate-500">
          Translated text will appear here as you type or speak.
        </div>
      )}
    </div>

    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={onCopy}
        disabled={!translatedText}
        className="action-button disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Copy size={16} />
        Copy
      </button>
      <button
        type="button"
        onClick={onDownload}
        disabled={!translatedText}
        className="action-button disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Download size={16} />
        Download
      </button>
      <button
        type="button"
        onClick={isSpeaking ? onStopSpeaking : onSpeak}
        disabled={!translatedText || !speechSupported}
        className="action-button disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSpeaking ? <Square size={16} /> : <Play size={16} />}
        {isSpeaking ? "Stop audio" : "Play audio"}
      </button>
    </div>

    <div className="grid gap-3 rounded-2xl border border-white/40 bg-white/50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300 sm:grid-cols-2">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Detected</p>
        <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
          {detectedLanguageLabel || "Pending auto-detection"}
        </p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Provider</p>
        <p className="mt-1 font-semibold capitalize text-slate-800 dark:text-slate-100">
          {providerLabel}
        </p>
      </div>
    </div>

    {!speechSupported ? (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Browser text-to-speech is unavailable in this environment.
      </p>
    ) : null}
  </section>
);

export default TranslationOutputPanel;
