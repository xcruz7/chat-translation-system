const tabs = [
  { id: "translator", label: "Translator" },
  { id: "room", label: "Live Room" }
];

const AppNavigation = ({ activeView, onChange, themeToggle }) => (
  <div className="glass-panel mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">
        Workspace Navigation
      </p>
      <h1 className="mt-2 font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
        Keep both the translator and the live room system.
      </h1>
    </div>

    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex rounded-2xl border border-white/40 bg-white/60 p-1 dark:border-slate-700 dark:bg-slate-950/70">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              activeView === tab.id
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 dark:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {themeToggle}
    </div>
  </div>
);

export default AppNavigation;
