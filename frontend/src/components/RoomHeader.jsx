import { RadioTower, Wifi, WifiOff } from "lucide-react";

const statusStyles = {
  connected:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-200",
  connecting:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-200",
  disconnected:
    "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200"
};

const RoomHeader = ({
  roomId,
  connectionStatus,
  online,
  themeToggle
}) => (
  <header className="glass-panel p-5 sm:p-6">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-300">
          Voice Translation Room
        </p>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50 sm:text-4xl">
          Live room-based voice translation
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <div className="rounded-full border border-white/40 bg-white/60 px-4 py-2 dark:border-slate-700 dark:bg-slate-950/70">
            Room ID: <span className="font-semibold text-slate-900 dark:text-slate-50">{roomId}</span>
          </div>
          <div
            className={`rounded-full border px-4 py-2 font-semibold ${
              statusStyles[connectionStatus] ?? statusStyles.disconnected
            }`}
          >
            {connectionStatus === "connected"
              ? "Connected"
              : connectionStatus === "connecting"
                ? "Connecting"
                : "Disconnected"}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200">
          <div className="inline-flex items-center gap-2">
            {online ? <Wifi size={16} /> : <WifiOff size={16} />}
            {online ? "Network online" : "Network offline"}
          </div>
        </div>
        <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-200">
          <div className="inline-flex items-center gap-2">
            <RadioTower size={16} />
            Same-room relay only
          </div>
        </div>
        {themeToggle}
      </div>
    </div>
  </header>
);

export default RoomHeader;
