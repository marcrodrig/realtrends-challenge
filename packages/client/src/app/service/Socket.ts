import { io } from "socket.io-client";

const socket = io("//localhost:5000", {
  withCredentials: true,
});

export default socket;