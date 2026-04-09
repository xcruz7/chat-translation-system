import { LoaderCircle, Mic, MicOff, PhoneOff } from "lucide-react";
import LanguageSelect from "./LanguageSelect";

const CallControls = ({
  languages,
  targetLanguage,
  onTargetLanguageChange,
  isListening,
  onStartSpeaking,
  onStopSpeaking,
  onEndCall,
  speechSupported,
  canTalk,
  isSending
}) => (
  <section className="glass-panel p-4 sm:p-5">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid gap-3 sm:grid-cols-[minmax(240px,320px)_auto] sm:items-center">
        <LanguageSelect
          id="live-target-language"
          value={targetLanguage}
          onChange={onTargetLanguageChange}
          languages={languages}
        />
        <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-300">
          Translate outgoing speech
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={isListening ? onStopSpeaking : onStartSpeaking}
          disabled={!speechSupported || !canTalk}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          {isListening ? "Stop Speaking" : "Start Speaking"}
        </button>

        <button
          type="button"
          onClick={onEndCall}
          className="inline-flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:-translate-y-0.5 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200"
        >
          <PhoneOff size={18} />
          End Call
        </button>

        <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200">
          {isSending ? (
            <span className="inline-flex items-center gap-2">
              <LoaderCircle size={16} className="animate-spin" />
              Translating and relaying
            </span>
          ) : speechSupported ? (
            "Continuous speech relay ready"
          ) : (
            "Speech recognition unavailable"
          )}
        </div>
      </div>
    </div>
  </section>
);

export default CallControls;
