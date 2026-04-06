import { useState, useEffect } from "react";
import { socket } from "../socket";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState({
    play: false,
    private: false,
    join: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("joined_room", ({ roomId }) => navigate(`/room/${roomId}`));
    return () => socket.off("joined_room");
  }, []);

  const setLoad = (key, val) => setLoading((p) => ({ ...p, [key]: val }));

  const handlePlay = () => {
    if (!name.trim()) return alert("Please enter your name");
    setLoad("play", true);
    localStorage.setItem("name", name);
    socket.emit("quick_play", { playerName: name });
  };

  const handlePrivate = async () => {
    if (!name.trim()) return alert("Please enter your name");
    setLoad("private", true);
    localStorage.setItem("name", name);
    try {
      const res = await fetch(`${BASE_URL}/api/rooms/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrivate: true }),
      });
      const data = await res.json();
      socket.emit("join_room", { roomId: data.roomId, playerName: name });
      navigate(`/room/${data.roomId}`);
    } catch {
      alert("Failed to create room. Try again.");
      setLoad("private", false);
    }
  };

  const handleJoinById = () => {
    if (!name.trim() || !roomId.trim())
      return alert("Enter your name & room ID");
    setLoad("join", true);
    localStorage.setItem("name", name);
    socket.emit("join_room", { roomId, playerName: name });
    navigate(`/room/${roomId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-indigo-700/20 rounded-full blur-3xl pointer-events-none" />

      {/* Floating emoji decorations */}
      <span className="hidden sm:block absolute top-8 left-8 text-4xl select-none opacity-80 animate-bounce">
        🎨
      </span>
      <span className="hidden sm:block absolute top-16 right-12 text-3xl select-none opacity-70 animate-pulse">
        ✏️
      </span>
      <span className="hidden sm:block absolute bottom-10 left-14 text-3xl select-none opacity-70 animate-bounce">
        🖌️
      </span>
      <span className="hidden sm:block absolute bottom-16 right-10 text-4xl select-none opacity-80 animate-pulse">
        💡
      </span>

      {/* Card */}
      <div className="relative w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 sm:p-10">
        {/* Logo / Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 shadow-inner">
            <span className="text-4xl">🎨</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow">
            Skribbl
          </h1>
          <p className="text-white/70 text-sm mt-1 font-medium tracking-wide">
            Draw. Guess. Win. 🏆
          </p>
        </div>

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-white/80 text-xs font-semibold uppercase tracking-widest mb-1.5 ml-1">
            Your Name
          </label>
          <input
            type="text"
            placeholder="e.g. PicassoJr"
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-800 placeholder-gray-400 font-semibold text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handlePlay()}
          />
        </div>

        {/* Quick Play */}
        <button
          onClick={handlePlay}
          disabled={loading.play}
          className="w-full py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-emerald-950 font-extrabold text-base tracking-wide shadow-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mb-3 flex items-center justify-center gap-2"
        >
          {loading.play ? (
            <span className="w-5 h-5 border-2 border-emerald-900/40 border-t-emerald-900 rounded-full animate-spin" />
          ) : (
            "⚡ Play Now"
          )}
        </button>

        {/* Create Private Room */}
        <button
          onClick={handlePrivate}
          disabled={loading.private}
          className="w-full py-3.5 rounded-xl bg-white/20 hover:bg-white/30 active:scale-95 text-white font-extrabold text-base tracking-wide border border-white/40 shadow transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mb-6 flex items-center justify-center gap-2"
        >
          {loading.private ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "🔒 Create Private Room"
          )}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/25" />
          <span className="text-white/60 text-xs font-semibold tracking-widest uppercase">
            or join a room
          </span>
          <div className="flex-1 h-px bg-white/25" />
        </div>

        {/* Room ID Input */}
        <div className="mb-3">
          <label className="block text-white/80 text-xs font-semibold uppercase tracking-widest mb-1.5 ml-1">
            Room ID
          </label>
          <input
            type="text"
            placeholder="Paste room code…"
            className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-800 placeholder-gray-400 font-semibold text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white transition"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleJoinById()}
          />
        </div>

        {/* Join Room */}
        <button
          onClick={handleJoinById}
          disabled={loading.join}
          className="w-full py-3.5 rounded-xl bg-orange-400 hover:bg-orange-300 active:scale-95 text-orange-950 font-extrabold text-base tracking-wide shadow-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading.join ? (
            <span className="w-5 h-5 border-2 border-orange-900/40 border-t-orange-900 rounded-full animate-spin" />
          ) : (
            "🚀 Join Room"
          )}
        </button>

        {/* Footer */}
        <p className="text-center text-white/40 text-xs mt-8 font-medium">
          Play with friends · No account needed
        </p>
      </div>
    </div>
  );
}
