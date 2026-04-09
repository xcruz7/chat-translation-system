const Shell = ({ children, themeToggle, online, cachedMode, lastUpdated }) => (
  <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
    <header className="glass-panel relative overflow-hidden p-6 lg:p-8">
      <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-amber-400/20 via-transparent to-transparent" />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-600 dark:text-amber-300">
            Translator Workspace
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
            Keep text translation, voice translation, learning mode, and history in one place.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
            This workspace preserves the original translation flow with live typing, speech-to-text, text-to-speech, favorites, history, offline-friendly cache, and learning support.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {themeToggle ? (
            <div className="flex items-center justify-end gap-3">{themeToggle}</div>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/40 bg-white/55 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950/70">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Network
              </p>
              <p className="mt-2 font-semibold text-slate-900 dark:text-slate-50">
                {online ? "Online" : "Offline fallback"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/40 bg-white/55 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950/70">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Cache</p>
              <p className="mt-2 font-semibold text-slate-900 dark:text-slate-50">
                {cachedMode ? "Serving cached result" : "Live provider"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/40 bg-white/55 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-950/70">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Last update</p>
              <p className="mt-2 font-semibold text-slate-900 dark:text-slate-50">
                {lastUpdated || "No translation yet"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main className="mt-6 space-y-6 lg:mt-8">{children}</main>
  </div>
);

export default Shell;
