import { rooms } from "../utils/rooms.js";

export const createRoom = (req, res) => {
  const { isPrivate } = req.body;

  const roomId = Math.random().toString(36).substring(2, 8);

  rooms[roomId] = {
    players: [],
    host: null,
    isPrivate: isPrivate || false,
    gameState: {
      isPlaying: false,
      round: 0,
      maxRounds: 3,
      currentDrawerIndex: 0,
      currentWord: null,
      guessedPlayers: [], // ✅ ADD THIS
      startTime: null, // ✅ ADD THIS
    },
  };

  res.json({ roomId });
};

export const joinRoom = (req, res) => {
  const { roomId } = req.body;

  if (!rooms[roomId]) {
    return res.status(404).json({ message: "Room not found" });
  }

  res.json({ message: "Room exists" });
};
