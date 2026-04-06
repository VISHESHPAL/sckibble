import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";

function Chat({ roomId, isDrawer }) {
  const [guess, setGuess] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    socket.on("chat_message", (data) => {
      setMessages((prev) => [...prev, { ...data, type: "chat" }]);
    });

    socket.on("correct_guess", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          playerName: "SYSTEM",
          text: `${data.playerName} guessed it! +${data.points} pts 🎉`,
          type: "correct",
        },
      ]);
    });

    return () => {
      socket.off("chat_message");
      socket.off("correct_guess");
    };
  }, []);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendGuess = () => {
    if (!guess.trim()) return;
    socket.emit("guess", { roomId, text: guess });
    setGuess("");
  };

  return (
    <div className="flex flex-col h-full w-full min-h-[300px]">

      {/* Header */}
      <div className="px-4 py-2.5 border-b border-white/20 flex items-center gap-2">
        <span className="text-lg">💬</span>
        <span className="text-white font-bold text-sm tracking-wide">Chat & Guesses</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1.5 scrollbar-thin">
        {messages.length === 0 && (
          <p className="text-white/30 text-xs text-center mt-6 select-none">
            No messages yet…
          </p>
        )}

        {messages.map((m, i) => {
          if (m.type === "correct") {
            return (
              <div
                key={i}
                className="flex items-center gap-2 bg-emerald-400/20 border border-emerald-400/40 rounded-xl px-3 py-2"
              >
                <span className="text-base">🎉</span>
                <p className="text-emerald-200 text-xs font-bold">{m.text}</p>
              </div>
            );
          }

          const isSystem = m.playerName === "SYSTEM";
          const isMe = m.playerName === localStorage.getItem("name");

          return (
            <div key={i} className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
              {!isSystem && (
                <span className="text-white/40 text-[10px] font-semibold mb-0.5 px-1">
                  {isMe ? "You" : m.playerName}
                </span>
              )}
              <div
                className={`px-3 py-1.5 rounded-2xl text-sm font-medium max-w-[85%] break-words ${
                  isSystem
                    ? "bg-white/10 text-white/60 italic text-xs rounded-lg"
                    : isMe
                    ? "bg-indigo-400/80 text-white rounded-br-sm"
                    : "bg-white/20 text-white rounded-bl-sm"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isDrawer ? (
        <div className="px-3 pb-3 pt-2 border-t border-white/20">
          <div className="flex gap-2">
            <input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendGuess()}
              placeholder="Type your guess…"
              className="flex-1 px-3 py-2 rounded-xl bg-white/90 text-gray-800 placeholder-gray-400 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:bg-white transition"
            />
            <button
              onClick={sendGuess}
              className="px-3 py-2 rounded-xl bg-indigo-400 hover:bg-indigo-300 active:scale-95 text-white font-extrabold text-sm shadow transition-all"
            >
              ➤
            </button>
          </div>
        </div>
      ) : (
        <div className="px-3 pb-3 pt-2 border-t border-white/20">
          <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/10 border border-white/20">
            <span className="text-sm">🎨</span>
            <span className="text-white/50 text-xs font-semibold">You're drawing — no guessing!</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;