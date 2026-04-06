import { rooms } from "../utils/rooms.js";
import { words } from "../utils/word.js";

export const socketHandler = (io, socket) => {
  console.log("User connected:", socket.id);

  // ================= JOIN ROOM =================
  socket.on("join_room", ({ roomId, playerName }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.players = room.players.filter((p) => p.id !== socket.id);

    room.players.push({
      id: socket.id,
      name: playerName,
      score: 0,
    });

    if (!room.host) {
      room.host = socket.id;
    }

    socket.join(roomId);

    io.to(roomId).emit("player_list", room.players);
  });

  // ================= START GAME =================
  socket.on("start_game", ({ roomId }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.gameState.isPlaying = true;
    room.gameState.round = 1;
    room.gameState.currentDrawerIndex = 0;

    startRound(roomId);
  });

  // ================= START ROUND =================
  const startRound = (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    const drawer = room.players[room.gameState.currentDrawerIndex];

    if (room.gameState.timer) {
      clearInterval(room.gameState.timer);
    }

    room.gameState.guessedPlayers = [];
    room.gameState.startTime = Date.now();
    room.gameState.timeLeft = 50;

    const wordOptions = words.sort(() => 0.5 - Math.random()).slice(0, 3);

    io.to(drawer.id).emit("choose_word", { words: wordOptions });

    io.to(roomId).emit("game_started", {
      drawerId: drawer.id,
      round: room.gameState.round,
    });

    const interval = setInterval(() => {
      room.gameState.timeLeft--;

      io.to(roomId).emit("timer_update", {
        timeLeft: room.gameState.timeLeft,
      });

      if (room.gameState.timeLeft <= 0) {
        clearInterval(interval);
        nextTurn(roomId);
      }
    }, 1000);

    room.gameState.timer = interval;
  };

  // ================= WORD SELECT =================
  socket.on("choose_word", ({ roomId, word }) => {
    const room = rooms[roomId];
    if (!room) return;

    room.gameState.currentWord = word;

    io.to(roomId).emit("word_selected", { wordLength: word.length });

    console.log("Word selected:", word);
  });

  // ================= GUESS =================
  socket.on("guess", ({ roomId, text }) => {
    const room = rooms[roomId];
    if (!room) return;

    if (!room.gameState.guessedPlayers) {
      room.gameState.guessedPlayers = [];
    }

    const correctWord = room.gameState.currentWord;
    if (!correctWord) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    if (room.gameState.guessedPlayers.includes(socket.id)) return;

    if (text.toLowerCase() === correctWord.toLowerCase()) {
      const points = room.gameState.guessedPlayers.length === 0 ? 20 : 10;

      player.score += points;
      room.gameState.guessedPlayers.push(socket.id);

      io.to(roomId).emit("correct_guess", { playerName: player.name, points });
      io.to(roomId).emit("player_list", room.players);

      setTimeout(() => nextTurn(roomId), 2000);
    } else {
      io.to(roomId).emit("chat_message", { playerName: player.name, text });
    }
  });

  // ================= NEXT TURN =================
  const nextTurn = (roomId) => {
    const room = rooms[roomId];
    if (!room) return;

    if (room.gameState.timer) {
      clearInterval(room.gameState.timer);
    }

    room.gameState.currentDrawerIndex++;

    if (room.gameState.currentDrawerIndex >= room.players.length) {
      room.gameState.currentDrawerIndex = 0;
      room.gameState.round++;
    }

    if (room.gameState.round > room.gameState.maxRounds) {
      io.to(roomId).emit("game_over", { players: room.players });
      return;
    }

    room.gameState.currentWord = null;

    io.to(roomId).emit("clear_canvas");
    io.to(roomId).emit("next_turn", {
      drawerId: room.players[room.gameState.currentDrawerIndex]?.id,
    });

    startRound(roomId);
  };

  socket.on("end_turn", ({ roomId }) => nextTurn(roomId));

  // ================= DRAW — broadcast to room =================
  socket.on("draw", (data) => {
    socket.to(data.roomId).emit("draw", data);
  });

  // ================= CLEAR CANVAS — broadcast to room =========
  // ✅ THIS WAS MISSING — client emits but server never rebroadcast it
  socket.on("clear_canvas", ({ roomId }) => {
    socket.to(roomId).emit("clear_canvas");
  });

  // ================= DISCONNECT =================
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    for (const roomId in rooms) {
      const room = rooms[roomId];

      room.players = room.players.filter((p) => p.id !== socket.id);

      if (room.host === socket.id) {
        room.host = room.players[0]?.id || null;
      }

      io.to(roomId).emit("player_list", room.players);
    }
  });

  // ================= QUICK PLAY =================
  socket.on("quick_play", ({ playerName }) => {
    let foundRoom = null;

    for (const roomId in rooms) {
      const room = rooms[roomId];
      if (!room.isPrivate && room.players.length < 6) {
        foundRoom = roomId;
        break;
      }
    }

    if (!foundRoom) {
      foundRoom = Math.random().toString(36).substring(2, 8);

      rooms[foundRoom] = {
        players: [],
        host: null,
        isPrivate: false,
        gameState: {
          isPlaying: false,
          round: 0,
          maxRounds: 3,
          currentDrawerIndex: 0,
          currentWord: null,
        },
      };
    }

    const room = rooms[foundRoom];

    room.players.push({ id: socket.id, name: playerName, score: 0 });

    if (!room.host) room.host = socket.id;

    socket.join(foundRoom);

    io.to(foundRoom).emit("player_list", room.players);
    socket.emit("joined_room", { roomId: foundRoom });
  });
};