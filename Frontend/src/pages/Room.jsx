import { useEffect, useState } from "react";
import { socket } from "../socket";
import { useParams } from "react-router-dom";

import Canvas from "../components/Canvas";
import Chat from "../components/Chat";
import Players from "../components/Players";

function Room() {
  const { roomId } = useParams();

  const [players, setPlayers] = useState([]);
  const [wordOptions, setWordOptions] = useState([]);
  const [isDrawer, setIsDrawer] = useState(false);
  const [wordLength, setWordLength] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("name");
    if (name) socket.emit("join_room", { roomId, playerName: name });

    socket.on("player_list", setPlayers);

    socket.on("game_started", (data) => {
      setIsDrawer(socket.id === data.drawerId);
      setGameStarted(true);
      setWinner(null);
    });

    socket.on("choose_word", (data) => {
      setWordOptions(data.words);
      setIsDrawer(true);
    });

    socket.on("word_selected", (data) => {
      setWordLength("_ ".repeat(data.wordLength).trim());
      setWordOptions([]);
    });

    socket.on("next_turn", (data) => {
      setIsDrawer(socket.id === data.drawerId);
      setWordLength("");
      setWordOptions([]);
    });

    socket.on("game_over", (data) => {
      const w = data.players.sort((a, b) => b.score - a.score)[0];
      setWinner(w);
      setGameStarted(false);
    });

    socket.on("timer_update", (data) => setTimeLeft(data.timeLeft));

    return () => {
      socket.off("player_list");
      socket.off("game_started");
      socket.off("choose_word");
      socket.off("word_selected");
      socket.off("next_turn");
      socket.off("timer_update");
      socket.off("game_over");
    };
  }, [roomId]);

  const startGame = () => socket.emit("start_game", { roomId });

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Timer color
  const timerColor =
    timeLeft > 20
      ? "text-emerald-400"
      : timeLeft > 10
      ? "text-yellow-400"
      : "text-red-400";

  const timerBg =
    timeLeft > 20
      ? "bg-emerald-400/10 border-emerald-400/30"
      : timeLeft > 10
      ? "bg-yellow-400/10 border-yellow-400/30"
      : "bg-red-400/10 border-red-400/30 animate-pulse";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 flex flex-col items-center px-3 py-4 relative overflow-hidden">

      {/* Background blobs */}
      <div className="absolute top-[-60px] left-[-60px] w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-40px] w-80 h-80 bg-indigo-700/20 rounded-full blur-3xl pointer-events-none" />

      {/* ── Header ── */}
      <div className="w-full max-w-6xl mb-4 bg-white/10 backdrop-blur-xl border border-white/25 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3 shadow-lg mt-14">

        {/* Room ID + copy */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-white/60 text-xs font-semibold uppercase tracking-widest hidden sm:block">Room</span>
          <span className="text-white font-bold text-sm truncate">{roomId}</span>
          <button
            onClick={copyRoomId}
            className="flex-shrink-0 text-xs px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold transition active:scale-95"
          >
            {copied ? "✅ Copied" : "📋 Copy"}
          </button>
        </div>

        {/* Timer */}
        {gameStarted && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-lg transition-all ${timerBg} ${timerColor}`}>
            ⏱️ <span>{timeLeft}s</span>
          </div>
        )}

        {/* Start Game */}
        <button
          onClick={startGame}
          className="flex-shrink-0 px-5 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-emerald-950 font-extrabold text-sm shadow-lg transition-all duration-150"
        >
          {gameStarted ? "🔄 Restart" : "▶ Start Game"}
        </button>
      </div>

      {/* ── Winner Banner ── */}
      {winner && (
        <div className="w-full max-w-6xl mb-4 bg-yellow-300/90 backdrop-blur border border-yellow-400 rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg">
          <span className="text-3xl">🏆</span>
          <div>
            <p className="text-yellow-900 font-extrabold text-lg">{winner.name} wins!</p>
            <p className="text-yellow-800 text-sm font-semibold">Final score: {winner.score} pts</p>
          </div>
        </div>
      )}

      {/* ── Word display ── */}
      {wordLength && !wordOptions.length && (
        <div className="w-full max-w-6xl mb-4 bg-white/10 backdrop-blur border border-white/25 rounded-2xl px-6 py-3 flex items-center justify-center gap-2 shadow">
          <span className="text-white/60 text-sm font-semibold">Word:</span>
          <span className="text-white font-extrabold text-2xl tracking-[0.25em]">{wordLength}</span>
        </div>
      )}

      {/* ── Word Selection Overlay ── */}
      {isDrawer && wordOptions.length > 0 && (
        <div className="w-full max-w-6xl mb-4 bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl px-6 py-5 shadow-lg">
          <p className="text-white font-bold text-center mb-3 text-sm uppercase tracking-widest">Choose a word to draw</p>
          <div className="flex flex-wrap justify-center gap-3">
            {wordOptions.map((w) => (
              <button
                key={w}
                onClick={() => socket.emit("choose_word", { roomId, word: w })}
                className="px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-emerald-950 font-extrabold text-sm shadow-md transition-all duration-150"
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Main Area: Canvas + Chat ── */}
      <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-4 flex-1">

        {/* Canvas */}
        <div className="flex-1 bg-white/10 backdrop-blur-xl border border-white/25 rounded-2xl overflow-hidden shadow-lg min-h-[320px]">
          <Canvas roomId={roomId} isDrawer={isDrawer} />
        </div>

        {/* Chat */}
        <div className="w-full lg:w-72 bg-white/10 backdrop-blur-xl border border-white/25 rounded-2xl overflow-hidden shadow-lg min-h-[200px] lg:min-h-0">
          <Chat roomId={roomId} isDrawer={isDrawer} />
        </div>
      </div>

      {/* ── Players ── */}
      <div className="w-full max-w-6xl mt-4 bg-white/10 backdrop-blur-xl border border-white/25 rounded-2xl px-4 py-3 shadow-lg">
        <Players players={players} />
      </div>
    </div>
  );
}

export default Room;