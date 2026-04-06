import { useEffect, useRef, useState } from "react";
import { socket } from "../socket";

const COLORS = [
  "#000000", "#FFFFFF", "#EF4444", "#F97316", "#EAB308",
  "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#14B8A6",
  "#6B7280", "#92400E",
];

const SIZES = [3, 6, 10, 16];

function Canvas({ roomId, isDrawer }) {
  const canvasRef   = useRef(null);
  const isDrawing   = useRef(false);   // ✅ ref instead of state — no stale closure
  const lastPos     = useRef(null);
  const colorRef    = useRef("#000000");
  const sizeRef     = useRef(4);
  const toolRef     = useRef("pen");

  // UI state (only for re-rendering toolbar)
  const [color, setColor] = useState("#000000");
  const [size,  setSize]  = useState(4);
  const [tool,  setTool]  = useState("pen");

  const setColorSync = (c) => { colorRef.current = c; setColor(c); };
  const setSizeSync  = (s) => { sizeRef.current  = s; setSize(s);  };
  const setToolSync  = (t) => { toolRef.current  = t; setTool(t);  };

  // ─── Draw a line on the local canvas ───────────────────────────────
  const drawLine = (x0, y0, x1, y1, col, sz) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.strokeStyle = col;
    ctx.lineWidth   = sz;
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  };

  // ─── Socket listeners ───────────────────────────────────────────────
  useEffect(() => {
    // ✅ drawLine is defined outside useEffect so it never goes stale
    socket.on("draw", ({ x0, y0, x1, y1, color, size }) => {
      drawLine(x0, y0, x1, y1, color, size);
    });

    socket.on("clear_canvas", () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    });

    return () => {
      socket.off("draw");
      socket.off("clear_canvas");
    };
  }, []); // ✅ empty deps — drawLine is stable (plain function, no closure over state)

  // ─── Pointer helpers ────────────────────────────────────────────────
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const scaleX = canvas.width  / rect.width;
    const scaleY = canvas.height / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top)  * scaleY,
    };
  };

  const handleStart = (e) => {
    if (!isDrawer) return;
    e.preventDefault();
    isDrawing.current = true;
    lastPos.current   = getPos(e);
  };

  const handleMove = (e) => {
    if (!isDrawing.current || !isDrawer) return;
    e.preventDefault();

    const pos         = getPos(e);
    const activeColor = toolRef.current === "eraser" ? "#FFFFFF" : colorRef.current;
    const activeSize  = toolRef.current === "eraser" ? sizeRef.current * 4 : sizeRef.current;

    // Draw locally
    drawLine(lastPos.current.x, lastPos.current.y, pos.x, pos.y, activeColor, activeSize);

    // Broadcast to other players
    socket.emit("draw", {
      roomId,
      x0: lastPos.current.x,
      y0: lastPos.current.y,
      x1: pos.x,
      y1: pos.y,
      color: activeColor,
      size:  activeSize,
    });

    lastPos.current = pos;
  };

  const handleEnd = () => {
    isDrawing.current = false;
    lastPos.current   = null;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    socket.emit("clear_canvas", { roomId });
  };

  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full w-full">

      {/* Toolbar — only for drawer */}
      {isDrawer && (
        <div className="flex flex-wrap items-center gap-3 px-3 py-2.5 border-b border-white/20">

          {/* Color palette */}
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setColorSync(c); setToolSync("pen"); }}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-full border-2 transition-all active:scale-90 ${
                  color === c && tool === "pen"
                    ? "border-white scale-110 shadow-lg"
                    : "border-white/30 hover:border-white/70"
                }`}
              />
            ))}
          </div>

          <div className="w-px h-6 bg-white/25 hidden sm:block" />

          {/* Brush sizes */}
          <div className="flex items-center gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => { setSizeSync(s); setToolSync("pen"); }}
                className={`flex items-center justify-center rounded-full transition-all active:scale-90 border-2 ${
                  size === s && tool === "pen"
                    ? "border-white bg-white/30"
                    : "border-white/30 hover:border-white/60 bg-white/10"
                }`}
                style={{ width: 28, height: 28 }}
              >
                <div
                  className="rounded-full bg-white"
                  style={{ width: Math.min(s * 1.6, 20), height: Math.min(s * 1.6, 20) }}
                />
              </button>
            ))}
          </div>

          <div className="w-px h-6 bg-white/25 hidden sm:block" />

          {/* Eraser */}
          <button
            onClick={() => setToolSync(tool === "eraser" ? "pen" : "eraser")}
            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all active:scale-95 border ${
              tool === "eraser"
                ? "bg-white text-indigo-700 border-white"
                : "bg-white/10 text-white border-white/30 hover:bg-white/20"
            }`}
          >
            🧹 Eraser
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            className="ml-auto px-3 py-1.5 rounded-lg text-sm font-bold bg-red-400/20 hover:bg-red-400/40 text-red-200 border border-red-400/40 transition-all active:scale-95"
          >
            🗑️ Clear
          </button>
        </div>
      )}

      {/* Canvas */}
      <div className="relative flex-1 flex items-center justify-center p-2">
        {!isDrawer && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-3 py-1 bg-black/30 backdrop-blur rounded-full text-white/70 text-xs font-semibold pointer-events-none select-none">
            👀 Guessing mode
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={700}
          height={460}
          className={`w-full h-full rounded-xl bg-white shadow-inner ${
            isDrawer
              ? tool === "eraser" ? "cursor-cell" : "cursor-crosshair"
              : "cursor-default"
          }`}
          style={{ touchAction: "none" }}
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onMouseMove={handleMove}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          onTouchMove={handleMove}
        />
      </div>
    </div>
  );
}

export default Canvas;