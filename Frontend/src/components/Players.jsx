function Players({ players }) {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const myName = localStorage.getItem("name");

  const medals = ["🥇", "🥈", "🥉"];

  const rankBg = (index) => {
    if (index === 0) return "bg-yellow-400/20 border-yellow-400/50";
    if (index === 1) return "bg-slate-300/15 border-slate-300/40";
    if (index === 2) return "bg-orange-400/15 border-orange-400/40";
    return "bg-white/10 border-white/20";
  };

  const rankText = (index) => {
    if (index === 0) return "text-yellow-200";
    if (index === 1) return "text-slate-200";
    if (index === 2) return "text-orange-200";
    return "text-white/70";
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">🏅</span>
        <h3 className="text-white font-bold text-sm tracking-wide uppercase">Leaderboard</h3>
        <span className="ml-1 text-white/40 text-xs font-medium">({sortedPlayers.length} players)</span>
      </div>

      {/* Player Cards */}
      <div className="flex flex-wrap gap-2">
        {sortedPlayers.map((p, index) => {
          const isMe = p.name === myName;
          const isLeader = index === 0;

          return (
            <div
              key={p.id}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${rankBg(index)} ${
                isMe ? "ring-2 ring-white/40" : ""
              }`}
            >
              {/* Rank / Medal */}
              <span className="text-base w-5 text-center select-none">
                {medals[index] ?? <span className="text-white/40 text-xs font-bold">#{index + 1}</span>}
              </span>

              {/* Avatar initial */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                  isLeader
                    ? "bg-yellow-400 text-yellow-900"
                    : "bg-white/20 text-white"
                }`}
              >
                {p.name?.[0]?.toUpperCase() ?? "?"}
              </div>

              {/* Name + Score */}
              <div className="flex flex-col leading-tight min-w-0">
                <span
                  className={`text-sm font-bold truncate max-w-[80px] ${rankText(index)} ${
                    isMe ? "underline underline-offset-2 decoration-white/40" : ""
                  }`}
                >
                  {isMe ? "You" : p.name}
                </span>
                <span className="text-white/50 text-[11px] font-semibold">
                  {p.score} pts
                </span>
              </div>
            </div>
          );
        })}

        {sortedPlayers.length === 0 && (
          <p className="text-white/30 text-xs italic">No players yet…</p>
        )}
      </div>
    </div>
  );
}

export default Players;