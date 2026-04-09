import { AudioWaveform, PhoneCall, RadioTower } from "lucide-react";

const LiveCallPreview = () => (
  <section className="glass-panel p-6 lg:p-7">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
          Future Scope
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold">Live Call Translation</h2>
      </div>
      <div className="icon-button">
        <PhoneCall size={18} />
      </div>
    </div>

    <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
      <div className="rounded-3xl border border-white/40 bg-white/55 p-5 dark:border-slate-700 dark:bg-slate-950/70">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Call view</p>
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-white">
            <p className="text-sm font-semibold">Speaker A</p>
            <p className="mt-2 text-sm text-slate-300">
              “Can we review the release timeline?”
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
            <p className="text-sm font-semibold">Speaker B (translated)</p>
            <p className="mt-2 text-sm text-amber-50">
              “¿Podemos revisar el cronograma de lanzamiento?”
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/55 p-5 dark:border-slate-700 dark:bg-slate-950/70">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Proposed realtime pipeline</p>
        <div className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-3">
            <RadioTower size={16} className="text-amber-500" />
            Capture call audio through WebRTC media streams.
          </div>
          <div className="flex items-center gap-3">
            <AudioWaveform size={16} className="text-amber-500" />
            Detect speech, transcribe speaker lanes, translate in low-latency chunks.
          </div>
          <div className="flex items-center gap-3">
            <PhoneCall size={16} className="text-amber-500" />
            Render subtitles, channel summaries, and optional translated voice playback.
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default LiveCallPreview;
