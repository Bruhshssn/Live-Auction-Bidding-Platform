import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000";

export const createSocketConnection = (token) => {

    return io(SOCKET_URL, {
        auth: {
            token: token
        },
        transports: ["websocket"]
    });

};