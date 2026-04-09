const tabs = [
  { id: "translator", label: "Translator" },
  { id: "room", label: "Voice Room" },
  { id: "history", label: "History" }
];

const Navbar = ({ activeView, onChange, themeToggle }) => (
  <header className="fixed inset-x-0 top-0 z-50 px-4 py-4 sm:px-6 lg:px-8">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 rounded-[28px] border border-white/40 bg-white/70 px-4 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl dark:border-slate-700 dark:bg-slate-950/75">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          Lingua Flow
        </p>
        <h1 className="mt-1 truncate font-display text-xl font-bold text-slate-900 dark:text-slate-50 sm:text-2xl">
          Translation workspace and live voice rooms
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <nav className="inline-flex rounded-2xl border border-white/40 bg-white/80 p-1 dark:border-slate-700 dark:bg-slate-900/80">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                activeView === tab.id
                  ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
        {themeToggle}
      </div>
    </div>
  </header>
);

export default Navbar;
