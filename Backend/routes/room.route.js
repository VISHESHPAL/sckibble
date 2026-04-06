import express from "express";
import { createRoom, joinRoom } from "../controller/room.controller.js";

const roomRoute = express.Router();

roomRoute.post("/create", createRoom);
roomRoute.post("/join", joinRoom);

export default roomRoute;
