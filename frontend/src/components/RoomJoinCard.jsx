import { LoaderCircle, LogIn } from "lucide-react";

const RoomJoinCard = ({
  roomId,
  onRoomIdChange,
  onJoinRoom,
  isJoining,
  error
}) => (
  <section className="glass-panel mx-auto max-w-xl p-6 sm:p-8">
    <div className="space-y-3">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-600 dark:text-emerald-300">
        Room Access
      </p>
      <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-slate-50">
        Join a translation room
      </h1>
      <p className="text-base leading-7 text-slate-600 dark:text-slate-300">
        Enter a shared room ID, join over Socket.IO, and start relaying translated speech to everyone in the same room.
      </p>
    </div>

    <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto]">
      <input
        value={roomId}
        onChange={(event) => onRoomIdChange(event.target.value)}
        placeholder="Enter room ID"
        className="w-full rounded-3xl border border-white/40 bg-white/70 px-5 py-4 text-base text-slate-900 outline-none transition focus:border-emerald-300 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-50"
      />
      <button
        type="button"
        onClick={onJoinRoom}
        disabled={isJoining}
        className="inline-flex items-center justify-center gap-2 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isJoining ? <LoaderCircle size={18} className="animate-spin" /> : <LogIn size={18} />}
        {isJoining ? "Joining..." : "Join Room"}
      </button>
    </div>

    {error ? (
      <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/10 dark:text-rose-200">
        {error}
      </div>
    ) : null}
  </section>
);

export default RoomJoinCard;
