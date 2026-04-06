# 🎨 Skribbl Clone

A real-time multiplayer drawing and guessing game — built with React, Node.js, Express, and Socket.IO.

🔗 **Live Demo:** [vishesh-scribble.onrender.com](https://vishesh-scribble.onrender.com/)

---

## 🕹️ What is this?

Skribbl Clone is a browser-based multiplayer game inspired by skribbl.io. One player draws a word, and everyone else races to guess it in the chat. The faster you guess, the more points you earn. After 3 rounds, the player with the most points wins!

No account needed. No database. Just open the link and play.

---

## ✨ Features

- ⚡ **Quick Play** — click Play Now and instantly join an available room with other players
- 🔒 **Private Rooms** — create your own room and share the Room ID with friends to play together
- 🎨 **Drawing Canvas** — drawer picks from 3 random words and draws using a color palette, brush sizes, and eraser
- 💬 **Live Chat & Guessing** — guessers type their answer in real time; correct guesses are highlighted instantly
- 🏆 **Scoring System** — first to guess correctly gets 20 pts, others get 10 pts
- ⏱️ **50-Second Timer** — each turn has a countdown; timer changes color as time runs out
- 🔄 **3 Rounds** — every player gets a turn to draw each round; game ends after round 3
- 📋 **Copy Room ID** — one-click copy to share your private room with friends
- 📱 **Responsive** — works on both desktop and mobile

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router DOM |
| Styling | Tailwind CSS |
| Real-time | Socket.IO Client |
| Backend | Node.js, Express |
| WebSockets | Socket.IO |
| CORS | cors |
| Deployment | Render |

---

## 🏗️ How It Works

### Architecture

```
Client (React)  ←──── Socket.IO ────→  Server (Node + Express)
                                              │
                                        In-memory rooms
                                        (no database)
```

### Room Lifecycle

1. A room is created in server memory when a player joins or clicks "Create Private Room"
2. Players join the room via socket, their names and scores are stored in memory
3. The game runs entirely through socket events — drawing strokes, guesses, timer ticks, word selection
4. When the game ends, the room data stays in memory until the server cleans it up — **nothing is persisted to disk or a database**

### Game Flow

```
Start Game
    │
    ▼
Pick Drawer → Send 3 word choices → Drawer picks one
    │
    ▼
50s Timer starts → Others guess in chat
    │
    ├── Correct guess → Points awarded → Next turn (after 2s)
    └── Timer hits 0 → Next turn
    │
    ▼
All players drew? → Next Round
    │
    ▼
3 Rounds done? → Game Over → Winner announced
```

### Key Socket Events

| Event | Direction | Description |
|---|---|---|
| `join_room` | Client → Server | Player joins a room |
| `start_game` | Client → Server | Host starts the game |
| `draw` | Client → Server → Room | Broadcast drawing strokes |
| `clear_canvas` | Client → Server → Room | Clear the canvas for all |
| `choose_word` | Client → Server | Drawer selects a word |
| `guess` | Client → Server | Guesser submits a word |
| `timer_update` | Server → Room | Tick countdown every second |
| `game_over` | Server → Room | Announce final scores |

---

## 🚀 Running Locally

### Prerequisites

- Node.js 18+
- npm

### 1. Clone the repo

```bash
git clone https://github.com/your-username/skribbl-clone.git
cd skribbl-clone
```

### 2. Start the backend

```bash
cd server
npm install
node index.js
```

Server runs at `http://localhost:5000`

### 3. Start the frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### 4. Environment variable (optional)

By default the client connects to `http://localhost:5000`. To point to a different server, create a `.env` file in the `client/` folder:

```env
VITE_SERVER_URL=https://your-server.com
```

---

## 📁 Project Structure

```
skribbl-clone/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.jsx   # Drawing board + toolbar
│   │   │   ├── Chat.jsx     # Live chat + guess input
│   │   │   └── Players.jsx  # Leaderboard
│   │   ├── pages/
│   │   │   ├── Home.jsx     # Landing / join screen
│   │   │   └── Room.jsx     # Game room
│   │   └── socket.js        # Socket.IO client setup
│   └── ...
│
└── server/                  # Node.js backend
    ├── index.js             # Express + Socket.IO entry
    ├── utils/
    │   ├── rooms.js         # In-memory room store
    │   └── word.js          # Word list
    └── handlers/
        └── socketHandler.js # All socket event logic
```

---

## 🧠 Design Decisions

**No database** — all game state lives in server memory. Rooms and scores disappear when the game ends or the server restarts. This keeps the stack simple and the app fast — no DB latency, no schema, no auth.

**Socket.IO over raw WebSockets** — automatic reconnection, room namespacing, and fallback to long-polling out of the box.

**Canvas scaling** — the canvas renders at 700×460 internally but scales to fit any screen. Mouse and touch coordinates are scaled accordingly so drawings sync correctly across different screen sizes.

---

## 👤 Author

Made by **Vishesh**

---

## 📄 License

MIT — free to use, fork, and build on.
