import { io } from "socket.io-client";
 
export const BASE_URL = import.meta.env.VITE_SERVER_URL || "https://sckibble-1.onrender.com";
 
export const socket = io(BASE_URL);
